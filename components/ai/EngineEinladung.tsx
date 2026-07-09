"use client";

// Andockbare Engine-Ausgabe. Ein Baustein, überall platzierbar:
//   <EngineEinladung anlass="mein-weg" />
//
// Sicherheits-/Datenschutz-Fluss (konzept/21):
//  1) Feature-Flag AUS  → rendert nichts (in Produktion unsichtbar).
//  2) Kein Consent       → entbündeltes Opt-in (nur DAS erlaubt den LLM-Aufruf).
//  3) Consent, ungefragt → sanfte Einladung, den Aufruf SELBST auszulösen (Agency,
//                          spart Kosten — keine automatischen Calls).
//  4) Ausgabe            → Text + sichtbarer KI-Hinweis (Art. 50) + Widerruf.
//  5) Route „disabled"   → still zurückziehen (rendert nichts).
//
// HINWEIS: Die nutzer­sichtbaren Texte hier sind safety-nah → vor Go-Live von
// Lana/Fable gegenlesen lassen (siehe konzept/LANA-FRAGEN.md).

import Link from "next/link";
import { useState } from "react";
import { ENGINE_ENABLED, KI_HINWEIS } from "@/lib/ai-engine/config";
import type { Anlass } from "@/lib/ai-engine/context";
import type { Einladung } from "@/lib/ai-engine/types";
import { sammleZustand } from "@/lib/ai-engine/zustand-sammeln";
import { storage } from "@/lib/storage";

const FRAGE: Record<Anlass, string> = {
  "mein-weg": "Magst du eine Spiegelung deines bisherigen Wegs?",
  selbsttest: "Magst du dazu eine erste, persönliche Einladung?",
  weitergehen: "Magst du eine persönliche nächste Einladung?",
  loop: "Magst du eine kurze Einladung für heute?",
};

type Phase = "opt-in" | "bereit" | "laedt" | "fertig" | "verborgen";

export default function EngineEinladung({ anlass }: { anlass: Anlass }) {
  const [phase, setPhase] = useState<Phase>(() =>
    storage.getEngineConsent() ? "bereit" : "opt-in",
  );
  const [ergebnis, setErgebnis] = useState<Einladung | null>(null);
  const [meldung, setMeldung] = useState<string | null>(null);

  if (!ENGINE_ENABLED || phase === "verborgen") return null;

  async function hole() {
    setMeldung(null);
    setPhase("laedt");
    try {
      const res = await fetch("/api/einladung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zustand: sammleZustand(), anlass }),
      });
      if (res.status === 503) return setPhase("verborgen"); // Engine (noch) nicht live
      if (res.status === 429) {
        setMeldung("Gerade ist viel los — magst du es in einer Minute nochmal versuchen?");
        return setPhase("bereit");
      }
      if (!res.ok) return setPhase("bereit"); // still zurück, kein Fehlerlärm
      setErgebnis((await res.json()) as Einladung);
      setPhase("fertig");
    } catch {
      setPhase("bereit");
    }
  }

  function erlaube() {
    storage.setEngineConsent(true);
    setPhase("bereit");
  }

  function widerrufe() {
    storage.setEngineConsent(false);
    setErgebnis(null);
    setPhase("opt-in");
  }

  const rahmen =
    "rounded-2xl border border-dashed border-linie bg-flaeche/60 p-5 space-y-3";

  // ── Entbündeltes Opt-in ────────────────────────────────────────────
  if (phase === "opt-in") {
    return (
      <section className={rahmen} aria-label="Persönliche Spiegelung (KI)">
        <p className="font-label text-xs uppercase tracking-[0.14em] text-etikett">
          Optional · KI
        </p>
        <p className="text-tinte-sanft">
          Wenn du magst, schaut eine KI (Mistral, EU) auf deine bisherigen Eingaben
          in dieser App und formuliert dir eine warme, persönliche Einladung — nie
          eine Diagnose, immer nur ein Angebot. Dafür wird dein Zustand einmalig an
          die KI gesendet und <strong>nicht gespeichert</strong>. Du kannst das
          jederzeit wieder abschalten.
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <button
            type="button"
            onClick={erlaube}
            className="inline-flex min-h-11 items-center rounded-xl bg-salbei-tief px-5 py-2 font-medium text-grund transition duration-200 ease-ruhig hover:bg-salbei active:scale-[0.98]"
          >
            Ja, Spiegelung erlauben
          </button>
          <button
            type="button"
            onClick={() => setPhase("verborgen")}
            className="text-tinte-sanft underline underline-offset-4 transition-colors hover:text-tinte"
          >
            Vielleicht später
          </button>
        </div>
      </section>
    );
  }

  // ── Consent da: sanfte Einladung, den Call selbst auszulösen ────────
  if (phase === "bereit" || phase === "laedt") {
    return (
      <section className={rahmen} aria-label="Persönliche Spiegelung (KI)">
        <p className="text-tinte-sanft">{FRAGE[anlass]}</p>
        {meldung ? <p className="text-sm text-tinte-sanft">{meldung}</p> : null}
        <button
          type="button"
          onClick={hole}
          disabled={phase === "laedt"}
          className="inline-flex min-h-11 items-center rounded-xl border border-linie bg-grund px-5 py-2 text-tinte transition duration-200 ease-ruhig hover:border-salbei hover:text-salbei-tief active:scale-[0.98] disabled:opacity-60"
        >
          {phase === "laedt" ? "einen Moment …" : "Ja, zeig mir"}
        </button>
      </section>
    );
  }

  // ── Ergebnis ────────────────────────────────────────────────────────
  const r = ergebnis!;
  return (
    <section className={rahmen} aria-label="Persönliche Spiegelung (KI)">
      <p className="whitespace-pre-line text-tinte">{r.einladung}</p>
      {r.krise ? (
        <Link
          href="/hilfe"
          className="inline-flex min-h-11 items-center rounded-xl bg-salbei-tief px-5 py-2 font-medium text-grund transition hover:bg-salbei"
        >
          Hilfe in Krisen ansehen
        </Link>
      ) : (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
          <button
            type="button"
            onClick={hole}
            className="text-tinte-sanft underline underline-offset-4 transition-colors hover:text-tinte"
          >
            noch eine
          </button>
          <button
            type="button"
            onClick={widerrufe}
            className="text-tinte-sanft underline underline-offset-4 transition-colors hover:text-tinte"
          >
            abschalten
          </button>
        </div>
      )}
      <p className="font-label text-[0.7rem] uppercase tracking-[0.12em] text-tinte-sanft/80">
        {KI_HINWEIS}
      </p>
    </section>
  );
}
