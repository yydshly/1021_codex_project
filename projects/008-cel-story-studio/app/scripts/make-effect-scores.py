"""原创合成配乐：只用正弦、泛音、包络和种子噪声，不引入外部采样。"""
import math
import wave
from pathlib import Path
import numpy as np

root = Path(__file__).resolve().parents[1] / 'public' / 'effects'
rate = 22050
length = 10
def note(freq, duration, bright=.2):
    t = np.arange(int(duration * rate)) / rate
    attack = np.minimum(1, t / .018)
    decay = np.exp(-t * 2.8 / duration)
    release = np.minimum(1, (duration - t) / .12)
    return (np.sin(t * freq * 2 * np.pi) + bright * np.sin(t * freq * 4 * np.pi)) * attack * decay * release

for index, (name, bpm, root_note, bright) in enumerate([
    ('warm', 84, 50, .16), ('paper', 108, 57, .30),
    ('pulse', 112, 45, .12), ('rain', 80, 53, .10), ('cafe', 96, 55, .25),
]):
    rng = np.random.default_rng(2100 + index)
    out = np.zeros(rate * length)
    beat = 60 / bpm
    def add(data, start, gain):
        pos = int(start * rate)
        if pos >= len(out):
            return
        count = min(len(data), len(out) - pos)
        out[pos:pos + count] += data[:count] * gain
    for k in range(math.ceil(length / beat)):
        degree = [0, 7, 12, 16, 7, 12, 19, 16][k % 8]
        freq = 440 * 2 ** ((root_note + degree - 69) / 12)
        data = note(freq, min(1.8, beat * 2.3), bright)
        add(data, k * beat, .14 if k % 2 == 0 else .08)
        add(data, k * beat + .22, .018)
        if k % 4 == 0:
            add(note(freq / 2, 2.4, .05), k * beat, .10)
        if name in ('paper', 'pulse', 'cafe'):
            click_t = np.arange(int(.055 * rate)) / rate
            click = rng.normal(size=len(click_t)) * np.exp(-click_t * 100)
            add(click, k * beat + beat / 2, .028)
    # Deterministic light compression and short edge fades, no clipping.
    out = np.tanh(out * 1.5)
    ramp = np.minimum(1, np.arange(len(out)) / (rate * .1))
    ramp *= np.minimum(1, np.arange(len(out))[::-1] / (rate * .25))
    out *= ramp
    with wave.open(str(root / f'score-{name}.wav'), 'wb') as file:
        file.setnchannels(1)
        file.setsampwidth(2)
        file.setframerate(rate)
        file.writeframes((out * 32767).astype('<i2').tobytes())
print('Generated 5 original 10 s scores.')
