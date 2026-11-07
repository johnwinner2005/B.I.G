const crypto = require('crypto');
const { isAdmin, body } = require('../lib/auth');
const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif', 'video/mp4': 'mp4', 'video/webm': 'webm' };
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!isAdmin(req)) return res.status(401).json({ error: 'Sign in again' });
  const b = body(req) || {};
  const m = /^data:([a-z0-9\/+.-]+);base64,(.+)$/s.exec(String(b.dataUrl || ''));
  if (!m || !TYPES[m[1]]) return res.status(400).json({ error: 'Use a JPG, PNG, WebP, MP4 or WebM file.' });
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 3.4 * 1024 * 1024) return res.status(413).json({ error: 'File is too large. Keep it under 3 MB.' });
  const name = 'uploads/' + crypto.createHash('sha1').update(buf).digest('hex') + '.' + TYPES[m[1]];
  try {
    const { put } = await import('@vercel/blob');
    const r = await put(name, buf, { access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: m[1], cacheControlMaxAge: 31536000 });
    return res.status(200).json({ url: r.url });
  } catch (e) {
    const msg = /token/i.test(String(e && e.message)) ? 'Storage is not connected. In Vercel open Storage, create a Blob store, connect it to this project, then redeploy.' : 'Upload failed: ' + (e && e.message || 'unknown error');
    return res.status(500).json({ error: msg });
  }
};
