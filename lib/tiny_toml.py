"""tiny_toml — minimal TOML reader for the subset claude-statusline uses.

Supports:
  - [section] and [section.subsection] headers
  - key = "string", key = 123, key = 1.5, key = true/false
  - arrays: key = ["a", "b", "c"] or [1, 2, 3]
  - inline tables: key = { x = "y", z = 1 }
  - dotted keys in tables: a.b = "c"  -> {"a": {"b": "c"}}
  - comments starting with #
  - """triple-quoted""" multi-line strings (basic)
  - underscore-separated numbers: 1_000_000

This is NOT a full TOML 1.0 parser. It exists so the script has zero pip
dependencies. Pass an already-parsed dict to override or skip.
"""
from __future__ import annotations

import re
import sys
from typing import Any


class TomlError(ValueError):
    pass


def _strip_inline_comment(s: str) -> str:
    """Strip a # comment, respecting # inside strings."""
    out, i, in_str, quote = [], 0, False, ""
    while i < len(s):
        ch = s[i]
        if in_str:
            out.append(ch)
            if ch == "\\" and i + 1 < len(s):
                out.append(s[i + 1])
                i += 2
                continue
            if ch == quote:
                in_str = False
        else:
            if ch in ('"', "'"):
                in_str = True
                quote = ch
                out.append(ch)
            elif ch == "#":
                break
            else:
                out.append(ch)
        i += 1
    return "".join(out).rstrip()


def _parse_value(raw: str) -> Any:
    s = raw.strip()
    if not s:
        return ""
    # String
    if s.startswith('"""') and s.endswith('"""') and len(s) >= 6:
        return s[3:-3]
    if (s.startswith('"') and s.endswith('"')) or (
        s.startswith("'") and s.endswith("'")
    ):
        try:
            return bytes(s[1:-1], "utf-8").decode("unicode_escape")
        except Exception:
            return s[1:-1]
    # Array
    if s.startswith("[") and s.endswith("]"):
        inner = s[1:-1].strip()
        if not inner:
            return []
        return [_parse_value(part) for part in _split_array(inner)]
    # Inline table
    if s.startswith("{") and s.endswith("}"):
        return _parse_inline_table(s[1:-1])
    # Bool
    if s == "true":
        return True
    if s == "false":
        return False
    # Number
    cleaned = s.replace("_", "")
    try:
        if any(c in cleaned for c in ".eE"):
            return float(cleaned)
        return int(cleaned)
    except ValueError:
        pass
    raise TomlError(f"cannot parse value: {raw!r}")


def _split_array(s: str) -> list[str]:
    parts, buf, depth, in_str, quote = [], [], 0, False, ""
    for ch in s:
        if in_str:
            buf.append(ch)
            if ch == quote:
                in_str = False
            continue
        if ch in ('"', "'"):
            in_str = True
            quote = ch
            buf.append(ch)
            continue
        if ch in "[{":
            depth += 1
        elif ch in "]}":
            depth -= 1
        elif ch == "," and depth == 0:
            parts.append("".join(buf).strip())
            buf = []
            continue
        buf.append(ch)
    if buf:
        parts.append("".join(buf).strip())
    return [p for p in parts if p]


def _parse_inline_table(body: str) -> dict:
    out: dict[str, Any] = {}
    for piece in _split_array(body):
        if "=" not in piece:
            raise TomlError(f"bad inline table entry: {piece!r}")
        k, v = piece.split("=", 1)
        out[k.strip()] = _parse_value(v)
    return out


def _set_deep(root: dict, dotted: str, value: Any) -> None:
    parts = dotted.split(".")
    cur = root
    for p in parts[:-1]:
        cur = cur.setdefault(p, {})
        if not isinstance(cur, dict):
            raise TomlError(f"key conflict at {p!r}")
    cur[parts[-1]] = value


def loads(text: str) -> dict:
    root: dict[str, Any] = {}
    section: dict[str, Any] = root
    section_path: list[str] = []
    text = text.replace("\r\n", "\n")
    for lineno, line in enumerate(text.split("\n"), 1):
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if stripped.startswith("[") and stripped.endswith("]"):
            header = stripped[1:-1].strip()
            if header.startswith("[") and header.endswith("]"):
                raise TomlError(f"array-of-tables not supported: {header!r}")
            section_path = [p.strip() for p in header.split(".")]
            section = root
            for p in section_path:
                if p not in section or not isinstance(section[p], dict):
                    section[p] = {}
                section = section[p]
            continue
        if "=" not in line:
            raise TomlError(f"line {lineno}: expected key = value, got {line!r}")
        k, v = line.split("=", 1)
        k = k.strip()
        v = _strip_inline_comment(v)
        if not re.match(r"^[A-Za-z0-9_.\-]+$", k):
            raise TomlError(f"line {lineno}: bad key {k!r}")
        value = _parse_value(v)
        if section_path:
            _set_deep(section, k, value)
        else:
            _set_deep(root, k, value)
    return root


def load(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return loads(f.read())


if __name__ == "__main__":
    if len(sys.argv) > 1:
        import json
        print(json.dumps(load(sys.argv[1]), indent=2, ensure_ascii=False))
    else:
        print("usage: tiny_toml.py <file.toml>", file=sys.stderr)
        sys.exit(2)
