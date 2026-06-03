# 主题

主题是个 TOML 文件，控制颜色、字符、电条字符。把 `display.theme` 配成自带主题的名字，或者你自定义的 .toml 文件路径。

## 自带主题

| 名字 | 风格 | 适合 |
|---|---|---|
| `default` | 粗体 ANSI 色 + `🌿` 分支 + `│` 分隔 + `█/░` 条 | 大多数人 |
| `minimal` | 无颜色 + `@` 分支 + `\|` 分隔 + `#/.` 条 | tmux / screen / 无色终端 |
| `vivid` | 高对比亮色 + `★` 分支 + `▌` 分隔 + `▓/░` 条 | 辅助功能、亮底 |
| `solarized` | Solarized Base3 调色 + `❦` 分支 + `▰/▱` 条 | Solarized 党 |

不改 config 临时试主题：

```bash
STATUSLINE_THEME=vivid minimax-statusline < some-stdin.json
```

## 主题文件格式

主题是个平铺的 TOML，下面是全部可配 key 和默认值。

```toml
# 顶层颜色（取值：black red green yellow blue magenta cyan white，
#                  或 bold_<color>，或 faint/dim，或 "" 跳过）
dir_color    = "bold_cyan"
branch_color = "bold_yellow"
sep_color    = "dim"

# 字符
branch_glyph = "🌿"      # 任意：emoji、ASCII、空格
sep_glyph    = "│"

# 5h 电池条
bar_filled = "█"          # 任意块字符
bar_empty  = "░"
icon_high  = "⚡"         # r >= high_icon_pct 时
icon_mid   = "🔋"         # 其它时候
icon_low   = "🪫"         # r < low_icon_pct 时

# Effort 档颜色（key 是 CLI 发出的 effort level，小写）
[effort]
default = "faint"
low     = "bold_blue"
medium  = "bold_cyan"
high    = "bold_magenta"
max     = "bold_magenta"

# 5h 条颜色（high / mid / low 三档）
[bar]
high = "bold_green"
mid  = "bold_yellow"
low  = "bold_red"

# ctx 剩余百分位颜色
[ctx]
high = "bold_green"
mid  = "bold_yellow"
low  = "bold_red"

# 提供方错误状态
[error]
no_token = ""            # 静默 —— token 缺失时什么都不显示
net      = "bold_red"
auth     = "bold_red"
http     = "bold_yellow"
generic  = "bold_red"
```

## 写自己的

在 `~/.config/statusline/themes/my-theme.toml` 里写一份：

```toml
# 复古绿磷光主题 —— 全绿、无 emoji、纯 ASCII
dir_color    = ""
branch_color = "bold_green"
sep_color    = "faint"
branch_glyph = ">"
sep_glyph    = "|"
bar_filled   = "="
bar_empty    = "."
icon_high    = "++"
icon_mid     = "=="
icon_low     = "--"

[effort]
default = "faint"
low     = "bold_green"
medium  = "bold_green"
high    = "bold_green"
max     = "bold_green"

[bar]
high = "bold_green"
mid  = "bold_green"
low  = "bold_green"

[ctx]
high = "bold_green"
mid  = "bold_green"
low  = "bold_green"

[error]
no_token = "faint"
net      = "bold_green"
auth     = "bold_green"
http     = "bold_green"
generic  = "bold_green"
```

然后在 config 里设 `display.theme = "my-theme"`。脚本会先在 `<脚本目录>/themes/` 找 `<name>.toml`，找不到再用直接路径。

## 颜色命名

| 名字 | ANSI | 备注 |
|---|---|---|
| `black` `red` `green` `yellow` `blue` `magenta` `cyan` `white` | 8 标准 | 普通强度 |
| `bold_black` `bold_red` … `bold_white` | 8 亮色 | 粗体 / 高亮 |
| `faint` | 暗白 | 低对比 |
| `dim` | 暗灰 | 比 `faint` 更暗 |
| `""`（空） | 无 | 不发颜色转义 |

设 `NO_COLOR=1` 覆盖任何主题，关掉所有颜色。

## 快速预览

`minimax-statusline` 从 stdin 读 JSON，所以不动 CLI 也能预览主题：

```bash
cat tests/fixtures/basic.json | STATUSLINE_THEME=vivid minimax-statusline
```
