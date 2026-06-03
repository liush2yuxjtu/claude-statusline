#!/usr/bin/env bash
# scripts/publish-brew.sh — push the Homebrew formula to the tap repo.
#
# Prerequisites:
#   A GitHub release of claude-statusline must exist (./scripts/release.sh).
#   The tap repo liush2yuxjtu/homebrew-tap must exist (created the first time
#   this script runs; idempotent after).
#
# Usage:  ./scripts/publish-brew.sh [version]
#         (defaults to the version in ./package.json)
set -euo pipefail

cd "$(dirname "$0")/.."

VERSION="${1:-$(node -p "require('./package.json').version")}"
TAR_URL="https://github.com/liush2yuxjtu/claude-statusline/archive/v${VERSION}.tar.gz"

TAP_REPO="liush2yuxjtu/homebrew-tap"
TAP_DIR="${TAP_DIR:-$HOME/work/homebrew-tap}"

echo "→ fetching tarball to compute sha256"
TMP=$(mktemp -d)
curl -sSfL "$TAR_URL" -o "$TMP/src.tar.gz"
SHA=$(shasum -a 256 "$TMP/src.tar.gz" | awk '{print $1}')
rm -rf "$TMP"
echo "  sha256: $SHA"

echo "→ ensuring $TAP_REPO exists"
if ! gh repo view "$TAP_REPO" >/dev/null 2>&1; then
  gh repo create "$TAP_REPO" --public --description "Personal Homebrew tap for liush2yuxjtu"
fi

echo "→ cloning $TAP_REPO to $TAP_DIR"
mkdir -p "$(dirname "$TAP_DIR")"
if [ -d "$TAP_DIR" ]; then
  (cd "$TAP_DIR" && git fetch --quiet && git reset --hard origin/main --quiet)
else
  git clone "https://github.com/$TAP_REPO.git" "$TAP_DIR"
fi

cd "$TAP_DIR"
mkdir -p Formula

cat > Formula/claude-statusline.rb <<EOF
class ClaudeStatusline < Formula
  desc "Configurable, themeable statusline for Claude Code TUI"
  homepage "https://github.com/liush2yuxjtu/claude-statusline"
  url "$TAR_URL"
  sha256 "$SHA"
  license "MIT"

  depends_on "bash"
  depends_on "python@3.11"

  def install
    libexec.install "statusline.sh"
    libexec.install "lib"
    libexec.install "themes"
    libexec.install "config.example.toml"
    (bin/"claude-statusline").write <<~SH
      #!/usr/bin/env bash
      exec "#{libexec}/statusline.sh" "\$@"
    SH
    chmod 0755, bin/"claude-statusline"
  end

  test do
    assert_match "claude-statusline #{version}", shell_output("#{bin}/claude-statusline --version")
  end
end
EOF

git add Formula/claude-statusline.rb
git -c user.email="104006363+liush2yuxjtu@users.noreply.github.com" \
    -c user.name="Liu Shiyu" \
    commit -m "claude-statusline ${VERSION}"
git push origin main

echo "✓ done. Install with: brew install $TAP_REPO/claude-statusline"
