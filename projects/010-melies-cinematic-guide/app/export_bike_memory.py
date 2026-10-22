"""Bind one bicycle film review to its real inputs, originals, edit and evidence."""
import hashlib
import json
from pathlib import Path

APP = Path(__file__).resolve().parent
PROJECT = APP.parent


def read(name):
    return json.loads((APP / name).read_text(encoding='utf-8'))


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def export_bike_memory(techniques):
    if not (APP / 'bike-case-memory.json').is_file():
        return []
    case = read('bike-case-memory.json')
    plan = read('production/bike-kindness-plan.json')
    design = read('pipeline-example.json')
    edits = read('production/bike-edit-record.json')
    if case['id'] != 'bike-kindness' or case['review']['sampleSize'] != 1 or case['review']['status'] != 'one_run_qualitative_review' or plan['status'] != 'completed':
        raise ValueError('Bicycle experience must describe one completed film run.')
    if digest(APP / 'pipeline-example.json') != plan['designSource']['sha256'] or design['provenance']['mediaStatus'] != 'design_only':
        raise ValueError('Keep the original bicycle design unchanged.')
    if case['emotionReview']['audienceFeedback'] is not None or case['emotionReview']['basis'] != 'assistant_visual_review':
        raise ValueError('No audience emotional validation has been collected for this run.')
    approval = plan.get('budgetApproval') or {}
    if not approval.get('confirmed') or approval.get('inputPromptHashes') != {s['id']: s['promptZhTranslationOfSha256'] for s in plan['shots']} or approval.get('inputReferenceHashes') != {s['id']: s['referenceHashes'] for s in plan['shots']}:
        raise ValueError('Actual bicycle inputs must belong to the approved batch.')
    reviews = {s['shotId']: s for s in case['shotReviews']}
    if len(reviews) != 4 or set(reviews) != {s['id'] for s in plan['shots']}:
        raise ValueError('Bicycle review must cover the four actual shots.')
    original_shots = {s['id']: s for s in design['shots']}
    edit_by_id = {e['shotId']: e for e in edits['shots']}
    refs = set()
    tasks, reported_cost = set(), 0
    for actual in plan['shots']:
        shot_id = actual['id']
        execution_id = actual.get('executionId', shot_id)
        state = read(f'production/{execution_id}-execution.json')
        tasks.add(state.get('taskId'))
        reported_cost += state.get('reportedCredits', 0)
        review = reviews[shot_id]
        edited = edit_by_id[shot_id]
        if state['status'] != 'completed' or not state.get('actualMedia') or state['promptSha256'] != hashlib.sha256(actual['prompt'].encode('utf-8')).hexdigest() or state['model'] != actual['model']:
            raise ValueError('Missing completed bicycle input evidence: ' + shot_id)
        if actual['promptZhTranslationOfSha256'] != state['promptSha256']:
            raise ValueError('Review changed bicycle input translation.')
        if digest(PROJECT / state['source']) != state['sha256'] or edited['sourceSha256'] != state['sha256']:
            raise ValueError('Bicycle original changed after review.')
        if edited['sourceStart'] < 0 or edited['sourceStart'] + edited['duration'] > state['actualMedia']['duration'] + .001 or edited['duration'] != actual['editDuration']:
            raise ValueError('Bicycle edit exceeds measured source.')
        pairs = [(k, actual[k]) for k in ('firstFrame', 'endFrame') if actual.get(k)]
        pairs += [(name, name) for name in actual.get('referenceImages', [])]
        reference_frames = []
        for key, name in pairs:
            if state['referenceHashes'].get(key) != actual['referenceHashes'][key] or digest(PROJECT / name) != actual['referenceHashes'][key]:
                raise ValueError('Bicycle execution reference changed.')
            reference_frames.append(dict(role=key if key in ('firstFrame', 'endFrame') else 'reference', image=name.replace('assets/', '', 1), sha256=actual['referenceHashes'][key]))
        published = PROJECT / 'assets/generated/bike-kindness/published'
        if digest(published / f'{shot_id}.mp4') != state['sha256']:
            raise ValueError('Published bicycle original does not match source.')
        for frame in review['actionReview']['evidenceFrames']:
            rel = Path(frame['image']).relative_to('generated/bike-kindness')
            if '..' in rel.parts or not (published / rel).is_file() or not edited['sourceStart'] <= frame['sourceSeconds'] <= edited['sourceStart'] + edited['duration'] or abs(frame['filmSeconds'] - (edited['timeline']['start'] + frame['sourceSeconds'] - edited['sourceStart'])) > .001:
                raise ValueError('Bicycle evidence timing or file is incorrect.')
        if review['nextAttempt']['status'] != 'proposed_unverified':
            raise ValueError('Bicycle candidates have not been generated.')
        original = original_shots[shot_id]
        design_prompts = read('production/bike-design-prompts.json')
        if design_prompts['sourceSha256'] != plan['designSource']['sha256']:
            raise ValueError('Archived bicycle design prompt source mismatch.')
        review.update(title=original['title'], techniqueIds=actual['refIds'], taskId=state['taskId'],
                      designPrompt=next(s['prompts'] for s in design_prompts['shots'] if s['id'] == shot_id),
                      actualInput=dict(en=actual['prompt'], translationZh=actual['promptZhTranslation'], submittedLanguage='en', translationStatus='corresponding_translation_not_submitted', requestedDuration=actual['generationDuration'], type=actual['type'], inputMode=actual['inputMode'], referenceRole=actual['referenceRole']),
                      referenceFrames=reference_frames, actualMedia=dict(video=f'generated/bike-kindness/{shot_id}.mp4', poster=f'generated/bike-kindness/{shot_id}.jpg', **state['actualMedia']),
                      edit=dict(sourceStart=edited['sourceStart'], duration=edited['duration'], timeline=edited['timeline']))
        refs.update(actual['refIds'])
    if not refs.issubset(techniques):
        raise ValueError('Unknown bicycle technique reference.')
    if len(tasks) != 4 or None in tasks or reported_cost != plan['serviceReportedCredits']:
        raise ValueError('Bicycle run must bind four distinct completed tasks and their reported costs.')
    if sum(e['duration'] for e in edits['shots']) != 20 or digest(PROJECT / edits['result']['file']) != edits['result']['sha256']:
        raise ValueError('Bicycle film does not match the recorded edit.')
    final_probe = read('production/bike-final-media-probe.json')
    final_video = next(s for s in final_probe['streams'] if s['codec_type'] == 'video')
    if abs(float(final_probe['format']['duration']) - 20) > .05 or (final_video['width'], final_video['height']) != (1920, 1080):
        raise ValueError('Bicycle final delivery does not match the measured format.')
    for pattern in case['reusePatterns']:
        if not pattern['evidenceShotIds'] or not set(pattern['evidenceShotIds']).issubset(reviews):
            raise ValueError('Bicycle lesson has no actual shot evidence.')
    case['techniqueIds'] = sorted(refs)
    case['techniques'] = [dict(id=i, nameZh=techniques[i]['name'], sourceUrl='https://melies.co/cinematic-techniques/' + techniques[i]['path']) for i in sorted(refs)]
    case['result'] = dict(video='generated/bike-kindness/a-little-help.mp4', poster='generated/bike-kindness/poster.jpg', duration=20, width=1920, height=1080, costNote=case['costNote'])
    case['execution'] = dict(model='Seedance 2.0', requestedTarget=plan['target'], generatedDurations=[5, 5, 5, 5], editDurations=[5, 5, 5, 5],
                             referenceImage=dict(image='generated/bike-kindness/reference/bike-1-start.png', role='五张专用普通参考：等待、擦拭、交接前后两图与车旁推行起态；静态不代替动作过程。'),
                             postProduction=plan['assembly'], cost=dict(estimatedCredits=plan['estimatedCredits'], serviceReportedCredits=plan['serviceReportedCredits'], deductionVerified=plan['accountDeductionVerified'], note=case['costNote']))
    case['presentation'] = dict(inlineShotMedia=True, inlineFinalMedia=True)
    case['sourceRecords'] = ['app/bike-case-memory.json', 'app/pipeline-example.json', 'app/production/bike-kindness-plan.json', 'app/production/bike-reference-prompts.json', 'app/production/bike-design-prompts.json', 'app/production/bike-edit-record.json', 'app/production/bike-preflight.json', 'app/production/bike-3-query-recovery.json', 'app/production/bike-3-connection-interruption-execution.json', *[f'app/production/{s.get("executionId", s["id"])}-execution.json' for s in plan['shots']]]
    if case.get('archiveReview'):
        case['sourceRecords'].append('app/archive-summary.json')
    return [case]
