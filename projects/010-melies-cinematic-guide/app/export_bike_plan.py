"""Publish the exact bicycle plan without changing original design or case counts."""
import hashlib
import json
import shutil
from pathlib import Path

APP = Path(__file__).resolve().parent
PROJECT = APP.parent


def export_bike_plan(output):
    path = APP / 'production/bike-kindness-plan.json'
    if not path.exists():
        return
    plan = json.loads(path.read_text(encoding='utf-8'))
    design_path = PROJECT / plan['designSource']['path']
    if hashlib.sha256(design_path.read_bytes()).hexdigest() != plan['designSource']['sha256']:
        raise ValueError('The bicycle production plan must bind the original design.')
    design = json.loads(design_path.read_text(encoding='utf-8'))
    if plan['status'] not in ['awaiting_confirmation', 'confirmed', 'in_progress', 'completed']:
        raise ValueError('Unknown bicycle production state.')
    if [s['id'] for s in plan['shots']] != [s['id'] for s in design['shots']] or [s['generationDuration'] for s in plan['shots']] != [5, 5, 5, 5] or plan['target']['duration'] != 20:
        raise ValueError('Bicycle plan must cover the original four five-second shots.')
    manifest = json.loads((APP / 'production/bike-reference-prompts.json').read_text(encoding='utf-8'))
    root = (PROJECT / 'assets/generated/bike-kindness').resolve()
    for run in manifest['runs']:
        for record in run['inputs'] + [run['output']]:
            image = (PROJECT / record['path']).resolve()
            if not image.is_relative_to(root) or hashlib.sha256(image.read_bytes()).hexdigest() != record['sha256']:
                raise ValueError('A bicycle image input or output changed.')
    for shot in plan['shots']:
        if hashlib.sha256(shot['prompt'].encode('utf-8')).hexdigest() != shot['promptZhTranslationOfSha256']:
            raise ValueError('Bicycle input changed; review the corresponding translation.')
        shot['referenceDisplay'] = []
        for i, name in enumerate(shot['referenceImages']):
            image = (PROJECT / name).resolve()
            if not image.is_relative_to(root) or hashlib.sha256(image.read_bytes()).hexdigest() != shot['referenceHashes'][name]:
                raise ValueError('Bicycle shot reference changed.')
            url = 'generated/bike-kindness/' + image.relative_to(root).as_posix()
            target = output / url
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(image, target)
            shot['referenceDisplay'].append(dict(label='参考图 ' + str(i + 1), url=url))
    plan['designSnapshot'] = design
    plan['recordUrl'] = 'bike-kindness-plan.json'
    payload = json.dumps(plan, ensure_ascii=False, indent=2)
    (output / plan['recordUrl']).write_text(payload + '\n', encoding='utf-8')
    (output / 'pipeline-production.js').write_text('window.PIPELINE_PRODUCTION = ' + payload + ';\n', encoding='utf-8')
    (output / 'bike-reference-prompts.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('Published bicycle production plan: ' + plan['status'])
