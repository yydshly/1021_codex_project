import json
from pathlib import Path
import tempfile
import unittest

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
        self.assertIn("[网站](https://melies.co/cinematic-techniques)", index_markdown(self.root, projects))
        build_site(self.root, projects)
        self.assertIn("来源网站 ↗", (self.root / "_site/index.html").read_text(encoding="utf-8"))

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


if __name__ == "__main__":
    unittest.main()
