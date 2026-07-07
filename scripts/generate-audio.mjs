#!/usr/bin/env node
/**
 * MBM Audio-Pipeline — erzeugt aus einem Modul-JSON die vorlesbaren Schritte
 * als MP3s (ElevenLabs) und schreibt sie nach public/audio/<modulId>/.
 *
 * Umsetzung nach docs/specs/p2-audio.md. Nur Node-20-Built-ins, kein Paket.
 *
 * CLI:  node scripts/generate-audio.mjs <modulId> [--dry-run] [--schritt <typ>] [--force]
 *
 * WICHTIG: Der ElevenLabs-API-Key wird niemals geloggt.
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";

// ── Pfade ────────────────────────────────────────────────────────────
const HIER = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HIER, "..");

// ── Konstanten (Spec §Konfiguration) ─────────────────────────────────
const MODEL_ID = "eleven_multilingual_v2";
const OUTPUT_FORMAT = "mp3_44100_128";
const VOICE_SETTINGS = {
  stability: 0.55,
  similarity_boost: 0.75,
  style: 0.2,
  use_speaker_boost: true,
};
// mp3_44100_128 ist CBR 128 kbps → 16000 Bytes/Sekunde (für Dauer-Schätzung).
const BYTES_PRO_SEKUNDE = 128000 / 8;

// ── Pausen-Marker → SSML-Breaks (Spec §Text-Aufbereitung) ────────────
const BREAK_KURZ = '<break time="0.6s" />';
const BREAK_NORMAL = '<break time="1.2s" />';
const BREAK_LANG = '<break time="2.5s" />';
const BREAK_ABSATZ = '<break time="1.0s" />';

const MARKER_ENDE = /\[(?:kurze Pause|Pause|längere Pause)\]\s*$/;
const MARKER_ANFANG = /^\s*\[(?:kurze Pause|Pause|längere Pause)\]/;
const LAENGERE_ENDE = /\[längere Pause\]\s*$/;

// ── Hilfen ───────────────────────────────────────────────────────────
function fehlerRaus(nachricht) {
  console.error(`Fehler: ${nachricht}`);
  process.exit(1);
}

function warte(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * .env im Repo-Root simpel zeilenweise parsen und fehlende Werte in
 * process.env übernehmen. Werte werden nie ausgegeben.
 */
function ladeEnvDatei() {
  const envPfad = path.join(REPO_ROOT, ".env");
  if (!existsSync(envPfad)) return;
  const inhalt = readFileSync(envPfad, "utf8");
  for (const zeile of inhalt.split(/\r?\n/)) {
    const roh = zeile.trim();
    if (roh === "" || roh.startsWith("#")) continue;
    const gleich = roh.indexOf("=");
    if (gleich === -1) continue;
    const schluessel = roh.slice(0, gleich).trim();
    let wert = roh.slice(gleich + 1).trim();
    if (
      (wert.startsWith('"') && wert.endsWith('"')) ||
      (wert.startsWith("'") && wert.endsWith("'"))
    ) {
      wert = wert.slice(1, -1);
    }
    if (process.env[schluessel] === undefined) {
      process.env[schluessel] = wert;
    }
  }
}

/** Verlangt API-Key + Voice-ID; nur für echte Läufe nötig. */
function verlangeConfig() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!apiKey || !voiceId) {
    fehlerRaus(
      "ELEVENLABS_API_KEY und ELEVENLABS_VOICE_ID müssen in .env gesetzt sein.",
    );
  }
  return { apiKey, voiceId };
}

// ── Text-Aufbereitung (Spec §Text-Aufbereitung) ──────────────────────
/**
 * Einen Absatz bereinigen: Auszeichnung entfernen, Pausen-Marker in Breaks
 * wandeln, Whitespace normalisieren.
 */
