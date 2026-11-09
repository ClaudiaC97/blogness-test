// Real follows between blogness.org members (Wix Members Followers v3) and the public member list.
// Runs as the logged-in blogness.org member through the /js/org layer.
// docs: https://dev.wix.com/docs/api-reference/crm/members-contacts/members/activity/members-followers
import { wixRequest } from "/js/org/client.js";

var state = null;      // { me, members, following:Set, followers:Set }
var loading = null;
var listeners = [];
function emit() { listeners.forEach(function (fn) { try { fn(); } catch (e) { console.error(e); } }); }
export function onFollow(fn) { listeners.push(fn); }

function ids(res) { return (res && res.memberIds) || []; }

function toPerson(m) {
  var p = m.profile || {};
  var name = p.nickname || [p.firstName, p.lastName].filter(Boolean).join(" ") || (m.contact && [m.contact.firstName, m.contact.lastName].filter(Boolean).join(" ")) || "";
  return { id: m.id, name: name || "Membro Blogness", photo: (p.photo && p.photo.url) || "", slug: p.slug || "" };
}

export function loadFollow() {
  if (state) return Promise.resolve(state);
  if (loading) return loading;
  loading = Promise.all([
    wixRequest("/members/v1/members/my", { method: "GET" }),
    wixRequest("/members/v1/members", { method: "GET", query: { fieldsets: "PUBLIC", "paging.limit": 100 } }),
    wixRequest("/members/v3/followers/my/following", { method: "GET", query: { "paging.limit": 100 } }).catch(function () { return null; }),
    wixRequest("/members/v3/followers/my", { method: "GET", query: { "paging.limit": 100 } }).catch(function () { return null; })
  ]).then(function (r) {
    var me = r[0] && r[0].member ? r[0].member.id : null;
    state = {
      me: me,
      members: ((r[1] && r[1].members) || []).map(toPerson).filter(function (p) { return p.id && p.id !== me; }),
      following: new Set(ids(r[2])),
      followers: new Set(ids(r[3]))
    };
    loading = null;
    emit();
    return state;
  }).catch(function (e) { loading = null; throw e; });
  return loading;
}

export function person(id) { return ((state && state.members) || []).filter(function (p) { return p.id === id; })[0] || { id: id, name: "Membro Blogness", photo: "" }; }
export function isFollowing(id) { return !!(state && state.following.has(id)); }
export function followsMe(id) { return !!(state && state.followers.has(id)); }
export function counts() { return state ? { followers: state.followers.size, following: state.following.size } : null; }

// People who follow me and I don't follow back yet.
export function requests() { return state ? Array.from(state.followers).filter(function (id) { return !state.following.has(id); }).map(person) : []; }
// Mutual follows = friends you can chat with.
export function friends() { return state ? Array.from(state.following).filter(function (id) { return state.followers.has(id); }).map(person) : []; }
// Suggestions: members I don't follow yet.
export function suggestions() { return state ? state.members.filter(function (p) { return !state.following.has(p.id); }) : []; }

export function setFollow(id, on) {
  if (!state) return Promise.reject(new Error("not-loaded"));
  var was = state.following.has(id);
  if (on) state.following.add(id); else state.following.delete(id);
  emit();
  return wixRequest("/members/v3/followers/" + encodeURIComponent(id), { method: on ? "POST" : "DELETE", body: on ? {} : undefined })
    .catch(function (e) { if (was) state.following.add(id); else state.following.delete(id); emit(); throw e; });
}
