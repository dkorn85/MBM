"use client";

import { useId, useState } from "react";
import { storage } from "@/lib/storage";

export default function JournalFeld({
  frage,
  modulId,
}: {
  frage: string;
  modulId: string;
}) {
  const id = useId();
  const [wert, setWert] = useState("");
  const [gespeichert, setGespeichert] = useState(false);

  const kannFesthalten = wert.trim() !== "";

  const festhalten = () => {
    if (!kannFesthalten) return;
    storage.addJournal({
      modulId,
      frage,
      text: wert.trim(),
      erstellt: new Date().toISOString(),
    });
    setGespeichert(true);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-medium text-tinte">
        {frage}
      </label>
      <textarea
        id={id}
        value={wert}
        onChange={(e) => {
          setWert(e.target.value);
          setGespeichert(false);
        }}
        rows={4}
        placeholder="Ein Satz genügt — nur für dich."
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
      <p className="text-sm text-tinte-sanft">
        Bleibt auf diesem Gerät. Du kannst das Feld auch leer lassen.
      </p>
    </div>
  );
}
