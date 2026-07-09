"use client";

// Phase-2a Dialog (dialogischer Spiegel, lokal). Feature-Flag DIALOG_ENABLED AUS ⇒
// rendert nichts. Das Gespräch ist FLÜCHTIG (nur State, nie gespeichert); persistiert
// wird nur verdichtetes Memory (localMemory) über die zurückgegebenen Ops.
//
// Sicherheit/Ethos: entbündeltes Consent (LLM-Aufruf), Krise → Signposting statt
// Weiterchatten, sanfte Session-Grenze (Anti-Abhängigkeit), sichtbarer KI-Hinweis.
// Nutzer­sichtbare Texte sind safety-nah → vor Go-Live von Lana/Fable gegenlesen.

import Link from "next/link";
import { useRef, useState } from "react";
import { DIALOG_ENABLED, KI_HINWEIS } from "@/lib/ai-engine/config";
import { sammleZustand } from "@/lib/ai-engine/zustand-sammeln";
import { localMemory } from "@/lib/ai-engine/memory/local";
import type { DialogAntwort, MemoryOp, Turn } from "@/lib/ai-engine/dialog-types";
import { storage } from "@/lib/storage";

const SANFTE_GRENZE = 12; // ab hier eine Pause anregen (Anti-Abhängigkeit)

function wendeAn(ops: MemoryOp[]) {
  for (const op of ops) {
    if (op.aktion === "add") localMemory.hinzufuegen(op.text, op.art);
    else if (op.aktion === "update") localMemory.aktualisieren(op.id, op.text);
    else if (op.aktion === "delete") localMemory.entfernen(op.id);
  }
}

