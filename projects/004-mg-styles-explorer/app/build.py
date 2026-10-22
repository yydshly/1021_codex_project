"""静态构建；输出可直接打开的 HTML/CSS/JS 与本地素材，不需要前端运行时。"""
import json
import re
import shutil
import urllib.request
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parent
OUT = PROJECT / "web"
OUT.mkdir(exist_ok=True)
(OUT / "media").mkdir(exist_ok=True)
(OUT / "fonts").mkdir(exist_ok=True)
ORDER = ["05-cel-boil","03-isometric","01-flat-vector","02-line-art",
         "04-3d-render","08-morph","19-paperclip","22-hud","06-collage",
         "12-aurora-glass","09-bauhaus","10-synthwave","20-pixel","07-liquid","18-hanazi"]
data = json.loads((ROOT / "styles.json").read_text(encoding="utf-8"))
assert len(data) == 15 and {s["slug"] for s in data} == set(ORDER)
data.sort(key=lambda item: ORDER.index(item["slug"]))
prompts = {}
for i, style in enumerate(data):
    style["id"] = f"{i + 1:02}"
    prompt = ROOT / "prompts" / f"{style['slug']}.md"
    assert prompt.is_file(), f"Missing prompt; run fetch_media.py: {prompt}"
    assert (OUT / "media" / f"{style['slug']}.mp4").is_file(), "Run fetch_media.py first"
    if prompt.exists():
        text = prompt.read_text(encoding="utf-8")
        match = re.search(r"```text\s*\n(.*?)\n```", text, flags=re.S)
        prompts[style["slug"]] = match.group(1) if match else text
    poster = PROJECT / "assets/posters" / f"{style['slug']}.jpg"
    assert poster.is_file(), f"Missing poster: {poster}"
    if poster.exists():
        shutil.copy2(poster, OUT / "media" / poster.name)
for name in ("index.html", "styles.css", "app.js"):
    shutil.copy2(ROOT / name, OUT / name)
(OUT / "data.js").write_text(
    "window.STYLES = " + json.dumps(data, ensure_ascii=False) + ";\nwindow.PROMPTS = " +
    json.dumps(prompts, ensure_ascii=False) + ";\n", encoding="utf-8")
shutil.copy2(PROJECT / "UPSTREAM-LICENSE.txt", OUT / "UPSTREAM-LICENSE.txt")

# The full source font is cached locally, only the renamed OFL subset is published.
cache = ROOT / ".cache"
cache.mkdir(exist_ok=True)
font_path = cache / "NotoSansSC.ttf"
if not font_path.exists():
    urllib.request.urlretrieve(
        "https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf",
        font_path)
license_path = cache / "OFL.txt"
if not license_path.exists():
    urllib.request.urlretrieve("https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/OFL.txt", license_path)
shutil.copy2(license_path, OUT / "fonts/OFL.txt")
font_text = "".join((ROOT / p).read_text(encoding="utf-8") for p in ("index.html", "app.js", "styles.json"))
options = subset.Options()
options.name_IDs = ["*"]
options.name_legacy = True
options.name_languages = ["*"]
font = TTFont(font_path)
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=font_text + "0123456789显示个案例复制播放帧进度" + "".join(chr(i) for i in range(32,127)))
subsetter.subset(font)
for record in font["name"].names:
    if record.nameID in (1, 3, 4, 6, 16):
        record.string = "Atlas".encode(record.getEncoding())
font.save(OUT / "fonts/Atlas.ttf")
print(f"Built {OUT}; {len(data)} styles; {len(prompts)} prompts; {len(list((OUT/'media').glob('*.mp4')))} videos")
