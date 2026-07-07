# Spec P5 — PWA (Manifest, Service Worker, Offline-Kern) + Vercel-Deploy

*Autor: Fable. Umsetzung: builder. Gleiche Regeln wie immer.*

## Manifest (`app/manifest.ts` oder `public/manifest.webmanifest`)

- `name`: `Gebrauchsanweisung zum Menschsein`
- `short_name`: `Menschsein`
- `description`: `Ein ruhiges Selbstlernprogramm der Mind-Body-Medizin: verstehen, erleben, in den Alltag bringen.`
- `lang: "de"`, `display: "standalone"`, `start_url: "/"`
- `background_color: "#FAF6EF"`, `theme_color: "#FAF6EF"`
- Icons: Platzhalter-Logo generieren — einfache Grafik: Kreis in `salbei` (#708A72) auf `grund` (#FAF6EF) mit einem kleineren, versetzten Kreis in `akzent` (#BC6C4F); als 192×192, 512×512 PNG und `maskable` Variante. Per Skript erzeugen (z.B. eigenes Node-Skript mit zlib-basiertem PNG-Writer oder eine SVG→PNG-Lösung ohne neue Runtime-Dependency; devDependency erlaubt: `sharp`). SVG-Quelle unter `public/icons/` mit ablegen.

## Service Worker (handgeschrieben, `public/sw.js`)

Kein next-pwa, kein Workbox. Registrierung nur im Production-Build (`process.env.NODE_ENV === "production"`, kleine Client-Komponente im Layout).

- **Precache bei `install`** (Cache-Name mit Versionssuffix, z.B. `mbm-v1`):
  - `/`, `/modul/s1`, `/mein-weg`, `/hilfe`
  - alle Dateien unter `/audio/s1/` (die 5 MP3s, Liste beim Build fest eintragen oder zur Laufzeit aus einem generierten `precache-manifest.json` lesen — bevorzugt: kleines Build-Skript `scripts/generate-precache.mjs`, das `public/audio/**` scannt und die Liste in `public/precache-manifest.json` schreibt; npm-Script `prebuild` einhängen)
- **Fetch-Strategien:**
  - `/audio/**`: cache-first (Audio ändert sich nicht; bei Miss: laden + cachen)
  - Navigations-Requests: network-first mit Cache-Fallback; wenn beides fehlschlägt → gecachte `/`
  - `_next/static/**`: cache-first (immutable)
- **`activate`:** alte Versions-Caches löschen.
- Keine Push-/Notification-API, kein Background-Sync — bewusst nicht (§3: keine Notifications).

## Deploy (Vercel)

1. `vercel` CLI als npx verwenden, nicht global installieren. Prüfen ob Auth vorhanden: `npx vercel whoami`.
2. **Wenn nicht eingeloggt: STOPP — zurückmelden.** (Der Login läuft dann über den Nutzer in der Hauptsession.)
3. Wenn eingeloggt: `npx vercel deploy --prod --yes` im Repo-Root; Projektname `mbm-menschsein` (falls Neuanlage). Produktions-URL zurückmelden.
4. `.vercel/` bleibt gitignored.

## Verifikation

1. `npm run build` grün; Production-Start lokal (`npm run start`): SW registriert, Manifest verlinkt (`<link rel="manifest">`), Installierbarkeits-Kriterien erfüllt (Manifest + Icons + SW + HTTPS/localhost).
2. Offline-Test lokal: Seite laden, dann Netzwerk kappen (DevTools offline) → `/` und `/modul/s1` inkl. Audio funktionieren aus dem Cache.
3. Lighthouse-PWA/a11y-Lauf gegen den Production-Build dokumentieren (a11y ≥ 95 ist P6-Gate, hier nur messen und melden).
4. Falls deployed: URL melden.
