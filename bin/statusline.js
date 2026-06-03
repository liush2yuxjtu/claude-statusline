#!/usr/bin/env node
// statusline.js — npm wrapper that execFile's the bash script.
// Lives at the bin/ entry in package.json; on `npm i -g` it ends up on PATH
// as `claude-statusline`. On Windows, the .cmd shim points here.
"use strict";
const { execFile } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const script = path.join(__dirname, "..", "statusline.sh");
if (!fs.existsSync(script)) {
  process.stderr.write(`statusline.sh not found at ${script}\n`);
  process.exit(127);
}

const child = execFile("bash", [script, ...process.argv.slice(2)], {
  stdio: ["inherit", "inherit", "inherit"],
});
child.on("exit", (code) => process.exit(code ?? 0));
