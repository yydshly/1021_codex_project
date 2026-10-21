"""Build the original static research page; no third-party runtime required."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent
COMMIT = "4d7235104870ec0224f445fd905c98f22a105426"
UPSTREAM = f"https://github.com/ultrasecurity/Storm-Breaker/blob/{COMMIT}"

def build():
    output = ROOT.parent / "web"
    output.mkdir(exist_ok=True)
    page = (ROOT / "index.html").read_text(encoding="utf-8")
    (output / "index.html").write_text(page.replace("{{UPSTREAM}}", UPSTREAM), encoding="utf-8")
    for name in ("styles.css", "app.js"):
        shutil.copy2(ROOT / name, output / name)
    (output / "assets").mkdir(exist_ok=True)
    for name in ("storm-breaker-overview.png", "storm-breaker-overview.svg"):
        shutil.copy2(ROOT.parent / "assets" / name, output / "assets" / name)
    print(f"Built {output / 'index.html'}")

if __name__ == "__main__":
    build()
