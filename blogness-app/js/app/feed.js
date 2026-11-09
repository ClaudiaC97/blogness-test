import { t, LANG, fmtDate } from "/js/app/i18n.js";
import { tx } from "/js/app/more.js";
import { queryItems } from "/js/wix/items.js";
import { imgSrc } from "/js/wix/media.js";
import { fetchPostsInLanguage } from "/js/app/org-posts.js";
import { loadActions, has, toggle, onActions } from "/js/app/actions.js";
import { gate, esc, toneFor, initialsOf, stateBox, toast, HEART, BOOKMARK, COMMENT, SEND, MUSIC, CAL, TONES } from "/js/app/common.js";

var list = document.getElementById("list");
var filters = document.getElementById("filters");
var storiesEl = document.getElementById("stories");
var current = "";
var community = null, articles = null;
var errors = { community: null, articles: null };
var member = null;
var GRADS = ["linear-gradient(160deg,var(--gold),var(--heart) 45%,var(--brand))", "linear-gradient(200deg,var(--accent),#8FC1BE 60%,var(--soft))", "linear-gradient(150deg,var(--brand),var(--deep))", "linear-gradient(170deg,var(--t2),#8FA2B2)"];

function normCommunity(items) {
  return items.map(function (p) {
    return { kind: "community", type: p.type, id: "cms-" + p._id, author: p.author, initials: p.initials, meta: p.meta,
      title: p.title || "", text: p.text || "", image: p.image ? imgSrc(p.image, 1080, 1080) : "", caption: p.imageLabel || "", dateISO: p.publishedAt || "" };
  }).filter(function (p) { return p.type !== "articles"; });
}
function normArticles(posts) {
  return posts.map(function (p) {
    return { kind: "article", type: "articles", id: "post-" + p.id, slug: p.slug, title: p.title, text: p.excerpt, image: p.coverUrl,
      minutes: p.minutesToRead, dateISO: p.dateISO, author: "blogness.magazine", initials: "B" };
  });
}

function handle(name) { return String(name || "").toLowerCase().replace(/\s+/g, ".").replace(/[^a-z0-9._àèéìòù]/g, ""); }

function renderStories() {
  var me = member || {};
  var meDisc = me.photoUrl ? '<img src="' + esc(me.photoUrl) + '" alt="">' : esc(initialsOf(me.firstName || me.displayName || ""));
  var html =
    '<a class="story" href="/myid.html"><span class="ring none"><span class="disc">' + meDisc + '<span class="plus" aria-hidden="true">+</span></span></span><span class="lbl">' + esc(tx("story.me")) + "</span></a>" +
    '<a class="story" href="/musica.html"><span class="ring"><span class="disc dark">' + MUSIC + '</span></span><span class="lbl">' + esc(tx("story.music")) + "</span></a>" +
    '<a class="story" href="/proposte.html?tab=events"><span class="ring"><span class="disc teal">' + CAL + '</span></span><span class="lbl">' + esc(tx("story.events")) + "</span></a>";
  var seen = {};
  (community || []).forEach(function (p) {
    if (!p.author || seen[p.author]) return;
    seen[p.author] = 1;
    var watched = has("read", "story-" + p.id);
    html += '<button type="button" class="story" data-story="' + esc(p.id) + '"><span class="ring' + (watched ? " seen" : "") + '"><span class="disc" style="background:' + toneFor(p.author) + '">' + esc(p.initials || initialsOf(p.author)) + '</span></span><span class="lbl">' + esc(String(p.author).split(" ")[0]) + "</span></button>";
  });
  storiesEl.innerHTML = html;
}

