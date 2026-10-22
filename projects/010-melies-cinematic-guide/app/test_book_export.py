"""Evidence-contract tests using the completed book execution, without new calls."""
import copy
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from export_book_memory import APP, export_book_memory
from export_knowledge import export_knowledge, parse_assignment


class BookEvidenceContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.techniques = {r['id']: r for r in parse_assignment(APP / 'data.js', 'window.SHOTS = ')}
        cls.review = json.loads((APP / 'book-case-memory.json').read_text(encoding='utf-8'))
        cls.plan = json.loads((APP / 'production/book-repair-plan.json').read_text(encoding='utf-8'))

    def reject_changed_record(self, filename, value):
        original_read = Path.read_text

        def read(path, *args, **kwargs):
            return json.dumps(value, ensure_ascii=False) if path.name == filename else original_read(path, *args, **kwargs)

        with patch.object(Path, 'read_text', read):
            with self.assertRaises(ValueError):
                export_book_memory(self.techniques)

    def test_actual_inputs_and_durations_survive_export(self):
        case = export_book_memory(self.techniques)[0]
        self.assertEqual(case['execution']['generatedDurations'], [5, 10, 5, 5])
        self.assertEqual(case['execution']['editDurations'], [4, 6, 4, 4])
        for review, actual in zip(case['shotReviews'], self.plan['shots']):
            self.assertEqual(review['actualInput']['en'], actual['prompt'])
            self.assertEqual(review['actualInput']['translationZh'], actual['promptZhTranslation'])
            self.assertTrue(review['actualMedia']['hasAudio'])
            self.assertIn('Target edit duration', review['designPrompt']['en'])
            self.assertNotEqual(review['designPrompt']['en'], review['actualInput']['en'])

    def test_no_inflated_samples_or_unexecuted_plan(self):
        inflated = copy.deepcopy(self.review)
        inflated['review']['sampleSize'] = 10
        self.reject_changed_record('book-case-memory.json', inflated)
        incomplete = copy.deepcopy(self.plan)
        incomplete['status'] = 'prepared'
        self.reject_changed_record('book-repair-plan.json', incomplete)

    def test_untried_prompt_cannot_become_verified(self):
        changed = copy.deepcopy(self.review)
        changed['shotReviews'][0]['nextAttempt']['status'] = 'verified'
        self.reject_changed_record('book-case-memory.json', changed)

    def test_changed_actual_english_requires_translation_review(self):
        changed = copy.deepcopy(self.plan)
        changed['shots'][0]['prompt'] += ' A new action.'
        self.reject_changed_record('book-repair-plan.json', changed)

    def test_edit_outside_measured_source_is_rejected(self):
        edits = json.loads((APP / 'production/book-repair-edit-settings.json').read_text(encoding='utf-8'))
        edits['book-2']['start'] = 20
        self.reject_changed_record('book-repair-edit-settings.json', edits)

    def test_both_cases_are_discoverable_without_polluting_source_notes(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            export_knowledge(root)
            index = json.loads((root / 'case-index.json').read_text(encoding='utf-8'))
            self.assertTrue({'rain-to-forest', 'book-repair'}.issubset({c['id'] for c in index['cases']}))
            records = json.loads((root / 'capabilities.json').read_text(encoding='utf-8'))['techniques']
            linked = [t for t in records if any(r['caseId'] == 'book-repair' for r in t.get('experienceRefs', []))]
            self.assertEqual(len(linked), 3)
            for record in records:
                original = self.techniques[record['id']]
                self.assertEqual(record['reviewNotes'], [n for n in (original.get('promptNote'), original.get('mediaNote')) if n])

    def test_revision_is_nested_and_baseline_remains_failed_history(self):
        case = export_book_memory(self.techniques)[0]
        revision = case['revisions'][0]
        self.assertEqual(case['review']['sampleSize'], 1)
        self.assertEqual({s['shotId'] for s in revision['shots']}, {'book-2-r2', 'book-3-r2'})
        self.assertEqual(set(revision['retainedSourceRecords']), {'book-1', 'book-4'})
        self.assertEqual(revision['originalResult'], case['result'])
        self.assertEqual(case['latestResult'], revision['result'])
        for shot in case['shotReviews'][1:3]:
            self.assertEqual(shot['logicReview']['assessment'], 'not_passed')

    def test_revision_cannot_silently_change_retained_footage(self):
        assembly = json.loads((APP / 'production/book-r2-edit-record.json').read_text(encoding='utf-8'))
        assembly['shots'][0]['sourceStart'] += .25
        self.reject_changed_record('book-r2-edit-record.json', assembly)

    def test_revision_rejects_unexecuted_or_stale_inputs(self):
        plan = json.loads((APP / 'production/book-repair-r2-plan.json').read_text(encoding='utf-8'))
        plan['status'] = 'prepared'
        self.reject_changed_record('book-repair-r2-plan.json', plan)
        plan['status'] = 'completed'
        plan['shots'][0]['prompt'] += ' More instructions.'
        self.reject_changed_record('book-repair-r2-plan.json', plan)

    def test_revision_evidence_must_use_its_actual_timeline(self):
        revision = json.loads((APP / 'book-revision-r2.json').read_text(encoding='utf-8'))
        revision['shots'][0]['evidenceFrames'][0]['filmSeconds'] += 1
        self.reject_changed_record('book-revision-r2.json', revision)


if __name__ == '__main__':
    unittest.main()
