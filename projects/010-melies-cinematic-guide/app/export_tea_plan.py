"""Publish the ceramic execution plan separately from design and observed results."""
from pathlib import Path
import hashlib
import json
import shutil

APP = Path(__file__).resolve().parent
PROJECT = APP.parent


def export_tea_plan(output, design):
    plan = json.loads((APP / 'production/tea-moment-plan.json').read_text(encoding='utf-8'))
    if plan['status'] not in ['awaiting_confirmation', 'confirmed', 'in_progress', 'completed']:
        raise ValueError('Unknown ceramic production state.')
    if hashlib.sha256((APP / 'direction-example.json').read_bytes()).hexdigest() != plan['designSource']['sha256']:
        raise ValueError('Ceramic plan refers to a different original design.')
    if {s['id'] for s in plan['shots']} != {s['id'] for s in design['shots']} or sum(s['generationDuration'] for s in plan['shots']) != 15:
        raise ValueError('Ceramic plan must cover the three 5-second shots.')
    for shot in plan['shots']:
        if hashlib.sha256(shot['prompt'].encode('utf-8')).hexdigest() != shot['promptZhTranslationOfSha256']:
            raise ValueError('Review the corresponding translation after an input change.')
        images = [(k, shot[k]) for k in ['firstFrame', 'endFrame'] if shot.get(k)]
        images += [(f, f) for f in shot.get('referenceImages', [])]
        shot['referenceDisplay'] = []
        for key, name in images:
            path = (PROJECT / name).resolve()
            root = (PROJECT / 'assets/generated/tea-moment').resolve()
            if not path.is_relative_to(root) or hashlib.sha256(path.read_bytes()).hexdigest() != shot['referenceHashes'][key]:
                raise ValueError('Missing or changed ceramic reference image.')
            url = 'generated/tea-moment/' + path.relative_to(root).as_posix()
            target = output / url
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, target)
            label = {'firstFrame': '首帧', 'endFrame': '尾帧'}.get(key, '参考图 ' + str(len(shot['referenceDisplay']) + 1))
            shot['referenceDisplay'].append(dict(label=label, url=url))
    plan['designSnapshot'] = design
    plan['recordUrl'] = 'tea-moment-plan.json'
    payload = json.dumps(plan, ensure_ascii=False, indent=2)
    (output / plan['recordUrl']).write_text(payload + '\n', encoding='utf-8')
    (output / 'direction-production.js').write_text('window.DIRECTION_PRODUCTION = ' + payload + ';\n', encoding='utf-8')
    (output / 'tea-video-reference-prompts.json').write_text((APP / 'production/tea-video-reference-prompts.json').read_text(encoding='utf-8'), encoding='utf-8')
    print('Published ceramic production plan: ' + plan['status'])
