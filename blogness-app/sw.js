// Blogness app service worker (40A, 10 Nov 2026): instant repeat loads and a working shell offline.
// - App pages, styles and scripts: served from the phone at once, refreshed in the background.
// - Fonts and photos (Google Fonts, static.wixstatic.com): kept on the phone after the first view.
// - Wix APIs, sign-in, chat and everything else: always live from the network, never cached.
var VERSION = "b40a-1";
var SHELL = "shell-" + VERSION, MEDIA = "media-v1";
var PRECACHE = [
  "/feed.html", "/proposte.html", "/musica.html", "/contatti.html", "/myid.html", "/notifiche.html", "/post.html", "/event.html",
  "/css/app.css", "/css/editorial.css", "/css/myid.css", "/css/social.css", "/css/vivid.css",
  "/js/app/vivid.js", "/js/app/i18n.js", "/js/app/common.js", "/js/app/more.js", "/js/app/social-text.js", "/js/app/actions.js",
  "/js/app/feed.js", "/js/app/proposte.js", "/js/app/musica.js", "/js/app/contatti.js", "/js/app/myid.js", "/js/app/notifiche.js"
];
var NO_CACHE = ["/index.html", "/auth-return.html", "/sw.js"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(SHELL).then(function (c) {
    return Promise.all(PRECACHE.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== SHELL && k !== MEDIA; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function staleWhileRevalidate(req, cacheName) {
  return caches.open(cacheName).then(function (c) {
    return c.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok) c.put(req, res.clone());
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    });
  });
}

function cacheFirst(req) {
  return caches.open(MEDIA).then(function (c) {
    return c.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && (res.ok || res.type === "opaque")) {
          c.put(req, res.clone());
          c.keys().then(function (ks) { if (ks.length > 60) c.delete(ks[0]); });
        }
        return res;
      });
    });
  });
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (NO_CACHE.indexOf(url.pathname) >= 0 || url.pathname === "/" || url.pathname.indexOf("/_") === 0) return;
    if (/\.(html|css|js)$/.test(url.pathname)) e.respondWith(staleWhileRevalidate(req, SHELL));
    return;
  }
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com" || url.hostname === "static.wixstatic.com") {
    e.respondWith(cacheFirst(req));
  }
});
