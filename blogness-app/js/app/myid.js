import { t, fmtDate, langPref, setLangPref } from "/js/app/i18n.js";
import { tx } from "/js/app/more.js";
import { logout } from "/js/org/member-store.js";
import { queryItems } from "/js/wix/items.js";
import { imgSrc } from "/js/wix/media.js";
import { loadActions, list as listActions, has, toggle, onActions } from "/js/app/actions.js";
import { gate, esc, avatar, stateBox, toast, initialsOf, MUSIC, CAL, TONES } from "/js/app/common.js";

var listEl = document.getElementById("list");
var seg = document.getElementById("seg");
var tab = new URLSearchParams(location.search).get("tab") || "photos";
var ready = false, failed = false, member = null;
var wish = { mine: null, friends: null, error: false };
var GRADS = ["linear-gradient(160deg,#F2B36B,#E0565B)", "#CFD8DF", "linear-gradient(200deg,#0E6B6F,#8FC1BE)", "#DCE4EA", "linear-gradient(150deg,#526576,#26323D)", "#E3E8EC"];

var ICON = {
  photos: '<path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/>',
  saved: '<path d="M6 4h12v16l-6-4-6 4z"/>',
  wish: '<path d="M3.5 8h17v4h-17zM5 12v8h14v-8M12 8v12M12 8C10.5 5 7 4.5 7 6.7 7 8 9.5 8 12 8zm0 0c1.5-3 5-3.5 5-1.3C17 8 14.5 8 12 8z"/>',
  day: '<path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"/>'
};
var LABEL = { photos: "me.tabPhotos", saved: "me.tabSaved", wish: "me.tabWish", day: "me.tabDay" };
function svg(p, w) { return '<svg width="' + (w || 24) + '" height="' + (w || 24) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + "</svg>"; }

function renderSeg() {
  seg.setAttribute("aria-label", tx("me.highlights"));
  seg.innerHTML = ["photos", "saved", "wish", "day"].map(function (id) {
    return '<button type="button" data-tab="' + id + '" aria-pressed="' + (tab === id) + '" aria-label="' + esc(tx(LABEL[id])) + '">' + svg(ICON[id]) + "</button>";
  }).join("");
}

function counts() {
  if (!ready) return ["–", "–", "–"];
  var saved = listActions(["save", "like"]).filter(function (r) { return r.title; }).length;
  var events = listActions("event").length;
  var w = wish.mine ? wish.mine.length : "–";
  return [saved, events, w];
}

function renderProfile() {
  var m = member;
  var name = m ? (m.firstName || m.displayName || "") : "";
  document.getElementById("handle").textContent = m && (m.nickname || m.displayName) ? (m.nickname || m.displayName) : "MyID";
  var c = counts();
  document.getElementById("pf").innerHTML =
    '<span class="ring"><span class="pic">' + (m && m.photoUrl ? '<img src="' + esc(m.photoUrl) + '" alt="' + esc(t("me.photoAlt")) + '">' : '<svg width="44" height="44" viewBox="0 0 24 24" fill="#8A97A3" role="img" aria-label="' + esc(t("me.photoAlt")) + '"><circle cx="12" cy="10" r="4"/><path d="M4 23c1-4.5 4.2-7 8-7s7 2.5 8 7z"/></svg>') + "</span></span>" +
    '<div class="stats">' +
      '<button type="button" data-goto="saved" style="border:0;background:none;cursor:pointer;font:inherit"><b>' + c[0] + "</b><span>" + esc(tx("me.statSaved")) + "</span></button>" +
      '<button type="button" data-goto="day" style="border:0;background:none;cursor:pointer;font:inherit"><b>' + c[1] + "</b><span>" + esc(tx("me.statEvents")) + "</span></button>" +
      '<button type="button" data-goto="wish" style="border:0;background:none;cursor:pointer;font:inherit"><b>' + c[2] + "</b><span>" + esc(tx("me.statWish")) + "</span></button>" +
    "</div>";
  var since = m && m.memberSince ? fmtDate(m.memberSince, { month: "long", year: "numeric" }) : "";
  document.getElementById("bio").innerHTML =
    '<span class="hello">' + esc(name ? t("me.welcomeName", { name: name }) : t("me.welcome")) + "</span>" +
    (m && m.loginEmail ? "<span>" + esc(m.loginEmail) + "</span>" : "") +
    (since ? "<span>" + esc(t("me.since", { date: since })) + "</span>" : "") +
    (!m ? "<span>" + esc(t("me.unavailable")) + "</span>" : "");
}

