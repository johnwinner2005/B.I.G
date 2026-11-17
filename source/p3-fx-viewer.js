/* ---------- scroll effects ---------- */
let ticking = false, bandHalf = 0;
function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(() => fx()); } }
function fx(force) {
  ticking = false;
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  const road = $('.road'); if (road) road.style.setProperty('--prog', max > 0 ? clamp(y / max, 0, 1) : 0);
  document.documentElement.classList.toggle('solid', route.name !== 'home' || y > 60);
  if (reduce) return;
  const hb = $('[data-sy]');
  if (hb && y < innerHeight * 1.5) hb.style.transform = `translate3d(0,${y * (+hb.dataset.sy)}px,0) scale(${1 + Math.min(y, 800) * 0.0002})`;
  const bx = $('[data-bx]');
  if (bx) { if (!bandHalf || force) bandHalf = bx.scrollWidth / 10; bx.style.transform = `translate3d(${-((y * 0.6) % bandHalf)}px,0,0)`; }
  const vw = innerWidth;
  $$('.rail .card-img img').forEach(im => {
    const r = im.parentElement.getBoundingClientRect();
    if (r.right < -50 || r.left > vw + 50) return;
    im.style.setProperty('--sx', clamp(((r.left + r.width / 2) - vw / 2) / vw * -34, -22, 22).toFixed(1) + 'px');
  });
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', () => { bandHalf = 0; onScroll(); });

/* ---------- cinematic viewer ---------- */
const V = { on: false, items: [], car: null, i: 0, pos: 0, dx: 0, dy: 0, sx: 0, sy: 0, drag: false, axis: '', tx: 0, ty: 0, cx: 0, cy: 0, ox: 0, oy: 0, raf: 0, close: 0, gx: null, gy: null, g0: null };
function openViewer(car, i) {
  closeViewer();
  const items = mediaOf(car); if (!items.length) return;
  Object.assign(V, { on: true, items, car, i: clamp(i, 0, items.length - 1), pos: 0, dx: 0, dy: 0, drag: false, tx: 0, ty: 0, cx: 0, cy: 0, close: 0, g0: null });
  const el = document.createElement('div'); el.className = 'vw'; el.id = 'vw'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', carTitle(car) + ' gallery');
  const rent = isRent(car);
  el.innerHTML = `<div class="vw-bg"><img alt="" src="${esc(U(items[V.i].src))}"></div>
  <div class="vw-top"><span class="code">${esc(car.code)}</span><span class="code num" id="vw-n"></span><button class="ibtn" data-act="vw-close" aria-label="Close gallery">${IC.x}</button></div>
  <div class="vw-stage" id="vw-stage"><div class="vw-track" id="vw-track">${items.map((m, k) => `<div class="vw-slide" data-k="${k}"><div class="vw-card">${m.type === 'video' ? `<video src="${esc(m.src)}" controls playsinline preload="metadata"></video>` : `<img src="${esc(U(m.src))}" alt="${esc(m.alt || carTitle(car))}" draggable="false">`}</div></div>`).join('')}</div></div>
  <div class="vw-hint">Swipe to browse. Drag down to close.</div>
  <button class="ibtn vw-nav p" data-act="vw-prev" aria-label="Previous">${IC.chevl}</button><button class="ibtn vw-nav n" data-act="vw-next" aria-label="Next">${IC.chev}</button>
  <div class="vw-info"><div class="vw-dots" id="vw-dots">${items.map((_, k) => `<i data-act="vw-go" data-k="${k}"></i>`).join('')}</div>
  <div class="t"><div><h3>${esc(carTitle(car))}</h3><small>${esc(priceText(car))}</small></div>${car.status === 'sold' ? '' : `<a class="btn wa sm" data-act="wa" data-id="${car.id}" href="${esc(waLink(waMessage(car)))}" target="_blank" rel="noopener">${IC.wa} ${rent ? 'Enquire' : 'WhatsApp'}</a>`}</div></div>`;
  document.body.appendChild(el); document.body.classList.add('noscroll');
  const W = () => $('#vw-stage').clientWidth; V.pos = -V.i * W();
  const st = $('#vw-stage');
  st.addEventListener('pointerdown', vDown); st.addEventListener('pointermove', vMove);
  st.addEventListener('pointerup', vUp); st.addEventListener('pointercancel', vUp); 
  document.addEventListener('keydown', vKey);
  vLabels(); V.raf = requestAnimationFrame(vTick);
}
function closeViewer() {
  if (!V.on) return; V.on = false; cancelAnimationFrame(V.raf);
  document.removeEventListener('keydown', vKey);
  $('#vw')?.remove(); document.body.classList.remove('noscroll');
}
function vLabels() {
  const n = $('#vw-n'); if (n) n.textContent = (V.i + 1) + ' / ' + V.items.length;
  $$('#vw-dots i').forEach((d, k) => d.classList.toggle('on', k === V.i));
  const bg = $('.vw-bg img'); if (bg && V.items[V.i]) bg.src = V.items[V.i].type === 'video' ? U('') : U(V.items[V.i].src);
  $$('.vw-slide video').forEach((v, k) => { if (k !== V.i) v.pause(); });
}
function vGo(k) { V.i = clamp(k, 0, V.items.length - 1); vLabels(); }
function vKey(e) { if (e.key === 'Escape') closeViewer(); else if (e.key === 'ArrowRight') vGo(V.i + 1); else if (e.key === 'ArrowLeft') vGo(V.i - 1); }
function vDown(e) {
  if (e.target.closest('video')) return;
  V.drag = true; V.axis = ''; V.sx = e.clientX; V.sy = e.clientY; V.dx = 0; V.dy = 0;
  try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
}
function vMove(e) {
  const st = $('#vw-stage'); if (!st) return;
  const r = st.getBoundingClientRect();
  if (!V.drag) return;
  V.dx = e.clientX - V.sx; V.dy = e.clientY - V.sy;
  if (!V.axis && Math.hypot(V.dx, V.dy) > 8) V.axis = Math.abs(V.dx) > Math.abs(V.dy) ? 'x' : 'y';
  if (V.axis === 'y') V.close = clamp(V.dy, 0, 400);
}
function vUp() {
  if (!V.drag) return; V.drag = false;
  const W = $('#vw-stage')?.clientWidth || 1;
  if (V.axis === 'x' && Math.abs(V.dx) > Math.min(70, W * .18)) vGo(V.i + (V.dx < 0 ? 1 : -1));
  if (V.axis === 'y' && V.dy > 130) { closeViewer(); return; }
  V.dx = 0; V.dy = 0; V.close = 0; V.axis = '';
}
function vTick() {
  if (!V.on) return;
  const st = $('#vw-stage'); if (!st) return;
  const W = st.clientWidth, t = performance.now() / 1000;
  const target = -V.i * W + (V.drag && V.axis === 'x' ? V.dx : 0);
  V.pos += (target - V.pos) * .16;
  $('#vw-track').style.transform = `translate3d(${V.pos}px,${V.close ? V.close * .6 : 0}px,0)`;
  $$('.vw-slide').forEach((sl, k) => {
    const card = sl.firstElementChild, here = k === V.i;
    card.style.transform = here ? `scale(${1 - V.close / 1400})` : 'scale(.92)';
    card.style.opacity = here ? 1 - V.close / 500 : .4;
  });
  V.raf = requestAnimationFrame(vTick);
}
