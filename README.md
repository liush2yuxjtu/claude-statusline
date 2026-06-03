# minimax-statusline

> 🌐 **落地页**：<https://web-zeta-sage-59.vercel.app>

为 [MiniMax CLI](https://docs.claude.com/en/docs/claude-code) 底部状态栏做的可配置、可主题化、提供方可插拔的 5h 状态条。**专为 MiniMax Coding Plan 优化**。

```
win-ontology │ 🌿 main │ effort=high │ ctx: 95% (950k) │ 5h: ⚡ ██████████ 98% | @06-03 20:00
```

fork 自作者自己用了几个月的个人脚本，现在通用化了让任何 MiniMax 用户都能用、不用 fork。

- **可配置**：主题、颜色、布局顺序、提供方 — 全在 `~/.config/statusline/config.toml`
- **可主题化**：自带 `default` / `minimal` / `vivid` / `solarized`，也可以自己写 .toml
- **提供方可插拔**：默认 MiniMax Coding Plan；可选 `none` 隐藏 5h 段；可选 `custom` 接入你自己的 HTTP 端点
- **有缓存**：提供方调用 60 秒缓存，避免每次刷新都打网络
- **测试齐**：bats + pytest + shellcheck 每次 push 都跑
- **超轻量**：~250 行 bash + 2 个小 Python 助手，零 pip 依赖
- **自由**：MIT 协议

## 一行安装

```bash
git clone https://github.com/liush2yuxjtu/minimax-statusline.git
cd minimax-statusline
./install.sh
# 重启 MiniMax 即生效
```

`install.sh` 做的事：

1. 把脚本拷到 `~/.local/bin/minimax-statusline`
2. 改 `~/.claude/settings.json` 的 `statusLine.command` 指向新路径
3. 写一份 `~/.config/statusline/config.toml` 默认配置（如果还没有）
4. 跑一次 `--version` 冒烟测试

幂等：再跑一次会自动升级。

## 其它安装方式

```bash
# Homebrew（macOS / Linuxbrew）
brew install liush2yuxjtu/tap/minimax-statusline

# npm（Windows 也能装，包装器会调 bash 跑脚本）
npm install -g @liushiyumathxjtu/minimax-statusline

# VS Code 扩展（薄壳，仍需先装上面任意一种 bash 脚本）
code --install-extension liush2yuxjtu.minimax-statusline
```

## 快速配置

```bash
# 写一份默认配置再编辑
minimax-statusline --init-config
$EDITOR ~/.config/statusline/config.toml

# 看实际生效的配置
minimax-statusline --dump-config

# 体检（python3 / git / jq / config / theme / token）
minimax-statusline --doctor

# 不改配置试主题
STATUSLINE_THEME=vivid minimax-statusline < some-stdin.json
```

## 显示哪些段

状态条是单行多个段，段间用 `│` 分隔 + 两侧空格。每个段都能通过 `layout` 配置隐藏或重排。

| 段 | 示例 | 数据来源 |
|---|---|---|
| `dir` | `win-ontology` | stdin JSON 里的 `cwd` 取末级目录 |
| `branch` | `🌿 main` | cwd 里跑 `git branch --show-current` |
| `effort` | `effort=high` | stdin JSON 里的 `effort.level` |
| `ctx` | `ctx: 95% (950k)` | `context_window.remaining_percentage`（可用 `[model.context]` 表覆盖） |
| `five_hour` | `5h: ⚡ ██████████ 98% \| @06-03 20:00` | 配的提供方（默认 MiniMax Coding Plan） |

## 四套主题

改 `display.theme` 切换，或 `STATUSLINE_THEME=xxx minimax-statusline` 临时试看。

| 主题 | 风格 | 适合 |
|---|---|---|
| `default` | 粗体 ANSI 色 + `🌿` 分支 + `█/░` 条 | 大多数人 |
| `minimal` | 无颜色 + `@` 分支 + `\|` 分隔 + `#/.` 条 | tmux / screen / 无色终端 |
| `vivid` | 高对比亮色 + `★` 分支 + `▌` 分隔 + `▓/░` 条 | 辅助功能、亮底 |
| `solarized` | Solarized Base3 调色 + `❦` 分支 + `▰/▱` 条 | Solarized 党 |

设 `NO_COLOR=1` 一键关掉所有 ANSI 颜色。

## 提供方（5h 数据来源）

5h 段需要两样数据：剩余百分位（0..100）+ 重置时间。从可配置的 **提供方** 后端取。

### 内置提供方

| `name` | URL | 鉴权 |
|---|---|---|
| `minimax`（默认） | `https://api.minimax.chat/v1/coding_plan/remains` | Bearer token，读自 `$ANTHROPIC_AUTH_TOKEN` |
| `none` | （不发请求） | n/a —— 段直接隐藏 |
| `custom` | （你设） | （你设） |

### `custom` 模式

在 `config.toml` 里设 `url`、`method`、`auth_header`、`auth_prefix`，外加 `jq_path_*`（点路径）抽数据：

```toml
[provider]
name = "custom"
cache_ttl_seconds = 60

[provider.custom]
url             = "https://my-api.example.com/usage"
method          = "GET"                    # GET 或 POST
auth_header     = "Authorization"          # 留空跳过鉴权
auth_prefix     = "Bearer "
extra_headers   = { "X-Org" = "acme" }
jq_path_percent = "data.remaining.percent" # 点路径
jq_path_reset   = "data.next_reset"        # ISO 毫秒时间戳或字符串
jq_path_boost   = "data.boost_permille"    # 可选；0..1000 permille
```

### 错误分类

| 类别 | 触发条件 | 主题色 key |
|---|---|---|
| `no-token` | token 环境变量空 | `error.no_token`（默认：静默） |
| `net` | DNS / 连接 / 读超时 | `error.net`（默认：红） |
| `auth` | HTTP 401/403 | `error.auth`（默认：红） |
| `http-N` | 其它 HTTP 错误 | `error.http`（默认：黄） |
| `generic` | 意外异常 | `error.generic`（默认：红） |

## 布局配置

```toml
# 只显示 3 段（极简模式）
layout = ["dir", "branch", "five_hour"]

# 全部 5 段（默认）
layout = ["dir", "branch", "effort", "ctx", "five_hour"]
```

## CLI 参数

| 参数 | 用途 |
|---|---|
| `--version` | 打印 `minimax-statusline 0.2.0` 后退出 |
| `--help` | 打印用法后退出 |
| `--doctor` | 体检：python3 / git / jq / config / theme / token |
| `--dump-config` | 打印实际生效的配置（config + theme + provider + layout） |
| `--self-test` | 用内置 fixture 跑一遍并打印 |
| `--init-config` | 把 `~/.config/statusline/config.toml` 写成默认配置 |

## 环境变量

| 变量 | 默认 | 用途 |
|---|---|---|
| `STATUSLINE_CONFIG` | （自动找） | 覆盖 config 路径 |
| `STATUSLINE_THEME` | （取自 config） | 覆盖主题名或路径 |
| `STATUSLINE_CACHE_DIR` | `~/.cache/statusline` | 覆盖缓存目录 |
| `DEBUG_STATUSLINE` | `0` | 设 `1` 把 stdin JSON 追加进 `debug.log` |
| `NO_COLOR` | （未设） | 设 `1` 关掉所有 ANSI 颜色 |

## 文档

- [docs/installation.md](docs/installation.md) — 每种安装方式，详细
- [docs/configuration.md](docs/configuration.md) — 每个 config key，举例
- [docs/providers.md](docs/providers.md) — 怎么加自定义提供方
- [docs/themes.md](docs/themes.md) — 怎么写自己的主题

## 仓库结构

```
minimax-statusline/
├── minimax-statusline.sh         主脚本（bash 3.2 兼容）
├── lib/
│   ├── parse_input.py            stdin JSON → 归一化字段
│   ├── fetch_plan.py             提供方调度（minimax / none / custom）+ 60s 缓存
│   └── tiny_toml.py              零依赖的 TOML 解析
├── config.example.toml           配置参考
├── themes/                       default / minimal / vivid / solarized
├── install.sh / uninstall.sh     安装 / 卸载
├── tests/                        bats + pytest + fixtures
├── .github/workflows/            ci.yml, release.yml
├── bin/
│   ├── minimax-statusline.js     npm 包装器
│   └── vscode-extension/         TypeScript VS Code 扩展
├── web/                          Next.js 16 落地页（部署到 Vercel）
├── docs/                         installation / configuration / providers / themes
└── scripts/                      publish-vscode / publish-openvsx / publish-npm / publish-brew
```

## 协议

MIT — 见 [LICENSE](LICENSE)。

## 更新日志

见 [CHANGELOG.md](CHANGELOG.md)。
