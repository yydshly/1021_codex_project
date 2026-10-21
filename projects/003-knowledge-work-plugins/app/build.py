"""Build the offline research explorer from the versioned research documents."""

import hashlib
import json
from pathlib import Path
import re
import shutil

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent
OUTPUT = PROJECT / "web"


def read(name):
    return (PROJECT / name).read_text(encoding="utf-8")


def plain(text):
    return re.sub(r"\*\*|`", "", text).strip()


CONTROL_LABELS = {
    "prompt": "提示词约束｜上游文字要求",
    "program": "程序与工具｜静态证据及边界",
    "system": "系统强制控制｜建议补齐，未验证",
}


def control_prompt(analysis):
    """Carry the business boundaries into copied requests, not only the UI."""
    lines = [
        "\n【业务落地补充｜研究建议，请替换为本组织规则】",
        "本次业务：[具体对象、范围、日期、版本]。",
        "输入检查：", *["- " + item for item in analysis["input_checks"]],
        "控制责任：以下文字不能替代系统权限或审批。先说明哪些只是模型约定、"
        "哪些程序检查实际运行、哪些权限门已验证；不能把建议控制写成已存在。",
        "系统控制参考：" + analysis["controls"]["system"],
        "异常处理：", *[f"- {trigger}：{action}" for trigger, action in analysis["exceptions"]],
        "上游审批约定：" + analysis["approval"]["upstream"],
        "本组织审批安排：[批准人、具体对象、有效版本及既有授权范围]。",
        "人工安排参考：" + analysis["approval"]["recommended"],
        "验收用例（本次是否执行逐项说明）：", *["- " + item for item in analysis["acceptance"]],
        "交付时区分草稿、待批准、已执行、已核验、失败及结果未知；附实际证据。",
        "价值评估参考：" + analysis["value"]["metric"],
        "业务操作仅在明确授权和对应系统权限内执行；测试中的写入或付款使用沙箱。",
    ]
    return "\n".join(lines)


