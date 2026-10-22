"""Export an authored design separately from actual production case evidence."""
import hashlib
import json
import shutil
from pathlib import Path

APP = Path(__file__).resolve().parent


def export_pipeline(output):
    source = APP / 'pipeline-example.json'
    plan = json.loads(source.read_text(encoding='utf-8'))
    capabilities = json.loads((output / 'capabilities.json').read_text(encoding='utf-8'))['techniques']
    cases = json.loads((output / 'case-library.json').read_text(encoding='utf-8'))['cases']
    known = {'technique': {r['id'] for r in capabilities}, 'case': {c['id'] for c in cases}}
    if plan['schemaVersion'] != 3 or plan['kind'] != 'creative_direction_pipeline' or plan['provenance']['mediaStatus'] != 'design_only':
        raise ValueError('Pipeline example must remain a version-3 design, not production evidence.')
    refs = plan['referenceSelection']
    for ref in refs['selected'] + refs['rejected']:
        if ref['type'] not in known or ref['id'] not in known[ref['type']]:
            raise ValueError('Unknown pipeline reference.')
    if [b['shotId'] for b in plan['situation']['causalChain']] != [s['id'] for s in plan['shots']]:
        raise ValueError('Situation beats must map to the actual ordered shots.')
    if len(plan['shots']) != plan['brief']['shotCount'] or sum(s['duration'] for s in plan['shots']) != plan['brief']['duration']:
        raise ValueError('Pipeline example duration does not match brief.')
    for kind, ids in [('case', set(plan['provenance']['referenceCaseIds'])),
                      ('technique', {r['id'] for s in plan['shots'] for r in s['references']})]:
        if ids != {r['id'] for r in refs['selected'] if r['type'] == kind}:
            raise ValueError('Pipeline reference selections must match design provenance and shots.')
    shutil.copy2(source, output / source.name)
    (output / 'pipeline-example.js').write_text('window.PIPELINE_EXAMPLE = ' + json.dumps(plan, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
    # Snapshot only the selected records so another model can read complete context.
    selected = {kind: {r['id'] for r in refs['selected'] if r['type'] == kind} for kind in known}
    technique_ids = selected['technique'] | {r['id'] for r in refs['rejected'] if r['type'] == 'technique'}
    bundle = dict(schemaVersion=1, kind='authored_design_reference_bundle', mediaStatus='design_only',
                  designFile=source.name, designSha256=hashlib.sha256(source.read_bytes()).hexdigest(),
                  note='完整文字资料快照，不代表本轮观看媒体；新题材尚未生成，不增加实际案例数。',
                  techniques=[r for r in capabilities if r['id'] in technique_ids],
                  cases=[c for c in cases if c['id'] in selected['case']],
                  storyboard=plan)
    (output / 'pipeline-reference-bundle.json').write_text(json.dumps(bundle, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('Exported three-stage creative design and selected full references (design only).')
