"use client";

import { useEffect, useId, useRef, useState } from "react";
import { storage } from "@/lib/storage";

/** Einmaliger 0–10-Regler, der auf einen `speichern`-Pfad schreibt
 *  (Modul 2: die vier Fenster → baseline.koerper/gedanken/stimmung/verhalten).
 *  `frage` = die Frage darüber, `skala` = die Pol-Beschriftung „a ↔ b". */
export default function BaselineRegler({
  frage,
  skala,
  speichern,
}: {
  frage: string;
  skala?: string;
  speichern: string;
}) {
  const id = useId();
  const [links, rechts] = (skala ?? "").split("↔").map((teil) => teil.trim());
  const inputRef = useRef<HTMLInputElement>(null);
  const [wert, setWert] = useState(5);
  const [beruehrt, setBeruehrt] = useState(false);

  // Vorhandenen Wert laden, wenn die Person zurückkommt.
  useEffect(() => {
    const v = storage.leseePfad(speichern);
    if (typeof v === "number") {
      setWert(v);
      setBeruehrt(true);
    }
  }, [speichern]);

  // Speichern beim Loslassen (natives change), nicht bei jedem input.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const speichernFn = () => storage.speicherePfad(speichern, Number(el.value));
    el.addEventListener("change", speichernFn);
    return () => el.removeEventListener("change", speichernFn);
  }, [speichern]);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-medium text-tinte">
        {frage}
      </label>
      <input
        ref={inputRef}
        id={id}
        type="range"
        min={0}
        max={10}
        step={1}
        value={wert}
        aria-label={skala ? `${frage} (${skala})` : frage}
        data-beruehrt={beruehrt}
        onChange={(e) => {
          setWert(Number(e.target.value));
          setBeruehrt(true);
        }}
        className="h-2 w-full cursor-pointer accent-salbei-tief"
      />
      {links || rechts ? (
        <div
          aria-hidden="true"
          className="flex justify-between text-sm text-tinte-sanft"
        >
          <span>{links}</span>
          <span>{rechts}</span>
        </div>
      ) : null}
    </div>
  );
}
