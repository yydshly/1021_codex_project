"""Keep production preparation distinct from paid execution and case evidence."""
import copy
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import export_bike_plan as module
import export_bike_memory as memory
from export_knowledge import parse_assignment

APP = Path(__file__).resolve().parent


class BikePlanExportTests(unittest.TestCase):
    def export(self, plan=None):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp)
            if plan is None:
                module.export_bike_plan(out)
            else:
                original = module.json.loads
                def altered_loads(value, *args, **kwargs):
                    parsed = original(value, *args, **kwargs)
                    return copy.deepcopy(plan) if isinstance(parsed, dict) and parsed.get('id') == 'bike-kindness' else parsed
                with patch.object(module.json, 'loads', side_effect=altered_loads):
                    module.export_bike_plan(out)
            return json.loads((out / 'bike-kindness-plan.json').read_text(encoding='utf-8'))

    def test_original_design_and_five_references_are_bound_without_fabricating_media(self):
        exported = self.export()
        self.assertEqual(exported['designSnapshot']['provenance']['mediaStatus'], 'design_only')
        self.assertEqual(len(exported['shots']), 4)
        self.assertEqual(sum(len(s['referenceDisplay']) for s in exported['shots']), 5)
        self.assertNotIn('result', exported)
        self.assertEqual(exported['estimatedCredits'], 480)
        self.assertEqual(exported['historicalServiceCostReference']['credits'], 600)

    def test_changed_prompt_or_reference_cannot_reuse_prepared_translation_or_reference_hash(self):
        for key in ['prompt', 'reference']:
            p = json.loads((APP / 'production/bike-kindness-plan.json').read_text(encoding='utf-8'))
            if key == 'prompt':
                p['shots'][0]['prompt'] += 'Different actual input.'
            else:
                p['shots'][0]['referenceHashes'][p['shots'][0]['referenceImages'][0]] = '0' * 64
            with self.assertRaises(ValueError):
                self.export(p)


class BikeMemoryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows = {r['id']: r for r in parse_assignment(APP / 'data.js', 'window.SHOTS = ')}

    def reject(self, name, changed):
        original = memory.read
        with patch.object(memory, 'read', side_effect=lambda path: copy.deepcopy(changed) if path == name else original(path)):
            with self.assertRaises(ValueError):
                memory.export_bike_memory(self.rows)

    def test_completed_film_binds_four_originals_and_fourteen_timed_frames(self):
        case = memory.export_bike_memory(self.rows)[0]
        self.assertEqual(case['review']['sampleSize'], 1)
        self.assertEqual(case['result']['duration'], 20)
        self.assertEqual(len({s['taskId'] for s in case['shotReviews']}), 4)
        self.assertEqual(sum(len(s['actionReview']['evidenceFrames']) for s in case['shotReviews']), 14)
        self.assertEqual(case['execution']['cost']['serviceReportedCredits'], 600)
        self.assertFalse(case['execution']['cost']['deductionVerified'])
        self.assertIsNone(case['emotionReview']['audienceFeedback'])
        self.assertTrue(all(s['nextAttempt']['status'] == 'proposed_unverified' for s in case['shotReviews']))

    def test_incomplete_run_or_unapproved_actual_input_cannot_enter_case_library(self):
        original = memory.read('production/bike-kindness-plan.json')
        for change in ['status', 'approval']:
            altered = copy.deepcopy(original)
            if change == 'status':
                altered['status'] = 'in_progress'
            else:
                altered['budgetApproval']['inputPromptHashes']['bike-3'] = 'different input'
            self.reject('production/bike-kindness-plan.json', altered)

    def test_wrong_evidence_time_or_unexecuted_candidate_upgrade_is_rejected(self):
        original = memory.read('bike-case-memory.json')
        for change in ['time', 'candidate']:
            altered = copy.deepcopy(original)
            if change == 'time':
                altered['shotReviews'][2]['actionReview']['evidenceFrames'][0]['filmSeconds'] += 1
            else:
                altered['shotReviews'][1]['nextAttempt']['status'] = 'verified'
            self.reject('bike-case-memory.json', altered)

    def test_model_interpretation_cannot_turn_into_uncollected_audience_feedback(self):
        altered = memory.read('bike-case-memory.json')
        altered['emotionReview']['audienceFeedback'] = {'emotionHitRate': 1}
        self.reject('bike-case-memory.json', altered)


if __name__ == '__main__':
    unittest.main()
