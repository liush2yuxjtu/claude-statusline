"""fetch_plan — provider-pluggable 5h plan-usage fetcher.

Each provider is a small function (token, config) -> dict containing at
least:
  ok:        bool
  percent:   int (0..100) or None
  reset:     str (human-readable, e.g. "06-03 18:00") or None
  boost:     str (e.g. " x1.2") or ""
  error:     str (e.g. "net", "auth", "http-401") or ""
  stale:     bool (True if served from cache)

The shell side passes a JSON config object on stdin, and we emit a single
JSON object on stdout. No env access from Python (caller resolves token_env).
"""
from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def _cache_path(cache_dir: str) -> Path:
    Path(cache_dir).mkdir(parents=True, exist_ok=True)
    return Path(cache_dir) / "api.json"


def _read_cache(p: Path, ttl: int) -> dict | None:
    if not p.exists() or ttl <= 0:
        return None
    try:
        age = time.time() - p.stat().st_mtime
        if age > ttl:
            return None
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return None


def _write_cache(p: Path, payload: dict) -> None:
    try:
        p.write_text(json.dumps(payload), encoding="utf-8")
    except Exception:
        pass


def _format_reset(ms: Any) -> str:
    try:
        t = time.localtime(float(ms) / 1000.0)
        return time.strftime("%m-%d %H:%M", t)
    except Exception:
        return "?"


def provider_minimax(token: str, cfg: dict, cache_dir: str) -> dict:
    url = "https://api.minimax.chat/v1/coding_plan/remains"
    ttl = int(cfg.get("cache_ttl_seconds", 60))
    p = _cache_path(cache_dir)
    cached = _read_cache(p, ttl)
    if cached and cached.get("ok"):
        out = dict(cached)
        out["stale"] = True
        return out
    if not token:
        return {"ok": False, "error": "no-token"}
    try:
        req = Request(url, headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        })
        with urlopen(req, timeout=int(cfg.get("timeout_seconds", 5))) as resp:
            body = resp.read()
        data = json.loads(body)
    except HTTPError as e:
        return {"ok": False, "error": f"http-{e.code}"}
    except URLError:
        # Fall back to stale cache so the user still sees a value.
        if cached:
            out = dict(cached)
            out["stale"] = True
            return out
        return {"ok": False, "error": "net"}
    except Exception as e:
        return {"ok": False, "error": type(e).__name__}
    models = data.get("model_remains", []) or []
    general = next((m for m in models if m.get("model_name") == "general"), None)
    if not general:
        return {"ok": False, "error": "no-general"}
    p5 = general.get("current_interval_remaining_percent")
    end5 = general.get("end_time") or 0
    b5 = general.get("interval_boost_permille") or 0
    payload = {
        "ok": True,
        "percent": int(p5) if p5 is not None else None,
        "reset": _format_reset(end5),
        "boost": f" x{(b5/1000 + 1):.1f}" if b5 else "",
        "error": "",
        "stale": False,
    }
    _write_cache(p, payload)
    return payload


def provider_none(token: str, cfg: dict, cache_dir: str) -> dict:
    return {"ok": True, "percent": None, "reset": None, "boost": "",
            "error": "", "stale": False, "hidden": True}


def provider_custom(token: str, cfg: dict, cache_dir: str) -> dict:
    c = cfg.get("custom", {}) or {}
    url = c.get("url")
    if not url:
        return {"ok": False, "error": "no-url"}
    method = (c.get("method") or "GET").upper()
    auth_header = c.get("auth_header", "Authorization")
    auth_prefix = c.get("auth_prefix", "Bearer ")
    headers = {"Content-Type": "application/json"}
    for k, v in (c.get("extra_headers") or {}).items():
        headers[k] = str(v)
    if token and auth_header:
        headers[auth_header] = f"{auth_prefix}{token}"
    ttl = int(cfg.get("cache_ttl_seconds", 60))
    p = _cache_path(cache_dir)
    cached = _read_cache(p, ttl)
    if cached and cached.get("ok"):
        out = dict(cached)
        out["stale"] = True
        return out
    try:
        req = Request(url, data=b"" if method == "GET" else b"{}",
                      headers=headers, method=method)
        with urlopen(req, timeout=int(cfg.get("timeout_seconds", 5))) as resp:
            body = resp.read()
        data = json.loads(body)
    except HTTPError as e:
        return {"ok": False, "error": f"http-{e.code}"}
    except URLError:
        if cached:
            out = dict(cached)
            out["stale"] = True
            return out
        return {"ok": False, "error": "net"}
    except Exception as e:
        return {"ok": False, "error": type(e).__name__}

    def _dig(obj: Any, path: str) -> Any:
        cur = obj
        for part in (path or "").split("."):
            if not part:
                continue
            if isinstance(cur, dict):
                cur = cur.get(part)
            elif isinstance(cur, list):
                try:
                    cur = cur[int(part)]
                except Exception:
                    return None
            else:
                return None
        return cur

    pct = _dig(data, c.get("jq_path_percent", ""))
    reset_raw = _dig(data, c.get("jq_path_reset", ""))
    boost_raw = _dig(data, c.get("jq_path_boost", ""))
    if isinstance(pct, (int, float)):
        pct = int(round(pct))
    else:
        pct = None
    if reset_raw is None:
        reset = None
    elif isinstance(reset_raw, (int, float)):
        reset = _format_reset(reset_raw)
    else:
        reset = str(reset_raw)
    boost = ""
    if isinstance(boost_raw, (int, float)) and boost_raw:
        boost = f" x{(float(boost_raw)/1000 + 1):.1f}"
    payload = {
        "ok": True, "percent": pct, "reset": reset, "boost": boost,
        "error": "", "stale": False,
    }
    _write_cache(p, payload)
    return payload


PROVIDERS = {
    "minimax": provider_minimax,
    "none": provider_none,
    "custom": provider_custom,
}


def main() -> int:
    cfg_raw = sys.stdin.read() if not sys.stdin.isatty() else "{}"
    try:
        cfg = json.loads(cfg_raw) if cfg_raw.strip() else {}
    except Exception:
        cfg = {}
    name = cfg.get("name", "minimax")
    token_env = cfg.get("token_env", "ANTHROPIC_AUTH_TOKEN")
    token = os.environ.get(token_env, "")
    cache_dir = os.environ.get(
        "STATUSLINE_CACHE_DIR",
        os.path.join(os.path.expanduser("~"), ".cache", "statusline"),
    )
    fn = PROVIDERS.get(name, provider_minimax)
    result = fn(token, cfg, cache_dir)
    sys.stdout.write(json.dumps(result))
    return 0


if __name__ == "__main__":
    sys.exit(main())
