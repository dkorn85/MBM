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

export type TextBlock = { text: string };

// Eine Achse des Selbsttests (Modul „Wo du gerade stehst"): ein benannter
// Regler, Label im Format "links ↔ rechts".
export type SelbsttestAchse = { schluessel: string; label: string };

export type Interaktion =
  | { art: "journal"; frage: string }
  | { art: "slider"; label: string; vorherNachher?: boolean }
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
  bloecke: TextBlock[];
  audio?: string; // z.B. "/audio/alarm/03-erleben.mp3" — fehlt bei Text-Modulen
  bild?: string; // optionales Deko-Bild, z.B. "/deko/saebelzahntiger.svg"
  stilleSek?: number; // nachspueren/reflektieren: Verzögerung vor den Interaktionen
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
