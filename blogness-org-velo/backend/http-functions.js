// blogness.org · backend/http-functions.js
// Private chat between members for the Blogness app (25C).
// Endpoints (live only on the PUBLISHED site):
//   GET  https://www.blogness.org/_functions/chat/threads
//   GET  https://www.blogness.org/_functions/chat/messages?with=<memberId>
//   POST https://www.blogness.org/_functions/chat/send   body: {"to":"<memberId>","body":"text"}
// The app sends the member's own Wix access token (Authorization header). The server asks Wix
// who that member is, so nobody can read or send as someone else. Messages are stored in the
// admin-only collection "appPrivateMessages": only this code can read or write it.
import { response } from 'wix-http-functions';
import wixData from 'wix-data';
import { fetch } from 'wix-fetch';

const APP_ORIGIN = 'https://headless-smpsmnmgijv-blognessllc-140b.wix-site-host.com';
const COL = 'appPrivateMessages';
const OPT = { suppressAuth: true };
const MAX_LEN = 2000;

function reply(status, data) {
  return response({
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': APP_ORIGIN,
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Vary': 'Origin'
    },
    body: JSON.stringify(data)
  });
}

function header(request, name) {
  const h = request.headers || {};
  return h[name] || h[name.toLowerCase()] || h[name.charAt(0).toUpperCase() + name.slice(1)] || '';
}

// Who is calling? Ask Wix with the member's own token.
async function currentMember(request) {
  const auth = header(request, 'authorization');
  if (!auth) return null;
  const res = await fetch('https://www.wixapis.com/members/v1/members/my', { method: 'GET', headers: { Authorization: auth } });
  if (!res.ok) return null;
  const json = await res.json();
  const m = json && json.member;
  if (!m || !m.id) return null;
  const p = m.profile || {};
  return { id: m.id, name: p.nickname || '' };
}

function threadKey(a, b) { return [a, b].sort().join('_'); }

export function options_chat(request) { return reply(204, {}); }

export async function get_chat(request) {
  try {
    const me = await currentMember(request);
    if (!me) return reply(401, { error: 'unauthorized' });
    const action = (request.path || [])[0];

    if (action === 'threads') {
      const res = await wixData.query(COL)
        .eq('fromId', me.id).or(wixData.query(COL).eq('toId', me.id))
        .descending('_createdDate').limit(500).find(OPT);
      const map = {};
      res.items.forEach((m) => {
        const other = m.fromId === me.id ? m.toId : m.fromId;
        if (!map[other]) map[other] = { with: other, last: m.body, at: m._createdDate, mine: m.fromId === me.id, unread: 0 };
        if (m.toId === me.id && !m.readAt) map[other].unread += 1;
      });
      return reply(200, { threads: Object.keys(map).map((k) => map[k]) });
    }

    if (action === 'messages') {
      const other = String((request.query && request.query.with) || '');
      if (!other || other === me.id) return reply(400, { error: 'bad-request' });
      const res = await wixData.query(COL).eq('threadKey', threadKey(me.id, other)).ascending('_createdDate').limit(500).find(OPT);
      const unread = res.items.filter((m) => m.toId === me.id && !m.readAt);
      if (unread.length) {
        const now = new Date();
        await wixData.bulkUpdate(COL, unread.map((m) => Object.assign({}, m, { readAt: now })), OPT);
      }
      return reply(200, { messages: res.items.map((m) => ({ id: m._id, mine: m.fromId === me.id, body: m.body, at: m._createdDate })) });
    }

    return reply(404, { error: 'not-found' });
  } catch (e) {
    console.error('chat GET', e);
    return reply(500, { error: 'server' });
  }
}

export async function post_chat(request) {
  try {
    const me = await currentMember(request);
    if (!me) return reply(401, { error: 'unauthorized' });
    if ((request.path || [])[0] !== 'send') return reply(404, { error: 'not-found' });
    let data = {};
    try { data = JSON.parse(await request.body.text()); } catch (e) { return reply(400, { error: 'bad-json' }); }
    const to = String(data.to || '');
    const body = String(data.body || '').trim();
    if (!to || to === me.id || !body || body.length > MAX_LEN) return reply(400, { error: 'bad-request' });
    const item = await wixData.insert(COL, { threadKey: threadKey(me.id, to), fromId: me.id, toId: to, fromName: me.name, body }, OPT);
    return reply(200, { message: { id: item._id, mine: true, body: item.body, at: item._createdDate } });
  } catch (e) {
    console.error('chat POST', e);
    return reply(500, { error: 'server' });
  }
}
