"""从已验收的十五支短片剪出 45 秒作品集，保留独立完整样片。"""
import json
import subprocess
from pathlib import Path

app = Path(__file__).resolve().parents[1]
project = app.parent
media = project / 'web' / 'effect-examples'
cache = app / '.cache' / 'night-reel'
cache.mkdir(parents=True, exist_ok=True)
library = json.loads((project / 'web' / 'effect-library.json').read_text(encoding='utf8'))['templates']
parts = []
chapters = []
for i, style in enumerate(library):
    source = media / f"{style['id']}.mp4"
    target = cache / f'{i:02}.mp4'
    subprocess.run([
        'ffmpeg', '-v', 'error', '-y', '-ss', '2', '-i', str(source), '-t', '3', '-an',
        '-vf', 'scale=1280:720,setsar=1,fade=t=in:d=0.10,fade=t=out:st=2.88:d=0.12',
        '-r', '30', '-c:v', 'libx264', '-crf', '19', '-pix_fmt', 'yuv420p', str(target)
    ], check=True)
    parts.append("file '" + target.as_posix() + "'")
    chapters.append({'at': i * 3, 'style': style['id'], 'title': style['example'][0], 'sourceRange': [2, 5]})
concat = cache / 'concat.txt'
concat.write_text('\n'.join(parts), encoding='utf8')
silent = cache / 'silent.mp4'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(concat),
                '-c', 'copy', str(silent)], check=True)
subprocess.run([
    'ffmpeg', '-v', 'error', '-y', '-i', str(silent), '-stream_loop', '-1',
    '-i', str(app / 'public/effects/score-warm.wav'), '-map', '0:v', '-map', '1:a',
    '-t', '45', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k',
    '-af', 'afade=t=in:d=0.7,afade=t=out:st=44:d=1', '-movflags', '+faststart',
    str(media / 'after-hours-reel.mp4')
], check=True)
(media / 'after-hours-reel.chapters.json').write_text(
    json.dumps({'title': '夜间漫游', 'duration': 45, 'chapters': chapters}, ensure_ascii=False, indent=2), encoding='utf8')
print('Created 45 s / 15-film showreel.')
