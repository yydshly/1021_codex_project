"""从最终MP4取帧并打包，保留0.14快照；技术核验不作审美评分。"""
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,subprocess,shutil
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1];PROJECT=ROOT.parent
MEDIA=PROJECT/'web/effect-examples';OUT=ROOT/'public/effects';REVIEW=PROJECT/'assets/review-015';CACHE=ROOT/'.cache/material-package-015'
CACHE.mkdir(exist_ok=True)
ORDER=['cel-boil','liquid','morph','collage','line-art','bauhaus','hanazi','paperclip','aurora-glass','isometric','3d-render','flat-vector','synthwave','pixel','hud']
FRAMES={'liquid':[45,169,183],'hud':[45,90,270]}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def ff(args):subprocess.run(['ffmpeg','-v','error','-y','-threads','2','-filter_threads','1','-filter_complex_threads','1',*args],check=True)
def verify(p,seconds,audio=True):
 meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)],text=True))
 v=next(s for s in meta['streams'] if s['codec_type']=='video');a=next((s for s in meta['streams'] if s['codec_type']=='audio'),None)
 assert (v['codec_name'],v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==('h264',1280,720,'30/1',seconds*30)
 assert bool(a)==audio and abs(float(meta['format']['duration'])-seconds)<.06
 ff(['-i',str(p),'-f','null','-'])
 return {'file':str(p.relative_to(PROJECT)).replace('\\','/'),'sha256':sha(p),'seconds':seconds,'frames':seconds*30,'fullDecode':True,'audio':bool(a)}
report={'revision':'0.15','verifiedAtUTC':datetime.now(timezone.utc).isoformat(),'artisticScore':None,'films':[],'unchanged':[],'frames':[],'reels':[],'preserved':[]}
for item in json.loads((REVIEW/'preserved-before.json').read_text(encoding='utf8')):
 assert sha(PROJECT/item['file'])==item['sha256'];report['preserved'].append(item)
for item in json.loads((PROJECT/'assets/review-014/media.json').read_text(encoding='utf8'))['films']:
 if item['style'] not in FRAMES:
  assert sha(PROJECT/item['file'])==item['sha256'];report['unchanged'].append({'style':item['style'],'sha256':item['sha256']})
for style,frames in FRAMES.items():
 movie=MEDIA/f'{style}.mp4';prior=PROJECT/f'web/quality-before-015/{style}.mp4';entry=verify(movie,10);assert sha(movie)!=sha(prior);entry['style']=style;entry['beforeSha256']=sha(prior);report['films'].append(entry)
 for f in frames:
  dest=OUT/f'material-{style}-{f}-015.jpg'
  ff(['-i',str(movie),'-vf',f'select=eq(n\\,{f})','-frames:v','1','-q:v','2','-threads','2',str(dest)])
  report['frames'].append({'file':str(dest.relative_to(ROOT)).replace('\\','/'),'frame':f,'sha256':sha(dest),'movieSha256':entry['sha256'],'method':'extracted from final MP4'})
 hero=169 if style=='liquid' else 270
 shutil.copy2(OUT/f'material-{style}-{hero}-015.jpg',OUT/f'material-{style}-015.jpg')
 # Same moments from before and after, from encoded films rather than separately redrawn renders.
 board=Image.new('RGB',(1440,612),'#112a27');draw=ImageDraw.Draw(board)
 for row,(src,label) in enumerate([(prior,'BEFORE / 0.14'),(movie,'AFTER / 0.15')]):
  for i,f in enumerate(frames):
   dest=REVIEW/f'{style}-{label.split()[0].lower()}-{f:03}.jpg';ff(['-i',str(src),'-vf',f'select=eq(n\\,{f})','-frames:v','1','-q:v','2','-threads','2',str(dest)])
   x=i*480;y=row*306;board.paste(Image.open(dest).resize((480,270)),(x,y+30));draw.text((x+10,y+8),f'{label} / {f/30:.2f}s',fill='#fff1d5')
 board.save(REVIEW/f'{style}-before-after.jpg',quality=94)
 shutil.copy2(REVIEW/f'{style}-before-after.jpg',OUT/f'material-{style}-before-after-015.jpg')
 print(f'Verified {style}; final MP4 frames and before/after extracted.',flush=True)
def join(name,order,seconds=10,highlights=False):
 args=[];filters=[];links=[];chapters=[]
 for i,style in enumerate(order):
  args+=['-threads','2','-i',str(MEDIA/f'{style}.mp4')];start=2 if highlights else 0;end=start+seconds
  filters+=[f'[{i}:v]trim=start_frame={start*30}:end_frame={end*30},setpts=N/(30*TB),setsar=1,format=yuv420p[v{i}]',f'[{i}:a]aresample=48000,atrim=start_sample={start*48000}:end_sample={end*48000},asetpts=PTS-STARTPTS,apad=whole_len={seconds*48000},atrim=end_sample={seconds*48000}[a{i}]']
  links.append(f'[v{i}][a{i}]');chapters.append({'style':style,'title':json.loads((MEDIA/f'{style}.json').read_text(encoding='utf8'))['title'],'start':i*seconds,'end':(i+1)*seconds})
 filters.append(''.join(links)+f'concat=n={len(order)}:v=1:a=1[v][a]');target=CACHE/f'{name}.mp4';total=seconds*len(order)
 ff([*args,'-filter_complex',';'.join(filters),'-map','[v]','-map','[a]','-r','30','-frames:v',str(total*30),'-t',str(total),'-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-threads','2','-c:a','aac','-ar','48000','-ac','2','-b:a','192k','-movflags','+faststart',str(target)])
 final=MEDIA/f'{name}.mp4';shutil.copy2(target,final);result=verify(final,total);result['chapters']=chapters;report['reels'].append(result)
 (MEDIA/f'{name}.chapters.json').write_text(json.dumps(chapters,ensure_ascii=False,indent=2),encoding='utf8');print(f'{name}: {total}s full decode passed.',flush=True)
join('material-reel-015',['liquid','hud']);join('quality-reel',ORDER);join('after-hours-reel',ORDER,3,True)
(REVIEW/'media.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print('Two updated films; thirteen unchanged; snapshots intact. No aesthetic score assigned.')
