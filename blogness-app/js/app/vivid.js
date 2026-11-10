// 40A (10 Nov 2026): small interactions on every page, plus the offline/fast cache.
// Plain script (no imports) so it never delays the page's own module. Everything is optional:
// if a browser lacks a feature, the page simply works as before.
(function () {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1) Fast repeat visits: service worker keeps the app shell and images on the phone.
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", function () { navigator.serviceWorker.register("/sw.js").catch(function () {}); });
  }

  // 2) Prefetch the next page as soon as a finger touches a link (navigation feels instant).
  var fetched = {};
  function prefetch(a) {
    if (!a || !a.href || a.target === "_blank") return;
    var u; try { u = new URL(a.href); } catch (e) { return; }
    if (u.origin !== location.origin || !/\.html$/.test(u.pathname) || u.pathname === location.pathname || fetched[u.pathname]) return;
    fetched[u.pathname] = 1;
    var l = document.createElement("link"); l.rel = "prefetch"; l.href = u.pathname; document.head.appendChild(l);
  }
  document.addEventListener("pointerdown", function (e) { prefetch(e.target.closest && e.target.closest("a")); }, { passive: true });
  document.addEventListener("mouseover", function (e) { prefetch(e.target.closest && e.target.closest("a")); }, { passive: true });

  // 3) Tap ripple on buttons, tiles and entries.
  var RIP = ".btn,.pills button,.my-tile,.ag-voce,.ag-item,.my-btns a,.my-btns button,.my-person button,.dm,.my-day a,.ag-day";
  document.addEventListener("pointerdown", function (e) {
    if (reduce) return;
    var el = e.target.closest && e.target.closest(RIP);
    if (!el) return;
    var r = el.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2;
    var s = document.createElement("span");
    s.className = "rip";
    s.style.cssText = "width:" + d + "px;height:" + d + "px;left:" + (e.clientX - r.left - d / 2) + "px;top:" + (e.clientY - r.top - d / 2) + "px";
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.style.overflow = "hidden";
    el.appendChild(s);
    setTimeout(function () { s.remove(); }, 600);
  }, { passive: true });

  // 4) Bounce on the tab bar, a short buzz and a colour burst when something is liked or saved.
  document.addEventListener("click", function (e) {
    var tab = e.target.closest && e.target.closest(".tabs a");
    if (tab) { tab.classList.remove("tap"); void tab.offsetWidth; tab.classList.add("tap"); }
    var tog = e.target.closest && e.target.closest(".ig-acts .icon-btn,.acard .save,[data-save],[data-like]");
    if (!tog) return;
    setTimeout(function () {
      if (tog.getAttribute("aria-pressed") !== "true") return;
      try { navigator.vibrate && navigator.vibrate(8); } catch (x) {}
      if (!reduce) burst(e.clientX, e.clientY);
    }, 30);
  });
  var COLS = ["#FF6B57", "#F5A524", "#16A889", "#7B5CFF", "#2F8CFF", "#EE4F8F"];
  function burst(x, y) {
    for (var i = 0; i < 10; i++) {
      var p = document.createElement("span"), a = (Math.PI * 2 * i) / 10, r = 28 + Math.random() * 18;
      p.className = "burst";
      p.style.cssText = "left:" + (x - 4) + "px;top:" + (y - 4) + "px;background:" + COLS[i % COLS.length] + ";--dx:" + Math.cos(a) * r + "px;--dy:" + Math.sin(a) * r + "px";
      document.body.appendChild(p);
      setTimeout(function (n) { n.remove(); }.bind(null, p), 650);
    }
  }

  // 5) Cards and entries glide in as they scroll into view (also those added later by the page).
  var SEL = ".ig,.acard,.ag-voce,.ag-item,.my-sec,.dm,.act,.grid2 .tile,.dayrow,.pcard,.list .item";
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    var tag = function (root) {
      var list = (root.querySelectorAll ? root.querySelectorAll(SEL) : []);
      var n = 0;
      Array.prototype.forEach.call(list, function (el) {
        if (el.classList.contains("rv")) return;
        var r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0 && n > 7) return; // never hide what is already on screen after the first few
        el.classList.add("rv");
        el.style.setProperty("--d", Math.min(n, 6) * 0.05 + "s");
        n++;
        io.observe(el);
      });
    };
    var mo = new MutationObserver(function (ms) { ms.forEach(function (m) { m.addedNodes.forEach(function (nd) { if (nd.nodeType === 1) tag(nd.parentNode || nd); }); }); });
    var start = function () { tag(document); mo.observe(document.body, { childList: true, subtree: true }); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  }

  // 6) Pull down at the top of a tab to refresh it.
  var ptr, y0 = null, dy = 0;
  function el() {
    if (!ptr) {
      ptr = document.createElement("div"); ptr.className = "ptr"; ptr.setAttribute("aria-hidden", "true");
      ptr.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/></svg>';
      document.body.appendChild(ptr);
    }
    return ptr;
  }
  document.addEventListener("touchstart", function (e) {
    if (!document.getElementById("tabs") || scrollY > 0 || e.touches.length !== 1) { y0 = null; return; }
    if (e.target.closest && e.target.closest("input,textarea,select,.mapview,.hscroll,.cards-x,.stories,.friends-row,.pills")) { y0 = null; return; }
    y0 = e.touches[0].clientY; dy = 0;
  }, { passive: true });
  document.addEventListener("touchmove", function (e) {
    if (y0 == null) return;
    dy = e.touches[0].clientY - y0;
    if (dy <= 0 || scrollY > 0) return;
    var p = el(), k = Math.min(dy, 120);
    p.style.opacity = String(Math.min(k / 80, 1));
    p.style.transform = "translateY(" + (k * 0.6 - 10) + "px)";
    p.firstChild.style.transform = "rotate(" + k * 3 + "deg)";
  }, { passive: true });
  document.addEventListener("touchend", function () {
    if (y0 == null || !ptr) { y0 = null; return; }
    if (dy > 90 && scrollY <= 0) { ptr.classList.add("go"); setTimeout(function () { location.reload(); }, 250); }
    else { ptr.style.opacity = "0"; ptr.style.transform = "translateY(-50px)"; }
    y0 = null;
  });
})();
