import { t, fmtDate } from "/js/app/i18n.js";
import { queryItems } from "/js/wix/items.js";
import { imgSrc } from "/js/wix/media.js";
import { fetchEventsPage } from "/js/org/events.js";
import { loadActions, has, toggle, onActions } from "/js/app/actions.js";
import { gate, esc, stateBox, toast, BOOKMARK, SEND, TONES } from "/js/app/common.js";
import { tx } from "/js/app/more.js";

var GRADS = ["linear-gradient(160deg,var(--gold),var(--heart) 45%,var(--brand))", "linear-gradient(200deg,var(--accent),#8FC1BE 60%,var(--soft))", "linear-gradient(150deg,var(--brand),var(--deep))", "linear-gradient(170deg,var(--t2),#8FA2B2)"];
function media(url, i, inner) { return '<div class="ig-media"' + (url ? "" : ' style="background:' + GRADS[i % GRADS.length] + '"') + ">" + (url ? '<img src="' + esc(url) + '" alt="" loading="lazy">' : "") + (inner || "") + "</div>"; }

var list = document.getElementById("list");
var seg = document.getElementById("seg");
var tab = new URLSearchParams(location.search).get("tab") || "day";
var data = { day: null, events: null, trips: null };
var errors = {};

export function eventDate(e) {
  if (e.dateTbd) return e.dateTbdMessage || "";
  if (!e.startDateIso) return e.dateLabel || "";
  return fmtDate(e.startDateIso, { weekday: "short", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }, e.timeZoneId || undefined);
}

function dayView(items) {
  return '<p class="lead" style="padding:14px 16px 4px">' + esc(t("prop.dayLead")) + "</p>" + items.map(function (d) {
    var on = has("day", "day-" + d._id);
    return '<div class="dayrow"><span class="time"><span class="ring"><span class="disc">' + esc(d.time) + "</span></span></span>" +
      '<span class="body"><span class="eyebrow accent">' + esc(d.moment) + "</span><b>" + esc(d.title) + "</b>" + (d.text ? "<p>" + esc(d.text) + "</p>" : "") +
      '<button type="button" class="btn ' + (on ? "on" : "primary") + '" data-day="' + esc(d._id) + '" aria-pressed="' + on + '">' + esc(t(on ? "prop.added" : "prop.add")) + "</button></span></div>";
  }).join("");
}

function eventsView(items) {
  return items.map(function (e, i) {
    var saved = has("event", "event-" + e.slug);
    var where = e.locationType === "ONLINE" ? t("prop.online") : e.locationName;
    var href = "/event.html?slug=" + encodeURIComponent(e.slug);
    return '<article class="ig"><div class="ig-head"><span class="ring"><span class="av" style="background:var(--accent);color:var(--on-accent)">B</span></span><span class="who"><span class="name">blogness.events</span><span class="place">' + esc(where || "") + "</span></span></div>" +
      '<a href="' + href + '" style="display:block;position:relative">' + media(e.imageUrl, i, '<span class="date-pill">' + esc(eventDate(e)) + "</span>") + "</a>" +
      '<div class="ig-acts"><a class="icon-btn" href="' + href + '" aria-label="' + esc(t("prop.details")) + '"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"/></svg></a>' +
        '<button type="button" class="icon-btn" data-share-event="' + esc(e.slug) + '" aria-label="' + esc(tx("feed.share")) + '">' + SEND + '</button><span class="sp"></span>' +
        '<button type="button" class="icon-btn" data-event="' + esc(e.slug) + '" aria-pressed="' + saved + '" aria-label="' + esc(t(saved ? "common.saved" : "common.save")) + '">' + BOOKMARK(saved) + "</button></div>" +
      '<div class="ig-text"><span><b>' + esc(e.title) + "</b>" + (e.shortDescription ? " " + esc(e.shortDescription) : "") + "</span>" + (e.priceLabel ? '<span class="when">' + esc(e.priceLabel) + "</span>" : "") + "</div>" +
      '<div class="cta-row"><a class="btn primary" href="' + href + '">' + esc(t("prop.details")) + "</a></div></article>";
  }).join("");
}

