import { t, fmtDate } from "/js/app/i18n.js";
import { fetchEventBySlug } from "/js/org/events.js";
import { createRegistrationStore } from "/js/org/registration-store.js";
import { loadActions, has, toggle, ensure, onActions } from "/js/app/actions.js";
import { gate, esc, stateBox, toast, BOOKMARK } from "/js/app/common.js";

var root = document.getElementById("root");
var slug = new URLSearchParams(location.search).get("slug") || "";
var event = null, store = null, member = null;

function eventDate(e) {
  if (e.dateTbd) return e.dateTbdMessage || "";
  if (!e.startDateIso) return e.dateLabel || "";
  return fmtDate(e.startDateIso, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }, e.timeZoneId || undefined);
}

function inputHtml(control, input) {
  var id = "f-" + input.name;
  var req = input.mandatory ? ' required aria-required="true"' : "";
  var label = '<span class="lbl">' + esc(input.label) + (input.mandatory ? ' <span class="req" aria-hidden="true">*</span>' : "") + "</span>";
  if (control.type === "TEXTAREA") return '<label class="field">' + label + '<textarea id="' + id + '" name="' + esc(input.name) + '"' + req + (input.maxLength ? ' maxlength="' + input.maxLength + '"' : "") + "></textarea></label>";
  if (control.type === "DROPDOWN") return '<label class="field">' + label + '<select id="' + id + '" name="' + esc(input.name) + '"' + req + '><option value=""></option>' +
    input.options.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + "</option>"; }).join("") + "</select></label>";
  if (control.type === "RADIO" || control.type === "CHECKBOX") {
    var type = control.type === "RADIO" ? "radio" : "checkbox";
    return '<fieldset class="field" style="border:0;padding:0;margin:0"><legend class="lbl" style="margin-bottom:6px">' + esc(input.label) + (input.mandatory ? ' <span class="req">*</span>' : "") + "</legend>" +
      input.options.map(function (o) { return '<label class="check"><input type="' + type + '" name="' + esc(input.name) + '" value="' + esc(o) + '"> ' + esc(o) + "</label>"; }).join("") + "</fieldset>";
  }
  var itype = input.type === "NUMBER" ? "number" : control.type === "DATE" ? "date" : /email/i.test(input.name) ? "email" : "text";
  return '<label class="field">' + label + '<input id="' + id + '" type="' + itype + '" name="' + esc(input.name) + '"' + req + (input.maxLength ? ' maxlength="' + input.maxLength + '"' : "") + "></label>";
}

function prefillValue(name) {
  if (!member) return "";
  if (/^first/i.test(name)) return member.firstName || "";
  if (/^last/i.test(name)) return member.lastName || "";
  if (/email/i.test(name)) return member.loginEmail || "";
  return "";
}

function registrationHtml(e) {
  if (e.registrationClosed) return '<p class="notice">' + esc(t(e.soldOut ? "event.soldOut" : "event.closed")) + "</p>";
  if (e.registrationStatus === "SCHEDULED_RSVP") return '<p class="notice">' + esc(t("event.opensAt", { date: e.registrationOpensAtLabel })) + "</p>";
  if (e.registrationPaused) return '<p class="notice">' + esc(t("event.paused")) + "</p>";
  if (!e.registrationOpen) return "";
  if (e.registrationType === "EXTERNAL") return e.externalUrl ? '<a class="btn primary block" href="' + esc(e.externalUrl) + '" target="_blank" rel="noopener">' + esc(t("event.external")) + "</a>" : "";
  if (e.registrationType === "TICKETING") return e.eventPageUrl ? '<a class="btn primary block" href="' + esc(e.eventPageUrl) + '" target="_blank" rel="noopener">' + esc(t("event.tickets")) + "</a>" : "";
  if (e.registrationType !== "RSVP" || !e.rsvpForm) return "";
  var f = e.rsvpForm;
  var html = '<form class="auth card" id="rsvp" novalidate style="gap:18px">' +
    (e.membersOnly ? '<p class="muted">' + esc(t("event.membersOnly")) + "</p>" : "") +
    f.controls.map(function (c) { return c.inputs.map(function (i) { return inputHtml(c, i); }).join(""); }).join("");
  if (f.guestControl) {
    html += '<label class="field"><span class="lbl">' + esc(f.guestControl.label || t("event.guests")) + '</span><select name="__guests" data-guests>' +
      Array.from({ length: f.guestControl.maxGuests + 1 }, function (_, n) { return '<option value="' + n + '">' + n + "</option>"; }).join("") + '</select></label><div id="guestNames" class="stack"></div>';
  }
  html += '<p class="err" role="alert"></p><button type="submit" class="btn primary block" data-rsvp="yes">' + esc(t(e.waitlistOnly ? "event.waitlist" : "event.register")) + "</button>" +
    (e.rsvpResponseType === "YES_AND_NO" ? '<button type="button" class="link-btn" data-rsvp="no" style="align-self:center">' + esc(t("event.decline")) + "</button>" : "") +
    "</form>";
  return html;
}

