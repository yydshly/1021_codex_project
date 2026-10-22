"""Validate full source-index coverage before shipping the static catalogue."""
import json
import hashlib
from pathlib import Path
import re
from urllib.parse import urlsplit

APP = Path(__file__).resolve().parent


def validate():
    source = json.loads((APP / 'source-index.json').read_text(encoding='utf-8'))
    data_text = (APP / 'data.js').read_text(encoding='utf-8')
    rows = json.loads(data_text.split('window.SHOTS = ', 1)[1].rstrip(';\n'))
    assert len(source) == len(rows) == 424, 'Expected all 424 source entries'
    paths = [row['path'] for row in rows]
    assert len(set(paths)) == 424, 'Duplicate source paths'
    assert paths == [row['path'] for row in source], 'Source paths missing or out of index order'
    assert len({row['group'] for row in source}) == len({row['group'] for row in rows}) == 13
    for original, row in zip(source, rows):
        assert row['en'] == original['name'], f'Wrong source name: {row["path"]}'
        assert row['mediaType'] == original['mediaType'], f'Wrong media type: {row["path"]}'
        for key in ('name', 'short', 'prompt', 'tip'):
            assert isinstance(row[key], str) and re.search(r'[\u3400-\u9fff]', row[key]), (row['path'], key)
            assert '\ufffd' not in row[key], f'Invalid replacement character: {row["path"]}'
        assert '[Subject]' not in row['prompt'], f'Untranslated subject placeholder: {row["path"]}'
        original_prompt = row.get('promptEn', '')
        assert isinstance(original_prompt, str) and re.search(r'[A-Za-z]', original_prompt), f'Missing English prompt: {row["path"]}'
        assert '\ufffd' not in original_prompt, f'Invalid English encoding: {row["path"]}'
        assert hashlib.sha256(original_prompt.encode('utf-8')).hexdigest() == original['promptEnSha256'], f'English prompt differs from source snapshot: {row["path"]}'
        # A translated pronoun may repeat the subject placeholder naturally.
        assert ('[Subject]' in original_prompt) == ('【主体】' in row['prompt']), f'Subject placeholder mismatch: {row["path"]}'
        media = row['video'] if row['mediaType'] == 'video' else row['image']
        for url in (media, row['poster']):
            parsed = urlsplit(url)
            assert parsed.scheme == 'https' and parsed.netloc == 'asset.melies.co', (row['path'], url)
    videos = sum(row['mediaType'] == 'video' for row in rows)
    assert videos == 250 and len(rows) - videos == 174, 'Source media totals changed'
    print(f'Validated {len(rows)} bilingual techniques: {videos} videos, {len(rows)-videos} images, 13 categories; English source hashes match')


if __name__ == '__main__':
    validate()
