"use client";

import { useEffect, useRef, useState } from "react";
import { landkarte } from "@/lib/content";
import { storage, type LoopEintrag } from "@/lib/storage";

// Lokales Tagesdatum (YYYY-MM-DD) — nur im Browser bestimmt.
function heuteDatum(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const tt = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${tt}`;
}

/** Ein kleiner Regler (0–10). Label wird an „↔" gesplittet. */
function Regler({
  label,
  wert,
  onChange,
}: {
  label: string;
  wert: number;
  onChange: (v: number) => void;
}) {
  const [links, rechts] = label.split("↔").map((t) => t.trim());
  return (
    <div className="space-y-1.5">
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={wert}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer accent-salbei-tief"
      />
      <div
        aria-hidden="true"
        className="flex justify-between text-xs text-tinte-sanft"
      >
        <span>{links}</span>
        <span>{rechts}</span>
      </div>
    </div>
  );
}

/** Der tägliche Puls: Spür-Check · Glücksmoment · Anker. Kein Druck, kein Streak. */
export default function LoopPuls() {
  const { title, subtitle } = landkarte.loop;
  const [datum, setDatum] = useState<string | null>(null);
  const [eintrag, setEintrag] = useState<LoopEintrag | null>(null);
  const [glueck, setGlueck] = useState("");
  const [glueckGespeichert, setGlueckGespeichert] = useState(false);
  // Einmaliger, weicher Bestätigungs-Moment beim frischen Setzen des Ankers.
  const [ankerFunke, setAnkerFunke] = useState(false);
  const funkeTimer = useRef<number | null>(null);

  useEffect(() => {
    const d = heuteDatum();
    setDatum(d);
    const e = storage.getLoopEintrag(d);
    setEintrag(e);
    if (e?.gluecksmoment) {
      setGlueck(e.gluecksmoment);
      setGlueckGespeichert(true);
    }
  }, []);

  useEffect(
    () => () => {
      if (funkeTimer.current) window.clearTimeout(funkeTimer.current);
    },
    [],
  );

  const patch = (p: Partial<Omit<LoopEintrag, "datum">>) => {
    if (!datum) return;
    storage.setLoopEintrag(datum, p);
    setEintrag(storage.getLoopEintrag(datum));
  };

  const koerper = eintrag?.spuerKoerper ?? 5;
  const stimmung = eintrag?.spuerStimmung ?? 5;
  const ankerGemacht = eintrag?.ankerGemacht === true;

  const ankerUmschalten = () => {
    const neu = !ankerGemacht;
    patch({ ankerGemacht: neu });
    // Nur beim frischen Setzen aufleuchten — nicht beim Zurücknehmen.
    if (neu) {
      setAnkerFunke(true);
      if (funkeTimer.current) window.clearTimeout(funkeTimer.current);
      funkeTimer.current = window.setTimeout(() => setAnkerFunke(false), 700);
    }
  };

  return (
    <section className="space-y-5 rounded-3xl border border-linie bg-gradient-to-br from-panel-wahrnehmen to-panel-weit p-6 shadow-sm sm:p-8">
      <div className="space-y-1">
        <p className="font-label text-xs uppercase tracking-[0.16em] text-salbei-tief">
          Jeden Tag ein kleiner Moment
        </p>
        <h2 className="text-2xl">{title}</h2>
        <p className="text-tinte-sanft">{subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Spür-Check */}
        <div className="space-y-3 rounded-2xl border border-linie bg-grund p-4 shadow-sm">
          <p className="font-medium text-tinte">Spür-Check</p>
          <Regler
            label="Körper: ruhig ↔ angespannt"
            wert={koerper}
            onChange={(v) => patch({ spuerKoerper: v })}
          />
          <Regler
            label="Stimmung: schwer ↔ leicht"
            wert={stimmung}
            onChange={(v) => patch({ spuerStimmung: v })}
          />
        </div>

        {/* Glücksmoment */}
        <div className="space-y-2 rounded-2xl border border-linie bg-grund p-4 shadow-sm">
          <p className="font-medium text-tinte">Glücksmoment</p>
          <label htmlFor="glueck" className="block text-sm text-tinte-sanft">
            Was war heute schön?
          </label>
          <textarea
            id="glueck"
            rows={2}
            value={glueck}
            onChange={(e) => {
              setGlueck(e.target.value);
              setGlueckGespeichert(false);
            }}
            placeholder="Ein kleiner Moment genügt."
            className="w-full resize-y rounded-xl border border-linie bg-grund px-3 py-2 text-sm text-tinte placeholder:text-tinte-sanft/70 focus-visible:border-salbei-tief"
          />
          <button
            type="button"
            onClick={() => {
              patch({
                gluecksmoment: glueck.trim() === "" ? undefined : glueck.trim(),
              });
              setGlueckGespeichert(true);
            }}
            className="inline-flex min-h-11 items-center rounded-lg bg-salbei-tief px-4 py-1.5 text-sm font-medium text-grund transition duration-200 ease-ruhig hover:bg-salbei active:scale-[0.97]"
          >
            Festhalten
          </button>
          {glueckGespeichert && glueck.trim() !== "" ? (
            <p className="text-xs text-tinte-sanft">Festgehalten.</p>
          ) : null}
        </div>

        {/* Anker */}
        <div className="space-y-2 rounded-2xl border border-linie bg-grund p-4 shadow-sm">
          <p className="font-medium text-tinte">Anker</p>
          <p className="text-sm text-tinte-sanft">
            Deine kleine Übung, an eine Alltagsroutine gekoppelt.
          </p>
          <button
            type="button"
            aria-pressed={ankerGemacht}
            onClick={ankerUmschalten}
            className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition duration-200 ease-ruhig active:scale-[0.97] ${
              ankerFunke ? "mbm-anker-bestaetigt " : ""
            }${
              ankerGemacht
                ? "border-salbei bg-salbei/20 text-salbei-tief"
                : "border-linie text-tinte-sanft hover:border-salbei"
            }`}
          >
            <span aria-hidden="true">{ankerGemacht ? "✓" : "○"}</span>
            {ankerGemacht ? "Heute gemacht" : "Heute noch offen"}
          </button>
        </div>
      </div>
    </section>
  );
}
