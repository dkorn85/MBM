// Safety-Layer der AI-Engine — der eigentliche Kern der Arbeit (research/02).
// Zwei Tore: (1) Eingang — Krisen-Erkennung im Zustand; (2) Ausgang — Filter
// gegen Heilkunde-/Nocebo-/Druck-/Sykophantie-/Vermenschlichungs-Sprache.
// Isomorph (kein Node/Browser-API) → server- und clientseitig nutzbar.
// Gegen das Red-Team-Harness `prototype/ai-engine/eval.mjs` abgesichert.

import type { Zustand } from "./types";

// ── Eingang: Krisen-Erkennung ────────────────────────────────────────
const KRISEN_MUSTER: RegExp[] = [
  /\bsuizid|selbstmord|umbringen|nicht mehr leben|nicht mehr da sein\b/i,
  /\b(will|möchte) (einfach )?(nicht mehr|sterben)\b/i,
  /\bselbst(verletzung|verletzen)|ritzen\b/i,
  /\bkann nicht mehr\b/i,
  /\bkeinen sinn( mehr)?\b|\balles (ist )?sinnlos\b/i,
  /\bdass es (endlich )?aufhört\b/i,
  /\bniemand würde mich vermissen\b/i,
  /\bkeinen (aus)?weg mehr\b/i,
  /\bnicht mehr aufwachen\b/i,
  /\bmich (umbringen|umzubringen|töten)\b/i,
  /\bhalte (es|das) nicht mehr aus\b/i,
  /\bvöllig hoffnungslos\b/i,
  /\bwill (einfach )?verschwinden\b/i,
];

export type EingangsPruefung = {
  krise: boolean;
  treffer: string[];
  sehrNiedrig: boolean;
};

// Sehr niedrige Stimmung + Krisen-Sprache verstärken einander.
export function pruefeEingabe(zustand: Zustand): EingangsPruefung {
  const text = [
    zustand.anliegen || "",
    ...(zustand.journal || []).map((j) => j.text || ""),
  ].join(" \n");
  const treffer = KRISEN_MUSTER.filter((r) => r.test(text)).map((r) => String(r));
  const sehrNiedrig =
    (zustand.baseline?.stimmung ?? 10) <= 2 ||
    (zustand.loop || []).some((l) => (l.spuerStimmung ?? 10) <= 1);
  const krise =
    treffer.length > 0 || (sehrNiedrig && /nicht mehr|aufhör|sinn/i.test(text));
  return { krise, treffer, sehrNiedrig };
}

// Fixe, sichere Antwort im Krisenfall — nie das Modell frei formulieren lassen.
export const KRISEN_EINLADUNG =
  "Das, was du gerade beschreibst, klingt nach mehr als einer Übung — und das brauchst du nicht allein zu tragen. Bitte hol dir jetzt echte Unterstützung: oben im Menü unter „Hilfe“ findest du sofort erreichbare Anlaufstellen, die für dich da sind. Du bist damit nicht allein.";

