// Service worker: makes the YHQ site installable and usable offline.
//
// Strategy:
//   • App shell (the three pages, the engine bundle, icon, manifest) —
//     cache-first, revalidated in the background.
//   • /api and /content GETs — network-first, falling back to cache, so the
//     content is fresh online and still works once installed offline.
//   • Non-GET (e.g. POST /api/.../answer) — always network; never cached.
//
// Install also best-effort pre-fetches every scenario, so a single online visit
// leaves the whole app usable with no network.
const CACHE = "yhq-v1";
const SHELL = [
  "/player.html",
  "/landing.html",
  "/index.html",
  "/engine.js",
  "/manifest.webmanifest",
  "/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    try {
      const res = await fetch("/api/scenarios");
      if (res.ok) {
        await cache.put("/api/scenarios", res.clone());
        const list = await res.json();
        for (const s of list) {
          for (const u of ["/api/scenarios/" + s.id, "/api/scenarios/" + s.id + "/info"]) {
            try { const r = await fetch(u); if (r.ok) await cache.put(u, r.clone()); } catch (e) {}
          }
        }
      }
    } catch (e) { /* offline at install time — runtime caching will fill in */ }
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return; // answers/exams post straight to network
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // leave cross-origin alone

  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/content/")) {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res.ok) (await caches.open(CACHE)).put(req, res.clone());
        return res;
      } catch (e) {
        const cached = await caches.match(req);
        if (cached) return cached;
        return new Response(JSON.stringify({ error: "offline" }), {
          status: 503, headers: { "Content-Type": "application/json" },
        });
      }
    })());
    return;
  }

  // Shell + other same-origin GETs: cache-first, refresh in the background.
  event.respondWith((async () => {
    const cached = await caches.match(req);
    const network = fetch(req)
      .then((res) => { if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone())); return res; })
      .catch(() => cached);
    return cached || network;
  })());
});
