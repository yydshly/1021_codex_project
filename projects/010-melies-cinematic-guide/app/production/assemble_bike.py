"""Assemble measured bicycle originals without changing their action speed."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
from inspect_bike import probe

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent.parent
MEDIA = PROJECT / 'assets/generated/bike-kindness'


def main():
    plan = json.loads((HERE / 'bike-kindness-plan.json').read_text(encoding='utf-8'))
    settings = json.loads((HERE / 'bike-edit-settings.json').read_text(encoding='utf-8'))
    published = MEDIA / 'published'
    published.mkdir(exist_ok=True)
    command = ['ffmpeg', '-hide_banner', '-loglevel', 'warning', '-y']
    sources, filters, record, elapsed = [], [], [], 0
    for shot in plan['shots']:
        execution_id = shot.get('executionId', shot['id'])
        state = json.loads((HERE / f'{execution_id}-execution.json').read_text(encoding='utf-8'))
        if state['status'] != 'completed' or not state.get('actualMedia'):
            raise ValueError('Missing measured original: ' + shot['id'])
        source = PROJECT / state['source']
        if hashlib.sha256(source.read_bytes()).hexdigest() != state['sha256']:
            raise ValueError('Original changed after review.')
        i = len(sources)
        start, duration = settings[shot['id']]['sourceStart'], shot['editDuration']
        if start < 0 or start + duration > state['actualMedia']['duration'] + .001:
            raise ValueError('Edit exceeds source bounds.')
        sources.append((shot, source, state))
        command += ['-i', str(source)]
        filters.append(f'[{i}:v]trim=start={start}:duration={duration},setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=24,format=yuv420p[v{i}]')
        if state['actualMedia']['hasAudio']:
            filters.append(f'[{i}:a]atrim=start={start}:duration={duration},asetpts=PTS-STARTPTS,aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,afade=t=in:d=0.04,afade=t=out:st={duration-.06}:d=0.06[a{i}]')
        else:
            filters.append(f'anullsrc=r=48000:cl=stereo,atrim=duration={duration},asetpts=PTS-STARTPTS[a{i}]')
        record.append(dict(shotId=shot['id'], source=state['source'], sourceSha256=state['sha256'], sourceStart=start, duration=duration, timeline=dict(start=elapsed, end=elapsed+duration)))
        elapsed += duration
    if elapsed != 20:
        raise ValueError('Expected the agreed 20-second film.')
    filters += ['[v0][v1][v2][v3]concat=n=4:v=1:a=0[video]',
                '[a0][a1][a2][a3]concat=n=4:v=0:a=1,loudnorm=I=-24:TP=-2:LRA=7,afade=t=out:st=19.7:d=0.3[audio]']
    destination = published / 'a-little-help.mp4'
    command += ['-filter_complex', ';'.join(filters), '-map', '[video]', '-map', '[audio]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-movflags', '+faststart', '-t', '20', str(destination)]
    subprocess.run(command, check=True)
    for shot, source, state in sources:
        shutil.copy2(source, published / f'{shot["id"]}.mp4')
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', '1', '-i', str(source), '-frames:v', '1', '-q:v', '2', str(published / f'{shot["id"]}.jpg')], check=True)
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', '12.5', '-i', str(destination), '-frames:v', '1', '-q:v', '2', str(published / 'poster.jpg')], check=True)
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', str(destination), '-f', 'null', '-'], check=True)
    result = probe(destination)
    video = next(s for s in result['streams'] if s['codec_type'] == 'video')
    if (video['width'], video['height']) != (1920, 1080) or abs(float(result['format']['duration']) - 20) > .05:
        raise ValueError('Measured film does not match the delivery format.')
    (HERE / 'bike-final-media-probe.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    edit_record = dict(shots=record, transforms=['proportional_scale_and_small_center_crop_to_1920x1080', '24fps', 'hard_cuts', 'no_video_freeze_or_fade'], audio=dict(process='keep_native_audio_resample_short_join_fades_loudness_normalization', semanticReview='not_listened'), speedChanges=False, generatedTitles=False,
                       result=dict(file=destination.relative_to(PROJECT).as_posix(), sha256=hashlib.sha256(destination.read_bytes()).hexdigest(), duration=float(result['format']['duration']), width=video['width'], height=video['height']))
    (HERE / 'bike-edit-record.json').write_text(json.dumps(edit_record, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('Assembled and decoded the 20-second bicycle film.')


if __name__ == '__main__':
    main()
