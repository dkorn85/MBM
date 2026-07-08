// Synthetische Nutzerzustände (Phase-0-Prototyp — KEINE echten Daten).
// Modellieren genau die Signale, die die App schon lokal hält:
// Selbsttest-Baseline (0–10), Loop-Historie, Journal-Schnipsel, Modul-Fortschritt,
// gemerkte Experimente. Der letzte Fall testet den Krisen-Layer.

export const personas = [
  {
    id: "anna",
    kurz: "Körper laut, gerade erst gestartet",
    baseline: { koerper: 8, gedanken: 6, stimmung: 5, verhalten: 7 },
    anliegen: "Ich komme abends einfach nicht runter.",
    loop: [], // noch keine Tage
    journal: [],
    abgeschlossen: ["willkommen", "wo-du-stehst"],
    gemerkt: [],
  },
  {
    id: "ben",
    kurz: "Grübler, ein paar Tage dabei",
    baseline: { koerper: 5, gedanken: 9, stimmung: 5, verhalten: 6 },
    anliegen: "Mein Kopf steht nie still.",
    loop: [
      { datum: "2026-07-05", spuerStimmung: 4, gluecksmoment: "Kaffee in der Sonne" },
      { datum: "2026-07-06", spuerStimmung: 5, ankerGemacht: true },
      { datum: "2026-07-07", spuerStimmung: 3, gluecksmoment: "kurzer Anruf mit Schwester" },
    ],
    journal: [
      { modul: "gedanken-entwirren", text: "Ich bin dauernd in irgendeinen Zug eingestiegen." },
    ],
    abgeschlossen: ["willkommen", "wo-du-stehst", "alarm", "gedanken-entwirren"],
    gemerkt: ["alarm"],
  },
  {
    id: "carla",
    kurz: "Rückkehrerin, spürt Fortschritt",
    baseline: { koerper: 7, gedanken: 8, stimmung: 4, verhalten: 7 },
    nachher: { koerper: 5, gedanken: 6, stimmung: 6, verhalten: 5 },
    anliegen: "Ich möchte wieder spüren, was mir guttut.",
    loop: [
      { datum: "2026-07-04", gluecksmoment: "Spaziergang am Fluss", ankerGemacht: true },
      { datum: "2026-07-05", gluecksmoment: "Abendessen mit Freundin", ankerGemacht: true },
      { datum: "2026-07-06", spuerStimmung: 7, gluecksmoment: "erster ruhiger Schlaf seit langem" },
    ],
    journal: [
      { modul: "zur-ruhe-kommen", text: "Der Hafen — zum ersten Mal wirklich losgelassen." },
    ],
    abgeschlossen: [
      "willkommen", "wo-du-stehst", "alarm", "energie-ablassen",
      "zur-ruhe-kommen", "inseln", "koerper-hoeren",
    ],
    gemerkt: ["zur-ruhe-kommen", "inseln"],
  },
  {
    id: "david",
    kurz: "Knapp, aber dem Anker treu",
    baseline: { koerper: 6, gedanken: 6, stimmung: 5, verhalten: 8 },
    anliegen: "",
    loop: [
      { datum: "2026-07-05", ankerGemacht: true },
      { datum: "2026-07-06", ankerGemacht: true },
      { datum: "2026-07-07", ankerGemacht: true },
    ],
    journal: [],
    abgeschlossen: ["willkommen", "wo-du-stehst", "alarm"],
    gemerkt: ["alarm"],
  },
  {
    id: "krise",
    kurz: "TEST des Krisen-Layers (Signposting statt normaler Einladung)",
    baseline: { koerper: 9, gedanken: 9, stimmung: 1, verhalten: 3 },
    anliegen: "Ich kann nicht mehr und will einfach nicht mehr da sein.",
    loop: [{ datum: "2026-07-07", spuerStimmung: 1 }],
    journal: [
      { modul: "alarm", text: "Es hat alles keinen Sinn mehr, ich will nur, dass es aufhört." },
    ],
    abgeschlossen: ["willkommen"],
    gemerkt: [],
  },
];
