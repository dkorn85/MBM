# 20 · Die AI-Engine — Architektur & Sicherheits-Blaupause

*Start des AI-Engine-Kapitels. Führt die Vision (`00_App-Architektur`), die verifizierten Rechts-/Safety-Leitplanken (`research/02`) und die bestehende App (10 Module, Selbsttest-Baseline, Loop, austauschbarer `storage.ts`) zu einem baubaren Konzept zusammen. Stand 2026-07-08.*

---

## 1 · Worum es geht (die Vision, konkret)

`konzept/00` sagt: **„Die AI-Engine ist der Kern, nicht Deko."** Ziel ist eine Engine, die sich an die Identität der Person anschmiegt und **ehrlich spiegelt** — technisch das **„Claude-in-Claude"-Prinzip**: die App ruft ein Sprachmodell, das den Nutzerzustand aufnimmt und die *nächste Einladung* darauf abstimmt.

**Kein Chatbot um seiner selbst willen.** Es ist eine **adaptive Schicht**, die den bestehenden Weg *persönlich* macht: aus „ein Weg für alle" wird „dein Weg". Der Hebel ist der von der Adhärenz-Forschung stärkste (therapeutische Persuasivität verdoppelt/verdreifacht Abschlussraten) — und zugleich der gefährlichste, weshalb der **Safety-Layer die eigentliche Bau-Arbeit ist**, nicht das Memory (research/02, Punkt 1).

---

## 2 · Leitplanken (nicht verhandelbar — aus `research/02`, verifiziert)

- **Zweck bleibt Bildung/Coaching für Gesunde** — keine Diagnose/Heilung/Linderung. **Sprach-Blocklist** als harte Guardrail: kein „Therapie", keine „Selbstheilungskräfte", keine konkreten (medizinischen) Indikationen, kein Heilversprechen; nocebo-sicher, ressourcenorientiert.
- **Text-only, kein Biometrie-Input** — hält die Engine aus dem AI-Act-Emotionserkennungs-Verbot (Art. 5) heraus.
- **KI-Hinweis** (AI Act Art. 50, ab 02.08.2026): sichtbar „Du interagierst mit einer KI".
- **Abgeleitete Muster = Gesundheitsdaten (DSGVO Art. 9)** → **entbündelte Einwilligung je Zweck** (lokale Analyse · Cloud-Backend · LLM-Aufruf), **Pflicht-DPIA vor Livegang**, **EU-Inferenz** (OpenAI EU-Residency + Zero Data Retention / Azure OpenAI EU / AWS Bedrock EU / Mistral), **Koppelungsverbot** (Kernfunktion nicht an Profiling koppeln).
- **Anti-Sykophantie:** NIE auf Zufriedenheit/„Daumen hoch" optimieren. Ehrliche, nicht bestätigungssüchtige Spiegelung ist Produktversprechen *und* Sicherheitsmechanismus in einem (dokumentierter Schadensmechanismus: Reward-Hacking auf kurzfristiges Nutzerfeedback).
- **Krisen-Layer Pflicht:** Suizid-/Selbstverletzungs-Erkennung → Deeskalation + Signposting (0 von 29 Chatbots bestehen den C-SSRS-Test). Zugleich DSGVO-Schutzmaßnahme + Heilkunde-Schutz (Pausieren + Verweis).
- **Anti-Abhängigkeit** (rote Linie im AI Act Art. 5): keine Suchtmechanik, keine emotionale Bindung als Ziel; fördert reale soziale Kontakte. Passt zum bestehenden „kein Streak, kein Druck".
- **Titration + Erdungs-Abschluss** als Pflichtschritte bei allem, was nach innen geht (Leitplanke 3, Nocebo).

---

## 3 · Architektur — die vier Komponenten

Erprobter Stand der Technik (research/02, Abschnitt 1): **Profil · Memory · Planung · Aktion**. Das Memory-System ist gelöste Technik; die Sicherheit ist das Neue.

### 3.1 Nutzerzustand (Profil / State) — was die Engine liest
Ausschließlich die **schon vorhandenen, lokalen** Signale — nichts Neues abgefragt:
- **Selbsttest-Baseline** (4 Ebenen: Körper/Gedanken/Stimmung/Verhalten) + spätere Nachher-Messung,
- **Loop** (täglicher Spür-Check, Glücksmoment, Anker),
- **Journal-Einträge** (freiwillig), **Modul-Fortschritt/Abschlüsse**, **gemerkte Experimente**.

Daraus **probabilistisch, nie kausal** (Leitplanke 1): Stress-/Stimmungsmuster, und — als *Risiko-Korrelat*, nie Ursachenbehauptung — die Kette **Prägung → Schema → Stressverhalten → Gesundheits*risiko*** (research/01). Ressourcenorientiert gespiegelt.

