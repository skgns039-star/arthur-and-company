/* Arthur & Company — Imweb mount loader.
 * Paste into an Imweb code widget:
 *   <div id="arthur-imweb" data-page="about" data-lang="ko"></div>
 *   <script src="https://skgns039-star.github.io/arthur-and-company/imweb/mount.js?v=…"></script>
 * It renders the same header, page and footer as the GitHub Pages site inside a Shadow DOM,
 * using the site's own CSS/JS files fetched from Pages at runtime (never copy-edited):
 *  - CSS: html/body/:root selectors are pointed at stand-in elements and rem is written as px
 *    (the site fixes html{font-size:16px}; Imweb's html is 10px, so rem would shrink otherwise).
 *  - Fonts: the @import'ed font CSS is registered on the document under an aliased family name,
 *    so Imweb's own "Pretendard" files can never mix with ours.
 *  - JS: content.js/app.js/rail.js/customer-media.js run unchanged with `document` scoped to the
 *    shadow root; internal *.html links are rewritten to Imweb menu URLs from routes.json.
 *  - geo-lang.js behaviour (non-KR visitors → English page) is re-done with the Imweb URLs.
 * Paste guide (Korean): imweb-payload/v2/README_적용방법.md in the project folder.
 */
(function () {
  if (window.__arthurImweb) return;
  window.__arthurImweb = true;
  var me = document.currentScript || document.querySelector('script[src*="/imweb/mount.js"]');
  var src = me && me.src ? me.src : 'https://skgns039-star.github.io/arthur-and-company/imweb/mount.js';
  var BASE = new URL('../', src).href;
  var V = (src.match(/[?&]v=([^&#]+)/) || [])[1] || 'dev';
  var q = function (u) { return u + (u.indexOf('?') < 0 ? '?' : '&') + 'v=' + V; };
  var get = function (u) { return fetch(q(u)).then(function (r) { if (!r.ok) throw new Error(r.status + ' ' + u); return r.text(); }); };
  var PAGES = ['home', 'about', 'brands', 'press', 'careers', 'contact', 'privacy'];

  function ready(fn) { document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn(); }

  ready(function () {
    var host = document.getElementById('arthur-imweb');
    if (!host) return;
    var page = host.getAttribute('data-page') || 'home';
    if (page === 'index') page = 'home';
    var lang = host.getAttribute('data-lang') === 'en' ? 'en' : 'ko';
    get(BASE + 'imweb/routes.json').then(JSON.parse).then(function (routes) {
      if (geoRedirect(routes, lang, page)) return;
      mount(host, routes, lang, page);
    }).catch(function (e) { console.error('[arthur-imweb]', e); });
  });

  // ---- geo-lang.js, same keys/APIs/timeouts, but with Imweb menu URLs --------------------
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function samePath(a, b) { return a.replace(/\/+$/, '') === b.replace(/\/+$/, ''); }
  function geoRedirect(routes, lang, page) {
    var PICK = 'arthurco-lang', GEO = 'arthurco-country', WEEK = 6048e5, LATE = 2500;
    // Only on the live Korean page itself: never in Imweb's editor/preview (iframe or other URL).
    if (lang !== 'ko' || window.top !== window.self || !samePath(location.pathname, routes.ko[page])) return false;
    if (lsGet(PICK) || /bot|crawl|spider|slurp|lighthouse|preview/i.test(navigator.userAgent)) return false;
    var go = function (country) {
      if (!country || country === 'KR') return false;
      location.replace(routes.en[page] + location.search + location.hash);
      return true;
    };
    var saved = (lsGet(GEO) || '').split('|');
    if (saved[0] && Date.now() - Number(saved[1]) < WEEK) return go(saved[0]);
    var start = Date.now();
    fetch('https://api.country.is/').then(function (r) { return r.json(); }).then(function (j) { return j.country; })
      .catch(function () {
        return fetch('https://www.cloudflare.com/cdn-cgi/trace').then(function (r) { return r.text(); })
          .then(function (t) { return (t.match(/^loc=([A-Z]{2})$/m) || [])[1]; });
      })
      .then(function (country) {
        if (!country) return;
        lsSet(GEO, country + '|' + Date.now());
        if (Date.now() - start <= LATE) go(country);
      }).catch(function () {});
    return false;
  }

  // ---- CSS: same files, html/body/:root → stand-ins, rem → px ------------------------------
  var FONT_SUFFIX = ' ArthurCo';
  function px(decl) {
    return decl.replace(/(-?(?:\d+\.?\d*|\.\d+))rem\b/g, function (m, n) { return +(parseFloat(n) * 16).toFixed(4) + 'px'; });
  }
  function sel(s) {
    return s.replace(/:root\b/g, '[data-ac-html]')
      .replace(/(^|[\s,>+~(])(html|body)(?![\w-])/g, function (m, pre, el) { return pre + '[data-ac-' + el + ']'; });
  }
  function transform(css, families) {
    css = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@import[^;]+;/g, '');
    families.forEach(function (f) {
      css = css.replace(new RegExp('(["\']?)\\b' + f + '\\b\\1(?![\\w-]| [A-Za-z])', 'g'), '"' + f + FONT_SUFFIX + '"');
    });
    var out = '', stack = [], re = /([^{}]*)([{}])/g, m, last = 0;
    while ((m = re.exec(css))) {
      last = re.lastIndex;
      var text = m[1], top = stack[stack.length - 1];
      if (m[2] === '{') {
        var p = text.trim();
        if (p.charAt(0) === '@') {
          stack.push(/^@(media|supports|layer|container|document)/.test(p) ? 'group' : /^@(-webkit-)?keyframes/.test(p) ? 'frames' : 'decl');
          out += p + '{';
        } else {
          stack.push('decl');
          out += (top === 'frames' ? p : sel(p)) + '{';
        }
      } else {
        out += (top === 'decl' ? px(text) : text) + '}';
        stack.pop();
      }
    }
    return out + css.slice(last);
  }
  function imports(css, base) {
    var list = [], re = /@import\s+(?:url\()?\s*["']?([^"')\s]+)["']?\s*\)?[^;]*;/g, m;
    while ((m = re.exec(css))) list.push(new URL(m[1], base).href);
    return list;
  }
  // Font CSS is registered once on the document (shadow roots ignore @font-face).
  function fontCss(text, url) {
    var families = [];
    text = text.replace(/url\((["']?)([^"')]+)\1\)/g, function (m, qt, u) { return 'url("' + new URL(u, url).href + '")'; })
      .replace(/font-family\s*:\s*(["']?)([^;"'}]+)\1/g, function (m, qt, f) {
        f = f.trim(); if (families.indexOf(f) < 0) families.push(f);
        return 'font-family:"' + f + FONT_SUFFIX + '"';
      });
    var st = document.createElement('style');
    st.setAttribute('data-arthur-imweb-fonts', url);
    st.textContent = text;
    document.head.appendChild(st);
    return families;
  }
  function loadCss(hrefs) {
    // Same order as the page head: each stylesheet's @imports first, then its own rules.
    return Promise.all(hrefs.map(function (h) { return get(h); })).then(function (texts) {
      var jobs = texts.map(function (t, i) {
        return Promise.all(imports(t, hrefs[i]).map(function (u) {
          return fetch(u).then(function (r) { return r.text(); }).then(function (it) {
            return /@font-face/.test(it) ? { font: fontCss(it, u) } : { css: it };
          });
        })).then(function (parts) { return { parts: parts, own: t }; });
      });
      return Promise.all(jobs);
    }).then(function (sheets) {
      var families = [], chunks = [];
      sheets.forEach(function (s) {
        s.parts.forEach(function (p) { if (p.font) families = families.concat(p.font); else chunks.push(p.css); });
        chunks.push(s.own);
      });
      var all = chunks.map(function (c) { return transform(c, families); }).join('\n');
      // Root-like reset: nothing from Imweb (inherited props or its custom properties) leaks in.
      var vars = {}; (all.match(/var\(\s*--[\w-]+/g) || []).forEach(function (v) { vars[v.replace(/var\(\s*/, '')] = 1; });
      var reset = '[data-ac-html]{all:initial;display:block;' + Object.keys(vars).map(function (v) { return v + ':initial'; }).join(';') + '}\n';
      return reset + all;
    });
  }

  // ---- JS: same files, `document` scoped to the shadow root --------------------------------
  function scopedDocument(shadow, htmlEl, bodyEl) {
    var real = document.documentElement;
    var root = new Proxy(htmlEl, {
      get: function (t, k) {
        if (k === 'scrollHeight' || k === 'scrollTop' || k === 'clientHeight' || k === 'clientWidth') return real[k];
        var v = t[k]; return typeof v === 'function' ? v.bind(t) : v;
      }
    });
    var own = {
      documentElement: root, body: bodyEl,
      querySelector: shadow.querySelector.bind(shadow), querySelectorAll: shadow.querySelectorAll.bind(shadow),
      getElementById: shadow.getElementById.bind(shadow),
      addEventListener: shadow.addEventListener.bind(shadow), removeEventListener: shadow.removeEventListener.bind(shadow)
    };
    return new Proxy(document, {
      get: function (t, k) {
        if (k in own) return own[k];
        var v = t[k]; return typeof v === 'function' ? v.bind(t) : v;
      },
      set: function (t, k, v) { if (k !== 'title') t[k] = v; return true; } // Imweb page SEO keeps the title
    });
  }
  var LINK = /^(?:\.\.\/(ko|en)\/)?(index|about|brands|press|careers|contact|privacy)\.html([?#].*)?$/;
  function rewriteLinks(scope, routes, lang) {
    scope.querySelectorAll('a[href]').forEach(function (a) {
      var m = (a.getAttribute('href') || '').match(LINK);
      if (!m) return;
      var l = m[1] || lang, p = m[2] === 'index' ? 'home' : m[2];
      a.setAttribute('href', routes[l][p] + (m[3] || ''));
    });
  }

  function mount(host, routes, lang, page) {
    var s = host.style;
    'display:block;margin:0;padding:0;border:0;width:auto;max-width:none;min-width:0;height:auto;min-height:0;overflow:visible;transform:none;position:static;float:none'
      .split(';').forEach(function (d) { var kv = d.split(':'); s.setProperty(kv[0], kv[1], 'important'); });
    var shadow = host.shadowRoot || host.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<style></style><div data-ac-html lang="' + lang + '"><div data-ac-body data-page="' + page + '"><div id="app"></div></div></div>';
    var htmlEl = shadow.querySelector('[data-ac-html]'), bodyEl = shadow.querySelector('[data-ac-body]');
    // Images/media resolve to the Pages copy, exactly like the site's ../assets/media/<path>.
    window.SHARE_ASSETS = window.SHARE_ASSETS || new Proxy({}, {
      get: function (t, p) { return typeof p === 'string' ? BASE + 'assets/media/' + p : undefined; }
    });
    var A = BASE + 'assets/';
    var css = loadCss([A + 'styles.css', A + 'state-overrides.css', A + 'customer-media.css']);
    var js = Promise.all(['content.js', 'app.js', 'rail.js', 'customer-media.js'].map(function (f) {
      return get(A + f).then(function (t) { return [A + f, t]; });
    }));
    Promise.all([css, js]).then(function (r) {
      shadow.querySelector('style').textContent = r[0];
      var doc = scopedDocument(shadow, htmlEl, bodyEl);
      r[1].forEach(function (f) {
        try { new Function('document', f[1] + '\n//# sourceURL=' + f[0])(doc); }
        catch (e) { console.error('[arthur-imweb] ' + f[0], e); }
      });
      rewriteLinks(shadow, routes, lang);
      new MutationObserver(function () { rewriteLinks(shadow, routes, lang); }).observe(shadow, { subtree: true, childList: true });
      // geo-lang.js: a visitor who picks KO/EN keeps that choice.
      shadow.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[hreflang]');
        if (a) { try { localStorage.setItem('arthurco-lang', a.getAttribute('hreflang')); } catch (x) {} }
      }, true);
      host.setAttribute('data-ready', '1');
    }).catch(function (e) { console.error('[arthur-imweb]', e); });
  }
})();
