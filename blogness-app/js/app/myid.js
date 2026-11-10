// MyID (10 Nov 2026 redesign, Claudia GO 33B): calm editorial page in a new order:
// who you are -> today -> what to do -> this week -> next trip -> wishlist -> like-minded people.
// Settings, email and logout live behind the gear (?tab=profile). No follower counters on the page.
import { t, fmtDate, langPref, setLangPref, LANG } from "/js/app/i18n.js";
import { tx } from "/js/app/more.js";
import { logout } from "/js/org/member-store.js";
import { queryItems } from "/js/wix/items.js";
import { imgSrc } from "/js/wix/media.js";
import { loadActions, list as listActions, has, toggle, onActions } from "/js/app/actions.js";
import { loadFollow, onFollow, suggestions, isFollowing, setFollow } from "/js/app/follow.js";
import { fx } from "/js/app/social-text.js";
import { gate, esc, avatar, stateBox, toast, initialsOf, TONES } from "/js/app/common.js";
import { wixRequest } from "/js/org/client.js";
import { loadAffinity, myAffinity, setAffinity, affinityPeople } from "/js/app/affinity.js";

// 34B: interests saved on blogness.org ("My interests" page) as a member custom field: "travel,art-design".
var INTEREST = {
  travel: ["Viaggi", "Travel", "Viajes"], lifestyle: ["Stile personale", "Personal style", "Estilo personal"], style: ["Stile personale", "Personal style", "Estilo personal"],
  "art-design": ["Arte e cultura", "Arts & culture", "Arte y cultura"], art: ["Arte e cultura", "Arts & culture", "Arte y cultura"], design: ["Design", "Design", "Diseño"],
  music: ["Musica e live", "Music & live", "Música y directo"], "music-live": ["Musica e live", "Music & live", "Música y directo"],
  digital: ["Vita digitale", "Digital life", "Vida digital"], "digital-life": ["Vita digitale", "Digital life", "Vida digital"],
  trends: ["Tendenze", "Trends", "Tendencias"], "inspiration-trends": ["Tendenze", "Trends", "Tendencias"],
  sport: ["Sport", "Sport", "Deporte"], automotive: ["Motori", "Automotive", "Motor"], food: ["Cibo e ristoranti", "Food & restaurants", "Comida y restaurantes"],
  restaurants: ["Ristoranti", "Restaurants", "Restaurantes"], community: ["Community", "Community", "Comunidad"]
};
var interests = null; // null = loading, [] = none, false = error
function interestLabel(k) {
  var row = INTEREST[k];
  if (row) return row[LANG === "en" ? 1 : LANG === "es" ? 2 : 0];
  var w = k.replace(/[-_]+/g, " ").trim();
  return w.charAt(0).toUpperCase() + w.slice(1);
}
function loadInterests() {
  wixRequest("/members/v1/members/my", { method: "GET", query: { fieldsets: "FULL" } }).then(function (r) {
    var cf = (r && r.member && r.member.contact && r.member.contact.customFields) || {};
    var key = Object.keys(cf).filter(function (k) { return k.indexOf("interests") >= 0; })[0];
    var raw = key && cf[key] ? String(cf[key].value || "") : "";
    interests = raw.split(",").map(function (x) { return x.trim(); }).filter(Boolean);
    syncAff();
    if (!tab) render();
  }).catch(function () { interests = false; if (!tab) render(); });
}

