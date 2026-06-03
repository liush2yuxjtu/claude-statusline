"use client";

import { useState } from "react";

const FEATURES = [
  {
    title: "提供方可插拔",
    body: "默认 MiniMax Coding Plan 5h API；也可选 none（隐藏 5h 段）或 custom（自定义 HTTP 端点）。60 秒写入式缓存，避免每次刷新都打网络。",
  },
  {
    title: "可主题化",
    body: "自带 default / minimal / vivid / solarized 四套主题，也支持放自己的 .toml 进来。设 NO_COLOR=1 即可一键关掉所有 ANSI 颜色。",
  },
  {
    title: "可配置",
    body: "全部配置在 ~/.config/statusline/config.toml。想显示哪些段、顺序怎么排、每个模型对应的上下文上限、各色阈值，都能调。",
  },
  {
    title: "测试齐 · 完全免费",
    body: "MIT 协议。pytest + bats + shellcheck 每次 push 都跑。只 ~250 行 bash + 2 个小 Python 助手，零 pip 依赖。",
  },
];

const THEMES = [
  {
    name: "default",
    label: "默认（ANSI 彩色 + 🌿 分支）",
    sample: "win-ontology │ 🌿 main │ effort=high │ ctx: 95% (950k) │ 5h: ⚡ ███████░░░ 98% | @06-03 20:00",
  },
  {
    name: "minimal",
    label: "极简（无颜色 + ASCII）",
    sample: "win-ontology | @ main | effort=high | ctx: 95% (950k) | 5h: ++ #######... 98% | @06-03 20:00",
  },
  {
    name: "vivid",
    label: "高对比（亮色 + 块字符）",
    sample: "win-ontology ▌★ main ▌ effort=high ▌ ctx: 95% (950k) ▌ 5h: ⚡ ▓▓▓▓▓▓▓▓▓░ 98% | @06-03 20:00",
  },
  {
    name: "solarized",
    label: "Solarized（暖色）",
    sample: "win-ontology │ ❦ main │ effort=high │ ctx: 95% (950k) │ 5h: ☀ ▰▰▰▰▰▰▰▰▰▱ 98% | @06-03 20:00",
  },
];

const INSTALL_TABS = [
  {
    id: "curl",
    label: "curl 源码",
    body: `# 克隆仓库
git clone https://github.com/liush2yuxjtu/minimax-statusline.git
cd minimax-statusline

# 一键安装
./install.sh

# 装完重启 MiniMax 就生效`,
  },
  {
    id: "brew",
    label: "Homebrew",
    body: `brew install liush2yuxjtu/tap/minimax-statusline

# 然后在 ~/.claude/settings.json 里把
# statusLine.command 指向 /opt/homebrew/bin/minimax-statusline`,
  },
  {
    id: "npm",
    label: "npm",
    body: `npm install -g @liushiyumathxjtu/minimax-statusline

# Windows 也可装：包装器会调 bash 调用脚本`,
  },
  {
    id: "vsce",
    label: "VS Code 扩展",
    body: `code --install-extension liush2yuxjtu.minimax-statusline

# 注：扩展本身只是个薄壳，仍需先装上面的 bash 脚本`,
  },
];

