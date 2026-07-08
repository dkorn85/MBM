// Feature-Gates für gegatete Inhalte (z.B. der Schattenpfad-Teaser „Begegnen").
// Ein Block mit `sichtbarAb: "<gate>"` bleibt versteckt, solange das Gate hier
// nicht aktiv ist. Zum Scharfschalten die ID ins Set aufnehmen.
export const AKTIVE_GATES = new Set<string>([
  // "begegnen-teaser",  // Seitenpfad Begegnen — später aktivieren
]);

/** Ist ein Block sichtbar? Ohne `sichtbarAb` immer; sonst nur bei aktivem Gate. */
export function istSichtbar(sichtbarAb?: string): boolean {
  if (!sichtbarAb) return true;
  return AKTIVE_GATES.has(sichtbarAb);
}
