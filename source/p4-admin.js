/* ---------- admin ---------- */
const A = { tab: 'overview', q: '', st: '', draft: null, slugTouched: false, rev: null, busy: false, errs: {} };
const ST_SALE = [['draft', 'Draft (hidden)'], ['published', 'Published'], ['reserved', 'Reserved'], ['sold', 'Sold'], ['archived', 'Archived']];
const ST_RENT = [['draft', 'Draft (hidden)'], ['published', 'Published'], ['temp', 'Temporarily unavailable'], ['unavailable', 'Unavailable'], ['archived', 'Archived']];
const NUMK = ['year', 'price', 'mileage', 'seats'];
const stOpts = c => isRent(c) ? ST_RENT : ST_SALE;
function nextCode(kind) {
  const p = kind === 'rent' ? 'BIG-R-' : 'BIG-S-';
  const n = Math.max(0, ...S.cars.map(c => c.code?.startsWith(p) ? parseInt(c.code.slice(p.length), 10) || 0 : 0));
  return p + String(n + 1).padStart(4, '0');
}
function newCar(kind) {
  return { id: uid(), kind, code: nextCode(kind), slug: '', make: '', model: '', year: '', trim: '', price: '', priceVisible: true, condition: '', mileage: '', transmission: '', fuel: '', engine: '', drivetrain: '', body: '', extColor: '', intColor: '', seats: '', reg: '', duty: '', accident: '', summary: '', desc: '', features: [], media: [], rates: [], chauffeur: false, selfDrive: false, minDuration: '', deposit: '', fuelPolicy: '', mileageLimit: '', pickup: '', terms: '', status: 'published', featured: true, sample: false, created: Date.now() };
}
const NAVS = [['overview', 'Overview', IC.grid], ['sale', 'Cars for sale', IC.car], ['rent', 'Rentals', IC.key], ['reviews', 'Client news', IC.star], ['site', 'Site', IC.cog]];

function loginHTML() {
  return `<div class="login"><form class="box frm" id="login" autocomplete="off"><a class="brand" href="#home" style="color:#fff">${logo()}</a><h1>Staff sign in</h1>
  <label>Username<input class="field" id="lg-e" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" value=""></label><label>Password<input class="field" id="lg-p" type="password" autocomplete="current-password" autocapitalize="none" autocorrect="off" spellcheck="false"></label><label class="showpw"><input type="checkbox" data-act="showpw"> Show password</label>
  <button class="btn block" type="submit">Sign in</button>
  <p class="login-note" id="lg-msg" role="alert"></p><a href="#home" style="text-align:center;color:var(--hero-mute)">Back to site</a></form></div>`;
}
function adminHTML() {
  if (!isAdmin()) return loginHTML();
  const editing = A.draft || A.rev;
  const titles = { overview: 'Overview', sale: 'Cars for sale', rent: 'Rentals', reviews: 'Client news', site: 'Site settings' };
  const title = A.draft ? (S.cars.some(c => c.id === A.draft.id) ? 'Edit ' + (isRent(A.draft) ? 'rental' : 'car') : 'Add ' + (isRent(A.draft) ? 'rental' : 'car')) : A.rev ? 'Story' : titles[A.tab];
  let act = '';
  if (A.draft || A.rev) act = `<button class="btn soft sm" data-act="cancel-edit">Cancel</button><button class="btn sm" data-act="${A.draft ? 'save-car' : 'save-rev'}">Save</button>`;
  else if (A.tab === 'sale' || A.tab === 'rent') act = `<button class="btn sm" data-act="add-car" data-kind="${A.tab}">+ Add ${A.tab === 'rent' ? 'rental' : 'car'}</button>`;
  else if (A.tab === 'reviews') act = `<button class="btn sm" data-act="add-rev">+ Add client news</button>`;
  const body = A.draft ? editorHTML() : A.rev ? reviewEditorHTML() : A.tab === 'overview' ? overviewHTML() : (A.tab === 'sale' || A.tab === 'rent') ? adminList(A.tab) : A.tab === 'reviews' ? adminReviews() : siteHTML();
  const side = NAVS.map(n => `<button class="${A.tab === n[0] ? 'on' : ''}" data-act="tab" data-t="${n[0]}">${n[2]}<span>${n[1]}</span></button>`).join('');
  return `<div class="ad"><aside class="ad-side"><a class="brand" href="#home">${logo()}</a>${side}<span class="sp"></span><a href="#home" class="btn ghost sm" style="color:#fff">${IC.eye} View site</a><button data-act="logout">${IC.out}<span>Sign out</span></button></aside>
  <div><div class="ad-bar"><div class="in"><h1>${esc(title)}</h1><div style="display:flex;gap:8px;align-items:center">${act}${editing ? '' : `<a class="ibtn" href="#home" aria-label="View site">${IC.eye}</a><button class="ibtn" data-act="logout" aria-label="Sign out" style="">${IC.out}</button>`}</div></div></div>
  <main class="ad-main"><div class="in">${body}</div></main></div>
  <nav class="ad-tabs" aria-label="Admin">${NAVS.map(n => `<button class="${A.tab === n[0] ? 'on' : ''}" data-act="tab" data-t="${n[0]}">${n[2]}<span>${n[1]}</span></button>`).join('')}</nav>
  ${dirty() ? `<div class="pubbar"><div><span>Saved on this device. Not live for visitors yet.</span><button class="btn soft sm" data-act="discard" ${A.busy ? 'disabled' : ''}>Discard</button><button class="btn sm" data-act="publish" ${A.busy ? 'disabled' : ''}>${A.busy ? 'Publishing…' : 'Publish changes'}</button></div></div>` : ''}</div>`;
}

