import type { Landkarte, Modul } from "./module-schema";
import { validateModul } from "./validate-module";
import willkommen from "@/content/modules/willkommen.json";
import alarm from "@/content/modules/alarm.json";
import inseln from "@/content/modules/inseln.json";
import koerperHoeren from "@/content/modules/koerper-hoeren.json";
import gedankenEntwirren from "@/content/modules/gedanken-entwirren.json";
import eigenePraxis from "@/content/modules/eigene-praxis.json";
import landkarteRoh from "@/content/landkarte.json";

// Neues (fertiges) Modul = neue JSON-Datei + ein Eintrag in dieser Liste.
// Geplante Module (status "planned" in der Landkarte) haben noch keine Datei.
// Archiviert (nicht mehr eingebunden, Dateien bleiben): f1, f2, t1, t3.
const roheModule: unknown[] = [
  willkommen,
  alarm,
  inseln,
  koerperHoeren,
  gedankenEntwirren,
  eigenePraxis,
];

// Validierung bei Import-Zeit: ein fehlerhaftes Modul lässt den Build scheitern.
export const alleModule: Modul[] = roheModule.map((m) => validateModul(m));

export function getModul(id: string): Modul | undefined {
  return alleModule.find((m) => m.id === id);
}

export const landkarte = landkarteRoh as unknown as Landkarte;
