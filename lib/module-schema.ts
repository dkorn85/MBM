// Datenmodell der YipYip-Lern-App — „Bewegung nach innen".
//
// Sichtbar ist EIN Weg: vier Stationen (Ankommen → Runterkommen → Wahrnehmen →
// Weit werden), dazu Loop (Puls), Seitenpfad (Begegnen) und Horizont
// (Gelassenheit). Die alten Typ-Kategorien (Fundament/Werkzeug/…) leben nur
// noch als unsichtbare Backend-Tags weiter.

// ── Schritt-Ebene ────────────────────────────────────────────────────

// Reihenfolge im Modul: Funke → Warum → Erleben → Verankern → Reflektieren →
// Weitergehen. Die Typ-Schlüssel `experiment`/`nachspueren` bleiben (tragen
// Sonderfelder), die Anzeige-Titel heißen "Verankern"/"Reflektieren".
export type SchrittTyp =
  | "funke"
  | "warum"
  | "erleben"
  | "experiment"
  | "nachspueren"
  | "weitergehen";

// Kopf · Hand · Herz — durch jedes Modul gewebt (ein Strang je Schritt).
export type Strang = "kopf" | "hand" | "herz" | "alle";

export type TextBlock = {
  text: string;
  // Gate-ID (z.B. "begegnen-teaser"): Block bleibt versteckt, bis das Gate in
  // lib/gates.ts aktiv ist. Ohne Feld immer sichtbar.
  sichtbarAb?: string;
};

// Eine Achse des Selbsttests (Modul „Wo du gerade stehst"): ein benannter
// Regler, Label im Format "links ↔ rechts".
export type SelbsttestAchse = { schluessel: string; label: string };

// Eine Zeile der Audio-Vorlage eines Erleben-Schritts: gesprochener Satz plus
// die Stille (Sekunden) DANACH. Wird nur vom Audio-Generator gelesen, nie im UI.
export type AudioSkriptZeile = { text: string; pauseSek: number };

// `speichern` (auf mehreren Interaktionen) ist ein Pfad in den lokalen Speicher,
// z.B. "baseline.koerper", "anliegen", "absicht" — s. lib/storage.ts speicherePfad().
export type Interaktion =
  // Freitext-Notiz. `frage` optional: ist keine gesetzt, steht die Frage schon
  // im Block-Text und das Feld zeigt nur den Platzhalter.
  | {
      art: "journal";
      frage?: string;
      platzhalter?: string;
      optional?: boolean;
      speichern?: string;
    }
  // 0–10-Regler. Zwei Verwendungen: mit `speichern` = einmalige Baseline
  // (`skala` = Pol-Beschriftung "a ↔ b", `label` = Frage); mit `vorherNachher`
  // = Vorher/Nachher-Spiegel je Modul (`label` trägt die Pole).
  | {
      art: "slider";
      label: string;
      skala?: string;
      vorherNachher?: boolean;
      speichern?: string;
    }
  // Chips, eine Auswahl. `hinweis` = beruhigender Zusatz ("nichts davon ist falsch").
  | {
      art: "auswahl";
      optionen: string[];
      hinweis?: string;
      speichern?: string;
    }
  // Antippbare Vorlagen füllen ein editierbares Freitextfeld (Modul 2: Absicht).
  | {
      art: "auswahl-oder-freitext";
      vorlagen: string[];
      platzhalter?: string;
      editierbar?: boolean;
      speichern?: string;
    }
  | {
      art: "selbsttest";
      // wann="baseline" speichert die Ausgangswerte (Modul 2); wann="nachher"
      // misst erneut und zeigt Vorher/Nachher (Modul 10).
      wann?: "baseline" | "nachher";
      achsen: SelbsttestAchse[];
      absichtFrage?: string;
      absichtVorschlaege?: string[];
    };

