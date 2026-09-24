import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("package.json", root), "utf8"));
const patch = manifest.dsh?.bundle?.patch;

assert.equal(patch, "./cordis.patch.yml");
assert.ok(manifest.files.includes("cordis.patch.yml"));
assert.equal(
  readFileSync(new URL(patch, root), "utf8").replace(/\r\n/g, "\n"),
  "- insert:\n    - id: dsh-context-length\n      name: dsh-context-length\n"
);
assert.equal(manifest.dsh.client.platform, "web");
assert.equal(manifest.main, "lib/index.js");

console.log(`Bundle manifest and patch verified in ${fileURLToPath(root)}`);
