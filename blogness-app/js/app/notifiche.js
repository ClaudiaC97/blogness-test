import { t } from "/js/app/i18n.js";
import { queryItems } from "/js/wix/items.js";
import { loadActions, has, ensure, onActions } from "/js/app/actions.js";
import { gate, esc, avatar, stateBox, toast } from "/js/app/common.js";

var list = document.getElementById("list");
var items = null, error = false;

function isUnread(n) { return n.unread && !has("read", "notif-" + n._id) && !has("read", "notif-all"); }

function render() {
  if (error) { list.innerHTML = '<div class="pad">' + stateBox(t("common.loadError"), true) + "</div>"; return; }
  if (!items) { list.innerHTML = '<div class="pad"><div class="skeleton" style="height:160px"></div></div>'; return; }
  if (!items.length) { list.innerHTML = '<div class="pad">' + stateBox(t("notif.empty")) + "</div>"; return; }
  var groups = [], by = {};
  items.forEach(function (n) { var g = n.group || "—"; if (!by[g]) { by[g] = []; groups.push(g); } by[g].push(n); });
  list.innerHTML = groups.map(function (g) {
    return '<section><div class="act-group">' + esc(g) + "</div>" + by[g].map(function (n) {
      var unread = isUnread(n);
      var done = has("read", "notif-" + n._id);
      return '<div class="act' + (unread ? " unread" : "") + '">' + avatar(n.initials, n.who) +
        '<span class="txt"><b>' + esc(n.who) + "</b> " + esc(n.text) + ' <span class="t">' + esc(n.timeLabel) + "</span></span>" +
        (n.action ? '<button type="button" class="btn ' + (done ? "on" : "primary") + '" data-notif="' + esc(n._id) + '">' + esc(done ? "✓" : n.action) + "</button>" : (unread ? '<span class="count" style="min-width:8px;width:8px;height:8px;padding:0" aria-label="' + esc(t("notif.unread")) + '"></span>' : "")) +
        "</div>";
    }).join("") + "</section>";
  }).join("");
}

function load() {
  error = false;
  queryItems("notifications", { sort: [{ field: "order", direction: "asc" }], limit: 50 })
    .then(function (p) { items = p.items || []; render(); })
    .catch(function () { error = true; render(); });
}

document.getElementById("readAll").addEventListener("click", function () { ensure("read", "notif-all", { title: "all" }).catch(function () { toast(t("act.error")); }); });
list.addEventListener("click", function (e) {
  if (e.target.closest("[data-retry]")) { items = null; render(); load(); return; }
  var b = e.target.closest("[data-notif]");
  if (b && !has("read", "notif-" + b.dataset.notif)) ensure("read", "notif-" + b.dataset.notif, { title: "notif" }).catch(function () { toast(t("act.error")); });
});
onActions(render);

gate("notifiche", function () { render(); load(); loadActions().catch(function () {}); });
