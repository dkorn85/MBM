// Wandelt den anonymen Zustand in einen knappen, gut lesbaren Kontext-Text für
// die Engine. Nutzt nur die schon lokal vorhandenen Signale (research/02: nichts
// Neues abfragen). Der `anlass` stimmt die Schluss-Bitte auf den Andockpunkt ab.

import type { Zustand } from "./types";

// Kompakte Modul-Landkarte (nur so viel, dass die Engine einen passenden
// nächsten Schritt vorschlagen kann).
const MODULE: Record<string, string> = {
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

export type Anlass = "selbsttest" | "weitergehen" | "loop" | "mein-weg";

const SCHLUSS: Record<Anlass, string> = {
  selbsttest:
    "Formuliere jetzt GENAU EINE warme, ressourcenorientierte erste Einladung (2–4 Sätze) nach deinen Regeln.",
  weitergehen:
    "Formuliere jetzt GENAU EINE warme, persönliche nächste Einladung (2–4 Sätze) nach deinen Regeln.",
  loop: "Formuliere jetzt GENAU EINE kurze, warme Einladung für heute (2–3 Sätze) nach deinen Regeln.",
  "mein-weg":
    "Formuliere jetzt GENAU EINE warme, ehrliche Spiegelung des bisherigen Wegs (2–4 Sätze) — kein Lob um des Lobes willen, sondern was sich zeigt.",
};

export function zustandZuKontext(z: Zustand, anlass: Anlass = "weitergehen"): string {
  const b = z.baseline || {};
  const zeilen: string[] = [];
  zeilen.push("NUTZERZUSTAND (anonym, aus lokalen App-Daten):");
  zeilen.push(
    `- Selbsteinschätzung (0 = ruhig/gut … 10 = belastet): ` +
      `Körper ${b.koerper ?? "?"}/10 (0 ruhig…10 angespannt), ` +
      `Gedanken ${b.gedanken ?? "?"}/10 (0 ruhig…10 rasend), ` +
      `Stimmung ${b.stimmung ?? "?"}/10 (0 weit…10 dünnhäutig), ` +
      `Verhalten ${b.verhalten ?? "?"}/10 (0 fürsorglich…10 im Hetzmodus).`,
  );
  if (z.nachher) {
    const n = z.nachher;
    zeilen.push(
      `- Spätere Messung: Körper ${n.koerper}, Gedanken ${n.gedanken}, Stimmung ${n.stimmung}, Verhalten ${n.verhalten} (also seit dem Start eher gelöster).`,
    );
  }
  if (z.anliegen) zeilen.push(`- Anliegen in eigenen Worten: „${z.anliegen}"`);
  const gl = (z.loop || []).filter((l) => l.gluecksmoment).map((l) => l.gluecksmoment);
  if (gl.length) zeilen.push(`- Notierte Glücksmomente: ${gl.map((g) => `„${g}"`).join(", ")}.`);
  const ankerTage = (z.loop || []).filter((l) => l.ankerGemacht).length;
  if (ankerTage) zeilen.push(`- Hat an ${ankerTage} Tagen den kleinen Alltags-Anker gemacht.`);
  const letzteNotiz = (z.journal || []).at(-1)?.text;
  if (letzteNotiz) zeilen.push(`- Journal-Notiz: „${letzteNotiz}"`);
  if ((z.abgeschlossen || []).length)
    zeilen.push(
      `- Schon durchlaufen: ${z.abgeschlossen!.map((id) => MODULE[id] || id).join("; ")}.`,
    );
  const offen = REIHENFOLGE.filter((id) => !(z.abgeschlossen || []).includes(id));
  if (offen.length)
    zeilen.push(
      `- Noch offen (mögliche nächste Schritte): ${offen.map((id) => MODULE[id]).join("; ")}.`,
    );
  zeilen.push("\n" + SCHLUSS[anlass]);
  return zeilen.join("\n");
}
