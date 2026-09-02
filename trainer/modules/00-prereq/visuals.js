/* visuals.js — module 0's interactive figures.
     'unitcircle'  drag a point round the unit circle: degrees, radians, sin, cos, tan, reference angle
     'quadratic'   sliders a, b, c: the parabola, its vertex, and its roots — real on the axis, or a
                   complex pair shown in a small complex plane when the discriminant goes negative
     'tangent'     a function and the tangent line at a draggable x0: the derivative as a slope
   Plain script; exposes window.Visuals (same interface as module 1).
*/
(function () {
  'use strict';
  const CP = window.CP, K = CP.COLORS, TAU = CP.TAU, A = window.Answers;
  const F = (x, dp) => Number(x.toFixed(dp == null ? 2 : dp));
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shell(container, title, note) {
    const box = el('div', 'visual'); box.appendChild(el('h4', null, title)); if (note) box.appendChild(el('p', 'note', note));
    const canvas = document.createElement('canvas'); box.appendChild(canvas); container.appendChild(box);
    return { box: box, canvas: canvas };
  }
  function readout(box, defs) {
    const ro = el('div', 'readout'), cells = {};
    defs.forEach(d => { const c = el('div'); c.innerHTML = '<span class="k">' + d.k + '</span><span class="' + (d.cls || '') + '" data-v></span>'; ro.appendChild(c); cells[d.id] = c.querySelector('[data-v]'); });
    box.appendChild(ro); return cells;
  }
  const FONT = '12px -apple-system,Segoe UI,Roboto,sans-serif';

  /* ---- a minimal function plotter on a raw canvas ---------------------- */
  function Plot(canvas, opts) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.o = Object.assign({ xr: [-3, 3], yr: [-3, 3], aspect: 0.6, maxHeight: 340 }, opts || {});
    this.resize();
  }
  Plot.prototype.resize = function () {
    const w = Math.max(240, CP.contentWidth(this.canvas.parentElement)), h = Math.min(this.o.maxHeight, Math.round(w * this.o.aspect));
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = w * dpr; this.canvas.height = h * dpr; this.canvas.style.width = w + 'px'; this.canvas.style.height = h + 'px';
    this.w = w; this.h = h; this.dpr = dpr; this.pad = { l: 34, r: 10, t: 10, b: 22 };
  };
  Plot.prototype.px = function (x) { const o = this.o; return this.pad.l + (x - o.xr[0]) / (o.xr[1] - o.xr[0]) * (this.w - this.pad.l - this.pad.r); };
  Plot.prototype.py = function (y) { const o = this.o; return this.h - this.pad.b - (y - o.yr[0]) / (o.yr[1] - o.yr[0]) * (this.h - this.pad.t - this.pad.b); };
  Plot.prototype.x = function (px) { const o = this.o; return o.xr[0] + (px - this.pad.l) / (this.w - this.pad.l - this.pad.r) * (o.xr[1] - o.xr[0]); };
  Plot.prototype.begin = function () {
    const ctx = this.ctx, o = this.o;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); ctx.clearRect(0, 0, this.w, this.h); ctx.font = FONT; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const sx = CP.niceStep((o.xr[1] - o.xr[0]) / 2), sy = CP.niceStep((o.yr[1] - o.yr[0]) / 2);
    ctx.strokeStyle = K.grid; ctx.lineWidth = 1; ctx.fillStyle = '#9aa0b0'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (let x = Math.ceil(o.xr[0] / sx) * sx; x <= o.xr[1] + 1e-9; x += sx) { const p = this.px(x); ctx.beginPath(); ctx.moveTo(p, this.pad.t); ctx.lineTo(p, this.h - this.pad.b); ctx.stroke(); ctx.fillText(String(F(x, 2)), p, this.h - this.pad.b + 4); }
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (let y = Math.ceil(o.yr[0] / sy) * sy; y <= o.yr[1] + 1e-9; y += sy) { const p = this.py(y); ctx.beginPath(); ctx.moveTo(this.pad.l, p); ctx.lineTo(this.w - this.pad.r, p); ctx.stroke(); ctx.fillText(String(F(y, 2)), this.pad.l - 4, p); }
    ctx.strokeStyle = K.axis; ctx.lineWidth = 1.2;
    if (o.yr[0] <= 0 && o.yr[1] >= 0) { ctx.beginPath(); ctx.moveTo(this.pad.l, this.py(0)); ctx.lineTo(this.w - this.pad.r, this.py(0)); ctx.stroke(); }
    if (o.xr[0] <= 0 && o.xr[1] >= 0) { ctx.beginPath(); ctx.moveTo(this.px(0), this.pad.t); ctx.lineTo(this.px(0), this.h - this.pad.b); ctx.stroke(); }
  };
  Plot.prototype.curve = function (f, color, width) {
    const ctx = this.ctx, o = this.o; ctx.strokeStyle = color || K.z1; ctx.lineWidth = width || 2; ctx.beginPath();
    let pen = false;
    for (let i = 0; i <= 400; i++) {
      const x = o.xr[0] + (o.xr[1] - o.xr[0]) * i / 400, y = f(x);
      if (!isFinite(y) || Math.abs(y) > 1e4) { pen = false; continue; }
      const px = this.px(x), py = Math.max(-50, Math.min(this.h + 50, this.py(y)));
      if (!pen) { ctx.moveTo(px, py); pen = true; } else ctx.lineTo(px, py);
    }
    ctx.stroke();
  };
  Plot.prototype.dot = function (x, y, color, r) { const ctx = this.ctx; ctx.fillStyle = color || K.ink; ctx.beginPath(); ctx.arc(this.px(x), this.py(y), r || 5, 0, TAU); ctx.fill(); };
  Plot.prototype.label = function (x, y, text, color, dx, dy) { const ctx = this.ctx; ctx.font = FONT; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.85)'; const px = this.px(x) + (dx || 8), py = this.py(y) + (dy || -8); ctx.strokeText(text, px, py); ctx.fillStyle = color || K.ink; ctx.fillText(text, px, py); };

  /* ------------------------------------------------------------------ */
  function unitcircle(container, preset) {
    preset = preset || {};
    const s = shell(container, 'The unit circle', 'Drag the point. Height is sin, horizontal position is cos, and the reference angle is the distance to the horizontal axis. Snap holds the special angles.');
    const st = { deg: preset.deg != null ? preset.deg : 40, snap: preset.snap !== false };
    const plane = new CP.ComplexPlane(s.canvas, { range: 1.35, aspect: 0.85, maxHeight: 380, grid: false, onChange: draw });
    const ctl = el('div', 'vis-controls'); ctl.innerHTML = '<label><input type="checkbox" data-snap> snap to 15°</label>'; s.box.appendChild(ctl);
    const snapBox = ctl.querySelector('[data-snap]'); snapBox.checked = st.snap; snapBox.addEventListener('change', () => { st.snap = snapBox.checked; if (st.snap) st.deg = Math.round(st.deg / 15) * 15; draw(); });
    const ro = readout(s.box, [
      { id: 'deg', k: 'angle (degrees)', cls: 'ang' }, { id: 'rad', k: 'angle (radians)', cls: 'ang' },
      { id: 'cos', k: 'cos θ  (horizontal)', cls: 'z1' }, { id: 'sin', k: 'sin θ  (height)', cls: 'z2' },
      { id: 'tan', k: 'tan θ = sin/cos' }, { id: 'ref', k: 'quadrant · reference angle' }
    ]);
    const pt = () => CP.C.polarDeg(1, st.deg);
    plane.setDraggables([{ get: pt, set: z => { let d = CP.C.argDeg(z); if (st.snap) d = Math.round(d / 15) * 15; st.deg = d; }, hit: 30 }]);
    function draw() {
      const z = pt(), d = ((st.deg % 360) + 360) % 360, rad = st.deg * Math.PI / 180;
      plane.begin();
      /* special-angle ticks */
      for (let k = 0; k < 24; k++) { const a = k * 15 * Math.PI / 180; const p1 = plane.toPx({ re: 0.96 * Math.cos(a), im: 0.96 * Math.sin(a) }), p2 = plane.toPx({ re: Math.cos(a), im: Math.sin(a) }); plane.ctx.strokeStyle = k % 6 === 0 ? K.axis : K.unit; plane.ctx.lineWidth = 1; plane.ctx.beginPath(); plane.ctx.moveTo(p1[0], p1[1]); plane.ctx.lineTo(p2[0], p2[1]); plane.ctx.stroke(); }
      [[0, '0'], [30, 'π/6'], [45, 'π/4'], [60, 'π/3'], [90, 'π/2'], [120, '2π/3'], [135, '3π/4'], [150, '5π/6'], [180, 'π'], [210, '7π/6'], [225, '5π/4'], [240, '4π/3'], [270, '3π/2'], [300, '5π/3'], [315, '7π/4'], [330, '11π/6']].forEach(t => {
        const q = CP.C.polarDeg(1.17, t[0]); plane.text(plane.toPx(q)[0], plane.toPx(q)[1], t[1], { color: '#9aa0b0', align: 'center', baseline: 'middle', size: 11 });
      });
      plane.shadows(z, { reColor: K.z1, imColor: K.z2 });
      plane.segment({ re: z.re, im: 0 }, { re: 0, im: 0 }, { color: K.z1, dashed: false, width: 3 });
      plane.segment({ re: 0, im: z.im }, { re: 0, im: 0 }, { color: K.z2, dashed: false, width: 3 });
      /* reference angle arc */
      const refBase = d < 90 ? 0 : d < 180 ? 180 : d < 270 ? 180 : 360;
      if (Math.abs(d - refBase) > 0.5 && Math.abs(d % 180) > 0.5) plane.arc(refBase, d, { color: '#c9a0dc', radius: 40, width: 2 });
      plane.arc(0, st.deg, { color: K.ang, radius: 24, label: F(d, 0) + '°' });
      plane.vector(z, { color: K.mag, width: 3, head: false });
      plane.point(z, { color: K.ink, r: 7, ring: true });
      plane.labelAt({ re: z.re, im: 0 }, 'cos = ' + F(z.re), { color: K.z1, offset: [z.re >= 0 ? 4 : -66, z.im >= 0 ? 16 : -6], size: 12 });
      plane.labelAt({ re: 0, im: z.im }, 'sin = ' + F(z.im), { color: K.z2, offset: [z.re >= 0 ? -64 : 6, 0], size: 12 });
      ro.deg.textContent = F(d, 1) + '°' + (st.deg < 0 || st.deg >= 360 ? '  (' + F(st.deg, 1) + '°)' : '');
      ro.rad.textContent = F(rad, 4) + ' rad' + (radName(d) ? '  = ' + radName(d) : '');
      ro.cos.textContent = F(Math.cos(rad), 4); ro.sin.textContent = F(Math.sin(rad), 4);
      ro.tan.textContent = Math.abs(Math.cos(rad)) < 1e-6 ? 'undefined (cos = 0)' : F(Math.tan(rad), 4);
      const quad = d < 90 ? 'I' : d < 180 ? 'II' : d < 270 ? 'III' : 'IV';
      const ref = d < 90 ? d : d < 180 ? 180 - d : d < 270 ? d - 180 : 360 - d;
      ro.ref.textContent = quad + ' · ' + F(ref, 1) + '°';
    }
    function radName(d) { const map = { 0: '0', 30: 'π/6', 45: 'π/4', 60: 'π/3', 90: 'π/2', 120: '2π/3', 135: '3π/4', 150: '5π/6', 180: 'π', 210: '7π/6', 225: '5π/4', 240: '4π/3', 270: '3π/2', 300: '5π/3', 315: '7π/4', 330: '11π/6' }; const k = Math.round(d); return Math.abs(d - k) < 0.05 ? map[k] || '' : ''; }
    plane.onDraw = draw; draw();
    return { destroy: () => plane.destroy() };
  }

  /* ------------------------------------------------------------------ */
  function quadratic(container, preset) {
    preset = preset || {};
    const s = shell(container, 'A quadratic and its roots', 'Slide a, b, c. Roots are where the curve crosses the axis. Push c up until the curve lifts off the axis: the roots do not vanish — they leave the real line as a mirror pair.');
    const st = { a: preset.a != null ? preset.a : 1, b: preset.b != null ? preset.b : -4, c: preset.c != null ? preset.c : 3 };
    const plot = new Plot(s.canvas, { xr: [-6, 6], yr: [-10, 14], aspect: 0.62 });
    const ctl = el('div', 'vis-controls');
    ctl.innerHTML = ['a', 'b', 'c'].map(k => '<label>' + k + ' = <b data-v="' + k + '"></b> <input type="range" min="' + (k === 'a' ? 0.25 : -12) + '" max="' + (k === 'a' ? 4 : 14) + '" step="0.25" data-k="' + k + '"></label>').join('');
    s.box.appendChild(ctl);
    ctl.querySelectorAll('input').forEach(inp => { inp.value = st[inp.dataset.k]; inp.addEventListener('input', () => { st[inp.dataset.k] = parseFloat(inp.value); draw(); }); });
    const cpBox = el('div'); cpBox.style.cssText = 'margin-top:8px'; s.box.appendChild(cpBox);
    const cpCanvas = document.createElement('canvas'); cpBox.appendChild(cpCanvas);
    const plane = new CP.ComplexPlane(cpCanvas, { range: 7, aspect: 0.5, maxHeight: 200, unitCircle: false, grid: false });
    const ro = readout(s.box, [{ id: 'eq', k: 'y =' }, { id: 'disc', k: 'discriminant b² − 4ac', cls: 'ang' }, { id: 'roots', k: 'roots', cls: 'prod' }, { id: 'vertex', k: 'vertex (−b/2a, …)', cls: 'mag' }]);
    function draw() {
      ctl.querySelectorAll('[data-v]').forEach(b => { b.textContent = st[b.dataset.v]; });
      const a = st.a, b = st.b, c = st.c, disc = b * b - 4 * a * c, xv = -b / (2 * a), yv = a * xv * xv + b * xv + c;
      plot.begin();
      plot.curve(x => a * x * x + b * x + c, K.z1, 2.5);
      plot.dot(xv, yv, K.mag, 5); plot.label(xv, yv, 'vertex', K.mag, 8, 14);
      let roots;
      if (disc >= 0) {
        const r1 = (-b - Math.sqrt(disc)) / (2 * a), r2 = (-b + Math.sqrt(disc)) / (2 * a);
        plot.dot(r1, 0, K.prod, 6); plot.dot(r2, 0, K.prod, 6);
        roots = disc === 0 ? 'double root at ' + F(r1) : F(r1) + ' and ' + F(r2);
        plane.begin(); plane.point({ re: r1, im: 0 }, { color: K.prod, r: 6 }); plane.point({ re: r2, im: 0 }, { color: K.prod, r: 6 });
        plane.text(6, 14, 'roots in the complex plane: both on the real axis', { color: K.text });
      } else {
        const re = -b / (2 * a), im = Math.sqrt(-disc) / (2 * a);
        roots = F(re) + ' ± ' + F(im) + 'j';
        plane.begin(); plane.point({ re: re, im: im }, { color: K.prod, r: 6, label: F(re) + ' + ' + F(im) + 'j' }); plane.point({ re: re, im: -im }, { color: K.prod, r: 6, label: F(re) + ' − ' + F(im) + 'j', offset: [8, 16] });
        plane.segment({ re: re, im: im }, { re: re, im: -im }, { color: K.prod });
        plane.text(6, 14, 'roots in the complex plane: a conjugate pair', { color: K.text });
      }
      ro.eq.textContent = a + 'x² ' + (b < 0 ? '− ' + (-b) : '+ ' + b) + 'x ' + (c < 0 ? '− ' + (-c) : '+ ' + c);
      ro.disc.textContent = F(disc) + (disc < 0 ? '  (negative → complex roots)' : disc === 0 ? '  (zero → double root)' : '  (positive → two real roots)');
      ro.roots.textContent = roots; ro.vertex.textContent = '(' + F(xv) + ', ' + F(yv) + ')';
    }
    let ro_; if (window.ResizeObserver) { ro_ = new ResizeObserver(() => { plot.resize(); draw(); }); ro_.observe(s.canvas.parentElement); }
    plane.onDraw = draw; draw();
    return { destroy: () => { plane.destroy(); if (ro_) ro_.disconnect(); } };
  }

  /* ------------------------------------------------------------------ */
  function tangent(container, preset) {
    preset = preset || {};
    const s = shell(container, 'The derivative as a slope', 'Drag the point along the curve (or use the slider). The amber line is the tangent at x₀; its slope is f′(x₀). Type your own function to explore.');
    const st = { fnText: preset.fn || 'x*exp(2x)', x0: preset.x0 != null ? preset.x0 : 0.5, xr: preset.range || [-2, 1.5] };
    const plot = new Plot(s.canvas, { xr: st.xr.slice(), yr: [-3, 3], aspect: 0.62 });
    const ctl = el('div', 'vis-controls');
    ctl.innerHTML = '<label>f(x) = <input type="text" data-fn spellcheck="false" style="width:170px"></label><label>x₀ = <b data-x0></b> <input type="range" data-slider step="0.01"></label>';
    s.box.appendChild(ctl);
    const fnIn = ctl.querySelector('[data-fn]'), slider = ctl.querySelector('[data-slider]'), x0Lab = ctl.querySelector('[data-x0]');
    fnIn.value = st.fnText; slider.min = st.xr[0]; slider.max = st.xr[1]; slider.value = st.x0;
    const msg = el('p', 'note'); s.box.appendChild(msg);
    const ro = readout(s.box, [{ id: 'fx', k: 'f(x₀)', cls: 'z1' }, { id: 'dfx', k: "f′(x₀) — slope of the tangent", cls: 'ang' }, { id: 'line', k: 'tangent line' }]);
    let f = null;
    function compile() { try { f = A.parseExpr(st.fnText, ['x']); msg.textContent = ''; } catch (e) { f = null; msg.textContent = 'Could not read f(x): ' + e.message; } }
    fnIn.addEventListener('input', () => { st.fnText = fnIn.value; compile(); fit(); draw(); });
    slider.addEventListener('input', () => { st.x0 = parseFloat(slider.value); draw(); });
    function fit() {
      if (!f) return;
      let lo = Infinity, hi = -Infinity;
      for (let i = 0; i <= 200; i++) { const y = f({ x: st.xr[0] + (st.xr[1] - st.xr[0]) * i / 200 }); if (isFinite(y)) { lo = Math.min(lo, y); hi = Math.max(hi, y); } }
      if (!isFinite(lo)) return;
      const padY = (hi - lo) * 0.15 || 1; plot.o.yr = [Math.min(lo - padY, -0.5), Math.max(hi + padY, 0.5)];
    }
    function deriv(x) { const h = 1e-4; return (f({ x: x + h }) - f({ x: x - h })) / (2 * h); }
    function draw() {
      x0Lab.textContent = F(st.x0);
      plot.begin();
      if (!f) return;
      plot.curve(x => f({ x: x }), K.z1, 2.5);
      const y0 = f({ x: st.x0 }), m = deriv(st.x0);
      if (isFinite(y0) && isFinite(m)) {
        plot.curve(x => y0 + m * (x - st.x0), K.ang, 2);
        /* slope triangle */
        const dx = (st.xr[1] - st.xr[0]) * 0.12;
        const ctx = plot.ctx; ctx.strokeStyle = K.ang; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath();
        ctx.moveTo(plot.px(st.x0), plot.py(y0)); ctx.lineTo(plot.px(st.x0 + dx), plot.py(y0)); ctx.lineTo(plot.px(st.x0 + dx), plot.py(y0 + m * dx)); ctx.stroke(); ctx.setLineDash([]);
        plot.dot(st.x0, y0, K.ink, 6);
        plot.label(st.x0, y0, 'x₀ = ' + F(st.x0), K.ink, 8, -10);
        ro.fx.textContent = F(y0, 4); ro.dfx.textContent = F(m, 4);
        ro.line.textContent = 'y = ' + F(y0, 3) + ' + ' + F(m, 3) + '(x − ' + F(st.x0, 2) + ')';
      }
    }
    /* drag the point along the curve with the pointer */
    const cv = s.canvas;
    let dragging = false;
    const xAt = ev => { const r = cv.getBoundingClientRect(); return plot.x(ev.clientX - r.left); };
    cv.addEventListener('pointerdown', ev => { dragging = true; try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* */ } st.x0 = Math.max(st.xr[0], Math.min(st.xr[1], xAt(ev))); slider.value = st.x0; draw(); ev.preventDefault(); });
    cv.addEventListener('pointermove', ev => { if (!dragging) return; st.x0 = Math.max(st.xr[0], Math.min(st.xr[1], xAt(ev))); slider.value = st.x0; draw(); ev.preventDefault(); });
    const up = () => { dragging = false; }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    compile(); fit(); draw();
    let ro_; if (window.ResizeObserver) { ro_ = new ResizeObserver(() => { plot.resize(); draw(); }); ro_.observe(cv.parentElement); }
    return { destroy: () => { if (ro_) ro_.disconnect(); } };
  }

  const REG = { unitcircle: unitcircle, quadratic: quadratic, tangent: tangent };
  window.Visuals = {
    names: Object.keys(REG),
    titles: { unitcircle: 'The unit circle', quadratic: 'A quadratic and its roots', tangent: 'The derivative as a slope' },
    mount: function (name, container, preset) { const f = REG[name]; if (!f) return null; return f(container, preset || {}); }
  };
})();
