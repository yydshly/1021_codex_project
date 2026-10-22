"""Extract actual encoded frames before publication. --publish updates aliases and reels after visual review."""
from pathlib import Path
from PIL import Image,ImageDraw
import subprocess,json,shutil,hashlib,sys,re
p=Path(__file__).resolve().parents[2];w=p/'web';review=p/'assets/review-017';stories=w/'story-examples-017';public=p/'app/public/effects';cache=p/'app/.cache/package-017'
cache.mkdir(exist_ok=True);publish='--publish' in sys.argv
items=['cel-boil-moon','cel-boil-shelter','morph-voyage','morph-weekend','aurora-glass-darkroom','aurora-glass-rainmix']
defaults={'cel-boil':'moon','morph':'voyage','aurora-glass':'darkroom'}
def run(a):return subprocess.run(a,check=True,capture_output=True,text=True)
def ff(a):return run(['ffmpeg','-v','error','-y','-threads','2','-filter_threads','1','-filter_complex_threads','1',*a])
def sha(f):return hashlib.sha256(f.read_bytes()).hexdigest()
def verify(f,seconds):
 info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(f)],text=True))
 v=next(s for s in info['streams'] if s['codec_type']=='video');a=next(s for s in info['streams'] if s['codec_type']=='audio')
 assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==(1280,720,'30/1',seconds*30)
 assert abs(float(info['format']['duration'])-seconds)<.06
 ff(['-i',str(f),'-f','null','-'])
 vol=run(['ffmpeg','-hide_banner','-i',str(f),'-af','volumedetect','-vn','-f','null','-']).stderr
 return {'file':f.relative_to(p).as_posix(),'sha256':sha(f),'frames':seconds*30,'seconds':seconds,'audio':a['codec_name'],'fullDecode':True,'audioStats':re.findall(r'(?:mean_volume|max_volume): [^\r\n]+',vol)}
if not publish:
 records=[]
 for name in items:
  f=stories/f'{name}.mp4';records.append(verify(f,10))
  ff(['-ss','9.4','-i',str(f),'-frames:v','1','-q:v','2',str(stories/f'{name}.jpg')])
  board=Image.new('RGB',(1440,870),'#173a34');d=ImageDraw.Draw(board)
  for i,sec in enumerate([.6,1.5,2.5,3.5,4.5,5.5,6.5,7.5,9.4]):
   im=review/'keyframes'/f'encoded-{name}-{i}.jpg';ff(['-ss',str(sec),'-i',str(f),'-frames:v','1','-vf','scale=480:270',str(im)])
   x=i%3*480;y=i//3*290;board.paste(Image.open(im),(x,y+18));d.text((x+5,y+3),f'{name} / {sec:.1f}s / ENCODED FILM',fill='#fff4d4')
  board.save(review/f'final-{name}.jpg',quality=94);shutil.copy2(review/f'final-{name}.jpg',public/f'final-017-{name}.jpg')
  print(f'Extracted {name}',flush=True)
 (review/'encoded-media.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
else:
 assert (review/'art-review.md').exists(),'Record an actual visual review before publishing.'
 records=json.loads((review/'encoded-media.json').read_text(encoding='utf-8'))
 for r in records:assert sha(p/r['file'])==r['sha256']
 for style,story in defaults.items():
  for ext in ['mp4','jpg','json']:shutil.copy2(stories/f'{style}-{story}.{ext}',w/f'effect-examples/{style}.{ext}')
 for style in defaults:
  before=w/f'quality-before-017/{style}.mp4';after=w/f'effect-examples/{style}.mp4';board=Image.new('RGB',(1440,580),'#173a34');d=ImageDraw.Draw(board)
  for row,f in enumerate([before,after]):
   for i,sec in enumerate([2.2,5.5,9.4]):
    dest=review/f'compare-{style}-{row}-{i}.jpg';ff(['-ss',str(sec),'-i',str(f),'-frames:v','1','-vf','scale=480:270',str(dest)])
    board.paste(Image.open(dest),(i*480,row*290+18));d.text((i*480+6,row*290+3),f'{"BEFORE / 0.14" if row==0 else "AFTER / 0.17"} / {sec:.1f}s',fill='white')
  board.save(review/f'compare-{style}.jpg',quality=94);shutil.copy2(review/f'compare-{style}.jpg',public/f'compare-017-{style}.jpg')
 order=['cel-boil','liquid','morph','collage','line-art','bauhaus','hanazi','paperclip','aurora-glass','isometric','3d-render','flat-vector','synthwave','pixel','hud']
 def join(name,files,folder,seconds=10,start=0):
  args=[];filters=[];links=[]
  for i,f in enumerate(files):
   args+=['-threads','2','-i',str(f)];filters+=[f'[{i}:v]trim=start_frame={start*30}:end_frame={(start+seconds)*30},setpts=N/(30*TB),setsar=1,format=yuv420p[v{i}]',f'[{i}:a]aresample=48000,atrim=start_sample={start*48000}:end_sample={(start+seconds)*48000},asetpts=PTS-STARTPTS,apad=whole_len={seconds*48000},atrim=end_sample={seconds*48000}[a{i}]'];links.append(f'[v{i}][a{i}]')
  filters.append(''.join(links)+f'concat=n={len(files)}:v=1:a=1[v][a]');f=folder/f'{name}.mp4';total=seconds*len(files)
  ff([*args,'-filter_complex',';'.join(filters),'-map','[v]','-map','[a]','-r','30','-frames:v',str(total*30),'-t',str(total),'-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-threads','2','-c:a','aac','-ar','48000','-ac','2','-b:a','192k','-movflags','+faststart',str(f)])
  print(f'Created {name} / {total}s',flush=True);return verify(f,total)
 reels=[join('complete-reel-017',[stories/f'{name}.mp4' for name in items],stories),join('quality-reel',[w/f'effect-examples/{i}.mp4' for i in order],w/'effect-examples'),join('after-hours-reel',[w/f'effect-examples/{i}.mp4' for i in order],w/'effect-examples',3,2)]
 for name,seconds in [('quality-reel',10),('after-hours-reel',3)]:
  (w/f'effect-examples/{name}.chapters.json').write_text(json.dumps([{'style':i,'title':json.loads((w/f'effect-examples/{i}.json').read_text(encoding='utf-8'))['title'],'start':k*seconds,'end':(k+1)*seconds} for k,i in enumerate(order)],ensure_ascii=False,indent=2),encoding='utf-8')
 manifest=json.loads((w/'quality-before-017/manifest.json').read_text(encoding='utf-8'))
 for r in manifest:assert sha(w/'quality-before-017'/r['file'])==r['sha256']
 baseline=json.loads((review/'baseline.json').read_text(encoding='utf-8'));unchanged=[]
 for r in baseline:
  if r['style'] in order and r['style'] not in defaults:
   assert sha(w/'effect-examples'/r['file'])==r['sha256'];unchanged.append(r)
 assert len(unchanged)==12
 (review/'media.json').write_text(json.dumps({'films':records,'reels':reels,'preservedFiles':len(manifest),'unchangedOtherStyles':unchanged,'scope':'Technical integrity and preservation; no artistic score.'},indent=2),encoding='utf-8')
 print('6 films; 12 unchanged; history preserved. No artistic score assigned.',flush=True)
