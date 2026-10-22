"""Verify the three actual UI exports; preserve shareable local examples."""
from pathlib import Path
import hashlib, json, re, shutil, subprocess

PROJECT = Path(__file__).resolve().parents[2]
CASES = [
    ('pixel', 'bb2bb7e8-4787-4311-a524-f939d882bdea', 10, 6, True, 'ai-moon-story'),
    ('synthwave', 'a5cd20fe-58ab-4296-b05a-12b11e1364b6', 6, 4, False, 'neon-edit'),
    ('hud', '923a87a8-5c17-4877-a259-9931bb7d3544', 8, 4, True, 'hud-edit'),
]
out = PROJECT / 'web/director-examples'
out.mkdir(exist_ok=True)
rows = []
for style, identifier, duration, count, sound, name in CASES:
    assert re.fullmatch(r'[a-f0-9-]{36}', identifier)
    private_source = PROJECT / 'app/exports' / identifier
    source = private_source if private_source.with_suffix('.mp4').exists() else out / name
    payload = json.loads(source.with_suffix('.json').read_text(encoding='utf8'))
    config = payload.get('config', payload)
    assert config['style'] == style and config['duration'] == duration
    assert len(config['shots']) == count and config.get('sound', False) == sound
    assert sum(s['seconds'] for s in config['shots']) == duration
    metadata = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(source.with_suffix('.mp4'))], text=True))
    video = next(s for s in metadata['streams'] if s['codec_type'] == 'video')
    audio = next((s for s in metadata['streams'] if s['codec_type'] == 'audio'), None)
    assert video['codec_name'] == 'h264' and (video['width'], video['height']) == (1280, 720)
    assert video['r_frame_rate'] == '30/1' and int(video['nb_frames']) == duration * 30
    assert bool(audio) == sound
    assert abs(float(metadata['format']['duration']) - duration) < .05
    if audio:
        assert audio['codec_name'] == 'aac' and audio['channels'] == 2
    subprocess.run(['ffmpeg', '-v', 'error', '-threads', '2', '-i', str(source.with_suffix('.mp4')), '-f', 'null', '-'], check=True, capture_output=True)
    target = out / (name + '.mp4')
    if source.with_suffix('.mp4').resolve() != target.resolve():
        shutil.copy2(source.with_suffix('.mp4'), target)
    (out / (name + '.json')).write_text(json.dumps(config, ensure_ascii=False, indent=2), encoding='utf8')
    rows.append({'style': style, 'id': identifier, 'origin': 'Actual browser UI export', 'video': str(target.relative_to(PROJECT)).replace('\\', '/'), 'config': f'web/director-examples/{name}.json', 'duration': duration, 'frames': int(video['nb_frames']), 'shots': count, 'audio': sound, 'decode': 'passed', 'sha256': hashlib.sha256(target.read_bytes()).hexdigest()})

failed_file = PROJECT / 'app/exports/e588185e-c4b2-4dff-ae7b-6b5770c5a9e3.json'
retried_file = PROJECT / 'app/exports/923a87a8-5c17-4877-a259-9931bb7d3544.json'
if failed_file.exists() and retried_file.exists():
    assert json.loads(failed_file.read_text(encoding='utf8')) == json.loads(retried_file.read_text(encoding='utf8'))
report = {'exports': rows, 'hudRetry': {'initialJob': 'e588185e-c4b2-4dff-ae7b-6b5770c5a9e3', 'result': 'frame 184 wait timed out at default 33000ms', 'change': 'Web selection and rendering now use 90000ms, matching the existing media-rendering CLI budget.', 'sameConfig': True, 'retryJob': '923a87a8-5c17-4877-a259-9931bb7d3544', 'retryDecode': 'passed', 'limit': 'One successful same-config retry does not prove all causes of GPU stalls are resolved.'}}
(PROJECT / 'assets/review-013/custom-exports.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf8')
print('3 real UI exports decoded, matching timing/sound/shots; examples preserved. HUD retry uses identical configuration.')
