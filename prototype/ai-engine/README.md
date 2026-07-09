# AI-Engine — Dev-Harness (dünn, über der Produktion)

Die produktive Engine lebt in **`lib/ai-engine/`** (+ Route `app/api/einladung`).
Dieses Verzeichnis ist nur noch ein **dünner Dev-Harness darüber** — es gibt
**keine Logik-Kopie mehr** (früher lagen hier Duplikate von safety/engine/…).

## Ausführen
```bash
npm run eval:safety        # Red-Team der Guardrails gegen lib/ai-engine/safety.ts (kein Netz)
MISTRAL_API_KEY=… npm run demo:engine   # Live-Demo der echten Pipeline (Mistral EU)
```
(Beides via `tsx`, damit Node die TS-Quelle aus `lib/` direkt importiert.)

## Dateien
- `eval.ts` — **Eval-/Red-Team-Harness**, importiert und testet die EINZIGE
  produktive Safety-Quelle `lib/ai-engine/safety.ts` (20 deterministische Checks:
  jede Verstoß-Art feuert · gute Einladungen ohne Fehlalarm · Krise erkannt, bloße
  Gedrücktheit nicht). CI-tauglich (Exit-Code).
- `run.ts` — **Live-Demo**: schickt synthetische Personas durch die echte
  `naechsteEinladung` (Safety + Krisen-Layer + Mistral EU) — exakt der App-Code.
- `personas.mjs` — synthetische Nutzerzustände (inkl. Krisen-Testfall).

## Warum so
- **Single Source of Truth:** Safety/Ton/Orchestrierung existieren nur in `lib/` →
  kein Drift zwischen Prototyp und Produktion. Das Harness bewacht den echten Code.
- **Kein Rechts-Trigger:** rein synthetische Daten, kein Release; `prototype/` ist
  aus dem App-Build/Typecheck ausgeschlossen (`tsconfig` exclude).

## Produktions-Verortung (Stand: umgesetzt)
- `lib/ai-engine/`: `config` · `system-prompt` · `types` · `safety` · `context` ·
  `mistral` · `krise-modell` · `einladung` · `zustand-sammeln` · `ratelimit`.
- `app/api/einladung/route.ts` — stateless, feature-gated, rate-limited.
- `components/ai/EngineEinladung.tsx` — entbündeltes Consent → Einladung → KI-Hinweis.
- Rechtsrahmen & Go-Live-Gate: `konzept/21` (Entscheidungen), `konzept/22_DPIA.md`.
