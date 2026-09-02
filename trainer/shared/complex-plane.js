/* complex-plane.js — the visual spine.
   One renderer for every complex-plane figure on the site, so that module 1's
   rotation explorer, module 4's root locus and module 8's winding diagram all
   look like the same object. Colours are fixed here on purpose:
     magnitude / length  → teal   (--mag)
     angle / rotation    → amber  (--ang)
   Plain script, no build step. Exposes window.CP.
*/
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const deg = r => r * 180 / Math.PI;
  const rad = d => d * Math.PI / 180;

  /* ---- complex arithmetic on {re, im} ---------------------------------- */
  const C = {
    of: (re, im) => ({ re: re, im: im || 0 }),
    add: (a, b) => ({ re: a.re + b.re, im: a.im + b.im }),
    sub: (a, b) => ({ re: a.re - b.re, im: a.im - b.im }),
    mul: (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re }),
    div: (a, b) => { const d = b.re * b.re + b.im * b.im; return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d }; },
    conj: a => ({ re: a.re, im: -a.im }),
    abs: a => Math.hypot(a.re, a.im),
    arg: a => Math.atan2(a.im, a.re),
    argDeg: a => deg(Math.atan2(a.im, a.re)),
    polar: (r, th) => ({ re: r * Math.cos(th), im: r * Math.sin(th) }),
    polarDeg: (r, d) => ({ re: r * Math.cos(rad(d)), im: r * Math.sin(rad(d)) }),
    pow: (a, n) => C.polar(Math.pow(C.abs(a), n), C.arg(a) * n),
    scale: (a, k) => ({ re: a.re * k, im: a.im * k }),
    /* nice formatting: 3 + 4j, -0.5 - 0.5j, j, -j, 2j, 5 */
    fmt: function (z, dp) {
      dp = dp == null ? 2 : dp;
      const f = x => { const s = Number(x.toFixed(dp)); return Object.is(s, -0) ? '0' : String(s); };
      const re = f(z.re), im = f(z.im);
      if (im === '0') return re;
      const imAbs = f(Math.abs(z.im));
      const imStr = (imAbs === '1' ? '' : imAbs) + 'j';
      if (re === '0') return (z.im < 0 ? '-' : '') + imStr;
      return re + (z.im < 0 ? ' - ' : ' + ') + imStr;
    },
    fmtPolar: function (z, dp) {
      dp = dp == null ? 2 : dp;
      const r = C.abs(z), d = C.argDeg(z);
      return Number(r.toFixed(dp)) + ' ∠ ' + Number(d.toFixed(dp)) + '°';
    },
    fmtDeg: (d, dp) => Number(d.toFixed(dp == null ? 1 : dp)) + '°',
    fmtRad: (r, dp) => Number(r.toFixed(dp == null ? 3 : dp)) + ' rad'
  };

  /* choose a grid step so that there are ~4–8 lines per half-axis */
  function niceStep(range) {
    const raw = range / 5;
    const p = Math.pow(10, Math.floor(Math.log10(raw)));
    const m = raw / p;
    const s = m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10;
    return s * p;
  }

  const COLORS = {
    grid: '#e6e9f0', axis: '#8a90a0', unit: '#c8ccd8', text: '#4b5163',
    mag: '#0f9d8a', ang: '#e08a00', z1: '#3b6fe0', z2: '#2e9e5b', prod: '#8e44ad', ink: '#1d2333'
  };

  class ComplexPlane {
    /* opts: range (half-width in units), aspect (h/w), unitCircle, grid,
             maxHeight (css px), onChange(), padding */
    constructor(canvas, opts) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.o = Object.assign({ range: 3, aspect: 1, unitCircle: true, grid: true, axes: true, maxHeight: 440, padding: 6, onChange: null, center: { re: 0, im: 0 } }, opts || {});
      this.range = this.o.range;
      this.center = this.o.center;
      this.drags = [];
      this._drag = null;
      this._bind();
      this.resize();
      const self = this;
      if (window.ResizeObserver) {
        this._ro = new ResizeObserver(() => { self.resize(); if (self.onDraw) self.onDraw(); });
        this._ro.observe(canvas.parentElement || canvas);
      } else {
        window.addEventListener('resize', () => { self.resize(); if (self.onDraw) self.onDraw(); });
      }
    }
    destroy() { if (this._ro) this._ro.disconnect(); }
    resize() {
      const w = Math.max(200, contentWidth(this.canvas.parentElement) || 320);
      let h = Math.floor(w * this.o.aspect);
      if (h > this.o.maxHeight) h = this.o.maxHeight;
      const dpr = window.devicePixelRatio || 1;
      this.w = w; this.h = h; this.dpr = dpr;
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';
      this._geom();
    }
    _geom() {
      this.cx = this.w / 2 - this.center.re * this.scale0();
      this.cy = this.h / 2 + this.center.im * this.scale0();
    }
    scale0() { return (Math.min(this.w, this.h) / 2 - this.o.padding) / this.range; }
    get scale() { return this.scale0(); }
    setRange(r) { this.range = Math.max(1e-6, r); this._geom(); }
    toPx(z) { return [this.cx + z.re * this.scale, this.cy - z.im * this.scale]; }
    toZ(px, py) { return { re: (px - this.cx) / this.scale, im: (this.cy - py) / this.scale }; }

    /* --- frame ---------------------------------------------------------- */
    begin() {
      const ctx = this.ctx;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, this.w, this.h);
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      if (this.o.grid) this.grid();
      if (this.o.axes) this.axes();
      if (this.o.unitCircle) this.unitCircle();
    }
    grid() {
      const ctx = this.ctx, s = this.scale, step = niceStep(this.range);
      ctx.strokeStyle = COLORS.grid; ctx.lineWidth = 1;
      const x0 = this.toZ(0, 0).re, x1 = this.toZ(this.w, 0).re;
      const y1 = this.toZ(0, 0).im, y0 = this.toZ(0, this.h).im;
      ctx.beginPath();
      for (let x = Math.ceil(x0 / step) * step; x <= x1; x += step) { const p = this.toPx({ re: x, im: 0 })[0]; ctx.moveTo(p, 0); ctx.lineTo(p, this.h); }
      for (let y = Math.ceil(y0 / step) * step; y <= y1; y += step) { const p = this.toPx({ re: 0, im: y })[1]; ctx.moveTo(0, p); ctx.lineTo(this.w, p); }
      ctx.stroke();
      this._step = step;
    }
    axes() {
      const ctx = this.ctx;
      ctx.strokeStyle = COLORS.axis; ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, this.cy); ctx.lineTo(this.w, this.cy);
      ctx.moveTo(this.cx, 0); ctx.lineTo(this.cx, this.h);
      ctx.stroke();
      ctx.fillStyle = COLORS.text; ctx.font = '12px -apple-system,Segoe UI,Roboto,sans-serif';
      ctx.textAlign = 'right'; ctx.textBaseline = 'top';
      ctx.fillText('Re', this.w - 4, this.cy + 3);
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('Im', this.cx + 4, 3);
      /* tick labels along axes */
      let step = this._step || niceStep(this.range);
      /* on very wide canvases the ticks crowd: label every k-th one instead */
      const every = Math.max(1, Math.ceil(26 / (step * this.scale)));
      ctx.font = '11px -apple-system,Segoe UI,Roboto,sans-serif'; ctx.fillStyle = '#9aa0b0';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      const x0 = this.toZ(0, 0).re, x1 = this.toZ(this.w, 0).re;
      for (let x = Math.ceil(x0 / step) * step; x <= x1; x += step) {
        if (Math.abs(x) < step / 2) continue;
        if (Math.round(x / step) % every !== 0) continue;
        const p = this.toPx({ re: x, im: 0 });
        if (p[0] > this.w - 18) continue;
        ctx.fillText(fmtTick(x), p[0], this.cy + 3);
      }
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const yb = this.toZ(0, this.h).im, yt = this.toZ(0, 0).im;
      for (let y = Math.ceil(yb / step) * step; y <= yt; y += step) {
        if (Math.abs(y) < step / 2) continue;
        const p = this.toPx({ re: 0, im: y });
        if (p[1] < 14) continue;
        ctx.fillText(fmtTick(y) + 'j', this.cx + 4, p[1]);
      }
    }
    unitCircle() {
      const ctx = this.ctx;
      ctx.strokeStyle = COLORS.unit; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.arc(this.cx, this.cy, this.scale, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
    }
    circle(r, opt) {
      opt = opt || {}; const ctx = this.ctx;
      ctx.strokeStyle = opt.color || COLORS.unit; ctx.lineWidth = opt.width || 1;
      if (opt.dashed) ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.arc(this.cx, this.cy, r * this.scale, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
    }

    /* --- marks ---------------------------------------------------------- */
    vector(z, opt) {
      opt = opt || {};
      const ctx = this.ctx, from = opt.from ? this.toPx(opt.from) : [this.cx, this.cy], to = this.toPx(z);
      ctx.strokeStyle = ctx.fillStyle = opt.color || COLORS.ink; ctx.lineWidth = opt.width || 2.5;
      if (opt.dashed) ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(from[0], from[1]); ctx.lineTo(to[0], to[1]); ctx.stroke();
      ctx.setLineDash([]);
      const dx = to[0] - from[0], dy = to[1] - from[1], L = Math.hypot(dx, dy);
      if (opt.head !== false && L > 10) {
        const hl = Math.min(11, L / 2), ux = dx / L, uy = dy / L;
        ctx.beginPath();
        ctx.moveTo(to[0], to[1]);
        ctx.lineTo(to[0] - hl * ux + hl * 0.5 * uy, to[1] - hl * uy - hl * 0.5 * ux);
        ctx.lineTo(to[0] - hl * ux - hl * 0.5 * uy, to[1] - hl * uy + hl * 0.5 * ux);
        ctx.closePath(); ctx.fill();
      }
      if (opt.label) this.labelAt(z, opt.label, { color: opt.color, offset: opt.offset });
    }
    point(z, opt) {
      opt = opt || {}; const ctx = this.ctx, p = this.toPx(z);
      ctx.fillStyle = opt.color || COLORS.ink;
      ctx.beginPath(); ctx.arc(p[0], p[1], opt.r || 5, 0, TAU); ctx.fill();
      if (opt.ring) { ctx.strokeStyle = opt.color || COLORS.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p[0], p[1], (opt.r || 5) + 5, 0, TAU); ctx.stroke(); }
      if (opt.label) this.labelAt(z, opt.label, { color: opt.color, offset: opt.offset });
    }
    labelAt(z, text, opt) {
      opt = opt || {}; const ctx = this.ctx, p = this.toPx(z);
      const off = opt.offset || [8, -8];
      ctx.font = (opt.bold ? 'bold ' : '') + (opt.size || 13) + 'px -apple-system,Segoe UI,Roboto,sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      const x = Math.min(this.w - ctx.measureText(text).width - 2, Math.max(2, p[0] + off[0]));
      const y = Math.min(this.h - 2, Math.max(14, p[1] + off[1]));
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.strokeText(text, x, y);
      ctx.fillStyle = opt.color || COLORS.ink; ctx.fillText(text, x, y);
    }
    text(px, py, str, opt) {
      opt = opt || {}; const ctx = this.ctx;
      ctx.font = (opt.bold ? 'bold ' : '') + (opt.size || 12) + 'px -apple-system,Segoe UI,Roboto,sans-serif';
      ctx.textAlign = opt.align || 'left'; ctx.textBaseline = opt.baseline || 'alphabetic';
      ctx.fillStyle = opt.color || COLORS.text; ctx.fillText(str, px, py);
    }
    /* angle arc from fromDeg to toDeg at pixel radius rp (default 28) */
    arc(fromDeg, toDeg, opt) {
      opt = opt || {}; const ctx = this.ctx;
      const rp = opt.radius || 28, c = opt.center ? this.toPx(opt.center) : [this.cx, this.cy];
      const a0 = -rad(fromDeg), a1 = -rad(toDeg);
      ctx.strokeStyle = opt.color || COLORS.ang; ctx.lineWidth = opt.width || 2;
      ctx.beginPath(); ctx.arc(c[0], c[1], rp, a0, a1, toDeg < fromDeg); ctx.stroke();
      if (opt.label) {
        const mid = rad((fromDeg + toDeg) / 2);
        const lx = c[0] + (rp + 12) * Math.cos(mid), ly = c[1] - (rp + 12) * Math.sin(mid);
        ctx.font = '12px -apple-system,Segoe UI,Roboto,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.strokeText(opt.label, lx, ly);
        ctx.fillStyle = opt.color || COLORS.ang; ctx.fillText(opt.label, lx, ly);
      }
    }
    segment(a, b, opt) {
      opt = opt || {}; const ctx = this.ctx, pa = this.toPx(a), pb = this.toPx(b);
      ctx.strokeStyle = opt.color || COLORS.axis; ctx.lineWidth = opt.width || 1;
      if (opt.dashed !== false) ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
      ctx.setLineDash([]);
    }
    path(pts, opt) {
      opt = opt || {}; const ctx = this.ctx;
      if (pts.length < 2) return;
      ctx.strokeStyle = opt.color || COLORS.ink; ctx.lineWidth = opt.width || 1.5;
      if (opt.dashed) ctx.setLineDash([4, 4]);
      ctx.beginPath();
      pts.forEach((z, i) => { const p = this.toPx(z); if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
      ctx.stroke(); ctx.setLineDash([]);
    }
    /* dashed drop-lines from z to both axes: the "shadows" */
    shadows(z, opt) {
      opt = opt || {};
      this.segment(z, { re: z.re, im: 0 }, { color: opt.reColor || COLORS.mag });
      this.segment(z, { re: 0, im: z.im }, { color: opt.imColor || COLORS.mag });
    }

    /* --- dragging ------------------------------------------------------- */
    /* drags: [{ get: () => z, set: (z) => void, hit?: px }] */
    setDraggables(list) { this.drags = list || []; }
    _bind() {
      const cv = this.canvas, self = this;
      const pos = ev => { const r = cv.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
      cv.addEventListener('pointerdown', ev => {
        if (!self.drags.length) return;
        const p = pos(ev);
        let best = null, bd = 1e9;
        self.drags.forEach(d => {
          const q = self.toPx(d.get());
          const dist = Math.hypot(q[0] - p[0], q[1] - p[1]);
          if (dist < (d.hit || 26) && dist < bd) { best = d; bd = dist; }
        });
        if (!best) return;
        ev.preventDefault();
        self._drag = best;
        try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ }
        cv.style.cursor = 'grabbing';
      });
      cv.addEventListener('pointermove', ev => {
        const p = pos(ev);
        if (!self._drag) {
          if (self.drags.length) {
            const over = self.drags.some(d => { const q = self.toPx(d.get()); return Math.hypot(q[0] - p[0], q[1] - p[1]) < (d.hit || 26); });
            cv.style.cursor = over ? 'grab' : 'default';
          }
          return;
        }
        ev.preventDefault();
        let z = self.toZ(p[0], p[1]);
        const lim = self.range * 1.05;
        z.re = Math.max(-lim, Math.min(lim, z.re)); z.im = Math.max(-lim, Math.min(lim, z.im));
        self._drag.set(z);
        if (self.o.onChange) self.o.onChange();
      });
      const up = ev => { if (self._drag) { self._drag = null; cv.style.cursor = 'grab'; } };
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    }
  }

  function fmtTick(x) { const s = Number(x.toFixed(6)); return String(s); }

  /* Width available for content inside an element: clientWidth minus its own
     padding. Using clientWidth alone lets the canvas grow the parent, which
     re-triggers the ResizeObserver — a runaway loop on narrow screens. */
  function contentWidth(el) {
    if (!el) return 0;
    const cs = window.getComputedStyle(el);
    return Math.floor(el.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0));
  }

  window.CP = { ComplexPlane: ComplexPlane, C: C, TAU: TAU, deg: deg, rad: rad, COLORS: COLORS, niceStep: niceStep, contentWidth: contentWidth };
})();
