"""Run one approved video shot through the installed ChatArt skill.

Only sanitized progress is persisted: the upload helper prints temporary storage
credentials, so its response must never reach project logs or console output.
"""
import json
import os
from pathlib import Path
import re
import subprocess
import sys

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent.parent
PLAN = HERE / 'rain-to-forest-plan.json'
SKILL = Path('D:/codex/home/skills/chatart-skill/scripts/video_gen.py')


def main():
    shot_id = sys.argv[1]
    plan = json.loads(PLAN.read_text(encoding='utf-8'))
    if plan['status'] not in ('confirmed', 'in_progress', 'completed'):
        raise SystemExit('The generation plan must be confirmed first.')
    shot = next(item for item in plan['shots'] if item['id'] == shot_id)
    state_path = HERE / f'{shot_id}-execution.json'
    if state_path.exists():
        raise SystemExit('An execution record exists; inspect it before retrying.')
    output = PROJECT / 'assets/generated/rain-to-forest' / shot_id
    output.mkdir(parents=True, exist_ok=True)
    args = [sys.executable, '-u', str(SKILL), 'run', '--type', shot['type'],
            '--model', shot['model'], '--prompt', shot['prompt'],
            '--aspect-ratio', shot['aspectRatio'], '--resolution', str(shot['resolution']),
            '--duration', str(shot['generationDuration']), '--sound', 'true',
            '--count', '1', '--output-dir', str(output), '--timeout', '900', '--interval', '20']
    if shot['usesProductReference']:
        reference = PROJECT / 'assets/generated/rain-to-forest/reference/product-reference.png'
        if not reference.exists():
            raise SystemExit('Product reference is missing.')
        args += ['--ref-images', str(reference)]
    state = {'shotId': shot_id, 'status': 'starting', 'model': shot['model'],
             'duration': shot['generationDuration'], 'resolution': shot['resolution'],
             'estimatedCredits': shot['estimatedCredits']}

    def save():
        state_path.write_text(json.dumps(state, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    save()
    process = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                               text=True, encoding='utf-8', errors='replace',
                               env=dict(os.environ, PYTHONUTF8='1'))
    sensitive = re.compile(r'AccessKey|SecurityToken|Credentials|api_key|Authorization|Bearer', re.I)
    with (HERE / f'{shot_id}-progress.log').open('w', encoding='utf-8') as log:
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
    state['files'] = [item.name for item in output.iterdir() if item.is_file()]
    save()
    raise SystemExit(process.returncode)


if __name__ == '__main__':
    main()
