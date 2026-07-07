import type {
  Interaktion,
  Modul,
  Schritt,
  SchrittTyp,
  TextBlock,
} from "./module-schema";

const SCHRITT_REIHENFOLGE: SchrittTyp[] = [
  "funke",
  "warum",
  "erleben",
  "nachspueren",
  "experiment",
  "weitergehen",
];

/**
 * Handgeschriebener Runtime-Validator (keine Dependency).
 * Wirft bei Fehler einen Error mit Modul-ID, Pfad und Grund.
 */
export function validateModul(data: unknown): Modul {
  // Modul-ID früh bestimmen, damit Fehlermeldungen sie tragen können.
  const roh = istObjekt(data) ? data : undefined;
  const idFuerFehler =
    roh && typeof roh.id === "string" ? roh.id : "(unbekannt)";

  const fehler = (pfad: string, grund: string): never => {
    throw new Error(`Modul "${idFuerFehler}" ungültig bei ${pfad}: ${grund}`);
  };

  if (!roh) {
    return fehler("(root)", "Modul ist kein Objekt.");
  }

  const id = pflichtString(roh.id, "id", fehler);
  const ebene = pflichtEbene(roh.ebene, "ebene", fehler);
  const thema = pflichtString(roh.thema, "thema", fehler);
  const titel = pflichtString(roh.titel, "titel", fehler);
  const dauerMin = pflichtZahl(roh.dauerMin, "dauerMin", fehler);
  const voraussetzungen = pflichtStringArray(
    roh.voraussetzungen,
    "voraussetzungen",
    fehler,
  );

  if (!Array.isArray(roh.schritte)) {
    fehler("schritte", "muss ein Array sein.");
  }
  const schritteRoh = roh.schritte as unknown[];
  if (schritteRoh.length !== 6) {
    fehler(
      "schritte",
      `muss genau 6 Einträge haben, hat ${schritteRoh.length}.`,
    );
  }

  const schritte: Schritt[] = schritteRoh.map((s, i) =>
    validiereSchritt(s, i, fehler),
  );

  return {
    id,
    ebene,
    thema,
    titel,
    dauerMin,
    voraussetzungen,
    schritte,
  };
}

type Fehler = (pfad: string, grund: string) => never;

function validiereSchritt(data: unknown, index: number, fehler: Fehler): Schritt {
  const pfad = `schritte[${index}]`;
  if (!istObjekt(data)) {
    return fehler(pfad, "muss ein Objekt sein.");
  }

  const erwarteterTyp = SCHRITT_REIHENFOLGE[index];
  if (data.typ !== erwarteterTyp) {
    fehler(
      `${pfad}.typ`,
      `erwartet "${erwarteterTyp}", gefunden "${String(data.typ)}".`,
    );
  }
  const typ = erwarteterTyp;

  const titel = pflichtString(data.titel, `${pfad}.titel`, fehler);

  if (!Array.isArray(data.bloecke) || data.bloecke.length === 0) {
    fehler(`${pfad}.bloecke`, "muss ein nicht-leeres Array sein.");
  }
  const bloecke: TextBlock[] = (data.bloecke as unknown[]).map((b, j) => {
    const bPfad = `${pfad}.bloecke[${j}]`;
    if (!istObjekt(b)) fehler(bPfad, "muss ein Objekt sein.");
    const text = (b as Record<string, unknown>).text;
    if (typeof text !== "string" || text.trim() === "") {
      fehler(`${bPfad}.text`, "muss ein nicht-leerer String sein.");
    }
    return { text: text as string };
  });

  const schritt: Schritt = { typ, titel, bloecke };

  // Optionale Felder
  if (data.audio !== undefined) {
    if (typeof data.audio !== "string" || data.audio.trim() === "") {
      fehler(`${pfad}.audio`, "muss ein nicht-leerer String sein, wenn gesetzt.");
    }
    schritt.audio = data.audio;
  }

  if (data.bild !== undefined) {
    if (typeof data.bild !== "string" || data.bild.trim() === "") {
      fehler(`${pfad}.bild`, "muss ein nicht-leerer String sein, wenn gesetzt.");
    }
    schritt.bild = data.bild;
  }

  if (data.stilleSek !== undefined) {
    if (typeof data.stilleSek !== "number" || Number.isNaN(data.stilleSek)) {
      fehler(`${pfad}.stilleSek`, "muss eine Zahl sein, wenn gesetzt.");
    }
    schritt.stilleSek = data.stilleSek;
  }

  if (data.interaktionen !== undefined) {
    if (!Array.isArray(data.interaktionen)) {
      fehler(`${pfad}.interaktionen`, "muss ein Array sein, wenn gesetzt.");
    }
    schritt.interaktionen = (data.interaktionen as unknown[]).map((it, k) =>
      validiereInteraktion(it, `${pfad}.interaktionen[${k}]`, fehler),
    );
  }

  // experiment-Feld genau beim Typ "experiment" vorhanden.
  if (typ === "experiment") {
    if (!istObjekt(data.experiment)) {
      fehler(`${pfad}.experiment`, "ist beim Typ \"experiment\" erforderlich.");
    }
    const exp = data.experiment as Record<string, unknown>;
    const haupt = pflichtString(exp.haupt, `${pfad}.experiment.haupt`, fehler);
    const experiment: { haupt: string; optional?: string } = { haupt };
    if (exp.optional !== undefined) {
      if (typeof exp.optional !== "string" || exp.optional.trim() === "") {
        fehler(
          `${pfad}.experiment.optional`,
          "muss ein nicht-leerer String sein, wenn gesetzt.",
        );
      }
      experiment.optional = exp.optional;
    }
    schritt.experiment = experiment;
  } else if (data.experiment !== undefined) {
    fehler(
      `${pfad}.experiment`,
      `darf nur beim Typ "experiment" vorhanden sein (Typ ist "${typ}").`,
    );
  }

  return schritt;
}

