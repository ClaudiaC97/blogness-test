// Language for the Blogness app: the phone's language (it / en / es), or the member's choice saved
// in this browser. Static text in the pages carries data-i18n / data-i18n-aria / data-i18n-ph.
var KEY = "blogness-lang";
var SUPPORTED = ["it", "en", "es"];

var D = {
  it: {
    "nav.feed": "Feed", "nav.proposte": "Scopri", "nav.contatti": "Persone", "nav.wishlist": "Wishlist", "nav.notifiche": "Notifiche", "nav.myid": "MyID",
    "common.retry": "Riprova", "common.save": "Salva", "common.saved": "✓ Salvato", "common.loadError": "Non riusciamo a caricare questa sezione.", "common.back": "Indietro", "common.chat": "Chat", "common.search": "Cerca",
    "login.title": "Accedi", "login.sticker": "Benvenuto", "login.lead": "Un social più lento per chi ama lifestyle, viaggi e design. Entra e scopri cosa condividono i tuoi amici.",
    "login.tabLogin": "Accedi", "login.tabSignup": "Registrati", "login.email": "Email", "login.password": "Password", "login.enter": "Entra",
    "login.first": "Nome", "login.last": "Cognome", "login.create": "Crea il mio account", "login.verifyText": "Ti abbiamo inviato un codice via email. Inseriscilo per confermare il tuo account.",
    "login.code": "Codice di verifica", "login.confirm": "Conferma", "login.approval": "Grazie! La tua iscrizione è in attesa di approvazione. Riceverai un’email appena il tuo account sarà attivo.",
    "login.footer": "Entrando accetti di far parte di una community gentile e rispettosa.", "login.groupLabel": "Accedi o registrati",
    "login.err.invalidPassword": "Email o password non corrette.", "login.err.invalidEmail": "Controlla l’indirizzo email.", "login.err.emailAlreadyExists": "Esiste già un account con questa email: accedi.",
    "login.err.resetPassword": "Per questo account serve reimpostare la password.", "login.err.missingCaptchaToken": "Serve una verifica anti-spam: riprova tra poco.", "login.err.invalidCaptchaToken": "Verifica anti-spam non valida: riprova.",
    "login.err.generic": "Qualcosa non ha funzionato. Controlla i dati e riprova.",
    "feed.hello": "Ciao {name}, ecco cosa c’è di nuovo", "feed.helloAnon": "Ecco cosa c’è di nuovo", "feed.filterLabel": "Filtra il feed",
    "feed.all": "Tutto", "feed.friends": "Amici", "feed.community": "Community", "feed.articles": "Articoli", "feed.badge.friends": "Amici", "feed.badge.community": "Community", "feed.badge.articles": "Articolo",
    "feed.like": "Mi piace", "feed.liked": "Ti piace", "feed.comment": "Commenta", "feed.read": "Leggi l’articolo", "feed.empty": "Nessun contenuto da mostrare per ora.", "feed.minRead": "{n} min di lettura", "feed.blog": "Blog Blogness",
    "post.notFound": "Questo articolo non esiste più.", "post.back": "← Torna al feed",
    "prop.title": "Scopri", "prop.day": "La tua giornata", "prop.events": "Eventi", "prop.trips": "Viaggi", "prop.groupLabel": "Tipo di proposta", "prop.dayLead": "Una giornata pensata sui tuoi interessi.",
    "prop.add": "+ Aggiungi alla mia giornata", "prop.added": "✓ Nella tua giornata", "prop.details": "Dettagli e iscrizione", "prop.organize": "Organizza con un amico", "prop.empty": "Nessuna proposta per ora: torna più tardi.", "prop.eventsLead": "Gli eventi della community Blogness.",
    "prop.online": "Online", "prop.free": "Gratis",
    "event.notFound": "Questo evento non esiste più.", "event.back": "← Torna alle proposte", "event.register": "Iscriviti", "event.waitlist": "Mettimi in lista d’attesa", "event.decline": "Non posso venire",
    "event.closed": "Le iscrizioni sono chiuse.", "event.soldOut": "Posti esauriti.", "event.opensAt": "Le iscrizioni aprono il {date}.", "event.paused": "Le iscrizioni sono in pausa.",
    "event.yes": "Sei iscritto! Ti aspettiamo.", "event.no": "Grazie per averci avvisato.", "event.waitlisted": "Sei in lista d’attesa: ti avviseremo se si libera un posto.",
    "event.membersOnly": "Riservato ai membri di blogness.org.", "event.external": "Iscriviti sul sito dell’organizzatore", "event.tickets": "Biglietti su blogness.org", "event.calendar": "Aggiungi al calendario", "event.guests": "Ospiti", "event.guestName": "Nome ospite {n}", "event.required": "obbligatorio",
    "cont.title": "Persone", "cont.req": "Richieste", "cont.sug": "Suggerimenti", "cont.chat": "Chat", "cont.groupLabel": "Sezione", "cont.newOne": "1 nuova richiesta", "cont.newMany": "{n} nuove richieste",
    "cont.accept": "Accetta", "cont.decline": "Rifiuta", "cont.accepted": "Ora siete amici! Scrivi in chat.", "cont.declined": "Richiesta rifiutata.", "cont.sugLead": "Persone con interessi simili ai tuoi.",
    "cont.add": "+ Aggiungi", "cont.sent": "✓ Inviata", "cont.searchChats": "Cerca nelle chat", "cont.noChat": "Nessuna chat per ora.", "cont.noChatFound": "Nessuna chat trovata.", "cont.levels": "Chattando sbloccate nuovi livelli: videochiamata, inviti a eventi e regali dalla wishlist.",
    "cont.noReq": "Nessuna richiesta in attesa.", "cont.noSug": "Nessun suggerimento per ora.",
    "wish.title": "Wishlist", "wish.mine": "La mia wishlist", "wish.friends": "Degli amici", "wish.groupLabel": "Quale wishlist", "wish.add": "Aggiungi un desiderio", "wish.lead": "I tuoi amici possono regalarti un desiderio o un biglietto per vivere qualcosa insieme.",
    "wish.reserved": "Prenotato!", "wish.birthday": "Compleanno", "wish.gift": "Regala", "wish.gifted": "✓ Nel carrello", "wish.emptyMine": "La tua wishlist è vuota: aggiungi il primo desiderio.", "wish.emptyFriends": "I tuoi amici non hanno ancora desideri.",
    "notif.title": "Notifiche", "notif.readAll": "✓ Segna tutte come lette", "notif.later": "Più tardi", "notif.empty": "Nessuna notifica: tutto tranquillo.", "notif.unread": "Non letta",
    "me.logout": "Esci", "me.welcome": "Benvenuto", "me.welcomeName": "Benvenuto, {name}", "me.hi": "Ciao!", "me.since": "Su Blogness da {date}", "me.edit": "Modifica profilo", "me.unavailable": "I dettagli del profilo non sono disponibili al momento.",
    "me.completeTitle": "Completa la tua identità", "me.completeText": "Aggiungi foto, città preferite e interessi: così le proposte e i suggerimenti saranno davvero tuoi.", "me.completeCta": "Completa ora →",
    "me.photos": "Foto", "me.day": "Giornata", "me.events": "Eventi", "me.saved": "Salvati", "me.groupLabel": "I tuoi contenuti", "me.photosEmpty": "Le tue foto appariranno qui: condividi il primo momento dal Feed.",
    "me.dayEmpty": "Aggiungi momenti dalle Proposte: compariranno qui.", "me.eventsEmpty": "Salva o iscriviti a un evento: comparirà qui.", "me.savedEmpty": "Gli articoli, i viaggi e i post che salvi compaiono qui.",
    "me.lang": "Lingua", "me.langAuto": "Come il telefono",
    "login.forgot": "Password dimenticata?", "login.forgotText": "Inserisci l’email del tuo account blogness.org: ti mandiamo un link per scegliere una nuova password.", "login.sendLink": "Invia il link", "login.linkSent": "Fatto! Se l’email è registrata su blogness.org, a breve riceverai il link.", "login.backToLogin": "← Torna all’accesso", "login.credNote": "Usa le stesse credenziali del tuo account blogness.org.", "login.eyebrow": "Lifestyle · Viaggi · Design", "login.tagline": "Un social più lento, per chi ama le cose fatte con cura.", "login.langLabel": "Lingua",
    "feed.morning": "Buongiorno", "feed.afternoon": "Buon pomeriggio", "feed.evening": "Buonasera", "me.photoAlt": "La tua foto profilo", "event.where": "Dove", "event.when": "Quando",
    "act.error": "Non siamo riusciti a salvare: riprova."
  },
  en: {
    "nav.feed": "Feed", "nav.proposte": "Discover", "nav.contatti": "People", "nav.wishlist": "Wishlist", "nav.notifiche": "Alerts", "nav.myid": "MyID",
    "common.retry": "Try again", "common.save": "Save", "common.saved": "✓ Saved", "common.loadError": "We couldn’t load this section.", "common.back": "Back", "common.chat": "Chat", "common.search": "Search",
    "login.title": "Sign in", "login.sticker": "Welcome", "login.lead": "A slower social space for lifestyle, travel and design lovers. Come in and see what your friends are sharing.",
    "login.tabLogin": "Sign in", "login.tabSignup": "Sign up", "login.email": "Email", "login.password": "Password", "login.enter": "Sign in",
    "login.first": "First name", "login.last": "Last name", "login.create": "Create my account", "login.verifyText": "We emailed you a code. Enter it to confirm your account.",
    "login.code": "Verification code", "login.confirm": "Confirm", "login.approval": "Thank you! Your sign-up is waiting for approval. We’ll email you as soon as your account is active.",
    "login.footer": "By joining you agree to be part of a kind and respectful community.", "login.groupLabel": "Sign in or sign up",
    "login.err.invalidPassword": "Wrong email or password.", "login.err.invalidEmail": "Please check the email address.", "login.err.emailAlreadyExists": "An account with this email already exists: sign in.",
    "login.err.resetPassword": "This account needs a password reset.", "login.err.missingCaptchaToken": "An anti-spam check is needed: try again shortly.", "login.err.invalidCaptchaToken": "Anti-spam check failed: try again.",
    "login.err.generic": "Something went wrong. Check your details and try again.",
    "feed.hello": "Hi {name}, here’s what’s new", "feed.helloAnon": "Here’s what’s new", "feed.filterLabel": "Filter the feed",
    "feed.all": "All", "feed.friends": "Friends", "feed.community": "Community", "feed.articles": "Articles", "feed.badge.friends": "Friends", "feed.badge.community": "Community", "feed.badge.articles": "Article",
    "feed.like": "Like", "feed.liked": "Liked", "feed.comment": "Comment", "feed.read": "Read the article", "feed.empty": "Nothing to show yet.", "feed.minRead": "{n} min read", "feed.blog": "Blogness Blog",
    "post.notFound": "This article no longer exists.", "post.back": "← Back to feed",
    "prop.title": "Discover", "prop.day": "Your day", "prop.events": "Events", "prop.trips": "Trips", "prop.groupLabel": "Kind of suggestion", "prop.dayLead": "A day shaped around your interests.",
    "prop.add": "+ Add to my day", "prop.added": "✓ In your day", "prop.details": "Details and sign-up", "prop.organize": "Plan it with a friend", "prop.empty": "No suggestions yet: check back later.", "prop.eventsLead": "Events from the Blogness community.",
    "prop.online": "Online", "prop.free": "Free",
    "event.notFound": "This event no longer exists.", "event.back": "← Back to suggestions", "event.register": "Sign up", "event.waitlist": "Join the waitlist", "event.decline": "I can’t make it",
    "event.closed": "Registration is closed.", "event.soldOut": "Sold out.", "event.opensAt": "Registration opens on {date}.", "event.paused": "Registration is paused.",
    "event.yes": "You’re in! See you there.", "event.no": "Thanks for letting us know.", "event.waitlisted": "You’re on the waitlist: we’ll let you know if a spot opens.",
    "event.membersOnly": "For blogness.org members only.", "event.external": "Sign up on the organizer’s site", "event.tickets": "Tickets on blogness.org", "event.calendar": "Add to calendar", "event.guests": "Guests", "event.guestName": "Guest {n} name", "event.required": "required",
    "cont.title": "People", "cont.req": "Requests", "cont.sug": "Suggestions", "cont.chat": "Chat", "cont.groupLabel": "Section", "cont.newOne": "1 new request", "cont.newMany": "{n} new requests",
    "cont.accept": "Accept", "cont.decline": "Decline", "cont.accepted": "You’re now friends! Say hi in chat.", "cont.declined": "Request declined.", "cont.sugLead": "People who share your interests.",
    "cont.add": "+ Add", "cont.sent": "✓ Sent", "cont.searchChats": "Search chats", "cont.noChat": "No chats yet.", "cont.noChatFound": "No chats found.", "cont.levels": "Chatting unlocks new levels: video calls, event invites and gifts from wishlists.",
    "cont.noReq": "No pending requests.", "cont.noSug": "No suggestions yet.",
    "wish.title": "Wishlist", "wish.mine": "My wishlist", "wish.friends": "Friends’", "wish.groupLabel": "Which wishlist", "wish.add": "Add a wish", "wish.lead": "Your friends can gift you a wish or a ticket to share an experience.",
    "wish.reserved": "Reserved!", "wish.birthday": "Birthday", "wish.gift": "Gift it", "wish.gifted": "✓ In cart", "wish.emptyMine": "Your wishlist is empty: add your first wish.", "wish.emptyFriends": "Your friends have no wishes yet.",
    "notif.title": "Notifications", "notif.readAll": "✓ Mark all as read", "notif.later": "Later", "notif.empty": "No notifications: all quiet.", "notif.unread": "Unread",
    "me.logout": "Log out", "me.welcome": "Welcome", "me.welcomeName": "Welcome, {name}", "me.hi": "Hi!", "me.since": "On Blogness since {date}", "me.edit": "Edit profile", "me.unavailable": "Profile details aren’t available right now.",
    "me.completeTitle": "Complete your identity", "me.completeText": "Add photos, favourite cities and interests so suggestions feel truly yours.", "me.completeCta": "Complete now →",
    "me.photos": "Photos", "me.day": "My day", "me.events": "Events", "me.saved": "Saved", "me.groupLabel": "Your content", "me.photosEmpty": "Your photos will show up here: share your first moment from the Feed.",
    "me.dayEmpty": "Add moments from For you: they’ll show up here.", "me.eventsEmpty": "Save or sign up for an event: it will show up here.", "me.savedEmpty": "Articles, trips and posts you save show up here.",
    "me.lang": "Language", "me.langAuto": "Same as phone",
    "login.forgot": "Forgot your password?", "login.forgotText": "Enter the email of your blogness.org account: we’ll send you a link to choose a new password.", "login.sendLink": "Send the link", "login.linkSent": "Done! If the email is registered on blogness.org, the link is on its way.", "login.backToLogin": "← Back to sign in", "login.credNote": "Use the same details as your blogness.org account.", "login.eyebrow": "Lifestyle · Travel · Design", "login.tagline": "A slower social space, for people who love things made with care.", "login.langLabel": "Language",
    "feed.morning": "Good morning", "feed.afternoon": "Good afternoon", "feed.evening": "Good evening", "me.photoAlt": "Your profile photo", "event.where": "Where", "event.when": "When",
    "act.error": "We couldn’t save that: try again."
  },
  es: {
    "nav.feed": "Feed", "nav.proposte": "Descubrir", "nav.contatti": "Personas", "nav.wishlist": "Deseos", "nav.notifiche": "Avisos", "nav.myid": "MyID",
    "common.retry": "Reintentar", "common.save": "Guardar", "common.saved": "✓ Guardado", "common.loadError": "No pudimos cargar esta sección.", "common.back": "Atrás", "common.chat": "Chat", "common.search": "Buscar",
    "login.title": "Entrar", "login.sticker": "Bienvenido", "login.lead": "Una red social más pausada para quienes aman el lifestyle, los viajes y el diseño. Entra y descubre qué comparten tus amigos.",
    "login.tabLogin": "Entrar", "login.tabSignup": "Registrarse", "login.email": "Email", "login.password": "Contraseña", "login.enter": "Entrar",
    "login.first": "Nombre", "login.last": "Apellido", "login.create": "Crear mi cuenta", "login.verifyText": "Te enviamos un código por email. Introdúcelo para confirmar tu cuenta.",
    "login.code": "Código de verificación", "login.confirm": "Confirmar", "login.approval": "¡Gracias! Tu registro está pendiente de aprobación. Te escribiremos en cuanto tu cuenta esté activa.",
    "login.footer": "Al entrar aceptas formar parte de una comunidad amable y respetuosa.", "login.groupLabel": "Entrar o registrarse",
    "login.err.invalidPassword": "Email o contraseña incorrectos.", "login.err.invalidEmail": "Revisa la dirección de email.", "login.err.emailAlreadyExists": "Ya existe una cuenta con este email: entra.",
    "login.err.resetPassword": "Esta cuenta necesita restablecer la contraseña.", "login.err.missingCaptchaToken": "Hace falta una verificación anti-spam: inténtalo en breve.", "login.err.invalidCaptchaToken": "La verificación anti-spam falló: inténtalo de nuevo.",
    "login.err.generic": "Algo no funcionó. Revisa los datos e inténtalo de nuevo.",
    "feed.hello": "Hola {name}, esto es lo nuevo", "feed.helloAnon": "Esto es lo nuevo", "feed.filterLabel": "Filtrar el feed",
    "feed.all": "Todo", "feed.friends": "Amigos", "feed.community": "Comunidad", "feed.articles": "Artículos", "feed.badge.friends": "Amigos", "feed.badge.community": "Comunidad", "feed.badge.articles": "Artículo",
    "feed.like": "Me gusta", "feed.liked": "Te gusta", "feed.comment": "Comentar", "feed.read": "Leer el artículo", "feed.empty": "Aún no hay nada que mostrar.", "feed.minRead": "{n} min de lectura", "feed.blog": "Blog Blogness",
    "post.notFound": "Este artículo ya no existe.", "post.back": "← Volver al feed",
    "prop.title": "Descubrir", "prop.day": "Tu día", "prop.events": "Eventos", "prop.trips": "Viajes", "prop.groupLabel": "Tipo de propuesta", "prop.dayLead": "Un día pensado según tus intereses.",
    "prop.add": "+ Añadir a mi día", "prop.added": "✓ En tu día", "prop.details": "Detalles e inscripción", "prop.organize": "Organízalo con un amigo", "prop.empty": "Aún no hay propuestas: vuelve más tarde.", "prop.eventsLead": "Los eventos de la comunidad Blogness.",
    "prop.online": "Online", "prop.free": "Gratis",
    "event.notFound": "Este evento ya no existe.", "event.back": "← Volver a las propuestas", "event.register": "Inscribirme", "event.waitlist": "Apuntarme a la lista de espera", "event.decline": "No puedo ir",
    "event.closed": "Las inscripciones están cerradas.", "event.soldOut": "Plazas agotadas.", "event.opensAt": "Las inscripciones abren el {date}.", "event.paused": "Las inscripciones están en pausa.",
    "event.yes": "¡Estás inscrito! Te esperamos.", "event.no": "Gracias por avisarnos.", "event.waitlisted": "Estás en la lista de espera: te avisaremos si se libera una plaza.",
    "event.membersOnly": "Solo para miembros de blogness.org.", "event.external": "Inscríbete en la web del organizador", "event.tickets": "Entradas en blogness.org", "event.calendar": "Añadir al calendario", "event.guests": "Invitados", "event.guestName": "Nombre del invitado {n}", "event.required": "obligatorio",
    "cont.title": "Personas", "cont.req": "Solicitudes", "cont.sug": "Sugerencias", "cont.chat": "Chat", "cont.groupLabel": "Sección", "cont.newOne": "1 solicitud nueva", "cont.newMany": "{n} solicitudes nuevas",
    "cont.accept": "Aceptar", "cont.decline": "Rechazar", "cont.accepted": "¡Ahora sois amigos! Escribe en el chat.", "cont.declined": "Solicitud rechazada.", "cont.sugLead": "Personas con intereses parecidos a los tuyos.",
    "cont.add": "+ Añadir", "cont.sent": "✓ Enviada", "cont.searchChats": "Buscar en los chats", "cont.noChat": "Aún no hay chats.", "cont.noChatFound": "No se encontraron chats.", "cont.levels": "Chateando desbloqueáis nuevos niveles: videollamadas, invitaciones a eventos y regalos de la lista de deseos.",
    "cont.noReq": "No hay solicitudes pendientes.", "cont.noSug": "Aún no hay sugerencias.",
    "wish.title": "Lista de deseos", "wish.mine": "Mi lista", "wish.friends": "De amigos", "wish.groupLabel": "Qué lista", "wish.add": "Añadir un deseo", "wish.lead": "Tus amigos pueden regalarte un deseo o una entrada para vivir algo juntos.",
    "wish.reserved": "¡Reservado!", "wish.birthday": "Cumpleaños", "wish.gift": "Regalar", "wish.gifted": "✓ En el carrito", "wish.emptyMine": "Tu lista está vacía: añade tu primer deseo.", "wish.emptyFriends": "Tus amigos aún no tienen deseos.",
    "notif.title": "Notificaciones", "notif.readAll": "✓ Marcar todo como leído", "notif.later": "Más tarde", "notif.empty": "Sin notificaciones: todo tranquilo.", "notif.unread": "No leída",
    "me.logout": "Salir", "me.welcome": "Bienvenido", "me.welcomeName": "Bienvenido, {name}", "me.hi": "¡Hola!", "me.since": "En Blogness desde {date}", "me.edit": "Editar perfil", "me.unavailable": "Los datos del perfil no están disponibles ahora.",
    "me.completeTitle": "Completa tu identidad", "me.completeText": "Añade fotos, ciudades favoritas e intereses: así las propuestas serán de verdad tuyas.", "me.completeCta": "Completar ahora →",
    "me.photos": "Fotos", "me.day": "Mi día", "me.events": "Eventos", "me.saved": "Guardados", "me.groupLabel": "Tu contenido", "me.photosEmpty": "Tus fotos aparecerán aquí: comparte tu primer momento desde el Feed.",
    "me.dayEmpty": "Añade momentos desde Para ti: aparecerán aquí.", "me.eventsEmpty": "Guarda un evento o inscríbete: aparecerá aquí.", "me.savedEmpty": "Los artículos, viajes y posts que guardes aparecen aquí.",
    "me.lang": "Idioma", "me.langAuto": "Como el teléfono",
    "login.forgot": "¿Olvidaste la contraseña?", "login.forgotText": "Escribe el email de tu cuenta de blogness.org: te enviaremos un enlace para elegir una contraseña nueva.", "login.sendLink": "Enviar el enlace", "login.linkSent": "¡Listo! Si el email está registrado en blogness.org, recibirás el enlace en breve.", "login.backToLogin": "← Volver a entrar", "login.credNote": "Usa los mismos datos de tu cuenta de blogness.org.", "login.eyebrow": "Lifestyle · Viajes · Diseño", "login.tagline": "Una red social más pausada, para quienes aman las cosas hechas con cuidado.", "login.langLabel": "Idioma",
    "feed.morning": "Buenos días", "feed.afternoon": "Buenas tardes", "feed.evening": "Buenas noches", "me.photoAlt": "Tu foto de perfil", "event.where": "Dónde", "event.when": "Cuándo",
    "act.error": "No pudimos guardarlo: inténtalo de nuevo."
  }
};