export default function HomePage() {
  const [tab, setTab] = useState("curl");
  const active = INSTALL_TABS.find((t) => t.id === tab) ?? INSTALL_TABS[0];

  return (
    <main>
      <h1>minimax-statusline</h1>
      <p className="muted">
        为 <a href="https://docs.claude.com/en/docs/claude-code">MiniMax CLI</a> 底部状态栏做的可配置、可主题化、可插拔的 5h 状态条 ——{" "}
        <strong>专为 MiniMax Coding Plan 优化</strong>。
      </p>

      <div className="tty" role="img" aria-label="状态条示例">
        <span className="dir">win-ontology</span>
        <span className="sep"> │ </span>
        <span className="branch">🌿 main</span>
        <span className="sep"> │ </span>
        <span>effort=</span>
        <span className="effort">high</span>
        <span className="sep"> │ </span>
        <span>ctx: </span>
        <span className="ctx">95%</span>
        <span className="muted"> (950k)</span>
        <span className="sep"> │ </span>
        <span>5h: </span>
        <span className="bar">⚡ ██████████</span>
        <span> </span>
        <span className="pct">98%</span>
        <span className="sep"> | @</span>
        <span className="reset">06-03 20:00</span>
      </div>

      <section>
        <h2>安装</h2>
        <p className="muted">一行命令装好，幂等，会自动写 <code>~/.claude/settings.json</code>。</p>
        <div role="tablist" className="tabs">
          {INSTALL_TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={tab === t.id ? "active" : ""}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div role="tabpanel" className="tabs-pane">
          <pre><code>{active.body}</code></pre>
        </div>
      </section>

      <hr />

      <section>
        <h2>核心特性</h2>
        <div className="grid">
          {FEATURES.map((f) => (
            <div className="card" key={f.title}>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <hr />

      <section>
        <h2>四套主题</h2>
        <p className="muted">
          改 <code>display.theme</code> 切换；或临时用 <code>STATUSLINE_THEME=vivid minimax-statusline</code> 试看。
        </p>
        <div className="themes">
          {THEMES.map((t) => (
            <div className="theme-card" key={t.name}>
              <div className="name">{t.name} · <span style={{ fontWeight: 400, color: "var(--muted)" }}>{t.label}</span></div>
              <div className="sample">{t.sample}</div>
            </div>
          ))}
        </div>
      </section>

      <hr />

      <section>
        <h2>配置样例</h2>
        <p>
          全部配置在 <code>~/.config/statusline/config.toml</code>。先用 <code>minimax-statusline --init-config</code>{" "}
          写一份默认，再用 <code>minimax-statusline --dump-config</code> 看实际生效值。
        </p>
        <pre><code>{`# 5h 数据来源（默认是 MiniMax Coding Plan）
[provider]
name = "minimax"      # 也可填 "none" 完全隐藏 5h 段
token_env = "ANTHROPIC_AUTH_TOKEN"
cache_ttl_seconds = 60

# 显示设置
[display]
theme = "default"
layout = ["dir", "branch", "effort", "ctx", "five_hour"]

# 模型 → 上下文窗口上限（substr 匹配，首个命中胜出）
[model.context]
"MiniMax-M3"  = 1_000_000
"opus-4"      = 200_000
"sonnet-4"    = 200_000
"haiku-4"     = 200_000`}</code></pre>
      </section>

      <section>
        <h2>全部安装方式</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, marginTop: 12 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--muted)", textAlign: "left" }}>
              <th style={{ padding: "8px 12px" }}>方式</th>
              <th style={{ padding: "8px 12px" }}>命令</th>
              <th style={{ padding: "8px 12px" }}>适用平台</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid var(--line)" }}>
              <td style={{ padding: "8px 12px" }}>curl 源码</td>
              <td style={{ padding: "8px 12px" }}><code>./install.sh</code></td>
              <td style={{ padding: "8px 12px" }}>macOS / Linux</td>
            </tr>
            <tr style={{ borderBottom: "1px solid var(--line)" }}>
              <td style={{ padding: "8px 12px" }}>Homebrew</td>
              <td style={{ padding: "8px 12px" }}><code>brew install liush2yuxjtu/tap/minimax-statusline</code></td>
              <td style={{ padding: "8px 12px" }}>macOS / Linuxbrew</td>
            </tr>
            <tr style={{ borderBottom: "1px solid var(--line)" }}>
              <td style={{ padding: "8px 12px" }}>npm</td>
              <td style={{ padding: "8px 12px" }}><code>npm i -g @liushiyumathxjtu/minimax-statusline</code></td>
              <td style={{ padding: "8px 12px" }}>任意（含 Windows）</td>
            </tr>
            <tr style={{ borderBottom: "1px solid var(--line)" }}>
              <td style={{ padding: "8px 12px" }}>VS Code 扩展</td>
              <td style={{ padding: "8px 12px" }}><code>code --install-extension liush2yuxjtu.minimax-statusline</code></td>
              <td style={{ padding: "8px 12px" }}>VS Code（需先装上面任意一种）</td>
            </tr>
          </tbody>
        </table>
      </section>

      <footer>
        <a href="https://github.com/liush2yuxjtu/minimax-statusline">GitHub 源仓库</a>
        <a href="https://marketplace.visualstudio.com/items?itemName=liush2yuxjtu.minimax-statusline">
          VS Code 市场
        </a>
        <a href="https://open-vsx.org/extension/liush2yuxjtu/minimax-statusline">OpenVSX</a>
        <a href="https://www.npmjs.com/package/@liushiyumathxjtu/minimax-statusline">npm</a>
        <a href="https://github.com/liush2yuxjtu/homebrew-tap">Homebrew 源</a>
        <span className="muted" style={{ marginLeft: 16 }}>MIT 协议 · {new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}
