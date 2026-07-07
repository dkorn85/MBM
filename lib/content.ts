import type { Landkarte, Modul } from "./module-schema";
import { validateModul } from "./validate-module";
import f1 from "@/content/modules/f1.json";
import f2 from "@/content/modules/f2.json";
import s1 from "@/content/modules/s1.json";
import s2 from "@/content/modules/s2.json";
import landkarteRoh from "@/content/landkarte.json";

// Neues Modul = neue JSON-Datei + ein Eintrag in dieser Liste. Sonst kein Code.
const roheModule: unknown[] = [f1, f2, s1, s2];

// Validierung bei Import-Zeit: ein fehlerhaftes Modul lässt den Build scheitern.
export const alleModule: Modul[] = roheModule.map((m) => validateModul(m));

export function getModul(id: string): Modul | undefined {
  return alleModule.find((m) => m.id === id);
}

export const landkarte = landkarteRoh as unknown as Landkarte;
