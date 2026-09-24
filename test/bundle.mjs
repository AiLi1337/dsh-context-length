import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("package.json", root), "utf8"));
const patch = manifest.dsh?.bundle?.patch;

assert.equal(patch, "./cordis.patch.yml", "desktop plugin manager requires a bundle patch");
assert.ok(manifest.files.includes("cordis.patch.yml"), "the patch must be shipped in the package");
assert.ok(existsSync(new URL(patch, root)), "the declared patch must exist");
assert.equal(
  readFileSync(new URL(patch, root), "utf8").replace(/\r\n/g, "\n"),
  "- insert:\n    - id: dsh-context-length\n      name: dsh-context-length\n"
);
assert.ok(existsSync(new URL(manifest.main, root)), "the inserted host entry must exist");
assert.equal(manifest.dsh.client.platform, "web", "the desktop webview still needs the client half");
assert.equal(manifest.exports["./client"], "./lib/client.js");

console.log("DSH bundle manifest, patch, and entries verified");
