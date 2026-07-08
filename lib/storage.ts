// Austauschbarer Storage-Layer (P3). Kein Zugriff auf localStorage außerhalb
// dieser Datei. SSR-sicher: auf dem Server No-Op/leere Werte.
// Namespace: mbm.v1.

export type ModulStatus = "offen" | "begonnen" | "abgeschlossen";

// Ansichts-Modus der Startseite: „Dem Weg folgen" vs. „Frei streifen".
// Reine Betonung/Reihenfolge, keine Inhalts-Sperre. Default: „follow".
export type Modus = "follow" | "roam";

export type JournalEintrag = {
  modulId: string;
  frage: string;
  text: string;
  erstellt: string; // ISO-Datum
};

export type SpuerWert = {
  modulId: string;
  wann: "vorher" | "nachher";
  wert: number; // 0–10
  erstellt: string; // ISO-Datum
};

export type AktivesExperiment = {
  modulId: string;
  titel: string;
  haupt: string;
  optional?: string;
  gemerkt: string; // ISO-Datum
};

// Selbsttest auf den vier Ebenen der Stressreaktion (Modul „Wo du gerade
// stehst"). Baseline = Ausgangswerte; nachher = erneute Messung (Modul „Rückblick").
export type SelbsttestSnapshot = {
  wann: "baseline" | "nachher";
  achsen: Record<string, number>; // schluessel -> 0..10
  anliegen?: string;
  erstellt: string; // ISO-Datum
};

// Täglicher Loop (Puls): Spür-Check · Glücksmoment · Anker. Kein Streak-Zwang —
// einfach ein Eintrag pro Tag, alles optional.
export type LoopEintrag = {
  datum: string; // YYYY-MM-DD
  spuerKoerper?: number; // 0..10
  spuerStimmung?: number; // 0..10
  gluecksmoment?: string;
  ankerGemacht?: boolean;
};

export interface MbmStorage {
  getModulStatus(modulId: string): ModulStatus;
  setModulStatus(modulId: string, status: ModulStatus): void;
  getAbgeschlossene(): string[];
  getJournal(): JournalEintrag[];
  addJournal(eintrag: JournalEintrag): void;
  getSpuerWerte(modulId: string): SpuerWert[];
  setSpuerWert(wert: SpuerWert): void; // überschreibt gleichen (modulId, wann)
  getExperimente(): AktivesExperiment[];
  merkeExperiment(experiment: AktivesExperiment): void;
  entferneExperiment(modulId: string): void;
  getSelbsttest(wann: "baseline" | "nachher"): SelbsttestSnapshot | null;
  setSelbsttest(snap: SelbsttestSnapshot): void; // überschreibt gleiches wann
  getLoopEintrag(datum: string): LoopEintrag | null;
  setLoopEintrag(datum: string, patch: Partial<Omit<LoopEintrag, "datum">>): void;
  getLoopHistorie(): LoopEintrag[];
  getModus(): Modus;
  setModus(modus: Modus): void;
  istDisclaimerGesehen(): boolean;
  setDisclaimerGesehen(): void;
}

// ── interne Helfer ───────────────────────────────────────────────────
const PREFIX = "mbm.v1.";
const KEY_STATUS = `${PREFIX}modulStatus`;
const KEY_JOURNAL = `${PREFIX}journal`;
const KEY_SPUER = `${PREFIX}spuerwerte`;
const KEY_EXPERIMENTE = `${PREFIX}experimente`;
const KEY_DISCLAIMER = `${PREFIX}disclaimerGesehen`;
const KEY_SELBSTTEST = `${PREFIX}selbsttest`;
const KEY_LOOP = `${PREFIX}loop`;
const KEY_MODUS = `${PREFIX}modus`;

/** localStorage nur im Browser; auf dem Server null. */
function speicher(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function lesen<T>(key: string, fallback: T): T {
  const s = speicher();
  if (!s) return fallback;
  try {
    const roh = s.getItem(key);
    if (roh === null) return fallback;
    return JSON.parse(roh) as T;
  } catch {
    return fallback;
  }
}

function schreiben(key: string, wert: unknown): void {
  const s = speicher();
  if (!s) return;
  try {
    s.setItem(key, JSON.stringify(wert));
  } catch {
    // Kontingent voll o. Ä. — still ignorieren.
    return;
  }
  benachrichtige();
}

/** Innerhalb der Seite ein Event feuern, damit Ansichten sich aktualisieren. */
function benachrichtige(): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent("mbm:storage"));
  } catch {
    // ignorieren
  }
}

