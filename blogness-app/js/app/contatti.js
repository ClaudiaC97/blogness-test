// Contatti (14A): real follows between blogness.org members and a chat with the Blogness team.
// Follows: Wix Members Followers v3 (js/app/follow.js). Staff chat: member-private CMS collection
// "appStaffChat" on blogness.org — each member reads only their own rows; the team answers in the
// "staffReply" field from the blogness.org dashboard (CMS).
import { t } from "/js/app/i18n.js";
import { fx } from "/js/app/social-text.js";
import { queryItems, insertItem } from "/js/org/items.js";
import { loadActions, has, toggle, onActions } from "/js/app/actions.js";
import { loadFollow, onFollow, requests, suggestions, friends, isFollowing, setFollow, person } from "/js/app/follow.js";
import { listThreads, listMessages, sendMessage } from "/js/app/pchat.js";
import { gate, esc, avatar, stateBox, toast, initialsOf } from "/js/app/common.js";

var STAFF = "appStaffChat";
var list = document.getElementById("list");
var seg = document.getElementById("seg");
var params = new URLSearchParams(location.search);
var tab = params.get("tab") || "chat";
var thread = params.get("c") === "staff" ? "staff" : (params.get("c") || "").indexOf("m:") === 0 ? params.get("c") : null;
var me = null;
var followReady = false, followError = false;
var staff = null, staffError = false, sending = false;
var search = "";
var pthreads = null, pchatOff = false, pmsgs = null, pmsgsError = false, psending = false, poll = null;
function other() { return thread && thread.indexOf("m:") === 0 ? thread.slice(2) : null; }

function pendingReq() { return requests().filter(function (p) { return !has("ignore", "fol-" + p.id); }); }
function av(p) { return avatar(initialsOf(p.name), p.name, "", p.photo); }

function followBtn(p, labelOff) {
  var on = isFollowing(p.id);
  return '<button type="button" class="btn ' + (on ? "on" : "primary") + '" data-follow="' + esc(p.id) + '" aria-pressed="' + on + '">' + esc(on ? fx("following") : (labelOff || fx("follow"))) + "</button>";
}

function sugCards(items) {
  return '<div class="cards-x">' + items.map(function (p) {
    return '<div class="pcard">' + av(p) + "<b>" + esc(p.name) + "</b>" + followBtn(p) + (pchatOff ? "" : '<button type="button" class="btn quiet" data-open="' + esc(p.id) + '">' + esc(fx("write")) + "</button>") + "</div>";
  }).join("") + "</div>";
}

function reqView() {
  var items = pendingReq();
  if (!items.length) return '<div class="pad">' + stateBox(t("cont.noReq")) + "</div>";
  return '<div class="blockhead"><h2>' + esc(t("cont.req")) + '</h2></div><p class="lead" style="padding:0 16px">' + esc(fx("reqLead")) + "</p>" +
    items.map(function (p) {
      return '<div class="dm"><span class="ring">' + av(p) + '</span><span class="body"><span class="nm">' + esc(p.name) + '</span><span class="sub">' + esc(fx("followsYou")) + '</span></span><span class="acts">' +
        followBtn(p, fx("followBack")) + (pchatOff ? "" : '<button type="button" class="btn quiet" data-open="' + esc(p.id) + '">' + esc(fx("write")) + "</button>") + '<button type="button" class="btn quiet" data-ignore="' + esc(p.id) + '">' + esc(fx("ignore")) + "</button></span></div>";
    }).join("");
}

function sugView() {
  var items = suggestions();
  if (!items.length) return '<div class="pad">' + stateBox(t("cont.noSug")) + "</div>";
  return '<div class="blockhead"><h2>' + esc(t("cont.sug")) + '</h2></div><p class="lead" style="padding:0 16px">' + esc(fx("sugLead")) + "</p>" + sugCards(items);
}

