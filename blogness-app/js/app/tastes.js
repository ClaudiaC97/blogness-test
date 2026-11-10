// 42 (10 Nov 2026): tastes inside the interests — music genres, film genres and sports.
// Saved privately for each member in appMemberActions (kind "taste", refId "music:jazz").
// They refine the suggestions (match.js) and, only if the member shares interests, the "people like you" list.
import { LANG } from "/js/app/i18n.js";
import { loadActions, list, toggle } from "/js/app/actions.js";

function L(it, en, es, kw) { return { it: it, en: en, es: es, kw: kw || [] }; }

export var TASTES = {
  music: {
    title: L("Musica", "Music", "Música"),
    items: {
      pop: L("Pop", "Pop", "Pop", ["pop"]), rock: L("Rock", "Rock", "Rock", ["rock"]), indie: L("Indie", "Indie", "Indie", ["indie"]),
      jazz: L("Jazz", "Jazz", "Jazz", ["jazz", "blues"]), classical: L("Classica", "Classical", "Clásica", ["classica", "classical", "clásica", "orchestr", "sinfon", "symphon"]),
      opera: L("Lirica e opera", "Opera", "Ópera", ["opera", "ópera", "lirica"]), hiphop: L("Hip hop e rap", "Hip hop & rap", "Hip hop y rap", ["hip hop", "hip-hop", "rap", "trap"]),
      electronic: L("Elettronica", "Electronic", "Electrónica", ["elettronic", "electronic", "electrónic", "techno", "house", "dj"]),
      soul: L("R&B e soul", "R&B & soul", "R&B y soul", ["r&b", "soul", "funk"]), songwriter: L("Cantautori", "Singer-songwriters", "Cantautores", ["cantautor", "songwriter"]),
      latin: L("Latina", "Latin", "Latina", ["latin", "reggaeton", "salsa", "bachata"]), reggae: L("Reggae", "Reggae", "Reggae", ["reggae"]),
      metal: L("Metal", "Metal", "Metal", ["metal"]), world: L("World music", "World music", "Músicas del mundo", ["world", "folk", "afro"]),
      soundtracks: L("Colonne sonore", "Soundtracks", "Bandas sonoras", ["colonna sonora", "colonne sonore", "soundtrack", "banda sonora"])
    }
  },
  film: {
    title: L("Film e serie", "Films & series", "Cine y series"),
    items: {
      comedy: L("Commedia", "Comedy", "Comedia", ["commedia", "comedy", "comedia"]), drama: L("Drammatico", "Drama", "Drama", ["dramm", "drama"]),
      thriller: L("Thriller", "Thriller", "Thriller", ["thriller", "giallo", "crime", "noir"]), horror: L("Horror", "Horror", "Terror", ["horror", "terror"]),
      scifi: L("Fantascienza", "Sci-fi", "Ciencia ficción", ["fantascienza", "sci-fi", "science fiction", "ciencia ficción"]),
      fantasy: L("Fantasy", "Fantasy", "Fantasía", ["fantasy", "fantasía"]), animation: L("Animazione", "Animation", "Animación", ["animazion", "animation", "animación", "anime"]),
      documentary: L("Documentari", "Documentaries", "Documentales", ["documentar"]), romance: L("Romantico", "Romance", "Romántico", ["romantic", "romance", "romántic"]),
      action: L("Azione", "Action", "Acción", ["azione", "action", "acción"]), history: L("Storico", "Historical", "Histórico", ["storic", "historic", "históric"]),
      auteur: L("Cinema d’autore", "Arthouse", "Cine de autor", ["d'autore", "arthouse", "de autor", "festival"]), series: L("Serie TV", "TV series", "Series", ["serie", "series"])
    }
  },
  sport: {
    title: L("Sport", "Sport", "Deporte"),
    items: {
      football: L("Calcio", "Football", "Fútbol", ["calcio", "football", "fútbol", "soccer"]), tennis: L("Tennis", "Tennis", "Tenis", ["tennis", "tenis"]),
      padel: L("Padel", "Padel", "Pádel", ["padel", "pádel"]), basketball: L("Basket", "Basketball", "Baloncesto", ["basket", "baloncesto"]),
      volleyball: L("Pallavolo", "Volleyball", "Voleibol", ["pallavolo", "volley", "voleibol"]), running: L("Running", "Running", "Running", ["running", "corsa", "maratona", "marathon", "maratón"]),
      cycling: L("Ciclismo", "Cycling", "Ciclismo", ["ciclism", "cycling", "bici", "bike"]), swimming: L("Nuoto", "Swimming", "Natación", ["nuoto", "swim", "natación"]),
      yoga: L("Yoga e pilates", "Yoga & pilates", "Yoga y pilates", ["yoga", "pilates"]), gym: L("Palestra", "Gym & fitness", "Gimnasio", ["palestra", "gym", "fitness", "gimnasio"]),
      ski: L("Sci e montagna", "Skiing & mountains", "Esquí y montaña", ["sci", "ski", "esquí", "montagn", "mountain", "montaña", "trekking", "hiking"]),
      f1: L("Formula 1", "Formula 1", "Fórmula 1", ["formula 1", "f1", "fórmula 1"]), motogp: L("MotoGP", "MotoGP", "MotoGP", ["motogp", "moto"]),
      rugby: L("Rugby", "Rugby", "Rugby", ["rugby"]), golf: L("Golf", "Golf", "Golf", ["golf"]), sailing: L("Vela e mare", "Sailing & sea", "Vela y mar", ["vela", "sail", "mare", "sea", "mar "])
    }
  }
};

function lang(o) { return o[LANG] || o.it; }
export function groupTitle(g) { return TASTES[g] ? lang(TASTES[g].title) : g; }
function entry(key) { var p = String(key).split(":"); var g = TASTES[p[0]]; return g && g.items[p[1]] ? g.items[p[1]] : null; }
export function isTaste(key) { return !!entry(key); }
export function tasteLabel(key) { var e = entry(key); return e ? lang(e) : key; }
export function tasteKeywords(key) { var e = entry(key); return e ? e.kw : []; }

export function loadTastes() { return loadActions().then(myTastes).catch(function () { return []; }); }
export function myTastes() { return list("taste").map(function (r) { return r.refId; }).filter(isTaste); }
export function hasTaste(key) { return myTastes().indexOf(key) >= 0; }
export function toggleTaste(key) {
  return toggle("taste", key, { title: tasteLabel(key), meta: groupTitle(String(key).split(":")[0]) });
}
