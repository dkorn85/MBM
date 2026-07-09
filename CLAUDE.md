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
- **Audio:** vorproduzierte MP3s in `public/audio/<modulId>/`. Pipeline-Skript `scripts/generate-audio.mjs` (ElevenLabs API, Key + `ELEVENLABS_VOICE_ID` aus `.env` — **entschieden: `hOBDmVrVUuqtp1I3KsIq`**, Modell **`eleven_v3`**, Natural-Stability + etwas langsamer, natürliche Emotion). **v3-Eigenheiten:** kein `previous_text`/`next_text` (nicht unterstützt) und keine SSML-`<break>`-Tags. **Erzähl-Schritte** (funke/warum/…): Pausen über **Ellipsen** im Text, `[längere Pause]` über echte Stille zwischen Chunks. **Erleben-Schritte** tragen ein **`audioSkript` `[{text, pauseSek}]`** → jede Zeile einzeln synthetisiert, danach EXAKT `pauseSek` echte Stille; zusammengefügt per **ffmpeg concat-Filter** (Sample-Domain, 44.1 kHz mono, nahtlos — behebt Tonspur-Sprünge). `sprechtempo:"langsam"` senkt die Speed (0.8 statt 0.9).
- **Kein Backend im MVP.** Später optional Supabase (Accounts, Sync) — Architektur so bauen, dass der Storage-Layer austauschbar ist (ein `storage.ts`-Interface über localStorage).

## 5. Datenmodell (Modul-JSON, Kern) — Stand „Bewegung nach innen"

Maßgeblich ist `lib/module-schema.ts`. Kern:

```ts
type Modul = {
  id: string;              // "alarm", "wo-du-stehst", …
  no: number;              // 1..10 — Position auf dem Weg
  station: "ankommen" | "runterkommen" | "wahrnehmen" | "weit-werden";
  titel: string;
  dauerMin: number;
  voraussetzungen: string[];
  moduleType?: "fundament" | "werkzeug" | "themenwelt" | "integration"; // Backend-Tag, nie sichtbar
  bild?: string;
  schritte: Schritt[];     // genau 6, feste Reihenfolge (s.u.)
};

type Schritt = {
  typ: "funke" | "warum" | "erleben" | "experiment" | "nachspueren" | "weitergehen";
  titel: string;           // Anzeige, z.B. "Verankern" / "Reflektieren"
  strang?: "kopf" | "hand" | "herz" | "alle"; // Kopf·Hand·Herz
  bloecke: TextBlock[];
  audio?: string;
  bild?: string;
  stilleSek?: number;      // Nachspüren: Obergrenze der Pause (Reveal ~4 s + Tap)
  sprechtempo?: "langsam" | "normal"; // nur Audio-Generierung (erleben = langsam)
  audioSkript?: { text: string; pauseSek: number }[]; // nur erleben; NICHT im UI
  interaktionen?: Interaktion[];
  experiment?: { haupt: string; optional?: string }; // optional beim typ "experiment"
};
// TextBlock = { text: string; sichtbarAb?: string }  // sichtbarAb-Block: Gate (lib/gates.ts)
// Interaktion.art: "journal" (frage optional, platzhalter/speichern) | "slider"
//   (skala+speichern = Baseline | vorherNachher) | "auswahl" (Chips) |
//   "auswahl-oder-freitext" (Vorlagen→Feld) | "selbsttest" (Modul 10).
//   `speichern`-Pfade: baseline.<achse> | anliegen | absicht (lib/storage.ts).
```

**Wichtig:** Schritt-Reihenfolge ist **Funke → Warum → Erleben → Verankern (`experiment`) → Reflektieren (`nachspueren`) → Weitergehen** (Lana-Spec; der Validator erzwingt sie). Die alten Typ-Ebenen (Fundament/Werkzeug/…) sind zu unsichtbaren Backend-Tags geworden — sichtbar ist **ein Weg**: 4 Stationen + Loop + Seitenpfad + Horizont. Struktur-Quelle: `konzept/01_App-Struktur_Ebenen-und-Pfade.md` + `konzept/reworked-lana/`.

## 6. Scope (Stand v1 — „Bewegung nach innen")

1. **Landkarte (Home):** ein sichtbarer Weg von oben (dicht/dunkel) nach unten (licht) — 4 Stationen (Ankommen · Runterkommen · Wahrnehmen · Weit werden) mit Shift-Sätzen, Modul-Karten (mit Illustration), Needs-Chips, **Loop-Puls**, **Horizont Gelassenheit**, gegateter Seitenpfad Begegnen.
2. **Modul-Player:** 6 Schritte als geführter Flow; Audio nur wo vorhanden; Reflektieren mit Stille → Journal/Slider; Verankern als merkbare Karte; **Selbsttest** (Modul „Wo du stehst" = Baseline; „Rückblick" = Vorher/Nachher).
3. **Loop (Puls):** täglich Spür-Check · Glücksmoment · Anker — rein lokal, ohne Streak.
4. **Mein Weg:** abgeschlossene Module, Journal, Experimente — rein lokal.
5. **Sicherheit:** Disclaimer beim ersten Start, Krisen-Hinweis app-weit; Selbsttest ist Spiegel, keine Diagnose.
6. **PWA + Deploy** auf Vercel, Lighthouse a11y ≥ 95.

