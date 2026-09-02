/* answers.js — parse what the student typed, and decide whether it is right.
   Accepted forms for a complex answer:
     rectangular   3+4j   4 - 3j   j   -j   0.5-0.5j   sqrt(2)/2 + sqrt(2)/2 j   3+j4   (i is accepted for j)
     polar         5∠53.13   5 ∠ 53.13°   5<53.13   5 angle 53.13   5 cis 53.13   5@53.13   (degrees unless "rad")
     exponential   5e^(j0.927)   5 exp(j pi/4)   e^(j pi)   2e^{j*2pi/3}      (radians unless °)
     real          25   -1   2sqrt(2)   pi/3
   Symbolic expressions in named variables (for identities) are parsed by a
   small recursive-descent parser and compared numerically at fixed test points.
   Plain script; exposes window.Answers.
*/
(function () {
  'use strict';
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;

  /* ---- safe numeric expression evaluator ------------------------------ */
  function evalNum(src) {
    if (typeof src !== 'string') return NaN;
    let t = src.toLowerCase().replace(/\s+/g, '')
      .replace(/√/g, 'sqrt').replace(/π/g, 'pi').replace(/[×·]/g, '*').replace(/÷/g, '/').replace(/²/g, '^2')
      .replace(/\^/g, '**').replace(/,/g, '.');
    if (t === '') return NaN;
    if (t.replace(/sqrt|pi|\d+\.?\d*|\.\d+|\*\*|[-+*/()]/g, '') !== '') return NaN;
    /* implicit multiplication: 2pi, 2sqrt(2), 2(…), (…)(…), pi(…) */
    t = t.replace(/sqrt(\d+\.?\d*|\.\d+|pi)/g, 'sqrt($1)');
    t = t.replace(/(\d|\))(?=(sqrt|pi|\())/g, '$1*').replace(/(pi)(?=(\d|sqrt|\())/g, '$1*');
    t = t.replace(/sqrt/g, 'Math.sqrt').replace(/pi/g, 'Math.PI');
    try { const v = Function('"use strict";return (' + t + ')')(); return typeof v === 'number' && isFinite(v) ? v : NaN; }
    catch (e) { return NaN; }
  }

  /* ---- complex parsing -------------------------------------------------- */
  function unitOf(s) {
    if (/°|deg/i.test(s)) return 'deg';
    if (/rad/i.test(s)) return 'rad';
    return null;
  }
  function stripUnit(s) { return s.replace(/°|degrees?|deg|radians?|rad/gi, ''); }

  function finish(re, im, form, extra) {
    const r = Math.hypot(re, im), a = Math.atan2(im, re) * R2D;
    return Object.assign({ re: re, im: im, r: r, deg: a, rad: a * D2R, form: form }, extra || {});
  }

  function parseComplex(input) {
    if (typeof input !== 'string') return null;
    let s = input.trim().replace(/\s+/g, ' ');
    if (!s) return null;
    s = s.replace(/[−–]/g, '-').replace(/∗/g, '*');
    /* strip one pair of enclosing parentheses */
    if (/^\(.*\)$/.test(s) && balanced(s.slice(1, -1))) s = s.slice(1, -1).trim();

    /* polar: r ∠ θ */
    let m = s.match(/^(.*?)\s*(?:∠|<|@|\bangle\b|\bcis\b|\bat\b)\s*(.*)$/i);
    if (m) {
      const rStr = m[1].trim(), aStr = m[2].trim();
      const unit = unitOf(aStr) || 'deg';
      const r = rStr === '' ? 1 : evalNum(rStr);
      const a = evalNum(stripUnit(aStr));
      if (isNaN(r) || isNaN(a)) return null;
      const th = unit === 'deg' ? a * D2R : a;
      return finish(r * Math.cos(th), r * Math.sin(th), 'polar', { unit: unit, rawR: r, rawAngle: a, rawDeg: unit === 'deg' ? a : a * R2D });
    }
    /* exponential: r e^(jθ) or r exp(jθ) — θ in radians unless marked ° */
    m = s.match(/^(.*?)\s*\*?\s*(?:e\s*\^|exp)\s*[({]?\s*(-?)\s*[ji]\s*\*?\s*([^)}]*)[)}]?\s*$/i)
      || s.match(/^(.*?)\s*\*?\s*(?:e\s*\^|exp)\s*[({]?\s*(-?)([^)}]*?)\s*\*?\s*[ji]\s*[)}]?\s*$/i);
    if (m) {
      const rStr = m[1].trim(), sign = m[2] === '-' ? -1 : 1, aStr = (m[3] || '').trim();
      const unit = unitOf(aStr) || 'rad';
      const r = rStr === '' ? 1 : evalNum(rStr);
      const a = aStr === '' ? 1 : evalNum(stripUnit(aStr));
      if (isNaN(r) || isNaN(a)) return null;
      const th = sign * (unit === 'deg' ? a * D2R : a);
      return finish(r * Math.cos(th), r * Math.sin(th), 'exp', { unit: unit, rawR: r, rawAngle: sign * a, rawDeg: unit === 'deg' ? sign * a : sign * a * R2D });
    }
    /* rectangular / real */
    let t = s.toLowerCase().replace(/\s+/g, '');
    t = t.replace(/([^a-z]|^)i([^a-z]|$)/g, '$1j$2').replace(/([^a-z]|^)i([^a-z]|$)/g, '$1j$2');
    t = t.replace(/\*j/g, 'j').replace(/j\*/g, 'j');
    const terms = splitTerms(t);
    if (!terms) return null;
    let re = 0, im = 0, hasJ = false;
    for (const term of terms) {
      const jc = (term.match(/j/g) || []).length;
      if (jc > 1) return null;
      if (jc === 1) {
        hasJ = true;
        let body = term.replace('j', '');
        if (body === '' || body === '+') body = '1'; else if (body === '-') body = '-1';
        const v = evalNum(body); if (isNaN(v)) return null; im += v;
      } else {
        const v = evalNum(term); if (isNaN(v)) return null; re += v;
      }
    }
    return finish(re, im, hasJ ? 'rect' : 'real', { rawR: Math.hypot(re, im) });
  }
  function balanced(s) { let d = 0; for (const c of s) { if (c === '(') d++; else if (c === ')') { d--; if (d < 0) return false; } } return d === 0; }
  function splitTerms(t) {
    const out = []; let depth = 0, cur = '';
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (c === '(') depth++; else if (c === ')') { depth--; if (depth < 0) return null; }
      if ((c === '+' || c === '-') && depth === 0 && i > 0 && !/[*/(]$/.test(cur)) { out.push(cur); cur = c; }
      else cur += c;
    }
    if (depth !== 0) return null;
    out.push(cur);
    return out.filter(x => x !== '' && x !== '+');
  }

  /* ---- comparisons ------------------------------------------------------ */
  function angDiff(a, b) { let d = (a - b) % 360; if (d > 180) d -= 360; if (d < -180) d += 360; return Math.abs(d); }
  function angNear(a, b, tol) { return angDiff(a, b) <= (tol == null ? 1.5 : tol); }

  /* target: {re, im}. Tolerance: 1% (min 0.02) on magnitude, 1.5° on angle. */
  function checkComplex(ans, target, tol) {
    tol = Object.assign({ rel: 0.01, abs: 0.02, deg: 1.5 }, tol || {});
    const rT = Math.hypot(target.re, target.im);
    if (rT < 1e-9) return ans.r <= tol.abs;
    if (Math.abs(ans.r - rT) > Math.max(tol.rel * rT, tol.abs)) return false;
    return angNear(ans.deg, Math.atan2(target.im, target.re) * R2D, tol.deg);
  }
  function near(ans, re, im, tol) { return checkComplex(ans, { re: re, im: im == null ? 0 : im }, tol); }
  function nearPolar(ans, r, deg, tol) { return near(ans, r * Math.cos(deg * D2R), r * Math.sin(deg * D2R), tol); }
  function magNear(ans, r, rel) { return Math.abs(ans.r - Math.abs(r)) <= Math.max((rel == null ? 0.01 : rel) * Math.abs(r), 0.02); }
  function checkNumber(ans, value, tol) {
    if (Math.abs(ans.im) > 0.02 * Math.max(1, Math.abs(value))) return false;
    return Math.abs(ans.re - value) <= Math.max(tol == null ? 0.01 * Math.abs(value) : tol, 0.005);
  }

  /* ---- expression parser (identities in A, B, x …) ---------------------- */
  const FUNCS = { cos: Math.cos, sin: Math.sin, tan: Math.tan, sec: x => 1 / Math.cos(x), csc: x => 1 / Math.sin(x), cot: x => 1 / Math.tan(x), sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log };
  function tokenize(src, vars) {
    const s = src.replace(/\s+/g, '').replace(/²/g, '^2').replace(/³/g, '^3').replace(/[×·]/g, '*').replace(/÷/g, '/').replace(/π/g, 'pi').replace(/√/g, 'sqrt').replace(/[−–]/g, '-').replace(/[{[]/g, '(').replace(/[}\]]/g, ')');
    const toks = []; let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/[0-9.]/.test(c)) { let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; toks.push({ t: 'num', v: parseFloat(s.slice(i, j)) }); i = j; continue; }
      if (/[a-zA-Z]/.test(c)) {
        let j = i; while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
        let word = s.slice(i, j); i = j;
        /* split "cosAcosB" / "sinAsinB" / "piA" into known pieces */
        while (word.length) {
          let hit = null;
          for (const f of Object.keys(FUNCS)) if (word.toLowerCase().startsWith(f)) { hit = f; break; }
          if (hit) { toks.push({ t: 'fn', v: hit }); word = word.slice(hit.length); continue; }
          if (word.toLowerCase().startsWith('pi')) { toks.push({ t: 'num', v: Math.PI }); word = word.slice(2); continue; }
          if (vars.indexOf(word[0]) >= 0) { toks.push({ t: 'var', v: word[0] }); word = word.slice(1); continue; }
          if (word[0] === 'e') { toks.push({ t: 'num', v: Math.E }); word = word.slice(1); continue; }
          throw new Error('I do not know the symbol "' + word[0] + '". Use ' + vars.join(', ') + ' and cos, sin, tan.');
        }
        continue;
      }
      if ('+-*/^()'.indexOf(c) >= 0) { toks.push({ t: c }); i++; continue; }
      throw new Error('Unexpected character "' + c + '".');
    }
    return toks;
  }
  function parseExpr(src, vars) {
    const toks = tokenize(src, vars); let p = 0;
    const peek = () => toks[p], take = () => toks[p++];
    const startsFactor = tk => tk && (tk.t === 'num' || tk.t === 'var' || tk.t === 'fn' || tk.t === '(');
    function expr() {
      let f = term();
      while (peek() && (peek().t === '+' || peek().t === '-')) { const op = take().t, g = term(); const a = f; f = op === '+' ? v => a(v) + g(v) : v => a(v) - g(v); }
      return f;
    }
    function term() {
      let f = unary();
      for (;;) {
        if (peek() && (peek().t === '*' || peek().t === '/')) { const op = take().t, g = unary(); const a = f; f = op === '*' ? v => a(v) * g(v) : v => a(v) / g(v); }
        else if (startsFactor(peek())) { const g = unary(); const a = f; f = v => a(v) * g(v); }
        else break;
      }
      return f;
    }
    function unary() { if (peek() && peek().t === '-') { take(); const g = unary(); return v => -g(v); } if (peek() && peek().t === '+') { take(); return unary(); } return power(); }
    function power() { const a = atom(); if (peek() && peek().t === '^') { take(); const e = unary(); return v => Math.pow(a(v), e(v)); } return a; }
    function atom() {
      const tk = take();
      if (!tk) throw new Error('The expression ends too early.');
      if (tk.t === 'num') { const c = tk.v; return () => c; }
      if (tk.t === 'var') { const n = tk.v; return v => v[n]; }
      if (tk.t === '(') { const f = expr(); if (!peek() || take().t !== ')') throw new Error('Missing a closing parenthesis.'); return f; }
      if (tk.t === 'fn') {
        const fn = FUNCS[tk.v]; let pw = null;
        if (peek() && peek().t === '^') { take(); const e = take(); if (!e || e.t !== 'num') throw new Error('Write powers of a function as cos^2(A) or cos²A.'); pw = e.v; }
        let arg;
        if (peek() && peek().t === '(') { take(); arg = expr(); if (!peek() || take().t !== ')') throw new Error('Missing a closing parenthesis after ' + tk.v + '.'); }
        else {
          /* bare argument: product of numbers and variables, e.g. cos 2A */
          const parts = [];
          while (peek() && (peek().t === 'num' || peek().t === 'var')) { const q = take(); parts.push(q.t === 'num' ? (c => () => c)(q.v) : (n => v => v[n])(q.v)); }
          if (!parts.length) throw new Error(tk.v + ' needs an argument, e.g. ' + tk.v + '(A).');
          arg = v => parts.reduce((acc, g) => acc * g(v), 1);
        }
        return pw == null ? v => fn(arg(v)) : v => Math.pow(fn(arg(v)), pw);
      }
      throw new Error('Unexpected "' + tk.t + '".');
    }
    const f = expr();
    if (p < toks.length) throw new Error('I could not read the part starting at "' + (toks[p].v != null ? toks[p].v : toks[p].t) + '".');
    return f;
  }
  const TEST_POINTS = [0.37, -1.21, 2.05, 0.83, -0.46, 1.57, -2.6, 0.11];
  /* Test points. `domain` = [lo, hi] maps the raw points (which span about
     -2.6 … 2.7) into that interval, for expressions with logs or roots. */
  function pointsFor(vars, domain) {
    const out = [];
    for (let k = 0; k < 6; k++) {
      const v = {};
      vars.forEach((n, i) => {
        let x = TEST_POINTS[(k * 3 + i * 5) % TEST_POINTS.length] + 0.13 * k;
        if (domain) x = domain[0] + (x + 2.7) / 5.4 * (domain[1] - domain[0]);
        v[n] = x;
      });
      out.push(v);
    }
    return out;
  }
  /* opts: { domain, upToConstant } — upToConstant accepts f = g + C for any constant C. */
  function exprEquals(f, g, vars, opts) {
    opts = opts || {};
    let diff0 = null;
    for (const v of pointsFor(vars, opts.domain)) {
      const a = f(v), b = g(v);
      if (!isFinite(a) || !isFinite(b)) return false;
      if (opts.upToConstant) {
        const d = a - b;
        if (diff0 === null) diff0 = d;
        else if (Math.abs(d - diff0) > 1e-6 * (1 + Math.abs(b))) return false;
      } else if (Math.abs(a - b) > 1e-6 * (1 + Math.abs(b))) return false;
    }
    return true;
  }
  /* Remove a trailing "+ C" / "+ c" / "+ const" from an antiderivative. */
  function stripConstant(s) { return s.replace(/\s*[+-]\s*(C|c|const|K|k)\s*$/, ''); }

  window.Answers = { evalNum, parseComplex, checkComplex, checkNumber, near, nearPolar, magNear, angNear, angDiff, parseExpr, exprEquals, stripConstant, D2R, R2D };
})();
