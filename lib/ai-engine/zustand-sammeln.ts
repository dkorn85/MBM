// Baut den anonymen Zustand aus den bereits lokal vorhandenen App-Signalen
// (localStorage) — nichts Neues abgefragt (research/02). Läuft im Client.

import { storage, type SelbsttestSnapshot } from "@/lib/storage";
import type { Achsen, Zustand } from "./types";

function achsen(snap: SelbsttestSnapshot | null): Achsen | undefined {
  if (!snap) return undefined;
  const a = snap.achsen || {};
  return {
    koerper: a.koerper,
    gedanken: a.gedanken,
    stimmung: a.stimmung,
    verhalten: a.verhalten,
  };
}

export function sammleZustand(): Zustand {
  const baseline = storage.getSelbsttest("baseline");
  const nachher = storage.getSelbsttest("nachher");
  return {
    baseline: achsen(baseline),
    nachher: achsen(nachher),
    anliegen: baseline?.anliegen,
    loop: storage.getLoopHistorie().map((l) => ({
      spuerStimmung: l.spuerStimmung,
      gluecksmoment: l.gluecksmoment,
      ankerGemacht: l.ankerGemacht,
    })),
    journal: storage.getJournal().map((j) => ({ text: j.text })),
    abgeschlossen: storage.getAbgeschlossene(),
  };
}
