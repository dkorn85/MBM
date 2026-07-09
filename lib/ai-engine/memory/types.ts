// Memory-Grundschicht der AI-Engine (Phase 2, Mem0-Muster) — Typen + Interface.
//
// Grundschicht: hier noch NICHT verdrahtet (Phase 2 ist nicht aktiv). Das Interface
// ist die austauschbare Nahtstelle — genau wie `storage.ts` lokal ODER Cloud sein
// kann, kann `MemoryStore` `localMemory` (localStorage) ODER später eine Supabase-
// Implementierung sein. Prinzip (research/02 §1): verdichtet, editierbar, löschbar,
// vom Menschen einsehbar/kontrolliert, so klein wie möglich.

export type MemoryArt =
  | "muster" // wiederkehrendes Stress-/Stimmungsmuster (ressourcenorientiert)
  | "ressource" // was der Person guttut / hilft
  | "vorliebe" // Ton-/Übungs-Präferenzen
  | "kontext"; // situativer Kontext (kurzlebig)

export type MemoryEintrag = {
  id: string;
  text: string; // VERDICHTET & editierbar — kein sensibler Rohtext, wo Verdichtung reicht
  art: MemoryArt;
  erstellt: string; // ISO-Datum
  aktualisiert: string; // ISO-Datum
};

// Austauschbare Nahtstelle. Lokale Impl: `localMemory` (localStorage). Cloud-Impl
// (Supabase, EU) folgt mit der Backend-Entscheidung (konzept/23 §5).
export interface MemoryStore {
  liste(): MemoryEintrag[];
  hinzufuegen(text: string, art: MemoryArt): MemoryEintrag;
  aktualisieren(id: string, text: string): void;
  entfernen(id: string): void;
  alleLoeschen(): void;
}
