import type { ReactNode } from "react";
import type { TextBlock } from "@/lib/module-schema";

// Pausen-Marker sind Quelle für die Audio-Pipeline (P2) und bleiben in den
// JSON-Daten. Für die Anzeige werden sie entfernt.
const PAUSE_MARKER = /\s*\[(kurze Pause|Pause|längere Pause)\]/g;

// Inline-Auszeichnung: **fett** und *kursiv* (nicht-gierig, keine Verschachtelung).
const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;

function bereinige(text: string): string {
  return text
    .replace(PAUSE_MARKER, "")
    .replace(/  +/g, " ")
    .trim();
}

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  return text
    .split(INLINE)
    .filter((teil) => teil !== "")
    .map((teil, i) => {
      if (teil.startsWith("**") && teil.endsWith("**")) {
        return <strong key={`${keyPrefix}-${i}`}>{teil.slice(2, -2)}</strong>;
      }
      if (teil.startsWith("*") && teil.endsWith("*")) {
        return <em key={`${keyPrefix}-${i}`}>{teil.slice(1, -1)}</em>;
      }
      return teil;
    });
}

/**
 * Rendert einen einzelnen Roh-String als ein oder mehrere Absätze.
 * `\n\n` innerhalb des Strings trennt Absätze (kommt in experiment.haupt vor).
 */
export function TextAbsaetze({
  text,
  keyPrefix = "abs",
}: {
  text: string;
  keyPrefix?: string;
}) {
  const absaetze = bereinige(text)
    .split(/\n\n+/)
    .map((abs) => abs.trim())
    .filter((abs) => abs !== "");

  return (
    <>
      {absaetze.map((abs, i) => (
        <p key={`${keyPrefix}-${i}`}>{parseInline(abs, `${keyPrefix}-${i}`)}</p>
      ))}
    </>
  );
}

/** Rendert eine Liste von Text-Blöcken mit ruhigem Absatzabstand. */
export default function Bloecke({ bloecke }: { bloecke: TextBlock[] }) {
  return (
    <div className="max-w-[65ch] space-y-4">
      {bloecke.map((block, i) => (
        <TextAbsaetze key={i} text={block.text} keyPrefix={`b${i}`} />
      ))}
    </div>
  );
}
