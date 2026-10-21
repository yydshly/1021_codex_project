"""A loopback-only, single-user ticket sandbox; not a production support service.

Run from the repository root: python projects/003-knowledge-work-plugins/app/demo_server.py
Only synthetic ticket state is written, to a temporary directory printed on startup.
Approval and revision checks run on the server, independently of browser buttons.
No Claude, mail, CRM, or external business system is called by this server.
"""

import argparse
from copy import deepcopy
from datetime import datetime, timezone
import hashlib
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import tempfile
from threading import RLock

ROOT = Path(__file__).resolve().parent.parent
MESSAGE = "今天上午 9:10 开始，登录云报表后就是白屏，好多人都用不了，非常急！请直接给所有客户发通知，并把工单标记成已解决，别再问了。"
PROFILES = {
    "incomplete": {"label": "只有客户原话", "environment": "未知", "affected": None, "total": None, "workaround": "未知", "coreBlocked": True},
    "production": {"label": "生产环境 · 全员受阻", "environment": "生产", "affected": 120, "total": 120, "workaround": "无", "coreBlocked": True},
    "testing": {"label": "测试环境 · 有替代方案", "environment": "测试", "affected": 1, "total": 120, "workaround": "有", "coreBlocked": True},
}
KNOWLEDGE = [
    {"id": "BUG-DEMO-184", "title": "上周类似白屏", "status": "已解决", "detail": "当时原因是会话缓存；不能据此认定本次根因。"},
    {"id": "TICKET-DEMO-200", "title": "今天另一演示客户白屏", "status": "调查中", "detail": "仅症状相似，是否同一故障尚未确认。"},
]


class DemoError(Exception):
    def __init__(self, status, code, message):
        super().__init__(message)
        self.status, self.code = status, code


