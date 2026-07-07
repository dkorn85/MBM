# Spec P3 — storage.ts, Persistenz der Interaktionen, Experiment-Karten, „Mein Weg"

*Autor: Fable. Umsetzung: builder. Gleiche Regeln wie in p0-p1.md — alle sichtbaren Texte wörtlich von hier.*

## `lib/storage.ts` — austauschbarer Storage-Layer

Ein Interface + eine localStorage-Implementierung (Namespace `mbm.v1.`). Kein Zugriff auf `localStorage` außerhalb dieser Datei. SSR-sicher (`typeof window`-Guard; auf dem Server No-Op/leer).

```ts
export type ModulStatus = "offen" | "begonnen" | "abgeschlossen";
export type JournalEintrag = { modulId: string; frage: string; text: string; erstellt: string }; // ISO-Datum
export type SpuerWert = { modulId: string; wann: "vorher" | "nachher"; wert: number; erstellt: string }; // 0–10
export type AktivesExperiment = { modulId: string; titel: string; haupt: string; optional?: string; gemerkt: string };

export interface MbmStorage {
  getModulStatus(modulId: string): ModulStatus;
  setModulStatus(modulId: string, status: ModulStatus): void;
  getAbgeschlossene(): string[];
  getJournal(): JournalEintrag[];
  addJournal(eintrag: JournalEintrag): void;
  getSpuerWerte(modulId: string): SpuerWert[];
  setSpuerWert(wert: SpuerWert): void;   // überschreibt gleichen (modulId, wann)
  getExperimente(): AktivesExperiment[];
  merkeExperiment(experiment: AktivesExperiment): void;
  entferneExperiment(modulId: string): void;
  istDisclaimerGesehen(): boolean;
  setDisclaimerGesehen(): void;
}

export const storage: MbmStorage; // localStorage-Implementierung
```

Für Reaktivität innerhalb einer Seite genügt lokaler React-State; nach Schreibvorgängen zusätzlich ein `CustomEvent("mbm:storage")` auf `window` dispatchen, damit z.B. die Home-Seite aktualisieren kann.

## Verhalten im Modul-Player

- Beim ersten Anzeigen eines Moduls: Status `offen` → `begonnen`.
- Beim Erreichen des Schritts `weitergehen`: Status → `abgeschlossen`. Keine Meldung, kein Konfetti — der Status ist still.
- **JournalFeld:** bekommt einen Button `Festhalten` (nur aktiv bei nicht-leerem Text). Nach dem Speichern dezente Bestätigung: `Festgehalten. Bleibt nur auf deinem Gerät.` Der Text bleibt im Feld editierbar; erneutes Festhalten legt einen neuen Eintrag an.
- **SpuerRegler:** speichert beim Loslassen (change-Event) still via `setSpuerWert` — im `erleben`-Schritt als `wann: "vorher"`, im `nachspueren`-Schritt als `wann: "nachher"`. Keine Bestätigung.
- **Vorher/Nachher-Anzeige** (im `nachspueren`-Schritt, unterhalb des Reglers, nur wenn beide Werte existieren): eine ruhige horizontale Linie mit zwei kleinen Punkten und den Beschriftungen `vorhin` und `jetzt` an den Punkten. Keine Zahlen, keine Bewertung, kein Text wie „besser/schlechter".
- **ExperimentKarte:** Button `Experiment merken`. Nach dem Merken: Button wird zu `Nicht mehr merken`, darüber dezente Zeile `Gemerkt — du findest es auf der Startseite.`

## Home-Erweiterung

- Wenn gemerkte Experimente existieren: eigene Sektion **über** der Landkarte, Überschrift `Dein Experiment` (bei mehreren: `Deine Experimente`). Je Experiment die bekannte Karte (haupt + optional), darunter Link `Zum Modul` → `/modul/{modulId}` und Button `Nicht mehr merken`.
- Landkarte: Module mit Status `abgeschlossen` bekommen einen dezenten Chip `abgeschlossen` (Salbei-Ton, kein Haken-Feuerwerk). Karte bleibt normal verlinkt.

## `/mein-weg` (ersetzt den P1-Platzhalter; Einleitungstext bleibt)

Drei Sektionen, jede mit eigenem Leerzustand:

1. **`Abgeschlossene Module`** — Liste (Titel + Thema, verlinkt). Leer: `Noch keins — und das ist völlig in Ordnung.`
2. **`Deine Notizen`** — Journal-Einträge, neueste zuerst: Datum (z.B. „6. Juli 2026"), Modul-Titel, die Frage dezent, darunter der Text. Leer: `Hier erscheinen deine festgehaltenen Gedanken.`
3. **`Deine Experimente`** — die gemerkten Experiment-Karten wie auf der Startseite. Leer: `Wenn du ein Experiment merkst, findest du es hier und auf der Startseite.`

Der globale Leerzustand-Satz aus P1 (`Noch ist hier nichts — und das ist völlig in Ordnung.`) entfällt zugunsten der Sektions-Leerzustände.

## Verifikation

1. Modul durchlaufen → unter „Mein Weg" erscheint es als abgeschlossen; Journal-Eintrag nach `Festhalten` sichtbar; Regler-Werte erzeugen die Vorher/Nachher-Anzeige; Experiment merken → Karte auf Home und in Mein Weg; `Nicht mehr merken` entfernt beides.
2. Reload: alles bleibt erhalten. Anderes Browserprofil/Inkognito: leer (rein lokal).
3. `npm run build` + `lint` grün. Alles weiterhin ohne Account, ohne Netz-Requests.
