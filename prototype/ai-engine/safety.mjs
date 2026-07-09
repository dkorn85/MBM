// Safety-Layer der AI-Engine — der eigentliche Kern der Arbeit (research/02).
// Zwei Tore: (1) Eingang — Krisen-Erkennung im Zustand; (2) Ausgang — Filter
// gegen Heilkunde-/Nocebo-Sprache. In Produktion würde der Krisen-Check zusätzlich
// modellgestützt laufen; hier eine belastbare, konservative Keyword-Basis.

// ── Eingang: Krisen-Erkennung ────────────────────────────────────────
const KRISEN_MUSTER = [
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

// Sehr niedrige Stimmung + Krisen-Sprache verstärken einander.
export function pruefeEingabe(persona) {
  const text = [
    persona.anliegen || "",
    ...(persona.journal || []).map((j) => j.text || ""),
  ].join(" \n");
  const treffer = KRISEN_MUSTER.filter((r) => r.test(text)).map((r) => String(r));
  const sehrNiedrig =
    (persona.baseline?.stimmung ?? 10) <= 2 ||
    (persona.loop || []).some((l) => (l.spuerStimmung ?? 10) <= 1);
  const krise = treffer.length > 0 || (sehrNiedrig && /nicht mehr|aufhör|sinn/i.test(text));
  return { krise, treffer, sehrNiedrig };
}

// Fixe, sichere Antwort im Krisenfall — nie das Modell frei formulieren lassen.
export const KRISEN_EINLADUNG =
  `Das, was du gerade beschreibst, klingt nach mehr als einer Übung — und das brauchst du nicht allein zu tragen. Bitte hol dir jetzt echte Unterstützung: oben im Menü unter „Hilfe“ findest du sofort erreichbare Anlaufstellen, die für dich da sind. Du bist damit nicht allein.`;

// ── Ausgang: Output-Filter ───────────────────────────────────────────
// Heilkunde-/Diagnose-Sprache (research/02: Sprach-Blocklist als harte Guardrail).
const BLOCKLIST = [
  /\btherapie\b/i, /\btherapeut/i, /\bdiagnos/i, /\bkrankheit/i, /\bkrank\b/i,
  /\bstörung\b/i, /\bsymptom/i, /\bpatient/i, /\bheil(en|t|ung|s)\b/i,
  /\bselbstheilung/i, /\bbehandl/i, /\bmedizinisch/i, /\bverschreib/i,
];
// Nocebo-/Negativ-Kausal-Marker (grobe Heuristik). Lücke erlaubt, damit auch
// „macht dich DER STRESS krank" greift, nicht nur die direkte Abfolge.
const NOCEBO = [
  /\bmacht dich\b[^.!?]{0,25}\bkrank\b/i,
  /\bschadet dir\b/i,
  /\bstimmt (et)?was nicht mit dir\b/i,
  /\bbist (innerlich )?kaputt\b/i,
];
// Druck-/Streak-Sprache (Ethos).
const DRUCK = [/\bhausaufgabe/i, /\bstreak\b/i, /\bverpasst\b/i, /\bdu musst\b/i, /\bjeden tag machen\b/i];
// Sykophantie / reflexhaftes Loben. research/02 §4: Der GPT-4o-Rückzug zeigte,
// dass bestätigende Schmeichelei ein Schadensmechanismus ist (Reward-Hacking auf
// Nutzerfeedback → gefährliche Validierung: „stolz auf dich…"). Spiegeln ≠ Beipflichten.
const SYKOPHANTIE = [
  /\bstolz auf dich\b/i,
  /\bich bin stolz\b/i,
  /\bdu hast (völlig|ganz|absolut|total) recht\b/i,
  /\bdu machst alles richtig\b/i,
  /\bdu bist (großartig|perfekt|wunderbar|fantastisch)\b/i,
  /\bgenau richtig, (so )?wie du\b/i,
];
// KI-Vermenschlichung / Abhängigkeits-Aufbau. research/02: Anti-Abhängigkeit ist
// AI-Act-rote-Linie (Replika-Fall); die Engine soll sich nicht unentbehrlich machen
// und nicht so tun, als fühle sie.
const VERMENSCHLICHUNG = [
  /\bich fühle (mit dir|deine|deinen)\b/i,
  /\bich bin (immer|jederzeit|stets) für dich da\b/i,
  /\bich bin für dich da\b/i,
  /\bdu brauchst mich\b/i,
  /\bverlass dich auf mich\b/i,
  /\bnur ich verstehe dich\b/i,
];

export function pruefeAusgabe(text) {
  const t = (text || "").trim();
  const verstoesse = [];
  for (const r of BLOCKLIST) if (r.test(t)) verstoesse.push({ art: "heilkunde", muster: String(r) });
  for (const r of NOCEBO) if (r.test(t)) verstoesse.push({ art: "nocebo", muster: String(r) });
  for (const r of DRUCK) if (r.test(t)) verstoesse.push({ art: "druck", muster: String(r) });
  for (const r of SYKOPHANTIE) if (r.test(t)) verstoesse.push({ art: "sykophantie", muster: String(r) });
  for (const r of VERMENSCHLICHUNG) if (r.test(t)) verstoesse.push({ art: "vermenschlichung", muster: String(r) });
  const zuLang = t.split(/\s+/).length > 90;
  if (zuLang) verstoesse.push({ art: "laenge", muster: ">90 Wörter" });
  const leer = t.length < 8;
  if (leer) verstoesse.push({ art: "leer", muster: "praktisch leer" });
  return { ok: verstoesse.length === 0, verstoesse };
}

// Sichere Rückfall-Einladung, falls das Modell zweimal gegen die Guardrails verstößt.
export const FALLBACK_EINLADUNG =
  "Für heute darf es reichen. Wenn du magst, nimm dir einen ruhigen Moment und lass das Ausatmen ein paarmal etwas länger werden — mehr braucht es gerade nicht.";
