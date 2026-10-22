"""检查内容完整性、固定版本来源和每个视频的实际可解码性。"""
import concurrent.futures
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parent
WEB = PROJECT / "web"
styles = json.loads((ROOT / "styles.json").read_text(encoding="utf-8"))
tree = json.loads((ROOT / ".cache/tree.json").read_text(encoding="utf-8"))
source_items = {item["path"]: item for item in tree["tree"]}
assert tree["sha"] == "49052d80bfaf9fa8412cc9710530e5e95a3b8d8c"
assert len(styles) == 15 and len({s["slug"] for s in styles}) == 15
sources = []
html = (ROOT / "index.html").read_text(encoding="utf-8")
script = (ROOT / "app.js").read_text(encoding="utf-8")
for evidence in re.findall(r'data-source="([^"]+)"', html) + re.findall(r"path:'([^']+)'", script):
    assert evidence in source_items, f"Missing general evidence: {evidence}"


def hash_matches(path, upstream):
    data = path.read_bytes()
    sha = hashlib.sha1(f"blob {len(data)}\0".encode() + data).hexdigest()
    assert sha == source_items[upstream]["sha"], f"Source mismatch: {upstream}"
    sources.append({"path": upstream, "sha": sha, "size": len(data)})


for s in styles:
    for field in ("name", "en", "category", "work", "description", "value", "limitations"):
        assert s[field], (s["slug"], field)
    for field in ("designPrinciples", "technicalPrinciples", "useCases", "extensions", "evidencePaths"):
        assert len(s[field]) >= 2, (s["slug"], field)
    for path in s["evidencePaths"] + [s["promptPath"], s["sourcePath"]]:
        assert path in source_items, path
    hash_matches(ROOT / ".cache" / f"{s['slug']}.mp4", s["videoPath"])
    hash_matches(PROJECT / "assets/posters" / f"{s['slug']}.jpg", s["posterPath"])
    hash_matches(ROOT / "prompts" / f"{s['slug']}.md", s["promptPath"])
    assert (WEB / "media" / f"{s['slug']}.jpg").is_file()
hash_matches(PROJECT / "UPSTREAM-LICENSE.txt", "LICENSE")
(ROOT / "source-index.json").write_text(json.dumps(sources, ensure_ascii=False, indent=2), encoding="utf-8")


def check_video(style):
    path = WEB / "media" / f"{style['slug']}.mp4"
    metadata = json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-count_frames", "-show_entries",
        "stream=codec_type,codec_name,width,height,nb_read_frames:format=duration,size", "-of", "json", str(path),
    ]))
    streams = metadata["streams"]
    assert any(s["codec_type"] == "video" and s["codec_name"] == "h264" for s in streams)
    assert any(s["codec_type"] == "audio" and s["codec_name"] == "aac" for s in streams)
    assert 9.9 <= float(metadata["format"]["duration"]) <= 10.2
    decoded = subprocess.run(["ffmpeg", "-v", "error", "-xerror", "-i", str(path), "-f", "null", "-"],
                             capture_output=True, text=True)
    assert decoded.returncode == 0, f"{path}: {decoded.stderr}"
    return {"slug": style["slug"], "decode": "passed", "metadata": metadata}


with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    media = list(pool.map(check_video, styles))
report = {
    "sourceCommit": tree["sha"],
    "styles": len(styles),
    "verifiedSourceFiles": len(sources),
    "localMediaBytes": sum(int(v["metadata"]["format"]["size"]) for v in media),
    "media": media,
}
(PROJECT / "assets/verification.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"PASS: {len(styles)} styles, {len(sources)} exact upstream files, 15 decoded H.264/AAC videos")