function tripsView(items) {
  return items.map(function (v, i) {
    var saved = has("save", "trip-" + v._id);
    return '<article class="ig"><div class="ig-head"><span class="ring"><span class="av" style="background:var(--brand);color:var(--on-accent)">B</span></span><span class="who"><span class="name">blogness.travel</span><span class="place">' + esc(v.length || "") + "</span></span></div>" +
      media(v.image ? imgSrc(v.image, 1080, 1080) : "", i + 1, v.imageLabel ? '<span class="cap">' + esc(v.imageLabel) + "</span>" : "") +
      '<div class="ig-acts"><span class="sp"></span><button type="button" class="icon-btn" data-trip="' + esc(v._id) + '" aria-pressed="' + saved + '" aria-label="' + esc(t(saved ? "common.saved" : "common.save")) + '">' + BOOKMARK(saved) + "</button></div>" +
      '<div class="ig-text"><span><b>' + esc(v.title) + "</b>" + (v.text ? " " + esc(v.text) : "") + "</span></div>" +
      '<div class="cta-row"><a class="btn quiet" href="/contatti.html?tab=chat">' + esc(t("prop.organize")) + "</a></div></article>";
  }).join("");
}

function render() {
  if (errors[tab]) { list.innerHTML = '<div class="pad">' + stateBox(t("common.loadError"), true) + "</div>"; return; }
  var items = data[tab];
  if (!items) { list.innerHTML = '<div class="pad"><div class="skeleton"></div></div>'; return; }
  if (!items.length) { list.innerHTML = '<div class="pad">' + stateBox(t("prop.empty")) + "</div>"; return; }
  list.innerHTML = tab === "day" ? dayView(items) : tab === "events" ? eventsView(items) : tripsView(items);
}

function load(which) {
  errors[which] = null;
  var p = which === "events"
    ? fetchEventsPage({ limit: 20 }).then(function (r) { return r.events || []; })
    : queryItems(which === "day" ? "dayPlans" : "tripProposals", which === "day" ? { sort: [{ field: "order", direction: "asc" }], limit: 20 } : { limit: 20 }).then(function (r) { return r.items || []; });
  p.then(function (items) { data[which] = items; if (which === tab) render(); })
    .catch(function () { errors[which] = true; if (which === tab) render(); });
}

function select(x) {
  tab = data.hasOwnProperty(x) ? x : "day";
  seg.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.tab === tab)); });
  render();
}
function find(arr, key, val) { return (arr || []).filter(function (x) { return x[key] === val; })[0] || {}; }

seg.addEventListener("click", function (e) { var b = e.target.closest("button[data-tab]"); if (b) select(b.dataset.tab); });
list.addEventListener("click", function (e) {
  if (e.target.closest("[data-retry]")) { data[tab] = null; render(); load(tab); return; }
  var d = e.target.closest("[data-day]"), ev = e.target.closest("[data-event]"), tr = e.target.closest("[data-trip]");
  var job = null;
  if (d) { var it = find(data.day, "_id", d.dataset.day); job = toggle("day", "day-" + it._id, { title: it.title, meta: (it.time || "") + " · " + (it.moment || "") }); }
  if (ev) { var e2 = find(data.events, "slug", ev.dataset.event); job = toggle("event", "event-" + e2.slug, { title: e2.title, meta: eventDate(e2), link: "/event.html?slug=" + encodeURIComponent(e2.slug) }); }
  if (tr) { var v = find(data.trips, "_id", tr.dataset.trip); job = toggle("save", "trip-" + v._id, { title: v.title, meta: v.length }); }
  var sh = e.target.closest("[data-share-event]");
  if (sh) {
    var ev2 = find(data.events, "slug", sh.dataset.shareEvent);
    var url = location.origin + "/event.html?slug=" + encodeURIComponent(ev2.slug || "");
    if (navigator.share) navigator.share({ title: ev2.title || "Blogness", url: url }).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { toast(tx("feed.copied")); }).catch(function () {});
    return;
  }
  if (job) job.catch(function () { toast(t("act.error")); });
});
onActions(render);

document.getElementById("today").textContent = fmtDate(new Date().toISOString(), { weekday: "short", day: "numeric", month: "short" });
gate("proposte", function () {
  select(tab);
  load("day"); load("events"); load("trips");
  loadActions().catch(function () {});
});
