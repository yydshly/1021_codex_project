"""Check that publishing never confuses real inputs with playback URLs."""
from pathlib import Path
import hashlib
import json
import tempfile
import unittest
from publish_media import publish_media


class PublicationMediaTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.output = self.root / 'web'
        path = self.output / 'generated/case/shot.mp4'
        path.parent.mkdir(parents=True)
        path.write_bytes(b'original media bytes')
        self.manifest = self.root / 'manifest.json'
        self.data = {'files': [{'path': 'generated/case/shot.mp4', 'bytes': path.stat().st_size, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'url': 'https://github.com/yydshly/1021_codex_project/releases/download/test/case--shot.mp4'}]}
        self.write_manifest()
        (self.output / 'case.json').write_text(json.dumps({'video': 'generated/case/shot.mp4', 'actualInput': 'assets/generated/case/shot.mp4'}), encoding='utf-8')

    def write_manifest(self):
        self.manifest.write_text(json.dumps(self.data), encoding='utf-8')

    def test_exact_media_reference_changes_but_input_history_does_not(self):
        publish_media(self.output, self.manifest)
        exported = json.loads((self.output / 'case.json').read_text(encoding='utf-8'))
        self.assertEqual(exported['video'], self.data['files'][0]['url'])
        self.assertEqual(exported['actualInput'], 'assets/generated/case/shot.mp4')
        self.assertFalse((self.output / 'generated/case/shot.mp4').exists())
        self.assertEqual(json.loads((self.output / 'publication-media.json').read_text())['files'], self.data['files'])

    def test_changed_bytes_abort_before_rewriting_or_removing(self):
        self.data['files'][0]['sha256'] = '0' * 64
        self.write_manifest()
        with self.assertRaises(ValueError):
            publish_media(self.output, self.manifest)
        self.assertTrue((self.output / 'generated/case/shot.mp4').exists())
        self.assertIn('"video": "generated/case/shot.mp4"', (self.output / 'case.json').read_text())

    def test_local_mode_keeps_exact_files_and_relative_urls(self):
        publish_media(self.output, self.manifest, local=True)
        self.assertTrue((self.output / 'generated/case/shot.mp4').exists())
        self.assertIn('"video": "generated/case/shot.mp4"', (self.output / 'case.json').read_text())

    def test_traversal_is_rejected_before_mutation(self):
        self.data['files'][0]['path'] = '../outside.mp4'
        self.write_manifest()
        with self.assertRaises(ValueError):
            publish_media(self.output, self.manifest)
        self.assertTrue((self.output / 'generated/case/shot.mp4').exists())
