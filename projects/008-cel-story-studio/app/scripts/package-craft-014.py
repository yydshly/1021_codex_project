"""Package final MP4 frames, full collection and source/before/after evidence.

Only reads rendered videos, never substitutes independently redrawn frames.
FFmpeg threads are bounded for this 16 GB workstation.
"""
from pathlib import Path
import hashlib,json,subprocess,shutil
from datetime import datetime,timezone
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1];PROJECT=ROOT.parent
MEDIA=PROJECT/'web/effect-examples';BEFORE=PROJECT/'web/quality-before-014'
OUT=ROOT/'public/effects';REVIEW=PROJECT/'assets/review-014';CACHE=ROOT/'.cache/package-craft-014'
for p in [OUT,REVIEW,CACHE]:p.mkdir(parents=True,exist_ok=True)
FRAMES={'cel-boil':[56,117,270],'liquid':[44,183,282],'morph':[48,138,280],
 'collage':[69,201,273],'line-art':[48,123,280],'bauhaus':[54,150,273],
 'hanazi':[65,175,280],'paperclip':[85,155,280],'aurora-glass':[12,135,282],
 'isometric':[65,115,285],'3d-render':[48,102,222],'flat-vector':[20,175,285],
 'synthwave':[1,154,285],'pixel':[15,90,285],'hud':[30,115,270]}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def ff(args):subprocess.run(['ffmpeg','-v','error','-y','-threads','2','-filter_threads','1','-filter_complex_threads','1',*args],check=True)
def verify(p,duration):
 probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)],text=True))
 v=next(s for s in probe['streams'] if s['codec_type']=='video');a=next(s for s in probe['streams'] if s['codec_type']=='audio')
 assert v['codec_name']=='h264' and (v['width'],v['height'])==(1280,720)
 assert v['r_frame_rate']=='30/1' and int(v['nb_frames'])==duration*30
 assert a['codec_name']=='aac' and abs(float(probe['format']['duration'])-duration)<.06
 ff(['-i',str(p),'-f','null','-'])
 return {'file':str(p.relative_to(PROJECT)).replace('\\','/'),'sha256':sha(p),'seconds':duration,'frames':int(v['nb_frames']),'video':v['codec_name'],'audio':a['codec_name'],'fullDecode':True}
report={'revision':'0.14','verifiedAtUTC':datetime.now(timezone.utc).isoformat(),'artisticScore':None,'films':[],'frames':[],'reels':[],'preserved':[]}
for style,frames in FRAMES.items():
 source=MEDIA/f'{style}.mp4';prior=BEFORE/f'{style}.mp4'
 item=verify(source,10);assert sha(source)!=sha(prior),f'{style} is still the previous movie'
 item['style']=style;item['priorSha256']=sha(prior);report['films'].append(item)
 for frame in frames:
  target=OUT/f'craft-{style}-{frame:03}.jpg'
  ff(['-i',str(source),'-vf',f'select=eq(n\\,{frame})','-frames:v','1','-q:v','2','-threads','2',str(target)])
  report['frames'].append({'style':style,'frame':frame,'file':str(target.relative_to(ROOT)).replace('\\','/'),'sha256':sha(target),'sourceSha256':item['sha256'],'method':'extracted from final MP4'})
 print(f'Verified / extracted: {style}',flush=True)
# Preserve every exact previous video/poster/config, plus older reels before replacement.
for file in sorted(BEFORE.iterdir()):
 if file.is_file():report['preserved'].append({'file':str(file.relative_to(PROJECT)).replace('\\','/'),'sha256':sha(file)})
def join(name,seconds=10,highlights=False):
 args=[];filters=[];links=[];chapters=[]
 for i,style in enumerate(FRAMES):
  args+=['-threads','2','-i',str(MEDIA/f'{style}.mp4')]
  start=2 if highlights else 0;end=start+seconds
  filters+=[f'[{i}:v]trim=start_frame={start*30}:end_frame={end*30},setpts=N/(30*TB),setsar=1,format=yuv420p[v{i}]',f'[{i}:a]aresample=48000,atrim=start_sample={start*48000}:end_sample={end*48000},asetpts=PTS-STARTPTS,apad=whole_len={seconds*48000},atrim=end_sample={seconds*48000}[a{i}]']
  links.append(f'[v{i}][a{i}]');chapters.append({'style':style,'title':json.loads((MEDIA/f'{style}.json').read_text(encoding='utf8'))['title'],'start':i*seconds,'end':(i+1)*seconds,'sourceRange':[start,end]})
 filters.append(''.join(links)+f'concat=n=15:v=1:a=1[v][a]');target=CACHE/f'{name}.mp4';total=seconds*15
 ff([*args,'-filter_complex',';'.join(filters),'-map','[v]','-map','[a]','-r','30','-frames:v',str(total*30),'-t',str(total),'-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-threads','2','-c:a','aac','-ar','48000','-ac','2','-b:a','192k','-movflags','+faststart',str(target)])
 final=MEDIA/f'{name}.mp4';shutil.copy2(target,final)
 result=verify(final,total);result['chapters']=chapters;report['reels'].append(result)
 (MEDIA/f'{name}.chapters.json').write_text(json.dumps(chapters,ensure_ascii=False,indent=2),encoding='utf8');print(f'Reel: {name} / {total}s',flush=True)
join('quality-reel');join('after-hours-reel',3,True)
# One small overview of all final posters, useful for human review, never an art score.
contact=Image.new('RGB',(1440,5*306),'#142825');draw=ImageDraw.Draw(contact)
for i,style in enumerate(FRAMES):
 im=Image.open(MEDIA/f'{style}.jpg').resize((480,270));x=(i%3)*480;y=(i//3)*306;contact.paste(im,(x,y+30));draw.text((x+12,y+8),style,fill='#fff0cd')
contact.save(REVIEW/'all-fifteen-final.jpg',quality=92)
(REVIEW/'media.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print('15 final films, 45 exact frames, 150s + 45s reels verified. No aesthetic score assigned.')
