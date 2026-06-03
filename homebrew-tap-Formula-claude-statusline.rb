class ClaudeStatusline < Formula
  desc "Configurable, themeable statusline for Claude Code TUI"
  homepage "https://github.com/liush2yuxjtu/claude-statusline"
  url "https://github.com/liush2yuxjtu/claude-statusline/archive/refs/tags/v0.1.0.tar.gz"
  sha256 "PLACEHOLDER_WILL_BE_FILLED_BY_release_workflow"
  license "MIT"
  head "https://github.com/liush2yuxjtu/claude-statusline.git", branch: "main"

  depends_on "bash"
  depends_on "python@3.11"

  def install
    libexec.install "statusline.sh"
    libexec.install "lib"
    libexec.install "themes"
    libexec.install "config.example.toml"
    (bin/"claude-statusline").write <<~SH
      #!/usr/bin/env bash
      exec "#{libexec}/statusline.sh" "$@"
    SH
    chmod 0755, bin/"claude-statusline"
  end

  test do
    assert_match "claude-statusline #{version}", shell_output("#{bin}/claude-statusline --version")
  end
end
