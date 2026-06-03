#!/usr/bin/env bash
# uninstall.sh — remove claude-statusline and revert the settings.json patch.

set -e

PREFIX="${PREFIX:-$HOME/.local}"
BIN_DIR="$PREFIX/bin"
BIN_PATH="$BIN_DIR/claude-statusline"
SETTINGS_JSON="${CLAUDE_SETTINGS_JSON:-$HOME/.claude/settings.json}"

say()  { printf '→ %s\n' "$*"; }
die()  { printf '× %s\n' "$*" >&2; exit 1; }

if [ -f "$BIN_PATH" ]; then
  rm -f "$BIN_PATH"
  say "removed $BIN_PATH"
else
  say "$BIN_PATH not present; skipping"
fi

if [ -f "$SETTINGS_JSON" ]; then
  python3 - "$SETTINGS_JSON" "$BIN_PATH" <<'PY'
import json, os, sys
path, target_cmd = sys.argv[1], sys.argv[2]
try:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
except Exception:
    print(f"could not read {path}; leaving it alone")
    sys.exit(0)
sl = data.get("statusLine")
if sl and sl.get("type") == "command" and sl.get("command") == target_cmd:
    del data["statusLine"]
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    os.replace(tmp, path)
    print(f"removed statusLine entry from {path}")
else:
    print(f"statusLine in {path} does not point at {target_cmd}; leaving it alone")
PY
else
  say "$SETTINGS_JSON not present; skipping"
fi

cat <<EOF

✅ claude-statusline uninstalled.

To remove the config file too: rm -rf "${XDG_CONFIG_HOME:-$HOME/.config}/statusline"
To remove the cache:           rm -rf "${XDG_CACHE_HOME:-$HOME/.cache}/statusline"
EOF
