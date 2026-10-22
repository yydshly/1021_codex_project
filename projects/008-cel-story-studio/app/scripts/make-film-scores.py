"""Three deterministic stereo scores with shot-specific events. No external samples."""
from pathlib import Path
import numpy as np, wave, subprocess
R=44100;N=R*10;out=Path(__file__).resolve().parents[1]/'public/effects'
rng=np.random.default_rng(912)
def score(name):
 a=np.zeros((N,2))
 def add(sig,start,pan=0,volume=1):
  j=int(start*R);n=min(len(sig),N-j)
  if n<=0:return
  a[j:j+n,0]+=sig[:n]*np.sqrt((1-pan)/2)*volume;a[j:j+n,1]+=sig[:n]*np.sqrt((1+pan)/2)*volume
 def note(f,start,dur=1.8,amp=.09,pan=0,bell=False):
  t=np.arange(int(dur*R))/R
  s=np.sin(2*np.pi*f*t)*np.exp(-t*(3 if bell else 1.5))+.24*np.sin(2*np.pi*f*2.003*t)*np.exp(-t*4)+.1*np.sin(2*np.pi*f*3.98*t)*np.exp(-t*6)
  env=np.minimum(1,t/.018)*np.minimum(1,(dur-t)/.2);add(s*env,start,pan,amp)
  add(s*env,start+.17,-pan,amp*.19);add(s*env,start+.33,pan,amp*.07)
 def rustle(start,dur=.3,amp=.04):
  t=np.arange(int(dur*R))/R;noise=rng.normal(0,1,len(t));hi=noise-np.convolve(noise,np.ones(40)/40,'same');add(hi*np.sin(np.pi*t/dur)**2,start,.1,amp)
 for j in range(4):
  chord=[[174.61,220,261.63,329.63],[146.83,196,246.94,293.66],[130.81,174.61,220,261.63],[174.61,220,293.66,349.23]][j]
  for k,f in enumerate(chord):note(f,j*2.5+k*.08,3.2,.025,(-1)**k*.4)
 if name=='studio':
  for start,f,pan in [(0,523.25,-.5),(.8,659.25,.4),(2.7,783.99,-.3),(4.4,659.25,.4),(6.1,880,-.2),(8.6,1046.5,.3)]:note(f,start,2.1,.075,pan,True)
  for st in [2.5,6.2,8.4]:rustle(st,.8,.012)
 elif name=='optical':
  for i in range(18):note([523.25,659.25,783.99,987.77][i%4],i*.5+.05,1.1,.028,np.sin(i)*.6,True)
  for st in [.3,.7,1.1,4.9,8.7]:rustle(st,.28,.025)
 else:
  for i in range(14):note([392,440,523.25,659.25,587.33,523.25,440][i%7],i*.62+.1,1.1,.045,np.sin(i*.7)*.35)
  for st in [2.35,6.3,8.5]:note(1318.5,st,.7,.06,.4,True)
  for st in np.arange(2.35,6.3,.22):rustle(st,.025,.022)
  rustle(7.4,.5,.045);rustle(8.15,.25,.055)
  rain=rng.normal(0,1,N);rain=np.convolve(rain,np.ones(5)/5,'same');add(rain,0,0,.014)
 fade=np.minimum(1,np.arange(N)/(R*.18))*np.minimum(1,(N-1-np.arange(N))/(R*.5));a*=fade[:,None]
 a/=max(1,np.max(np.abs(a))/.8)
 raw=out/f'.score-{name}-raw.wav';dest=out/f'score-{name}.wav'
 with wave.open(str(raw),'wb') as w:w.setparams((2,2,R,N,'NONE','not compressed'));w.writeframes((a*32767).astype('<i2').tobytes())
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(raw),'-af','loudnorm=I=-16:TP=-1.5:LRA=8','-ar',str(R),str(dest)],check=True)
 raw.unlink();print(dest.name)
for name in ['studio','optical','post']:score(name)