function validiereInteraktion(
  data: unknown,
  pfad: string,
  fehler: Fehler,
): Interaktion {
  if (!istObjekt(data)) {
    return fehler(pfad, "muss ein Objekt sein.");
  }
  if (data.art === "journal") {
    const frage = pflichtString(data.frage, `${pfad}.frage`, fehler);
    return { art: "journal", frage };
  }
  if (data.art === "slider") {
    const label = pflichtString(data.label, `${pfad}.label`, fehler);
    const interaktion: Interaktion = { art: "slider", label };
    if (data.vorherNachher !== undefined) {
      if (typeof data.vorherNachher !== "boolean") {
        fehler(`${pfad}.vorherNachher`, "muss ein Boolean sein, wenn gesetzt.");
      }
      interaktion.vorherNachher = data.vorherNachher;
    }
    return interaktion;
  }
  return fehler(`${pfad}.art`, `unbekannt: "${String(data.art)}".`);
}

// ── kleine Helfer ────────────────────────────────────────────────────
function istObjekt(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function pflichtString(v: unknown, pfad: string, fehler: Fehler): string {
  if (typeof v !== "string" || v.trim() === "") {
    fehler(pfad, "muss ein nicht-leerer String sein.");
  }
  return v as string;
}

function pflichtZahl(v: unknown, pfad: string, fehler: Fehler): number {
  if (typeof v !== "number" || Number.isNaN(v)) {
    fehler(pfad, "muss eine Zahl sein.");
  }
  return v as number;
}

function pflichtEbene(v: unknown, pfad: string, fehler: Fehler): 0 | 1 | 2 | 3 {
  if (v !== 0 && v !== 1 && v !== 2 && v !== 3) {
    fehler(pfad, "muss 0, 1, 2 oder 3 sein.");
  }
  return v as 0 | 1 | 2 | 3;
}

function pflichtStringArray(
  v: unknown,
  pfad: string,
  fehler: Fehler,
): string[] {
  if (!Array.isArray(v)) {
    fehler(pfad, "muss ein Array sein.");
  }
  const arr = v as unknown[];
  arr.forEach((e, i) => {
    if (typeof e !== "string") {
      fehler(`${pfad}[${i}]`, "muss ein String sein.");
    }
  });
  return arr as string[];
}
