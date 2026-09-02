/* background.js — which Background section explains each item.
   app.js shows a "Background: …" link on the question card when the item's id
   is listed here; the Background page links back to the same items.
   Keep this the single place that knows the mapping. */
(function () {
  'use strict';
  const SECTIONS = {
    'sin-cos':   { title: 'Sine and cosine — what they actually are' },
    'radians':   { title: 'Radians — why π keeps appearing' },
    'tan':       { title: 'Tangent, slope and the quadrant problem' },
    'exp-log':   { title: 'Exponentials and logarithms — time constants' },
    'calculus':  { title: 'Derivative and integral — slope and accumulation' },
    'complex':   { title: 'Complex numbers — why they were worth inventing' },
    'euler':     { title: 'e to the jθ — the one identity that runs the whole chain' }
  };
  const MAP = {
    /* module 0 */
    'pre-deg-rad': 'radians', 'pre-sin-exact': 'sin-cos', 'pre-cos-neg': 'sin-cos', 'pre-tan-quadrant': 'tan',
    'pre-sin-solve': 'sin-cos', 'pre-trig-simplify': 'sin-cos', 'pre-period': 'sin-cos', 'pre-phase': 'sin-cos',
    'pre-log-solve': 'exp-log', 'pre-log-rules': 'exp-log', 'pre-decay-time': 'exp-log',
    'pre-product-rule': 'calculus', 'pre-chain-rule': 'calculus', 'pre-integral-exp': 'calculus', 'pre-definite': 'calculus',
    'pre-derivative-meaning': 'calculus', 'pre-small-angle': 'radians', 'pre-quad-complex': 'complex',
    /* module 1 */
    'cx-polar-01': 'complex', 'cx-rect-01': 'complex', 'cx-quad-01': 'tan', 'cx-quad-02': 'tan',
    'cx-mulj-01': 'complex', 'cx-mul-01': 'complex', 'cx-sq-01': 'complex', 'cx-div-01': 'complex', 'cx-conj-01': 'complex', 'cx-recip-01': 'complex',
    'cx-euler-why': 'euler', 'cx-euler-taylor': 'euler', 'cx-euler-val': 'euler', 'cx-euler-mag': 'euler', 'cx-euler-cos': 'euler', 'cx-real-01': 'euler', 'cx-notj': 'euler',
    'cx-power-01': 'complex', 'cx-power-02': 'complex', 'cx-power-j': 'complex', 'cx-root-01': 'complex', 'cx-root-02': 'complex',
    'cx-trig-cos': 'euler', 'cx-trig-sin': 'euler', 'cx-trig-double': 'euler', 'cx-add-01': 'sin-cos', 'cx-phasor-delay': 'sin-cos', 'cx-phasor-deriv': 'euler'
  };
  window.Background = {
    sections: SECTIONS,
    forItem: id => MAP[id] ? { id: MAP[id], title: SECTIONS[MAP[id]].title } : null,
    itemsFor: sec => Object.keys(MAP).filter(k => MAP[k] === sec)
  };
})();
