// Orchestrator (serverseitig): Zustand rein → sichere Einladung raus.
// Reihenfolge = Safety zuerst: Krise short-circuitet OHNE Modell-Call; sonst
// Modell (Mistral EU) → Output-Filter → ein Nachbesserungs-Versuch → Fallback.

import { zustandZuKontext, type Anlass } from "./context";
import { rufeMistral } from "./mistral";
import { pruefeKriseModell } from "./krise-modell";
import { SYSTEM_PROMPT } from "./system-prompt";
import {
  pruefeEingabe,
  pruefeAusgabe,
  KRISEN_EINLADUNG,
  FALLBACK_EINLADUNG,
} from "./safety";
import type { Einladung, Zustand } from "./types";

function freitextVon(zustand: Zustand): string {
  return [zustand.anliegen || "", ...(zustand.journal || []).map((j) => j.text || "")]
    .filter(Boolean)
    .join("\n")
    .trim();
}

export async function naechsteEinladung(
  zustand: Zustand,
  anlass: Anlass = "weitergehen",
): Promise<Einladung> {
  // Tor 1a — Keyword-Krisen-Erkennung (deterministisch, sofort, ohne Modell).
  if (pruefeEingabe(zustand).krise) {
    return { krise: true, quelle: "krisen-layer", einladung: KRISEN_EINLADUNG };
  }
  // Tor 1b — modellgestützte Krisen-Ebene für subtile Fälle (nur bei Freitext).
  // Beide Tore vor der Einladung: eine erkannte Krise geht NIE in eine normale Antwort.
  const freitext = freitextVon(zustand);
  if (freitext && (await pruefeKriseModell(freitext))) {
    return { krise: true, quelle: "krisen-layer", einladung: KRISEN_EINLADUNG };
  }

  const kontext = zustandZuKontext(zustand, anlass);
  let text = await rufeMistral(kontext, SYSTEM_PROMPT);
  let safety = pruefeAusgabe(text);

  // Tor 2 — Output-Filter, mit einem gezielten Nachbesserungs-Versuch.
  if (!safety.ok) {
    const nach =
      kontext +
      `\n\nHINWEIS: Deine letzte Antwort verstieß gegen die Grenzen (${safety.verstoesse
        .map((v) => v.art)
        .join(", ")}). Formuliere neu — ohne Heilkunde-/Diagnose-/Druck-/Schmeichel-Sprache, rein einladend.`;
    text = await rufeMistral(nach, SYSTEM_PROMPT);
    safety = pruefeAusgabe(text);
    if (!safety.ok) {
      return { krise: false, quelle: "fallback", einladung: FALLBACK_EINLADUNG };
    }
  }
  return { krise: false, quelle: "modell", einladung: text };
}
