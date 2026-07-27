import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Fix 1: Clean _worker.js/wrangler.json — remove only the "pages" field
// (which is invalid inside _worker.js/ context). Keep everything else
// including pages_build_output_dir (valid), compat flags, and D1 bindings.
const wranglerPath = join(__dirname, "..", "dist", "_worker.js", "wrangler.json");
if (!existsSync(wranglerPath)) {
  console.error(`[fix] NOT FOUND: ${wranglerPath}`);
  process.exit(1);
}
const raw = readFileSync(wranglerPath, "utf-8");
const config = JSON.parse(raw);
delete config.pages;
// keep $schema, name, pages_build_output_dir — all valid here
writeFileSync(wranglerPath, JSON.stringify(config, null, 2) + "\n");
console.log(`[fix] Removed "pages" from ${wranglerPath}`);

// Fix 2: Patch index.js to set globalThis.__env__ so getDB() can find env.DB directly
const indexPath = join(__dirname, "..", "dist", "_worker.js", "index.js");
if (!existsSync(indexPath)) {
  console.error(`[fix] NOT FOUND: ${indexPath}`);
  process.exit(1);
}
let indexContent = readFileSync(indexPath, "utf-8");
const target = "async fetch(cfReq, env, context) {";
const replacement = "async fetch(cfReq, env, context) {\n    globalThis.__env__ = env;";
if (indexContent.includes(target)) {
  indexContent = indexContent.replace(target, replacement);
  writeFileSync(indexPath, indexContent);
  console.log(`[fix] Added globalThis.__env__ to ${indexPath}`);
} else {
  console.error(`[fix] Could not find target in index.js`);
  process.exit(1);
}

// Fix 3: Patch _ssr/index.mjs createServerFn — add .validator() alias for .inputValidator()
// (Nitro generates .validator() calls but the bundled createServerFn only has .inputValidator())
const ssrIndexPath = join(__dirname, "..", "dist", "_worker.js", "_ssr", "index.mjs");
if (!existsSync(ssrIndexPath)) {
  console.error(`[fix] NOT FOUND: ${ssrIndexPath}`);
  process.exit(1);
}
let ssrIndexContent = readFileSync(ssrIndexPath, "utf-8");
const vOld = `    inputValidator: (inputValidator) => {
      return createServerFn(void 0, {
        ...resolvedOptions,
        inputValidator
      });
    },`;
const vNew = `    validator: (inputValidator) => {
      return createServerFn(void 0, {
        ...resolvedOptions,
        inputValidator
      });
    },
    inputValidator: (inputValidator) => {
      return createServerFn(void 0, {
        ...resolvedOptions,
        inputValidator
      });
    },`;
if (ssrIndexContent.includes(vOld)) {
  ssrIndexContent = ssrIndexContent.replace(vOld, vNew);
  writeFileSync(ssrIndexPath, ssrIndexContent);
  console.log(`[fix] Added .validator() alias to createServerFn in ${ssrIndexPath}`);
} else {
  console.error(`[fix] Could not find inputValidator in _ssr/index.mjs`);
  process.exit(1);
}
