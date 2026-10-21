"""Inventory a pinned upstream checkout without executing any plugin code."""

import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess

COMMIT = "a266ab8c3c754a3ccf7a634044fc1595fc06e50e"
REPOSITORY = "https://github.com/anthropics/knowledge-work-plugins"
PROJECT = Path(__file__).resolve().parents[1]


def git(root, *args):
    return subprocess.check_output(
        ["git", "-C", str(root), *args], text=True, encoding="utf-8"
    ).strip()


def frontmatter(text):
    """Read the scalar metadata used by this snapshot; keep YAML text unexecuted."""
    if not text.startswith("---\n"):
        return {}
    block = text.split("---\n", 2)[1]
    result = {}
    key = None
    for line in block.splitlines():
        match = re.match(r"^([\w-]+):\s*(.*)$", line)
        if match:
            key, value = match.groups()
            result[key] = "" if value.strip() in {">", "|", ">-", "|-"} else value.strip().strip("\"'")
        elif key and line.startswith((" ", "\t")):
            result[key] += " " + line.strip()
    return {key: value.strip() for key, value in result.items()}


def source_record(root, path):
    raw = path.read_bytes()
    text = raw.decode("utf-8-sig").replace("\r\n", "\n")
    relative = path.relative_to(root).as_posix()
    return {
        "path": relative,
        "url": f"{REPOSITORY}/blob/{COMMIT}/{relative}",
        "sha256_lf": hashlib.sha256(text.encode("utf-8")).hexdigest(),
        "metadata": frontmatter(text),
        "headings": [
            line.lstrip("#").strip()
            for line in text.splitlines()
            if re.match(r"^#{1,3} ", line)
        ],
    }


def inventory(root):
    actual = git(root, "rev-parse", "HEAD")
    if actual != COMMIT:
        raise ValueError(f"Expected {COMMIT}; got {actual}")
    if git(root, "status", "--porcelain"):
        raise ValueError("Upstream checkout must be clean")
    marketplace = json.loads(
        (root / ".claude-plugin/marketplace.json").read_text(encoding="utf-8")
    )
    local = []
    for folder in sorted(root.iterdir()):
        manifest = folder / ".claude-plugin/plugin.json"
        if not folder.is_dir() or not manifest.is_file():
            continue
        skills = [source_record(root, p) for p in sorted(folder.glob("skills/**/SKILL.md"))]
        commands = [source_record(root, p) for p in sorted(folder.glob("commands/*.md"))]
        mcp_path = folder / ".mcp.json"
        servers = json.loads(mcp_path.read_text(encoding="utf-8")).get("mcpServers", {}) if mcp_path.exists() else {}
        connections = [
            {
                "name": name,
                "type": spec.get("type", "stdio" if "command" in spec else None),
                "url": spec.get("url"),
                "command": spec.get("command"),
                "args": spec.get("args", []),
                "empty_url": "url" in spec and not spec["url"],
            }
            for name, spec in servers.items()
        ]
        local.append({
            "name": folder.name,
            "manifest": json.loads(manifest.read_text(encoding="utf-8")),
            "skills": skills,
            "commands": commands,
            "connections": connections,
            "support_files": [
                source_record(root, p)
                for p in [folder / "README.md", folder / "CONNECTORS.md", manifest, mcp_path]
                if p.is_file()
            ],
        })
    entries = []
    for entry in marketplace["plugins"]:
        source = entry.get("source")
        if isinstance(source, str):
            kind = "partner-local" if source.startswith("./partner-built/") else "top-level-local"
        else:
            kind = "external"
        entries.append({
            "name": entry["name"], "kind": kind, "source": source,
            "description": entry.get("description", ""),
        })
    return {
        "repository": REPOSITORY, "commit": COMMIT, "research_date": "2026-10-20",
        "method": "Static inventory only; upstream plugins and MCP servers not executed.",
        "counts": {
            "top_level_plugins": len(local),
            "skills": sum(len(p["skills"]) for p in local),
            "command_files": sum(len(p["commands"]) for p in local),
            "marketplace_entries": len(entries),
            **{kind: sum(e["kind"] == kind for e in entries)
               for kind in ("top-level-local", "partner-local", "external")},
        },
        "plugins": local,
        "marketplace": entries,
    }


def md(value):
    return str(value).replace("|", "\\|").replace("\n", " ")


def render(data):
    lines = [
        "# 上游场景与入口全量索引", "",
        "> 自动生成：运行 `app/catalog_upstream.py` 更新。中文分析见 `roles.md`、`workflows.md`。",
        "> 上游 name / description 为元数据摘录，保留英文以便精确检索；不代表运行验证。授权见 `THIRD_PARTY_NOTICES.md`。", "",
        f"研究 Commit：`{COMMIT}`。", "",
        "统计口径：顶层插件中的 `skills/**/SKILL.md` 和 `commands/*.md`；"
        "Skill 数不是独立业务数，基础知识 Skill、组合流程可能重叠。"
        "`user-invocable: false` 单独标注；其余是否可调用仍取决于宿主。"
        "README 中的旧命令别名不据此推定可用。", "",
        "| 插件 | Skill 文件 | Command 文件 | MCP 配置条目 | 空 URL |",
        "| --- | ---: | ---: | ---: | ---: |",
    ]
    for p in data["plugins"]:
        lines.append(f"| {p['name']} | {len(p['skills'])} | {len(p['commands'])} | {len(p['connections'])} | {sum(c['empty_url'] for c in p['connections'])} |")
    for p in data["plugins"]:
        lines += ["", f"## {p['name']}", "", "| 类型 | 入口 / 名称 | 上游用途说明 |", "| --- | --- | --- |"]
        for kind in ("skills", "commands"):
            for item in p[kind]:
                meta = item["metadata"]
                name = meta.get("name") or Path(item["path"]).stem
                if name == "SKILL":
                    name = Path(item["path"]).parent.name
                label = "Skill（内部知识）" if meta.get("user-invocable") == "false" else ("Skill" if kind == "skills" else "Command")
                lines.append(f"| {label} | [{md(name)}]({item['url']}) | {md(meta.get('description', '未声明 description'))} |")
    lines += [
        "", "## 合作伙伴与外部市场入口", "",
        "以下仅记录固定版本 marketplace 声明，不等同于逐个下载、审核或验证其能力。"
        "外部仓库自己的许可证、依赖、权限和版本须另行核查。", "",
        "| 插件 | 来源类型 | 源位置 |", "| --- | --- | --- |",
    ]
    for e in data["marketplace"]:
        if e["kind"] == "top-level-local":
            continue
        source = e["source"]
        address = source if isinstance(source, str) else source.get("url", "")
        lines.append(f"| {md(e['name'])} | {e['kind']} | {md(address)} |")
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--check", action="store_true", help="Compare tracked artifacts without rewriting")
    args = parser.parse_args()
    root = args.source.resolve()
    data = inventory(root)
    outputs = {
        PROJECT / "source-index.json": json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        PROJECT / "scenario-index.md": render(data),
    }
    for path, text in outputs.items():
        if args.check:
            if not path.exists() or path.read_text(encoding="utf-8") != text:
                raise SystemExit(f"Out of date: {path}")
        else:
            path.write_text(text, encoding="utf-8")
    print(json.dumps(data["counts"], ensure_ascii=False))


if __name__ == "__main__":
    main()
