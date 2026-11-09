import { t, fmtDate } from "/js/app/i18n.js";
import { fetchPostBySlug } from "/js/org/posts.js";
import { loadActions, has, toggle, onActions } from "/js/app/actions.js";
import { gate, esc, stateBox, toast, HEART, BOOKMARK } from "/js/app/common.js";

var root = document.getElementById("root");
var slug = new URLSearchParams(location.search).get("slug") || "";
var post = null;

function render() {
  if (!post) return;
  var id = "post-" + post.id;
  var liked = has("like", id), saved = has("save", id);
  var meta = [post.authorName || t("feed.blog"), fmtDate(post.dateISO, { day: "numeric", month: "long", year: "numeric" }), post.minutesToRead ? t("feed.minRead", { n: post.minutesToRead }) : ""].filter(Boolean).join(" · ");
  root.innerHTML =
    (post.coverUrl ? '<img class="hero-img" src="' + esc(post.coverUrl) + '" alt="' + esc(post.coverAlt || "") + '">' : "") +
    '<main style="gap:18px;padding-top:22px">' +
      '<div class="stack" style="gap:10px"><span class="eyebrow accent">' + esc(t("feed.badge.articles")) + "</span>" +
      '<h1 class="display" style="font-size:30px;line-height:1.2;font-weight:400">' + esc(post.title) + "</h1>" +
      '<span class="muted">' + esc(meta) + "</span></div>" +
      '<div class="row" style="border-top:1px solid var(--soft);border-bottom:1px solid var(--soft)">' +
        '<button type="button" class="btn sm quiet" data-act="like" aria-pressed="' + liked + '">' + HEART(liked) + esc(t(liked ? "feed.liked" : "feed.like")) + "</button>" +
        '<button type="button" class="btn sm quiet" data-act="save" aria-pressed="' + saved + '">' + BOOKMARK(saved) + esc(t(saved ? "common.saved" : "common.save")) + "</button>" +
      "</div>" +
      '<div class="prose" id="body"></div>' +
    "</main>";
  var body = root.querySelector("#body");
  if (post.bodyHtml) body.innerHTML = post.bodyHtml;
  else (post.paragraphs || []).forEach(function (txt) { var p = document.createElement("p"); p.textContent = txt; body.appendChild(p); });
}

root.addEventListener("click", function (e) {
  if (e.target.closest("[data-retry]")) { load(); return; }
  var b = e.target.closest("[data-act]");
  if (!b || !post) return;
  toggle(b.dataset.act, "post-" + post.id, { title: post.title, meta: t("feed.badge.articles"), link: "/post.html?slug=" + encodeURIComponent(post.slug) })
    .catch(function () { toast(t("act.error")); });
});
onActions(render);

function load() {
  root.innerHTML = '<main><div class="skeleton"></div></main>';
  fetchPostBySlug(slug).then(function (p) {
    if (!p) { root.innerHTML = "<main>" + stateBox(t("post.notFound")) + "</main>"; return; }
    post = p;
    document.title = p.seoTitle || p.title;
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", p.seoDescription || "");
    render();
  }).catch(function () { root.innerHTML = "<main>" + stateBox(t("common.loadError"), true) + "</main>"; });
}

gate("feed", function () { load(); loadActions().catch(function () {}); });