var S = {
  it: { settings: "Impostazioni", edit: "Modifica profilo", share: "Condividi", today: "Oggi", yourDay: "La tua giornata", what: "Cosa vuoi fare", allOn: "Tutte le voci", allOff: "Meno voci", week: "Questa settimana", trip: "Prossimo viaggio", tripEmpty: "Nessun viaggio salvato. Scegli una meta tra le proposte.", tripCta: "Scegli un viaggio", wish: "Wishlist", seeAll: "Vedi tutto", wishEmpty: "La tua wishlist è vuota.", people: "Persone da conoscere", peopleNote: "Dalla community di Blogness.", follow: "Segui", following: "Segui già", motto: "Racconta in una frase le cose che ti muovono", since: "Su Blogness da {d}", gear: "Impostazioni", dayEmpty: "Niente in agenda oggi. Pianifica la giornata o scegli un evento.", interests: "I tuoi interessi", change: "Modifica", add: "Aggiungi", interestsEmpty: "Scegli i tuoi interessi: le proposte e le persone suggerite seguiranno i tuoi gusti.", interestsCta: "Scegli gli interessi", shareInt: "Mostra i miei interessi per trovare persone affini", shareNote: "Li vedono solo gli iscritti che condividono a loro volta i propri. Puoi disattivarlo quando vuoi.", sharedOn: "Interessi condivisi.", sharedOff: "Interessi non più condivisi.", inCommon: "In comune", peopleAff: "Persone che condividono i tuoi interessi.", peopleNone: "Ancora nessuno con interessi in comune. Intanto, dalla community:", peopleOff: "Attiva «Mostra i miei interessi» per vedere le persone affini. Intanto, dalla community:" },
  en: { settings: "Settings", edit: "Edit profile", share: "Share", today: "Today", yourDay: "Your day", what: "What would you like to do", allOn: "All options", allOff: "Fewer options", week: "This week", trip: "Next trip", tripEmpty: "No saved trip yet. Pick a destination from the suggestions.", tripCta: "Pick a trip", wish: "Wishlist", seeAll: "See all", wishEmpty: "Your wishlist is empty.", people: "People to meet", peopleNote: "From the Blogness community.", follow: "Follow", following: "Following", motto: "Tell us in one line what moves you", since: "On Blogness since {d}", gear: "Settings", dayEmpty: "Nothing on today. Plan your day or pick an event.", interests: "Your interests", change: "Edit", add: "Add", interestsEmpty: "Pick your interests: suggestions and people will follow your taste.", interestsCta: "Pick interests", shareInt: "Show my interests to find like-minded people", shareNote: "Only members who share their own interests can see them. You can turn this off anytime.", sharedOn: "Interests shared.", sharedOff: "Interests no longer shared.", inCommon: "In common", peopleAff: "People who share your interests.", peopleNone: "No one with interests in common yet. Meanwhile, from the community:", peopleOff: "Turn on “Show my interests” to see like-minded people. Meanwhile, from the community:" },
  es: { settings: "Ajustes", edit: "Editar perfil", share: "Compartir", today: "Hoy", yourDay: "Tu día", what: "Qué quieres hacer", allOn: "Todas las opciones", allOff: "Menos opciones", week: "Esta semana", trip: "Próximo viaje", tripEmpty: "Aún no has guardado ningún viaje. Elige un destino entre las propuestas.", tripCta: "Elige un viaje", wish: "Lista de deseos", seeAll: "Ver todo", wishEmpty: "Tu lista de deseos está vacía.", people: "Personas por conocer", peopleNote: "De la comunidad de Blogness.", follow: "Seguir", following: "Siguiendo", motto: "Cuenta en una frase lo que te mueve", since: "En Blogness desde {d}", gear: "Ajustes", dayEmpty: "Nada para hoy. Planifica el día o elige un evento.", interests: "Tus intereses", change: "Editar", add: "Añadir", interestsEmpty: "Elige tus intereses: las propuestas y las personas sugeridas seguirán tus gustos.", interestsCta: "Elegir intereses", shareInt: "Mostrar mis intereses para encontrar personas afines", shareNote: "Solo los ven los miembros que también comparten los suyos. Puedes desactivarlo cuando quieras.", sharedOn: "Intereses compartidos.", sharedOff: "Intereses ya no compartidos.", inCommon: "En común", peopleAff: "Personas que comparten tus intereses.", peopleNone: "Aún nadie con intereses en común. Mientras tanto, de la comunidad:", peopleOff: "Activa «Mostrar mis intereses» para ver personas afines. Mientras tanto, de la comunidad:" }
};
function s(k, v) { var d = S[LANG] || S.it; var out = d[k] || S.it[k] || k; if (v) Object.keys(v).forEach(function (n) { out = out.replace("{" + n + "}", v[n]); }); return out; }

var listEl = document.getElementById("list");
var tab = new URLSearchParams(location.search).get("tab") || "";
var agendaEl = document.getElementById("agenda"), subEl = document.getElementById("sub");
var ready = false, failed = false, member = null, showAll = false;
var wish = { mine: null, friends: null, error: false };
var GRADS = ["var(--t1)", "var(--t2)", "var(--t4)", "var(--mist)", "var(--line)", "var(--soft)"];

function svg(p, w) { return '<svg width="' + (w || 24) + '" height="' + (w || 24) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + "</svg>"; }
var CHEV = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';

