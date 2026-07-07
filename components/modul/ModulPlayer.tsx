"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Interaktion, Modul, Schritt } from "@/lib/module-schema";
import AudioPlayer from "./AudioPlayer";
import Bloecke from "./Bloecke";
import ExperimentKarte from "./ExperimentKarte";
import Fortschritt from "./Fortschritt";
import JournalFeld from "./JournalFeld";
import SpuerRegler from "./SpuerRegler";

function Interaktionen({ liste }: { liste: Interaktion[] }) {
  return (
    <div className="space-y-6">
      {liste.map((it, i) => {
        if (it.art === "journal") {
          return <JournalFeld key={i} frage={it.frage} />;
        }
        return <SpuerRegler key={i} label={it.label} />;
      })}
    </div>
  );
}

/** Nachspüren: erst Stille, dann erscheinen die restlichen Blöcke + Interaktionen. */
function NachspuerenSchritt({
  schritt,
  modulTitel,
}: {
  schritt: Schritt;
  modulTitel: string;
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
          modulTitel={modulTitel}
        />
      ) : null}

      <Bloecke bloecke={[ersterBlock]} />

      {stilleVorbei ? (
        <div className="mbm-stille-fade space-y-6">
          {weitereBloecke.length > 0 ? <Bloecke bloecke={weitereBloecke} /> : null}
          {schritt.interaktionen && schritt.interaktionen.length > 0 ? (
            <Interaktionen liste={schritt.interaktionen} />
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
    return <NachspuerenSchritt schritt={schritt} modulTitel={modul.titel} />;
  }

  if (schritt.typ === "experiment") {
    return (
      <div className="space-y-6">
        <Bloecke bloecke={schritt.bloecke} />
        {schritt.experiment ? (
          <ExperimentKarte experiment={schritt.experiment} />
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
            <SpuerRegler label={vorherNachherLabel} />
          </div>
        ) : null}
        {audio}
        <Bloecke bloecke={schritt.bloecke} />
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
