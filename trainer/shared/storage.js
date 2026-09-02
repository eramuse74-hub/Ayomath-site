/* storage.js — progress persistence.
   localStorage is the working copy; a JSON file is the backup. The export is
   not optional (see spec §6): browsers clear site data more often than people
   expect and losing months of mastery data is the thing that would make the
   student stop using the site. Plain script; exposes window.Storage_.
*/
(function () {
  'use strict';
  const KEY = 'bme-trainer-v1';
  const VERSION = 1;

  function empty() { return { version: VERSION, items: {}, visuals: {}, lastExport: null, created: Date.now() }; }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return empty();
      const s = JSON.parse(raw);
      if (!s || typeof s !== 'object' || !s.items) return empty();
      s.version = VERSION;
      s.visuals = s.visuals || {};
      return s;
    } catch (e) { return empty(); }
  }

  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch (e) { console.warn('save failed', e); return false; }
  }

  function stamp(d) {
    const z = n => (n < 10 ? '0' : '') + n;
    return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
  }

  /* Trigger a download of the current state as a JSON file. */
  function exportFile(state) {
    state.lastExport = Date.now();
    save(state);
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bme-trainer-progress-' + stamp(new Date()) + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  /* Read a JSON file chosen by the user. Resolves with the merged state.
     mode 'replace' (default) overwrites; 'merge' keeps whichever item record
     was seen more recently, so two devices can be combined. */
  function importFile(file, current, mode) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = () => reject(new Error('Could not read the file.'));
      fr.onload = () => {
        let s;
        try { s = JSON.parse(fr.result); } catch (e) { return reject(new Error('That file is not valid JSON.')); }
        if (!s || typeof s !== 'object' || !s.items || typeof s.items !== 'object') return reject(new Error('That file does not look like a trainer backup (no "items" field).'));
        let out;
        if (mode === 'merge' && current) {
          out = current;
          Object.keys(s.items).forEach(id => {
            const a = current.items[id], b = s.items[id];
            if (!a || (b.lastSeen || 0) > (a.lastSeen || 0)) current.items[id] = b;
          });
          out.visuals = Object.assign({}, s.visuals || {}, current.visuals || {});
        } else {
          out = s;
        }
        out.version = VERSION;
        out.visuals = out.visuals || {};
        save(out);
        resolve(out);
      };
      fr.readAsText(file);
    });
  }

  function daysSince(ts) { return ts ? Math.floor((Date.now() - ts) / 864e5) : null; }

  window.Storage_ = { load, save, exportFile, importFile, daysSince, KEY };
})();
