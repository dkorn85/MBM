"use client";

// „Mein Gedächtnis" — Transparenz & Kontrolle über das lokale Memory der Engine
// (research/02: der Mensch sieht und kontrolliert sein Memory). Einsehen, ändern,
// einzeln oder komplett löschen. Alles bleibt auf dem Gerät. Feature-Flag AUS oder
// leeres Memory ⇒ rendert nichts.

import { useState } from "react";
import { DIALOG_ENABLED } from "@/lib/ai-engine/config";
import { localMemory } from "@/lib/ai-engine/memory/local";
import type { MemoryEintrag } from "@/lib/ai-engine/memory/types";

export default function MeinGedaechtnis() {
  const [eintraege, setEintraege] = useState<MemoryEintrag[]>(() =>
    DIALOG_ENABLED ? localMemory.liste() : [],
  );
  const [bearbeite, setBearbeite] = useState<string | null>(null);
  const [entwurf, setEntwurf] = useState("");

  if (!DIALOG_ENABLED || eintraege.length === 0) return null;

  const neuLaden = () => setEintraege(localMemory.liste());

  return (
    <section className="space-y-3 rounded-2xl border border-linie bg-flaeche/50 p-5" aria-label="Mein Gedächtnis">
      <div className="space-y-1">
        <p className="font-label text-xs uppercase tracking-[0.14em] text-etikett">Mein Gedächtnis</p>
        <p className="text-sm text-tinte-sanft">
          Das merkt sich deine Begleitung — verdichtet, auf deinem Gerät. Du hast die
          Kontrolle: ändern oder löschen, wann du willst.
        </p>
      </div>

      <ul className="space-y-2">
        {eintraege.map((e) => (
          <li key={e.id} className="rounded-xl border border-linie bg-grund p-3">
            {bearbeite === e.id ? (
              <div className="space-y-2">
                <textarea
                  value={entwurf}
                  onChange={(ev) => setEntwurf(ev.target.value)}
                  rows={2}
                  aria-label="Erinnerung ändern"
                  className="w-full resize-y rounded-lg border border-linie bg-grund px-3 py-2 text-sm text-tinte focus-visible:border-salbei-tief"
                />
                <div className="flex gap-x-4 text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      if (entwurf.trim()) localMemory.aktualisieren(e.id, entwurf.trim());
                      setBearbeite(null);
                      neuLaden();
                    }}
                    className="text-salbei-tief underline underline-offset-4 hover:text-akzent"
                  >
                    Speichern
                  </button>
                  <button type="button" onClick={() => setBearbeite(null)} className="text-tinte-sanft underline underline-offset-4 hover:text-tinte">
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-tinte">
                  <span className="mr-2 rounded-full bg-sand/40 px-2 py-0.5 font-label text-[0.65rem] uppercase tracking-[0.1em] text-etikett">
                    {e.art}
                  </span>
                  {e.text}
                </p>
                <div className="flex shrink-0 gap-x-3 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setBearbeite(e.id);
                      setEntwurf(e.text);
                    }}
                    className="text-tinte-sanft underline underline-offset-4 hover:text-tinte"
                  >
                    ändern
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      localMemory.entfernen(e.id);
                      neuLaden();
                    }}
                    className="text-tinte-sanft underline underline-offset-4 hover:text-akzent"
                  >
                    löschen
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => {
          localMemory.alleLoeschen();
          neuLaden();
        }}
        className="text-sm text-tinte-sanft underline underline-offset-4 hover:text-akzent"
      >
        Alles vergessen
      </button>
    </section>
  );
}
