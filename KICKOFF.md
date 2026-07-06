# KICKOFF — MBM App in Claude Code

## 1. Setup (einmalig, ~1 min)

```bash
git clone https://github.com/dkorn85/MBM.git && cd MBM
mkdir -p .claude/agents
```

Die Wissensbasis liegt bereits im Repo (`wissensfundus/`, `konzept/`), CLAUDE.md und KICKOFF.md ebenfalls im Root.

`.env` (nicht committen — `.gitignore` prüfen):
```
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=...   # mit Lana abstimmen
```

## 2. Subagent für Opus 4.8 — `.claude/agents/builder.md`

```markdown
---
name: builder
description: Implementierungs-Agent für mechanische Aufgaben — Scaffolding, Komponenten nach Spezifikation, CSS/Tailwind, Tests, Refactors, Skripte, Asset-Handling. Für alles nutzen, was eine fertige Spezifikation hat und keine Inhalts-/Architekturentscheidung braucht.
model: claude-opus-4-8
---

Du bist der Builder für die MBM-App. Lies CLAUDE.md im Repo-Root und halte dich strikt daran.

Deine Grenzen:
- Du implementierst Spezifikationen, du triffst keine Architektur- oder Designentscheidungen.
- Du formulierst oder veränderst NIEMALS Nutzertexte (Übungen, Erklärungen, Sicherheitstexte) — du baust sie nur unverändert ein. Fehlt ein Text, markiere die Stelle mit TODO(fable) und melde es zurück.
- Wenn eine Aufgabe unklar ist oder du zweimal am selben Problem scheiterst: stoppen und zurückmelden, nicht raten.

Arbeite in kleinen, benannten Commits. Melde am Ende knapp: was gebaut, was offen, welche TODO(fable)-Stellen.
```

Hauptsession in Claude Code auf **Fable 5** lassen (`/model` prüfen).

## 3. Erster Prompt (in Claude Code einfügen)

```
Lies CLAUDE.md sowie alle Dateien in wissensfundus/ und konzept/ vollständig (Vorrang bei Widerspruch: CLAUDE.md + wissensfundus/, siehe CLAUDE.md §2).

Dann starte die Umsetzung nach dem Phasenplan (§8):
1. Erstelle als Fable die Spezifikationen für P0 und P1 (Design-Tokens, Layout-Shell, Modul-JSON-Schema final, Renderer-Komponenten-Zuschnitt).
2. Delegiere die Implementierung von P0+P1 gebündelt an den builder-Subagenten (Opus 4.8).
3. Überführe währenddessen selbst Modul S1 aus wissensfundus/MBM_Modul_S1_Dein_innerer_Alarm.md in das JSON-Schema (content/modules/s1.json) — Texte wortgetreu, [Pause]-Marker erhalten.
4. Nach Abschluss von P0+P1: Review gegen die Qualitäts-Checkliste (§9), dann kurzer Statusbericht und weiter mit P2.

Modell-Routing aus CLAUDE.md §0 gilt durchgehend: du (Fable) spezifizierst, entscheidest und reviewst; der builder (Opus 4.8) setzt um. Arbeite die Phasen eigenständig durch und melde dich nur bei den offenen Punkten aus §10 oder bei Blockern.
```

## 4. Danach (P2, Audio)

Wenn P0+P1 stehen: `node scripts/generate-audio.mjs s1` erzeugt die MP3s (Skript entsteht in P2). Voice-ID vorher final setzen — das ist der einzige Punkt, der Lanas Entscheidung braucht, bevor Audio produziert wird.
