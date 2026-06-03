"use client";

import { useState } from "react";

const FEATURES = [
  {
    title: "Provider-pluggable",
    body: "MiniMax Coding Plan, none, or your own HTTP endpoint. 60s write-through cache so the statusline never hammers the network.",
  },
  {
    title: "Themeable",
    body: "Bundled default, minimal, vivid, solarized. Bring your own .toml. NO_COLOR=1 strips ANSI for plain terminals.",
  },
  {
    title: "Configurable",
    body: "~/.config/statusline/config.toml. Pick segments, reorder them, override the model→context table, set thresholds.",
  },
  {
    title: "Tested & free",
    body: "MIT. pytest + bats + shellcheck on every push. Tiny (~250 line shell + 2 small Python helpers, zero pip deps).",
  },
];

const THEMES = [
  {
    name: "default",
    sample: "win-ontology │ 🌿 main │ effort=high │ ctx: 95% (950k) │ 5h: ⚡ ███████░░░ 98% | @06-03 20:00",
  },
  {
    name: "minimal",
    sample: "win-ontology | @ main | effort=high | ctx: 95% (950k) | 5h: ++ #######... 98% | @06-03 20:00",
  },
  {
    name: "vivid",
    sample: "win-ontology ▌★ main ▌ effort=high ▌ ctx: 95% (950k) ▌ 5h: ⚡ ▓▓▓▓▓▓▓▓▓░ 98% | @06-03 20:00",
  },
  {
    name: "solarized",
    sample: "win-ontology │ ❦ main │ effort=high │ ctx: 95% (950k) │ 5h: ☀ ▰▰▰▰▰▰▰▰▰▱ 98% | @06-03 20:00",
  },
];

const INSTALL_TABS = [
  {
    id: "curl",
    label: "curl",
    body: `git clone https://github.com/liush2yuxjtu/claude-statusline
cd claude-statusline
./install.sh`,
  },
  {
    id: "brew",
    label: "brew",
    body: `brew install liush2yuxjtu/tap/claude-statusline`,
  },
  {
    id: "npm",
    label: "npm",
    body: `npm install -g @liushiyumathxjtu/claude-statusline`,
  },
  {
    id: "vsce",
    label: "VS Code",
    body: `code --install-extension liush2yuxjtu.claude-statusline`,
  },
];

export default function HomePage() {
  const [tab, setTab] = useState("curl");
  const active = INSTALL_TABS.find((t) => t.id === tab) ?? INSTALL_TABS[0];

  return (
    <main>
      <h1>claude-statusline</h1>
      <p className="muted">
        A configurable, themeable, provider-pluggable statusline for the{" "}
        <a href="https://docs.claude.com/en/docs/claude-code">Claude Code</a> TUI.
      </p>

      <div className="tty" role="img" aria-label="statusline example">
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
        <h2>Install</h2>
        <p className="muted">One line. Idempotent. Patches <code>~/.claude/settings.json</code> for you.</p>
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
        <h2>What it does</h2>
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
        <h2>Themes</h2>
        <p className="muted">
          Set <code>display.theme</code> in your config, or override with{" "}
          <code>STATUSLINE_THEME=vivid claude-statusline</code>.
        </p>
        <div className="themes">
          {THEMES.map((t) => (
            <div className="theme-card" key={t.name}>
              <div className="name">{t.name}</div>
              <div className="sample">{t.sample}</div>
            </div>
          ))}
        </div>
      </section>

      <hr />

      <section>
        <h2>Configurable</h2>
        <p>
          Everything is in <code>~/.config/statusline/config.toml</code>. Run{" "}
          <code>claude-statusline --init-config</code> to write a starter, then{" "}
          <code>claude-statusline --dump-config</code> to see what got resolved.
        </p>
        <pre><code>{`# Quick example
[provider]
name = "minimax"     # or "none" to hide the 5h segment
token_env = "ANTHROPIC_AUTH_TOKEN"
cache_ttl_seconds = 60

[display]
theme = "default"
layout = ["dir", "branch", "effort", "ctx", "five_hour"]

[model.context]
"MiniMax-M3"  = 1_000_000
"opus-4"      = 200_000
"sonnet-4"    = 200_000
"haiku-4"     = 200_000`}</code></pre>
      </section>

      <footer>
        <a href="https://github.com/liush2yuxjtu/claude-statusline">GitHub</a>
        <a href="https://marketplace.visualstudio.com/items?itemName=liush2yuxjtu.claude-statusline">
          VS Code Marketplace
        </a>
        <a href="https://open-vsx.org/extension/liush2yuxjtu/claude-statusline">OpenVSX</a>
        <a href="https://www.npmjs.com/package/@liushiyumathxjtu/claude-statusline">npm</a>
        <a href="https://github.com/liush2yuxjtu/homebrew-tap">Homebrew tap</a>
        <span className="muted" style={{ marginLeft: 16 }}>MIT · {new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}
