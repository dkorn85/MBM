"use client";

import { useEffect, useId, useState } from "react";
import { storage } from "@/lib/storage";

/** Freitext-Notiz. `frage` NUR anzeigen, wenn gesetzt: im Nachspüren steht die
 *  Frage schon als 2. Satz im Block (dann kein frage-Feld → nur Platzhalter),
 *  im Erleben (Anliegen) ist die frage die einzige Quelle → als Label zeigen.
 *  Mit `speichern` (z.B. "anliegen") landet der Text im Baseline-Snapshot,
 *  sonst als Journal-Eintrag. */
export default function JournalFeld({
  frage,
  platzhalter,
  speichern,
  modulId,
}: {
  frage?: string;
  platzhalter?: string;
  speichern?: string;
  modulId: string;
}) {
  const id = useId();
  const [wert, setWert] = useState("");
  const [gespeichert, setGespeichert] = useState(false);

  useEffect(() => {
    if (!speichern) return;
    const v = storage.leseePfad(speichern);
    if (typeof v === "string") {
      setWert(v);
      setGespeichert(true);
    }
  }, [speichern]);

  const kannFesthalten = wert.trim() !== "";

  const festhalten = () => {
    if (!kannFesthalten) return;
    if (speichern) {
      storage.speicherePfad(speichern, wert.trim());
    } else {
      storage.addJournal({
        modulId,
        frage: frage ?? "",
        text: wert.trim(),
        erstellt: new Date().toISOString(),
      });
    }
    setGespeichert(true);
  };

  return (
    <div className="space-y-2">
      {frage ? (
        <label htmlFor={id} className="block font-medium text-tinte">
          {frage}
        </label>
      ) : null}
      <textarea
        id={id}
        value={wert}
        onChange={(e) => {
          setWert(e.target.value);
          setGespeichert(false);
        }}
        rows={4}
        placeholder={platzhalter ?? "Ein Satz genügt — nur für dich."}
        aria-label={frage ?? platzhalter ?? "Deine Notiz"}
        className="w-full resize-y rounded-2xl border border-linie bg-flaeche px-4 py-3 text-tinte placeholder:text-tinte-sanft/70 focus-visible:border-salbei-tief"
      />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={festhalten}
          disabled={!kannFesthalten}
          className="inline-flex min-h-11 items-center rounded-xl bg-salbei-tief px-4 py-2 font-medium text-grund transition duration-200 ease-ruhig hover:bg-salbei active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-linie disabled:text-tinte-sanft"
        >
          Festhalten
        </button>
        {gespeichert ? (
          <p className="text-sm text-tinte-sanft" role="status">
            Festgehalten. Bleibt nur auf deinem Gerät.
          </p>
        ) : null}
      </div>
      {!gespeichert ? (
        <p className="text-sm text-tinte-sanft">
          Bleibt auf diesem Gerät. Du kannst das Feld auch leer lassen.
        </p>
      ) : null}
    </div>
  );
}
