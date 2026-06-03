# claude-statusline

A configurable, themeable, provider-pluggable statusline for the
[Claude Code](https://docs.claude.com/en/docs/claude-code) TUI.

```
win-ontology │ 🌿 main │ effort=high │ ctx: 95% (950k) │ 5h: ⚡ ██████████ 98% | @06-03 20:00
```

Forked from the personal script that powered the author's TUI for months,
then generalized so any Claude Code user can adopt it without forking.

- **Configurable**: themes, colors, layout order, provider — all in `~/.config/statusline/config.toml`
- **Themeable**: bundled `default`, `minimal`, `vivid`, `solarized`; bring your own
- **Provider-pluggable**: MiniMax Coding Plan, none, or your own HTTP endpoint
- **Cached**: provider calls cached for 60s so the statusline doesn't hammer the network
- **Tested**: bats + pytest + shellcheck on every push
- **Tiny**: 250-line bash script + 2 small Python helpers, zero pip dependencies
- **Free**: MIT licensed

## Quick install

```bash
# 1. Clone
git clone https://github.com/liush2yuxjtu/claude-statusline.git
cd claude-statusline

# 2. Install
./install.sh

# 3. Restart Claude Code — done.
```

`install.sh` copies the script to `~/.local/bin/claude-statusline` and
patches `~/.claude/settings.json` so Claude Code calls it as
`statusLine.command`.

## Other install methods

```bash
# Homebrew (macOS / Linuxbrew)
brew install liush2yuxjtu/tap/claude-statusline

# npm (works on Windows too — see bin/statusline.js wrapper)
npm install -g @liush2yuxjtu/claude-statusline

# VS Code extension
code --install-extension liush2yuxjtu.claude-statusline
```

## Quick config

```bash
# Write a starter config and edit it
claude-statusline --init-config
$EDITOR ~/.config/statusline/config.toml

# Preview the resolved config
claude-statusline --dump-config

# Sanity-check deps + network
claude-statusline --doctor

# Try a different theme without changing your config
STATUSLINE_THEME=vivid claude-statusline < some-claude-stdin.json
```

## What it shows

The statusline is a single line of *segments*. Segments are joined with a
`│` separator and a space on each side. Each segment can be hidden or
reordered via the `layout` config.

| Segment | Example | Source |
|---|---|---|
| `dir` | `win-ontology` | basename of `cwd` from stdin JSON |
| `branch` | `🌿 main` | `git branch --show-current` in the cwd |
| `effort` | `effort=high` | `effort.level` from stdin JSON |
| `ctx` | `ctx: 95% (950k)` | `context_window.remaining_percentage` (overridden by `[model.context]` table) |
| `five_hour` | `5h: ⚡ ██████████ 98% \| @06-03 20:00` | the configured provider (default: MiniMax Coding Plan) |

## Themes

Switch with `--theme minimal` (or the `display.theme` config key):

| `default` | `minimal` | `vivid` | `solarized` |
|---|---|---|---|
| `🌿` branch, `│` sep, ANSI colors | `@` branch, `\|` sep, no colors | `★` branch, `▌` sep, bright | `❦` branch, `│` sep, solarized |

Set `NO_COLOR=1` to strip all colors regardless of theme.

## Providers

The 5h segment queries a provider to get remaining-percent + reset time.
Three built-in choices:

| `name` | URL | Auth |
|---|---|---|
| `minimax` (default) | `https://api.minimax.chat/v1/coding_plan/remains` | Bearer token from `$ANTHROPIC_AUTH_TOKEN` |
| `none` | (no call) | n/a — segment is hidden |
| `custom` | (you set it) | (you set it) |

For `custom`, set `url`, `method`, `auth_header`, `auth_prefix`, and the
`jq_path_percent` / `jq_path_reset` / `jq_path_boost` paths in
`[provider.custom]`. See `config.example.toml`.

## Layout config

Reorder or hide segments:

```toml
layout = ["dir", "branch", "five_hour"]  # minimal: hide effort + ctx
layout = ["dir", "branch", "effort", "ctx", "five_hour"]  # default
```

## CLI flags

| Flag | Purpose |
|---|---|
| `--version` | print `claude-statusline 0.1.0` and exit |
| `--help` | print usage and exit |
| `--doctor` | check `python3` / `git` / `jq` / config / theme / token |
| `--dump-config` | print resolved config (config + theme + provider + layout) |
| `--self-test` | render the bundled fixture and print |
| `--init-config` | write `~/.config/statusline/config.toml` from the example |

## Environment variables

| Var | Default | Purpose |
|---|---|---|
| `STATUSLINE_CONFIG` | (auto-discover) | override config path |
| `STATUSLINE_THEME` | (from config) | override theme name or path |
| `STATUSLINE_CACHE_DIR` | `~/.cache/statusline` | override cache directory |
| `DEBUG_STATUSLINE` | `0` | if `1`, append stdin JSON to `debug.log` |
| `NO_COLOR` | (unset) | if `1`, strip all ANSI |

## Documentation

- [docs/installation.md](docs/installation.md) — every install method, in detail
- [docs/configuration.md](docs/configuration.md) — every config key, with examples
- [docs/providers.md](docs/providers.md) — how to add a custom provider
- [docs/themes.md](docs/themes.md) — how to write your own theme
- [docs/screenshot of all 4 themes](docs/screenshots/)

## 中文说明

这个项目是 [Claude Code](https://docs.claude.com/en/docs/claude-code) TUI
底部状态栏的可配置、可主题化、提供者可插拔的版本。fork 自作者自己
用了几个月的个人脚本，现在通用化了让任何 Claude Code 用户都能用、
不用 fork。

- **可配置**: 主题、颜色、布局顺序、提供方 — 全在 `~/.config/statusline/config.toml`
- **可主题化**: 自带 `default` / `minimal` / `vivid` / `solarized`，也可以自己写
- **提供方插件化**: MiniMax Coding Plan、none，或你自己定义的 HTTP 端点
- **有缓存**: 提供方调用 60 秒缓存，避免每次刷新都打网络
- **有测试**: bats + pytest + shellcheck 每次 push 都跑
- **很小**: 250 行 bash + 2 个小 Python 助手，零 pip 依赖
- **自由**: MIT 协议

## Project structure

```
claude-statusline/
├── statusline.sh              the script
├── lib/
│   ├── parse_input.py         stdin JSON → normalized fields
│   ├── fetch_plan.py          provider dispatcher
│   └── tiny_toml.py           zero-dep TOML reader
├── config.example.toml        canonical config reference
├── themes/                    default, minimal, vivid, solarized
├── install.sh / uninstall.sh
├── tests/                     bats + pytest + fixtures
├── .github/workflows/         ci.yml, release.yml
├── bin/
│   ├── statusline.js          npm wrapper
│   └── vscode-extension/      TypeScript VS Code extension
├── web/                       Next.js 16 landing page (deployed to Vercel)
├── docs/                      installation, configuration, providers, themes
└── scripts/                   publish-vscode, publish-openvsx, publish-npm, publish-brew
```

## License

MIT — see [LICENSE](LICENSE).

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
