// Stateless Mistral-Call (EU-Inferenz). NUR serverseitig verwenden (Route) — der
// Key darf nie ins Client-Bundle. Kein Speichern: nimmt Kontext, gibt Text zurück.
//
// Anbieterwahl siehe konzept/21: Mistral = EU-Anbieter, kein Drittland-Transfer,
// trainiert nicht auf Kundendaten. Vor echtem Go-Live: ZDR/Scale-Plan aktivieren.

import { MISTRAL_MODELL } from "./config";

const ENDPOINT = "https://api.mistral.ai/v1/chat/completions";

export async function rufeMistral(
  kontext: string,
  systemPrompt: string,
  {
    temperatur = 0.7,
    maxTokens = 400,
    modell = MISTRAL_MODELL,
  }: { temperatur?: number; maxTokens?: number; modell?: string } = {},
): Promise<string> {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) throw new Error("MISTRAL_API_KEY nicht gesetzt");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: modell,
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
  const text: string | undefined = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Mistral-Call: leere Antwort");
  return text;
}