function renderPage() {
  var e = event;
  var where = e.locationType === "ONLINE" ? t("prop.online") : [e.locationName, e.address].filter(Boolean).join(" · ");
  var saved = has("event", "event-" + e.slug);
  root.innerHTML =
    (e.imageUrl ? '<img class="hero-img" src="' + esc(e.imageUrl) + '" alt="">' : "") +
    '<main style="gap:22px;padding-top:22px">' +
      '<div class="stack" style="gap:10px"><span class="eyebrow accent">' + esc(eventDate(e)) + "</span>" +
      '<h1 class="display" style="font-size:28px;line-height:1.2;font-weight:400">' + esc(e.title) + "</h1>" +
      (where ? '<span class="muted">' + esc(where) + "</span>" : "") +
      '<div class="row" style="flex-wrap:wrap">' +
        '<button type="button" class="btn sm quiet" data-save aria-pressed="' + saved + '">' + BOOKMARK(saved) + esc(t(saved ? "common.saved" : "common.save")) + "</button>" +
        (e.addToCalendar && e.addToCalendar.google ? '<a class="btn sm quiet" href="' + esc(e.addToCalendar.google) + '" target="_blank" rel="noopener">' + esc(t("event.calendar")) + "</a>" : "") +
      "</div></div>" +
      '<div id="reg">' + registrationHtml(e) + '</div><p class="ok-note" id="done" role="status"></p>' +
      '<div class="prose" id="about"></div>' +
    "</main>";
  var about = root.querySelector("#about");
  if (e.aboutHtml) about.innerHTML = e.aboutHtml;
  else (e.aboutParagraphs || []).forEach(function (txt) { var p = document.createElement("p"); p.textContent = txt; about.appendChild(p); });
  bindForm();
}

function bindForm() {
  var form = root.querySelector("#rsvp");
  if (!form || !store) return;
  form.querySelectorAll("input[name],textarea[name],select[name]").forEach(function (el) {
    if (el.name === "__guests" || el.type === "radio" || el.type === "checkbox") return;
    var v = prefillValue(el.name);
    if (v && !el.value) { el.value = v; store.setRsvpValue(el.name, v); }
  });
  form.addEventListener("input", onInput);
  form.addEventListener("change", onInput);
  form.addEventListener("submit", function (ev) { ev.preventDefault(); send(true); });
  form.addEventListener("click", function (ev) { var b = ev.target.closest('[data-rsvp="no"]'); if (b) send(false); });
}

function onInput(ev) {
  var el = ev.target;
  if (el.hasAttribute("data-guests")) {
    var n = Number(el.value);
    store.setGuestCount(n);
    var box = root.querySelector("#guestNames");
    box.innerHTML = Array.from({ length: n }, function (_, i) {
      return '<label class="field"><span class="lbl">' + esc(t("event.guestName", { n: i + 1 })) + '</span><input type="text" data-guest-name="' + i + '"></label>';
    }).join("");
    return;
  }
  if (el.hasAttribute("data-guest-name")) { store.setGuestName(Number(el.getAttribute("data-guest-name")), el.value); return; }
  if (!el.name) return;
  if (el.type === "checkbox") {
    var vals = Array.prototype.slice.call(root.querySelectorAll('input[name="' + CSS.escape(el.name) + '"]:checked')).map(function (x) { return x.value; });
    store.setRsvpValue(el.name, vals);
  } else store.setRsvpValue(el.name, el.value);
}

function send(attending) {
  var form = root.querySelector("#rsvp");
  if (attending && form && !form.reportValidity()) return;
  store.rsvp(attending).catch(function () {});
}

function renderState(s) {
  var form = root.querySelector("#rsvp");
  if (form) {
    var btn = form.querySelector('[data-rsvp="yes"]');
    if (btn) btn.disabled = s.submitting || !s.canRsvp;
    form.querySelector(".err").textContent = s.error || "";
  }
  if (s.confirmed) {
    var st = s.confirmed.status;
    var msg = st === "WAITLIST" ? t("event.waitlisted") : st === "NO" ? t("event.no") : t("event.yes");
    root.querySelector("#done").textContent = msg;
    if (form) form.hidden = true;
    if (st === "YES" || st === "WAITLIST") {
      ensure("event", "event-" + event.slug, { title: event.title, meta: eventDate(event), link: "/event.html?slug=" + encodeURIComponent(event.slug) }).catch(function () {});
    }
  }
}

root.addEventListener("click", function (ev) {
  if (ev.target.closest("[data-retry]")) { load(); return; }
  if (ev.target.closest("[data-save]") && event) {
    toggle("event", "event-" + event.slug, { title: event.title, meta: eventDate(event), link: "/event.html?slug=" + encodeURIComponent(event.slug) })
      .catch(function () { toast(t("act.error")); });
  }
});
onActions(function () {
  if (!event) return;
  var b = root.querySelector("[data-save]");
  if (!b) return;
  var saved = has("event", "event-" + event.slug);
  b.setAttribute("aria-pressed", String(saved));
  b.innerHTML = BOOKMARK(saved) + esc(t(saved ? "common.saved" : "common.save"));
});

function load() {
  root.innerHTML = '<main><div class="skeleton"></div></main>';
  fetchEventBySlug(slug).then(function (e) {
    if (!e) { root.innerHTML = "<main>" + stateBox(t("event.notFound")) + "</main>"; return; }
    event = e;
    document.title = e.title;
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", e.shortDescription || "");
    var paths = { confirmation: "/proposte.html?tab=events", event: "/event.html?slug=" + encodeURIComponent(e.slug) };
    store = createRegistrationStore(e, { paths: paths });
    renderPage();
    store.subscribe(renderState);
    renderState(store.getState());
    store.start();
  }).catch(function () { root.innerHTML = "<main>" + stateBox(t("common.loadError"), true) + "</main>"; });
}

gate("proposte", function (s) { member = s.member; load(); loadActions().catch(function () {}); });