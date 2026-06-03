// extension.ts — Claude Statusline VS Code extension.
//
// Spawns the user's installed statusline.sh and renders its stdout into
// the VS Code status bar. The bash script handles the heavy lifting
// (config, theme, provider, cache); this extension is just a thin wrapper
// that pipes a synthetic stdin JSON (built from VS Code context) and
// re-renders on a timer.

import * as vscode from "vscode";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

const execFileP = promisify(execFile);

let statusItem: vscode.StatusBarItem | undefined;
let refreshTimer: NodeJS.Timeout | undefined;

function config(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration("claudeStatusline");
}

function defaultScriptPath(): string {
  const home = homedir();
  if (process.platform === "win32") {
    // On Windows, the npm wrapper is preferred
    return resolve(home, "AppData", "Roaming", "npm", "minimax-statusline.cmd");
  }
  return resolve(home, ".local", "bin", "minimax-statusline");
}

function resolveScriptPath(): string {
  const cfg = config().get<string>("scriptPath", defaultScriptPath());
  if (cfg.includes("${userHome}")) {
    return cfg.replace(/\$\{userHome\}/g, homedir());
  }
  return cfg;
}

function buildStdinJson(): string {
  // The script reads: cwd, model.display_name, effort.level, context_window.*,
  // workspace.current_dir. We synthesize these from VS Code's API.
  const folders = vscode.workspace.workspaceFolders ?? [];
  const cwd = folders.length > 0 ? folders[0].uri.fsPath : process.cwd();
  const editor = vscode.window.activeTextEditor;
  const fileName = editor?.document.fileName ?? "";

  const stdin = {
    session_id: "vscode-" + Date.now().toString(36),
    transcript_path: "",
    cwd,
    effort: { level: "default" },
    model: { id: "claude-unknown", display_name: "Claude" },
    workspace: {
      current_dir: cwd,
      project_dir: cwd,
      added_dirs: [],
    },
    version: vscode.version,
    output_style: { name: "default" },
    cost: {
      total_cost_usd: 0,
      total_duration_ms: 0,
      total_api_duration_ms: 0,
      total_lines_added: 0,
      total_lines_removed: 0,
    },
    context_window: {
      total_input_tokens: 0,
      total_output_tokens: 0,
      context_window_size: 200_000,
      current_usage: null,
      used_percentage: null,
      remaining_percentage: null,
    },
    exceeds_200k_tokens: false,
    fast_mode: false,
    thinking: { enabled: true },
    vscode: {
      editor: fileName,
      workspace: cwd,
    },
  };
  return JSON.stringify(stdin);
}

async function renderOnce(): Promise<void> {
  if (!statusItem) return;
  const script = resolveScriptPath();
  if (!existsSync(script)) {
    statusItem.text = `$(warning) minimax-statusline: script not found at ${script}`;
    statusItem.tooltip = new vscode.MarkdownString(
      "Install the script first:\n\n" +
        "```\n" +
        "git clone https://github.com/liush2yuxjtu/minimax-statusline\n" +
        "cd minimax-statusline && ./install.sh\n" +
        "```\n\n" +
        `Or set claudeStatusline.scriptPath to the correct path.`
    );
    statusItem.show();
    return;
  }
  try {
    const { stdout } = await execFileP(script, [], {
      input: buildStdinJson(),
      timeout: 4000,
      maxBuffer: 4 * 1024,
      env: { ...process.env, NO_COLOR: "1" },  // strip colors for status bar
    });
    // Strip trailing newlines and any remaining ANSI sequences (belt-and-suspenders).
    const text = stdout.replace(/\r?\n+$/, "").replace(/\x1b\[[0-9;]*m/g, "");
    statusItem.text = text || "$(circle-slash) minimax-statusline";
    statusItem.tooltip = new vscode.MarkdownString(
      `Path: \`${script}\`\n\n` +
        "Click to run a one-shot render in the Output panel."
    );
    statusItem.command = {
      title: "Run minimax-statusline",
      command: "claudeStatusline.runOnce",
    };
  } catch (e: any) {
    statusItem.text = `$(error) minimax-statusline: ${(e?.message || "error").slice(0, 60)}`;
    statusItem.tooltip = new vscode.MarkdownString(
      `Path: \`${script}\`\n\nError:\n\`\`\`\n${e?.message || e}\n\`\`\``
    );
  }
  statusItem.show();
}

function startRefreshLoop(): void {
  if (refreshTimer) clearInterval(refreshTimer);
  const ms = config().get<number>("refreshIntervalMs", 5000);
  refreshTimer = setInterval(() => {
    void renderOnce();
  }, ms);
}

function stopRefreshLoop(): void {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = undefined;
  }
}

export function activate(context: vscode.ExtensionContext): void {
  if (!config().get<boolean>("showInStatusBar", true)) return;

  statusItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    50  // priority; lower = further right
  );
  statusItem.name = "Claude Statusline";
  context.subscriptions.push(statusItem);

  // Render once immediately, then on a timer.
  void renderOnce();
  startRefreshLoop();

  context.subscriptions.push({
    dispose: () => {
      stopRefreshLoop();
    },
  });

  // Re-render on relevant events.
  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(() => void renderOnce()),
    vscode.window.onDidChangeActiveTextEditor(() => void renderOnce()),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("claudeStatusline")) {
        stopRefreshLoop();
        startRefreshLoop();
        void renderOnce();
      }
    })
  );

  // Commands.
  context.subscriptions.push(
    vscode.commands.registerCommand("claudeStatusline.runOnce", async () => {
      await renderOnce();
      const out = vscode.window.createOutputChannel("minimax-statusline");
      out.appendLine(statusItem?.text ?? "(no text)");
      out.show();
    }),
    vscode.commands.registerCommand("claudeStatusline.openRepo", () => {
      void vscode.env.openExternal(
        vscode.Uri.parse("https://github.com/liush2yuxjtu/minimax-statusline")
      );
    })
  );
}

export function deactivate(): void {
  stopRefreshLoop();
  if (statusItem) {
    statusItem.dispose();
    statusItem = undefined;
  }
}
