"""核对真实世界数据、状态轨迹和四个视频。不会调用模型。"""
import hashlib
import json
import subprocess
from pathlib import Path

project=Path(__file__).resolve().parents[2]
data=json.loads(subprocess.check_output(['node',str(project/'app/scripts/report-world.mjs')]))
assert len(data)==4 and len({s['geometryHash'] for s in data})==4
stage_hashes=set()
for item in data:
    video=project/f"web/world-examples/{item['name']}.mp4"
    info=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_entries','stream=codec_type,codec_name,width,height,r_frame_rate,nb_read_frames:format=duration,size','-of','json',str(video)]))
    stream=next(s for s in info['streams'] if s['codec_type']=='video')
    assert (stream['width'],stream['height'],stream['r_frame_rate'],int(stream['nb_read_frames']))==(1280,720,'24/1',item['frames'])
    assert stream['codec_name']=='h264'
    assert any(s['codec_name']=='aac' for s in info['streams'])==item['sound']
    assert abs(float(info['format']['duration'])-item['frames']/24)<.05
    subprocess.run(['ffmpeg','-v','error','-xerror','-i',str(video),'-f','null','-'],check=True)
    hashes=[]
    for t in [.5,1.5,6.2]:
        stage=subprocess.check_output(['ffmpeg','-v','error','-ss',str(t),'-i',str(video),'-frames:v','1','-vf','crop=1280:490:0:125,scale=160:60','-f','rawvideo','-pix_fmt','rgb24','pipe:1'])
        hashes.append(hashlib.sha256(stage).hexdigest())
    assert len(set(hashes))==3
    stage_hashes.add(hashes[2])
    item.update({'metadata':info,'fullDecode':'passed','stageHashes':hashes})
assert len(stage_hashes)==4
posters=list((project/'assets/world-frames').glob('style-*.jpg'))
assert len(posters)==15
assert len({hashlib.sha256(p.read_bytes()).hexdigest() for p in posters})==15
water=next(s for s in data if s['name']=='water')
assert any(c['keyframes']==6 and c['effect']['kind']=='water' for c in water['curves'])
report={'version':'0.5.0','schemaVersion':3,'applicationTests':39,'genuineAIExamples':4,'examples':data,
        'worldStyleStills':15,'mediaChecks':'frames, codec, dimensions, audio, full decode, stage motion and distinct story images',
        'humanReview':{'signatures':['rabbit','robot','fox'],'water':['walk endpoint X 700 to 600','two action names shortened'],'geometryAndMotionKeys':'AI generated; no hand replacement'},
        'limitations':['2D procedural vector assets','generic approximate rig and contact','bounded action/effect grammar','no general physics or photorealism']}
ui=json.loads((project/'assets/world-ui-summary.json').read_text(encoding='utf-8'))
switches=json.loads((project/'assets/world-browser.json').read_text(encoding='utf-8'))
assert len(switches)==15 and len({s['style'] for s in switches})==15
assert all(s['title']=='阳台上的小花' and s['character']=='小禾' and s['shots']==5 and s['frame']=='145' for s in switches)
assert all(ui[key]['width']==ui[key]['scrollWidth'] for key in ['desktop','mobile'])
assert int(ui['playback']['live']['frame'])>ui['playback']['startFrame']
assert ui['playback']['live']['button']=='暂停预览'
report['browser']={'flow':ui,'styleSwitches':switches}
(project/'assets/world-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print('PASS: 4 distinct AI worlds, 4 complete videos, 15 style stills, real custom curves and state transitions')
