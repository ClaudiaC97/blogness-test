// Private chat between any two members (25C), through blogness.org's server code
// (velo/backend/http-functions.js). The member's own token proves who is calling.
import { accessToken } from "/js/org/client.js";

var BASE = "https://www.blogness.org/_functions/chat/";

async function call(path, opts) {
  opts = opts || {};
  var res = await fetch(BASE + path, {
    method: opts.method || "GET",
    headers: { Authorization: await accessToken(), "Content-Type": "application/json" },
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  if (!res.ok) { var e = new Error("chat " + res.status); e.status = res.status; throw e; }
  return res.json();
}

export function listThreads() { return call("threads").then(function (j) { return (j && j.threads) || []; }); }
export function listMessages(withId) { return call("messages?with=" + encodeURIComponent(withId)).then(function (j) { return (j && j.messages) || []; }); }
export function sendMessage(to, body) { return call("send", { method: "POST", body: { to: to, body: body } }).then(function (j) { return j && j.message; }); }
