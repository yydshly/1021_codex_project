"""Verify complete films, comparison copies, the full reel and browser-created custom exports."""
from pathlib import Path
import json,subprocess,hashlib,sys
root=Path(__file__).resolve().parents[1]; project=root.parent; media=project/'web/effect-examples'
def inspect(file,frames,duration,sound=True):
    meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(file)],text=True))
    v=next(x for x in meta['streams'] if x['codec_type']=='video'); audio=next((x for x in meta['streams'] if x['codec_type']=='audio'),None)
    assert (v['width'],v['height'],v['r_frame_rate'],v['codec_name'],int(v['nb_frames']))==(1280,720,'30/1','h264',frames),(file,v)
    assert abs(float(meta['format']['duration'])-duration)<.05,(file,meta['format']['duration'])
    assert bool(audio)==sound,(file,audio)
    if audio:assert audio['codec_name']=='aac'
    subprocess.run(['ffmpeg','-v','error','-i',str(file),'-f','null','-'],check=True,capture_output=True)
    return {'file':str(file.relative_to(project)).replace('\\','/'),'frames':frames,'duration':float(meta['format']['duration']),'audio':bool(audio),'decode':'passed','sha256':hashlib.sha256(file.read_bytes()).hexdigest()}
browser=json.loads((project/'assets/collection-browser-playback.json').read_text(encoding='utf8'))
assert len(browser['films'])==12 and all(x['ready']==4 and not x['paused'] and not x.get('error') for x in browser['films'])
ids=[x['id'] for x in json.loads((project/'web/effect-library.json').read_text(encoding='utf8'))['templates']]
before=[]
for id in ids:
    assert (project/'web/quality-before'/f'{id}.jpg').exists()
    before.append(inspect(project/'web/quality-before'/f'{id}.mp4',300,10))
reel=inspect(media/'quality-reel.mp4',4500,150)
custom=[]
for style,title,frames,duration,sound in [('pixel','雨后的来信',240,8,False),('liquid','银色的呼吸',180,6,True)]:
    name=Path(browser['exports'][style]).name;file=root/'exports'/name;config=json.loads(file.with_suffix('.json').read_text(encoding='utf8'))['config']
    assert config['style']==style and config['title']==title and config['duration']==duration and config['count']==14 and config['seed']==22 and config['sound']==sound
    result=inspect(file,frames,duration,sound);result['submittedConfig']=config;custom.append(result)
result={'version':'0.10.0','story':'从工作台打开完整影片、比较旧版、编辑参数，经本地 API 生成对应 MP4，原故事草稿保留。','originalFilms':15,'newFilms':12,'preservedPreviousFilms':['3d-render','cel-boil','aurora-glass'],'defaultMediaReport':'effect-media-verification.json','browserPlayback':browser['films'],'before':before,'fullReel':reel,'customExports':custom,'qualityNote':'六时点帧已人工查看，见 collection-review-1/2/3.jpg；媒体、差异与播放检查不构成审美评分。'}
(project/'assets/collection-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
print('15 comparison videos, 150 s / 4500-frame reel, 12 browser playbacks, 2 custom browser exports verified.')
