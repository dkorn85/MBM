// Stateless Mistral-Backend (EU-Inferenz) für die AI-Engine — route-portabel.
// In Produktion wandert exakt diese Logik nach app/api/einladung/route.ts; dort
// kommt der Key aus der Vercel-Env (MISTRAL_API_KEY) statt aus der lokalen Datei,
// und die Route bleibt stateless (nimmt State, gibt Einladung, speichert nichts).
//
// Warum Mistral: EU-Anbieter (Frankreich), kein Drittland-Transfer, trainiert nicht
// auf Kundendaten, ZDR verfügbar (Scale-Plan) — siehe konzept/21. Dev-only Prototyp:
// synthetische Daten, kein Rechts-Trigger.

import { readFileSync } from "node:fs";
import { SYSTEM_PROMPT } from "./system-prompt.mjs";

const ENDPOINT = "https://api.mistral.ai/v1/chat/completions";
const MODELL = "mistral-large-latest"; // Large 3 (konzept/21: beste Ton-Qualität)

// Key aus MISTRAL_API_KEY oder — nur im Dev-Prototyp — aus der lokalen .mistral-Datei
// (liegt außerhalb der Git-Repos). In Produktion NUR die Env-Variante.
function ladeKey() {
  if (process.env.MISTRAL_API_KEY) return process.env.MISTRAL_API_KEY.trim();
  for (const p of [
    "/storage/self/primary/Download/MBM/.mistral",
    "/root/MBM/MBM/.env.mistral",
  ]) {
    try {
      const roh = readFileSync(p, "utf8").trim();
      const k = roh.startsWith("MISTRAL_API_KEY=") ? roh.split("=")[1].trim() : roh;
      if (k) return k;
    } catch {}
  }
  throw new Error(
    "Kein Mistral-Key gefunden (setze MISTRAL_API_KEY oder lege die .mistral-Datei an).",
  );
}

// Roher Call: (kontext, systemPrompt) → Text. Wirft bei HTTP-/Leer-Fehlern.
export async function rufeMistral(
  kontext,
  systemPrompt,
  { temperatur = 0.7, maxTokens = 400 } = {},
) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ladeKey()}`,
    },
    body: JSON.stringify({
      model: MODELL,
      temperature: temperatur,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: kontext },
      ],
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Mistral-Call ${res.status}: ${t.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Mistral-Call: leere Antwort");
  return text;
}

// Adapter für die Engine (Signatur `(kontext) => Promise<string>`): schließt den
// System-Prompt ein, damit `naechsteEinladung(persona, rufeModellMistral)` läuft.
export const rufeModellMistral = (kontext) => rufeMistral(kontext, SYSTEM_PROMPT);
