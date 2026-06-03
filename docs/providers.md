# 提供方

5h 段（"5h: ⚡ ███████░░░ 98% | @06-03 20:00"）需要两样数据：剩余百分位（0..100）和重置时间。`minimax-statusline` 从可配置的 **提供方** 后端取这两样数据。

## 内置提供方

### `minimax`（默认）

向 `https://api.minimax.chat/v1/coding_plan/remains` 发请求，Bearer token 从 `$ANTHROPIC_AUTH_TOKEN` 取（可通过 `[provider] token_env` 改）。从 `model_remains[]` 里挑 `model_name == "general"` 的项，把 `current_interval_remaining_percent` 和 `end_time`（毫秒时间戳）格式化。

```toml
[provider]
name = "minimax"
token_env = "ANTHROPIC_AUTH_TOKEN"
```

### `none`

完全隐藏 5h 段。如果你没有 MiniMax Coding Plan token，或者不在乎 5h 数据，用这个。

```toml
[provider]
name = "none"
```

段会从 layout 里直接消失（不是空着显示）。如果想要个占位符，用 `custom` 并让 `jq_path_percent` 返回 `null`。

### `custom`

自己接 HTTP 端点。设 URL、方法、鉴权头、以及 `jq_path_*`（点路径或斜杠路径）来抽数据。响应会缓存 `cache_ttl_seconds` 秒（默认 60）。

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
jq_path_percent = "data.remaining.percent" # 点路径；解析字典 key 和列表下标
jq_path_reset   = "data.next_reset"        # ISO 毫秒时间戳或 ISO 字符串
jq_path_boost   = "data.boost_permille"    # 可选；0..1000 permille，250 表示 +25%
```

脚本会从 `[provider] token_env`（默认 `ANTHROPIC_AUTH_TOKEN`）取 token，按 `Authorization: Bearer <token>` 加上（除非覆盖 `auth_header` / `auth_prefix`）。

如果网络请求失败、但上次成功的有缓存，会返回缓存值并标 `stale: true`（状态条加 `·cached` 后缀，提示数据不是新鲜的）。

## 错误分类

错误按类型分桶，每桶用主题色渲染：

| 类别 | 触发条件 | 主题 key |
|---|---|---|
| `no-token` | token 环境变量空 / 未设 | `error.no_token`（默认：静默） |
| `net` | DNS / 连接 / 读超时 | `error.net`（默认：红） |
| `auth` | HTTP 401/403 | `error.auth`（默认：红） |
| `http-N` | 其它 HTTP 错误（404, 500…） | `error.http`（默认：黄） |
| `generic` | 意外异常 | `error.generic`（默认：红） |

在主题文件里覆盖颜色（`themes/<name>.toml`）：

```toml
[error]
no_token = ""            # 静默 —— token 缺失时什么都不显示
net      = "bold_yellow" # 把 "⚠ net" 从红换成黄
auth     = "bold_red"
http     = "faint"
generic  = "bold_red"
```

## 缓存

缓存是 `${STATUSLINE_CACHE_DIR:-~/.cache/statusline}/api.json` 这一个 JSON 文件。每次调提供方时检查 mtime——比 `cache_ttl_seconds` 新就直接用缓存、不打提供方。

如果网络请求失败、又有上次成功的缓存，会用缓存值 + `stale: true`，状态条加 `·cached` 后缀。

清缓存：

```bash
rm -rf ~/.cache/statusline
```

关缓存：

```toml
[provider]
cache_ttl_seconds = 0
```

## 新增内置提供方

如果你有内部 usage API 想作为一等提供方，看 `lib/fetch_plan.py` —— 加个函数进 `PROVIDERS` 字典，再更新 `config.example.toml` 写清楚，发个 PR。
