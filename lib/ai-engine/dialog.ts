// Dialog-Orchestrator (server-only, Phase 2a). Ein Turn: Verlaufs-Krisen-Check →
// Antwort (System-Prompt + Memory + Verlauf) → Output-Safety → Memory-Extraktion.
// Stateless: nichts wird gespeichert; das Gespräch bleibt beim Client (flüchtig),
// nur verdichtetes Memory kommt als Ops zurück.

import { rufeMistralChat, type ChatNachricht } from "./mistral";
import { SYSTEM_PROMPT } from "./system-prompt";
import {
  pruefeEingabe,
  pruefeAusgabe,
  bereinigeFormat,
  KRISEN_EINLADUNG,
  FALLBACK_EINLADUNG,
} from "./safety";
import { pruefeKriseModell } from "./krise-modell";
import { modulZeilen } from "./context";
import { extrahiereMemory } from "./extract";
import type { DialogAnfrage, DialogAntwort } from "./dialog-types";

const DIALOG_ZUSATZ = `

DIALOG-MODUS: Du bist jetzt in einem ruhigen, knappen Gespräch. Antworte in 2–3 kurzen Sätzen, Du-Form. Weniger ist mehr — lieber ein Satz zu wenig als einer zu viel.

ZURÜCKHALTUNG (Lanas Korrektur — die wichtigste Regel hier)
- Behaupte NIE, was die Person kennt, fühlt oder erlebt. Kein „Du kennst diesen Moment genau", kein „Du spürst jetzt, wie …", kein „Das kennst du schon".
- Frag lieber, als festzustellen. Wo du etwas wahrzunehmen glaubst, mach ein vorsichtiges Angebot und lass ihr die Tür: „Klingt, als … — ist das so?", „Mag sein, dass …?", „Wie ist das bei dir?"
- Meist ist EINE offene Frage mehr wert als ein Vorschlag. Nicht jede Antwort braucht ein Modul; Spiegeln und Nachfragen genügt oft.
- Bleib nah an dem, was die Person WIRKLICH gesagt hat. Dichte ihr keine Empfindung an.

SPARSAM MIT BILDERN (Lana: „nicht so viele Bilder, bisschen reduzierter")
- ERFINDE KEINE eigenen Metaphern. Kein „wie ein ungebetener Gast", kein „wie ein schwerer Rucksack", kein „Hamsterrad". Solche Bilder gehören der Person, nicht dir.
- Es gibt nur Lanas Bilder-Bibliothek: die Alarmanlage / der Säbelzahntiger, Gas und Bremse, die lange Ausatmung, die innere Wippe, der Tag als Fluss mit kleinen Inseln, der geschützte Hafen, Gedanken als Züge am Bahnsteig, das Gästehaus der Gefühle, der eigene Garten, das Reh, das sich schüttelt, die vier Fenster, der Rundgang durchs eigene Haus.
- Nimm HÖCHSTENS EIN Bild — und nur, wenn es die Person selbst schon berührt hat oder es genau trifft. Meistens gar keins. Ein nüchterner, warmer Satz ist besser als ein hübsches Bild.
- Greif zuerst die Worte der Person auf. Ihre Sprache trägt weiter als deine.

RAHMEN
- Biete höchstens EINE kleine Einladung an — kein Ratschlag-Schwall, keine Therapie.
- Nutze das Gedächtnis unten nur, wenn es wirklich passt, und tu nicht so, als kenntest du die Person.
- Der Weg liegt in den Modulen, nicht in diesem Gespräch. Ermutige reale Verbindung und Pausen; mach dich nicht unentbehrlich, sei kein Ersatz für Menschen.
- Schreib reinen Fließtext: kein Markdown, keine Sternchen, keine Aufzählungen.`;

function zustandKurz(z: DialogAnfrage["zustand"]): string {
  const b = z.baseline;
  const zeilen: string[] = [];
  if (b) {
    zeilen.push(
      `- Selbsteinschätzung (0 ruhig…10 belastet): Körper ${b.koerper ?? "?"}, Gedanken ${b.gedanken ?? "?"}, Stimmung ${b.stimmung ?? "?"}, Verhalten ${b.verhalten ?? "?"}.`,
    );
  }
  zeilen.push(...modulZeilen(z.abgeschlossen || []));
  return zeilen.join("\n");
}

export async function dialogTurn(anfrage: DialogAnfrage): Promise<DialogAntwort> {
  const { nachricht, verlauf, erinnerungen, zustand } = anfrage;
  const personTexte = verlauf.filter((t) => t.rolle === "person").map((t) => t.text);

  // Tor 1 — Verlaufs-Krise (Keyword auf Nachricht+Verlauf, dann Modell). Nie ins Gespräch.
  const krisenZustand = {
    ...zustand,
    anliegen: nachricht,
    journal: [...(zustand.journal || []), ...personTexte.map((text) => ({ text }))],
  };
  if (pruefeEingabe(krisenZustand).krise) {
    return { krise: true, antwort: KRISEN_EINLADUNG, memoryOps: [] };
  }
  if (await pruefeKriseModell([nachricht, ...personTexte].join("\n"))) {
    return { krise: true, antwort: KRISEN_EINLADUNG, memoryOps: [] };
  }

  // Kontext (Memory + Zustand) in den System-Prompt.
  const gedaechtnis = erinnerungen.length
    ? erinnerungen.map((e) => `- (${e.art}) ${e.text}`).join("\n")
    : "(noch leer)";
  const systemInhalt =
    SYSTEM_PROMPT + DIALOG_ZUSATZ + `\n\nGEDÄCHTNIS (verdichtet):\n${gedaechtnis}\n\nZUSTAND:\n${zustandKurz(zustand)}`;

  const messages: ChatNachricht[] = [
    { role: "system", content: systemInhalt },
    ...verlauf.slice(-8).map(
      (t): ChatNachricht => ({ role: t.rolle === "person" ? "user" : "assistant", content: t.text }),
    ),
    { role: "user", content: nachricht },
  ];

  // Tor 2 — Antwort + Output-Filter (ein Nachbesserungs-Versuch, sonst Fallback).
  let antwort = bereinigeFormat(await rufeMistralChat(messages, { maxTokens: 320 }));
  let safety = pruefeAusgabe(antwort);
  if (!safety.ok) {
    antwort = bereinigeFormat(
      await rufeMistralChat(
        [
          ...messages,
          {
            role: "system",
            content: `Deine letzte Antwort verstieß gegen die Grenzen (${safety.verstoesse.map((v) => v.art).join(", ")}). Formuliere neu — ohne Heilkunde-/Diagnose-/Druck-/Schmeichel-Sprache, ohne eigene Gefühle oder Erfahrungen zu behaupten, rein einladend.`,
          },
        ],
        { maxTokens: 320 },
      ),
    );
    safety = pruefeAusgabe(antwort);
    if (!safety.ok) return { krise: false, antwort: FALLBACK_EINLADUNG, memoryOps: [] };
  }

  // Memory-Extraktion (optional; Fehler → keine Ops).
  const memoryOps = await extrahiereMemory({ person: nachricht, engine: antwort }, erinnerungen);
  return { krise: false, antwort, memoryOps };
}