### 3.2 Memory — Extraktion → Konsolidierung → Retrieval (Mem0-Muster)
Nicht Roh-Logs, sondern **verdichtete, editierbare, löschbare** Erinnerungen. **Der Nutzer sieht und kontrolliert sein Memory** (Transparenz + Löschung = DSGVO-Betroffenenrechte + Vertrauen). Memory bleibt so klein wie möglich (Datensparsamkeit).

### 3.3 Planung / Aktion — der eigentliche LLM-Call
Nimmt State + Memory + aktuellen Kontext → erzeugt **die nächste Einladung**: eine personalisierte, warme Reflexion · das passende nächste Modul/Experiment · ein einzelner berührender Satz. Immer als *Angebot*, nie als Anordnung (Lanas „Einladung statt Anordnung", „folgen statt führen").

### 3.4 Safety-Layer — die eigentliche Bau-Arbeit
Umschließt jeden Call:
- **Input-Seite:** System-Prompt-Constraints (Rolle, Ton, Sprach-Blocklist, Zweckbindung), Titrations-/Fenster-Check.
- **Output-Seite:** Filter gegen Heilversprechen/Diagnose-Sprache/Nocebo-Ladung, Krisen-Erkennung (→ Deeskalation + Signposting statt normaler Antwort), Anti-Sykophantie-Check (spiegelt ehrlich, bestätigt nicht reflexhaft), Erdungs-Abschluss.
- **Nie** auf Nutzer-Feedback optimieren; kein Ranking nach „gefällt".

---

## 4 · Wo die Engine in die App andockt

- **Zustands-Heimat:** der `storage.ts`-Layer ist bereits als Interface austauschbar gebaut → **Supabase/Backend** als optionale Cloud-Heimat (mit entbündelter Consent + EU-Hosting). Lokal-first bleibt der Default; Cloud/Engine ist ein Opt-in.
- **Andockpunkte (alle opt-in, überspringbar, kein Zwang):**
  - nach dem **Selbsttest** (Modul 2): eine personalisierte, ressourcenorientierte erste Einladung statt einer generischen,
  - im **„Weitergehen"** / im **Loop**: die adaptive nächste Einladung (passendes Modul/Experiment),
  - in **„Mein Weg"**: eine warme Spiegelung des zurückgelegten Wegs (nie bewertend).

---

## 5 · Phasen-Vorschlag

- **Phase 0 — Prototyp (dev-only, synthetische Daten):** der „Claude-in-Claude"-Call + Safety-Layer gegen *synthetische* Zustände. Validiert die Mechanik und den Ton **ohne echte Nutzerdaten, ohne Consent-/DPIA-Trigger, ohne Release**. Kein Rechtsrisiko, schneller Erkenntnisgewinn.
- **Phase 1 — gebundene Einladungs-Schicht (erste echte Ausbaustufe):** personalisierte Reflexion + passender nächster Schritt aus dem lokalen State. Niedrigschwellig, gebunden. Voraussetzungen: entbündelte **Consent-UI**, **DPIA**, **EU-Inferenz**, **KI-Hinweis**, **Krisen-Layer**.
- **Phase 2 — dialogischer Spiegel (volle Vision):** freier Text ↔ Engine spiegelt Muster und stimmt Einladungen ab. Höchste Safety-Last (Krise, Anti-Sykophantie, Anti-Abhängigkeit voll tragend), Backend + Accounts.

---

## 6 · Offene Entscheidungen (→ User/Lana)

1. **Ambition der ersten Ausbaustufe:** Phase 1 (gebundene Einladungs-Schicht) zuerst — oder direkt Richtung Phase 2 (dialogischer Spiegel)?
2. **Prototyp jetzt?** Phase 0 (dev-only, synthetisch) bauen, um die Mechanik + den Ton früh zu sehen?
3. **LLM-Anbieter mit EU-Inferenz:** OpenAI EU-Residency/ZDR · Azure OpenAI EU · AWS Bedrock EU · Mistral — Modell-Tier, Kosten, Latenz.
4. **Wann Accounts/Backend** (bisher rein lokal) — das ist die Schwelle, ab der Consent-Architektur + DPIA greifen müssen.
5. **Lanas Ton-Vorgabe** für die Spiegelung: ihre „Bilder-Bibliothek" + Prinzipien (Einladung statt Anordnung, folgen statt führen, so tief wie tragbar) als Grundlage des System-Prompts — Lana sollte den Engine-Ton mitprägen.

---

*Tragendes Prinzip: **Die Engine macht den bestehenden Weg persönlich, indem sie den lokalen Zustand ehrlich und nocebo-sicher spiegelt und die nächste Einladung abstimmt — der Safety-Layer (Sprach-Guardrails, Krise, Anti-Sykophantie, Anti-Abhängigkeit) ist der Kern der Arbeit, EU-Inferenz + entbündelte Consent + DPIA der rechtliche Rahmen, und alles bleibt Angebot, nie Anordnung.***
