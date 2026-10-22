"""018《给你一片海》原创程序配乐与动作声音，可重复生成。

运行：python scripts/make-score-018.py
依赖：Python 标准库、numpy。输出仅为 public/director-018/*.wav。

制作方法：
* bed：80 BPM、D 大调、十小节三十秒；D6/Bm7/Gmaj9/Asus/Dadd9。
  稀疏木质槌击旋律、温软低音与缓慢气息组成，不使用外部采样或旋律。
  槌击由基频、弱三倍频/非整数泛音与短暂纸面气息构成；高泛音更快衰减。
  延迟反射和跨边界余音折返进三十秒周期，避免把尾音直接截断。
* 五段 cue 均三秒，供镜头按相同比例伸缩：发现的轻敲、画笔摩擦、
  水纹展开、跃起与入水、告别的呼应。摩擦/水声是带限随机噪声、
  慢包络和弱谐振波形；不是实录水声或真正物理流体模拟。
* 48 kHz、双声道、16-bit PCM。固定 RNG 种子；TPDF 抖动后量化。
  全轨去直流、末端淡出（循环底乐除外），归一到保守的样本峰值。

脚本打印实际 PCM 峰值、RMS、首尾跳变和削波样本数。数值与波形检查
不等于听觉审片；本脚本不会宣称已进行主观听觉验收。
"""

from __future__ import annotations

import json
import math
from pathlib import Path
import wave

import numpy as np


SR = 48_000
OUTPUT = Path(__file__).resolve().parents[1] / 'public' / 'director-018'
RNG = np.random.default_rng(18_2026)


def midi(note: float) -> float:
    return 440.0 * 2 ** ((note - 69) / 12)


def smooth(a: np.ndarray) -> np.ndarray:
    a = np.clip(a, 0, 1)
    return a * a * (3 - 2 * a)


def band_noise(seconds: float, low: float, high: float) -> np.ndarray:
    """FFT 带限噪声，边缘用四阶软斜率，减少尖锐的高频白噪声。"""
    count = round(seconds * SR)
    spectrum = np.fft.rfft(RNG.normal(0, 1, count))
    f = np.fft.rfftfreq(count, 1 / SR)
    hp = (f / max(low, 1)) ** 4
    response = (hp / (1 + hp)) / (1 + (f / high) ** 6)
    response[0] = 0
    out = np.fft.irfft(spectrum * response, n=count)
    return out / max(np.sqrt(np.mean(out * out)), 1e-9)


def wooden(note: float, seconds: float = 2.8, soft: float = 1) -> np.ndarray:
    """温软木琴，低比例的快速泛音，不用高频硬敲击。"""
    t = np.arange(round(seconds * SR)) / SR
    f = midi(note)
    attack = 1 - np.exp(-t / .009)
    fundamental = np.sin(2 * np.pi * f * t) * np.exp(-t / (.78 * soft))
    body = .16 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t / .23)
    wood = .035 * np.sin(2 * np.pi * f * 3.92 * t) * np.exp(-t / .07)
    air = band_noise(seconds, 500, 1750) * .012 * np.exp(-t / .035)
    release = smooth((seconds - t) / .09)
    return (fundamental + body + wood + air) * attack * release


def add(track: np.ndarray, signal: np.ndarray, at: float, gain: float = 1,
        pan: float = 0, wrap: bool = False) -> None:
    """恒功率声像；循环轨将边界外音符余音折返，不截断。"""
    start = round(at * SR)
    indices = np.arange(len(signal)) + start
    stereo = signal[:, None] * np.array([
        math.cos((pan + 1) * np.pi / 4),
        math.sin((pan + 1) * np.pi / 4),
    ])[None, :] * gain
    if wrap:
        np.add.at(track, indices % len(track), stereo)
    else:
        valid = (indices >= 0) & (indices < len(track))
        track[indices[valid]] += stereo[valid]


def echoed(track: np.ndarray, signal: np.ndarray, at: float, gain: float,
           pan: float = 0, wrap: bool = False) -> None:
    add(track, signal, at, gain, pan, wrap)
    add(track, signal, at + .137, gain * .105, -pan * .65, wrap)
    add(track, signal, at + .281, gain * .045, pan * .4, wrap)


