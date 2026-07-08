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
import AbsichtFeld from "./AbsichtFeld";
import AudioPlayer from "./AudioPlayer";
import AuswahlFeld from "./AuswahlFeld";
import BaselineRegler from "./BaselineRegler";
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
  const [baseline, setBaseline] = useState<Record<string, number> | null>(null);
  // Welche Achsen wurden angefasst? Unberührte Regler bleiben dezent (Startwert
  // 5 ist kein gesetzter Wert).
  const [beruehrt, setBeruehrt] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const snap = storage.getSelbsttest(wann);
    if (snap) {
      setWerte((alt) => ({ ...alt, ...snap.achsen }));
      setBeruehrt(new Set(Object.keys(snap.achsen)));
      if (typeof snap.anliegen === "string") setAnliegen(snap.anliegen);
      setGespeichert(true);
    }
    // Für die Nachher-Messung (Modul „Rückblick") die Baseline zum Vergleich laden.
    if (wann === "nachher") {
      const b = storage.getSelbsttest("baseline");
      setBaseline(b?.achsen ?? null);
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
                data-beruehrt={beruehrt.has(achse.schluessel)}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setWerte((alt) => ({ ...alt, [achse.schluessel]: v }));
                  setBeruehrt((alt) => new Set(alt).add(achse.schluessel));
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
          className="inline-flex min-h-11 items-center rounded-xl bg-salbei-tief px-5 py-2 font-medium text-grund transition duration-200 ease-ruhig hover:bg-salbei active:scale-[0.98]"
        >
          Festhalten
        </button>
        {gespeichert ? (
          <span className="text-sm text-tinte-sanft">
            Gespeichert — bleibt auf deinem Gerät. Ein Spiegel, keine Bewertung.
          </span>
        ) : null}
      </div>

      {/* Vorher/Nachher (nur in der Nachher-Messung, wenn eine Baseline existiert). */}
      {wann === "nachher" && gespeichert && baseline ? (
        <div className="space-y-4 border-t border-linie pt-5">
          <p className="text-sm text-tinte-sanft">
            Als du gestartet bist — und jetzt:
          </p>
          {interaktion.achsen.map((achse) => {
            const vor = baseline[achse.schluessel];
            const jetzt = werte[achse.schluessel];
            if (typeof vor !== "number") return null;
            const [links, rechts] = achse.label.split("↔").map((t) => t.trim());
            return (
              <div key={achse.schluessel} className="space-y-1">
                <div
                  aria-hidden="true"
                  className="flex justify-between text-sm text-tinte-sanft"
                >
                  <span>{links}</span>
                  <span>{rechts}</span>
                </div>
                <div
                  className="relative h-2 rounded-full bg-linie"
                  aria-hidden="true"
                >
                  <span
                    className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tinte-sanft/60"
                    style={{ left: `${(vor / 10) * 100}%` }}
                  />
                  <span
                    className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-salbei-tief"
                    style={{ left: `${(jetzt / 10) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
          <p className="text-xs text-tinte-sanft">
            Grau: damals · Grün: jetzt. Kein Ziel, keine Note — nur dein Weg.
          </p>
        </div>
      ) : null}
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
        switch (it.art) {
          case "journal":
            return (
              <JournalFeld
                key={i}
                frage={it.frage}
                platzhalter={it.platzhalter}
                speichern={it.speichern}
                modulId={modulId}
              />
            );
          case "selbsttest":
            return <SelbsttestFeld key={i} interaktion={it} />;
          case "auswahl":
            return (
              <AuswahlFeld
                key={i}
                optionen={it.optionen}
                hinweis={it.hinweis}
                speichern={it.speichern}
                speicherKey={`${modulId}:${schrittTyp}:${i}`}
              />
            );
          case "auswahl-oder-freitext":
            return (
              <AbsichtFeld
                key={i}
                vorlagen={it.vorlagen}
                platzhalter={it.platzhalter}
                editierbar={it.editierbar}
                speichern={it.speichern}
              />
            );
          case "slider": {
            // Mit `speichern` = einmalige Baseline; sonst Vorher/Nachher je Modul.
            if (it.speichern) {
              return (
                <BaselineRegler
                  key={i}
                  frage={it.label}
                  skala={it.skala}
                  speichern={it.speichern}
                />
              );
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
          }
          default:
            return null; // unbekannte Art: nichts rendern
        }
      })}
    </div>
  );
}

// Ziel-Einblendung der Nachspür-Frage: ~4 s, aber nie länger als `stilleSek`.
const NACHSPUER_ZIEL_MS = 4000;

/** Nachspüren: Satz 1 (Einladung) sofort; die Frage + Interaktionen tauchen nach
 *  ~4 s auf — oder sofort, wenn man „Wenn du bereit bist" antippt. */
function NachspuerenSchritt({
  schritt,
  modul,
}: {
  schritt: Schritt;
  modul: Modul;
}) {
  const [stilleVorbei, setStilleVorbei] = useState(false);
  const enthuelltRef = useRef<HTMLDivElement>(null);
  // Wurde sofort gezeigt (reduzierte Bewegung)? Dann keinen Fokus umlenken —
  // beim Schritt-Eintritt hat die Überschrift Vorrang.
  const sofortGezeigt = useRef(false);

  useEffect(() => {
    // Reduzierte Bewegung: nichts auf Timer verstecken, gleich zeigen.
    const reduziert =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduziert) {
      sofortGezeigt.current = true;
      setStilleVorbei(true);
      return;
    }
    const obergrenze = (schritt.stilleSek ?? 4) * 1000;
    const dauer = Math.min(NACHSPUER_ZIEL_MS, obergrenze);
    const timer = window.setTimeout(() => setStilleVorbei(true), dauer);
    return () => window.clearTimeout(timer);
  }, [schritt.stilleSek]);

  // Wenn die Frage auftaucht (nach der Stille ODER per Tap), den Fokus sanft
  // dorthin führen — Screenreader kündigen den Reflexions-Teil dann an.
  useEffect(() => {
    if (!stilleVorbei || sofortGezeigt.current) return;
    const id = window.requestAnimationFrame(() => enthuelltRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [stilleVorbei]);

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
        <div
          ref={enthuelltRef}
          tabIndex={-1}
          className="mbm-stille-fade space-y-6 focus:outline-none"
        >
          {weitereBloecke.length > 0 ? <Bloecke bloecke={weitereBloecke} /> : null}
          {schritt.interaktionen && schritt.interaktionen.length > 0 ? (
            <Interaktionen
              liste={schritt.interaktionen}
              modulId={modul.id}
              schrittTyp={schritt.typ}
            />
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setStilleVorbei(true)}
          className="group inline-flex items-center gap-2 text-sm text-tinte-sanft transition duration-200 ease-ruhig hover:text-tinte"
        >
          Wenn du bereit bist
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-300 ease-ruhig group-hover:translate-x-1"
          >
            →
          </span>
        </button>
      )}
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
        {audio}
        <Bloecke bloecke={schritt.bloecke} />
        {schritt.experiment ? (
          <ExperimentMerken
            modulId={modul.id}
            titel={modul.titel}
            experiment={schritt.experiment}
          />
        ) : null}
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

export default function ModulPlayer({
  modul,
  naechstes,
}: {
  modul: Modul;
  naechstes?: { id: string; titel: string } | null;
}) {
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
            className="inline-flex min-h-11 items-center rounded-xl px-4 py-2 text-tinte-sanft transition duration-200 ease-ruhig hover:text-tinte active:scale-[0.97]"
          >
            Zurück
          </button>
        ) : (
          <span />
        )}

        {letzterSchritt ? (
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-xl border border-linie px-4 py-2 text-tinte-sanft transition duration-200 ease-ruhig hover:border-salbei hover:text-tinte active:scale-[0.98]"
            >
              Zur Übersicht
            </Link>
            {naechstes ? (
              <Link
                href={`/modul/${naechstes.id}`}
                className="group inline-flex min-h-11 items-center rounded-xl bg-salbei-tief px-5 py-2 font-medium text-grund transition duration-200 ease-ruhig hover:bg-salbei active:scale-[0.98]"
              >
                Weiter zu {naechstes.titel}{" "}
                <span
                  aria-hidden="true"
                  className="ml-1.5 inline-block transition-transform duration-300 ease-ruhig group-hover:translate-x-1.5"
                >
                  →
                </span>
              </Link>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            onClick={weiter}
            className="inline-flex min-h-11 items-center rounded-xl bg-salbei-tief px-5 py-2 font-medium text-grund transition duration-200 ease-ruhig hover:bg-salbei active:scale-[0.98]"
          >
            Weiter
          </button>
        )}
      </nav>
    </div>
  );
}
