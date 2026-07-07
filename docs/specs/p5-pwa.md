# Spec P5 — PWA (Manifest, Service Worker, Offline-Kern) + Vercel-Deploy

*Autor: Fable. Umsetzung: builder. Gleiche Regeln wie immer.*

## Branding-Entscheid (§10, vom Nutzer): App heißt **YipYip**

Das Logo liegt fertig unter `public/icons/yipyip-bison.svg` (nicht verändern). Umbenennung (rein mechanisch, alle Stellen):

- `app/layout.tsx` Metadata-`title`: `YipYip — Gebrauchsanweisung zum Menschsein` (der bisherige Name wird Untertitel)
- Seiten-Metadata-Suffixe (`/hilfe`, ggf. weitere): `… — YipYip`
- Header-Wortmarke: Bison-Logo als kleines Bild (`/icons/yipyip-bison.svg`, ~32 px, `alt=""`, dekorativ) + Text `YipYip`
- `AudioPlayer` MediaSession `artist`: `YipYip`
- Sonst nichts umformulieren — alle übrigen Nutzertexte bleiben unverändert.

## Manifest (`app/manifest.ts` oder `public/manifest.webmanifest`)

- `name`: `YipYip — Gebrauchsanweisung zum Menschsein`
- `short_name`: `YipYip`
- `description`: `Ein ruhiges Selbstlernprogramm der Mind-Body-Medizin: verstehen, erleben, in den Alltag bringen.`
- `lang: "de"`, `display: "standalone"`, `start_url: "/"`
- `background_color: "#FAF6EF"`, `theme_color: "#FAF6EF"`
- Icons aus `public/icons/yipyip-bison.svg` ableiten: 192×192 und 512×512 PNG (`purpose: any` und `maskable` — das SVG ist voll­flächig mit zentriertem Motiv, taugt für beide). Erzeugung ohne neue Dependency per `npx playwright screenshot --viewport-size=<w>,<h> file://<svg-pfad> <ziel.png>` (Chromium ist im Cache vorhanden); alternativ devDependency `sharp`. Zusätzlich `app/icon.png` (512×512, Next-Favicon-Konvention).

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
