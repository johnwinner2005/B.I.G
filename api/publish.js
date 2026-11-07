const { isAdmin, body } = require('../lib/auth');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!isAdmin(req)) return res.status(401).json({ error: 'Sign in again' });
  const s = body(req);
  if (!s || !Array.isArray(s.cars) || typeof s.settings !== 'object') return res.status(400).json({ error: 'That data does not look right' });
  try {
    const { put } = await import('@vercel/blob');
    await put('site/state.json', JSON.stringify(s), { access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json', cacheControlMaxAge: 60 });
    return res.status(200).json({ ok: true });
  } catch (e) {
    const msg = /token/i.test(String(e && e.message)) ? 'Storage is not connected. In Vercel open Storage, create a Blob store, connect it to this project, then redeploy.' : 'Could not save: ' + (e && e.message || 'unknown error');
    return res.status(500).json({ error: msg });
  }
};