function overviewHTML() {
  const cs = S.cars, n = f => cs.filter(f).length;
  const samples = cs.filter(c => c.sample).length + S.reviews.filter(r => r.sample).length;
  return `${!waNum() ? `<div class="notice"><b>Add your WhatsApp number.</b> Every enquiry button needs it.<button class="btn sm" data-act="tab" data-t="site">Open site settings</button></div>` : ''}
  ${samples ? `<div class="notice info"><b>${samples} sample ${samples === 1 ? 'record is' : 'records are'} live on the site.</b> Sample listings carry a "Sample" tag. Remove them before you launch.<button class="btn sm soft" data-act="rm-samples">Remove all samples</button></div>` : ''}
  <div class="kpis"><div class="kpi"><b>${n(c => !isRent(c) && c.status === 'published')}</b><span>Cars for sale live</span></div><div class="kpi"><b>${n(c => isRent(c) && c.status === 'published')}</b><span>Rentals live</span></div><div class="kpi"><b>${n(c => c.status === 'draft')}</b><span>Drafts to finish</span></div><div class="kpi"><b>${n(c => c.status === 'sold')}</b><span>Sold</span></div></div>
  <div class="pnl" style="margin-top:14px"><h3>Quick actions</h3><div class="acts" style="margin:0"><button class="btn" data-act="add-car" data-kind="sale">+ Add car for sale</button><button class="btn" data-act="add-car" data-kind="rent">+ Add rental</button><button class="btn soft" data-act="tab" data-t="reviews">Manage client news</button><button class="btn soft" data-act="tab" data-t="site">Site settings</button></div></div>
  <div class="pnl"><h3>How publishing works</h3><p class="hint">Edits you make here are a preview on this device. Press <b>Publish changes</b> to send them to everyone. Status controls what visitors see: Draft and Archived are hidden, Reserved and Sold are labelled, and Sold cars leave the catalogue but their link still works.</p></div>
  <div class="pnl"><h3>Good to know</h3><p class="hint">The sign-in on this screen is a placeholder for the build phase. Real protection comes from who can publish this page. WhatsApp taps are not counted yet, and the "Saved" hearts are stored on each visitor's own phone.</p></div>`;
}
function adminList(tab) {
  const rent = tab === 'rent';
  let items = S.cars.filter(c => isRent(c) === rent);
  const q = A.q.toLowerCase();
  if (q) items = items.filter(c => (carTitle(c) + ' ' + c.code).toLowerCase().includes(q));
  if (A.st) items = items.filter(c => c.status === A.st);
  items.sort((a, b) => b.created - a.created);
  return `<div class="fbar"><div class="row"><input class="field grow" id="aq" type="search" placeholder="Search by name or code" value="${esc(A.q)}"><select class="sel" id="ast" aria-label="Filter by status"><option value="">All statuses</option>${(rent ? ST_RENT : ST_SALE).map(s => `<option value="${s[0]}" ${A.st === s[0] ? 'selected' : ''}>${s[1]}</option>`).join('')}</select></div></div>
  <div id="alist">${items.length ? items.map(adminRow).join('') : `<div class="empty"><h3>${S.cars.some(c => isRent(c) === rent) ? 'No matches' : 'Nothing here yet'}</h3><p>${rent ? 'Add your first rental to get started.' : 'Add your first car to get started.'}</p><button class="btn" data-act="add-car" data-kind="${tab}">+ Add ${rent ? 'rental' : 'car'}</button></div>`}</div>`;
}
function adminRow(c) {
  const [st] = statusInfo(c);
  return `<div class="lrow"><div class="th"><img loading="lazy" src="${esc(cover(c))}" alt=""></div><div class="m"><b>${esc(carTitle(c) || 'Untitled')}</b><span class="num">${esc(c.code)} · ${esc(priceText(c))}</span><span><span class="pill ${c.status === 'published' ? 'pub' : c.status}">${esc(st)}</span> ${c.sample ? '<span class="pill sample">Sample</span>' : ''}</span></div>
  <div class="ac"><select class="sel" data-act-st="${c.id}" aria-label="Status">${stOpts(c).map(s => `<option value="${s[0]}" ${c.status === s[0] ? 'selected' : ''}>${s[1]}</option>`).join('')}</select>
  <button class="btn soft sm" data-act="edit-car" data-id="${c.id}">Edit</button><a class="btn soft sm" href="#${carHash(c)}">View</a><button class="btn soft sm" data-act="feat" data-id="${c.id}" aria-pressed="${!!c.featured}">${c.featured ? '★ Featured' : '☆ Feature'}</button><button class="btn soft sm" data-act="del-car" data-id="${c.id}" style="color:var(--bad)">Delete</button></div></div>`;
}

