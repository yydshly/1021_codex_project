"""Measure/decode generated originals and extract timestamped review frames."""
import argparse
import json
from pathlib import Path
import subprocess

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent.parent
MEDIA = PROJECT / 'assets/generated/book-repair'


def probe(path):
    return json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams',
                                               '-show_format', '-of', 'json', str(path)], encoding='utf-8'))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--revision', action='store_true')
    args = parser.parse_args()
    media = PROJECT / 'assets/generated/book-repair-r2' if args.revision else MEDIA
    shot_ids = ['book-2-r2', 'book-3-r2'] if args.revision else ['book-1', 'book-2', 'book-3', 'book-4']
    review_dir = media / 'review'
    review_dir.mkdir(exist_ok=True)
    font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 18)
    for shot_id in shot_ids:
        state_path = HERE / f'{shot_id}-execution.json'
        state = json.loads(state_path.read_text(encoding='utf-8'))
        if state['status'] != 'completed':
            print(shot_id + ': not completed; skipped')
            continue
        if state.get('actualMedia') and (review_dir / f'{shot_id}-contact-sheet.jpg').is_file():
            print(shot_id + ': measured frames already available')
            continue
        sources = list((media / shot_id).glob('*.mp4'))
        if len(sources) != 1:
            raise ValueError('Expected one original video for ' + shot_id)
        source = sources[0]
        result = probe(source)
        video = next(s for s in result['streams'] if s['codec_type'] == 'video')
        duration = float(result['format']['duration'])
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', str(source), '-f', 'null', '-'], check=True)
        measured = dict(duration=duration, width=video['width'], height=video['height'],
                        frameRate=video['r_frame_rate'], videoCodec=video['codec_name'],
                        hasAudio=any(s['codec_type'] == 'audio' for s in result['streams']),
                        byteSize=source.stat().st_size)
        state['actualMedia'] = measured
        state_path.write_text(json.dumps(state, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        (HERE / f'{shot_id}-media-probe.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
        timestamps = [0.1, *[float(i) for i in range(1, int(duration))], max(0.1, duration - .2)]
        frames = []
        for index, timestamp in enumerate(timestamps):
            dest = review_dir / f'{shot_id}-{index:02d}.jpg'
            subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', str(timestamp),
                            '-i', str(source), '-frames:v', '1', '-q:v', '2', str(dest)], check=True)
            frame = Image.open(dest).convert('RGB')
            frame.thumbnail((640, 360))
            cell = Image.new('RGB', (640, 390), '#171c17')
            cell.paste(frame, ((640 - frame.width) // 2, 30))
            ImageDraw.Draw(cell).text((12, 5), f'{shot_id}  {timestamp:.2f}s', fill='white', font=font)
            frames.append(cell)
        cols = 2
        sheet = Image.new('RGB', (cols * 640, ((len(frames) + cols - 1) // cols) * 390), '#171c17')
        for index, frame in enumerate(frames):
            sheet.paste(frame, ((index % cols) * 640, (index // cols) * 390))
        sheet.save(review_dir / f'{shot_id}-contact-sheet.jpg', quality=92)
        print(shot_id + ': ' + json.dumps(measured))


if __name__ == '__main__':
    main()