function card(it, i) {
  var liked = has("like", it.id), saved = has("save", it.id);
  var isArt = it.kind === "article";
  var place = isArt ? t("feed.badge.articles") + (it.minutes ? " · " + t("feed.minRead", { n: it.minutes }) : "") : (it.meta || t(it.type === "community" ? "feed.badge.community" : "feed.badge.friends"));
  var bg = it.image ? "" : ' style="background:' + GRADS[i % GRADS.length] + '"';
  var mediaInner = (it.image ? '<img src="' + esc(it.image) + '" alt="" loading="lazy">' : "") +
    (isArt && it.title ? '<span class="over">' + esc(it.title) + "</span>" : "") +
    (!it.image && it.caption ? '<span class="cap">' + esc(it.caption) + "</span>" : "") +
    '<span class="pop" aria-hidden="true"><svg width="96" height="96" viewBox="0 0 24 24" style="fill:var(--on-accent)"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg></span>';
  var media = '<div class="ig-media" data-media="' + esc(it.id) + '" role="button" tabindex="0" aria-label="' + esc(isArt ? tx("feed.readMore") + ": " + it.title : t("feed.like")) + '"' + bg + ">" + mediaInner + "</div>";
  var caption = isArt ? (it.text || "") : [it.title, it.text].filter(Boolean).join(" · ");
  return '<article class="ig">' +
    '<div class="ig-head"><span class="ring"><span class="av" style="background:' + (isArt ? "var(--deep);color:var(--on-accent)" : toneFor(it.author)) + '">' + esc(it.initials || initialsOf(it.author)) + "</span></span>" +
      '<span class="who"><span class="name">' + esc(isArt ? it.author : handle(it.author)) + (isArt ? '<span class="badge-art">' + esc(t("feed.badge.articles")) + "</span>" : "") + '</span><span class="place">' + esc(place) + "</span></span></div>" +
    media +
    '<div class="ig-acts">' +
      '<button type="button" class="icon-btn heart" data-act="like" data-id="' + esc(it.id) + '" aria-pressed="' + liked + '" aria-label="' + esc(t(liked ? "feed.liked" : "feed.like")) + '">' + HEART(liked) + "</button>" +
      '<button type="button" class="icon-btn" data-comment="' + esc(it.id) + '" aria-label="' + esc(t("feed.comment")) + '">' + COMMENT + "</button>" +
      '<button type="button" class="icon-btn" data-share="' + esc(it.id) + '" aria-label="' + esc(tx("feed.share")) + '">' + SEND + "</button>" +
      '<span class="sp"></span>' +
      '<button type="button" class="icon-btn" data-act="save" data-id="' + esc(it.id) + '" aria-pressed="' + saved + '" aria-label="' + esc(t(saved ? "common.saved" : "common.save")) + '">' + BOOKMARK(saved) + "</button>" +
    "</div>" +
    '<div class="ig-text">' +
      (liked ? "<b>" + esc(tx("feed.likedByYou")) + "</b>" : "") +
      (caption ? "<span><b>" + esc(isArt ? it.author : handle(it.author)) + "</b> " + esc(caption) + "</span>" : "") +
      (isArt ? '<a class="more" href="/post.html?slug=' + encodeURIComponent(it.slug) + '">' + esc(tx("feed.readMore")) + "</a>" : "") +
      '<span class="when">' + esc(fmtDate(it.dateISO, { day: "numeric", month: "long" })) + "</span>" +
    "</div></article>";
}

function render() {
  renderStories();
  var wantA = current === "" || current === "articles";
  var wantC = current !== "articles";
  if ((wantA && articles === null && !errors.articles) || (wantC && community === null && !errors.community)) {
    list.innerHTML = '<div class="pad"><div class="skeleton" style="aspect-ratio:1/1;height:auto"></div></div>'; return;
  }
  var items = [];
  if (wantA && articles) items = items.concat(articles);
  if (wantC && community) items = items.concat(community.filter(function (p) { return !current || p.type === current; }));
  items.sort(function (a, b) { return String(b.dateISO).localeCompare(String(a.dateISO)); });
  var errs = (wantA && errors.articles) || (wantC && errors.community);
  if (!items.length) { list.innerHTML = '<div class="pad">' + (errs ? stateBox(t("common.loadError"), true) : stateBox(t("feed.empty"))) + "</div>"; return; }
  list.innerHTML = items.map(card).join("");
}

