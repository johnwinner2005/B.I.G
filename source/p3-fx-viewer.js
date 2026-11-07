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
  <div class="vw-stage" id="vw-stage"><div class="vw-track" id="vw-track">${items.map((m, k) => `<div class="vw-slide" data-k="${k}"><div class="vw-card">${m.type === 'video' ? `<video src="${esc(m.src)}" controls playsinline preload="metadata"></video>` : `<img src="${esc(U(m.src))}" alt="${esc(m.alt || carTitle(car))}" draggable="false">`}${m.type === 'video' ? '' : '<i class="vw-sheen"></i>'}</div></div>`).join('')}</div></div>
  ${needMotionPerm ? '<button class="vw-motion" data-act="vw-motion">Enable motion</button>' : ''}<div class="vw-hint">Drag or tilt your phone to look around</div>
  <button class="ibtn vw-nav p" data-act="vw-prev" aria-label="Previous">${IC.chevl}</button><button class="ibtn vw-nav n" data-act="vw-next" aria-label="Next">${IC.chev}</button>
  <div class="vw-info"><div class="vw-dots" id="vw-dots">${items.map((_, k) => `<i data-act="vw-go" data-k="${k}"></i>`).join('')}</div>
  <div class="t"><div><h3>${esc(carTitle(car))}</h3><small>${esc(priceText(car))}</small></div>${car.status === 'sold' ? '' : `<a class="btn wa sm" data-act="wa" data-id="${car.id}" href="${esc(waLink(waMessage(car)))}" target="_blank" rel="noopener">${IC.wa} ${rent ? 'Enquire' : 'WhatsApp'}</a>`}</div></div>`;
  document.body.appendChild(el); document.body.classList.add('noscroll');
  const W = () => $('#vw-stage').clientWidth; V.pos = -V.i * W();
  const st = $('#vw-stage');
  st.addEventListener('pointerdown', vDown); st.addEventListener('pointermove', vMove);
  st.addEventListener('pointerup', vUp); st.addEventListener('pointercancel', vUp); st.addEventListener('pointerleave', e => { if (!V.drag && e.pointerType === 'mouse') { V.tx = 0; V.ty = 0; } });
  addEventListener('deviceorientation', vGyro);
  document.addEventListener('keydown', vKey);
  vLabels(); V.raf = requestAnimationFrame(vTick);
}
function closeViewer() {
  if (!V.on) return; glDetach(); V.on = false; cancelAnimationFrame(V.raf);
  removeEventListener('deviceorientation', vGyro); document.removeEventListener('keydown', vKey);
  $('#vw')?.remove(); document.body.classList.remove('noscroll');
}
function vLabels() {
  if (V.on) glAttach(V.i);
  const n = $('#vw-n'); if (n) n.textContent = (V.i + 1) + ' / ' + V.items.length;
  $$('#vw-dots i').forEach((d, k) => d.classList.toggle('on', k === V.i));
  const bg = $('.vw-bg img'); if (bg && V.items[V.i]) bg.src = V.items[V.i].type === 'video' ? U('') : U(V.items[V.i].src);
  $$('.vw-slide video').forEach((v, k) => { if (k !== V.i) v.pause(); });
}
function vGo(k) { V.i = clamp(k, 0, V.items.length - 1); vLabels(); }
function vKey(e) { if (e.key === 'Escape') closeViewer(); else if (e.key === 'ArrowRight') vGo(V.i + 1); else if (e.key === 'ArrowLeft') vGo(V.i - 1); }
function vGyro(e) {
  if (e.gamma == null || e.beta == null) return;
  if (V.g0 == null) V.g0 = e.beta;
  V.gx = clamp(e.gamma, -25, 25) / 25 * 14; V.gy = -clamp(e.beta - V.g0, -20, 20) / 20 * 9;
}
function vDown(e) {
  if (e.target.closest('video')) return;
  V.drag = true; V.axis = ''; V.sx = e.clientX; V.sy = e.clientY; V.dx = 0; V.dy = 0;
  try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
}
function vMove(e) {
  const st = $('#vw-stage'); if (!st) return;
  const r = st.getBoundingClientRect();
  if (!V.drag) { if (e.pointerType === 'mouse') { V.tx = ((e.clientX - r.left) / r.width - .5) * 16; V.ty = -((e.clientY - r.top) / r.height - .5) * 11; } return; }
  V.dx = e.clientX - V.sx; V.dy = e.clientY - V.sy;
  if (!V.axis && Math.hypot(V.dx, V.dy) > 8) V.axis = Math.abs(V.dx) > Math.abs(V.dy) ? 'x' : 'y';
  V.tx = clamp(V.dx / r.width * 34, -20, 20); V.ty = -clamp(V.dy / r.height * 22, -14, 14);
  if (V.axis === 'y') V.close = clamp(V.dy, 0, 400);
}
function vUp() {
  if (!V.drag) return; V.drag = false;
  const W = $('#vw-stage')?.clientWidth || 1;
  if (V.axis === 'x' && Math.abs(V.dx) > Math.min(70, W * .18)) vGo(V.i + (V.dx < 0 ? 1 : -1));
  if (V.axis === 'y' && V.dy > 130) { closeViewer(); return; }
  V.dx = 0; V.dy = 0; V.close = 0; V.tx = 0; V.ty = 0; V.axis = '';
}
function vTick() {
  if (!V.on) return;
  const st = $('#vw-stage'); if (!st) return;
  const W = st.clientWidth, t = performance.now() / 1000;
  const target = -V.i * W + (V.drag && V.axis === 'x' ? V.dx : 0);
  V.pos += (target - V.pos) * .16;
  $('#vw-track').style.transform = `translate3d(${V.pos}px,${V.close ? V.close * .6 : 0}px,0)`;
  const gx = V.gx != null && !V.drag ? V.gx : V.tx, gy = V.gy != null && !V.drag ? V.gy : V.ty;
  V.cx += (gx - V.cx) * .1; V.cy += (gy - V.cy) * .1;
  const sway = reduce ? 0 : Math.sin(t * .8) * 1.8, swayY = reduce ? 0 : Math.cos(t * .62) * 1.3;
  $$('.vw-slide').forEach((s, k) => {
    const card = s.firstElementChild, off = k - V.i;
    if (Math.abs(off) > 1) { card.style.transform = ''; return; }
    const here = off === 0, ry = here ? V.cx + sway : -off * 26, rx = here ? V.cy + swayY : 0;
    card.style.transform = `perspective(1100px) rotateY(${ry}deg) rotateX(${rx}deg) translateZ(${here ? 40 : -120}px) scale(${here ? 1 - V.close / 1400 : .86})`;
    card.style.opacity = here ? 1 - V.close / 500 : .35;
    const sh = card.querySelector('.vw-sheen'); if (sh && here) sh.style.setProperty('--sh', (50 + V.cx * 3.2) + '%');
  });
  if (V.gl) { const { gl } = V.gl; gl.uniform2f(V.gl.loc, clamp((V.cx + sway) / 14, -1.3, 1.3), clamp(-(V.cy + swayY) / 9, -1.3, 1.3)); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
  const bg = $('.vw-bg img'); if (bg) bg.style.transform = `translate3d(${-V.cx * 3}px,${V.cy * 3}px,0) scale(1.15)`;
  V.raf = requestAnimationFrame(vTick);
}

/* ---------- depth scene: estimated depth + WebGL parallax ---------- */
const needMotionPerm = typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function';
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act="vw-motion"]'); if (!b) return;
  DeviceOrientationEvent.requestPermission().then(s => { if (s === 'granted') { V.g0 = null; b.remove(); } else b.textContent = 'Motion is off'; }).catch(() => { b.textContent = 'Motion unavailable'; });
});
function boxBlur(a, W, H, r) {
  const o = new Float32Array(a.length), t = new Float32Array(a.length);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let s = 0, n = 0; for (let k = -r; k <= r; k++) { const xx = x + k; if (xx >= 0 && xx < W) { s += a[y * W + xx]; n++; } } t[y * W + x] = s / n; }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let s = 0, n = 0; for (let k = -r; k <= r; k++) { const yy = y + k; if (yy >= 0 && yy < H) { s += t[yy * W + x]; n++; } } o[y * W + x] = s / n; }
  return o;
}
function makeDepth(img) {
  const W = 128, H = Math.max(48, Math.round(W * img.naturalHeight / img.naturalWidth));
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data, L = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) L[i] = (.3 * d[i * 4] + .59 * d[i * 4 + 1] + .11 * d[i * 4 + 2]) / 255;
  let E = new Float32Array(W * H), mx = 1e-6;
  for (let y = 1; y < H - 1; y++) for (let xx = 1; xx < W - 1; xx++) { const i = y * W + xx, g = Math.hypot(L[i + 1] - L[i - 1], L[i + W] - L[i - W]); E[i] = g; if (g > mx) mx = g; }
  E = boxBlur(boxBlur(E, W, H, 3), W, H, 3);
  let m2 = 1e-6; for (let i = 0; i < E.length; i++) if (E[i] > m2) m2 = E[i];
  let D = new Float32Array(W * H), lo = 9, hi = -9;
  for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) {
    const nx = xx / W - .5, ny = y / H - .5, i = y * W + xx;
    const v = .34 * (y / H) + .4 * Math.exp(-(nx * nx / .16 + (ny + .08) * (ny + .08) / .12)) + .26 * Math.min(1, E[i] / m2 * 1.6);
    D[i] = v; if (v < lo) lo = v; if (v > hi) hi = v;
  }
  D = boxBlur(D, W, H, 2);
  const out = new Uint8Array(W * H * 4);
  for (let i = 0; i < W * H; i++) { const v = Math.round(clamp((D[i] - lo) / (hi - lo || 1), 0, 1) * 255); out[i * 4] = v; out[i * 4 + 1] = v; out[i * 4 + 2] = v; out[i * 4 + 3] = 255; }
  return { out, W, H };
}
function glDetach() {
  const g = V.gl; if (!g) return;
  try { g.cv.remove(); g.img.style.opacity = ''; g.gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch { /* ignore */ }
  V.gl = null;
}
function glAttach(k) {
  glDetach();
  if (reduce) return;
  const card = $$('.vw-slide')[k]?.firstElementChild, im = card?.querySelector('img'); if (!im) return;
  const go = async () => {
    if (!V.on || V.i !== k || V.gl) return;
    try {
      const cv = document.createElement('canvas'), dpr = Math.min(devicePixelRatio || 1, 1.5);
      cv.className = 'vw-gl'; cv.width = Math.round(card.clientWidth * dpr); cv.height = Math.round(card.clientHeight * dpr);
      const gl = cv.getContext('webgl', { alpha: false, antialias: false }); if (!gl) return;
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('shader'); return s; };
      const pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;v.y=1.-v.y;gl_Position=vec4(p,0.,1.);}'));
      gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, 'precision mediump float;varying vec2 v;uniform sampler2D im,dp;uniform vec2 t;void main(){vec2 u=(v-.5)/1.16+.5;float d=texture2D(dp,v).r;vec2 o=t*(d-.5)*.11;float d2=texture2D(dp,clamp(v+o,0.,1.)).r;u+=o+t*(d2-d)*.035;gl_FragColor=texture2D(im,clamp(u,.002,.998));}'));
      gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error('link'); gl.useProgram(pr);
      const bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const pl = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(pl); gl.vertexAttribPointer(pl, 2, gl.FLOAT, false, 0, 0);
      const tex = (unit, fill) => { const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); fill(); };
      const nw = im.naturalWidth || 1200, nh = im.naturalHeight || 800, tw = Math.round(Math.min(1600, Math.max(cv.width * 1.25, nw))), th = Math.round(tw * nh / nw);
      const src = document.createElement('canvas'); src.width = tw; src.height = th; src.getContext('2d').drawImage(im, 0, 0, tw, th);
      tex(0, () => gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src));
      const dsrc = V.items[k] && V.items[k].depth;
      const dimg = dsrc ? await new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = dsrc; }) : null;
      if (!V.on || V.i !== k || V.gl) return;
      if (dimg) tex(1, () => gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, dimg));
      else { const dm = makeDepth(im); tex(1, () => gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, dm.W, dm.H, 0, gl.RGBA, gl.UNSIGNED_BYTE, dm.out)); }
      gl.uniform1i(gl.getUniformLocation(pr, 'im'), 0); gl.uniform1i(gl.getUniformLocation(pr, 'dp'), 1);
      gl.viewport(0, 0, cv.width, cv.height);
      card.insertBefore(cv, im.nextSibling); im.style.opacity = '0';
      V.gl = { cv, gl, img: im, loc: gl.getUniformLocation(pr, 't') };
    } catch { V.gl = null; }
  };
  if (im.complete && im.naturalWidth) go(); else im.addEventListener('load', go, { once: true });
}
