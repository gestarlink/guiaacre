import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Fix 1: Clean wrangler.json - remove pages/pages_build_output_dir
const wranglerPath = join(__dirname, "..", "dist", "_worker.js", "wrangler.json");
if (!existsSync(wranglerPath)) {
  console.error(`[fix-wrangler-json] NOT FOUND: ${wranglerPath}`);
  process.exit(1);
}
const raw = readFileSync(wranglerPath, "utf-8");
const config = JSON.parse(raw);
const clean = {
  compatibility_date: config.compatibility_date,
  compatibility_flags: config.compatibility_flags,
  d1_databases: config.d1_databases,
};
writeFileSync(wranglerPath, JSON.stringify(clean, null, 2) + "\n");
console.log(`[fix-wrangler-json] Fixed: ${wranglerPath}`);

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
