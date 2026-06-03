# Providers

The 5h segment ("5h: ⚡ ███████░░░ 98% | @06-03 20:00") needs two pieces
of data: the remaining percent (0..100) and a reset time. claude-statusline
fetches these from a configurable **provider** backend.

## Built-in providers

### `minimax` (default)

Queries `https://api.minimax.chat/v1/coding_plan/remains` with a Bearer
token from `$ANTHROPIC_AUTH_TOKEN` (configurable via `[provider] token_env`).
Extracts the `general` model from `model_remains[]` and formats
`current_interval_remaining_percent` and `end_time` (ms epoch).

This is the original behavior of the personal script this project forked
from.

```toml
[provider]
name = "minimax"
token_env = "ANTHROPIC_AUTH_TOKEN"
```

### `none`

Hides the 5h segment entirely. Use this if you don't have a MiniMax
Coding Plan token, or if you don't care about the 5h data.

```toml
[provider]
name = "none"
```

The segment is omitted from the layout (not just empty). If you want a
visual placeholder instead, use `custom` and have it return `null` for
`jq_path_percent`.

### `custom`

Bring your own HTTP endpoint. Set the URL, method, auth header, and
`jq_path_*` (slash-or-dot path) to extract the data. The script caches
the response for `cache_ttl_seconds` (default 60).

```toml
[provider]
name = "custom"
cache_ttl_seconds = 60

[provider.custom]
url             = "https://my-api.example.com/usage"
method          = "GET"                    # GET or POST
auth_header     = "Authorization"          # "" to skip the auth header
auth_prefix     = "Bearer "
extra_headers   = { "X-Org" = "acme" }
jq_path_percent = "data.remaining.percent" # dot-path; resolves dict keys and list indices
jq_path_reset   = "data.next_reset"        # ISO ms epoch or ISO string
jq_path_boost   = "data.boost_permille"    # optional; 0..1000 permille, e.g. 250 = +25%
```

The script will read the token from `[provider] token_env` (default
`ANTHROPIC_AUTH_TOKEN`) and attach it as
`Authorization: Bearer <token>` unless you override `auth_header` /
`auth_prefix`.

If the network call fails and a cached value exists from a previous
successful call, the cached value is returned with `stale: true` (and
the statusline adds a `·cached` suffix so you know).

## Error classification

Errors are bucketed and rendered with a per-theme color:

| Class | When | Theme key |
|---|---|---|
| `no-token` | Token env var is empty/unset | `error.no_token` (default: silent) |
| `net` | DNS / connection / read timeout | `error.net` (default: red) |
| `auth` | HTTP 401/403 | `error.auth` (default: red) |
| `http-N` | Any other HTTP error (404, 500, …) | `error.http` (default: yellow) |
| `generic` | Unexpected exception | `error.generic` (default: red) |

Override the colors in your theme (`themes/<name>.toml`):

```toml
[error]
no_token = ""            # silent — don't show anything for missing token
net      = "bold_yellow" # show "⚠ net" in yellow instead of red
auth     = "bold_red"
http     = "faint"
generic  = "bold_red"
```

## Caching

The cache is a single JSON file at `${STATUSLINE_CACHE_DIR:-~/.cache/statusline}/api.json`.
On every provider call, the script checks the file's mtime. If it's
younger than `cache_ttl_seconds`, the cached value is returned and the
provider is **not** called.

When a network call fails AND a cached value exists, the cached value is
returned with `stale: true`. The statusline adds a `·cached` suffix so
you know the data is not fresh.

To clear the cache:

```bash
rm -rf ~/.cache/statusline
```

To disable caching:

```toml
[provider]
cache_ttl_seconds = 0
```

## Writing a new built-in provider

If you maintain an internal usage API and want it as a first-class
provider, see `lib/fetch_plan.py` — add a function to the `PROVIDERS`
dict, then update `config.example.toml` to document it. Send a PR.
