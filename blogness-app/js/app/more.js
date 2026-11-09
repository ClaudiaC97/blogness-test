// Extra UI strings for the Instagram-style version (Musica tab, stories, profile). Same language as i18n.js.
import { LANG } from "/js/app/i18n.js";

var D = {
  it: {
    "nav.musica": "Musica", "story.me": "La tua storia", "story.music": "Musica", "story.events": "Eventi",
    "feed.share": "Condividi", "feed.copied": "Link copiato", "feed.commentsSoon": "I commenti arrivano presto nell’app.", "feed.readMore": "Leggi l’articolo", "feed.likedByYou": "Ti piace",
    "music.title": "Musica", "music.eyebrow": "Music&GO by Blogness", "music.mgTitle": "Dove nasce la musica che ami",
    "music.mgText": "Tocca un paese sulla mappa e scopri i suoi artisti, le canzoni e le curiosità. Con il quiz e i tuoi preferiti.",
    "music.openMap": "Apri la mappa", "music.closeMap": "Chiudi la mappa", "music.byCountry": "Viaggia per paese",
    "music.magazine": "Dal magazine · Musica e live", "music.seeAll": "Vedi tutti", "music.noArticles": "Presto qui i nuovi articoli di Musica e live.",
    "music.live": "Live vicino a te", "music.noLive": "Non ci sono concerti in calendario: appena blogness.org ne pubblica uno, compare qui.",
    "music.allEvents": "Tutti gli eventi", "music.invite": "Invita un amico a un concerto",
    "me.statSaved": "salvati", "me.statEvents": "eventi", "me.statWish": "desideri", "me.share": "Condividi profilo", "me.settings": "Impostazioni",
    "me.wish": "Wishlist", "me.wishFriends": "Desideri degli amici", "me.trips": "Viaggi", "me.music": "Musica", "me.highlights": "In evidenza",
    "me.tabPhotos": "Le tue foto", "me.tabSaved": "Salvati", "me.tabWish": "La tua wishlist", "me.tabDay": "La tua giornata e gli eventi"
  },
  en: {
    "nav.musica": "Music", "story.me": "Your story", "story.music": "Music", "story.events": "Events",
    "feed.share": "Share", "feed.copied": "Link copied", "feed.commentsSoon": "Comments are coming to the app soon.", "feed.readMore": "Read the article", "feed.likedByYou": "You like this",
    "music.title": "Music", "music.eyebrow": "Music&GO by Blogness", "music.mgTitle": "Where the music you love is born",
    "music.mgText": "Tap a country on the map to meet its artists, songs and curiosities. With a quiz and your favourites.",
    "music.openMap": "Open the map", "music.closeMap": "Close the map", "music.byCountry": "Travel by country",
    "music.magazine": "From the magazine · Music & live", "music.seeAll": "See all", "music.noArticles": "New Music & live articles are coming soon.",
    "music.live": "Live near you", "music.noLive": "No concerts on the calendar yet: as soon as blogness.org publishes one, it shows up here.",
    "music.allEvents": "All events", "music.invite": "Invite a friend to a concert",
    "me.statSaved": "saved", "me.statEvents": "events", "me.statWish": "wishes", "me.share": "Share profile", "me.settings": "Settings",
    "me.wish": "Wishlist", "me.wishFriends": "Friends’ wishes", "me.trips": "Trips", "me.music": "Music", "me.highlights": "Highlights",
    "me.tabPhotos": "Your photos", "me.tabSaved": "Saved", "me.tabWish": "Your wishlist", "me.tabDay": "Your day and events"
  },
  es: {
    "nav.musica": "Música", "story.me": "Tu historia", "story.music": "Música", "story.events": "Eventos",
    "feed.share": "Compartir", "feed.copied": "Enlace copiado", "feed.commentsSoon": "Los comentarios llegan pronto a la app.", "feed.readMore": "Leer el artículo", "feed.likedByYou": "Te gusta",
    "music.title": "Música", "music.eyebrow": "Music&GO by Blogness", "music.mgTitle": "Donde nace la música que amas",
    "music.mgText": "Toca un país en el mapa y descubre sus artistas, canciones y curiosidades. Con un quiz y tus favoritos.",
    "music.openMap": "Abrir el mapa", "music.closeMap": "Cerrar el mapa", "music.byCountry": "Viaja por país",
    "music.magazine": "Del magazine · Música y directo", "music.seeAll": "Ver todos", "music.noArticles": "Pronto aquí los nuevos artículos de Música y directo.",
    "music.live": "Directos cerca de ti", "music.noLive": "Aún no hay conciertos en el calendario: en cuanto blogness.org publique uno, aparecerá aquí.",
    "music.allEvents": "Todos los eventos", "music.invite": "Invita a un amigo a un concierto",
    "me.statSaved": "guardados", "me.statEvents": "eventos", "me.statWish": "deseos", "me.share": "Compartir perfil", "me.settings": "Ajustes",
    "me.wish": "Deseos", "me.wishFriends": "Deseos de amigos", "me.trips": "Viajes", "me.music": "Música", "me.highlights": "Destacados",
    "me.tabPhotos": "Tus fotos", "me.tabSaved": "Guardados", "me.tabWish": "Tu lista de deseos", "me.tabDay": "Tu día y eventos"
  }
};

export function tx(key, vars) {
  var s = (D[LANG] && D[LANG][key]) || D.en[key] || key;
  if (vars) Object.keys(vars).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
  return s;
}

// Music&GO by Blogness (Wix site "Music&GO by Blogness")
export var MUSICANDGO_URL = "https://headless-ptfesqpofda-blognessllc-140b.wix-site-host.com/";
// blogness.org blog categories "Music & live" per language
export var MUSIC_CATEGORY = { it: "eb9ef22b-584f-427a-a4d0-ee0ef52976eb", en: "b36d14eb-a823-4d92-9227-301ea1275637", es: "f2484759-70e5-42f1-8f9e-986fafe9f229" };
