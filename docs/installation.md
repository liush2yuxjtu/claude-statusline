# 安装

`minimax-statusline` 是个 bash 脚本，由 MiniMax CLI 每次轮询时调用（通过 `~/.claude/settings.json` 里的 `statusLine.command`）。安装路径就两件事：(1) 把脚本放到 `PATH` 上的某个位置，(2) 告诉 CLI 去哪儿找它。

自带的 `install.sh` 把这两件事都做了，并且幂等。

## 方式 1 — `git clone` + `./install.sh`（最稳）

```bash
git clone https://github.com/liush2yuxjtu/minimax-statusline
cd minimax-statusline
./install.sh
```

它做的事：

1. 把脚本拷到 `~/.local/bin/minimax-statusline`（有旧版本会先备份成 `minimax-statusline.prev` 再覆盖）
2. 改 `~/.claude/settings.json`，让 `statusLine.command` 指向新路径；如果文件不存在则创建
3. 拷一份 `~/.config/statusline/config.toml` 默认配置（仅在还没有时才写）
4. 跑一次 `minimax-statusline --version` 冒烟测试

可重复运行：检测到旧安装会自动升级。

## 方式 2 — Homebrew（macOS / Linuxbrew）

```bash
brew install liush2yuxjtu/tap/minimax-statusline
```

Formula: <https://github.com/liush2yuxjtu/homebrew-tap/blob/main/Formula/minimax-statusline.rb>

然后手动改 `~/.claude/settings.json`：

```json
{
  "statusLine": {
    "type": "command",
    "command": "/opt/homebrew/bin/minimax-statusline"
  }
}
```

Homebrew formula 装的是个小包装器，会 `exec` Cellar 里的 `minimax-statusline.sh`。

## 方式 3 — npm（Windows 也能装）

```bash
npm install -g @liushiyumathxjtu/minimax-statusline
```

npm 包附带一个小 Node 包装器（`bin/minimax-statusline.js`），用 `execFile` 调 bash 脚本。Windows 上要确保 Git for Windows / WSL 的 bash 在 `PATH` 上；macOS / Linux 用系统自带 bash。

然后改 `~/.claude/settings.json`：

```json
{
  "statusLine": {
    "type": "command",
    "command": "minimax-statusline"
  }
}
```

## 方式 4 — VS Code 扩展

扩展本身只是个薄壳：每 5 秒起一次 bash 脚本，把结果渲染到 VS Code 状态栏。**仍需先装上面任意一种 bash 脚本** 扩展才能用。

```bash
code --install-extension liush2yuxjtu.minimax-statusline
```

或在 VS Code Marketplace UI 里搜 `minimax-statusline` 装。

## 方式 5 — 一行命令（高级）

```bash
curl -sSfL https://raw.githubusercontent.com/liush2yuxjtu/minimax-statusline/main/install.sh | bash
```

把仓库克隆到 `/tmp/minimax-statusline-$$`、跑安装、删克隆。在干净机器上快速冒烟测试时很有用。

## 验证安装

```bash
minimax-statusline --version
minimax-statusline --doctor
minimax-statusline --dump-config
```

然后重启 MiniMax，TUI 底部应能看到新的状态条。如果没看到：
- 在 VS Code 里用扩展的话，看 Output 面板
- 否则手写一段 JSON 跑一次：

```bash
echo '{"cwd":"/tmp","model":{"display_name":"x"},"effort":{"level":"default"}}' | minimax-statusline
```

## 卸载

```bash
# 方式 1/2/3/5 装的：
curl -sSfL https://raw.githubusercontent.com/liush2yuxjtu/minimax-statusline/main/uninstall.sh | bash
# 或者手头还有仓库的话：
./uninstall.sh

# Homebrew：
brew uninstall liush2yuxjtu/tap/minimax-statusline

# npm：
npm uninstall -g @liushiyumathxjtu/minimax-statusline

# VS Code 扩展：
code --uninstall-extension liush2yuxjtu.minimax-statusline
```

如果还想把配置和缓存也清掉：

```bash
rm -rf ~/.config/statusline
rm -rf ~/.cache/statusline
```
