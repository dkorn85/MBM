# AI-Engine — Phase-0-Prototyp (dev-only)

Lauffähiger Beweis des **„Claude-in-Claude"-Prinzips** aus `konzept/20_AI-Engine_Architektur.md`:
Nutzerzustand rein → **eine** warme, sichere, persönliche nächste Einladung raus.
**Rein für die Entwicklung — synthetische Daten, keine echten Nutzer, kein Release,
kein Consent-/DPIA-Trigger.** Nicht Teil des App-Builds (`app/` bleibt unberührt).

## Ausführen
```bash
node prototype/ai-engine/run.mjs
```
Braucht die `claude`-CLI im PATH (Print-Modus als LLM-Backend; ersetzt in Phase 1
einen EU-Inferenz-Endpunkt).

## Was es zeigt
- **State → Kontext → Modell → Safety** als eine gekapselte Funktion (`naechsteEinladung`).
- Der **Ton** (Lanas Haltung: Einladung statt Anordnung, ressourcenorientiert, kein Druck)
  und die **Personalisierung** aus den schon vorhandenen lokalen Signalen
  (Selbsttest-Baseline, Loop, Journal, Modul-Fortschritt).
- Der **Safety-Layer** greift: der Krisen-Fall geht gar nicht ans Modell, sondern
  bekommt ein festes Signposting auf „Hilfe"; der Output-Filter blockt
  Heilkunde-/Nocebo-/Druck-Sprache (mit einem Nachbesserungs-Versuch, sonst Fallback).

## Dateien
- `personas.mjs` — synthetische Nutzerzustände (inkl. Krisen-Testfall).
- `system-prompt.mjs` — **die Seele der Engine**: Rolle + Lanas Ton + harte Grenzen. *Hier feilt Lana später mit.*
- `safety.mjs` — Krisen-Erkennung (Eingang) + Output-Filter (Blocklist/Nocebo/Druck/Länge).
- `engine.mjs` — Orchestrator; der Modell-Call ist hinter `rufeModell` gekapselt (in Phase 1 gegen EU-Inferenz tauschen — wie `storage.ts` austauschbar ist).
- `run.mjs` — Demo-Runner.

## Übergabe an Phase 1 (gebundene Einladungs-Schicht in der echten App)
Aus diesem Prototyp wird produktiv:
1. `system-prompt.mjs` + `safety.mjs` → nach `lib/ai-engine/` (mit Lana-Review des Tons).
2. `rufeModell` → EU-Inferenz-Endpunkt (OpenAI EU-Residency/ZDR o. Azure EU / Bedrock EU / Mistral).
3. Davor **zwingend** (research/02): entbündelte Consent-UI je Zweck, DPIA, sichtbarer KI-Hinweis (Art. 50), Krisen-Layer produktiv, Koppelungsverbot (Kernfunktion nicht ans Profiling koppeln).
4. Andockpunkte: nach dem Selbsttest · im „Weitergehen"/Loop · in „Mein Weg" — alles opt-in, überspringbar.
