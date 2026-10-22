"""原创 120 BPM 合成音乐与音效；只使用 Python 标准库，无外部采样。"""
import json
import math
import random
import struct
import subprocess
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CUES = json.loads((ROOT / "src/cues.json").read_text(encoding="utf-8"))
SR = 48000
SIZE = int(CUES["duration"] * SR)
LEFT = [0.0] * SIZE
RIGHT = [0.0] * SIZE
RNG = random.Random(1021)


def note_hz(note):
    return 440 * 2 ** ((note - 69) / 12)


def add(start, duration, synth, amp=0.2, pan=0.0):
    first = round(start * SR)
    for i in range(round(duration * SR)):
        idx = first + i
        if 0 <= idx < SIZE:
            t = i / SR
            value = synth(t) * amp
            LEFT[idx] += value * math.sqrt((1 - pan) / 2)
            RIGHT[idx] += value * math.sqrt((1 + pan) / 2)


def pluck(start, note, amp=0.15, duration=0.55, pan=0.0):
    hz = note_hz(note)
    def synth(t):
        env = (1 - math.exp(-t * 650)) * math.exp(-t * 8)
        return env * (math.sin(2 * math.pi * hz * t)
                      + 0.3 * math.sin(4 * math.pi * hz * t)
                      + 0.1 * math.sin(6 * math.pi * hz * t))
    add(start, duration, synth, amp, pan)


# 五小节明亮的 C / Am / F / G / C 和声；尾部留出自然余音。
chords = [(48, 60, 64, 67), (45, 60, 64, 69), (41, 57, 60, 65),
          (43, 59, 62, 67), (48, 60, 64, 67)]
beat = 60 / CUES["bpm"]
for b in range(18):
    start = b * beat
    chord = chords[min(4, b // 4)]
    pluck(start, chord[0], 0.24, 0.7)
    for n in chord[1:]:
        pluck(start + 0.015 * (n % 3), n, 0.075, 0.8, (n % 5 - 2) / 4)
    if b % 2 == 0:
        add(start, 0.25, lambda t: math.sin(2 * math.pi * (47 * t + 1.4 * (1 - math.exp(-35 * t)))) * math.exp(-18 * t), 0.36)
    else:
        add(start, 0.14, lambda t: RNG.uniform(-1, 1) * math.exp(-35 * t), 0.13)
    for off in (0.0, 0.25):
        add(start + off, 0.045, lambda t: RNG.uniform(-1, 1) * math.exp(-100 * t), 0.065, 0.25)
    pluck(start + 0.25, chord[1 + b % 3] + 12, 0.065, 0.35, (-1) ** b * 0.45)

for event in CUES["cues"]:
    start = event["time"]
    if event["type"] == "chime":
        pluck(start, event["note"], 0.19, 1.0, -0.15)
        pluck(start + 0.11, event["note"] + 12, 0.05, 0.8, 0.25)
    elif event["type"] == "pop":
        hz = note_hz(event["note"])
        add(start, 0.18, lambda t, hz=hz: math.sin(2 * math.pi * hz * (t + 0.012 * (1 - math.exp(-45 * t)))) * math.exp(-30 * t), 0.28)
    else:
        add(start, 0.48, lambda t: RNG.uniform(-1, 1) * math.sin(math.pi * t / 0.48) ** 2 * 0.45, 0.14)

# Cmaj9 收尾。
for i, n in enumerate((60, 64, 67, 74)):
    pluck(8.5 + 0.035 * i, n, 0.17, 1.5, (i - 1.5) / 4)

peak = max(max(abs(v) for v in LEFT), max(abs(v) for v in RIGHT))
raw = ROOT / "public/soundtrack-raw.wav"
with wave.open(str(raw), "wb") as wav:
    wav.setparams((2, 2, SR, 0, "NONE", "not compressed"))
    data = bytearray()
    for i, (left, right) in enumerate(zip(LEFT, RIGHT)):
        fade = min(1, (SIZE - i) / (SR * 0.4))
        for value in (left, right):
            data.extend(struct.pack("<h", int(value / peak * 0.85 * fade * 32767)))
    wav.writeframes(data)
subprocess.run([
    "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(raw),
    "-af", "loudnorm=I=-16:TP=-1.5:LRA=9", "-ar", str(SR),
    str(ROOT / "public/soundtrack.wav"),
], check=True)
raw.unlink()
print("Generated 10s stereo 48kHz soundtrack; fixed seed 1021.")
