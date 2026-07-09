// Live-Demo der PRODUKTIVEN Engine (lib/ai-engine) gegen synthetische Personas.
// Nutzt exakt den App-Code (naechsteEinladung → Safety + Krise + Mistral EU) —
// keine Prototyp-Kopie mehr.
//   MISTRAL_API_KEY=... npx tsx prototype/ai-engine/run.ts   (oder: npm run demo:engine)

import { naechsteEinladung } from "../../lib/ai-engine/einladung";
// @ts-ignore — synthetische Testdaten (plain JS, ohne Typen)
import { personas } from "./personas.mjs";

const LINIE = "─".repeat(72);

for (const p of personas) {
  console.log("\n" + LINIE);
  console.log(`PERSONA: ${p.id}  —  ${p.kurz}`);
  try {
    const r = await naechsteEinladung(p, "weitergehen");
    const tag =
      r.quelle === "krisen-layer"
        ? "🛟 KRISEN-LAYER (Signposting, kein Modell)"
        : r.quelle === "fallback"
          ? "⚠️  FALLBACK (Modell verstieß 2×)"
          : "🌿 MODELL-EINLADUNG";
    console.log(`\n  ${tag}`);
    console.log("  " + r.einladung.split("\n").join("\n  "));
  } catch (e) {
    console.log(`\n  FEHLER: ${(e as Error).message}`);
  }
}
console.log("\n" + LINIE + "\n");
