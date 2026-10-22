"""Extract evidence from encoded films; never replace production artwork."""
import json, subprocess, hashlib
from pathlib import Path
from PIL import Image, ImageDraw

project = Path(__file__).resolve().parents[2]
web = project / 'web'
out = project / 'assets/review-016'
out.mkdir(parents=True, exist_ok=True)
library = json.loads((web / 'effect-library.json').read_text(encoding='utf-8'))['templates']
times = [.6, 2.2, 3.8, 5.5, 7.3, 9.4]
manifest = []
for item in library:
    name = item['id']
    board = Image.new('RGB', (1440, 1152), '#173731')
    d = ImageDraw.Draw(board)
    for row, (label, source) in enumerate([
        ('SOURCE', web / f"reference-effects/media/{item['slug']}.mp4"),
        ('BEFORE 0.15' if name in ['liquid','hud'] else 'BEFORE 0.14', web / f'effect-examples/{name}.mp4')
    ]):
        for i, sec in enumerate(times):
            target = out / 'audit-frames' / f'{name}-{row}-{i}.jpg'
            target.parent.mkdir(exist_ok=True)
            subprocess.run(['ffmpeg','-v','error','-y','-ss',str(sec),'-i',str(source),'-frames:v','1','-vf','scale=480:270',str(target)],check=True)
            x, y = (i % 3)*480, row*576 + (i//3)*288
            board.paste(Image.open(target), (x,y+16))
            d.text((x+7,y+2), f'{label} / {sec:.1f}s / {name}', fill='#fff4d4')
        manifest.append({'style':name,'role':label,'file':str(source.relative_to(project)),'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'times':times})
    board.save(out / f'audit-{name}.jpg', quality=92)
    print(name, flush=True)
(out/'audit-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
