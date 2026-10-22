"""Original event scores; not recorded actors or professional listening certification."""
from pathlib import Path
import wave,subprocess
import numpy as np
root=Path(__file__).resolve().parents[1];sr=44100;t=np.arange(sr*10)/sr
names=['cel-boil-moon','cel-boil-shelter','morph-voyage','morph-weekend','aurora-glass-darkroom','aurora-glass-rainmix']
for name in names:
    a=np.zeros(len(t));rng=np.random.default_rng(1701)
    def note(at,f,d=.8,v=.08):
        u=t-at;z=np.maximum(0,u);a[:]+=(u>=0)*(u<d)*(1-np.exp(-z*90))*np.exp(-z*4/d)*(np.sin(2*np.pi*f*z)+.17*np.sin(2*np.pi*f*2.005*z))*v
    def noise(at,d,v):
        u=t-at;z=np.maximum(0,u);n=rng.standard_normal(len(t));n=(n+np.roll(n,1)+np.roll(n,3))/3;a[:]+=(u>=0)*(u<d)*(1-np.exp(-z*25))*np.exp(-z*3/d)*n*v
    if name.endswith('moon'):
        for at,f in [(.3,659.25),(1.6,523.25),(2.75,392),(3.7,329.63),(4.55,261.63),(6.9,523.25),(7.3,783.99),(8,1046.5)]:note(at,f,1.4,.075)
        noise(2.8,.6,.02);noise(4.5,.18,.05)
    elif name.endswith('shelter'):
        rain=rng.standard_normal(len(t));rain=(rain+np.roll(rain,1))/2;a+=rain*.014*(1-.5*np.clip((t-4.1)/.9,0,1))
        for at,f in [(1.1,293.66),(2.5,392),(4.4,440),(5.9,587.33),(7.6,783.99),(8.0,659.25)]:note(at,f,1.5,.055)
        noise(2.5,.5,.025)
    elif name.endswith('voyage'):
        for at in [1.15,3.65,6]:noise(at,.5,.03)
        for at,f in [(.2,261.63),(2.5,392),(3.0,493.88),(5.05,523.25),(5.5,659.25),(7.45,783.99),(8.0,523.25)]:note(at,f,1.3,.08)
    elif name.endswith('weekend'):
        for at in np.arange(.1,1.3,.25):note(float(at),950,.08,.024)
        for at,f in [(1.28,329.63),(2.92,440),(3.5,523.25),(4.15,587.33),(6.1,659.25),(7.2,783.99),(8.1,440)]:note(at,f,1.3,.07)
        noise(4.15,.7,.018)
    elif name.endswith('darkroom'):
        for at in [1.8,2.35,4.7,6.7]:note(at,700,.13,.03)
        for at,f in [(.1,220),(2.5,329.63),(4.65,440),(7.3,523.25),(7.7,659.25),(8.2,783.99)]:note(at,f,2.0,.06)
    else:
        mix=np.clip((t-2.4)/3.1,0,1);mix=mix*mix*(3-2*mix)
        rain=rng.standard_normal(len(t));rain=(rain+np.roll(rain,1)+np.roll(rain,2))/3
        a+=rain*(.9-.42*mix)*.032
        a+=np.sin(2*np.pi*98*t)*(.15+.4*mix)*.06
        for at in [1,2.2,3.4,4.6,5.8,7,8.2]:note(at,783.99,.65,.025+np.clip((at-2.4)/3.1,0,1)*.05)
    a=np.tanh(a*1.4)*np.clip(t/.2,0,1)*np.clip((10-t)/.7,0,1)
    raw=root/'.cache'/f'{name}-017-raw.wav';raw.parent.mkdir(exist_ok=True)
    with wave.open(str(raw),'wb') as f:
        f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr);f.writeframes((np.column_stack([a,np.roll(a,95)*.95])*32767).astype('<i2').tobytes())
    out=root/'public/effects'/f'score-{name}-017.wav';subprocess.run(['ffmpeg','-v','error','-y','-i',str(raw),'-af','loudnorm=I=-19:TP=-2:LRA=8','-ar',str(sr),str(out)],check=True);print(out.name)
