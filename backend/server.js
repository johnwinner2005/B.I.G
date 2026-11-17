'use strict';
/* B.I.G Autos server. No packages needed: Node 18+ only.
   Serves the site, keeps the admin data in DATA_DIR/state.json and uploaded photos in DATA_DIR/uploads. */
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto'), zlib = require('zlib');

const PORT = +process.env.PORT || 3000;
const DATA = path.resolve(process.env.DATA_DIR || path.join(__dirname, 'data'));
const PUB = [path.join(__dirname, 'public'), path.join(__dirname, '..', 'public')].find(d => fs.existsSync(path.join(d, 'index.html'))) || path.join(__dirname, 'public');
const SEED = { user: 'bigautos-admin', salt: '2be0d93fbd355d7a7832c02793bc8db6', iter: 120000, hash: 'b2b910fbd7b1a7d85260e32938afa5fd3def677c031227ecd6812d201a8eb8e9' };
fs.mkdirSync(path.join(DATA, 'uploads'), { recursive: true });
fs.mkdirSync(path.join(DATA, 'backups'), { recursive: true });

const secretFile = path.join(DATA, 'session-secret.txt');
let SECRET = process.env.SESSION_SECRET || '';
if (!SECRET) { try { SECRET = fs.readFileSync(secretFile, 'utf8').trim(); } catch { SECRET = crypto.randomBytes(32).toString('hex'); fs.writeFileSync(secretFile, SECRET, { mode: 0o600 }); } }

const sha = s => crypto.createHash('sha256').update(String(s)).digest();
const same = (a, b) => crypto.timingSafeEqual(sha(a), sha(b));
const sign = exp => crypto.createHmac('sha256', SECRET).update('big|' + exp).digest('hex');
const norm = p => String(p || '').trim().replace(/[‐-―−]/g, '-');

function checkLogin(user, pass) {
  user = String(user || '').trim().toLowerCase(); pass = norm(pass);
  if (process.env.ADMIN_PASSWORD) return same(user, String(process.env.ADMIN_USER || SEED.user).toLowerCase()) && same(pass, process.env.ADMIN_PASSWORD);
  const h = crypto.pbkdf2Sync(pass, Buffer.from(SEED.salt, 'hex'), SEED.iter, 32, 'sha256').toString('hex');
  return same(user, SEED.user) && same(h, SEED.hash);
}
const isHttps = req => req.socket.encrypted || /https/i.test(req.headers['x-forwarded-proto'] || '');
const cookieFor = (req, exp) => 'big_session=' + exp + '.' + sign(exp) + '; Path=/; HttpOnly; SameSite=Strict; Max-Age=' + (exp ? 7 * 86400 : 0) + (isHttps(req) ? '; Secure' : '');
function isAdmin(req) {
  const m = /(?:^|;\s*)big_session=(\d+)\.([0-9a-f]+)/.exec(req.headers.cookie || '');
  return !!m && +m[1] > Date.now() && same(m[2], sign(m[1]));
}

/* slow down password guessing: 8 wrong tries from one address locks it for 15 minutes */
const fails = new Map();
const ipOf = req => (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
const locked = ip => { const f = fails.get(ip); return f && f.n >= 8 && Date.now() - f.t < 15 * 60 * 1000; };

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif', 'video/mp4': 'mp4', 'video/webm': 'webm' };
const MIME = { html: 'text/html; charset=utf-8', json: 'application/json; charset=utf-8', jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif', mp4: 'video/mp4', webm: 'video/webm', ico: 'image/x-icon', txt: 'text/plain; charset=utf-8', svg: 'image/svg+xml' };

const send = (res, code, obj, extra) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra }); res.end(JSON.stringify(obj)); };
function readBody(req, limit) {
  return new Promise((ok, no) => {
    let n = 0; const parts = [];
    req.on('data', c => { n += c.length; if (n > limit) { no(Object.assign(new Error('Too large'), { status: 413 })); req.destroy(); } else parts.push(c); });
    req.on('end', () => { try { ok(JSON.parse(Buffer.concat(parts).toString('utf8') || '{}')); } catch { no(Object.assign(new Error('Bad request'), { status: 400 })); } });
    req.on('error', no);
  });
}
const stateFile = path.join(DATA, 'state.json');
function writeState(text) {
  fs.mkdirSync(path.join(DATA, 'backups'), { recursive: true });
  const tmp = stateFile + '.tmp';
  fs.writeFileSync(tmp, text); fs.renameSync(tmp, stateFile);
  fs.writeFileSync(path.join(DATA, 'backups', new Date().toISOString().replace(/[:.]/g, '-') + '.json'), text);
  const old = fs.readdirSync(path.join(DATA, 'backups')).sort(); while (old.length > 30) fs.unlinkSync(path.join(DATA, 'backups', old.shift()));
}

