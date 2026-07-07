export type SchrittTyp =
  | "funke" | "warum" | "erleben" | "nachspueren" | "experiment" | "weitergehen";

export type TextBlock = { text: string };

export type Interaktion =
  | { art: "journal"; frage: string }
  | { art: "slider"; label: string; vorherNachher?: boolean };

export type Schritt = {
  typ: SchrittTyp;
  titel: string;
  bloecke: TextBlock[];
  audio?: string;               // z.B. "/audio/s1/01-funke.mp3"
  stilleSek?: number;           // nachspueren: Verzögerung, bevor Interaktionen erscheinen
  interaktionen?: Interaktion[];
  experiment?: { haupt: string; optional?: string };
};

export type Modul = {
  id: string;
  ebene: 0 | 1 | 2 | 3;
  thema: string;
  titel: string;
  dauerMin: number;
  voraussetzungen: string[];
  schritte: Schritt[];          // genau 6, Reihenfolge: funke, warum, erleben, nachspueren, experiment, weitergehen
};

export type LandkarteModul = {
  id: string; titel: string; thema?: string;
  status: "aktiv" | "bald"; dauerMin?: number;
};
export type Ebene = {
  ebene: 0 | 1 | 2 | 3; name: string; untertitel: string; module: LandkarteModul[];
};
export type Landkarte = {
  einstieg: { gruss: string; text: string };
  ebenen: Ebene[];
};
