// 42 (10 Nov 2026): your own trips. Plan a trip (destination, dates, who with), keep it in your agenda,
// then discover what the community shares about the same destination.
// Private plan: appMemberActions (kind "trip"). Optional public card "I'm going to X": blogness.org "appTripShares"
// (members read every row; each member can change or remove only their own).
import { LANG } from "/js/app/i18n.js";
import { queryItems, insertItem, removeItem } from "/js/org/items.js";
import { wixRequest } from "/js/org/client.js";

export var DESTINATIONS = ["Roma", "Firenze", "Venezia", "Milano", "Napoli", "Costiera Amalfitana", "Sicilia", "Puglia", "Sardegna", "Toscana", "Dolomiti", "Lago di Como", "Cinque Terre", "Torino", "Bologna",
  "Parigi", "Londra", "Barcellona", "Madrid", "Lisbona", "Amsterdam", "Berlino", "Vienna", "Praga", "Atene", "Istanbul", "Marrakech", "New York", "Tokyo", "Dubai"];

var ALIAS = { rome: "roma", florence: "firenze", venice: "venezia", milan: "milano", naples: "napoli", sicily: "sicilia", apulia: "puglia", sardinia: "sardegna", tuscany: "toscana",
  dolomites: "dolomiti", "lake como": "lago di como", turin: "torino", paris: "parigi", "parís": "parigi", london: "londra", "londres": "londra", barcelona: "barcellona",
  lisbon: "lisbona", lisboa: "lisbona", berlin: "berlino", "berlín": "berlino", viena: "vienna", prague: "praga", athens: "atene", atenas: "atene", estambul: "istanbul",
  "nueva york": "new york", "tokio": "tokyo", "amalfi": "costiera amalfitana", "amalfi coast": "costiera amalfitana", "costa amalfitana": "costiera amalfitana", "florencia": "firenze", "venecia": "venezia", "milán": "milano", "nápoles": "napoli", "cerdeña": "sardegna", "toscana": "toscana" };

// Words that mean the same place in IT / EN / ES, used to find community content about it.
var WORDS = { roma: ["roma", "rome"], firenze: ["firenze", "florence", "florencia"], venezia: ["venezia", "venice", "venecia"], milano: ["milano", "milan", "milán"], napoli: ["napoli", "naples", "nápoles"],
  "costiera amalfitana": ["amalfi", "positano", "ravello"], sicilia: ["sicilia", "sicily", "palermo", "catania", "taormina"], puglia: ["puglia", "apulia", "bari", "lecce", "salento"],
  sardegna: ["sardegna", "sardinia", "cerdeña", "cagliari"], toscana: ["toscana", "tuscany", "siena", "chianti"], dolomiti: ["dolomiti", "dolomites", "dolomitas", "cortina"],
  "lago di como": ["como", "bellagio"], parigi: ["parigi", "paris", "parís"], londra: ["londra", "london", "londres"], barcellona: ["barcellona", "barcelona"], lisbona: ["lisbona", "lisbon", "lisboa"],
  berlino: ["berlino", "berlin", "berlín"], praga: ["praga", "prague"], atene: ["atene", "athens", "atenas"], "new york": ["new york", "nueva york", "nyc"], tokyo: ["tokyo", "tokio"] };

function plain(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim(); }
export function destKey(name) {
  var k = String(name || "").toLowerCase().split(",")[0].replace(/\s+/g, " ").trim();
  return ALIAS[k] || ALIAS[plain(k)] || plain(k);
}
export function destWords(name) { var k = destKey(name); return (WORDS[k] || [k]).map(plain); }
export function mentions(text, name) { var t = " " + plain(text) + " "; return destWords(name).some(function (w) { return w && t.indexOf(w) >= 0; }); }

