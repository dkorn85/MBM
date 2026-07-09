// POST /api/einladung — stateless: nimmt den lokalen Zustand, gibt EINE sichere
// Einladung zurück, speichert nichts. Doppeltes Gate: Engine muss aktiviert sein
// (NEXT_PUBLIC_ENGINE_ENABLED) UND ein Server-Key vorliegen; sonst 503. Ohne beides
// bleibt die Engine in Produktion schlummernd (Privacy by Design, konzept/21/22).

import { NextResponse } from "next/server";
import { ENGINE_ENABLED } from "@/lib/ai-engine/config";
import { naechsteEinladung } from "@/lib/ai-engine/einladung";
import type { Anlass } from "@/lib/ai-engine/context";
import type { Achsen, Zustand } from "@/lib/ai-engine/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // nie cachen

const ANLAESSE: Anlass[] = ["selbsttest", "weitergehen", "loop", "mein-weg"];

// Datensparsamkeit (DSGVO Art. 5): nur die bekannten Felder, in vernünftiger
// Größe, an das Modell weiterreichen — nichts Beliebiges durchleiten.
function zahl(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(10, n)) : undefined;
}
function achsen(v: unknown): Achsen | undefined {
  if (!v || typeof v !== "object") return undefined;
  const a = v as Record<string, unknown>;
  return { koerper: zahl(a.koerper), gedanken: zahl(a.gedanken), stimmung: zahl(a.stimmung), verhalten: zahl(a.verhalten) };
}
function kurz(v: unknown, max = 400): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;
}
function bereinige(roh: unknown): Zustand {
  const z = (roh && typeof roh === "object" ? roh : {}) as Record<string, unknown>;
  return {
    baseline: achsen(z.baseline),
    nachher: achsen(z.nachher),
    anliegen: kurz(z.anliegen),
    loop: Array.isArray(z.loop)
      ? z.loop.slice(0, 30).map((l) => {
          const e = (l && typeof l === "object" ? l : {}) as Record<string, unknown>;
          return { spuerStimmung: zahl(e.spuerStimmung), gluecksmoment: kurz(e.gluecksmoment, 120), ankerGemacht: e.ankerGemacht === true };
        })
      : undefined,
    journal: Array.isArray(z.journal)
      ? z.journal.slice(-5).map((j) => ({ text: kurz((j as Record<string, unknown>)?.text, 300) || "" })).filter((j) => j.text)
      : undefined,
    abgeschlossen: Array.isArray(z.abgeschlossen)
      ? z.abgeschlossen.filter((s): s is string => typeof s === "string").slice(0, 20)
      : undefined,
  };
}

export async function POST(req: Request) {
  if (!ENGINE_ENABLED || !process.env.MISTRAL_API_KEY) {
    return NextResponse.json({ disabled: true }, { status: 503 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ fehler: "ungültiger Body" }, { status: 400 });
  }
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const zustand = bereinige(b.zustand);
  const anlass = (ANLAESSE as string[]).includes(b.anlass as string) ? (b.anlass as Anlass) : "weitergehen";

  try {
    const ergebnis = await naechsteEinladung(zustand, anlass);
    return NextResponse.json(ergebnis);
  } catch {
    // Keine Modell-Internals nach außen — der Client zieht sich dann still zurück.
    return NextResponse.json({ fehler: "engine-fehler" }, { status: 502 });
  }
}