// Settings view (behind the gear): private account details only.
function renderProfile() {
  var m = member;
  var name = m ? (m.firstName || m.displayName || m.nickname || "") : "";
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
  pub: ["vPub", "vPubS", '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>', "https://www.blogness.org/community-hub"],
  share: ["vShare", "vShareS", '<path d="M12 3v12"/><path d="m7.5 7.5 4.5-4.5 4.5 4.5"/><path d="M5 13v6.5h14V13"/>', "#share"],
  day: ["vDay", "vDayS", '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>', "/proposte.html?tab=day"],
  trip: ["vTrip", "vTripS", '<path d="M2.5 13.5 21 6l-4.5 14-4-6-6-1.5z"/><path d="m12.5 14 4-4"/>', "/proposte.html?tab=trips"],
  chat: ["vChat", "vChatS", '<path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5z"/>', "/contatti.html?tab=chat"],
  events: ["vEvents", "vEventsS", '<path d="M3.5 9V7a1.5 1.5 0 0 1 1.5-1.5h14A1.5 1.5 0 0 1 20.5 7v2a2.5 2.5 0 0 0 0 5v2a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 16v-2a2.5 2.5 0 0 0 0-5z"/><path d="M14.5 6v2.5M14.5 11v2M14.5 15.5V18"/>', "?tab=day"],
  wish: ["vWish", "vWishS", '<rect x="3.5" y="8" width="17" height="4.5" rx="1"/><path d="M5 12.5V20h14v-7.5M12 8v12"/><path d="M12 8c-1.5-3.5-5.5-3.5-5.5-1S10 8 12 8c2 0 5.5 0 5.5-1S13.5 4.5 12 8z"/>', "?tab=wish"],
  saved: ["vSaved", "vSavedS", '<path d="M6 3h12v18l-6-4-6 4z"/>', "?tab=saved"],
  music: ["vMusic", "vMusicS", '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>', "/musica.html"],
  profile: ["vProfile", "vProfileS", '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>', "?tab=profile"]
};
var TILES = ["pub", "day", "trip", "share", "chat", "events"];
var ORDER = ["pub", "share", "day", "trip", "chat", "events", "wish", "saved", "music", "profile"];
var SUBTITLE = { day: "vEvents", wish: "vWish", saved: "vSaved", profile: "settings" };

function linkAttrs(k) {
  var v = V[k], ext = v[3].indexOf("http") === 0;
  return ' href="' + v[3] + '"' + (k === "share" ? ' data-share-app="1"' : "") + (ext ? ' target="_blank" rel="noopener"' : "");
}

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
  return '<div class="my-week" aria-label="' + esc(s("week")) + '">' + out.join("") + "</div>";
}

function heroHtml() {
  var m = member || {};
  var name = m.firstName || m.displayName || m.nickname || "MyID";
  var handle = m.nickname ? "@" + m.nickname : "";
  var since = m.memberSince ? s("since", { d: fmtDate(m.memberSince, { month: "long", year: "numeric" }) }) : "";
  var about = m.about || m.headline || "";
  return '<section class="my-hero">' +
    '<div class="my-cover">' + (m.coverPhotoUrl ? '<img src="' + esc(m.coverPhotoUrl) + '" alt="">' : "") + "</div>" +
    '<div class="my-av">' + (m.photoUrl ? '<img src="' + esc(m.photoUrl) + '" alt="">' : esc(initialsOf(name))) + "</div>" +
    '<h1 class="my-name">' + esc(name) + "</h1>" +
    '<div class="my-handle">' + esc([handle, since].filter(Boolean).join(" · ")) + "</div>" +
    (about ? '<p class="my-motto">' + esc(about) + "</p>" : '<a class="my-motto empty" href="https://www.blogness.org/my-id" target="_blank" rel="noopener">' + esc(s("motto")) + " →</a>") +
    '<div class="my-btns"><a href="https://www.blogness.org/my-id" target="_blank" rel="noopener">' + esc(s("edit")) + '</a><button type="button" data-share-app="1">' + esc(s("share")) + "</button></div>" +
    "</section>";
}

function todayHtml() {
  var dateLbl = new Date().toLocaleDateString(LANG === "en" ? "en-GB" : LANG, { weekday: "long", day: "numeric", month: "long" });
  var h = '<section class="my-sec"><div class="my-kick">' + esc(s("today") + " · " + dateLbl) + '</div><div class="my-sh"><h2>' + esc(s("yourDay")) + "</h2>";
  var items = ready ? listActions(["event", "day"]) : null;
  if (items && items.length > 4) h += '<a href="?tab=day">' + esc(s("seeAll")) + "</a>";
  h += "</div>";
  if (failed) h += stateBox(t("common.loadError"), true);
  else if (!items) h += '<div class="skeleton" style="height:120px"></div>';
  else if (!items.length) h += '<div class="my-empty"><p>' + esc(s("dayEmpty")) + '</p><a class="btn primary" href="/proposte.html?tab=day">' + esc(fx("vDay")) + "</a></div>";
  else h += '<div class="my-day">' + items.slice(0, 4).map(function (r) {
    return '<a href="' + esc(r.link || "?tab=day") + '"><span class="dot"></span><span class="tx"><b>' + esc(r.title || "") + "</b>" + (r.meta ? "<span>" + esc(r.meta) + "</span>" : "") + "</span>" + CHEV + "</a>";
  }).join("") + "</div>";
  return h + "</section>";
}

