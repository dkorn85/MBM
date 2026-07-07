"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type {
  Interaktion,
  Modul,
  Schritt,
  SchrittTyp,
} from "@/lib/module-schema";
import { storage } from "@/lib/storage";
import AudioPlayer from "./AudioPlayer";
import Bloecke from "./Bloecke";
import ExperimentMerken from "./ExperimentMerken";
import Fortschritt from "./Fortschritt";
import JournalFeld from "./JournalFeld";
import SpuerRegler from "./SpuerRegler";

/** Selbsttest auf mehreren Achsen (0–10) + optionales offenes Feld.
 *  Spiegel, keine Diagnose. Speichert Baseline bzw. Nachher-Messung lokal;
 *  lädt vorhandene Werte, wenn die Person zurückkommt. */
function SelbsttestFeld({
  interaktion,
}: {
  interaktion: Extract<Interaktion, { art: "selbsttest" }>;
}) {
  const textId = useId();
  const wann = interaktion.wann ?? "baseline";
  const [werte, setWerte] = useState<Record<string, number>>(() =>
    Object.fromEntries(interaktion.achsen.map((a) => [a.schluessel, 5])),
  );
  const [anliegen, setAnliegen] = useState("");
  const [gespeichert, setGespeichert] = useState(false);

  useEffect(() => {
    const snap = storage.getSelbsttest(wann);
    if (snap) {
      setWerte((alt) => ({ ...alt, ...snap.achsen }));
      if (typeof snap.anliegen === "string") setAnliegen(snap.anliegen);
      setGespeichert(true);
    }
  }, [wann]);

  const festhalten = () => {
    storage.setSelbsttest({
      wann,
      achsen: werte,
      anliegen: anliegen.trim() === "" ? undefined : anliegen.trim(),
      erstellt: new Date().toISOString(),
    });
    setGespeichert(true);
  };

  return (
    <div className="space-y-6 rounded-2xl border border-linie bg-flaeche p-5">
      <div className="space-y-5">
        {interaktion.achsen.map((achse) => {
          const [links, rechts] = achse.label.split("↔").map((t) => t.trim());
          return (
            <div key={achse.schluessel} className="space-y-2">
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={werte[achse.schluessel] ?? 5}
                aria-label={achse.label}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setWerte((alt) => ({ ...alt, [achse.schluessel]: v }));
                  setGespeichert(false);
                }}
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
        })}
      </div>

      {interaktion.absichtFrage ? (
        <div className="space-y-2">
          <label htmlFor={textId} className="block font-medium text-tinte">
            {interaktion.absichtFrage}
          </label>
          <textarea
            id={textId}
            rows={2}
            value={anliegen}
            onChange={(e) => {
              setAnliegen(e.target.value);
              setGespeichert(false);
            }}
            placeholder="Ein Wort oder Satz genügt — ganz freiwillig."
            className="w-full resize-y rounded-2xl border border-linie bg-grund px-4 py-3 text-tinte placeholder:text-tinte-sanft/70 focus-visible:border-salbei-tief"
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={festhalten}
          className="inline-flex min-h-11 items-center rounded-xl bg-salbei-tief px-5 py-2 font-medium text-grund transition-colors duration-200 ease-out hover:bg-salbei"
        >
          Festhalten
        </button>
        {gespeichert ? (
          <span className="text-sm text-tinte-sanft">
            Gespeichert — bleibt auf deinem Gerät. Ein Spiegel, keine Bewertung.
          </span>
        ) : null}
      </div>
    </div>
  );
}

function Interaktionen({
  liste,
  modulId,
  schrittTyp,
}: {
  liste: Interaktion[];
  modulId: string;
  schrittTyp: SchrittTyp;
}) {
  return (
    <div className="space-y-6">
      {liste.map((it, i) => {
        if (it.art === "journal") {
          return <JournalFeld key={i} frage={it.frage} modulId={modulId} />;
        }
        if (it.art === "selbsttest") {
          return <SelbsttestFeld key={i} interaktion={it} />;
        }
        const wann = schrittTyp === "nachspueren" ? "nachher" : "vorher";
        const vergleich =
          schrittTyp === "nachspueren" && it.vorherNachher === true;
        return (
          <SpuerRegler
            key={i}
            label={it.label}
            modulId={modulId}
            wann={wann}
            vergleich={vergleich}
          />
        );
      })}
    </div>
  );
}

/** Nachspüren: erst Stille, dann erscheinen die restlichen Blöcke + Interaktionen. */
function NachspuerenSchritt({
  schritt,
  modul,
}: {
  schritt: Schritt;
  modul: Modul;
}) {
  const [stilleVorbei, setStilleVorbei] = useState(false);

  useEffect(() => {
    const sekunden = schritt.stilleSek ?? 15;
    const timer = window.setTimeout(() => setStilleVorbei(true), sekunden * 1000);
    return () => window.clearTimeout(timer);
  }, [schritt.stilleSek]);

  const [ersterBlock, ...weitereBloecke] = schritt.bloecke;

  return (
    <div className="space-y-6">
      {schritt.audio ? (
        <AudioPlayer
          src={schritt.audio}
          schrittTitel={schritt.titel}
          modulTitel={modul.titel}
        />
      ) : null}

      <Bloecke bloecke={[ersterBlock]} />

      {stilleVorbei ? (
        <div className="mbm-stille-fade space-y-6">
          {weitereBloecke.length > 0 ? <Bloecke bloecke={weitereBloecke} /> : null}
          {schritt.interaktionen && schritt.interaktionen.length > 0 ? (
            <Interaktionen
              liste={schritt.interaktionen}
              modulId={modul.id}
              schrittTyp={schritt.typ}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Der typ-abhängige Inhalt eines Schritts (ohne Überschrift/Navigation). */
function SchrittKoerper({
  schritt,
  modul,
  vorherNachherLabel,
}: {
  schritt: Schritt;
  modul: Modul;
  vorherNachherLabel: string | null;
}) {
  const audio = schritt.audio ? (
    <AudioPlayer
      src={schritt.audio}
      schrittTitel={schritt.titel}
      modulTitel={modul.titel}
    />
  ) : null;

  if (schritt.typ === "nachspueren") {
    return <NachspuerenSchritt schritt={schritt} modul={modul} />;
  }

  if (schritt.typ === "experiment") {
    return (
      <div className="space-y-6">
        <Bloecke bloecke={schritt.bloecke} />
        {schritt.experiment ? (
          <ExperimentMerken
            modulId={modul.id}
            titel={modul.titel}
            experiment={schritt.experiment}
          />
        ) : null}
      </div>
    );
  }

  if (schritt.typ === "erleben") {
    return (
      <div className="space-y-6">
        {vorherNachherLabel ? (
          <div className="space-y-3 rounded-2xl border border-linie bg-flaeche p-5">
            <p className="text-tinte-sanft">
              Wenn du magst, halte kurz fest, wie du gerade da bist. Ganz
              freiwillig.
            </p>
            <SpuerRegler
              label={vorherNachherLabel}
              modulId={modul.id}
              wann="vorher"
            />
          </div>
        ) : null}
        {audio}
        <Bloecke bloecke={schritt.bloecke} />
        {schritt.interaktionen && schritt.interaktionen.length > 0 ? (
          <Interaktionen
            liste={schritt.interaktionen}
            modulId={modul.id}
            schrittTyp={schritt.typ}
          />
        ) : null}
      </div>
    );
  }

  // funke, warum, weitergehen
  return (
    <div className="space-y-6">
      {audio}
      <Bloecke bloecke={schritt.bloecke} />
    </div>
  );
}

export default function ModulPlayer({ modul }: { modul: Modul }) {
  const [schrittIndex, setSchrittIndex] = useState(0);
  const ueberschriftRef = useRef<HTMLHeadingElement>(null);
  const ersterRender = useRef(true);

  const schritt = modul.schritte[schrittIndex];
  const anzahl = modul.schritte.length;
  const letzterSchritt = schrittIndex === anzahl - 1;

  // Label des Vorher/Nachher-Sliders (für den Vorher-Spür-Check im Erleben).
  const vorherNachherLabel =
    modul.schritte
      .flatMap((s) => s.interaktionen ?? [])
      .find(
        (i): i is Extract<Interaktion, { art: "slider" }> =>
          i.art === "slider" && i.vorherNachher === true,
      )?.label ?? null;

  // Beim ersten Anzeigen: Status offen → begonnen (still).
  useEffect(() => {
    if (storage.getModulStatus(modul.id) === "offen") {
      storage.setModulStatus(modul.id, "begonnen");
    }
  }, [modul.id]);

  // Beim Erreichen von „weitergehen": Status → abgeschlossen (still).
  useEffect(() => {
    if (schritt.typ === "weitergehen") {
      storage.setModulStatus(modul.id, "abgeschlossen");
    }
  }, [schritt.typ, modul.id]);

  // Nach jedem Schrittwechsel Fokus auf die Überschrift (nicht beim ersten Render).
  useEffect(() => {
    if (ersterRender.current) {
      ersterRender.current = false;
      return;
    }
    ueberschriftRef.current?.focus();
  }, [schrittIndex]);

  const zurueck = () => setSchrittIndex((i) => Math.max(0, i - 1));
  const weiter = () => setSchrittIndex((i) => Math.min(anzahl - 1, i + 1));

  return (
    <div className="space-y-8">
      <Fortschritt titel={modul.schritte.map((s) => s.titel)} aktiv={schrittIndex} />

      <div key={schrittIndex} className="mbm-schritt-fade space-y-6">
        {schritt.bild ? (
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={schritt.bild}
              alt=""
              aria-hidden="true"
              className="mbm-deko-piktogramm pointer-events-none w-32 select-none sm:w-36"
            />
          </div>
        ) : null}
        <h2
          ref={ueberschriftRef}
          tabIndex={-1}
          className="text-2xl focus:outline-none"
        >
          {schritt.titel}
        </h2>
        <SchrittKoerper
          schritt={schritt}
          modul={modul}
          vorherNachherLabel={
            schritt.typ === "erleben" ? vorherNachherLabel : null
          }
        />
      </div>

      <nav
        aria-label="Schritt-Navigation"
        className="flex items-center justify-between gap-4 border-t border-linie pt-6"
      >
        {schrittIndex > 0 ? (
          <button
            type="button"
            onClick={zurueck}
            className="inline-flex min-h-11 items-center rounded-xl px-4 py-2 text-tinte-sanft transition-colors duration-200 ease-out hover:text-tinte"
          >
            Zurück
          </button>
        ) : (
          <span />
        )}

        {letzterSchritt ? (
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-xl bg-salbei-tief px-5 py-2 font-medium text-grund transition-colors duration-200 ease-out hover:bg-salbei"
          >
            Zur Übersicht
          </Link>
        ) : (
          <button
            type="button"
            onClick={weiter}
            className="inline-flex min-h-11 items-center rounded-xl bg-salbei-tief px-5 py-2 font-medium text-grund transition-colors duration-200 ease-out hover:bg-salbei"
          >
            Weiter
          </button>
        )}
      </nav>
    </div>
  );
}