export default function EngineDialog() {
  const [consent, setConsent] = useState<boolean>(() => storage.getEngineConsent());
  const [turns, setTurns] = useState<Turn[]>([]);
  const [eingabe, setEingabe] = useState("");
  const [sendet, setSendet] = useState(false);
  const [meldung, setMeldung] = useState<string | null>(null);
  const [krise, setKrise] = useState(false);
  const [verborgen, setVerborgen] = useState(false);
  const listeRef = useRef<HTMLDivElement>(null);

  if (!DIALOG_ENABLED || verborgen) return null;

  const personTurns = turns.filter((t) => t.rolle === "person").length;

  async function senden() {
    const text = eingabe.trim();
    if (!text || sendet) return;
    setMeldung(null);
    setEingabe("");
    const neueTurns: Turn[] = [...turns, { rolle: "person", text }];
    setTurns(neueTurns);
    setSendet(true);
    try {
      const res = await fetch("/api/dialog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nachricht: text,
          verlauf: turns.slice(-14),
          erinnerungen: localMemory.liste().map((e) => ({ id: e.id, text: e.text, art: e.art })),
          zustand: sammleZustand(),
        }),
      });
      if (res.status === 503) return setVerborgen(true);
      if (res.status === 429) {
        setMeldung("Gerade ist viel los — magst du es in einer Minute nochmal versuchen?");
        return;
      }
      if (!res.ok) {
        setMeldung("Das hat gerade nicht geklappt. Vielleicht später nochmal?");
        return;
      }
      const d = (await res.json()) as DialogAntwort;
      setTurns((t) => [...t, { rolle: "engine", text: d.antwort }]);
      if (d.krise) setKrise(true);
      else wendeAn(d.memoryOps);
      requestAnimationFrame(() => listeRef.current?.scrollTo({ top: 1e9, behavior: "smooth" }));
    } catch {
      setMeldung("Das hat gerade nicht geklappt. Vielleicht später nochmal?");
    } finally {
      setSendet(false);
    }
  }

  const rahmen = "rounded-2xl border border-dashed border-linie bg-flaeche/60 p-5 space-y-3";

  // ── Entbündeltes Opt-in ────────────────────────────────────────────
  if (!consent) {
    return (
      <section className={rahmen} aria-label="Begleitung im Gespräch (KI)">
        <p className="font-label text-xs uppercase tracking-[0.14em] text-etikett">Optional · KI</p>
        <p className="text-tinte-sanft">
          Wenn du magst, kannst du hier in eigenen Worten schreiben — eine KI (Mistral,
          EU) spiegelt behutsam und lädt zu kleinen Schritten ein, nie eine Diagnose.
          Das Gespräch selbst wird <strong>nicht gespeichert</strong>; nur ein paar
          verdichtete Notizen bleiben <strong>auf deinem Gerät</strong> (jederzeit
          einseh- und löschbar). Du kannst das jederzeit abschalten.
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <button
            type="button"
            onClick={() => {
              storage.setEngineConsent(true);
              setConsent(true);
            }}
            className="inline-flex min-h-11 items-center rounded-xl bg-salbei-tief px-5 py-2 font-medium text-grund transition duration-200 ease-ruhig hover:bg-salbei active:scale-[0.98]"
          >
            Ja, Gespräch erlauben
          </button>
          <button
            type="button"
            onClick={() => setVerborgen(true)}
            className="text-tinte-sanft underline underline-offset-4 transition-colors hover:text-tinte"
          >
            Vielleicht später
          </button>
        </div>
        <p className="text-sm">
          <Link href="/datenschutz" className="text-tinte-sanft underline underline-offset-4 hover:text-tinte">
            Wie das mit deinen Daten läuft
          </Link>
        </p>
      </section>
    );
  }

  // ── Gespräch ────────────────────────────────────────────────────────
  return (
    <section className="space-y-4 rounded-2xl border border-linie bg-flaeche/60 p-5" aria-label="Begleitung im Gespräch (KI)">
      {turns.length > 0 ? (
        <div ref={listeRef} className="max-h-96 space-y-3 overflow-y-auto pr-1">
          {turns.map((t, i) => (
            <div key={i} className={t.rolle === "person" ? "text-right" : ""}>
              <p
                className={
                  t.rolle === "person"
                    ? "inline-block max-w-[85%] rounded-2xl bg-sand/40 px-4 py-2 text-tinte"
                    : "inline-block max-w-[90%] whitespace-pre-line rounded-2xl bg-grund px-4 py-2 text-tinte"
                }
              >
                {t.text}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-tinte-sanft">
          Schreib, was gerade da ist — in deinen Worten. Es muss nichts Besonderes sein.
        </p>
      )}

      {krise ? (
        <Link
          href="/hilfe"
          className="inline-flex min-h-11 items-center rounded-xl bg-salbei-tief px-5 py-2 font-medium text-grund transition hover:bg-salbei"
        >
          Hilfe in Krisen ansehen
        </Link>
      ) : (
        <>
          {personTurns >= SANFTE_GRENZE ? (
            <p className="text-sm text-tinte-sanft">
              Ihr seid schon eine Weile im Gespräch — vielleicht magst du gleich eine
              Pause machen oder dich an einen echten Menschen wenden. Ich lauf dir nicht weg.
            </p>
          ) : null}
          {meldung ? <p className="text-sm text-tinte-sanft">{meldung}</p> : null}
          <div className="flex items-end gap-2">
            <textarea
              value={eingabe}
              onChange={(e) => setEingabe(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void senden();
                }
              }}
              rows={2}
              placeholder="In deinen Worten …"
              aria-label="Deine Nachricht"
              className="w-full resize-y rounded-xl border border-linie bg-grund px-3 py-2 text-tinte placeholder:text-tinte-sanft/70 focus-visible:border-salbei-tief"
            />
            <button
              type="button"
              onClick={() => void senden()}
              disabled={sendet || !eingabe.trim()}
              className="inline-flex min-h-11 shrink-0 items-center rounded-xl bg-salbei-tief px-4 py-2 font-medium text-grund transition duration-200 ease-ruhig hover:bg-salbei active:scale-[0.98] disabled:opacity-60"
            >
              {sendet ? "…" : "Senden"}
            </button>
          </div>
        </>
      )}

      <p className="font-label text-[0.7rem] uppercase tracking-[0.12em] text-tinte-sanft/80">
        {KI_HINWEIS}
      </p>
    </section>
  );
}
