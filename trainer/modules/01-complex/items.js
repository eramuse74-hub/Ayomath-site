/* items.js — module 1 item bank: complex numbers and Euler's formula.
   Each item is data. Shape:
     id, title, kind ('complex' | 'number' | 'choice' | 'expr')
     params + make(p) → { prompt, answer, solution }     (gen() → fresh params for the quick drill)
     reframe            the one sentence the item is built backwards from
     hints[3]           levels 1–3 of the ladder (string or {text, visual, preset}); level 4 is `solution`
     misconceptions[]   { key, test(ans, q), response, visual?, preset? }   — for choice items: { key, response } matched by option.mis
   Wrong mental models are named; arithmetic is not corrected. See docs/Special/trainer-site-spec.md §3.
   Math is written in KaTeX between $…$. j is the imaginary unit throughout (engineering convention).
*/
(function () {
  'use strict';
  const A = window.Answers, C = window.CP.C, D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const F = (x, dp) => Number(x.toFixed(dp == null ? 2 : dp));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const nz = (a, b) => { let v = 0; while (v === 0) v = rint(a, b); return v; };
  const P = (r, deg) => ({ re: r * Math.cos(deg * D2R), im: r * Math.sin(deg * D2R) });
  const near = (ans, z) => A.checkComplex(ans, z);
  const nearP = (ans, r, deg) => A.nearPolar(ans, r, deg);
  const cx = (re, im) => ({ re: re, im: im });
  const fmtZ = z => C.fmt(z, 3);
  const fmtTex = z => {                          /* 3 + 4j, -1 + j, 2j, 5, as TeX */
    const f = x => Number(x.toFixed(3));
    const re = f(z.re), im = f(z.im);
    if (im === 0) return String(re);
    const imAbs = Math.abs(im) === 1 ? '' : String(Math.abs(im));
    if (re === 0) return (im < 0 ? '-' : '') + imAbs + 'j';
    return re + (im < 0 ? ' - ' : ' + ') + imAbs + 'j';
  };
  const NICE = [30, 45, 60, 120, 135, 150, -30, -45, -60, -120, -135, -150, 210, 240, 300, 315];
  const norm = d => ((d % 360) + 360) % 360;
  const sameDeg = (a, b) => A.angNear(a, b, 1.5);
  /* the student wrote a polar angle in degrees whose *number* is the answer in radians */
  const degRadSlip = (ans, targetDeg) => ans.form === 'polar' && ans.unit === 'deg' && Math.abs(Math.abs(ans.rawAngle) - Math.abs(targetDeg * D2R)) < 0.03;

  const ITEMS = [

  /* ================= A. REPRESENTATION ================================ */
  {
    id: 'cx-polar-01', title: 'a + bj → polar', kind: 'complex',
    params: { a: 3, b: 4 },
    gen: () => ({ a: nz(-6, 6), b: nz(-6, 6) }),
    make: p => {
      const z = cx(p.a, p.b), r = C.abs(z), d = C.argDeg(z);
      return {
        prompt: 'Write $' + fmtTex(z) + '$ in polar form, $r\\angle\\theta$.',
        answer: { re: z.re, im: z.im },
        solution: '<p>$r = \\sqrt{' + p.a + '^2 + ' + p.b + '^2} = \\sqrt{' + (p.a * p.a + p.b * p.b) + '} = ' + F(r, 3) + '$. The angle is the direction from the origin to the point: $\\theta = \\operatorname{atan2}(' + p.b + ', ' + p.a + ') = ' + F(d, 2) + '^\\circ$' +
          (p.a < 0 ? ' — note that a plain $\\arctan(b/a)$ would give $' + F(Math.atan(p.b / p.a) * R2D, 2) + '^\\circ$, the angle of the point <i>opposite</i> this one; the point is in quadrant ' + (p.b >= 0 ? 'II' : 'III') + ' so you add or subtract $180^\\circ$.' : '.') +
          '</p><p>So $' + fmtTex(z) + ' = ' + F(r, 3) + '\\angle ' + F(d, 2) + '^\\circ = ' + F(r, 3) + '\\,e^{j' + F(d * D2R, 3) + '}$.</p><p><b>The reframe:</b> a complex number is a length and a direction. Rectangular form tells you the two shadows; polar form tells you the arrow.</p>'
      };
    },
    reframe: 'A complex number is a length and a direction. Rectangular form is the two shadows on the axes; polar form is the arrow itself.',
    visual: 'rotation',
    hints: [
      'Draw it. Where does the point sit, and what would you have to measure with a ruler and a protractor to describe it without coordinates?',
      { text: 'The magnitude is a length — the hypotenuse of a right triangle whose legs are the real and imaginary parts. The angle is measured from the positive real axis, counter-clockwise. Drag the point to it and watch the readouts.', visual: 'rotation', preset: { z: { re: 3, im: 4 } } },
      'So $r = \\sqrt{a^2 + b^2}$ and $\\theta = \\operatorname{atan2}(b, a)$ — that is $\\arctan(b/a)$ corrected for the quadrant. Which quadrant is this point in? Compute $r$ first and then decide the angle.'
    ],
    solution: { visual: 'rotation', preset: { z: { re: 3, im: 4 } } },
    misconceptions: [
      { key: 'deg-rad', test: (ans, q) => degRadSlip(ans, C.argDeg(q.answer)),
        response: 'Your angle is the right <i>number</i> in radians, but you have written it as degrees (or without a unit). $0.927$ rad is $53.1^\\circ$. Both are fine — the point is knowing which one you are holding, because every course in year four mixes them freely and a calculator in the wrong mode is the classic exam killer.' },
      { key: 'add-components', test: (ans, q) => A.magNear(ans, Math.abs(q.params.a) + Math.abs(q.params.b), 0.02) && !A.magNear(ans, C.abs(q.answer)),
        response: 'You have added the two legs. Magnitude is a <i>length</i> — the hypotenuse — so it is Pythagoras, $\\sqrt{a^2+b^2}$, not $a + b$. Drag the point in the explorer and watch the length: it never equals the sum of the shadows.', visual: 'rotation' },
      { key: 'forgot-sqrt', test: (ans, q) => A.magNear(ans, q.params.a * q.params.a + q.params.b * q.params.b, 0.02) && !A.magNear(ans, C.abs(q.answer)),
        response: 'That is $a^2 + b^2$, the magnitude <i>squared</i>. You have $|z|^2$ — take the square root. (Worth remembering: $|z|^2 = z\\bar z$ is a real number, and later you will often want exactly that.)' },
      { key: 'quadrant', test: (ans, q) => q.params.a < 0 && A.magNear(ans, C.abs(q.answer)) && sameDeg(ans.deg, Math.atan(q.params.b / q.params.a) * R2D),
        response: 'The magnitude is right, and the angle is what a calculator\'s $\\arctan(b/a)$ returns — but $\\arctan$ cannot tell $-3-4j$ from $3+4j$, because $(-4)/(-3) = 4/3$. Look at which quadrant the point is actually in and add or subtract $180^\\circ$. That is all $\\operatorname{atan2}$ does.', visual: 'rotation' }
    ]
  },

  {
    id: 'cx-rect-01', title: 'polar → a + bj', kind: 'complex',
    params: { r: 5, d: -36.87 },
    gen: () => ({ r: pick([2, 3, 4, 5, 10]), d: pick(NICE) }),
    make: p => {
      const z = P(p.r, p.d);
      return {
        prompt: 'Write $' + p.r + '\\angle ' + p.d + '^\\circ$ in rectangular form, $a + bj$.',
        answer: z,
        solution: '<p>The real part is the horizontal shadow, $r\\cos\\theta$; the imaginary part is the vertical shadow, $r\\sin\\theta$.</p><p>$a = ' + p.r + '\\cos(' + p.d + '^\\circ) = ' + F(z.re, 3) + '$, $\\quad b = ' + p.r + '\\sin(' + p.d + '^\\circ) = ' + F(z.im, 3) + '$.</p><p>So $' + p.r + '\\angle ' + p.d + '^\\circ = ' + fmtTex({ re: F(z.re, 2), im: F(z.im, 2) }) + '$.' + (p.d < 0 ? ' A negative angle is clockwise from the real axis, so the point is below it: the imaginary part is negative.' : '') + '</p>'
      };
    },
    reframe: 'Real part = r cos θ is the horizontal shadow. Imaginary part = r sin θ is the vertical shadow.',
    visual: 'rotation',
    hints: [
      'You are given the arrow: its length and its direction. What two numbers describe where its tip lands?',
      { text: 'Drop perpendiculars from the tip to the two axes. Each shadow is a side of a right triangle with hypotenuse $r$ and angle $\\theta$ at the origin. Which trig function gives the adjacent side, which gives the opposite?', visual: 'rotation', preset: { z: P(5, -36.87) } },
      'Real part $= r\\cos\\theta$, imaginary part $= r\\sin\\theta$. Mind the sign of the angle: negative means clockwise, so which axis does the point end up below?'
    ],
    solution: { visual: 'rotation', preset: { z: P(5, -36.87) } },
    misconceptions: [
      { key: 'sign-of-angle', test: (ans, q) => near(ans, C.conj(q.answer)) && Math.abs(q.answer.im) > 0.05,
        response: 'You have the mirror image: the conjugate. A negative angle is measured <i>clockwise</i>, so the point is on the other side of the real axis from where you put it. Sign of the angle = sign of the imaginary part.' },
      { key: 'swapped', test: (ans, q) => Math.abs(q.answer.re - q.answer.im) > 0.05 && near(ans, cx(q.answer.im, q.answer.re)),
        response: 'You have put the cosine on the imaginary axis and the sine on the real one. The <i>horizontal</i> shadow is $r\\cos\\theta$ (adjacent), the <i>vertical</i> one is $r\\sin\\theta$ (opposite). Drag the point in the explorer until the angle is near $0^\\circ$ and watch which shadow survives.', visual: 'rotation' },
      { key: 'rad-as-deg', test: (ans, q) => near(ans, C.polar(q.params.r, q.params.d)),
        response: 'You evaluated $\\cos$ and $\\sin$ of the angle in radians. It was given in degrees. Your calculator is in the wrong mode — or you are.' }
    ]
  },

  {
    id: 'cx-quad-01', title: 'quadrant II angle', kind: 'complex',
    params: { a: -1, b: 1 },
    gen: () => ({ a: -rint(1, 5), b: rint(1, 5) }),
    make: p => {
      const z = cx(p.a, p.b), r = C.abs(z), d = C.argDeg(z);
      return {
        prompt: 'Write $' + fmtTex(z) + '$ in polar form.',
        answer: z,
        solution: '<p>$r = \\sqrt{' + (p.a * p.a) + ' + ' + (p.b * p.b) + '} = ' + F(r, 3) + '$.</p><p>The point has negative real part and positive imaginary part: quadrant II. A calculator gives $\\arctan(' + p.b + '/' + p.a + ') = ' + F(Math.atan(p.b / p.a) * R2D, 2) + '^\\circ$, which is the angle of $' + fmtTex(cx(-p.a, -p.b)) + '$, the point diametrically opposite. Add $180^\\circ$: $\\theta = ' + F(d, 2) + '^\\circ$.</p><p>$' + fmtTex(z) + ' = ' + F(r, 3) + '\\angle ' + F(d, 2) + '^\\circ$.</p>'
      };
    },
    reframe: 'The angle is where the point is, not what arctan says. arctan(b/a) cannot see the signs of a and b separately.',
    visual: 'rotation',
    hints: [
      'Sketch the point before touching a calculator. Which quadrant is it in? Roughly what angle does that mean — between which two multiples of $90^\\circ$?',
      { text: 'Your calculator\'s $\\arctan(b/a)$ only ever returns angles between $-90^\\circ$ and $+90^\\circ$ — quadrants I and IV. Your point is not in either. Drag the point to it and compare the readout with what $\\arctan$ gives.', visual: 'rotation', preset: { z: { re: -1, im: 1 } } },
      'The point $-a - bj$ … wait, the point <i>opposite</i> yours (multiply by $-1$) has the same $b/a$ ratio and sits in quadrant IV. $\\arctan$ gives you <i>that</i> angle. What is the angle between a point and its opposite?'
    ],
    solution: { visual: 'rotation', preset: { z: { re: -1, im: 1 } } },
    misconceptions: [
      { key: 'quadrant', test: (ans, q) => A.magNear(ans, C.abs(q.answer)) && sameDeg(ans.deg, Math.atan(q.params.b / q.params.a) * R2D),
        response: 'That is the calculator\'s $\\arctan$ answer, and it is the angle of the point opposite yours — the one in quadrant IV. A negative real part means the arrow points left; no angle between $-90^\\circ$ and $90^\\circ$ points left. Add $180^\\circ$.', visual: 'rotation' },
      { key: 'mirror', test: (ans, q) => A.magNear(ans, C.abs(q.answer)) && sameDeg(ans.deg, -C.argDeg(q.answer)),
        response: 'You have the angle of the conjugate, the mirror image below the real axis. Positive imaginary part means the point is <i>above</i> the axis and the angle is positive (counter-clockwise).' },
      { key: 'dropped-sign', test: (ans, q) => A.magNear(ans, C.abs(q.answer)) && sameDeg(ans.deg, Math.atan(Math.abs(q.params.b / q.params.a)) * R2D),
        response: 'You have taken the angle of $|a| + |b|j$ — the reference angle in quadrant I. The actual point is its reflection across the imaginary axis, so the angle is $180^\\circ$ minus that.' },
      { key: 'deg-rad', test: (ans, q) => degRadSlip(ans, C.argDeg(q.answer)),
        response: 'Right number, wrong unit: that is the angle in radians written as if it were degrees.' }
    ]
  },

  {
    id: 'cx-quad-02', title: 'quadrant III angle', kind: 'complex',
    params: { a: -2, b: -2 },
    gen: () => ({ a: -rint(1, 5), b: -rint(1, 5) }),
    make: p => {
      const z = cx(p.a, p.b), r = C.abs(z), d = C.argDeg(z);
      return {
        prompt: 'Write $' + fmtTex(z) + '$ in polar form. (Either $\\theta$ or $\\theta - 360^\\circ$ is fine.)',
        answer: z,
        solution: '<p>$r = \\sqrt{' + (p.a * p.a) + ' + ' + (p.b * p.b) + '} = ' + F(r, 3) + '$. Both parts negative: quadrant III, so the angle is between $180^\\circ$ and $270^\\circ$ (equivalently between $-180^\\circ$ and $-90^\\circ$).</p><p>$\\arctan(' + p.b + '/' + p.a + ') = \\arctan(' + F(p.b / p.a, 3) + ') = ' + F(Math.atan(p.b / p.a) * R2D, 2) + '^\\circ$ is the quadrant-I point $' + fmtTex(cx(-p.a, -p.b)) + '$. Subtract $180^\\circ$: $\\theta = ' + F(d, 2) + '^\\circ$, i.e. $' + F(norm(d), 2) + '^\\circ$.</p><p>$' + fmtTex(z) + ' = ' + F(r, 3) + '\\angle ' + F(norm(d), 2) + '^\\circ$.</p>'
      };
    },
    reframe: 'Two negative signs cancel inside arctan. They do not cancel in the plane: the point is in quadrant III.',
    visual: 'rotation',
    hints: [
      'Sketch it. Both coordinates negative — which quadrant, and between which two multiples of $90^\\circ$ must the angle lie?',
      { text: 'Notice that $b/a$ is positive here, exactly as it would be for $|a| + |b|j$ in quadrant I. So $\\arctan$ hands you the quadrant-I angle. Your point is the opposite one.', visual: 'rotation', preset: { z: { re: -2, im: -2 } } },
      'The point opposite yours is at the $\\arctan$ angle. Opposite points differ by exactly half a turn. Add or subtract $180^\\circ$ — both land on the same direction.'
    ],
    solution: { visual: 'rotation', preset: { z: { re: -2, im: -2 } } },
    misconceptions: [
      { key: 'quadrant', test: (ans, q) => A.magNear(ans, C.abs(q.answer)) && sameDeg(ans.deg, Math.atan(q.params.b / q.params.a) * R2D),
        response: 'That is the angle of the point in quadrant I with the same ratio $b/a$. The minus signs cancelled inside $\\arctan$, but they do not cancel in the plane: your point is diametrically opposite, $180^\\circ$ away.', visual: 'rotation' },
      { key: 'mirror', test: (ans, q) => A.magNear(ans, C.abs(q.answer)) && sameDeg(ans.deg, -C.argDeg(q.answer)),
        response: 'You have the reflection across the real axis (quadrant II). Negative imaginary part means the arrow points downward, so the angle is past $180^\\circ$ going counter-clockwise, or between $-90^\\circ$ and $-180^\\circ$ going clockwise.' },
      { key: 'deg-rad', test: (ans, q) => degRadSlip(ans, C.argDeg(q.answer)) || degRadSlip(ans, norm(C.argDeg(q.answer))),
        response: 'Right number, wrong unit: that is the angle in radians written as if it were degrees.' }
    ]
  },

  /* ================= B. MULTIPLICATION IS ROTATION ===================== */
  {
    id: 'cx-mulj-01', title: 'multiply by j', kind: 'complex',
    params: { a: 3, b: 4 },
    gen: () => ({ a: nz(-5, 5), b: nz(-5, 5) }),
    make: p => {
      const z = cx(p.a, p.b), w = C.mul(cx(0, 1), z);
      return {
        prompt: 'Compute $j\\,(' + fmtTex(z) + ')$. Then say what multiplying by $j$ <i>does</i> to a point.',
        answer: w,
        solution: '<p>Algebra: $j(' + fmtTex(z) + ') = ' + p.a + 'j + ' + p.b + 'j^2 = ' + p.a + 'j - ' + p.b + ' = ' + fmtTex(w) + '$.</p><p>Geometry: $j = 1\\angle 90^\\circ$. Multiplying by it keeps the length and adds $90^\\circ$ to the angle — a quarter turn counter-clockwise. $' + fmtTex(z) + '$ is at $' + F(C.argDeg(z), 1) + '^\\circ$; $' + fmtTex(w) + '$ is at $' + F(C.argDeg(w), 1) + '^\\circ$, same length $' + F(C.abs(z), 3) + '$.</p><p>Do it four times and you are back where you started: $j^4 = 1$.</p>'
      };
    },
    reframe: 'j is not a number you compute with. It is a quarter turn. j·j = −1 because two quarter turns is a half turn.',
    visual: 'multiply',
    hints: [
      'Forget algebra for a moment. Where is $j$ in the plane? What is its length, what is its angle?',
      { text: 'Put $z_2$ exactly at $j$ (on the imaginary axis, length 1) and drag $z_1$ around. What happens to the product\'s length? To its angle?', visual: 'multiply', preset: { z1: { re: 3, im: 4 }, z2: { re: 0, im: 1 } } },
      'Multiplying by $j$ is a quarter turn counter-clockwise, length unchanged. So the real part becomes … and the imaginary part becomes … ? (Check: rotating $1$ by a quarter turn gives $j$; rotating $j$ gives $-1$.)'
    ],
    solution: { visual: 'multiply', preset: { z1: { re: 3, im: 4 }, z2: { re: 0, im: 1 } } },
    misconceptions: [
      { key: 'j-as-variable', test: (ans, q) => near(ans, cx(0, q.params.a + q.params.b)),
        response: 'You have treated $j$ like the letter $x$ and collected like terms: "$3j + 4j = 7j$". But the second term is $4j\\cdot j = 4j^2 = -4$: real, and negative. $j$ is a rotation, and rotating $j$ by another quarter turn lands on $-1$. That is the whole content of $j^2 = -1$.', visual: 'multiply', preset: { z1: { re: 3, im: 4 }, z2: { re: 0, im: 1 } } },
      { key: 'wrong-direction', test: (ans, q) => near(ans, C.mul(cx(0, -1), cx(q.params.a, q.params.b))),
        response: 'That is a quarter turn <i>clockwise</i> — multiplying by $-j$. $j$ sits at $+90^\\circ$, so multiplying by it turns counter-clockwise. Check with the simplest case: $j\\cdot 1 = j$, which is straight up, not straight down.' },
      { key: 'j-squared-plus', test: (ans, q) => near(ans, cx(q.params.b, q.params.a)),
        response: 'You expanded correctly and then used $j^2 = +1$. If $j^2$ were $+1$, $j$ would just be $1$ (or $-1$) and there would be nothing to talk about. Two quarter turns make a half turn: $j^2 = -1$.' }
    ]
  },

  {
    id: 'cx-mul-01', title: 'polar × polar', kind: 'complex',
    params: { r1: 2, d1: 30, r2: 3, d2: 45 },
    gen: () => ({ r1: rint(2, 5), d1: pick([20, 30, 40, 45, 60, 70]), r2: rint(2, 4), d2: pick([25, 30, 45, 50, 60, 80, -30, -45]) }),
    make: p => {
      const z = C.mul(P(p.r1, p.d1), P(p.r2, p.d2));
      return {
        prompt: 'Compute $(' + p.r1 + '\\angle ' + p.d1 + '^\\circ)(' + p.r2 + '\\angle ' + p.d2 + '^\\circ)$.',
        answer: z,
        solution: '<p>Multiplication in polar form: <span class="mag">magnitudes multiply</span>, <span class="ang">angles add</span>.</p><p>$' + p.r1 + '\\cdot ' + p.r2 + ' = ' + (p.r1 * p.r2) + '$, $\\quad ' + p.d1 + '^\\circ + ' + p.d2 + '^\\circ = ' + (p.d1 + p.d2) + '^\\circ$.</p><p>So the product is $' + (p.r1 * p.r2) + '\\angle ' + (p.d1 + p.d2) + '^\\circ$. Why: $r_1e^{j\\theta_1}\\cdot r_2 e^{j\\theta_2} = r_1 r_2\\, e^{j(\\theta_1+\\theta_2)}$ — exponents add, and the exponent <i>is</i> the angle.</p>'
      };
    },
    reframe: 'To multiply, multiply the lengths and add the angles. Multiplying by z is "rotate by ∠z, stretch by |z|".',
    visual: 'multiply',
    hints: [
      'Do not convert to rectangular. Polar form is <i>built</i> for multiplication. What do you think happens to the two lengths? To the two angles?',
      { text: 'Drag the two factors and watch the product. Try $z_2$ on the unit circle first so only the angle changes; then pull it outwards.', visual: 'multiply', preset: { z1: P(2, 30), z2: P(1, 45) } },
      'Write each as $r e^{j\\theta}$: $r_1 e^{j\\theta_1}\\cdot r_2 e^{j\\theta_2}$. Rearrange the real factors and the exponential factors separately. What does $e^{a}e^{b}$ equal?'
    ],
    solution: { visual: 'multiply', preset: { z1: P(2, 30), z2: P(3, 45) } },
    misconceptions: [
      { key: 'add-magnitudes', test: (ans, q) => A.magNear(ans, q.params.r1 + q.params.r2) && !A.magNear(ans, q.params.r1 * q.params.r2),
        response: 'You have added the lengths. Lengths <i>multiply</i>: a stretch by 2 followed by a stretch by 3 is a stretch by 6, not 5. (Adding is what happens to angles — the other half of the rule.)', visual: 'multiply' },
      { key: 'multiply-angles', test: (ans, q) => sameDeg(ans.deg, q.params.d1 * q.params.d2) && !sameDeg(ans.deg, q.params.d1 + q.params.d2),
        response: 'You multiplied the angles. Angles <i>add</i>: a turn of $30^\\circ$ followed by a turn of $45^\\circ$ is a turn of $75^\\circ$. In $e^{j\\theta_1}e^{j\\theta_2} = e^{j(\\theta_1+\\theta_2)}$ the exponents add — and the exponent is the angle.' },
      { key: 'subtract-angles', test: (ans, q) => sameDeg(ans.deg, q.params.d1 - q.params.d2) && !sameDeg(ans.deg, q.params.d1 + q.params.d2),
        response: 'You subtracted the angles — that is division. Multiplying by $z_2$ turns <i>forward</i> by $\\angle z_2$; dividing by it turns back.' }
    ]
  },

  {
    id: 'cx-sq-01', title: '(1 + j)²', kind: 'complex',
    params: { a: 1, b: 1 },
    gen: () => ({ a: nz(-3, 3), b: nz(-3, 3) }),
    make: p => {
      const z = cx(p.a, p.b), w = C.mul(z, z);
      return {
        prompt: 'Compute $(' + fmtTex(z) + ')^2$ — once by expanding, once by rotation. They must agree.',
        answer: w,
        solution: '<p>Expanding: $(' + fmtTex(z) + ')^2 = ' + (p.a * p.a) + ' + 2(' + p.a + ')(' + p.b + ')j + ' + (p.b * p.b) + 'j^2 = ' + (p.a * p.a - p.b * p.b) + ' + ' + (2 * p.a * p.b) + 'j$.</p><p>Rotating: $' + fmtTex(z) + '$ has length $' + F(C.abs(z), 3) + '$ and angle $' + F(C.argDeg(z), 1) + '^\\circ$. Squaring squares the length ($' + F(C.abs(z) * C.abs(z), 2) + '$) and doubles the angle ($' + F(2 * C.argDeg(z), 1) + '^\\circ$): $' + F(C.abs(w), 2) + '\\angle ' + F(2 * C.argDeg(z), 1) + '^\\circ = ' + fmtTex(w) + '$.</p><p>Same answer; the second route has no $j^2$ to get wrong.</p>'
      };
    },
    reframe: 'Squaring squares the length and doubles the angle. (1 + j) is at 45°, so its square points straight up.',
    visual: 'powers',
    hints: [
      'Before expanding, sketch $1 + j$. What is its angle? If squaring doubles the angle, where must the answer point?',
      { text: 'Watch the powers spiral for $1 + j$ with $n = 2$. Read off the length and the angle of $z^2$.', visual: 'powers', preset: { z: '1+j', n: 2 } },
      'Expand $(a + bj)^2 = a^2 + 2abj + b^2 j^2$ and remember what $j^2$ is. Then check it against the rotation: length squared, angle doubled.'
    ],
    solution: { visual: 'powers', preset: { z: '1+j', n: 2 } },
    misconceptions: [
      { key: 'j-squared-plus', test: (ans, q) => near(ans, cx(q.params.a * q.params.a + q.params.b * q.params.b, 2 * q.params.a * q.params.b)) && Math.abs(q.params.b) > 0,
        response: 'You expanded correctly and then treated $j^2$ as $+1$. It is $-1$ — that is the whole reason $j$ exists. Geometrically: squaring doubles the angle, and doubling $45^\\circ$ gives $90^\\circ$, straight up the imaginary axis. Your answer is not on that axis.', visual: 'powers', preset: { z: '1+j', n: 2 } },
      { key: 'linearity', test: (ans, q) => near(ans, cx(q.params.a * q.params.a, q.params.b * q.params.b)) || near(ans, cx(q.params.a * q.params.a - q.params.b * q.params.b, 0)),
        response: 'You squared the parts separately. $(a + b)^2 \\neq a^2 + b^2$ for real numbers and it is no different here: the cross term $2abj$ is where the rotation shows up. Skip the algebra: square the length, double the angle.' }
    ]
  },

  {
    id: 'cx-div-01', title: 'polar ÷ polar', kind: 'complex',
    params: { r1: 6, d1: 80, r2: 2, d2: 20 },
    gen: () => ({ r1: pick([6, 8, 9, 10, 12]), d1: pick([80, 90, 100, 120, 150]), r2: pick([2, 3, 4]), d2: pick([20, 30, 40, 50, 60]) }),
    make: p => {
      const z = C.div(P(p.r1, p.d1), P(p.r2, p.d2));
      return {
        prompt: 'Compute $\\dfrac{' + p.r1 + '\\angle ' + p.d1 + '^\\circ}{' + p.r2 + '\\angle ' + p.d2 + '^\\circ}$.',
        answer: z,
        solution: '<p>Division undoes multiplication: <span class="mag">divide the lengths</span>, <span class="ang">subtract the angles</span>.</p><p>$' + p.r1 + '/' + p.r2 + ' = ' + F(p.r1 / p.r2, 3) + '$, $\\quad ' + p.d1 + '^\\circ - ' + p.d2 + '^\\circ = ' + (p.d1 - p.d2) + '^\\circ$.</p><p>Answer: $' + F(p.r1 / p.r2, 3) + '\\angle ' + (p.d1 - p.d2) + '^\\circ$. In exponentials: $\\dfrac{r_1 e^{j\\theta_1}}{r_2 e^{j\\theta_2}} = \\dfrac{r_1}{r_2}e^{j(\\theta_1 - \\theta_2)}$.</p>'
      };
    },
    reframe: 'Dividing by z undoes multiplying by z: shrink by |z|, rotate back by ∠z.',
    visual: 'multiply',
    hints: [
      'Multiplying by $z_2$ rotates forward by $\\angle z_2$ and stretches by $|z_2|$. Division is the inverse operation. What is the inverse of "rotate forward and stretch"?',
      { text: 'Find a $z_1$ such that $z_1 \\cdot z_2$ equals $6\\angle 80^\\circ$ when $z_2 = 2\\angle 20^\\circ$. That $z_1$ is the quotient.', visual: 'multiply', preset: { z1: P(3, 60), z2: P(2, 20) } },
      'Write both as exponentials and use $e^{a}/e^{b} = e^{a-b}$. Lengths divide, angles subtract.'
    ],
    solution: { visual: 'multiply', preset: { z1: P(3, 60), z2: P(2, 20) } },
    misconceptions: [
      { key: 'divide-angles', test: (ans, q) => sameDeg(ans.deg, q.params.d1 / q.params.d2) && !sameDeg(ans.deg, q.params.d1 - q.params.d2),
        response: 'You divided the angles. Angles live in the exponent, and exponents <i>subtract</i> under division: $e^{j80^\\circ}/e^{j20^\\circ} = e^{j60^\\circ}$. Dividing by $z_2$ rotates <i>back</i> by $\\angle z_2$.' },
      { key: 'add-angles', test: (ans, q) => sameDeg(ans.deg, q.params.d1 + q.params.d2),
        response: 'You added the angles — that is multiplication. Division rotates the other way: subtract.' },
      { key: 'subtract-magnitudes', test: (ans, q) => A.magNear(ans, q.params.r1 - q.params.r2) && !A.magNear(ans, q.params.r1 / q.params.r2),
        response: 'You subtracted the lengths. Lengths <i>divide</i>; it is the angles that subtract. Keep the two halves of the rule straight: length ↔ multiply/divide, angle ↔ add/subtract.' }
    ]
  },

  {
    id: 'cx-conj-01', title: 'z times its conjugate', kind: 'complex',
    params: { a: 3, b: 4 },
    gen: () => ({ a: nz(-5, 5), b: nz(-5, 5) }),
    make: p => {
      const z = cx(p.a, p.b), w = C.mul(z, C.conj(z));
      return {
        prompt: 'Compute $(' + fmtTex(z) + ')(' + fmtTex(C.conj(z)) + ')$.',
        answer: w,
        solution: '<p>Algebra: $(' + fmtTex(z) + ')(' + fmtTex(C.conj(z)) + ') = ' + (p.a * p.a) + ' - ' + (p.b * p.b) + 'j^2 + (\\text{cross terms that cancel}) = ' + (p.a * p.a) + ' + ' + (p.b * p.b) + ' = ' + (p.a * p.a + p.b * p.b) + '$.</p><p>Geometry: $\\bar z$ is $z$ reflected in the real axis — same length, opposite angle. Multiply: length $|z|\\cdot|z| = |z|^2$, angle $\\theta + (-\\theta) = 0$. So $z\\bar z$ always lands on the positive real axis at $|z|^2$. Here $|z|^2 = ' + (p.a * p.a + p.b * p.b) + '$.</p>'
      };
    },
    reframe: 'The conjugate has the opposite angle. z times its conjugate cancels the angle and leaves |z|², real and positive.',
    visual: 'multiply',
    hints: [
      'Where is the conjugate relative to $z$ in the plane? What is its length, what is its angle?',
      { text: 'Put $z_1$ at $3 + 4j$ and $z_2$ at its mirror image $3 - 4j$. Where does the product land? Why must it land on that axis?', visual: 'multiply', preset: { z1: { re: 3, im: 4 }, z2: { re: 3, im: -4 } } },
      'Angles add: $\\theta + (-\\theta) = 0$. Lengths multiply: $|z|\\cdot|z|$. So the product is a positive real number. Which one?'
    ],
    solution: { visual: 'multiply', preset: { z1: { re: 3, im: 4 }, z2: { re: 3, im: -4 } } },
    misconceptions: [
      { key: 'j-squared-plus', test: (ans, q) => near(ans, cx(q.params.a * q.params.a - q.params.b * q.params.b, 0)) && q.params.a * q.params.a !== q.params.b * q.params.b,
        response: 'You have $a^2 - b^2$: you used $j^2 = +1$. Since $j^2 = -1$, the term $-b^2 j^2$ is $+b^2$. Geometrically, $z\\bar z$ has angle $\\theta - \\theta = 0$ and length $|z|^2 = a^2 + b^2$ — it cannot be smaller than $a^2$.' },
      { key: 'cross-terms', test: (ans, q) => Math.abs(ans.im) > 0.05 * Math.max(1, ans.r) && Math.abs(Math.abs(ans.im) - 2 * Math.abs(q.params.a * q.params.b)) < 0.05 * Math.max(1, 2 * Math.abs(q.params.a * q.params.b)),
        response: 'Your answer has an imaginary part of size $2ab$: the two cross terms $-abj$ and $+abj$ did not cancel for you. They must — the conjugate\'s angle exactly undoes $z$\'s angle, so the product sits on the real axis with no imaginary part at all.', visual: 'multiply', preset: { z1: { re: 3, im: 4 }, z2: { re: 3, im: -4 } } },
      { key: 'took-magnitude', test: (ans, q) => near(ans, cx(C.abs(cx(q.params.a, q.params.b)), 0)) && !near(ans, q.answer),
        response: 'That is $|z|$, the length. $z\\bar z$ is the length <i>squared</i>: two factors of length $|z|$ each.' }
    ]
  },

  {
    id: 'cx-recip-01', title: '1 / z', kind: 'complex',
    params: { a: 1, b: 1 },
    gen: () => ({ a: nz(-3, 3), b: nz(-3, 3) }),
    make: p => {
      const z = cx(p.a, p.b), w = C.div(cx(1, 0), z);
      return {
        prompt: 'Compute $\\dfrac{1}{' + fmtTex(z) + '}$ in rectangular form.',
        answer: w,
        solution: '<p>Polar route: $' + fmtTex(z) + ' = ' + F(C.abs(z), 3) + '\\angle ' + F(C.argDeg(z), 1) + '^\\circ$. The reciprocal has length $1/' + F(C.abs(z), 3) + ' = ' + F(1 / C.abs(z), 3) + '$ and angle $' + F(-C.argDeg(z), 1) + '^\\circ$: $' + F(1 / C.abs(z), 3) + '\\angle ' + F(-C.argDeg(z), 1) + '^\\circ = ' + fmtTex({ re: F(w.re, 3), im: F(w.im, 3) }) + '$.</p><p>Algebra route: multiply top and bottom by the conjugate. $\\dfrac{1}{z} = \\dfrac{\\bar z}{z\\bar z} = \\dfrac{' + fmtTex(C.conj(z)) + '}{' + (p.a * p.a + p.b * p.b) + '}$. Same thing: the conjugate flips the angle, the $|z|^2$ fixes the length.</p>'
      };
    },
    reframe: 'The reciprocal flips the angle and inverts the length. 1/z = conjugate ÷ |z|².',
    visual: 'multiply',
    hints: [
      '$\\dfrac{1}{z}$ is the number that multiplies $z$ to give $1$. $1$ has length 1 and angle $0$. What length and angle must $1/z$ have to make that happen?',
      { text: 'Multiplication adds angles and multiplies lengths. So $1/z$ must have angle $-\\angle z$ and length $1/|z|$. Find the $z_2$ that sends $z_1 = 1 + j$ to $1$.', visual: 'multiply', preset: { z1: { re: 1, im: 1 }, z2: { re: 0.5, im: -0.5 } } },
      'Convert to polar, invert the length, negate the angle, convert back. Or multiply top and bottom by the conjugate — which is the same thing in algebraic clothing.'
    ],
    solution: { visual: 'multiply', preset: { z1: { re: 1, im: 1 }, z2: { re: 0.5, im: -0.5 } } },
    misconceptions: [
      { key: 'forgot-norm', test: (ans, q) => near(ans, C.conj(cx(q.params.a, q.params.b))) && (q.params.a * q.params.a + q.params.b * q.params.b) !== 1,
        response: 'You have flipped the angle but kept the length. $|1/z| = 1/|z|$: if $|z| = \\sqrt 2$ the reciprocal must have length $1/\\sqrt 2 \\approx 0.707$, and your answer has length $\\sqrt 2$. The conjugate alone is the mirror image, not the reciprocal — you still divide by $|z|^2$.' },
      { key: 'kept-angle', test: (ans, q) => near(ans, C.scale(cx(q.params.a, q.params.b), 1 / (q.params.a * q.params.a + q.params.b * q.params.b))),
        response: 'Length right, angle wrong: you have $z/|z|^2$, which points the same way as $z$. But $z\\cdot(1/z) = 1$ has angle zero, so $1/z$ must point the <i>opposite</i> rotation from $z$: angle $-\\theta$.' },
      { key: 'reciprocal-parts', test: (ans, q) => near(ans, cx(1 / q.params.a, 1 / q.params.b)) || near(ans, cx(1 / q.params.a, -1 / q.params.b)),
        response: 'You took the reciprocal of each part. $\\dfrac{1}{a + bj} \\neq \\dfrac1a + \\dfrac{1}{bj}$: reciprocals do not distribute over sums (they never did — $1/(1+1) \\neq 1/1 + 1/1$). Use polar: invert the length, negate the angle.' }
    ]
  },

  /* ================= C. EULER ========================================= */
  {
    id: 'cx-euler-why', title: 'why e^{jθ} = cos θ + j sin θ', kind: 'choice',
    prompt: 'Why does $e^{j\\theta} = \\cos\\theta + j\\sin\\theta$? Pick the explanation that is actually a <i>reason</i>, not a restatement.',
    options: [
      { text: 'Let $z(\\theta) = e^{j\\theta}$. Then $\\dfrac{dz}{d\\theta} = j\\,z$: the velocity is the position rotated by $90^\\circ$, with the same length. A point whose velocity is always perpendicular to its position vector and equal to it in length moves in a circle at unit angular speed. Starting at $z(0) = 1$, after parameter $\\theta$ it is at angle $\\theta$ on the unit circle — which is $\\cos\\theta + j\\sin\\theta$.', correct: true },
      { text: 'Because $j^2 = -1$, the exponent $j\\theta$ is really a negative real exponent in disguise, and $e$ to a negative real power gives the oscillation.', mis: 'j-squared-in-exponent' },
      { text: 'It is a definition: mathematicians chose to define $e^{j\\theta}$ that way so that the notation is convenient.', mis: 'definition' },
      { text: 'Because $|e^{j\\theta}| = 1$, and the points with magnitude 1 are exactly $\\cos\\theta + j\\sin\\theta$.', mis: 'circular' }
    ],
    reframe: 'e^{jθ} is the point that starts at 1 and moves with velocity always perpendicular to its position: pure rotation at unit speed.',
    visual: 'euler',
    hints: [
      'What single property defines the exponential function $e^{x}$? (Not its value — its <i>behaviour</i> under differentiation.)',
      { text: '$\\dfrac{d}{d\\theta}e^{j\\theta} = j\\,e^{j\\theta}$. You know what multiplying by $j$ does to a vector. So the velocity of this point is always its position turned by a quarter turn. What kind of motion has velocity perpendicular to position? Watch the point in the figure and its velocity direction.', visual: 'euler', preset: { theta: 0.9 } },
      'Velocity perpendicular to position with $|v| = |z|$ is uniform circular motion at angular speed 1. It starts at $z(0) = e^0 = 1$. Where is it at parameter $\\theta$, in rectangular coordinates?'
    ],
    solution: { visual: 'euler', preset: { theta: 0.9 }, text: '<p>The exponential is the function that is its own derivative. With a complex parameter, $\\dfrac{d}{d\\theta}e^{j\\theta} = j\\,e^{j\\theta}$. Multiplying by $j$ is a quarter turn, so the velocity of the point $z(\\theta) = e^{j\\theta}$ is always its position vector rotated by $90^\\circ$, same length.</p><p>Velocity always perpendicular to position means the distance from the origin never changes (nothing pushes outward): the point stays on the circle of radius $|z(0)| = 1$. Speed equal to radius means angular speed 1: after parameter $\\theta$ the point has turned through angle $\\theta$. The point on the unit circle at angle $\\theta$ has coordinates $(\\cos\\theta, \\sin\\theta)$. Hence $e^{j\\theta} = \\cos\\theta + j\\sin\\theta$.</p><p>The Taylor series gives the same result by brute force (next item). This derivation gives the <i>picture</i>: $e^{j\\theta}$ is rotation, and that picture is the spine of everything that follows.</p>' },
    misconceptions: [
      { key: 'j-squared-in-exponent', response: 'The exponent contains $j$ once, not $j^2$. Nothing gets squared. And a negative real exponent gives <i>decay</i>, not oscillation: $e^{-\\theta}$ never comes back. Oscillation needs rotation, and rotation is exactly what a factor of $j$ in the exponent produces — because $\\frac{d}{d\\theta}e^{j\\theta} = j e^{j\\theta}$ turns the velocity by a quarter turn.' },
      { key: 'definition', response: 'It is not a choice. $e^{x}$ is fixed by its power series (or by $\\frac{d}{dx}e^{x} = e^{x}$, $e^0 = 1$). Put $x = j\\theta$ into either and the identity is <i>forced</i>. If it were merely a convention it could not predict anything — and it predicts the behaviour of every circuit, filter and control loop in your fourth year.' },
      { key: 'circular', response: 'True, but circular: how do you know $|e^{j\\theta}| = 1$ before you know what $e^{j\\theta}$ is? And even granted, magnitude 1 only says the point is <i>somewhere</i> on the unit circle — not that it is at angle exactly $\\theta$. You need the derivative argument for that: velocity $= j\\times$ position gives unit angular speed.' }
    ]
  },

  {
    id: 'cx-euler-taylor', title: 'the power series route', kind: 'choice',
    prompt: 'Expand $e^{j\\theta}$ as a power series, $\\sum \\dfrac{(j\\theta)^n}{n!}$. What happens to the terms?',
    options: [
      { text: 'Even powers of $j\\theta$ are real ($j^2 = -1$, $j^4 = 1$, …) and reassemble, with alternating signs, into the series for $\\cos\\theta$. Odd powers are imaginary and reassemble into $j$ times the series for $\\sin\\theta$.', correct: true },
      { text: 'All terms are real, because $\\theta$ is real.', mis: 'ignores-j' },
      { text: 'The series does not converge for an imaginary argument, so the expansion is not valid.', mis: 'convergence' },
      { text: 'The $j$ factors out of every term, giving $e^{j\\theta} = j\\,e^{\\theta}$.', mis: 'j-factor' }
    ],
    reframe: 'j cycles through 1, j, −1, −j. That cycle is what splits one exponential series into a cosine series and a sine series.',
    visual: 'euler',
    hints: [
      'Write out the first five terms of $\\sum (j\\theta)^n/n!$ explicitly. Compute $j^0, j^1, j^2, j^3, j^4$.',
      'Now group the terms: which ones have no $j$ left over, and which ones have exactly one $j$? Write each group as its own series.',
      'Compare the two groups with the series $\\cos\\theta = 1 - \\theta^2/2! + \\theta^4/4! - \\cdots$ and $\\sin\\theta = \\theta - \\theta^3/3! + \\cdots$. Where do the alternating signs come from?'
    ],
    solution: { text: '<p>$e^{j\\theta} = 1 + j\\theta + \\dfrac{(j\\theta)^2}{2!} + \\dfrac{(j\\theta)^3}{3!} + \\dfrac{(j\\theta)^4}{4!} + \\cdots$</p><p>Using $j^2 = -1$, $j^3 = -j$, $j^4 = 1$: $= \\left(1 - \\dfrac{\\theta^2}{2!} + \\dfrac{\\theta^4}{4!} - \\cdots\\right) + j\\left(\\theta - \\dfrac{\\theta^3}{3!} + \\dfrac{\\theta^5}{5!} - \\cdots\\right) = \\cos\\theta + j\\sin\\theta.$</p><p>The alternating signs in cosine and sine — which look arbitrary when you first meet them — are the quarter-turn cycle $1, j, -1, -j$ of the powers of $j$. That is the same rotation as in the derivative argument, seen term by term.</p>' },
    misconceptions: [
      { key: 'ignores-j', response: 'The terms contain $(j\\theta)^n$, not $\\theta^n$. $j\\theta$ is imaginary, its square $-\\theta^2$ is real, its cube $-j\\theta^3$ is imaginary again. The terms alternate between real and imaginary, and that alternation is the whole point.' },
      { key: 'convergence', response: 'The exponential series converges for <i>every</i> complex argument — it is one of the best-behaved series there is (factorials in the denominator beat any power). Doubt is healthy, but here it is misplaced: the expansion is valid, and grouping its terms is exactly how the identity is proved.' },
      { key: 'j-factor', response: '$j$ does not factor out, because it appears to different powers in different terms: $j^0 = 1$ in the first, $j^1$ in the second, $j^2 = -1$ in the third. If $j$ factored out, $e^{j\\theta}$ would be purely imaginary — but $e^{j\\pi} = -1$ is real.' }
    ]
  },

  {
    id: 'cx-euler-val', title: 'e^{jπ} and friends', kind: 'complex',
    params: { k: 1, label: '\\pi', rad: Math.PI },
    gen: () => pick([
      { label: '\\pi', rad: Math.PI }, { label: '\\pi/2', rad: Math.PI / 2 }, { label: '-\\pi/2', rad: -Math.PI / 2 }, { label: '2\\pi', rad: 2 * Math.PI },
      { label: '3\\pi/2', rad: 3 * Math.PI / 2 }, { label: '\\pi/4', rad: Math.PI / 4 }, { label: '\\pi/3', rad: Math.PI / 3 }, { label: '-\\pi/3', rad: -Math.PI / 3 },
      { label: '2\\pi/3', rad: 2 * Math.PI / 3 }, { label: '5\\pi/6', rad: 5 * Math.PI / 6 }, { label: '-\\pi/6', rad: -Math.PI / 6 }, { label: '\\pi/6', rad: Math.PI / 6 }
    ]),
    make: p => ({
      prompt: 'Evaluate $e^{j' + p.label + '}$ in rectangular form.',
      answer: C.polar(1, p.rad),
      solution: '<p>$e^{j\\theta}$ is the point on the unit circle at angle $\\theta$ (radians). $\\theta = ' + p.label + ' = ' + F(p.rad * R2D, 1) + '^\\circ$.</p><p>$e^{j' + p.label + '} = \\cos(' + p.label + ') + j\\sin(' + p.label + ') = ' + fmtTex({ re: F(Math.cos(p.rad), 3), im: F(Math.sin(p.rad), 3) }) + '$.</p><p>No calculator needed for the multiples of $\\pi/2$: a half turn from $1$ is $-1$; a quarter turn is $j$; a full turn is back to $1$.</p>'
    }),
    reframe: 'e^{jθ} is nothing but "the point at angle θ on the unit circle". θ = π is half a turn.',
    visual: 'euler',
    hints: [
      'Do not reach for a calculator. $e^{j\\theta}$ is a point on the unit circle. Which point?',
      { text: 'Slide $\\theta$ to the value in the question and read the point off the circle.', visual: 'euler', preset: { theta: Math.PI } },
      'It is at angle $\\theta$ (in radians) measured counter-clockwise from $1$. Half a turn from $1$ lands where? A quarter turn?'
    ],
    solution: { visual: 'euler', preset: { theta: Math.PI } },
    misconceptions: [
      { key: 'real-exponent', test: (ans, q) => near(ans, cx(Math.exp(q.params.rad), 0)) && Math.abs(q.params.rad) > 0.05,
        response: 'That is $e^{\\theta}$ with a real exponent — a stretch by a factor of $e^{' + '\\theta}$. The $j$ changes everything: a real exponent stretches, an imaginary exponent <i>turns</i>. $e^{j\\theta}$ never leaves the unit circle.', visual: 'euler' },
      { key: 'deg-rad', test: (ans, q) => near(ans, C.polar(1, q.params.rad * D2R)) && Math.abs(q.params.rad) > 0.05,
        response: 'You fed the number of radians into a calculator in degree mode: $\\cos(3.14^\\circ)$ instead of $\\cos(3.14\\text{ rad})$. In $e^{j\\theta}$ the angle is <i>always</i> radians. Always.' },
      { key: 'dropped-j', test: (ans, q) => near(ans, cx(1, 0)) && Math.abs(norm(q.params.rad * R2D)) > 2 && Math.abs(norm(q.params.rad * R2D) - 360) > 2,
        response: 'You have $1$, which is $e^{0}$: the starting point. The exponent is not zero; the point has turned through $\\theta$ radians. Only a full turn ($2\\pi$) brings it back to $1$.' },
      { key: 'quarter-half', test: (ans, q) => (near(ans, cx(0, 1)) || near(ans, cx(0, -1))) && Math.abs(Math.abs(Math.sin(q.params.rad)) - 1) > 0.05,
        response: '$\\pm j$ is a quarter turn ($\\pm\\pi/2$). Count the turn again: how many quarter turns is this angle?' }
    ]
  },

  {
    id: 'cx-euler-mag', title: '|r e^{jθ}|', kind: 'number',
    params: { r: 3, th: 2.4 },
    gen: () => { let th; do { th = F(Math.random() * 6 - 3, 1); } while (Math.abs(th) < 0.3); return { r: rint(2, 9), th: th }; },
    make: p => ({
      prompt: 'What is $\\left|' + p.r + '\\,e^{j' + p.th + '}\\right|$?',
      answer: { value: p.r },
      solution: '<p>$e^{j\\theta}$ has magnitude 1 for every real $\\theta$ — it is on the unit circle, that is what it <i>is</i>. So $|' + p.r + 'e^{j' + p.th + '}| = ' + p.r + '\\cdot 1 = ' + p.r + '$. The exponent only says where on the circle of radius $' + p.r + '$ the point sits (at $' + p.th + '$ rad $= ' + F(p.th * R2D, 1) + '^\\circ$); it has nothing to do with how far out.</p>'
    }),
    reframe: 'In r e^{jθ} the r is the length and the θ is the direction. The exponent cannot change the length.',
    visual: 'rotation',
    hints: [
      'Two numbers appear: $r$ and $\\theta$. One is a length, one is a direction. Which is which?',
      { text: 'Drag the point around a circle in the explorer and watch the $r e^{j\\theta}$ readout: what changes and what stays fixed?', visual: 'rotation', preset: { z: C.polar(3, 2.4) } },
      '$|ab| = |a||b|$. What is $|e^{j\\theta}|$ for any real $\\theta$?'
    ],
    solution: { visual: 'rotation', preset: { z: C.polar(3, 2.4) } },
    misconceptions: [
      { key: 'real-exponent', test: (ans, q) => A.checkNumber(ans, q.params.r * Math.exp(q.params.th), 0.02 * q.params.r * Math.exp(q.params.th)),
        response: 'That is $r e^{\\theta}$ with a real exponent. The $j$ is not decoration: $e^{j\\theta}$ is a rotation, and a rotation does not change length. $|e^{j\\theta}| = 1$ for every real $\\theta$.' },
      { key: 'multiplied', test: (ans, q) => A.checkNumber(ans, q.params.r * q.params.th, 0.02 * Math.abs(q.params.r * q.params.th)) && Math.abs(q.params.th - 1) > 0.05,
        response: 'You multiplied $r$ by $\\theta$. A length times an angle is not a length. $\\theta$ only tells you the direction.' },
      { key: 'took-angle', test: (ans, q) => A.checkNumber(ans, q.params.th, 0.02 * Math.abs(q.params.th)) && Math.abs(q.params.th - q.params.r) > 0.05,
        response: 'That is the angle, not the magnitude. In $r e^{j\\theta}$, $r$ is the length.' }
    ]
  },

  {
    id: 'cx-euler-cos', title: 'cos θ from exponentials', kind: 'choice',
    prompt: 'Write $\\cos\\theta$ in terms of $e^{j\\theta}$ and $e^{-j\\theta}$.',
    options: [
      { text: '$\\cos\\theta = \\dfrac{e^{j\\theta} + e^{-j\\theta}}{2}$', correct: true },
      { text: '$\\cos\\theta = \\dfrac{e^{j\\theta} - e^{-j\\theta}}{2j}$', mis: 'that-is-sine' },
      { text: '$\\cos\\theta = \\dfrac{e^{j\\theta} + e^{-j\\theta}}{2j}$', mis: 'stray-j' },
      { text: '$\\cos\\theta = \\dfrac{e^{j\\theta}}{2}$', mis: 'half-of-euler' }
    ],
    reframe: 'e^{jθ} and e^{−jθ} are mirror images. Add them and the imaginary parts cancel; what is left is twice the real part, 2 cos θ.',
    visual: 'euler',
    hints: [
      'Draw $e^{j\\theta}$ and $e^{-j\\theta}$ on the unit circle. How are they related as points?',
      { text: 'They are reflections of each other in the real axis: same cosine, opposite sine. What do you get if you add two such points tip-to-tail?', visual: 'euler', preset: { theta: 0.9 } },
      '$e^{j\\theta} + e^{-j\\theta} = (\\cos\\theta + j\\sin\\theta) + (\\cos\\theta - j\\sin\\theta)$. Simplify, then solve for $\\cos\\theta$.'
    ],
    solution: { visual: 'euler', preset: { theta: 0.9 }, text: '<p>$e^{j\\theta} = \\cos\\theta + j\\sin\\theta$ and $e^{-j\\theta} = \\cos\\theta - j\\sin\\theta$ (the mirror image). Adding cancels the imaginary parts: $e^{j\\theta} + e^{-j\\theta} = 2\\cos\\theta$, so $\\cos\\theta = \\dfrac{e^{j\\theta} + e^{-j\\theta}}{2}$.</p><p>Subtracting cancels the real parts instead: $e^{j\\theta} - e^{-j\\theta} = 2j\\sin\\theta$, so $\\sin\\theta = \\dfrac{e^{j\\theta} - e^{-j\\theta}}{2j}$.</p><p>These two lines are why every real signal in signals-and-systems is "a pair of counter-rotating phasors". A cosine is two rotations, one each way, whose sideways parts cancel.</p>' },
    misconceptions: [
      { key: 'that-is-sine', response: 'That is $\\sin\\theta$. Subtracting the mirror image kills the <i>real</i> parts and leaves $2j\\sin\\theta$; the $2j$ downstairs then makes it real. For cosine you want to kill the imaginary parts, which is what <i>adding</i> the pair does.' },
      { key: 'stray-j', response: '$e^{j\\theta} + e^{-j\\theta}$ is already purely real ($2\\cos\\theta$: the $j\\sin$ parts cancel). Dividing by $j$ would rotate it by $-90^\\circ$ and make it purely <i>imaginary</i>. Cosine is real. The $j$ belongs in the sine formula, where it is needed to cancel the $j$ in $2j\\sin\\theta$.' },
      { key: 'half-of-euler', response: '$e^{j\\theta}/2$ still has an imaginary part, $\\tfrac{j}{2}\\sin\\theta$. Cosine has none. You need something to cancel it — and the mirror image $e^{-j\\theta}$, which has the opposite imaginary part, is exactly that.' }
    ]
  },

  {
    id: 'cx-real-01', title: 'Re{ r e^{jθ} }', kind: 'number',
    params: { r: 2, label: '\\pi/3', rad: Math.PI / 3 },
    gen: () => Object.assign({ r: rint(2, 6) }, pick([{ label: '\\pi/3', rad: Math.PI / 3 }, { label: '\\pi/4', rad: Math.PI / 4 }, { label: '\\pi/6', rad: Math.PI / 6 }, { label: '2\\pi/3', rad: 2 * Math.PI / 3 }, { label: '-\\pi/3', rad: -Math.PI / 3 }, { label: '5\\pi/6', rad: 5 * Math.PI / 6 }, { label: '3\\pi/4', rad: 3 * Math.PI / 4 }])),
    make: p => ({
      prompt: 'What is $\\operatorname{Re}\\left\\{' + p.r + '\\,e^{j' + p.label + '}\\right\\}$? (This is what "the physical signal is the real part of the phasor" will mean next year.)',
      answer: { value: p.r * Math.cos(p.rad) },
      solution: '<p>$' + p.r + 'e^{j' + p.label + '}$ is the point of length $' + p.r + '$ at angle $' + p.label + ' = ' + F(p.rad * R2D, 0) + '^\\circ$. Its real part is the horizontal shadow, $r\\cos\\theta = ' + p.r + '\\cos(' + F(p.rad * R2D, 0) + '^\\circ) = ' + p.r + '\\times' + F(Math.cos(p.rad), 3) + ' = ' + F(p.r * Math.cos(p.rad), 3) + '$.</p>'
    }),
    reframe: 'The real part is the horizontal shadow: r cos θ. Taking the real part is how a rotating phasor becomes a signal you can measure.',
    visual: 'euler',
    hints: [
      'Locate the point first: length $r$, angle $\\theta$. The real part is a shadow — which one?',
      { text: 'Slide $\\theta$ to the angle in the question. The blue trace below is the horizontal shadow, $\\cos\\theta$, for a unit-length point. Yours is $r$ times longer.', visual: 'euler', preset: { theta: Math.PI / 3 } },
      '$\\operatorname{Re}\\{r e^{j\\theta}\\} = r\\cos\\theta$, with $\\theta$ in radians.'
    ],
    solution: { visual: 'euler', preset: { theta: Math.PI / 3 } },
    misconceptions: [
      { key: 'ignored-angle', test: (ans, q) => A.checkNumber(ans, q.params.r, 0.02 * q.params.r) && Math.abs(Math.cos(q.params.rad) - 1) > 0.02,
        response: 'That is the full length $r$. The real part is only the <i>horizontal shadow</i> of the arrow, $r\\cos\\theta$ — equal to $r$ only when the arrow lies flat along the real axis.', visual: 'euler' },
      { key: 'took-imag', test: (ans, q) => A.checkNumber(ans, q.params.r * Math.sin(q.params.rad), 0.02 * q.params.r) && Math.abs(Math.sin(q.params.rad) - Math.cos(q.params.rad)) > 0.02,
        response: 'That is the imaginary part, $r\\sin\\theta$ — the vertical shadow. Real is horizontal: $r\\cos\\theta$.' },
      { key: 'deg-rad', test: (ans, q) => A.checkNumber(ans, q.params.r * Math.cos(q.params.rad * D2R), 0.01 * q.params.r),
        response: 'You evaluated $\\cos$ of the number of radians as if it were degrees ($\\cos(1.047^\\circ) \\approx 1$). $\\pi/3$ is $60^\\circ$.' }
    ]
  },

  {
    id: 'cx-notj', title: 'which one is not j?', kind: 'choice',
    prompt: 'Three of these equal $j$. Which one does <i>not</i>?',
    options: [
      { text: '$e^{j\\pi/2}$', mis: 'euler-quarter' },
      { text: '$1\\angle 90^\\circ$', mis: 'polar-j' },
      { text: '$e^{j3\\pi/2}$', correct: true },
      { text: '$-\\dfrac{1}{j}$', mis: 'reciprocal-j' }
    ],
    reframe: 'j has many names. All of them say "one unit, a quarter turn counter-clockwise".',
    visual: 'euler',
    hints: [
      'Place each of the four on the unit circle. $j$ is at a quarter turn. Which one is somewhere else?',
      { text: 'Slide $\\theta$ to $\\pi/2$ and to $3\\pi/2$. Where is the point each time?', visual: 'euler', preset: { theta: Math.PI / 2 } },
      'For $-1/j$: what is $1/j$? Its length is $1/1$ and its angle is $-90^\\circ$, so $1/j = -j$. Then $-1/j = ?$'
    ],
    solution: { visual: 'euler', preset: { theta: 3 * Math.PI / 2 }, text: '<p>$e^{j\\pi/2}$ is a quarter turn from $1$: that is $j$. $1\\angle 90^\\circ$ is the same statement in polar notation. $1/j$ has length 1 and angle $-90^\\circ$, i.e. $-j$; so $-1/j = j$.</p><p>$e^{j3\\pi/2}$ is three quarter turns, which lands at $-j$ (straight down). That is the odd one out.</p>' },
    misconceptions: [
      { key: 'euler-quarter', response: '$e^{j\\pi/2}$ is the point at angle $\\pi/2 = 90^\\circ$ on the unit circle — straight up, which is exactly $j$. They are equal.' },
      { key: 'polar-j', response: '$1\\angle 90^\\circ$ is just the polar name for the point at length 1, angle $90^\\circ$: $j$ itself.' },
      { key: 'reciprocal-j', response: 'Reciprocal: invert the length (still 1) and negate the angle ($-90^\\circ$). So $1/j = -j$, and $-1/j = j$. Check: $j\\cdot(-j) = -j^2 = 1$, confirming $1/j = -j$.' }
    ]
  },

  /* ================= D. POWERS AND ROOTS ============================== */
  {
    id: 'cx-power-01', title: '(3 + 4j)^5', kind: 'complex',
    params: { a: 3, b: 4, n: 5 },
    gen: () => ({ a: nz(-4, 4), b: nz(-4, 4), n: rint(3, 6) }),
    make: p => {
      const z = cx(p.a, p.b), r = C.abs(z), d = C.argDeg(z), w = C.pow(z, p.n);
      return {
        prompt: 'Write $' + fmtTex(z) + '$ in polar form, then compute $(' + fmtTex(z) + ')^{' + p.n + '}$.',
        answer: w,
        solution: '<p>$' + fmtTex(z) + ' = ' + F(r, 3) + '\\angle ' + F(d, 2) + '^\\circ$.</p><p>A power is repeated multiplication, and multiplication multiplies lengths and adds angles. So the $' + p.n + '$th power has length $' + F(r, 3) + '^{' + p.n + '} = ' + F(Math.pow(r, p.n), 2) + '$ and angle $' + p.n + '\\times ' + F(d, 2) + '^\\circ = ' + F(p.n * d, 2) + '^\\circ$' + (Math.abs(p.n * d) >= 360 ? ' $\\equiv ' + F(norm(p.n * d), 2) + '^\\circ$' : '') + '.</p><p>$(' + fmtTex(z) + ')^{' + p.n + '} = ' + F(Math.pow(r, p.n), 2) + '\\angle ' + F(norm(p.n * d), 2) + '^\\circ = ' + fmtTex({ re: Math.round(w.re), im: Math.round(w.im) }) + '$.</p><p>Nothing here needed expanding. The binomial route is $' + (p.n + 1) + '$ terms, each with a power of $j$ to track and a coefficient to compute, and it gives no insight when you are done.</p>'
      };
    },
    reframe: 'Powers rotate and scale. z^n has length |z|^n and angle n·θ. Nothing needs expanding.',
    visual: 'powers',
    hints: [
      'What kind of object is this? Does raising it to a power feel like algebra or like geometry?',
      'Rectangular form is built for addition. Powers are repeated multiplication. Is there a form built for multiplication?',
      { text: '$3 + 4j$ has magnitude 5 at $53.13^\\circ$. Multiplying by it once more multiplies the length by 5 and adds $53.13^\\circ$. So what happens to the magnitude and the angle when you raise it to the fifth power? Watch the spiral.', visual: 'powers', preset: { z: '3+4j', n: 5 } }
    ],
    solution: { visual: 'powers', preset: { z: '3+4j', n: 5 } },
    misconceptions: [
      { key: 'magnitude-only', test: (ans, q) => A.magNear(ans, C.abs(q.answer)) && (ans.form === 'real' || (ans.form === 'polar' && Math.abs(ans.rawAngle) < 0.5)) && !near(ans, q.answer),
        response: 'You have the magnitude rule but you have dropped the direction. A complex number carries an angle, and each multiplication adds another copy of it. Five multiplications by something at $53^\\circ$ do not leave you on the real axis.', visual: 'powers', preset: { z: '3+4j', n: 5 } },
      { key: 'angle-not-multiplied', test: (ans, q) => A.magNear(ans, C.abs(q.answer)) && sameDeg(ans.deg, C.argDeg(cx(q.params.a, q.params.b))) && q.params.n > 1,
        response: 'Magnitude to the $n$th, yes — but the angle also multiplies: each of the $n$ factors contributes its $\\theta$, so the power is at $n\\theta$. You have left it at $\\theta$.' },
      { key: 'deg-rad', test: (ans, q) => A.magNear(ans, C.abs(q.answer)) && (degRadSlip(ans, C.argDeg(q.answer)) || degRadSlip(ans, norm(C.argDeg(q.answer)))),
        response: 'The magnitude is right and the angle is the right number of <i>radians</i>, written as degrees.' },
      { key: 'squared-magnitude', test: (ans, q) => A.magNear(ans, Math.pow(q.params.a * q.params.a + q.params.b * q.params.b, q.params.n), 0.02),
        response: 'You raised $|z|^2 = a^2 + b^2$ to the $n$th power instead of $|z| = \\sqrt{a^2 + b^2}$. $|3 + 4j| = 5$, not 25.' },
      { key: 'arithmetic-slip', test: (ans, q) => ans.form === 'rect' && Math.abs(ans.r - C.abs(q.answer)) < 0.15 * C.abs(q.answer) && !near(ans, q.answer),
        response: 'The size is about right, so you almost certainly expanded the binomial and slipped somewhere in the arithmetic. That is not a criticism of your arithmetic — it is the point. The expansion is a twenty-minute calculation with a dozen places to go wrong. In polar form it is one multiplication and one addition. Watch what polar form does to it.', visual: 'powers', preset: { z: '3+4j', n: 5 } }
    ]
  },

  {
    id: 'cx-power-02', title: '(1 + j)^8', kind: 'complex',
    params: { a: 1, b: 1, n: 8 },
    gen: () => ({ a: pick([1, -1]), b: pick([1, -1]), n: pick([4, 6, 8]) }),
    make: p => {
      const z = cx(p.a, p.b), w = C.pow(z, p.n), d = C.argDeg(z);
      return {
        prompt: 'Compute $(' + fmtTex(z) + ')^{' + p.n + '}$ without expanding.',
        answer: w,
        solution: '<p>$' + fmtTex(z) + ' = \\sqrt2\\angle ' + F(d, 0) + '^\\circ$. Length $(\\sqrt2)^{' + p.n + '} = 2^{' + (p.n / 2) + '} = ' + Math.pow(2, p.n / 2) + '$; angle $' + p.n + '\\times ' + F(d, 0) + '^\\circ = ' + (p.n * d) + '^\\circ$' + (Math.abs(p.n * d) >= 360 ? ' $\\equiv ' + norm(p.n * d) + '^\\circ$' : '') + '.</p><p>$(' + fmtTex(z) + ')^{' + p.n + '} = ' + Math.pow(2, p.n / 2) + '\\angle ' + norm(p.n * d) + '^\\circ = ' + fmtTex({ re: Math.round(w.re), im: Math.round(w.im) }) + '$.</p>'
      };
    },
    reframe: 'A point at 45° raised to the 8th makes two full turns and lands on the positive real axis.',
    visual: 'powers',
    hints: [
      'What is the angle of $1 + j$? Multiply that angle by 8. Where does that direction point?',
      { text: 'Watch the eight steps of the spiral.', visual: 'powers', preset: { z: '1+j', n: 8 } },
      'Length: $|1 + j| = \\sqrt2$, and $(\\sqrt2)^8 = 2^4$. Angle: $8\\times45^\\circ$ is how many full turns?'
    ],
    solution: { visual: 'powers', preset: { z: '1+j', n: 8 } },
    misconceptions: [
      { key: 'squared-magnitude', test: (ans, q) => A.magNear(ans, Math.pow(2, q.params.n), 0.02),
        response: 'You used $|1 + j| = 2$. It is $\\sqrt{1 + 1} = \\sqrt2$; the $2$ is $|z|^2$. $(\\sqrt2)^{8} = 16$, not $2^8 = 256$.' },
      { key: 'linearity', test: (ans, q) => near(ans, cx(Math.pow(q.params.a, q.params.n) + Math.pow(q.params.b, q.params.n) * ((q.params.n % 4 === 0) ? 1 : -1), 0)) && !near(ans, q.answer),
        response: 'You raised each part to the power separately, $1^8 + j^8$. $(a + b)^n$ is not $a^n + b^n$. Rotation is the shortcut: $\\sqrt2$ at $45^\\circ$, eighth power is $16$ at $360^\\circ$.' },
      { key: 'angle-not-multiplied', test: (ans, q) => A.magNear(ans, C.abs(q.answer)) && sameDeg(ans.deg, C.argDeg(cx(q.params.a, q.params.b))),
        response: 'Length right; the angle also gets multiplied by $n$. Eight steps of $45^\\circ$ is $360^\\circ$: two full turns, back on the real axis.' }
    ]
  },

  {
    id: 'cx-power-j', title: 'j^2023', kind: 'complex',
    params: { n: 2023 },
    gen: () => ({ n: rint(10, 999) }),
    make: p => {
      const k = p.n % 4, w = [cx(1, 0), cx(0, 1), cx(-1, 0), cx(0, -1)][k];
      return {
        prompt: 'What is $j^{' + p.n + '}$?',
        answer: w,
        solution: '<p>Each multiplication by $j$ is a quarter turn. Four quarter turns is a full turn, so $j^4 = 1$ and the powers cycle: $j, -1, -j, 1, j, -1, \\ldots$</p><p>$' + p.n + ' = 4\\times' + Math.floor(p.n / 4) + ' + ' + k + '$, so $j^{' + p.n + '} = (j^4)^{' + Math.floor(p.n / 4) + '}\\cdot j^{' + k + '} = j^{' + k + '} = ' + fmtTex(w) + '$.</p>'
      };
    },
    reframe: 'j^n is n quarter turns. Only the remainder mod 4 matters.',
    visual: 'powers',
    hints: [
      'Do not compute anything yet. Where do $j^1, j^2, j^3, j^4$ sit in the plane?',
      { text: 'Watch the powers of $j$ go round.', visual: 'powers', preset: { z: 'j', n: 8 } },
      'The pattern repeats every four. What is the remainder when the exponent is divided by 4?'
    ],
    solution: { visual: 'powers', preset: { z: 'j', n: 8 } },
    misconceptions: [
      { key: 'no-cycle', test: (ans, q) => near(ans, cx(0, 1)) && q.params.n % 4 !== 1,
        response: 'You have $j$ itself, as if the exponent did nothing. Each factor of $j$ is a quarter turn; after the exponent-many turns you are somewhere specific. Find the remainder of the exponent mod 4.', visual: 'powers', preset: { z: 'j', n: 8 } },
      { key: 'off-by-one', test: (ans, q) => (near(ans, cx(-1, 0)) && q.params.n % 4 !== 2) || (near(ans, cx(0, -1)) && q.params.n % 4 !== 3) || (near(ans, cx(1, 0)) && q.params.n % 4 !== 0),
        response: 'Right idea, wrong step in the cycle. Remainder 0 → $1$, 1 → $j$, 2 → $-1$, 3 → $-j$. Recount the remainder.' },
      { key: 'huge', test: (ans, q) => ans.r > 1.5,
        response: '$|j| = 1$, and lengths multiply, so every power of $j$ has length exactly 1. It stays on the unit circle forever; only its direction changes.' }
    ]
  },

  {
    id: 'cx-root-01', title: 'cube roots of 8', kind: 'complex',
    params: { v: 8, quad: 2 },
    gen: () => pick([{ v: 8, quad: 2 }, { v: 8, quad: 3 }, { v: 27, quad: 2 }, { v: 27, quad: 3 }, { v: 1, quad: 2 }, { v: 1, quad: 3 }]),
    make: p => {
      const r = Math.cbrt(p.v), d = p.quad === 2 ? 120 : 240;
      return {
        prompt: 'The number $' + p.v + '$ has three cube roots in the complex plane. Find the one in quadrant ' + (p.quad === 2 ? 'II' : 'III') + '.',
        answer: P(r, d),
        solution: '<p>$' + p.v + '$ is $' + p.v + '\\angle 0^\\circ$ — but also $' + p.v + '\\angle 360^\\circ$ and $' + p.v + '\\angle 720^\\circ$, because a full turn changes nothing. A cube root takes the cube root of the length and <i>a third</i> of the angle. Three different angles to take a third of: $0^\\circ, 120^\\circ, 240^\\circ$.</p><p>The roots are $' + F(r, 3) + '\\angle 0^\\circ$, $' + F(r, 3) + '\\angle 120^\\circ$, $' + F(r, 3) + '\\angle 240^\\circ$: equally spaced around a circle of radius $\\sqrt[3]{' + p.v + '} = ' + F(r, 3) + '$. The quadrant ' + (p.quad === 2 ? 'II' : 'III') + ' one is $' + F(r, 3) + '\\angle ' + d + '^\\circ = ' + fmtTex({ re: F(r * Math.cos(d * D2R), 3), im: F(r * Math.sin(d * D2R), 3) }) + '$.</p><p>Check: cube it. Length $' + F(r, 3) + '^3 = ' + p.v + '$, angle $3\\times' + d + '^\\circ = ' + (3 * d) + '^\\circ \\equiv 0^\\circ$. ✓</p>'
      };
    },
    reframe: 'An nth root divides the angle by n — and 0°, 360°, 720° are the same angle with different thirds. That is why there are n roots, equally spaced.',
    visual: 'powers',
    hints: [
      'A cube root is a number that, cubed, gives $8$. Cubing triples the angle. What angles, tripled, land on the positive real axis?',
      { text: 'Try $z = 2\\angle 120^\\circ$ (that is $-1 + 1.732j$) with $n = 3$ in the spiral. Where does $z^3$ land?', visual: 'powers', preset: { z: '2∠120', n: 3 } },
      '$0^\\circ$, $360^\\circ$ and $720^\\circ$ are all "the positive real axis". Divide each by 3. The three answers are the three roots; the length of each is $\\sqrt[3]{8}$.'
    ],
    solution: { visual: 'powers', preset: { z: '2∠120', n: 3 } },
    misconceptions: [
      { key: 'only-real-root', test: (ans, q) => near(ans, cx(Math.cbrt(q.params.v), 0)),
        response: 'That is <i>a</i> cube root — the real one — and the question asked for the one in a different quadrant. Real-number habits say "the cube root of 8 is 2". In the plane there are three, because $8\\angle 0^\\circ = 8\\angle 360^\\circ = 8\\angle 720^\\circ$ and a third of each of those angles is different.', visual: 'powers', preset: { z: '2∠120', n: 3 } },
      { key: 'kept-magnitude', test: (ans, q) => A.magNear(ans, q.params.v) && !A.magNear(ans, Math.cbrt(q.params.v)),
        response: 'The angle idea is right but the length is untouched. A cube root also takes the cube root of the length: $\\sqrt[3]{8} = 2$, not 8. The roots sit on a circle of radius 2.' },
      { key: 'guessed-90', test: (ans, q) => A.magNear(ans, Math.cbrt(q.params.v)) && (sameDeg(ans.deg, 90) || sameDeg(ans.deg, 180) || sameDeg(ans.deg, 270)),
        response: 'Length right. The roots are spaced $360^\\circ/3 = 120^\\circ$ apart starting from $0^\\circ$: $0^\\circ, 120^\\circ, 240^\\circ$. Check your angle by tripling it — does it land on $0^\\circ$ (mod $360^\\circ$)?' }
    ]
  },

  {
    id: 'cx-root-02', title: '√(2j)', kind: 'complex',
    params: { v: 2 },
    gen: () => ({ v: pick([2, 8, 18, 32]) }),
    make: p => {
      const r = Math.sqrt(p.v);
      return {
        prompt: 'Find the square root of $' + p.v + 'j$ that lies in the first quadrant.',
        answer: P(r, 45),
        solution: '<p>$' + p.v + 'j = ' + p.v + '\\angle 90^\\circ$. A square root halves the angle and takes the square root of the length: $\\sqrt{' + p.v + '}\\angle 45^\\circ = ' + F(r, 3) + '\\angle 45^\\circ = ' + fmtTex({ re: F(r * Math.SQRT1_2, 3), im: F(r * Math.SQRT1_2, 3) }) + '$.</p><p>(The other root is at $45^\\circ + 180^\\circ$, in quadrant III.) Check by squaring: length $' + F(r, 3) + '^2 = ' + p.v + '$, angle $2\\times45^\\circ = 90^\\circ$: $' + p.v + 'j$. ✓</p>'
      };
    },
    reframe: 'Square root halves the angle. j is at 90°, so √j is at 45°. There is nothing mysterious about √j.',
    visual: 'powers',
    hints: [
      'Write $2j$ in polar form first. What is its angle?',
      { text: 'Squaring doubles the angle. What angle, doubled, gives $90^\\circ$? Try that point in the spiral with $n = 2$.', visual: 'powers', preset: { z: '1+j', n: 2 } },
      'Halve the angle, square-root the length. Then convert back to $a + bj$.'
    ],
    solution: { visual: 'powers', preset: { z: '1+j', n: 2 } },
    misconceptions: [
      { key: 'j-as-variable', test: (ans, q) => near(ans, cx(0, Math.sqrt(q.params.v))),
        response: 'You wrote $\\sqrt{2j} = \\sqrt2\\,j$ — pulling $j$ out of the root as if $\\sqrt j = j$. But $j$ is a rotation by $90^\\circ$, and half of that rotation is $45^\\circ$: $\\sqrt j = 1\\angle 45^\\circ$, not $j$. Check your answer by squaring it: $(\\sqrt2 j)^2 = -2$, not $2j$.' },
      { key: 'kept-magnitude', test: (ans, q) => A.magNear(ans, q.params.v) && sameDeg(ans.deg, 45),
        response: 'Angle right. The length also gets square-rooted: $\\sqrt{2}$, not $2$.' },
      { key: 'wrong-half', test: (ans, q) => A.magNear(ans, Math.sqrt(q.params.v)) && sameDeg(ans.deg, -45),
        response: 'You halved $-90^\\circ$ instead of $+90^\\circ$. $2j$ points straight <i>up</i>; the root at $-45^\\circ$ squares to $2\\angle -90^\\circ = -2j$.' }
    ]
  },

  /* ================= E. TRIG IDENTITIES AND PHASORS ==================== */
  {
    id: 'cx-trig-cos', title: 'cos(A + B) from rotations', kind: 'expr', vars: ['A', 'B'],
    prompt: 'Using $e^{j(A+B)} = e^{jA}\\,e^{jB}$, expand $\\cos(A + B)$. Type your expression in $A$ and $B$, e.g. <span class="kbd">cos(A)cos(B) - …</span>',
    expr: 'cos(A)*cos(B) - sin(A)*sin(B)',
    reframe: 'cos(A + B) is the real part of two rotations composed. The minus sign is j·j = −1. Nothing to memorise.',
    visual: 'multiply',
    hints: [
      'Write out both sides. Left: $\\cos(A+B) + j\\sin(A+B)$. Right: $(\\cos A + j\\sin A)(\\cos B + j\\sin B)$. You want the real part.',
      { text: 'Multiply out the right-hand side. Four terms. Which two are real? Watch the product of two unit-circle points: its real part is $\\cos$ of the summed angle.', visual: 'multiply', preset: { z1: P(1, 40), z2: P(1, 30) } },
      'The real terms are $\\cos A\\cos B$ and $(j\\sin A)(j\\sin B)$. What is $j\\cdot j$? That fixes the sign.'
    ],
    solution: { visual: 'multiply', preset: { z1: P(1, 40), z2: P(1, 30) }, text: '<p>$e^{j(A+B)} = e^{jA}e^{jB} = (\\cos A + j\\sin A)(\\cos B + j\\sin B) = \\cos A\\cos B + j\\cos A\\sin B + j\\sin A\\cos B + j^2\\sin A\\sin B.$</p><p>Real part: $\\cos A\\cos B - \\sin A\\sin B$ (the $j^2$ became $-1$). Imaginary part: $\\sin A\\cos B + \\cos A\\sin B$.</p><p>So $\\cos(A+B) = \\cos A\\cos B - \\sin A\\sin B$ and, for free, $\\sin(A+B) = \\sin A\\cos B + \\cos A\\sin B$. Every addition formula is one line of this: multiply two rotations, read off the parts. That is why you never need to memorise them.</p>' },
    misconceptions: [
      { key: 'sign', expr: 'cos(A)*cos(B) + sin(A)*sin(B)',
        response: 'That is $\\cos(A - B)$. Test it: $A = B = 45^\\circ$ gives $\\cos 90^\\circ = 0$, but your formula gives $1$. The minus sign is not a convention to remember — it is $j\\cdot j = -1$ when the two imaginary parts multiply.' },
      { key: 'linear', expr: 'cos(A) + cos(B)',
        response: 'Cosine is not linear. $A = B = 90^\\circ$: $\\cos 180^\\circ = -1$, but $\\cos 90^\\circ + \\cos 90^\\circ = 0$. Rotations <i>multiply</i>, they do not add: expand $e^{jA}e^{jB}$.' },
      { key: 'dropped-term', expr: 'cos(A)*cos(B)',
        response: 'You kept only the real·real product. The imaginary·imaginary product $(j\\sin A)(j\\sin B) = -\\sin A\\sin B$ is <i>also</i> real, and it belongs in the real part.' }
    ]
  },

  {
    id: 'cx-trig-sin', title: 'sin(A + B) from rotations', kind: 'expr', vars: ['A', 'B'],
    prompt: 'Same product, $e^{jA}\\,e^{jB}$: expand $\\sin(A + B)$.',
    expr: 'sin(A)*cos(B) + cos(A)*sin(B)',
    reframe: 'sin(A + B) is the imaginary part of two rotations composed: the two cross terms, each with exactly one j.',
    visual: 'multiply',
    hints: [
      'You want the imaginary part of $(\\cos A + j\\sin A)(\\cos B + j\\sin B)$. Which of the four terms carry exactly one $j$?',
      { text: 'The terms with one $j$ are the cross terms. There are two of them and they have the same sign. Watch the product\'s imaginary part in the figure.', visual: 'multiply', preset: { z1: P(1, 40), z2: P(1, 30) } },
      '$j\\cos A\\sin B + j\\sin A\\cos B$. Factor out the $j$; what remains is $\\sin(A + B)$.'
    ],
    solution: { visual: 'multiply', preset: { z1: P(1, 40), z2: P(1, 30) }, text: '<p>$(\\cos A + j\\sin A)(\\cos B + j\\sin B)$ has two terms with a single $j$: $j\\sin A\\cos B$ and $j\\cos A\\sin B$. Their sum is $j(\\sin A\\cos B + \\cos A\\sin B)$, and that must equal $j\\sin(A+B)$.</p><p>$\\sin(A + B) = \\sin A\\cos B + \\cos A\\sin B$. Plus sign, because neither term had a $j^2$ in it.</p>' },
    misconceptions: [
      { key: 'that-is-cos-minus', expr: 'sin(A)*sin(B) + cos(A)*cos(B)',
        response: 'That is $\\cos(A - B)$ — the terms with zero or two $j$s. For the sine you want the terms with exactly <i>one</i> $j$: the cross terms $\\sin A\\cos B$ and $\\cos A\\sin B$.' },
      { key: 'linear', expr: 'sin(A) + sin(B)',
        response: 'Sine is not linear: $\\sin 90^\\circ + \\sin 90^\\circ = 2$, but $\\sin 180^\\circ = 0$. Multiply the rotations and take the imaginary part.' },
      { key: 'sign', expr: 'sin(A)*cos(B) - cos(A)*sin(B)',
        response: 'That is $\\sin(A - B)$. Both cross terms come with a single $+j$, so they add. The minus sign belongs to the cosine formula, where $j^2$ appears.' }
    ]
  },

  {
    id: 'cx-trig-double', title: 'cos 2A from a square', kind: 'expr', vars: ['A'],
    prompt: 'Using $e^{j2A} = (e^{jA})^2$, express $\\cos 2A$ in terms of $\\cos A$ and $\\sin A$. (Any equivalent form is accepted.)',
    expr: 'cos(A)^2 - sin(A)^2',
    reframe: 'Doubling the angle is squaring the rotation. cos 2A is the real part of (cos A + j sin A)².',
    visual: 'powers',
    hints: [
      'Squaring a rotation doubles its angle. So $\\cos 2A + j\\sin 2A = (\\cos A + j\\sin A)^2$. Expand the square.',
      { text: 'Three terms: $\\cos^2 A$, $2j\\sin A\\cos A$, $j^2\\sin^2 A$. Which are real? Watch a unit-circle point being squared.', visual: 'powers', preset: { z: '1∠35', n: 2 } },
      'The real part is $\\cos^2 A + j^2\\sin^2 A$. Replace $j^2$.'
    ],
    solution: { visual: 'powers', preset: { z: '1∠35', n: 2 }, text: '<p>$(\\cos A + j\\sin A)^2 = \\cos^2 A + 2j\\sin A\\cos A - \\sin^2 A$.</p><p>Real part: $\\cos 2A = \\cos^2 A - \\sin^2 A$ (equivalently $2\\cos^2 A - 1$ or $1 - 2\\sin^2 A$, using $\\cos^2 + \\sin^2 = 1$). Imaginary part, free of charge: $\\sin 2A = 2\\sin A\\cos A$.</p>' },
    misconceptions: [
      { key: 'linear', expr: '2*cos(A)',
        response: '$\\cos 2A \\neq 2\\cos A$: cosine is bounded by 1 and $2\\cos A$ is not. Doubling the angle is <i>squaring</i> the rotation, not doubling it.' },
      { key: 'pythagoras', expr: 'cos(A)^2 + sin(A)^2',
        response: 'That is identically 1 — you have $j^2 = +1$ again. The $\\sin^2 A$ term carries a $j^2 = -1$, so it is subtracted.' },
      { key: 'dropped-term', expr: 'cos(A)^2',
        response: 'You kept the real·real term only. $(j\\sin A)^2 = -\\sin^2 A$ is also real and belongs in the real part.' }
    ]
  },

  {
    id: 'cx-add-01', title: 'adding phasors', kind: 'complex',
    params: { r1: 3, d1: 0, r2: 4, d2: 90 },
    gen: () => ({ r1: rint(2, 6), d1: pick([0, 30, 45, 60, 90]), r2: rint(2, 6), d2: pick([90, 120, 135, 180, -90, -60]) }),
    make: p => {
      const z = C.add(P(p.r1, p.d1), P(p.r2, p.d2));
      return {
        prompt: 'Two sinusoids of the same frequency are represented by the phasors $' + p.r1 + '\\angle ' + p.d1 + '^\\circ$ and $' + p.r2 + '\\angle ' + p.d2 + '^\\circ$. Their sum is a sinusoid too. Find its phasor.',
        answer: z,
        solution: '<p>Addition is tip-to-tail, and that is a rectangular operation. Convert: $' + p.r1 + '\\angle ' + p.d1 + '^\\circ = ' + fmtTex(P(p.r1, p.d1)) + '$ and $' + p.r2 + '\\angle ' + p.d2 + '^\\circ = ' + fmtTex(P(p.r2, p.d2)) + '$. Add: $' + fmtTex(z) + '$. Convert back: $' + F(C.abs(z), 3) + '\\angle ' + F(C.argDeg(z), 2) + '^\\circ$.</p><p>Rule of thumb for the whole of next year: <b>add in rectangular, multiply in polar.</b></p>'
      };
    },
    reframe: 'Add in rectangular, multiply in polar. Polar form cannot add — the lengths and angles of a sum are not simple functions of the lengths and angles of the parts.',
    visual: 'rotation',
    hints: [
      'Multiplication had a clean polar rule. Does addition? Try adding $1\\angle 0^\\circ$ and $1\\angle 180^\\circ$ in your head and see what the "add the lengths" rule would predict.',
      { text: 'Addition is tip-to-tail: put the second arrow\'s tail on the first arrow\'s tip. That is coordinate-wise — rectangular. Drag the point to the result and read its polar form.', visual: 'rotation', preset: { z: { re: 3, im: 4 } } },
      'Convert both to $a + bj$, add real to real and imaginary to imaginary, convert the sum back to polar.'
    ],
    solution: { visual: 'rotation', preset: { z: { re: 3, im: 4 } } },
    misconceptions: [
      { key: 'add-in-polar', test: (ans, q) => A.magNear(ans, q.params.r1 + q.params.r2) && !A.magNear(ans, C.abs(q.answer)),
        response: 'You added the lengths. Lengths only add when the arrows point the same way. $3$ east plus $4$ north is $5$ north-east, not $7$ anything. Polar form is for multiplying; for adding, go rectangular.', visual: 'rotation', preset: { z: { re: 3, im: 4 } } },
      { key: 'mean-angle', test: (ans, q) => sameDeg(ans.deg, (q.params.d1 + q.params.d2) / 2) && !sameDeg(ans.deg, C.argDeg(q.answer)),
        response: 'The angle of a sum is not the average of the angles — it leans toward the longer arrow. Only tip-to-tail addition in rectangular coordinates gets it right.' },
      { key: 'multiplied', test: (ans, q) => near(ans, C.mul(P(q.params.r1, q.params.d1), P(q.params.r2, q.params.d2))),
        response: 'You multiplied them (lengths multiplied, angles added). The question asked for the <i>sum</i> — the phasor of the two signals superposed.' }
    ]
  },

  {
    id: 'cx-phasor-delay', title: 'delaying a phasor', kind: 'complex',
    params: { r: 5, d: -60, delay: 90 },
    gen: () => ({ r: rint(2, 9), d: pick([0, 30, -30, 45, -60, 90, 120]), delay: pick([90, 45, 30, 180, 60]) }),
    make: p => ({
      prompt: 'The signal $' + p.r + '\\cos(\\omega t ' + (p.d < 0 ? '- ' + (-p.d) : '+ ' + p.d) + '^\\circ)$ is written as the phasor $' + p.r + '\\angle ' + p.d + '^\\circ$. What phasor represents the same signal <i>delayed</i> by a further $' + p.delay + '^\\circ$ of phase?',
      answer: P(p.r, p.d - p.delay),
      solution: '<p>Delaying a signal makes every feature happen <i>later</i>, so the phase becomes more negative: $\\cos(\\omega t + \\phi)$ delayed by $\\delta$ is $\\cos(\\omega t + \\phi - \\delta)$.</p><p>Phasor: $' + p.r + '\\angle(' + p.d + '^\\circ - ' + p.delay + '^\\circ) = ' + p.r + '\\angle ' + (p.d - p.delay) + '^\\circ$. Same length — a delay does not change amplitude. In the plane it is a clockwise rotation by $' + p.delay + '^\\circ$: multiplying by $e^{-j' + p.delay + '^\\circ}$.</p>'
    }),
    reframe: 'A delay is a clockwise rotation of the phasor. Multiplying by e^{−jδ} delays; multiplying by e^{+jδ} advances.',
    visual: 'rotation',
    hints: [
      'A delayed signal reaches its peak <i>later</i>. Does that make the phase angle bigger or smaller?',
      { text: 'Later peak means $\\cos(\\omega t + \\phi - \\delta)$. In the plane, subtracting from the angle is a turn in which direction? Drag the point through it.', visual: 'rotation', preset: { z: P(5, -60) } },
      'Keep the length, subtract the delay from the angle.'
    ],
    solution: { visual: 'rotation', preset: { z: P(5, -150) } },
    misconceptions: [
      { key: 'wrong-direction', test: (ans, q) => nearP(ans, q.params.r, q.params.d + q.params.delay) && q.params.delay % 180 !== 0,
        response: 'You added the phase, which makes the peak arrive <i>earlier</i> — that is an advance (a lead), not a delay. Delay = later = phase more negative = clockwise turn.' },
      { key: 'half-turn', test: (ans, q) => nearP(ans, q.params.r, q.params.d + 180) && q.params.delay !== 180,
        response: 'You have flipped the sign of the phasor, which is a $180^\\circ$ shift. The delay asked for was smaller than that.' },
      { key: 'changed-length', test: (ans, q) => !A.magNear(ans, q.params.r) && sameDeg(ans.deg, q.params.d - q.params.delay),
        response: 'Angle right, but a delay does not change the amplitude. The length stays what it was.' }
    ]
  },

  {
    id: 'cx-phasor-deriv', title: 'd/dt as a phasor operation', kind: 'choice',
    prompt: 'A signal $\\cos(\\omega t + \\phi)$ is represented by the phasor $e^{j\\phi}$. Which operation on the phasor corresponds to differentiating the signal with respect to $t$?',
    options: [
      { text: 'Multiply by $j\\omega$', correct: true },
      { text: 'Multiply by $\\omega$', mis: 'lost-rotation' },
      { text: 'Multiply by $-\\omega$', mis: 'sign-as-phase' },
      { text: 'Multiply by $j$', mis: 'lost-scale' }
    ],
    reframe: 'd/dt of a rotating phasor is jω times it: scale by ω, turn a quarter turn. That single fact is why capacitors and inductors have impedances 1/(jωC) and jωL.',
    visual: 'euler',
    hints: [
      'Differentiate $\\cos(\\omega t + \\phi)$ by hand. You get $-\\omega\\sin(\\omega t + \\phi)$. Two things happened to the signal: one is a size change, one is a shape change. Name them.',
      { text: '$-\\sin x = \\cos(x + 90^\\circ)$: the derivative is the same cosine shifted a quarter cycle <i>earlier</i>, and scaled by $\\omega$. A quarter turn earlier is what multiplication in the plane?', visual: 'euler', preset: { theta: 0.5 } },
      'Cleaner: the full rotating phasor is $e^{j(\\omega t + \\phi)}$ and the signal is its real part. Differentiate the exponential directly: $\\frac{d}{dt}e^{j(\\omega t+\\phi)} = ?$'
    ],
    solution: { visual: 'euler', preset: { theta: 0.5 }, text: '<p>The signal is $\\operatorname{Re}\\{e^{j\\omega t}e^{j\\phi}\\}$. Differentiating the exponential: $\\frac{d}{dt}e^{j\\omega t}e^{j\\phi} = j\\omega\\, e^{j\\omega t}e^{j\\phi}$. So the phasor of the derivative is $j\\omega$ times the phasor of the signal.</p><p>Check against $-\\omega\\sin(\\omega t + \\phi)$: $j\\omega e^{j\\phi}$ has length $\\omega|e^{j\\phi}| = \\omega$ (the amplitude scaling) and angle $\\phi + 90^\\circ$ (the quarter-turn lead), and $\\cos(\\omega t + \\phi + 90^\\circ) = -\\sin(\\omega t + \\phi)$. ✓</p><p>This is the bridge to module 6: for a capacitor $i = C\\,dv/dt$, so $I = j\\omega C\\, V$ and the impedance is $V/I = 1/(j\\omega C)$. Differentiation became multiplication by $j\\omega$; calculus became algebra.</p>' },
    misconceptions: [
      { key: 'lost-rotation', response: 'Differentiating gives $-\\omega\\sin$, which is not just a bigger cosine — it is a cosine shifted a quarter turn. The $\\omega$ is the scaling; the quarter turn is a factor of $j$. You have kept one and dropped the other.' },
      { key: 'sign-as-phase', response: 'The minus sign in $-\\omega\\sin(\\omega t + \\phi)$ is not a factor of $-1$ on the phasor. $-\\sin x = \\cos(x + 90^\\circ)$ — a quarter turn, not a half turn. A half turn ($\\times -1$) would give $-\\cos$, and the derivative of a cosine is not minus a cosine.' },
      { key: 'lost-scale', response: 'Quarter turn, yes — but $\\frac{d}{dt}\\cos(\\omega t)$ also multiplies the amplitude by $\\omega$. Faster oscillation, steeper slopes, bigger derivative. The factor is $j\\omega$, not $j$.' }
    ]
  }
  ];

  /* Build the question object the UI works with. */
  function build(item, params) {
    if (item.make) {
      const p = params || item.params;
      const q = item.make(p);
      return { item: item, params: p, prompt: q.prompt, answer: q.answer, solutionText: q.solution };
    }
    return { item: item, params: {}, prompt: item.prompt, answer: item.answer || null, solutionText: (item.solution && item.solution.text) || '' };
  }
  function variant(item) { return item.gen ? build(item, item.gen()) : null; }

  window.MODULE_ITEMS = ITEMS;
  const MOD = {
    id: '01-complex', number: 1,
    name: 'Complex numbers and Euler\u2019s formula',
    reframe: 'A complex number is a length and a direction. Multiplying rotates and scales. e^{jθ} is pure rotation.',
    items: ITEMS, build: build, variant: variant
  };
  window.MODULE = MOD;
  window.MODULES = window.MODULES || {};
  window.MODULES[MOD.id] = MOD;
})();
