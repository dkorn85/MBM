// Memory-Extraktion (server-only, Mistral Small) — Mem0-Muster: aus einem
// Gesprächs-Turn HÖCHSTENS 1–2 verdichtete Erinnerungen ableiten und mit dem
// bestehenden Gedächtnis konsolidieren (add/update/delete). Ressourcenorientiert,
// kein sensibler Rohtext, keine Diagnosen. Robust: bei Parse-/Modell-Fehler → [].

import { MISTRAL_EXTRAKT_MODELL } from "./config";
import { rufeMistral } from "./mistral";
import type { MemoryArt } from "./memory/types";
import type { Erinnerung, MemoryOp, Turn } from "./dialog-types";

const ARTEN: MemoryArt[] = ["muster", "ressource", "vorliebe", "kontext"];

const EXTRAKT_PROMPT = `Du bist ein Gedächtnis-Extraktor für eine ruhige Lern-App. Du destillierst aus dem letzten Gesprächs-Turn die dauerhaft nützlichen Notizen über die Person.

WAS NOTIERT WIRD (höchstens 1–2 Notizen):
- ressource: was der Person nachweislich hilft (Menschen, Orte, Bewegungen, Rituale)
- muster: eine wiederkehrende Dynamik, die sie selbst beschreibt
- vorliebe: was sie mag oder ablehnt
- kontext: stabile Lebensumstände (Arbeit, Wohnsituation, Tiere, Nahestehende)

NUR WAS DIE PERSON SELBST SAGT. Die Zeile „Begleitung" ist bloß Kontext — ihre Vorschläge, Bilder und Vermutungen sind KEINE Fakten über die Person. Notiere nichts, was die Person nicht selbst geäußert hat. Im Zweifel: nicht notieren.

REGELN: verdichtet in einem knappen Satz, dritte Person („Sie …"). Keine Diagnosen, kein sensibler Rohtext, keine Zitate. Nicht duplizieren — widerspricht etwas dem bestehenden Gedächtnis, aktualisiere es, statt anzuhäufen.

Antworte AUSSCHLIESSLICH mit einem JSON-Array von Operationen, sonst nichts. Jedes Element ist eines von:
{"aktion":"add","art":"muster|ressource|vorliebe|kontext","text":"…"}
{"aktion":"update","id":"…","text":"…"}
{"aktion":"delete","id":"…"}

Beispiel-Antwort:
[{"aktion":"add","art":"ressource","text":"Ein kurzer Spaziergang am Wasser beruhigt sie zuverlässig."},{"aktion":"add","art":"kontext","text":"Sie arbeitet im Schichtdienst."}]

Nur wenn der Turn wirklich nichts Neues über die Person verrät (reine Rückfrage, Small Talk), antworte mit [].`;

function parseOps(roh: string, gueltigeIds: Set<string>): MemoryOp[] {
  // JSON aus evtl. Code-Fences / Prosa herausschneiden.
  const start = roh.indexOf("[");
  const ende = roh.lastIndexOf("]");
  if (start === -1 || ende <= start) return [];
  let arr: unknown;
  try {
    arr = JSON.parse(roh.slice(start, ende + 1));
  } catch {
    return [];
  }
  if (!Array.isArray(arr)) return [];

  const ops: MemoryOp[] = [];
  for (const roha of arr.slice(0, 2)) {
    const o = (roha && typeof roha === "object" ? roha : {}) as Record<string, unknown>;
    const text = typeof o.text === "string" ? o.text.trim().slice(0, 200) : "";
    if (o.aktion === "add" && text && ARTEN.includes(o.art as MemoryArt)) {
      ops.push({ aktion: "add", art: o.art as MemoryArt, text });
    } else if (o.aktion === "update" && text && typeof o.id === "string" && gueltigeIds.has(o.id)) {
      ops.push({ aktion: "update", id: o.id, text });
    } else if (o.aktion === "delete" && typeof o.id === "string" && gueltigeIds.has(o.id)) {
      ops.push({ aktion: "delete", id: o.id });
    }
  }
  return ops;
}

export async function extrahiereMemory(
  turn: { person: string; engine: string },
  bestehend: Erinnerung[],
): Promise<MemoryOp[]> {
  const gedaechtnis = bestehend.length
    ? bestehend.map((e) => `- [${e.id}] (${e.art}) ${e.text}`).join("\n")
    : "(noch leer)";
  const inhalt =
    `BESTEHENDES GEDÄCHTNIS:\n${gedaechtnis}\n\n` +
    `LETZTER TURN:\nPerson: „${turn.person}"\nBegleitung: „${turn.engine}"`;
  try {
    const roh = await rufeMistral(inhalt, EXTRAKT_PROMPT, {
      temperatur: 0,
      maxTokens: 220,
      modell: MISTRAL_EXTRAKT_MODELL,
    });
    return parseOps(roh, new Set(bestehend.map((e) => e.id)));
  } catch {
    return []; // Extraktion ist optional — Dialog läuft auch ohne
  }
}
