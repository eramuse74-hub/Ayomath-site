/* Eramuse site — Bahasa Indonesia ⇄ English toggle. Plain script, no build step.
 *
 * Markup contract (see README.md):
 *   - Every translated element carries lang="id" or lang="en", as a pair placed
 *     side by side. Each page's CSS hides the inactive one:
 *       html:not([data-lang="en"]) [lang="en"], html[data-lang="en"] [lang="id"] {display:none}
 *     so with JavaScript off the page is simply Indonesian.
 *   - <title>, <meta name="description"> and <img alt> carry their English copy
 *     in a data-en attribute; this script swaps it in.
 *   - Toggle buttons: <button data-set-lang="id"> / <button data-set-lang="en">.
 *
 * Which language wins: ?lang=en|id in the URL, then the choice stored in this
 * browser, then Indonesian. The stored choice follows the visitor across pages.
 */
(function () {
  var KEY = 'eramuse_lang', root = document.documentElement, current = 'id';

  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function store(l) { try { localStorage.setItem(KEY, l); } catch (e) {} }

  function swapAttr(el, l) {
    var isTitle = el.tagName === 'TITLE', isMeta = el.tagName === 'META';
    if (!el.hasAttribute('data-id')) {
      el.setAttribute('data-id', isTitle ? el.textContent : isMeta ? el.content : el.alt);
    }
    var v = el.getAttribute(l === 'en' ? 'data-en' : 'data-id');
    if (isTitle) el.textContent = v; else if (isMeta) el.content = v; else el.alt = v;
  }

  function apply(l) {
    current = l === 'en' ? 'en' : 'id';
    root.setAttribute('data-lang', current);
    root.lang = current;
    var els = document.querySelectorAll('[data-en]'), i;
    for (i = 0; i < els.length; i++) swapAttr(els[i], current);
    var btns = document.querySelectorAll('[data-set-lang]');
    for (i = 0; i < btns.length; i++) {
      var on = btns[i].getAttribute('data-set-lang') === current;
      btns[i].classList.toggle('on', on);
      btns[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  var q = /[?&]lang=(en|id)\b/.exec(location.search);
  if (q) store(q[1]);
  apply(q ? q[1] : (stored() || 'id'));

  // Runs in <head>, so buttons / alts below don't exist yet — re-apply once parsed.
  document.addEventListener('DOMContentLoaded', function () { apply(current); });

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-set-lang]');
    if (!b) return;
    store(b.getAttribute('data-set-lang'));
    apply(b.getAttribute('data-set-lang'));
  });
})();
