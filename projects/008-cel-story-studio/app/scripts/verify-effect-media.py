"""验证实际媒体与舞台变化；需要 ffmpeg / ffprobe 和 Pillow。"""
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageChops, ImageStat

project = Path(__file__).resolve().parents[2]
media = project / 'web' / 'effect-examples'
proof = project / 'assets' / 'effect-frames'
rows = []
for config in sorted(media.glob('*.json')):
    payload = json.loads(config.read_text(encoding='utf8'))
    if config.stem == '3d-custom' or not isinstance(payload, dict) or payload.get('kind') != 'effect-template':
        continue
    name = config.stem
    video = media / f'{name}.mp4'
    metadata = json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(video)
    ], text=True))
    stream = next(s for s in metadata['streams'] if s['codec_type'] == 'video')
    audio = next((s for s in metadata['streams'] if s['codec_type'] == 'audio'), None)
    expected_sound = json.loads(config.read_text(encoding='utf8')).get('sound', False)
    assert bool(audio) == expected_sound
    if audio:
        assert audio['codec_name'] == 'aac'
    assert stream['codec_name'] == 'h264'
    assert (stream['width'], stream['height']) == (1280, 720)
    assert stream['r_frame_rate'] == '30/1' and int(stream['nb_frames']) == 300
    assert abs(float(metadata['format']['duration']) - 10) < .05
    subprocess.run(['ffmpeg', '-v', 'error', '-i', str(video), '-f', 'null', '-'],
                   check=True, capture_output=True)
    # 裁掉顶部标题与底部帧号，验证主体舞台真实变化。
    base = Image.open(proof / f'{name}-base.jpg').convert('RGB').crop((20, 180, 1260, 635))
    differences = {}
    for suffix in ['motion', 'parameters', 'content']:
        other = Image.open(proof / f'{name}-{suffix}.jpg').convert('RGB').crop((20, 180, 1260, 635))
        score = sum(ImageStat.Stat(ImageChops.difference(base, other)).mean) / 3
        assert score > .025, (name, suffix, score)
        differences[suffix] = round(score, 4)
    rows.append({'style': name, 'codec': stream['codec_name'], 'size': [1280, 720],
                 'fps': stream['r_frame_rate'], 'frames': 300,
                 'duration': float(metadata['format']['duration']),
                 'audio': any(s['codec_type'] == 'audio' for s in metadata['streams']),
                 'decode': 'passed', 'bodyDifferenceMean': differences})
assert len(rows) == 15
result = {'verifiedTemplates': len(rows), 'videos': rows,
          'note': '差异统计裁掉标题和帧号；参数对比改变数量、幅度、细节和种子；内容对比改变颜色与文字。差异证明画面变化，不作为审美等价证明。'}
(project / 'assets' / 'effect-media-verification.json').write_text(
    json.dumps(result, ensure_ascii=False, indent=2), encoding='utf8')
print(f'15 videos decoded; 45 body comparisons passed.')
