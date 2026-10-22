"""Measure original bicycle videos and extract timed evidence without new calls."""
import hashlib
import json
from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent.parent
MEDIA = PROJECT / 'assets/generated/bike-kindness'


def probe(path):
    return json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(path)], encoding='utf-8'))


def main():
    font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 17)
    plan = json.loads((HERE / 'bike-kindness-plan.json').read_text(encoding='utf-8'))
    for shot in plan['shots']:
        shot_id = shot['id']
        execution_id = shot.get('executionId', shot_id)
        state_path = HERE / f'{execution_id}-execution.json'
        state = json.loads(state_path.read_text(encoding='utf-8'))
        if state['status'] != 'completed':
            print(shot_id + ': not yet complete; skipped')
            continue
        directory = MEDIA / 'review' / shot_id
        directory.mkdir(parents=True, exist_ok=True)
        if state.get('actualMedia') and (directory / 'contact-sheet.jpg').exists():
            print(shot_id + ': original already measured')
            continue
        originals = list((MEDIA / execution_id).glob('*.mp4'))
        if len(originals) != 1:
            raise ValueError('Expected one original for ' + shot_id)
        source = originals[0]
        measured = probe(source)
        video = next(s for s in measured['streams'] if s['codec_type'] == 'video')
        duration = float(measured['format']['duration'])
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', str(source), '-f', 'null', '-'], check=True)
        state['actualMedia'] = dict(duration=duration, width=video['width'], height=video['height'],
                                   frameRate=video['r_frame_rate'], videoCodec=video['codec_name'],
                                   hasAudio=any(s['codec_type'] == 'audio' for s in measured['streams']), byteSize=source.stat().st_size)
        state['source'] = source.relative_to(PROJECT).as_posix()
        state['sha256'] = hashlib.sha256(source.read_bytes()).hexdigest()
        state_path.write_text(json.dumps(state, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        (HERE / f'{shot_id}-media-probe.json').write_text(json.dumps(measured, indent=2) + '\n', encoding='utf-8')
        times = [0.05, *[i / 4 for i in range(1, 20)], min(4.95, duration - .1)]
        sheet = Image.new('RGB', (4 * 480, 6 * 300), '#172016')
        frames = []
        for i, timestamp in enumerate(times):
            dest = directory / f'{timestamp:04.2f}.jpg'
            subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', str(timestamp), '-i', str(source), '-frames:v', '1', '-q:v', '2', str(dest)], check=True)
            with Image.open(dest) as original:
                thumb = original.convert('RGB')
                thumb.thumbnail((480, 270))
                x, y = (i % 4) * 480, (i // 4) * 300
                sheet.paste(thumb, (x + (480 - thumb.width) // 2, y + 30))
                ImageDraw.Draw(sheet).text((x + 10, y + 5), f'{shot_id}  {timestamp:.2f}s', fill='white', font=font)
            frames.append(dict(sourceSeconds=timestamp, file=dest.relative_to(PROJECT).as_posix()))
        sheet.save(directory / 'contact-sheet.jpg', quality=94)
        (directory / 'frames.json').write_text(json.dumps(frames, indent=2) + '\n', encoding='utf-8')
        print(shot_id + ': ' + json.dumps(state['actualMedia']))


if __name__ == '__main__':
    main()
