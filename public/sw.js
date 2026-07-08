// YipYip Service Worker — handgeschrieben, kein Workbox/next-pwa.
// Offline-Kern: Kernrouten + S1-Audio werden bei install precached.
// Bewusst KEINE Push-/Notification-API und kein Background-Sync (§3: keine Notifications).

const CACHE = "yipyip-v11";

// Kernrouten, die offline erreichbar sein müssen (neue Stationen-Struktur).
const CORE = [
  "/",
  "/modul/willkommen",
  "/modul/wo-du-stehst",
  "/modul/alarm",
  "/modul/energie-ablassen",
  "/modul/zur-ruhe-kommen",
  "/modul/inseln",
  "/modul/koerper-hoeren",
  "/modul/gedanken-entwirren",
  "/modul/eigene-praxis",
  "/modul/rueckblick-weite",
  "/mein-weg",
  "/hilfe",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);

      // Audio- und Asset-Liste aus dem beim Build erzeugten Manifest lesen.
      let audio = [];
      let assets = [];
      try {
        const res = await fetch("/precache-manifest.json", { cache: "no-cache" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.audio)) audio = data.audio;
          if (Array.isArray(data.assets)) assets = data.assets;
        }
      } catch {
        // Ohne Manifest werden nur die Kernrouten precached.
      }

      // Einzeln hinzufügen: ein fehlschlagender Request soll die Installation
      // nicht komplett scheitern lassen.
      await Promise.all(
        [...CORE, ...audio, ...assets].map(async (url) => {
          try {
            await cache.add(new Request(url, { cache: "reload" }));
          } catch {
            // still ignorieren
          }
        }),
      );

      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Audio: cache-first (ändert sich nicht).
  if (url.pathname.startsWith("/audio/")) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Immutable Next-Assets: cache-first.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Deko-Grafiken + Icons: cache-first (ändern sich praktisch nie).
  if (url.pathname.startsWith("/deko/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Navigationen: network-first mit Cache-Fallback, zuletzt gecachte "/".
  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req));
    return;
  }
});

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return cached || Response.error();
  }
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const cached = await cache.match(req);
    if (cached) return cached;
    const home = await cache.match("/");
    if (home) return home;
    return Response.error();
  }
}
