# AI-Engine — Phase-0-Prototyp (dev-only)

Lauffähiger Beweis des **„Claude-in-Claude"-Prinzips** aus `konzept/20_AI-Engine_Architektur.md`:
Nutzerzustand rein → **eine** warme, sichere, persönliche nächste Einladung raus.
**Rein für die Entwicklung — synthetische Daten, keine echten Nutzer, kein Release,
kein Consent-/DPIA-Trigger.** Nicht Teil des App-Builds (`app/` bleibt unberührt).

## Ausführen
```bash
node prototype/ai-engine/eval.mjs           # Safety-Guardrails testen (kein Netz, kostenlos)
node prototype/ai-engine/run.mjs            # Demo mit claude-CLI als Backend
node prototype/ai-engine/run.mjs --mistral  # Demo mit Mistral EU (Large 3)
```
Der Mistral-Modus braucht `MISTRAL_API_KEY` in der Env (oder — nur dev — die lokale
`.mistral`-Datei). `run.mjs` ohne Flag braucht die `claude`-CLI im PATH.

## Was es zeigt
- **State → Kontext → Modell → Safety** als eine gekapselte Funktion (`naechsteEinladung`,
  async, mit **austauschbarem Backend** — claude-CLI oder Mistral EU).
- Der **Ton** (Lanas Haltung: Einladung statt Anordnung, ressourcenorientiert, kein Druck)
  und die **Personalisierung** aus den schon vorhandenen lokalen Signalen
  (Selbsttest-Baseline, Loop, Journal, Modul-Fortschritt).
- Der **Safety-Layer** greift: der Krisen-Fall geht gar nicht ans Modell, sondern
  bekommt ein festes Signposting auf „Hilfe"; der Output-Filter blockt Heilkunde-,
  Nocebo-, Druck-, **Sykophantie-** und **Vermenschlichungs-/Abhängigkeits-**Sprache
  (mit einem Nachbesserungs-Versuch, sonst Fallback).
- `eval.mjs` **beweist** das deterministisch: 18 Guardrail-Checks (jede Verstoß-Art
  feuert · gute Einladungen lösen keinen Fehlalarm aus · Krise erkannt, bloße
  Gedrücktheit nicht) — CI-tauglich (Exit-Code).

## Dateien
- `personas.mjs` — synthetische Nutzerzustände (inkl. Krisen-Testfall).
- `system-prompt.mjs` — **die Seele der Engine**: Rolle + Lanas Ton + harte Grenzen. *Hier feilt Lana später mit.*
- `safety.mjs` — Krisen-Erkennung (Eingang) + Output-Filter (Heilkunde/Nocebo/Druck/Sykophantie/Vermenschlichung/Länge).
- `mistral.mjs` — **stateless Mistral-Backend (EU-Inferenz), route-portabel** — wird in Phase 1 zu `app/api/einladung`.
- `engine.mjs` — Orchestrator; Modell-Call hinter injizierbarer Funktion (Default claude-CLI, alternativ Mistral).
- `eval.mjs` — **Eval-/Red-Team-Harness** für die Guardrails (deterministisch, ohne Netz).
- `run.mjs` — Demo-Runner (Backend-Schalter `--mistral`).

## Übergabe an Phase 1 (gebundene Einladungs-Schicht in der echten App)
Aus diesem Prototyp wird produktiv (Entscheidungen: siehe `konzept/21`):
1. `system-prompt.mjs` + `safety.mjs` → nach `lib/ai-engine/` (mit Lana-Review des Tons).
2. `mistral.mjs` → `app/api/einladung/route.ts` (**Anbieter entschieden: Mistral EU**; Key aus Vercel-Env, ZDR/Scale-Plan vor Go-Live).
3. Davor **zwingend** (research/02): entbündelte Consent-UI je Zweck, DPIA, sichtbarer KI-Hinweis (Art. 50), Krisen-Layer produktiv, Koppelungsverbot (Kernfunktion nicht ans Profiling koppeln).
4. Andockpunkte: nach dem Selbsttest · im „Weitergehen"/Loop · in „Mein Weg" — alles opt-in, überspringbar.
