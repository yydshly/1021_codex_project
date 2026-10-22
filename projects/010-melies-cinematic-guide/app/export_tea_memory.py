"""Bind one ceramic film review to its real inputs, originals, edit and evidence."""
import hashlib
import json
from pathlib import Path

APP = Path(__file__).resolve().parent
PROJECT = APP.parent


def read(name):
    return json.loads((APP / name).read_text(encoding='utf-8'))


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def export_tea_memory(techniques):
    if not (APP / 'tea-case-memory.json').is_file():
        return []
    case = read('tea-case-memory.json')
    plan = read('production/tea-moment-plan.json')
    design = read('direction-example.json')
    edits = read('production/tea-edit-record.json')
    if case['id'] != 'tea-moment' or case['review']['sampleSize'] != 1 or case['review']['status'] != 'one_run_qualitative_review' or plan['status'] != 'completed':
        raise ValueError('Ceramic experience must describe one completed film run.')
    if digest(APP / 'direction-example.json') != plan['designSource']['sha256'] or design['provenance']['mediaStatus'] != 'design_only':
        raise ValueError('Keep the original ceramic design unchanged.')
    if case['emotionReview']['audienceFeedback'] is not None or case['emotionReview']['basis'] != 'assistant_visual_review':
        raise ValueError('No audience emotional validation has been collected for this run.')
    reviews = {s['shotId']: s for s in case['shotReviews']}
    if len(reviews) != 3 or set(reviews) != {s['id'] for s in plan['shots']}:
        raise ValueError('Ceramic review must cover the three actual shots.')
    original_shots = {s['id']: s for s in design['shots']}
    edit_by_id = {e['shotId']: e for e in edits['shots']}
    refs = set()
    for actual in plan['shots']:
        shot_id = actual['id']
        execution_id = actual.get('executionId', shot_id)
        state = read(f'production/{execution_id}-execution.json')
        review = reviews[shot_id]
        edited = edit_by_id[shot_id]
        if state['status'] != 'completed' or not state.get('actualMedia') or state['promptSha256'] != hashlib.sha256(actual['prompt'].encode('utf-8')).hexdigest() or state['model'] != actual['model']:
            raise ValueError('Missing completed ceramic input evidence: ' + shot_id)
        if actual['promptZhTranslationOfSha256'] != state['promptSha256']:
            raise ValueError('Review changed ceramic input translation.')
        if digest(PROJECT / state['source']) != state['sha256'] or edited['sourceSha256'] != state['sha256']:
            raise ValueError('Ceramic original changed after review.')
        if edited['sourceStart'] < 0 or edited['sourceStart'] + edited['duration'] > state['actualMedia']['duration'] + .001 or edited['duration'] != actual['editDuration']:
            raise ValueError('Ceramic edit exceeds measured source.')
        pairs = [(k, actual[k]) for k in ('firstFrame', 'endFrame') if actual.get(k)]
        pairs += [(name, name) for name in actual.get('referenceImages', [])]
        reference_frames = []
        for key, name in pairs:
            if state['referenceHashes'].get(key) != actual['referenceHashes'][key] or digest(PROJECT / name) != actual['referenceHashes'][key]:
                raise ValueError('Ceramic execution reference changed.')
            reference_frames.append(dict(role=key if key in ('firstFrame', 'endFrame') else 'reference', image=name.replace('assets/', '', 1), sha256=actual['referenceHashes'][key]))
        published = PROJECT / 'assets/generated/tea-moment/published'
        if digest(published / f'{shot_id}.mp4') != state['sha256']:
            raise ValueError('Published ceramic original does not match source.')
        for frame in review['actionReview']['evidenceFrames']:
            rel = Path(frame['image']).relative_to('generated/tea-moment')
            if '..' in rel.parts or not (published / rel).is_file() or not edited['sourceStart'] <= frame['sourceSeconds'] <= edited['sourceStart'] + edited['duration'] or abs(frame['filmSeconds'] - (edited['timeline']['start'] + frame['sourceSeconds'] - edited['sourceStart'])) > .001:
                raise ValueError('Ceramic evidence timing or file is incorrect.')
        if review['nextAttempt']['status'] != 'proposed_unverified':
            raise ValueError('Ceramic candidates have not been generated.')
        original = original_shots[shot_id]
        design_prompts = read('production/tea-design-prompts.json')
        if design_prompts['sourceSha256'] != plan['designSource']['sha256']:
            raise ValueError('Archived ceramic design prompt source mismatch.')
        review.update(title=original['title'], techniqueIds=actual['refIds'], taskId=state['taskId'],
                      designPrompt=next(s['prompts'] for s in design_prompts['shots'] if s['id'] == shot_id),
                      actualInput=dict(en=actual['prompt'], translationZh=actual['promptZhTranslation'], submittedLanguage='en', translationStatus='corresponding_translation_not_submitted', requestedDuration=actual['generationDuration'], type=actual['type'], inputMode=actual['inputMode'], referenceRole=actual['referenceRole']),
                      referenceFrames=reference_frames, actualMedia=dict(video=f'generated/tea-moment/{shot_id}.mp4', poster=f'generated/tea-moment/{shot_id}.jpg', **state['actualMedia']),
                      edit=dict(sourceStart=edited['sourceStart'], duration=edited['duration'], timeline=edited['timeline']))
        refs.update(actual['refIds'])
    if not refs.issubset(techniques):
        raise ValueError('Unknown ceramic technique reference.')
    if sum(e['duration'] for e in edits['shots']) != 15 or digest(PROJECT / edits['result']['file']) != edits['result']['sha256']:
        raise ValueError('Ceramic film does not match the recorded edit.')
    final_probe = read('production/tea-final-media-probe.json')
    final_video = next(s for s in final_probe['streams'] if s['codec_type'] == 'video')
    if abs(float(final_probe['format']['duration']) - 15) > .05 or (final_video['width'], final_video['height']) != (1920, 1080):
        raise ValueError('Ceramic final delivery does not match the measured format.')
    for pattern in case['reusePatterns']:
        if not pattern['evidenceShotIds'] or not set(pattern['evidenceShotIds']).issubset(reviews):
            raise ValueError('Ceramic lesson has no actual shot evidence.')
    case['techniqueIds'] = sorted(refs)
    case['techniques'] = [dict(id=i, nameZh=techniques[i]['name'], sourceUrl='https://melies.co/cinematic-techniques/' + techniques[i]['path']) for i in sorted(refs)]
    case['result'] = dict(video='generated/tea-moment/keep-a-moment.mp4', poster='generated/tea-moment/poster.jpg', duration=15, width=1920, height=1080, costNote=case['costNote'])
    case['execution'] = dict(model='Seedance 2.0', requestedTarget=plan['target'], generatedDurations=[5, 5, 5], editDurations=[5, 5, 5],
                             referenceImage=dict(image='generated/tea-moment/tea-1-touch.png', role='逐镜专用参考：触杯首尾、跟拍两张角色／姿态参考、后拉近远首尾；不是全片只用一张身份图。'),
                             postProduction=plan['assembly'], cost=dict(estimatedCredits=plan['estimatedCredits'], serviceReportedCredits=plan['serviceReportedCredits'], deductionVerified=plan['accountDeductionVerified'], note=case['costNote']))
    case['presentation'] = dict(inlineShotMedia=True, inlineFinalMedia=True)
    case['sourceRecords'] = ['app/tea-case-memory.json', 'app/direction-example.json', 'app/production/tea-moment-plan.json', 'app/production/tea-video-reference-prompts.json', 'app/production/tea-design-prompts.json', 'app/production/tea-edit-record.json', *[f'app/production/{s.get("executionId", s["id"])}-execution.json' for s in plan['shots']], 'app/production/tea-1-submit-failed-a1-execution.json', 'app/production/tea-1-submit-failed-a2-execution.json', 'app/production/tea-touch-first-last-attempts.json', 'app/production/tea-touch-recovery-r3.json']
    return [case]
