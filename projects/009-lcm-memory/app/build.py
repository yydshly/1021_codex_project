"""Build the dependency-free research page; only known outputs are overwritten."""
from pathlib import Path
import shutil

PROJECT = Path(__file__).resolve().parents[1]
SOURCE = "https://github.com/lossless-claude/lcm/blob/0c17dbffda452cf7fae46929af427dff355aeaa3/"

def main():
    output = PROJECT / "web"
    output.mkdir(exist_ok=True)
    for name in ("index.html", "style.css", "main.js", "overview.html", "overview.js"):
        content = (PROJECT / "app" / "src" / name).read_text(encoding="utf-8")
        (output / name).write_text(content.replace("SOURCE/", SOURCE), encoding="utf-8")
    media = output / "media"
    media.mkdir(exist_ok=True)
    for name in ("lcm-external-memory.svg", "lcm-external-memory.png"):
        asset = PROJECT / "assets" / name
        if not asset.is_file():
            raise FileNotFoundError(f"Missing diagram: {asset}; run app/create_overview.py first")
        shutil.copy2(asset, media / name)
    print(f"Built: {output / 'index.html'}")

if __name__ == "__main__":
    main()