var T = {
  it: { title: "Pianifica il tuo viaggio", back: "← MyID", dest: "Dove vuoi andare?", from: "Dal", to: "Al", who: "Con chi", likes: "Cosa ti piacerebbe fare", note: "Note (facoltative)",
    share: "Mostra il mio viaggio alla community", shareNote: "Chi va nella stessa meta può vederti e scriverti. Puoi toglierlo quando vuoi.", save: "Salva e scopri la meta",
    needDest: "Scrivi una destinazione.", badDates: "La data di ritorno è prima della partenza.", mine: "I tuoi viaggi", none: "Nessun viaggio pianificato: scegli la tua prima meta qui sopra.",
    open: "Scopri", remove: "Elimina", removed: "Viaggio eliminato.", confirm: "Eliminare questo viaggio?",
    solo: "Da solo", couple: "In coppia", friends: "Con amici", family: "In famiglia",
    art: "Arte e musei", food: "Cibo e vino", nature: "Natura", sea: "Mare", nightlife: "Musica e serate", shopping: "Shopping", sport: "Sport", relax: "Relax",
    destTitle: "Viaggi della community · {d}", destLead: "Chi va a {d}, itinerari e idee dalla community.", change: "Cambia meta", mates: "Ci vanno anche", write: "Scrivi",
    stories: "Itinerari e articoli", ideas: "Proposte di viaggio", nothing: "Ancora nessun viaggio della community per {d}: sarai tra i primi a raccontarlo.", planCta: "Pianifica il tuo viaggio", allTrips: "Tutte le proposte" },
  en: { title: "Plan your trip", back: "← MyID", dest: "Where do you want to go?", from: "From", to: "To", who: "Who with", likes: "What would you like to do", note: "Notes (optional)",
    share: "Show my trip to the community", shareNote: "People going to the same place can see you and message you. You can remove it anytime.", save: "Save and discover the destination",
    needDest: "Type a destination.", badDates: "The return date is before departure.", mine: "Your trips", none: "No trips planned yet: pick your first destination above.",
    open: "Discover", remove: "Delete", removed: "Trip deleted.", confirm: "Delete this trip?",
    solo: "Solo", couple: "As a couple", friends: "With friends", family: "With family",
    art: "Art & museums", food: "Food & wine", nature: "Nature", sea: "Sea", nightlife: "Music & nights out", shopping: "Shopping", sport: "Sport", relax: "Relax",
    destTitle: "Community trips · {d}", destLead: "Who's going to {d}, itineraries and ideas from the community.", change: "Change destination", mates: "Also going", write: "Message",
    stories: "Itineraries and articles", ideas: "Trip ideas", nothing: "No community trips to {d} yet: you'll be among the first to tell the story.", planCta: "Plan your trip", allTrips: "All suggestions" },
  es: { title: "Planifica tu viaje", back: "← MyID", dest: "¿Adónde quieres ir?", from: "Desde", to: "Hasta", who: "Con quién", likes: "Qué te gustaría hacer", note: "Notas (opcional)",
    share: "Mostrar mi viaje a la comunidad", shareNote: "Quien va al mismo destino puede verte y escribirte. Puedes quitarlo cuando quieras.", save: "Guardar y descubrir el destino",
    needDest: "Escribe un destino.", badDates: "La fecha de vuelta es anterior a la salida.", mine: "Tus viajes", none: "Aún no has planificado viajes: elige tu primer destino arriba.",
    open: "Descubrir", remove: "Eliminar", removed: "Viaje eliminado.", confirm: "¿Eliminar este viaje?",
    solo: "Solo", couple: "En pareja", friends: "Con amigos", family: "En familia",
    art: "Arte y museos", food: "Comida y vino", nature: "Naturaleza", sea: "Mar", nightlife: "Música y noches", shopping: "Compras", sport: "Deporte", relax: "Relax",
    destTitle: "Viajes de la comunidad · {d}", destLead: "Quién va a {d}, itinerarios e ideas de la comunidad.", change: "Cambiar destino", mates: "También van", write: "Escribir",
    stories: "Itinerarios y artículos", ideas: "Propuestas de viaje", nothing: "Aún no hay viajes de la comunidad a {d}: serás de los primeros en contarlo.", planCta: "Planifica tu viaje", allTrips: "Todas las propuestas" }
};
export function tt(k, d) { var s = (T[LANG] || T.it)[k] || T.it[k] || k; return d ? s.replace(/\{d\}/g, d) : s; }
export var WHO = ["solo", "couple", "friends", "family"];
export var LIKES = ["art", "food", "nature", "sea", "nightlife", "shopping", "sport", "relax"];

var COLLECTION = "appTripShares";
var meId = null;
export function myId() {
  if (meId) return Promise.resolve(meId);
  return wixRequest("/members/v1/members/my", { method: "GET" }).then(function (r) { meId = (r && r.member && r.member.id) || ""; return meId; });
}
export function loadTripShares() { return queryItems(COLLECTION, { sort: [{ field: "_createdDate", direction: "desc" }], limit: 100 }).then(function (p) { return p.items || []; }); }
export function shareTrip(trip, member) {
  var m = member || {};
  return myId().then(function (id) {
    return insertItem(COLLECTION, { memberId: id, name: m.firstName || m.nickname || m.displayName || "", photo: m.photoUrl || "",
      destination: trip.dest, destKey: destKey(trip.dest), dates: trip.dates || "", company: trip.who || "", note: trip.note || "", tripRef: trip.ref });
  });
}
export function unshareTrip(row) { return removeItem(COLLECTION, row._id); }
