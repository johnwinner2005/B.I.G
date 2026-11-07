/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NGN = n => '₦' + Number(n || 0).toLocaleString('en-NG');
const uid = () => Math.random().toString(36).slice(2, 9);
const slugify = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MODE = '__MODE__';
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};
const sess = {
  get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* ignore */ } },
  del(k) { try { sessionStorage.removeItem(k); } catch { /* ignore */ } },
};

const IC = {
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 5.6a5.2 5.2 0 0 0-7.4 0L12 7l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 21.8l8.8-8.8a5.2 5.2 0 0 0 0-7.4z"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.38A9.9 9.9 0 1 0 12.04 2zm0 1.8a8.1 8.1 0 1 1-4.2 15.02l-.3-.18-3.1.82.83-3.02-.2-.31A8.1 8.1 0 0 1 12.04 3.8zM8.6 7.5c-.2 0-.5.07-.77.36-.26.3-1 1-1 2.4s1.03 2.8 1.17 3c.15.2 2 3.2 4.9 4.36 2.4.95 2.9.76 3.4.7.52-.05 1.7-.7 1.93-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.2-.55-.34-.3-.15-1.7-.84-1.97-.94-.26-.1-.46-.15-.65.15-.2.3-.75.94-.92 1.13-.17.2-.34.22-.63.07-.3-.15-1.22-.45-2.32-1.43-.86-.76-1.44-1.7-1.6-2-.18-.28-.02-.44.13-.58.13-.13.3-.34.43-.5.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.65-1.6-.9-2.18-.23-.56-.47-.48-.65-.49z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 9h16M4 15h16"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14L21 3M21 3h-7M21 3v7M18 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/></svg>',
  expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  chevl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 16l1.5-5.2A2 2 0 0 1 8.4 9.4h7.2a2 2 0 0 1 1.9 1.4L19 16M3 16h18v3H3zM7 19v1.5M17 19v1.5"/><circle cx="7.5" cy="16" r=".6"/><circle cx="16.5" cy="16" r=".6"/></svg>',
  key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
  sliders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>',
  out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M16 8l4 4-4 4M20 12H9"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/></svg>',
  cog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
};