function readPref() {
  try { return localStorage.getItem(KEY) || "auto"; } catch (e) { return "auto"; }
}
function phoneLang() {
  var list = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""]);
  for (var i = 0; i < list.length; i++) {
    var code = String(list[i] || "").slice(0, 2).toLowerCase();
    if (SUPPORTED.indexOf(code) >= 0) return code;
  }
  return "en";
}

export function langPref() { return readPref(); }
export var LANG = (function () { var p = readPref(); return SUPPORTED.indexOf(p) >= 0 ? p : phoneLang(); })();
export var LOCALE = { it: "it-IT", en: "en-GB", es: "es-ES" }[LANG];

export function setLangPref(value) {
  try { if (value === "auto") localStorage.removeItem(KEY); else localStorage.setItem(KEY, value); } catch (e) { /* storage off: the phone language stays */ }
  location.reload();
}

export function t(key, vars) {
  var s = (D[LANG] && D[LANG][key]) || D.it[key] || key;
  if (vars) Object.keys(vars).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
  return s;
}

export function fmtDate(iso, opts, timeZone) {
  if (!iso) return "";
  var d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  var o = Object.assign({}, opts || { day: "numeric", month: "short" });
  if (timeZone) o.timeZone = timeZone;
  try { return new Intl.DateTimeFormat(LOCALE, o).format(d); } catch (e) { return new Intl.DateTimeFormat(LOCALE, opts).format(d); }
}

export function applyI18n(root) {
  var r = root || document;
  document.documentElement.lang = LANG;
  r.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
  r.querySelectorAll("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria"))); });
  r.querySelectorAll("[data-i18n-ph]").forEach(function (el) { el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph"))); });
  var title = document.querySelector("title[data-i18n-title]");
  if (title) document.title = "Blogness · " + t(title.getAttribute("data-i18n-title"));
}

applyI18n();
