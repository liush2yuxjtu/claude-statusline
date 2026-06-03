#!/usr/bin/env bash
# scripts/capture-demo.sh — record a short asciinema demo of claude-statusline
# rendering on a fixture, then convert to a GIF for the landing page.
#
# Prerequisites:
#   brew install asciinema   (or: pip install asciinema)
#   brew install agg         (the asciinema GIF generator)
#
# Outputs:
#   assets/claude-statusline-demo.cast
#   assets/claude-statusline-demo.gif
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p assets

FIXTURE="tests/fixtures/basic.json"
if [ ! -f "$FIXTURE" ]; then
  echo "× $FIXTURE not found" >&2
  exit 1
fi

CAST="assets/claude-statusline-demo.cast"
GIF="assets/claude-statusline-demo.gif"

echo "→ recording asciinema → $CAST"
asciinema rec \
  --cols 110 --rows 6 \
  --title "claude-statusline demo" \
  --command "bash -c '
    echo \"# default theme\";
    cat $FIXTURE | STATUSLINE_THEME=default bash statusline.sh;
    sleep 0.5;
    echo;
    echo \"# minimal theme\";
    cat $FIXTURE | STATUSLINE_THEME=minimal bash statusline.sh;
    sleep 0.5;
    echo;
    echo \"# vivid theme\";
    cat $FIXTURE | STATUSLINE_THEME=vivid bash statusline.sh;
    sleep 0.5;
    echo;
    echo \"# solarized theme\";
    cat $FIXTURE | STATUSLINE_THEME=solarized bash statusline.sh;
    sleep 1.0;
  '" \
  "$CAST"

if command -v agg >/dev/null 2>&1; then
  echo "→ converting to GIF → $GIF"
  agg --theme monokai --speed 1.5 "$CAST" "$GIF"
else
  echo "! agg not installed; skipping GIF conversion"
  echo "  brew install agg  (then re-run)"
fi

echo "✓ done."
ls -lh assets/
