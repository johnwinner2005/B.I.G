/* ---------- publishing ---------- */
const RESET_FALLBACK = ':root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}';
const FONTS = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,300..800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap';
function buildDoc() {
  let reset = document.head.querySelector('style')?.textContent || '';
  if (!/safe-area/.test(reset)) reset = RESET_FALLBACK;
  const st = JSON.stringify(S).replace(/</g, '\\u003c');
  const E = '</scr' + 'ipt>';
  return '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>' + reset + '</style></head><body>'
    + '<title>B.I.G Autos</title><meta name="claude:viewport-fit-sides" content="cover">'
    + '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="' + FONTS + '">'
    + '<style id="app-css">' + $('#app-css').textContent + '</style><div id="root"></div>'
    + '<script type="application/json" id="state">' + st + E + '<script id="app">' + $('#app').textContent + E + '</body></html>';
}
async function publishRemote() {
  if (A.busy) return;
  A.busy = true; render(true);
  try {
    await saveLocal(true);
    const out = JSON.parse(JSON.stringify(S)), cache = new Map();
    const walk = async o => {
      for (const k of Object.keys(o)) {
        const v = o[k];
        if (typeof v === 'string' && /^data:(image|video)\//.test(v)) {
          if (!cache.has(v)) cache.set(v, (await apiPost('/api/upload', { dataUrl: v })).url);
          o[k] = cache.get(v);
        } else if (v && typeof v === 'object') await walk(v);
      }
    };
    await walk(out);
    await apiPost('/api/publish', out);
    S = out; savedSnap = snap(); lastLocal = snap();
    try { await IDB.set('state', { at: S.savedAt || Date.now(), state: JSON.parse(JSON.stringify(S)) }); } catch { /* ignore */ }
    A.busy = false; toast('Published. The live site is updated.'); render(true);
  } catch (e) {
    A.busy = false;
    if (e.status === 401) { sess.del('big-admin'); toast('Your session ended. Sign in again, then publish.'); render(); return; }
    toast('Could not publish: ' + (e.message || 'try again')); render(true);
  }
}
async function publish() {
  if (MODE === 'vercel') return publishRemote();
  if (A.busy) return;
  const api = await window.claude?.use?.('artifact');
  if (!api) { toast('Publishing is only available when you open this page from your own Claude account. Your edits are saved on this device.'); return; }
  A.busy = true; render(true);
  try {
    await saveLocal(true);
    await api.publish(buildDoc());
    savedSnap = snap(); A.busy = false; toast('Published');
  } catch (e) {
    A.busy = false;
    const code = e?.code;
    toast(code === 'conflict' ? 'Someone published first. Reloading to their version.' : (code === 'not_granted' || code === 'not_writer') ? 'You need edit access to publish.' : 'Could not publish: ' + (e?.message || 'try again'));
    render(true);
  }
}

/* ---------- admin actions ---------- */
function saveCar() {
  const d = A.draft, errs = {};
  if (!String(d.make).trim()) errs.make = 'Add the make';
  if (!String(d.model).trim()) errs.model = 'Add the model';
  if (!(+d.year >= 1950 && +d.year <= 2100)) errs.year = 'Enter a valid year';
  if (Object.keys(errs).length) { A.errs = errs; render(true); toast('Fill in the required fields'); return; }
  NUMK.forEach(k => { d[k] = d[k] === '' ? '' : +d[k] || 0; });
  d.year = +d.year;
  let slug = slugify(d.slug || [d.year, d.make, d.model, d.trim].join(' ')), n = 2; const root = slug;
  while (S.cars.some(c => c.id !== d.id && isRent(c) === isRent(d) && c.slug === slug)) slug = root + '-' + n++;
  d.slug = slug;
  d.rates = (d.rates || []).map(r => ({ ...r, amount: +r.amount || 0 }));
  const i = S.cars.findIndex(c => c.id === d.id);
  if (i < 0) S.cars.push(d); else S.cars[i] = d;
  A.draft = null; A.errs = {}; toast('Saved. Publish to make it live.'); render(); scrollTo(0, 0);
}
function saveRev() {
  const r = A.rev;
  if (!r.name.trim() || !r.text.trim()) { toast('Add a name and their words'); return; }
  r.rating = +r.rating || 5;
  const i = S.reviews.findIndex(x => x.id === r.id);
  if (i < 0) S.reviews.unshift(r); else S.reviews[i] = r;
  A.rev = null; toast('Client news saved. Publish to make it live.'); render(); scrollTo(0, 0);
}
function sampleStories() {
  const first = S.cars.find(c => !isRent(c)), rent = S.cars.find(c => isRent(c));
  const mk = (name, text, rating, car, photo) => ({ id: uid(), name, text, rating, carId: car?.id || '', photo: photo || '', visible: true, sample: true, date: Date.now() });
  S.reviews.push(
    mk('Sample customer A', 'Sample news: the car was exactly as described and the pickup took less than an hour.', 5, first, 'sample:suv:2a3550:1:Handover'),
    mk('Sample customer B', 'Sample news: one WhatsApp message and they already knew which car I meant.', 5, rent),
    mk('Sample customer C', 'Sample news: clear details, no surprises at the inspection.', 4, first));
  toast('Sample client news added'); render(true);
}

