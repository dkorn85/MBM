"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { storage } from "@/lib/storage";
import { TextAbsaetze } from "@/components/modul/Bloecke";

// Text wörtlich aus docs/specs/p4-sicherheit.md. **…** wird über den
// Bloecke-Parser als <strong> gerendert; \n\n trennt die drei Absätze.
const DISCLAIMER_TEXT =
  "Schön, dass du hier bist. Zwei Dinge sind uns wichtig:\n\n" +
  "Dieses Programm ist ein **Bildungsangebot**. Es hilft dir zu verstehen, wie dein Körper-Geist-System funktioniert — aber es ersetzt keine medizinische oder psychotherapeutische Behandlung und stellt keine Diagnosen.\n\n" +
  "Und: **Du bestimmst.** Alles hier ist ein Angebot. Du kannst jede Übung jederzeit unterbrechen, jeden Schritt überspringen und in deinem eigenen Tempo gehen. Wenn es dir gerade sehr schlecht geht, findest du unter „Hilfe in Krisen\" Anlaufstellen, die für dich da sind.";

export default function OnboardingDisclaimer() {
  // Startwert false ⇒ Server und erster Client-Render zeigen nichts (keine
  // Hydration-Diskrepanz); der echte Zustand kommt im Effect.
  const [sichtbar, setSichtbar] = useState(false);
  const titelId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!storage.istDisclaimerGesehen()) {
      setSichtbar(true);
    }
  }, []);

  // Fokus ins Dialog, Hintergrund-Scroll sperren, Fokus-Falle, Esc schließt nicht.
  useEffect(() => {
    if (!sichtbar) return;

    const vorherFokus = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const zuvorOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Schließen nur über den Button — Esc bleibt wirkungslos.
        e.preventDefault();
        return;
      }
      if (e.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const fokusierbar = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (fokusierbar.length === 0) return;
      const erstes = fokusierbar[0];
      const letztes = fokusierbar[fokusierbar.length - 1];
      const aktiv = document.activeElement;
      if (e.shiftKey) {
        if (aktiv === erstes || aktiv === dialog) {
          e.preventDefault();
          letztes.focus();
        }
      } else if (aktiv === letztes) {
        e.preventDefault();
        erstes.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = zuvorOverflow;
      vorherFokus?.focus?.();
    };
  }, [sichtbar]);

  if (!sichtbar) return null;

  const verstanden = () => {
    storage.setDisclaimerGesehen();
    setSichtbar(false);
  };

  const zurHilfe = () => {
    // Flag setzen, damit /hilfe erreichbar ist und der Dialog nicht erneut blockt.
    storage.setDisclaimerGesehen();
    setSichtbar(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-tinte/40 p-5">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titelId}
        tabIndex={-1}
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-linie bg-flaeche p-6 shadow-lg focus:outline-none sm:p-8"
      >
        <h2 id={titelId} className="text-2xl">
          Bevor du beginnst
        </h2>
        <div className="mt-4 max-w-[65ch] space-y-4">
          <TextAbsaetze text={DISCLAIMER_TEXT} keyPrefix="disclaimer" />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="button"
            onClick={verstanden}
            className="inline-flex min-h-11 items-center rounded-xl bg-salbei-tief px-5 py-2 font-medium text-grund transition duration-200 ease-ruhig hover:bg-salbei active:scale-[0.98]"
          >
            Verstanden
          </button>
          <Link
            href="/hilfe"
            onClick={zurHilfe}
            className="inline-flex min-h-11 items-center text-tinte-sanft underline underline-offset-4 transition-colors duration-200 ease-ruhig hover:text-tinte"
          >
            Hilfe in Krisen ansehen
          </Link>
        </div>
      </div>
    </div>
  );
}
