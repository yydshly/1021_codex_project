from contextlib import redirect_stdout
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from scripts import catalog
from scripts.catalog import build_site, index_markdown, load_projects, synced_readme


class CatalogTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "README.md").write_text(
            "# Research\n<!-- PROJECT_INDEX:START -->\n<!-- PROJECT_INDEX:END -->\n",
            encoding="utf-8",
        )

    def project(self, number="001"):
        folder = self.root / f"projects/{number}-example"
        folder.mkdir(parents=True, exist_ok=True)
        (folder / "README.md").write_text("Research notes", encoding="utf-8")
        return {
            "id": number, "slug": "example", "title": "Example",
            "summary": "A research project", "repository": "https://github.com/owner/example",
            "status": "待研究", "image": None,
        }

    def write_catalog(self, projects):
        (self.root / "projects.json").write_text(
            json.dumps({"projects": projects}), encoding="utf-8"
        )

    def test_stable_number_order(self):
        self.write_catalog([self.project("010"), self.project("002"), self.project("001")])
        projects = load_projects(self.root)
        self.assertEqual([p["id"] for p in projects], ["001", "002", "010"])
        index = index_markdown(self.root, projects)
        self.assertLess(index.index("| 002 |"), index.index("| 010 |"))

    def test_duplicate_id_rejected(self):
        project = self.project()
        self.write_catalog([project, project])
        with self.assertRaisesRegex(ValueError, "编号"):
            load_projects(self.root)

    def test_website_research_without_invented_repository(self):
        project = self.project()
        project["repository"] = None
        project["source_url"] = "https://melies.co/cinematic-techniques"
        self.write_catalog([project])
        projects = load_projects(self.root)
        self.assertIn("[melies.co](https://melies.co/cinematic-techniques)", index_markdown(self.root, projects))
        build_site(self.root, projects)
        self.assertIn("melies.co ↗", (self.root / "_site/index.html").read_text(encoding="utf-8"))
        project["source_name"] = "Melies Cinematic Techniques"
        self.write_catalog([project])
        projects = load_projects(self.root)
        self.assertIn("[Melies Cinematic Techniques](https://melies.co/cinematic-techniques)", index_markdown(self.root, projects))
        build_site(self.root, projects)
        self.assertIn("Melies Cinematic Techniques ↗", (self.root / "_site/index.html").read_text(encoding="utf-8"))

    def test_overview_and_structured_summary_preserve_safe_formatting(self):
        project = self.project()
        project["repository"] = "https://github.com/owner/RealGrass"
        project["highlights"] = {
            "capability": "比较 <script> 与 A|B",
            "principle": "共享 **时间点**",
            "value": "复用组件",
            "boundary": "效果尚未验证",
        }
        self.write_catalog([project])
        index = index_markdown(self.root, load_projects(self.root))
        self.assertLess(index.index("### 项目速览"), index.index("### 详细索引"))
        self.assertIn("- **[001 · Example](projects/001-example/README.md)**：A research project", index)
        self.assertIn("**能力**：比较 &lt;script&gt; 与 A\\|B<br>**原理**：共享 \\*\\*时间点\\*\\*<br>**价值**：复用组件<br>**边界**：效果尚未验证", index)
        self.assertIn("[RealGrass](https://github.com/owner/RealGrass)", index)
        self.assertNotIn("<script>", index)

    def test_invalid_highlights_and_source_names_rejected(self):
        project = self.project()
        valid = {"capability": "能力", "principle": "原理", "value": "价值"}
        for highlights in (None, [], {}, {**valid, "value": ""}, {**valid, "principle": "含\n换行"}, {**valid, "boundary": None}):
            project["highlights"] = highlights
            self.write_catalog([project])
            with self.subTest(highlights=highlights), self.assertRaisesRegex(ValueError, "highlights"):
                load_projects(self.root)
        project["highlights"] = valid
        self.write_catalog([project])
        self.assertEqual(load_projects(self.root)[0]["highlights"], valid)
        for name in (None, "", "含\r换行"):
            project["source_name"] = name
            self.write_catalog([project])
            with self.subTest(source_name=name), self.assertRaisesRegex(ValueError, "source_name"):
                load_projects(self.root)

    def test_invalid_sources_rejected(self):
        project = self.project()
        project["repository"] = None
        for source in (None, "", "javascript:alert(1)", "https://u:p@example.com", "https://example.com/\nattack", 'https://example.com/\"bad', "https://example.com/a)[bad](x"):
            project["source_url"] = source
            self.write_catalog([project])
            with self.subTest(source=source), self.assertRaises(ValueError):
                load_projects(self.root)
        project["repository"] = "https://example.com/owner/repo"
        self.write_catalog([project])
        with self.assertRaises(ValueError):
            load_projects(self.root)

    def test_missing_and_escaping_images_rejected(self):
        project = self.project()
        for image in ("assets/missing.png", "assets/../../../private.png"):
            project["image"] = image
            self.write_catalog([project])
            with self.subTest(image=image), self.assertRaises(ValueError):
                load_projects(self.root)

    def test_publish_only_registered_demo_and_cover(self):
        project = self.project()
        folder = self.root / "projects/001-example"
        (folder / "web").mkdir()
        (folder / "web/index.html").write_text("<h1>Demo</h1>", encoding="utf-8")
        (folder / "app").mkdir()
        (folder / "app/source.py").write_text("# source", encoding="utf-8")
        (folder / "assets").mkdir()
        (folder / "assets/cover.png").write_bytes(b"test-image")
        project["image"] = "assets/cover.png"
        self.write_catalog([project])
        build_site(self.root, load_projects(self.root))
        output = self.root / "_site/projects/001-example"
        self.assertTrue((output / "index.html").exists())
        self.assertTrue((self.root / "_site/_covers/001-example/assets/cover.png").exists())
        self.assertFalse((output / "README.md").exists())
        self.assertFalse((output / "app").exists())
        # Rebuilding must remove a removed project's stale public files.
        build_site(self.root, [])
        self.assertFalse(output.exists())

    def test_metadata_html_is_escaped(self):
        project = self.project()
        project["title"] = "<script>alert('x')</script>"
        build_site(self.root, [project])
        page = (self.root / "_site/index.html").read_text(encoding="utf-8")
        self.assertNotIn("<script>", page)
        self.assertIn("&lt;script&gt;", page)

    def test_empty_index_and_marker_validation(self):
        self.write_catalog([])
        self.assertIn("001", synced_readme(self.root, load_projects(self.root)))
        (self.root / "README.md").write_text("No markers", encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "标记"):
            synced_readme(self.root, [])

    def test_check_does_not_create_or_modify_site(self):
        self.write_catalog([])
        (self.root / "README.md").write_text(synced_readme(self.root, []), encoding="utf-8")
        output = self.root / "_site"
        for existing in (False, True):
            with self.subTest(existing_site=existing):
                if existing:
                    output.mkdir()
                    (output / "sentinel.txt").write_bytes(b"keep existing output")
                with patch.object(catalog, "ROOT", self.root), patch(
                    "sys.argv", ["catalog.py", "--check"]
                ), redirect_stdout(io.StringIO()):
                    catalog.main()
                if existing:
                    self.assertEqual(list(output.iterdir()), [output / "sentinel.txt"])
                    self.assertEqual((output / "sentinel.txt").read_bytes(), b"keep existing output")
                else:
                    self.assertFalse(output.exists())

    def test_default_command_still_builds_site(self):
        self.write_catalog([])
        (self.root / "README.md").write_text(synced_readme(self.root, []), encoding="utf-8")
        with patch.object(catalog, "ROOT", self.root), patch(
            "sys.argv", ["catalog.py"]
        ), redirect_stdout(io.StringIO()):
            catalog.main()
        self.assertTrue((self.root / "_site/index.html").is_file())
        self.assertTrue((self.root / "_site/.nojekyll").is_file())


if __name__ == "__main__":
    unittest.main()
