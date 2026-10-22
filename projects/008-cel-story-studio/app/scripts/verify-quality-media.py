"""Verify the actual v0.9 outputs; visual quality is assessed separately."""
import argparse,json,subprocess,re,wave
from pathlib import Path
import numpy as np
ap=argparse.ArgumentParser();ap.add_argument('--job',required=True);a=ap.parse_args()
assert re.fullmatch(r'[a-f0-9-]{36}',a.job)
p=Path(__file__).resolve().parents[2];app=p/'app';clips=[]
def media(rel,frames):
 path=p/'web'/rel
 data=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(path)],text=True))
 v=next(s for s in data['streams'] if s['codec_type']=='video');au=next(s for s in data['streams'] if s['codec_type']=='audio')
 assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==(1280,720,'30/1',frames)
 assert v['codec_name']=='h264' and au['codec_name']=='aac'
 subprocess.run(['ffmpeg','-v','error','-i',str(path),'-f','null','-'],check=True,capture_output=True)
 clips.append({'file':rel,'frames':frames,'fps':30,'size':[1280,720],'seconds':float(data['format']['duration']),'video':'h264','audio':'aac','decode':'passed'})
for style in ['3d-render','aurora-glass','cel-boil']:media(f'effect-examples/{style}.mp4',300)
media('effect-examples/quality-reel.mp4',900)
media('creative-examples/amber-studio-4s.mp4',120)
submitted=json.loads((app/'exports'/f'{a.job}.json').read_text(encoding='utf8'))['config']
saved=json.loads((app/'.cache/quality-ui-config.json').read_text(encoding='utf8'))
published=json.loads((p/'web/creative-examples/amber-studio-4s.json').read_text(encoding='utf8'))
assert submitted==saved==published
assert submitted['count']==10 and submitted['detail']==.8 and submitted['seed']==43 and submitted['duration']==4
assert len(list((app/'exports'/f'{a.job}-frames').glob('*.jpg')))==120
scores=[]
for name in ['studio','optical','post']:
 with wave.open(str(app/'public/effects'/f'score-{name}.wav')) as w:
  assert w.getnchannels()==2 and w.getframerate()==44100
  samples=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(float)/32768
 rms=float(np.sqrt(np.mean(samples*samples)));peak=float(np.max(np.abs(samples)));assert .02<rms<.35 and peak<.98
 scores.append({'score':name,'channels':2,'sampleRate':44100,'rms':rms,'peak':peak})
result={'version':'0.9.0','scope':'three recrafted films; other twelve unchanged','clips':clips,'customWebJob':a.job,'customConfigurationMatches':True,'customCyclesFrames':120,'scores':scores,'qualityAssessment':'Technical checks do not establish aesthetic excellence. See actual films, before/after comparisons and temporal review sheets.'}
(p/'assets/quality-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
print('3 complete films + 30s reel + custom Cycles web export decoded; configuration and stereo scores verified.')
