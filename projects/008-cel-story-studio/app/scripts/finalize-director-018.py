"""Decode actual films, extract review evidence and check old media preservation."""
from pathlib import Path
from PIL import Image,ImageDraw
import subprocess,json,hashlib,re,shutil
p=Path(__file__).resolve().parents[2];w=p/'web';r=p/'assets/review-018';out=w/'director-examples-018'
def run(a):return subprocess.run(a,check=True,capture_output=True,text=True)
def ff(a):return run(['ffmpeg','-v','error','-y','-threads','2','-filter_threads','1',*a])
def sha(f):return hashlib.sha256(f.read_bytes()).hexdigest()
records=[]
for name in ['main','rewrite']:
 f=out/f'{name}.mp4';meta=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(f)]).stdout)
 v=next(s for s in meta['streams'] if s['codec_type']=='video');a=next(s for s in meta['streams'] if s['codec_type']=='audio')
 assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==(1920,1080,'30/1',600)
 assert abs(float(meta['format']['duration'])-20)<.08
 ff(['-i',str(f),'-f','null','-'])
 board=Image.new('RGB',(1440,870),'#173a34');d=ImageDraw.Draw(board)
 for i,sec in enumerate([.7,2.5,4.5,6.3,8.5,11.5,13.5,15.5,18.7]):
  dest=r/'keyframes'/f'encoded-{name}-{i}.jpg';ff(['-ss',str(sec),'-i',str(f),'-frames:v','1','-vf','scale=480:270',str(dest)])
  x=i%3*480;y=i//3*290;board.paste(Image.open(dest),(x,y+18));d.text((x+5,y+3),f'{name} / {sec:.1f}s / ACTUAL MP4',fill='white')
 board.save(r/f'encoded-{name}.jpg',quality=94)
 ff(['-ss','18.6','-i',str(f),'-frames:v','1','-q:v','2',str(out/f'{name}.jpg')])
 volume=run(['ffmpeg','-hide_banner','-i',str(f),'-af','volumedetect','-vn','-f','null','-']).stderr
 records.append({'file':f.relative_to(p).as_posix(),'sha256':sha(f),'frames':600,'seconds':20,'width':1920,'height':1080,'audio':a['codec_name'],'fullDecode':True,'audioStats':re.findall(r'(?:mean_volume|max_volume): [^\r\n]+',volume)})
old=json.loads((p/'assets/review-017/media.json').read_text(encoding='utf-8'));retained=[]
for row in old['unchangedOtherStyles']:
 f=w/'effect-examples'/row['file'];assert sha(f)==row['sha256'];retained.append({'file':f.relative_to(p).as_posix(),'sha256':sha(f)})
for style,story in [('cel-boil','moon'),('morph','voyage'),('aurora-glass','darkroom')]:
 previous=next(x for x in old['films'] if x['file'].endswith(f'{style}-{story}.mp4'));f=w/'effect-examples'/f'{style}.mp4';assert sha(f)==previous['sha256'];retained.append({'file':f.relative_to(p).as_posix(),'sha256':sha(f)})
assert len(retained)==15
archives=0
for version in ['014','015','016','017']:
 manifest=w/f'quality-before-{version}/manifest.json'
 if manifest.exists():
  for row in json.loads(manifest.read_text(encoding='utf-8')):
   assert sha(manifest.parent/row['file'])==row['sha256'];archives+=1
(r/'media.json').write_text(json.dumps({'films':records,'preservedCurrent15':retained,'preservedArchivedFiles':archives,'scope':'Encoding, audio measurements and preservation only; not an artistic score.'},ensure_ascii=False,indent=2),encoding='utf-8')
print('Two 1080p/600-frame films fully decoded; fifteen existing films preserved; archive files',archives)
