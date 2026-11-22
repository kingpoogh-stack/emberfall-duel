// Emberfall Duel - screenshot capture with puppeteer-core + Chromium.
// This Chromium build needs the Hatch WebGL policy flags and blocks
// loopback navigation, so pages open via file:// URLs.
import puppeteer from "/home/hatch/workspace/makefun-entries/threejs-fps-02/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "screenshots");
mkdirSync(outDir, { recursive: true });
const policyPath = "/var/lib/hatch-browser/rootfs-base/usr/share/hatch/chromium/webgl-allowed-domains.txt";
const policySha = createHash("sha256").update(readFileSync(policyPath)).digest("hex");
const pageUrl = (q) => pathToFileURL(join(here, "game", "index.html")).href + q;
const shots = [
  ["1-title.jpg", "?shot=title&seed=1"],
  ["2-duel.jpg", "?shot=duel&seed=1"],
  ["3-victory.jpg", "?shot=win&seed=1"],
  ["4-defeat.jpg", "?shot=lose&seed=1"],
];
const browser = await puppeteer.launch({
  executablePath: "/opt/meta-chromium/chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--use-angle=swiftshader", "--enable-unsafe-swiftshader",
    "--disable-gpu-sandbox", "--hatch-webgl-allowed-domains-file=" + policyPath,
    "--hatch-webgl-allowed-domains-sha256=" + policySha, "--allow-file-access-from-files", "--window-size=1280,800"],
});
const errors = [];
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));
for (const [file, query] of shots) {
  await page.goto(pageUrl(query), { waitUntil: "load", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2800));
  await page.screenshot({ path: join(outDir, file), type: "jpeg", quality: 84 });
  console.log("captured", file);
}
console.log("console errors:", errors.length, errors.join(" | "));
await browser.close();
