// 42: how a shared song looks (Home feed and Musica tab). The player loads only when tapped, so the feed stays fast.
import { LANG, fmtDate } from "/js/app/i18n.js";
import { esc, toneFor, initialsOf, HEART } from "/js/app/common.js";
import { heightFor } from "/js/app/songs.js";

var T = {
  it: { shared: "ha condiviso una canzone", play: "Ascolta qui", open: "Apri", remove: "Elimina", like: "Mi piace", liked: "Ti piace",
    title: "Condividi una canzone", songs: "Canzoni della community", link: "Link della canzone (Spotify, Apple Music, YouTube…)", name: "Titolo", artist: "Artista",
    note: "Perché la ami? (facoltativo)", hint: "Appare nel feed di chi ti segue e di tutta la community.", send: "Pubblica nel feed", sent: "Pubblicata nel feed!",
    needLink: "Incolla il link della canzone oppure scrivi titolo e artista.", empty: "Nessuna canzone condivisa per ora: inizia tu!", removed: "Canzone eliminata.", confirm: "Eliminare questa canzone dal feed?" },
  en: { shared: "shared a song", play: "Listen here", open: "Open", remove: "Delete", like: "Like", liked: "Liked",
    title: "Share a song", songs: "Songs from the community", link: "Song link (Spotify, Apple Music, YouTube…)", name: "Title", artist: "Artist",
    note: "Why do you love it? (optional)", hint: "It shows up in the feed of your followers and the whole community.", send: "Post to the feed", sent: "Posted to the feed!",
    needLink: "Paste the song link or type the title and artist.", empty: "No songs shared yet: be the first!", removed: "Song deleted.", confirm: "Delete this song from the feed?" },
  es: { shared: "ha compartido una canción", play: "Escuchar aquí", open: "Abrir", remove: "Eliminar", like: "Me gusta", liked: "Te gusta",
    title: "Comparte una canción", songs: "Canciones de la comunidad", link: "Enlace de la canción (Spotify, Apple Music, YouTube…)", name: "Título", artist: "Artista",
    note: "¿Por qué te encanta? (opcional)", hint: "Aparece en el feed de quien te sigue y de toda la comunidad.", send: "Publicar en el feed", sent: "¡Publicada en el feed!",
    needLink: "Pega el enlace de la canción o escribe título y artista.", empty: "Aún no hay canciones: ¡empieza tú!", removed: "Canción eliminada.", confirm: "¿Eliminar esta canción del feed?" }
};
export function st(k) { return (T[LANG] || T.it)[k] || T.it[k]; }

var NOTE = '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>';
var PLAY = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>';

// opts: { liked:boolean, mine:boolean }
export function songCard(r, opts) {
  opts = opts || {};
  var id = "song-" + r._id;
  var label = [r.title, r.artist].filter(Boolean).join(" — ");
  return '<article class="ig song" data-song="' + esc(r._id) + '">' +
    '<div class="ig-head"><span class="ring"><span class="av" style="background:' + toneFor(r.name) + '">' + (r.photo ? '<img src="' + esc(r.photo) + '" alt="">' : esc(initialsOf(r.name))) + "</span></span>" +
      '<span class="who"><span class="name">' + esc(r.name || "Blogness") + '</span><span class="place">' + esc(st("shared") + (r.platform ? " · " + r.platform : "")) + "</span></span>" +
      (opts.mine ? '<button type="button" class="icon-btn" data-del-song="' + esc(r._id) + '" aria-label="' + esc(st("remove")) + '"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg></button>' : "") + "</div>" +
    '<div class="song-player" data-embed="' + esc(r.embed || "") + '" data-h="' + heightFor(r.embed || "") + '">' +
      '<span class="song-art">' + NOTE + '</span><span class="song-txt"><b>' + esc(r.title || r.platform || "♪") + "</b>" + (r.artist ? "<span>" + esc(r.artist) + "</span>" : "") + "</span>" +
      (r.embed ? '<button type="button" class="btn sm primary" data-play="' + esc(r._id) + '">' + PLAY + esc(st("play")) + "</button>"
        : r.link ? '<a class="btn sm" href="' + esc(r.link) + '" target="_blank" rel="noopener">' + esc(st("open")) + "</a>" : "") +
    "</div>" +
    '<div class="ig-acts"><button type="button" class="icon-btn heart" data-act="like" data-id="' + esc(id) + '" aria-pressed="' + !!opts.liked + '" aria-label="' + esc(st(opts.liked ? "liked" : "like")) + '">' + HEART(!!opts.liked) + "</button>" +
      (r.link ? '<a class="icon-btn" href="' + esc(r.link) + '" target="_blank" rel="noopener" aria-label="' + esc(st("open") + " " + label) + '"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/></svg></a>' : "") + "</div>" +
    '<div class="ig-text">' + (r.note ? "<span><b>" + esc(r.name || "") + "</b> " + esc(r.note) + "</span>" : "") +
      '<span class="when">' + esc(fmtDate(r._createdDate, { day: "numeric", month: "long" })) + "</span></div></article>";
}

// Tap "Listen here": swap the placeholder for the real player.
document.addEventListener("click", function (e) {
  var b = e.target.closest && e.target.closest("[data-play]");
  if (!b) return;
  var box = b.closest(".song-player");
  var src = box && box.dataset.embed;
  if (!src || !/^https:\/\/(open\.spotify\.com|embed\.music\.apple\.com|www\.youtube-nocookie\.com|w\.soundcloud\.com|widget\.deezer\.com)\//.test(src)) return;
  var f = document.createElement("iframe");
  f.src = src + (src.indexOf("youtube") >= 0 ? "?autoplay=1" : "");
  f.title = box.querySelector("b") ? box.querySelector("b").textContent : "Player";
  f.loading = "lazy";
  f.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
  f.style.cssText = "width:100%;border:0;border-radius:14px;height:" + (Number(box.dataset.h) || 160) + "px";
  box.classList.add("on");
  box.innerHTML = "";
  box.appendChild(f);
});
