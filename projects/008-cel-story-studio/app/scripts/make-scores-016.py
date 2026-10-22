"""Original restrained event scores, linked to the four authored timelines."""
import math, wave, subprocess
from pathlib import Path
import numpy as np
root=Path(__file__).resolve().parents[1]
sr=44100
t=np.arange(sr*10)/sr
for name in ['line-art-concert','line-art-garden','paperclip-anc','paperclip-prism']:
    a=np.zeros(len(t)); rng=np.random.default_rng(1601)
    def tone(at,f,dur=.7,vol=.12,kind='pluck'):
        global a
        u=t-at; gate=(u>=0)&(u<dur); v=np.maximum(0,u)
        if kind=='bow':
            env=(1-np.exp(-v*6))*np.minimum(1,np.maximum(0,dur-v)*3)
            signal=sum(np.sin(2*np.pi*f*h*v+.002*np.sin(v*31)*h)/(h**1.5) for h in range(1,7))
        else:
            env=(1-np.exp(-v*100))*np.exp(-v*5/dur)
            signal=np.sin(2*np.pi*f*v)+.3*np.sin(2*np.pi*f*2.006*v)
        a+=gate*env*signal*vol
    def whisper(at,dur,vol):
        nonlocal_dummy=0
        u=t-at; gate=(u>=0)&(u<dur); v=np.maximum(0,u)
        noise=rng.standard_normal(len(t)); noise=(noise+np.roll(noise,1)+np.roll(noise,2))/3
        a[:]+=gate*noise*(1-np.exp(-v*24))*np.exp(-v*4/dur)*vol
    if name.endswith('concert'):
        for at,f in [(.2,196),(1.1,293.66),(2.5,392),(3.1,440)]:tone(at,f,1,.1)
        tone(2.9,196,2.1,.055,'bow');tone(4.4,293.66,2.7,.05,'bow')
        for i,f in enumerate([392,493.88,587.33,783.99]):tone(6.1+i*.19,f,2.2,.075)
        tone(7.4,196,2,.045,'bow')
    elif name.endswith('garden'):
        for i in range(8):tone(1.05+i*.17,800+i*53,.18,.018)
        for at,f in [(2.8,220),(3.6,329.63),(4.2,392),(4.7,440)]:tone(at,f,.8,.07)
        for i,f in enumerate([523.25,659.25,783.99,1046.5]):tone(5.2+i*.23,f,2,.08)
        whisper(6.4,1.1,.012)
    elif name.endswith('anc'):
        env=np.minimum(1,t)*np.clip((6.4-t)/1.3,0,1)
        a+=(np.sin(2*np.pi*92*t)+.25*np.sin(2*np.pi*184*t))*env*.035
        for at in [1.6,2.05,2.5,3.0]:whisper(at,.13,.045)
        tone(4.8,330,.55,.06);tone(6.6,440,1.4,.09);tone(8.0,659.25,1.8,.06)
    else:
        tone(.2,220,1.1,.075);whisper(2,.8,.015)
        for i,f in enumerate([261.63,293.66,329.63,349.23,392,440,493.88]):tone(3.65+i*.2,f,1.6,.06)
        tone(7.6,523.25,2,.07);tone(8.0,783.99,1.7,.04)
    fade=np.clip(t/.2,0,1)*np.clip((10-t)/.65,0,1)
    a=np.tanh(a*1.3)*fade
    raw=root/'.cache'/f'{name}-raw.wav';raw.parent.mkdir(exist_ok=True)
    with wave.open(str(raw),'wb') as f:
        f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr)
        stereo=np.column_stack([a,np.roll(a,110)*.94]);f.writeframes((np.clip(stereo,-1,1)*32767).astype('<i2').tobytes())
    out=root/'public/effects'/f'score-{name}-016.wav'
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(raw),'-af','loudnorm=I=-19:TP=-2:LRA=8','-ar',str(sr),str(out)],check=True)
    print(out.name)
