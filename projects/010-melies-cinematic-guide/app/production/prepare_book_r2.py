"""Freeze the reviewed revision inputs and the two retained baseline sources."""
import hashlib
import json
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent.parent


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    plan_path = HERE / 'book-repair-r2-plan.json'
    plan = json.loads(plan_path.read_text(encoding='utf-8'))
    if any((HERE / f'{s["id"]}-execution.json').exists() for s in plan['shots']):
        raise SystemExit('Revision already started; do not re-prepare actual inputs.')
    for shot in plan['shots']:
        shot['promptZhTranslationOfSha256'] = hashlib.sha256(shot['prompt'].encode()).hexdigest()
        shot['referenceHashes'] = {key: digest(PROJECT / shot[key]) for key in ('firstFrame', 'endFrame')}
    original_edits = json.loads((HERE / 'book-repair-edit-settings.json').read_text(encoding='utf-8'))
    retained = []
    for shot_id in plan['retainedShots']:
        source = next((PROJECT / 'assets/generated/book-repair' / shot_id).glob('*.mp4'))
        retained.append(dict(shotId=shot_id, source=source.relative_to(PROJECT).as_posix(),
                             sha256=digest(source), edit=original_edits[shot_id]))
    plan['retainedSourceRecords'] = retained
    plan_path.write_text(json.dumps(plan, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    manifest_path = HERE / 'book-r2-reference-prompts.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    for ref in manifest['references']:
        path = PROJECT / 'assets/generated/book-repair-r2/reference' / ref['name']
        ref.update(path=path.relative_to(PROJECT).as_posix(), sha256=digest(path),
                   actualResolution=list(Image.open(path).size), inputSha256=digest(PROJECT / ref['input']))
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('Prepared exactly two revision shots; reference and retained-source hashes saved.')


if __name__ == '__main__':
    main()