def write_business_report(workflows, study):
    lines = [
        "# 具体业务落地：流程、控制边界与价值",
        "",
        "> 此文件由 `app/build.py` 从 `workflows.md` 与 `business-analysis.json` 生成；"
        "修改内容来源后重新构建，不手工编辑。",
        "",
        f"深化日期：{study['date']}（Asia/Shanghai）。固定上游版本：`{study['commit']}`。",
        "",
        study["scope"],
        "",
        "## 先判断控制落在哪一层",
        "",
        "| 层次 | 能证明什么 | 不能直接证明什么 |",
        "| --- | --- | --- |",
        "| 提示词 / Skill | 源码明确要求模型遵循步骤、确认或输出结构 | 模型始终遵守、动作无法越权 |",
        "| 程序化检查 | 已审阅程序在特定路径执行判断或计算 | 脚本已运行、调用不可绕过、业务参数正确 |",
        "| 系统强制控制 | 需实际系统对身份、对象、状态、版本与权限进行校验并拒绝违规请求 | 仅有 MCP 配置、工具名或文档里的 Approved 不足以证明 |",
        "",
        "本次没有验证任何真实业务系统的审批拦截。以下“系统强制控制”列是落地设计建议，"
        "不是仓库现有功能清单。“程序”列的未见实现仅限所核对的流程及列出的文件，"
        "不代表已审计全部外部连接器。文件中的 allowed-tools 由宿主解释，"
        "具体生效范围也要验证；Hook 只有在覆盖全部入口、失败时阻断且不可绕过时，才可能承担强制控制。",
        "",
        "业务规则、失败分支与完成状态应分别设计：草稿 → 待批准 → 已授权执行 → 已核验。"
        "授权不等于执行，接口受理不等于业务成功；超时进入“结果未知”，先查状态再重试。"
        "这是一种建议状态设计，不是上游已经实现的统一状态机。",
        "",
        "### 付款示例：让两个批准分别有明确对象",
        "",
        "| 转换 | 人批准什么 | 系统应核对什么（建议） |",
        "| --- | --- | --- |",
        "| 待编码 → 未付款账单 | 数量、金额、目标账本和编码内容 | 身份、账本权限、发票去重；不能在此步骤产生付款 |",
        "| 未付款账单 → 待付款清单 | 先展示现金、工资等近期义务和缺口 | 记录数据日期与缺口；例外审批策略由组织定义 |",
        "| 待付款清单 → 授权付款 | 发票集合、币种、金额、收款对象、账户、日期 | 校验批准绑定的版本；对象改变后重审，不能扩大清单 |",
        "| 授权付款 → 已核验 | 按批准范围执行后检查回执 | 幂等与实际支付状态；超时先查，不盲重试 |",
        "",
        "上游要求两道门，但未据此证明支付 API 内置这套状态机。现金缺失时，上游允许明确披露后提出清单；"
        "要求额外例外审批是本研究增强建议。",
        "",
        "## 如何公平比较直接对话与插件",
        "",
        "比较三组：A 普通业务提问；B 直接对话但提供同样的流程、资料、规则和工具权限；"
        "C 通过插件加载这些内容。A 与 C 的差异包含需求完整性，B 与 C 更能反映包装、"
        "触发和维护的增量；不能把缺输入的 A 当作唯一对照。",
        "",
        "使用同一模型版本、输入快照、工具与授权范围；记录提示配置耗时、处理时间、"
        "事实错误、遗漏、复核返工、外部动作偏离和运行成本。每场景至少覆盖正常、"
        "缺输入、冲突证据、工具不可用四类样本；有写入的场景再加权限拒绝、"
        "重复提交、执行超时与审批后内容变更。随机交错运行并由不知道组别的复核者按同一标准评估。"
        "次数、阈值和成本口径在实验前确定；本研究没有运行该实验或提供量化收益。",
        "",
        "高后果操作的越权或重复执行不能被平均效率收益抵销。"
        "只需一次文案整理时，详细直接对话通常足够；有稳定规则、反复使用和跨人交接时，"
        "流程复用价值更明显。连接器访问、代码计算和可视化工具的增量应与提示词包装分开计量。",
        "",
        "## 流程导航",
        "",
        "| 流程 | 具体业务 |",
        "| --- | --- |",
    ]
    for wid, w in workflows.items():
        lines.append(f"| [{wid} · {w['title']}](#{wid.lower()}) | {w['analysis']['case']} |")
    for wid, w in workflows.items():
        a = w["analysis"]
        lines += ["", f'<a id="{wid.lower()}"></a>', f"## {wid} · {w['title']}", "",
                  f"**具体业务：** {a['case']}", "", "### 输入与执行", "",
                  f"触发及资料：{w['input']}", "", "输入检查（研究建议）：", ""]
        lines += ["- " + item for item in a["input_checks"]]
        lines += ["", "上游执行顺序（归纳）：", ""]
        lines += [f"{i}. {step}" for i, step in enumerate(w["steps"], 1)]
        lines += ["", f"交付物：{w['output']}", "", "### 控制边界", ""]
        lines += [f"- **{label}：** {a['controls'][key]}" for key, label in CONTROL_LABELS.items()]
        lines += ["", "### 异常与人工处理", "",
                  "以下分支是根据上游规则组织的落地建议；不是已执行的故障演练。",
                  "", "| 触发条件 | 处理与停止条件 |", "| --- | --- |"]
        lines += [f"| {trigger} | {action} |" for trigger, action in a["exceptions"]]
        lines += ["", f"**人工审批｜上游规定：** {a['approval']['upstream']}",
                  "", f"**人工审批｜建议落地：** {a['approval']['recommended']}",
                  "", "### 验收标准（建议，未执行）", ""]
        lines += [f"- [ ] {item}" for item in a["acceptance"]]
        lines += ["", "### 相比直接对话的价值（待实验验证）", "",
                  f"- **直接对话基线：** {a['value']['baseline']}",
                  f"- **可复用增量：** {a['value']['increment']}",
                  f"- **成立条件与局限：** {a['value']['limit']}",
                  f"- **建议衡量：** {a['value']['metric']}", "", "### 固定版本证据", ""]
        lines += [f"- [{src['label']}]({src['url']})" for src in w["sources"]]
        lines += [f"- [{src['label']}]({src['url']})" for src in a["sources"]]
    (PROJECT / "business-analysis.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def build_data():
    index = json.loads(read("source-index.json"))
    labels = json.loads((HERE / "labels.json").read_text(encoding="utf-8"))
    text = read("workflows.md")
    refs = dict(re.findall(r"^\[([^\]]+)\]: (\S+)", text, re.M))
    workflows = {}
    for wid, title, body in re.findall(r"^## (W\d+) · ([^\n]+)\n(.*?)(?=^## |\Z)", text, re.M | re.S):
        fields = {key: plain(value) for key, value in re.findall(r"^- \*\*(.+?)\*\*：(.+)$", body, re.M)}
        workflows[wid] = {
            "id": wid, "title": title, "input": fields["触发 / 输入"],
            "steps": fields["流程"].split(" → "), "constraints": fields["约束"],
            "output": fields["交付标准"], "validation": fields["降级 / 参考验收"],
            "sources": [
                {"label": label, "url": refs[key]}
                for label, key in re.findall(r"\[([^\]]+)\]\[([^\]]+)\]", fields["证据"])
            ],
        }
    study = json.loads(read("business-analysis.json"))
    assert study["commit"] == index["commit"]
    assert set(study["workflows"]) == set(workflows), "Business coverage must match W01–W17"
    for wid, w in workflows.items():
        analysis = study["workflows"][wid]
        for key in ("case", "input_checks", "exceptions", "acceptance"):
            assert analysis[key], f"{wid}: missing {key}"
        assert set(analysis["controls"]) == set(CONTROL_LABELS)
        assert set(analysis["approval"]) == {"upstream", "recommended"}
        assert set(analysis["value"]) == {"baseline", "increment", "limit", "metric"}
        assert all(len(pair) == 2 and all(pair) for pair in analysis["exceptions"])
        analysis["sources"] = [
            {"label": path, "url": f"https://github.com/anthropics/knowledge-work-plugins/blob/{index['commit']}/{path}"}
            for path in analysis["extra_sources"]
        ]
        w["analysis"] = analysis
    playbook = read("request-playbook.md")
    generic = re.search(r"## 通用任务卡\s+```text\n(.*?)```", playbook, re.S).group(1).strip()
    templates = [{"id": "T00", "title": "通用任务卡", "text": generic, "note": "适用于任何任务；按实际需要删减。"}]
    for tid, title, body in re.findall(r"^### (T\d+) · ([^\n]+)\n(.*?)(?=^### |^## |\Z)", playbook, re.M | re.S):
        quote = "\n".join(re.findall(r"^> (.+)", body, re.M))
        note = " ".join(line for line in body.strip().splitlines() if line and not line.startswith(">"))
        templates.append({"id": tid, "title": title, "text": quote, "note": plain(note)})
    templates[0]["text"] += (
        "\n控制责任：[哪些是模型行为要求，哪些程序检查会实际运行，哪些操作由系统权限强制拦截]。"
        "\n异常：[缺材料、冲突、权限拒绝、超时的处理与停止条件]。"
        "\n人工决策：[审批人、对象、版本、范围、已有授权与升级条件]。"
        "\n验收：[正常与失败样本、预期结果、核验依据]；未执行测试不得标为通过。"
        "\n价值：[与同样输入、工具和完整流程的直接对话相比，衡量配置、遗漏、返工和成本]。"
    )
    constraints = []
    for line in read("constraints.md").splitlines():
        if re.match(r"\| C\d+", line):
            code, title, evidence, request = [plain(x) for x in line.strip("|").split("|")]
            constraints.append({"id": code, "title": title, "evidence": evidence, "request": request.strip("“”")})
    role_rows = {}
    for line in read("roles.md").splitlines():
        cells = [plain(x) for x in line.strip("|").split("|")]
        if len(cells) == 6 and cells[1] in {p["name"] for p in index["plugins"]}:
            role_rows[cells[1]] = cells
    roles = []
    skills = []
    template_map = {t["id"]: t for t in templates}
    for key, title, group, summary, wid, featured, tid in labels["roles"]:
        plugin = next(p for p in index["plugins"] if p["name"] == key)
        row = role_rows[key]
        roles.append({
            "id": key, "title": title, "group": group, "summary": summary,
            "count": len(plugin["skills"]), "audience": row[0], "business": row[2],
            "input": row[3], "output": row[4], "workflow": wid,
        })
        for entry in plugin["skills"]:
            name = Path(entry["path"]).parent.name
            if name not in labels["names"]:
                raise ValueError(f"Missing Chinese label: {key}/{name}")
            chinese = labels["names"][name]
            workflow = workflows[wid] if name == featured else None
            if workflow and tid:
                prompt = template_map[tid]["text"]
            elif workflow:
                prompt = (
                    f"请完成「{chinese}」，用于[具体业务目的]。\n"
                    f"输入资料：[文件、链接、背景]。请先检查是否具备这些条件：{workflow['input']}\n"
                    f"执行顺序：{' → '.join(workflow['steps'])}\n"
                    f"约束：{workflow['constraints']}\n"
                    f"交付：{workflow['output']}\n"
                    "权限：本次仅分析并生成草稿；如需外部写入，先列出具体对象和变更供我确认。\n"
                    "验收：说明实际检查结果，区分已完成、未验证和待决定事项。"
                )
            else:
                prompt = (
                    f"请协助[使用者]完成「{chinese}」，结果用于[具体业务目的]。\n"
                    f"工作背景：{title}；对象与时间范围为[范围]。\n"
                    "输入：[文件、数据、链接]；公司规则：[政策、口径或模板]。\n"
                    "先检查输入和可用工具，提出适合此任务的执行步骤；关键缺口先询问，其余注明假设。\n"
                    "关键事实附来源与时间；区分事实、推断和建议，不编造缺失资料。\n"
                    "权限：本次仅分析并生成草稿；外部操作须先明确对象、范围和授权。\n"
                    "交付：[内容、格式、保存位置]。验收：[具体可检查条件]。\n"
                    "最后列出已完成、未验证和仍需我决定的事项。"
                )
            if workflow:
                prompt += control_prompt(workflow["analysis"])
                if tid:
                    template_map[tid]["text"] = prompt
                    template_map[tid]["note"] += " 已加入具体业务的控制边界、异常、人工决策和验收补充。"
            skills.append({
                "id": f"{key}/{name}", "role": key, "name": name, "title": chinese,
                "description": entry["metadata"].get("description", ""), "source": entry["url"],
                "internal": entry["metadata"].get("user-invocable") == "false",
                "workflow": workflow, "prompt": prompt,
            })
    assert len(roles) == 17 and len(skills) == 181 and len(workflows) == 17
    assert sum(bool(s["workflow"]) for s in skills) == 17
    assert len(templates) == 13 and len(constraints) == 14
    write_business_report(workflows, study)
    return {
        "commit": index["commit"], "date": index["research_date"], "roles": roles,
        "analysisDate": study["date"], "analysisScope": study["scope"],
        "skills": skills, "constraints": constraints, "templates": templates,
        "counts": index["counts"],
        "docs": "https://github.com/yydshly/1021_codex_project/tree/main/projects/003-knowledge-work-plugins",
    }


def main():
    data = build_data()
    demo_record = PROJECT / "demo/execution-record.json"
    if demo_record.exists():
        data["demoRecord"] = json.loads(demo_record.read_text(encoding="utf-8"))
    OUTPUT.mkdir(exist_ok=True)
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
    (OUTPUT / "data.js").write_text("window.RESEARCH = " + payload + ";\n", encoding="utf-8")
    for name in ("app.js", "styles.css", "live-demo.js"):
        shutil.copyfile(HERE / name, OUTPUT / name)
    page = (HERE / "index.html").read_text(encoding="utf-8")
    for name in ("data.js", "app.js", "styles.css", "live-demo.js"):
        digest = hashlib.sha256((OUTPUT / name).read_bytes()).hexdigest()[:12]
        page = page.replace(f'"./{name}"', f'"./{name}?v={digest}"')
    (OUTPUT / "index.html").write_text(page, encoding="utf-8")
    for name in ("UPSTREAM_LICENSE.txt", "THIRD_PARTY_NOTICES.md"):
        shutil.copyfile(PROJECT / name, OUTPUT / name)
    if demo_record.exists():
        shutil.copyfile(demo_record, OUTPUT / "demo-record.json")
    for name in ("capability-map.svg", "capability-map.png"):
        shutil.copyfile(PROJECT / "assets" / name, OUTPUT / name)
    print(f"Exported {len(data['roles'])} roles, {len(data['skills'])} skills, "
          f"{len(data['templates'])} templates, {len(data['constraints'])} constraints to {OUTPUT}")


if __name__ == "__main__":
    main()
