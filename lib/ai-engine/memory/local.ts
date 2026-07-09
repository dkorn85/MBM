// Lokale Implementierung des MemoryStore (localStorage, Phase 2a — lokal-first).
// SSR-sicher (auf dem Server No-Op/leer). Eigene, klar abgegrenzte localStorage-
// Nutzung als parallele austauschbare Persistenz-Schicht (analog storage.ts); die
// Cloud-Variante (Supabase) ersetzt genau diese Datei, nicht die Aufrufer.
//
// Noch nicht verdrahtet — Grundschicht für den Phase-2a-Dialog (konzept/23).

import type { MemoryArt, MemoryEintrag, MemoryStore } from "./types";

const KEY = "mbm.v1.memory";
const MAX_EINTRAEGE = 40; // Datenminimierung: Memory bleibt klein

function speicher(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function lesen(): MemoryEintrag[] {
  const s = speicher();
  if (!s) return [];
  try {
    const roh = s.getItem(KEY);
    return roh ? (JSON.parse(roh) as MemoryEintrag[]) : [];
  } catch {
    return [];
  }
}

function schreiben(eintraege: MemoryEintrag[]): void {
  const s = speicher();
  if (!s) return;
  try {
    s.setItem(KEY, JSON.stringify(eintraege.slice(-MAX_EINTRAEGE)));
  } catch {
    // Kontingent voll o. Ä. — still ignorieren.
  }
}

function neueId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `m_${Date.now()}_${Math.round(Math.random() * 1e6)}`;
  }
}

export const localMemory: MemoryStore = {
  liste() {
    return lesen();
  },

  hinzufuegen(text: string, art: MemoryArt) {
    const jetzt = new Date().toISOString();
    const eintrag: MemoryEintrag = {
      id: neueId(),
      text: text.trim(),
      art,
      erstellt: jetzt,
      aktualisiert: jetzt,
    };
    const alle = lesen();
    alle.push(eintrag);
    schreiben(alle);
    return eintrag;
  },

  aktualisieren(id: string, text: string) {
    const alle = lesen();
    const e = alle.find((x) => x.id === id);
    if (!e) return;
    e.text = text.trim();
    e.aktualisiert = new Date().toISOString();
    schreiben(alle);
  },

  entfernen(id: string) {
    const alle = lesen().filter((x) => x.id !== id);
    schreiben(alle);
  },

  alleLoeschen() {
    const s = speicher();
    if (s) {
      try {
        s.removeItem(KEY);
      } catch {
        // ignorieren
      }
    }
  },
};
