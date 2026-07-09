// Wandelt den anonymen Zustand in einen knappen, gut lesbaren Kontext-Text für
// die Engine. Nutzt nur die schon lokal vorhandenen Signale (research/02: nichts
// Neues abfragen). Der `anlass` stimmt die Schluss-Bitte auf den Andockpunkt ab.

import type { Zustand } from "./types";

// Kompakte Modul-Landkarte. Titel und Bild sind bewusst GETRENNT: solange beides in
// einer Zeile stand, empfahl das Modell „das Modul ‚Der geschützte Hafen‘" — also
// Lanas Bild statt des Modulnamens, den man auf der Landkarte auch findet.
const MODULE: Record<string, { titel: string; station: string; worum: string }> = {
  willkommen: { titel: "Willkommen", station: "Ankommen", worum: "wie das hier funktioniert" },
  "wo-du-stehst": { titel: "Wo du gerade stehst", station: "Ankommen", worum: "der Vier-Fenster-Selbstcheck" },
  alarm: { titel: "Dein innerer Alarm", station: "Runterkommen", worum: "die lange Ausatmung als Bremse" },
  "energie-ablassen": { titel: "Energie ablassen", station: "Runterkommen", worum: "aufgestaute Anspannung abschütteln" },
  "zur-ruhe-kommen": { titel: "Zur Ruhe kommen", station: "Runterkommen", worum: "tiefe Erholung, der geschützte Hafen" },
  inseln: { titel: "Kleine Inseln im Tag", station: "Runterkommen", worum: "Mikro-Pausen" },
  "koerper-hoeren": { titel: "Den Körper hören", station: "Wahrnehmen", worum: "der Rundgang durchs Haus" },
  "gedanken-entwirren": { titel: "Gedanken entwirren", station: "Wahrnehmen", worum: "Gedanken als Züge am Bahnsteig" },
  "eigene-praxis": { titel: "Deine eigene Praxis", station: "Weit werden", worum: "dein eigener Garten" },
  "rueckblick-weite": { titel: "Rückblick & Weite", station: "Weit werden", worum: "was sich bewegt hat" },
};
const REIHENFOLGE = Object.keys(MODULE);

const zeile = (id: string) => {
  const m = MODULE[id];
  return m ? `„${m.titel}“ (${m.station}: ${m.worum})` : id;
};

// Welche Module es gibt, und wo die Person darin steht. Ohne diese Zeilen erfindet
// das Modell Modulnamen („Gedanken wie Wolken") — deshalb bekommt sie jeder Kontext,
// der die Engine einen nächsten Schritt vorschlagen lässt (Einladung wie Dialog).
export function modulZeilen(abgeschlossen: string[] = []): string[] {
  const zeilen: string[] = [];
  if (abgeschlossen.length)
    zeilen.push(`- Schon durchlaufen: ${abgeschlossen.map(zeile).join("; ")}.`);
  const offen = REIHENFOLGE.filter((id) => !abgeschlossen.includes(id));
  if (offen.length) zeilen.push(`- Noch offen (mögliche nächste Schritte): ${offen.map(zeile).join("; ")}.`);
  zeilen.push(
    "- Wenn du ein Modul erwähnst: nenne es EXAKT mit dem Titel in Anführungszeichen, nie mit dem Bild darin. Also „Zur Ruhe kommen“, nicht „Der geschützte Hafen“. Erfinde keine Module.",
  );
  return zeilen;
}

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
  zeilen.push(...modulZeilen(z.abgeschlossen || []));
  zeilen.push("\n" + SCHLUSS[anlass]);
  return zeilen.join("\n");
}