function lastStaff() {
  if (!staff || !staff.length) return fx("staffSub");
  var m = staff[staff.length - 1];
  return m.staffReply ? m.staffReply : fx("waiting");
}
function staffUnread() { return (staff || []).some(function (m) { return m.staffReply && !has("read", "staff-" + m._id); }); }

function chatView() {
  var q = search.toLowerCase();
  var fr = friends().filter(function (p) { return !q || p.name.toLowerCase().indexOf(q) >= 0; });
  var showStaff = !q || (fx("staff") + " " + lastStaff()).toLowerCase().indexOf(q) >= 0;
  var unread = staffUnread();
  var reqN = pendingReq().length;
  var sug = suggestions().slice(0, 12);
  return '<label class="searchbar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span class="sr">' + esc(t("cont.searchChats")) + '</span><input id="chatSearch" type="search" placeholder="' + esc(t("cont.searchChats")) + '" value="' + esc(search) + '"></label>' +
    (reqN && !q ? '<button type="button" class="dm" data-goto="req"><span class="ring plain"><span class="av" style="background:var(--soft);color:var(--ink)">' + reqN + '</span></span><span class="body"><span class="nm">' + esc(t("cont.req")) + '</span><span class="sub">' + esc(pendingReq().map(function (p) { return p.name; }).join(", ")) + '</span></span><span class="dot"></span></button>' : "") +
    '<div class="blockhead"><h2>' + esc(t("cont.chat")) + "</h2></div>" +
    (showStaff ? '<button type="button" class="dm' + (unread ? " unread" : "") + '" data-thread="staff"><span class="ring' + (unread ? "" : " plain") + '"><span class="av" style="background:var(--deep);color:var(--on-deep)">B</span></span><span class="body"><span class="nm">' + esc(fx("staff")) + '<span class="lvbadge">Staff</span></span><span class="sub">' + esc(lastStaff()) + "</span></span>" + (unread ? '<span class="dot"></span>' : "") + "</button>" : "") +
    (followError ? '<div class="pad">' + stateBox(fx("loadError"), true) + "</div>" : !followReady ? '<div class="pad"><div class="skeleton" style="height:120px"></div></div>' :
      threadRows(q) +
      (frFree(fr).length ? '<div class="blockhead"><h2>' + esc(fx("friends")) + "</h2></div>" + frFree(fr).map(function (p) {
        return '<button type="button" class="dm" data-open="' + esc(p.id) + '"><span class="ring plain">' + av(p) + '</span><span class="body"><span class="nm">' + esc(p.name) + '</span><span class="sub">' + esc(pchatOff ? fx("friendSub") : fx("writeSub")) + "</span></span></button>";
      }).join("") : (q || (pthreads && pthreads.length) ? "" : '<p class="muted" style="margin:8px 16px;line-height:1.5">' + esc(fx("noFriends")) + "</p>")) +
      (sug.length && !q ? '<div class="blockhead"><h2>' + esc(t("cont.sug")) + "</h2></div>" + sugCards(sug) : "")) +
    "";
}

function frFree(fr) { var has2 = {}; (pthreads || []).forEach(function (x) { has2[x.with] = 1; }); return fr.filter(function (p) { return !has2[p.id]; }); }
function threadRows(q) {
  var rows = (pthreads || []).slice().sort(function (a, b) { return String(b.at).localeCompare(String(a.at)); })
    .map(function (x) { return { x: x, p: person(x.with) }; })
    .filter(function (r) { return !q || (r.p.name + " " + r.x.last).toLowerCase().indexOf(q) >= 0; });
  return rows.map(function (r) {
    var un = r.x.unread > 0;
    return '<button type="button" class="dm' + (un ? " unread" : "") + '" data-open="' + esc(r.x.with) + '"><span class="ring' + (un ? "" : " plain") + '">' + av(r.p) + '</span><span class="body"><span class="nm">' + esc(r.p.name) + '</span><span class="sub">' + esc((r.x.mine ? "↪ " : "") + r.x.last) + "</span></span>" + (un ? '<span class="dot"></span>' : "") + "</button>";
  }).join("");
}

