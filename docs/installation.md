# Installation

claude-statusline is a bash script that Claude Code calls every turn (via
`statusLine.command` in `~/.claude/settings.json`). The install path just
needs to (1) put the script somewhere on `PATH`, and (2) tell Claude Code
where it is.

The bundled `install.sh` does both, idempotently.

## Method 1 — `git clone` + `./install.sh` (most portable)

```bash
git clone https://github.com/liush2yuxjtu/claude-statusline
cd claude-statusline
./install.sh
```

What it does:

1. Copies `statusline.sh` to `~/.local/bin/claude-statusline` (overwriting a
   previous install, after backing it up to `claude-statusline.prev`).
2. Patches `~/.claude/settings.json` so `statusLine.command` points at the
   new path. If the file doesn't exist yet, it creates it.
3. Writes `~/.config/statusline/config.toml` from the bundled example (only
   if no config exists yet).
4. Smoke-tests with `claude-statusline --version`.

Re-run safe: the script detects existing installs and offers to upgrade.

## Method 2 — Homebrew (macOS / Linuxbrew)

```bash
brew install liush2yuxjtu/tap/claude-statusline
```

Formula: <https://github.com/liush2yuxjtu/homebrew-tap/blob/main/Formula/claude-statusline.rb>

Then patch `~/.claude/settings.json` manually:

```json
{
  "statusLine": {
    "type": "command",
    "command": "/opt/homebrew/bin/claude-statusline"
  }
}
```

The Homebrew formula installs a small wrapper that execs the bundled
`statusline.sh` from the Cellar.

## Method 3 — npm (works on Windows)

```bash
npm install -g @liush2yuxjtu/claude-statusline
```

The npm package ships a tiny Node wrapper (`bin/statusline.js`) that
`execFile`s the bash script. On Windows the bash from Git for Windows /
WSL must be on `PATH`; on macOS/Linux the system bash is used.

Then patch `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "claude-statusline"
  }
}
```

## Method 4 — VS Code extension

The extension is a thin wrapper: it spawns the bash script every 5 seconds
and renders the result in the VS Code status bar. You **also** need the
bash script installed (Method 1, 2, or 3) for the extension to work.

```bash
code --install-extension liush2yuxjtu.claude-statusline
```

Or install from the Marketplace UI: search for "claude-statusline".

## Method 5 — One-liner (advanced)

```bash
curl -sSfL https://raw.githubusercontent.com/liush2yuxjtu/claude-statusline/main/install.sh | bash
```

This clones the repo to `/tmp/claude-statusline-$$`, runs the install, and
removes the clone. Useful for quick smoke-testing on a fresh machine.

## Verify the install

```bash
claude-statusline --version
claude-statusline --doctor
claude-statusline --dump-config
```

Then restart Claude Code. The bottom of the TUI should now show the new
statusline. If it doesn't, check the Output panel in your editor (if using
the VS Code extension) or run `claude-statusline` directly with a
hand-built JSON:

```bash
echo '{"cwd":"/tmp","model":{"display_name":"x"},"effort":{"level":"default"}}' | claude-statusline
```

## Uninstall

```bash
# If installed via Method 1, 2, 3, or 5:
curl -sSfL https://raw.githubusercontent.com/liush2yuxjtu/claude-statusline/main/uninstall.sh | bash
# or, if you still have the repo:
./uninstall.sh

# If installed via Homebrew:
brew uninstall liush2yuxjtu/tap/claude-statusline

# If installed via npm:
npm uninstall -g @liush2yuxjtu/claude-statusline

# If installed via VS Code extension:
code --uninstall-extension liush2yuxjtu.claude-statusline
```

To also nuke the config + cache:

```bash
rm -rf ~/.config/statusline
rm -rf ~/.cache/statusline
```
