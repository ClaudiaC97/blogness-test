import { t, fmtDate, langPref, setLangPref } from "/js/app/i18n.js";
import { tx } from "/js/app/more.js";
import { logout } from "/js/org/member-store.js";
import { queryItems } from "/js/wix/items.js";
import { imgSrc } from "/js/wix/media.js";
import { loadActions, list as listActions, has, toggle, onActions } from "/js/app/actions.js";
import { loadFollow, onFollow, counts as followCounts } from "/js/app/follow.js";
import { fx } from "/js/app/social-text.js";
import { gate, esc, avatar, stateBox, toast, initialsOf, MUSIC, CAL, TONES } from "/js/app/common.js";

var listEl = document.getElementById("list");
var tab = new URLSearchParams(location.search).get("tab") || "";
var agendaEl = document.getElementById("agenda"), subEl = document.getElementById("sub");
var ready = false, failed = false, member = null;
var wish = { mine: null, friends: null, error: false };
var GRADS = ["linear-gradient(160deg,var(--gold),var(--heart))", "var(--t2)", "linear-gradient(200deg,var(--accent),#8FC1BE)", "var(--t4)", "linear-gradient(150deg,var(--brand),var(--deep))", "var(--line)"];

var ICON = {
  photos: '<path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/>',
  saved: '<path d="M6 4h12v16l-6-4-6 4z"/>',
  wish: '<path d="M3.5 8h17v4h-17zM5 12v8h14v-8M12 8v12M12 8C10.5 5 7 4.5 7 6.7 7 8 9.5 8 12 8zm0 0c1.5-3 5-3.5 5-1.3C17 8 14.5 8 12 8z"/>',
  day: '<path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"/>'
};
var LABEL = { photos: "me.tabPhotos", saved: "me.tabSaved", wish: "me.tabWish", day: "me.tabDay" };
function svg(p, w) { return '<svg width="' + (w || 24) + '" height="' + (w || 24) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + "</svg>"; }

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
  var c = counts();
  var fc = followCounts();
  document.getElementById("pf").innerHTML =
    '<span class="ring"><span class="pic">' + (m && m.photoUrl ? '<img src="' + esc(m.photoUrl) + '" alt="' + esc(t("me.photoAlt")) + '">' : '<svg width="44" height="44" viewBox="0 0 24 24" style="fill:var(--faint)" role="img" aria-label="' + esc(t("me.photoAlt")) + '"><circle cx="12" cy="10" r="4"/><path d="M4 23c1-4.5 4.2-7 8-7s7 2.5 8 7z"/></svg>') + "</span></span>" +
    '<div class="stats">' +
      '<button type="button" data-goto="saved" style="border:0;background:none;cursor:pointer;font:inherit"><b>' + c[0] + "</b><span>" + esc(tx("me.statSaved")) + "</span></button>" +
      '<a href="/contatti.html?tab=req" style="color:inherit;text-decoration:none"><b>' + (fc ? fc.followers : "–") + "</b><span>" + esc(fx("followers")) + "</span></a>" +
      '<a href="/contatti.html?tab=chat" style="color:inherit;text-decoration:none"><b>' + (fc ? fc.following : "–") + "</b><span>" + esc(fx("followingStat")) + "</span></a>" +
      '<button type="button" data-goto="wish" style="border:0;background:none;cursor:pointer;font:inherit"><b>' + c[2] + "</b><span>" + esc(tx("me.statWish")) + "</span></button>" +
    "</div>";
  var since = m && m.memberSince ? fmtDate(m.memberSince, { month: "long", year: "numeric" }) : "";
  document.getElementById("bio").innerHTML =
    '<span class="hello">' + esc(name ? t("me.welcomeName", { name: name }) : t("me.welcome")) + "</span>" +
    (m && m.loginEmail ? "<span>" + esc(m.loginEmail) + "</span>" : "") +
    (since ? "<span>" + esc(t("me.since", { date: since })) + "</span>" : "") +
    (!m ? "<span>" + esc(t("me.unavailable")) + "</span>" : "");
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
      (h.birthday ? '<span class="chip" style="margin-left:auto;color:var(--heart)">' + esc(t("wish.birthday")) + "</span>" : "") + '</div><div class="list">' +
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

