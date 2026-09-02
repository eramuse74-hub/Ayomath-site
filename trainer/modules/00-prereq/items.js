/* items.js — module 0 (optional): prerequisite mathematics refresh.
   The algebra, trigonometry and calculus reflexes that ECE 230, BME 310 and
   module 1 silently assume. Same pedagogy as module 1 (docs/Special/
   trainer-site-spec.md §3): hint ladder, named wrong models, a figure you
   drive. Kinds: number | expr | choice | complex. Expression items are checked
   numerically at test points; `upToConstant` allows any +C; `domain` restricts
   the test points (e.g. logs need positive arguments).
*/
(function () {
  'use strict';
  const A = window.Answers, C = window.CP.C;
  const F = (x, dp) => Number(x.toFixed(dp == null ? 3 : dp));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const PI = Math.PI;
  const num = (ans, v, rel) => A.checkNumber(ans, v, (rel == null ? 0.01 : rel) * Math.abs(v));
  const sameMag = (a, b) => Math.abs(Math.abs(a) - Math.abs(b)) < 0.01 * Math.max(1, Math.abs(b));

  const ITEMS = [

  /* ================= A. ALGEBRA FLUENCY =============================== */
  {
    id: 'pre-cancel-01', title: 'cancelling correctly', kind: 'expr', vars: ['x'],
    prompt: 'Simplify $\\dfrac{x^2 - 9}{x - 3}$ (for $x \\neq 3$). Type an expression in $x$.',
    expr: 'x + 3',
    reframe: 'You can only cancel factors, never terms. Factor first; then cancel what is genuinely multiplied.',
    visual: 'quadratic',
    hints: [
      'Do not divide anything yet. Can the numerator be written as a product of two brackets?',
      'Difference of two squares: $x^2 - 9 = (x-3)(x+3)$. Now the fraction is a product over a factor.',
      'One bracket in the numerator is identical to the denominator. Cancel that factor. What is left?'
    ],
    solution: { visual: 'quadratic', preset: { a: 1, b: 0, c: -9 }, text: '<p>$\\dfrac{x^2-9}{x-3} = \\dfrac{(x-3)(x+3)}{x-3} = x + 3$ for $x \\neq 3$.</p><p>The move that fails, $\\dfrac{x^2}{x} - \\dfrac{9}{3}$, treats the numerator as two separate things divided one at a time. Division does not distribute over a sum in the numerator that way. Factor, then cancel <i>factors</i>.</p>' },
    misconceptions: [
      { key: 'cancel-terms', expr: 'x - 3', response: 'You cancelled $x^2$ against $x$ and $9$ against $3$ term by term. Test it: at $x = 4$ the original is $7/1 = 7$, and $x - 3$ gives $1$. Only <i>factors</i> cancel. Factor the numerator first.' },
      { key: 'partial', expr: 'x + 9', response: 'Close, but check with a number: at $x = 4$, $(16 - 9)/(4 - 3) = 7$, and $x + 9 = 13$. The factorisation is $(x-3)(x+3)$: the constant that survives is $3$, not $9$.' },
      { key: 'half-cancel', expr: 'x^2 - 3', response: 'You cancelled the $9$ against the $3$ and left the $x^2$ alone. Cancelling has to be a whole factor of the whole numerator: factor $x^2 - 9$ first.' }
    ]
  },

  {
    id: 'pre-expand-01', title: 'expanding a square', kind: 'expr', vars: ['x'],
    prompt: 'Expand $(2x - 3)^2$.',
    expr: '4x^2 - 12x + 9',
    reframe: '(a − b)² has three terms. The middle one, −2ab, is where every circuit-analysis algebra slip lives.',
    visual: 'quadratic',
    hints: [
      'Write it as $(2x - 3)(2x - 3)$ and multiply every term in the first bracket by every term in the second. How many products is that?',
      'Four products: $2x\\cdot2x$, $2x\\cdot(-3)$, $(-3)\\cdot 2x$, $(-3)(-3)$. Two of them are the same.',
      'Collect: $4x^2$, then two copies of $-6x$, then $+9$.'
    ],
    solution: { visual: 'quadratic', preset: { a: 4, b: -12, c: 9 }, text: '<p>$(2x-3)^2 = (2x)^2 - 2(2x)(3) + 3^2 = 4x^2 - 12x + 9$.</p><p>Check with $x = 2$: $(4 - 3)^2 = 1$, and $16 - 24 + 9 = 1$. ✓ The parabola touches the axis at $x = 1.5$, a double root — which is what a perfect square means.</p>' },
    misconceptions: [
      { key: 'linearity', expr: '4x^2 + 9', response: '$(a-b)^2 \\neq a^2 + b^2$. You dropped the cross term. Try $x = 2$: $(4-3)^2 = 1$, but $16 + 9 = 25$. Squaring is not linear; the $-2ab$ term is the whole difference.' },
      { key: 'half-cross', expr: '4x^2 - 6x + 9', response: 'You have one copy of the cross term. There are two: $2x\\cdot(-3)$ and $(-3)\\cdot 2x$. That is why the formula says $-2ab$.' },
      { key: 'sign', expr: '4x^2 + 12x + 9', response: 'Sign of the middle term: $(-3)$ times $2x$ is negative, twice. $(2x+3)^2$ would give $+12x$.' },
      { key: 'coefficient', expr: '2x^2 - 12x + 9', response: '$(2x)^2 = 4x^2$: the coefficient gets squared too, not just the $x$.' }
    ]
  },

  {
    id: 'pre-exp-rules', title: 'exponent rules', kind: 'expr', vars: ['x'], domain: [0.3, 3],
    prompt: 'Simplify $(x^3)^2 \\cdot x^{-4}$ to a single power of $x$.',
    expr: 'x^2',
    reframe: 'A power of a power multiplies exponents; a product of powers adds them. Keep the two rules apart.',
    visual: 'tangent',
    hints: [
      'Two rules are in play. Deal with the bracket first: what does $(x^3)^2$ mean if you write it out?',
      '$(x^3)^2 = x^3\\cdot x^3 = x^6$: exponents <i>multiply</i> under a power of a power. Now you have $x^6 \\cdot x^{-4}$.',
      'Multiplying powers of the same base <i>adds</i> exponents: $6 + (-4)$.'
    ],
    solution: { text: '<p>$(x^3)^2 = x^{3\\cdot2} = x^6$, then $x^6\\cdot x^{-4} = x^{6-4} = x^2$.</p><p>The two rules come from counting factors: $(x^3)^2$ is three $x$s taken twice (six), and $x^{-4}$ removes four of them. Two remain.</p>' },
    misconceptions: [
      { key: 'add-instead-of-multiply', expr: 'x', response: 'You added inside the bracket: $(x^3)^2 = x^5$. Count the factors: $x^3\\cdot x^3$ has six $x$s. A power of a power multiplies exponents.' },
      { key: 'multiply-instead-of-add', expr: 'x^(-24)', response: 'You multiplied $6$ by $-4$. Multiplying two powers of the same base <i>adds</i> the exponents: $x^6\\cdot x^{-4} = x^{2}$.' },
      { key: 'negative-lost', expr: 'x^10', response: 'The $-4$ is negative: $x^{-4}$ removes four factors. $6 - 4$, not $6 + 4$.' }
    ]
  },

  {
    id: 'pre-log-solve', title: 'solving 2^x = 10', kind: 'number',
    params: { base: 2, v: 10 },
    gen: () => { let p; do { p = { base: pick([2, 3, 5, 10]), v: pick([10, 20, 50, 7, 100, 1000, 30]) }; } while (Math.abs(Math.log(p.v) / Math.log(p.base) - p.v / p.base) < 0.05 || Number.isInteger(Math.log(p.v) / Math.log(p.base) + 1e-9)); return p; },
    make: p => ({
      prompt: 'Solve $' + p.base + '^x = ' + p.v + '$ for $x$ (3 significant figures).',
      answer: { value: Math.log(p.v) / Math.log(p.base) },
      solution: '<p>Take a logarithm of both sides — any base works. $x\\ln ' + p.base + ' = \\ln ' + p.v + '$, so $x = \\dfrac{\\ln ' + p.v + '}{\\ln ' + p.base + '} = \\dfrac{' + F(Math.log(p.v), 4) + '}{' + F(Math.log(p.base), 4) + '} = ' + F(Math.log(p.v) / Math.log(p.base), 4) + '$.</p><p>Sanity check: $' + p.base + '^{' + Math.floor(Math.log(p.v) / Math.log(p.base)) + '} = ' + Math.pow(p.base, Math.floor(Math.log(p.v) / Math.log(p.base))) + '$ and $' + p.base + '^{' + (Math.floor(Math.log(p.v) / Math.log(p.base)) + 1) + '} = ' + Math.pow(p.base, Math.floor(Math.log(p.v) / Math.log(p.base)) + 1) + '$, so $x$ must lie between those integers. It does.</p>'
    }),
    reframe: 'A logarithm answers "what exponent?". log_b(v) = ln v / ln b, and the sanity check is bracketing v between two integer powers.',
    visual: 'tangent',
    hints: [
      'The unknown is in the exponent. Which operation pulls an exponent down to where you can reach it?',
      'Take $\\ln$ of both sides: $\\ln(b^x) = x\\ln b$. Now $x$ is a plain factor.',
      'Divide: $x = \\ln v / \\ln b$. Before computing, bracket the answer: which two integer powers of the base sit either side of $v$?'
    ],
    solution: {},
    misconceptions: [
      { key: 'divided', test: (ans, q) => num(ans, q.params.v / q.params.base), response: 'You divided $v$ by the base. That would solve $bx = v$, a linear equation. Here $x$ is an <i>exponent</i>, and undoing an exponent takes a logarithm, not a division.' },
      { key: 'wrong-base', test: (ans, q) => num(ans, Math.log(q.params.v)) && q.params.base !== Math.E, response: 'That is $\\ln v$ on its own. You still have to divide by $\\ln$ of the base: $b^x = v \\Rightarrow x\\ln b = \\ln v$. Only when the base is $e$ does the division disappear.' },
      { key: 'integer-guess', test: (ans, q) => Math.abs(ans.re - Math.round(ans.re)) < 0.001 && !num(ans, Math.log(q.params.v) / Math.log(q.params.base)), response: 'An integer only works when $v$ is an exact power of the base. Bracket it: find the integer powers just below and just above $v$; the answer is strictly between them.' }
    ]
  },

  {
    id: 'pre-log-rules', title: 'log of a product and quotient', kind: 'expr', vars: ['a', 'b', 'c'], domain: [0.5, 4],
    prompt: 'Write $\\ln\\!\\left(\\dfrac{a^2 b}{c}\\right)$ in terms of $\\ln a$, $\\ln b$ and $\\ln c$. (Type <span class="kbd">ln(a)</span> etc.)',
    expr: '2*ln(a) + ln(b) - ln(c)',
    reframe: 'Logs turn multiplication into addition and powers into multiplication. That is why decibels add and why Bode plots are straight lines.',
    visual: 'tangent',
    hints: [
      'Three rules: log of a product, log of a quotient, log of a power. Which one applies at the outermost level here — is the thing inside the log fundamentally a product/quotient, or a power?',
      '$\\ln(PQ) = \\ln P + \\ln Q$ and $\\ln(P/Q) = \\ln P - \\ln Q$. Split the fraction first: $\\ln(a^2 b) - \\ln c$, then split the product.',
      'Finally $\\ln(a^2) = 2\\ln a$: the power comes down as a factor.'
    ],
    solution: { text: '<p>$\\ln\\dfrac{a^2b}{c} = \\ln(a^2 b) - \\ln c = \\ln(a^2) + \\ln b - \\ln c = 2\\ln a + \\ln b - \\ln c$.</p><p>Every rule is the exponent rule in disguise: $e^{p}e^{q} = e^{p+q}$ says the log of a product is the sum of the logs.</p>' },
    misconceptions: [
      { key: 'quotient-sign', expr: '2*ln(a) + ln(b) + ln(c)', response: '$c$ is in the denominator: dividing by $c$ <i>subtracts</i> $\\ln c$. Test with $a = b = 1$, $c = e$: the left side is $\\ln(1/e) = -1$.' },
      { key: 'power-of-log', expr: 'ln(a)^2 + ln(b) - ln(c)', response: '$\\ln(a^2)$ is $2\\ln a$, not $(\\ln a)^2$. The power inside the log becomes a <i>multiplier</i> in front. Check $a = e$: $\\ln(e^2) = 2$, but $(\\ln e)^2 = 1$.' },
      { key: 'over-distributed', expr: '2*(ln(a) + ln(b) - ln(c))', response: 'The square applies only to $a$, so only $\\ln a$ gets the factor 2. $b$ and $c$ appear to the first power.' }
    ]
  },

  {
    id: 'pre-quad-complex', title: 'quadratic with complex roots', kind: 'complex',
    params: { p: 2, q: 3 },
    gen: () => ({ p: rint(-3, 3), q: rint(1, 4) }),
    make: p => {
      const b = -2 * p.p, c = p.p * p.p + p.q * p.q;
      return {
        prompt: 'Solve $x^2 ' + (b < 0 ? '- ' + (-b) : '+ ' + b) + 'x + ' + c + ' = 0$. Give the root with positive imaginary part, as $a + bj$.',
        answer: { re: p.p, im: p.q },
        solution: '<p>Quadratic formula: $x = \\dfrac{' + (-b) + ' \\pm \\sqrt{' + (b * b) + ' - ' + (4 * c) + '}}{2} = \\dfrac{' + (-b) + ' \\pm \\sqrt{' + (b * b - 4 * c) + '}}{2}$.</p><p>The discriminant is negative, so $\\sqrt{' + (b * b - 4 * c) + '} = j\\sqrt{' + (4 * c - b * b) + '} = ' + (2 * p.q) + 'j$. Hence $x = ' + p.p + ' \\pm ' + p.q + 'j$; the one with positive imaginary part is $' + p.p + ' + ' + p.q + 'j$.</p><p>Complex roots always come as a conjugate pair — mirror images across the real axis. In module 1 and again in module 4 you will see that "where these two points sit" is the damping of a second-order circuit. There is no such thing as "no solution" here.</p>'
      };
    },
    reframe: 'A negative discriminant does not mean "no solution". It means the two roots have left the real line and sit as a mirror pair in the complex plane.',
    visual: 'quadratic',
    hints: [
      'Use the quadratic formula. Compute the discriminant $b^2 - 4ac$ first. What sign is it?',
      { text: 'Negative under the square root. $\\sqrt{-k} = j\\sqrt{k}$, because $j^2 = -1$. Watch the roots leave the real axis as you raise $c$ in the figure.', visual: 'quadratic', preset: { a: 1, b: -4, c: 13 } },
      'So $x = \\dfrac{-b \\pm j\\sqrt{4ac - b^2}}{2a}$. Split into real part and imaginary part.'
    ],
    solution: { visual: 'quadratic', preset: { a: 1, b: -4, c: 13 } },
    misconceptions: [
      { key: 'dropped-j', test: (ans, q) => ans.form === 'real' && num(ans, q.params.p + q.params.q), response: 'You have added the real and imaginary parts as if $j$ were $1$. $\\sqrt{-36}$ is $6j$, not $6$. The root is $a + bj$ with the $j$ kept.' },
      { key: 'other-root', test: (ans, q) => A.checkComplex(ans, { re: q.params.p, im: -q.params.q }) && q.params.q !== 0, response: 'That is the other root of the pair — the conjugate. The question asked for the one with <i>positive</i> imaginary part. (Both are correct solutions of the equation; there are always two.)' },
      { key: 'sign-of-b', test: (ans, q) => A.checkComplex(ans, { re: -q.params.p, im: q.params.q }) && q.params.p !== 0, response: 'The real part has the wrong sign: the formula has $-b$ in the numerator. With $b = ' + '$negative, $-b$ is positive.' },
      { key: 'forgot-half', test: (ans, q) => A.checkComplex(ans, { re: 2 * q.params.p, im: 2 * q.params.q }) && (q.params.p !== 0), response: 'Everything is twice too big: you forgot to divide by $2a$. The formula is $\\dfrac{-b \\pm \\sqrt{\\cdots}}{2a}$, and the $2a$ divides both parts.' }
    ]
  },

  {
    id: 'pre-quad-real', title: 'quadratic formula, larger root', kind: 'number',
    params: { a: 2, b: 3, c: -2 },
    gen: () => pick([{ a: 2, b: 3, c: -2 }, { a: 3, b: -5, c: -2 }, { a: 2, b: -7, c: 3 }, { a: 1, b: 2, c: -8 }, { a: 4, b: 4, c: -3 }, { a: 6, b: -5, c: 1 }]),
    make: p => {
      const d = p.b * p.b - 4 * p.a * p.c, r1 = (-p.b + Math.sqrt(d)) / (2 * p.a), r2 = (-p.b - Math.sqrt(d)) / (2 * p.a);
      return {
        prompt: 'Find the <i>larger</i> root of $' + p.a + 'x^2 ' + (p.b < 0 ? '- ' + (-p.b) : '+ ' + p.b) + 'x ' + (p.c < 0 ? '- ' + (-p.c) : '+ ' + p.c) + ' = 0$.',
        answer: { value: Math.max(r1, r2) },
        solution: '<p>$x = \\dfrac{-(' + p.b + ') \\pm \\sqrt{' + (p.b * p.b) + ' - 4(' + p.a + ')(' + p.c + ')}}{2\\cdot' + p.a + '} = \\dfrac{' + (-p.b) + ' \\pm \\sqrt{' + d + '}}{' + (2 * p.a) + '} = \\dfrac{' + (-p.b) + ' \\pm ' + Math.sqrt(d) + '}{' + (2 * p.a) + '}$.</p><p>Roots: $' + F(r1, 3) + '$ and $' + F(r2, 3) + '$. The larger is $' + F(Math.max(r1, r2), 3) + '$. Check it in the equation.</p>'
      };
    },
    reframe: 'The quadratic formula is complete the square, done once for everybody. The 2a divides the whole numerator.',
    visual: 'quadratic',
    hints: [
      'Identify $a$, $b$, $c$ with their signs before anything else. Write them down.',
      { text: 'Discriminant $b^2 - 4ac$: compute it carefully, then its square root. Watch where the parabola crosses the axis in the figure.', visual: 'quadratic', preset: { a: 2, b: 3, c: -2 } },
      '$x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$: the denominator is $2a$, not $2$. Evaluate both signs and pick the larger.'
    ],
    solution: { visual: 'quadratic', preset: { a: 2, b: 3, c: -2 } },
    misconceptions: [
      { key: 'smaller-root', test: (ans, q) => { const p = q.params, d = p.b * p.b - 4 * p.a * p.c; return num(ans, Math.min((-p.b + Math.sqrt(d)) / (2 * p.a), (-p.b - Math.sqrt(d)) / (2 * p.a))); }, response: 'That is a root, but the smaller one. Both signs of $\\pm$ give a root; the question asked for the larger.' },
      { key: 'forgot-2a', test: (ans, q) => { const p = q.params, d = p.b * p.b - 4 * p.a * p.c; return p.a !== 1 && (num(ans, (-p.b + Math.sqrt(d)) / 2) || num(ans, (-p.b - Math.sqrt(d)) / 2)); }, response: 'You divided by $2$ instead of $2a$. The formula\'s denominator is $2a$; with $a \\neq 1$ that matters.' },
      { key: 'sign-of-b', test: (ans, q) => { const p = q.params, d = p.b * p.b - 4 * p.a * p.c; return num(ans, (p.b + Math.sqrt(d)) / (2 * p.a)) && p.b !== 0; }, response: 'The numerator starts with $-b$. With $b$ positive that is negative; with $b$ negative it is positive. You used $+b$.' }
    ]
  },

  {
    id: 'pre-vertex', title: 'vertex of a parabola', kind: 'number',
    params: { b: -6, c: 5 },
    gen: () => ({ b: pick([-6, -4, -8, 2, 4, 6, -10]), c: rint(-5, 9) }),
    make: p => ({
      prompt: 'At what $x$ does $y = x^2 ' + (p.b < 0 ? '- ' + (-p.b) : '+ ' + p.b) + 'x ' + (p.c < 0 ? '- ' + (-p.c) : '+ ' + p.c) + '$ reach its minimum?',
      answer: { value: -p.b / 2 },
      solution: '<p>Complete the square: $x^2 ' + (p.b < 0 ? '- ' + (-p.b) : '+ ' + p.b) + 'x = (x ' + (p.b < 0 ? '- ' + (-p.b / 2) : '+ ' + p.b / 2) + ')^2 - ' + (p.b * p.b / 4) + '$. The square is smallest (zero) at $x = ' + (-p.b / 2) + '$.</p><p>Same answer from symmetry ($x = -b/2a$) or from calculus ($y\' = 2x + b = 0$). Three routes, one vertex: $x = ' + (-p.b / 2) + '$, where $y = ' + (p.c - p.b * p.b / 4) + '$.</p>'
    }),
    reframe: 'The vertex is at x = −b/2a: halfway between the roots, where the derivative is zero, where the completed square vanishes. Three views of one fact.',
    visual: 'quadratic',
    hints: [
      'A parabola is symmetric. Where is its axis of symmetry relative to the two roots (if it has them) — and relative to $b$?',
      { text: 'Complete the square: $x^2 + bx = (x + b/2)^2 - b^2/4$. A square is never negative and is zero exactly once. Slide $b$ in the figure and watch the vertex move.', visual: 'quadratic', preset: { a: 1, b: -6, c: 5 } },
      'The square $(x + b/2)^2$ is zero when $x = -b/2$. That is the minimum.'
    ],
    solution: { visual: 'quadratic', preset: { a: 1, b: -6, c: 5 } },
    misconceptions: [
      { key: 'forgot-half', test: (ans, q) => num(ans, -q.params.b) || num(ans, q.params.b), response: 'You have $\\pm b$ itself. The vertex is at $-b/2a$: the axis of symmetry sits at <i>half</i> of $-b$. Check by derivative: $2x + b = 0$.' },
      { key: 'sign', test: (ans, q) => num(ans, q.params.b / 2) && q.params.b !== 0, response: 'Sign: $x = -b/2$. For $x^2 - 6x$ the vertex is at $+3$ (the parabola $x^2 - 6x + 5$ has roots $1$ and $5$; the middle is $3$).' },
      { key: 'gave-y', test: (ans, q) => num(ans, q.params.c - q.params.b * q.params.b / 4) && Math.abs(q.params.c - q.params.b * q.params.b / 4 + q.params.b / 2) > 0.01, response: 'That is the minimum <i>value</i> of $y$. The question asked at what $x$ it occurs.' }
    ]
  },

  {
    id: 'pre-parallel', title: 'reciprocal of a sum of reciprocals', kind: 'number',
    params: { r1: 2, r2: 3 },
    gen: () => ({ r1: rint(1, 9), r2: rint(2, 12) }),
    make: p => ({
      prompt: 'Evaluate $\\dfrac{1}{\\dfrac{1}{' + p.r1 + '} + \\dfrac{1}{' + p.r2 + '}}$. (In ECE 230 this is two resistors of $' + p.r1 + '\\,\\Omega$ and $' + p.r2 + '\\,\\Omega$ in parallel.)',
      answer: { value: 1 / (1 / p.r1 + 1 / p.r2) },
      solution: '<p>$\\dfrac{1}{' + p.r1 + '} + \\dfrac{1}{' + p.r2 + '} = \\dfrac{' + p.r2 + ' + ' + p.r1 + '}{' + (p.r1 * p.r2) + '} = \\dfrac{' + (p.r1 + p.r2) + '}{' + (p.r1 * p.r2) + '}$. Its reciprocal is $\\dfrac{' + (p.r1 * p.r2) + '}{' + (p.r1 + p.r2) + '} = ' + F(p.r1 * p.r2 / (p.r1 + p.r2), 3) + '$.</p><p>Hence the "product over sum" rule for two parallel resistors. Sanity check that never fails: the result is <i>smaller than the smaller one</i> ($' + Math.min(p.r1, p.r2) + '$).</p>'
    }),
    reframe: 'The reciprocal of a sum is not the sum of reciprocals. Combine the fractions first, then flip once, and the answer is always less than the smallest term.',
    visual: 'tangent',
    hints: [
      'Before computing anything: the answer must be smaller than the smaller of the two numbers. Why? (Adding a positive reciprocal makes the denominator bigger.)',
      'Add the two fractions inside first, over a common denominator. Do not flip anything yet.',
      'Now flip the single fraction you have: numerator and denominator swap.'
    ],
    solution: {},
    misconceptions: [
      { key: 'added', test: (ans, q) => num(ans, q.params.r1 + q.params.r2), response: 'You added the two numbers. That is series, not parallel — and it fails the sanity check: the result of this expression is always <i>smaller</i> than either number.' },
      { key: 'forgot-outer-flip', test: (ans, q) => num(ans, 1 / q.params.r1 + 1 / q.params.r2) && Math.abs(1 / q.params.r1 + 1 / q.params.r2 - 1 / (1 / q.params.r1 + 1 / q.params.r2)) > 0.01, response: 'You computed the sum of the reciprocals and stopped. The expression has one more reciprocal on the outside — flip your fraction.' },
      { key: 'distributed-reciprocal', test: (ans, q) => num(ans, q.params.r1 * q.params.r2), response: 'That is the product. $\\dfrac{1}{1/a + 1/b}$ is not $a\\cdot b$; it is $\\dfrac{ab}{a+b}$ — product <i>over sum</i>.' }
    ]
  },

  {
    id: 'pre-system', title: 'two equations, two unknowns', kind: 'number',
    params: { s: 1 },
    gen: () => pick([{ s: 1 }, { s: 2 }, { s: 3 }, { s: 4 }]),
    make: p => {
      const sets = { 1: { e1: '2x + 3y = 7', e2: 'x - y = 1', x: 2, y: 1 }, 2: { e1: '3x + 2y = 12', e2: 'x + 4y = 14', x: 2, y: 3 }, 3: { e1: '4x - y = 5', e2: '2x + 3y = 13', x: 2, y: 3 }, 4: { e1: '5x + 2y = 1', e2: 'x - 2y = 11', x: 2, y: -4.5 } };
      const s = sets[p.s];
      return {
        prompt: 'Solve for $x$: $\\quad ' + s.e1 + ', \\quad ' + s.e2 + '$. (Nodal analysis is this, with more rows.)',
        answer: { value: s.x },
        solution: '<p>Eliminate one unknown. From the second equation express one variable in terms of the other, substitute into the first, solve, then back-substitute.</p><p>Solution: $x = ' + s.x + '$, $y = ' + s.y + '$. Check both equations with those values — a solution must satisfy <i>both</i>.</p>'
      };
    },
    reframe: 'Two equations, two unknowns: eliminate one variable, solve the one-variable equation, back-substitute, then check both equations.',
    visual: 'tangent',
    hints: [
      'Pick the equation where one unknown is easiest to isolate. Isolate it.',
      'Substitute that expression into the other equation. You now have one equation in one unknown.',
      'Solve it, then substitute back to get the other unknown. Check the pair in <i>both</i> original equations.'
    ],
    solution: {},
    misconceptions: [
      { key: 'gave-y', test: (ans, q) => { const y = { 1: 1, 2: 3, 3: 3, 4: -4.5 }[q.params.s]; return num(ans, y) && !num(ans, q.answer.value); }, response: 'That is $y$. The question asked for $x$. (Good that you found both — now report the right one.)' },
      { key: 'one-equation', test: (ans, q) => !num(ans, q.answer.value) && Math.abs(ans.re) < 20, response: 'Check your value in <i>both</i> equations. A pair that satisfies only one of them is not a solution of the system.' }
    ]
  },

  /* ================= B. TRIGONOMETRY ================================== */
  {
    id: 'pre-deg-rad', title: 'degrees → radians', kind: 'number',
    params: { d: 150 },
    gen: () => ({ d: pick([30, 45, 60, 120, 135, 150, 210, 225, 240, 270, 300, 315, 330]) }),
    make: p => ({
      prompt: 'Convert $' + p.d + '^\\circ$ to radians. Give it as a decimal (or as a multiple of $\\pi$, e.g. <span class="kbd">5pi/6</span>).',
      answer: { value: p.d * PI / 180 },
      solution: '<p>$180^\\circ = \\pi$ rad, so $1^\\circ = \\pi/180$ and $' + p.d + '^\\circ = ' + p.d + '\\cdot\\dfrac{\\pi}{180} = \\dfrac{' + (p.d / gcd(p.d, 180)) + '\\pi}{' + (180 / gcd(p.d, 180)) + '} = ' + F(p.d * PI / 180, 4) + '$ rad.</p><p>A radian is the angle whose arc equals the radius; a full turn is $2\\pi$ of them because the circumference is $2\\pi r$. That is why $\\pi$ appears — it is a ratio of lengths, not a unit.</p>'
    }),
    reframe: 'Radians measure angle as arc length over radius. A full turn is 2π because that is the circumference. π is not a unit.',
    visual: 'unitcircle',
    hints: [
      'What is $180^\\circ$ in radians? Everything else is a fraction of that.',
      { text: '$180^\\circ = \\pi$. So write your angle as a fraction of $180$ and multiply by $\\pi$. Drag the point in the figure and read both units.', visual: 'unitcircle', preset: { deg: 150 } },
      '$\\theta_{rad} = \\theta_{deg}\\cdot\\pi/180$. Simplify the fraction, then also give the decimal.'
    ],
    solution: { visual: 'unitcircle', preset: { deg: 150 } },
    misconceptions: [
      { key: 'no-conversion', test: (ans, q) => num(ans, q.params.d), response: 'That is still degrees. Radians for anything under a full turn are numbers below $6.28$.' },
      { key: 'dropped-pi', test: (ans, q) => num(ans, q.params.d / 180), response: 'You have the fraction of a half-turn (e.g. $5/6$) but dropped the $\\pi$. A half-turn is $\\pi$ radians, not $1$.' },
      { key: 'multiplied-by-pi', test: (ans, q) => num(ans, q.params.d * PI), response: 'You multiplied by $\\pi$ without dividing by $180$. The conversion is $\\times\\pi/180$: a full turn ($360^\\circ$) must come out as $2\\pi \\approx 6.28$.' },
      { key: 'divided-by-pi', test: (ans, q) => num(ans, q.params.d / PI), response: 'That is $\\theta/\\pi$. Radians are $\\theta\\cdot\\pi/180$ — $\\pi$ goes in the numerator.' }
    ]
  },

  {
    id: 'pre-sin-exact', title: 'sin of a second-quadrant angle', kind: 'number',
    params: { deg: 150 },
    gen: () => ({ deg: pick([120, 135, 150, 210, 225, 240, 300, 315, 330]) }),
    make: p => {
      const ref = p.deg > 180 ? (p.deg > 270 ? 360 - p.deg : p.deg - 180) : 180 - p.deg;
      const frac = { 30: '1/2', 45: '\\sqrt2/2', 60: '\\sqrt3/2' }[ref];
      return {
        prompt: 'Without a calculator: $\\sin\\!\\left(' + fracPi(p.deg) + '\\right)$ (that is $\\sin ' + p.deg + '^\\circ$). Decimal is fine.',
        answer: { value: Math.sin(p.deg * PI / 180) },
        solution: '<p>$' + p.deg + '^\\circ$ is in quadrant ' + quadName(p.deg) + '; its reference angle (distance to the nearest point of the horizontal axis) is $' + ref + '^\\circ$. $\\sin ' + ref + '^\\circ = ' + frac + '$.</p><p>Sine is the <i>height</i> of the point on the unit circle. In quadrant ' + quadName(p.deg) + ' the height is ' + (Math.sin(p.deg * PI / 180) > 0 ? 'positive' : 'negative') + ', so $\\sin ' + p.deg + '^\\circ = ' + (Math.sin(p.deg * PI / 180) > 0 ? '' : '-') + frac + ' = ' + F(Math.sin(p.deg * PI / 180), 4) + '$.</p>'
      };
    },
    reframe: 'sin θ is the height of the point on the unit circle; cos θ is how far right it is. Reference angle gives the size, quadrant gives the sign.',
    visual: 'unitcircle',
    hints: [
      'Sine is a height. Draw the unit circle, put the point at this angle. Is it above or below the horizontal axis?',
      { text: 'Find the reference angle: how far is the point from the horizontal axis, measured as an angle? That gives the magnitude from the $30/45/60$ table.', visual: 'unitcircle', preset: { deg: 150 } },
      'Magnitude from the reference angle, sign from the quadrant (height positive above the axis).'
    ],
    solution: { visual: 'unitcircle', preset: { deg: 150 } },
    misconceptions: [
      { key: 'quadrant-sign', test: (ans, q) => num(ans, -Math.sin(q.params.deg * PI / 180)), response: 'Right size, wrong sign. Sine is the <i>height</i> of the point: above the axis it is positive, below it is negative. Look at where the point actually sits.', visual: 'unitcircle' },
      { key: 'used-cos', test: (ans, q) => sameMag(ans.re, Math.cos(q.params.deg * PI / 180)) && !sameMag(ans.re, Math.sin(q.params.deg * PI / 180)), response: 'That is the cosine\'s size (the horizontal shadow). Sine is the vertical one. With reference angle $30^\\circ$: $\\sin = 1/2$, $\\cos = \\sqrt3/2$ — the short leg is sine.' },
      { key: 'deg-as-rad', test: (ans, q) => num(ans, Math.sin(q.params.deg)), response: 'You evaluated $\\sin$ of the number of degrees in radian mode. Calculator mode is the most common exam error there is; this is why the question says "without a calculator".' }
    ]
  },

  {
    id: 'pre-cos-neg', title: 'cos of a negative angle', kind: 'number',
    params: { deg: -60 },
    gen: () => ({ deg: pick([-30, -45, -60, -120, -135, -150]) }),
    make: p => ({
      prompt: 'Without a calculator: $\\cos(' + fracPi(p.deg) + ')$, i.e. $\\cos(' + p.deg + '^\\circ)$.',
      answer: { value: Math.cos(p.deg * PI / 180) },
      solution: '<p>A negative angle is measured clockwise. The point at $' + p.deg + '^\\circ$ is the mirror image (across the horizontal axis) of the point at $' + (-p.deg) + '^\\circ$: same horizontal position, opposite height.</p><p>Cosine is the horizontal position, so $\\cos(-\\theta) = \\cos\\theta$: $\\cos(' + p.deg + '^\\circ) = \\cos ' + (-p.deg) + '^\\circ = ' + F(Math.cos(p.deg * PI / 180), 4) + '$. (Sine, the height, would flip sign: $\\sin(-\\theta) = -\\sin\\theta$.)</p>'
    }),
    reframe: 'Negative angle = clockwise = mirror across the horizontal axis. Horizontal position (cos) survives the mirror; height (sin) flips.',
    visual: 'unitcircle',
    hints: [
      'Where is the point at $-\\theta$ compared with the point at $+\\theta$? Draw both.',
      { text: 'They are reflections in the horizontal axis. Which coordinate does that reflection change, and which does it leave alone? Drag the point below the axis.', visual: 'unitcircle', preset: { deg: -60 } },
      'Cosine is the horizontal coordinate. So $\\cos(-\\theta) = \\cos(\\theta)$; now use the reference angle.'
    ],
    solution: { visual: 'unitcircle', preset: { deg: -60 } },
    misconceptions: [
      { key: 'cos-odd', test: (ans, q) => num(ans, -Math.cos(q.params.deg * PI / 180)), response: 'You treated cosine as odd: $\\cos(-\\theta) = -\\cos\\theta$. It is <i>even</i>: reflecting across the horizontal axis does not change the horizontal coordinate. Sine is the odd one.' },
      { key: 'used-sin', test: (ans, q) => sameMag(ans.re, Math.sin(q.params.deg * PI / 180)) && !sameMag(ans.re, Math.cos(q.params.deg * PI / 180)), response: 'That is the sine\'s size. Cosine is the horizontal shadow.' },
      { key: 'deg-as-rad', test: (ans, q) => num(ans, Math.cos(q.params.deg)), response: 'Radian mode on a degree value. Do it from the circle instead.' }
    ]
  },

  {
    id: 'pre-tan-quadrant', title: 'from tan to sin, with quadrant', kind: 'number',
    prompt: '$\\tan\\theta = \\dfrac{3}{4}$ and $\\theta$ is in quadrant III. Find $\\sin\\theta$.',
    answer: { value: -0.6 },
    reframe: 'tan fixes the shape of the triangle (3-4-5). The quadrant fixes the signs. Two separate pieces of information.',
    visual: 'unitcircle',
    hints: [
      'Draw the reference triangle: opposite $3$, adjacent $4$. What is the hypotenuse?',
      { text: '$3$-$4$-$5$. So $|\\sin\\theta| = 3/5$. Now the quadrant: in quadrant III, is the height positive or negative? Drag the point there.', visual: 'unitcircle', preset: { deg: 216.87 } },
      'Both coordinates are negative in quadrant III (that is why $\\tan = (-3)/(-4)$ is positive). Sine is the height.'
    ],
    solution: { visual: 'unitcircle', preset: { deg: 216.87 }, text: '<p>$\\tan\\theta = 3/4$ gives a $3$-$4$-$5$ triangle, so $|\\sin\\theta| = 3/5$ and $|\\cos\\theta| = 4/5$.</p><p>Quadrant III: both coordinates negative. $\\sin\\theta = -3/5 = -0.6$, $\\cos\\theta = -0.8$, and indeed $\\tan = (-0.6)/(-0.8) = 0.75$. ✓</p><p>$\\theta$ itself is $180^\\circ + 36.87^\\circ = 216.87^\\circ$ — the calculator\'s $\\arctan(0.75) = 36.87^\\circ$ is the quadrant-I twin.</p>' },
    misconceptions: [
      { key: 'ignored-quadrant', test: ans => num(ans, 0.6), response: 'Right size, wrong sign. $\\tan$ positive is consistent with quadrant I <i>or</i> III (both signs equal). The question said III, where the height is negative.' },
      { key: 'gave-cos', test: ans => num(ans, -0.8) || num(ans, 0.8), response: 'That is $\\cos\\theta$ (adjacent over hypotenuse). Sine is opposite over hypotenuse: $3/5$, with the quadrant sign.' },
      { key: 'gave-tan', test: ans => num(ans, 0.75) || num(ans, -0.75), response: '$0.75$ is $\\tan\\theta$ — the ratio you were given. Sine needs the hypotenuse: build the $3$-$4$-$5$ triangle.' }
    ]
  },

  {
    id: 'pre-sin-solve', title: 'all solutions of sin x = ½', kind: 'number',
    prompt: '$\\sin x = \\tfrac12$ has two solutions in $[0, 2\\pi)$. One is $\\pi/6$. What is the other? (decimal or e.g. <span class="kbd">5pi/6</span>)',
    answer: { value: 5 * PI / 6 },
    reframe: 'A height on the unit circle is reached at two points, mirror images across the vertical axis: θ and π − θ.',
    visual: 'unitcircle',
    hints: [
      '$\\sin x$ is a height. Draw the horizontal line at height $\\tfrac12$ across the unit circle. How many times does it cross?',
      { text: 'Twice — two points at the same height, one on the right and one on the left, reflections across the vertical axis. Drag the point to the second one.', visual: 'unitcircle', preset: { deg: 150 } },
      'The reflection of angle $\\theta$ across the vertical axis is $\\pi - \\theta$.'
    ],
    solution: { visual: 'unitcircle', preset: { deg: 150 }, text: '<p>Height $\\tfrac12$ is reached at $\\theta = \\pi/6$ (quadrant I) and at its mirror across the vertical axis, $\\pi - \\pi/6 = 5\\pi/6$ (quadrant II). $\\sin(5\\pi/6) = \\sin 150^\\circ = \\tfrac12$. ✓</p><p>Your calculator\'s $\\arcsin$ only ever returns the quadrant I/IV answer. The other one is always $\\pi - $ that. This matters every time you solve for a phase angle.</p>' },
    misconceptions: [
      { key: 'wrong-reflection', test: ans => num(ans, 7 * PI / 6), response: '$7\\pi/6 = \\pi + \\pi/6$ is the reflection through the <i>origin</i>, which flips the height to $-\\tfrac12$. Same height means mirror across the <i>vertical</i> axis: $\\pi - \\pi/6$.' },
      { key: 'other-reflection', test: ans => num(ans, 11 * PI / 6) || num(ans, -PI / 6), response: 'That is the mirror across the horizontal axis: height $-\\tfrac12$. You want the same height, on the other side of the vertical axis.' },
      { key: 'in-degrees', test: ans => num(ans, 150), response: 'That is the right angle in degrees. The interval was given in radians: $150^\\circ = 5\\pi/6$.' }
    ]
  },

  {
    id: 'pre-trig-simplify', title: 'simplifying with sin² + cos² = 1', kind: 'expr', vars: ['x'], domain: [0.3, 2.8],
    prompt: 'Simplify $\\dfrac{1 - \\cos^2 x}{\\sin x}$.',
    expr: 'sin(x)',
    reframe: 'sin² + cos² = 1 is Pythagoras on the unit circle. Any 1 − cos² is a sin² in disguise.',
    visual: 'unitcircle',
    hints: [
      'The numerator has a $1$ and a $\\cos^2$. Is there an identity that relates those to something with $\\sin$?',
      { text: 'On the unit circle the point $(\\cos x, \\sin x)$ is at distance 1 from the origin: $\\cos^2 x + \\sin^2 x = 1$. So $1 - \\cos^2 x = ?$', visual: 'unitcircle', preset: { deg: 40 } },
      'Numerator $= \\sin^2 x$. Divide by $\\sin x$.'
    ],
    solution: { text: '<p>$1 - \\cos^2 x = \\sin^2 x$ (Pythagoras on the unit circle), so the expression is $\\dfrac{\\sin^2 x}{\\sin x} = \\sin x$ wherever $\\sin x \\neq 0$.</p>' },
    misconceptions: [
      { key: 'cancelled-terms', expr: '(1 - cos(x)^2)/sin(x) - sin(x) + cos(x)', response: 'Something got cancelled across a subtraction. Nothing in $1 - \\cos^2 x$ cancels with $\\sin x$ directly; you need the identity first.' },
      { key: 'reciprocal', expr: '1/sin(x)', response: 'That is $\\csc x$. The numerator is $\\sin^2 x$, not $1$: $1 - \\cos^2 x = \\sin^2 x$, and $\\sin^2 x / \\sin x = \\sin x$.' },
      { key: 'took-cos', expr: 'cos(x)', response: '$1 - \\cos^2 x$ is $\\sin^2 x$, not $\\cos^2 x$ (that would need $1 - \\sin^2 x$). Then dividing by $\\sin x$ leaves $\\sin x$.' }
    ]
  },

  {
    id: 'pre-period', title: 'period of 3 sin(2x + π/3)', kind: 'number',
    params: { k: 2 },
    gen: () => ({ k: pick([2, 3, 4, 0.5, 5]) }),
    make: p => ({
      prompt: 'What is the period of $y = 3\\sin(' + p.k + 'x + \\pi/3)$? (decimal or e.g. <span class="kbd">2pi/3</span>)',
      answer: { value: 2 * PI / p.k },
      solution: '<p>$\\sin(\\cdot)$ repeats when its <i>argument</i> increases by $2\\pi$. The argument is $' + p.k + 'x + \\pi/3$; it grows by $2\\pi$ when $x$ grows by $2\\pi/' + p.k + ' = ' + F(2 * PI / p.k, 4) + '$.</p><p>The $3$ is the amplitude (how tall) and the $\\pi/3$ is a phase (where it starts); neither changes how often it repeats. Next year: $\\omega = ' + p.k + '$ rad/s, period $T = 2\\pi/\\omega$.</p>'
    }),
    reframe: 'Period is how far x must move for the argument to grow by 2π. Amplitude and phase never affect it.',
    visual: 'unitcircle',
    hints: [
      'Three numbers appear: $3$, the coefficient of $x$, and $\\pi/3$. Which one controls how <i>fast</i> the sine repeats?',
      'The sine repeats every time its argument grows by $2\\pi$. Set $k(x + T) + \\phi = kx + \\phi + 2\\pi$ and solve for $T$.',
      '$T = 2\\pi/k$. Neither the amplitude nor the phase shift appears.'
    ],
    solution: {},
    misconceptions: [
      { key: 'took-k', test: (ans, q) => num(ans, q.params.k), response: 'That is the coefficient $k$ (the angular frequency), not the period. A bigger $k$ means <i>faster</i> repetition, i.e. a <i>shorter</i> period: $T = 2\\pi/k$.' },
      { key: 'multiplied', test: (ans, q) => num(ans, 2 * PI * q.params.k) && q.params.k !== 1, response: 'You multiplied by $k$. Faster oscillation means a shorter period: divide. $T = 2\\pi/k$.' },
      { key: 'took-phase', test: (ans, q) => num(ans, PI / 3), response: 'That is the phase constant $\\pi/3$. It shifts the wave sideways; it does not change how often it repeats.' },
      { key: 'amplitude', test: (ans, q) => num(ans, 3) && q.params.k !== 2 * PI / 3, response: '$3$ is the amplitude — how tall the wave is. Period is about how wide one cycle is.' }
    ]
  },

  {
    id: 'pre-phase', title: 'phase shift of sin(2x + π/3)', kind: 'number',
    prompt: 'By how much, and in which direction, is $y = \\sin(2x + \\pi/3)$ shifted relative to $y = \\sin 2x$? Give the shift in $x$ as a signed number (negative = shifted left).',
    answer: { value: -PI / 6 },
    reframe: 'Factor the argument: sin(2(x + π/6)). The shift is what is added to x itself, not to 2x.',
    visual: 'unitcircle',
    hints: [
      'Do not read the shift off $\\pi/3$ directly — that number is added to $2x$, not to $x$. Factor the $2$ out of the argument.',
      '$2x + \\pi/3 = 2(x + \\pi/6)$. Now the function is $\\sin(2\\cdot(x + \\pi/6))$.',
      'Replacing $x$ by $x + c$ shifts a graph <i>left</i> by $c$. Here $c = \\pi/6$.'
    ],
    solution: { text: '<p>$\\sin(2x + \\pi/3) = \\sin\\big(2(x + \\pi/6)\\big)$. Replacing $x$ by $x + \\pi/6$ moves every feature to an $x$ that is $\\pi/6$ smaller: a shift <i>left</i> by $\\pi/6 \\approx 0.5236$, i.e. $-\\pi/6$.</p><p>In phasor language next year: a phase lead of $\\pi/3$ rad at frequency $2$ is a time advance of $\\pi/6$. The division by $\\omega$ is exactly the factoring you just did.</p>' },
    misconceptions: [
      { key: 'forgot-to-divide', test: ans => num(ans, -PI / 3), response: 'Direction right, size wrong: $\\pi/3$ is added to $2x$. Factor out the $2$: $2(x + \\pi/6)$. The shift in $x$ is $\\pi/6$.' },
      { key: 'wrong-direction', test: ans => num(ans, PI / 6) || num(ans, PI / 3), response: '$x + c$ inside the function shifts the graph <i>left</i>: the feature that used to happen at $x_0$ now happens at $x_0 - c$. Positive phase = earlier = left.' }
    ]
  },

  /* ================= C. CALCULUS REFLEXES ============================== */
  {
    id: 'pre-product-rule', title: 'derivative of x·e^{2x}', kind: 'expr', vars: ['x'], domain: [-1.5, 1.5],
    prompt: 'Differentiate $f(x) = x\\,e^{2x}$. (Type <span class="kbd">e^(2x)</span> or <span class="kbd">exp(2x)</span>.)',
    expr: 'exp(2*x) + 2*x*exp(2*x)',
    reframe: 'A product has two things changing. The product rule adds "first changing, second fixed" to "first fixed, second changing".',
    visual: 'tangent',
    hints: [
      'Two factors, $x$ and $e^{2x}$, both depend on $x$. Which rule handles a product of two changing things?',
      { text: 'Product rule: $(uv)\' = u\'v + uv\'$. Write down $u$, $u\'$, $v$, $v\'$ separately before assembling. Watch the slope in the figure.', visual: 'tangent', preset: { fn: 'x*exp(2x)', x0: 0.4, range: [-2, 1.2] } },
      '$u = x, u\' = 1$; $v = e^{2x}, v\' = 2e^{2x}$ (chain rule: the inner $2x$ contributes a factor $2$). Assemble.'
    ],
    solution: { visual: 'tangent', preset: { fn: 'x*exp(2x)', x0: 0.4, range: [-2, 1.2] }, text: '<p>$f\' = (1)(e^{2x}) + (x)(2e^{2x}) = e^{2x}(1 + 2x)$.</p><p>Check at $x = 0$: $f\'(0) = 1$. The slope of the graph at the origin is indeed $1$ (the $e^{2x}$ factor is $1$ there and only the $x$ is moving).</p>' },
    misconceptions: [
      { key: 'no-product-rule', expr: '2*exp(2*x)', response: 'You differentiated the two factors and multiplied the results. That is not a rule. Two changing factors need the product rule: $u\'v + uv\'$. Check at $x = 0$: your answer gives slope $2$; the graph has slope $1$ there.' },
      { key: 'no-chain-rule', expr: 'exp(2*x) + x*exp(2*x)', response: 'Product rule right, chain rule missed: $\\frac{d}{dx}e^{2x} = 2e^{2x}$, because the inner function $2x$ has derivative $2$.' },
      { key: 'derivative-of-x-lost', expr: '2*x*exp(2*x)', response: 'You kept $uv\'$ but dropped $u\'v$. $\\frac{d}{dx}x = 1$, so the first term is $1\\cdot e^{2x}$. It does not vanish.' }
    ]
  },

  {
    id: 'pre-chain-rule', title: 'derivative of sin(x²)', kind: 'expr', vars: ['x'],
    prompt: 'Differentiate $g(x) = \\sin(x^2)$.',
    expr: '2*x*cos(x^2)',
    reframe: 'Chain rule: derivative of the outside, evaluated at the inside, times derivative of the inside. The inside stays inside.',
    visual: 'tangent',
    hints: [
      'This is a function inside a function. Name the outer one and the inner one.',
      { text: 'Outer: $\\sin(\\cdot)$, inner: $x^2$. Chain rule: (outer)$\'$ evaluated at the inner, times (inner)$\'$. Watch how the slope grows with $x$ in the figure — the $2x$ factor.', visual: 'tangent', preset: { fn: 'sin(x^2)', x0: 1.2, range: [-3, 3] } },
      '$\\cos(x^2)$ times $2x$. The argument of the cosine is still $x^2$.'
    ],
    solution: { visual: 'tangent', preset: { fn: 'sin(x^2)', x0: 1.2, range: [-3, 3] }, text: '<p>$g\'(x) = \\cos(x^2)\\cdot 2x = 2x\\cos(x^2)$.</p><p>Why the graph wiggles faster and faster: the factor $2x$ makes the slope grow with $x$. That is a frequency increasing with $x$ — a chirp. You will meet it again in signals.</p>' },
    misconceptions: [
      { key: 'no-chain', expr: 'cos(x^2)', response: 'You differentiated the outside and forgot the inside. $x^2$ is changing too, and its rate $2x$ multiplies the result. Check: your answer says the slope at $x = 2$ is $\\cos 4 \\approx -0.65$; the graph is much steeper there.' },
      { key: 'inside-lost', expr: '2*x*cos(x)', response: 'The inner function stays inside: it is $\\cos(x^2)$, not $\\cos x$. The chain rule replaces nothing; it only multiplies by the inner derivative.' },
      { key: 'confused-with-sin2x', expr: 'cos(2*x)', response: 'That is the derivative of $\\sin(2x)/2$-ish territory. Here the inside is $x^2$, whose derivative is $2x$; the outside derivative is $\\cos$ evaluated at $x^2$.' }
    ]
  },

  {
    id: 'pre-integral-exp', title: 'integral of e^{−3x}', kind: 'expr', vars: ['x'], upToConstant: true, domain: [-1, 1],
    prompt: 'Find $\\displaystyle\\int e^{-3x}\\,dx$. (Any $+C$ is fine; you may omit it.)',
    expr: '-exp(-3*x)/3',
    reframe: 'Integration undoes differentiation: guess e^{−3x}, differentiate it, and fix the factor you get. Then verify by differentiating your answer.',
    visual: 'tangent',
    hints: [
      'What function has a derivative that looks like $e^{-3x}$? Start with $e^{-3x}$ itself and differentiate it.',
      '$\\frac{d}{dx}e^{-3x} = -3e^{-3x}$. That is $-3$ times what you want. How do you fix a constant factor?',
      'Divide by $-3$: $\\frac{d}{dx}\\left(\\frac{e^{-3x}}{-3}\\right) = e^{-3x}$. ✓ Always verify by differentiating.'
    ],
    solution: { text: '<p>$\\displaystyle\\int e^{-3x}dx = -\\frac{1}{3}e^{-3x} + C$.</p><p>Check: $\\frac{d}{dx}\\left(-\\tfrac13 e^{-3x}\\right) = -\\tfrac13\\cdot(-3)e^{-3x} = e^{-3x}$. ✓ The habit that saves marks: every antiderivative gets differentiated once before you move on.</p>' },
    misconceptions: [
      { key: 'differentiated', expr: '-3*exp(-3*x)', response: 'That is the <i>derivative</i> of $e^{-3x}$. Integration goes the other way: the factor $-3$ should be in the denominator, not multiplying.' },
      { key: 'sign', expr: 'exp(-3*x)/3', response: 'Differentiate your answer: $\\frac{d}{dx}\\frac{e^{-3x}}{3} = -e^{-3x}$. Wrong sign. The $-3$ from the chain rule must be divided out, sign included.' },
      { key: 'unchanged', expr: 'exp(-3*x)', response: 'Differentiate it: you get $-3e^{-3x}$, not $e^{-3x}$. The exponential is its own derivative only when the exponent is plain $x$.' }
    ]
  },

  {
    id: 'pre-definite', title: 'a definite integral', kind: 'number',
    prompt: 'Evaluate $\\displaystyle\\int_0^{\\pi}\\sin x\\,dx$.',
    answer: { value: 2 },
    reframe: 'A definite integral is signed area. One hump of sine has area exactly 2; the antiderivative is −cos x, and the minus sign is where the slips are.',
    visual: 'unitcircle',
    hints: [
      'Sketch $\\sin x$ from $0$ to $\\pi$. Is it above or below the axis the whole way? Roughly how big is the area?',
      'Antiderivative of $\\sin x$ is $-\\cos x$ (check: $\\frac{d}{dx}(-\\cos x) = \\sin x$). Evaluate it at $\\pi$ and at $0$.',
      '$[-\\cos x]_0^{\\pi} = (-\\cos\\pi) - (-\\cos 0) = (-(-1)) - (-1)$. Two minus signs each.'
    ],
    solution: { text: '<p>$\\displaystyle\\int_0^{\\pi}\\sin x\\,dx = [-\\cos x]_0^{\\pi} = -\\cos\\pi + \\cos 0 = 1 + 1 = 2$.</p><p>Positive, as it must be: the curve is above the axis on the whole interval. If you ever get $0$ or a negative number for this integral, the sketch has already told you it is wrong.</p>' },
    misconceptions: [
      { key: 'sign', test: ans => num(ans, -2), response: 'Negative area for a curve that is entirely above the axis. The antiderivative is $-\\cos x$, and $\\cos\\pi = -1$: two minus signs, giving $+1 + 1$.' },
      { key: 'zero', test: ans => Math.abs(ans.re) < 0.02, response: 'Zero would mean the positive and negative parts cancel — but $\\sin x \\ge 0$ on $[0, \\pi]$. Zero is the answer over a <i>full</i> period $[0, 2\\pi]$, not half of one. You may also have used $\\cos x$ as the antiderivative instead of $-\\cos x$.' },
      { key: 'one', test: ans => num(ans, 1), response: 'You evaluated only one end. A definite integral is (value at top limit) minus (value at bottom limit): $-\\cos\\pi - (-\\cos 0)$.' }
    ]
  },

  {
    id: 'pre-decay-time', title: 'time for an exponential to decay', kind: 'number',
    params: { v0: 5, tau: 2, v: 1 },
    gen: () => ({ v0: pick([5, 10, 12, 9]), tau: pick([2, 0.5, 3, 4]), v: pick([1, 2, 0.5]) }),
    make: p => ({
      prompt: 'A capacitor voltage follows $v(t) = ' + p.v0 + 'e^{-t/' + p.tau + '}$. At what time $t$ has it fallen to $' + p.v + '$ V?',
      answer: { value: p.tau * Math.log(p.v0 / p.v) },
      solution: '<p>$' + p.v0 + 'e^{-t/' + p.tau + '} = ' + p.v + ' \\Rightarrow e^{-t/' + p.tau + '} = ' + F(p.v / p.v0, 4) + ' \\Rightarrow -t/' + p.tau + ' = \\ln(' + F(p.v / p.v0, 4) + ') = -' + F(Math.log(p.v0 / p.v), 4) + '$.</p><p>$t = ' + p.tau + '\\ln(' + p.v0 + '/' + p.v + ') = ' + F(p.tau * Math.log(p.v0 / p.v), 4) + '$ s.</p><p>Read it as "how many time constants": the ratio $' + p.v0 + '/' + p.v + '$ needs $\\ln(' + p.v0 + '/' + p.v + ') \\approx ' + F(Math.log(p.v0 / p.v), 2) + '$ time constants of $\\tau = ' + p.tau + '$ s. This is every RC circuit in ECE 230.</p>'
    }),
    reframe: 'Exponential decay is counted in time constants: t = τ·ln(start/end). Isolate the exponential, then take ln.',
    visual: 'tangent',
    hints: [
      'Isolate the exponential first: divide both sides by the constant in front.',
      { text: 'Now $e^{-t/\\tau} = $ (a number less than 1). Which operation undoes $e^{(\\cdot)}$? Watch the curve: how many multiples of $\\tau$ does it take?', visual: 'tangent', preset: { fn: '5*exp(-x/2)', x0: 3.22, range: [0, 8] } },
      'Take $\\ln$ of both sides: $-t/\\tau = \\ln(v/v_0)$. Solve for $t$; it must come out positive.'
    ],
    solution: { visual: 'tangent', preset: { fn: '5*exp(-x/2)', x0: 3.22, range: [0, 8] } },
    misconceptions: [
      { key: 'forgot-tau', test: (ans, q) => num(ans, Math.log(q.params.v0 / q.params.v)) && q.params.tau !== 1, response: 'You have $\\ln(v_0/v)$, the number of <i>time constants</i>. Multiply by $\\tau$ to get seconds.' },
      { key: 'sign', test: (ans, q) => num(ans, -q.params.tau * Math.log(q.params.v0 / q.params.v)), response: 'Negative time. $\\ln(v/v_0)$ is negative because $v < v_0$; the minus sign in $-t/\\tau$ cancels it. Decay to a smaller value happens <i>later</i>, so $t > 0$.' },
      { key: 'linear', test: (ans, q) => num(ans, q.params.tau * (q.params.v0 - q.params.v) / q.params.v0) || num(ans, q.params.tau * q.params.v0 / q.params.v), response: 'You treated the decay as linear (proportional). Exponential decay loses the same <i>fraction</i> per time constant, not the same amount. Take logarithms.' }
    ]
  },

  {
    id: 'pre-derivative-meaning', title: 'what a derivative says', kind: 'choice',
    prompt: 'A sensor reports position $s(t)$ in metres. At $t = 3$ s you compute $s\'(3) = -4$. What does that tell you?',
    options: [
      { text: 'At that instant the object is moving in the negative direction at 4 m/s. It says nothing about where it is.', correct: true },
      { text: 'The object is at position $-4$ m at $t = 3$ s.', mis: 'value-vs-rate' },
      { text: 'The object has moved $-4$ m in total during the first 3 seconds.', mis: 'rate-vs-change' },
      { text: 'The object is slowing down.', mis: 'derivative-vs-second' }
    ],
    reframe: 'A derivative is a rate at an instant: the slope of the tangent, not the height of the curve and not the total change.',
    visual: 'tangent',
    hints: [
      'What is a derivative, geometrically, on the graph of $s(t)$?',
      { text: 'It is the slope of the tangent line at that point. Drag $x_0$ in the figure and watch the slope change while the height does something else entirely.', visual: 'tangent', preset: { fn: '2*sin(x) + x/2', x0: 3, range: [0, 6] } },
      'Slope, at one instant. Units: metres per second. Sign: direction of motion.'
    ],
    solution: { visual: 'tangent', preset: { fn: '2*sin(x) + x/2', x0: 3, range: [0, 6] }, text: '<p>$s\'(3) = -4$ m/s is the slope of the tangent at $t = 3$: velocity, negative direction, magnitude 4. It says nothing about the position (that is $s(3)$), nothing about total displacement (that is $s(3) - s(0)$, the integral of velocity), and nothing about speeding up or slowing down (that is the sign of $s\'\'$ relative to $s\'$).</p>' },
    misconceptions: [
      { key: 'value-vs-rate', response: 'That confuses the derivative with the function value. $s(3)$ is where it is; $s\'(3)$ is how fast it is moving. Units give it away: m versus m/s.' },
      { key: 'rate-vs-change', response: 'Total change over an interval is the <i>integral</i> of the rate, $\\int_0^3 s\'(t)\\,dt$. A derivative is instantaneous: a single slope at a single moment.' },
      { key: 'derivative-vs-second', response: 'Slowing down or speeding up is about how the velocity is <i>changing</i> — the second derivative — and it depends on whether $s\'\'$ has the same sign as $s\'$. A single value of $s\'$ cannot tell you.' }
    ]
  },

  {
    id: 'pre-small-angle', title: 'small-angle approximation', kind: 'choice',
    prompt: 'For small $x$ (in radians), which is the best approximation to $\\sin x$, and why does it hold?',
    options: [
      { text: '$\\sin x \\approx x$: the tangent line to $\\sin$ at $0$ has slope $\\cos 0 = 1$, and near $0$ a curve is well approximated by its tangent.', correct: true },
      { text: '$\\sin x \\approx 1$, because $\\sin$ of a small angle is close to its maximum.', mis: 'cos-sin-swap' },
      { text: '$\\sin x \\approx x$ in degrees too, since the approximation is about size not units.', mis: 'units' },
      { text: '$\\sin x \\approx x^2/2$, from the second term of the series.', mis: 'wrong-term' }
    ],
    reframe: 'Near a point, a function is its tangent line. sin x ≈ x because the slope at 0 is 1 — and only in radians, where slope 1 is true.',
    visual: 'tangent',
    hints: [
      'What is the value and the slope of $\\sin x$ at $x = 0$?',
      { text: 'Value $0$, slope $1$. So the tangent line at the origin is $y = x$. Drag $x_0$ toward $0$ and watch the tangent hug the curve.', visual: 'tangent', preset: { fn: 'sin(x)', x0: 0.3, range: [-2, 2] } },
      'The slope of $\\sin$ at $0$ is $1$ only when $x$ is in radians. In degrees the slope would be $\\pi/180$.'
    ],
    solution: { visual: 'tangent', preset: { fn: 'sin(x)', x0: 0.3, range: [-2, 2] }, text: '<p>$\\sin 0 = 0$ and $\\frac{d}{dx}\\sin x\\big|_0 = \\cos 0 = 1$, so the tangent line at the origin is $y = x$, and $\\sin x \\approx x$ for small $x$ (error about $x^3/6$). Similarly $\\cos x \\approx 1 - x^2/2$ and $\\tan x \\approx x$.</p><p>It is a radian statement. In degrees, $\\sin 1^\\circ = 0.01745 = 1\\cdot\\pi/180$ — the slope is $\\pi/180$, not $1$. This is why radians are the natural unit: they make calculus on trig functions clean.</p>' },
    misconceptions: [
      { key: 'cos-sin-swap', response: 'That is $\\cos x \\approx 1$. Sine starts at $0$, not at its maximum — $\\sin 0 = 0$. Near zero it rises like the line $y = x$.' },
      { key: 'units', response: 'It fails in degrees: $\\sin 10^\\circ = 0.174$, nowhere near $10$. The approximation is the tangent line with slope $\\cos 0 = 1$, and that slope is $1$ only in radians.' },
      { key: 'wrong-term', response: '$\\sin x = x - x^3/6 + \\cdots$: there is no $x^2$ term (sine is odd). The leading term is $x$. $x^2/2$ belongs to $1 - \\cos x$.' }
    ]
  }
  ];

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a; }
  function fracPi(deg) {
    const g = gcd(deg, 180), n = deg / g, d = 180 / g;
    const sign = n < 0 ? '-' : '', an = Math.abs(n);
    if (d === 1) return sign + (an === 1 ? '\\pi' : an + '\\pi');
    return sign + '\\dfrac{' + (an === 1 ? '' : an) + '\\pi}{' + d + '}';
  }
  function quadName(deg) { const d = ((deg % 360) + 360) % 360; return d < 90 ? 'I' : d < 180 ? 'II' : d < 270 ? 'III' : 'IV'; }

  function build(item, params) {
    if (item.make) {
      const p = params || item.params;
      const q = item.make(p);
      return { item: item, params: p, prompt: q.prompt, answer: q.answer, solutionText: q.solution };
    }
    return { item: item, params: {}, prompt: item.prompt, answer: item.answer || null, solutionText: (item.solution && item.solution.text) || '' };
  }
  function variant(item) { return item.gen ? build(item, item.gen()) : null; }

  const MOD = {
    id: '00-prereq', number: 0, optional: true,
    name: 'Prerequisite mathematics refresh',
    reframe: 'Algebra, trigonometry and calculus reflexes that every later course silently assumes. Dip in where you feel shaky.',
    items: ITEMS, build: build, variant: variant
  };
  window.MODULE = MOD;
  window.MODULES = window.MODULES || {};
  window.MODULES[MOD.id] = MOD;
})();