function bubble(text, mine, meta) {
  return '<div style="display:flex;justify-content:' + (mine ? "flex-end" : "flex-start") + ';margin:6px 16px"><div style="max-width:78%;padding:10px 14px;border-radius:18px;line-height:1.45;white-space:pre-wrap;' +
    (mine ? "background:var(--deep);color:var(--on-deep);border-bottom-right-radius:6px" : "background:var(--soft);color:var(--ink);border-bottom-left-radius:6px") + '">' + esc(text) +
    (meta ? '<div style="font-size:11px;opacity:.7;margin-top:4px">' + esc(meta) + "</div>" : "") + "</div></div>";
}

function threadView() {
  var head = '<div class="dm" style="cursor:default"><button type="button" class="icon-btn" data-back aria-label="' + esc(fx("back")) + '"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button><span class="ring plain"><span class="av" style="background:var(--deep);color:var(--on-deep)">B</span></span><span class="body"><span class="nm">' + esc(fx("staff")) + '</span><span class="sub">' + esc(fx("staffSub")) + "</span></span></div>";
  var msgs;
  if (staffError) msgs = '<div class="pad">' + stateBox(t("common.loadError"), true) + "</div>";
  else if (!staff) msgs = '<div class="pad"><div class="skeleton" style="height:120px"></div></div>';
  else if (!staff.length) msgs = '<p class="muted" style="margin:24px 16px;text-align:center;line-height:1.5">' + esc(fx("staffEmpty")) + "</p>";
  else msgs = staff.map(function (m) {
    return bubble(m.body, true, m._pending ? fx("sending") : (m.staffReply ? "" : fx("waiting"))) + (m.staffReply ? bubble(m.staffReply, false, fx("staff")) : "");
  }).join("");
  var form = '<form id="staffForm" style="position:sticky;bottom:calc(64px + env(safe-area-inset-bottom));display:flex;gap:8px;padding:10px 12px;background:var(--bg,var(--bg));border-top:1px solid var(--line)">' +
    '<label class="sr" for="staffMsg">' + esc(fx("placeholder")) + '</label><textarea id="staffMsg" rows="1" maxlength="2000" placeholder="' + esc(fx("placeholder")) + '" style="flex:1;resize:none;border:1px solid var(--t2);border-radius:20px;padding:10px 14px;font:inherit;min-height:42px"></textarea>' +
    '<button type="submit" class="btn primary"' + (sending ? " disabled" : "") + ">" + esc(fx("send")) + "</button></form>";
  return head + '<div style="padding:8px 0 16px">' + msgs + "</div>" + form;
}

function pThreadView() {
  var p = person(other());
  var head = '<div class="dm" style="cursor:default"><button type="button" class="icon-btn" data-back aria-label="' + esc(fx("back")) + '"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button><span class="ring plain">' + av(p) + '</span><span class="body"><span class="nm">' + esc(p.name) + "</span></span></div>";
  var msgs;
  if (pmsgsError) msgs = '<div class="pad">' + stateBox(pchatOff ? fx("chatOff") : t("common.loadError"), !pchatOff) + "</div>";
  else if (!pmsgs) msgs = '<div class="pad"><div class="skeleton" style="height:120px"></div></div>';
  else if (!pmsgs.length) msgs = '<p class="muted" style="margin:24px 16px;text-align:center;line-height:1.5">' + esc(fx("chatEmpty")) + "</p>";
  else msgs = pmsgs.map(function (m) { return bubble(m.body, m.mine, m._pending ? fx("sending") : ""); }).join("");
  var form = pchatOff ? "" : '<form id="pForm" style="position:sticky;bottom:calc(64px + env(safe-area-inset-bottom));display:flex;gap:8px;padding:10px 12px;background:var(--bg);border-top:1px solid var(--line)">' +
    '<label class="sr" for="pMsg">' + esc(fx("placeholder")) + '</label><textarea id="pMsg" rows="1" maxlength="2000" placeholder="' + esc(fx("placeholder")) + '" style="flex:1;resize:none;border:1px solid var(--t2);border-radius:20px;padding:10px 14px;font:inherit;min-height:42px;background:var(--surface);color:var(--ink)"></textarea>' +
    '<button type="submit" class="btn primary"' + (psending ? " disabled" : "") + ">" + esc(fx("send")) + "</button></form>";
  return head + '<div style="padding:8px 0 16px">' + msgs + "</div>" + form;
}

