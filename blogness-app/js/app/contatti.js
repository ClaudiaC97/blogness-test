import { t } from "/js/app/i18n.js";
import { queryItems } from "/js/wix/items.js";
import { loadActions, has, toggle, answer, onActions } from "/js/app/actions.js";
import { gate, esc, avatar, stateBox, toast } from "/js/app/common.js";

var list = document.getElementById("list");
var seg = document.getElementById("seg");
var tab = new URLSearchParams(location.search).get("tab") || "chat";
var data = { req: null, sug: null, chat: null };
var errors = {};
var search = "";
var SOURCES = {
  req: { id: "friendRequests", query: { limit: 50 } },
  sug: { id: "friendSuggestions", query: { limit: 50 } },
  chat: { id: "chats", query: { sort: [{ field: "order", direction: "asc" }], limit: 50 } }
};

function pending() { return (data.req || []).filter(function (r) { return !has("accept", "req-" + r._id) && !has("decline", "req-" + r._id); }); }
function tags(r) { return [r.mutual].concat(r.tags || []).filter(Boolean).join(" · "); }

function reqView(items) {
  return '<div class="blockhead"><h2>' + esc(t("cont.req")) + "</h2><span>" + esc(pending().length === 1 ? t("cont.newOne") : t("cont.newMany", { n: pending().length })) + "</span></div>" +
    items.map(function (r) {
      var id = "req-" + r._id, acc = has("accept", id), dec = has("decline", id);
      return '<div class="dm"><span class="ring' + (acc || dec ? " plain" : "") + '">' + avatar(r.initials, r.name) + '</span><span class="body"><span class="nm">' + esc(r.name) + '</span><span class="sub">' + esc(acc ? t("cont.accepted") : dec ? t("cont.declined") : tags(r)) + "</span></span>" +
        (acc || dec ? "" : '<span class="acts"><button type="button" class="btn primary" data-answer="accept" data-id="' + esc(r._id) + '">' + esc(t("cont.accept")) + '</button><button type="button" class="btn quiet" data-answer="decline" data-id="' + esc(r._id) + '">' + esc(t("cont.decline")) + "</button></span>") + "</div>";
    }).join("");
}

function sugCards(items) {
  return '<div class="cards-x">' + items.map(function (s) {
    var on = has("befriend", "sug-" + s._id);
    return '<div class="pcard">' + avatar(s.initials, s.name) + "<b>" + esc(s.name) + '</b><span class="muted">' + esc((s.tags || []).join(" · ")) + "</span>" +
      '<button type="button" class="btn ' + (on ? "on" : "primary") + '" data-sug="' + esc(s._id) + '" aria-pressed="' + on + '">' + esc(t(on ? "cont.sent" : "cont.add")) + "</button></div>";
  }).join("") + "</div>";
}

function sugView(items) {
  return '<div class="blockhead"><h2>' + esc(t("cont.sug")) + "</h2></div><p class=\"lead\" style=\"padding:0 16px\">" + esc(t("cont.sugLead")) + "</p>" + sugCards(items);
}

function chatView(items) {
  var q = search.toLowerCase();
  var shown = q ? items.filter(function (c) { return (c.name + " " + c.lastMessage).toLowerCase().indexOf(q) >= 0; }) : items;
  var sug = (data.sug || []).filter(function (s) { return !has("befriend", "sug-" + s._id); });
  return '<label class="searchbar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span class="sr">' + esc(t("cont.searchChats")) + '</span><input id="chatSearch" type="search" placeholder="' + esc(t("cont.searchChats")) + '" value="' + esc(search) + '"></label>' +
    (pending().length ? '<button type="button" class="dm" data-goto="req"><span class="ring plain"><span class="av" style="background:#EEF2F5;color:#26323D">' + pending().length + '</span></span><span class="body"><span class="nm">' + esc(t("cont.req")) + '</span><span class="sub">' + esc(pending().map(function (r) { return r.name; }).join(", ")) + '</span></span><span class="dot"></span></button>' : "") +
    '<div class="blockhead"><h2>' + esc(t("cont.chat")) + "</h2></div>" +
    (shown.length ? shown.map(function (c) {
      var unread = (c.unreadCount || 0) > 0;
      return '<button type="button" class="dm' + (unread ? " unread" : "") + '" data-chat="' + esc(c._id) + '"><span class="ring' + (unread ? "" : " plain") + '">' + avatar(c.initials, c.name) + '</span><span class="body"><span class="nm">' + esc(c.name) + '</span><span class="sub">' + esc(c.lastMessage) + " · " + esc(c.timeLabel) + "</span></span>" + (unread ? '<span class="dot" aria-label="' + esc(t("notif.unread")) + '"></span>' : "") + "</button>";
    }).join("") : '<div class="pad">' + stateBox(t(q ? "cont.noChatFound" : "cont.noChat")) + "</div>") +
    (sug.length && !q ? '<div class="blockhead"><h2>' + esc(t("cont.sug")) + "</h2></div>" + sugCards(sug) : "") +
    '<p class="muted" style="text-align:center;margin:8px 16px 0;line-height:1.5">' + esc(t("cont.levels")) + "</p>";
}

function render() {
  var n = pending().length, badge = document.getElementById("reqN");
  badge.hidden = !n; badge.textContent = n;
  if (errors[tab]) { list.innerHTML = '<div class="pad">' + stateBox(t("common.loadError"), true) + "</div>"; return; }
  var items = data[tab];
  if (!items) { list.innerHTML = '<div class="pad"><div class="skeleton" style="height:160px"></div></div>'; return; }
  if (!items.length && tab !== "chat") { list.innerHTML = '<div class="pad">' + stateBox(t(tab === "req" ? "cont.noReq" : "cont.noSug")) + "</div>"; return; }
  var focus = document.activeElement && document.activeElement.id === "chatSearch";
  list.innerHTML = tab === "req" ? reqView(items) : tab === "sug" ? sugView(items) : chatView(items);
  if (focus) { var el = document.getElementById("chatSearch"); el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
}

function load(x) {
  errors[x] = null;
  queryItems(SOURCES[x].id, SOURCES[x].query).then(function (p) { data[x] = p.items || []; render(); })
    .catch(function () { errors[x] = true; render(); });
}
function select(x) {
  tab = SOURCES[x] ? x : "chat";
  seg.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.tab === tab)); });
  render();
}
function byId(arr, id) { return (arr || []).filter(function (x) { return x._id === id; })[0] || {}; }

seg.addEventListener("click", function (e) { var b = e.target.closest("button[data-tab]"); if (b) select(b.dataset.tab); });
list.addEventListener("click", function (e) {
  if (e.target.closest("[data-retry]")) { data[tab] = null; render(); load(tab); return; }
  var g = e.target.closest("[data-goto]");
  if (g) { select(g.dataset.goto); return; }
  if (e.target.closest("[data-chat]")) { toast(t("cont.levels")); return; }
  var a = e.target.closest("[data-answer]"), s = e.target.closest("[data-sug]");
  var job = null;
  if (a) { var r = byId(data.req, a.dataset.id); job = answer(["accept", "decline"], a.dataset.answer, "req-" + r._id, { title: r.name, meta: r.mutual }); }
  if (s) { var sg = byId(data.sug, s.dataset.sug); job = toggle("befriend", "sug-" + sg._id, { title: sg.name }); }
  if (job) job.catch(function () { toast(t("act.error")); });
});
list.addEventListener("input", function (e) { if (e.target.id === "chatSearch") { search = e.target.value; render(); } });
onActions(render);

gate("contatti", function () { select(tab); load("req"); load("sug"); load("chat"); loadActions().catch(function () {}); });
