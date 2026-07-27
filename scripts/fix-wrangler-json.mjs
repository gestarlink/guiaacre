import { readFileSync, writeFileSync, unlinkSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Fix 1: DELETE _worker.js/wrangler.json — project-level config already
// has compatibility_flags: ["nodejs_compat"] and d1_databases in [env.production].
// The generated _worker.js/wrangler.json can override/conflict with that.
const wranglerPath = join(__dirname, "..", "dist", "_worker.js", "wrangler.json");
if (existsSync(wranglerPath)) {
  unlinkSync(wranglerPath);
  console.log(`[fix-wrangler-json] Deleted: ${wranglerPath}`);
} else {
  console.log(`[fix-wrangler-json] Already absent: ${wranglerPath}`);
}

// Fix 2: Patch index.js to set globalThis.__env__ so getDB() can find env.DB directly
const indexPath = join(__dirname, "..", "dist", "_worker.js", "index.js");
if (!existsSync(indexPath)) {
  console.error(`[fix-wrangler-json] NOT FOUND: ${indexPath}`);
  process.exit(1);
}
let indexContent = readFileSync(indexPath, "utf-8");
const target = "async fetch(cfReq, env, context) {";
const replacement = "async fetch(cfReq, env, context) {\n    globalThis.__env__ = env;";
if (indexContent.includes(target)) {
  indexContent = indexContent.replace(target, replacement);
  writeFileSync(indexPath, indexContent);
  console.log(`[fix-wrangler-json] Patched: added globalThis.__env__ to ${indexPath}`);
} else {
  console.error(`[fix-wrangler-json] Could not find target in index.js`);
  process.exit(1);
}
