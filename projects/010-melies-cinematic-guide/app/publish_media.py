"""Keep exact research media in a release while Pages serves the static UI."""
from pathlib import Path
import hashlib
import json
import re
import shutil

MANIFEST = Path(__file__).resolve().with_name('publication-media.json')
PUBLIC_PREFIX = 'https://github.com/yydshly/1021_codex_project/releases/download/'


def publish_media(output, manifest_file=MANIFEST, local=False):
    output = Path(output)
    manifest = json.loads(Path(manifest_file).read_text(encoding='utf-8'))
    checked = []
    for item in manifest['files']:
        relative = Path(item['path'])
        path = output / relative
        url = item['url']
        if relative.is_absolute() or '..' in relative.parts or relative.parts[0] != 'generated' or relative.suffix not in ('.mp4', '.png'):
            raise ValueError('Publication media must stay inside generated/.')
        if not path.resolve().is_relative_to(output.resolve()) or path.is_symlink():
            raise ValueError('Publication media escapes the output directory.')
        if not url.startswith(PUBLIC_PREFIX) or re.search(r'[\s<>"\x27\\]', url):
            raise ValueError('Publication media must use the repository release URL.')
        if hashlib.sha256(path.read_bytes()).hexdigest() != item['sha256'] or path.stat().st_size != item['bytes']:
            raise ValueError('Publication media differs from the recorded original: ' + item['path'])
        checked.append((item, path))
    if len({i['path'] for i, _ in checked}) != len(checked):
        raise ValueError('Duplicate publication media.')
    if not local:
        for text_file in output.rglob('*'):
            if not text_file.is_file() or text_file.suffix not in ('.json', '.js', '.html', '.md', '.css'):
                continue
            text = original = text_file.read_text(encoding='utf-8')
            for item, _ in checked:
                for before, after in ((f'"{item["path"]}"', f'"{item["url"]}"'), (f"'{item['path']}'", f"'{item['url']}'"), (f'({item["path"]})', f'({item["url"]})')):
                    text = text.replace(before, after)
            if text != original:
                text_file.write_text(text, encoding='utf-8')
        for _, path in checked:
            path.unlink()
    shutil.copy2(manifest_file, output / 'publication-media.json')
    print(f'Publication media: {len(checked)} exact originals, mode={"local" if local else "GitHub Releases"}.')
