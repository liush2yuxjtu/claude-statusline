# Themes

A theme is a TOML file that controls colors, glyphs, and bar characters.
Set `display.theme` in your config to one of the bundled themes by name,
or to a path to your own theme file.

## Bundled themes

| Name | Style | Best for |
|---|---|---|
| `default` | Bold ANSI colors, `🌿` branch, `│` sep, `█/░` bar | Most users |
| `minimal` | No colors, `@` branch, `\|` sep, `#/.` bar | tmux / screen / no-color terminals |
| `vivid` | High-contrast bright colors, `★` branch, `▌` sep, `▓/░` bar | Accessibility, light-on-dark |
| `solarized` | Solarized Base3 mapped to ANSI, `❦` branch, `│` sep, `▰/▱` bar | Solarized fans |

Switch at runtime without changing your config:

```bash
STATUSLINE_THEME=vivid minimax-statusline < some-stdin.json
```

## Theme schema

A theme is a flat TOML with these keys. Defaults shown.

```toml
# Top-level colors (one of: black red green yellow blue magenta cyan white,
#                       or bold_<color>, or faint/dim, or "" to skip)
dir_color    = "bold_cyan"
branch_color = "bold_yellow"
sep_color    = "dim"

# Glyphs
branch_glyph = "🌿"      # anything: emoji, ASCII, blank
sep_glyph    = "│"

# Battery / 5h bar
bar_filled = "█"          # any block char
bar_empty  = "░"
icon_high  = "⚡"         # used when r >= high_icon_pct
icon_mid   = "🔋"         # used otherwise
icon_low   = "🪫"         # used when r < low_icon_pct

# Effort level colors (the key is what MiniMax emits, lower-cased)
[effort]
default = "faint"
low     = "bold_blue"
medium  = "bold_cyan"
high    = "bold_magenta"
max     = "bold_magenta"

# 5h bar colors (one of high/mid/low)
[bar]
high = "bold_green"
mid  = "bold_yellow"
low  = "bold_red"

# ctx remaining-percent colors
[ctx]
high = "bold_green"
mid  = "bold_yellow"
low  = "bold_red"

# Provider error states
[error]
no_token = ""            # silent — don't render anything when token is missing
net      = "bold_red"
auth     = "bold_red"
http     = "bold_yellow"
generic  = "bold_red"
```

## Writing your own

Create `~/.config/statusline/themes/my-theme.toml`:

```toml
# A retro green-phosphor theme — all green, no emoji, ASCII only.
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

Then set `display.theme = "my-theme"` in your config. The script looks
for `<name>.toml` in `<script_dir>/themes/` first, then falls back to a
direct path.

## Color names recognized

| Name | ANSI | Notes |
|---|---|---|
| `black` `red` `green` `yellow` `blue` `magenta` `cyan` `white` | 8 standard | normal intensity |
| `bold_black` `bold_red` … `bold_white` | 8 bright | bold/bright |
| `faint` | dim white | subtle, low contrast |
| `dim` | dim gray | dimmer than `faint` |
| `""` (empty) | none | no color escape emitted |

Set `NO_COLOR=1` to override any theme and strip all colors.

## Quick preview

`minimax-statusline` reads JSON on stdin, so you can preview a theme
without touching MiniMax:

```bash
cat tests/fixtures/basic.json | STATUSLINE_THEME=vivid minimax-statusline
```