/* ---------- sample scenes (generic silhouettes, no brand artwork) ---------- */
const mix = (h, t, a) => { h = (h || '#444').replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); const n = parseInt(h, 16), T = t === 'w' ? 255 : 0, f = x => Math.round(x + (T - x) * a).toString(16).padStart(2, '0'); return '#' + f(n >> 16) + f((n >> 8) & 255) + f(n & 255); };
const SHAPES = {
  sedan: { b: 'M8 -22 C4 -50 12 -74 40 -82 L175 -98 C235 -152 300 -180 395 -188 L590 -192 C670 -190 735 -152 790 -110 L930 -86 C975 -78 998 -58 998 -30 L998 30 L8 30 Z', g: 'M258 -112 C300 -152 345 -170 402 -178 L585 -182 C650 -180 700 -148 748 -112 Z', seams: [330, 505, 690], r: 64, w: [200, 790], hy: -78, ty: -62, sl: 'M40 -80 L175 -98 L930 -86' },
  suv: { b: 'M6 -32 C2 -84 6 -152 26 -178 L124 -198 L640 -206 C722 -202 772 -162 822 -122 L935 -98 C980 -90 998 -68 998 -36 L998 30 L6 30 Z', g: 'M72 -120 L108 -180 L628 -188 C700 -184 748 -152 792 -120 Z', seams: [215, 400, 600], r: 70, w: [205, 795], hy: -96, ty: -110, sl: 'M26 -120 L822 -122 L935 -98' },
  coupe: { b: 'M6 -24 C4 -46 14 -60 40 -64 L190 -76 C260 -122 340 -148 430 -152 L560 -152 C650 -148 720 -114 770 -86 L920 -68 C975 -62 998 -46 998 -24 L998 30 L6 30 Z', g: 'M322 -88 C367 -124 412 -142 462 -144 L560 -144 C640 -140 695 -110 740 -86 Z', seams: [430, 640], r: 60, w: [205, 790], hy: -58, ty: -50, sl: 'M40 -64 L190 -76 L920 -68' },
};
const sceneCache = {};
function carSVG(kind, color) {
  const s = SHAPES[kind] || SHAPES.sedan, hi = mix(color, 'w', .32), lo = mix(color, 'k', .45);
  const wheel = x => `<g transform="translate(${x} 0)"><circle r="${s.r + 16}" fill="#050507"/><circle r="${s.r}" fill="#0a0a0c"/><circle r="${s.r - 8}" fill="none" stroke="#1d1f25" stroke-width="3"/><circle r="${s.r * .72}" fill="url(#rim)"/>${[0, 72, 144, 216, 288].map(a => `<path d="M-5 -${s.r * .66} L5 -${s.r * .66} L9 -${s.r * .2} L-9 -${s.r * .2}Z" fill="#161820" transform="rotate(${a})"/>`).join('')}<circle r="${s.r * .17}" fill="#c9ccd4"/><circle r="${s.r * .07}" fill="#2b2e36"/></g>`;
  return `<g><ellipse cx="500" cy="64" rx="540" ry="20" fill="#000" opacity=".6" filter="url(#bl)"/>
<path d="${s.b}" fill="url(#bd)"/>
<g clip-path="url(#cb)"><circle cx="${s.w[0]}" cy="0" r="${s.r + 18}" fill="#050507"/><circle cx="${s.w[1]}" cy="0" r="${s.r + 18}" fill="#050507"/><rect x="0" y="8" width="1000" height="30" fill="#000" opacity=".38"/></g>
<path d="${s.g}" fill="url(#gl)"/><path d="${s.sl}" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="3" stroke-linecap="round"/>
${s.seams.map(x => `<path d="M${x} -108 L${x + 5} 12" stroke="#000" stroke-opacity=".38" stroke-width="3" fill="none"/>`).join('')}
<path d="M935 ${s.hy} L992 ${s.hy + 20} L992 ${s.hy + 38} L946 ${s.hy + 30} Z" fill="#f4f6fb"/><path d="M8 ${s.ty} L36 ${s.ty - 4} L36 ${s.ty + 26} L8 ${s.ty + 26} Z" fill="#ff3b30" opacity=".9"/>
${wheel(s.w[0])}${wheel(s.w[1])}</g>`;
}
function scene(kind, color, v, label) {
  const key = [kind, color, v, label].join('|');
  if (sceneCache[key]) return sceneCache[key];
  const s = SHAPES[kind] || SHAPES.sedan, car = carSVG(kind, color);
  const refl = `<g mask="url(#rm)"><g transform="translate(0 ${2 * (s.r)}) scale(1 -1)" opacity=".55">${car}</g></g>`;
  let inner;
  if (v === 1) inner = `<g transform="translate(-930 ${640 - 64 * 2.1}) scale(2.1)">${car}</g>`;
  else if (v === 2) inner = `<g><path d="M0 0 H1200 V470 H0Z" fill="url(#bd)" transform="translate(0 0)"/><rect x="0" y="470" width="1200" height="8" fill="#000" opacity=".35"/><g clip-path="url(#pn)"><circle cx="600" cy="520" r="360" fill="#050507"/></g><circle cx="600" cy="520" r="300" fill="#0a0a0c"/><circle cx="600" cy="520" r="282" fill="none" stroke="#1d1f25" stroke-width="10"/><circle cx="600" cy="520" r="212" fill="url(#rim)"/>${Array.from({ length: 10 }, (_, k) => `<path d="M588 330 L612 330 L626 470 L574 470Z" fill="#12141a" transform="rotate(${k * 36} 600 520)"/>`).join('')}<circle cx="600" cy="520" r="62" fill="#c9ccd4"/><circle cx="600" cy="520" r="26" fill="#2b2e36"/>${Array.from({ length: 5 }, (_, k) => `<circle cx="600" cy="${520 - 46}" r="7" fill="#2b2e36" transform="rotate(${k * 72} 600 520)"/>`).join('')}<path d="M392 330 A212 212 0 0 1 520 316 L500 400 A140 140 0 0 0 440 420Z" fill="${mix(color, 'w', .15)}" opacity=".9"/></g>`;
  else if (v === 3) inner = `<g><path d="M120 40 L1080 40 L1180 330 L20 330Z" fill="url(#ws)"/><path d="M0 800 L0 390 Q600 290 1200 390 L1200 800Z" fill="#0b0d11"/><path d="M0 390 Q600 290 1200 390" fill="none" stroke="${mix(color, 'w', .35)}" stroke-width="4" opacity=".7"/><path d="M40 440 Q600 350 1160 440" fill="none" stroke="${mix(color, 'w', .35)}" stroke-width="3" stroke-dasharray="14 10" opacity=".5"/><rect x="250" y="420" width="340" height="110" rx="26" fill="#04060a"/><circle cx="340" cy="475" r="42" fill="none" stroke="${mix(color, 'w', .5)}" stroke-width="5" stroke-dasharray="190 80"/><circle cx="500" cy="475" r="42" fill="none" stroke="#6d768a" stroke-width="5" stroke-dasharray="120 150"/><rect x="720" y="410" width="340" height="190" rx="22" fill="#04060a" stroke="#262b38" stroke-width="3"/><path d="M750 560 L820 500 L880 540 L960 460 L1030 520" fill="none" stroke="${mix(color, 'w', .5)}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><rect x="740" y="620" width="300" height="10" rx="5" fill="#161a23"/><rect x="740" y="650" width="300" height="10" rx="5" fill="#161a23"/><ellipse cx="420" cy="660" rx="250" ry="215" fill="none" stroke="#14171f" stroke-width="52"/><ellipse cx="420" cy="660" rx="250" ry="215" fill="none" stroke="#2a2f3b" stroke-width="3" transform="translate(0 -22)"/><rect x="190" y="640" width="460" height="34" rx="17" fill="#14171f"/><circle cx="420" cy="657" r="52" fill="#101319" stroke="#2a2f3b" stroke-width="3"/></g>`;
  else inner = `<g transform="translate(100 ${600 - 64})">${refl}${car}</g>`;
  const warm = /^(1|0)$/.test(String(v)) && false;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice"><defs><clipPath id="cb"><path d="${s.b}"/></clipPath><clipPath id="pn"><rect x="0" y="0" width="1200" height="470"/></clipPath>
<radialGradient id="bg" cx="50%" cy="34%" r="80%"><stop offset="0" stop-color="#3b4152"/><stop offset=".5" stop-color="#14171e"/><stop offset="1" stop-color="#050608"/></radialGradient>
<linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#262a33"/><stop offset=".35" stop-color="#0d0f13"/><stop offset="1" stop-color="#040405"/></linearGradient>
<radialGradient id="sp" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<linearGradient id="bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(color, 'w', .42)}"/><stop offset=".3" stop-color="${color}"/><stop offset=".78" stop-color="${mix(color, 'k', .5)}"/><stop offset="1" stop-color="${mix(color, 'k', .75)}"/></linearGradient>
<linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9fb0d0"/><stop offset=".45" stop-color="#232a3a"/><stop offset="1" stop-color="#0a0d14"/></linearGradient>
<linearGradient id="ws" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8f9bb4"/><stop offset="1" stop-color="#1b2130"/></linearGradient>
<radialGradient id="rim" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#eef0f5"/><stop offset=".6" stop-color="#8b909e"/><stop offset="1" stop-color="#3b3f4a"/></radialGradient>
<linearGradient id="rf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<mask id="rm" maskUnits="userSpaceOnUse" x="-200" y="60" width="1500" height="260"><rect x="-200" y="64" width="1500" height="150" fill="url(#rf)"/></mask>
<filter id="bl"><feGaussianBlur stdDeviation="14"/></filter></defs>
<rect width="1200" height="800" fill="url(#bg)"/>${v === 0 || v === 1 ? `<rect y="560" width="1200" height="240" fill="url(#fl)"/><ellipse cx="600" cy="640" rx="620" ry="120" fill="url(#sp)"/>` : ''}${inner}
${label === null ? '' : `<text x="600" y="778" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" font-weight="700" letter-spacing="3" fill="#fff" opacity=".3">SAMPLE IMAGE · ${esc((label || '').toUpperCase())}</text>`}</svg>`;
  return (sceneCache[key] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
}
function U(src) {
  if (!src) return scene('sedan', '#2a2f3b', 0, 'No photo yet');
  if (src.startsWith('sample:')) { const [, k, c, v, l] = src.split(':'); return scene(k, '#' + c, +v, l); }
  return src;
}

/* ---------- seed + state ---------- */
function defaults() {
  const m = (k, c, l) => [0, 1, 2, 3].map(v => ({ type: 'image', src: `sample:${k}:${c}:${v}:${['Exterior', 'Front quarter', 'Detail', 'Interior'][v]}`, alt: `${l} ${['side view', 'front quarter', 'wheel detail', 'interior'][v]}` }));
  const car = (o) => Object.assign({ id: uid(), kind: 'sale', status: 'published', features: [], media: [], rates: [], featured: true, sample: true, created: Date.now() }, o);
  return {
    v: 1,
    settings: {
      name: 'B.I.G Autos', tagline: "We don't just sell cars, we deliver peace of mind.",
      whatsapp: '2347071578052', phone: '0906 573 4244', email: '', address: 'Osapa London, Lekki, Lagos', siteUrl: '',
      instagram: '', tiktok: '', x: '', logo: '', accent: BRAND_RED,
      heroHeadline: 'Your Next Drive Starts Here.',
      heroSub: 'Buy a car you can trust or book an exclusive ride, with full details, honest answers and a real person on WhatsApp.',
      heroImage: '', heroVideo: '', showVideos: true,
      salesIntro: "Hello B.I.G Autos, I'm interested in this car from your website. Please share more information and the inspection arrangements.",
      rentIntro: "Hello B.I.G Autos, I'd like to rent this car. Please share its availability, rates, terms and booking requirements.",
      aboutTitle: 'More than a car. Peace of mind.',
      about: "B.I.G Autos is a Lagos-based car business serving customers across Nigeria. We help you buy the right car or book an exclusive ride.\n\nFinding the right car should feel as good as driving it. Every listing on this site carries the details you need, and every enquiry goes straight to a person on WhatsApp who knows the car.\n\nWe are based in Lagos, and we sell cars nationwide.",
      hours: '',
    },
    cars: [
      car({ code: 'BIG-S-0001', slug: '2023-toyota-prado', make: 'Toyota', model: 'Prado', year: 2023, trim: '', price: 95000000, priceVisible: true, body: 'SUV', summary: 'Clean black Prado, ready for inspection.', desc: 'Sample listing for testing. The photo comes from the B.I.G Autos flyer and the price is a placeholder. Replace both with the real car before launch.', features: [], media: PHOTOS.prado23.map((src, i) => ({ type: 'image', src, alt: 'Toyota Prado ' + ['front view', 'front detail'][i] })) }),
      car({ code: 'BIG-S-0002', slug: '2017-lexus-lx-570', make: 'Lexus', model: 'LX 570', year: 2017, trim: '', price: 48000000, priceVisible: true, body: 'SUV', summary: 'Full-size Lexus SUV with a commanding look.', desc: 'Sample listing for testing. The photo comes from the B.I.G Autos flyer and the price is a placeholder. Replace both with the real car before launch.', features: [], media: PHOTOS.lx570.map((src, i) => ({ type: 'image', src, alt: 'Lexus LX 570 ' + ['front view', 'front detail'][i] })) }),
      car({ code: 'BIG-S-0003', slug: '2024-lexus-gx-550', make: 'Lexus', model: 'GX 550', year: 2024, trim: '', price: 190000000, priceVisible: true, body: 'SUV', summary: 'Latest-generation GX 550.', desc: 'Sample listing for testing. The photo comes from the B.I.G Autos flyer and the price is a placeholder. Replace both with the real car before launch.', features: [], media: PHOTOS.gx550.map((src, i) => ({ type: 'image', src, alt: 'Lexus GX 550 ' + ['front view', 'front detail'][i] })) }),
      car({ code: 'BIG-R-0001', kind: 'rent', slug: 'mercedes-benz-gle-450', make: 'Mercedes-Benz', model: 'GLE 450', year: '', trim: '', body: 'SUV coupe', summary: 'White GLE coupe for a standout arrival.', desc: 'Sample rental built from the B.I.G Autos flyer. The rate is for 12 hours. Choose how long you need on this page, then send your plan on WhatsApp and our team will confirm availability, the final price and pickup.', features: [], media: PHOTOS.gle.map((src, i) => ({ type: 'image', src, alt: 'Mercedes-Benz GLE 450 ' + ['front view', 'front detail'][i] })), rates: [{ type: 'half', amount: 500000, note: 'Price for 12 hours' }], minDuration: '12 hours' }),
      car({ code: 'BIG-R-0002', kind: 'rent', slug: '2023-toyota-prado-rental', make: 'Toyota', model: 'Prado', year: 2023, trim: '', body: 'SUV', summary: 'Black Prado for business and event days.', desc: 'Sample rental built from the B.I.G Autos flyer. The rate is for 12 hours. Choose how long you need on this page, then send your plan on WhatsApp and our team will confirm availability, the final price and pickup.', features: [], media: PHOTOS.prado23.map((src, i) => ({ type: 'image', src, alt: 'Toyota Prado ' + ['front view', 'front detail'][i] })), rates: [{ type: 'half', amount: 300000, note: 'Price for 12 hours' }], minDuration: '12 hours' }),
      car({ code: 'BIG-R-0003', kind: 'rent', slug: '2015-toyota-prado-upgraded', make: 'Toyota', model: 'Prado', year: 2015, trim: 'Upgraded to 2020 look', body: 'SUV', summary: '2015 Prado upgraded to the 2020 look. Great value.', desc: 'Sample rental built from the B.I.G Autos flyer. The rate is for 12 hours. Choose how long you need on this page, then send your plan on WhatsApp and our team will confirm availability, the final price and pickup.', features: [], media: PHOTOS.prado15.map((src, i) => ({ type: 'image', src, alt: 'Toyota Prado ' + ['front view', 'front detail'][i] })), rates: [{ type: 'half', amount: 160000, note: 'Price for 12 hours' }], minDuration: '12 hours' }),
      car({ code: 'BIG-R-0004', kind: 'rent', slug: '2017-lexus-lx-570-rental', make: 'Lexus', model: 'LX 570', year: 2017, trim: '', body: 'SUV', summary: 'Big Lexus presence for weddings and executive trips.', desc: 'Sample rental built from the B.I.G Autos flyer. The rate is for 12 hours. Choose how long you need on this page, then send your plan on WhatsApp and our team will confirm availability, the final price and pickup.', features: [], media: PHOTOS.lx570.map((src, i) => ({ type: 'image', src, alt: 'Lexus LX 570 ' + ['front view', 'front detail'][i] })), rates: [{ type: 'half', amount: 250000, note: 'Price for 12 hours' }], minDuration: '12 hours' }),
      car({ code: 'BIG-R-0005', kind: 'rent', slug: '2011-toyota-venza', make: 'Toyota', model: 'Venza', year: 2011, trim: '', body: 'Crossover', summary: 'Comfortable and affordable for everyday hires.', desc: 'Sample rental built from the B.I.G Autos flyer. The rate is for 12 hours. Choose how long you need on this page, then send your plan on WhatsApp and our team will confirm availability, the final price and pickup.', features: [], media: PHOTOS.venza.map((src, i) => ({ type: 'image', src, alt: 'Toyota Venza ' + ['front view', 'front detail'][i] })), rates: [{ type: 'half', amount: 100000, note: 'Price for 12 hours' }], minDuration: '12 hours' }),
      car({ code: 'BIG-R-0006', kind: 'rent', slug: '2024-lexus-gx-550-rental', make: 'Lexus', model: 'GX 550', year: 2024, trim: '', body: 'SUV', summary: 'Brand-new GX 550 for the biggest days.', desc: 'Sample rental built from the B.I.G Autos flyer. The rate is for 12 hours. Choose how long you need on this page, then send your plan on WhatsApp and our team will confirm availability, the final price and pickup.', features: [], media: PHOTOS.gx550.map((src, i) => ({ type: 'image', src, alt: 'Lexus GX 550 ' + ['front view', 'front detail'][i] })), rates: [{ type: 'half', amount: 500000, note: 'Price for 12 hours' }], minDuration: '12 hours' }),
    ],
    reviews: [],
  };
}
const DEFAULT_PATCH = d => d;
let S;
try { const raw = $('#state')?.textContent?.trim(); S = raw && raw !== 'null' ? JSON.parse(raw) : defaults(); } catch { S = defaults(); }
S.settings = Object.assign(defaults().settings, S.settings || {});
S.cars = S.cars || []; S.reviews = S.reviews || [];
const snap = () => JSON.stringify(S, (k, v) => k === 'savedAt' ? undefined : v);
let savedSnap = snap();
const dirty = () => snap() !== savedSnap;
/* ---------- on-device autosave (IndexedDB) so admin edits survive reloads before publishing ---------- */
const IDB = {
  open() { return new Promise((res, rej) => { try { const r = indexedDB.open('big-autos', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } }); },
  async get(k) { const db = await this.open(); return new Promise((res, rej) => { const q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); },
  async set(k, v) { const db = await this.open(); return new Promise((res, rej) => { const tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').put(v, k); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); }); },
  async del(k) { const db = await this.open(); return new Promise(res => { const tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').delete(k); tx.oncomplete = () => res(); tx.onerror = () => res(); }); },
};
let lastLocal = snap();
async function loadLocal() {
  try {
    const l = await IDB.get('state');
    if (l && l.state && l.at > (S.savedAt || 0)) { S = l.state; S.settings = Object.assign(defaults().settings, S.settings || {}); S.cars = S.cars || []; S.reviews = S.reviews || []; S.savedAt = l.at; lastLocal = snap(); }
  } catch { /* storage unavailable */ }
}
async function saveLocal(force) {
  const now = snap(); if (!force && now === lastLocal) return;
  lastLocal = now; S.savedAt = Date.now();
  try { await IDB.set('state', { at: S.savedAt, state: JSON.parse(JSON.stringify(S)) }); } catch { /* storage unavailable */ }
}
async function apiPost(path, body, method = 'POST') {
  const r = await fetch(path, { method, headers: { 'content-type': 'application/json' }, credentials: 'same-origin', body: body === undefined ? undefined : JSON.stringify(body) });
  let j = {}; try { j = await r.json(); } catch { /* not json */ }
  if (!r.ok) { const e = new Error(j.error || ('Request failed (' + r.status + ')')); e.status = r.status; throw e; }
  return j;
}
async function loadRemote() {
  if (MODE !== 'vercel') return;
  const c = new AbortController(); const tm = setTimeout(() => c.abort(), 2500);
  try {
    const [st, se] = await Promise.all([
      fetch('/api/state', { signal: c.signal }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/login', { credentials: 'same-origin', signal: c.signal }).then(r => r.ok ? r.json() : null).catch(() => null),
    ]);
    if (st && Array.isArray(st.cars)) { S = st; S.settings = Object.assign(defaults().settings, S.settings || {}); S.reviews = S.reviews || []; savedSnap = snap(); lastLocal = snap(); }
    if (se && se.admin) sess.set('big-admin', '1'); else sess.del('big-admin');
  } catch { /* offline: keep the built-in copy */ }
  clearTimeout(tm);
}
setInterval(saveLocal, 1200);
addEventListener('pagehide', () => saveLocal());
async function discardLocal() { try { await IDB.del('state'); } catch { /* ignore */ } location.reload(); }

/* ---------- business helpers ---------- */
const cfg = () => S.settings;
const carTitle = c => [c.year, c.make, c.model, c.trim].filter(Boolean).join(' ');
const isRent = c => c.kind === 'rent';
const base = () => (cfg().siteUrl || location.href.split('#')[0]).replace(/#.*$/, '');
const carHash = c => (isRent(c) ? 'rental-' : 'car-') + c.slug;
const carUrl = c => base() + '#' + carHash(c);
const LIST_OK = c => (isRent(c) ? ['published', 'temp', 'unavailable'] : ['published', 'reserved']).includes(c.status);
const mediaOf = c => (c.media || []).filter(m => m.type === 'image' || (cfg().showVideos && m.type === 'video'));
const cover = c => U((c.media || []).find(m => m.type === 'image')?.src);
const RATE_LABEL = { hourly: 'Hourly', half: '12 hours', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', custom: 'Custom' };
const RATE_UNIT = { hourly: 'hour', half: '12 hrs', daily: 'day', weekly: 'week', monthly: 'month' };
const activeRates = c => (c.rates || []).filter(r => r && (r.type === 'custom' ? true : +r.amount > 0));
const fromRate = c => {
  const r = activeRates(c); if (!r.length) return null;
  const pref = ['half', 'hourly', 'daily', 'weekly', 'monthly'];
  for (const t of pref) { const f = r.find(x => x.type === t); if (f) return f; }
  return r[0];
};
const rateOf = (c, t) => { const r = activeRates(c).find(x => x.type === t); return r && +r.amount > 0 ? +r.amount : 0; };
const TRIP = { id: '', n: 1 };
const durLabel = n => { const h = n * 12, d = h / 24; return Number.isInteger(d) ? `${h} hours (${d} day${d > 1 ? 's' : ''})` : `${h} hours`; };
function tripQuote(c, n) {
  const h = rateOf(c, 'half'), d = rateOf(c, 'daily'), base = h || (d ? d / 2 : 0) || (rateOf(c, 'hourly') * 12);
  let exact = 0;
  if (n === 1 && h) exact = h; else if (n === 2 && d) exact = d; else if (n === 14 && rateOf(c, 'weekly')) exact = rateOf(c, 'weekly'); else if (n === 60 && rateOf(c, 'monthly')) exact = rateOf(c, 'monthly');
  if (exact) return { total: exact, calc: n === 1 ? 'Rate for 12 hours' : 'Set rate for ' + durLabel(n), base };
  if (!base) return null;
  return { total: base * n, calc: `${n} × ${NGN(base)} (per 12 hours)`, base };
}
const rateText = r => (!r || r.type === 'custom' || !(+r.amount)) ? 'Contact for rates' : NGN(r.amount) + ' / ' + RATE_UNIT[r.type];
function priceText(c) {
  if (isRent(c)) return rateText(fromRate(c));
  return c.priceVisible === false || !(+c.price) ? 'Contact for price' : NGN(c.price);
}
function statusInfo(c) {
  const s = c.status;
  if (s === 'sold') return ['Sold', 'bad'];
  if (s === 'reserved') return ['Reserved', 'warn'];
  if (s === 'temp') return ['Temporarily unavailable', 'warn'];
  if (s === 'unavailable') return ['Unavailable', 'bad'];
  if (s === 'draft') return ['Draft', 'warn'];
  if (s === 'archived') return ['Archived', 'bad'];
  return [isRent(c) ? 'Available to enquire' : 'Available', ''];
}
const waNum = () => {
  let n = String(cfg().whatsapp || '').replace(/\D/g, '');
  if (n.startsWith('0')) n = '234' + n.slice(1);
  return n;
};
function waLink(text) { return 'https://wa.me/' + waNum() + '?text=' + encodeURIComponent(text); }
function specLines(c) {
  const L = [];
  if (+c.mileage) L.push('Mileage: ' + Number(c.mileage).toLocaleString('en-NG') + ' km');
  if (c.condition) L.push('Condition: ' + c.condition);
  if (c.transmission) L.push('Transmission: ' + c.transmission);
  if (c.fuel) L.push('Fuel: ' + c.fuel);
  if (c.extColor) L.push('Colour: ' + c.extColor);
  return L;
}
function waMessage(c, extra) {
  const intro = isRent(c) ? cfg().rentIntro : cfg().salesIntro;
  const lines = [intro, '', `*${carTitle(c)}*`, `Code: ${c.code}`, (isRent(c) ? 'Rate: ' : 'Price: ') + priceText(c), ...specLines(c).slice(0, 4)];
  if (extra && extra.length) lines.push('', ...extra);
  lines.push('', 'Link: ' + carUrl(c));
  return lines.join('\n');
}
const favs = () => store.get('big-favs', []);
const isFav = id => favs().includes(id);
function toggleFav(id) { const f = favs(); const i = f.indexOf(id); i < 0 ? f.push(id) : f.splice(i, 1); store.set('big-favs', f); return i < 0; }
const isAdmin = () => sess.get('big-admin') === '1';
