"""Collect the complete public Melies index and each page's primary media/prompt.

Usage: python collect_sources.py --output <temporary-json-path>
Requires beautifulsoup4. Output is an editorial review cache containing English
source text; keep it outside web/. Does not download videos or images.
An interrupted run can resume using --cache-dir.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date
import json
from pathlib import Path
import time
from urllib.parse import urljoin
from urllib.request import Request, urlopen

from bs4 import BeautifulSoup

BASE = 'https://melies.co/cinematic-techniques'


def page(url):
    for attempt in range(3):
        try:
            req = Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html'})
            with urlopen(req, timeout=35) as response:
                return BeautifulSoup(response.read(), 'html.parser')
        except Exception:
            if attempt == 2:
                raise
            time.sleep(attempt + 1)


def collect(output, cache_dir, workers=6):
    home = page(BASE)
    entries = []
    for tile in home.select('a.cinematic-tile'):
        url = urljoin(BASE, tile['href'])
        heading = tile.find_parent('section').find('h2')
        entries.append(dict(name=tile.get_text(' ', strip=True),
                            path=url.removeprefix(BASE + '/'), url=url,
                            group=heading.get_text(' ', strip=True)))
    if len(entries) != len({row['path'] for row in entries}):
        raise ValueError('Duplicate paths in the source index')
    cache_dir.mkdir(parents=True, exist_ok=True)
    index = {row['path']: i for i, row in enumerate(entries)}
    print(f'Index: {len(entries)} techniques in {len({r["group"] for r in entries})} categories', flush=True)

    def read(entry):
        cached = cache_dir / (entry['path'].replace('/', '--') + '.json')
        if cached.exists():
            return json.loads(cached.read_text(encoding='utf-8'))
        soup = page(entry['url'])
        media = soup.select_one('.cinematic-shot__media')
        prompt_section = soup.select_one('#prompt')
        prompt = prompt_section.select_one('pre.cinematic-prompt__body') if prompt_section else None
        if media is None or prompt is None or not media.get('src'):
            raise ValueError(f'Missing primary media/copyable prompt: {entry["path"]}')
        video = media['src'] if media.name == 'video' else ''
        image = soup.select_one('img.cinematic-shot__still')
        primary = dict(entry,
            mediaType='video' if video else 'image', video=video,
            image=image['src'] if image else '',
            prompt=prompt.get_text(' ', strip=True),
            guidance=' '.join(p.get_text(' ', strip=True) for p in prompt_section.find_all('p', recursive=False)),
            checked=date.today().isoformat())
        # Use the main still, or the index thumbnail for the video's poster.
        tile = next(t for t in home.select('a.cinematic-tile') if urljoin(BASE, t['href']) == entry['url'])
        thumbnail = tile.find('img')
        primary['poster'] = primary['image'] or (thumbnail.get('src', '') if thumbnail else '')
        if not primary['poster']:
            raise ValueError(f'Missing primary image or video poster: {entry["path"]}')
        cached.write_text(json.dumps(primary, ensure_ascii=False, indent=2), encoding='utf-8')
        return primary

    rows, failures = [], []
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(read, row): row for row in entries}
        for future in as_completed(futures):
            try:
                rows.append(future.result())
                if len(rows) % 25 == 0:
                    print(f'Collected {len(rows)}/{len(entries)}', flush=True)
            except Exception as error:
                failures.append(dict(path=futures[future]['path'], error=str(error)))
                print(f'ERROR {failures[-1]}', flush=True)
    rows.sort(key=lambda row: index[row['path']])
    output.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
    if failures:
        raise RuntimeError(f'{len(failures)} pages failed; {len(rows)} saved, rerun to resume')
    print(f'Saved {len(rows)} complete media/prompt records to {output}', flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--cache-dir', type=Path, required=True)
    parser.add_argument('--workers', type=int, default=6)
    args = parser.parse_args()
    collect(args.output, args.cache_dir, args.workers)
