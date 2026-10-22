"""Extract evenly spaced action frames, with no image synthesis or retouching."""
from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
MEDIA = HERE.parent.parent / 'assets/generated/book-repair-r2'


def main():
    font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 18)
    for shot_id, end in [('book-2-r2', 10), ('book-3-r2', 5)]:
        source = next((MEDIA / shot_id).glob('*.mp4'))
        frames = []
        folder = MEDIA / 'review/motion' / shot_id
        folder.mkdir(parents=True, exist_ok=True)
        # Four samples per second support location/hinge tracking; not a full frame-by-frame proof.
        for step in range(end * 4):
            timestamp = max(.04, step / 4)
            destination = folder / f'{timestamp:05.2f}.jpg'
            subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', str(timestamp),
                            '-i', str(source), '-frames:v', '1', '-q:v', '2', str(destination)], check=True)
            frame = Image.open(destination).convert('RGB')
            frame.thumbnail((640, 360))
            cell = Image.new('RGB', (640, 390), '#171c17')
            cell.paste(frame, ((640-frame.width)//2, 30))
            ImageDraw.Draw(cell).text((12, 5), f'{shot_id}: {timestamp:.2f}s', font=font, fill='white')
            frames.append(cell)
        # Four-second sheets remain readable without producing one very tall image.
        for offset in range(0, len(frames), 16):
            batch = frames[offset:offset+16]
            sheet = Image.new('RGB', (2560, ((len(batch)+3)//4)*390), '#171c17')
            for index, frame in enumerate(batch):
                sheet.paste(frame, ((index%4)*640, (index//4)*390))
            sheet.save(MEDIA / 'review' / f'{shot_id}-motion-{offset//16}.jpg', quality=93)
        print('Extracted quarter-second motion samples for ' + shot_id)


if __name__ == '__main__':
    main()
