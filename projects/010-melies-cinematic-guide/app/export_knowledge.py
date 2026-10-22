"""Export agent-readable reference data and validate grounded creative examples."""
import copy
import hashlib
import json
from pathlib import Path
from export_book_memory import export_book_memory
from export_tea_memory import export_tea_memory
from export_bike_memory import export_bike_memory

APP = Path(__file__).resolve().parent


def parse_assignment(path, assignment):
    return json.loads(path.read_text(encoding='utf-8').split(assignment, 1)[1].rstrip(';\n'))


def export_case_memory(creative, techniques):
    """Join curated lessons to the original inputs and measured execution records."""
    library = json.loads((APP / 'case-memory.json').read_text(encoding='utf-8'))
    case_ids = set()
    for case in library['cases']:
        if case['id'] in case_ids or case['id'] != creative['id']:
            raise ValueError('Duplicate or unresolved creative case ID: ' + case['id'])
        case_ids.add(case['id'])
        if case['review']['sampleSize'] != 1 or case['review']['status'] != 'one_run_qualitative_review':
            raise ValueError('This case has evidence for one qualitative run only.')
        plan = json.loads((APP / f'production/{case["id"]}-plan.json').read_text(encoding='utf-8'))
        edits = json.loads((APP / 'production/edit-settings.json').read_text(encoding='utf-8'))
        execution_shots = {shot['id']: shot for shot in plan['shots']}
        design_shots = {shot['id']: shot for shot in creative['shots']}
        reviewed_ids = [review['shotId'] for review in case['shotReviews']]
        if len(set(reviewed_ids)) != len(reviewed_ids) or set(reviewed_ids) != set(design_shots):
            raise ValueError('Case review must cover every shot exactly once.')
        if set(execution_shots) != set(design_shots) or plan['status'] != 'completed':
            raise ValueError('Actual execution is incomplete or refers to different shots.')
        timeline = {}
        start = 0
        for shot in creative['shots']:
            timeline[shot['id']] = dict(start=start, end=start + shot['duration'])
            start += shot['duration']
        ref_ids = set()
        for review in case['shotReviews']:
            shot_id = review['shotId']
            design, executed = design_shots[shot_id], execution_shots[shot_id]
            state = json.loads((APP / f'production/{shot_id}-execution.json').read_text(encoding='utf-8'))
            if state['status'] != 'completed' or state['model'] != executed['model']:
                raise ValueError('Missing completed execution evidence for ' + shot_id)
            if executed['promptZhTranslationOfSha256'] != hashlib.sha256(executed['prompt'].encode()).hexdigest():
                raise ValueError('English input changed; review its Chinese translation: ' + shot_id)
            if review['nextAttempt']['status'] != 'proposed_unverified':
                raise ValueError('No execution evidence for candidate prompt: ' + shot_id)
            generated = design['generated']
            published = APP.parent / f'assets/generated/{case["id"]}/published'
            if not (published / Path(generated['video']).name).is_file():
                raise ValueError('Missing actual source clip for ' + shot_id)
            review.update(
                title=design['title'], targetEffect=design['visual'],
                observedEffect=generated['observation'],
                techniqueIds=list(design['refIds']),
                designPrompt=dict(zh=design['promptZh'], en=design['promptEn']),
                actualInput=dict(submittedLanguage=executed['submittedLanguage'],
                                 en=executed['prompt'], translationZh=executed['promptZhTranslation'],
                                 translationStatus='corresponding_translation_not_submitted',
                                 requestedDuration=executed['generationDuration'],
                                 type=executed['type'], usesProductReference=executed['usesProductReference']),
                actualMedia=dict(video=generated['video'], poster=generated['poster'],
                                 **state['actualMedia']),
                edit=dict(sourceStart=edits[shot_id]['start'], duration=design['duration'],
                          timeline=timeline[shot_id]),
                taskId=state['taskId'])
            ref_ids.update(design['refIds'])
        if not ref_ids.issubset(techniques):
            raise ValueError('Unknown technique in creative case.')
        for pattern in case['reusePatterns']:
            if not set(pattern['evidenceShotIds']).issubset(design_shots):
                raise ValueError('Reusable advice lacks a valid evidence shot.')
        case['techniqueIds'] = sorted(ref_ids)
        case['techniques'] = [dict(id=ref, nameZh=techniques[ref]['name'],
                                   sourceUrl='https://melies.co/cinematic-techniques/' + techniques[ref]['path'])
                              for ref in sorted(ref_ids)]
        case['result'] = copy.deepcopy(creative['generated'])
        case['execution'] = dict(
            model=plan['shots'][0]['model'], requestedTarget=plan['target'],
            generatedDurations=[shot['generationDuration'] for shot in plan['shots']],
            editDurations=[shot['editDuration'] for shot in plan['shots']],
            referenceImage=dict(provider=plan['referenceImage']['provider'],
                                image=f'generated/{case["id"]}/product-reference.png',
                                role='用于 s2、s3、s4 的产品外观参考；s1 为文生视频',
                                actualResolution=plan['referenceImage']['actualResolution']),
            postProduction=plan['assembly'],
            cost=dict(estimatedCredits=plan['estimatedCredits'],
                      serviceReportedCredits=plan['serviceReportedCredits'],
                      deductionVerified=plan['accountDeductionVerified'],
                      note=creative['generated']['costNote']))
        case['sourceRecords'] = ['app/case-memory.json', 'app/creative-case.js',
                                  f'app/production/{case["id"]}-plan.json',
                                  'app/production/s1-execution.json', 'app/production/s2-execution.json',
                                  'app/production/s3-execution.json', 'app/production/s4-execution.json']
    library['count'] = len(library['cases'])
    return library


