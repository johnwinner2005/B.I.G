/* ---------- ui helpers ---------- */
function toast(msg) {
  $$('.toast').forEach(t => t.remove());
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), 3200);
}
function modal(html) {
  closeModal();
  const o = document.createElement('div'); o.className = 'ov'; o.id = 'ov';
  o.innerHTML = `<div class="mod" role="dialog" aria-modal="true">${html}</div>`;
  o.addEventListener('click', e => { if (e.target === o) closeModal(); });
  document.body.appendChild(o); return o;
}
function closeModal() { $('#ov')?.remove(); }
let confirmCb = null;
function confirmBox(title, text, yes, cb, danger = true) {
  confirmCb = cb;
  modal(`<h3>${esc(title)}</h3><p>${esc(text)}</p><div class="row"><button class="btn soft" data-act="modal-close">Cancel</button><button class="btn ${danger ? 'danger' : ''}" data-act="confirm-yes">${esc(yes)}</button></div>`);
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('Link copied'); }
  catch {
    const o = modal(`<h3>Copy this link</h3><input class="field" id="cp" readonly value="${esc(text)}"><button class="btn" data-act="modal-close">Done</button>`);
    const i = $('#cp', o); i.focus(); i.select();
  }
}

/* ---------- chrome ---------- */
const route = { name: 'home', slug: '' };
function parseRoute() {
  const h = decodeURIComponent(location.hash.slice(1)) || 'home';
  if (h.startsWith('car-')) return { name: 'car', slug: h.slice(4) };
  if (h.startsWith('rental-')) return { name: 'rental', slug: h.slice(7) };
  return { name: ['home', 'cars', 'rentals', 'saved', 'about', 'contact', 'reviews', 'admin'].includes(h) ? h : 'home', slug: '' };
}
function logo(sz) {
  if (cfg().logo) return `<img src="${esc(cfg().logo)}" alt="${esc(cfg().name)}">`;
  return `<span class="logo ${sz || ''}" role="img" aria-label="${esc(cfg().name)}" style="--logo:url('${LOGO_W}')"></span>`;
}
const curSkin = () => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
function setSkin(v, quiet) {
  v = v === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = v;
  if (!quiet) store.set('big-skin', v);
  $$('.skin button').forEach(b => { const on = b.dataset.v === v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
}
setSkin(store.get('big-skin', 'dark'), true);
const skinHTML = () => `<div class="skin" role="group" aria-label="Appearance"><span>Appearance</span><button data-act="skin" data-v="dark" aria-pressed="${curSkin() === 'dark'}" class="${curSkin() === 'dark' ? 'on' : ''}">Dark</button><i aria-hidden="true">/</i><button data-act="skin" data-v="light" aria-pressed="${curSkin() === 'light'}" class="${curSkin() === 'light' ? 'on' : ''}">Light</button></div>`;
function header() {
  const n = favs().length, r = route.name;
  const on = k => (r === k || (k === 'cars' && r === 'car') || (k === 'rentals' && r === 'rental')) ? 'on' : '';
  return `<header class="top"><div class="in"><a class="brand" href="#home" aria-label="${esc(cfg().name)} home">${logo()}</a>
  <nav class="nav" aria-label="Main"><a class="${on('cars')}" href="#cars">Cars for Sale</a><a class="${on('rentals')}" href="#rentals">Exclusive Rentals</a><a class="${on('reviews')}" href="#reviews">Client News</a><a class="${on('about')}" href="#about">About</a><a class="${on('contact')}" href="#contact">Contact</a></nav>
  <div class="top-r"><a class="ibtn" href="#saved" aria-label="Saved cars">${IC.heart}${n ? `<span class="dot">${n}</span>` : ''}</a><button class="ibtn burger" data-act="menu" aria-label="Open menu">${IC.menu}</button></div></div></header>
  <div class="menu" id="menu" aria-hidden="true"><button class="ibtn x" data-act="menu" aria-label="Close menu">${IC.x}</button>
  <a href="#cars" data-act="menu">Cars for Sale <small>${S.cars.filter(c => !isRent(c) && LIST_OK(c)).length} listed</small></a>
  <a href="#rentals" data-act="menu">Exclusive Rentals <small>${S.cars.filter(c => isRent(c) && LIST_OK(c)).length} listed</small></a>
  <a href="#reviews" data-act="menu">Client News</a><a href="#saved" data-act="menu">Saved <small>${n}</small></a><a href="#about" data-act="menu">About</a><a href="#contact" data-act="menu">Contact</a>
  ${skinHTML()}<a class="btn wa" href="${esc(waLink('Hello B.I.G Autos, I have a question.'))}" target="_blank" rel="noopener">${IC.wa} Chat on WhatsApp</a></div>`;
}
function footer() {
  const c = cfg();
  const soc = [['Instagram', c.instagram], ['TikTok', c.tiktok], ['X', c.x]].filter(s => s[1]);
  return `<footer class="foot"><div class="in"><div class="cols">
  <div><a class="brand" href="#home">${logo("lg")}</a><p style="margin-top:12px;color:var(--mute);max-width:30ch">${esc(c.tagline)}</p></div>
  <div><h4>Browse</h4><a href="#cars">Cars for Sale</a><a href="#rentals">Exclusive Rentals</a><a href="#saved">Saved cars</a><a href="#reviews">Client News</a></div>
  <div><h4>Company</h4><a href="#about">About</a><a href="#contact">Contact</a></div>
  <div><h4>Reach us</h4>${waNum() ? `<a href="${esc(waLink('Hello B.I.G Autos'))}" target="_blank" rel="noopener">WhatsApp</a>` : ''}${c.phone ? `<p class="num">${esc(c.phone)}</p>` : ''}${c.email ? `<p>${esc(c.email)}</p>` : ''}${soc.map(s => `<a href="${esc(/^https?:/.test(s[1]) ? s[1] : '#contact')}" target="_blank" rel="noopener">${s[0]}</a>`).join('')}${c.address ? `<p>${esc(c.address)}</p>` : ''}</div>
  </div><div class="fine"><span>© ${new Date().getFullYear()} ${esc(c.name)}</span>${skinHTML()}<a href="#admin" style="color:var(--mute);padding:0;display:inline">Staff</a></div></div></footer>`;
}

/* ---------- cards ---------- */
function card(c, opt = {}) {
  const [st, tone] = statusInfo(c);
  const showTag = c.status !== 'published' ? `<span class="tag">${esc(st)}</span>` : '';
  const spec = isRent(c)
    ? [c.seats ? c.seats + ' seats' : '', c.chauffeur ? 'Chauffeur' : '', c.selfDrive ? 'Self-drive' : ''].filter(Boolean)
    : [c.mileage ? Number(c.mileage).toLocaleString('en-NG') + ' km' : '', c.transmission, c.fuel].filter(Boolean);
  return `<article class="card"><a class="card-img" href="#${carHash(c)}" aria-label="${esc(carTitle(c))}"><img loading="lazy" decoding="async" src="${esc(cover(c))}" alt="${esc((c.media?.[0]?.alt) || carTitle(c))}"></a>
  ${showTag}${c.sample ? '<span class="tag sample">Sample</span>' : ''}
  <button class="heart ${isFav(c.id) ? 'on' : ''}" data-act="fav" data-id="${c.id}" aria-label="Save ${esc(carTitle(c))}" aria-pressed="${isFav(c.id)}">${IC.heart}</button>
  <a class="card-b" href="#${carHash(c)}"><div class="card-t">${esc(carTitle(c))}</div><div class="card-s">${esc(spec.join(' · ') || c.summary || '')}</div>
  <div class="card-p">${esc(priceText(c))}</div></a></article>`;
}
function reviewCard(r) {
  const car = S.cars.find(c => c.id === r.carId);
  return `<article class="rv">${r.photo ? `<img loading="lazy" decoding="async" src="${esc(U(r.photo))}" alt="${esc(r.name)} with their car">` : ''}<div class="b"><div class="stars" aria-label="${r.rating} out of 5">${'★'.repeat(r.rating || 5)}</div><q>${esc(r.text)}</q><div class="w"><b>${esc(r.name)}</b><span>${esc(car ? carTitle(car) : (r.carNote || ''))}</span></div></div></article>`;
}
const shareStory = () => waLink("Hello B.I.G Autos, here's my news:\n\n");

/* ---------- rental plan ---------- */
const CHIPS = [[1, '12 hrs'], [2, '24 hrs'], [4, '2 days'], [6, '3 days'], [14, '1 week']];
function planHTML(c) {
  if (TRIP.id !== c.id) { TRIP.id = c.id; TRIP.n = 1; }
  const q = tripQuote(c, TRIP.n), both = c.chauffeur && c.selfDrive, today = new Date().toISOString().slice(0, 10);
  return `<section class="plan" id="plan"><h3 class="h3">Plan your hire</h3>
  ${q ? `<p class="hint">Rates are for 12 hours. Pick how long you need and the total updates.</p>
  <div class="chips" role="group" aria-label="Duration">${CHIPS.map(([n, l]) => `<button type="button" data-act="trip-n" data-n="${n}" aria-pressed="${TRIP.n === n}" class="${TRIP.n === n ? 'on' : ''}">${l}</button>`).join('')}</div>
  <div class="stepper"><button type="button" data-act="trip-step" data-d="-1" aria-label="Shorter">−</button><span id="trip-lab" aria-live="polite">${durLabel(TRIP.n)}</span><button type="button" data-act="trip-step" data-d="1" aria-label="Longer">+</button></div>
  <div class="quote"><span>Estimated total</span><b class="num" id="trip-total">${NGN(q.total)}</b><small id="trip-calc">${esc(q.calc)}</small></div>` : `<p class="hint">Rates are confirmed by our team. Add your plan below.</p>`}
  <div class="more"><label>Pickup date<input class="field" type="date" id="trip-date" min="${today}"></label><label>Pickup time<input class="field" type="time" id="trip-time"></label>${both ? `<label>Driving<select class="sel" id="trip-mode"><option value="">No preference</option><option>Chauffeur</option><option>Self-drive</option></select></label>` : ''}<label>Pickup or delivery area<input class="field" id="trip-loc" placeholder="e.g. Lekki Phase 1"></label></div>
  <p class="hint">The total is an estimate. Our team confirms availability and the final price.</p></section>`;
}
function updateTrip() {
  const c = S.cars.find(x => x.id === TRIP.id); if (!c) return; const q = tripQuote(c, TRIP.n); if (!q) return;
  const set = (id, t) => { const e = $('#' + id); if (e) e.textContent = t; };
  set('trip-lab', durLabel(TRIP.n)); set('trip-total', NGN(q.total)); set('trip-calc', q.calc);
  $$('.chips button').forEach(b => { const on = +b.dataset.n === TRIP.n; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
}

/* ---------- home ---------- */
function home() {
  const c = cfg();
  const words = String(c.heroHeadline).split(' ').map((w, i) => `<span class="w"><span style="--i:${i}">${esc(w)}</span></span>`).join(' ');
  const sale = S.cars.filter(x => !isRent(x) && LIST_OK(x)), rent = S.cars.filter(x => isRent(x) && LIST_OK(x));
  const fs = sale.filter(x => x.featured).slice(0, 6), fr = rent.filter(x => x.featured).slice(0, 6);
  const heroMedia = c.heroVideo && c.showVideos
    ? `<video src="${esc(c.heroVideo)}" autoplay muted loop playsinline poster="${esc(c.heroImage || U(''))}"></video>`
    : (c.heroImage ? `<img src="${esc(c.heroImage)}" alt="">` : '');
  const heroShots = (c.heroVideo && c.showVideos) || c.heroImage ? '' : `<div class="hero-photos" aria-hidden="true">${HERO.map((s, i) => `<img src="${s}" alt="" style="--i:${i}">`).join('')}</div>`;
  const rv = S.reviews.filter(r => r.visible !== false);
  const bandItems = ['Cars for sale', 'Exclusive rentals', 'Inspect before you pay', 'Selling nationwide'];
  const bandHTML = bandItems.map(t => `<span>${t}</span>`).join('');
  return `<section class="hero"><div class="hero-bg" data-sy="0.25">${heroMedia}</div>
  <div class="in"><h1>${words}</h1><p class="sub">${esc(c.heroSub)}</p>
  <div class="ctas"><a class="btn" href="#cars">Explore Cars for Sale</a><a class="btn ghost" href="#rentals">Explore Exclusive Rentals</a></div>
  <div class="hsp"></div></div>${heroShots}
  <div class="hero-foot"><div class="in"><span><b>${sale.length}</b> cars for sale</span><span><b>${rent.length}</b> exclusive rentals</span><span>${esc(c.address || '')}</span></div></div></section>
  <div class="band" aria-hidden="true"><div data-bx>${bandHTML.repeat(10)}</div></div>
  <section class="sec"><div class="in"><div class="paths">
   <a class="path s" href="#cars"><img decoding="async" src="${TILE_IMG[0]}" alt=""><span class="k">Buy</span><h3>Cars for Sale</h3><p>See what is available, check every detail and book an inspection. We sell across Nigeria.</p><span class="btn">Browse Cars for Sale ${IC.arrow}</span></a>
   <a class="path r" href="#rentals"><img decoding="async" src="${TILE_IMG[1]}" alt=""><span class="k">Hire</span><h3>Exclusive Rentals</h3><p>Exclusive rides for weddings, owambe, business trips, airport runs and big days.</p><span class="btn ghost">Explore Exclusive Rentals ${IC.arrow}</span></a>
  </div></div></section>
  ${fs.length ? `<section class="sec tight"><div class="in"><div class="sh"><h2>Cars ready for sale</h2><a class="lnk" href="#cars">View all cars ${IC.arrow}</a></div><div class="rail">${fs.map(x => card(x)).join('')}</div></div></section>` : ''}
  ${fr.length ? `<section class="sec tight"><div class="in"><div class="sh"><h2>Exclusive rides, ready to book</h2><a class="lnk" href="#rentals">View all rentals ${IC.arrow}</a></div><div class="rail">${fr.map(x => card(x)).join('')}</div></div></section>` : ''}
  <section class="sec"><div class="in"><h2 class="big">${esc(c.aboutTitle)}</h2><p class="lead">${esc(String(c.about).split('\n\n')[0])}</p>
   <div class="pts"><div>Personal help<span>A real person answers every enquiry on WhatsApp.</span></div><div>Full details up front<span>Specs, features and photos on every listing.</span></div><div>Simple enquiries<span>One tap and WhatsApp opens with the car already named.</span></div><div>Sales and rentals<span>One team for buying and for hiring.</span></div></div></div></section>
  <section class="sec tight"><div class="in"><div class="sh"><h2>Three simple steps</h2></div><div class="steps">
   <div class="step"><h3>Pick a car</h3><p>Browse, save the ones you like, and open any car for photos, specs and price.</p></div>
   <div class="step"><h3>Tap WhatsApp</h3><p>Your message opens with the car name, its code and key details already written.</p></div>
   <div class="step"><h3>We confirm</h3><p>Our team replies with availability, inspection time or rental terms.</p></div></div></div></section>
  <section class="sec tight"><div class="in"><div class="sh"><div><h2>Client news</h2></div><p>Hear it from clients who bought or hired with us.</p></div>
   ${rv.length ? `<div class="rail">${rv.slice(0, 8).map(reviewCard).join('')}</div><a class="lnk" href="#reviews">Read all client news ${IC.arrow}</a>` : `<div class="empty"><h3>Your news could be first</h3><p>Bought or hired with us? Tell us how it went.</p><a class="btn" href="${esc(shareStory())}" target="_blank" rel="noopener">${IC.wa} Share your news</a></div>`}
  </div></section>
  <section class="sec tight"><div class="in"><div class="cta"><h2>Found something you like?</h2><p>Let's help you take the next step.</p><div class="ctas"><a class="btn" href="#cars">Explore Cars for Sale</a><a class="btn ghost" href="#rentals">Explore Exclusive Rentals</a><a class="btn wa" href="${esc(waLink('Hello B.I.G Autos, I would like some help choosing a car.'))}" target="_blank" rel="noopener">${IC.wa} Chat with us</a></div></div></div></section>`;
}

/* ---------- lists ---------- */
const FL = { sale: { q: '', make: '', min: '', max: '', year: '', cond: '', sort: 'new' }, rent: { q: '', make: '', body: '', max: '', chauffeur: '', sort: 'new' } };
function listItems(kind) {
  const f = FL[kind], rent = kind === 'rent';
  let items = S.cars.filter(c => isRent(c) === rent && LIST_OK(c));
  const q = f.q.trim().toLowerCase();
  if (q) items = items.filter(c => [carTitle(c), c.code, c.summary, ...(c.features || [])].join(' ').toLowerCase().includes(q));
  if (f.make) items = items.filter(c => c.make === f.make);
  if (rent) {
    if (f.body) items = items.filter(c => c.body === f.body);
    if (f.chauffeur) items = items.filter(c => c.chauffeur);
    if (+f.max) items = items.filter(c => { const d = (c.rates || []).find(r => r.type === 'daily'); return d && +d.amount <= +f.max; });
  } else {
    if (+f.min) items = items.filter(c => +c.price >= +f.min);
    if (+f.max) items = items.filter(c => +c.price && +c.price <= +f.max);
    if (+f.year) items = items.filter(c => +c.year >= +f.year);
    if (f.cond) items = items.filter(c => c.condition === f.cond);
  }
  const daily = c => +((c.rates || []).find(r => r.type === 'daily')?.amount) || Infinity;
  const P = rent ? daily : c => +c.price || Infinity;
  const sorts = { new: (a, b) => b.created - a.created, plow: (a, b) => P(a) - P(b), phigh: (a, b) => (P(b) === Infinity ? -1 : P(b)) - (P(a) === Infinity ? -1 : P(a)), year: (a, b) => b.year - a.year };
  return items.sort(sorts[f.sort] || sorts.new);
}
function listHTML(kind) {
  const items = listItems(kind);
  if (!items.length) return `<div class="empty"><h3>No matches</h3><p>Nothing fits those filters right now. Clear them or ask us to find it for you.</p><div class="acts" style="justify-content:center"><button class="btn soft" data-act="clear" data-kind="${kind}">Clear filters</button><a class="btn wa" href="${esc(waLink('Hello B.I.G Autos, I am looking for a car that is not listed yet.'))}" target="_blank" rel="noopener">${IC.wa} Ask us</a></div></div>`;
  return `<p class="count num">${items.length} ${items.length === 1 ? 'car' : 'cars'}</p><div class="grid">${items.map(c => card(c)).join('')}</div>`;
}
function listPage(kind) {
  const rent = kind === 'rent', f = FL[kind];
  const pool = S.cars.filter(c => isRent(c) === rent && LIST_OK(c));
  const uniq = k => [...new Set(pool.map(c => c[k]).filter(Boolean))].sort();
  const opt = (arr, v) => arr.map(x => `<option ${x === v ? 'selected' : ''}>${esc(x)}</option>`).join('');
  const years = [...new Set(pool.map(c => c.year).filter(Boolean))].sort((a, b) => b - a);
  const sortOpts = rent ? [['new', 'Newest'], ['plow', 'Daily rate: low to high'], ['phigh', 'Daily rate: high to low']] : [['new', 'Newest'], ['plow', 'Price: low to high'], ['phigh', 'Price: high to low'], ['year', 'Year: newest']];
  const more = rent
    ? `<label>Body style<select class="sel" data-f="rent.body"><option value="">Any</option>${opt(uniq('body'), f.body)}</select></label><label>Max daily rate (₦)<input class="field" inputmode="numeric" data-f="rent.max" value="${esc(f.max)}" placeholder="No limit"></label><label class="ck" style="grid-column:1/-1;display:flex;gap:10px;align-items:center;color:var(--ink);font-size:.95rem"><input type="checkbox" data-f="rent.chauffeur" ${f.chauffeur ? 'checked' : ''} style="width:22px;height:22px;accent-color:var(--accent)"> Chauffeur available</label>`
    : `<label>Min price (₦)<input class="field" inputmode="numeric" data-f="sale.min" value="${esc(f.min)}" placeholder="0"></label><label>Max price (₦)<input class="field" inputmode="numeric" data-f="sale.max" value="${esc(f.max)}" placeholder="No limit"></label><label>Year from<select class="sel" data-f="sale.year"><option value="">Any</option>${years.map(y => `<option ${String(y) === String(f.year) ? 'selected' : ''}>${y}</option>`).join('')}</select></label><label>Condition<select class="sel" data-f="sale.cond"><option value="">Any</option>${opt(uniq('condition'), f.cond)}</select></label>`;
  return `<div class="ph in"><h1>${rent ? 'Exclusive Rentals' : 'Cars for Sale'}</h1><p>${rent ? 'Exclusive rides for the day, the week or the month. Message us to confirm dates and rates.' : 'Every car comes with full details. Message us to book an inspection, anywhere in Nigeria.'}</p></div>
  <div class="in"><div class="fbar"><div class="row"><input class="field grow" type="search" placeholder="Search make, model or code" aria-label="Search" data-f="${kind}.q" value="${esc(f.q)}"><select class="sel" aria-label="Make" data-f="${kind}.make"><option value="">All makes</option>${opt(uniq('make'), f.make)}</select><select class="sel" aria-label="Sort" data-f="${kind}.sort">${sortOpts.map(s => `<option value="${s[0]}" ${f.sort === s[0] ? 'selected' : ''}>${s[1]}</option>`).join('')}</select></div>
  <details><summary class="btn soft sm" style="list-style:none;width:max-content">${IC.sliders} More filters</summary><div class="more" style="margin-top:10px">${more}</div></details></div>
  <div id="list">${listHTML(kind)}</div></div><div style="height:60px"></div>`;
}

/* ---------- detail ---------- */
function notFound() {
  return `<div class="ph in" style="padding-bottom:80px"><h1>Not listed</h1><p>This car is no longer listed or the link is out of date.</p><div class="acts"><a class="btn" href="#cars">Cars for Sale</a><a class="btn soft" href="#rentals">Exclusive Rentals</a></div></div>`;
}
function detail(c) {
  if (!c || (!LIST_OK(c) && c.status !== 'sold' && !isAdmin())) return notFound();
  const rent = isRent(c), sold = c.status === 'sold';
  const media = mediaOf(c), [st, tone] = statusInfo(c);
  const slides = (media.length ? media : [{ type: 'image', src: '', alt: carTitle(c) }]).map((m, i) => m.type === 'video'
    ? `<div data-act="viewer" data-i="${i}"><video src="${esc(m.src)}" muted playsinline preload="metadata"></video><span class="tag" style="left:auto;right:12px">Video</span></div>`
    : `<div data-act="viewer" data-i="${i}"><img ${i ? 'loading="lazy" decoding="async"' : ''} src="${esc(U(m.src))}" alt="${esc(m.alt || carTitle(c))}"></div>`).join('');
  const thumbs = media.length > 1 ? `<div class="thumbs">${media.map((m, i) => `<button data-act="thumb" data-i="${i}" class="${i ? '' : 'on'}" aria-label="Photo ${i + 1}">${m.type === 'video' ? `<span style="display:grid;place-items:center;height:100%;color:var(--ink)">${IC.play}</span>` : `<img loading="lazy" decoding="async" src="${esc(U(m.src))}" alt="">`}</button>`).join('')}</div>` : '';
  const specs = (rent
    ? [['Seats', c.seats], ['Body', c.body], ['Transmission', c.transmission], ['Fuel', c.fuel], ['Engine', c.engine], ['Colour', c.extColor], ['Interior', c.intColor]]
    : [['Condition', c.condition], ['Mileage', +c.mileage ? Number(c.mileage).toLocaleString('en-NG') + ' km' : ''], ['Transmission', c.transmission], ['Fuel', c.fuel], ['Engine', c.engine], ['Drivetrain', c.drivetrain], ['Body', c.body], ['Seats', c.seats], ['Exterior', c.extColor], ['Interior', c.intColor], ['Registration', c.reg], ['Duty', c.duty], ['History', c.accident]]
  ).filter(s => s[1]);
  const rates = rent ? activeRates(c) : [];
  const mode = c.chauffeur && c.selfDrive ? 'Chauffeur or self-drive' : c.chauffeur ? 'Chauffeur provided' : c.selfDrive ? 'Self-drive' : '';
  const rinfo = rent ? [['Driving', mode], ['Minimum rental', c.minDuration], ['Deposit', c.deposit], ['Fuel policy', c.fuelPolicy], ['Mileage', c.mileageLimit], ['Pickup and delivery', c.pickup]].filter(s => s[1]) : [];
  const related = S.cars.filter(x => x.id !== c.id && isRent(x) === rent && LIST_OK(x) && (x.body === c.body || x.make === c.make)).slice(0, 3);
  const rvs = S.reviews.filter(r => r.visible !== false && r.carId === c.id);
  const waBtn = sold ? '' : `<a class="btn wa" data-act="wa" data-id="${c.id}" href="${esc(waLink(waMessage(c)))}" target="_blank" rel="noopener">${IC.wa} ${rent ? 'Enquire about this rental' : 'Enquire on WhatsApp'}</a>`;
  return `<div class="dt in"><nav class="crumb" aria-label="Breadcrumb"><a href="#home">Home</a>${IC.chev.replace('<svg', '<svg width="14" height="14"')}<a href="#${rent ? 'rentals' : 'cars'}">${rent ? 'Exclusive Rentals' : 'Cars for Sale'}</a></nav>
  ${c.status === 'draft' || c.status === 'archived' ? `<div class="notice"><b>${esc(st)} preview.</b> Only staff can see this page.</div>` : ''}
  <div class="dt-grid"><div><div class="gal-m" id="gal">${slides}</div>${thumbs}
   ${media.length ? `<button class="btn soft sm" style="margin-top:10px" data-act="viewer" data-i="0">${IC.expand} Full-screen gallery (${media.length})</button>` : ''}</div>
  <div class="dt-info"><span class="code">${esc(c.code)}</span> ${c.sample ? '<span class="pill sample">Sample listing</span>' : ''}
   <h1>${esc(carTitle(c))}</h1>${c.summary ? `<p class="sum">${esc(c.summary)}</p>` : ''}
   ${rent ? '' : `<div class="price num">${esc(priceText(c))}</div>`}
   <div style="margin-top:12px"><span class="stat ${tone}">${esc(st)}</span></div>
   ${rent ? (rates.length ? `<div class="rates">${rates.map(r => `<div class="rate"><span>${RATE_LABEL[r.type]}${r.note ? `<small>${esc(r.note)}</small>` : ''}</span><b>${r.type === 'custom' || !+r.amount ? 'Contact for rates' : NGN(r.amount)}${r.type !== 'custom' && +r.amount ? `<small style="display:inline;font-family:var(--f-body);font-weight:500"> / ${RATE_UNIT[r.type]}</small>` : ''}</b></div>`).join('')}</div>` : `<div class="rates"><div class="rate"><span>Rates</span><b>Contact for rates</b></div></div>`) : ''}
   ${sold ? `<div class="sold-note">This car has been sold. Message us and we will help you find something similar.</div>` : ''}
   ${rent && !sold ? planHTML(c) : ''}
   <div class="acts">${waBtn}<button class="btn soft" data-act="share" data-id="${c.id}">${IC.share} Share</button><button class="btn soft ${isFav(c.id) ? 'on' : ''}" data-act="fav" data-id="${c.id}" aria-pressed="${isFav(c.id)}">${IC.heart.replace('<svg', '<svg width="20" height="20"')} ${isFav(c.id) ? 'Saved' : 'Save'}</button></div>
   ${specs.length ? `<h3 class="h3">Details</h3><div class="specs">${specs.map(s => `<div class="spec"><small>${s[0]}</small><b>${esc(s[1])}</b></div>`).join('')}</div>` : ''}
   ${c.features?.length ? `<h3 class="h3">Features</h3><div class="chips">${c.features.map(f => `<span class="chip">${esc(f)}</span>`).join('')}</div>` : ''}
   ${rinfo.length ? `<h3 class="h3">Rental information</h3><div class="info-list">${rinfo.map(s => `<div><small>${s[0]}</small>${esc(s[1])}</div>`).join('')}</div>` : ''}
   ${c.desc ? `<h3 class="h3">About this ${rent ? 'rental' : 'car'}</h3><p class="prose">${esc(c.desc)}</p>` : ''}
   ${rent && c.terms ? `<h3 class="h3">Rental terms</h3><p class="prose">${esc(c.terms)}</p>` : ''}
   ${rent ? `<p class="hint" style="margin-top:18px;color:var(--mute);font-size:.85rem">Dates are only confirmed by our team. A listing being visible does not reserve it.</p>` : ''}
  </div></div>
  ${rvs.length ? `<h3 class="h3" style="margin-top:50px">Client news for this car</h3><div class="rv-grid">${rvs.map(reviewCard).join('')}</div>` : ''}
  ${related.length ? `<h3 class="h3" style="margin-top:50px">You might also like</h3><div class="grid">${related.map(x => card(x)).join('')}</div>` : ''}
  </div>
  ${sold ? '' : `<div class="sticky"><div class="in"><div class="pp"><small>${esc(carTitle(c))}</small><b>${esc(priceText(c))}</b></div><a class="btn wa" data-act="wa" data-id="${c.id}" href="${esc(waLink(waMessage(c)))}" target="_blank" rel="noopener">${IC.wa} WhatsApp</a></div></div>`}`;
}

/* ---------- other pages ---------- */
function reviewsPage() {
  const rv = S.reviews.filter(r => r.visible !== false);
  return `<div class="ph in"><h1>Client news</h1><p>Words and photos from clients who bought or hired from us.</p></div><div class="in">
  ${rv.length ? `<div class="rv-grid">${rv.map(reviewCard).join('')}</div>` : `<div class="empty"><h3>No client news yet</h3><p>Be the first to tell us how it went.</p></div>`}
  <div class="cta" style="margin-top:40px"><h2>Tell us yours</h2><p>Send your news and a photo on WhatsApp. We will add it here.</p><div class="ctas"><a class="btn wa" href="${esc(shareStory())}" target="_blank" rel="noopener">${IC.wa} Share your news</a></div></div></div><div style="height:50px"></div>`;
}
function savedPage() {
  const ids = favs(), items = ids.map(id => S.cars.find(c => c.id === id)).filter(c => c && (LIST_OK(c) || c.status === 'sold'));
  return `<div class="ph in"><h1>Saved</h1><p>Cars you have hearted on this device.</p></div><div class="in">${items.length ? `<div class="grid">${items.map(c => card(c)).join('')}</div>` : `<div class="empty"><h3>Nothing saved yet</h3><p>Tap the heart on any car to keep it here.</p><div class="acts"><a class="btn" href="#cars">Browse cars</a><a class="btn soft" href="#rentals">Browse rentals</a></div></div>`}</div><div style="height:60px"></div>`;
}
function aboutPage() {
  const paras = String(cfg().about).split('\n\n').map(p => `<p class="lead" style="margin-top:20px">${esc(p)}</p>`).join('');
  return `<div class="ph in"><p style="margin:0 0 10px;color:var(--accent);font-weight:700">About ${esc(cfg().name)}</p><h1>${esc(cfg().aboutTitle)}</h1>${paras}</div>
  <div class="in"><div class="pts"><div>Personal help<span>A real person answers every enquiry on WhatsApp.</span></div><div>Full details up front<span>Specs, features and photos on every listing.</span></div><div>Simple enquiries<span>One tap and WhatsApp opens with the car already named.</span></div><div>Sales and rentals<span>One team for buying and for hiring.</span></div></div>
  <div class="cta" style="margin-top:50px"><h2>${esc(cfg().tagline)}</h2><div class="ctas"><a class="btn" href="#cars">Cars for Sale</a><a class="btn ghost" href="#rentals">Exclusive Rentals</a></div></div></div><div style="height:50px"></div>`;
}
function contactPage() {
  const c = cfg();
  const rows = [['WhatsApp', waNum() ? '+' + waNum() : ''], ['Phone', c.phone], ['Email', c.email], ['Address', c.address], ['Hours', c.hours], ['Instagram', c.instagram], ['TikTok', c.tiktok], ['X', c.x]].filter(r => r[1]);
  return `<div class="ph in"><h1>Contact</h1><p>The fastest way to reach us is WhatsApp.</p></div><div class="in"><div class="acts" style="margin:0 0 24px"><a class="btn wa" href="${esc(waLink('Hello B.I.G Autos, I have a question.'))}" target="_blank" rel="noopener">${IC.wa} Chat on WhatsApp</a></div>
  ${rows.length ? `<div class="info-list" style="max-width:560px">${rows.map(r => `<div><small>${r[0]}</small>${esc(r[1])}</div>`).join('')}</div>` : `<div class="empty"><h3>Contact details coming soon</h3><p>Use WhatsApp for now.</p></div>`}</div><div style="height:60px"></div>`;
}

/* ---------- router / render ---------- */
function viewHTML() {
  const r = route.name;
  if (r === 'home') return home();
  if (r === 'cars') return listPage('sale');
  if (r === 'rentals') return listPage('rent');
  if (r === 'car') return detail(S.cars.find(c => !isRent(c) && c.slug === route.slug));
  if (r === 'rental') return detail(S.cars.find(c => isRent(c) && c.slug === route.slug));
  if (r === 'saved') return savedPage();
  if (r === 'about') return aboutPage();
  if (r === 'contact') return contactPage();
  if (r === 'reviews') return reviewsPage();
  return home();
}
function render(keepScroll) {
  closeViewer(); closeModal();
  Object.assign(route, parseRoute());
  document.documentElement.style.setProperty('--accent-base', cfg().accent || BRAND_RED);
  const root = $('#root'), y = scrollY;
  if (route.name === 'admin') {
    document.documentElement.classList.add('solid');
    root.innerHTML = adminHTML();
    document.title = 'Staff · ' + cfg().name;
  } else {
    const showFab = !['car', 'rental'].includes(route.name);
    root.innerHTML = `<div class="road" aria-hidden="true"><i></i></div>${header()}<main id="view">${viewHTML()}</main>${footer()}${showFab ? `<a class="fab" href="${esc(waLink('Hello B.I.G Autos, I have a question.'))}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${IC.wa}</a>` : ''}${isAdmin() && dirty() ? '<div style="position:fixed;left:12px;top:calc(env(safe-area-inset-top,0px) + 66px);z-index:61"><a class="pill sample" href="#admin">Unpublished changes</a></div>' : ''}`;
    document.title = cfg().name;
  }
  if (keepScroll) scrollTo(0, y); else scrollTo(0, 0);
  fx(true);
}
