"""Extract design evidence from the complete final films, never substitute concept art."""
from pathlib import Path
from PIL import Image,ImageDraw
import subprocess,shutil
app=Path(__file__).resolve().parents[1];project=app.parent;media=project/'web/effect-examples'
public=app/'public/effects';evidence=project/'assets/hero-design';evidence.mkdir(exist_ok=True)
frames=[('3d-render',20,'hero-magnetic-hook'),('3d-render',145,'hero-magnetic-tension'),('3d-render',222,'hero-magnetic-bloom'),('isometric',20,'hero-soundworks-hook'),('isometric',190,'hero-soundworks-climax'),('isometric',270,'hero-soundworks-reveal')]
def extract(source,n,target):
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(source),'-vf',f'select=eq(n\\,{n})','-frames:v','1','-q:v','2',str(target)],check=True)
def grid(files,target,columns=3):
    canvas=Image.new('RGB',(1280,270*((len(files)+columns-1)//columns)),'#14202a');draw=ImageDraw.Draw(canvas)
    width=1280//columns
    for i,(label,file) in enumerate(files):
        im=Image.open(file);im.thumbnail((width-6,width*9//16));x=i%columns*width;y=i//columns*270+24
        canvas.paste(im,(x,y));draw.text((x+10,y-19),label,fill='white')
    canvas.save(target)
for style,n,name in frames:
    target=public/f'{name}.jpg';extract(media/f'{style}.mp4',n,target);shutil.copy2(target,evidence/target.name)
grid([(f'{style} / {n/30:.2f}s',public/f'{name}.jpg') for style,n,name in frames],evidence/'two-film-contact.jpg')
review=project/'assets/hero-review'
files=[]
for n in [76,78,80,154,156,158]:
    file=review/f'magnetic-final-{n}.jpg';extract(media/'3d-render.mp4',n,file);files.append((f'FINAL CAMERA / frame {n}',file))
grid(files,review/'magnetic-boundaries-final.jpg')
print('Six final-film keyframes and continuous-frame review updated.')
