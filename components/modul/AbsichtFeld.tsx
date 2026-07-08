"use client";

import { useEffect, useId, useState } from "react";
import { storage } from "@/lib/storage";

/** Antippbare Vorlagen füllen ein editierbares Feld (Modul 2: die Absicht).
 *  Speichert auf `speichern` (z.B. "absicht"); jederzeit änderbar. */
export default function AbsichtFeld({
  vorlagen,
  platzhalter,
  editierbar = true,
  speichern,
}: {
  vorlagen: string[];
  platzhalter?: string;
  editierbar?: boolean;
  speichern?: string;
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

  const waehleVorlage = (v: string) => {
    setWert(v);
    setGespeichert(false);
  };

  const festhalten = () => {
    const t = wert.trim();
    if (t === "") return;
    if (speichern) storage.speicherePfad(speichern, t);
    setGespeichert(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {vorlagen.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => waehleVorlage(v)}
            className="rounded-2xl border border-linie bg-flaeche px-4 py-2 text-left text-sm text-tinte transition duration-200 ease-ruhig hover:border-salbei active:scale-[0.99]"
          >
            {v}
          </button>
        ))}
      </div>
      <textarea
        id={id}
        rows={2}
        value={wert}
        readOnly={!editierbar}
        onChange={(e) => {
          setWert(e.target.value);
          setGespeichert(false);
        }}
        placeholder={platzhalter ?? "In deinen Worten …"}
        aria-label="Deine Absicht"
        className="w-full resize-y rounded-2xl border border-linie bg-grund px-4 py-3 text-tinte placeholder:text-tinte-sanft/70 focus-visible:border-salbei-tief"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={festhalten}
          disabled={wert.trim() === ""}
          className="inline-flex min-h-11 items-center rounded-xl bg-salbei-tief px-4 py-2 font-medium text-grund transition duration-200 ease-ruhig hover:bg-salbei active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-linie disabled:text-tinte-sanft"
        >
          Festhalten
        </button>
        {gespeichert ? (
          <span className="text-sm text-tinte-sanft" role="status">
            Gespeichert — begleitet dich leise. Jederzeit änderbar.
          </span>
        ) : null}
      </div>
    </div>
  );
}
