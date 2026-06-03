# Claude Statusline (VS Code extension)

A thin VS Code extension that mirrors the [`minimax-statusline`](https://github.com/liush2yuxjtu/minimax-statusline)
TUI in the VS Code status bar.

The extension does **not** parse the MiniMax JSON itself. It shells out to
the `statusline.sh` script you already have installed, with a synthesized
stdin JSON, and re-renders every 5 seconds.

## Install

The extension is published as `liush2yuxjtu.minimax-statusline`. Install:

```
code --install-extension liush2yuxjtu.minimax-statusline
```

Then install the bash script (the extension requires it):

```bash
git clone https://github.com/liush2yuxjtu/minimax-statusline
cd minimax-statusline && ./install.sh
```

## Configuration

| Setting | Default | Description |
|---|---|---|
| `claudeStatusline.scriptPath` | `~/.local/bin/minimax-statusline` (mac/linux) or `%APPDATA%\npm\minimax-statusline.cmd` (windows) | Path to the bash script. |
| `claudeStatusline.refreshIntervalMs` | `5000` | How often to refresh the status bar (ms). Min 1000. |
| `claudeStatusline.showInStatusBar` | `true` | Master switch. |

## Commands

- `claudeStatusline.runOnce` — force a re-render and show the result in the Output panel.
- `claudeStatusline.openRepo` — open the GitHub repo in your browser.

## Build

```bash
cd bin/vscode-extension
npm install
npm run package      # produces minimax-statusline-0.1.0.vsix
npm run publish      # publish to VS Code Marketplace
npm run publish-openvsx  # publish to OpenVSX
```

## License

MIT.
