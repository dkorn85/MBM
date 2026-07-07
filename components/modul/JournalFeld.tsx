"use client";

import { useId, useState } from "react";

export default function JournalFeld({ frage }: { frage: string }) {
  const id = useId();
  // Kein Persistieren in P1 — Speicherung kommt in P3.
  const [wert, setWert] = useState("");

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-medium text-tinte">
        {frage}
      </label>
      <textarea
        id={id}
        value={wert}
        onChange={(e) => setWert(e.target.value)}
        rows={4}
        placeholder="Ein Satz genügt — nur für dich."
        className="w-full resize-y rounded-2xl border border-linie bg-flaeche px-4 py-3 text-tinte placeholder:text-tinte-sanft/70 focus-visible:border-salbei-tief"
      />
      <p className="text-sm text-tinte-sanft">
        Bleibt auf diesem Gerät. Du kannst das Feld auch leer lassen.
      </p>
    </div>
  );
}
