"use client";

import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";

/** Chips zum Antippen, eine Auswahl (Modul 1: „wie fühlst du dich damit?").
 *  Ohne `speichern` landet die Wahl im leichten Auswahl-Store (überlebt Reload). */
export default function AuswahlFeld({
  optionen,
  hinweis,
  speichern,
  speicherKey,
}: {
  optionen: string[];
  hinweis?: string;
  speichern?: string;
  speicherKey: string;
}) {
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);

  useEffect(() => {
    const vorhanden = speichern
      ? storage.leseePfad(speichern)
      : storage.getAuswahl(speicherKey);
    if (typeof vorhanden === "string") setGewaehlt(vorhanden);
  }, [speichern, speicherKey]);

  const waehle = (opt: string) => {
    const neu = gewaehlt === opt ? null : opt;
    setGewaehlt(neu);
    if (!neu) return; // Abwahl lässt den letzten Wert stehen
    if (speichern) storage.speicherePfad(speichern, neu);
    else storage.setAuswahl(speicherKey, neu);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group">
        {optionen.map((opt) => {
          const aktiv = gewaehlt === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => waehle(opt)}
              aria-pressed={aktiv}
              className={`min-h-11 rounded-full border px-4 py-2 text-sm transition duration-200 ease-ruhig active:scale-[0.98] ${
                aktiv
                  ? "border-salbei-tief bg-salbei-tief text-grund"
                  : "border-linie bg-flaeche text-tinte hover:border-salbei"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {hinweis ? <p className="text-sm text-tinte-sanft">{hinweis}</p> : null}
    </div>
  );
}
