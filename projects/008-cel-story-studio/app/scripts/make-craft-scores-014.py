"""Original 10-second event scores. No recordings, external music, or AI vocals."""
from pathlib import Path
import importlib.util,json,subprocess,re
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('hero_score',ROOT/'scripts/make-hero-scores.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def loudness(file):
 result=subprocess.run(['ffmpeg','-v','info','-threads','2','-filter_threads','1','-filter_complex_threads','1','-i',str(file),'-af','loudnorm=I=-16:TP=-1.8:LRA=9:print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
 match=re.search(r'\{\s*"input_i".*?\}',result.stderr,re.S)
 if not match:raise RuntimeError(result.stderr[-1000:])
 return json.loads(match.group())
plans={
 'wind-014':([.20,1.05,1.70,2.18,3.45,4.65,5.55,7.90],62,'seed / inhale / compress / blow / tumble / reach / grip / title'),
 'morph-014':([.2,1.15,2.65,4.15,5.7,7.4,8.6],60,'drop / umbrella / inflate / balloon / kite / ribbon / poster'),
 'bauhaus-014':([.15,.75,1.55,2.65,3.45,4.55,5.25,6.75,8.4],53,'circle / steps / drop / seesaw / pivot / wheel / cabins / reveal / lock'),
 'prism-014':([.15,1.35,2.9,4.15,5.7,7.3,8.5],57,'light / card / lens / magnify / spectrum / release / poster')
 ,'hanazi-014':([.1,1.8,2.65,3.8,4.35,7.55],62,'confidence / doubt / accident / freeze / breakout / poster')
 ,'citrus-014':([.1,1.30,2.5,4.65,5.15,7.75],60,'whole / cut / segments / grip / squeeze / poster')
 ,'line-014':([.1,2.75,3.35,5.0,8.08],53,'pen / breach / breath / stars / gold fill')
 ,'solar-014':([.1,1.15,2.25,4.05,5.85,7.35,8.5],60,'question / trace back / photovoltaic / chemical storage / night / overview')
 ,'isometric-014':([.1,.75,2.37,3.6,4.85,5.17,5.49,5.9,8.65],55,'feed / press / contact / gears / organ1 / organ2 / organ3 / choir / record')
 ,'liquid-014':([.1,1.3,2.5,4.0,6.0,6.3,8.3],53,'drop / impact / crown / stretch / neck break / recoil / bridge')
 ,'collage-014':([.1,1.1,2.3,3.8,5.2,6.7,8.1,9.1],57,'tune / click / cone / ladder / lantern / chorus / close / cover')
}
report=[]
for i,(name,(events,root,description)) in enumerate(plans.items()):
 s=m.Score(1400+i)
 for j,notes in enumerate([[0,7,12],[5,9,12],[7,10,14],[0,7,16]]):s.pad(j*2.5,[root+n for n in notes],2.5,.02,airy=True)
 for j,n in enumerate([0,7,12,9,4,2,7,14,12,9,7,0]):
  s.pluck(.2+j*.69,root+12+n,.44,.08,(j%3-1)*.3,dry=name=='bauhaus-014')
 for j,at in enumerate(events):
  s.chime(at,root+19+(j%3)*3,.43,.085,(j%3-1)*.4)
  if name in ['bauhaus-014','isometric-014']:s.thump(at,.13)
 if name=='wind-014':
  s.brush(1.12,.70,.08,rising=True);s.brush(2.18,1.26,.23,pan=.3)
  for at in [3.45,3.75,4.05,4.35]:s.brush(at,.20,.09,pan=-.4)
  s.thump(5.52,.10);s.pad(5.55,[62,69,74,81],3.8,.036,True)
 if name=='morph-014':
  for at,dur in [(1.05,.5),(2.55,.9),(4.05,.8),(5.55,.8),(7.35,.8)]:s.brush(at,dur,.09,rising=True)
 if name=='prism-014':
  for at in [2.9,4.15,5.7]:s.brush(at,.7,.07,metallic=True)
 if name=='hanazi-014':
  for j in range(5):s.pluck(2.65+j*.06,83-j*3,.15,.13,dry=True)
  s.thump(4.35,.28);s.brush(4.35,.5,.15)
 if name=='citrus-014':s.brush(1.3,.24,.14);s.brush(5.15,1.85,.10)
 if name=='line-014':s.brush(.1,1.8,.035);s.brush(2.75,.85,.12);s.brush(8.08,.5,.05,metallic=True)
 if name=='solar-014':
  for at in [1.15,4.05,5.85,7.35]:s.brush(at,.46,.06,rising=True)
 if name=='liquid-014':s.thump(1.3,.21,low=True);s.brush(1.3,.65,.13);s.brush(4,1.1,.08,rising=True);s.chime(6,84,.4,.14)
 if name=='collage-014':
  for at in [1.1,2.3,3.8,8.1,9.1]:s.brush(at,.22,.09)
 audio=s.render(pauses=[(1.92,2.16,.12)] if name=='wind-014' else [(3.85,4.32,.05)] if name=='hanazi-014' else [])
 raw=ROOT/f'.cache/{name}.wav';m.write_wav(raw,audio);before=loudness(raw)
 filt=f"loudnorm=I=-16:TP=-1.8:LRA=9:measured_I={before['input_i']}:measured_TP={before['input_tp']}:measured_LRA={before['input_lra']}:measured_thresh={before['input_thresh']}:offset={before['target_offset']}:linear=true"
 final=ROOT/f'public/effects/score-{name}.wav'
 subprocess.run(['ffmpeg','-v','error','-threads','2','-filter_threads','1','-filter_complex_threads','1','-y','-i',str(raw),'-af',filt,'-ar','44100','-c:a','pcm_s16le',str(final)],check=True)
 after=loudness(final);report.append({'file':final.name,'events':events,'sequence':description,'LUFS':after['input_i'],'truePeakDBTP':after['input_tp'],'subjectiveListening':'not verified','source':'Original deterministic synthesis'})
target=ROOT.parent/'assets/review-014/scores.json';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(json.dumps(report,indent=2),encoding='utf8')
print(f'{len(plans)} scores synthesized; loudness report written. Listening is not asserted.')
