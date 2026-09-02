/* app.js — the practice loop for one module page.
   Implements the pedagogy in docs/Special/trainer-site-spec.md §3:
     • four-level hint ladder; a fresh attempt is required between levels;
       level 4 (the solution) is only reachable after an attempt at level 3
     • wrong answers are matched against the item's misconception catalogue
       and the named wrong model is addressed, with its visual when it has one
     • after a helped solve, three quick variants while the insight is hot
     • scheduling and mastery live in shared/engine.js
   Plain script. Expects window.MODULE (items.js), Visuals, Answers, Engine, Storage_.
*/
(function () {
  'use strict';
  const M = window.MODULE, A = window.Answers, C = window.CP.C;
  const $ = sel => document.querySelector(sel);
  const state = window.Storage_.load();
  const engine = new window.Engine(state, M.items);
  const F = (x, dp) => Number(x.toFixed(dp == null ? 2 : dp));

  function tex(el) {
    if (window.renderMathInElement) {
      try { renderMathInElement(el, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }], throwOnError: false }); } catch (e) { /* leave raw */ }
    }
  }
  function h(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const k = Math.floor(Math.random() * (i + 1)); const t = b[i]; b[i] = b[k]; b[k] = t; } return b; }
  function describe(ans) {
    if (!ans) return '';
    const polar = F(ans.r, 3) + ' ∠ ' + F(ans.deg, 2) + '°';
    return ans.form === 'real' ? C.fmt({ re: ans.re, im: ans.im }, 3) : (C.fmt({ re: ans.re, im: ans.im }, 3) + '  =  ' + polar);
  }
  const FORMS = { complex: 'Accepted: <code>a+bj</code> · <code>r∠θ</code> (degrees) · <code>r e^(jθ)</code> (radians) · <code>sqrt(2)</code>, <code>pi/3</code> inside numbers', number: 'A real number. <code>sqrt(3)</code>, <code>pi/2</code>, <code>2*cos(…)</code> evaluated by you — type the value.', expr: 'Use the variables named in the question with <code>cos()</code>, <code>sin()</code>, <code>^2</code>. Juxtaposition multiplies: <code>cosA cosB</code> works.' };

  /* ---------------- session state for the current item ------------------ */
  let cur = null;
  const mounted = [];
  function unmountAll() { while (mounted.length) { const v = mounted.pop(); try { v.destroy(); } catch (e) { /* ignore */ } } }
  function mountVisual(container, name, preset) {
    const box = h('div', 'inline-visual');
    container.appendChild(box);
    const v = window.Visuals.mount(name, box, preset);
    if (v) mounted.push(v);
  }

  function start(item) {
    unmountAll();
    const q = M.build(item);
    cur = { item: item, q: q, hintLevel: 0, attempts: 0, sinceHint: 0, wrong: 0, solved: false, helped: false, drill: null, options: item.kind === 'choice' ? shuffle(item.options) : null };
    engine.touch(item.id);
    renderCard();
    renderList();
    renderStats();
    window.scrollTo({ top: $('#practice').getBoundingClientRect().top + window.scrollY - 8, behavior: 'smooth' });
  }

  /* ---------------- rendering ------------------------------------------ */
  function renderCard() {
    const root = $('#practice');
    root.innerHTML = '';
    if (!cur) { root.appendChild(h('div', 'feedback ok', '<div class="tag">All done</div>Every item in this module is mastered or scheduled. Come back when something is due, or revisit any item from the list.')); return; }
    const item = cur.item, q = cur.q, idx = M.items.indexOf(item) + 1, rec = engine.rec(item.id);
    const head = h('div', 'row');
    head.style.justifyContent = 'space-between';
    head.innerHTML = '<div><span class="muted small">Question ' + idx + ' of ' + M.items.length + '</span> &nbsp;·&nbsp; <b>' + item.title + '</b>' +
      (rec.status === 'review' ? ' <span class="muted small">(review · ' + (engine.isDue(item.id) ? 'due now' : engine.dueText(item.id)) + ')</span>' : '') + '</div>';
    const skip = h('button', 'ghost sm', 'Skip for now'); skip.addEventListener('click', () => { const n = engine.next(item.id); if (n) start(n); });
    head.appendChild(skip);
    root.appendChild(head);
    const prompt = h('div', 'prompt', q.prompt); root.appendChild(prompt); tex(prompt);

    /* answer entry */
    const entry = h('div'); entry.id = 'entry'; root.appendChild(entry);
    renderEntry(entry, q, item.kind, onSubmitMain);

    /* feedback + ladder */
    root.appendChild(h('div', 'ladder'));
    const btns = h('div', 'row'); btns.id = 'btns'; root.appendChild(btns);
    renderButtons();
  }

  function renderEntry(container, q, kind, onSubmit) {
    container.innerHTML = '';
    if (kind === 'choice') {
      const opts = cur.options || q.item.options;
      opts.forEach(o => {
        const b = h('button', 'choice', o.text);
        b.addEventListener('click', () => { if (cur.solved && !cur.drill) return; container.querySelectorAll('.choice').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); onSubmit(o, b); });
        container.appendChild(b); tex(b);
      });
      return;
    }
    const line = h('div', 'answer-line');
    const inp = document.createElement('input'); inp.type = 'text'; inp.autocomplete = 'off'; inp.spellcheck = false; inp.setAttribute('inputmode', kind === 'expr' ? 'text' : 'text');
    inp.placeholder = kind === 'expr' ? 'e.g. cos(A)cos(B) - sin(A)sin(B)' : (kind === 'number' ? 'a number' : 'e.g. 3+4j  or  5∠53.13');
    const go = h('button', null, 'Check');
    line.appendChild(inp); line.appendChild(go);
    container.appendChild(line);
    container.appendChild(h('p', 'forms', FORMS[kind] || ''));
    const fire = () => { const t = inp.value.trim(); if (!t) { inp.focus(); return; } onSubmit(t, inp); };
    go.addEventListener('click', fire);
    inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); fire(); } });
    setTimeout(() => { if (window.innerWidth > 700) inp.focus(); }, 50);
  }

  function renderButtons() {
    const btns = $('#btns'); if (!btns) return;
    btns.innerHTML = '';
    if (cur.solved) return;
    const lvl = cur.hintLevel;
    if (lvl >= 4) return;
    const b = h('button', 'hint', lvl < 3 ? 'Hint ' + (lvl + 1) + ' of 4' : 'Show the solution (4 of 4)');
    const gate = lvl >= 1 && cur.sinceHint < 1;
    b.disabled = gate;
    b.addEventListener('click', giveHint);
    btns.appendChild(b);
    if (gate) btns.appendChild(h('span', 'muted small', 'Make an attempt with what you have before the next hint. The step you take yourself is the one that sticks.'));
    else if (lvl === 3) btns.appendChild(h('span', 'muted small', 'Reading a solution is not the same as producing one — but you have earned it.'));
  }

  function feedback(cls, tag, html, visual, preset) {
    const box = h('div', 'feedback ' + cls, (tag ? '<div class="tag">' + tag + '</div>' : '') + html);
    $('#practice .ladder').appendChild(box); tex(box);
    if (visual) mountVisual(box, visual, preset);
    box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    return box;
  }

  /* ---------------- checking ------------------------------------------- */
  /* Returns { ok, ans, err, fn } for the main item or a drill variant. */
  function evaluate(q, kind, input) {
    const item = q.item;
    if (kind === 'choice') return { ok: !!input.correct, opt: input };
    if (kind === 'expr') {
      let fn; try { fn = A.parseExpr(input, item.vars); } catch (e) { return { err: e.message }; }
      const target = A.parseExpr(item.expr, item.vars);
      let ok; try { ok = A.exprEquals(fn, target, item.vars); } catch (e) { return { err: 'That expression could not be evaluated.' }; }
      return { ok: ok, fn: fn };
    }
    const ans = A.parseComplex(input);
    if (!ans) return { err: 'I could not read that.' };
    if (kind === 'number') return { ok: A.checkNumber(ans, q.answer.value), ans: ans };
    return { ok: A.checkComplex(ans, q.answer), ans: ans };
  }
  function findMisconception(q, kind, r) {
    const item = q.item, list = item.misconceptions || [];
    try {
      if (kind === 'choice') return list.find(m => m.key === r.opt.mis) || null;
      if (kind === 'expr') return list.find(m => { try { return A.exprEquals(r.fn, A.parseExpr(m.expr, item.vars), item.vars); } catch (e) { return false; } }) || null;
      return list.find(m => { try { return m.test && m.test(r.ans, q); } catch (e) { return false; } }) || null;
    } catch (e) { return null; }
  }

  function onSubmitMain(input, el) {
    if (!cur || cur.solved) return;
    const kind = cur.item.kind, q = cur.q;
    const r = evaluate(q, kind, input);
    if (r.err) { feedback('info', 'Could not read that', r.err + ' ' + (FORMS[kind] || '')); return; }
    cur.attempts += 1; cur.sinceHint += 1;
    engine.attempt(cur.item.id, r.ok);
    if (kind === 'choice' && el) el.classList.add(r.ok ? 'right' : 'wrong');
    if (r.ok) { solved(r); return; }
    cur.wrong += 1; cur.helped = true;
    const m = findMisconception(q, kind, r);
    const read = r.ans ? '<div class="read">I read your answer as ' + describe(r.ans) + '.</div>' : '';
    if (m) feedback('mis', 'Not yet — and I think I know why', m.response + read, m.visual || null, m.preset || null);
    else feedback('bad', 'Not it', 'Try again. Sketch it before you compute anything. A hint is available if you are stuck.' + read);
    renderButtons();
  }

  function solved(r) {
    cur.solved = true;
    const item = cur.item;
    engine.pass(item.id, cur.helped);
    const read = r && r.ans ? '<div class="read">Read as ' + describe(r.ans) + '.</div>' : '';
    feedback('ok', cur.helped ? 'Correct' : 'Correct, unaided', '<div class="reframe" style="margin:6px 0 0"><b>The reframe</b>' + item.reframe + '</div>' + read +
      (cur.helped ? '<div class="read">You needed help on this one, so it comes back in 3 days, then 14.</div>' : '<div class="read">Clean solve — mastered.</div>'));
    if (cur.hintLevel === 0 && !cur.solutionShown && cur.q.solutionText && !cur.helped) {
      const d = h('details', 'conj'); d.innerHTML = '<summary>Compare with the worked reasoning</summary>' + cur.q.solutionText; $('#practice .ladder').appendChild(d); tex(d);
    }
    renderButtons(); renderList(); renderStats();
    if (cur.helped && item.gen) startDrill(); else nextButton();
  }

  function nextButton() {
    const btns = $('#btns'); btns.innerHTML = '';
    const n = engine.next(cur.item.id);
    const b = h('button', null, n ? 'Next question →' : 'Back to the module list');
    b.addEventListener('click', () => { if (n) start(n); else { unmountAll(); cur = null; renderCard(); } });
    btns.appendChild(b);
    if (n) btns.appendChild(h('span', 'muted small', 'Next: ' + n.title + (engine.isDue(n.id) ? ' (review due)' : '')));
  }

  /* ---------------- hint ladder ---------------------------------------- */
  function giveHint() {
    if (!cur || cur.solved || cur.hintLevel >= 4) return;
    if (cur.hintLevel >= 1 && cur.sinceHint < 1) return;
    cur.hintLevel += 1; cur.sinceHint = 0; cur.helped = true;
    engine.hint(cur.item.id, cur.hintLevel);
    const item = cur.item, lad = $('#practice .ladder');
    if (cur.hintLevel <= 3) {
      const hint = item.hints[cur.hintLevel - 1];
      const text = typeof hint === 'string' ? hint : hint.text;
      const box = h('div', 'hintbox', '<div class="lvl">Hint ' + cur.hintLevel + ' of 4</div>' + text);
      lad.appendChild(box); tex(box);
      if (typeof hint !== 'string' && hint.visual) mountVisual(box, hint.visual, hint.preset);
      box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } else {
      cur.solutionShown = true;
      const sol = item.solution || {};
      const text = cur.q.solutionText || sol.text || '';
      const box = h('div', 'hintbox', '<div class="lvl">Solution (4 of 4)</div>' + text + '<div class="reframe"><b>The reframe</b>' + item.reframe + '</div><p class="small muted">Now enter the answer yourself to close the loop. It will come back in three days.</p>');
      lad.appendChild(box); tex(box);
      if (sol.visual) mountVisual(box, sol.visual, sol.preset);
      box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    renderButtons();
  }

  /* ---------------- quick drill ---------------------------------------- */
  function startDrill() {
    cur.drill = { i: 0, total: 3, q: M.variant(cur.item), tries: 0 };
    const box = h('div', 'drill'); box.id = 'drill';
    $('#practice').insertBefore(box, $('#btns'));
    renderDrill();
  }
  function renderDrill() {
    const d = cur.drill, box = $('#drill');
    box.innerHTML = '<div class="lab">Quick drill ' + (d.i + 1) + ' of ' + d.total + ' — same idea, new numbers</div>';
    const p = h('div', 'prompt', d.q.prompt); box.appendChild(p); tex(p);
    const entry = h('div'); box.appendChild(entry);
    renderEntry(entry, d.q, cur.item.kind, onSubmitDrill);
    box.appendChild(h('div', 'ladder'));
    const row = h('div', 'row');
    const reveal = h('button', 'subtle sm', 'Show the answer and move on');
    reveal.addEventListener('click', () => { drillReveal(); });
    row.appendChild(reveal); box.appendChild(row);
    $('#btns').innerHTML = '';
  }
  function drillFeedback(cls, tag, html, visual, preset) {
    const lad = $('#drill .ladder'); const b = h('div', 'feedback ' + cls, (tag ? '<div class="tag">' + tag + '</div>' : '') + html); lad.appendChild(b); tex(b);
    if (visual) mountVisual(b, visual, preset);
    return b;
  }
  function onSubmitDrill(input, el) {
    const d = cur.drill; if (!d) return;
    const kind = cur.item.kind;
    const r = evaluate(d.q, kind, input);
    if (r.err) { drillFeedback('info', 'Could not read that', r.err); return; }
    d.tries += 1;
    if (r.ok) { drillFeedback('ok', 'Correct', r.ans ? '<div class="read">Read as ' + describe(r.ans) + '.</div>' : ''); setTimeout(drillAdvance, 700); return; }
    const m = findMisconception(d.q, kind, r);
    const read = r.ans ? '<div class="read">I read your answer as ' + describe(r.ans) + '.</div>' : '';
    if (m) drillFeedback('mis', 'Not yet', m.response + read, m.visual || null, m.preset || null);
    else drillFeedback('bad', 'Not it', 'Try once more.' + read);
  }
  function drillReveal() {
    const d = cur.drill;
    const ansHtml = d.q.answer && d.q.answer.value != null ? String(F(d.q.answer.value, 3)) : (d.q.answer ? C.fmt(d.q.answer, 3) + '  =  ' + C.fmtPolar(d.q.answer, 2) : '');
    drillFeedback('info', 'Answer', ansHtml + (d.q.solutionText ? '<details class="conj"><summary>Worked</summary>' + d.q.solutionText + '</details>' : ''));
    const row = $('#drill .row'); row.innerHTML = '';
    const b = h('button', 'sm', d.i + 1 < d.total ? 'Next variant' : 'Finish drill'); b.addEventListener('click', drillAdvance); row.appendChild(b);
  }
  function drillAdvance() {
    const d = cur.drill; d.i += 1; d.tries = 0;
    if (d.i >= d.total) { const box = $('#drill'); box.innerHTML = '<div class="lab">Quick drill complete</div><p class="small muted">Three variants done. The idea is warm; the schedule will bring it back before it cools.</p>'; cur.drill = null; nextButton(); return; }
    d.q = M.variant(cur.item); renderDrill();
  }

  /* ---------------- item list + stats ---------------------------------- */
  function renderList() {
    const ul = $('#itemlist'); ul.innerHTML = '';
    M.items.forEach((it, i) => {
      const r = engine.rec(it.id);
      const li = h('li', cur && cur.item === it ? 'cur' : '');
      const st = engine.isDue(it.id) ? 'due' : r.status;
      li.innerHTML = '<span class="dot ' + st + '"></span><span class="id">' + (i + 1) + '</span><span class="t">' + it.title + '</span>' + (r.status === 'review' ? '<span class="muted" style="font-size:11px">' + engine.dueText(it.id) + '</span>' : '');
      li.title = it.title + ' — ' + st;
      li.addEventListener('click', () => start(it));
      ul.appendChild(li);
    });
  }
  function renderStats() {
    const s = engine.summary();
    $('#stats').innerHTML = '<div class="stat"><b>' + s.mastered + '</b><span>mastered</span></div><div class="stat"><b>' + s.review + '</b><span>in review</span></div><div class="stat"><b>' + s.due + '</b><span>due now</span></div><div class="stat"><b>' + s.new + '</b><span>not started</span></div>';
    $('#bar').style.width = Math.round(100 * s.mastered / s.total) + '%';
    const d = window.Storage_.daysSince(state.lastExport);
    const any = Object.keys(state.items).length > 0;
    $('#backup').textContent = !any ? '' : (d == null ? 'No backup yet. Export once you have done a few items.' : (d > 14 ? 'Last backup ' + d + ' days ago — export again.' : 'Last backup ' + (d === 0 ? 'today' : d + ' day' + (d === 1 ? '' : 's') + ' ago') + '.'));
  }

  /* ---------------- figures section ------------------------------------ */
  let figMounted = null;
  function showFigure(name) {
    const host = $('#figure'); host.innerHTML = '';
    if (figMounted) { try { figMounted.destroy(); } catch (e) { /* ignore */ } }
    figMounted = window.Visuals.mount(name, host, {});
    document.querySelectorAll('#figtabs button').forEach(b => b.classList.toggle('on', b.dataset.v === name));
    try { state.visuals[name] = Date.now(); window.Storage_.save(state); } catch (e) { /* ignore */ }
  }

  /* ---------------- wiring --------------------------------------------- */
  function init() {
    const tabs = $('#figtabs');
    window.Visuals.names.forEach(n => { const b = h('button', null, window.Visuals.titles[n]); b.dataset.v = n; b.addEventListener('click', () => showFigure(n)); tabs.appendChild(b); });
    showFigure('euler');
    $('#export').addEventListener('click', () => { window.Storage_.exportFile(state); renderStats(); });
    $('#import').addEventListener('change', ev => {
      const f = ev.target.files[0]; if (!f) return;
      const mode = confirm('Merge with the progress already on this device?\n\nOK = merge (keeps the newer record for each item)\nCancel = replace everything on this device with the file') ? 'merge' : 'replace';
      window.Storage_.importFile(f, state, mode).then(s => { Object.assign(state, s); location.reload(); }).catch(e => alert(e.message));
      ev.target.value = '';
    });
    $('#resetitem').addEventListener('click', () => { if (cur && confirm('Forget your history for "' + cur.item.title + '"?')) { engine.reset(cur.item.id); start(cur.item); } });
    renderList(); renderStats();
    const first = engine.next(null);
    if (first) start(first); else renderCard();
    tex(document.body);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
