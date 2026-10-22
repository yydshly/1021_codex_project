"""从 0.13 最终影片提取真关键帧，更新三种连播并验证媒体。

python scripts/package-trio-013.py

不调用场景绘制或重渲染原片；九张图均从最终 H.264 视频的精确帧提取。
合辑保留各片自己的声音。每个输入均按视频帧和音频样本裁齐后再连接，
避免 AAC 编码填充在十五段之间累积。所有 FFmpeg 编解码/滤镜限制两线程。
"""
from pathlib import Path
import hashlib
import json
import re
import subprocess
from datetime import datetime, timezone

ROOT=Path(__file__).resolve().parents[1]
PROJECT=ROOT.parent
MEDIA=PROJECT/'web/effect-examples'
OUT=ROOT/'public/effects'
CACHE=ROOT/'.cache/trio-package-013'
REVIEW=PROJECT/'assets/review-013'
TRIO=['synthwave','pixel','hud']
IDS=['flat-vector','line-art','isometric','3d-render','cel-boil','collage','liquid',
     'morph','bauhaus','synthwave','aurora-glass','hanazi','paperclip','pixel','hud']
FRAMES={'synthwave':[30,185,270],'pixel':[30,110,280],'hud':[30,115,270]}


def sha(file):return hashlib.sha256(file.read_bytes()).hexdigest()


def ffmpeg(args):
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y',
                    '-filter_threads','2','-filter_complex_threads','2',*args],check=True)


def old_versions():
    preserved=json.loads((REVIEW/'preserved-before.json').read_text(encoding='utf8'))
    result=[]
    for item in preserved:
        actual=sha(PROJECT/item['path'])
        assert actual==item['sha256'],('旧版本哈希发生变化',item['path'],actual)
        result.append({**item,'verified':True})
    return result


def extract_frames():
    result=[]
    for style,frames in FRAMES.items():
        source=MEDIA/f'{style}.mp4'
        for frame in frames:
            target=OUT/f'trio-{style}-{frame:03d}.jpg'
            ffmpeg(['-threads','2','-i',str(source),'-vf',f'select=eq(n\\,{frame})',
                    '-fps_mode','vfr','-frames:v','1','-q:v','2','-threads','2',str(target)])
            assert target.stat().st_size>1000
            result.append({'file':str(target.relative_to(ROOT)).replace('\\','/'),
                           'source':str(source.relative_to(PROJECT)).replace('\\','/'),
                           'frame':frame,'seconds':frame/30,'sha256':sha(target),
                           'method':'FFmpeg 精确帧选择；提取自最终 MP4，不是独立重画的设计稿'})
            print(f'Frame: {style} / {frame}',flush=True)
    return result


def join_films(name,styles,seconds=10,highlights=False):
    args=[];filters=[];concat=[];chapters=[]
    for index,style in enumerate(styles):
        args+=['-threads','2','-i',str(MEDIA/f'{style}.mp4')]
        start=5 if highlights and style in TRIO else 2 if highlights else 0
        start_frame=round(start*30);end_frame=start_frame+round(seconds*30)
        vf=f'[{index}:v]trim=start_frame={start_frame}:end_frame={end_frame},setpts=N/(30*TB),setsar=1,format=yuv420p'
        af=f'[{index}:a]aresample=48000,atrim=start_sample={start*48000}:end_sample={(start+seconds)*48000},asetpts=PTS-STARTPTS,apad=whole_len={seconds*48000},atrim=end_sample={seconds*48000}'
        if highlights:
            vf+=f',fade=t=in:d=0.08,fade=t=out:st={seconds-.1}:d=0.1'
            af+=f',afade=t=in:d=0.03,afade=t=out:st={seconds-.08}:d=0.08'
        filters+=[vf+f'[v{index}]',af+f'[a{index}]']
        concat+=[f'[v{index}][a{index}]']
        config=json.loads((MEDIA/f'{style}.json').read_text(encoding='utf8'))
        chapters.append({'style':style,'title':config['title'],'start':index*seconds,
                         'end':(index+1)*seconds,'sourceRange':[start,start+seconds]})
    filters+=[''.join(concat)+f'concat=n={len(styles)}:v=1:a=1[v][a]']
    total=seconds*len(styles);target=CACHE/f'{name}.mp4'
    print(f'Encoding {name}: {len(styles)} films / {total}s',flush=True)
    ffmpeg([*args,'-filter_complex',';'.join(filters),'-map','[v]','-map','[a]',
            '-r','30','-frames:v',str(total*30),'-t',str(total),
            '-c:v','libx264','-preset','fast','-crf','16','-pix_fmt','yuv420p','-threads','2',
            '-c:a','aac','-ar','48000','-ac','2','-b:a','192k','-movflags','+faststart',str(target)])
    result=verify(target,total)
    final=MEDIA/f'{name}.mp4';target.replace(final)
    # Preserve the chapter formats used by the existing workbench.
    if name=='after-hours-reel':
        payload={'title':'十五支原创作品精选','duration':total,'chapters':[
            {'at':row['start'],'style':row['style'],'title':row['title'],'sourceRange':row['sourceRange']}
            for row in chapters]}
    else:payload=chapters
    (MEDIA/f'{name}.chapters.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf8')
    result['file']=str(final.relative_to(PROJECT)).replace('\\','/')
    result['sha256']=sha(final);result['chapters']=chapters
    return result


