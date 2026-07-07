"use client";

import { useId, useState } from "react";

export default function SpuerRegler({ label }: { label: string }) {
  const id = useId();
  const [links, rechts] = label.split("↔").map((teil) => teil.trim());

  // Startwert Mitte; bis zur ersten Berührung „nicht beantwortet".
  // Kein Persistieren in P1 — Speicherung kommt in P3.
  const [wert, setWert] = useState(5);
  const [beruehrt, setBeruehrt] = useState(false);

  return (
    <div className="space-y-2">
      <input
        id={id}
        type="range"
        min={0}
        max={10}
        step={1}
        value={wert}
        aria-label={label}
        onChange={(e) => {
          setWert(Number(e.target.value));
          setBeruehrt(true);
        }}
        data-beruehrt={beruehrt}
        className="h-2 w-full cursor-pointer accent-salbei-tief"
      />
      <div
        aria-hidden="true"
        className="flex justify-between text-sm text-tinte-sanft"
      >
        <span>{links}</span>
        <span>{rechts}</span>
      </div>
    </div>
  );
}