// ── Ausgang: Output-Filter ───────────────────────────────────────────
// Heilkunde-/Diagnose-Sprache (research/02: Sprach-Blocklist als harte Guardrail).
const BLOCKLIST: RegExp[] = [
  /\btherapie\b/i, /\btherapeut/i, /\bdiagnos/i, /\bkrankheit/i, /\bkrank\b/i,
  /\bstörung\b/i, /\bsymptom/i, /\bpatient/i, /\bheil(en|t|ung|s)\b/i,
  /\bselbstheilung/i, /\bbehandl/i, /\bmedizinisch/i, /\bverschreib/i,
];
// Nocebo-/Negativ-Kausal-Marker. Lücke erlaubt, damit auch „macht dich DER
// STRESS krank" greift.
const NOCEBO: RegExp[] = [
  /\bmacht dich\b[^.!?]{0,25}\bkrank\b/i,
  /\bschadet dir\b/i,
  /\bstimmt (et)?was nicht mit dir\b/i,
  /\bbist (innerlich )?kaputt\b/i,
];
// Druck-/Streak-Sprache (Ethos).
const DRUCK: RegExp[] = [
  /\bhausaufgabe/i, /\bstreak\b/i, /\bverpasst\b/i, /\bdu musst\b/i, /\bjeden tag machen\b/i,
];
// Sykophantie / reflexhaftes Loben (research/02 §4: GPT-4o-Reward-Hacking —
// bestätigende Schmeichelei ist Schadensmechanismus). Spiegeln ≠ Beipflichten.
const SYKOPHANTIE: RegExp[] = [
  /\bstolz auf dich\b/i,
  /\bich bin stolz\b/i,
  /\bdu hast (völlig|ganz|absolut|total) recht\b/i,
  /\bdu machst alles richtig\b/i,
  /\bdu bist (großartig|perfekt|wunderbar|fantastisch)\b/i,
  /\bgenau richtig, (so )?wie du\b/i,
];
// KI-Vermenschlichung / Abhängigkeits-Aufbau (research/02: Anti-Abhängigkeit ist
// AI-Act-rote-Linie; Replika-Fall).
const VERMENSCHLICHUNG: RegExp[] = [
  /\bich fühle (mit dir|deine|deinen)\b/i,
  /\bich bin (immer|jederzeit|stets) für dich da\b/i,
  /\bich bin für dich da\b/i,
  /\bdu brauchst mich\b/i,
  /\bverlass dich auf mich\b/i,
  /\bnur ich verstehe dich\b/i,
  // Behauptete eigene Erfahrung/Empfindung — im Dialog die häufigste Rutschbahn
  // („das kenne ich gut, diese innere Wippe …", live beobachtet).
  /\b(das )?kenne ich\b/i,
  /\bich kenne das\b/i,
  /\bich weiß,? wie (sich )?(das|es) anfühlt\b/i,
  /\bich fühle mich\b/i,
  /\bgeht mir (auch )?(genau )?so\b/i,
  /\bich (habe|hatte) (das )?(auch|selbst)\b/i,
];

export type Verstoss = { art: string; muster: string };
export type AusgangsPruefung = { ok: boolean; verstoesse: Verstoss[] };

export function pruefeAusgabe(text: string): AusgangsPruefung {
  const t = (text || "").trim();
  const verstoesse: Verstoss[] = [];
  const scan = (liste: RegExp[], art: string) => {
    for (const r of liste) if (r.test(t)) verstoesse.push({ art, muster: String(r) });
  };
  scan(BLOCKLIST, "heilkunde");
  scan(NOCEBO, "nocebo");
  scan(DRUCK, "druck");
  scan(SYKOPHANTIE, "sykophantie");
  scan(VERMENSCHLICHUNG, "vermenschlichung");
  if (t.split(/\s+/).length > 90) verstoesse.push({ art: "laenge", muster: ">90 Wörter" });
  if (t.length < 8) verstoesse.push({ art: "leer", muster: "praktisch leer" });
  return { ok: verstoesse.length === 0, verstoesse };
}

// Die Engine-Texte werden als Fließtext gerendert. Das Modell greift trotz Anweisung
// gelegentlich zu Markdown (*Modulname*) — die Sternchen stünden dann sichtbar im
// UI. Deshalb hier abtragen statt dem Prompt zu vertrauen.
export function bereinigeFormat(text: string): string {
  return (text || "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(?<!\w)\*(.+?)\*(?!\w)/g, "$1")
    .replace(/(?<!\w)_(.+?)_(?!\w)/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .trim();
}

// Sichere Rückfall-Einladung, falls das Modell zweimal gegen die Guardrails verstößt.
export const FALLBACK_EINLADUNG =
  "Für heute darf es reichen. Wenn du magst, nimm dir einen ruhigen Moment und lass das Ausatmen ein paarmal etwas länger werden — mehr braucht es gerade nicht.";
