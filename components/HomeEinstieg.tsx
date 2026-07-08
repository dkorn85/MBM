"use client";

import { useEffect, useState } from "react";
import { storage, type Modus } from "@/lib/storage";

type ModusOption = { id: Modus; label: string; sub: string };

/**
 * Einstieg der Startseite: ein ruhiger Umschalter „Dem Weg folgen" ↔ „Frei
 * streifen" und die beiden Einstiege (der Weg + der Needs-Einstieg). Der Modus
 * verschiebt nur die Betonung/Reihenfolge — kein harter Umbau, keine Sperre:
 *  · „follow": der Weg führt (oben, voll), der Needs-Einstieg ist ein leiser
 *    Nebeneingang darunter.
 *  · „roam": der Needs-Einstieg rückt nach oben und bekommt einen warmen
 *    Rahmen; der Weg tritt sanft zurück.
 * Präferenz liegt lokal (storage.getModus/setModus). Serverseitig gerenderte
 * Knoten (needs, weg) werden hier nur angeordnet.
 */
export default function HomeEinstieg({
  modes,
  needs,
  weg,
}: {
  modes: ModusOption[];
  needs: React.ReactNode;
  weg: React.ReactNode;
}) {
  const [modus, setModus] = useState<Modus>("follow");

  useEffect(() => {
    setModus(storage.getModus());
  }, []);

  const waehle = (m: Modus) => {
    setModus(m);
    storage.setModus(m);
  };

  const roam = modus === "roam";
  const aktiv = modes.find((m) => m.id === modus);

  const needsBlock = (
    <div
      className={
        roam
          ? "rounded-3xl bg-panel-ankommen p-6 shadow-sm transition-shadow sm:p-8"
          : ""
      }
    >
      {needs}
    </div>
  );

  const wegBlock = (
    <div className={roam ? "opacity-95" : ""}>{weg}</div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-label text-xs uppercase tracking-[0.16em] text-salbei-tief">
          Wie möchtest du gehen?
        </p>
        <div
          role="group"
          aria-label="Ansicht wählen"
          className="inline-flex rounded-full border border-linie bg-flaeche p-1"
        >
          {modes.map((m) => {
            const an = m.id === modus;
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={an}
                onClick={() => waehle(m.id)}
                className={`inline-flex min-h-11 items-center rounded-full px-4 py-1.5 text-sm transition-colors duration-200 ease-out ${
                  an
                    ? "bg-salbei-tief text-grund"
                    : "text-tinte-sanft hover:text-salbei-tief"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {aktiv?.sub ? (
        <p className="-mt-6 text-sm text-tinte-sanft">{aktiv.sub}</p>
      ) : null}

      {roam ? (
        <>
          {needsBlock}
          {wegBlock}
        </>
      ) : (
        <>
          {wegBlock}
          {needsBlock}
        </>
      )}
    </div>
  );
}
