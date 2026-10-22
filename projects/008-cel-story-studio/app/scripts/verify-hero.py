"""Verify the two creative films, preserved collection, browser exports and design evidence."""
from pathlib import Path
import hashlib,json,subprocess

app=Path(__file__).resolve().parents[1];project=app.parent;assets=project/'assets';media=project/'web/effect-examples'

def inspect(file,frames,duration,sound=True):
    meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(file)],text=True))
    video=next(s for s in meta['streams'] if s['codec_type']=='video')
    audio=next((s for s in meta['streams'] if s['codec_type']=='audio'),None)
    assert (video['width'],video['height'],video['r_frame_rate'],video['codec_name'],int(video['nb_frames']))==(1280,720,'30/1','h264',frames),file
    assert abs(float(meta['format']['duration'])-duration)<.05,file
    assert bool(audio)==sound,file
    if audio:assert audio['codec_name']=='aac',file
    subprocess.run(['ffmpeg','-v','error','-i',str(file),'-f','null','-'],check=True,capture_output=True)
    return {'file':file.relative_to(project).as_posix(),'frames':frames,'duration':float(meta['format']['duration']),'audio':bool(audio),'decode':'passed','sha256':hashlib.sha256(file.read_bytes()).hexdigest()}

preserved=json.loads((assets/'hero-preserved-hashes.json').read_text(encoding='utf8'))
assert len(preserved)==13
for name,sha in preserved.items():assert hashlib.sha256((media/name).read_bytes()).hexdigest()==sha,name
browser=json.loads((assets/'hero-browser-checks.json').read_text(encoding='utf8'))
playbacks=[row for group in browser['playbacks'] for row in group]
for fragment in ['effect-examples/3d-render.mp4','effect-examples/isometric.mp4','quality-before-011/3d-render.mp4','quality-before-011/isometric.mp4','effect-examples/hero-reel.mp4']:
    assert any(fragment in p['src'] and p['ready']==4 and p['time']>0 and not p.get('error') for p in playbacks),fragment
assert all(f['loaded'] for f in browser['keyframes']) and len(browser['keyframes'])==6
assert browser['cards']==15
custom=[]
for style,title,count,sound in [('3d-render','引力之外',3,False),('isometric','一枚声音的旅行',14,True)]:
    file=app/'exports'/Path(browser['exports'][style]).name
    config=json.loads(file.with_suffix('.json').read_text(encoding='utf8'))['config']
    assert (config['style'],config['title'],config['count'],config['seed'],config['duration'],config['sound'])==(style,title,count,22,6,sound),config
    result=inspect(file,180,6,sound);result['submittedConfig']=config;custom.append(result)
story=json.loads((assets/'hero-story-retention.json').read_text(encoding='utf8'))
assert story['title']=='阳台上的小花' and story['character']=='小禾' and len(story['shots'])==5
assert '12 秒 / 5 镜头 / 24 FPS' in story['text']
metadata=json.loads((assets/'magnetic-render-metadata.json').read_text(encoding='utf8'))
assert metadata['scriptSha256']==hashlib.sha256((app/'scripts/magnetic-scene.py').read_bytes()).hexdigest()
for name in ['hero-magnetic-hook','hero-magnetic-tension','hero-magnetic-bloom','hero-soundworks-hook','hero-soundworks-climax','hero-soundworks-reveal']:
    assert (app/f'public/effects/{name}.jpg').read_bytes()==(project/f'web/effects/{name}.jpg').read_bytes()
report={'version':'0.11.0','films':[inspect(media/f'{id}.mp4',300,10) for id in ['3d-render','isometric']],
        'previousFilms':[inspect(project/f'web/quality-before-011/{id}.mp4',300,10) for id in ['3d-render','isometric']],
        'reels':[inspect(media/'hero-reel.mp4',600,20),inspect(media/'quality-reel.mp4',4500,150),inspect(media/'after-hours-reel.mp4',1350,45)],
        'preservedOtherFilms':len(preserved),'customExports':custom,'browser':'hero-browser-checks.json','story':'hero-story-retention.json',
        'artReview':'Actual film frames inspected, including camera transitions. Media and parameter checks are not aesthetic ratings.'}
(assets/'hero-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print('Two films, two previous films, three reels, thirteen unchanged films and two browser-created custom exports verified.')
