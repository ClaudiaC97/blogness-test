// 42: "Pianifica un viaggio" — your own trip first; then Scopri › Viaggi shows the community for the same destination.
import { fmtDate, t } from "/js/app/i18n.js";
import { loadActions, list, toggle, onActions } from "/js/app/actions.js";
import { gate, esc, toast } from "/js/app/common.js";
import { DESTINATIONS, WHO, LIKES, tt, shareTrip, loadTripShares, unshareTrip, myId } from "/js/app/trips-data.js";

var member = null, shares = [];
function set(id, s) { var el = document.getElementById(id); if (el) el.textContent = s; }
document.title = "Blogness · " + tt("title");
set("title", tt("title")); set("back", tt("back")); set("destLbl", tt("dest")); set("fromLbl", tt("from")); set("toLbl", tt("to"));
set("whoLbl", tt("who")); set("likeLbl", tt("likes")); set("noteLbl", tt("note")); set("shareLbl", tt("share")); set("shareNote", tt("shareNote"));
set("save", tt("save")); set("mineTitle", tt("mine"));
document.getElementById("destList").innerHTML = DESTINATIONS.map(function (d) { return '<option value="' + esc(d) + '"></option>'; }).join("");
document.getElementById("who").innerHTML = WHO.map(function (k, i) { return '<label><input type="radio" name="who" value="' + k + '"' + (i === 0 ? " checked" : "") + "><span>" + esc(tt(k)) + "</span></label>"; }).join("");
document.getElementById("likes").innerHTML = LIKES.map(function (k) { return '<label><input type="checkbox" name="likes" value="' + k + '"><span>' + esc(tt(k)) + "</span></label>"; }).join("");
var preset = new URLSearchParams(location.search).get("dest");
if (preset) document.getElementById("dest").value = preset;

function datesLabel(a, b) {
  var o = { day: "numeric", month: "short" };
  if (a && b) return fmtDate(a, o) + " – " + fmtDate(b, Object.assign({ year: "numeric" }, o));
  return a ? fmtDate(a, Object.assign({ year: "numeric" }, o)) : "";
}
function discoverUrl(dest) { return "/proposte.html?tab=trips&dest=" + encodeURIComponent(dest); }

document.getElementById("tripForm").addEventListener("submit", function (e) {
  e.preventDefault();
  var f = e.target.elements, err = document.getElementById("err"), btn = document.getElementById("save");
  err.textContent = "";
  var dest = f.dest.value.trim().replace(/\s+/g, " ");
  if (!dest) { err.textContent = tt("needDest"); f.dest.focus(); return; }
  if (f.from.value && f.to.value && f.to.value < f.from.value) { err.textContent = tt("badDates"); return; }
  var who = (Array.prototype.filter.call(f.who, function (x) { return x.checked; })[0] || {}).value || "solo";
  var likes = Array.prototype.filter.call(f.likes, function (x) { return x.checked; }).map(function (x) { return tt(x.value); });
  var dates = datesLabel(f.from.value, f.to.value);
  var ref = "trip-" + Date.now();
  var meta = [dates, tt(who), likes.join(", ")].filter(Boolean).join(" · ");
  btn.disabled = true;
  toggle("trip", ref, { title: dest, meta: meta, link: discoverUrl(dest) })
    .then(function () { return f.share.checked ? shareTrip({ dest: dest, dates: dates, who: tt(who), note: f.note.value.trim(), ref: ref }, member) : null; })
    .then(function () { location.assign(discoverUrl(dest)); })
    .catch(function () { btn.disabled = false; err.textContent = t("act.error"); });
});

function renderMine() {
  var box = document.getElementById("mine");
  var trips = list("trip");
  if (!trips.length) { box.innerHTML = '<div style="padding:0 16px"><div class="my-empty"><p>' + esc(tt("none")) + "</p></div></div>"; return; }
  box.innerHTML = '<div class="trip-list">' + trips.map(function (r) {
    return '<div class="trip-row"><span class="pin"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg></span>' +
      '<span class="tx"><b>' + esc(r.title) + "</b>" + (r.meta ? "<span>" + esc(r.meta) + "</span>" : "") + "</span>" +
      '<a class="btn sm primary" href="' + esc(r.link || discoverUrl(r.title)) + '">' + esc(tt("open")) + "</a>" +
      '<button type="button" class="icon-btn" data-del="' + esc(r.refId) + '" aria-label="' + esc(tt("remove") + " " + r.title) + '"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg></button></div>';
  }).join("") + "</div>";
}
document.getElementById("mine").addEventListener("click", function (e) {
  var d = e.target.closest("[data-del]");
  if (!d || !window.confirm(tt("confirm"))) return;
  var ref = d.dataset.del;
  var r = list("trip").filter(function (x) { return x.refId === ref; })[0] || {};
  var pub = shares.filter(function (s) { return s.tripRef === ref; });
  toggle("trip", ref, r).then(function () { return Promise.all(pub.map(unshareTrip)); })
    .then(function () { toast(tt("removed")); }).catch(function () { toast(t("act.error")); });
});
onActions(renderMine);

gate("proposte", function (s) {
  member = s.member;
  loadActions().then(renderMine).catch(renderMine);
  Promise.all([loadTripShares(), myId()]).then(function (r) { shares = r[0].filter(function (x) { return x.memberId === r[1]; }); }).catch(function () {});
});
