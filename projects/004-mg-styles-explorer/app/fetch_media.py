"""固定版本素材：下载原片至忽略目录，输出网页用 720p H.264 副本。"""
import concurrent.futures
import hashlib
import json
import subprocess
import urllib.request
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
COMMIT = "49052d80bfaf9fa8412cc9710530e5e95a3b8d8c"
BASE = f"https://raw.githubusercontent.com/Vincentwei1021/mg-styles-15/{COMMIT}"
SLUGS = [
    "05-cel-boil", "03-isometric", "01-flat-vector", "02-line-art",
    "04-3d-render", "08-morph", "19-paperclip", "22-hud", "06-collage",
    "12-aurora-glass", "09-bauhaus", "10-synthwave", "20-pixel",
    "07-liquid", "18-hanazi",
]
CACHE = ROOT / ".cache"
ASSETS = ROOT.parent / "assets"
MEDIA = ROOT.parent / "web/media"
for folder in (CACHE, ASSETS / "posters", MEDIA, ROOT / "prompts"):
    folder.mkdir(parents=True, exist_ok=True)

tree_path = CACHE / "tree.json"
if not tree_path.exists():
    request = urllib.request.Request(
        f"https://api.github.com/repos/Vincentwei1021/mg-styles-15/git/trees/{COMMIT}?recursive=1",
        headers={"User-Agent": "Motion-Atlas-research"},
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        tree_data = json.load(response)
    assert tree_data["sha"] == COMMIT and not tree_data.get("truncated")
    tree_path.write_text(json.dumps(tree_data), encoding="utf-8")


def fetch(url, dest):
    if not dest.exists() or dest.stat().st_size == 0:
        temporary = dest.with_suffix(dest.suffix + ".part")
        if dest.suffix == ".mp4":
            # Small byte-range requests avoid losing large transfers to connection resets.
            path = url.removeprefix(BASE + "/")
            tree = json.loads((CACHE / "tree.json").read_text(encoding="utf-8"))
            entry = next(item for item in tree["tree"] if item["path"] == path)
            expected = entry["size"]
            offset = temporary.stat().st_size if temporary.exists() else 0
            if offset > expected:
                raise RuntimeError(f"Unexpected partial file size: {temporary}")
            while offset < expected:
                end = min(offset + 2 * 1024 * 1024 - 1, expected - 1)
                for attempt in range(6):
                    try:
                        request = urllib.request.Request(url, headers={"Range": f"bytes={offset}-{end}"})
                        with urllib.request.urlopen(request, timeout=40) as response:
                            content_range = response.headers.get("Content-Range", "")
                            if response.status != 206 or not content_range.startswith(f"bytes {offset}-"):
                                raise RuntimeError(f"Server ignored range: {content_range}")
                            chunk = response.read()
                        if len(chunk) != end - offset + 1:
                            raise RuntimeError("Incomplete range")
                        with temporary.open("ab") as stream:
                            stream.write(chunk)
                        offset += len(chunk)
                        break
                    except Exception:
                        if attempt == 5:
                            raise
                        time.sleep(1 + attempt)
                print(f"FETCH {dest.name}: {offset * 100 // expected}%", flush=True)
            content = temporary.read_bytes()
            actual = hashlib.sha1(f"blob {len(content)}\0".encode() + content).hexdigest()
            if actual != entry["sha"]:
                raise RuntimeError(f"Hash mismatch: {dest.name}")
            temporary.replace(dest)
            return
        paths = [url]
        for attempt in range(4):
            for candidate in paths:
                result = subprocess.run([
                    "curl.exe", "--fail", "--location", "--silent", "--show-error",
                    "--connect-timeout", "15", "--max-time", "100",
                    "--output", str(temporary), candidate,
                ])
                if result.returncode == 0:
                    for retry in range(6):
                        try:
                            temporary.replace(dest)
                            return
                        except PermissionError:
                            if retry == 5:
                                raise
                            time.sleep(1)
            time.sleep(1)
        raise RuntimeError(f"Download failed: {url}")


def process(slug):
    original = CACHE / f"{slug}.mp4"
    fetch(f"{BASE}/videos/{slug}.mp4", original)
    poster = ASSETS / "posters" / f"{slug}.jpg"
    fetch(f"{BASE}/videos/{slug}.jpg", poster)
    fetch(f"{BASE}/prompts/{slug}.md", ROOT / "prompts" / f"{slug}.md")
    output = MEDIA / f"{slug}.mp4"
    valid_output = output.exists() and subprocess.run(
        ["ffprobe", "-v", "error", str(output)], capture_output=True).returncode == 0
    if not valid_output:
        subprocess.run([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(original),
            "-vf", "scale=1280:720:force_original_aspect_ratio=decrease:force_divisible_by=2",
            "-c:v", "libx264", "-crf", "24", "-preset", "fast", "-threads", "2",
            "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k",
            "-movflags", "+faststart", str(output),
        ], check=True)
    probe = json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries",
        "stream=codec_type,codec_name,width,height,sample_rate,channels:format=duration,size",
        "-of", "json", str(output),
    ]))
    record = {
        "slug": slug, "source": f"{BASE}/videos/{slug}.mp4",
        "originalBytes": original.stat().st_size,
        "originalSha256": hashlib.sha256(original.read_bytes()).hexdigest(),
        "preview": f"media/{slug}.mp4", "probe": probe,
    }
    print(f"READY {slug}: {output.stat().st_size:,} bytes", flush=True)
    return record


fetch(f"{BASE}/LICENSE", ROOT.parent / "UPSTREAM-LICENSE.txt")
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    records = list(pool.map(process, SLUGS))
(ASSETS / "media-manifest.json").write_text(
    json.dumps({"commit": COMMIT, "media": records}, ensure_ascii=False, indent=2),
    encoding="utf-8",
)
print(f"COMPLETE {len(records)} videos", flush=True)
