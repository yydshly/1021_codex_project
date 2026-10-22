"""Real ceramic evidence contracts; tests never invoke the generation service."""
import copy
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from export_tea_memory import APP, export_tea_memory
from export_knowledge import export_knowledge, parse_assignment


class TeaEvidenceContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows = {r['id']: r for r in parse_assignment(APP / 'data.js', 'window.SHOTS = ')}
        cls.plan = json.loads((APP / 'production/tea-moment-plan.json').read_text(encoding='utf-8'))
        cls.case = json.loads((APP / 'tea-case-memory.json').read_text(encoding='utf-8'))

    def reject(self, filename, value):
        original = Path.read_text
        def read(path, *args, **kwargs):
            return json.dumps(value, ensure_ascii=False) if path.name == filename else original(path, *args, **kwargs)
        with patch.object(Path, 'read_text', read), self.assertRaises(ValueError):
            export_tea_memory(self.rows)

    def test_completed_inputs_and_three_shots_are_bound_to_real_originals(self):
        case = export_tea_memory(self.rows)[0]
        self.assertEqual(case['result']['duration'], 15)
        self.assertEqual(case['review']['sampleSize'], 1)
        self.assertEqual(len(case['shotReviews']), 3)
        for shot, actual in zip(case['shotReviews'], self.plan['shots']):
            self.assertEqual(shot['actualInput']['en'], actual['prompt'])
            self.assertEqual(shot['actualInput']['translationZh'], actual['promptZhTranslation'])
            self.assertEqual(shot['actualMedia']['duration'], 5.056)
            self.assertTrue(shot['actualMedia']['hasAudio'])
            self.assertTrue(shot['actionReview']['evidenceFrames'])
        self.assertEqual(case['shotReviews'][0]['taskId'], '1035321')
        self.assertEqual(case['shotReviews'][0]['actualInput']['inputMode'], 'omni_reference')

    def test_incomplete_execution_and_changed_actual_text_are_rejected(self):
        changed = copy.deepcopy(self.plan); changed['status'] = 'in_progress'
        self.reject('tea-moment-plan.json', changed)
        changed = copy.deepcopy(self.plan); changed['shots'][0]['prompt'] += ' new action'
        self.reject('tea-moment-plan.json', changed)

    def test_evidence_timing_and_source_ranges_must_match_the_edit(self):
        changed = copy.deepcopy(self.case); changed['shotReviews'][2]['actionReview']['evidenceFrames'][0]['filmSeconds'] += 1
        self.reject('tea-case-memory.json', changed)
        edits = json.loads((APP / 'production/tea-edit-record.json').read_text(encoding='utf-8'))
        edits['shots'][0]['sourceStart'] = 10
        self.reject('tea-edit-record.json', edits)

    def test_model_emotion_judgment_cannot_masquerade_as_collected_audience_validation(self):
        case = export_tea_memory(self.rows)[0]
        self.assertEqual(case['emotionReview']['basis'], 'assistant_visual_review')
        self.assertIsNone(case['emotionReview']['audienceFeedback'])
        changed = copy.deepcopy(self.case); changed['emotionReview']['audienceFeedback'] = {'all_viewers': 'calm'}
        self.reject('tea-case-memory.json', changed)
        changed = copy.deepcopy(self.case); changed['shotReviews'][2]['nextAttempt']['status'] = 'verified'
        self.reject('tea-case-memory.json', changed)

    def test_three_topics_are_retrievable_and_movement_references_include_actual_feedback(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory); export_knowledge(output)
            index = json.loads((output / 'case-index.json').read_text(encoding='utf-8'))
            self.assertEqual(index['count'], 4)
            self.assertEqual({c['id'] for c in index['cases']}, {'rain-to-forest', 'book-repair', 'tea-moment', 'bike-kindness'})
            records = json.loads((output / 'capabilities.json').read_text(encoding='utf-8'))['techniques']
            linked = {t['id'] for t in records if any(r['caseId'] == 'tea-moment' for r in t.get('experienceRefs', []))}
            self.assertEqual(linked, {'lenses-macro', 'camera-movement-follow', 'camera-movement-dolly-out'})

    def test_failed_submissions_and_static_history_remain_separate(self):
        case = export_tea_memory(self.rows)[0]
        self.assertIn('app/production/tea-1-submit-failed-a2-execution.json', case['sourceRecords'])
        for attempt in ['a1', 'a2']:
            failed = json.loads((APP / f'production/tea-1-submit-failed-{attempt}-execution.json').read_text(encoding='utf-8'))
            self.assertNotIn('taskId', failed)
            self.assertNotEqual(failed['status'], 'completed')
        design = json.loads((APP / 'direction-example.json').read_text(encoding='utf-8'))
        self.assertEqual(design['provenance']['mediaStatus'], 'design_only')


if __name__ == '__main__':
    unittest.main()
