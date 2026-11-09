import { t } from "/js/app/i18n.js";
import { queryItems } from "/js/wix/items.js";
import { imgSrc } from "/js/wix/media.js";
import { loadActions, has, toggle, onActions } from "/js/app/actions.js";
import { gate, esc, avatar, stateBox, mediaBox, toast, TONES } from "/js/app/common.js";

var list = document.getElementById("list");
var seg = document.getElementById("seg");
var tab = "mine";
var data = { mine: null, friends: null };
var errors = {};
var SOURCES = {
  mine: { id: "wishlistItems", query: { sort: [{ field: "order", direction: "asc" }], limit: 50 } },
  friends: { id: "friendWishes", query: { sort: [{ field: "order", direction: "asc" }], limit: 100 } }
};

function mineView(items) {
  return '<p class="lead">' + esc(t("wish.lead")) + '</p><div class="grid2">' + items.map(function (w, i) {
    return '<article class="post" style="gap:10px"><div style="position:relative">' + mediaBox(w.image ? imgSrc(w.image, 500, 500) : "", "", "sq", TONES[i % TONES.length]) +
      (w.reserved ? '<span class="date-tag" style="position:absolute;left:10px;top:10px;font-size:11px;font-weight:600;background:rgba(255,255,255,.92);padding:5px 9px;border-radius:999px;color:var(--accent)">' + esc(t("wish.reserved")) + "</span>" : "") + "</div>" +
      '<span class="stack" style="gap:4px">' + (w.category ? '<span class="eyebrow">' + esc(w.category) + "</span>" : "") +
      '<span style="font-size:14.5px;font-weight:600;line-height:1.3">' + esc(w.title) + "</span>" +
      (w.priceLabel ? '<span class="muted">' + esc(w.priceLabel) + "</span>" : "") + "</span></article>";
  }).join("") + "</div>";
}

function friendsView(rows) {
  var groups = [], by = {};
  rows.forEach(function (r) { if (!by[r.friendName]) { by[r.friendName] = { head: r, items: [] }; groups.push(by[r.friendName]); } by[r.friendName].items.push(r); });
  return groups.map(function (g) {
    var h = g.head;
    return '<section class="stack" style="gap:12px"><div class="byline">' + avatar(h.initials, h.friendName) +
      '<span class="who"><span class="name">' + esc(h.friendName) + '</span><span class="muted">' + esc(h.note) + "</span></span>" +
      (h.birthday ? '<span class="chip" style="margin-left:auto;color:var(--accent)">' + esc(t("wish.birthday")) + "</span>" : "") + '</div><div class="list">' +
      g.items.map(function (it, i) {
        var on = has("gift", "wish-" + it._id);
        return '<div class="item" style="cursor:default"><span class="thumb" style="background:' + TONES[(i + 1) % TONES.length] + '"></span>' +
          '<span class="body"><span style="font-size:14.5px;font-weight:600">' + esc(it.itemTitle) + '</span><span class="muted">' + esc(it.priceLabel) + "</span></span>" +
          '<button type="button" class="btn sm ' + (on ? "on" : "primary") + '" data-gift="' + esc(it._id) + '" aria-pressed="' + on + '">' + esc(t(on ? "wish.gifted" : "wish.gift")) + "</button></div>";
      }).join("") + "</div></section>";
  }).join("");
}

function render() {
  if (errors[tab]) { list.innerHTML = stateBox(t("common.loadError"), true); return; }
  var items = data[tab];
  if (!items) { list.innerHTML = '<div class="skeleton"></div>'; return; }
  if (!items.length) { list.innerHTML = stateBox(t(tab === "mine" ? "wish.emptyMine" : "wish.emptyFriends")); return; }
  list.innerHTML = tab === "mine" ? mineView(items) : friendsView(items);
}
function load(x) {
  errors[x] = null;
  queryItems(SOURCES[x].id, SOURCES[x].query).then(function (p) { data[x] = p.items || []; if (x === tab) render(); })
    .catch(function () { errors[x] = true; if (x === tab) render(); });
}

seg.addEventListener("click", function (e) {
  var b = e.target.closest("button[data-tab]");
  if (!b) return;
  tab = b.dataset.tab;
  seg.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
  render();
});
list.addEventListener("click", function (e) {
  if (e.target.closest("[data-retry]")) { data[tab] = null; render(); load(tab); return; }
  var g = e.target.closest("[data-gift]");
  if (!g) return;
  var it = (data.friends || []).filter(function (x) { return x._id === g.dataset.gift; })[0] || {};
  toggle("gift", "wish-" + it._id, { title: it.itemTitle, meta: it.friendName }).catch(function () { toast(t("act.error")); });
});
onActions(render);

gate("wishlist", function () { render(); load("mine"); load("friends"); loadActions().catch(function () {}); });
