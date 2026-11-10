// 35A (10 Nov 2026): order suggestions by the member's interests.
// Interests come from blogness.org's "My interests" page (member custom field, e.g. "travel,art-design").
// Matching is by keywords in IT / EN / ES on each item's own text; items keep their original order within the same score.
import { LANG } from "/js/app/i18n.js";
import { wixRequest } from "/js/org/client.js";
import { loadTastes, isTaste, tasteKeywords, tasteLabel } from "/js/app/tastes.js";

var KEYWORDS = {
  travel: ["viagg", "travel", "trip", "itinerar", "weekend", "giorni", "days", "viaj", "passegg", "walk", "paseo", "città", "city", "ciudad", "mete", "destin"],
  "art-design": ["arte", "art", "design", "diseñ", "mostr", "exhib", "exposic", "muse", "galler", "cultur", "libr", "book", "cinema", "film", "teatr", "theat", "architett", "architect"],
  lifestyle: ["stile", "style", "estilo", "moda", "fashion", "beauty", "bellezz", "belleza", "look", "skincare"],
  music: ["music", "músic", "concert", "concier", "jazz", "live", "festival", "dj", "band"],
  digital: ["digital", "tech", "tecnolog", "app", "smart", "online"],
  trends: ["trend", "tendenz", "tendenc", "novità", "new", "novedad"],
  sport: ["sport", "deport", "corsa", "run", "partit", "match", "bici", "bike", "nuot", "swim", "yoga"],
  automotive: ["auto", "car", "motor", "moto", "road trip"],
  food: ["cena", "pranzo", "colazion", "ristor", "restaur", "food", "cibo", "comida", "chef", "caffè", "cafe", "café", "vino", "wine", "aperitiv", "brunch", "cucin", "cocina"],
  community: ["community", "comunidad", "portfolio", "incontr", "meet", "encuentr", "amici", "friends", "amigos", "gruppo", "group", "grupo"]
};
var ALIAS = { style: "lifestyle", art: "art-design", design: "art-design", "music-live": "music", "digital-life": "digital", "inspiration-trends": "trends", restaurants: "food" };
var NAMES = {
  travel: ["Viaggi", "Travel", "Viajes"], lifestyle: ["Stile personale", "Personal style", "Estilo personal"], "art-design": ["Arte e cultura", "Arts & culture", "Arte y cultura"],
  music: ["Musica e live", "Music & live", "Música y directo"], digital: ["Vita digitale", "Digital life", "Vida digital"], trends: ["Tendenze", "Trends", "Tendencias"],
  sport: ["Sport", "Sport", "Deporte"], automotive: ["Motori", "Automotive", "Motor"], food: ["Cibo e ristoranti", "Food & restaurants", "Comida y restaurantes"], community: ["Community", "Community", "Comunidad"]
};

var cache = null;
function norm(k) { k = String(k || "").trim().toLowerCase(); return ALIAS[k] || k; }

// Resolves to the member's interest keys ([] when none or unavailable). Never rejects.
export function loadInterests() {
  if (!cache) cache = wixRequest("/members/v1/members/my", { method: "GET", query: { fieldsets: "FULL" } }).then(function (r) {
    var cf = (r && r.member && r.member.contact && r.member.contact.customFields) || {};
    var key = Object.keys(cf).filter(function (k) { return k.indexOf("interests") >= 0; })[0];
    var raw = key && cf[key] ? String(cf[key].value || "") : "";
    return raw.split(",").map(norm).filter(Boolean);
  }).catch(function () { return []; }).then(function (base) {
    // 42: music, film and sport tastes refine the ranking too.
    return loadTastes().then(function (tk) { return base.concat(tk); }).catch(function () { return base; });
  });
  return cache;
}

export function interestName(k) {
  if (isTaste(k)) return tasteLabel(k);
  var row = NAMES[norm(k)];
  if (row) return row[LANG === "en" ? 1 : LANG === "es" ? 2 : 0];
  var w = String(k).replace(/[-_]+/g, " ").trim();
  return w.charAt(0).toUpperCase() + w.slice(1);
}

// Which of the member's interests a piece of text touches.
export function matches(text, interests) {
  var t = " " + String(text || "").toLowerCase() + " ";
  return (interests || []).filter(function (k) {
    return (isTaste(k) ? tasteKeywords(k) : KEYWORDS[k] || [k.replace(/-/g, " ")]).some(function (w) { return t.indexOf(w) >= 0; });
  });
}

// Stable sort: items touching more interests first. Each item gets _forYou = matched interest keys.
export function rankByInterest(items, textOf, interests) {
  if (!items || !interests || !interests.length) return items;
  return items.map(function (it, i) {
    var m = matches(textOf(it), interests);
    it._forYou = m;
    return { it: it, i: i, n: m.length };
  }).sort(function (a, b) { return b.n - a.n || a.i - b.i; }).map(function (x) { return x.it; });
}