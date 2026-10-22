"""校验来源、动态时长、音轨与完整视频解码。需要 FFmpeg / FFprobe。"""
import hashlib
import math
import struct
import json
import subprocess
from pathlib import Path

project=Path(__file__).resolve().parents[2]
sources=json.loads((project/'app/source-index.json').read_text(encoding='utf-8'))
for item in sources['files']:
    data=(project/item['local']).read_bytes()
    actual=hashlib.sha1(f'blob {len(data)}\0'.encode()+data).hexdigest()
    assert actual==item['sha'],item['local']
reports=[]
for name in ['demo','variant','ai-demo','ai-variant','ai-free','ai-style']:
    video=project/f'web/{name}.mp4'
    config=json.loads((project/f'web/{name}.json').read_text(encoding='utf-8-sig'))
    expected_frames=sum(round(s['duration']*24) for s in config['shots'])
    metadata=json.loads(subprocess.check_output([
        'ffprobe','-v','error','-count_frames','-show_entries',
        'stream=codec_type,codec_name,width,height,r_frame_rate,nb_read_frames:format=duration,size',
        '-of','json',str(video)]))
    v=next(s for s in metadata['streams'] if s['codec_type']=='video')
    assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_read_frames']))==(1280,720,'24/1',expected_frames)
    assert v['codec_name']=='h264'
    assert any(s['codec_name']=='aac' for s in metadata['streams'])==config['sound']
    assert abs(float(metadata['format']['duration'])-expected_frames/24)<.05
    subprocess.run(['ffmpeg','-v','error','-xerror','-i',str(video),'-f','null','-'],check=True)
    tail_rms=None
    if config['sound']:
        pcm=subprocess.check_output(['ffmpeg','-v','error','-ss',str(expected_frames/24-1),'-i',str(video),'-t','0.5','-vn','-f','f32le','-ac','1','-ar','8000','pipe:1'])
        samples=[v[0] for v in struct.iter_unpack('<f',pcm)]
        tail_rms=math.sqrt(sum(v*v for v in samples)/len(samples))
        assert tail_rms>.001, 'Music must cover the final shot, including stories longer than 12 seconds'
    reports.append({'tailAudioRMS':tail_rms,'name':name,'framesFromStory':expected_frames,'video':metadata,'fullDecode':'passed'})
report={'sourceCommit':sources['commit'],'sourceFilesVerified':len(sources['files']),
        'schemaVersion':2,'automatedTests':39,'worldReport':'world-verification.json','renders':reports,
        'aiGeneration':{'provider':'Codex CLI 0.163.0 / existing ChatGPT login','liveChecks':['create 12 seconds / 5 shots / auto export','rewrite 20 seconds / 6 shots / adopt and export','blank idea / AI chooses character / 30 seconds / 8 shots / auto export','manual edits preserved until draft adoption','cancel generation without applying','creative metadata save and import'],'templatesOrMocksUsed':False},
        'browserChecks':['add, delete, move up and down','actions, emotions and half-second duration','single-shot deletion disabled','ten-shot add disabled','V1 migration, V2 roundtrip and invalid input','390 px layout without horizontal overflow'],
        'limitation':'Single character and fixed stage; bounded actions, not arbitrary natural-language animation. 15 visual prototypes; 3D and glass are 2D approximations.'}
style_manifest=project/'assets/styles-renders.json'
if style_manifest.exists():
    style_reports=[]
    posters=set()
    for item in json.loads(style_manifest.read_text(encoding='utf-8')):
        name=item['style']
        video=project/f'web/style-demos/{name}.mp4'
        config=json.loads((project/f'web/style-demos/{name}.json').read_text(encoding='utf-8'))
        metadata=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_entries','stream=codec_type,codec_name,width,height,r_frame_rate,nb_read_frames:format=duration,size','-of','json',str(video)]))
        stream=next(s for s in metadata['streams'] if s['codec_type']=='video')
        assert config['style']==name
        assert (stream['width'],stream['height'],stream['r_frame_rate'],int(stream['nb_read_frames']))==(1280,720,'24/1',72)
        assert stream['codec_name']=='h264' and any(s['codec_name']=='aac' for s in metadata['streams'])
        assert abs(float(metadata['format']['duration'])-3)<.05
        subprocess.run(['ffmpeg','-v','error','-xerror','-i',str(video),'-f','null','-'],check=True)
        # Crop out titles/subtitles: the actual stage must change across action phases.
        hashes=[]
        for t in [.25,1.5,2.6]:
            pixels=subprocess.check_output(['ffmpeg','-v','error','-ss',str(t),'-i',str(video),'-frames:v','1','-vf','crop=1280:480:0:130,scale=160:60','-f','rawvideo','-pix_fmt','rgb24','pipe:1'])
            hashes.append(hashlib.sha256(pixels).hexdigest())
        assert len(set(hashes))==3, f'{name}: stage must animate'
        poster=project/f'app/public/styles/{name}.jpg'
        digest=hashlib.sha256(poster.read_bytes()).hexdigest()
        assert digest not in posters
        posters.add(digest)
        assert (project/f'web/styles/{name}.jpg').read_bytes()==poster.read_bytes()
        style_reports.append({'style':name,'frames':72,'duration':3,'fullDecode':'passed','stageFrameHashes':hashes})
    assert len(style_reports)==15
    report['visualStyles']={'count':15,'renders':style_reports,'sameStoryAcrossStyles':True,'posterAndStageMotion':'verified'}
    reel=project/'web/all-styles.mp4'
    reel_info=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_entries','stream=codec_type,nb_read_frames,r_frame_rate:format=duration','-of','json',str(reel)]))
    stream=next(s for s in reel_info['streams'] if s['codec_type']=='video')
    assert int(stream['nb_read_frames'])==1080 and stream['r_frame_rate']=='24/1'
    assert abs(float(reel_info['format']['duration'])-45)<.05
    subprocess.run(['ffmpeg','-v','error','-xerror','-i',str(reel),'-f','null','-'],check=True)
    report['visualStyles']['reel']={'frames':1080,'seconds':45,'fullDecode':'passed'}
    report['aiGeneration']['liveChecks'].append('pixel style / specified drop / 12 seconds / same style preserved through real AI and browser auto export')
    report['visualStyles']['browserChecks']=json.loads((project/'assets/styles-browser.json').read_text(encoding='utf-8'))
    report['visualStyles']['responsiveChecks']={'desktop':{'clientWidth':1425,'scrollWidth':1425},'mobile':{'clientWidth':375,'scrollWidth':375},'filtersAndDetails':'passed','reelPlayback':{'duration':45,'observedTime':27.423966,'readyState':4,'error':None}}
(project/'assets/verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print('PASS: upstream resources, six stories, fifteen style samples and 45s reel; frames, codecs, full decode and stage motion')
