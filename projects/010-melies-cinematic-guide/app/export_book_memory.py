"""Join the book review to real execution records, never to storyboard claims."""
import hashlib
import json
from pathlib import Path
from export_book_revision import attach_book_revision

APP = Path(__file__).resolve().parent


def export_book_memory(techniques):
    source = APP / 'book-case-memory.json'
    if not source.exists():
        return []
    case = json.loads(source.read_text(encoding='utf-8'))
    if case['id'] != 'book-repair' or case['review']['sampleSize'] != 1 or case['review']['status'] != 'one_run_qualitative_review':
        raise ValueError('Book review must describe one actual run.')
    plan = json.loads((APP / 'production/book-repair-plan.json').read_text(encoding='utf-8'))
    design = json.loads((APP / 'studio-book-repair.json').read_text(encoding='utf-8'))
    design_prompts = json.loads((APP / 'production/book-design-prompts.json').read_text(encoding='utf-8'))
    if design_prompts['designSourceSha256'] != hashlib.sha256((APP / 'studio-book-repair.json').read_bytes()).hexdigest():
        raise ValueError('Original book design changed; review archived design prompts.')
    prompts_by_id = {s['id']: s['prompts'] for s in design_prompts['shots']}
    edits = json.loads((APP / 'production/book-repair-edit-settings.json').read_text(encoding='utf-8'))
    actual_shots = {s['id']: s for s in plan['shots']}
    designed_shots = {s['id']: s for s in design['shots']}
    reviews = case['shotReviews']
    if plan['status'] != 'completed' or len(reviews) != len(designed_shots) or {s['shotId'] for s in reviews} != set(designed_shots):
        raise ValueError('Book execution / review is incomplete.')
    timeline, elapsed = {}, 0
    for shot in design['shots']:
        timeline[shot['id']] = dict(start=elapsed, end=elapsed + shot['duration'])
        elapsed += shot['duration']
    media_dir = APP.parent / 'assets/generated/book-repair/published'
    if not (media_dir / Path(case['result']['video']).name).is_file():
        raise ValueError('Book final movie is missing.')
    final_probe = json.loads((APP / 'production/book-final-media-probe.json').read_text(encoding='utf-8'))
    final_video = next(s for s in final_probe['streams'] if s['codec_type'] == 'video')
    if (final_video['width'], final_video['height']) != (case['result']['width'], case['result']['height']) or abs(float(final_probe['format']['duration']) - case['result']['duration']) > .05:
        raise ValueError('Book result does not match the measured final movie.')
    refs = set()
    for review in reviews:
        shot_id = review['shotId']
        original, actual = designed_shots[shot_id], actual_shots[shot_id]
        state = json.loads((APP / f'production/{shot_id}-execution.json').read_text(encoding='utf-8'))
        if state['status'] != 'completed' or state['model'] != actual['model'] or not state.get('actualMedia'):
            raise ValueError('No measured completed video for ' + shot_id)
        start = edits[shot_id]['start']
        if not isinstance(start, (int, float)) or start < 0 or start + original['duration'] > state['actualMedia']['duration'] + .001 or actual['editDuration'] != original['duration'] or edits[shot_id]['duration'] != original['duration']:
            raise ValueError('Book edit exceeds the measured source or changes the agreed duration: ' + shot_id)
        if actual['promptZhTranslationOfSha256'] != hashlib.sha256(actual['prompt'].encode('utf-8')).hexdigest():
            raise ValueError('Changed book input needs translation review: ' + shot_id)
        if review['nextAttempt']['status'] != 'proposed_unverified':
            raise ValueError('Book candidate changes have not been executed.')
        if not (media_dir / f'{shot_id}.mp4').is_file():
            raise ValueError('Book raw video is missing: ' + shot_id)
        logic = review.get('logicReview')
        if logic:
            if logic['assessment'] != 'not_passed' or not logic.get('evidenceFrames'):
                raise ValueError('This run has no evidence of a corrected action-logic pass.')
            for frame in logic['evidenceFrames']:
                relative = Path(frame['image']).relative_to('generated/book-repair')
                if '..' in relative.parts or relative.parts[0] != 'evidence' or not (media_dir / relative).is_file():
                    raise ValueError('Action-logic evidence frame is missing or outside the evidence folder.')
                expected_time = timeline[shot_id]['start'] + frame['sourceSeconds'] - start
                if not start <= frame['sourceSeconds'] <= start + original['duration'] or abs(frame['filmSeconds'] - expected_time) > .001:
                    raise ValueError('Evidence frame source and film times do not match the actual edit.')
        review.update(title=original['title'], targetEffect=original['scene']['zh'],
                      techniqueIds=original['ruleIds'], taskId=state['taskId'],
                      designPrompt=dict(**prompts_by_id[shot_id], role='full_prompt_compiled_from_original_design_fields',
                                        recordFile='studio-book-repair.json'),
                      actualInput=dict(submittedLanguage='en', en=actual['prompt'],
                                       translationZh=actual['promptZhTranslation'],
                                       translationStatus='corresponding_translation_not_submitted',
                                       requestedDuration=actual['generationDuration'], type=actual['type'],
                                       referenceRole=actual['referenceRole']),
                      actualMedia=dict(video=f'generated/book-repair/{shot_id}.mp4',
                                       poster=f'generated/book-repair/{shot_id}.jpg', **state['actualMedia']),
                      edit=dict(sourceStart=edits[shot_id]['start'], duration=original['duration'], timeline=timeline[shot_id]))
        refs.update(original['ruleIds'])
    if not refs.issubset(techniques):
        raise ValueError('Unknown technique in book review.')
    for pattern in case['reusePatterns']:
        if not pattern['evidenceShotIds'] or not set(pattern['evidenceShotIds']).issubset(designed_shots):
            raise ValueError('Book lesson needs real evidence shots.')
    case['techniqueIds'] = sorted(refs)
    case['techniques'] = [dict(id=i, nameZh=techniques[i]['name'],
                               sourceUrl='https://melies.co/cinematic-techniques/' + techniques[i]['path']) for i in sorted(refs)]
    case['execution'] = dict(model=plan['shots'][0]['model'], requestedTarget=plan['target'],
                             generatedDurations=[s['generationDuration'] for s in plan['shots']],
                             editDurations=[s['duration'] for s in design['shots']],
                             referenceImage=dict(provider=plan['referenceImage']['provider'],
                                                 image='generated/book-repair/book-reference.png',
                                                 role=plan['referenceImage']['role'],
                                                 actualResolution=plan['referenceImage']['actualResolution']),
                             postProduction=plan['assembly'],
                             cost=dict(estimatedCredits=plan['estimatedCredits'],
                                       serviceReportedCredits=plan.get('serviceReportedCredits'),
                                       deductionVerified=plan['accountDeductionVerified'],
                                       note=case['result']['costNote']))
    case['sourceRecords'] = ['app/book-case-memory.json', 'app/studio-book-repair.json',
                              'app/production/book-design-prompts.json',
                              'app/production/book-repair-plan.json', 'app/production/book-repair-edit-settings.json',
                              *[f'app/production/{s["id"]}-execution.json' for s in design['shots']]]
    case['presentation'] = dict(inlineShotMedia=True)
    attach_book_revision(case)
    return [case]
