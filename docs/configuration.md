# 配置

`minimax-statusline` 读一个 TOML 配置文件。每个 key 都是可选的，省略就用默认。

## 配置文件位置

脚本按以下顺序找配置文件，找到第一个就停：

1. `$STATUSLINE_CONFIG`（环境变量）—— 必须指向可读文件
2. `$XDG_CONFIG_HOME/statusline/config.toml`（默认 `~/.config/statusline/config.toml`）
3. `~/.statusline.toml`
4. `~/.claude/statusline.toml`

如果一个都找不到，脚本会用内建默认值跑——还能用，只是不能自定义。

## 写一份

```bash
minimax-statusline --init-config   # 写一份 ~/.config/statusline/config.toml
$EDITOR ~/.config/statusline/config.toml
minimax-statusline --dump-config   # 看实际生效的配置
```

仓库里的 `config.example.toml` 是规范参考——每个 key、每个默认值都在注释里写清楚。运行时跑 `minimax-statusline --dump-config` 看实际生效值。

## 配置项速查

```toml
# 5h 段数据来源（提供方后端）
[provider]
name               = "minimax"      # "minimax" | "none" | "custom"
token_env          = "ANTHROPIC_AUTH_TOKEN"
cache_ttl_seconds  = 60
timeout_seconds    = 5

# 自定义提供方模板（仅当 name = "custom" 时用）
# [provider.custom]
# url                 = "https://example.com/v1/usage"
# method              = "GET"
# auth_header         = "Authorization"
# auth_prefix         = "Bearer "
# extra_headers       = { "X-Foo" = "bar" }
# jq_path_percent     = ".data.remaining"   # 指向 0..100 数字
# jq_path_reset       = ".data.next"        # 指向 ISO 毫秒时间戳或字符串
# jq_path_boost       = ".data.boost"       # 可选，0..1000 permille

# 模型 → 上下文窗口上限（substr 匹配，不区分大小写）
[model.context]
"MiniMax-M3"  = 1_000_000
"opus-4"      = 200_000
"sonnet-4"    = 200_000
"haiku-4"     = 200_000

# 显示哪些段、按什么顺序
layout = ["dir", "branch", "effort", "ctx", "five_hour"]

# 视觉 / UX
[display]
theme            = "default"      # "default" | "minimal" | "vivid" | "solarized" | 路径
five_hour_bar    = true           # false = 只显示数字，不画条
ctx_show_tokens  = true           # "95% (950k)" 还是只 "95%"

# 条 / ctx 百分位 的颜色阈值
[thresholds]
green_below      = 50   # >= green_below  → 绿
yellow_below     = 20   # >= yellow_below → 黄
                         # <  yellow_below → 红
high_icon_pct    = 90   # >= 此值时图标换成"高"档
low_icon_pct     = 10   # < 此值时图标换成"低"档
```

## 环境变量覆盖

| 变量 | 默认 | 作用 |
|---|---|---|
| `STATUSLINE_CONFIG` | （自动找） | 强制指定 config 路径 |
| `STATUSLINE_THEME` | （取自 config） | 覆盖 `display.theme` |
| `STATUSLINE_CACHE_DIR` | `~/.cache/statusline` | 覆盖缓存目录 |
| `DEBUG_STATUSLINE` | `0` | 设 `1` 把 stdin JSON 追加到 `debug.log` |
| `NO_COLOR` | （未设） | 设 `1` 关掉所有 ANSI 颜色 |

## 热重载

每次轮询脚本都会被调一次，所以 config 也是每次都重读。改完立即生效——没有守护进程、没有信号、不用重启。

## 从旧版（无配置文件）迁移

如果你之前用的是个人脚本（没有 config 文件），直接：

```bash
minimax-statusline --init-config
```

就会写出默认配置。再按需改。