var V = {
  pub: ["vPub", "vPubS", '<path d="M12 5v14M5 12h14"/>', "https://www.blogness.org/community-hub"],
  share: ["vShare", "vShareS", '<path d="M12 3v12"/><path d="m7.5 7.5 4.5-4.5 4.5 4.5"/><path d="M5 13v6.5h14V13"/>', "#share"],
  day: ["vDay", "vDayS", '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>', "/proposte.html?tab=day"],
  trip: ["vTrip", "vTripS", '<path d="M2.5 13.5 21 6l-4.5 14-4-6-6-1.5z"/><path d="m12.5 14 4-4"/>', "/proposte.html?tab=trips"],
  chat: ["vChat", "vChatS", '<path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5z"/>', "/contatti.html?tab=chat"],
  events: ["vEvents", "vEventsS", '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>', "?tab=day"],
  wish: ["vWish", "vWishS", '<rect x="3.5" y="8" width="17" height="4.5" rx="1"/><path d="M5 12.5V20h14v-7.5M12 8v12"/><path d="M12 8c-1.5-3.5-5.5-3.5-5.5-1S10 8 12 8c2 0 5.5 0 5.5-1S13.5 4.5 12 8z"/>', "?tab=wish"],
  saved: ["vSaved", "vSavedS", '<path d="M6 3h12v18l-6-4-6 4z"/>', "?tab=saved"],
  music: ["vMusic", "vMusicS", '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>', "/musica.html"],
  profile: ["vProfile", "vProfileS", '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>', "?tab=profile"]
};
var ORDER = ["pub", "share", "day", "trip", "chat", "events", "wish", "saved", "music", "profile"];
var SUBTITLE = { day: "vEvents", wish: "vWish", saved: "vSaved", profile: "vProfile" };

function weekStrip() {
  var now = new Date(), d0 = new Date(now), dow = (now.getDay() + 6) % 7;
  d0.setDate(now.getDate() - dow);
  var out = [];
  for (var i = 0; i < 7; i++) {
    var d = new Date(d0); d.setDate(d0.getDate() + i);
    var on = d.toDateString() === now.toDateString();
    var wd = d.toLocaleDateString(document.documentElement.lang || "it", { weekday: "short" }).replace(".", "");
    out.push('<span class="ag-day' + (on ? " on" : "") + '"' + (on ? ' aria-current="date"' : "") + "><span>" + esc(wd) + "</span><b>" + d.getDate() + "</b></span>");
  }
  return '<div class="ag-week" aria-label="' + esc(fx("agMonth")) + '">' + out.join("") + "</div>";
}

