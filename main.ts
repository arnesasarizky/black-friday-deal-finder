// Midnight Deals entry program: copies app/ and screenshots/ into the
// output directory and writes dossier.json with the kit's dossier library.
// Runs with plain `node main.ts`; MAKEFUN_OUTPUT_DIR stands in for /output.
// Paths resolve from this file's own directory, never the working directory:
// the grader runs `node /bot/main.ts` from elsewhere, so relative paths fail.
// Fix: resolve app/ and screenshots/ from this file's directory (repoRoot),
// not from process.cwd(), so the grader run from any cwd succeeds.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, "app"), join(outputDir, "app"), { recursive: true });
cpSync(join(repoRoot, "screenshots"), join(outputDir, "screenshots"), { recursive: true });

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216
});
writeFileSync(join(outputDir, "dossier.json"), dossier);
