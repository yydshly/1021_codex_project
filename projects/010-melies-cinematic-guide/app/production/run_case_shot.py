"""Execute/resume a confirmed case shot, without persisting upload credentials."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent.parent
SKILL = Path('D:/codex/home/skills/chatart-skill/scripts/video_gen.py')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--case', required=True, choices=['book-repair', 'book-repair-r2', 'tea-moment', 'bike-kindness'])
    parser.add_argument('--shot', required=True, choices=['book-1', 'book-2', 'book-3', 'book-4', 'book-2-r2', 'book-3-r2', 'tea-1', 'tea-1-r3', 'tea-2', 'tea-3', 'bike-1', 'bike-2', 'bike-3', 'bike-4'])
    parser.add_argument('--resume', action='store_true')
    parser.add_argument('--check', action='store_true', help='Validate inputs without uploading or submitting.')
    parser.add_argument('--retry-approved', action='store_true', help='Consume a recorded approval for one failed ceramic submission.')
    args = parser.parse_args()
    plan = json.loads((HERE / f'{args.case}-plan.json').read_text(encoding='utf-8'))
    if not args.check and plan['status'] not in ('confirmed', 'in_progress', 'completed'):
        raise SystemExit('Video parameters have not been confirmed.')
    shot = next(s for s in plan['shots'] if s.get('executionId', s['id']) == args.shot)
    if args.case == 'bike-kindness':
        source = PROJECT / plan['designSource']['path']
        if hashlib.sha256(source.read_bytes()).hexdigest() != plan['designSource']['sha256']:
            raise SystemExit('Original bicycle design changed after preparation.')
        if not args.check:
            approval = plan.get('budgetApproval') or {}
            expected = {s['id']: s['promptZhTranslationOfSha256'] for s in plan['shots']}
            expected_refs = {s['id']: s['referenceHashes'] for s in plan['shots']}
            if not approval.get('confirmed') or approval.get('inputPromptHashes') != expected or approval.get('inputReferenceHashes') != expected_refs:
                raise SystemExit('Bicycle prompts and reference images require this batch approval.')
            if any(approval.get(k) != shot[k] for k in ('model', 'resolution', 'aspectRatio', 'nativeAudio')) or approval.get('generationDurations') != [s['generationDuration'] for s in plan['shots']]:
                raise SystemExit('Bicycle video specifications differ from the approved batch.')
    if args.shot == 'tea-1-r3' and plan.get('recoveryApproval', {}).get('promptSha256') != shot['promptZhTranslationOfSha256']:
        raise SystemExit('The new reference-mode input has not been confirmed.')
    if shot['promptZhTranslationOfSha256'] != hashlib.sha256(shot['prompt'].encode('utf-8')).hexdigest():
        raise SystemExit('Actual prompt changed; review its corresponding translation.')
    if shot.get('referenceHashes'):
        pairs = [(k, shot[k]) for k in ('firstFrame', 'endFrame') if shot.get(k)]
        pairs += [(name, name) for name in shot.get('referenceImages', [])]
        for key, name in pairs:
            image = PROJECT / name
            if not image.is_file() or hashlib.sha256(image.read_bytes()).hexdigest() != shot['referenceHashes'][key]:
                raise SystemExit('A reference image changed after preparation.')
    if args.check:
        print(f"Prepared {shot['id']}: {shot['model']}, {shot['generationDuration']}s, {shot['resolution']}p; no submission.")
        return
    state_path = HERE / f'{args.shot}-execution.json'
    output = PROJECT / 'assets/generated' / args.case / args.shot
    output.mkdir(parents=True, exist_ok=True)
    state = json.loads(state_path.read_text(encoding='utf-8')) if state_path.exists() else None
    if args.retry_approved:
        approval = plan.get('retryApproval', {}).get(args.shot, {})
        if args.case != 'tea-moment' or args.shot != 'tea-1' or not approval.get('confirmed') or approval.get('consumed') or not state or state.get('taskId') or state.get('exitCode') != 1:
            raise SystemExit('No unused approval for this failed submission.')
        for other in ('tea-2', 'tea-3'):
            if json.loads((HERE / f'{other}-execution.json').read_text(encoding='utf-8'))['status'] != 'completed':
                raise SystemExit('The approved retry must wait for the other two shots.')
        archive = HERE / f'{args.shot}-submit-failed-a1-execution.json'
        if archive.exists():
            raise SystemExit('The first failed attempt was already archived; do not retry again.')
        shutil.copy2(state_path, archive)
        progress = HERE / f'{args.shot}-progress.log'
        shutil.copy2(progress, HERE / f'{args.shot}-submit-failed-a1-progress.log')
        progress.write_text('', encoding='utf-8')
        approval['consumed'] = True
        (HERE / f'{args.case}-plan.json').write_text(json.dumps(plan, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        state = None
    if state and not args.resume:
        raise SystemExit('Existing execution record; inspect it instead of resubmitting.')
    if args.resume:
        if not state or not state.get('taskId') or state.get('status') == 'completed':
            raise SystemExit('Resume requires an unfinished known task ID.')
        command = [sys.executable, '-u', str(SKILL), 'query', '--type', shot['type'],
                   '--task-id', str(state['taskId']), '--output-dir', str(output),
                   '--timeout', '1200', '--interval', '20']
    else:
        if shot['promptZhTranslationOfSha256'] != hashlib.sha256(shot['prompt'].encode('utf-8')).hexdigest():
            raise SystemExit('Actual prompt changed; review its corresponding translation.')
        command = [sys.executable, '-u', str(SKILL), 'run', '--type', shot['type'],
                   '--model', shot['model'], '--prompt', shot['prompt'],
                   '--aspect-ratio', shot['aspectRatio'], '--resolution', str(shot['resolution']),
                   '--duration', str(shot['generationDuration']), '--sound', 'true', '--count', '1',
                   '--output-dir', str(output), '--timeout', '900', '--interval', '20']
        references = [PROJECT / f for f in shot.get('referenceImages', [])]
        references += [PROJECT / shot[k] for k in ('firstFrame', 'endFrame') if shot.get(k)]
        if any(not f.is_file() for f in references):
            raise SystemExit('A reference image is missing.')
        if shot.get('firstFrame'):
            if shot.get('referenceImages'):
                raise SystemExit('Do not combine reference and first/last modes.')
            command += ['--first-frame', str(PROJECT / shot['firstFrame'])]
            if shot.get('endFrame'):
                command += ['--end-frame', str(PROJECT / shot['endFrame'])]
        elif references:
            command += ['--ref-images', *map(str, references)]
        else:
            raise SystemExit('An image-to-video reference is required.')
        state = dict(shotId=shot['id'], caseId=args.case, status='starting', model=shot['model'],
                     requestedDuration=shot['generationDuration'], resolution=shot['resolution'],
                     estimatedCredits=shot['estimatedCredits'],
                     promptSha256=hashlib.sha256(shot['prompt'].encode('utf-8')).hexdigest(),
                     referenceHashes=shot.get('referenceHashes', {}))

    def save():
        state_path.write_text(json.dumps(state, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    save()
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                               text=True, encoding='utf-8', errors='replace',
                               env=dict(os.environ, PYTHONUTF8='1'))
    sensitive = re.compile(r'AccessKey|SecurityToken|Credentials|api_key|Authorization|Bearer', re.I)
    with (HERE / f'{args.shot}-progress.log').open('a', encoding='utf-8') as log:
        for line in process.stdout:
            if sensitive.search(line):
                line = '[Temporary upload credentials omitted.]\n'
            print(line, end='', flush=True)
            log.write(line)
            log.flush()
            task = re.search(r'Task submitted\. taskId:\s*(\S+)', line)
            if task:
                state.update(taskId=task[1], status='submitted')
                save()
    state['exitCode'] = process.wait()
    state['status'] = 'completed' if process.returncode == 0 else 'needs_review'
    state['files'] = [p.name for p in output.iterdir() if p.is_file()]
    save()
    raise SystemExit(process.returncode)


if __name__ == '__main__':
    main()