async function api(req, res, name) {
  if (name === 'health') return send(res, 200, { ok: true, server: true });
  if (name === 'state' && req.method === 'GET') {
    if (!fs.existsSync(stateFile)) return send(res, 404, { error: 'Nothing published yet' });
    return send(res, 200, JSON.parse(fs.readFileSync(stateFile, 'utf8')), { 'Cache-Control': 'no-cache' });
  }
  if (name === 'login') {
    if (req.method === 'GET') return send(res, 200, { admin: isAdmin(req) });
    if (req.method === 'DELETE') return send(res, 200, { ok: true }, { 'Set-Cookie': cookieFor(req, 0) });
    if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
    const ip = ipOf(req);
    if (locked(ip)) return send(res, 429, { error: 'Too many wrong tries. Wait 15 minutes and try again.' });
    const b = await readBody(req, 10_000);
    if (checkLogin(b.user, b.pass)) { fails.delete(ip); return send(res, 200, { ok: true }, { 'Set-Cookie': cookieFor(req, Date.now() + 7 * 864e5) }); }
    const f = fails.get(ip) || { n: 0, t: 0 }; f.n++; f.t = Date.now(); fails.set(ip, f);
    await new Promise(r => setTimeout(r, 900));
    return send(res, 401, { error: 'Username or password is not right.' });
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  if (!isAdmin(req)) return send(res, 401, { error: 'Sign in again' });
  if (name === 'publish') {
    const s = await readBody(req, 8 * 1024 * 1024);
    if (!s || !Array.isArray(s.cars) || typeof s.settings !== 'object') return send(res, 400, { error: 'That data does not look right' });
    writeState(JSON.stringify(s));
    return send(res, 200, { ok: true });
  }
  if (name === 'upload') {
    const b = await readBody(req, 20 * 1024 * 1024);
    const m = /^data:([a-z0-9\/+.-]+);base64,(.+)$/s.exec(String(b.dataUrl || ''));
    if (!m || !TYPES[m[1]]) return send(res, 400, { error: 'Use a JPG, PNG, WebP, MP4 or WebM file.' });
    const buf = Buffer.from(m[2], 'base64');
    if (buf.length > 14 * 1024 * 1024) return send(res, 413, { error: 'File is too large.' });
    const file = crypto.createHash('sha1').update(buf).digest('hex') + '.' + TYPES[m[1]];
    fs.mkdirSync(path.join(DATA, 'uploads'), { recursive: true });
    const dest = path.join(DATA, 'uploads', file);
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, buf);
    return send(res, 200, { url: '/uploads/' + file });
  }
  return send(res, 404, { error: 'Not found' });
}

const cache = {};
function serveFile(req, res, file, immutable) {
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    const ext = path.extname(file).slice(1).toLowerCase();
    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache' };
    const gz = ext === 'html' && /gzip/.test(req.headers['accept-encoding'] || '');
    if (gz) {
      const k = file + st.mtimeMs; if (!cache[k]) cache[k] = zlib.gzipSync(fs.readFileSync(file));
      res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' }); return res.end(cache[k]);
    }
    res.writeHead(200, { ...headers, 'Content-Length': st.size });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
}

http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://x'); const p = decodeURIComponent(u.pathname);
    if (p.startsWith('/api/')) return await api(req, res, p.slice(5));
    if (p.startsWith('/uploads/')) { const f = path.join(DATA, 'uploads', path.basename(p)); return serveFile(req, res, f, true); }
    if (p === '/data/state.json') return serveFile(req, res, stateFile, false);
    const f = path.normalize(path.join(PUB, p === '/' ? 'index.html' : p));
    if (!f.startsWith(PUB)) { res.writeHead(403); return res.end(); }
    return serveFile(req, res, f, p.startsWith('/img/'));
  } catch (e) {
    return send(res, e.status || 500, { error: e.status ? e.message : 'Something went wrong' });
  }
}).listen(PORT, () => console.log('B.I.G Autos running on port ' + PORT + ', data in ' + DATA));