function whatHtml() {
  var h = '<section class="my-sec"><div class="my-sh"><h2>' + esc(s("what")) + '</h2><button type="button" id="allBtn" aria-expanded="' + showAll + '">' + esc(s(showAll ? "allOff" : "allOn")) + "</button></div>";
  h += '<nav class="my-grid" aria-label="' + esc(s("what")) + '">' + TILES.map(function (k) {
    return '<a class="my-tile"' + linkAttrs(k) + ">" + svg(V[k][2], 22) + "<span>" + esc(fx(V[k][0])) + "</span></a>";
  }).join("") + "</nav>";
  h += '<nav class="ag-voci my-all"' + (showAll ? "" : " hidden") + ' aria-label="' + esc(s("allOn")) + '">' + ORDER.map(function (k) {
    return '<a class="ag-voce"' + linkAttrs(k) + '><span class="ic">' + svg(V[k][2], 21) + '</span><span class="tx"><b>' + esc(fx(V[k][0])) + "</b><span>" + esc(fx(V[k][1])) + "</span></span>" + CHEV + "</a>";
  }).join("") + "</nav>";
  return h + "</section>";
}

function weekHtml() {
  return '<section class="my-sec"><div class="my-sh"><h2>' + esc(s("week")) + '</h2><a href="?tab=day">' + esc(s("seeAll")) + "</a></div>" + weekStrip() + "</section>";
}

function interestsHtml() {
  var path = (LANG === "en" ? "" : "/" + LANG) + "/my-interests";
  var editUrl = "https://www.blogness.org" + path;
  var h = '<section class="my-sec"><div class="my-sh"><h2>' + esc(s("interests")) + '</h2><a href="' + editUrl + '" target="_blank" rel="noopener">' + esc(s("change")) + "</a></div>";
  if (interests === null) h += '<div class="skeleton" style="height:40px"></div>';
  else if (interests === false || !interests.length) h += '<div class="my-empty"><p>' + esc(s("interestsEmpty")) + '</p><a class="btn primary" href="' + editUrl + '" target="_blank" rel="noopener">' + esc(s("interestsCta")) + "</a></div>";
  else h += '<div class="my-chips">' + interests.map(function (k) { return '<span class="my-chip">' + esc(interestLabel(k)) + "</span>"; }).join("") +
    '<a class="my-chip add" href="' + editUrl + '" target="_blank" rel="noopener">+ ' + esc(s("add")) + "</a></div>";
  if (Array.isArray(interests) && interests.length) h += '<label class="my-switch"><input type="checkbox" id="shareInt"' + (myAffinity() ? " checked" : "") + (affBusy ? " disabled" : "") + '><span><b>' + esc(s("shareInt")) + "</b><small>" + esc(s("shareNote")) + "</small></span></label>";
  return h + "</section>";
}

function tripHtml() {
  var trips = ready ? listActions("save").filter(function (r) { return String(r.refId || "").indexOf("trip-") === 0; }) : [];
  var h = '<section class="my-sec"><div class="my-sh"><h2>' + esc(s("trip")) + "</h2></div>";
  if (trips.length) {
    var tr = trips[0];
    h += '<a class="my-trip" href="' + esc(tr.link || "/proposte.html?tab=trips") + '"><div class="ph"></div><div class="bd"><b>' + esc(tr.title) + "</b>" + (tr.meta ? "<span>" + esc(tr.meta) + "</span>" : "") + "</div></a>";
  } else {
    h += '<div class="my-empty"><p>' + esc(s("tripEmpty")) + '</p><a class="btn primary" href="/proposte.html?tab=trips">' + esc(s("tripCta")) + "</a></div>";
  }
  return h + "</section>";
}

function wishHtml() {
  var h = '<section class="my-sec full"><div class="my-sh"><h2>' + esc(s("wish")) + '</h2><a href="?tab=wish">' + esc(s("seeAll")) + "</a></div>";
  if (wish.error) h += '<div style="padding:0 20px">' + stateBox(t("common.loadError"), true) + "</div>";
  else if (!wish.mine) h += '<div style="padding:0 20px"><div class="skeleton" style="height:110px"></div></div>';
  else if (!wish.mine.length) h += '<div style="padding:0 20px"><div class="my-empty"><p>' + esc(s("wishEmpty")) + "</p></div></div>";
  else h += '<div class="my-wish">' + wish.mine.slice(0, 3).map(function (w) {
    return '<a href="?tab=wish"><div class="ph">' + (w.image ? '<img src="' + esc(imgSrc(w.image, 300, 300)) + '" alt="" loading="lazy">' : "") + "</div><span>" + esc(w.title) + "</span></a>";
  }).join("") + "</div>";
  return h + "</section>";
}

