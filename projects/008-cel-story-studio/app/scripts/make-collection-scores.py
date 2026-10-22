"""Twelve original, deterministic ten-second stereo cues. No recordings or samples."""
from pathlib import Path
import numpy as np
import wave, subprocess, json
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'public/effects'; SR=44100
STYLES=['flat-vector','line-art','isometric','collage','liquid','morph','bauhaus','synthwave','hanazi','paperclip','pixel','hud']
N=SR*10
def midi(n): return 440*2**((n-69)/12)
report=[]
for idx,style in enumerate(STYLES):
    rng=np.random.default_rng(800+idx); audio=np.zeros((N,2),dtype=np.float64)
    def add(at,signal,volume=1,pan=0):
        i=int(at*SR); start=max(0,-i); end=min(len(signal),N-i)
        if end<=start:return
        gain=np.array([np.sqrt((1-pan)/2),np.sqrt((1+pan)/2)])
        audio[max(i,0):i+end]+=signal[start:end,None]*gain[None,:]*volume
    def note(at,n,length=.45,vol=.1,kind='pluck',pan=0):
        t=np.arange(int(length*SR))/SR; f=midi(n); envelope=(1-np.exp(-t*100))*np.exp(-t/(length*.25))*np.minimum(1,(length-t)*40)
        if kind=='bell': sig=np.sin(2*np.pi*f*t+2*np.sin(2*np.pi*f*2.01*t)*np.exp(-t*9))
        elif kind=='square':sig=sum(np.sin(2*np.pi*f*k*t)/k for k in [1,3,5,7])*.55
        elif kind=='pad':sig=(np.sin(2*np.pi*f*t)+.35*np.sin(2*np.pi*f*1.004*t)+.2*np.sin(2*np.pi*f*2*t));envelope=np.minimum(t*4,1)*np.minimum((length-t)*3,1)*.65
        else:sig=np.sin(2*np.pi*f*t)+.35*np.sin(2*np.pi*f*2*t)*np.exp(-t*15)+.12*np.sin(2*np.pi*f*3*t)
        add(at,sig*envelope,vol,pan)
    def noise(at,length=.12,vol=.1,pan=0,soft=False):
        t=np.arange(int(length*SR))/SR; sig=rng.normal(0,1,len(t));sig=np.convolve(sig,np.ones(45 if soft else 3)/(45 if soft else 3),mode='same');sig*=np.sin(np.pi*t/length)**2;add(at,sig,vol,pan)
    def kick(at,vol=.15):
        t=np.arange(int(.32*SR))/SR; add(at,np.sin(2*np.pi*(47*t+2.5*(1-np.exp(-t*24))))*np.exp(-t*15)*(1-np.exp(-t*150)),vol)
    def sweep(at,length=.6,up=True,vol=.12):
        t=np.arange(int(length*SR))/SR; f=200+(t/length if up else 1-t/length)*1000;add(at,np.sin(2*np.pi*np.cumsum(f)/SR)*np.sin(np.pi*t/length)**2,vol)
    root=[53,60,50,48,45,57,48,45,55,60,57,45][idx]; calm=style in ['line-art','isometric','morph','hud','liquid']; beat=.5 if style in ['bauhaus','synthwave','flat-vector'] else .625
    for at,chord in [(0,[0,7,12]),(2.5,[5,9,12]),(5,[7,10,14]),(7.5,[0,7,12,16])]:
        for j,n in enumerate(chord):note(at,root+n,2.45,.035 if calm else .024,'pad',(j-1)*.4)
    melody=[0,7,12,16,14,7,9,12,5,12,17,16,14,10,7,0]
    for j,n in enumerate(melody):
        at=.25+j*.5
        note(at,root+n+12,.7,.09 if calm else .10,'square' if style=='pixel' else 'bell' if style in ['isometric','morph','hud'] else 'pluck',np.sin(j*.9)*.5)
    if not calm:
        for j in range(int(9/beat)):
            at=j*beat;kick(at,.13 if style!='hanazi' else .07)
            noise(at+beat*.5,.045,.09,np.sin(j)*.7)
            if j%2:noise(at,.10,.13,soft=True)
            note(at,root-12+[0,0,5,7][(j//4)%4],.34,.15,'square' if style=='pixel' else 'pluck')
    else:
        for at in [0,2.8,5.6,8.1]:note(at,root-12,1.5,.12,'pad')
    # Semantic sound design aligned with the story's cuts and actions.
    if style=='flat-vector':
        for j in range(8):noise(2.8+j*.10,.07,.17,(j%3-1)*.4);note(2.8+j*.1,72+j%5,.15,.055)
        noise(5.7,.65,.18,soft=True)
    elif style=='line-art':
        for at in [.4,2.8,5.8]:noise(at,.9,.16,soft=True)
        noise(7.3,.22,.3,soft=True);note(7.65,84,.6,.12,'bell')
    elif style=='isometric':
        for j in range(8):note(j*.12,77+j%3,.18,.04,'bell',j/5-.7)
        for at in [3.2,4.7,6.5]:note(at,88,.4,.045,'bell',.7)
    elif style=='collage':
        noise(.25,.8,.2);sweep(2.7,.6,False,.08)
        for at in [3.5,4.9,6.8]:note(at,78,1.1,.12,'bell',-.5)
    elif style=='liquid':
        for at in [1.5,3.2,5.8,7.4]:sweep(at,.5,at<4,.065);note(at,root+19,.7,.13,'bell')
    elif style=='morph':
        for j,at in enumerate([1.2,3.2,5.6,7.2]):noise(at,.5,.14,soft=True);note(at,root+12+j*3,.8,.15,'bell')
    elif style=='bauhaus':
        for j in range(19):noise(j*.5,.045,.19 if j%4==0 else .1,j%3/2-.5)
    elif style=='synthwave':
        noise(0,9.3,.25,soft=True)
        for j in range(35):noise(j*.25,.035,.12,-.3 if j%2 else .3)
        sweep(5.6,1.2,False,.055)
    elif style=='hanazi':
        noise(.2,.65,.22,soft=True);note(3.2,77,.2,.18);note(3.45,72,.25,.16);note(6.3,84,1.1,.16,'bell')
    elif style=='paperclip':
        for at in [0,3.1,6.3]:noise(at,.18,.3,soft=True)
        for j in range(7):note(3.3+j*.3,65+j,.2,.05,'bell',(j-3)/4)
    elif style=='pixel':
        noise(0,9.5,.24,soft=True)
        for at,n in [(7.25,88),(7.45,91),(8.2,96)]:note(at,n,.24,.1,'square')
    elif style=='hud':
        for j in range(5):note(j,83,.22,.05,'bell',.6)
        for at in [5.4,5.65,6.0]:note(at,90,.4,.11,'bell',-.4)
    # A short stereo echo. Ending cadence and fade provide an actual resolution.
    for d,gain in [(.13,.15),(.27,.08)]:
        shift=int(d*SR);audio[shift:]+=audio[:-shift,::-1]*gain
    fade=np.minimum(np.arange(N)/(SR*.05),1)*np.minimum((N-1-np.arange(N))/(SR*.45),1);audio*=fade[:,None]
    peak=np.max(np.abs(audio));audio=audio/max(peak,1e-6)*.76
    raw=ROOT/'.cache'/f'score-{style}.wav';raw.parent.mkdir(exist_ok=True)
    with wave.open(str(raw),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((audio*32767).astype('<i2').tobytes())
    final=OUT/f'score-{style}.wav'
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(raw),'-af','loudnorm=I=-16:TP=-1.5:LRA=8','-ar',str(SR),str(final)],check=True)
    report.append({'style':style,'file':final.name,'duration':10,'sampleRate':SR,'channels':2,'source':'原创程序合成，无外部录音、采样或生成音乐'})
    print(style,flush=True)
(ROOT.parent/'assets/collection-scores.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
