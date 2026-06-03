#!/usr/bin/env bash
# scripts/publish-vscode.sh — package + publish the VS Code extension.
#
# Prerequisites:
#   npm install -g @vscode/vsce
#   vsce login liush2yuxjtu      (paste Azure DevOps PAT with Marketplace scope)
#
# Usage:  ./scripts/publish-vscode.sh
set -euo pipefail

cd "$(dirname "$0")/.."

EXT_DIR="bin/vscode-extension"
if [ ! -d "$EXT_DIR" ]; then
  echo "× $EXT_DIR not found" >&2
  exit 1
fi

cd "$EXT_DIR"

echo "→ installing deps"
npm install --no-audit --no-fund --silent

echo "→ type-checking"
npx tsc -p . --noEmit

echo "→ building"
npx tsc -p .

VERSION=$(node -p "require('./package.json').version")
VSIX="claude-statusline-${VERSION}.vsix"

echo "→ packaging $VSIX"
npx vsce package --no-dependencies --out "$VSIX"

echo "→ publishing to VS Code Marketplace"
npx vsce publish --packagePath "$VSIX"

echo "✓ done. $VSIX is at $EXT_DIR/$VSIX"
echo "  next: ./scripts/publish-openvsx.sh $VSIX"
