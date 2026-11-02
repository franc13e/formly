const CACHE = "formly-v4";
const SHELL = ["/", "/manifest.json", "/favicon.svg", "/icon-192.png", "/icon-512.png", "/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const fonts = url.host === "fonts.googleapis.com" || url.host === "fonts.gstatic.com";
  // API calls (FastAPI under /api, Supabase) always go straight to the network
  if ((url.origin !== location.origin && !fonts) || url.pathname.startsWith("/api/")) return;

  // Pages: network first so updates show up, cached app when offline
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put("/", copy));
          return res;
        })
        .catch(() => caches.match("/"))
    );
    return;
  }

  // Built assets and fonts: serve from cache, refresh in the background
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(req);
    const fresh = fetch(req)
      .then(res => {
        if (res.ok || res.type === "opaque") cache.put(req, res.clone());
        return res;
      })
      .catch(() => hit);
    return hit || fresh;
  }));
});
