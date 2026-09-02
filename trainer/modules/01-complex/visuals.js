/* visuals.js — module 1's interactive figures.
   Every figure is something the student drives (spec rule 3). Each one is
   mountable anywhere — the module page and the hint ladder both use
   Visuals.mount(name, container, preset) — so a hint can put the figure in
   front of him at the moment it matters. Names:
     'rotation'  Rotation explorer: drag a point, read rect + polar live
     'multiply'  Multiplication as rotation: two draggable factors + product
     'euler'     Euler unwrapped: slider θ; circle + sine + cosine traces
     'powers'    Powers as repeated rotation: z^k spiral
   Plain script; exposes window.Visuals.
*/
(function () {
  'use strict';
  const CP = window.CP, C = CP.C, K = CP.COLORS, TAU = CP.TAU;
  const F = (x, dp) => Number(x.toFixed(dp == null ? 2 : dp));

  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shell(container, title, note) {
    const box = el('div', 'visual');
    box.appendChild(el('h4', null, title));
    if (note) box.appendChild(el('p', 'note', note));
    const canvas = document.createElement('canvas');
    box.appendChild(canvas);
    container.appendChild(box);
    return { box: box, canvas: canvas };
  }
  function readout(box, defs) {
    const ro = el('div', 'readout');
    const cells = {};
    defs.forEach(d => { const c = el('div'); c.innerHTML = '<span class="k">' + d.k + '</span><span class="' + (d.cls || '') + '" data-v></span>'; ro.appendChild(c); cells[d.id] = c.querySelector('[data-v]'); });
    box.appendChild(ro);
    return cells;
  }
  function fmtTheta(rad) { return F(CP.deg(rad), 1) + '°  (' + F(rad, 3) + ' rad)'; }

  /* ------------------------------------------------------------------ */
  function rotation(container, preset) {
    preset = preset || {};
    const s = shell(container, 'Rotation explorer', 'Drag the point. Watch what the length and the angle do — and what the two shadows on the axes do.');
    const state = { z: preset.z ? { re: preset.z.re, im: preset.z.im } : { re: 2, im: 1.5 }, snap: !!preset.snap };
    const plane = new CP.ComplexPlane(s.canvas, { range: preset.range || 3, aspect: 0.85, maxHeight: 400, onChange: draw });
    const ctl = el('div', 'vis-controls');
    ctl.innerHTML = '<label><input type="checkbox" data-snap> snap to 0.5</label>';
    s.box.appendChild(ctl);
    const snapBox = ctl.querySelector('[data-snap]'); snapBox.checked = state.snap;
    snapBox.addEventListener('change', () => { state.snap = snapBox.checked; if (state.snap) snapZ(); draw(); });
    const ro = readout(s.box, [
      { id: 'rect', k: 'rectangular  a + bj' }, { id: 'polar', k: 'polar  r ∠ θ' },
      { id: 'mag', k: 'magnitude  r = √(a² + b²)', cls: 'mag' }, { id: 'ang', k: 'angle  θ = atan2(b, a)', cls: 'ang' },
      { id: 'trig', k: 'r (cos θ + j sin θ)' }, { id: 'exp', k: 'r e^{jθ}' }
    ]);
    function snapZ() { state.z.re = Math.round(state.z.re * 2) / 2; state.z.im = Math.round(state.z.im * 2) / 2; }
    plane.setDraggables([{ get: () => state.z, set: z => { state.z = z; if (state.snap) snapZ(); } }]);
    function draw() {
      const z = state.z, r = C.abs(z), th = C.arg(z), d = CP.deg(th);
      plane.begin();
      plane.shadows(z);
      plane.labelAt({ re: z.re / 2, im: 0 }, 'a = ' + F(z.re) + '', { color: K.z1, offset: [-10, z.im >= 0 ? 16 : -6], size: 12 });
      plane.labelAt({ re: 0, im: z.im / 2 }, 'b = ' + F(z.im), { color: K.z2, offset: [z.re >= 0 ? -52 : 6, 0], size: 12 });
      if (r > 0.15) plane.arc(0, d, { label: 'θ = ' + F(d, 1) + '°', radius: Math.min(34, r * plane.scale * 0.5) });
      plane.vector(z, { color: K.mag, width: 3 });
      plane.point(z, { color: K.ink, r: 7, ring: true, label: C.fmt(z) });
      plane.labelAt({ re: z.re / 2, im: z.im / 2 }, 'r = ' + F(r), { color: K.mag, offset: [-8, -6], bold: true });
      ro.rect.textContent = C.fmt(z, 3);
      ro.polar.textContent = F(r, 3) + ' ∠ ' + F(d, 2) + '°';
      ro.mag.textContent = '√(' + F(z.re * z.re) + ' + ' + F(z.im * z.im) + ') = ' + F(r, 3);
      ro.ang.textContent = fmtTheta(th);
      ro.trig.textContent = F(r, 3) + ' (' + F(Math.cos(th), 3) + ' + j·' + F(Math.sin(th), 3) + ')';
      ro.exp.textContent = F(r, 3) + ' e^{j' + F(th, 3) + '}';
    }
    plane.onDraw = draw; draw();
    return { destroy: () => plane.destroy(), set: z => { state.z = z; draw(); } };
  }

  /* ------------------------------------------------------------------ */
  function multiply(container, preset) {
    preset = preset || {};
    const s = shell(container, 'Multiplication as rotation', 'Drag the blue and green points. The purple point is their product. Find the rule for its length and its angle before you open the check below.');
    const st = { z1: preset.z1 || { re: 1.5, im: 0.8 }, z2: preset.z2 || { re: 0.6, im: 1.0 } };
    const plane = new CP.ComplexPlane(s.canvas, { range: 3.2, aspect: 0.85, maxHeight: 400, onChange: draw });
    const ctl = el('div', 'vis-controls');
    ctl.innerHTML = '<label><input type="checkbox" data-snap> snap to 0.5</label><button class="sm subtle" data-unit>put z₂ on the unit circle</button>';
    s.box.appendChild(ctl);
    const snapBox = ctl.querySelector('[data-snap]');
    ctl.querySelector('[data-unit]').addEventListener('click', () => { const a = C.arg(st.z2); st.z2 = C.polar(1, a); draw(); });
    const ro = readout(s.box, [
      { id: 'a', k: 'z₁  (blue)', cls: 'z1' }, { id: 'ap', k: '|z₁| ∠ z₁', cls: 'z1' },
      { id: 'b', k: 'z₂  (green)', cls: 'z2' }, { id: 'bp', k: '|z₂| ∠ z₂', cls: 'z2' },
      { id: 'p', k: 'z₁ · z₂  (purple)', cls: 'prod' }, { id: 'pp', k: '|z₁z₂| ∠ z₁z₂', cls: 'prod' }
    ]);
    const det = el('details', 'conj');
    det.innerHTML = '<summary>I have a conjecture — check it</summary><p><b>Magnitudes multiply. Angles add.</b> Multiplying by z₂ rotates z₁ by ∠z₂ and stretches it by |z₂|. Put z₂ on the unit circle and it becomes pure rotation. That single fact is what makes powers, roots, e<sup>jθ</sup>, impedance and the Fourier transform the same idea.</p>';
    s.box.appendChild(det);
    function snap(z) { if (!snapBox.checked) return z; return { re: Math.round(z.re * 2) / 2, im: Math.round(z.im * 2) / 2 }; }
    plane.setDraggables([{ get: () => st.z1, set: z => { st.z1 = snap(z); } }, { get: () => st.z2, set: z => { st.z2 = snap(z); } }]);
    snapBox.addEventListener('change', draw);
    function draw() {
      const p = C.mul(st.z1, st.z2);
      const need = Math.max(3.2, C.abs(p) * 1.15);
      plane.setRange(need);
      plane.begin();
      const d1 = C.argDeg(st.z1), d2 = C.argDeg(st.z2), dp = C.argDeg(p);
      plane.arc(0, d1, { color: K.z1, radius: 22 });
      plane.arc(0, d2, { color: K.z2, radius: 34 });
      plane.arc(0, dp, { color: K.prod, radius: 48, label: F(dp, 0) + '°' });
      plane.vector(st.z1, { color: K.z1, width: 2.5 });
      plane.vector(st.z2, { color: K.z2, width: 2.5 });
      plane.vector(p, { color: K.prod, width: 3 });
      plane.point(st.z1, { color: K.z1, r: 7, ring: true, label: 'z₁' });
      plane.point(st.z2, { color: K.z2, r: 7, ring: true, label: 'z₂' });
      plane.point(p, { color: K.prod, r: 6, label: 'z₁z₂' });
      ro.a.textContent = C.fmt(st.z1); ro.ap.textContent = F(C.abs(st.z1)) + ' ∠ ' + F(d1, 1) + '°';
      ro.b.textContent = C.fmt(st.z2); ro.bp.textContent = F(C.abs(st.z2)) + ' ∠ ' + F(d2, 1) + '°';
      ro.p.textContent = C.fmt(p); ro.pp.textContent = F(C.abs(p)) + ' ∠ ' + F(dp, 1) + '°';
    }
    plane.onDraw = draw; draw();
    return { destroy: () => plane.destroy() };
  }

  /* ------------------------------------------------------------------ */
  function euler(container, preset) {
    preset = preset || {};
    const s = shell(container, 'Euler unwrapped', 'Drag the slider (or press play). The point goes round the unit circle at angle θ. Its height is sin θ, traced to the right; its horizontal position is cos θ, traced below. e^{jθ} is the point itself.');
    const canvas = s.canvas, ctx = canvas.getContext('2d');
    const THMAX = 4 * Math.PI;
    const st = { th: preset.theta != null ? preset.theta : 0.9, playing: false, w: 0, h: 0, dpr: 1 };
    const ctl = el('div', 'vis-controls');
    ctl.innerHTML = '<button class="sm" data-play>▶ play</button><input type="range" min="0" max="' + THMAX + '" step="0.01" data-th style="flex:1;min-width:140px"><button class="sm subtle" data-reset>θ = 0</button>';
    s.box.appendChild(ctl);
    const slider = ctl.querySelector('[data-th]'), playBtn = ctl.querySelector('[data-play]');
    slider.value = st.th;
    const ro = readout(s.box, [
      { id: 'th', k: 'θ', cls: 'ang' }, { id: 'cos', k: 'cos θ  (horizontal shadow)', cls: 'z1' },
      { id: 'sin', k: 'sin θ  (vertical shadow)', cls: 'z2' }, { id: 'e', k: 'e^{jθ} = cos θ + j sin θ' }
    ]);
    slider.addEventListener('input', () => { st.th = parseFloat(slider.value); draw(); });
    ctl.querySelector('[data-reset]').addEventListener('click', () => { st.th = 0; slider.value = 0; draw(); });
    let raf = null, last = 0;
    function step(t) {
      if (!st.playing) return;
      if (last) { st.th += (t - last) / 1000 * 1.2; if (st.th > THMAX) st.th -= THMAX; slider.value = st.th; draw(); }
      last = t; raf = requestAnimationFrame(step);
    }
    playBtn.addEventListener('click', () => {
      st.playing = !st.playing; playBtn.textContent = st.playing ? '❚❚ pause' : '▶ play'; last = 0;
      if (st.playing) raf = requestAnimationFrame(step); else if (raf) cancelAnimationFrame(raf);
    });
    function resize() {
      const w = Math.max(240, CP.contentWidth(canvas.parentElement)), h = Math.min(460, Math.round(w * 0.9));
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr; canvas.height = h * dpr; canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      st.w = w; st.h = h; st.dpr = dpr;
    }
    const font = '12px -apple-system,Segoe UI,Roboto,sans-serif';
    function draw() {
      const w = st.w, h = st.h, th = st.th;
      ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.font = font;
      const colW = w * 0.42, rowH = h * 0.5;
      const R = Math.max(30, Math.min(colW, rowH) / 2 - 26);
      const cx = colW / 2 + 4, cy = rowH / 2 + 4;
      const px = cx + R * Math.cos(th), py = cy - R * Math.sin(th);
      /* sine plot geometry (right) */
      const sx0 = colW + 14, sx1 = w - 10, sW = sx1 - sx0;
      /* cosine plot geometry (below) */
      const cy0 = rowH + 14, cy1 = h - 10, cH = cy1 - cy0;
      /* --- circle --- */
      ctx.strokeStyle = K.grid; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - R - 12, cy); ctx.lineTo(cx + R + 12, cy); ctx.moveTo(cx, cy - R - 12); ctx.lineTo(cx, cy + R + 12); ctx.stroke();
      ctx.strokeStyle = K.unit; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = K.text; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText('Im', cx + 4, cy - R - 12); ctx.textAlign = 'right'; ctx.fillText('Re', cx + R + 12, cy + 3);
      /* angle arc */
      const thMod = th % TAU;
      ctx.strokeStyle = K.ang; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, Math.min(22, R * 0.4), 0, -thMod, true); ctx.stroke();
      /* shadows */
      ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
      ctx.strokeStyle = K.z1; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, cy); ctx.stroke();   /* vertical drop → cos on Re axis */
      ctx.strokeStyle = K.z2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(cx, py); ctx.stroke();   /* horizontal drop → sin on Im axis */
      ctx.setLineDash([]);
      /* radius vector */
      ctx.strokeStyle = K.mag; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
      /* cos and sin marks on axes */
      ctx.fillStyle = K.z1; ctx.beginPath(); ctx.arc(px, cy, 4, 0, TAU); ctx.fill();
      ctx.fillStyle = K.z2; ctx.beginPath(); ctx.arc(cx, py, 4, 0, TAU); ctx.fill();
      /* the point */
      ctx.fillStyle = K.ink; ctx.beginPath(); ctx.arc(px, py, 6, 0, TAU); ctx.fill();
      ctx.strokeStyle = K.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, 10, 0, TAU); ctx.stroke();
      ctx.fillStyle = K.ink; ctx.font = 'bold 12px -apple-system,Segoe UI,Roboto,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      ctx.fillText('e^{jθ}', px + 10, py - 8); ctx.font = font;
      /* --- sine plot (θ horizontal) --- */
      ctx.strokeStyle = K.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(sx0, cy); ctx.lineTo(sx1, cy); ctx.moveTo(sx0, cy - R); ctx.lineTo(sx0, cy + R); ctx.stroke();
      ctx.fillStyle = K.text; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      for (let k = 1; k <= 4; k++) { const x = sx0 + sW * (k * Math.PI / THMAX); ctx.strokeStyle = K.grid; ctx.beginPath(); ctx.moveTo(x, cy - 4); ctx.lineTo(x, cy + 4); ctx.stroke(); ctx.fillText(k === 1 ? 'π' : k + 'π', x - 6, cy + 6); }
      ctx.fillStyle = K.z2; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.fillText('sin θ', sx0 + 4, cy - R + 10);
      ctx.strokeStyle = K.z2; ctx.lineWidth = 2; ctx.beginPath();
      for (let i = 0; i <= 200; i++) { const t = th * i / 200; const x = sx0 + sW * (t / THMAX), y = cy - R * Math.sin(t); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.stroke();
      const sxNow = sx0 + sW * (th / THMAX);
      ctx.setLineDash([4, 4]); ctx.strokeStyle = K.z2; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sxNow, py); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = K.z2; ctx.beginPath(); ctx.arc(sxNow, py, 5, 0, TAU); ctx.fill();
      /* --- cosine plot (θ vertical, downwards) --- */
      ctx.strokeStyle = K.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy0); ctx.lineTo(cx, cy1); ctx.moveTo(cx - R, cy0); ctx.lineTo(cx + R, cy0); ctx.stroke();
      ctx.fillStyle = K.text; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      for (let k = 1; k <= 4; k++) { const y = cy0 + cH * (k * Math.PI / THMAX); ctx.strokeStyle = K.grid; ctx.beginPath(); ctx.moveTo(cx - 4, y); ctx.lineTo(cx + 4, y); ctx.stroke(); ctx.fillText(k === 1 ? 'π' : k + 'π', cx + 6, y); }
      ctx.fillStyle = K.z1; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText('cos θ', cx + R - 34, cy0 + 2);
      ctx.strokeStyle = K.z1; ctx.lineWidth = 2; ctx.beginPath();
      for (let i = 0; i <= 200; i++) { const t = th * i / 200; const y = cy0 + cH * (t / THMAX), x = cx + R * Math.cos(t); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.stroke();
      const cyNow = cy0 + cH * (th / THMAX);
      ctx.setLineDash([4, 4]); ctx.strokeStyle = K.z1; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, cyNow); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = K.z1; ctx.beginPath(); ctx.arc(px, cyNow, 5, 0, TAU); ctx.fill();
      /* readouts */
      ro.th.textContent = F(CP.deg(th), 1) + '°  (' + F(th, 3) + ' rad)';
      ro.cos.textContent = F(Math.cos(th), 4); ro.sin.textContent = F(Math.sin(th), 4);
      ro.e.textContent = C.fmt({ re: Math.cos(th), im: Math.sin(th) }, 3);
    }
    resize(); draw();
    let ro_;
    if (window.ResizeObserver) { ro_ = new ResizeObserver(() => { resize(); draw(); }); ro_.observe(canvas.parentElement); }
    return { destroy: () => { st.playing = false; if (raf) cancelAnimationFrame(raf); if (ro_) ro_.disconnect(); } };
  }

  /* ------------------------------------------------------------------ */
  function powers(container, preset) {
    preset = preset || {};
    const s = shell(container, 'Powers as repeated rotation', 'Type a number and pick an exponent. Each power is the previous one rotated by θ and stretched by |z| — a spiral, never a binomial expansion.');
    const st = { zText: preset.z || '3+4j', n: preset.n || 5, mode: preset.mode || 'auto' };
    const plane = new CP.ComplexPlane(s.canvas, { range: 3, aspect: 0.85, maxHeight: 400 });
    const ctl = el('div', 'vis-controls');
    ctl.innerHTML = '<label>z = <input type="text" data-z spellcheck="false"></label>' +
      '<label>n = <b data-nv></b> <input type="range" min="1" max="12" step="1" data-n></label>' +
      '<label><select data-mode><option value="auto">radius: auto</option><option value="linear">radius: linear</option><option value="log">radius: log</option></select></label>';
    s.box.appendChild(ctl);
    const zIn = ctl.querySelector('[data-z]'), nIn = ctl.querySelector('[data-n]'), nv = ctl.querySelector('[data-nv]'), modeSel = ctl.querySelector('[data-mode]');
    zIn.value = st.zText; nIn.value = st.n; modeSel.value = st.mode;
    const msg = el('p', 'note'); s.box.appendChild(msg);
    const tbl = el('div'); tbl.style.overflowX = 'auto'; s.box.appendChild(tbl);
    zIn.addEventListener('input', () => { st.zText = zIn.value; draw(); });
    nIn.addEventListener('input', () => { st.n = parseInt(nIn.value, 10); draw(); });
    modeSel.addEventListener('change', () => { st.mode = modeSel.value; draw(); });
    function draw() {
      nv.textContent = st.n;
      const z = window.Answers.parseComplex(st.zText);
      if (!z || (z.r === 0)) { msg.textContent = 'I could not read that number. Try 3+4j or 5∠53.13°.'; plane.begin(); return; }
      const r = z.r, th = z.rad;
      const pts = []; for (let k = 0; k <= st.n; k++) pts.push({ k: k, z: C.polar(Math.pow(r, k), th * k), r: Math.pow(r, k), deg: CP.deg(th) * k });
      const rmax = Math.max.apply(null, pts.map(p => p.r)), rmin = Math.min.apply(null, pts.map(p => p.r));
      let mode = st.mode; if (mode === 'auto') mode = (rmax / Math.max(rmin, 1e-9) > 40) ? 'log' : 'linear';
      const map = mode === 'log' ? (q => Math.log(1 + q)) : (q => q);
      const disp = pts.map(p => C.polar(map(p.r), th * p.k));
      plane.o.grid = mode === 'linear'; plane.o.unitCircle = false;
      plane.setRange(Math.max(mode === 'log' ? map(rmax) * 1.15 : rmax * 1.15, 1.2));
      plane.begin();
      plane.circle(map(1), { color: K.unit, dashed: true });
      if (mode === 'log') plane.text(6, plane.h - 6, 'log radius: plotted length = ln(1 + |z^k|)', { color: K.text });
      plane.path(disp, { color: K.mag, width: 1.5, dashed: true });
      disp.forEach((d, i) => {
        const p = pts[i];
        if (i > 0) plane.vector(d, { color: i === st.n ? K.prod : K.z1, width: i === st.n ? 3 : 1.5, head: false });
        plane.point(d, { color: i === st.n ? K.prod : (i === 1 ? K.z1 : K.ink), r: i === st.n ? 6 : 4, label: 'z' + sup(p.k) });
      });
      const dN = ((CP.deg(th) * st.n) % 360 + 360) % 360;
      plane.arc(0, dN, { radius: 30, label: F(dN, 1) + '°' });
      msg.innerHTML = 'z = ' + C.fmt(z) + ' = <span class="mag">' + F(r, 3) + '</span> ∠ <span class="ang">' + F(CP.deg(th), 2) + '°</span>.   ' +
        'z<sup>' + st.n + '</sup> = <span class="mag">' + F(r, 3) + '<sup>' + st.n + '</sup> = ' + F(Math.pow(r, st.n), 2) + '</span> ∠ <span class="ang">' + st.n + ' × ' + F(CP.deg(th), 2) + '° = ' + F(CP.deg(th) * st.n, 2) + '°</span>' +
        (Math.abs(CP.deg(th) * st.n) >= 360 ? ' ≡ ' + F(dN, 2) + '°' : '') + ' = ' + C.fmt(C.polar(Math.pow(r, st.n), th * st.n), 2);
      let h = '<table class="solution"><tr><th>k</th><th>|z|<sup>k</sup></th><th>k·θ</th><th>z<sup>k</sup></th></tr>';
      pts.forEach(p => { h += '<tr><td>' + p.k + '</td><td class="mag">' + F(p.r, 3) + '</td><td class="ang">' + F(p.deg, 2) + '°</td><td>' + C.fmt(p.z, 2) + '</td></tr>'; });
      tbl.innerHTML = h + '</table>';
    }
    plane.onDraw = draw; draw();
    return { destroy: () => plane.destroy() };
  }
  function sup(k) { const m = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }; return String(k).split('').map(c => m[c]).join(''); }

  const REG = { rotation: rotation, multiply: multiply, euler: euler, powers: powers };
  window.Visuals = {
    names: Object.keys(REG),
    titles: { rotation: 'Rotation explorer', multiply: 'Multiplication as rotation', euler: 'Euler unwrapped', powers: 'Powers as repeated rotation' },
    mount: function (name, container, preset) { const f = REG[name]; if (!f) return null; return f(container, preset || {}); }
  };
})();
