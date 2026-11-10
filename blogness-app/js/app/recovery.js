// "Forgot password" for blogness.org members — a data-layer call the shipped members layer does
// not have. Wix emails the member a link to its own password-reset page on blogness.org and, after
// the reset, returns them to the app's login page (an allowed redirect URI of the OAuth app).
// docs: https://dev.wix.com/docs/api-reference/business-management/headless/recovery/send-recovery-email
import { wixRequest } from "/js/org/client.js";
import { WIX_CLIENT_ID } from "/js/org/config.js";

export function sendRecoveryEmail(email, language) {
  return wixRequest("/_api/iam/recovery/v1/send-email", {
    body: {
      email: email,
      language: language,
      redirect: { url: location.origin + "/index.html", clientId: WIX_CLIENT_ID }
    }
  });
}