/* ---------- Lovable Cloud backend (database, photo storage, staff sign-in) ----------
   Public visitors read published cars, client news and settings straight from the Cloud database.
   The signed-in admin saves straight to it, so every change is live on every device with no publish step. */
const CLOUD = { url: '__SUPA_URL__', key: '__SUPA_KEY__', bucket: 'big-autos-media-private' };
const CS = { base: { cars: new Map(), reviews: new Map(), settings: '' }, busy: false, again: false, state: 'idle', err: '', failedSnap: null, fallback: false };
const cAuth = {
  get() { try { return JSON.parse(localStorage.getItem('big-cloud') || 'null'); } catch { return null; } },
  set(o) { try { localStorage.setItem('big-cloud', JSON.stringify(o)); } catch { /* storage unavailable */ } },
  clear() { try { localStorage.removeItem('big-cloud'); } catch { /* ignore */ } },
};
const cUuid = s => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s || '');
const cNewId = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, ch => { const r = Math.random() * 16 | 0; return (ch === 'x' ? r : (r & 3 | 8)).toString(16); }));
function cHeaders(tok, extra) {
  const h = Object.assign({ apikey: CLOUD.key }, extra || {});
  const bearer = tok || (CLOUD.key.startsWith('sb_') ? '' : CLOUD.key);
  if (bearer) h.Authorization = 'Bearer ' + bearer;
  return h;
}
async function cToken() {
  const a = cAuth.get(); if (!a) return null;
  if (a.exp - 60 > Date.now() / 1000) return a.at;
  try {
    const r = await fetch(CLOUD.url + '/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: cHeaders(null, { 'content-type': 'application/json' }), body: JSON.stringify({ refresh_token: a.rt }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.access_token) { if (r.status >= 400 && r.status < 500) cAuth.clear(); return null; }
    cAuth.set({ at: j.access_token, rt: j.refresh_token, exp: Math.floor(Date.now() / 1000) + (j.expires_in || 3600), uid: a.uid, email: a.email });
    return j.access_token;
  } catch { return a.at; }
}
async function cRest(path, o = {}) {
  const tok = o.auth ? await cToken() : null;
  if (o.auth && !tok) { const e = new Error('Your session ended. Sign in again.'); e.status = 401; throw e; }
  const r = await fetch(CLOUD.url + '/rest/v1/' + path, {
    method: o.method || 'GET',
    headers: cHeaders(tok, Object.assign({}, o.body !== undefined ? { 'content-type': 'application/json' } : {}, o.prefer ? { Prefer: o.prefer } : {})),
    body: o.body !== undefined ? JSON.stringify(o.body) : undefined,
  });
  if (!r.ok) {
    let j = {}; try { j = await r.json(); } catch { /* not json */ }
    const e = new Error(j.message || ('Request failed (' + r.status + ')')); e.status = r.status; e.code = j.code; throw e;
  }
  if (r.status === 204) return null;
  try { return await r.json(); } catch { return null; }
}

/* ---------- photo storage ---------- */
const cPub = p => CLOUD.url + '/storage/v1/object/public/' + CLOUD.bucket + '/' + p.split('/').map(encodeURIComponent).join('/');
async function cSign(paths, tok) {
  const u = [...new Set((paths || []).filter(Boolean))], m = new Map();
  if (!u.length) return m;
  try {
    const r = await within(fetch(CLOUD.url + '/storage/v1/object/sign/' + CLOUD.bucket, { method: 'POST', headers: cHeaders(tok, { 'content-type': 'application/json' }), body: JSON.stringify({ expiresIn: 43200, paths: u }) }), 8000);
    const j = r && r.ok ? await r.json() : [];
    (Array.isArray(j) ? j : []).forEach(x => { if (x && x.signedURL && !x.error) m.set(x.path, CLOUD.url + '/storage/v1' + x.signedURL); });
  } catch { /* fall back to public addresses below */ }
  u.forEach(p => { if (!m.has(p)) m.set(p, cPub(p)); });
  return m;
}
const cExt = t => ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif', 'video/mp4': 'mp4', 'video/webm': 'webm' }[t] || 'bin');
async function cUpload(blob, folder = 'cars') {
  const tok = await cToken(); if (!tok) { const e = new Error('Your session ended. Sign in again.'); e.status = 401; throw e; }
  const path = folder + '/' + cNewId() + '.' + cExt(blob.type);
  const r = await fetch(CLOUD.url + '/storage/v1/object/' + CLOUD.bucket + '/' + path, { method: 'POST', headers: cHeaders(tok, { 'content-type': blob.type || 'application/octet-stream', 'cache-control': 'max-age=31536000' }), body: blob });
  if (!r.ok) { let j = {}; try { j = await r.json(); } catch { /* ignore */ } const e = new Error(r.status === 403 || r.status === 401 ? 'Photo upload was refused. Sign in as staff and try again.' : (j.message || j.error || 'Photo upload failed')); e.status = r.status; throw e; }
  return path;
}
/* a listing photo: full size + small thumbnail, both stored; returns addresses ready to show */
async function cUploadPhoto(file) {
  const isV = file.type.startsWith('video/');
  if (isV && file.size > 40 * 1024 * 1024) throw new Error('Videos must be under 40 MB. Trim or compress it first.');
  const full = isV ? file : await shrink(file);
  const [path, thumbPath] = await Promise.all([cUpload(full), isV ? null : shrink(file, 720, .78).then(b => cUpload(b))]);
  const tok = await cToken(); const urls = await cSign([path, thumbPath], tok);
  return { type: isV ? 'video' : 'image', path, thumbPath: thumbPath || undefined, url: urls.get(path), thumb: thumbPath ? urls.get(thumbPath) : undefined };
}
/* small pictures kept inside the record itself (logo, client photo): the private photo bucket only serves listing photos to visitors */
async function cSmallImage(file) {
  if (file.type.startsWith('video/')) throw new Error('Videos can only be added to listings.');
  return { url: await toDataURL(await shrink(file, 900, .72)), type: 'image' };
}

/* ---------- mapping between database rows and the app's own records ---------- */
const cNum = v => (v === '' || v == null || isNaN(+v)) ? null : +v;
function cCarFromRow(r, urls) {
  const media = [];
  (r.media || []).forEach(m => {
    if (!m || m.type === 'thumb') return;
    if (m.path) media.push({ type: m.type || 'image', path: m.path, ...(m.thumb ? { thumbPath: m.thumb } : {}), src: urls.get(m.path) || '', ...(m.thumb ? { thumb: urls.get(m.thumb) || '' } : {}), alt: m.alt || '' });
    else if (m.url) media.push({ type: m.type || 'image', src: m.url, alt: m.alt || '' });
  });
  return { id: r.id, kind: r.kind, code: r.code, slug: r.slug, make: r.make, model: r.model, year: r.year || '', trim: r.trim || '', price: Number(r.price) || 0, priceVisible: r.price_visible !== false, condition: r.condition || '', mileage: r.mileage == null ? '' : Number(r.mileage), transmission: r.transmission || '', fuel: r.fuel || '', engine: r.engine || '', drivetrain: r.drivetrain || '', body: r.body || '', extColor: r.exterior_color || '', intColor: r.interior_color || '', seats: r.seats == null ? '' : r.seats, reg: r.registration || '', duty: r.customs_duty || '', accident: r.accident_history || '', summary: r.summary || '', desc: r.description || '', features: r.features || [], media, rates: (r.rates || []).map(x => ({ type: x.type, amount: x.amount, note: x.note || '' })), chauffeur: !!r.chauffeur, selfDrive: !!r.self_drive, minDuration: r.minimum_duration || '', deposit: r.deposit || '', fuelPolicy: r.fuel_policy || '', mileageLimit: r.mileage_limit || '', pickup: r.pickup || '', terms: r.terms || '', status: r.status || 'draft', featured: !!r.featured, created: Date.parse(r.created_at) || Date.now() };
}
function cMediaOut(list) {
  const out = [];
  (list || []).forEach(m => {
    if (m.path) { out.push({ type: m.type || 'image', path: m.path, ...(m.thumbPath ? { thumb: m.thumbPath } : {}), alt: m.alt || '' }); if (m.thumbPath && m.thumbPath !== m.path) out.push({ type: 'thumb', path: m.thumbPath }); }
    else if (/^https?:/.test(m.src || '')) out.push({ type: m.type || 'image', url: m.src, alt: m.alt || '' });
  });
  return out;
}
function cCarToRow(c) {
  return { id: c.id, kind: c.kind, code: c.code, slug: c.slug, make: c.make || '', model: c.model || '', year: Math.round(+c.year) || 0, trim: c.trim || '', price: +c.price || 0, price_visible: c.priceVisible !== false, condition: c.condition || '', mileage: cNum(c.mileage), transmission: c.transmission || '', fuel: c.fuel || '', engine: c.engine || '', drivetrain: c.drivetrain || '', body: c.body || '', exterior_color: c.extColor || '', interior_color: c.intColor || '', seats: cNum(c.seats) == null ? null : Math.round(+c.seats), registration: c.reg || '', customs_duty: c.duty || '', accident_history: c.accident || '', summary: c.summary || '', description: c.desc || '', features: c.features || [], media: cMediaOut(c.media), status: c.status || 'draft', featured: !!c.featured, rates: (c.rates || []).map(r => ({ type: r.type, amount: +r.amount || 0, ...(r.note ? { note: r.note } : {}) })), chauffeur: !!c.chauffeur, self_drive: !!c.selfDrive, minimum_duration: c.minDuration || '', deposit: c.deposit || '', fuel_policy: c.fuelPolicy || '', mileage_limit: c.mileageLimit || '', pickup: c.pickup || '', terms: c.terms || '' };
}
const cRevFromRow = r => ({ id: r.id, name: r.name, text: r.body, rating: r.rating || 5, carId: r.car_id || '', carNote: r.car_note || '', photo: r.photo_path || '', visible: r.visible !== false, date: Date.parse(r.created_at) || Date.now() });
const cRevToRow = r => ({ id: r.id, name: r.name || '', body: r.text || '', rating: Math.min(5, Math.max(1, +r.rating || 5)), car_id: cUuid(r.carId) ? r.carId : null, car_note: r.carNote || '', photo_path: r.photo || '', visible: r.visible !== false });
const cKey = row => JSON.stringify(row);

/* ---------- reading ---------- */
async function cIsAdmin() {
  const a = cAuth.get(); if (!a || !a.uid) return false;
  try { const rows = await cRest('user_roles?select=role&role=eq.admin&user_id=eq.' + encodeURIComponent(a.uid), { auth: true }); return Array.isArray(rows) && rows.length > 0; } catch { return false; }
}
function cApply(cars, revs, setRow, urls) {
  const ns = { v: 1, settings: Object.assign(defaults().settings, (setRow && setRow.settings) || {}), cars: cars.map(r => cCarFromRow(r, urls)), reviews: revs.map(cRevFromRow) };
  S = ns;
  CS.base.cars = new Map(S.cars.map(c => { const row = cCarToRow(c); return [row.id, cKey(row)]; }));
  CS.base.reviews = new Map(S.reviews.map(r => { const row = cRevToRow(r); return [row.id, cKey(row)]; }));
  CS.base.settings = cKey(S.settings);
  savedSnap = snap(); lastLocal = snap();
}
async function cloudLoad() {
  let admin = false;
  if (cAuth.get()) { admin = await cIsAdmin(); if (admin) sess.set('big-admin', '1'); else sess.del('big-admin'); } else sess.del('big-admin');
  const tok = admin ? await cToken() : null;
  const B = window.__boot && window.__boot.c;
  const q = (k, p) => within((B && !admin) ? B[k] : cRest(p, { auth: admin }).catch(() => null), 8000);
  const [cars, revs, set] = await Promise.all([q('cars', 'cars?select=*&order=created_at.desc'), q('reviews', 'reviews?select=*&order=created_at.desc'), q('settings', 'site_settings?select=settings&id=eq.main')]);
  const ok = Array.isArray(cars) && Array.isArray(revs);
  if (ok && !(cars.length === 0 && (!Array.isArray(set) || set.length === 0))) {
    const paths = []; cars.forEach(c => (c.media || []).forEach(m => { if (m && m.path) paths.push(m.path); if (m && m.thumb) paths.push(m.thumb); }));
    const urls = await cSign(paths, tok);
    cApply(cars, revs, Array.isArray(set) ? set[0] : null, urls);
    CS.fallback = false; return;
  }
  /* Cloud not set up yet (or unreachable): show the last published copy so the site is never empty */
  CS.fallback = true;
  try {
    const st = await within(fetch('/data/state.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null), 6000);
    if (st && Array.isArray(st.cars)) { S = st; S.settings = Object.assign(defaults().settings, S.settings || {}); S.reviews = S.reviews || []; savedSnap = snap(); lastLocal = snap(); }
  } catch { /* keep the built-in copy */ }
}

/* ---------- sign in ---------- */
async function cLogin(email, pass) {
  const r = await fetch(CLOUD.url + '/auth/v1/token?grant_type=password', { method: 'POST', headers: cHeaders(null, { 'content-type': 'application/json' }), body: JSON.stringify({ email, password: pass }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) { const e = new Error(r.status === 400 ? 'Email or password is not right.' : (j.error_description || j.msg || 'Could not sign in.')); e.status = r.status; throw e; }
  cAuth.set({ at: j.access_token, rt: j.refresh_token, exp: Math.floor(Date.now() / 1000) + (j.expires_in || 3600), uid: j.user && j.user.id, email: (j.user && j.user.email) || email });
  if (!(await cIsAdmin())) { const uid = cAuth.get() && cAuth.get().uid; cAuth.clear(); const e = new Error('This account is signed in, but it has not been given staff access yet.'); e.code = 'NOT_ADMIN'; e.uid = uid; throw e; }
  sess.set('big-admin', '1');
}
async function cSignup(email, pass) {
  const r = await fetch(CLOUD.url + '/auth/v1/signup', { method: 'POST', headers: cHeaders(null, { 'content-type': 'application/json' }), body: JSON.stringify({ email, password: pass }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.msg || j.error_description || j.message || 'Could not create the account.');
}

/* ---------- saving (live for everyone straight away) ---------- */
async function cEnsureMedia(m) {
  if (m.path || /^https?:/.test(m.src || '')) return;
  if (!m.src) return;
  const blobOf = async u => { const r = await fetch(u); if (!r.ok) throw new Error('Could not read a photo to copy it into Cloud.'); return r.blob(); };
  const full = await blobOf(m.src); const isV = (full.type || '').startsWith('video/');
  m.path = await cUpload(full);
  if (!isV) {
    const tb = m.thumb && m.thumb !== m.src ? await blobOf(m.thumb) : await shrink(full, 720, .78);
    m.thumbPath = await cUpload(tb);
  }
  const urls = await cSign([m.path, m.thumbPath], await cToken());
  m.src = urls.get(m.path); if (m.thumbPath) m.thumb = urls.get(m.thumbPath); else delete m.thumb;
}
function cChip() {
  const el = document.getElementById('cchip'); if (!el) return;
  const bad = CS.state === 'error', busy = CS.busy || (dirty() && !bad);
  if (!bad && !busy) { el.style.display = 'none'; return; }
  el.style.display = '';
  el.innerHTML = bad ? `<div><span>Could not save: ${esc(CS.err)}</span><button class="btn sm" data-act="publish">Try again</button></div>` : `<div><span>Saving to the live site…</span></div>`;
}
async function cSync(force) {
  if (CS.busy) { CS.again = true; return; }
  CS.busy = true; CS.state = 'saving'; cChip();
  try {
    S.cars.forEach(c => { if (!cUuid(c.id)) { const old = c.id; c.id = cNewId(); S.reviews.forEach(r => { if (r.carId === old) r.carId = c.id; }); } });
    S.reviews.forEach(r => { if (!cUuid(r.id)) r.id = cNewId(); });
    const copying = S.cars.some(c => c.media.some(m => !m.path && m.src && !/^https?:/.test(m.src)));
    if (copying) toast('Copying your photos into Cloud. This can take a minute.');
    for (const c of S.cars) for (const m of c.media) await cEnsureMedia(m);
    const startSnap = snap();
    const carRows = S.cars.map(cCarToRow), revRows = S.reviews.map(cRevToRow), setKey = cKey(S.settings);
    const gone = [...CS.base.cars.keys()].filter(id => !carRows.some(r => r.id === id));
    const goneRev = [...CS.base.reviews.keys()].filter(id => !revRows.some(r => r.id === id));
    const chCars = carRows.filter(r => force || CS.base.cars.get(r.id) !== cKey(r));
    const chRevs = revRows.filter(r => force || CS.base.reviews.get(r.id) !== cKey(r));
    const setChanged = force || setKey !== CS.base.settings;
    const now = new Date().toISOString(), up = (t, rows) => cRest(t + '?on_conflict=id', { method: 'POST', body: rows.map(r => Object.assign({ updated_at: now }, r)), prefer: 'resolution=merge-duplicates,return=minimal', auth: true });
    if (goneRev.length) await cRest('reviews?id=in.(' + goneRev.join(',') + ')', { method: 'DELETE', auth: true });
    if (gone.length) await cRest('cars?id=in.(' + gone.join(',') + ')', { method: 'DELETE', auth: true });
    for (let i = 0; i < chCars.length; i += 20) await up('cars', chCars.slice(i, i + 20));
    for (let i = 0; i < chRevs.length; i += 20) await up('reviews', chRevs.slice(i, i + 20));
    if (setChanged) await cRest('site_settings?on_conflict=id', { method: 'POST', body: [{ id: 'main', settings: S.settings, updated_at: now }], prefer: 'resolution=merge-duplicates,return=minimal', auth: true });
    CS.base.cars = new Map(carRows.map(r => [r.id, cKey(r)])); CS.base.reviews = new Map(revRows.map(r => [r.id, cKey(r)])); CS.base.settings = setKey;
    const wasFallback = CS.fallback;
    savedSnap = startSnap; CS.state = 'saved'; CS.err = ''; CS.failedSnap = null; CS.fallback = false;
    if (wasFallback && !A.draft && !A.rev) render(true);
    if (chCars.length || chRevs.length || gone.length || goneRev.length || setChanged) toast('Saved. Live on every device.');
  } catch (e) {
    CS.state = 'error'; CS.failedSnap = snap();
    if (e && e.status === 401) { sess.del('big-admin'); cAuth.clear(); CS.err = 'Your session ended. Sign in again.'; render(); }
    else if (e && (e.status === 409 || e.code === '23505')) CS.err = 'Another listing already uses that code or web address. Change it and try again.';
    else if (e && (e.status === 403 || e.code === '42501')) CS.err = 'This account is not allowed to change the site. It needs the admin role.';
    else CS.err = (e && e.message) || 'Check your connection and try again.';
  }
  CS.busy = false; cChip();
  if (CS.again) { CS.again = false; if (dirty()) cSync(); }
}
setInterval(() => { if (MODE === 'cloud' && isAdmin() && !CS.busy && dirty() && snap() !== CS.failedSnap) cSync(); }, 1000);
