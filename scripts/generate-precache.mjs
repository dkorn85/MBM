// Scannt public/audio/** und schreibt die Datei-Liste nach
// public/precache-manifest.json. Wird als npm-"prebuild" ausgeführt, damit der
// Service Worker die Audio-URLs zur Laufzeit (bei install) precachen kann.
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const publicDir = join(process.cwd(), "public");
const audioDir = join(publicDir, "audio");

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

let audio = [];
try {
  audio = walk(audioDir)
    .map((f) => "/" + relative(publicDir, f).split(sep).join("/"))
    .filter((p) => /\.(mp3|m4a|ogg|wav)$/i.test(p))
    .sort();
} catch {
  // Kein audio-Verzeichnis: leere Liste ist ok.
}

const manifest = { audio, generatedAt: new Date().toISOString() };
writeFileSync(
  join(publicDir, "precache-manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);
console.log(`precache-manifest.json geschrieben: ${audio.length} Audio-Datei(en)`);
