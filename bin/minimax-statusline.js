#!/usr/bin/env node
// minimax-statusline.js — npm wrapper that execFile's the bash script.
// Lives at the bin/ entry in package.json; on `npm i -g` it ends up on PATH
// as `minimax-statusline`. On Windows, the .cmd shim points here.
"use strict";
const { execFile } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const script = path.join(__dirname, "..", "minimax-statusline.sh");
if (!fs.existsSync(script)) {
  process.stderr.write(`minimax-statusline.sh not found at ${script}\n`);
  process.exit(127);
}

const child = execFile("bash", [script, ...process.argv.slice(2)], {
  stdio: ["inherit", "inherit", "inherit"],
});
child.on("exit", (code) => process.exit(code ?? 0));
