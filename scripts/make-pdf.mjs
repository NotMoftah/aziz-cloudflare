// Renders site/cv/index.html to a PDF using a locally installed Edge or Chrome.
// Usage: node scripts/build.mjs && node scripts/make-pdf.mjs
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = join(root, "site");
const cv = JSON.parse(readFileSync(join(root, "content", "cv.json"), "utf8"));

const candidates = [
  process.env.BROWSER_PATH,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const browser = candidates.find((p) => existsSync(p));
if (!browser) {
  console.error("No Edge/Chrome found. Set BROWSER_PATH to a Chromium-based browser.");
  process.exit(1);
}

const input = pathToFileURL(join(site, "cv", "index.html")).href;
const output = join(site, cv.site.pdf);

const r = spawnSync(
  browser,
  ["--headless=new", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${output}`, input],
  { stdio: "inherit" }
);
if (r.status !== 0) process.exit(r.status ?? 1);
console.log("Wrote", output);
