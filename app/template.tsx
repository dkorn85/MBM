// Seitenübergang: Next.js rendert template.tsx bei JEDEM Navigations-Mount
// neu — die CSS-Klasse `mbm-seiten-wechsel` läuft dadurch bei jedem Routen-
// Wechsel einmal an (ruhiges Fade + winziger translateY). Bewusst ein Server-
// Component (kein State nötig), damit die Server/Client-Grenze schlank bleibt.
// Unter `prefers-reduced-motion` legt der globale Reset in globals.css die
// Animation still — die Seite erscheint dann einfach sofort.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="mbm-seiten-wechsel">{children}</div>;
}