function render() {
  var n = pendingReq().length, badge = document.getElementById("reqN");
  badge.hidden = !n; badge.textContent = n;
  seg.hidden = !!thread;
  if (other()) {
    var pd = document.getElementById("pMsg");
    var pkeep = pd ? pd.value : "";
    var hadFocus = document.activeElement && document.activeElement.id === "pMsg";
    list.innerHTML = pThreadView();
    var pt = document.getElementById("pMsg");
    if (pt) { pt.value = pkeep; if (hadFocus) pt.focus(); }
    window.scrollTo(0, document.body.scrollHeight);
    return;
  }
  if (thread === "staff") {
    var draft = document.getElementById("staffMsg");
    var keep = draft ? draft.value : "";
    list.innerHTML = threadView();
    var ta = document.getElementById("staffMsg");
    if (ta) ta.value = keep;
    (staff || []).forEach(function (m) { if (m.staffReply && !has("read", "staff-" + m._id)) toggle("read", "staff-" + m._id, { title: fx("staff") }).catch(function () {}); });
    window.scrollTo(0, document.body.scrollHeight);
    return;
  }
  if (tab !== "chat") {
    if (followError) { list.innerHTML = '<div class="pad">' + stateBox(fx("loadError"), true) + "</div>"; return; }
    if (!followReady) { list.innerHTML = '<div class="pad"><div class="skeleton" style="height:160px"></div></div>'; return; }
    list.innerHTML = tab === "req" ? reqView() : sugView();
    return;
  }
  var focus = document.activeElement && document.activeElement.id === "chatSearch";
  list.innerHTML = chatView();
  if (focus) { var el = document.getElementById("chatSearch"); el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
}

function loadStaff() {
  staffError = false;
  return queryItems(STAFF, { sort: [{ field: "_createdDate", direction: "asc" }], limit: 100 })
    .then(function (p) { staff = p.items || []; render(); })
    .catch(function () { staffError = true; render(); });
}
function loadThreads() {
  return listThreads().then(function (x) { pthreads = x; pchatOff = false; render(); })
    .catch(function () { pthreads = []; pchatOff = true; render(); });
}
function loadMsgs() {
  var id = other();
  if (!id) return;
  listMessages(id).then(function (x) { if (other() !== id) return; pmsgs = x; pmsgsError = false; pchatOff = false; render(); })
    .catch(function (e) { if (other() !== id) return; pmsgsError = true; if (!e.status || e.status === 404) pchatOff = true; render(); });
}
function openThread(id) {
  thread = "m:" + id; pmsgs = null; pmsgsError = false; setUrl(); render(); loadMsgs();
  clearInterval(poll); poll = setInterval(function () { if (other() && !document.hidden) loadMsgs(); }, 8000);
}
function pSend(text) {
  var body = text.trim(), id = other();
  if (!body || psending || !id) return;
  psending = true;
  var temp = { id: "tmp-" + Date.now(), mine: true, body: body, _pending: true };
  pmsgs = (pmsgs || []).concat([temp]);
  render();
  var ta = document.getElementById("pMsg"); if (ta) ta.value = "";
  sendMessage(id, body)
    .then(function (m) { pmsgs = (pmsgs || []).map(function (x) { return x === temp ? (m || Object.assign({}, temp, { _pending: false })) : x; }); psending = false; render(); loadThreads(); })
    .catch(function () { pmsgs = (pmsgs || []).filter(function (x) { return x !== temp; }); psending = false; render(); var t3 = document.getElementById("pMsg"); if (t3) t3.value = body; toast(fx("error")); });
}

function loadPeople() {
  followError = false;
  loadFollow().then(function () { followReady = true; render(); }).catch(function () { followError = true; render(); });
}

function setUrl() {
  var u = new URLSearchParams();
  u.set("tab", tab);
  if (thread) u.set("c", thread);
  history.replaceState(null, "", location.pathname + "?" + u.toString());
}
function select(x) {
  tab = ["chat", "req", "sug"].indexOf(x) >= 0 ? x : "chat";
  thread = null;
  clearInterval(poll);
  seg.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.tab === tab)); });
  setUrl();
  render();
}

