"""Assemble approved book footage using reviewed source ranges; add final title."""
import json
from pathlib import Path
import shutil
import subprocess

from inspect_book import probe

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent.parent
MEDIA = PROJECT / 'assets/generated/book-repair'


def main():
    plan = json.loads((HERE / 'book-repair-plan.json').read_text(encoding='utf-8'))
    edits = json.loads((HERE / 'book-repair-edit-settings.json').read_text(encoding='utf-8'))
    published = MEDIA / 'published'
    published.mkdir(exist_ok=True)
    title_file = HERE / 'book-end-title.txt'
    title_file.write_text(plan['assembly']['endTitle'], encoding='utf-8')
    command = ['ffmpeg', '-hide_banner', '-loglevel', 'warning', '-y']
    sources, filters = [], []
    for shot in plan['shots']:
        state = json.loads((HERE / f'{shot["id"]}-execution.json').read_text(encoding='utf-8'))
        if state['status'] != 'completed':
            raise ValueError('Missing original for ' + shot['id'])
        source = next((MEDIA / shot['id']).glob('*.mp4'))
        sources.append((source, probe(source)))
        command += ['-i', str(source)]
    for i, shot in enumerate(plan['shots']):
        setting, duration = edits[shot['id']], shot['editDuration']
        if setting['start'] < 0 or setting['start'] + duration > float(sources[i][1]['format']['duration']):
            raise ValueError('Reviewed edit exceeds source bounds.')
        vf = f'[{i}:v]trim=start={setting["start"]}:duration={duration},setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=24,format=yuv420p'
        if i == 3:
            # Placement is chosen after reviewing the actual composition, not assumed from the prompt.
            position = edits['title']
            vf += f",drawtext=fontfile='C\\:/Windows/Fonts/msyhl.ttc':textfile=book-end-title.txt:fontcolor={position['color']}:fontsize={position['fontSize']}:x={position['x']}:y={position['y']}:shadowcolor=black@0.3:shadowx=1:shadowy=2:alpha='min(1,max(0,(t-0.6)/0.6))'"
        filters.append(vf + f'[v{i}]')
        if any(s['codec_type'] == 'audio' for s in sources[i][1]['streams']):
            filters.append(f'[{i}:a]atrim=start={setting["start"]}:duration={duration},asetpts=PTS-STARTPTS,aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,afade=t=in:d=0.04,afade=t=out:st={duration-.06}:d=0.06[a{i}]')
        else:
            filters.append(f'anullsrc=r=48000:cl=stereo,atrim=duration={duration},asetpts=PTS-STARTPTS[a{i}]')
    filters.append('[v0][v1][v2][v3]concat=n=4:v=1:a=0,fade=t=out:st=17.75:d=0.25[video]')
    filters.append('[a0][a1][a2][a3]concat=n=4:v=0:a=1,loudnorm=I=-24:TP=-2:LRA=7,afade=t=out:st=17.5:d=0.5[audio]')
    destination = published / 'let-the-story-continue.mp4'
    command += ['-filter_complex', ';'.join(filters), '-map', '[video]', '-map', '[audio]',
                '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-c:a', 'aac', '-b:a', '160k',
                '-ar', '48000', '-movflags', '+faststart', '-t', '18', str(destination)]
    subprocess.run(command, cwd=HERE, check=True)
    for shot, (source, _) in zip(plan['shots'], sources):
        shutil.copy2(source, published / f'{shot["id"]}.mp4')
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', '1', '-i', str(source),
                        '-frames:v', '1', '-q:v', '2', str(published / f'{shot["id"]}.jpg')], check=True)
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', '16.5', '-i', str(destination),
                    '-frames:v', '1', '-q:v', '2', str(published / 'poster.jpg')], check=True)
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', str(destination), '-f', 'null', '-'], check=True)
    result = probe(destination)
    video = next(s for s in result['streams'] if s['codec_type'] == 'video')
    assert (video['width'], video['height']) == (1920, 1080)
    assert abs(float(result['format']['duration']) - 18) < .05
    (HERE / 'book-final-media-probe.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    print('Assembled and decoded 18-second book movie: ' + str(destination))


if __name__ == '__main__':
    main()
