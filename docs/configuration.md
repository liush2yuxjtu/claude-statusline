# Configuration

claude-statusline reads a single TOML file. Every key is optional — omit it
to use the default.

## Where the file is

The script searches in this order, taking the first match:

1. `$STATUSLINE_CONFIG` (env var) — must point at a readable file
2. `$XDG_CONFIG_HOME/statusline/config.toml` (default: `~/.config/statusline/config.toml`)
3. `~/.statusline.toml`
4. `~/.claude/statusline.toml`

If none exist, the script runs with built-in defaults — you can still use
it, you just can't customize without creating a file.

## Authoring one

```bash
claude-statusline --init-config   # writes ~/.config/statusline/config.toml
$EDITOR ~/.config/statusline/config.toml
claude-statusline --dump-config   # see what got resolved
```

The shipped example (`config.example.toml` in the repo) is the canonical
reference — every key, with its default, is documented inline. Run
`claude-statusline --dump-config` to see the actual resolved values at
runtime.

## Schema (cheat sheet)

```toml
# Which provider backend powers the 5h segment
[provider]
name               = "minimax"      # "minimax" | "none" | "custom"
token_env          = "ANTHROPIC_AUTH_TOKEN"
cache_ttl_seconds  = 60
timeout_seconds    = 5

# Custom provider template (used when name = "custom")
# [provider.custom]
# url                 = "https://example.com/v1/usage"
# method              = "GET"
# auth_header         = "Authorization"
# auth_prefix         = "Bearer "
# extra_headers       = { "X-Foo" = "bar" }
# jq_path_percent     = ".data.remaining"   # path to a 0..100 number
# jq_path_reset       = ".data.next"        # path to ISO ms or string
# jq_path_boost       = ".data.boost"       # optional 0..1000 permille

# Lookup table: model name (substring, case-insensitive) → context max tokens
[model.context]
"MiniMax-M3"  = 1_000_000
"opus-4"      = 200_000
"sonnet-4"    = 200_000
"haiku-4"     = 200_000

# Which segments to show, in which order
layout = ["dir", "branch", "effort", "ctx", "five_hour"]

# Visual / UX
[display]
theme            = "default"      # "default" | "minimal" | "vivid" | "solarized" | path
five_hour_bar    = true           # false = show just a number
ctx_show_tokens  = true           # show "95% (950k)" vs just "95%"

# Color thresholds for the bars / ctx percent
[thresholds]
green_below      = 50   # >= green_below  → green
yellow_below     = 20   # >= yellow_below → yellow
                         # <  yellow_below → red
high_icon_pct    = 90   # icon swaps to "high" at or above this
low_icon_pct     = 10   # icon swaps to "low" below this
```

## Environment variable overrides

| Var | Default | Effect |
|---|---|---|
| `STATUSLINE_CONFIG` | (auto-discover) | force a specific config file path |
| `STATUSLINE_THEME` | (from config) | override `display.theme` |
| `STATUSLINE_CACHE_DIR` | `~/.cache/statusline` | override the cache dir |
| `DEBUG_STATUSLINE` | `0` | if `1`, append stdin JSON to `debug.log` |
| `NO_COLOR` | (unset) | if `1`, strip all ANSI colors |

## Reloading

The config is read on every turn (the script is invoked by Claude Code for
each turn). So edits take effect immediately — no daemon, no signal, no
restart.

## Migrating from a non-config'd version

If you've been using the original personal script (no config file), just
run:

```bash
claude-statusline --init-config
```

…and you get the bundled default. Then tweak.