// ── Implementierung ──────────────────────────────────────────────────
const localStorageImpl: MbmStorage = {
  getModulStatus(modulId) {
    const alle = lesen<Record<string, ModulStatus>>(KEY_STATUS, {});
    return alle[modulId] ?? "offen";
  },

  setModulStatus(modulId, status) {
    const alle = lesen<Record<string, ModulStatus>>(KEY_STATUS, {});
    if (alle[modulId] === status) return;
    alle[modulId] = status;
    schreiben(KEY_STATUS, alle);
  },

  getAbgeschlossene() {
    const alle = lesen<Record<string, ModulStatus>>(KEY_STATUS, {});
    return Object.keys(alle).filter((id) => alle[id] === "abgeschlossen");
  },

  getJournal() {
    return lesen<JournalEintrag[]>(KEY_JOURNAL, []);
  },

  addJournal(eintrag) {
    const alle = lesen<JournalEintrag[]>(KEY_JOURNAL, []);
    alle.push(eintrag);
    schreiben(KEY_JOURNAL, alle);
  },

  getSpuerWerte(modulId) {
    const alle = lesen<SpuerWert[]>(KEY_SPUER, []);
    return alle.filter((w) => w.modulId === modulId);
  },

  setSpuerWert(wert) {
    const alle = lesen<SpuerWert[]>(KEY_SPUER, []);
    const ohneGleichen = alle.filter(
      (w) => !(w.modulId === wert.modulId && w.wann === wert.wann),
    );
    ohneGleichen.push(wert);
    schreiben(KEY_SPUER, ohneGleichen);
  },

  getExperimente() {
    return lesen<AktivesExperiment[]>(KEY_EXPERIMENTE, []);
  },

  merkeExperiment(experiment) {
    const alle = lesen<AktivesExperiment[]>(KEY_EXPERIMENTE, []);
    const ohneGleiches = alle.filter((e) => e.modulId !== experiment.modulId);
    ohneGleiches.push(experiment);
    schreiben(KEY_EXPERIMENTE, ohneGleiches);
  },

  entferneExperiment(modulId) {
    const alle = lesen<AktivesExperiment[]>(KEY_EXPERIMENTE, []);
    const gefiltert = alle.filter((e) => e.modulId !== modulId);
    if (gefiltert.length === alle.length) return;
    schreiben(KEY_EXPERIMENTE, gefiltert);
  },

  getSelbsttest(wann) {
    const alle = lesen<Record<string, SelbsttestSnapshot>>(KEY_SELBSTTEST, {});
    return alle[wann] ?? null;
  },

  setSelbsttest(snap) {
    const alle = lesen<Record<string, SelbsttestSnapshot>>(KEY_SELBSTTEST, {});
    alle[snap.wann] = snap;
    schreiben(KEY_SELBSTTEST, alle);
  },

  getLoopEintrag(datum) {
    const alle = lesen<Record<string, LoopEintrag>>(KEY_LOOP, {});
    return alle[datum] ?? null;
  },

  setLoopEintrag(datum, patch) {
    const alle = lesen<Record<string, LoopEintrag>>(KEY_LOOP, {});
    alle[datum] = { ...(alle[datum] ?? { datum }), ...patch, datum };
    schreiben(KEY_LOOP, alle);
  },

  getLoopHistorie() {
    const alle = lesen<Record<string, LoopEintrag>>(KEY_LOOP, {});
    return Object.values(alle).sort((a, b) => b.datum.localeCompare(a.datum));
  },

  getModus() {
    return lesen<Modus>(KEY_MODUS, "follow") === "roam" ? "roam" : "follow";
  },

  setModus(modus) {
    schreiben(KEY_MODUS, modus);
  },

  istDisclaimerGesehen() {
    return lesen<boolean>(KEY_DISCLAIMER, false) === true;
  },

  setDisclaimerGesehen() {
    schreiben(KEY_DISCLAIMER, true);
  },
};

export const storage: MbmStorage = localStorageImpl;
