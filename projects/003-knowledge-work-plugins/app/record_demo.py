"""Exercise the real HTTP sandbox and save a replayable, credential-free record."""

from datetime import datetime, timezone
from http.client import HTTPConnection
import json
from pathlib import Path
import tempfile
from threading import Thread

from demo_server import make_server

PROJECT = Path(__file__).resolve().parent.parent


def record():
    with tempfile.TemporaryDirectory(prefix="kwp-http-check-") as folder:
        server = make_server(0, Path(folder) / "state.json")
        worker = Thread(target=server.serve_forever, daemon=True)
        worker.start()
        checks = []
        state = server.sandbox.snapshot()

        def call(title, action, body, expected, receipt_count):
            nonlocal state
            client = HTTPConnection("127.0.0.1", server.server_port, timeout=5)
            client.request("POST", "/api/demo/" + action, json.dumps(body), {"Content-Type": "application/json"})
            response = client.getresponse()
            result = json.loads(response.read())
            status = response.status
            client.close()
            assert status == expected, (title, status, result)
            state = result if status == 200 else result["state"]
            assert len(state["receipts"]) == receipt_count, title
            checks.append({"title": title, "request": {"action": action, "body": body},
                           "status": status, "code": result.get("error") or state["events"][-1]["code"],
                           "receiptCount": receipt_count, "revision": state["revision"],
                           "priority": state["analysis"]["priority"], "lastEvent": state["events"][-1],
                           "snapshot": state})

        try:
            call("缺关键事实时尝试批准", "approve", {"revision": 1}, 422, 0)
            call("补齐生产环境事实", "profile", {"profile": "production"}, 200, 0)
            call("查询本地演示资料", "lookup", {"mode": "available"}, 200, 0)
            call("绕过按钮直接请求未批准分派", "dispatch", {"revision": state["revision"]}, 403, 0)
            call("批准当前 P1 分派", "approve", {"revision": state["revision"]}, 200, 0)
            old_revision = state["revision"]
            call("改为测试环境使原批准失效", "profile", {"profile": "testing"}, 200, 0)
            call("提交旧版本分派", "dispatch", {"revision": old_revision}, 409, 0)
            call("新版本未重新批准就分派", "dispatch", {"revision": state["revision"]}, 403, 0)
            call("重新批准当前 P3 分派", "approve", {"revision": state["revision"]}, 200, 0)
            call("执行本地分派", "dispatch", {"revision": state["revision"]}, 200, 1)
            call("重复提交分派请求", "dispatch", {"revision": state["revision"]}, 200, 1)
            call("模拟资料源不可用", "lookup", {"mode": "unavailable"}, 200, 1)
            assert state["analysis"]["sourceStatus"] == "资料源不可用，未查询"
            call("切回生产环境", "profile", {"profile": "production"}, 200, 1)
            call("披露资料缺口后批准 P1 分派", "approve", {"revision": state["revision"]}, 200, 1)
            call("实际写入 P1 分派", "dispatch", {"revision": state["revision"]}, 200, 2)
            client = HTTPConnection("127.0.0.1", server.server_port, timeout=5)
            client.request("GET", "/api/demo/state")
            readback = json.loads(client.getresponse().read())
            client.close()
            assert readback["receipts"] == state["receipts"]
            assert all(not r["replySent"] and r["status"] == "已分派，未解决" for r in readback["receipts"])
            assert readback["analysis"]["rootCause"] == "未确认"
            artifact = {"date": datetime.now(timezone.utc).isoformat(), "kind": "actual-local-http-execution",
                        "syntheticData": True, "llmInvoked": False, "externalBusinessWrites": False,
                        "method": "15 次真实 HTTP POST，加最终 GET 读回；断言状态码、分派数量和未发送 / 未解决状态。",
                        "checks": checks, "finalState": readback}
            destination = PROJECT / "demo/execution-record.json"
            destination.parent.mkdir(exist_ok=True)
            destination.write_text(json.dumps(artifact, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print(f"PASS: {len(checks)} real HTTP checks and final read-back; saved {destination}")
        finally:
            server.shutdown()
            worker.join(timeout=5)
            server.server_close()


if __name__ == "__main__":
    record()
