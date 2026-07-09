// Typen für den Phase-2a-Dialog. Das Gespräch (verlauf) ist FLÜCHTIG (nie
// gespeichert); persistiert wird nur verdichtetes Memory über MemoryOps, die der
// Client lokal anwendet. Server bleibt stateless.

import type { MemoryArt } from "./memory/types";
import type { Zustand } from "./types";

export type Turn = { rolle: "person" | "engine"; text: string };

export type Erinnerung = { id: string; text: string; art: MemoryArt };

// Operationen auf dem lokalen Memory (Mem0-Muster: add/update/delete).
export type MemoryOp =
  | { aktion: "add"; art: MemoryArt; text: string }
  | { aktion: "update"; id: string; text: string }
  | { aktion: "delete"; id: string };

export type DialogAnfrage = {
  nachricht: string;
  verlauf: Turn[]; // letzte Turns (Kontext, flüchtig)
  erinnerungen: Erinnerung[]; // lokales Memory (Retrieval)
  zustand: Zustand;
};

export type DialogAntwort = {
  krise: boolean;
  antwort: string;
  memoryOps: MemoryOp[];
};
