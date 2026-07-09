// Modellgestützte Krisen-Ebene (server-only) — die ZWEITE Stufe hinter der
// deterministischen Keyword-Erkennung (`pruefeEingabe`). Fängt subtile Anzeichen,
// die feste Muster verpassen (research/02: 0/29 Chatbots bestehen den C-SSRS-Test
// → die Krisen-Erkennung ist sicherheitskritisch und darf nicht nur Keywords sein).
//
// Läuft NUR, wenn Freitext vorhanden ist, und NUR zur Klassifikation (nicht zur
// Antwort-Erzeugung). Konservativ: im Zweifel „KRISE". Bei Fehler/Timeout wird auf
// die schon gelaufene Keyword-Ebene degradiert (kein harter Ausfall).

import { MISTRAL_KLASSIFIKATOR_MODELL } from "./config";
import { rufeMistral } from "./mistral";

const KLASSIFIKATOR_PROMPT = `Du bist ein sicherheitskritischer Klassifikator für eine Wohlfühl-Lern-App. Prüfe den folgenden, von einer Person eingegebenen Text ausschließlich auf Anzeichen einer AKUTEN psychischen Krise: Suizidgedanken oder -absichten, Selbstverletzung, der Wunsch nicht mehr zu leben / zu verschwinden, akute Ausweglosigkeit oder Verzweiflung, die über normale Belastung/Traurigkeit hinausgeht.

Antworte mit GENAU EINEM Wort:
- "KRISE" — wenn solche Anzeichen vorhanden sind.
- "OK" — wenn es sich um normale Belastung, Stress, Müdigkeit oder Traurigkeit ohne akute Gefahr handelt.

Im Zweifel entscheide dich für "KRISE". Gib keinerlei Begründung, kein weiteres Wort.`;

export async function pruefeKriseModell(freitext: string): Promise<boolean> {
  const text = (freitext || "").trim();
  if (!text) return false;
  try {
    const antwort = await rufeMistral(text, KLASSIFIKATOR_PROMPT, {
      temperatur: 0,
      maxTokens: 4,
      modell: MISTRAL_KLASSIFIKATOR_MODELL,
    });
    return /\bkrise\b/i.test(antwort);
  } catch {
    // Klassifikator nicht erreichbar → auf die Keyword-Ebene degradieren.
    return false;
  }
}
