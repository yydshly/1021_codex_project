from pathlib import Path
import subprocess,json,shutil
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[1];project=root.parent;out=project/'assets/review-012';public=root/'public/effects';media=project/'web/effect-examples'
studies={'aurora-glass':[30,160,280],'flat-vector':[20,175,255],'line-art':[65,140,240],'morph':[20,135,270],'hanazi':[35,110,240],'paperclip':[40,140,265]}
def frame(video,n,target):subprocess.run(['ffmpeg','-v','error','-y','-i',str(video),'-vf',f'select=eq(n\\,{n})','-frames:v','1','-q:v','2',str(target)],check=True)
for id,frames in studies.items():
 for n in frames:
  file=public/f'study-{id}-{n:03}.jpg';frame(media/f'{id}.mp4',n,file);shutil.copy2(file,out/file.name)
ids=[s['id'] for s in json.loads((project/'web/effect-library.json').read_text(encoding='utf8'))['templates'] if s['id'] not in ['3d-render','isometric']]
for page,start in enumerate([0,5,10]):
 subset=ids[start:start+5];canvas=Image.new('RGB',(1280,len(subset)*150),'#172434');draw=ImageDraw.Draw(canvas)
 for row,id in enumerate(subset):
  for col,n in enumerate([20,115,175,285]):
   file=out/f'final-{id}-{n:03}.jpg';frame(media/f'{id}.mp4',n,file);im=Image.open(file);im.thumbnail((318,126));x=col*320;y=row*150+19;canvas.paste(im,(x,y));draw.text((x+4,y-15),f'{id} / {n/30:.2f}s',fill='white')
 canvas.save(out/f'final-review-{page}.jpg')
print('Eighteen study frames and fifty-two final-film review frames extracted.')
