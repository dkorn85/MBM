# CLAUDE.md — MBM Lernprogramm („Gebrauchsanweisung zum Menschsein")

Du baust die Selbstlern-App für Lanas Mind-Body-Medizin-Programm. Dieses Dokument ist dein Master-Prompt und gilt für die gesamte Arbeit im Repo.

---

## 0. Modell-Routing (zuerst lesen, immer anwenden)

**Hauptsession = Claude Fable 5 = Spezialist & Supervisor.** Fable macht ausschließlich:
- Architektur- und Designentscheidungen
- Alle Modul-Inhalte, Übungstexte, psychoedukative Texte, Sicherheitstexte (schreiben UND freigeben)
- Review/Abnahme jeder Phase gegen die Qualitäts-Checkliste (§9)
- Debugging, wenn ein Subagent zweimal gescheitert ist

**Subagenten = Claude Opus 4.8 = Umsetzung.** Alles Mechanische wird per Task-Tool an Opus-Subagenten delegiert (Agent-Definition in `.claude/agents/builder.md`, `model: claude-opus-4-8`):
- Scaffolding, Boilerplate, Komponenten nach fertiger Spezifikation
- CSS/Tailwind-Umsetzung nach Design-Tokens
- Tests, Refactors, Lint-Fixes, Asset-Handling, Skripte

**Budget-Regeln:**
1. Fable schreibt Spezifikationen, Opus implementiert sie. Fable implementiert nie selbst, was Opus kann.
2. Mechanische Aufgaben bündeln — ein Subagent-Call mit 5 Komponenten statt 5 Calls.
3. Kein Text, der die Psyche der Nutzer:innen berührt (Übungen, Erklärungen, Sicherheit), verlässt das Repo ohne Fable-Review. Opus darf solche Texte einbauen, aber nie formulieren oder verändern.
4. Bei Unsicherheit, ob eine Aufgabe „mechanisch" ist: Fable entscheidet kurz, delegiert dann.

---

## 1. Mission

Lanas MBM-Wissen in ein modulares, niedrigschwelliges Selbstlernprogramm gießen: Web-App (PWA, mobile-first, Deutsch), in der Menschen Module durchlaufen — Verstehen → Erleben → Alltag. Kein Therapie-Ersatz, sondern Bildung: das nie gelehrte Betriebshandbuch des eigenen Körper-Geist-Systems.

## 2. Wissensbasis (Single Source of Truth)

