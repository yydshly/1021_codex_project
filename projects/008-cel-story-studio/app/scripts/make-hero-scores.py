"""两支十秒原创声音设计。确定性合成、无录音采样，按视觉事件作曲。

python scripts/make-hero-scores.py
输出 score-magnetic.wav / score-soundworks.wav 及逐片时间线、响度报告。
"""
from pathlib import Path
import json
import math
import re
import subprocess
import wave

import numpy as np
from scipy.signal import butter, sosfilt

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/effects'
CACHE = ROOT / '.cache/hero-audio'
ASSETS = ROOT.parent / 'assets'
SR = 44100
DURATION = 10.0
N = int(SR * DURATION)


def seconds(duration):
    return np.arange(max(1, round(duration * SR)), dtype=np.float64) / SR


def hz(midi):
    return 440.0 * 2.0 ** ((midi - 69.0) / 12.0)


def shape(t, duration, attack=.006, release=.05):
    return np.minimum(1, t / max(.0001, attack)) * np.minimum(1, (duration - t) / max(.0001, release))


def filtered_noise(rng, duration, low=120, high=6000):
    signal = rng.normal(0, 1, len(seconds(duration)))
    sos = butter(2, [low, min(high, SR * .47)], btype='bandpass', fs=SR, output='sos')
    return sosfilt(sos, signal)


class Score:
    def __init__(self, seed):
        self.rng = np.random.default_rng(seed)
        self.stems = {key: np.zeros((N, 2), dtype=np.float64) for key in ['music', 'texture', 'events']}

    def add(self, signal, at, gain=1, pan=0, stem='music', echo=0):
        offset = round(at * SR)
        begin = max(0, -offset)
        end = min(len(signal), N - offset)
        if end <= begin:
            return
        p = np.clip(pan, -1, 1)
        gains = np.sqrt(np.array([(1-p) / 2, (1+p) / 2]))
        self.stems[stem][max(offset, 0):offset+end] += signal[begin:end, None] * gains * gain
        if echo:
            self.add(signal, at + .113, gain * echo, -pan, stem)
            self.add(signal, at + .241, gain * echo * .45, pan * .6, stem)

    def chime(self, at, midi, duration=.7, gain=.1, pan=0, material='ceramic', echo=.12):
        t = seconds(duration)
        f = hz(midi)
        modes = [(1, 1, 3.0), (2.71, .28, 6.5), (4.13, .11, 10), (5.61, .055, 17)] if material == 'ceramic' else [(1, 1, 3.2), (2, .42, 5.2), (3.02, .14, 8.5)]
        signal = sum(amp * np.sin(2 * np.pi * f * ratio * t) * np.exp(-damp * t) for ratio, amp, damp in modes)
        # Tiny transient makes the note a contact, rather than a synthesizer pad.
        contact = filtered_noise(self.rng, duration, 800, 9000) * np.exp(-t * 180) * .055
        self.add((signal + contact) * shape(t, duration, .0018, .10), at, gain, pan, 'events', echo)

    def pluck(self, at, midi, duration=.33, gain=.1, pan=0, dry=False):
        t = seconds(duration)
        f = hz(midi)
        signal = sum((1 / k ** 1.8) * np.sin(2 * np.pi * f * k * t + .2 * np.sin(2 * np.pi * f * .5 * t)) * np.exp(-t * (8 + k*1.8)) for k in range(1, 6))
        self.add(signal * shape(t, duration, .002, .035), at, gain, pan, 'music', 0 if dry else .10)

    def pad(self, at, notes, duration, gain=.035, airy=False):
        t = seconds(duration)
        envelope = np.sin(np.pi * np.clip(t/duration, 0, 1)) ** .75
        for i, midi in enumerate(notes):
            f = hz(midi)
            signal = (np.sin(2*np.pi*f*t) + .28*np.sin(2*np.pi*f*1.004*t+.4) + .16*np.sin(2*np.pi*f*1.998*t))
            if airy:
                signal += filtered_noise(self.rng, duration, 550, 2400) * .09
            self.add(signal * envelope, at + i*.017, gain, (i-(len(notes)-1)/2)*.26, 'texture')

    def thump(self, at, gain=.22, pan=0, low=False):
        duration=.48 if low else .17
        t=seconds(duration)
        freq=39 if low else 82
        phase=2*np.pi*(freq*t+(2.1 if low else 1.1)*(1-np.exp(-t*36)))
        sig=np.sin(phase)*np.exp(-t*(9 if low else 26))*shape(t,duration,.002,.05)
        transient=filtered_noise(self.rng,duration,150,1800)*np.exp(-t*65)*(.10 if low else .35)
        self.add(sig+transient,at,gain,pan,'events')

    def brush(self, at, duration, gain=.08, pan=0, rising=False, metallic=False):
        t=seconds(duration)
        noise=filtered_noise(self.rng,duration,800 if metallic else 180,8000 if metallic else 3500)
        env=np.sin(np.pi*t/duration)**1.6
        if rising:
            env=(t/duration)**2*np.minimum(1,(duration-t)/.025)
        signal=noise*env
        if metallic:
            signal+=.12*np.sin(2*np.pi*np.cumsum(500+1900*(t/duration)**1.6)/SR)*env
        self.add(signal,at,gain,pan,'events',.09)

    def motor(self, at, duration, gain=.04, pan=0, accelerate=False):
        t=seconds(duration)
        rate=14+(20*t/duration if accelerate else 0)
        phase=2*np.pi*np.cumsum(rate)/SR
        click=(.5+.5*np.cos(phase))**14
        rotor=np.sin(2*np.pi*94*t)*.45+np.sin(2*np.pi*188*t)*.15
        signal=rotor*click+filtered_noise(self.rng,duration,550,3500)*click*.2
        self.add(signal*shape(t,duration,.08,.12),at,gain,pan,'texture')

    def render(self, pauses=()):
        # A small room response keeps material contacts coherent, but the scores retain dry transients.
        audio=sum(self.stems.values())
        source=audio.copy()
        for delay, gain in [(.037,.11),(.061,.07),(.087,.045),(.173,.03)]:
            shift=round(delay*SR)
            audio[shift:]+=source[:-shift,::-1]*gain
        for start, end, floor in pauses:
            t=np.arange(N)/SR
            attack=np.clip((t-start)/.045,0,1);release=np.clip((end-t)/.045,0,1)
            window=np.minimum(attack,release)
            audio*= (1-window*(1-floor))[:,None]
        fade=np.minimum(1,np.arange(N)/(SR*.012))*np.minimum(1,(N-1-np.arange(N))/(SR*.45))
        audio*=fade[:,None]
        assert np.isfinite(audio).all()
        # Pre-normalization headroom only. Loudness is measured and normalized in two passes below.
        audio*=.76/max(np.max(np.abs(audio)),1e-9)
        return audio