function renderHighlights() {
  var hl = [
    ["wish", tx("me.wish"), "#E0565B", ICON.wish, null],
    ["day", t("me.day"), "#F2B36B", '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M5 12H3M21 12h-2M6.3 6.3 4.9 4.9M19.1 19.1l-1.4-1.4M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>', null],
    ["events", t("me.events"), "#0E6B6F", ICON.day, null],
    ["saved", tx("me.trips"), "#526576", '<path d="M2 16l20-8-5 12-4-5-5 3z"/>', null],
    ["music", tx("me.music"), "#26323D", null, "/musica.html"]
  ];
  document.getElementById("hl").innerHTML = hl.map(function (h) {
    var inner = '<span class="ring seen"><span class="disc" style="background:' + h[2] + ';color:#FFFFFF">' + (h[3] ? svg(h[3]) : MUSIC) + '</span></span><span class="lbl">' + esc(h[1]) + "</span>";
    return h[4] ? '<a class="story sm" href="' + h[4] + '">' + inner + "</a>" : '<button type="button" class="story sm" data-goto="' + (h[0] === "events" ? "day" : h[0]) + '">' + inner + "</button>";
  }).join("");
}

function cell(r, i, extra) {
  var tag = r.link ? "a" : "div";
  return "<" + tag + ' class="cell"' + (r.link ? ' href="' + esc(r.link) + '"' : "") + ' style="background:' + GRADS[i % GRADS.length] + '">' + (r.img ? '<img src="' + esc(r.img) + '" alt="" loading="lazy">' : "") + (extra || "") + '<span class="t">' + esc(r.title) + "</span></" + tag + ">";
}

function wishView() {
  if (wish.error) return stateBox(t("common.loadError"), true);
  if (!wish.mine || !wish.friends) return '<div class="pad"><div class="skeleton" style="height:180px"></div></div>';
  var mine = wish.mine.length ? '<div class="pgrid">' + wish.mine.map(function (w, i) {
    return cell({ title: w.title + (w.priceLabel ? " · " + w.priceLabel : ""), img: w.image ? imgSrc(w.image, 500, 500) : "" }, i, w.reserved ? '<span class="flag">' + esc(t("wish.reserved")) + "</span>" : "");
  }).join("") + "</div>" : '<div class="pad">' + stateBox(t("wish.emptyMine")) + "</div>";
  var groups = [], by = {};
  wish.friends.forEach(function (r) { if (!by[r.friendName]) { by[r.friendName] = { head: r, items: [] }; groups.push(by[r.friendName]); } by[r.friendName].items.push(r); });
  var friends = groups.length ? groups.map(function (g) {
    var h = g.head;
    return '<section class="stack" style="gap:10px"><div class="byline">' + avatar(h.initials, h.friendName) + '<span class="who"><span class="name">' + esc(h.friendName) + '</span><span class="muted">' + esc(h.note) + "</span></span>" +
      (h.birthday ? '<span class="chip" style="margin-left:auto;color:#E0565B">' + esc(t("wish.birthday")) + "</span>" : "") + '</div><div class="list">' +
      g.items.map(function (it, i) {
        var on = has("gift", "wish-" + it._id);
        return '<div class="item" style="cursor:default"><span class="thumb" style="background:' + TONES[(i + 1) % TONES.length] + '"></span><span class="body"><span style="font-size:14.5px;font-weight:600">' + esc(it.itemTitle) + '</span><span class="muted">' + esc(it.priceLabel) + "</span></span>" +
          '<button type="button" class="btn sm ' + (on ? "on" : "primary") + '" data-gift="' + esc(it._id) + '" aria-pressed="' + on + '">' + esc(t(on ? "wish.gifted" : "wish.gift")) + "</button></div>";
      }).join("") + "</div></section>";
  }).join("") : stateBox(t("wish.emptyFriends"));
  return '<p class="lead" style="padding:12px 16px">' + esc(t("wish.lead")) + "</p>" + mine +
    '<div class="pad stack" style="gap:16px"><div class="section-title"><h2>' + esc(tx("me.wishFriends")) + "</h2></div>" + friends + "</div>";
}