/* ----- car editor ----- */
const gv = k => A.draft[k] ?? '';
const inp = (label, k, o = {}) => `<label>${label}${o.area ? `<textarea class="field" data-b="${k}" placeholder="${esc(o.ph || '')}" ${o.rows ? `rows="${o.rows}"` : ''}>${esc(gv(k))}</textarea>` : `<input class="field" data-b="${k}" ${o.num ? 'inputmode="numeric"' : ''} value="${esc(gv(k))}" placeholder="${esc(o.ph || '')}" ${o.list ? `list="${o.list}"` : ''}>`}${o.hint ? `<span class="hint">${o.hint}</span>` : ''}${A.errs[k] ? `<span class="err">${A.errs[k]}</span>` : ''}</label>`;
const sel = (label, k, opts) => `<label>${label}<select class="sel" data-b="${k}">${opts.map(o => { const [v, t] = Array.isArray(o) ? o : [o, o || 'Not set']; return `<option value="${esc(v)}" ${String(gv(k)) === String(v) ? 'selected' : ''}>${esc(t)}</option>`; }).join('')}</select></label>`;
const chk = (label, k) => `<label class="ck"><input type="checkbox" data-b="${k}" ${A.draft[k] ? 'checked' : ''}> ${label}</label>`;
function editorHTML() {
  const d = A.draft, rent = isRent(d);
  const makes = [...new Set(S.cars.map(c => c.make).filter(Boolean))];
  const rateRow = t => { const r = (d.rates || []).find(x => x.type === t); return `<div class="rrow"><label class="ck"><input type="checkbox" data-rate-on="${t}" ${r ? 'checked' : ''}> ${RATE_LABEL[t]}</label>${r && t !== 'custom' ? `<input class="field num" inputmode="numeric" data-rate-amt="${t}" value="${r.amount || ''}" placeholder="Amount in ₦">` : '<span></span>'}${r ? `<input class="field" style="grid-column:1/-1" data-rate-note="${t}" value="${esc(r.note || '')}" placeholder="${t === 'custom' ? 'Shown instead of a price, e.g. Contact us for rates' : 'Note (optional), e.g. Minimum 4 hours'}">` : ''}</div>`; };
  return `<datalist id="mk">${makes.map(m => `<option value="${esc(m)}">`).join('')}</datalist><div class="frm">
  <div class="pnl"><h3>Basics</h3><div class="g2">${inp('Make *', 'make', { list: 'mk', ph: 'Mercedes-Benz' })}${inp('Model *', 'model', { ph: 'GLE 450' })}${inp('Year *', 'year', { num: 1 })}${inp('Trim', 'trim', { ph: '4MATIC' })}</div>
   ${rent ? '' : `<div class="g2">${inp('Price (₦)', 'price', { num: 1, hint: 'Numbers only' })}${sel('Condition', 'condition', ['', 'Foreign used', 'Nigerian used', 'Brand new'])}</div>${chk('Show the price publicly', 'priceVisible')}`}
   ${inp('Short line', 'summary', { ph: 'One sentence shown under the title' })}${inp('Description', 'desc', { area: 1, rows: 5 })}
   <div class="g2">${inp('Web address ending', 'slug', { hint: 'Lowercase words joined by dashes' })}<label>Product code<input class="field" value="${esc(d.code)}" readonly><span class="hint">Used in WhatsApp messages</span></label></div></div>
  <div class="pnl"><h3>Specifications</h3><p class="hint">Only fields you fill in appear on the page.</p><div class="g2">
   ${rent ? '' : inp('Mileage (km)', 'mileage', { num: 1 })}${sel('Transmission', 'transmission', ['', 'Automatic', 'Manual'])}${sel('Fuel', 'fuel', ['', 'Petrol', 'Diesel', 'Hybrid', 'Electric'])}${inp('Engine', 'engine', { ph: '3.0L turbo' })}
   ${rent ? '' : sel('Drivetrain', 'drivetrain', ['', 'FWD', 'RWD', 'AWD', '4WD'])}${inp('Body type', 'body', { ph: 'SUV, Sedan, Coupe' })}${inp('Seats', 'seats', { num: 1 })}${inp('Exterior colour', 'extColor')}${inp('Interior colour', 'intColor')}
   ${rent ? '' : inp('Registration', 'reg', { ph: 'Registered, Unregistered' }) + inp('Duty', 'duty', { ph: 'Duty paid' }) + inp('Accident history', 'accident', { ph: 'Only if confirmed' })}</div></div>
  <div class="pnl"><h3>Features</h3><div class="tags" id="tags">${(d.features || []).map((f, i) => `<span class="chip">${esc(f)}<button type="button" data-act="feat-del" data-i="${i}" aria-label="Remove ${esc(f)}">×</button></span>`).join('')}</div>
   <div style="display:flex;gap:8px"><input class="field" id="feat-in" placeholder="Type a feature and press Enter"><button class="btn soft" type="button" data-act="feat-add">Add</button></div></div>
  <div class="pnl"><h3>Photos and video</h3><p class="hint">The first image is the cover. Photos are resized for fast loading.</p>
   ${(d.media || []).map((m, i) => `<div class="mrow"><div class="th">${m.type === 'video' ? `<video src="${esc(m.src)}" muted preload="metadata"></video>` : `<img src="${esc(U(m.src))}" alt="">`}</div><div class="f"><b style="font-size:.85rem">${m.type === 'video' ? 'Video' : (i === 0 ? 'Cover photo' : 'Photo ' + (i + 1))}</b><input class="field" data-m-alt="${i}" value="${esc(m.alt || '')}" placeholder="Describe the photo"></div><div class="b"><button type="button" data-act="m-up" data-i="${i}" aria-label="Move up">↑</button><button type="button" data-act="m-down" data-i="${i}" aria-label="Move down">↓</button><button type="button" class="${i === 0 ? 'on' : ''}" data-act="m-first" data-i="${i}" aria-label="Make cover">★</button><button type="button" data-act="m-del" data-i="${i}" aria-label="Remove" style="color:var(--bad)">×</button></div></div>`).join('')}
   <label class="drop" for="up">${IC.expand}<b>Add photos or videos</b><span class="hint">JPG, PNG, WebP. Videos up to 20 MB.</span></label><input id="up" type="file" accept="image/*,video/*" multiple hidden>
   <div style="display:flex;gap:8px"><input class="field" id="m-url" placeholder="Or paste an image address (https://…)"><button class="btn soft" type="button" data-act="m-url">Add</button></div></div>
  ${rent ? `<div class="pnl"><h3>Rental rates</h3><p class="hint">Tick only the rates you offer. Nothing is worked out automatically.</p>${['hourly', 'half', 'daily', 'weekly', 'monthly', 'custom'].map(rateRow).join('')}</div>
  <div class="pnl"><h3>Rental conditions</h3>${chk('Chauffeur available', 'chauffeur')}${chk('Self-drive available', 'selfDrive')}<div class="g2">${inp('Minimum rental', 'minDuration', { ph: '1 day' })}${inp('Deposit', 'deposit')}${inp('Fuel policy', 'fuelPolicy')}${inp('Mileage limit', 'mileageLimit')}</div>${inp('Pickup and delivery', 'pickup')}${inp('Rental terms', 'terms', { area: 1, rows: 4 })}</div>` : ''}
  <div class="pnl"><h3>Visibility</h3>${sel('Status', 'status', stOpts(d))}${chk('Feature on the home page', 'featured')}<p class="hint">Draft and Archived hide the listing. Sold and Reserved show a label.</p></div></div>`;
}

