"""回读本轮两份真实网页提交，与实际 MP4 核对；不作审美评分。"""
from pathlib import Path
import hashlib,json,shutil,subprocess
root=Path(__file__).resolve().parents[1]
project=root.parent
dest=project/'web/craft-examples'
dest.mkdir(exist_ok=True)
rows=[]
for job,name,style,title,sound,seed in [
 ('8004d18f-a984-4cc9-96a4-275a0729b8ea','handmade-014','cel-boil','借风去远方',True,21),
 ('3bc041da-5b99-4e23-839e-77e5fd36320b','liquid-014','liquid','相遇，流动成桥',False,22),
]:
 config=json.loads((root/f'exports/{job}.json').read_text(encoding='utf8'))['config']
 assert (config['style'],config['title'],config['duration'],config['sound'],config['seed'])==(style,title,6,sound,seed)
 video=root/f'exports/{job}.mp4'
 meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(video)],text=True))
 v=next(s for s in meta['streams'] if s['codec_type']=='video')
 a=next((s for s in meta['streams'] if s['codec_type']=='audio'),None)
 assert (v['codec_name'],v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==('h264',1280,720,'30/1',180)
 assert abs(float(meta['format']['duration'])-6)<.06 and bool(a)==sound
 subprocess.run(['ffmpeg','-v','error','-threads','2','-i',str(video),'-f','null','-'],check=True)
 shutil.copy2(video,dest/f'{name}.mp4')
 (dest/f'{name}.json').write_text(json.dumps(config,ensure_ascii=False,indent=2),encoding='utf8')
 rows.append({'job':job,'file':f'web/craft-examples/{name}.mp4','config':config,'frames':180,'size':[1280,720],'fps':30,'audio':bool(a),'fullDecode':True,'sha256':hashlib.sha256(video.read_bytes()).hexdigest()})
out=project/'assets/review-014/ui-exports.json'
out.write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')
print('2 real UI exports: configurations, 180 frames, audio states and full decode passed.')
