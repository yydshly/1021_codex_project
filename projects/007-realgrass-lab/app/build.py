"""Build the dependency-free study into the versioned web directory."""
from pathlib import Path
import hashlib
import re
import shutil

HERE = Path(__file__).resolve().parent
OUTPUT = HERE.parent / "web"
COMMIT = "f68b918796bbe3409d399e9640ca1f63164d7d26"
FILES = ("styles.css", "app.js", "model.js", "renderer.js")
ASSETS = ("grass-effect-comparison.png",)


def main():
    OUTPUT.mkdir(exist_ok=True)
    content = (HERE / "index.html").read_text(encoding="utf-8")
    content = re.sub(
        r'<a([^>]*?)\sdata-source="([^"]+)">',
        lambda match: (
            f'<a{match[1]} href="https://github.com/SamG-Coder/RealGrass/blob/{COMMIT}/{match[2]}" '
            'target="_blank" rel="noopener noreferrer">'
        ),
        content,
    )
    for filename in FILES:
        shutil.copy2(HERE / filename, OUTPUT / filename)
    (OUTPUT / "assets").mkdir(exist_ok=True)
    for filename in ASSETS:
        shutil.copy2(HERE.parent / "assets" / filename, OUTPUT / "assets" / filename)
    # Pin all module imports as well as entry assets to avoid mixed cached versions.
    version = hashlib.sha256(
        b"".join((HERE / name).read_bytes() for name in FILES)
        + b"".join((HERE.parent / "assets" / name).read_bytes() for name in ASSETS)
    ).hexdigest()[:12]
    for name in ("app.js", "renderer.js"):
        text = (OUTPUT / name).read_text(encoding="utf-8")
        for dependency in ("model.js", "renderer.js"):
            text = text.replace(f"'./{dependency}'", f"'./{dependency}?v={version}'")
        (OUTPUT / name).write_text(text, encoding="utf-8")
    for name in ("app.js", "styles.css"):
        content = content.replace(f'"./{name}"', f'"./{name}?v={version}"')
    for name in ASSETS:
        content = content.replace(f'"./assets/{name}"', f'"./assets/{name}?v={version}"')
    (OUTPUT / "index.html").write_text(content, encoding="utf-8")
    print(f"Built {OUTPUT} (asset version {version})")


if __name__ == "__main__":
    main()
