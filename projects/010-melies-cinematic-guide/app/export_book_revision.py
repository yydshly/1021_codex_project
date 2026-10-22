"""Attach the measured two-shot revision without replacing baseline evidence."""
import hashlib
import json
from pathlib import Path

APP = Path(__file__).resolve().parent


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def attach_book_revision(case):
    record = APP / 'book-revision-r2.json'
    if not record.exists():
        return
    revision = read(record)
    plan = read(APP / 'production/book-repair-r2-plan.json')
    assembly = read(APP / 'production/book-r2-edit-record.json')
    references = read(APP / 'production/book-r2-reference-prompts.json')
    if revision['id'] != 'book-repair-r2' or revision['status'] != 'completed_qualitative_revision' or plan['status'] != 'completed':
        raise ValueError('Revision needs a completed execution and an actual qualitative review.')
    expected = {'book-2-r2': 'book-2', 'book-3-r2': 'book-3'}
    if {s['id']: s['replacesShotId'] for s in plan['shots']} != expected or {s['shotId'] for s in revision['shots']} != set(expected):
        raise ValueError('Revision must replace exactly the needle and closure shots.')
    originals = {s['shotId']: s for s in case['shotReviews']}
    retained = {r['shotId']: r for r in plan['retainedSourceRecords']}
    if set(retained) != {'book-1', 'book-4'}:
        raise ValueError('Brush and handover must be retained.')
    for shot_id, source in retained.items():
        path = APP.parent / source['source']
        edit = next(s for s in assembly['shots'] if s['timelineShotId'] == shot_id)
        original = originals[shot_id]['edit']
        if sha(path) != source['sha256'] or edit['sourceSha256'] != source['sha256'] or edit['source'] != source['source'] or edit['sourceStart'] != original['sourceStart'] or edit['duration'] != original['duration']:
            raise ValueError('Retained source or cut range changed: ' + shot_id)
    published = APP.parent / 'assets/generated/book-repair-r2/published'
    final = published / Path(revision['result']['video']).name
    probe = read(APP / 'production/book-r2-final-media-probe.json')
    video = next(s for s in probe['streams'] if s['codec_type'] == 'video')
    if not final.is_file() or sha(final) != assembly['finalSha256'] or (video['width'], video['height']) != (1920, 1080) or abs(float(probe['format']['duration']) - 18) > .05:
        raise ValueError('Revision final film does not match its measured assembly.')
    if [s['timelineShotId'] for s in assembly['shots']] != ['book-1', 'book-2', 'book-3', 'book-4'] or [s['duration'] for s in assembly['shots']] != [4, 6, 4, 4]:
        raise ValueError('Revision changed the agreed sequence or duration.')
    by_id = {s['id']: s for s in plan['shots']}
    for shot in revision['shots']:
        actual = by_id[shot['shotId']]
        state = read(APP / f'production/{shot["shotId"]}-execution.json')
        if state['status'] != 'completed' or not state.get('actualMedia') or state['model'] != actual['model']:
            raise ValueError('Missing measured revision source.')
        if hashlib.sha256(actual['prompt'].encode()).hexdigest() != actual['promptZhTranslationOfSha256']:
            raise ValueError('Revision input translation is stale.')
        for key in ('firstFrame', 'endFrame'):
            if sha(APP.parent / actual[key]) != actual['referenceHashes'][key]:
                raise ValueError('Submitted reference changed.')
        edit = next(s for s in assembly['shots'] if s['sourceShotId'] == shot['shotId'])
        if edit['sourceStart'] < 0 or edit['sourceStart'] + edit['duration'] > state['actualMedia']['duration'] + .001 or sha(APP.parent / edit['source']) != edit['sourceSha256']:
            raise ValueError('Revision edit source/range is not valid.')
        published_source = published / f'{shot["shotId"]}.mp4'
        if not published_source.is_file() or sha(published_source) != edit['sourceSha256']:
            raise ValueError('Revision published original missing.')
        for frame in shot['evidenceFrames']:
            relative = Path(frame['image']).relative_to('generated/book-repair-r2')
            if '..' in relative.parts or not (published / relative).is_file():
                raise ValueError('Revision evidence frame missing.')
            if not edit['sourceStart'] <= frame['sourceSeconds'] <= edit['sourceStart'] + edit['duration'] or abs(frame['filmSeconds'] - (edit['timeline']['start'] + frame['sourceSeconds'] - edit['sourceStart'])) > .001:
                raise ValueError('Revision evidence time differs from actual edit.')
        baseline = originals[expected[shot['shotId']]]
        shot.update(before=dict(shotId=baseline['shotId'], actualMedia=baseline['actualMedia'], logicReview=baseline['logicReview']),
                    techniqueIds=baseline['techniqueIds'], taskId=state['taskId'],
                    actualInput=dict(en=actual['prompt'], translationZh=actual['promptZhTranslation'],
                                     submittedLanguage='en', translationStatus='corresponding_translation_not_submitted',
                                     requestedDuration=actual['generationDuration'], referenceRole=actual['referenceRole']),
                    actualMedia=dict(video=f'generated/book-repair-r2/{shot["shotId"]}.mp4',
                                     poster=f'generated/book-repair-r2/{shot["shotId"]}.jpg', **state['actualMedia']),
                    referenceFrames=[dict(role=k, image='generated/book-repair-r2/reference/' + Path(actual[k]).name) for k in ('firstFrame', 'endFrame')], edit=edit)
    revision.update(originalResult=case['result'], cost=dict(estimatedCredits=plan['estimatedCredits'],
                    serviceReportedCredits=plan.get('serviceReportedCredits'), deductionVerified=plan['accountDeductionVerified']),
                    referenceGeneration=references, retainedSourceRecords=retained,
                    sourceRecords=['app/book-revision-r2.json', 'app/production/book-repair-r2-plan.json',
                                   'app/production/book-r2-edit-record.json', 'app/production/book-r2-reference-prompts.json',
                                   *[f'app/production/{s}-execution.json' for s in expected]])
    case['revisions'] = [revision]
    case['latestResult'] = revision['result']
    case['revisionSummary'] = revision['summary']