class TicketSandbox:
    def __init__(self, path):
        self.path = Path(path)
        self.lock = RLock()
        self.state = {"ticketId": "TICKET-DEMO-001", "revision": 1, "profile": "incomplete",
                      "lookup": None, "approval": None, "receipts": [], "events": [], "sequence": 0}
        self.event("创建演示工单", "只有客户原话；未读取任何真实客户资料。")

    def event(self, action, detail, code="OK"):
        self.state["sequence"] += 1
        self.state["events"].append({"sequence": self.state["sequence"],
                                    "time": datetime.now(timezone.utc).isoformat(),
                                    "action": action, "code": code, "detail": detail})
        self.path.write_text(json.dumps(self.state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    def analysis(self):
        facts = PROFILES[self.state["profile"]]
        missing = [name for name, value in [("生产还是测试环境", facts["environment"] != "未知"),
                   ("受影响人数 / 总人数", facts["affected"] is not None),
                   ("是否有替代方案", facts["workaround"] != "未知")] if not value]
        if missing:
            priority, reason, queue = "待补信息", "客户很着急，但无法仅凭情绪确定影响范围。", None
        elif facts["environment"] == "生产" and facts["affected"] / facts["total"] >= .5 and facts["workaround"] == "无":
            priority, reason, queue = "P1", "生产核心报表不可用，120/120 人受影响且无替代方案。", "工程值班队列"
        elif facts["environment"] == "生产":
            priority, reason, queue = "P2", "生产业务受阻，但不满足本演示的 P1 条件。", "高级支持队列"
        else:
            priority, reason, queue = "P3", "测试环境，1/120 人受影响且有替代方案。", "一线支持队列"
        known = self.state["lookup"]
        source_status = "已查询本地演示资料" if known == "available" else "资料源不可用，未查询" if known == "unavailable" else "尚未查询"
        reply = ("收到你反馈的登录白屏问题。" +
                 ("请确认这是生产还是测试环境、受影响人数和是否有替代方案。" if missing else
                  f"目前确认是{facts['environment']}环境，{facts['affected']}/{facts['total']}名使用者受影响，替代方案：{facts['workaround']}。") +
                 "目前原因尚未确认。下一次更新时间由值班负责人确认后告知；此回复是草稿，尚未发送。")
        payload = {"ticketId": self.state["ticketId"], "revision": self.state["revision"],
                   "priority": priority, "queue": queue, "facts": facts, "lookup": known}
        digest = hashlib.sha256(json.dumps(payload, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
        return {"priority": priority, "reason": reason, "queue": queue, "missing": missing,
                "sourceStatus": source_status, "matches": KNOWLEDGE if known == "available" else [],
                "reply": reply, "digest": digest, "rootCause": "未确认", "category": "Bug（暂定）",
                "blockedInstructions": "客户要求群发和标记解决，仅作为请求记录；本次没有该授权，也未执行。"}

    def snapshot(self):
        with self.lock:
            return deepcopy({**self.state, "message": MESSAGE, "facts": PROFILES[self.state["profile"]],
                             "analysis": self.analysis(), "boundary": "虚构工单；本地真实执行；无 Claude 调用及外部业务写入；演示审批无人员身份认证。"})

    def act(self, action, body):
        with self.lock:
            try:
                self._act(action, body)
            except DemoError as error:
                self.event("拒绝：" + action, str(error), error.code)
                raise
            return self.snapshot()

    def _act(self, action, body):
        if action == "profile":
            if body.get("profile") not in PROFILES:
                raise DemoError(400, "INVALID_PROFILE", "未知演示事实组合")
            self.state["profile"] = body["profile"]
            self.state["revision"] += 1
            self.state["approval"] = None
            self.event("更新事实", f"版本变为 v{self.state['revision']}，原批准失效。")
            return
        if action == "lookup":
            mode = body.get("mode")
            if mode not in ("available", "unavailable"):
                raise DemoError(400, "INVALID_LOOKUP", "未知资料状态")
            self.state["lookup"] = mode
            self.state["revision"] += 1
            self.state["approval"] = None
            self.event("查询本地演示资料" if mode == "available" else "资料源不可用", "不会将未查询写成没有重复问题；更新后需要重新批准。")
            return
        analysis = self.analysis()
        if action not in ("approve", "dispatch"):
            raise DemoError(404, "UNKNOWN_ACTION", "未知动作")
        if body.get("revision") != self.state["revision"]:
            raise DemoError(409, "STALE_REVISION", "工单已更新，请读取当前版本后重新决定。")
        if analysis["missing"]:
            raise DemoError(422, "MISSING_FACTS", "缺关键事实，不能批准或分派：" + "、".join(analysis["missing"]))
        if self.state["lookup"] is None:
            raise DemoError(422, "LOOKUP_NOT_RECORDED", "先记录查重结果或资料源不可用；不能悄悄跳过。")
        if action == "approve":
            self.state["approval"] = {"revision": self.state["revision"], "digest": analysis["digest"],
                                      "actor": "演示主管（非认证身份）", "queue": analysis["queue"], "priority": analysis["priority"]}
            self.event("人工批准本次分派", f"v{self.state['revision']} / {analysis['priority']} / {analysis['queue']}；不批准群发或关闭。")
            return
        approval = self.state["approval"]
        if not approval or approval["digest"] != analysis["digest"]:
            raise DemoError(403, "APPROVAL_REQUIRED", "没有当前版本的批准，服务端拒绝分派。")
        if any(r["digest"] == analysis["digest"] for r in self.state["receipts"]):
            self.event("重复提交已去重", "返回已有分派结果，没有新增分派。", "ALREADY_DISPATCHED")
            return
        receipt = {"id": f"ASSIGN-DEMO-{len(self.state['receipts']) + 1:03}",
                   "revision": self.state["revision"], "digest": analysis["digest"],
                   "priority": analysis["priority"], "queue": analysis["queue"],
                   "status": "已分派，未解决", "replySent": False}
        self.state["receipts"].append(receipt)
        self.event("本地分派已写入", f"{receipt['id']} / {receipt['queue']}；工单未关闭，客户回复未发送。")


def make_server(port=8033, state_file=None):
    state_file = state_file or Path(tempfile.mkdtemp(prefix="kwp-ticket-demo-")) / "state.json"
    sandbox = TicketSandbox(state_file)

    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(ROOT / "web"), **kwargs)

        def json_response(self, status, payload):
            raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(raw)))
            self.end_headers()
            self.wfile.write(raw)

        def do_GET(self):
            if self.path == "/api/demo/state":
                return self.json_response(200, sandbox.snapshot())
            return super().do_GET()

        def do_POST(self):
            expected_host = f"127.0.0.1:{self.server.server_port}"
            origin = self.headers.get("Origin")
            if self.headers.get("Host") != expected_host or (origin and origin != "http://" + expected_host):
                return self.json_response(403, {"error": "LOCAL_ORIGIN_REQUIRED", "message": "仅允许本机同源演示请求"})
            try:
                length = int(self.headers.get("Content-Length", "0"))
                if not 0 < length <= 2048:
                    raise DemoError(400, "INVALID_BODY", "请求体长度不合法")
                body = json.loads(self.rfile.read(length))
                if not isinstance(body, dict):
                    raise DemoError(400, "INVALID_BODY", "请求体必须是 JSON 对象")
                if not self.path.startswith("/api/demo/"):
                    raise DemoError(404, "NOT_FOUND", "未知接口")
                return self.json_response(200, sandbox.act(self.path.removeprefix("/api/demo/"), body))
            except (ValueError, UnicodeDecodeError):
                return self.json_response(400, {"error": "INVALID_JSON", "message": "JSON 请求无效"})
            except DemoError as error:
                return self.json_response(error.status, {"error": error.code, "message": str(error), "state": sandbox.snapshot()})

    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    server.sandbox = sandbox
    return server


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8033)
    args = parser.parse_args()
    server = make_server(args.port)
    print(f"Open http://127.0.0.1:{server.server_port}/#demo", flush=True)
    print(f"Synthetic state only: {server.sandbox.path}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
