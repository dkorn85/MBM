"use client";

import { useEffect, useId, useRef, useState } from "react";
import { storage } from "@/lib/storage";
import VorherNachher from "./VorherNachher";

export default function SpuerRegler({
  label,
  modulId,
  wann,
  vergleich = false,
}: {
  label: string;
  modulId: string;
  wann: "vorher" | "nachher";
  /** Zeigt unterhalb des Reglers die Vorher/Nachher-Linie (nur im Nachspüren). */
  vergleich?: boolean;
}) {
  const id = useId();
  const [links, rechts] = label.split("↔").map((teil) => teil.trim());
  const inputRef = useRef<HTMLInputElement>(null);

  // Startwert Mitte; falls schon ein Wert gespeichert ist, diesen übernehmen.
  const [wert, setWert] = useState(5);
  const [beruehrt, setBeruehrt] = useState(false);

  useEffect(() => {
    const vorhanden = storage
      .getSpuerWerte(modulId)
      .find((w) => w.wann === wann);
    if (vorhanden) {
      setWert(vorhanden.wert);
      setBeruehrt(true);
    }
  }, [modulId, wann]);

  // Speichern beim Loslassen: natives change-Event (nicht bei jedem input).
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const speichern = () => {
      storage.setSpuerWert({
        modulId,
        wann,
        wert: Number(el.value),
        erstellt: new Date().toISOString(),
      });
    };
    el.addEventListener("change", speichern);
    return () => el.removeEventListener("change", speichern);
  }, [modulId, wann]);

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
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
      {vergleich ? <VorherNachher modulId={modulId} /> : null}
    </div>
  );
}
