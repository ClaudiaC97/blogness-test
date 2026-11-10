// blogness.org articles in one language — a data-layer read the shipped blog layer does not have.
// Same transport, fieldsets, feed order and DTO mapper as /js/org/posts.js (fetchPosts); the only
// addition is the documented `language` filter of Query Posts ($eq is a declared operator).
// docs: https://dev.wix.com/docs/api-reference/business-solutions/blog/posts-stats/query-posts.md
import { wixRequest } from "/js/org/client.js";
import { imgSrc } from "/js/org/media.js";
import { CARD_FIELDSETS, feedQuery, toSummary } from "/js/org/posts-core.js";

export function fetchPostsInLanguage(language, limit) {
  var query = feedQuery({ limit: limit || 20 });
  query.filter = Object.assign({}, query.filter || {}, { language: { $eq: language } });
  return wixRequest("/blog/v3/posts/query", { body: { fieldsets: CARD_FIELDSETS, query: query } })
    .then(function (res) { return ((res && res.posts) || []).map(function (p) { return toSummary(p, imgSrc); }); });
}