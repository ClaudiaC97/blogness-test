// Email + password sign-in / sign-up against blogness.org (same accounts as the site's MyID page).
// The IAM calls are the installed module's (js/org/auth.js); only the last step differs: the session
// token is turned into member tokens through a full-page redirect (startAuthRedirect) instead of a
// hidden iframe, which Safari / iOS blocks.
// docs: https://dev.wix.com/docs/api-reference/business-management/headless/authentication/login-v-2
import { wixRequest, WixApiError } from "/js/org/client.js";
import { authOutcome, toLoginResult, failure, loginErrorCode, registerErrorCode, NO_SESSION_ERROR } from "/js/org/auth-core.js";
import { startAuthRedirect } from "/js/app/social.js";

var pendingStateToken = null;
function message(e) { return e instanceof Error ? e.message : String(e); }

async function finish(raw, returnTo, beforeRedirect) {
  var outcome = authOutcome(raw);
  if (outcome.state === "SUCCESS") {
    pendingStateToken = null;
    if (!outcome.sessionToken) return failure(NO_SESSION_ERROR);
    if (beforeRedirect) { try { await beforeRedirect(); } catch (e) {} }
    await startAuthRedirect({ sessionToken: outcome.sessionToken }, returnTo);
    return { state: "REDIRECTING" };
  }
  if (outcome.stateToken) pendingStateToken = outcome.stateToken;
  return toLoginResult(outcome);
}

export async function passwordLogin(email, password, returnTo, beforeRedirect) {
  var raw;
  try { raw = await wixRequest("/_api/iam/authentication/v2/login", { body: { loginId: { email: email }, password: password } }); }
  catch (e) { return failure(message(e), e instanceof WixApiError ? loginErrorCode(e.code) : undefined); }
  return finish(raw, returnTo, beforeRedirect);
}

export async function passwordRegister(email, password, profile, returnTo, beforeRedirect) {
  var raw;
  try { raw = await wixRequest("/_api/iam/authentication/v2/register", { body: { loginId: { email: email }, password: password, profile: profile } }); }
  catch (e) { return failure(message(e), e instanceof WixApiError ? registerErrorCode(e.code, e.details) : undefined); }
  return finish(raw, returnTo, beforeRedirect);
}

export async function verifyCode(code, returnTo) {
  if (!pendingStateToken) return failure("No sign-in is waiting for a verification code.");
  var raw;
  try { raw = await wixRequest("/_api/iam/verification/v1/auth/verify", { body: { code: code, stateToken: pendingStateToken } }); }
  catch (e) { return failure(message(e)); }
  return finish(raw, returnTo);
}