function rowsGrid(rows, emptyKey) {
  if (!rows.length) return '<div class="pad">' + stateBox(t(emptyKey)) + "</div>";
  return '<div class="pgrid">' + rows.map(function (r, i) { return cell({ title: r.title, link: r.link }, i); }).join("") + "</div>";
}

function render() {
  renderProfile();
  renderSeg();
  if (tab === "wish") { listEl.innerHTML = wishView(); return; }
  if (tab === "photos") { listEl.innerHTML = '<div class="pad">' + stateBox(t("me.photosEmpty")) + "</div>"; return; }
  if (failed) { listEl.innerHTML = '<div class="pad">' + stateBox(t("common.loadError"), true) + "</div>"; return; }
  if (!ready) { listEl.innerHTML = '<div class="pad"><div class="skeleton" style="height:180px"></div></div>'; return; }
  if (tab === "day") {
    var day = listActions("day"), ev = listActions("event");
    listEl.innerHTML = (day.length || ev.length) ? rowsGrid(ev.concat(day), "me.dayEmpty") : '<div class="pad">' + stateBox(t("me.dayEmpty")) + "</div>";
  } else listEl.innerHTML = rowsGrid(listActions(["save", "like"]).filter(function (r) { return r.title; }), "me.savedEmpty");
}

function loadAll() {
  failed = false; wish.error = false;
  loadActions().then(function () { ready = true; render(); }).catch(function () { failed = true; render(); });
  Promise.all([
    queryItems("wishlistItems", { sort: [{ field: "order", direction: "asc" }], limit: 50 }),
    queryItems("friendWishes", { sort: [{ field: "order", direction: "asc" }], limit: 100 })
  ]).then(function (r) { wish.mine = r[0].items || []; wish.friends = r[1].items || []; render(); })
    .catch(function () { wish.error = true; render(); });
}

function go(id) { tab = id; history.replaceState(null, "", "/myid.html?tab=" + id); render(); }
document.addEventListener("click", function (e) {
  var g = e.target.closest("[data-goto]");
  if (g) { go(g.dataset.goto); listEl.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
  var b = e.target.closest("#seg button[data-tab]");
  if (b) { go(b.dataset.tab); return; }
  if (e.target.closest("[data-retry]")) { loadAll(); return; }
  var gift = e.target.closest("[data-gift]");
  if (gift) {
    var it = (wish.friends || []).filter(function (x) { return x._id === gift.dataset.gift; })[0] || {};
    toggle("gift", "wish-" + it._id, { title: it.itemTitle, meta: it.friendName }).catch(function () { toast(t("act.error")); });
  }
});
onActions(function () { if (ready) render(); });

var menu = document.getElementById("menu"), menuBtn = document.getElementById("menuBtn");
menuBtn.setAttribute("aria-label", tx("me.settings"));
menuBtn.addEventListener("click", function () { menu.hidden = !menu.hidden; menuBtn.setAttribute("aria-expanded", String(!menu.hidden)); });
var langSel = document.getElementById("lang");
langSel.value = langPref();
langSel.addEventListener("change", function () { setLangPref(langSel.value); });
document.getElementById("logout").addEventListener("click", function () { logout("/index.html").catch(function () {}); });
var shareBtn = document.getElementById("shareBtn");
shareBtn.textContent = tx("me.share");
shareBtn.addEventListener("click", function () {
  var url = "https://www.blogness.org";
  if (navigator.share) navigator.share({ title: "Blogness", url: url }).catch(function () {});
  else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { toast(tx("feed.copied")); }).catch(function () {});
});

renderHighlights();
gate("myid", function (s) { member = s.member; render(); loadAll(); });
