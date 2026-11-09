// Strings for real follows and the staff chat (14A). Same language as i18n.js.
import { LANG } from "/js/app/i18n.js";

var D = {
  it: {
    follow: "Segui", following: "Segui già", followBack: "Segui anche tu", ignore: "Ignora", ignored: "Ignorato",
    followsYou: "Ti segue", nowFriends: "Vi seguite a vicenda: ora potete scrivervi.",
    reqLead: "Persone che ti seguono e che non segui ancora.", sugLead: "Membri di Blogness che potresti conoscere.",
    staff: "Staff Blogness", staffSub: "Scrivici: ti rispondiamo qui.", staffEmpty: "Fai una domanda o lasciaci un suggerimento: lo staff ti risponde in questa chat.",
    placeholder: "Scrivi un messaggio…", send: "Invia", sending: "Invio…", sent: "Inviato", waiting: "In attesa di risposta", back: "Chat",
    friends: "Amici", friendSub: "Chat privata in arrivo", privateSoon: "La chat privata tra membri arriva presto. Intanto vi seguite: vedrete i vostri contenuti nel feed.",
    noFriends: "Quando tu e un altro membro vi seguite a vicenda, lo trovi qui.",
    followers: "follower", followingStat: "seguiti", loadError: "Non riesco a caricare i membri. Riprova.", error: "Operazione non riuscita. Riprova."
  },
  en: {
    follow: "Follow", following: "Following", followBack: "Follow back", ignore: "Ignore", ignored: "Ignored",
    followsYou: "Follows you", nowFriends: "You follow each other: you can now message.",
    reqLead: "People who follow you and you don't follow yet.", sugLead: "Blogness members you might know.",
    staff: "Blogness team", staffSub: "Write to us: we reply here.", staffEmpty: "Ask a question or leave us a suggestion: the team replies in this chat.",
    placeholder: "Write a message…", send: "Send", sending: "Sending…", sent: "Sent", waiting: "Waiting for a reply", back: "Chat",
    friends: "Friends", friendSub: "Private chat coming soon", privateSoon: "Private chat between members is coming soon. Meanwhile you follow each other: you'll see each other's posts in the feed.",
    noFriends: "When you and another member follow each other, they appear here.",
    followers: "followers", followingStat: "following", loadError: "Couldn't load members. Try again.", error: "That didn't work. Try again."
  },
  es: {
    follow: "Seguir", following: "Siguiendo", followBack: "Seguir también", ignore: "Ignorar", ignored: "Ignorado",
    followsYou: "Te sigue", nowFriends: "Os seguís mutuamente: ya podéis escribiros.",
    reqLead: "Personas que te siguen y a las que aún no sigues.", sugLead: "Miembros de Blogness que quizá conozcas.",
    staff: "Equipo Blogness", staffSub: "Escríbenos: te respondemos aquí.", staffEmpty: "Haz una pregunta o déjanos una sugerencia: el equipo te responde en este chat.",
    placeholder: "Escribe un mensaje…", send: "Enviar", sending: "Enviando…", sent: "Enviado", waiting: "Esperando respuesta", back: "Chat",
    friends: "Amigos", friendSub: "Chat privado muy pronto", privateSoon: "El chat privado entre miembros llega pronto. Mientras tanto os seguís: veréis vuestras publicaciones en el feed.",
    noFriends: "Cuando tú y otro miembro os sigáis mutuamente, aparecerá aquí.",
    followers: "seguidores", followingStat: "seguidos", loadError: "No se pudieron cargar los miembros. Inténtalo de nuevo.", error: "No ha funcionado. Inténtalo de nuevo."
  }
};

export function fx(key) { return (D[LANG] || D.it)[key] || D.it[key] || key; }
