"""Original event-aligned scores for the six new designs and the courier's wind event."""
from pathlib import Path
import importlib.util,json,subprocess
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('hero_score',ROOT/'scripts/make-hero-scores.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
plans={
 'flat-vector':([.3,2.5,5.6,7.6],60,.5,'citrus cut / slices / pouring / title'),
 'line-art':([.15,2.7,5.8,8.2],53,.75,'pen / breach / stars / close'),
 'morph':([.2,2.2,5.3,7.4],57,.5,'fish / bird / leaf / release'),
 'paperclip':([.2,3.2,6.4,8.1],60,.625,'collect / battery / night lights / close'),
 'hanazi':([.1,2.5,3.0,5.3,8.2],55,.5,'pour / freeze / reaction / laugh / end'),
 'optical':([0,.55,1.1,3.4,4.5,6.8,8.3],57,.625,'player / tiles / docking / orb / end'),
 'post':([.1,2.9,4.5,6.3,8.4],60,.625,'ride / wind / catch / delivery / close'),
}
report=[]
for index,(name,(events,root,beat,description)) in enumerate(plans.items()):
 s=m.Score(1200+index);calm=name in ['line-art','optical']
 for j,chord in enumerate([[0,7,12],[5,9,12],[7,10,14],[0,7,16]]):s.pad(j*2.5,[root+n for n in chord],2.5,.024,airy=calm)
 notes=[0,4,7,12,9,7,4,2,0,7,12,14,12,9,7,0]
 for j,n in enumerate(notes):
  at=.2+j*beat
  if at>9.2:break
  s.pluck(at,root+12+n,.43,.08 if calm else .11,pan=(j%3-1)*.3)
  if not calm and j%2==0:s.thump(at-.1,.13)
 for j,at in enumerate(events):
  s.chime(at,root+19+(j%3)*3,.65,.09,pan=(j%3-1)*.4,material='metal')
  if j:s.brush(max(0,at-.18),.25,.05,rising=True)
 if name=='flat-vector':s.brush(5.6,1.0,.13);s.thump(7.6,.19)
 if name=='line-art':s.brush(2.7,1.4,.12);s.brush(5.8,.8,.05,metallic=True)
 if name=='post':s.brush(2.9,1.4,.16,rising=True);s.thump(4.5,.12)
 if name=='hanazi':
  for i in range(5):s.pluck(3+i*.07,77-i*2,.18,.13,dry=True)
 audio=s.render(pauses=[(2.5,2.95,.035)] if name=='hanazi' else [])
 raw=ROOT/f'.cache/recraft-{name}.wav';m.write_wav(raw,audio);before=m.loudness(raw)
 filt=f"loudnorm=I=-16:TP=-1.8:LRA=9:measured_I={before['input_i']}:measured_TP={before['input_tp']}:measured_LRA={before['input_lra']}:measured_thresh={before['input_thresh']}:offset={before['target_offset']}:linear=true"
 final=ROOT/f'public/effects/score-{name}.wav';subprocess.run(['ffmpeg','-v','error','-y','-i',str(raw),'-af',filt,'-ar','44100','-c:a','pcm_s16le',str(final)],check=True)
 after=m.loudness(final);assert abs(float(after['input_i'])+16)<1.0 and float(after['input_tp'])<=-1.4
 report.append({'file':final.name,'events':events,'sequence':description,'LUFS':after['input_i'],'truePeakDBTP':after['input_tp'],'source':'Original deterministic synthesis, no external samples'})
(ROOT.parent/'assets/review-012/scores.json').write_text(json.dumps(report,indent=2),encoding='utf8');print('Seven original stereo scores aligned and normalized.')
