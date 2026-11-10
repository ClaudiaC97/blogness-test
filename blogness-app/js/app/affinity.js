// 36A (10 Nov 2026): opt-in "people like you".
// blogness.org collection "AffinityProfiles": a row exists ONLY for members who chose to show their
// interests (members can read rows; each member can change or remove only their own).
// Reciprocal: you see like-minded people only while you share your own interests too.
import { queryItems, insertItem, updateItem, removeItem } from "/js/org/items.js";
import { wixRequest } from "/js/org/client.js";

var COLLECTION = "AffinityProfiles";
var rows = null, meId = null, loading = null;

function myId() {
  if (meId) return Promise.resolve(meId);
  return wixRequest("/members/v1/members/my", { method: "GET" }).then(function (r) { meId = (r && r.member && r.member.id) || ""; return meId; });
}

export function loadAffinity() {
  if (loading) return loading;
  loading = Promise.all([myId(), queryItems(COLLECTION, { limit: 100 })]).then(function (r) {
    rows = (r[1] && r[1].items) || [];
    loading = null;
    return rows;
  }).catch(function (e) { loading = null; rows = rows || []; throw e; });
  return loading;
}

export function myAffinity() {
  return (rows || []).filter(function (r) { return r.memberId === meId || r._owner === meId; })[0] || null;
}

// on=true saves (or refreshes) your row with your interests; on=false removes it.
export function setAffinity(on, info) {
  return myId().then(function (id) {
    var mine = myAffinity();
    if (!on) {
      if (!mine) return null;
      return removeItem(COLLECTION, mine._id).then(function () { rows = rows.filter(function (r) { return r !== mine; }); return null; });
    }
    var data = { memberId: id, name: info.name || "", photo: info.photo || "", interests: (info.interests || []).join(",") };
    if (mine) {
      var upd = Object.assign({}, mine, data);
      return updateItem(COLLECTION, upd).then(function (saved) { Object.assign(mine, data); return saved; });
    }
    data.consentDate = { $date: new Date().toISOString() };
    return insertItem(COLLECTION, data).then(function (saved) { rows.push(saved && saved._id ? saved : Object.assign({ _owner: id }, data)); return saved; });
  });
}

// Other sharing members with at least one interest in common, most in common first.
export function affinityPeople(myInterests) {
  var mine = (myInterests || []);
  return (rows || []).filter(function (r) { return r.memberId !== meId && r._owner !== meId; }).map(function (r) {
    var theirs = String(r.interests || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean);
    var common = theirs.filter(function (k) { return mine.indexOf(k) >= 0; });
    return { id: r.memberId, name: r.name || "", photo: r.photo || "", common: common };
  }).filter(function (p) { return p.common.length; }).sort(function (a, b) { return b.common.length - a.common.length; });
}