async function handleFiles(input) {
  const files = [...input.files]; input.value = ''; if (!files.length) return;
  toast('Uploading ' + files.length + (files.length > 1 ? ' files…' : ' file…'));
  let ok = 0;
  for (const f of files) {
    try {
      const r = await uploadOne(f); ok++;
      if (input.id === 'up') A.draft.media.push({ type: r.type, src: r.url, alt: '' });
      else if (input.id === 'rv-up') A.rev.photo = r.url;
      else if (input.dataset.upS) cfg()[input.dataset.upS] = r.url;
    } catch (err) { toast(err.message || 'Upload failed'); }
  }
  if (ok) { toast(ok + ' uploaded'); render(true); }
}

/* ---------- events ---------- */
function refreshFav() {
  $$('.heart').forEach(h => { const on = isFav(h.dataset.id); h.classList.toggle('on', on); h.setAttribute('aria-pressed', on); });
  $$('.acts [data-act=fav]').forEach(b => { const on = isFav(b.dataset.id); b.classList.toggle('on', on); b.lastChild.textContent = on ? ' Saved' : ' Save'; });
  const ib = $('.top-r .ibtn'), n = favs().length; if (ib) { ib.querySelector('.dot')?.remove(); if (n) ib.insertAdjacentHTML('beforeend', `<span class="dot">${n}</span>`); }
}
const curCar = () => S.cars.find(c => c.slug === route.slug && isRent(c) === (route.name === 'rental'));
document.addEventListener('click', async e => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  if (t.dataset.act === 'showpw') { const f = $('#lg-p'); if (f) f.type = t.checked ? 'text' : 'password'; return; }
  const a = t.dataset.act, id = t.dataset.id;
  if (a === 'menu') { const m = $('#menu'), open = !m.classList.contains('open'); m.classList.toggle('open', open); m.setAttribute('aria-hidden', !open); document.body.classList.toggle('noscroll', open); return; }
  if (a === 'trip-n') { TRIP.n = +t.dataset.n; updateTrip(); return; }
  if (a === 'trip-step') { TRIP.n = clamp(TRIP.n + +t.dataset.d, 1, 120); updateTrip(); return; }
  if (a === 'fav') { e.preventDefault(); const on = toggleFav(id); refreshFav(); toast(on ? 'Saved to your list' : 'Removed from saved'); return; }
  if (a === 'viewer') { const c = curCar(); if (c) openViewer(c, +t.dataset.i || 0); return; }
  if (a === 'thumb') { const g = $('#gal'); g.scrollTo({ left: g.clientWidth * +t.dataset.i, behavior: 'smooth' }); return; }
  if (a === 'share') { const c = S.cars.find(x => x.id === id); if (c) copyText(carUrl(c)); return; }
  if (a === 'wa') {
    const c = S.cars.find(x => x.id === id); if (!c) return;
    const ex = [];
    const v = k => ($('#' + k)?.value || '').trim();
    if (isRent(c)) {
      const q = tripQuote(c, TRIP.id === c.id ? TRIP.n : 1), n = TRIP.id === c.id ? TRIP.n : 1;
      ex.push('My plan:'); ex.push('Duration: ' + durLabel(n));
      if (q) ex.push('Estimated total: ' + NGN(q.total) + ' (to be confirmed)');
      if (v('trip-date')) { const d = new Date(v('trip-date') + 'T00:00'); ex.push('Pickup date: ' + d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })); }
      if (v('trip-time')) ex.push('Pickup time: ' + v('trip-time'));
      if (v('trip-mode')) ex.push('Driving: ' + v('trip-mode'));
      if (v('trip-loc')) ex.push('Pickup or delivery area: ' + v('trip-loc'));
    }
    t.href = waLink(waMessage(c, ex)); return;
  }
  if (a === 'clear') { const k = t.dataset.kind; FL[k] = k === 'sale' ? { q: '', make: '', min: '', max: '', year: '', cond: '', sort: 'new' } : { q: '', make: '', body: '', max: '', chauffeur: '', sort: 'new' }; render(true); return; }
  if (a === 'vw-close') return closeViewer();
  if (a === 'vw-prev') return vGo(V.i - 1);
  if (a === 'vw-next') return vGo(V.i + 1);
  if (a === 'vw-go') return vGo(+t.dataset.k);
  if (a === 'modal-close') return closeModal();
  if (a === 'confirm-yes') { closeModal(); const f = confirmCb; confirmCb = null; f && f(); return; }
  /* admin */
  if (a === 'discard') { discardLocal(); return; }
  if (a === 'skin') return setSkin(t.dataset.v);
  if (a === 'logout') { sess.del('big-admin'); if (MODE === 'vercel') apiPost('/api/login', undefined, 'DELETE').catch(() => {}); A.draft = null; A.rev = null; location.hash = '#home'; render(); return; }
  if (a === 'tab') { A.tab = t.dataset.t; A.draft = null; A.rev = null; A.q = ''; A.st = ''; render(); scrollTo(0, 0); return; }
  if (a === 'add-car') { A.tab = t.dataset.kind; A.draft = newCar(t.dataset.kind); A.slugTouched = false; A.errs = {}; render(); scrollTo(0, 0); return; }
  if (a === 'edit-car') { const c = S.cars.find(x => x.id === id); A.draft = JSON.parse(JSON.stringify(c)); A.slugTouched = true; A.errs = {}; render(); scrollTo(0, 0); return; }
  if (a === 'cancel-edit') { A.draft = null; A.rev = null; A.errs = {}; render(); return; }
  if (a === 'save-car') return saveCar();
  if (a === 'save-rev') return saveRev();
  if (a === 'del-car') { const c = S.cars.find(x => x.id === id); confirmBox('Delete this listing?', carTitle(c) + ' will be removed from the site. This cannot be undone. To keep a record, use Archived instead.', 'Delete', () => { S.cars = S.cars.filter(x => x.id !== id); toast('Deleted'); render(true); }); return; }
  if (a === 'feat') { const c = S.cars.find(x => x.id === id); c.featured = !c.featured; render(true); return; }
  if (a === 'feat-add') return addFeature();
  if (a === 'feat-del') { A.draft.features.splice(+t.dataset.i, 1); render(true); return; }
  if (a === 'm-up' || a === 'm-down' || a === 'm-first' || a === 'm-del') {
    const m = A.draft.media, i = +t.dataset.i;
    if (a === 'm-del') m.splice(i, 1);
    else if (a === 'm-first') m.unshift(m.splice(i, 1)[0]);
    else { const j = a === 'm-up' ? i - 1 : i + 1; if (j >= 0 && j < m.length) [m[i], m[j]] = [m[j], m[i]]; }
    render(true); return;
  }
  if (a === 'm-url') { const v = ($('#m-url').value || '').trim(); if (!/^https?:\/\//.test(v)) { toast('Paste a full address starting with https://'); return; } A.draft.media.push({ type: /\.(mp4|webm)$/i.test(v) ? 'video' : 'image', src: v, alt: '' }); render(true); return; }
  if (a === 'publish') return publish();
  if (a === 'rm-samples') { confirmBox('Remove all samples?', 'Every listing and client news tagged Sample will be deleted.', 'Remove', () => { S.cars = S.cars.filter(c => !c.sample); S.reviews = S.reviews.filter(r => !r.sample); toast('Samples removed'); render(true); }); return; }
  if (a === 'add-rev') { A.tab = 'reviews'; A.rev = { id: uid(), name: '', text: '', rating: 5, carId: '', photo: '', visible: true, date: Date.now() }; render(); scrollTo(0, 0); return; }
  if (a === 'edit-rev') { A.rev = { ...S.reviews.find(r => r.id === id) }; render(); scrollTo(0, 0); return; }
  if (a === 'del-rev') { confirmBox('Delete this client news?', 'It will be removed from the site.', 'Delete', () => { S.reviews = S.reviews.filter(r => r.id !== id); render(true); }); return; }
  if (a === 'rev-vis') { const r = S.reviews.find(x => x.id === id); r.visible = r.visible === false; render(true); return; }
  if (a === 'rev-photo-del') { A.rev.photo = ''; render(true); return; }
  if (a === 'sample-rev') return sampleStories();
  if (a === 's-clear') { cfg()[t.dataset.k] = ''; render(true); return; }
});
function addFeature() {
  const i = $('#feat-in'); const parts = i.value.split(',').map(s => s.trim()).filter(Boolean);
  if (!parts.length) return; parts.forEach(p => { if (!A.draft.features.includes(p)) A.draft.features.push(p); }); i.value = ''; render(true); setTimeout(() => $('#feat-in')?.focus(), 30);
}
document.addEventListener('keydown', e => { if (e.target.id === 'feat-in' && (e.key === 'Enter' || e.key === ',')) { e.preventDefault(); addFeature(); } });
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.f) { /* public filters */
    const [kind, key] = el.dataset.f.split('.'); FL[kind][key] = el.type === 'checkbox' ? el.checked : el.value;
    $('#list').innerHTML = listHTML(kind); return;
  }
  if (el.id === 'aq') { A.q = el.value; $('#alist').innerHTML = (() => { const tab = A.tab, rent = tab === 'rent'; let items = S.cars.filter(c => isRent(c) === rent); const q = A.q.toLowerCase(); if (q) items = items.filter(c => (carTitle(c) + ' ' + c.code).toLowerCase().includes(q)); if (A.st) items = items.filter(c => c.status === A.st); return items.sort((a, b) => b.created - a.created).map(adminRow).join('') || '<div class="empty"><h3>No matches</h3></div>'; })(); return; }
  if (el.id === 'ast') { A.st = el.value; render(true); return; }
  if (el.dataset.b && A.draft) {
    const k = el.dataset.b; A.draft[k] = el.type === 'checkbox' ? el.checked : el.value;
    if (k === 'slug') A.slugTouched = true;
    else if (['make', 'model', 'year', 'trim'].includes(k) && !A.slugTouched) { A.draft.slug = slugify([A.draft.year, A.draft.make, A.draft.model, A.draft.trim].join(' ')); const s = $('[data-b=slug]'); if (s) s.value = A.draft.slug; }
    if (k === 'status') return; return;
  }
  if (el.dataset.rateAmt) { (A.draft.rates.find(r => r.type === el.dataset.rateAmt) || {}).amount = el.value.replace(/\D/g, ''); return; }
  if (el.dataset.rateNote) { (A.draft.rates.find(r => r.type === el.dataset.rateNote) || {}).note = el.value; return; }
  if (el.dataset.mAlt != null && A.draft) { A.draft.media[+el.dataset.mAlt].alt = el.value; return; }
  if (el.dataset.r && A.rev) { A.rev[el.dataset.r] = el.type === 'checkbox' ? el.checked : el.value; return; }
  if (el.dataset.s) {
    const k = el.dataset.s; cfg()[k] = el.type === 'checkbox' ? el.checked : el.value;
    if (k === 'accent') document.documentElement.style.setProperty('--accent-base', el.value);
    return;
  }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.type === 'file') return handleFiles(el);
  if (el.dataset.actSt) { const c = S.cars.find(x => x.id === el.dataset.actSt); c.status = el.value; toast('Status changed. Publish to make it live.'); render(true); return; }
  if (el.dataset.rateOn) {
    const t = el.dataset.rateOn, rs = A.draft.rates;
    if (el.checked) rs.push({ type: t, amount: 0, note: '' }); else A.draft.rates = rs.filter(r => r.type !== t);
    render(true); return;
  }
  if (el.dataset.b === 'slug' && A.draft) { A.draft.slug = slugify(el.value); el.value = A.draft.slug; }
  if (el.dataset.s === 'whatsapp') render(true);
  if (el.dataset.b === 'status' || el.dataset.b === 'chauffeur' || el.dataset.b === 'selfDrive') { /* state already set on input */ }
});
document.addEventListener('submit', e => {
  if (e.target.id !== 'login') return; e.preventDefault();
  const msg = $('#lg-msg'), u = $('#lg-e').value.trim().toLowerCase(), p = $('#lg-p').value.trim().replace(/[\u2010-\u2015\u2212]/g, '-');
  const btn = e.target.querySelector('button[type=submit],button:not([type])'); if (btn) btn.disabled = true;
  const fail = () => { if (msg) msg.textContent = 'Username or password is not right.'; if (btn) btn.disabled = false; };
  (async () => {
    if (MODE === 'vercel') {
      try { await apiPost('/api/login', { user: u, pass: p }); sess.set('big-admin', '1'); render(); }
      catch (er) { if (msg) msg.textContent = er.status === 401 ? 'Username or password is not right.' : (er.message || 'Could not sign in.'); if (btn) btn.disabled = false; }
      return;
    }
    try {
      const hex = s => Uint8Array.from(s.match(/../g), h => parseInt(h, 16));
      const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(p), 'PBKDF2', false, ['deriveBits']);
      const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: hex(ADMIN.salt), iterations: ADMIN.iter }, key, 256));
      const ok = bits.every((v, i) => v === hex(ADMIN.hash)[i]) && u === ADMIN.user;
      if (ok) { sess.set('big-admin', '1'); render(); } else { await new Promise(r => setTimeout(r, 900)); fail(); }
    } catch { if (msg) msg.textContent = 'Sign-in is not available in this browser.'; if (btn) btn.disabled = false; }
  })();
});
document.addEventListener('scroll', e => {
  if (e.target.id !== 'gal') return;
  const i = Math.round(e.target.scrollLeft / e.target.clientWidth);
  $$('.thumbs button').forEach((b, k) => b.classList.toggle('on', k === i));
}, true);
addEventListener('hashchange', () => { render(); });

/* ---------- init ---------- */
loadRemote().then(loadLocal).then(() => render(), () => render());

