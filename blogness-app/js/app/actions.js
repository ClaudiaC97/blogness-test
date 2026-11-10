// The member's own actions (likes, saves, "add to my day", event sign-ups, answers), kept on
// blogness.org in the member-private collection "appMemberActions": only the member who wrote a
// row can read, change or remove it. Runs as the logged-in blogness.org member (the /js/org layer).
import { queryItems, insertItem, removeItem } from "/js/org/items.js";

var COLLECTION = "appMemberActions";
var rows = null;          // key "kind:refId" -> row
var loading = null;
var listeners = [];

function key(kind, refId) { return kind + ":" + refId; }
function emit() { listeners.forEach(function (fn) { try { fn(); } catch (e) { console.error(e); } }); }

export function onActions(fn) { listeners.push(fn); }

export function loadActions() {
  if (rows) return Promise.resolve(rows);
  if (loading) return loading;
  loading = queryItems(COLLECTION, { limit: 100 }).then(function (page) {
    rows = {};
    (page.items || []).forEach(function (r) { rows[key(r.kind, r.refId)] = r; });
    loading = null;
    emit();
    return rows;
  }).catch(function (e) { loading = null; rows = {}; emit(); throw e; });
  return loading;
}

export function has(kind, refId) { return !!(rows && rows[key(kind, refId)]); }

export function list(kinds) {
  var ks = [].concat(kinds);
  return Object.keys(rows || {}).map(function (k) { return rows[k]; })
    .filter(function (r) { return ks.indexOf(r.kind) >= 0; })
    .sort(function (a, b) { return String(b._createdDate || "").localeCompare(String(a._createdDate || "")); });
}

// Turn an action on or off. info: { title, meta, link } kept with the row so MyID can list it.
export function toggle(kind, refId, info) {
  if (!rows) rows = {};
  var k = key(kind, refId);
  var existing = rows[k];
  if (existing) {
    delete rows[k];
    emit();
    if (!existing._id) return Promise.resolve(false);
    return removeItem(COLLECTION, existing._id).then(function () { return false; })
      .catch(function (e) { rows[k] = existing; emit(); throw e; });
  }
  var data = { kind: kind, refId: String(refId), title: (info && info.title) || "", meta: (info && info.meta) || "", link: (info && info.link) || "" };
  rows[k] = data;
  emit();
  return insertItem(COLLECTION, data).then(function (saved) { rows[k] = saved || data; emit(); return true; })
    .catch(function (e) { delete rows[k]; emit(); throw e; });
}

// Record an action once (no toggle): used after an event sign-up.
export function ensure(kind, refId, info) {
  return has(kind, refId) ? Promise.resolve(true) : toggle(kind, refId, info);
}

// Set a one-of answer (e.g. accept / decline) replacing any previous answer for the same item.
export function answer(kinds, chosen, refId, info) {
  var others = kinds.filter(function (x) { return x !== chosen && has(x, refId); });
  return Promise.all(others.map(function (x) { return toggle(x, refId); })).then(function () {
    return has(chosen, refId) ? true : toggle(chosen, refId, info);
  });
}