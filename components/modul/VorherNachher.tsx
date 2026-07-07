"use client";

import { storage } from "@/lib/storage";
import { useMbmWert } from "@/lib/use-mbm-storage";

type Werte = { vorher: number | null; nachher: number | null };

function leseWerte(modulId: string): Werte {
  const alle = storage.getSpuerWerte(modulId);
  const vorher = alle.find((w) => w.wann === "vorher")?.wert ?? null;
  const nachher = alle.find((w) => w.wann === "nachher")?.wert ?? null;
  return { vorher, nachher };
}

/** Position auf der Linie in Prozent (Skala 0–10). */
function prozent(wert: number): number {
  return Math.min(100, Math.max(0, (wert / 10) * 100));
}

/**
 * Ruhige horizontale Linie mit zwei Punkten (vorhin / jetzt). Nur sichtbar,
 * wenn beide Werte existieren. Keine Zahlen, keine Bewertung.
 */
export default function VorherNachher({ modulId }: { modulId: string }) {
  const werte = useMbmWert<Werte>(
    () => leseWerte(modulId),
    { vorher: null, nachher: null },
    [modulId],
  );

  if (werte.vorher === null || werte.nachher === null) return null;

  const vor = prozent(werte.vorher);
  const jetzt = prozent(werte.nachher);

  return (
    <div className="space-y-3 pt-2" aria-hidden="true">
      <div className="relative h-2 rounded-full border border-linie bg-flaeche">
        <span
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tinte-sanft"
          style={{ left: `${vor}%` }}
        />
        <span
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-salbei-tief"
          style={{ left: `${jetzt}%` }}
        />
      </div>
      <div className="relative h-5 text-sm text-tinte-sanft">
        <span
          className="absolute -translate-x-1/2 whitespace-nowrap"
          style={{ left: `${vor}%` }}
        >
          vorhin
        </span>
        <span
          className="absolute -translate-x-1/2 whitespace-nowrap"
          style={{ left: `${jetzt}%` }}
        >
          jetzt
        </span>
      </div>
    </div>
  );
}
