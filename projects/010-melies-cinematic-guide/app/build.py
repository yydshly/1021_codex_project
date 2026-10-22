"""Validate the catalogue, export model references, and build the static app."""
from pathlib import Path
import hashlib
import json
import shutil
from validate_data import validate
from export_knowledge import export_knowledge
from export_studio import export_studio
from export_direction_keyframes import export_direction_keyframes
from export_tea_plan import export_tea_plan
from export_pipeline import export_pipeline
from export_bike_plan import export_bike_plan
from export_archive import export_archive
from publish_media import publish_media
import argparse

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--local-media', action='store_true', help='Keep the exact generated media in web/ for local viewing.')
args = parser.parse_args()

APP = Path(__file__).resolve().parent
OUTPUT = APP.parent / "web"
validate()
OUTPUT.mkdir(exist_ok=True)
export_knowledge(OUTPUT)
export_studio(OUTPUT)
for name in ("index.html", "styles.css", "archive.css", "data.js", "main.js", "creative-case.js", "model-guide.md", "workflow-engine.js", "studio.js", "direction.css", "direction-engine.js", "direction.js", "direction-example.json"):
    shutil.copy2(APP / name, OUTPUT / name)
direction = json.loads((APP / 'direction-example.json').read_text(encoding='utf-8'))
known_ids = {r['id'] for r in json.loads((OUTPUT / 'capabilities.json').read_text(encoding='utf-8'))['techniques']}
if direction['schemaVersion'] != 2 or direction['provenance']['mediaStatus'] != 'design_only' or any(r['id'] not in known_ids for s in direction['shots'] for r in s['references']):
    raise ValueError('Emotion/action example must remain a design with real catalogue references.')
(OUTPUT / 'direction-example.js').write_text('window.DIRECTION_EXAMPLE = ' + json.dumps(direction, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
export_direction_keyframes(direction, OUTPUT)
export_tea_plan(OUTPUT, direction)
export_pipeline(OUTPUT)
export_bike_plan(OUTPUT)
html = (OUTPUT / "index.html").read_text(encoding="utf-8")
html = html.replace('<!-- DIRECTION_PANEL -->', (APP / 'direction-panel.html').read_text(encoding='utf-8'))
html = html.replace('<!-- ARCHIVE_PANEL -->', export_archive(OUTPUT))
(OUTPUT / "index.html").write_text(html, encoding="utf-8")
published_media = APP.parent / "assets/generated/rain-to-forest/published"
if published_media.is_dir():
    shutil.copytree(published_media, OUTPUT / "generated/rain-to-forest", dirs_exist_ok=True)
reference_image = APP.parent / "assets/generated/rain-to-forest/reference/product-reference.png"
if reference_image.is_file():
    shutil.copy2(reference_image, OUTPUT / "generated/rain-to-forest/product-reference.png")
book_media = APP.parent / 'assets/generated/book-repair/published'
if book_media.is_dir():
    shutil.copytree(book_media, OUTPUT / 'generated/book-repair', dirs_exist_ok=True)
    book_reference = APP.parent / 'assets/generated/book-repair/reference/book-reference.png'
    if book_reference.is_file():
        shutil.copy2(book_reference, OUTPUT / 'generated/book-repair/book-reference.png')
revision_media = APP.parent / 'assets/generated/book-repair-r2/published'
if revision_media.is_dir():
    shutil.copytree(revision_media, OUTPUT / 'generated/book-repair-r2', dirs_exist_ok=True)
tea_media = APP.parent / 'assets/generated/tea-moment/published'
if tea_media.is_dir():
    shutil.copytree(tea_media, OUTPUT / 'generated/tea-moment', dirs_exist_ok=True)
bike_media = APP.parent / 'assets/generated/bike-kindness/published'
if bike_media.is_dir():
    shutil.copytree(bike_media, OUTPUT / 'generated/bike-kindness', dirs_exist_ok=True)
publish_media(OUTPUT, local=args.local_media)
html = (OUTPUT / "index.html").read_text(encoding="utf-8")
for asset in ("styles.css", "archive.css", "data.js", "creative-case.js", "case-library.js", "main.js", "studio-data.js", "workflow-engine.js", "studio.js", "direction.css", "direction-engine.js", "direction.js", "direction-example.js", "pipeline-example.js", "pipeline-production.js", "direction-keyframes.js", "direction-production.js"):
    digest = hashlib.sha256((OUTPUT / asset).read_bytes()).hexdigest()[:12]
    html = html.replace(f'"{asset}"', f'"{asset}?v={digest}"')
(OUTPUT / "index.html").write_text(html, encoding="utf-8")
print(f"Built {OUTPUT}")
