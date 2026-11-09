import { t, LANG, fmtDate } from "/js/app/i18n.js";
import { tx, MUSICANDGO_URL, MUSIC_CATEGORY } from "/js/app/more.js";
import { wixRequest } from "/js/org/client.js";
import { imgSrc } from "/js/org/media.js";
import { CARD_FIELDSETS, feedQuery, toSummary } from "/js/org/posts-core.js";
import { fetchEventsPage } from "/js/org/events.js";
import { gate, esc, stateBox, mediaBox, TONES } from "/js/app/common.js";

var COUNTRIES = [
  ["IT", { it: "Italia", en: "Italy", es: "Italia" }, "var(--brand)"],
  ["BR", { it: "Brasile", en: "Brazil", es: "Brasil" }, "var(--accent)"],
  ["JP", { it: "Giappone", en: "Japan", es: "Japón" }, "var(--heart)"],
  ["NG", { it: "Nigeria", en: "Nigeria", es: "Nigeria" }, "#3E8E6E"],
  ["KR", { it: "Corea del Sud", en: "South Korea", es: "Corea del Sur" }, "var(--deep)"],
  ["CU", { it: "Cuba", en: "Cuba", es: "Cuba" }, "#B86A2E"],
  ["GB", { it: "Regno Unito", en: "United Kingdom", es: "Reino Unido" }, "var(--slate)"],
  ["JM", { it: "Giamaica", en: "Jamaica", es: "Jamaica" }, "#2F7D5B"]
];
var MUSIC_WORDS = /music|musica|música|concert|live|jazz|dj|band|opera|festival/i;

function setText(id, s) { var el = document.getElementById(id); if (el) el.textContent = s; }
setText("title", tx("music.title")); document.title = "Blogness · " + tx("music.title");
setText("eyebrow", tx("music.eyebrow")); setText("mgTitle", tx("music.mgTitle")); setText("mgText", tx("music.mgText"));
setText("openMapLbl", tx("music.openMap")); setText("byCountry", tx("music.byCountry")); setText("magazine", tx("music.magazine"));
setText("liveTitle", tx("music.live")); setText("allEvents", tx("music.allEvents")); setText("invite", tx("music.invite"));
document.getElementById("closeMap").setAttribute("aria-label", tx("music.closeMap"));

var mapview = document.getElementById("mapview");
function openMap() {
  if (!mapview.querySelector("iframe")) {
    var f = document.createElement("iframe");
    f.src = MUSICANDGO_URL;
    f.title = "Music&GO";
    f.setAttribute("allow", "fullscreen");
    mapview.appendChild(f);
  }
  mapview.hidden = false;
  document.body.style.overflow = "hidden";
  document.getElementById("closeMap").focus();
}
function closeMap() { mapview.hidden = true; document.body.style.overflow = ""; document.getElementById("openMap").focus(); }
document.getElementById("openMap").addEventListener("click", openMap);
document.getElementById("closeMap").addEventListener("click", closeMap);
document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !mapview.hidden) closeMap(); });

document.getElementById("countries").innerHTML = COUNTRIES.map(function (c) {
  return '<button type="button" class="story sm" data-country="' + c[0] + '"><span class="ring"><span class="disc" style="background:' + c[2] + ';color:var(--on-accent);font-size:13px;letter-spacing:.04em">' + c[0] + '</span></span><span class="lbl">' + esc(c[1][LANG] || c[1].en) + "</span></button>";
}).join("");
document.getElementById("countries").addEventListener("click", function (e) { if (e.target.closest("[data-country]")) openMap(); });

// Articles of the "Music & live" category in the phone's language (same query as the feed, filtered here).
function loadArticles() {
  var box = document.getElementById("articles");
  var q = feedQuery({ limit: 50 });
  q.filter = Object.assign({}, q.filter || {}, { language: { $eq: LANG } });
  var cat = MUSIC_CATEGORY[LANG];
  wixRequest("/blog/v3/posts/query", { body: { fieldsets: CARD_FIELDSETS, query: q } }).then(function (res) {
    var posts = ((res && res.posts) || []).filter(function (p) { return (p.categoryIds || []).indexOf(cat) >= 0; }).map(function (p) { return toSummary(p, imgSrc); });
    if (!posts.length) { box.innerHTML = stateBox(tx("music.noArticles")); return; }
    box.innerHTML = '<div class="grid2">' + posts.slice(0, 6).map(function (p, i) {
      return '<a class="tile" href="/post.html?slug=' + encodeURIComponent(p.slug) + '"><span class="ph" style="background:' + TONES[i % TONES.length] + '">' + (p.coverUrl ? '<img src="' + esc(p.coverUrl) + '" alt="" loading="lazy">' : "") + "</span><b>" + esc(p.title) + '</b><span class="muted">' + esc(fmtDate(p.dateISO)) + "</span></a>";
    }).join("") + "</div>";
  }).catch(function () { box.innerHTML = stateBox(t("common.loadError")); });
}

// Upcoming events that look musical (title / description); none yet → a friendly empty state.
function loadLive() {
  var box = document.getElementById("live");
  fetchEventsPage({ limit: 50 }).then(function (r) {
    var evs = (r.events || []).filter(function (e) { return MUSIC_WORDS.test((e.title || "") + " " + (e.shortDescription || "")); });
    if (!evs.length) { box.innerHTML = stateBox(tx("music.noLive")); return; }
    box.innerHTML = '<div class="list">' + evs.slice(0, 5).map(function (e, i) {
      return '<a class="item" href="/event.html?slug=' + encodeURIComponent(e.slug) + '"><span class="thumb" style="background:' + TONES[i % TONES.length] + '">' + (e.imageUrl ? '<img src="' + esc(e.imageUrl) + '" alt="">' : "") + '</span><span class="body"><span class="eyebrow accent">' + esc(e.dateLabel || "") + '</span><span style="font-size:15px;font-weight:700">' + esc(e.title) + "</span></span></a>";
    }).join("") + "</div>";
  }).catch(function () { box.innerHTML = stateBox(t("common.loadError")); });
}

gate("musica", function () { loadArticles(); loadLive(); });