export type Schritt = {
  typ: SchrittTyp;
  titel: string;
  strang?: Strang; // Kopf·Hand·Herz (optional; Backend/dezente Anzeige)
  bloecke: TextBlock[]; // Lese-Fassung (bei erleben: das, was im UI steht)
  audio?: string; // z.B. "/audio/alarm/03-erleben.mp3" — fehlt bei Text-Modulen
  bild?: string; // optionales Deko-Bild, z.B. "/deko/saebelzahntiger.svg"
  stilleSek?: number; // nachspueren/reflektieren: Obergrenze der Nachspür-Pause
  sprechtempo?: "langsam" | "normal"; // steuert die ElevenLabs-Speed (nur Audio)
  audioSkript?: AudioSkriptZeile[]; // exakte Audio-Vorlage (nur erleben); NICHT im UI
  hinweisBuild?: string; // reiner Build-/Dev-Hinweis, wird nicht gerendert
  interaktionen?: Interaktion[];
  experiment?: { haupt: string; optional?: string }; // nur beim Typ "experiment"
};

// ── Modul-Ebene ──────────────────────────────────────────────────────

export type StationId =
  | "ankommen"
  | "runterkommen"
  | "wahrnehmen"
  | "weit-werden";

// Unsichtbarer Backend-Tag (nie Nutzer-Navigation).
export type ModulTyp = "fundament" | "werkzeug" | "themenwelt" | "integration";

export type Modul = {
  id: string; // "willkommen", "alarm", "wo-du-stehst", …
  no: number; // 1..10 — Position auf dem Weg
  station: StationId;
  titel: string;
  dauerMin: number;
  voraussetzungen: string[];
  moduleType?: ModulTyp; // Backend-Tag, nie sichtbar
  bild?: string; // optionales Übersichts-/Kartenbild
  schritte: Schritt[]; // genau 6, feste Reihenfolge (s. SchrittTyp)
};

// ── Landkarte (Navigation) ───────────────────────────────────────────
// Struktur folgt Lanas landkarte.data.json. Wird nur getypt, nicht validiert.

export type ModulStatus2 = "written" | "planned";

export type StationModulRef = {
  id: string;
  no: number;
  title: string;
  status: ModulStatus2;
  durationMin?: number;
  format?: string[];
  image?: string;
  note?: string;
};

export type Seitenpfad = {
  id: string;
  title: string;
  tag: string;
  gated: boolean;
  gateReason?: string;
  gateCopy: string;
  body: string;
  docks?: string[];
  source?: string;
};

export type Station = {
  id: StationId;
  number: number;
  tag: string;
  title: string;
  journeyPos: number;
  shift: string;
  note?: string;
  transitionNote?: string;
  isLast?: boolean;
  modules: StationModulRef[];
  branch?: Seitenpfad;
};

export type GradientStop = { at: number; color: string; meaning?: string };

export type Landkarte = {
  meta?: Record<string, unknown>;
  designTokens: {
    colors: Record<string, string>;
    journeyGradient: {
      direction: string;
      stops: GradientStop[];
      description?: string;
    };
    fonts?: Record<string, { family: string; role: string }>;
    radius?: Record<string, number>;
  };
  horizon: {
    name: string;
    subtitle: string;
    body: string;
    clarifier?: string;
    measure?: { instrument: string; cadence: string; framing: string };
    visual?: string;
  };
  modes: {
    id: string;
    default?: boolean;
    label: string;
    sub: string;
    behavior?: string;
  }[];
  needsEntry: {
    eyebrow: string;
    chips: { label: string; targetModule: string }[];
  };
  path: { overviewLabel: string; stations: Station[] };
  loop: {
    id: string;
    title: string;
    role?: string;
    subtitle: string;
    items: { id: string; title: string; detail: string }[];
  };
  themenwelten?: {
    label: string;
    sub: string;
    release?: string;
    items: { id: string; title: string; source?: string; note?: string }[];
  };
  safety: Record<string, string>;
  backendTags?: Record<string, unknown>;
};