**10 Module (v1):** 1 Willkommen · 2 Wo du gerade stehst · 3 Dein innerer Alarm · 4 Energie ablassen · 5 Zur Ruhe kommen · 6 Kleine Inseln im Tag · 7 Den Körper hören · 8 Gedanken entwirren · 9 Deine eigene Praxis · 10 Rückblick & Weite. Archiviert (nicht auf v1-Weg, in `_archiv/`): f1, f2, t1, t3.

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
- **P7** Umbau auf Lanas „Bewegung nach innen" — 4 Stationen, 10 Module, Loop, Selbsttest/Baseline, v3-Audio, cozy Bildsprache *(Opus)* — erledigt (Branch `umbau/bewegung-nach-innen`); Prod-Deploy nach User-Freigabe.

## 9. Qualitäts-Checkliste (Fable-Review, jede Phase)

- [ ] Alle Nutzertexte im Ton von Modul „Dein innerer Alarm" (einladend, entlastend, nie belehrend)?
- [ ] Nirgends „Hausaufgabe" oder Druck-/Streak-Sprache? („Bremse" ist jetzt OK — Lanas Gas/Bremse-Bild; „Entspannungsantwort" weiterhin gern.)
- [ ] Jede Übung mit Ausstiegs-/Wahlfreiheits-Klausel?
- [ ] Sicherheitsrahmen sichtbar und erreichbar?
- [ ] Alles Optionale wirklich optional (überspringbar ohne Nachteil)?
- [ ] Module rein datengetrieben (neues Modul ohne Code-Änderung möglich)?
- [ ] Mobile-first geprüft, a11y ok, offline-Kern funktioniert?
- [ ] Kein Text, der Diagnose/Heilversprechen impliziert?

## 10. Offene Punkte (nicht raten — fragen)

- ~~ElevenLabs-Voice final~~ → entschieden: `hOBDmVrVUuqtp1I3KsIq`, Modell `eleven_v3` (Natural, langsamer, natürliche Emotion; in `.env`). Vom User per Ohr am Alarm-Modul bestätigt.
- ~~App-Name/Branding~~ → entschieden: **YipYip**, Logo = Appa-inspirierter fliegender Bison (`public/icons/yipyip-bison*.svg`)
- Domain/Ziel-URL nach MVP (Vercel-URL reicht zunächst)
- ~~Module 4 & 5 sind Opus-Entwürfe → Lana-Review ausstehend~~ → **erledigt (08.07.2026):** Lana hat Module **01–06** in überarbeiteter Fassung geliefert (`Download/MBM/reworked lana/…zip`, Schema v2) — sind jetzt Lana-final und komplett neu vertont (alle 36 Audios). Modul 10 (Rückblick) war nicht im Paket, bleibt wie gehabt.
- ~~Bilder-Bibliothek — Lana-Validierung~~ → **teilweise erledigt (09.07.2026):** Lana hat die Bilder der Module **01–06 abgenommen** (Gebrauchsanweisung, vier Fenster, Säbelzahntiger, Reh, Hafen, Insel). Die Bilder zu **07–10 sieht sie erst nach ihrem Text** — feste Reihenfolge: **Lanas Text → Bild → Vertonung**, nie vorziehen.
- ~~ES-16 (Horizont / Modul 10)~~ → **entschieden (09.07.2026): GAR KEIN Fragebogen.** Der Horizont bleibt offene Reflexion ohne Skala — kein Messen, nur Spüren. Auch CHIME/FFMQ-D werden **nicht** eingebaut. Die leeren ES-16-Container gehören ausgebaut, nicht gefüllt. (Nur der 4-Ebenen-Selbsttest bleibt scharf, als Baseline/Vorher-Nachher.)
- ~~Modul 2: die **Absicht** nur eine reflektierende Karte~~ → **entschieden (09.07.2026):** Absicht wird **persistiert und in Modul 10 sanft zurückgespiegelt** („Damals hast du dir das vorgenommen …"), rein lokal.
- **Module 07–10:** Lana überarbeitet sie **voll, wie 01–06**. Bis ihr Text steht: keine Neuvertonung, keine neuen Bilder, Stations-Zuordnung nicht final.
- **Ton der KI-Spiegelung (Phase 2a):** Lanas Korrekturen sind eingearbeitet — die Engine darf **nie behaupten, was die Person kennt/fühlt/erlebt** („Du kennst diesen Moment genau" ist verboten), sie **fragt lieber, als festzustellen**. Ihr Urteil zum aktuellen Stand: „besser, aber noch nicht ganz" → Feinschliff läuft, siehe `konzept/LANA-FRAGEN.md`.
- Deko-Stil: Modul-Bilder als **Recraft-V4-Vektor** (via prompto MCP, `colors` als RGB-Objekte, Hintergrund-Pfad `M 0 0 …` entfernen, „no text" prompten); keine handkodierten Flat-Icons.
