// Emberfall Duel - hand-in program.
// Copies game/ and screenshots/ into the output directory and writes
// dossier.json there with the vendored make.fun library. Node stdlib
// only, deterministic from any working directory.
import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-game.ts";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");

mkdirSync(outDir, { recursive: true });
cpSync(join(here, "game"), join(outDir, "game"), { recursive: true });
cpSync(join(here, "screenshots"), join(outDir, "screenshots"), { recursive: true });

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
});
writeFileSync(join(outDir, "dossier.json"), dossier);
