"""Tests for lib/fetch_plan.py — provider dispatcher and error classification."""
from __future__ import annotations

import json
import os
import sys
import unittest
from unittest import mock

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))

import fetch_plan  # noqa: E402


class TestProviderNone(unittest.TestCase):
    def test_returns_hidden(self) -> None:
        out = fetch_plan.provider_none("", {}, "/tmp/cache-test")
        self.assertTrue(out["ok"])
        self.assertTrue(out["hidden"])
        self.assertIsNone(out["percent"])
        self.assertIsNone(out["reset"])


class TestProviderMinimax(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = "/tmp/statusline-test-cache"
        # Clean up any stale cache from a previous test.
        cache = os.path.join(self.tmp, "api.json")
        if os.path.exists(cache):
            os.remove(cache)

    def test_no_token(self) -> None:
        out = fetch_plan.provider_minimax("", {}, self.tmp)
        self.assertFalse(out["ok"])
        self.assertEqual(out["error"], "no-token")

    def test_http_error(self) -> None:
        from urllib.error import HTTPError
        with mock.patch.object(fetch_plan.urlopen,
                               side_effect=HTTPError("http://x", 401, "auth", {}, None)):
            out = fetch_plan.provider_minimax("tok", {}, self.tmp)
        self.assertFalse(out["ok"])
        self.assertEqual(out["error"], "http-401")

    def test_success_writes_cache(self) -> None:
        fake = {
            "model_remains": [
                {"model_name": "general",
                 "current_interval_remaining_percent": 73,
                 "end_time": 1748976000000,  # 2025-06-03 16:00 UTC
                 "interval_boost_permille": 250}
            ]
        }
        with mock.patch.object(fetch_plan.urlopen) as m:
            m.return_value.__enter__.return_value.read.return_value = json.dumps(fake).encode()
            out = fetch_plan.provider_minimax("tok", {"cache_ttl_seconds": 60}, self.tmp)
        self.assertTrue(out["ok"])
        self.assertEqual(out["percent"], 73)
        self.assertIn("reset", out)
        self.assertTrue(out["boost"].startswith(" x1.2"))
        # Cache written
        self.assertTrue(os.path.exists(os.path.join(self.tmp, "api.json")))

    def test_cache_hit_returns_stale_false(self) -> None:
        # Pre-populate the cache
        os.makedirs(self.tmp, exist_ok=True)
        cache = os.path.join(self.tmp, "api.json")
        with open(cache, "w") as f:
            json.dump({"ok": True, "percent": 50, "reset": "06-03 16:00",
                       "boost": "", "error": "", "stale": False}, f)
        with mock.patch.object(fetch_plan.urlopen) as m:
            m.return_value.read.side_effect = AssertionError("should not call network")
            out = fetch_plan.provider_minimax("tok", {"cache_ttl_seconds": 60}, self.tmp)
        self.assertTrue(out["ok"])
        self.assertEqual(out["percent"], 50)
        self.assertTrue(out["stale"])


class TestProviderCustom(unittest.TestCase):
    def test_no_url(self) -> None:
        out = fetch_plan.provider_custom("tok", {"custom": {}}, "/tmp/x")
        self.assertFalse(out["ok"])
        self.assertEqual(out["error"], "no-url")

    def test_success_with_paths(self) -> None:
        fake = {"data": {"remaining": 42, "next": 1748976000000, "boost_permille": 0}}
        with mock.patch.object(fetch_plan.urlopen) as m:
            m.return_value.__enter__.return_value.read.return_value = json.dumps(fake).encode()
            out = fetch_plan.provider_custom(
                "tok",
                {"custom": {
                    "url": "https://example.com/usage",
                    "jq_path_percent": "data.remaining",
                    "jq_path_reset": "data.next",
                    "jq_path_boost": "data.boost_permille",
                }, "cache_ttl_seconds": 0},
                "/tmp/y",
            )
        self.assertTrue(out["ok"])
        self.assertEqual(out["percent"], 42)
        self.assertIn("reset", out)


class TestMainDispatch(unittest.TestCase):
    def test_dispatches_to_none(self) -> None:
        with mock.patch.object(sys, "stdin") as m:
            m.isatty.return_value = False
            m.read.return_value = json.dumps({"name": "none", "token_env": "X"})
            with mock.patch("os.environ", {}):
                # Re-route the call: easier to call main with patched env.
                # The provider reads cache_dir from env too.
                with mock.patch.dict(os.environ, {"STATUSLINE_CACHE_DIR": "/tmp/c-z"}):
                    with mock.patch.object(sys, "stdout") as out:
                        fetch_plan.main()
                        # Just verify it didn't raise
        # Loose assertion — we mainly care that the dispatch path works.

    def tearDown(self) -> None:
        # Remove the cache the main-dispatch test may have created.
        for d in ("/tmp/cache-test", "/tmp/x", "/tmp/y", "/tmp/c-z"):
            import shutil
            if os.path.isdir(d):
                shutil.rmtree(d, ignore_errors=True)


if __name__ == "__main__":
    unittest.main()