**Quelle ist das GitHub-Repo `dkorn85/MBM`** (https://github.com/dkorn85/MBM) — die App wird direkt in diesem Repo gebaut. **Vor jeder inhaltlichen Arbeit lesen:**

- `wissensfundus/MBM_Wissensgrundlage_und_modulares_Lernsystem.md` — Forschung + 4-Ebenen-Architektur + Modul-Landkarte
- `wissensfundus/MBM_Referenzblaetter_Lanas_Praxiswissen-1.md` — Lanas Prinzipien, Bilder-Bibliothek, Ankommens-Sequenz, „Experimente für Zuhause"
- `wissensfundus/MBM_Modul_S1_Dein_innerer_Alarm.md` — das fertige Referenzmodul; **verbindliche Vorlage** für Ton, Aufbau und Tiefe aller weiteren Module
- `wissensfundus/Schattenarbeit_Deep_Research_Uebungen_App.md` — Recherche für spätere Module (Ebene 2/3), inkl. Sicherheitsrahmen
- `konzept/` — frühere Konzeptdokumente; wo sie dieser CLAUDE.md oder den Wissensfundus-Dateien widersprechen, gilt **CLAUDE.md + Wissensfundus** (insbesondere: `konzept/02_Modul-Blaupause_Dein-innerer-Alarm.md` ist eine ältere S1-Fassung — maßgeblich ist die Version im Wissensfundus)

Bei Widerspruch zwischen Code-Bequemlichkeit und Wissensbasis gewinnt die Wissensbasis.

## 3. Nicht verhandelbar

- **Einladung statt Anordnung.** Keine Streaks, keine Schuld-Mechaniken, keine „verpasst!"-Notifications. Wortwahl: „Experimente für Zuhause", nie „Hausaufgaben".
- **Begriff „Entspannungsantwort"** (nie „Bremse") in allen Nutzertexten.
- **Sechs-Schritt-Format** jedes Moduls: Funke → Warum (themenpassendes Bild aus der Bilder-Bibliothek) → Erleben → Nachspüren (erst Stille, dann offene Frage) → Experiment für Zuhause (EIN Haupt-Experiment, optional erweiterbar) → Weitergehen.
- **Ankommens-Prinzip** in Übungen: von außen nach innen (sehen mit offenen Augen → Augen dürfen sich schließen → hören → Unterlage → Körper von oben nach unten → Atem), nur so tief wie tragbar, eingebaute Wahlfreiheit („du bestimmst, was dir guttut").
- **Sicherheitsrahmen:** Bildung ≠ Therapie (sichtbarer Disclaimer), Krisen-Signposting app-weit erreichbar, Ausstiegs-Hinweis in jeder Übung, keine Heilversprechen, keine Diagnosen.
- **Kein Tracking-Druck:** Fortschritt wird angezeigt, nie eingefordert. Reflexionsfelder immer optional.
- **Datensparsamkeit:** MVP komplett lokal (localStorage), kein Account-Zwang, DSGVO-sauber (Fonts self-hosted, kein Third-Party-Tracking).

## 4. Tech-Stack & Deployment

- **Next.js 15 (App Router) + Tailwind**, TypeScript. Deployment: **Vercel** (Muster: prompto-studio).
- **PWA:** installierbar, Kernmodule offline (Texte + Audio precached via Service Worker).
- **Inhalte als Daten, nicht als Code:** Module liegen als JSON in `content/modules/*.json` (Schema §5). Der Modul-Renderer ist generisch — neue Module = neue JSON + Audio, kein neuer Code.
- **Audio:** vorproduzierte MP3s in `public/audio/<modulId>/`. Pipeline-Skript `scripts/generate-audio.mjs` (ElevenLabs API, Key aus `.env`, `ELEVENLABS_VOICE_ID` aus `.env` — **entschieden: v3V1d2rk6528UrLKRuy8**). Lange Skripte chunken mit `previous_text`/`next_text` für Stimmkontinuität; `[Pause]`/`[längere Pause]`-Marker → `<break>`-Tags bzw. Chunk-Grenzen (1,2s / 2,5s).
- **Kein Backend im MVP.** Später optional Supabase (Accounts, Sync) — Architektur so bauen, dass der Storage-Layer austauschbar ist (ein `storage.ts`-Interface über localStorage).

## 5. Datenmodell (Modul-JSON, Kern)

```ts
type Module = {
  id: string;              // "s1"
  ebene: 0 | 1 | 2 | 3;
  thema: string;           // "Stress"
  titel: string;           // "Dein innerer Alarm"
  dauerMin: number;
  voraussetzungen: string[];
  schritte: [Funke, Warum, Erleben, Nachspueren, Experiment, Weitergehen];
};

type Schritt = {
  typ: "funke" | "warum" | "erleben" | "nachspueren" | "experiment" | "weitergehen";
  bloecke: TextBlock[];    // vorlesbarer Text, absatzweise
  audio?: string;          // Pfad zur MP3
  interaktion?: Interaktion; // z.B. { art: "journal" } | { art: "slider", label: "angespannt ↔ entspannt", vorherNachher: true }
  experiment?: { haupt: string; optional?: string }; // nur bei typ "experiment"
};
```

Modul S1 aus `wissensfundus/` als erstes in dieses Schema überführen (Fable macht die Überführung, Opus baut den Renderer).

## 6. MVP-Scope (Definition of Done)

1. **Home:** ruhiger Einstieg, Modul-Landkarte (4 Ebenen), S1 aktiv, weitere als „bald" ausgegraut.
2. **Modul-Player:** die 6 Schritte als geführter Flow; Audio-Player (Play/Pause, Fortschritt, Hintergrund-fähig); Text mitlesbar; Nachspüren mit optionalem Journalfeld + Vorher/Nachher-Regler; Experiment als merkbare Karte (vom Home aus wieder aufrufbar).
3. **Mein Weg:** abgeschlossene Module, Journal-Einträge, aktive Experimente — rein lokal.
4. **Sicherheit:** Disclaimer beim ersten Start, Krisen-Hinweis im Footer/Menü.
5. **PWA + Deploy** auf Vercel, Lighthouse a11y ≥ 95.

## 7. Design-Richtung

Ruhig, warm, viel Raum. Warmes Off-White, Salbei/Sand-Töne, eine warme Akzentfarbe; große, ruhige Typo (self-hosted); sanfte Übergänge, nichts blinkt, nichts drängt. Fühlbar: „hier darf ich langsam sein." Kein Gamification-Look, keine Konfetti. Dark Mode: gedämpft warm, nicht tiefschwarz-neon.

## 8. Arbeitsweise & Phasen

Committe klein und benannt (`feat: modul-renderer schritt-navigation`). Nach jeder Phase: Fable-Review gegen §9, erst dann weiter.

- **P0** Scaffold + Design-Tokens + Layout-Shell *(Opus)*
- **P1** Modul-Schema + generischer 6-Schritt-Renderer *(Spez: Fable → Bau: Opus)*
- **P2** S1-Inhalt als JSON + Audio-Pipeline-Skript *(Inhalt: Fable → Pipeline/Einbau: Opus)*
- **P3** Journal, Slider, Experiment-Karten, „Mein Weg", storage.ts *(Opus)*
- **P4** Sicherheits-Layer, Onboarding-Disclaimer *(Texte: Fable → Einbau: Opus)*
- **P5** PWA, Offline-Precache, Vercel-Deploy *(Opus)*
- **P6** Gesamt-QA *(Fable)*

## 9. Qualitäts-Checkliste (Fable-Review, jede Phase)

- [ ] Alle Nutzertexte im Ton von Modul S1 (einladend, entlastend, nie belehrend)?
- [ ] „Entspannungsantwort" konsistent; nirgends „Hausaufgabe", „Bremse", Druck-Sprache?
- [ ] Jede Übung mit Ausstiegs-/Wahlfreiheits-Klausel?
- [ ] Sicherheitsrahmen sichtbar und erreichbar?
- [ ] Alles Optionale wirklich optional (überspringbar ohne Nachteil)?
- [ ] Module rein datengetrieben (neues Modul ohne Code-Änderung möglich)?
- [ ] Mobile-first geprüft, a11y ok, offline-Kern funktioniert?
- [ ] Kein Text, der Diagnose/Heilversprechen impliziert?

## 10. Offene Punkte (nicht raten — fragen)

- ~~ElevenLabs-Voice final~~ → entschieden: `v3V1d2rk6528UrLKRuy8` (in `.env`)
- ~~App-Name/Branding~~ → entschieden: **YipYip**, Logo = Appa-inspirierter fliegender Bison (eigenständige Gestaltung, `public/icons/yipyip-bison.svg`)
- Domain/Ziel-URL nach MVP (Vercel-URL reicht zunächst)
