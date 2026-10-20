"""Validate the research catalog and build its README index and static portal."""

import argparse
import html
import json
from pathlib import Path
import re
import shutil
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
REPOSITORY = "https://github.com/yydshly/1021_codex_project"
PAGES = "https://yydshly.github.io/1021_codex_project"
START = "<!-- PROJECT_INDEX:START -->"
END = "<!-- PROJECT_INDEX:END -->"
STATUSES = {"待研究", "研究中", "已完成", "已归档"}


def project_path(project):
    return f"projects/{project['id']}-{project['slug']}"


def checked_path(root, relative):
    """Reject traversal and symlinks before reading or publishing files."""
    relative_path = Path(relative)
    if relative_path.is_absolute() or ".." in relative_path.parts:
        raise ValueError(f"路径必须在项目目录内：{relative}")
    candidate = root / relative_path
    for item in (candidate, *candidate.parents):
        if item == root:
            break
        if item.is_symlink():
            raise ValueError(f"不支持符号链接：{candidate}")
    if not candidate.resolve().is_relative_to(root.resolve()):
        raise ValueError(f"路径超出项目目录：{relative}")
    return candidate


def load_projects(root):
    data = json.loads((root / "projects.json").read_text(encoding="utf-8"))
    projects = data["projects"]
    if not isinstance(projects, list):
        raise ValueError("projects 必须是数组")
    ids = set()
    for project in projects:
        for field in ("id", "slug", "title", "summary", "repository", "status"):
            value = project.get(field)
            if not isinstance(value, str) or not value.strip() or "\n" in value or "\r" in value:
                raise ValueError(f"字段 {field} 必须是非空的单行字符串")
        number = project["id"]
        if not re.fullmatch(r"[0-9]{3}", number) or number == "000" or number in ids:
            raise ValueError(f"编号必须唯一且位于 001–999：{number}")
        ids.add(number)
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", project["slug"]):
            raise ValueError(f"无效 slug：{project['slug']}")
        url = urlparse(project["repository"])
        if url.scheme != "https" or url.hostname != "github.com" or url.username or url.password:
            raise ValueError("原仓库必须使用 https://github.com/ 链接")
        if not re.fullmatch(r"/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+/?", url.path) or url.query or url.fragment:
            raise ValueError("原仓库链接应指向 owner/repository")
        if project["status"] not in STATUSES:
            raise ValueError(f"无效状态：{project['status']}")
        folder = checked_path(root, project_path(project))
        if not checked_path(folder, "README.md").is_file():
            raise ValueError(f"缺少研究 README：{folder}")
        image = project.get("image")
        if image is not None:
            if not isinstance(image, str) or not re.fullmatch(
                r"assets/[A-Za-z0-9_./-]+\.(?:png|jpg|jpeg|webp|gif)", image
            ):
                raise ValueError("image 必须是 assets/ 下的 PNG、JPEG、WebP 或 GIF 路径")
            if not checked_path(folder, image).is_file():
                raise ValueError(f"封面不存在：{folder / image}")
        web = checked_path(folder, "web")
        if web.exists():
            for item in web.rglob("*"):
                checked_path(folder, item.relative_to(folder))
    return sorted(projects, key=lambda project: project["id"])


def has_demo(root, project):
    return (root / project_path(project) / "web/index.html").is_file()


def md(value):
    # Escape Markdown controls so metadata cannot create unintended links or HTML.
    value = html.escape(value)
    return re.sub(r"([\\`*_\[\]{}()!|])", r"\\\1", value)


def index_markdown(root, projects):
    if not projects:
        return "暂无研究项目。第一个项目将从 **001** 开始。"
    lines = [
        "| 编号 | 项目 | 研究摘要 | 状态 | 原仓库 | 演示 |",
        "| --- | --- | --- | --- | --- | --- |",
    ]
    for project in projects:
        path = project_path(project)
        demo = f"[打开]({PAGES}/{path}/)" if has_demo(root, project) else "—"
        lines.append(
            f"| {project['id']} | [{md(project['title'])}]({path}/README.md) | "
            f"{md(project['summary'])} | {project['status']} | "
            f"[GitHub]({project['repository']}) | {demo} |"
        )
    for project in projects:
        if project.get("image"):
            path = project_path(project)
            lines.extend([
                "", f"### {project['id']} · {md(project['title'])}",
                "", md(project["summary"]), "",
                f"[![{md(project['title'])}预览]({path}/{project['image']})]({path}/README.md)",
            ])
    return "\n".join(lines)


def synced_readme(root, projects):
    content = (root / "README.md").read_text(encoding="utf-8")
    if content.count(START) != 1 or content.count(END) != 1 or content.index(START) > content.index(END):
        raise ValueError("README 必须包含一对有效的 PROJECT_INDEX 标记")
    before = content.split(START)[0]
    after = content.split(END)[1]
    return f"{before}{START}\n{index_markdown(root, projects)}\n{END}{after}"


