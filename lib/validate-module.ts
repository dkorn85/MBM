import type {
  Interaktion,
  Modul,
  ModulTyp,
  Schritt,
  SchrittTyp,
  StationId,
  Strang,
  TextBlock,
} from "./module-schema";

// Neue Reihenfolge (Lana): Verankern (experiment) VOR Reflektieren (nachspueren).
const SCHRITT_REIHENFOLGE: SchrittTyp[] = [
  "funke",
  "warum",
  "erleben",
  "experiment",
  "nachspueren",
  "weitergehen",
];

const STATIONEN: StationId[] = [
  "ankommen",
  "runterkommen",
  "wahrnehmen",
  "weit-werden",
];
const STRAENGE: Strang[] = ["kopf", "hand", "herz", "alle"];
const MODUL_TYPEN: ModulTyp[] = [
  "fundament",
  "werkzeug",
  "themenwelt",
  "integration",
];

/**
 * Handgeschriebener Runtime-Validator (keine Dependency).
 * Wirft bei Fehler einen Error mit Modul-ID, Pfad und Grund.
 */
export function validateModul(data: unknown): Modul {
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
  const no = pflichtZahl(roh.no, "no", fehler);
  const station = pflichtStation(roh.station, "station", fehler);
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

  const modul: Modul = {
    id,
    no,
    station,
    titel,
    dauerMin,
    voraussetzungen,
    schritte,
  };

  if (roh.moduleType !== undefined) {
    if (!MODUL_TYPEN.includes(roh.moduleType as ModulTyp)) {
      fehler("moduleType", `unbekannt: "${String(roh.moduleType)}".`);
    }
    modul.moduleType = roh.moduleType as ModulTyp;
  }
  if (roh.bild !== undefined) {
    modul.bild = pflichtString(roh.bild, "bild", fehler);
  }

  return modul;
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
    const bo = b as Record<string, unknown>;
    const text = bo.text;
    if (typeof text !== "string" || text.trim() === "") {
      fehler(`${bPfad}.text`, "muss ein nicht-leerer String sein.");
    }
    const block: TextBlock = { text: text as string };
    if (bo.sichtbarAb !== undefined) {
      block.sichtbarAb = pflichtString(bo.sichtbarAb, `${bPfad}.sichtbarAb`, fehler);
    }
    return block;
  });

  const schritt: Schritt = { typ, titel, bloecke };

  // Optionale Felder
  if (data.strang !== undefined) {
    if (!STRAENGE.includes(data.strang as Strang)) {
      fehler(`${pfad}.strang`, `unbekannt: "${String(data.strang)}".`);
    }
    schritt.strang = data.strang as Strang;
  }

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

  if (data.sprechtempo !== undefined) {
    if (data.sprechtempo !== "langsam" && data.sprechtempo !== "normal") {
      fehler(`${pfad}.sprechtempo`, 'muss "langsam" oder "normal" sein.');
    }
    schritt.sprechtempo = data.sprechtempo;
  }

  if (data.audioSkript !== undefined) {
    if (!Array.isArray(data.audioSkript) || data.audioSkript.length === 0) {
      fehler(`${pfad}.audioSkript`, "muss ein nicht-leeres Array sein, wenn gesetzt.");
    }
    schritt.audioSkript = (data.audioSkript as unknown[]).map((z, k) => {
      const zPfad = `${pfad}.audioSkript[${k}]`;
      if (!istObjekt(z)) fehler(zPfad, "muss ein Objekt sein.");
      const zr = z as Record<string, unknown>;
      const text = pflichtString(zr.text, `${zPfad}.text`, fehler);
      if (
        typeof zr.pauseSek !== "number" ||
        Number.isNaN(zr.pauseSek) ||
        zr.pauseSek < 0
      ) {
        fehler(`${zPfad}.pauseSek`, "muss eine Zahl ≥ 0 sein.");
      }
      return { text, pauseSek: zr.pauseSek as number };
    });
  }

  if (data.hinweisBuild !== undefined) {
    schritt.hinweisBuild = pflichtString(
      data.hinweisBuild,
      `${pfad}.hinweisBuild`,
      fehler,
    );
  }

  if (data.interaktionen !== undefined) {
    if (!Array.isArray(data.interaktionen)) {
      fehler(`${pfad}.interaktionen`, "muss ein Array sein, wenn gesetzt.");
    }
    schritt.interaktionen = (data.interaktionen as unknown[]).map((it, k) =>
      validiereInteraktion(it, `${pfad}.interaktionen[${k}]`, fehler),
    );
  }

  // experiment-Feld ist beim Typ "experiment" optional (Verankern kann eine
  // merkbare Karte tragen ODER nur Text/Interaktion sein), sonst verboten.
  if (typ === "experiment") {
    if (data.experiment !== undefined) {
      if (!istObjekt(data.experiment)) {
        fehler(`${pfad}.experiment`, "muss ein Objekt sein, wenn gesetzt.");
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
    }
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
    const it: Extract<Interaktion, { art: "journal" }> = { art: "journal" };
    if (data.frage !== undefined) {
      it.frage = pflichtString(data.frage, `${pfad}.frage`, fehler);
    }
    if (data.platzhalter !== undefined) {
      it.platzhalter = pflichtString(data.platzhalter, `${pfad}.platzhalter`, fehler);
    }
    if (data.optional !== undefined) {
      if (typeof data.optional !== "boolean") {
        fehler(`${pfad}.optional`, "muss ein Boolean sein, wenn gesetzt.");
      }
      it.optional = data.optional;
    }
    if (data.speichern !== undefined) {
      it.speichern = pflichtString(data.speichern, `${pfad}.speichern`, fehler);
    }
    return it;
  }
  if (data.art === "slider") {
    const label = pflichtString(data.label, `${pfad}.label`, fehler);
    const it: Extract<Interaktion, { art: "slider" }> = { art: "slider", label };
    if (data.skala !== undefined) {
      it.skala = pflichtString(data.skala, `${pfad}.skala`, fehler);
    }
    if (data.vorherNachher !== undefined) {
      if (typeof data.vorherNachher !== "boolean") {
        fehler(`${pfad}.vorherNachher`, "muss ein Boolean sein, wenn gesetzt.");
      }
      it.vorherNachher = data.vorherNachher;
    }
    if (data.speichern !== undefined) {
      it.speichern = pflichtString(data.speichern, `${pfad}.speichern`, fehler);
    }
    return it;
  }
  if (data.art === "auswahl") {
    const optionen = pflichtStringArray(data.optionen, `${pfad}.optionen`, fehler);
    if (optionen.length === 0) {
      fehler(`${pfad}.optionen`, "muss ein nicht-leeres Array sein.");
    }
    const it: Extract<Interaktion, { art: "auswahl" }> = { art: "auswahl", optionen };
    if (data.hinweis !== undefined) {
      it.hinweis = pflichtString(data.hinweis, `${pfad}.hinweis`, fehler);
    }
    if (data.speichern !== undefined) {
      it.speichern = pflichtString(data.speichern, `${pfad}.speichern`, fehler);
    }
    return it;
  }
  if (data.art === "auswahl-oder-freitext") {
    const vorlagen = pflichtStringArray(data.vorlagen, `${pfad}.vorlagen`, fehler);
    if (vorlagen.length === 0) {
      fehler(`${pfad}.vorlagen`, "muss ein nicht-leeres Array sein.");
    }
    const it: Extract<Interaktion, { art: "auswahl-oder-freitext" }> = {
      art: "auswahl-oder-freitext",
      vorlagen,
    };
    if (data.platzhalter !== undefined) {
      it.platzhalter = pflichtString(data.platzhalter, `${pfad}.platzhalter`, fehler);
    }
    if (data.editierbar !== undefined) {
      if (typeof data.editierbar !== "boolean") {
        fehler(`${pfad}.editierbar`, "muss ein Boolean sein, wenn gesetzt.");
      }
      it.editierbar = data.editierbar;
    }
    if (data.speichern !== undefined) {
      it.speichern = pflichtString(data.speichern, `${pfad}.speichern`, fehler);
    }
    return it;
  }
  if (data.art === "selbsttest") {
    if (!Array.isArray(data.achsen) || data.achsen.length === 0) {
      fehler(`${pfad}.achsen`, "muss ein nicht-leeres Array sein.");
    }
    const achsen = (data.achsen as unknown[]).map((a, k) => {
      const aPfad = `${pfad}.achsen[${k}]`;
      if (!istObjekt(a)) fehler(aPfad, "muss ein Objekt sein.");
      const schluessel = pflichtString(
        (a as Record<string, unknown>).schluessel,
        `${aPfad}.schluessel`,
        fehler,
      );
      const label = pflichtString(
        (a as Record<string, unknown>).label,
        `${aPfad}.label`,
        fehler,
      );
      return { schluessel, label };
    });
    const it: Extract<Interaktion, { art: "selbsttest" }> = {
      art: "selbsttest",
      achsen,
    };
    if (data.wann !== undefined) {
      if (data.wann !== "baseline" && data.wann !== "nachher") {
        fehler(`${pfad}.wann`, 'muss "baseline" oder "nachher" sein.');
      }
      it.wann = data.wann;
    }
    if (data.absichtFrage !== undefined) {
      it.absichtFrage = pflichtString(
        data.absichtFrage,
        `${pfad}.absichtFrage`,
        fehler,
      );
    }
    if (data.absichtVorschlaege !== undefined) {
      it.absichtVorschlaege = pflichtStringArray(
        data.absichtVorschlaege,
        `${pfad}.absichtVorschlaege`,
        fehler,
      );
    }
    return it;
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

function pflichtStation(v: unknown, pfad: string, fehler: Fehler): StationId {
  if (!STATIONEN.includes(v as StationId)) {
    fehler(pfad, `muss eine gültige Station sein (${STATIONEN.join(", ")}).`);
  }
  return v as StationId;
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
