"""Export traceable rules, the archived storyboard and linked actual feedback."""
import hashlib
import json
from pathlib import Path

from export_knowledge import parse_assignment

APP = Path(__file__).resolve().parent


def export_studio(output):
    library = json.loads((APP / 'technique-rules.json').read_text(encoding='utf-8'))
    rows = {r['id']: r for r in parse_assignment(APP / 'data.js', 'window.SHOTS = ')}
    creative = parse_assignment(APP / 'creative-case.js', 'window.CREATIVE_CASE = ')
    shots = {s['id']: s for s in creative['shots']}
    cases = json.loads((output / 'case-library.json').read_text(encoding='utf-8'))['cases']
    rule_ids = [r['id'] for r in library['rules']]
    if len(rule_ids) != 7 or len(set(rule_ids)) != 7:
        raise ValueError('Expected seven unique pilot rules.')
    for rule in library['rules']:
        row = rows[rule['id']]
        if not rule['sourceExcerpt'] or rule['sourceExcerpt'] not in row['promptEn']:
            raise ValueError('Source excerpt changed: ' + rule['id'])
        if not rule['caseShotIds'] or any(rule['id'] not in shots[s]['refIds'] for s in rule['caseShotIds']):
            raise ValueError('Unresolved case evidence: ' + rule['id'])
        rule['nameZh'], rule['nameEn'] = row['name'], row['en']
        rule['source'] = dict(url='https://melies.co/cinematic-techniques/' + row['path'],
                              checked=row['checked'],
                              promptSha256=hashlib.sha256(row['promptEn'].encode('utf-8')).hexdigest(),
                              fullRecordFile='capabilities.json')
        rule['experience'] = dict(caseId=creative['id'], recordFile='case-library.json',
                                  shotIds=rule['caseShotIds'], sampleSize=1,
                                  evidenceStatus='one_run_qualitative_review')
        rule['caseFeedback'] = [dict(caseId=c['id'], title=c['title'], sampleSize=c['review']['sampleSize'],
                                     evidenceStatus=c['review']['status'], limits=c['review']['limits'],
                                     reviewPriority=c['review'].get('logicPriority'),
                                     revisions=[dict(id=r['id'], summary=r['summary'], limits=r['limits'], lessons=r['lessons'],
                                                     shots=[s for s in r['shots'] if rule['id'] in s['techniqueIds']])
                                                for r in c.get('revisions', []) if any(rule['id'] in s['techniqueIds'] for s in r['shots'])],
                                     shots=[dict(shotId=s['shotId'], intent=s['intent'],
                                                 selectionReason=s['selectionReason'], observedEffect=s['observedEffect'],
                                                 problems=s['problems'], nextAttempt=s['nextAttempt'],
                                                 **({'logicReview': s['logicReview']} if s.get('logicReview') else {}))
                                            for s in c['shotReviews'] if rule['id'] in s['techniqueIds']])
                                for c in cases if rule['id'] in c['techniqueIds']]
    example = json.loads((APP / 'studio-book-repair.json').read_text(encoding='utf-8'))
    if example['provenance']['mediaStatus'] != 'design_only':
        raise ValueError('Keep the original design-stage provenance; execution is a separate record.')
    if not set(example['selectedRuleIds']).issubset(rule_ids):
        raise ValueError('Unknown rule in book design.')
    library['count'] = len(rule_ids)
    library['retrieval'] = 'local_keyword_screening_with_manual_selection_not_model_inference'
    library['integration'] = 'copy_context_to_current_assistant_then_import_storyboard_json'
    (output / 'technique-rules.json').write_text(json.dumps(library, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (output / 'studio-book-repair.json').write_text(json.dumps(example, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    book_execution = next((c for c in cases if c['id'] == 'book-repair'), None)
    (output / 'studio-data.js').write_text('window.STUDIO_DATA = ' + json.dumps(dict(library=library, example=example, bookExecution=book_execution), ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
    print(f'Exported 7 traceable rules, 1 archived storyboard and {len(cases)} actual case records')
