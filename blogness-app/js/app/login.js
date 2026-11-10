import { t, LANG, setLangPref } from "/js/app/i18n.js";
import { subscribeMember, getMemberState } from "/js/org/member-store.js";
import { passwordLogin, passwordRegister, verifyCode } from "/js/app/password-login.js";
import { sendRecoveryEmail } from "/js/app/recovery.js";
import { startSocial, finishSocial, socialText } from "/js/app/social.js";

var returnTo = new URLSearchParams(location.search).get("returnTo") || "/feed.html";
var safeReturn = returnTo.charAt(0) === "/" && returnTo.charAt(1) !== "/" && returnTo !== "/" && returnTo.indexOf("/index.html") !== 0 ? returnTo : "/feed.html";

var loginForm = document.getElementById("loginForm");
var signupForm = document.getElementById("signupForm");
var forgotForm = document.getElementById("forgotForm");
var verifyForm = document.getElementById("verifyForm");
var approvalEl = document.getElementById("approval");
var modeTabs = document.getElementById("modeTabs");
var langs = document.getElementById("langs");
var social = document.getElementById("social");
var socialErr = document.getElementById("socialErr");
document.getElementById("googleLabel").textContent = socialText(LANG, "google");
document.getElementById("facebookLabel").textContent = socialText(LANG, "facebook");
document.getElementById("orLabel").textContent = socialText(LANG, "or");
var all = [loginForm, signupForm, forgotForm, verifyForm, approvalEl];
var CODES = ["invalidPassword", "invalidEmail", "emailAlreadyExists", "resetPassword", "missingCaptchaToken", "invalidCaptchaToken"];

langs.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === LANG)); });
langs.addEventListener("click", function (e) {
  var b = e.target.closest("button[data-lang]");
  if (b && b.dataset.lang !== LANG) setLangPref(b.dataset.lang);
});

function showOnly(el) {
  all.forEach(function (x) { x.hidden = x !== el; });
  modeTabs.hidden = !(el === loginForm || el === signupForm);
  social.hidden = modeTabs.hidden;
}
function errorOf(form) { return form.querySelector(".err"); }

// Offer the browser / phone password manager to save the credentials (Chrome & Android: Credential
// Management API; Safari/iOS keychain picks up the submitted form with autocomplete="username"/"*-password").
function rememberPassword(form) {
  try {
    if (window.PasswordCredential && navigator.credentials && form.elements.password) {
      var cred = new window.PasswordCredential({ id: form.elements.email.value.trim(), password: form.elements.password.value, name: form.elements.firstName ? form.elements.firstName.value.trim() : undefined });
      return navigator.credentials.store(cred).catch(function () {});
    }
  } catch (e) {}
  return Promise.resolve();
}

function show(result, form) {
  if (result.state === "REDIRECTING") return true;
  if (result.state === "SUCCESS") { location.assign(safeReturn); return true; }
  if (result.state === "EMAIL_VERIFICATION_REQUIRED") { showOnly(verifyForm); return; }
  if (result.state === "OWNER_APPROVAL_REQUIRED") { showOnly(approvalEl); return; }
  if (result.errorCode === "resetPassword") { showOnly(forgotForm); }
  errorOf(form).textContent = CODES.indexOf(result.errorCode) >= 0 ? t("login.err." + result.errorCode) : (result.error || t("login.err.generic"));
}

function submit(form, action) {
  errorOf(form).textContent = "";
  if (!form.reportValidity()) return;
  var button = form.querySelector("button[type=submit]");
  button.disabled = true;
  Promise.resolve().then(function () { return action(form.elements, function () { return rememberPassword(form); }); })
    .then(function (r) { if (!show(r, form)) button.disabled = false; })
    .catch(function (e) { show({ state: "FAILURE", error: e && e.message ? e.message : String(e) }, form); button.disabled = false; });
}

modeTabs.addEventListener("click", function (e) {
  var b = e.target.closest("button[data-mode]");
  if (!b) return;
  modeTabs.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
  showOnly(b.dataset.mode === "signup" ? signupForm : loginForm);
});

document.getElementById("toForgot").addEventListener("click", function () {
  forgotForm.elements.email.value = loginForm.elements.email.value;
  forgotForm.querySelector(".ok-note").textContent = "";
  showOnly(forgotForm);
  forgotForm.elements.email.focus();
});
forgotForm.querySelector("[data-back]").addEventListener("click", function () { showOnly(loginForm); });

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  submit(loginForm, function (f, save) { return passwordLogin(f.email.value.trim(), f.password.value, safeReturn, save); });
});
signupForm.addEventListener("submit", function (e) {
  e.preventDefault();
  submit(signupForm, function (f, save) {
    return passwordRegister(f.email.value.trim(), f.password.value, { firstName: f.firstName.value.trim(), lastName: f.lastName.value.trim() }, safeReturn, save);
  });
});
verifyForm.addEventListener("submit", function (e) {
  e.preventDefault();
  submit(verifyForm, function (f) { return verifyCode(f.code.value.trim(), safeReturn); });
});
forgotForm.addEventListener("submit", function (e) {
  e.preventDefault();
  var err = errorOf(forgotForm);
  var ok = forgotForm.querySelector(".ok-note");
  err.textContent = ""; ok.textContent = "";
  if (!forgotForm.reportValidity()) return;
  var button = forgotForm.querySelector("button[type=submit]");
  button.disabled = true;
  sendRecoveryEmail(forgotForm.elements.email.value.trim(), LANG)
    .then(function () { ok.textContent = t("login.linkSent"); })
    .catch(function (e2) { err.textContent = (e2 && e2.message) || t("login.err.generic"); })
    .then(function () { button.disabled = false; });
});

social.addEventListener("click", function (e) {
  var b = e.target.closest("[data-provider]");
  if (!b) return;
  socialErr.textContent = "";
  b.disabled = true;
  startSocial(b.dataset.provider, safeReturn).catch(function () { b.disabled = false; socialErr.textContent = socialText(LANG, "error"); });
});

function watchSession() {
  subscribeMember(function (s) { if (!s.loading && s.loggedIn) location.replace(safeReturn); });
  if (!getMemberState().loading && getMemberState().loggedIn) location.replace(safeReturn);
}

finishSocial().then(function (r) {
  if (r.handled && r.ok) { location.replace(r.returnTo || safeReturn); return; }
  if (r.handled) socialErr.textContent = socialText(LANG, "error") + (r.error ? " (" + r.error + ")" : "");
  watchSession();
}).catch(function (e) { socialErr.textContent = socialText(LANG, "error") + " (" + ((e && e.message) || e) + ")"; watchSession(); });