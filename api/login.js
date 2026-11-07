const { checkLogin, makeCookie, clearCookie, isAdmin, body } = require('../lib/auth');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') return res.status(200).json({ admin: isAdmin(req) });
  if (req.method === 'DELETE') { res.setHeader('Set-Cookie', clearCookie()); return res.status(200).json({ ok: true }); }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const b = body(req) || {};
  if (checkLogin(b.user, b.pass)) { res.setHeader('Set-Cookie', makeCookie()); return res.status(200).json({ ok: true }); }
  await new Promise(r => setTimeout(r, 900));
  return res.status(401).json({ error: 'Username or password is not right.' });
};
