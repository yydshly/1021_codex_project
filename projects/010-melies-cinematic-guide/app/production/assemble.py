"""Assemble the four generated shots and add the approved Chinese end title."""
import json
from pathlib import Path
import shutil
import subprocess

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent.parent
MEDIA = PROJECT / 'assets/generated/rain-to-forest'


def probe(path):
    return json.loads(subprocess.check_output(
        ['ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(path)],
        encoding='utf-8'))


def main():
    plan = json.loads((HERE / 'rain-to-forest-plan.json').read_text(encoding='utf-8'))
    edits = json.loads((HERE / 'edit-settings.json').read_text(encoding='utf-8'))
    published = MEDIA / 'published'
    published.mkdir(exist_ok=True)
    title = HERE / 'end-title.txt'
    title.write_text(plan['assembly']['endTitle'], encoding='utf-8')
    command = ['ffmpeg', '-hide_banner', '-loglevel', 'warning', '-y']
    inputs = []
    for shot in plan['shots']:
        source = next((MEDIA / shot['id']).glob('*.mp4'))
        inputs.append((source, probe(source)))
        command += ['-i', str(source)]
    filters = []
    for index, shot in enumerate(plan['shots']):
        setting = edits[shot['id']]
        duration = shot['editDuration']
        vf = f'[{index}:v]trim=start={setting["start"]}:duration={duration},setpts=PTS-STARTPTS'
        if setting.get('crop'):
            x, y, width, height = setting['crop']
            vf += f',crop={width}:{height}:{x}:{y}'
        vf += ',scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=24,format=yuv420p'
        if index == 3:
            vf += ",drawtext=fontfile='C\\:/Windows/Fonts/msyhl.ttc':textfile=end-title.txt:fontcolor=0xf1e8cf:fontsize=62:x=1100:y=520:alpha='min(1,max(0,(t-0.5)/0.7))'"
        filters.append(vf + f'[v{index}]')
        if any(stream['codec_type'] == 'audio' for stream in inputs[index][1]['streams']):
            filters.append(f'[{index}:a]atrim=start={setting["start"]}:duration={duration},asetpts=PTS-STARTPTS,aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo[a{index}]')
        else:
            filters.append(f'anullsrc=r=48000:cl=stereo,atrim=duration={duration},asetpts=PTS-STARTPTS[a{index}]')
    filters.append('[v0][v1][v2][v3]concat=n=4:v=1:a=0,fade=t=out:st=15.75:d=0.25[video]')
    filters.append('[a0][a1]acrossfade=d=0.08:c1=tri:c2=tri[a01]')
    filters.append('[a01][a2]acrossfade=d=0.08:c1=tri:c2=tri[a012]')
    filters.append('[a012][a3]acrossfade=d=0.08:c1=tri:c2=tri,apad,atrim=duration=16,loudnorm=I=-24:TP=-2:LRA=7,afade=t=out:st=15.5:d=0.5[audio]')
    destination = published / 'rain-to-forest.mp4'
    command += ['-filter_complex', ';'.join(filters), '-map', '[video]', '-map', '[audio]',
                '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-c:a', 'aac',
                '-b:a', '160k', '-ar', '48000', '-movflags', '+faststart', '-t', '16', str(destination)]
    subprocess.run(command, cwd=HERE, check=True)
    for shot, (source, _) in zip(plan['shots'], inputs):
        shutil.copy2(source, published / f'{shot["id"]}.mp4')
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', '1',
                        '-i', str(source), '-frames:v', '1', '-q:v', '2',
                        str(published / f'{shot["id"]}.jpg')], check=True)
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', '13.8',
                    '-i', str(destination), '-frames:v', '1', '-q:v', '2',
                    str(published / 'poster.jpg')], check=True)
    result = probe(destination)
    video = next(stream for stream in result['streams'] if stream['codec_type'] == 'video')
    assert video['width'] == 1920 and video['height'] == 1080
    assert abs(float(result['format']['duration']) - 16) < 0.1
    (HERE / 'final-media-probe.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    print(f'Assembled and verified: {destination}')


if __name__ == '__main__':
    main()