function send(text) {
  var body = text.trim();
  if (!body || sending) return;
  sending = true;
  var temp = { _id: "tmp-" + Date.now(), body: body, _pending: true };
  staff = (staff || []).concat([temp]);
  render();
  var ta = document.getElementById("staffMsg"); if (ta) ta.value = "";
  insertItem(STAFF, { body: body, memberName: (me && (me.nickname || me.displayName || me.firstName)) || "" })
    .then(function (row) { staff = staff.map(function (m) { return m === temp ? (row || Object.assign({}, temp, { _pending: false })) : m; }); sending = false; render(); })
    .catch(function () { staff = staff.filter(function (m) { return m !== temp; }); sending = false; render(); var t2 = document.getElementById("staffMsg"); if (t2) t2.value = body; toast(fx("error")); });
}

seg.addEventListener("click", function (e) { var b = e.target.closest("button[data-tab]"); if (b) select(b.dataset.tab); });
list.addEventListener("click", function (e) {
  if (e.target.closest("[data-retry]")) {
    if (other()) { pmsgs = null; pmsgsError = false; render(); loadMsgs(); }
    else if (thread) { staff = null; render(); loadStaff(); } else { followReady = false; render(); loadPeople(); }
    return;
  }
  if (e.target.closest("[data-back]")) { select("chat"); return; }
  var g = e.target.closest("[data-goto]");
  if (g) { select(g.dataset.goto); return; }
  if (e.target.closest("[data-thread]")) { thread = "staff"; setUrl(); render(); if (!staff) loadStaff(); return; }
  var op = e.target.closest("[data-open]");
  if (op) { if (pchatOff) toast(fx("chatOff")); else openThread(op.dataset.open); return; }
  var f = e.target.closest("[data-follow]");
  if (f) {
    var id = f.dataset.follow, on = !isFollowing(id);
    setFollow(id, on).then(function () { if (on && requests().every(function (p) { return p.id !== id; }) && friends().some(function (p) { return p.id === id; })) toast(fx("nowFriends")); })
      .catch(function () { toast(fx("error")); });
    return;
  }
  var ig = e.target.closest("[data-ignore]");
  if (ig) toggle("ignore", "fol-" + ig.dataset.ignore, { title: fx("ignored") }).catch(function () { toast(fx("error")); });
});
list.addEventListener("submit", function (e) {
  if (e.target.id === "pForm") { e.preventDefault(); pSend(document.getElementById("pMsg").value); return; }
  if (e.target.id !== "staffForm") return;
  e.preventDefault();
  send(document.getElementById("staffMsg").value);
});
list.addEventListener("keydown", function (e) {
  if (e.target.id === "pMsg" && e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); pSend(e.target.value); return; }
  if (e.target.id === "staffMsg" && e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(e.target.value); }
});
list.addEventListener("input", function (e) { if (e.target.id === "chatSearch") { search = e.target.value; render(); } });
onActions(render);
onFollow(render);

gate("contatti", function (s) {
  me = s.member || null;
  seg.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.tab === tab)); });
  render();
  loadPeople();
  loadStaff();
  loadThreads();
  if (other()) openThread(other());
  loadActions().catch(function () {});
});
