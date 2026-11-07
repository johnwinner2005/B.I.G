import os, re, shutil, zipfile, json
auth = open('p0-auth.js').read()
m = re.search(r"user: '([^']+)', salt: '([0-9a-f]+)', iter: (\d+), hash: '([0-9a-f]+)'", auth)
USER, SALT, ITER, HASH = m.groups()
root = 'vercel-pkg/big-autos-site'
shutil.rmtree('vercel-pkg', ignore_errors=True)
for d in ['public', 'api', 'lib']: os.makedirs(f'{root}/{d}')
os.system('python3 build.py /tmp/_v.html vercel')
body = open('/tmp/_v.html').read()
reset = ':root{color-scheme:dark;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;background:#07080B;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}'
page = ('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<meta name="description" content="B.I.G Autos. Cars ready for sale and exclusive car rentals in Lagos, Nigeria.">'
        '<meta name="theme-color" content="#CE3837"><style>' + reset + '</style></head><body>' + body + '</body></html>')
open(f'{root}/public/index.html', 'w').write(page)

open(f'{root}/lib/auth.js', 'w').write(f"""const crypto = require('crypto');
const SEED = {{ user: '{USER}', salt: '{SALT}', iter: {ITER}, hash: '{HASH}' }};
const DAY = 24 * 3600 * 1000;
const secret = () => process.env.SESSION_SECRET || process.env.BLOB_READ_WRITE_TOKEN || ('big-autos-' + SEED.hash);
const sign = exp => crypto.createHmac('sha256', secret()).update('big|' + exp).digest('hex');
const same = (a, b) => {{ const x = crypto.createHash('sha256').update(String(a)).digest(), y = crypto.createHash('sha256').update(String(b)).digest(); return crypto.timingSafeEqual(x, y); }};

function checkLogin(user, pass) {{
  user = String(user || '').trim().toLowerCase(); pass = String(pass || '').trim().replace(/[\\u2010-\\u2015\\u2212]/g, '-');
  if (process.env.ADMIN_PASSWORD) {{
    const u = String(process.env.ADMIN_USER || SEED.user).toLowerCase();
    return same(user, u) & same(pass, process.env.ADMIN_PASSWORD);
  }}
  const h = crypto.pbkdf2Sync(pass, Buffer.from(SEED.salt, 'hex'), SEED.iter, 32, 'sha256').toString('hex');
  return same(user, SEED.user) & same(h, SEED.hash);
}}
function makeCookie() {{
  const exp = Date.now() + 7 * DAY;
  return 'big_session=' + exp + '.' + sign(exp) + '; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=' + 7 * 86400;
}}
const clearCookie = () => 'big_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
function isAdmin(req) {{
  const m = /(?:^|;\\s*)big_session=(\\d+)\\.([0-9a-f]+)/.exec(req.headers.cookie || '');
  if (!m || +m[1] < Date.now()) return false;
  return same(m[2], sign(m[1]));
}}
function body(req) {{
  let b = req.body;
  if (typeof b === 'string') {{ try {{ b = JSON.parse(b); }} catch {{ b = null; }} }}
  return b;
}}
module.exports = {{ checkLogin, makeCookie, clearCookie, isAdmin, body }};
""")

open(f'{root}/api/login.js', 'w').write("""const { checkLogin, makeCookie, clearCookie, isAdmin, body } = require('../lib/auth');
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
""")

open(f'{root}/api/state.js', 'w').write("""module.exports = async (req, res) => {
  try {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: 'site/state.json' });
    const b = blobs.find(x => x.pathname === 'site/state.json');
    if (!b) return res.status(404).json({ error: 'Nothing published yet' });
    const r = await fetch(b.url + '?v=' + new Date(b.uploadedAt).getTime());
    if (!r.ok) return res.status(502).json({ error: 'Could not read the published data' });
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=60');
    return res.status(200).send(await r.text());
  } catch (e) {
    return res.status(404).json({ error: 'Storage is not connected yet' });
  }
};
""")

open(f'{root}/api/publish.js', 'w').write("""const { isAdmin, body } = require('../lib/auth');
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
""")

open(f'{root}/api/upload.js', 'w').write("""const crypto = require('crypto');
const { isAdmin, body } = require('../lib/auth');
const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif', 'video/mp4': 'mp4', 'video/webm': 'webm' };
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!isAdmin(req)) return res.status(401).json({ error: 'Sign in again' });
  const b = body(req) || {};
  const m = /^data:([a-z0-9\\/+.-]+);base64,(.+)$/s.exec(String(b.dataUrl || ''));
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
""")

json.dump({"name": "big-autos-site", "version": "1.0.0", "private": True, "description": "B.I.G Autos website with admin dashboard", "dependencies": {"@vercel/blob": ">=0.27.0"}, "engines": {"node": ">=18"}}, open(f'{root}/package.json', 'w'), indent=2)
json.dump({"outputDirectory": "public", "functions": {"api/*.js": {"maxDuration": 30}}, "headers": [{"source": "/(.*)", "headers": [{"key": "X-Content-Type-Options", "value": "nosniff"}, {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"}]}]}, open(f'{root}/vercel.json', 'w'), indent=2)
open(f'{root}/.gitignore', 'w').write('node_modules\n.vercel\n.env*\n')
open(f'{root}/README.md', 'w').write(f"""# B.I.G Autos site

Public site at `/`, admin at `/#admin` (or the "Staff" link in the footer).

## Deploy (about 5 minutes)

1. Unzip this folder. Go to vercel.com, sign in, then **Add New → Project**.
   - Easiest: put the folder in a GitHub repo and import it.
   - Or install the CLI and run `npx vercel --prod` inside this folder.
2. Leave the framework as **Other**. No build command is needed.
3. After the first deploy, open the project, go to **Storage → Create Database → Blob**, name it anything, and **Connect** it to this project (all environments). This adds `BLOB_READ_WRITE_TOKEN` for you.
4. **Redeploy** (Deployments → the latest one → Redeploy) so the site picks up the storage.
5. Open `your-project.vercel.app/#admin`, sign in, change anything, tap **Publish changes**. Visitors see it within about a minute.

## Login

Username `{USER}`. The password is the one sent to you in chat. Only a hash is stored in this code.

To change it, add these in Vercel → Settings → Environment Variables, then redeploy:
- `ADMIN_USER` (optional, default `{USER}`)
- `ADMIN_PASSWORD` (your new password; it overrides the built-in one)
- `SESSION_SECRET` (optional, any long random text)

## Notes
- Photos you upload are stored in Blob and the site keeps only their links. Keep each photo or video under 3 MB (photos are shrunk automatically).
- Your edits save on your device first. They go live for everyone only when you press **Publish changes**.
- To use your own domain later: Project → Settings → Domains.
""")
# zip
zp = 'big-autos-vercel.zip'
if os.path.exists(zp): os.remove(zp)
with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
    for dp, _, fs in os.walk('vercel-pkg'):
        for f in fs:
            p = os.path.join(dp, f); z.write(p, os.path.relpath(p, 'vercel-pkg'))
print('zip', os.path.getsize(zp))
