"""Check final media and the actual browser -> API -> configuration -> export flow."""
from pathlib import Path
import hashlib,json,subprocess
from PIL import Image
root=Path(__file__).resolve().parents[1];project=root.parent;assets=project/'assets/review-012';media=project/'web/effect-examples'
def inspect(file,frames,duration,sound=True):
    m=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(file)],text=True));v=next(s for s in m['streams'] if s['codec_type']=='video');a=next((s for s in m['streams'] if s['codec_type']=='audio'),None)
    assert (v['width'],v['height'],v['r_frame_rate'],v['codec_name'],int(v['nb_frames']))==(1280,720,'30/1','h264',frames),file
    assert abs(float(m['format']['duration'])-duration)<.05 and bool(a)==sound,file
    subprocess.run(['ffmpeg','-v','error','-i',str(file),'-f','null','-'],check=True,capture_output=True)
    return {'file':file.relative_to(project).as_posix(),'frames':frames,'duration':float(m['format']['duration']),'audio':bool(a),'decode':'passed','sha256':hashlib.sha256(file.read_bytes()).hexdigest()}
library=json.loads((project/'web/effect-library.json').read_text(encoding='utf8'))['templates'];ids=[s['id'] for s in library if s['id'] not in ['3d-render','isometric']]
preserved=json.loads((assets/'preserved-hero-hashes.json').read_text(encoding='utf8'))
for id,sha in preserved.items():assert hashlib.sha256((media/f'{id}.mp4').read_bytes()).hexdigest()==sha,id
browser=json.loads((assets/'browser.json').read_text(encoding='utf8'))
assert len(browser['films'])==13 and {f['style'] for f in browser['films']}==set(ids)
assert all(f['ready']==4 and f['duration']>9.9 and not f['paused'] and not f['error'] for f in browser['films'])
assert browser['cards']==15 and all(i['loaded'] for i in browser['images']) and not browser['overflow']
assert not browser['consoleErrors']
custom=[]
for style,title,count,duration,sound in [('liquid','光滴的回声',3,4,False),('aurora-glass','晨光电台',14,6,True),('flat-vector','午后鲜橘',14,6,True)]:
    file=root/'exports'/Path(browser['exports'][style]).name;config=json.loads(file.with_suffix('.json').read_text(encoding='utf8'))['config']
    assert (config['style'],config['title'],config['count'],config['seed'],config['duration'],config['sound'])==(style,title,count,22,duration,sound),config
    row=inspect(file,duration*30,duration,sound);row['submittedConfig']=config;custom.append(row)
metadata=json.loads((assets/'liquid-render-metadata.json').read_text(encoding='utf8'))
assert metadata['scriptSha256']==hashlib.sha256((root/'scripts/liquid-scene.py').read_bytes()).hexdigest()
story=json.loads((assets/'story-retention.json').read_text(encoding='utf8'))
assert story['title']=='阳台上的小花' and story['character']=='小禾' and len(story['shots'])==5
assert '12 秒 / 5 镜头 / 24 FPS' in story['text']
# A real regression found in this pass: the tracking camera exposed the cream canvas outside the pixel scene.
for n in [20,115,175,285]:
    im=Image.open(assets/f'final-pixel-{n:03}.jpg').convert('RGB')
    for x in [0,1279]:
        empty=sum(1 for y in range(720) if max(abs(a-b) for a,b in zip(im.getpixel((x,y)),(244,237,223)))<8)
        assert empty/720<.05,(n,x,empty)
result={'version':'0.12.0','scope':{'redesigned':6,'focusedRevisions':7,'preservedPreviousFilms':2},
        'mediaReport':'../effect-media-verification.json','previous':[inspect(project/f'web/quality-before-012/{id}.mp4',300,10) for id in ids],
        'reels':[inspect(media/'recraft-reel.mp4',1800,60),inspect(media/'quality-reel.mp4',4500,150),inspect(media/'after-hours-reel.mp4',1350,45)],
        'customExports':custom,'browserPlayback':browser['films'],'material':metadata,'story':'story-retention.json',
        'visualReview':'final-review-0/1/2.jpg: actual film frames inspected; not an aesthetic score.'}
(assets/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8');print('13 browser playbacks, 13 previous films, three reels, three custom exports, two unchanged films and original story verified.')
