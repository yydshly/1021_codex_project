from concurrent.futures import ThreadPoolExecutor
from http.client import HTTPConnection
import json
from pathlib import Path
import tempfile
from threading import Thread
import unittest

from demo_server import DemoError, TicketSandbox, make_server


class ControlTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.addCleanup(self.folder.cleanup)
        self.sandbox = TicketSandbox(Path(self.folder.name) / "state.json")

    def ready(self):
        self.sandbox.act("profile", {"profile": "production"})
        return self.sandbox.act("lookup", {"mode": "available"})["revision"]

    def test_missing_facts_cannot_be_approved(self):
        with self.assertRaises(DemoError) as error:
            self.sandbox.act("approve", {"revision": 1})
        self.assertEqual(error.exception.status, 422)
        self.assertFalse(self.sandbox.snapshot()["receipts"])

    def test_direct_dispatch_without_approval_is_rejected(self):
        revision = self.ready()
        with self.assertRaises(DemoError) as error:
            self.sandbox.act("dispatch", {"revision": revision})
        self.assertEqual(error.exception.status, 403)

    def test_changed_facts_and_lookup_invalidate_approval(self):
        revision = self.ready()
        self.sandbox.act("approve", {"revision": revision})
        state = self.sandbox.act("profile", {"profile": "testing"})
        self.assertIsNone(state["approval"])
        with self.assertRaises(DemoError) as error:
            self.sandbox.act("dispatch", {"revision": revision})
        self.assertEqual(error.exception.status, 409)
        self.sandbox.act("approve", {"revision": state["revision"]})
        state = self.sandbox.act("lookup", {"mode": "unavailable"})
        self.assertIsNone(state["approval"])
        self.assertIn("未查询", state["analysis"]["sourceStatus"])

    def test_concurrent_duplicate_requests_write_one_assignment(self):
        revision = self.ready()
        self.sandbox.act("approve", {"revision": revision})
        with ThreadPoolExecutor(max_workers=4) as pool:
            list(pool.map(lambda _: self.sandbox.act("dispatch", {"revision": revision}), range(8)))
        receipts = self.sandbox.snapshot()["receipts"]
        self.assertEqual(len(receipts), 1)
        self.assertFalse(receipts[0]["replySent"])
        self.assertEqual(receipts[0]["status"], "已分派，未解决")

    def test_http_rejects_cross_origin_and_non_object_requests(self):
        server = make_server(0, Path(self.folder.name) / "http.json")
        worker = Thread(target=server.serve_forever, daemon=True)
        worker.start()
        try:
            for body, headers, expected in [
                ({}, {"Origin": "https://unrelated.example"}, 403),
                ([], {}, 400),
            ]:
                client = HTTPConnection("127.0.0.1", server.server_port, timeout=5)
                client.request("POST", "/api/demo/approve", json.dumps(body), headers)
                response = client.getresponse()
                response.read()
                self.assertEqual(response.status, expected)
                client.close()
        finally:
            server.shutdown()
            worker.join(timeout=5)
            server.server_close()


if __name__ == "__main__":
    unittest.main()
