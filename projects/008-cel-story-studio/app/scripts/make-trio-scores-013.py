"""0.13 三支原创短片的可编排声音：3 条音乐床、12 条独立动作音效。

python scripts/make-trio-scores-013.py

不含录音采样、现成曲目或外部素材。复用 make-hero-scores.py 的 Score
混音工具，另外合成模拟低音、脉冲/三角波芯片乐器、FM 水下共振音色。
音乐床不绑定镜头；每条动作音效都在自己的 2.5 秒内完成，工作台按镜头
顺序和长度重排/伸缩。所有文件是双声道 44.1 kHz / 16-bit PCM。
"""
from pathlib import Path
import importlib.util
import hashlib
import json
import math
import re
import subprocess
import wave

import numpy as np
from scipy.signal import butter, sosfilt, welch

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/effects'
CACHE = ROOT / '.cache/trio-audio-013'
REPORT = ROOT.parent / 'assets/review-013/scores.json'
spec = importlib.util.spec_from_file_location('hero_score', ROOT / 'scripts/make-hero-scores.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
SR = m.SR


def env(t, duration, attack=.006, release=.045):
    return m.shape(t, duration, attack, release)


def analog_note(s, at, midi, duration, gain=.1, pan=0, cutoff=1100):
    """Bandlimited harmonic saw pair with an enveloped low-pass: warm tape synth."""
    t = m.seconds(duration)
    f = m.hz(midi)
    sig = np.zeros_like(t)
    for k in range(1, 10):
        sig += ((-1)**(k+1) / k**1.28) * (
            np.sin(2*np.pi*f*k*t) + .3*np.sin(2*np.pi*f*k*1.003*t+.07*k))
    sig = sosfilt(butter(2, cutoff, fs=SR, output='sos'), sig)
    sig *= (.24+.76*np.exp(-t*5.0)) * env(t, duration, .007, .07)
    s.add(sig, at, gain, pan, 'music', .12)


def chip_note(s, at, midi, duration, gain=.1, pan=0, kind='pulse', slide=0, stem='music'):
    """True pulse/triangle oscillators at a stepped console-style envelope."""
    t = m.seconds(duration)
    f = m.hz(midi) * 2**(slide*(t/duration)/12)
    phase = np.cumsum(f)/SR
    if kind == 'triangle':
        sig = 4*np.abs((phase+.25)%1-.5)-1
    else:
        duty = .25 if kind == 'pulse' else .125
        sig = np.where(phase%1 < duty, 1.0, -1.0) - (2*duty-1)
        sig = sosfilt(butter(2, 7200, fs=SR, output='sos'), sig)
    # A small staircase in level is audible without aliasing the output sample rate.
    staircase = np.floor(np.exp(-t*(2.1 if kind == 'triangle' else 3.7))*15)/15
    s.add(sig*staircase*env(t, duration, .003, .04), at, gain, pan, stem)


def chip_hit(s, at, pitch, gain=.12, pan=0):
    t = m.seconds(.13)
    noise = s.rng.choice([-1.0, 1.0], math.ceil(len(t)/8)).repeat(8)[:len(t)]
    noise = sosfilt(butter(1, [1200, 6500], fs=SR, btype='bandpass', output='sos'), noise)
    sig = noise*np.exp(-t*75)*.6 + np.sin(2*np.pi*pitch*t)*np.exp(-t*35)
    s.add(sig*env(t, .13, .001, .035), at, gain, pan, 'events')


def fm_chirp(s, at, duration, start, end, gain=.1, pan=0, wet=.3):
    t = m.seconds(duration)
    f = start * (end/start)**(t/duration)
    phase = 2*np.pi*np.cumsum(f)/SR
    sig = np.sin(phase + .7*np.sin(phase*.501))*np.exp(-t*1.8/duration)
    s.add(sig*env(t, duration, .008, .12), at, gain, pan, 'events', wet)


def synth_bed():
    s = m.Score(13001)
    quarter = .625  # 96 BPM: exactly four 4/4 bars in 10 seconds.
    chords = [[45,52,57,60,64], [41,48,53,57,60], [48,55,60,64,67], [43,50,55,60,62]]
    for bar, chord in enumerate(chords):
        start = bar*2.5
        s.pad(start, chord[1:], 2.5, .018)
        for k in range(4):
            at = start+k*quarter
            analog_note(s, at, chord[0]-12, .29, .14, -.08, 650)
            analog_note(s, at+.3125, chord[0]-5 if k%2 else chord[0]-12, .19, .085, .08, 850)
            # Music-only kick/snare pattern, never a film-event cue.
            s.thump(at, .13, low=True)
            if k%2:
                t=m.seconds(.18)
                snare=m.filtered_noise(s.rng,.18,900,9000)*np.exp(-t*28)
                s.add(snare*env(t,.18,.002,.035),at,.095,0,'music')
            for sub in [0,.3125]:
                t=m.seconds(.052)
                hat=m.filtered_noise(s.rng,.052,5500,13000)*np.exp(-t*90)
                s.add(hat*env(t,.052,.001,.012),at+sub,.035,(-1 if sub==0 else 1)*.32,'music')
        for k in range(8):
            note=chord[[1,3,4,2,3,1,4,3][k]]+12
            analog_note(s,start+k*.3125+.055,note,.26,.037,(-.5 if k%2 else .5),2700)
    return s.render()


def pixel_bed():
    s=m.Score(13002)
    # 144 BPM, eight 3/4 bars: a little clockwork waltz rather than synthwave's groove.
    beat=10/24
    roots=[48,48,53,55,52,57,53,55]
    melody=[[76,79,84],[83,79,76],[81,77,74],[79,83,86],
            [79,76,72],[81,84,88],[86,81,77],[79,74,72]]
    for bar,root in enumerate(roots):
        at=bar*beat*3
        chip_note(s,at,root-12,.37,.14,-.08,'triangle')
        for k in [1,2]:
            chip_note(s,at+k*beat,root+7,.19,.047,.18,'narrow')
            chip_note(s,at+k*beat,root+12,.19,.035,-.18,'narrow')
            chip_hit(s,at+k*beat,120,.026,(-1 if k==1 else 1)*.3)
        for k,note in enumerate(melody[bar]):
            chip_note(s,at+k*beat+.035,note,.29,.060,(-.35 if k%2 else .35))
            if k==2:chip_note(s,at+k*beat+.25,note+7,.12,.024,-.3,'triangle')
    return s.render()


def hud_bed():
    s=m.Score(13003)
    t=m.seconds(10)
    # No metronome or sonar hits in this bed: slow pressure, bowed resonances, air.
    breath=(.68+.21*np.sin(2*np.pi*.12*t-.8)+.11*np.sin(2*np.pi*.37*t))
    fade=env(t,10,.4,1.0)
    for i,freq in enumerate([43.65,65.41,87.31,130.81]):
        sig=np.sin(2*np.pi*freq*t+.8*np.sin(2*np.pi*.11*t+i))
        sig+=.2*np.sin(2*np.pi*freq*2.006*t+.9*np.sin(2*np.pi*.08*t+i))
        s.add(sig*breath*fade,0,.065/(1+i*.7),(-1 if i%2 else 1)*.5,'texture')
    for i,freq in enumerate([174.61,261.63,349.23]):
        resonance=np.sin(2*np.pi*freq*t+1.8*np.sin(2*np.pi*(freq*.501)*t))
        drift=(.6+.4*np.sin(2*np.pi*(.07+i*.023)*t+i))**2
        s.add(resonance*drift*fade,0,.011,-.65+i*.65,'texture')
    ocean=m.filtered_noise(s.rng,10,80,1300)*breath
    s.add(ocean*fade,0,.055,-.2,'texture')
    high=m.filtered_noise(s.rng,10,2400,5200)*(.5+.5*np.sin(t*.7))
    s.add(high*fade,0,.008,.5,'texture')
    return s.render()


def neon_cue(action):
    s=m.Score(13100+['spool','unspool','ride','resolve'].index(action))
    if action=='spool':
        s.thump(.045,.10)
        t=m.seconds(2.15);rpm=5+19*(t/2.15)**1.5
        phase=2*np.pi*np.cumsum(rpm)/SR
        rotor=(np.sin(2*np.pi*67*t)+.28*np.sin(2*np.pi*134*t))*(.35+.65*(.5+.5*np.cos(phase))**5)
        rotor+=m.filtered_noise(s.rng,2.15,650,3400)*(.5+.5*np.cos(phase))**18*.13
        s.add(rotor*env(t,2.15,.12,.35),.12,.14,-.25,'events')
        s.chime(.32,81,.45,.035,.4,'metal',.1)
    elif action=='unspool':
        s.chime(.10,76,.33,.07,-.45,'metal')
        t=m.seconds(1.65);f=160+1300*(t/1.65)**1.3
        ribbon=np.sin(2*np.pi*np.cumsum(f)/SR)*.35+m.filtered_noise(s.rng,1.65,500,6500)*.7
        s.add(ribbon*np.sin(np.pi*t/1.65)**1.7,.28,.13,-.45,'events',.22)
        s.add(ribbon*np.sin(np.pi*t/1.65)**1.7,.37,.09,.45,'events',.14)
        for at,p in [(1.73,-.3),(1.94,.3)]:s.chime(at,88,.34,.055,p,'metal')
    elif action=='ride':
        t=m.seconds(2.25);speed=.25+.75*np.sin(np.pi*t/2.25)**1.2
        whoosh=m.filtered_noise(s.rng,2.25,180,4800)*speed
        s.add(whoosh*env(t,2.25,.18,.35),.05,.11,0,'events')
        for i,at in enumerate([.15,.56,.96,1.31,1.63,1.93]):
            fm_chirp(s,at,.35,220+i*33,95+i*7,.095,math.sin(i*1.5)*.7,.13)
        s.thump(.20,.12,0,True)
    else:
        for i,note in enumerate([45,52,57,60,64]):
            analog_note(s,.10+i*.028,note,2.05,.055,(-2+i)*.24,1600)
        s.chime(.15,81,1.2,.065,-.3,'metal',.2)
        s.chime(.55,88,1.5,.040,.3,'metal',.2)
        s.thump(.08,.09,0,True)
    return cue_render(s)


def pixel_cue(action):
    s=m.Score(13200+['catch','repair','launch','illuminate'].index(action))
    if action=='catch':
        chip_note(s,.06,91,1.25,.095,-.30,'triangle',-28,'events')
        for i in range(6):chip_hit(s,.25+i*.16,250-i*18,.027,.30)
        # Landing matches the .65-progress end of the falling arc.
        for at,gain in [(1.63,.15),(1.91,.085),(2.11,.04)]:
            chip_hit(s,at,105,gain,0)
            chip_note(s,at,55,.18,gain*.4,-.12,'triangle',-4,'events')
    elif action=='repair':
        for i,at in enumerate([.50,1.33,2.16]):
            chip_hit(s,at,380+i*55,.14,-.15+i*.15)
            chip_note(s,at+.035,[84,88,91][i],.22,.07,(-1 if i%2 else 1)*.42,'narrow',0,'events')
            chip_note(s,at+.12,[91,95,96][i],.17,.04,(-1 if i%2 else 1)*-.42,'triangle',0,'events')
    elif action=='launch':
        chip_note(s,.05,48,.65,.08,0,'triangle',12,'events')
        for i,note in enumerate([60,64,67,72,76,79,84,88,91,96]):
            chip_note(s,.58+i*.125,note,.22,.062,math.sin(i*1.2)*.5,'pulse',0,'events')
        chip_note(s,1.85,96,.53,.06,.30,'triangle',0,'events')
        chip_note(s,1.96,103,.39,.035,-.30,'triangle',0,'events')
    else:
        for i,note in enumerate([72,79,84,76,83,88,79,84,91]):
            at=.12+i*.16
            chip_note(s,at,note,.32,.055,-.65+i*.16,'triangle',0,'events')
        for i,note in enumerate([72,76,79,84]):chip_note(s,1.55+i*.045,note,.74,.029,(i-1.5)*.24,'narrow',0,'events')
    return cue_render(s)


def hud_cue(action):
    s=m.Score(13300+['ping','inspect','decode','awaken'].index(action))
    if action=='ping':
        s.thump(.02,.045,0,True)
        t=m.seconds(1.55)
        sonar=(np.sin(2*np.pi*657*t)+.19*np.sin(2*np.pi*1314*t))*np.exp(-t*3.5)
        s.add(sonar*env(t,1.55,.007,.15),.12,.16,-.22,'events',.48)
        fm_chirp(s,1.34,.72,328,310,.045,.55,.32)
    elif action=='inspect':
        t=m.seconds(1.95);freq=180+700*(t/1.95)
        scan=np.sin(2*np.pi*np.cumsum(freq)/SR)*.45+m.filtered_noise(s.rng,1.95,1800,4700)*.24
        s.add(scan*np.sin(np.pi*t/1.95)**1.7,.12,.13,-.35,'events',.2)
        for i,at in enumerate([.18,.59,.98,1.39,1.79]):
            fm_chirp(s,at,.10,1200+i*130,800+i*110,.035,-.55+i*.27,.10)
    elif action=='decode':
        for i,at in enumerate(np.arange(.08,2.12,.17)):
            base=[293.66,349.23,440,523.25][i%4]
            fm_chirp(s,float(at),.23,base,base*1.07,.065,math.sin(i*.7)*.6,.14)
        s.pad(1.20,[38,45,57],1.20,.025,True)
    else:
        t=m.seconds(2.25);f=42+24*np.sin(np.pi*t/4.5)**2
        phase=2*np.pi*np.cumsum(f)/SR
        creature=np.sin(phase+.8*np.sin(phase*.503))+.24*np.sin(phase*3.002)
        s.add(creature*np.sin(np.pi*t/2.25)**1.1,.04,.17,0,'events')
        s.pad(.12,[38,45,50,57,62],2.15,.038,True)
        s.brush(.15,1.48,.06,0,True)
        fm_chirp(s,1.1,1.22,174.6,261.6,.045,.4,.3)
    return cue_render(s)


def cue_render(s):
    audio=s.render()[:round(SR*2.5)].copy()
    t=np.arange(len(audio))/SR
    audio*=env(t,2.5,.008,.20)[:,None]
    return audio


EVENTS={
 'synthwave':{
  'spool':([.045,.12,.32],'磁带接触、磁芯马达加速、金属锁止'),
  'unspool':([.1,.28,1.73,1.94],'解锁、双声像音轨展开、两次停靠触点'),
  'ride':([.15,.56,.96,1.31,1.63,1.93],'连续光环的多普勒穿越与气流'),
  'resolve':([.08,.15,.55],'模拟和弦落定与磁带声音标记'),
 },
 'pixel':{
  'catch':([.06,1.63,1.91,2.11],'碎月坠落音高滑落、绳轮棘齿、接住与反弹'),
  'repair':([.50,1.33,2.16],'三次锤击与逐级升高的星屑脉冲'),
  'launch':([.05,.58,1.85,1.96],'低频蓄能、芯片上行音阶、升空尾音'),
  'illuminate':([.12,.28,.44,.60,.76,.92,1.08,1.24,1.40,1.55],'窗灯逐一回应、最后的温暖芯片和弦'),
 },
 'hud':{
  'ping':([.02,.12,1.34],'低频触点、主声呐与远处回声'),
  'inspect':([.12,.18,.59,.98,1.39,1.79],'带限扫描上行与精细结构读点'),
  'decode':([round(float(x),2) for x in np.arange(.08,2.12,.17)],'能量沿脊线分流的电气级联，不含真实遥测录音'),
  'awaken':([.04,.12,1.10],'低沉 FM 共振苏醒、宽声像泛音和气压释放'),
 },
}


def measure(file,target):
    proc=subprocess.run(['ffmpeg','-hide_banner','-i',str(file),'-af',
        f'loudnorm=I={target}:TP=-2.3:LRA=9:print_format=json','-f','null','-'],
        capture_output=True,text=True,check=True)
    found=re.search(r'\{\s*"input_i".*?\}',proc.stderr,re.S)
    if not found:raise RuntimeError(proc.stderr[-1500:])
    return json.loads(found.group())


def save(audio,name,style,kind,target,events=None,description=''):
    raw=CACHE/f'{name}-raw.wav';final=OUT/f'{name}.wav'
    assert np.isfinite(audio).all() and audio.shape[1]==2
    # Console-like soft saturation also controls isolated hammer/catch transients;
    # this preserves room for an audible falling/charging envelope at -20 LUFS.
    if style=='pixel' and kind=='action-cue':audio=np.tanh(audio*3)/3
    m.write_wav(raw,audio)
    before=measure(raw,target)
    filt=(f"loudnorm=I={target}:TP=-2.3:LRA=9:measured_I={before['input_i']}:"
          f"measured_TP={before['input_tp']}:measured_LRA={before['input_lra']}:"
          f"measured_thresh={before['input_thresh']}:offset={before['target_offset']}:linear=true")
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(raw),'-af',filt,
        '-ar',str(SR),'-c:a','pcm_s16le',str(final)],check=True)
    after=measure(final,target)
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(final)],text=True))
    with wave.open(str(final),'rb') as f:
        assert (f.getnchannels(),f.getframerate(),f.getnframes(),f.getsampwidth())==(2,SR,len(audio),2)
        pcm=np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').reshape(-1,2)
    assert abs(float(after['input_i'])-target)<.7,(name,after)
    assert float(after['input_tp'])<=-2.0,(name,after)
    assert np.max(np.abs(pcm.astype(np.int32)))<32700
    assert np.max(np.abs(pcm[:3].astype(np.int32)))<1300
    assert np.max(np.abs(pcm[-3:].astype(np.int32)))<1300
    normalized=pcm.astype(float)/32768
    frequencies,power=welch(normalized.mean(axis=1),SR,nperseg=4096)
    result={'file':str(final.relative_to(ROOT)).replace('\\','/'),'style':style,'kind':kind,
        'duration':len(audio)/SR,'channels':2,'sampleRate':SR,'codec':probe['streams'][0]['codec_name'],
        'targetLUFS':target,'LUFS':float(after['input_i']),'truePeakDBTP':float(after['input_tp']),
        'loudnessRangeLU':float(after['input_lra']),'samplePeak':float(np.max(np.abs(pcm.astype(float)))/32768),
        'eventsSeconds':events or [],'description':description,
        'sha256':hashlib.sha256(final.read_bytes()).hexdigest(),
        'first10msRMS':float(np.sqrt(np.mean(normalized[:441]**2))),
        'last10msRMS':float(np.sqrt(np.mean(normalized[-441:]**2))),
        'spectralCentroidHz':round(float((frequencies*power).sum()/power.sum()),1),
        'source':'本项目原创确定性数学生成；无录音采样、现成音乐或外部声音素材',
        'normalization':'FFmpeg loudnorm 两遍测量与线性归一化，真峰值上限 -2 dBTP；目标处理留 -2.3 dBTP 余量'}
    print(f'{name}: {result["LUFS"]:.2f} LUFS / {result["truePeakDBTP"]:.2f} dBTP',flush=True)
    return result