def bed() -> np.ndarray:
    seconds = 30
    track = np.zeros((seconds * SR, 2))
    beat = .75
    # 十小节组成完整呼吸；第一、末组同属 D 音，跨周期保持和声连续。
    chords = [([50, 57, 62, 66, 71], .00),
              ([47, 54, 59, 62, 66], 6.00),
              ([43, 50, 55, 59, 66], 12.00),
              ([45, 52, 57, 62, 64], 18.00),
              ([50, 57, 62, 64, 69], 24.00)]
    for notes, start in chords:
        length = 7.6
        t = np.arange(round(length * SR)) / SR
        env = smooth(t / 1.3) * smooth((length - t) / 1.6)
        for index, note in enumerate(notes):
            f = midi(note)
            # 轻微频宽让弦乐垫接近空气，不用显眼的锯齿/亮音色。
            body = np.sin(2 * np.pi * f * t) + .12 * np.sin(4 * np.pi * f * t)
            body += .14 * np.sin(2 * np.pi * f * 1.0018 * t + .4)
            add(track, body * env, start - .8, .010 if index else .016,
                -.42 + index * .21, True)
        for offset, note in [(0, notes[0]), (3.75, notes[1] - 12)]:
            echoed(track, wooden(note, 3.0, 1.7), start + offset,
                   .052, -.1, True)

    # 原创短动机：停顿多于音符，避免每拍都响；结尾的悬音在下一周回复。
    melody = [(1, 74, .17), (2.5, 78, .11), (4.5, 76, .10),
              (6, 69, .10), (8.5, 71, .13), (10.5, 74, .10),
              (12, 73, .10), (14.5, 66, .09), (16.5, 71, .12),
              (18, 74, .12), (20.5, 78, .12), (22, 76, .09),
              (24, 73, .12), (26.5, 69, .10), (28, 71, .09),
              (30.5, 73, .09), (32.5, 74, .15), (34, 78, .10),
              (36, 76, .08), (38, 69, .075)]
    for index, (at, note, level) in enumerate(melody):
        echoed(track, wooden(note, 3.4, 1.25), at * beat, level,
               .25 * math.sin(index * 1.4), True)

    # 三十秒周期气息，低于主音两个数量级；FFT 产生周期带限随机相位。
    t = np.arange(len(track)) / SR
    for channel in range(2):
        air = band_noise(seconds, 400, 1800)
        breathing = .7 + .3 * np.cos(2 * np.pi * t / 6 + channel * .2)
        track[:, channel] += air * breathing * .00065
    return track


def empty_cue() -> tuple[np.ndarray, np.ndarray]:
    return np.zeros((3 * SR, 2)), np.arange(3 * SR) / SR


def cue_notice() -> np.ndarray:
    track, t = empty_cue()
    echoed(track, wooden(74, 2.6, 1.2), .23, .15, -.24)
    echoed(track, wooden(69, 1.9, 1.6), 1.08, .07, .22)
    ripple = np.sin(2 * np.pi * (470 * t - 45 * t * t))
    env = smooth((t - .35) / .08) * np.exp(-np.maximum(t - .35, 0) / .3)
    add(track, ripple * env, 0, .012, .3)
    return track


def cue_draw() -> np.ndarray:
    track, t = empty_cue()
    noise = band_noise(3, 450, 2400)
    for index, (at, length) in enumerate([(.25, .58), (.98, .8), (1.93, .69)]):
        local = t - at
        env = smooth(local / .1) * smooth((length - local) / .17)
        texture = .72 + .15 * np.sin(2 * np.pi * 19 * t)
        texture += .13 * np.sin(2 * np.pi * 31 * t + .7)
        add(track, noise * texture * env, 0, .031, -.22 + index * .22)
    # 仅一颗很弱的木音，保留摩擦作为主角。
    echoed(track, wooden(62, 2.1, 1.4), .36, .027, -.13)
    return track


def cue_unfold() -> np.ndarray:
    track, t = empty_cue()
    wash = band_noise(3, 180, 1650)
    swell = smooth((t - .12) / 1.35) * smooth((3 - t) / .9)
    pulses = .8 + .2 * np.sin(2 * np.pi * 2 * t - .5)
    add(track, wash * swell * pulses, 0, .021, -.3)
    add(track, np.roll(wash, 1121) * swell, 0, .013, .4)
    for index, (at, note) in enumerate([(.43, 62), (.83, 69), (1.35, 74), (1.92, 78)]):
        echoed(track, wooden(note, 2.5, 1.4), at, .075 - index * .007,
               -.45 + index * .3)
    return track


