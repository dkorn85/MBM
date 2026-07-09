// Zentrale Schalter der AI-Engine.
//
// SICHERHEITS-GATE: Die Engine ist standardmäßig AUS (Privacy by Design). Sie wird
// erst sichtbar/aktiv, wenn NEXT_PUBLIC_ENGINE_ENABLED="true" gesetzt ist UND (für
// echte Calls) serverseitig MISTRAL_API_KEY vorliegt. So kann der komplette Stack
// gebaut & deployt werden, ohne dass in Produktion echte Nutzerdaten verarbeitet
// werden — bis das Go-Live-Gate (DPIA fertig, ZDR/Scale-Plan, Lana-Ton) bewusst
// geöffnet wird. Siehe konzept/21 + konzept/22_DPIA.md (DPIA, freigegeben).
export const ENGINE_ENABLED =
  process.env.NEXT_PUBLIC_ENGINE_ENABLED === "true";

// Eigenes Gate für Phase 2a (dialogischer Spiegel + lokales Memory) — getrennt von
// Phase 1, damit die live Alpha unberührt bleibt und der Dialog erst bewusst
// aktiviert wird. Default AUS. Siehe konzept/23.
export const DIALOG_ENABLED =
  process.env.NEXT_PUBLIC_DIALOG_ENABLED === "true";

// EU-Inferenz: Mistral (Frankreich) — kein Drittland-Transfer, kein Training auf
// Kundendaten. Large 3 = beste Ton-Qualität (konzept/21).
export const MISTRAL_MODELL = "mistral-large-latest";

// Günstiges, schnelles Modell für den sicherheitskritischen Krisen-Klassifikator
// (binäre Entscheidung — braucht keine Ton-Qualität). Small 3.
export const MISTRAL_KLASSIFIKATOR_MODELL = "mistral-small-latest";

// Memory-Extraktion braucht echtes Sprachverständnis: Small liefert selbst bei
// klaren Ressourcen-Aussagen durchgängig eine leere Liste (verifiziert), Medium
// destilliert zuverlässig und bleibt bei nichtssagenden Turns korrekt still.
export const MISTRAL_EXTRAKT_MODELL = "mistral-medium-latest";

// Sichtbarer KI-Hinweis (AI Act Art. 50, ab 02.08.2026) — überall dort zeigen,
// wo eine Engine-Ausgabe erscheint.
export const KI_HINWEIS = "Diese Spiegelung kommt von einer KI (Mistral, EU) — kein Mensch, keine Diagnose.";
