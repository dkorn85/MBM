// Zentrale Schalter der AI-Engine.
//
// SICHERHEITS-GATE: Die Engine ist standardmäßig AUS (Privacy by Design). Sie wird
// erst sichtbar/aktiv, wenn NEXT_PUBLIC_ENGINE_ENABLED="true" gesetzt ist UND (für
// echte Calls) serverseitig MISTRAL_API_KEY vorliegt. So kann der komplette Stack
// gebaut & deployt werden, ohne dass in Produktion echte Nutzerdaten verarbeitet
// werden — bis das Go-Live-Gate (DPIA fertig, ZDR/Scale-Plan, Lana-Ton) bewusst
// geöffnet wird. Siehe konzept/21 + konzept/22 (DPIA-Entwurf).
export const ENGINE_ENABLED =
  process.env.NEXT_PUBLIC_ENGINE_ENABLED === "true";

// EU-Inferenz: Mistral (Frankreich) — kein Drittland-Transfer, kein Training auf
// Kundendaten. Large 3 = beste Ton-Qualität (konzept/21).
export const MISTRAL_MODELL = "mistral-large-latest";

// Sichtbarer KI-Hinweis (AI Act Art. 50, ab 02.08.2026) — überall dort zeigen,
// wo eine Engine-Ausgabe erscheint.
export const KI_HINWEIS = "Diese Spiegelung kommt von einer KI (Mistral, EU) — kein Mensch, keine Diagnose.";