function personRow(p) {
  var on = isFollowing(p.id);
  return '<div class="my-person"><span class="pav">' + (p.photo ? '<img src="' + esc(p.photo) + '" alt="">' : esc(initialsOf(p.name))) + '</span><span class="nm">' + esc(p.name) +
    (p.common && p.common.length ? '<span class="my-common">' + esc(s("inCommon") + ": " + p.common.map(interestLabel).join(", ")) + "</span>" : "") +
    '</span><button type="button" data-follow="' + esc(p.id) + '" aria-pressed="' + on + '">' + esc(s(on ? "following" : "follow")) + "</button></div>";
}

function peopleHtml() {
  var shared = !!myAffinity();
  var h = '<section class="my-sec"><div class="my-sh"><h2>' + esc(s("people")) + '</h2><a href="/contatti.html">' + esc(s("seeAll")) + "</a></div>";
  if (shared && Array.isArray(interests)) {
    var aff = affinityPeople(interests).slice(0, 4);
    if (aff.length) return h + '<p class="my-note">' + esc(s("peopleAff")) + '</p><div class="my-people">' + aff.map(personRow).join("") + "</div></section>";
    h += '<p class="my-note">' + esc(s("peopleNone")) + "</p>";
  } else {
    h += '<p class="my-note">' + esc(s("peopleOff")) + "</p>";
  }
  var list = suggestions().slice(0, 3);
  if (!list.length) return h + "</section>";
  return h + '<div class="my-people">' + list.map(function (p) { return personRow({ id: p.id, name: p.name, photo: p.photo, common: [] }); }).join("") + "</div></section>";
}

var affBusy = false;
function affInfo() {
  var m = member || {};
  return { name: m.firstName || m.nickname || m.displayName || "", photo: m.photoUrl || "", interests: Array.isArray(interests) ? interests : [] };
}
function syncAff() {
  var mine = myAffinity();
  if (mine && Array.isArray(interests) && String(mine.interests || "") !== interests.join(",")) setAffinity(true, affInfo()).catch(function () {});
}
document.addEventListener("change", function (e) {
  if (!e.target || e.target.id !== "shareInt") return;
  var on = e.target.checked;
  affBusy = true; render();
  setAffinity(on, affInfo()).then(function () { affBusy = false; toast(s(on ? "sharedOn" : "sharedOff")); render(); })
    .catch(function () { affBusy = false; toast(t("act.error")); render(); });
});
function renderAgenda() {
  document.getElementById("addBtn").setAttribute("aria-label", fx("agAdd"));
  document.getElementById("gearBtn").setAttribute("aria-label", s("gear"));
  agendaEl.innerHTML = heroHtml() + todayHtml() + whatHtml() + weekHtml() + interestsHtml() + tripHtml() + wishHtml() + peopleHtml();
}

function render() {
  var inSub = !!SUBTITLE[tab];
  agendaEl.hidden = inSub; subEl.hidden = !inSub;
  if (!inSub) { renderAgenda(); return; }
  document.getElementById("backLbl").textContent = fx("agBack");
  document.getElementById("subTitle").textContent = tab === "profile" ? s("settings") : fx(SUBTITLE[tab]);
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
  if (e.target.closest("#backBtn")) { go(""); return; }
  if (e.target.closest("#allBtn")) { showAll = !showAll; render(); return; }
  var sh = e.target.closest("[data-share-app]");
  if (sh) { e.preventDefault(); shareBlogness(); return; }
  var inner = e.target.closest('a[href^="?tab="]');
  if (inner) { e.preventDefault(); go(inner.getAttribute("href").slice(5)); return; }
  if (e.target.closest("[data-retry]")) { loadAll(); return; }
  var fol = e.target.closest("[data-follow]");
  if (fol) {
    var id = fol.dataset.follow;
    Promise.resolve(setFollow(id, !isFollowing(id))).then(render).catch(function () { toast(t("act.error")); });
    return;
  }
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

onFollow(function () { if (!tab) render(); });
gate("myid", function (st) { member = st.member; render(); loadAll(); loadInterests(); loadAffinity().then(function () { syncAff(); if (!tab) render(); }).catch(function () {}); loadFollow().catch(function () {}); });