// Der anonyme Nutzerzustand, den die Engine liest — zusammengesetzt AUS den
// bereits vorhandenen lokalen App-Signalen (nichts Neues abgefragt). Wird vom
// Client an die Route geschickt; die Route speichert ihn nicht (stateless).
export type Achsen = {
  koerper?: number; // 0 ruhig … 10 angespannt
  gedanken?: number; // 0 ruhig … 10 rasend
  stimmung?: number; // 0 weit … 10 dünnhäutig
  verhalten?: number; // 0 fürsorglich … 10 im Hetzmodus
};

export type LoopSignal = {
  spuerStimmung?: number;
  gluecksmoment?: string;
  ankerGemacht?: boolean;
};

export type Zustand = {
  baseline?: Achsen;
  nachher?: Achsen;
  anliegen?: string;
  loop?: LoopSignal[];
  journal?: { text: string }[];
  abgeschlossen?: string[];
};

// Ergebnis der Engine — die eine nächste Einladung + woher sie kommt.
export type Einladung = {
  krise: boolean;
  quelle: "krisen-layer" | "modell" | "fallback";
  einladung: string;
};