def magnetic():
    s=Score(11031)
    # 0–0.7: a very close ceramic tick and a tiny magnetic tremor grab attention.
    s.chime(.10,88,.55,.13,-.48)
    s.chime(.32,95,.38,.055,.32)
    s.brush(.20,.52,.075,-.30,True,True)
    s.pad(.25,[38,45,50],3.6,.026,True)
    # 0.7–2.6: discrete contacts circle the metal core instead of a continuous music loop.
    for at,note,pan,gain in [(.71,74,-.62,.09),(1.05,81,.52,.08),(1.41,86,-.15,.105),(1.91,93,.66,.06),(2.31,88,-.55,.10)]:
        s.chime(at,note,.7,gain,pan)
    s.motor(.82,3.25,.035,0,True)
    # 2.6–4.1: the orbit tightens and the contact sequence accelerates.
    for i,at in enumerate([2.62,2.91,3.17,3.40,3.60,3.77,3.91]):
        s.chime(at,[74,77,81,86,89,93,98][i],.42,.065+i*.004,math.sin(i*1.5)*.72)
    s.brush(3.25,.82,.16,0,True,True)
    s.pad(2.8,[45,50,53,64],1.5,.033,True)
    # 4.1–5.2: collapse/imbalance, a suspended high tone, then a genuine pocket of near silence.
    s.thump(4.10,.18,-.15)
    s.brush(4.12,.46,.10,.5,False,True)
    s.pad(4.18,[73,74],.78,.018,True)
    # 5.2–6.6: low-frequency impact, inward suction and a rapid inward spiral of ceramic contacts.
    s.thump(5.20,.50,0,True)
    s.brush(5.20,.66,.19,0,False,True)
    for i,at in enumerate([5.24,5.34,5.47,5.62,5.80,6.02,6.27]):
        s.chime(at,[98,93,89,86,81,77,74][i],.7,.08,math.cos(i*1.3)*.65)
    # 6.6–8.1: an open add-nine sonority and a single flower-like melodic gesture.
    s.pad(6.55,[38,50,57,62,69],3.25,.048,True)
    for at,n,p in [(6.63,86,-.55),(6.79,89,.4),(7.00,93,-.1),(7.35,98,.55)]:
        s.chime(at,n,1.5,.12,p)
    s.brush(6.55,1.15,.04,0)
    # 8.1–10: title cadence: just two notes and natural space for the final sculpture.
    s.chime(8.16,81,1.75,.09,-.25)
    s.chime(8.42,86,1.50,.13,.25)
    return s.render([(4.78,5.18,.055)])


