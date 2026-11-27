// Midnight Deals entry program: copies app/ and screenshots/ into the
// output directory and writes dossier.json with the kit's dossier library.
// Runs with plain `node main.ts`; MAKEFUN_OUTPUT_DIR stands in for /output.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });
cpSync("app", `${outputDir}/app`, { recursive: true });
cpSync("screenshots", `${outputDir}/screenshots`, { recursive: true });

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216
});
writeFileSync(`${outputDir}/dossier.json`, dossier);