/* ----- reviews ----- */
function adminReviews() {
  const rv = S.reviews;
  return `<div class="notice info"><b>Client news</b> are shown on the home page, the client news page and on the car they belong to. Customers send their words on WhatsApp and you add them here.<button class="btn sm soft" data-act="sample-rev">Preview with sample client news</button></div>
  ${rv.length ? rv.map(r => `<div class="lrow"><div class="th">${r.photo ? `<img src="${esc(U(r.photo))}" alt="">` : `<div style="height:100%;display:grid;place-items:center;color:var(--mute)">${IC.star}</div>`}</div><div class="m"><b>${esc(r.name)} <span class="stars" style="font-size:.8rem">${'★'.repeat(r.rating || 5)}</span></b><span style="white-space:normal">${esc((r.text || '').slice(0, 90))}</span><span>${r.visible === false ? '<span class="pill draft">Hidden</span>' : '<span class="pill pub">Showing</span>'} ${r.sample ? '<span class="pill sample">Sample</span>' : ''}</span></div>
  <div class="ac"><button class="btn soft sm" data-act="rev-vis" data-id="${r.id}">${r.visible === false ? 'Show' : 'Hide'}</button><button class="btn soft sm" data-act="edit-rev" data-id="${r.id}">Edit</button><button class="btn soft sm" data-act="del-rev" data-id="${r.id}" style="color:var(--bad)">Delete</button></div></div>`).join('') : `<div class="empty"><h3>No client news yet</h3><p>Add the words and photo from a happy customer.</p><button class="btn" data-act="add-rev">+ Add client news</button></div>`}`;
}
function reviewEditorHTML() {
  const r = A.rev;
  return `<div class="pnl frm"><label>Customer name<input class="field" data-r="name" value="${esc(r.name)}" placeholder="First name and initial"></label>
  <label>Their words<textarea class="field" data-r="text" rows="5" placeholder="What they said">${esc(r.text)}</textarea></label>
  <div class="g2"><label>Stars<select class="sel" data-r="rating">${[5, 4, 3, 2, 1].map(n => `<option ${r.rating === n ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
  <label>Car<select class="sel" data-r="carId"><option value="">Not linked</option>${S.cars.map(c => `<option value="${c.id}" ${r.carId === c.id ? 'selected' : ''}>${esc(carTitle(c))}</option>`).join('')}</select></label></div>
  <label>Photo (optional)</label>${r.photo ? `<img src="${esc(U(r.photo))}" alt="" style="border-radius:14px;max-width:280px">` : ''}
  <div style="display:flex;gap:8px;flex-wrap:wrap"><label class="btn soft sm" for="rv-up">${r.photo ? 'Replace photo' : 'Upload photo'}</label><input id="rv-up" type="file" accept="image/*" hidden>${r.photo ? '<button class="btn soft sm" type="button" data-act="rev-photo-del">Remove photo</button>' : ''}</div>
  <label class="ck"><input type="checkbox" data-r="visible" ${r.visible !== false ? 'checked' : ''}> Show on the site</label></div>`;
}

/* ----- site settings ----- */
const sv = k => esc(cfg()[k] ?? '');
const si = (label, k, o = {}) => `<label>${label}${o.area ? `<textarea class="field" data-s="${k}" rows="${o.rows || 4}">${sv(k)}</textarea>` : `<input class="field" data-s="${k}" type="${o.type || 'text'}" value="${sv(k)}" placeholder="${esc(o.ph || '')}" ${o.type === 'color' ? '' : ''}>`}${o.hint ? `<span class="hint">${o.hint}</span>` : ''}</label>`;
function upBlock(label, k, accept) {
  const v = cfg()[k];
  const isV = accept.includes('video') && !accept.includes('image');
  return `<div><b style="font-size:.82rem;color:var(--mute)">${label}</b>${v ? (/\.(mp4|webm|mov)/i.test(v) || isV ? `<video src="${esc(v)}" muted style="max-width:260px;border-radius:12px;margin-top:6px"></video>` : `<img src="${esc(v)}" alt="" style="max-width:260px;max-height:140px;border-radius:12px;margin-top:6px;background:var(--surface2)">`) : '<p class="hint">Not set</p>'}
  <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><label class="btn soft sm" for="up-${k}">${v ? 'Replace' : 'Upload'}</label><input id="up-${k}" type="file" accept="${accept}" data-up-s="${k}" hidden>${v ? `<button class="btn soft sm" type="button" data-act="s-clear" data-k="${k}">Remove</button>` : ''}</div></div>`;
}
function siteHTML() {
  const wn = waNum();
  return `<div class="frm">
  <div class="pnl"><h3>WhatsApp and contact</h3>${si('WhatsApp number', 'whatsapp', { ph: '2348012345678', hint: wn ? `Buttons will open +${wn}` : 'Use the full number with country code, digits only. A leading 0 becomes 234.' })}
   <div class="g2">${si('Phone', 'phone')}${si('Email', 'email', { type: 'email' })}</div>${si('Address', 'address')}${si('Opening hours', 'hours', { ph: 'Mon to Sat, 9am to 6pm' })}${si('Site address for sharing', 'siteUrl', { ph: 'https://…', hint: 'Used in WhatsApp messages and the Share button. Leave empty to use this page’s own address.' })}</div>
  <div class="pnl"><h3>Social links</h3>${si('Instagram link', 'instagram', { ph: 'https://instagram.com/…' })}${si('TikTok link', 'tiktok')}${si('X link', 'x')}</div>
  <div class="pnl"><h3>Brand</h3>${si('Business name', 'name')}${si('Tagline', 'tagline')}${upBlock('Logo (PNG or SVG with transparent background)', 'logo', 'image/*')}<label>Accent colour<input class="field" type="color" data-s="accent" value="${esc(cfg().accent)}"></label></div>
  <div class="pnl"><h3>Home page hero</h3>${si('Headline', 'heroHeadline')}${si('Supporting text', 'heroSub', { area: 1, rows: 3 })}${upBlock('Hero photo', 'heroImage', 'image/*')}${upBlock('Hero video (optional, up to 20 MB)', 'heroVideo', 'video/*')}<label class="ck"><input type="checkbox" data-s="showVideos" ${cfg().showVideos ? 'checked' : ''}> Show videos on the site</label></div>
  <div class="pnl"><h3>WhatsApp messages</h3><p class="hint">The car name, code, price, details and link are added after this line automatically.</p>${si('Opening line for car enquiries', 'salesIntro', { area: 1, rows: 3 })}${si('Opening line for rental enquiries', 'rentIntro', { area: 1, rows: 3 })}</div>
  <div class="pnl"><h3>About page</h3>${si('Headline', 'aboutTitle')}${si('About text', 'about', { area: 1, rows: 8 })}<span class="hint">Leave a blank line between paragraphs.</span></div>
  <div class="pnl"><h3>Clean up</h3><button class="btn soft" data-act="rm-samples" type="button">Remove all sample listings and client news</button></div></div>`;
}

/* ----- uploads ----- */
async function shrink(file, max = 2000) {
  if (!/^image\/(jpe?g|png|webp|heic|avif|gif)$/i.test(file.type)) return file;
  try {
    const bmp = await createImageBitmap(file); const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const cv = document.createElement('canvas'); cv.width = Math.round(bmp.width * s); cv.height = Math.round(bmp.height * s);
    cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
    const blob = await new Promise(r => cv.toBlob(r, 'image/webp', .86));
    return blob && blob.size < file.size ? blob : file;
  } catch { return file; }
}
const toDataURL = b => new Promise((res, rej) => { const f = new FileReader(); f.onload = () => res(f.result); f.onerror = () => rej(f.error); f.readAsDataURL(b); });
async function uploadOne(file) {
  if (MODE === 'vercel') {
    const isV = file.type.startsWith('video/');
    if (isV && file.size > 3.2 * 1024 * 1024) throw new Error('Videos must be under 3 MB here. Trim or compress it first.');
    const blob = isV ? file : await shrink(file);
    const r = await apiPost('/api/upload', { dataUrl: await toDataURL(blob) });
    return { url: r.url, type: isV ? 'video' : 'image' };
  }
  const api = await window.claude?.use?.('assets');
  if (!api) throw new Error('Uploads need owner access to this page.');
  const isV = file.type.startsWith('video/');
  if (isV && file.size > 20 * 1024 * 1024) throw new Error('Videos must be under 20 MB.');
  const blob = isV ? file : await shrink(file);
  const r = await api.upload(blob);
  return { url: r.url, type: isV ? 'video' : 'image' };
}