def main():
    OUT.mkdir(parents=True,exist_ok=True);CACHE.mkdir(parents=True,exist_ok=True);REPORT.parent.mkdir(parents=True,exist_ok=True)
    report=[]
    for style,maker,description in [
        ('synthwave',synth_bed,'96 BPM 四拍复古模拟低音、双锯齿琶音、电子鼓；独立音乐床'),
        ('pixel',pixel_bed,'144 BPM 三拍芯片圆舞曲，脉冲旋律、三角波低音与位噪声打击；独立音乐床'),
        ('hud',hud_bed,'无节拍深海环境：低频压力、缓慢 FM 共振、带限气流；独立音乐床'),
    ]:
        report.append(save(maker(),f'score-{style}-013-bed',style,'music-bed',-18,description=description))
    for style,maker in [('synthwave',neon_cue),('pixel',pixel_cue),('hud',hud_cue)]:
        for action,(events,description) in EVENTS[style].items():
            item=save(maker(action),f'cue-{style}-{action}-013',style,'action-cue',-20,events,description)
            item['action']=action;report.append(item)
    assert len({item['sha256'] for item in report})==15
    REPORT.write_text(json.dumps({'version':'0.13','source':'original-synthesis',
        'timingContract':'音乐床 10 秒，不绑定镜头；动作音效 2.5 秒，事件包络在片段内完成。工作台根据镜头时长映射事件并重排片段。',
        'files':report},ensure_ascii=False,indent=2),encoding='utf8')
    print('Verified 3 musical beds and 12 independent action cues.',flush=True)


if __name__=='__main__':main()
