// Orchestrator der AI-Engine (Phase-0). Fügt State → Kontext → Modell-Call →
// Safety zusammen. Der Modell-Call ist bewusst hinter EINER Funktion gekapselt
// (`rufeModell`) — in Produktion wird hier gegen einen EU-Inferenz-Endpunkt
// getauscht (research/02), genau wie der storage.ts-Layer austauschbar ist.

import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SYSTEM_PROMPT } from "./system-prompt.mjs";
import {
  pruefeEingabe,
  pruefeAusgabe,
  KRISEN_EINLADUNG,
  FALLBACK_EINLADUNG,
} from "./safety.mjs";

const MODEL = "claude-sonnet-5";

// Kompakte Modul-Landkarte (nur so viel, dass die Engine einen passenden
// nächsten Schritt vorschlagen kann).
const MODULE = {
  willkommen: "Willkommen — wie das hier funktioniert (Ankommen)",
  "wo-du-stehst": "Wo du gerade stehst — der Vier-Fenster-Selbstcheck (Ankommen)",
  alarm: "Dein innerer Alarm — die lange Ausatmung als Bremse (Runterkommen)",
  "energie-ablassen": "Energie ablassen — aufgestaute Anspannung abschütteln (Runterkommen)",
  "zur-ruhe-kommen": "Zur Ruhe kommen — tiefe Erholung, der geschützte Hafen (Runterkommen)",
  inseln: "Kleine Inseln im Tag — Mikro-Pausen (Runterkommen)",
  "koerper-hoeren": "Den Körper hören — der Rundgang durchs Haus (Wahrnehmen)",
  "gedanken-entwirren": "Gedanken entwirren — Gedanken als Züge am Bahnsteig (Wahrnehmen)",
  "eigene-praxis": "Deine eigene Praxis — dein eigener Garten (Weit werden)",
  "rueckblick-weite": "Rückblick & Weite — was sich bewegt hat (Weit werden)",
};
const REIHENFOLGE = Object.keys(MODULE);

// State → knapper, gut lesbarer Kontext-Text für die Engine.
export function zustandZuKontext(p) {
  const b = p.baseline || {};
  const zeilen = [];
  zeilen.push("NUTZERZUSTAND (anonym, aus lokalen App-Daten):");
  zeilen.push(
    `- Selbsteinschätzung (0 = ruhig/gut … 10 = belastet): ` +
      `Körper ${b.koerper}/10 (0 ruhig…10 angespannt), ` +
      `Gedanken ${b.gedanken}/10 (0 ruhig…10 rasend), ` +
      `Stimmung ${b.stimmung}/10 (0 weit…10 dünnhäutig), ` +
      `Verhalten ${b.verhalten}/10 (0 fürsorglich…10 im Hetzmodus).`,
  );
  if (p.nachher) {
    const n = p.nachher;
    zeilen.push(
      `- Spätere Messung: Körper ${n.koerper}, Gedanken ${n.gedanken}, Stimmung ${n.stimmung}, Verhalten ${n.verhalten} (also seit dem Start eher gelöster).`,
    );
  }
  if (p.anliegen) zeilen.push(`- Anliegen in eigenen Worten: „${p.anliegen}"`);
  const gl = (p.loop || []).filter((l) => l.gluecksmoment).map((l) => l.gluecksmoment);
  if (gl.length) zeilen.push(`- Notierte Glücksmomente: ${gl.map((g) => `„${g}"`).join(", ")}.`);
  const ankerTage = (p.loop || []).filter((l) => l.ankerGemacht).length;
  if (ankerTage) zeilen.push(`- Hat an ${ankerTage} Tagen den kleinen Alltags-Anker gemacht.`);
  if ((p.journal || []).length)
    zeilen.push(`- Journal-Notiz: „${p.journal[p.journal.length - 1].text}"`);
  if ((p.abgeschlossen || []).length)
    zeilen.push(
      `- Schon durchlaufen: ${p.abgeschlossen.map((id) => MODULE[id] || id).join("; ")}.`,
    );
  const offen = REIHENFOLGE.filter((id) => !(p.abgeschlossen || []).includes(id));
  if (offen.length)
    zeilen.push(
      `- Noch offen (mögliche nächste Schritte): ${offen.map((id) => MODULE[id]).join("; ")}.`,
    );
  zeilen.push(
    "\nFormuliere jetzt GENAU EINE warme, persönliche nächste Einladung (2–4 Sätze) nach deinen Regeln.",
  );
  return zeilen.join("\n");
}

// Modell-Call — gekapselt hinter EINER austauschbaren Funktion (Signatur:
// (kontext) => string | Promise<string>). Standard: die claude-CLI im Print-Modus
// aus einer sauberen Sandbox. Für EU-Inferenz wird `rufeModellMistral` (mistral.mjs)
// injiziert — genau wie der storage.ts-Layer austauschbar ist.
export function rufeModellClaude(kontext) {
  const sandbox = mkdtempSync(join(tmpdir(), "mbm-engine-"));
  const r = spawnSync(
    "claude",
    ["-p", kontext, "--system-prompt", SYSTEM_PROMPT, "--model", MODEL],
    { cwd: sandbox, encoding: "utf8", timeout: 120000, maxBuffer: 4 * 1024 * 1024 },
  );
  if (r.status !== 0 || !r.stdout) {
    throw new Error(`Modell-Call fehlgeschlagen: ${r.stderr || r.error || "kein Output"}`);
  }
  return r.stdout.trim();
}

// Die eine öffentliche Funktion: Zustand rein, sichere Einladung raus.
// `rufeModell` ist injizierbar (Default: claude-CLI); async, damit fetch-Backends gehen.
export async function naechsteEinladung(persona, rufeModell = rufeModellClaude) {
  const eingang = pruefeEingabe(persona);
  if (eingang.krise) {
    return { krise: true, quelle: "krisen-layer", einladung: KRISEN_EINLADUNG, eingang };
  }

  const kontext = zustandZuKontext(persona);
  let text = await rufeModell(kontext);
  let safety = pruefeAusgabe(text);

  if (!safety.ok) {
    // Ein Nachbesserungs-Versuch mit explizitem Hinweis.
    const nach =
      kontext +
      `\n\nHINWEIS: Deine letzte Antwort verstieß gegen die Grenzen (${safety.verstoesse
        .map((v) => v.art)
        .join(", ")}). Formuliere neu — ohne Heilkunde-/Diagnose-/Druck-/Schmeichel-Sprache, rein einladend.`;
    text = await rufeModell(nach);
    safety = pruefeAusgabe(text);
    if (!safety.ok) {
      return { krise: false, quelle: "fallback", einladung: FALLBACK_EINLADUNG, safety, kontext };
    }
  }
  return { krise: false, quelle: "modell", einladung: text, safety, kontext };
}
