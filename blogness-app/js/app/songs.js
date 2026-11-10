// 42 (10 Nov 2026): members share a favourite song from the Musica tab; it shows up in everyone's Home feed.
// blogness.org collection "appSongShares": members read every row; each member can change or remove only their own.
import { queryItems, insertItem, removeItem } from "/js/org/items.js";
import { wixRequest } from "/js/org/client.js";
import { LANG } from "/js/app/i18n.js";

var COLLECTION = "appSongShares";
var meId = null;
function myId() {
  if (meId) return Promise.resolve(meId);
  return wixRequest("/members/v1/members/my", { method: "GET" }).then(function (r) { meId = (r && r.member && r.member.id) || ""; return meId; });
}

// Recognise the link and build the player address (only these players are ever embedded).
export function parseSong(link) {
  var u; try { u = new URL(String(link || "").trim()); } catch (e) { return null; }
  var h = u.hostname.replace(/^www\./, ""), m;
  if (h === "open.spotify.com" && (m = u.pathname.match(/\/(?:intl-[a-z]{2}\/)?(track|album|playlist|episode)\/([A-Za-z0-9]+)/)))
    return { platform: "Spotify", embed: "https://open.spotify.com/embed/" + m[1] + "/" + m[2], height: m[1] === "track" ? 152 : 352, link: u.href };
  if (h === "music.apple.com")
    return { platform: "Apple Music", embed: "https://embed.music.apple.com" + u.pathname + u.search, height: u.searchParams.get("i") ? 175 : 450, link: u.href };
  if (h === "youtu.be" && (m = u.pathname.match(/^\/([\w-]{6,})/)))
    return { platform: "YouTube", embed: "https://www.youtube-nocookie.com/embed/" + m[1], height: 200, link: u.href };
  if ((h === "youtube.com" || h === "m.youtube.com" || h === "music.youtube.com") && u.searchParams.get("v"))
    return { platform: h === "music.youtube.com" ? "YouTube Music" : "YouTube", embed: "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(u.searchParams.get("v")), height: 200, link: u.href };
  if (h === "soundcloud.com")
    return { platform: "SoundCloud", embed: "https://w.soundcloud.com/player/?url=" + encodeURIComponent(u.href) + "&visual=false&show_comments=false", height: 166, link: u.href };
  if ((h === "deezer.com" || h === "deezer.page.link") && (m = u.pathname.match(/\/(track|album|playlist)\/(\d+)/)))
    return { platform: "Deezer", embed: "https://widget.deezer.com/widget/auto/" + m[1] + "/" + m[2], height: 150, link: u.href };
  if (/^https?:$/.test(u.protocol)) return { platform: "", embed: "", height: 0, link: u.href };
  return null;
}

// Spotify gives the song title for free; other services: the member types it.
export function guessTitle(link) {
  var p = parseSong(link);
  if (!p || p.platform !== "Spotify") return Promise.resolve("");
  return fetch("https://open.spotify.com/oembed?url=" + encodeURIComponent(p.link)).then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) { return (j && j.title) || ""; }).catch(function () { return ""; });
}

export function heightFor(embed) {
  var p = /spotify\.com\/embed\/track/.test(embed) ? 152 : /spotify/.test(embed) ? 352 : /apple\.com/.test(embed) ? (/[?&]i=/.test(embed) ? 175 : 450) : /youtube/.test(embed) ? 200 : /soundcloud/.test(embed) ? 166 : /deezer/.test(embed) ? 150 : 0;
  return p;
}

export function loadSongs() {
  return queryItems(COLLECTION, { sort: [{ field: "_createdDate", direction: "desc" }], limit: 50 }).then(function (p) { return p.items || []; });
}

export function shareSong(data, member) {
  var p = parseSong(data.link);
  if (!p && !data.title) return Promise.reject(new Error("bad-link"));
  var m = member || {};
  return myId().then(function (id) {
    return insertItem(COLLECTION, {
      memberId: id, name: m.firstName || m.nickname || m.displayName || "", photo: m.photoUrl || "",
      title: String(data.title || "").slice(0, 120), artist: String(data.artist || "").slice(0, 120),
      link: p ? p.link : "", platform: p ? p.platform : "", embed: p ? p.embed : "", note: String(data.note || "").slice(0, 280), lang: LANG
    });
  });
}

export function isMine(row) { return !!row && (row.memberId === meId || row._owner === meId); }
export function readyMe() { return myId().catch(function () { return ""; }); }
export function deleteSong(row) { return removeItem(COLLECTION, row._id); }