function bereinige(text) {
  let t = text.replace(/\*\*/g, "").replace(/\*/g, "");
  t = t
    .replace(/\[kurze Pause\]/g, BREAK_KURZ)
    .replace(/\[längere Pause\]/g, BREAK_LANG)
    .replace(/\[Pause\]/g, BREAK_NORMAL);
  // Zeilenumbrüche und Mehrfach-Whitespace zu einem Leerzeichen.
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

/**
 * Absätze eines Schritts sammeln: jeder Block auf \n\n gesplittet, leere raus.
 * Blockgrenze und \n\n werden gleich behandelt (beides Absatzgrenzen).
 */
function absaetzeSammeln(schritt) {
  const absaetze = [];
  for (const block of schritt.bloecke) {
    const text = typeof block.text === "string" ? block.text : "";
    for (const teil of text.split(/\n\n+/)) {
      const roh = teil.trim();
      if (roh !== "") absaetze.push(roh);
    }
  }
  return absaetze;
}

/** Einen Chunk (Liste roher Absätze) zu einem SSML-Text zusammensetzen. */
function baueChunkText(absaetze) {
  let out = "";
  for (let i = 0; i < absaetze.length; i++) {
    const sauber = bereinige(absaetze[i]);
    if (i === 0) {
      out = sauber;
      continue;
    }
    const vorher = absaetze[i - 1];
    const jetzt = absaetze[i];
    // 1,0-s-Break zwischen Absätzen, außer an der Grenze steht schon ein Marker.
    const grenzeHatMarker =
      MARKER_ENDE.test(vorher) || MARKER_ANFANG.test(jetzt);
    out += grenzeHatMarker ? " " + sauber : ` ${BREAK_ABSATZ} ` + sauber;
  }
  return out.replace(/\s+/g, " ").trim();
}

/**
 * Einen Schritt in Chunks zerlegen. Chunk-Grenze = Absatz, der mit
 * [längere Pause] endet (die Pause schließt den Chunk ab). Kein
 * [längere Pause] → genau ein Chunk.
 * Rückgabe: Array von Chunk-Texten (bereinigt, mit Breaks).
 */
function schrittZuChunks(schritt) {
  const absaetze = absaetzeSammeln(schritt);
  const gruppen = [];
  let aktuell = [];
  for (const abs of absaetze) {
    aktuell.push(abs);
    if (LAENGERE_ENDE.test(abs)) {
      gruppen.push(aktuell);
      aktuell = [];
    }
  }
  if (aktuell.length > 0) gruppen.push(aktuell);
  if (gruppen.length === 0) gruppen.push([]); // Sicherheitsnetz
  return gruppen.map((g) => baueChunkText(g));
}

// ── Modul laden ──────────────────────────────────────────────────────
function ladeModul(modulId) {
  const pfad = path.join(REPO_ROOT, "content", "modules", `${modulId}.json`);
  if (!existsSync(pfad)) {
    fehlerRaus(`Modul-JSON nicht gefunden: content/modules/${modulId}.json`);
  }
  let modul;
  try {
    modul = JSON.parse(readFileSync(pfad, "utf8"));
  } catch (e) {
    fehlerRaus(`Modul-JSON nicht lesbar: ${e.message}`);
  }
  if (!modul || !Array.isArray(modul.schritte)) {
    fehlerRaus("Modul-JSON hat kein schritte-Array.");
  }
  return modul;
}

/** Pfad im JSON (/audio/s1/01-funke.mp3) → public/audio/s1/01-funke.mp3 */
function zielPfad(audioFeld) {
  const relativ = audioFeld.replace(/^\//, "");
  return path.join(REPO_ROOT, "public", relativ);
}

// ── ElevenLabs ───────────────────────────────────────────────────────
async function synthetisiere({
  apiKey,
  voiceId,
  text,
  previousText,
  nextText,
  previousRequestIds,
}) {
  const url =
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}` +
    `?output_format=${OUTPUT_FORMAT}`;
  const body = {
    text,
    model_id: MODEL_ID,
    voice_settings: VOICE_SETTINGS,
  };
  if (previousText) body.previous_text = previousText;
  if (nextText) body.next_text = nextText;
  if (previousRequestIds && previousRequestIds.length > 0) {
    body.previous_request_ids = previousRequestIds.slice(-3);
  }

  let versuch = 0;
  // Retry-Schleife nur für 429.
  for (;;) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "content-type": "application/json",
        accept: "audio/mpeg",
      },
      body: JSON.stringify(body),
    });

    if (res.status === 429) {
      if (versuch >= 3) {
        throw new Error("ElevenLabs HTTP 429 (Rate-Limit) nach 3 Versuchen.");
      }
      versuch += 1;
      console.warn(`  Rate-Limit (429) — warte 5 s, Versuch ${versuch}/3 …`);
      await warte(5000);
      continue;
    }

    if (!res.ok) {
      let info = "";
      try {
        info = await res.text();
      } catch {
        info = "(kein Body)";
      }
      // info enthält keinen Key (Key steckt nur im Header).
      throw new Error(`ElevenLabs HTTP ${res.status}: ${info}`);
    }

    const requestId =
      res.headers.get("request-id") || res.headers.get("x-request-id") || null;
    const buffer = Buffer.from(await res.arrayBuffer());
    return { buffer, requestId };
  }
}

// ── Chunks zu einer MP3 zusammenfügen ────────────────────────────────
function ffmpegVerfuegbar() {
  try {
    const r = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return r.status === 0;
  } catch {
    return false;
  }
}

/**
 * Chunk-Buffer zu einer MP3-Datei schreiben. Standard: Byte-Konkatenation
 * (bei identischem Format zulässig). Wenn ffmpeg da ist, optional re-muxen;
 * bei jedem Fehler Fallback auf die Konkatenation.
 */
function schreibeMp3(zielPfad_, buffers) {
  mkdirSync(path.dirname(zielPfad_), { recursive: true });
  const konkat = Buffer.concat(buffers);

  if (buffers.length > 1 && ffmpegVerfuegbar()) {
    const tmp = path.join(
      os.tmpdir(),
      `mbm-audio-${process.pid}-${Date.now()}.mp3`,
    );
    try {
      writeFileSync(tmp, konkat);
      const r = spawnSync(
        "ffmpeg",
        ["-y", "-i", tmp, "-c", "copy", zielPfad_],
        { stdio: "ignore" },
      );
      if (r.status === 0 && existsSync(zielPfad_)) {
        return; // ffmpeg-Remux erfolgreich
      }
      // sonst Fallback
      writeFileSync(zielPfad_, konkat);
    } catch {
      writeFileSync(zielPfad_, konkat);
    } finally {
      try {
        if (existsSync(tmp)) rmSync(tmp);
      } catch {
        // egal
      }
    }
    return;
  }

  writeFileSync(zielPfad_, konkat);
}

// ── Ausgabe-Hilfen ───────────────────────────────────────────────────
function dauerText(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "–";
  const sek = bytes / BYTES_PRO_SEKUNDE;
  const m = Math.floor(sek / 60);
  const s = Math.round(sek % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function tabelle(zeilen) {
  const kopf = ["Datei", "Chunks", "Dauer", "Bytes"];
  const alle = [kopf, ...zeilen.map((z) => [z.datei, z.chunks, z.dauer, z.bytes])];
  const breiten = kopf.map((_, i) =>
    Math.max(...alle.map((r) => String(r[i]).length)),
  );
  const zeile = (r) =>
    r.map((c, i) => String(c).padEnd(breiten[i])).join("  ");
  console.log("\n" + zeile(kopf));
  console.log(breiten.map((b) => "─".repeat(b)).join("  "));
  for (const z of zeilen) {
    console.log(zeile([z.datei, z.chunks, z.dauer, z.bytes]));
  }
}

// ── Argument-Parsing ─────────────────────────────────────────────────
function parseArgs(argv) {
  const args = { modulId: null, dryRun: false, force: false, schritt: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--force") args.force = true;
    else if (a === "--schritt") {
      args.schritt = argv[i + 1] ?? null;
      i += 1;
    } else if (!a.startsWith("--") && args.modulId === null) {
      args.modulId = a;
    }
  }
  return args;
}

// ── Hauptprogramm ────────────────────────────────────────────────────
async function main() {
  ladeEnvDatei();

  const args = parseArgs(process.argv.slice(2));
  if (!args.modulId) {
    fehlerRaus(
      "Aufruf: node scripts/generate-audio.mjs <modulId> [--dry-run] [--schritt <typ>] [--force]",
    );
  }

  const modul = ladeModul(args.modulId);

  // Schritte mit Audio (optional gefiltert nach --schritt).
  let schritte = modul.schritte.filter(
    (s) => typeof s.audio === "string" && s.audio.trim() !== "",
  );
  if (args.schritt) {
    schritte = schritte.filter((s) => s.typ === args.schritt);
    if (schritte.length === 0) {
      fehlerRaus(
        `Kein Schritt mit typ "${args.schritt}" und Audio-Feld in Modul "${args.modulId}".`,
      );
    }
  }

  console.log(
    `Modul "${modul.id}" — ${schritte.length} Audio-Datei(en) ${
      args.dryRun ? "(Dry-Run, keine API-Calls)" : ""
    }`,
  );

  // ── Dry-Run: nur Chunks + Kontext ausgeben ──
  if (args.dryRun) {
    const zeilen = [];
    for (const schritt of schritte) {
      const chunkTexte = schrittZuChunks(schritt);
      console.log(
        `\n── ${schritt.audio}  (Schritt: ${schritt.typ}, ${chunkTexte.length} Chunk(s)) ──`,
      );
      chunkTexte.forEach((text, k) => {
        const previous = chunkTexte.slice(0, k).join(" ").trim();
        const next = chunkTexte.slice(k + 1).join(" ").trim();
        console.log(`  Chunk ${k + 1}/${chunkTexte.length}:`);
        console.log(`    text:          ${text}`);
        console.log(`    previous_text: ${previous || "(leer)"}`);
        console.log(`    next_text:     ${next || "(leer)"}`);
      });
      zeilen.push({
        datei: schritt.audio.replace(/^\/audio\//, ""),
        chunks: chunkTexte.length,
        dauer: "–",
        bytes: "–",
      });
    }
    tabelle(zeilen);
    console.log(`\nGeplant: ${zeilen.length} Datei(en). Kein API-Call (Dry-Run).`);
    return;
  }

  // ── Echt-Lauf ──
  const { apiKey, voiceId } = verlangeConfig();
  const zeilen = [];

  for (const schritt of schritte) {
    const ziel = zielPfad(schritt.audio);
    const relativ = schritt.audio.replace(/^\/audio\//, "");

    if (existsSync(ziel) && !args.force) {
      console.log(`\n${schritt.audio}: existiert schon — übersprungen (--force zum Neubauen).`);
      const bytes = readFileSync(ziel).length;
      zeilen.push({
        datei: relativ,
        chunks: "–",
        dauer: dauerText(bytes),
        bytes,
      });
      continue;
    }

    const chunkTexte = schrittZuChunks(schritt);
    console.log(
      `\n${schritt.audio}: ${chunkTexte.length} Chunk(s) — generiere …`,
    );

    const buffers = [];
    const requestIds = [];
    for (let k = 0; k < chunkTexte.length; k++) {
      const previousText = chunkTexte.slice(0, k).join(" ").trim();
      const nextText = chunkTexte.slice(k + 1).join(" ").trim();
      console.log(`  Chunk ${k + 1}/${chunkTexte.length} …`);
      const { buffer, requestId } = await synthetisiere({
        apiKey,
        voiceId,
        text: chunkTexte[k],
        previousText,
        nextText,
        previousRequestIds: requestIds,
      });
      buffers.push(buffer);
      if (requestId) requestIds.push(requestId);
    }

    schreibeMp3(ziel, buffers);
    const bytes = readFileSync(ziel).length;
    zeilen.push({
      datei: relativ,
      chunks: chunkTexte.length,
      dauer: dauerText(bytes),
      bytes,
    });
  }

  tabelle(zeilen);
  console.log("\nFertig.");
}

main().catch((e) => {
  // Key steckt nur im Header und wird nirgends geloggt.
  fehlerRaus(e.message || String(e));
});