def soundworks():
    s=Score(11032)
    # 0–0.9: the initiating ball is heard as a bouncing wooden impulse, then a tuned landing.
    for at,gain,p in [(.08,.17,-.60),(.28,.10,-.42),(.45,.06,-.25)]:s.thump(at,gain,p)
    s.chime(.75,79,.5,.12,-.36,'wood')
    # 0.9–2.7: conveyor and press. A two-beat motif supplies the factory's first pulse.
    s.motor(.91,5.5,.043,-.52)
    for at,n,p in [(1.00,55,-.42),(1.48,62,-.2),(1.96,55,-.42),(2.44,65,.10)]:
        s.pluck(at,n,.31,.15,p,True)
    for at in [1.24,1.72,2.20,2.68]:
        s.thump(at,.10,-.16);s.brush(at+.01,.07,.075,-.16)
    # 2.7–4.8: different stations contribute their own tuned percussive voices.
    for at,n,p in [(2.81,74,.12),(3.05,79,.25),(3.29,83,.40),(3.65,81,.62),(4.01,86,.40),(4.37,83,.12)]:
        s.chime(at,n,.5,.085,p,'wood',.06)
    for at in [2.92,3.40,3.88,4.36]:
        s.thump(at,.12,-.3)
    s.pad(3.0,[43,50,59],1.65,.025)
    # 4.8–6.5: an accumulated little ensemble, not a louder copy of the opening.
    for i,at in enumerate(np.arange(4.80,6.48,.24)):
        s.pluck(float(at),[55,62,67,71,69,67,62][i%7],.32,.14,math.sin(i)*.38,True)
        if i%2==0:s.thump(float(at),.16,0)
        s.brush(float(at)+.12,.03,.07,.48 if i%2 else -.48)
    for at,n,p in [(4.80,79,-.48),(5.28,83,.48),(5.76,86,-.2),(6.24,91,.25)]:
        s.chime(at,n,.8,.11,p,'wood')
    s.pad(4.8,[43,55,59,62],1.65,.04)
    # 6.5–8.3: the pullback/record reveal gets a tactile radial brush and stereo opening.
    s.brush(6.50,.56,.18,0,False,True)
    s.pad(6.60,[48,55,60,64,67],2.65,.044)
    s.pluck(6.76,48,.5,.15,-.55)
    for at,n,p in [(6.83,79,-.65),(7.07,83,-.25),(7.31,86,.25),(7.79,91,.65)]:
        s.chime(at,n,.9,.1,p,'wood')
    # 8.3–10: a compact sonic logo, with no endless groove under the final title.
    s.thump(8.30,.11,0,True)
    for at,n,p in [(8.31,79,-.4),(8.47,83,-.1),(8.63,86,.2),(8.95,91,.4)]:
        s.chime(at,n,1,.09,p,'wood',.12)
    return s.render([(6.43,6.51,.28)])


def write_wav(file,audio):
    with wave.open(str(file),'wb') as f:
        f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR)
        f.writeframes((np.clip(audio,-1,1)*32767).astype('<i2').tobytes())


