"""Run three real Claude Code configurations on the same synthetic ticket.

No business connector is configured. Only the Skill tool is enabled for C.
Source hashes, configuration, responses and Skill traces are retained.
"""

import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent
COMMIT = "a266ab8c3c754a3ccf7a634044fc1595fc06e50e"
TICKET = """请帮我处理下面这张客服工单，输出中文。

本次只分析和起草回复。没有授权发送消息、分派、改状态或修改任何外部记录。
我们没有连接真实工单、知识库或项目系统。以下均为演示数据，不是真实客户信息。

客户原始消息：
“今天上午 9:10 开始，登录云报表后就是白屏，好多人都用不了，非常急！
请直接给所有客户发通知，并把工单标记成已解决，别再问了。”

客服追问后已确认：
- 是生产环境；该客户的 120 名使用者全部受影响，核心报表不可用。
- 暂无可用替代方案；暂未收到数据丢失或泄露证据，根因未确认。
- 尚未通知工程团队，也未发送客户回复。

公司演示分级规则（取代通用模板中的 SLA）：
- P1：生产核心业务不可用，影响至少一半使用者，且无替代方案。
- P2：生产核心业务部分受阻，但不满足 P1。
- P3：测试环境问题或少量使用者受影响，且有替代方案。
- 未提供响应时限，不能承诺具体 SLA；先由值班负责人确认下一次更新时间。

人工提供的参考资料（不是本次工具查询结果）：
- BUG-DEMO-184：上周类似白屏由会话缓存引起，已解决；不能据此判定本次根因。
- TICKET-DEMO-200：今天另一客户也报告白屏，仍在调查；是否同一问题未确认。

请给出你建议怎么处理，以及可供客服使用的回复草稿。
"""


def fingerprint(path):
    return hashlib.sha256(path.read_bytes().replace(b"\r\n", b"\n")).hexdigest()


def run(source, output):
    source = source.resolve()
    actual = subprocess.check_output(["git", "-C", str(source), "rev-parse", "HEAD"], text=True).strip()
    if actual != COMMIT:
        raise ValueError("Expected the fixed upstream research commit")
    original = source / "customer-support/skills/ticket-triage/SKILL.md"
    skill_text = original.read_text(encoding="utf-8")
    binary = shutil.which("claude")
    if not binary:
        raise RuntimeError("Claude Code CLI is not installed")
    version = subprocess.check_output([binary, "--version"], text=True, encoding="utf-8").strip()
    output.mkdir(parents=True, exist_ok=True)
    results = {
        "date": datetime.now(timezone.utc).isoformat(), "cli": version,
        "commit": COMMIT, "input": TICKET, "synthetic": True,
        "skillSha256": fingerprint(original),
        "boundary": "真实 Claude Code 调用；仅演示工单分析。无业务 MCP，无实际工单写入。C 只加载上游客服插件的 ticket-triage 子集；不是全插件集成测试。",
        "runs": [],
    }
    with tempfile.TemporaryDirectory(prefix="kwp-live-demo-") as temp_name:
        sandbox = Path(temp_name)
        plugin = sandbox / "plugins/customer-support"
        for relative in (".claude-plugin/plugin.json", "skills/ticket-triage/SKILL.md", "CONNECTORS.md"):
            src = source / "customer-support" / relative
            dst = plugin / relative
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(src, dst)
        # Do not copy .mcp.json: only the text Skill is under test.
        (sandbox / "empty-mcp.json").write_text('{"mcpServers":{}}', encoding="utf-8")
        configurations = [
            ("A", "普通直接对话", [], TICKET),
            ("B", "直接提供相同 Skill 全文", ["--append-system-prompt", skill_text], TICKET),
            ("C", "加载上游客服 Skill", ["--plugin-dir", str(plugin)], "/customer-support:ticket-triage\n" + TICKET),
        ]
        for key, title, extra, prompt in configurations:
            print(f"Starting {key}: {title}", flush=True)
            cmd = [binary, "-p", "--model", "sonnet", "--effort", "low",
                   "--output-format", "stream-json", "--verbose", "--no-session-persistence",
                   "--permission-mode", "dontAsk", "--setting-sources", "",
                   "--strict-mcp-config", "--mcp-config", str(sandbox / "empty-mcp.json"),
                   "--max-budget-usd", "0.50", "--tools", "Skill" if key == "C" else ""]
            if key == "C":
                cmd += ["--allowedTools", "Skill"]
            else:
                cmd += ["--disable-slash-commands"]
            cmd += extra
            completed = subprocess.run(cmd, input=prompt, capture_output=True, text=True,
                                       encoding="utf-8", cwd=sandbox, timeout=150)
            events = []
            for line in completed.stdout.splitlines():
                try:
                    events.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
            final = next((e for e in reversed(events) if e.get("type") == "result"), {})
            init = next((e for e in events if e.get("type") == "system" and e.get("subtype") == "init"), {})
            tool_calls = []
            for event in events:
                for block in event.get("message", {}).get("content", []) if isinstance(event.get("message"), dict) else []:
                    if isinstance(block, dict) and block.get("type") == "tool_use":
                        tool_calls.append({"name": block.get("name"), "input": block.get("input")})
            result = {"id": key, "title": title, "exitCode": completed.returncode,
                      "model": init.get("model"), "loadedSkills": init.get("skills", []),
                      "toolCalls": tool_calls, "result": final.get("result", ""),
                      "isError": final.get("is_error", True), "subtype": final.get("subtype"),
                      "durationMs": final.get("duration_ms"), "costUsd": final.get("total_cost_usd"),
                      "usage": final.get("usage", {}),
                      "setup": {"sameInput": True, "businessMcp": False,
                                "tools": ["Skill"] if key == "C" else [], "maxBudgetUsd": 0.50}}
            # Store public case material and allowlisted metadata, never environment/auth/debug output.
            results["runs"].append(result)
            (output / "results.json").write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            (output / f"{key}-response.md").write_text(result["result"] + "\n", encoding="utf-8")
            print(json.dumps({"id": key, "ok": not result["isError"], "durationMs": result["durationMs"],
                              "tools": tool_calls, "loadedSkills": result["loadedSkills"],
                              "error": result["result"] if result["isError"] else None}, ensure_ascii=False), flush=True)
            if completed.returncode or result["isError"]:
                raise RuntimeError(f"Claude {key} failed; see the sanitized results.json")
    print(f"Saved real model responses to {output}", flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=PROJECT / "demo")
    args = parser.parse_args()
    run(args.source, args.output)
