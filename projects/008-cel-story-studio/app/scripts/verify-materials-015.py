"""回读两份真实网页导出；只验证数据与媒体路径，不给艺术评分。"""
from pathlib import Path
import hashlib,json,subprocess,shutil
ROOT=Path(__file__).resolve().parents[1];PROJECT=ROOT.parent
OUT=PROJECT/'web/material-examples-015';OUT.mkdir(exist_ok=True)
REVIEW=PROJECT/'assets/review-015';rows=[]
for job,name,style,title,sound in [
 ('7bdb10bc-3d72-402f-a7b1-81bce93b8245','hud-close','hud','回声，醒来',False),
 ('5edca86c-72d8-4e05-becb-52ce8784e1c3','liquid-custom','liquid','柔软的相遇',True),
]:
 config=json.loads((ROOT/f'exports/{job}.json').read_text(encoding='utf8'))['config']
 assert (config['style'],config['title'],config['duration'],config['sound'])==(style,title,6,sound)
 if style=='hud':assert len(config['shots'])==4 and all(s['framing']=='close' and s['seconds']==1.5 for s in config['shots'])
 else:assert config['count']==14 and config['seed']==22
 video=ROOT/f'exports/{job}.mp4';meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(video)],text=True))
 v=next(s for s in meta['streams'] if s['codec_type']=='video');a=next((s for s in meta['streams'] if s['codec_type']=='audio'),None)
 assert (v['codec_name'],v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==('h264',1280,720,'30/1',180)
 assert bool(a)==sound and abs(float(meta['format']['duration'])-6)<.06
 subprocess.run(['ffmpeg','-v','error','-threads','2','-i',str(video),'-f','null','-'],check=True)
 shutil.copy2(video,OUT/f'{name}.mp4');(OUT/f'{name}.json').write_text(json.dumps(config,ensure_ascii=False,indent=2),encoding='utf8')
 for frame in ([162,179] if style=='hud' else [27,101]):
  subprocess.run(['ffmpeg','-v','error','-y','-threads','2','-filter_threads','1','-i',str(video),'-vf',f'select=eq(n\\,{frame})','-frames:v','1','-q:v','2','-threads','2',str(REVIEW/f'ui-{name}-{frame}.jpg')],check=True)
 rows.append({'job':job,'file':f'web/material-examples-015/{name}.mp4','config':config,'frames':180,'fullDecode':True,'audio':bool(a),'sha256':hashlib.sha256(video.read_bytes()).hexdigest()})
(REVIEW/'ui-exports.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')
print('2 real UI exports verified: 180 frames each; HUD all-close silent; liquid count14 seed22 AAC. No aesthetic score.')
