/* Tiny Tailors — "Suggest an idea" endpoint (Vercel serverless function).
   Turns an idea sent from the app into a GitHub Issue labeled "suggestion" in the repo.

   Setup (one time, in Vercel → Project → Settings → Environment Variables):
     GITHUB_TOKEN   a fine-grained GitHub token with "Issues: Read and write" on this repo only
     SUGGEST_REPO   optional, defaults to OhmaniTrifecta/TinyTailors

   Kids' privacy: no names, emails or accounts are collected. Anything that looks like an
   email address, phone number or link is removed before the issue is created. */

const KINDS = {
  critter: 'Critter', clothes: 'Clothes', accessory: 'Hat or accessory', pet: 'Pet pal',
  scene: 'Scene', challenge: 'Style challenge', other: 'Something else'
};
const BLOCK = /\b(fuck\w*|shit\w*|bitch\w*|porn\w*|sex\w*|nazi\w*)\b/i;
const recent = new Map(); // best-effort rate limit per server instance

function clean(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[email removed]')
    .replace(/https?:\/\/\S+|www\.\S+/gi, '[link removed]')
    .replace(/\+?\d[\d\s().-]{7,}\d/g, '[number removed]')
    .replace(/[<>]/g, '')
    .trim();
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Send ideas with POST.' });

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.SUGGEST_REPO || 'OhmaniTrifecta/TinyTailors';
  if (!token) return res.status(503).json({ error: 'Suggestions are not switched on yet.' });

  let body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  if (body.website) return res.status(200).json({ ok: true }); // hidden honeypot field: bots fill it in

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const times = (recent.get(ip) || []).filter(t => now - t < 10 * 60 * 1000);
  if (times.length >= 5) return res.status(429).json({ error: 'That’s a lot of great ideas! Please wait a little before sending more.' });

  const kind = KINDS[body.kind] ? body.kind : 'other';
  const idea = clean(body.idea).slice(0, 400);
  const details = clean(body.details).slice(0, 600);
  if (idea.length < 3) return res.status(400).json({ error: 'Please tell us your idea first.' });
  if (BLOCK.test(idea + ' ' + details)) return res.status(400).json({ error: 'Please use kind words in your idea.' });
  const look = /^TT1-[A-Za-z0-9_-]{4,600}$/.test(String(body.look || '')) ? body.look : '';
  const site = /^https:\/\/[\w.-]+(\/[\w./-]*)?$/.test(String(body.site || '')) ? body.site.replace(/\/$/, '') : '';

  const title = `[${KINDS[kind]}] ${idea.slice(0, 70)}${idea.length > 70 ? '…' : ''}`;
  const lines = [
    `**Type:** ${KINDS[kind]}`,
    '',
    `**Idea:** ${idea}`,
    details ? `\n**More details:** ${details}` : '',
    look ? `\n**Their current look:** \`${look}\`${site ? ` · [open it in the app](${site}/#look=${look})` : ''}` : '',
    '',
    '---',
    '_Sent from the Tiny Tailors app. To approve, add the **approved** label, then ask Claude to build approved suggestions. To decline, just close this issue._'
  ];

  try {
    const r = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'tiny-tailors-suggestions'
      },
      body: JSON.stringify({ title, body: lines.filter(l => l !== null).join('\n'), labels: ['suggestion', `type: ${kind}`] })
    });
    if (!r.ok) return res.status(502).json({ error: 'Couldn’t send right now. Please try again later.' });
    times.push(now); recent.set(ip, times);
    const issue = await r.json();
    return res.status(200).json({ ok: true, number: issue.number });
  } catch (e) {
    return res.status(502).json({ error: 'Couldn’t send right now. Please try again later.' });
  }
};
