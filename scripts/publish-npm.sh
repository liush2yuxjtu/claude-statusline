#!/usr/bin/env bash
# scripts/publish-npm.sh — publish the npm wrapper.
#
# Prerequisites:
#   npm login   (one-time, prompts in browser)
#
# Usage:  ./scripts/publish-npm.sh
set -euo pipefail

cd "$(dirname "$0")/.."

echo "→ dry-run"
npm publish --dry-run

echo
echo "→ publishing to npm (--access public)"
npm publish --access public

VERSION=$(node -p "require('./package.json').version")
echo "✓ done. Listing at https://www.npmjs.com/package/@liushiyumathxjtu/claude-statusline"
echo "  install: npm install -g @liushiyumathxjtu/claude-statusline@$VERSION"
