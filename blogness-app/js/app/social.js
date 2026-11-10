// Sign in (email + password, Google, Facebook or Apple) through blogness.org (Wix runs the provider flow; same member account as the site).
// docs: https://dev.wix.com/docs/go-headless/authentication/members/identity-providers/sign-in-with-google-or-facebook-rest
import { wixRequest, mintTokens, setTokens } from "/js/org/client.js";
import { WIX_CLIENT_ID } from "/js/org/config.js";

export var PROVIDERS = { google: "0e6a50f5-b523-4e29-990d-f37fa2ffdd69", facebook: "3ecad13f-52c3-483d-911f-31dbcf2a6d23", apple: "3b58ab6d-5d91-414a-8487-f2f120a9424b" };
var KEY = "blogness-social-flow";

var TEXT = {
  it: { google: "Continua con Google", facebook: "Continua con Facebook", apple: "Continua con Apple", or: "oppure con email", error: "Accesso social non riuscito. Riprova o usa email e password." },
  en: { google: "Continue with Google", facebook: "Continue with Facebook", apple: "Continue with Apple", or: "or with email", error: "Social sign-in didn’t work. Try again or use email and password." },
  es: { google: "Continuar con Google", facebook: "Continuar con Facebook", apple: "Continuar con Apple", or: "o con email", error: "No se pudo entrar con la red social. Inténtalo de nuevo o usa email y contraseña." }
};
export function socialText(lang, key) { return (TEXT[lang] || TEXT.en)[key]; }
var REDIRECT = location.origin + "/index.html";
// Native app (Capacitor shell, org.blogness.app): Google/Facebook refuse to sign in inside an app's web view,
// so the provider page opens in the phone's browser and comes back to the app through auth-return.html.
var REDIRECT_APP = location.origin + "/auth-return.html";
function nativeCap() { var C = window.Capacitor; return C && C.isNativePlatform && C.isNativePlatform() ? C : null; }
function saveFlow(v) { var t = JSON.stringify(v); try { sessionStorage.setItem(KEY, t); } catch (e) {} try { localStorage.setItem(KEY, t); } catch (e) {} }
function takeFlow() { var t = null; try { t = sessionStorage.getItem(KEY) || localStorage.getItem(KEY); sessionStorage.removeItem(KEY); localStorage.removeItem(KEY); } catch (e) {} try { return JSON.parse(t || "null"); } catch (e) { return null; } }
(function listenForAppReturn() {
  var C = nativeCap();
  if (!C || !C.Plugins || !C.Plugins.App) return;
  C.Plugins.App.addListener("appUrlOpen", function (ev) {
    var url = String((ev && ev.url) || "");
    if (url.indexOf("org.blogness.app://auth") !== 0) return;
    try { C.Plugins.Browser && C.Plugins.Browser.close(); } catch (e) {}
    var i = url.search(/[#?]/);
    location.assign("/index.html" + (i >= 0 ? "#" + url.slice(i + 1) : ""));
  });
})();

function b64url(bytes) {
  var s = ""; bytes.forEach(function (b) { s += String.fromCharCode(b); });
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function random(n) { var a = new Uint8Array(n); crypto.getRandomValues(a); return b64url(a); }

// Full-page hand-off to blogness.org, back to /index.html#code=… (no hidden iframe: Safari blocks those).
// opts: { idp } for Google/Facebook/Apple, or { sessionToken } after an email + password sign-in.
export async function startAuthRedirect(opts, returnTo) {
  var verifier = random(48);
  var digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
  var state = random(24);
  var C = nativeCap(), viaBrowser = !!(C && opts.idp && C.Plugins && C.Plugins.Browser);
  var redirect = viaBrowser ? REDIRECT_APP : REDIRECT;
  saveFlow({ verifier: verifier, state: state, returnTo: returnTo || "", redirect: redirect });
  var authRequest = {
    redirectUri: redirect,
    clientId: WIX_CLIENT_ID,
    codeChallenge: b64url(digest),
    codeChallengeMethod: "S256",
    responseMode: "fragment",
    responseType: "code",
    scope: "offline_access",
    state: state
  };
  var auth = { authRequest: authRequest };
  if (opts.idp) authRequest.idp = opts.idp;
  if (opts.sessionToken) { authRequest.sessionToken = opts.sessionToken; auth.prompt = "none"; }
  var res = await wixRequest("/headless/v1/redirect-session", { body: { auth: auth } });
  var url = res && res.redirectSession && res.redirectSession.fullUrl;
  if (!url) throw new Error("no-url");
  if (viaBrowser) { await C.Plugins.Browser.open({ url: url, presentationStyle: "popover" }); return; }
  location.assign(url);
}

export function startSocial(provider, returnTo) {
  return startAuthRedirect({ idp: PROVIDERS[provider] }, returnTo);
}

// On index.html load: finish a provider sign-in that came back with #code=…&state=…
// Returns { handled:false } | { handled:true, ok:true, returnTo } | { handled:true, ok:false, error }
export async function finishSocial() {
  var h = new URLSearchParams(location.hash.slice(1));
  if (!h.get("code") && !h.get("error")) h = new URLSearchParams(location.search);
  if (!h.get("code") && !h.get("error")) return { handled: false };
  var keep = new URLSearchParams(location.search);
  ["code", "state", "error", "error_description"].forEach(function (k) { keep.delete(k); });
  history.replaceState(null, "", location.pathname + (keep.toString() ? "?" + keep.toString() : ""));
  var saved = null;
  saved = takeFlow();
  if (h.get("error")) return { handled: true, ok: false, error: h.get("error_description") || h.get("error") };
  if (!saved || saved.state !== h.get("state")) return { handled: true, ok: false, error: "state" };
  var tokens = await mintTokens({ grantType: "authorization_code", code: h.get("code"), codeVerifier: saved.verifier, redirectUri: saved.redirect || REDIRECT }, "member");
  setTokens(tokens);
  return { handled: true, ok: true, returnTo: saved.returnTo };
}