def verify(file,expected):
    metadata=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams',
        '-show_format','-of','json',str(file)],text=True))
    v=next(s for s in metadata['streams'] if s['codec_type']=='video')
    a=next(s for s in metadata['streams'] if s['codec_type']=='audio')
    assert v['codec_name']=='h264' and (v['width'],v['height'])==(1280,720)
    assert v['r_frame_rate']=='30/1' and v['avg_frame_rate']=='30/1'
    assert int(v['nb_frames'])==expected*30,(file,v['nb_frames'])
    assert abs(float(v['duration'])-expected)<.02
    assert abs(float(metadata['format']['duration'])-expected)<.05
    assert a['codec_name']=='aac' and int(a['channels'])==2 and a['sample_rate']=='48000'
    decoded=subprocess.run(['ffmpeg','-v','error','-threads','2','-i',str(file),
        '-map','0:v:0','-map','0:a:0','-threads','2','-f','null','-'],capture_output=True,check=True)
    assert not decoded.stderr,decoded.stderr.decode(errors='replace')
    return {'file':file.name,'expectedSeconds':expected,'formatSeconds':float(metadata['format']['duration']),
            'videoSeconds':float(v['duration']),'frames':int(v['nb_frames']),'fps':v['r_frame_rate'],
            'size':[v['width'],v['height']],'videoCodec':v['codec_name'],'pixelFormat':v['pix_fmt'],
            'audioCodec':a['codec_name'],'audioProfile':a.get('profile'),
            'audioChannels':a['channels'],'audioSampleRate':int(a['sample_rate']),
            'fullVideoAndAudioDecode':'passed','bytes':file.stat().st_size}


def loudness(file):
    p=subprocess.run(['ffmpeg','-hide_banner','-threads','2','-i',str(file),'-af',
        'loudnorm=I=-16:TP=-2:LRA=11:print_format=json','-threads','2','-f','null','-'],
        capture_output=True,text=True,check=True)
    found=re.search(r'\{\s*"input_i".*?\}',p.stderr,re.S)
    if not found:raise RuntimeError(p.stderr[-2000:])
    measured=json.loads(found.group())
    return {'LUFS':float(measured['input_i']),'truePeakDBTP':float(measured['input_tp']),
            'loudnessRangeLU':float(measured['input_lra']),
            'method':'FFmpeg loudnorm 测量成片现有混音；此步骤不修改原片声音'}


def main():
    CACHE.mkdir(parents=True,exist_ok=True);OUT.mkdir(parents=True,exist_ok=True);REVIEW.mkdir(parents=True,exist_ok=True)
    preserved=old_versions()
    protected={str((MEDIA/name).relative_to(PROJECT)).replace('\\','/'):sha(MEDIA/name)
               for name in ['recraft-reel.mp4','hero-reel.mp4']}
    source_hashes={style:sha(MEDIA/f'{style}.mp4') for style in TRIO}
    frames=extract_frames()
    films=[]
    for style in TRIO:
        file=MEDIA/f'{style}.mp4';result=verify(file,10)
        result.update({'style':style,'file':str(file.relative_to(PROJECT)).replace('\\','/'),
                       'sha256':sha(file),'loudness':loudness(file)})
        films.append(result);print(f'Verified film: {style} / {result["loudness"]}',flush=True)
    reels=[join_films('trio-reel-013',TRIO),join_films('quality-reel',IDS),
           join_films('after-hours-reel',IDS,3,True)]
    old_versions()
    for relative,before in protected.items():assert sha(PROJECT/relative)==before,relative
    for style,before in source_hashes.items():assert sha(MEDIA/f'{style}.mp4')==before,style
    report={'version':'0.13','verifiedAtUTC':datetime.now(timezone.utc).isoformat(),
            'source':'最终工作台模板 MP4；未调用独立设计稿冒充成片',
            'keyframes':frames,'films':films,'reels':reels,'preservedBefore':preserved,
            'protectedReelsUnchanged':[{'file':p,'sha256':h,'verified':True} for p,h in protected.items()],
            'verifiedSourceFilmsUnchanged':True,'ffmpegThreads':2,
            'audioConcat':'每片按 48000 Hz 样本数裁齐，保留各片原混音；精选片段仅加首尾淡化，无替换音乐'}
    (REVIEW/'media.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
    print('Verified: nine real keyframes, three complete films, 30/150/45-second reels, nine preserved files.',flush=True)


if __name__=='__main__':main()
