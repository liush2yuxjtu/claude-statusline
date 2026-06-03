# Changelog

All notable changes to claude-statusline are documented here. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-06-03

### Added
- Initial public release.
- Refactored bash statusline script: ~250 lines, modular (`lib/parse_input.py` + `lib/fetch_plan.py`).
- Configurable via TOML (`~/.config/statusline/config.toml`); see `config.example.toml`.
- Pluggable provider system (`minimax` / `none` / `custom`) with 60s write-through cache.
- Four bundled themes: `default`, `minimal`, `vivid`, `solarized`.
- Layout config: pick which segments to show and in what order.
- CLI flags: `--version`, `--help`, `--doctor`, `--dump-config`, `--self-test`, `--init-config`.
- Bundled `install.sh` + `uninstall.sh` (idempotent; safe to re-run).
- Tiny stdlib-only TOML parser (`lib/tiny_toml.py`) — no pip dependencies.
- Tests: pytest (Python) + bats (shell) + shellcheck.
- CI: GitHub Actions runs shellcheck + bats + pytest on every push.
- VS Code extension (bundled in `bin/vscode-extension/`) that mirrors the script in the VS Code status bar.
- npm wrapper for cross-platform install.
- Homebrew formula in `liush2yuxjtu/homebrew-tap`.
- Landing page on Vercel.

### Fixed (vs the personal script this was forked from)
- `date +%3N` silently broke on macOS — replaced with portable Python timestamp.
- `eval` of unescaped Python output was injection-prone — replaced with a typed pipe.
- Empty-git-repo branch now shows `(empty)` instead of `-`.
- API errors are classified (`no-token` / `net` / `auth` / `http-N` / `generic`) and rendered per-theme.
- API responses are cached (60s) so the statusline does not hammer the provider on every turn.
- Token env var name is configurable.
