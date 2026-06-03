#!/usr/bin/env bash
# install.sh — install claude-statusline for the current user.
#
# Behavior:
#   - Copies the repo's statusline.sh to $PREFIX/bin/claude-statusline
#   - Patches ~/.claude/settings.json so Claude Code calls it as statusLine
#   - Optionally writes ~/.config/statusline/config.toml from config.example.toml
#   - Detects macOS (bash 3.2) and Linux (bash 4+) for sanity checks
#
# Re-run safe: detects an existing install and offers to upgrade.

set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
PREFIX="${PREFIX:-$HOME/.local}"
BIN_DIR="$PREFIX/bin"
SETTINGS_JSON="${CLAUDE_SETTINGS_JSON:-$HOME/.claude/settings.json}"
BIN_PATH="$BIN_DIR/claude-statusline"
SCRIPT_SRC="$REPO_DIR/statusline.sh"

say()  { printf '→ %s\n' "$*"; }
warn() { printf '! %s\n' "$*" >&2; }
die()  { printf '× %s\n' "$*" >&2; exit 1; }

# ─── Preflight ─────────────────────────────────────────────────────────
[ -f "$SCRIPT_SRC" ] || die "run this from the repo root; $SCRIPT_SRC missing"
command -v python3 >/dev/null 2>&1 || die "python3 is required but not on PATH"
command -v bash    >/dev/null 2>&1 || die "bash is required but not on PATH"

# ─── Install the script ───────────────────────────────────────────────
mkdir -p "$BIN_DIR"
chmod +x "$SCRIPT_SRC"
if [ -e "$BIN_PATH" ] && ! cmp -s "$SCRIPT_SRC" "$BIN_PATH"; then
  cp "$BIN_PATH" "$BIN_PATH.prev" 2>/dev/null || true
  say "backed up previous install to $BIN_PATH.prev"
fi
cp "$SCRIPT_SRC" "$BIN_PATH"
chmod +x "$BIN_PATH"
say "installed $BIN_PATH"

# Make sure ~/.local/bin is on PATH for future shells.
case ":$PATH:" in
  *":$BIN_DIR:"*) ;;
  *)
    warn "$BIN_DIR is not on your PATH"
    warn "add this to your shell rc:  export PATH=\"$BIN_DIR:\$PATH\""
    ;;
esac

# ─── Patch ~/.claude/settings.json ────────────────────────────────────
mkdir -p "$(dirname "$SETTINGS_JSON")"
if [ -f "$SETTINGS_JSON" ]; then
  if ! command -v python3 >/dev/null 2>&1; then
    die "python3 required to safely patch $SETTINGS_JSON"
  fi
  python3 - "$SETTINGS_JSON" "$BIN_PATH" <<'PY'
import json, sys, os
path, new_cmd = sys.argv[1], sys.argv[2]
try:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
except Exception:
    data = {}
existing = data.get("statusLine", {}) or {}
if existing.get("type") == "command" and existing.get("command") == new_cmd:
    print("settings.json already points at the installed script; no change")
    sys.exit(0)
data["statusLine"] = {"type": "command", "command": new_cmd}
tmp = path + ".tmp"
with open(tmp, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
    f.write("\n")
os.replace(tmp, path)
print(f"patched {path} → statusLine.command = {new_cmd!r}")
PY
else
  cat > "$SETTINGS_JSON" <<EOF
{
  "statusLine": {
    "type": "command",
    "command": "$BIN_PATH"
  }
}
EOF
  say "wrote $SETTINGS_JSON"
fi

# ─── Optional config file ─────────────────────────────────────────────
CFG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/statusline"
CFG_FILE="$CFG_DIR/config.toml"
if [ ! -f "$CFG_FILE" ] && [ -f "$REPO_DIR/config.example.toml" ]; then
  mkdir -p "$CFG_DIR"
  cp "$REPO_DIR/config.example.toml" "$CFG_FILE"
  say "wrote $CFG_FILE (edit it to customize)"
else
  say "config file already exists at $CFG_FILE; leaving it alone"
fi

# ─── Smoke test ───────────────────────────────────────────────────────
if "$BIN_PATH" --version >/dev/null 2>&1; then
  say "smoke test OK: $($BIN_PATH --version)"
else
  warn "smoke test FAILED; run: $BIN_PATH --doctor"
fi

cat <<EOF

✅ claude-statusline installed.

Next:
  1. Restart Claude Code (or run 'claude --continue') to pick up the new statusline.
  2. Edit $CFG_FILE to customize theme, provider, and layout.
  3. Try $BIN_PATH --doctor for a diagnostic dump.
  4. Try STATUSLINE_THEME=vivid $BIN_PATH < some-json.json to preview a theme.

To uninstall: re-run uninstall.sh (or rm $BIN_PATH and remove the
"statusLine" key from $SETTINGS_JSON).
EOF
