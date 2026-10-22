"""原创循环音乐与独立动作音效。48 kHz，无外部采样。"""
from pathlib import Path
import wave
import numpy as np
rate=48000
folder=Path(__file__).resolve().parent.parent/'public'
def note(freq,length=.5):
    t=np.arange(round(length*rate))/rate
    envelope=np.exp(-t*9)*(1-np.exp(-t*180))*np.minimum(1,(length-t)*40)
    return (np.sin(2*np.pi*freq*t)+.25*np.sin(2*np.pi*freq*2.01*t))*envelope

def write(name,data):
    data=np.asarray(data)
    if data.ndim==1:data=np.column_stack([data,data])
    data*=.8/max(.8,np.max(np.abs(data)))
    with wave.open(str(folder/name),'wb') as stream:
        stream.setnchannels(2);stream.setsampwidth(2);stream.setframerate(rate)
        stream.writeframes((np.clip(data,-1,1)*32767).astype('<i2').tobytes())

track=np.zeros((rate*8,2))
scale=[523.25,659.25,783.99,880,783.99,659.25,587.33,659.25]
for i in range(16):
    at=round((i*.5+.03)*rate);signal=note(scale[i%8],.46)*.16
    track[at:at+len(signal),0]+=signal*(.9 if i%2 else 1)
    track[at:at+len(signal),1]+=signal*(1 if i%2 else .9)
    if i%2==0:
        bass=note(130.81 if i%8<4 else 174.61,.85)*.12
        track[at:at+len(bass)]+=bass[:,None]
write('bed.wav',track)
t=np.arange(round(.25*rate))/rate
write('jump.wav',np.sin(2*np.pi*(350*t+950*t*t))*np.sin(np.pi*t/.25)*.15)
write('land.wav',note(147,.25)*.35)
write('fail.wav',(note(220,.4)+note(233,.4))*.22)
write('chime.wav',(note(1046.5,.7)+note(1318.5,.7)+note(1567.98,.7))*.12)
print('Generated bed.wav, jump.wav, land.wav, fail.wav, chime.wav')
