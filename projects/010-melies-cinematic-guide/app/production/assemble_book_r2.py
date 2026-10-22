"""Replace only two sources; preserve baseline footage and exact retained cuts."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess

from inspect_book import probe

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent.parent
MEDIA = PROJECT / 'assets/generated/book-repair-r2'


def read(name):
    return json.loads((HERE / name).read_text(encoding='utf-8'))


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run(command):
    subprocess.run(command, cwd=HERE, check=True)


def main():
    plan = read('book-repair-r2-plan.json')
    edits = read('book-repair-edit-settings.json')
    # Use the existing cuts unless a reviewed replacement range is explicitly recorded.
    revision_edits = read('book-r2-reviewed-ranges.json')
    published = MEDIA / 'published'
    published.mkdir(exist_ok=True)
    command = ['ffmpeg', '-hide_banner', '-loglevel', 'warning', '-y']
    sources, filters, records, elapsed = [], [], [], 0
    for timeline_id in ['book-1', 'book-2', 'book-3', 'book-4']:
        source_id = timeline_id + '-r2' if timeline_id in ('book-2', 'book-3') else timeline_id
        state = read(f'{source_id}-execution.json')
        if state['status'] != 'completed' or not state.get('actualMedia'):
            raise ValueError('Missing measured completed source: ' + source_id)
        folder = MEDIA if source_id.endswith('-r2') else PROJECT / 'assets/generated/book-repair'
        source = next((folder / source_id).glob('*.mp4'))
        setting = revision_edits[source_id] if source_id.endswith('-r2') else edits[source_id]
        start, duration = setting['start'], setting['duration']
        result = probe(source)
        if start < 0 or start + duration > float(result['format']['duration']):
            raise ValueError('Edit outside source.')
        if timeline_id in plan['retainedShots']:
            original = next(s for s in plan['retainedSourceRecords'] if s['shotId'] == timeline_id)
            if sha(source) != original['sha256'] or setting != original['edit']:
                raise ValueError('Retained source changed.')
        records.append(dict(timelineShotId=timeline_id, sourceShotId=source_id,
                            source=source.relative_to(PROJECT).as_posix(), sourceSha256=sha(source),
                            sourceStart=start, duration=duration, timeline=dict(start=elapsed, end=elapsed + duration)))
        elapsed += duration
        sources.append((source_id, source, result, setting))
        command += ['-i', str(source)]
    assert elapsed == 18
    for i, (shot_id, source, result, setting) in enumerate(sources):
        start, duration = setting['start'], setting['duration']
        vf = f'[{i}:v]trim=start={start}:duration={duration},setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=24,format=yuv420p'
        if i == 3:
            position = edits['title']
            vf += f",drawtext=fontfile='C\\:/Windows/Fonts/msyhl.ttc':textfile=book-end-title.txt:fontcolor={position['color']}:fontsize={position['fontSize']}:x={position['x']}:y={position['y']}:shadowcolor=black@0.3:shadowx=1:shadowy=2:alpha='min(1,max(0,(t-0.6)/0.6))'"
        filters.append(vf + f'[v{i}]')
        if any(s['codec_type'] == 'audio' for s in result['streams']):
            filters.append(f'[{i}:a]atrim=start={start}:duration={duration},asetpts=PTS-STARTPTS,aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,afade=t=in:d=0.04,afade=t=out:st={duration-.06}:d=0.06[a{i}]')
        else:
            filters.append(f'anullsrc=r=48000:cl=stereo,atrim=duration={duration},asetpts=PTS-STARTPTS[a{i}]')
    filters.append('[v0][v1][v2][v3]concat=n=4:v=1:a=0,fade=t=out:st=17.75:d=0.25[video]')
    filters.append('[a0][a1][a2][a3]concat=n=4:v=0:a=1,loudnorm=I=-24:TP=-2:LRA=7,afade=t=out:st=17.5:d=0.5[audio]')
    destination = published / 'let-the-story-continue-r2.mp4'
    command += ['-filter_complex', ';'.join(filters), '-map', '[video]', '-map', '[audio]',
                '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-c:a', 'aac', '-b:a', '160k',
                '-ar', '48000', '-movflags', '+faststart', '-t', '18', str(destination)]
    run(command)
    for shot_id, source, _, setting in sources:
        if not shot_id.endswith('-r2'):
            continue
        shutil.copy2(source, published / f'{shot_id}.mp4')
        run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', str(setting['start'] + 1), '-i', str(source), '-frames:v', '1', '-q:v', '2', str(published / f'{shot_id}.jpg')])
    shutil.copytree(MEDIA / 'reference', published / 'reference', dirs_exist_ok=True)
    run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', '12.5', '-i', str(destination), '-frames:v', '1', '-q:v', '2', str(published / 'poster.jpg')])
    run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', str(destination), '-f', 'null', '-'])
    result = probe(destination)
    video = next(s for s in result['streams'] if s['codec_type'] == 'video')
    assert (video['width'], video['height']) == (1920, 1080)
    assert abs(float(result['format']['duration']) - 18) < .05
    (HERE / 'book-r2-final-media-probe.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    record = dict(shots=records, finalSha256=sha(destination), unchangedTitle=edits['title'],
                  encoding='Same baseline normalization, title, segment fades and 18-second timeline; re-encoded final, not a pixel-lock claim.')
    (HERE / 'book-r2-edit-record.json').write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('Assembled and decoded 18-second revision; retained source hashes and ranges unchanged.')


if __name__ == '__main__':
    main()
