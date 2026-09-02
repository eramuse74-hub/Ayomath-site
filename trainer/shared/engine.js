/* engine.js — item scheduling and the mastery model.
   The site tracks question-level mastery only (hours live in the spreadsheet).

   Per-item record:  { status, stage, due, attempts, hints, passes, lastSeen, helped }
     status  'new' | 'learning' | 'review' | 'mastered'
     stage   0 = never passed, 1 = passed with help (due +3 d), 2 = passed the
             3-day review cleanly (due +14 d). Clean pass at stage 2 → mastered.
     helped  true if the most recent pass needed a hint or a wrong attempt.

   Rule 5 of the spec: anything he needed help on comes back after three days
   and again after two weeks. A clean first solve is mastered outright — there is
   nothing to repair. Plain script; exposes window.Engine.
*/
(function () {
  'use strict';
  const DAY = 864e5;
  const REVIEW_DAYS = [3, 14];

  function Engine(state, bank) {
    this.state = state;
    this.bank = bank;            /* array of items in authoring order */
  }

  Engine.prototype.rec = function (id) {
    const it = this.state.items;
    if (!it[id]) it[id] = { status: 'new', stage: 0, due: null, attempts: 0, hints: 0, passes: 0, lastSeen: null, helped: false };
    return it[id];
  };
  Engine.prototype.persist = function () { window.Storage_.save(this.state); };

  Engine.prototype.isDue = function (id, now) {
    const r = this.state.items[id];
    return !!(r && r.status === 'review' && r.due && r.due <= (now || Date.now()));
  };

  /* Which item next?  Due reviews first (most overdue first), then the first
     item still 'learning' (he started it and left), then the next 'new' item in
     authoring order, then the review with the nearest due date. null → nothing. */
  Engine.prototype.next = function (excludeId) {
    const now = Date.now();
    const due = this.bank.filter(i => i.id !== excludeId && this.isDue(i.id, now))
      .sort((a, b) => this.rec(a.id).due - this.rec(b.id).due);
    if (due.length) return due[0];
    const learning = this.bank.find(i => i.id !== excludeId && this.rec(i.id).status === 'learning');
    if (learning) return learning;
    const fresh = this.bank.find(i => i.id !== excludeId && this.rec(i.id).status === 'new');
    if (fresh) return fresh;
    const soon = this.bank.filter(i => i.id !== excludeId && this.rec(i.id).status === 'review')
      .sort((a, b) => this.rec(a.id).due - this.rec(b.id).due);
    return soon.length ? soon[0] : null;
  };

  Engine.prototype.touch = function (id) {
    const r = this.rec(id);
    if (r.status === 'new') r.status = 'learning';
    r.lastSeen = Date.now();
    this.persist();
  };
  Engine.prototype.attempt = function (id, correct) {
    const r = this.rec(id);
    r.attempts += 1; r.lastSeen = Date.now();
    if (r.status === 'new') r.status = 'learning';
    this.persist();
  };
  Engine.prototype.hint = function (id, level) {
    const r = this.rec(id);
    r.hints += 1; r.maxHint = Math.max(r.maxHint || 0, level); r.lastSeen = Date.now();
    this.persist();
  };

  /* Called once when the item is solved. helped = any hint or wrong attempt in this pass. */
  Engine.prototype.pass = function (id, helped) {
    const r = this.rec(id);
    const now = Date.now();
    r.passes += 1; r.lastSeen = now; r.helped = !!helped;
    if (helped) {
      r.stage = 1; r.status = 'review'; r.due = now + REVIEW_DAYS[0] * DAY;
    } else if (r.status === 'review' && r.stage === 1) {
      r.stage = 2; r.due = now + REVIEW_DAYS[1] * DAY;
    } else {
      r.stage = 3; r.status = 'mastered'; r.due = null;
    }
    this.persist();
    return r;
  };

  Engine.prototype.reset = function (id) { delete this.state.items[id]; this.persist(); };

  Engine.prototype.summary = function () {
    const now = Date.now();
    const s = { total: this.bank.length, new: 0, learning: 0, review: 0, mastered: 0, due: 0 };
    this.bank.forEach(i => {
      const r = this.state.items[i.id];
      const st = r ? r.status : 'new';
      s[st] += 1;
      if (this.isDue(i.id, now)) s.due += 1;
    });
    return s;
  };

  /* Human description of when an item comes back. */
  Engine.prototype.dueText = function (id) {
    const r = this.state.items[id];
    if (!r || !r.due) return '';
    const d = Math.ceil((r.due - Date.now()) / DAY);
    if (d <= 0) return 'due now';
    if (d === 1) return 'back tomorrow';
    return 'back in ' + d + ' days';
  };

  window.Engine = Engine;
})();
