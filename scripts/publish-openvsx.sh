#!/usr/bin/env bash
# scripts/publish-openvsx.sh — publish the .vsix to Eclipse OpenVSX.
#
# Prerequisites:
#   npm install -g @eclipse/openvsx
#   ovsx login liush2yuxjtu   (paste a token from open-vsx.org/user-settings/tokens)
#
# Usage:  ./scripts/publish-openvsx.sh [path/to/.vsix]
#         (defaults to bin/vscode-extension/claude-statusline-0.1.0.vsix)
set -euo pipefail

cd "$(dirname "$0")/.."

VSIX="${1:-bin/vscode-extension/claude-statusline-$(node -p "require('./bin/vscode-extension/package.json').version").vsix}"

if [ ! -f "$VSIX" ]; then
  echo "× $VSIX not found; build it first with ./scripts/publish-vscode.sh" >&2
  exit 1
fi

echo "→ publishing $VSIX to OpenVSX"
npx ovsx publish "$VSIX"

echo "✓ done. Listing at https://open-vsx.org/extension/liush2yuxjtu/claude-statusline"
