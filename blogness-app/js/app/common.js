// Shared helpers for the Blogness app pages: session gate, bottom tab bar, escaping, tones, toasts.
import { subscribeMember, getMemberState } from "/js/org/member-store.js";
import { t } from "/js/app/i18n.js";
import { tx } from "/js/app/more.js";
import { fx } from "/js/app/social-text.js";

export var TONES = ["var(--t1)", "var(--t2)", "var(--line)", "var(--t4)", "#D3DCE3", "var(--mist)"];

export function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function toneFor(key) {
  var s = String(key || ""), h = 0;
  for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length];
}

export function avatar(initials, key, cls, photo) {
  return '<span class="av ' + (cls || "") + '" style="background:' + toneFor(key || initials) + '" aria-hidden="true">' +
    (photo ? '<img src="' + esc(photo) + '" alt="">' : esc(initials)) + "</span>";
}

export function initialsOf(name) {
  return String(name || "").split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join("") || "B";
}

export function stateBox(text, retry) {
  return '<div class="state">' + esc(text) + (retry ? '<br><button type="button" class="btn sm quiet" data-retry>' + esc(t("common.retry")) + "</button>" : "") + "</div>";
}

export function toast(text) {
  var el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.hidden = false;
  clearTimeout(el._t);
  el._t = setTimeout(function () { el.hidden = true; }, 3200);
}

// A quiet image placeholder: tonal block with a small caption (used only where no photo exists).
export function mediaBox(url, caption, cls, tone) {
  return '<div class="media ' + (cls || "") + '" style="background:' + (tone || "var(--t1)") + '">' +
    (url ? '<img src="' + esc(url) + '" alt="" loading="lazy">' : (caption ? '<span class="cap">' + esc(caption) + "</span>" : "")) + "</div>";
}

export var HEART = function (on) {
  return '<svg width="24" height="24" viewBox="0 0 24 24" fill="' + (on ? "var(--heart)" : "none") + '" stroke="' + (on ? "var(--heart)" : "currentColor") + '" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';
};
export var BOOKMARK = function (on) {
  return '<svg width="24" height="24" viewBox="0 0 24 24" fill="' + (on ? "var(--deep)" : "none") + '" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M6 4h12v16l-6-4-6 4z"/></svg>';
};

export var COMMENT = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5z"/></svg>';
export var SEND = '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 3 3 10.5l7 3 3 7z"/><path d="m10 13.5 4.5-4.5"/></svg>';
export var MUSIC = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>';
export var CAL = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"/></svg>';

var ICONS = {
  feed: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  proposte: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  contatti: '<circle cx="9" cy="8" r="3.2"/><path d="M3 19.5c.7-3.2 3-5 6-5s5.3 1.8 6 5"/><circle cx="16.5" cy="9" r="2.6"/><path d="M16 14.6c2.6.1 4.3 1.7 4.9 4.4"/>',
  musica: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  notifiche: '<path class="fillable" d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'
};
var TABS = [
  { id: "feed", href: "/feed.html", label: "navHome" },
  { id: "proposte", href: "/proposte.html", label: "navScopri" },
  { id: "musica", href: "/musica.html", label: "navMusica" },
  { id: "contatti", href: "/contatti.html", label: "navPersone" },
  { id: "myid", href: "/myid.html", label: "navTu" }
];

function svg(path) {
  return '<svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + "</svg>";
}

export function renderTabs(active, member) {
  var el = document.getElementById("tabs");
  if (!el) return;
  var photo = member && member.photoUrl;
  el.innerHTML = '<div class="tabs-in">' + TABS.map(function (tab) {
    var on = tab.id === active;
    var icon = tab.id === "myid"
      ? '<span class="me">' + (photo ? '<img src="' + esc(photo) + '" alt="">' : '<svg width="18" height="18" viewBox="0 0 24 24" style="fill:var(--muted)" aria-hidden="true"><circle cx="12" cy="10" r="4"/><path d="M4 23c1-4.5 4.2-7 8-7s7 2.5 8 7z"/></svg>') + "</span>"
      : svg(ICONS[tab.id === "musica" ? "musica" : tab.id]);
    var extra = "";
    var label = fx(tab.label);
    return '<a href="' + tab.href + '"' + (on ? ' aria-current="page"' : "") + ' aria-label="' + esc(label) + '">' + extra + icon + "<span>" + esc(label) + '</span><span class="tdot"></span></a>';
  }).join("") + "</div>";
}

// Gate a page behind the member session. onReady(state) runs once a member is logged in.
// A visitor goes to the login page.
export function gate(active, onReady) {
  var started = false;
  function handle(s) {
    if (s.loading) return;
    if (!s.loggedIn) {
      location.replace("/index.html?returnTo=" + encodeURIComponent(location.pathname + location.search));
      return;
    }
    renderTabs(active, s.member);
    if (!started) { started = true; onReady(s); }
  }
  subscribeMember(handle);
  handle(getMemberState());
}