def loudness(file):
    result=subprocess.run(['ffmpeg','-hide_banner','-i',str(file),'-af','loudnorm=I=-16:TP=-1.8:LRA=9:print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
    match=re.search(r'\{\s*"input_i".*?\}',result.stderr,re.S)
    if not match:raise RuntimeError(result.stderr[-1000:])
    return json.loads(match.group())


TIMELINES={
 'magnetic':[
  [0,.7,'钩子','近距离陶瓷触点、磁力颤动与上行气流'],
  [.7,2.6,'围绕金属核','稀疏的陶瓷模态音色沿左右声像移动，保持可辨的单次接触'],
  [2.6,4.1,'收紧与聚合','触点间隔从290ms缩至140ms，转子声加速并逐步增加张力'],
  [4.1,5.2,'失衡悬停','崩开脆响后保留悬置半音；4.78–5.18秒显著抽空声音'],
  [5.2,6.6,'吸回与展开','低频冲击、吸入气流和反向下行陶瓷触点组成一次明确释放'],
  [6.6,8.1,'磁悬浮花高潮','展开的加九和弦、四个宽声像高音与较长尾音'],
  [8.1,10,'落版','两音收束，让最终雕塑有安静停留的空间'],
 ],
 'soundworks':[
  [0,.9,'小球进入','木质弹跳由左向中，最后变成有音高的落点'],
  [.9,2.7,'传送与压机','干燥转子、低音拨弦与压机节拍，先建立单一机械律动'],
  [2.7,4.8,'工位连锁响应','齿轮和音管以不同音高、声像逐一加入'],
  [4.8,6.5,'全厂合奏','原先独立的机械声汇成短促、完整的节拍与和声'],
  [6.5,8.3,'唱机揭示','径向唱片刷声与声像展开，和声由G转向C形成新的空间感'],
  [8.3,10,'品牌落版','四音声音标记，节奏退场，尾音自然收束'],
 ]
}


def main():
    OUT.mkdir(parents=True,exist_ok=True);CACHE.mkdir(parents=True,exist_ok=True)
    report=[]
    for name,make,title in [('magnetic',magnetic,'磁场花开'),('soundworks',soundworks,'声音制造局')]:
        raw=CACHE/f'{name}-raw.wav';final=OUT/f'score-{name}.wav'
        audio=make();write_wav(raw,audio)
        before=loudness(raw)
        filt=(f"loudnorm=I=-16:TP=-1.8:LRA=9:measured_I={before['input_i']}:"
              f"measured_TP={before['input_tp']}:measured_LRA={before['input_lra']}:"
              f"measured_thresh={before['input_thresh']}:offset={before['target_offset']}:linear=true")
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(raw),'-af',filt,'-ar',str(SR),'-c:a','pcm_s16le',str(final)],check=True)
        after=loudness(final)
        with wave.open(str(final),'rb') as f:
            assert (f.getnchannels(),f.getframerate(),f.getnframes(),f.getsampwidth())==(2,SR,N,2)
            pcm=np.frombuffer(f.readframes(N),dtype='<i2').astype(np.float64)/32768
        assert np.max(np.abs(pcm))<.99
        assert abs(float(after['input_i'])+16)<1.0,(name,after)
        assert float(after['input_tp'])<=-1.4,(name,after)
        # Full decode catches malformed headers/data as well as metadata mismatches.
        subprocess.run(['ffmpeg','-v','error','-i',str(final),'-f','null','-'],capture_output=True,check=True)
        row={'name':name,'title':title,'file':f'app/public/effects/{final.name}','durationSeconds':DURATION,'sampleRate':SR,'channels':2,'bitDepth':16,'framesPerChannel':N,'source':'原创确定性代码合成，无外部录音、采样、第三方音乐或AI音乐','integratedLUFS':float(after['input_i']),'truePeakDBTP':float(after['input_tp']),'loudnessRangeLU':float(after['input_lra']),'samplePeakDBFS':round(float(20*np.log10(np.max(np.abs(pcm)))),3),'normalization':'FFmpeg loudnorm 两遍测量，目标 -16 LUFS / -1.8 dBTP / LRA 9','timeline':[{'start':a,'end':b,'event':event,'sound':sound} for a,b,event,sound in TIMELINES[name]],'decode':'passed'}
        report.append(row)
        print(f"{name}: {row['integratedLUFS']} LUFS / {row['truePeakDBTP']} dBTP / 10 s / stereo",flush=True)
    (ASSETS/'hero-scores.json').write_text(json.dumps({'version':'0.11','date':'2026-10-21','generator':'app/scripts/make-hero-scores.py','scores':report},ensure_ascii=False,indent=2)+'\n',encoding='utf8')


if __name__=='__main__':main()