function load() {
  errors = { community: null, articles: null };
  fetchPostsInLanguage(LANG, 20).then(function (p) { articles = normArticles(p); render(); })
    .catch(function () { articles = []; errors.articles = true; render(); });
  queryItems("feedPosts", { sort: [{ field: "publishedAt", direction: "desc" }], limit: 20 })
    .then(function (p) { community = normCommunity(p.items || []); render(); })
    .catch(function () { community = []; errors.community = true; render(); });
}

function findItem(id) { return [].concat(articles || [], community || []).filter(function (x) { return x.id === id; })[0]; }
function infoOf(it) { return { title: it.title || it.text || "", meta: it.kind === "article" ? t("feed.badge.articles") : (it.author || ""), link: it.slug ? "/post.html?slug=" + encodeURIComponent(it.slug) : "" }; }

function likeOnce(id, el) {
  var it = findItem(id);
  if (!it) return;
  var pop = el && el.querySelector(".pop");
  if (pop) { pop.classList.remove("go"); void pop.offsetWidth; pop.classList.add("go"); }
  if (!has("like", id)) toggle("like", id, infoOf(it)).catch(function () { toast(t("act.error")); });
}

var lastTap = { id: null, at: 0 };
list.addEventListener("click", function (e) {
  if (e.target.closest("[data-retry]")) { articles = null; community = null; render(); load(); return; }
  var m = e.target.closest("[data-media]");
  if (m) {
    var it0 = findItem(m.dataset.media);
    var now = Date.now();
    if (lastTap.id === m.dataset.media && now - lastTap.at < 350) { lastTap = { id: null, at: 0 }; clearTimeout(m._open); likeOnce(m.dataset.media, m); return; }
    lastTap = { id: m.dataset.media, at: now };
    if (it0 && it0.kind === "article") { clearTimeout(m._open); m._open = setTimeout(function () { location.assign("/post.html?slug=" + encodeURIComponent(it0.slug)); }, 360); }
    return;
  }
  var c = e.target.closest("[data-comment]");
  if (c) {
    var itc = findItem(c.dataset.comment);
    if (itc && itc.kind === "article") location.assign("/post.html?slug=" + encodeURIComponent(itc.slug)); else toast(tx("feed.commentsSoon"));
    return;
  }
  var s = e.target.closest("[data-share]");
  if (s) {
    var its = findItem(s.dataset.share) || {};
    var url = its.slug ? "https://www.blogness.org/post/" + its.slug : location.origin + "/feed.html";
    if (navigator.share) navigator.share({ title: its.title || "Blogness", url: url }).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { toast(tx("feed.copied")); }).catch(function () {});
    return;
  }
  var b = e.target.closest("[data-act]");
  if (!b) return;
  var it = findItem(b.dataset.id) || {};
  toggle(b.dataset.act, b.dataset.id, infoOf(it)).catch(function () { toast(t("act.error")); });
});
list.addEventListener("keydown", function (e) {
  var m = e.target.closest && e.target.closest("[data-media]");
  if (m && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); var it = findItem(m.dataset.media); if (it && it.kind === "article") location.assign("/post.html?slug=" + encodeURIComponent(it.slug)); else likeOnce(m.dataset.media, m); }
});
storiesEl.addEventListener("click", function (e) {
  var s = e.target.closest("[data-story]");
  if (!s) return;
  var art = list.querySelector('[data-media="' + s.dataset.story + '"]');
  if (art) art.closest(".ig").scrollIntoView({ behavior: "smooth", block: "start" });
  var it = findItem(s.dataset.story);
  if (it && !has("read", "story-" + it.id)) toggle("read", "story-" + it.id, { title: it.author }).catch(function () {});
});
filters.addEventListener("click", function (e) {
  var b = e.target.closest("button[data-type]");
  if (!b) return;
  current = b.dataset.type;
  filters.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
  render();
});
onActions(render);

gate("feed", function (s) {
  member = s.member;
  load();
  loadActions().catch(function () {});
});