def export_knowledge(output):
    rows = parse_assignment(APP / 'data.js', 'window.SHOTS = ')
    rule_ids = {r['id'] for r in json.loads((APP / 'technique-rules.json').read_text(encoding='utf-8'))['rules']}
    case = parse_assignment(APP / 'creative-case.js', 'window.CREATIVE_CASE = ')
    by_id = {row['id']: row for row in rows}
    assert sum(shot['duration'] for shot in case['shots']) == case['duration']
    assert len({shot['id'] for shot in case['shots']}) == len(case['shots'])
    for shot in case['shots']:
        assert shot['promptZh'] and shot['promptEn'] and shot['borrowedRule'] and shot['creativeDecision']
        assert shot['refIds'] and all(ref in by_id for ref in shot['refIds']), shot['id']

    memory = export_case_memory(case, by_id)
    memory['cases'].extend(export_book_memory(by_id))
    memory['cases'].extend(export_tea_memory(by_id))
    memory['cases'].extend(export_bike_memory(by_id))
    memory['count'] = len(memory['cases'])
    if len({c['id'] for c in memory['cases']}) != memory['count']:
        raise ValueError('Duplicate creative case ID.')
    experience_refs = {}
    for experience in memory['cases']:
        for ref_id in experience['techniqueIds']:
            experience_refs.setdefault(ref_id, []).append(dict(
                caseId=experience['id'], recordFile='case-library.json',
                shotIds=[shot['shotId'] for shot in experience['shotReviews'] if ref_id in shot['techniqueIds']],
                evidenceStatus=experience['review']['status']))
    records = []
    for row in rows:
        record = dict(
            id=row['id'], nameZh=row['name'], nameEn=row['en'], category=row['group'],
            effect=row['short'], observation=row['tip'],
            sourceUrl='https://melies.co/cinematic-techniques/' + row['path'],
            examplePromptZh=row['prompt'], examplePromptEn=row['promptEn'],
            mediaType=row['mediaType'], mediaUrl=row['video'] or row['image'],
            reviewNotes=[note for note in (row.get('promptNote'), row.get('mediaNote')) if note],
            checked=row['checked'])
        if row['id'] in experience_refs:
            record['experienceRefs'] = experience_refs[row['id']]
        if row['id'] in rule_ids:
            record['ruleRef'] = dict(recordFile='technique-rules.json', ruleId=row['id'])
        records.append(record)
    full = dict(schemaVersion=1, purpose='电影语言创作参考；不是模型执行 API',
                count=len(records), techniques=records, ruleLibraryFile='technique-rules.json',
                structuredRuleCount=len(rule_ids))
    compact_records = []
    for row in records:
        item = {key: row[key] for key in ('id', 'nameZh', 'nameEn', 'category', 'effect', 'reviewNotes')}
        if 'experienceRefs' in row:
            item['experienceRefs'] = row['experienceRefs']
        if 'ruleRef' in row:
            item['ruleRef'] = row['ruleRef']
        compact_records.append(item)
    compact = dict(schemaVersion=1, count=len(records), techniques=compact_records,
                   caseIndexFile='case-index.json', ruleLibraryFile='technique-rules.json',
                   structuredRuleCount=len(rule_ids))
    full['caseLibraryFile'] = 'case-library.json'
    case_index = dict(schemaVersion=1, count=memory['count'], recordFile='case-library.json', cases=[
        dict(id=item['id'], title=item['title'], tags=item['tags'],
             goal=item['goal']['communicationGoal'], techniqueIds=item['techniqueIds'],
             model=item['execution']['model'], evidenceStatus=item['review']['status'],
             reviewSummary=item['review']['summary'], sampleSize=item['review']['sampleSize'],
             revisionCount=len(item.get('revisions', [])), revisionSummary=item.get('revisionSummary'))
        for item in memory['cases']])
    for name, data in (('capabilities.json', full), ('capability-index.json', compact), ('creative-case.json', case),
                       ('case-library.json', memory), ('case-index.json', case_index)):
        (output / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (output / 'case-library.js').write_text('window.CASE_LIBRARY = ' + json.dumps(memory, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
    print(f'Exported {len(records)} model references and {len(case["shots"])} grounded creative shots')
    print(f'Linked {memory["count"]} reviewed creative case to {len(experience_refs)} techniques')