def cue_leap() -> np.ndarray:
    track, t = empty_cue()
    # 与画面归一化时间一致：约 .4 处达抛物线末端，随后空间展开。
    lift = smooth((t - .12) / .2) * smooth((1.32 - t) / .25)
    pitch = 230 + 360 * np.sin(np.clip((t - .12) / 1.2, 0, 1) * np.pi)
    phase = np.cumsum(2 * np.pi * pitch / SR)
    air = band_noise(3, 230, 2300)
    add(track, (np.sin(phase) * .013 + air * .014) * lift, 0, 1, -.08)
    splash_at = 1.36
    local = np.maximum(t - splash_at, 0)
    splash_env = smooth((t - splash_at) / .045) * np.exp(-local / .3)
    splash_env *= smooth((3 - t) / .4)
    splash = band_noise(3, 160, 3100) * splash_env
    add(track, splash, 0, .047, .17)
    for index in range(7):
        start = 1.43 + index * .145
        length = 3 - start
        q = np.arange(round(length * SR)) / SR
        f = 530 - index * 31
        drop = np.sin(2 * np.pi * (f * q - 85 * q * q))
        drop *= (1 - np.exp(-q / .008)) * np.exp(-q / .11)
        add(track, drop, start, .018 / (1 + index * .2), (-1) ** index * .38)
    echoed(track, wooden(74, 1.5, 1.2), 1.55, .054, .2)
    return track


def cue_farewell() -> np.ndarray:
    track, _ = empty_cue()
    for at, note, gain, pan in [(.16, 74, .14, -.2), (.74, 69, .09, .2),
                                 (1.5, 62, .08, -.1)]:
        echoed(track, wooden(note, 2.8, 1.55), at, gain, pan)
    return track


def write_pcm(name: str, track: np.ndarray, peak: float, loop: bool = False) -> dict:
    if not np.isfinite(track).all():
        raise ValueError(f'{name}: 合成中出现非有限数值')
    track = track - np.mean(track, axis=0, keepdims=True)
    if not loop:
        t = np.arange(len(track)) / SR
        track *= (smooth(t / .018) * smooth((len(track) / SR - t) / .16))[:, None]
    track *= peak / max(float(np.max(np.abs(track))), 1e-12)
    # 两个独立均匀噪声相减形成 TPDF，量化时不硬性截断任何正常信号。
    dither = (RNG.random(track.shape) - RNG.random(track.shape)) / 32768
    pcm = np.rint((track + dither) * 32767).astype('<i2')
    OUTPUT.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUTPUT / name), 'wb') as output:
        output.setnchannels(2)
        output.setsampwidth(2)
        output.setframerate(SR)
        output.writeframes(pcm.tobytes())
    # 读取实际量化结果，而非只报告归一化前的浮点数组。
    actual = pcm.astype(np.float64) / 32768
    sample_peak = float(np.max(np.abs(actual)))
    rms = float(np.sqrt(np.mean(actual ** 2)))
    report = {
        'file': name, 'seconds': len(pcm) / SR, 'sample_rate': SR,
        'channels': 2, 'bit_depth': 16,
        'peak': round(sample_peak, 6),
        'peak_dbfs': round(20 * math.log10(max(sample_peak, 1e-12)), 2),
        'rms': round(rms, 6),
        'rms_dbfs': round(20 * math.log10(max(rms, 1e-12)), 2),
        'clipped_samples': int(np.count_nonzero(np.abs(pcm.astype(np.int32)) >= 32767)),
        'boundary_jump': round(float(np.max(np.abs(actual[0] - actual[-1]))), 6),
        'dc': round(float(np.max(np.abs(np.mean(actual, axis=0)))), 8),
    }
    assert report['clipped_samples'] == 0, f'{name}: PCM 样本削波'
    assert len(pcm) == (30 if loop else 3) * SR
    return report


def main() -> None:
    reports = [write_pcm('bed.wav', bed(), .29, loop=True)]
    for name, synth, peak in [
        ('notice', cue_notice, .20), ('draw', cue_draw, .17),
        ('unfold', cue_unfold, .23), ('leap', cue_leap, .25),
        ('farewell', cue_farewell, .20),
    ]:
        reports.append(write_pcm(f'cue-{name}.wav', synth(), peak))
    print(json.dumps({'method': 'original procedural synthesis; not aurally reviewed',
                      'seed': 18_2026, 'measurements': reports},
                     ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
