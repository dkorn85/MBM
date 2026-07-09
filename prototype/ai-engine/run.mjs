#!/usr/bin/env node
// Phase-0-Demo: läuft alle synthetischen Personas durch die Engine und zeigt,
// welche nächste Einladung sie erzeugt + was der Safety-Layer sagt.
// Aufruf:  node prototype/ai-engine/run.mjs            (claude-CLI als Backend)
//          node prototype/ai-engine/run.mjs --mistral  (Mistral EU als Backend)

import { personas } from "./personas.mjs";
import { naechsteEinladung, rufeModellClaude } from "./engine.mjs";
import { rufeModellMistral } from "./mistral.mjs";

const LINIE = "─".repeat(72);
const nutzeMistral = process.argv.includes("--mistral");
const backend = nutzeMistral ? rufeModellMistral : rufeModellClaude;
console.log(`Backend: ${nutzeMistral ? "Mistral EU (Large 3)" : "claude-CLI"}`);

for (const p of personas) {
  console.log("\n" + LINIE);
  console.log(`PERSONA: ${p.id}  —  ${p.kurz}`);
  const b = p.baseline || {};
  console.log(
    `  Baseline: Körper ${b.koerper} · Gedanken ${b.gedanken} · Stimmung ${b.stimmung} · Verhalten ${b.verhalten}` +
      (p.anliegen ? `   Anliegen: „${p.anliegen}"` : ""),
  );
  try {
    const r = await naechsteEinladung(p, backend);
    const tag =
      r.quelle === "krisen-layer"
        ? "🛟 KRISEN-LAYER (Signposting, kein Modell)"
        : r.quelle === "fallback"
          ? "⚠️  FALLBACK (Modell verstieß 2×)"
          : "🌿 MODELL-EINLADUNG";
    console.log(`\n  ${tag}`);
    console.log(
      "  " + r.einladung.split("\n").join("\n  "),
    );
    if (r.safety && !r.safety.ok)
      console.log(`\n  [safety] Verstöße: ${JSON.stringify(r.safety.verstoesse)}`);
    else if (r.safety) console.log(`\n  [safety] ok`);
  } catch (e) {
    console.log(`\n  FEHLER: ${e.message}`);
  }
}
console.log("\n" + LINIE + "\n");
