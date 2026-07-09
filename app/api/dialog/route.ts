// POST /api/dialog — ein Dialog-Turn (Phase 2a). Stateless: Nachricht + flüchtiger
// Verlauf + lokales Memory rein, Antwort + Memory-Ops raus, nichts gespeichert.
// Doppel-Gate (DIALOG_ENABLED + Key) → sonst 503; Rate-Limit wie /einladung.

import { NextResponse } from "next/server";
import { DIALOG_ENABLED } from "@/lib/ai-engine/config";
import { dialogTurn } from "@/lib/ai-engine/dialog";
import { pruefeRate } from "@/lib/ai-engine/ratelimit";
import type { Achsen, Zustand } from "@/lib/ai-engine/types";
import type { Erinnerung, Turn } from "@/lib/ai-engine/dialog-types";
import type { MemoryArt } from "@/lib/ai-engine/memory/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ARTEN: MemoryArt[] = ["muster", "ressource", "vorliebe", "kontext"];

function zahl(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(10, n)) : undefined;
}
function kurz(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}
function achsen(v: unknown): Achsen | undefined {
  if (!v || typeof v !== "object") return undefined;
  const a = v as Record<string, unknown>;
  return { koerper: zahl(a.koerper), gedanken: zahl(a.gedanken), stimmung: zahl(a.stimmung), verhalten: zahl(a.verhalten) };
}
function bereinigeZustand(roh: unknown): Zustand {
  const z = (roh && typeof roh === "object" ? roh : {}) as Record<string, unknown>;
  return {
    baseline: achsen(z.baseline),
    nachher: achsen(z.nachher),
    abgeschlossen: Array.isArray(z.abgeschlossen)
      ? z.abgeschlossen.filter((s): s is string => typeof s === "string").slice(0, 20)
      : undefined,
  };
}
function bereinigeVerlauf(roh: unknown): Turn[] {
  if (!Array.isArray(roh)) return [];
  return roh
    .slice(-16)
    .map((t) => {
      const o = (t && typeof t === "object" ? t : {}) as Record<string, unknown>;
      const rolle = o.rolle === "engine" ? "engine" : "person";
      return { rolle, text: kurz(o.text, 1000) } as Turn;
    })
    .filter((t) => t.text);
}
function bereinigeErinnerungen(roh: unknown): Erinnerung[] {
  if (!Array.isArray(roh)) return [];
  return roh
    .slice(0, 40)
    .map((e) => {
      const o = (e && typeof e === "object" ? e : {}) as Record<string, unknown>;
      const art = ARTEN.includes(o.art as MemoryArt) ? (o.art as MemoryArt) : "kontext";
      return { id: kurz(o.id, 64), text: kurz(o.text, 200), art };
    })
    .filter((e) => e.id && e.text);
}

export async function POST(req: Request) {
  if (!DIALOG_ENABLED || !process.env.MISTRAL_API_KEY) {
    return NextResponse.json({ disabled: true }, { status: 503 });
  }
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unbekannt";
  const rate = pruefeRate(ip);
  if (!rate.ok) {
    return NextResponse.json({ fehler: "rate-limit" }, { status: 429, headers: { "Retry-After": String(rate.retryNachSek) } });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ fehler: "ungültiger Body" }, { status: 400 });
  }
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const nachricht = kurz(b.nachricht, 1000);
  if (!nachricht) return NextResponse.json({ fehler: "leer" }, { status: 400 });

  try {
    const antwort = await dialogTurn({
      nachricht,
      verlauf: bereinigeVerlauf(b.verlauf),
      erinnerungen: bereinigeErinnerungen(b.erinnerungen),
      zustand: bereinigeZustand(b.zustand),
    });
    return NextResponse.json(antwort);
  } catch {
    return NextResponse.json({ fehler: "engine-fehler" }, { status: 502 });
  }
}