function renderAgenda() {
  var m = member || {};
  document.getElementById("agKick").textContent = fx("agKick");
  document.getElementById("mePh").innerHTML = m.photoUrl ? '<img src="' + esc(m.photoUrl) + '" alt="">' : esc(initialsOf(m.firstName || m.nickname || "MyID"));
  document.getElementById("addBtn").setAttribute("aria-label", fx("agAdd"));
  var items = ready ? listActions(["event", "day"]) : null;
  var html = weekStrip();
  html += '<div class="sechead"><h2>' + esc(fx("agInAgenda")) + "</h2>" + (items && items.length > 4 ? '<a href="?tab=day">' + esc(fx("seeAll")) + "</a>" : "") + "</div>";
  if (failed) html += '<div class="pad">' + stateBox(t("common.loadError"), true) + "</div>";
  else if (!items) html += '<div class="pad"><div class="skeleton" style="height:120px"></div></div>';
  else if (!items.length) html += '<div class="ag-empty"><p>' + esc(fx("agEmpty")) + '</p><a class="btn primary" href="/proposte.html?tab=day">' + esc(fx("vDay")) + "</a></div>";
  else html += '<div class="ag-list">' + items.slice(0, 4).map(function (r) {
    return '<a class="ag-item" href="' + esc(r.link || "?tab=day") + '"><span class="bar"></span><span class="tx"><b>' + esc(r.title || "") + "</b>" + (r.meta ? "<span>" + esc(r.meta) + "</span>" : "") + '</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></a>';
  }).join("") + "</div>";
  html += '<div class="sechead"><h2>' + esc(fx("agWhat")) + '</h2></div><nav class="ag-voci" aria-label="' + esc(fx("agWhat")) + '">' + ORDER.map(function (k) {
    var v = V[k], ext = v[3].indexOf("http") === 0;
    return '<a class="ag-voce" href="' + v[3] + '"' + (k === "share" ? ' data-share-app="1"' : "") + (ext ? ' target="_blank" rel="noopener"' : "") + '><span class="ic">' + svg(v[2], 21) + '</span><span class="tx"><b>' + esc(fx(v[0])) + "</b><span>" + esc(fx(v[1])) + '</span></span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></a>';
  }).join("") + "</nav>";
  agendaEl.innerHTML = html;
}

function render() {
  var inSub = !!SUBTITLE[tab];
  agendaEl.hidden = inSub; subEl.hidden = !inSub;
  if (!inSub) { renderAgenda(); return; }
  document.getElementById("backLbl").textContent = fx("agBack");
  document.getElementById("subTitle").textContent = fx(SUBTITLE[tab]);
  document.getElementById("profileBox").hidden = tab !== "profile";
  if (tab === "profile") { renderProfile(); listEl.innerHTML = ""; return; }
  if (tab === "wish") { listEl.innerHTML = wishView(); return; }
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

function go(id) { tab = id || ""; history.pushState(null, "", "/myid.html" + (tab ? "?tab=" + tab : "")); render(); window.scrollTo(0, 0); }
window.addEventListener("popstate", function () { tab = new URLSearchParams(location.search).get("tab") || ""; render(); });
document.addEventListener("click", function (e) {
  var g = e.target.closest("[data-goto]");
  if (g) { go(g.dataset.goto); return; }
  if (e.target.closest("#backBtn")) { go(""); return; }
  var sh = e.target.closest("[data-share-app]");
  if (sh) { e.preventDefault(); shareBlogness(); return; }
  var inner = e.target.closest('a[href^="?tab="]');
  if (inner) { e.preventDefault(); go(inner.getAttribute("href").slice(5)); return; }
  if (e.target.closest("[data-retry]")) { loadAll(); return; }
  var gift = e.target.closest("[data-gift]");
  if (gift) {
    var it = (wish.friends || []).filter(function (x) { return x._id === gift.dataset.gift; })[0] || {};
    toggle("gift", "wish-" + it._id, { title: it.itemTitle, meta: it.friendName }).catch(function () { toast(t("act.error")); });
  }
});
onActions(function () { if (ready) render(); });

var langSel = document.getElementById("lang");
langSel.value = langPref();
langSel.addEventListener("change", function () { setLangPref(langSel.value); });
document.getElementById("logout").addEventListener("click", function () { logout("/index.html").catch(function () {}); });
var shareBtn = document.getElementById("shareBtn");
shareBtn.textContent = tx("me.share");
function shareBlogness() {
  var url = "https://www.blogness.org";
  if (navigator.share) navigator.share({ title: "Blogness", url: url }).catch(function () {});
  else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { toast(tx("feed.copied")); }).catch(function () {});
}
shareBtn.addEventListener("click", shareBlogness);

onFollow(function () { if (tab === "profile") renderProfile(); });
gate("myid", function (s) { member = s.member; render(); loadAll(); loadFollow().catch(function () {}); });
