"""Export the original static research page; no third-party dependencies."""

from pathlib import Path
import hashlib
import re
import shutil

HERE = Path(__file__).resolve().parent
OUTPUT = HERE.parent / "web"
COMMIT = "589868119ce9a0a860aaf4936b5f9bac14e72681"
UPSTREAM = f"https://github.com/zarazhangrui/lark-coding-agent-bridge/blob/{COMMIT}/"


def main():
    OUTPUT.mkdir(exist_ok=True)
    content = (HERE / "index.html").read_text(encoding="utf-8")
    # Resolve evidence links at build time so they work without JavaScript.
    content = re.sub(
        r'<a data-source="([^"]+)">',
        lambda match: (
            f'<a href="{UPSTREAM}{match[1]}" target="_blank" rel="noopener noreferrer">'
        ),
        content,
    )
    for filename in ("styles.css", "app.js"):
        digest = hashlib.sha256((HERE / filename).read_bytes()).hexdigest()[:12]
        content = content.replace(f'"./{filename}"', f'"./{filename}?v={digest}"')
    (OUTPUT / "index.html").write_text(content, encoding="utf-8")
    for filename in ("styles.css", "app.js"):
        shutil.copy2(HERE / filename, OUTPUT / filename)
    (OUTPUT / "assets").mkdir(exist_ok=True)
    for filename in ("understanding-map.png", "understanding-map.svg"):
        shutil.copy2(HERE.parent / "assets" / filename, OUTPUT / "assets" / filename)
    print(f"Exported research page to {OUTPUT}")


if __name__ == "__main__":
    main()
