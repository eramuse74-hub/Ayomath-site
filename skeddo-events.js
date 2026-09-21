/* Skeddo events block — what a group has on, straight from Skeddo.
 *
 *   <div data-skeddo-events
 *        data-org="<skeddo group id>"
 *        data-name="AyoMath"></div>
 *   <script src="/skeddo-events.js" defer></script>
 *
 * Reads the group's PUBLIC events (hosted or co-hosted) with Skeddo's anon key.
 * The anon key is public by design — it is the same one baked into
 * app.skeddo.com, and row-level security decides what it can see: published,
 * visibility = public, nothing else.
 *
 * An event is shown from its start until it ENDS (Skeddo's live-window rule),
 * so a practice window that runs for weeks stays on the page the whole time.
 * Each card links to the event's public page, which opens the Skeddo app when
 * it is installed. The block also writes schema.org Event JSON-LD.
 *
 * Text follows the site's ID/EN toggle (lang.js): every label is rendered
 * twice with a lang attribute, and the page CSS hides the other one.
 */
(function () {
  'use strict';

  var SUPA_URL = 'https://dsomtcrnslmhdgonpary.supabase.co';
  var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzb210Y3Juc2xtaGRnb25wYXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NDI5MDgsImV4cCI6MjA5NjExODkwOH0.bEytV7vUVibDz6nx4DEQSr7ba_kmWD1Mn4lLKg5DPhs';
  var WEB_BASE = 'https://app.skeddo.com';
  var COLUMNS = 'id,title,starts_at,ends_at,attend_type,venue_name,city,fee';
  var ENDLESS_GRACE_MS = 2 * 60 * 60 * 1000; // an event with no end counts as on for 2h

  function slugify(s) {
    return String(s || '').toLowerCase().normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  }
  function eventUrl(e) {
    var slug = slugify(e.title);
    return WEB_BASE + '/e/' + e.id + (slug ? '/' + slug : '');
  }
  function groupUrl(orgId, name) {
    var slug = slugify(name);
    return WEB_BASE + '/g/' + orgId + (slug ? '/' + slug : '');
  }

  function api(path, params) {
    var qs = new URLSearchParams();
    (params || []).forEach(function (p) { qs.append(p[0], p[1]); });
    return fetch(SUPA_URL + '/rest/v1/' + path + '?' + qs.toString(), {
      headers: { apikey: SUPA_KEY, Authorization: 'Bearer ' + SUPA_KEY },
    }).then(function (r) {
      if (!r.ok) throw new Error('skeddo ' + r.status);
      return r.json();
    });
  }

  function cohosted(orgId) {
    // Fail-soft, as in the app: an error degrades to "events it owns".
    return fetch(SUPA_URL + '/rest/v1/rpc/cohosted_event_ids', {
      method: 'POST',
      headers: {
        apikey: SUPA_KEY, Authorization: 'Bearer ' + SUPA_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_org: orgId }),
    }).then(function (r) { return r.ok ? r.json() : []; })
      .then(function (ids) { return Array.isArray(ids) ? ids : []; })
      .catch(function () { return []; });
  }

  function load(orgId, limit) {
    return cohosted(orgId).then(function (ids) {
      var now = new Date();
      var grace = new Date(now.getTime() - ENDLESS_GRACE_MS);
      var host = 'org_id.eq.' + orgId +
        (ids.length ? ',id.in.(' + ids.join(',') + ')' : '');
      return api('events', [
        ['select', COLUMNS],
        ['status', 'eq.published'],
        ['visibility', 'eq.public'],
        ['or', '(' + host + ')'],
        ['or', '(ends_at.gte.' + now.toISOString() +
               ',and(ends_at.is.null,starts_at.gte.' + grace.toISOString() + '))'],
        ['order', 'starts_at.asc'],
        ['limit', String(limit)],
      ]);
    });
  }

  // ---- rendering ---------------------------------------------------------

  var LOCALE = { id: 'id-ID', en: 'en-GB' };
  function fmt(iso, lang, opts) {
    return new Date(iso).toLocaleString(LOCALE[lang], opts);
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  /** One label in both languages; the page CSS shows the active one. */
  function bi(parent, tag, cls, idText, enText) {
    var a = el(tag, cls, idText); a.lang = 'id'; parent.appendChild(a);
    var b = el(tag, cls, enText); b.lang = 'en'; parent.appendChild(b);
  }

  function whenLine(e, lang) {
    var now = new Date();
    var running = new Date(e.starts_at) <= now;
    var day = { day: 'numeric', month: 'short' };
    if (running && e.ends_at) {
      return (lang === 'id' ? 'Sedang berlangsung · sampai ' : 'On now · until ') +
        fmt(e.ends_at, lang, day);
    }
    if (running) return lang === 'id' ? 'Sedang berlangsung' : 'On now';
    return fmt(e.starts_at, lang,
      { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
  // Same wording rule as the app: online replaces the venue, hybrid adds to
  // it, in person is just the place.
  function whereLine(e, lang) {
    var place = e.venue_name || e.city || '';
    if (e.attend_type === 'online') return 'Online';
    if (e.attend_type === 'hybrid') {
      var too = lang === 'id' ? 'online juga' : 'online too';
      return place ? place + ' · ' + too : 'Online';
    }
    return place;
  }

  function card(e) {
    var a = el('a', 'skd-card');
    a.href = eventUrl(e); a.target = '_blank'; a.rel = 'noopener';

    // A running event files under TODAY, like the app's "On now" rows.
    var running = new Date(e.starts_at) <= new Date();
    var leafDate = running ? new Date().toISOString() : e.starts_at;
    var leaf = el('span', 'skd-leaf');
    bi(leaf, 'span', 'skd-mon', fmt(leafDate, 'id', { month: 'short' }), fmt(leafDate, 'en', { month: 'short' }));
    leaf.appendChild(el('span', 'skd-day', String(new Date(leafDate).getDate())));
    a.appendChild(leaf);

    var body = el('span', 'skd-body');
    body.appendChild(el('span', 'skd-title', e.title));
    ['id', 'en'].forEach(function (lang) {
      var bits = [whenLine(e, lang), whereLine(e, lang)];
      if (e.fee === 0 || e.fee === null) bits.push(lang === 'id' ? 'Gratis' : 'Free');
      var line = el('span', 'skd-meta', bits.filter(Boolean).join(' · '));
      line.lang = lang;
      body.appendChild(line);
    });
    a.appendChild(body);
    a.appendChild(el('span', 'skd-go', '→'));
    return a;
  }

  function jsonLd(events, name, orgId) {
    var mode = {
      online: 'https://schema.org/OnlineEventAttendanceMode',
      hybrid: 'https://schema.org/MixedEventAttendanceMode',
    };
    var items = events.map(function (e) {
      var url = eventUrl(e);
      var place = e.venue_name || e.city;
      var o = {
        '@context': 'https://schema.org', '@type': 'Event',
        name: e.title, startDate: e.starts_at, url: url,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: mode[e.attend_type] || 'https://schema.org/OfflineEventAttendanceMode',
        location: e.attend_type === 'online' || !place
          ? { '@type': 'VirtualLocation', url: url }
          : { '@type': 'Place', name: place, address: e.city || place },
        organizer: { '@type': 'Organization', name: name, url: groupUrl(orgId, name) },
      };
      if (e.ends_at) o.endDate = e.ends_at;
      if (!e.fee) o.isAccessibleForFree = true;
      return o;
    });
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(items);
    document.head.appendChild(s);
  }

  var CSS =
    '.skd-list{display:grid;gap:10px;margin:12px 0 4px}' +
    '.skd-card{display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:14px;' +
      'text-decoration:none;color:inherit;background:rgba(31,158,142,.07);' +
      'border:1px solid rgba(31,158,142,.22)}' +
    '.skd-card:hover{background:rgba(31,158,142,.13)}' +
    '.skd-leaf{flex:none;width:46px;text-align:center;line-height:1.1}' +
    '.skd-mon{display:block;font-size:11px;font-weight:800;text-transform:uppercase;color:#1F9E8E}' +
    '.skd-day{display:block;font-size:22px;font-weight:900}' +
    '.skd-body{flex:1;min-width:0}' +
    '.skd-title{display:block;font-weight:800;line-height:1.3}' +
    '.skd-meta{display:block;font-size:13px;opacity:.72}' +
    '.skd-go{flex:none;font-weight:900;color:#1F9E8E}' +
    '.skd-foot{font-size:14px;margin:10px 0 0}' +
    '.skd-foot a{color:#1F9E8E;font-weight:700}';

  function mount(box) {
    var orgId = box.getAttribute('data-org');
    var name = box.getAttribute('data-name') || 'Skeddo';
    var limit = parseInt(box.getAttribute('data-limit') || '6', 10);
    if (!orgId) return;

    load(orgId, limit).then(function (events) {
      box.textContent = '';
      if (events.length) {
        var list = el('div', 'skd-list');
        events.forEach(function (e) { list.appendChild(card(e)); });
        box.appendChild(list);
        jsonLd(events, name, orgId);
      } else {
        bi(box, 'p', 'skd-foot',
          'Belum ada acara terjadwal — yang berikutnya diumumkan di grup Skeddo.',
          'Nothing scheduled yet — the next one is announced in the Skeddo group.');
      }
      ['id', 'en'].forEach(function (lang) {
        var p = el('p', 'skd-foot'); p.lang = lang;
        var a = el('a', null, lang === 'id'
          ? 'Ikuti grup ' + name + ' di Skeddo →'
          : 'Follow the ' + name + ' group on Skeddo →');
        a.href = groupUrl(orgId, name); a.target = '_blank'; a.rel = 'noopener';
        p.appendChild(a);
        box.appendChild(p);
      });
      box.hidden = false;
    }).catch(function () {
      // Skeddo unreachable: leave whatever static fallback the page put inside.
      box.hidden = false;
    });
  }

  function start() {
    var boxes = document.querySelectorAll('[data-skeddo-events]');
    if (!boxes.length) return;
    document.head.appendChild(el('style', null, CSS));
    Array.prototype.forEach.call(boxes, mount);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