def build_site(root, projects):
    # Deletion is restricted to the fixed generated folder directly under root.
    output = root / "_site"
    if output.is_symlink() or output.resolve() != root.resolve() / "_site":
        raise ValueError("_site 必须是仓库内的普通目录")
    if output.exists():
        shutil.rmtree(output)
    output.mkdir()
    cards = []
    for project in projects:
        path = project_path(project)
        folder = root / path
        cover = ""
        if project.get("image"):
            image = f"_covers/{project['id']}-{project['slug']}/{project['image']}"
            destination = output / image
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(folder / project["image"], destination)
            cover = f'<img src="{image}" alt="{html.escape(project["title"])}预览" loading="lazy">'
        demo = ""
        if has_demo(root, project):
            destination = output / path
            destination.mkdir(parents=True, exist_ok=True)
            shutil.copytree(folder / "web", destination, dirs_exist_ok=True)
            demo = f'<a href="{path}/">在线演示 →</a>'
        cards.append(
            f'<article>{cover}<div class="meta">{project["id"]} / {project["status"]}</div>'
            f'<h2>{html.escape(project["title"])}</h2>'
            f'<p>{html.escape(project["summary"])}</p><nav>'
            f'<a href="{REPOSITORY}/tree/main/{path}">研究笔记</a>'
            f'<a href="{html.escape(project["repository"])}">原仓库 ↗</a>{demo}</nav></article>'
        )
    body = "\n".join(cards) or (
        '<article class="empty"><div class="meta">从 001 开始</div>'
        '<h2>下一项研究，即将在这里展开。</h2>'
        '<p>收集值得理解的项目，记录实验，再把想法变成可以体验的作品。</p></article>'
    )
    page = """<!doctype html>
<html lang="zh-CN">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>GitHub 项目研究室</title>
<style>
:root{color-scheme:light;font-family:system-ui,"Microsoft YaHei",sans-serif;color:#16332e;background:#f4f4ec}
*{box-sizing:border-box}body{margin:0}main{max-width:1120px;margin:auto;padding:56px 24px}
header{border-top:4px solid #23705b;padding:32px 0 48px}.eyebrow,.meta{font-size:13px;letter-spacing:1px;color:#52746a}
h1{font-size:clamp(32px,6vw,58px);letter-spacing:-2px;margin:18px 0}header p{max-width:660px;line-height:1.9}
a{color:#1b6b52;text-underline-offset:4px}a:focus-visible{outline:3px solid #c58426;outline-offset:5px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:24px}
article{background:#fff;border:1px solid #dbe3da;border-radius:12px;padding:28px;overflow:hidden}
article img{width:100%;aspect-ratio:16/9;object-fit:contain;background:#f4f4ec;border-radius:6px;margin-bottom:22px}
h2{font-size:22px;line-height:1.5}p{line-height:1.8;color:#52645e}nav{display:flex;gap:18px;flex-wrap:wrap;font-size:14px}
.empty{padding:44px;grid-column:1/-1}footer{margin-top:48px;border-top:1px solid #dbe3da;padding-top:24px;color:#62736b;font-size:13px}
</style></head>
<body><main><header><div class="eyebrow">GITHUB / RESEARCH NOTEBOOK</div>
<h1>GitHub 项目研究室</h1><p>发现值得研究的开源项目，记录理解、复现与改造的过程。<br>每一个编号，都是一次从阅读代码到动手实践的探索。</p>
<a href="__REPOSITORY__">查看研究总仓库 ↗</a></header>
<section class="grid" aria-label="研究项目">__CARDS__</section>
<footer>按稳定编号排列 · 研究记录与来源见各项目 README</footer></main></body></html>
"""
    (output / "index.html").write_text(
        page.replace("__REPOSITORY__", REPOSITORY).replace("__CARDS__", body), encoding="utf-8"
    )
    (output / ".nojekyll").touch()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--update-readme", action="store_true")
    mode.add_argument("--check", action="store_true")
    args = parser.parse_args()
    try:
        projects = load_projects(ROOT)
        expected = synced_readme(ROOT, projects)
        if args.update_readme:
            (ROOT / "README.md").write_text(expected, encoding="utf-8")
        elif (ROOT / "README.md").read_text(encoding="utf-8") != expected:
            raise ValueError("README 索引未同步，请运行 python scripts/catalog.py --update-readme")
        build_site(ROOT, projects)
    except (ValueError, KeyError, TypeError, OSError) as error:
        parser.exit(1, f"Catalog error: {error}\n")
    print(f"Validated {len(projects)} projects; generated _site/index.html")


if __name__ == "__main__":
    main()
