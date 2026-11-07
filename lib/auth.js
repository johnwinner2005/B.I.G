const crypto = require('crypto');
const SEED = { user: 'bigautos-admin', salt: '2be0d93fbd355d7a7832c02793bc8db6', iter: 120000, hash: 'b2b910fbd7b1a7d85260e32938afa5fd3def677c031227ecd6812d201a8eb8e9' };
const DAY = 24 * 3600 * 1000;
const secret = () => process.env.SESSION_SECRET || process.env.BLOB_READ_WRITE_TOKEN || ('big-autos-' + SEED.hash);
const sign = exp => crypto.createHmac('sha256', secret()).update('big|' + exp).digest('hex');
const same = (a, b) => { const x = crypto.createHash('sha256').update(String(a)).digest(), y = crypto.createHash('sha256').update(String(b)).digest(); return crypto.timingSafeEqual(x, y); };

function checkLogin(user, pass) {
  user = String(user || '').trim().toLowerCase(); pass = String(pass || '').trim().replace(/[\u2010-\u2015\u2212]/g, '-');
  if (process.env.ADMIN_PASSWORD) {
    const u = String(process.env.ADMIN_USER || SEED.user).toLowerCase();
    return same(user, u) & same(pass, process.env.ADMIN_PASSWORD);
  }
  const h = crypto.pbkdf2Sync(pass, Buffer.from(SEED.salt, 'hex'), SEED.iter, 32, 'sha256').toString('hex');
  return same(user, SEED.user) & same(h, SEED.hash);
}
function makeCookie() {
  const exp = Date.now() + 7 * DAY;
  return 'big_session=' + exp + '.' + sign(exp) + '; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=' + 7 * 86400;
}
const clearCookie = () => 'big_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
function isAdmin(req) {
  const m = /(?:^|;\s*)big_session=(\d+)\.([0-9a-f]+)/.exec(req.headers.cookie || '');
  if (!m || +m[1] < Date.now()) return false;
  return same(m[2], sign(m[1]));
}
function body(req) {
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = null; } }
  return b;
}
module.exports = { checkLogin, makeCookie, clearCookie, isAdmin, body };
