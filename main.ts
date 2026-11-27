// Midnight Deals entry program: copies app/ and screenshots/ into the
// output directory and writes dossier.json with the kit's dossier library.
// Runs with plain `node main.ts`; MAKEFUN_OUTPUT_DIR stands in for /output.
// Paths resolve from this file's own directory, never the working directory:
// the grader runs `node /bot/main.ts` from elsewhere, so relative paths fail.
// The output directory is never removed: on the grader it is a mounted
// writable directory and removing it fails, so we only create it.
// Re-running into the same output directory is safe: copies overwrite in place.
import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, "app"), join(outputDir, "app"), { recursive: true });
mkdirSync(join(outputDir, "screenshots"), { recursive: true });
if (existsSync(join(repoRoot, "screenshots"))) {
  cpSync(join(repoRoot, "screenshots"), join(outputDir, "screenshots"), { recursive: true });
}

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216
});
writeFileSync(join(outputDir, "dossier.json"), dossier);
