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

  hideImwebForm(); // as early as possible, so the Imweb form never shows

  ready(function () {
    var host = document.getElementById('arthur-imweb');
    if (!host) return;
    hideImwebForm();
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

  // ---- Contact → Imweb 입력폼 (콘텐츠 > 입력폼) ---------------------------------------------
  // Our contact page sits above a native Imweb form widget. That widget is kept in the DOM but
  // taken out of flow and made invisible; our form's values are copied into it and Imweb's own
  // SITE_FORM.confirmInputForm sends them. Result = Imweb's $.ajax POST /ajax/form_add.cm reply
  // (site_form.js submit(): result.msg === 'SUCCESS'), read via $.ajaxPrefilter before Imweb's handlers.
  function imwebForm() {
    return document.getElementById('arthur-imweb') && document.querySelector('form[id^="addForm"]');
  }
  function hideImwebForm() {
    var f = imwebForm(), host = document.getElementById('arthur-imweb');
    if (!f) return;
    var el = f.closest('[doz_type="widget"]') || f;
    while (el.parentElement && el.parentElement !== document.body && !el.parentElement.contains(host)) el = el.parentElement;
    'position:absolute;left:-10000px;top:0;width:1px;height:1px;overflow:hidden;margin:0;padding:0;visibility:hidden'
      .split(';').forEach(function (d) { var kv = d.split(':'); el.style.setProperty(kv[0], kv[1], 'important'); });
    el.setAttribute('aria-hidden', 'true');
    if (!document.getElementById('arthur-imweb-form-css')) {
      var st = document.createElement('style');
      st.id = 'arthur-imweb-form-css';
      st.textContent = '[id^="input_form_complete_modal_"],[id^="input_form_error_modal_"]{display:none!important}';
      document.head.appendChild(st);
    }
  }
  function ga(name, params) { if (typeof window.gtag === 'function') window.gtag('event', name, params); }
  var COPY = {
    ko: { sending: '보내는 중입니다.', ok: '문의가 접수되었습니다. 확인 후 연락드리겠습니다.', fail: '전송에 실패했습니다. 잠시 후 다시 시도하거나 arthur@arthurnco.com으로 보내 주세요.' },
    en: { sending: 'Sending…', ok: 'Your inquiry has been sent. We will get back to you soon.', fail: 'Sending failed. Please try again later or email arthur@arthurnco.com.' }
  };
  var SHAPE = ['radio', 'input', 'input', 'input', 'email', 'input', 'textarea', 'file']; // Imweb group ids, in order
  var OURS = ['company', 'website', 'name', 'email', 'phone', 'message'];                 // our fields after the radio
  function contactForm(shadow, lang) {
    var form = shadow.querySelector('form.contact-form');
    if (!form) return;
    var T = COPY[lang], status = form.querySelector('.form-status'), btn = form.querySelector('button[type="submit"]');
    var fileLabel = form.querySelector('.file-label'), fileText = fileLabel ? fileLabel.textContent : '';
    var busy = false, stuck = false;
    form.addEventListener('submit', function () { // runs after app.js's own validation handler
      if (busy) { status.textContent = T.sending; return; }
      if (form.querySelector('[aria-invalid="true"]')) return;
      busy = true; btn.disabled = true; status.textContent = T.sending;
      var type = form.querySelector('input[name="type"]:checked');
      send(form, stuck).then(function (reply) {
        leadOnce(reply, { form: 'contact', inquiry_type: type ? type.value : '', lang: lang });
        form.reset();
        if (fileLabel) fileLabel.textContent = fileText;
        status.textContent = T.ok;
      }, function (why) {
        if (why === 'stuck') stuck = true;
        console.error('[arthur-imweb] inquiry not sent:', why);
        status.textContent = T.fail;
      }).then(function () { busy = false; btn.disabled = false; });
    });
  }
  function send(ours, stuck) {
    var $ = window.jQuery, f = imwebForm();
    if (!f || !$ || !window.SITE_FORM) return Promise.reject('no Imweb form on this page');
    var groups = [].filter.call(f.querySelectorAll('.form-group'), function (g) { return !/^(privacy|thirdparty)/.test(g.id); });
    var shape = groups.map(function (g) { return g.id.split('_')[0]; }).join();
    if (shape !== SHAPE.join()) return Promise.reject('Imweb form fields changed: ' + shape);
    // Cross-check labels (warn only: wording may differ slightly between the two forms)
    var ourLabels = [ours.querySelector('legend')].concat(OURS.map(function (id) { return ours.querySelector('label[for="' + id + '"]'); }));
    ourLabels.forEach(function (l, i) {
      var a = (l ? l.textContent : '').replace(/[*\s]/g, ''), b = (groups[i].querySelector('label') || {}).textContent || '';
      if (a.toLowerCase() !== b.replace(/[*\s]/g, '').toLowerCase()) console.warn('[arthur-imweb] label differs', a, '≠', b.trim());
    });
    var radios = ours.querySelectorAll('input[name="type"]'), imRadios = groups[0].querySelectorAll('input[type="radio"]');
    [].forEach.call(radios, function (r, i) { if (imRadios[i]) imRadios[i].checked = r.checked; });
    OURS.forEach(function (id, i) { groups[i + 1].querySelector('input,textarea').value = ours.querySelector('#' + id).value; });
    var consent = f.querySelector('#privacy input[type="checkbox"]');
    if (consent) consent.checked = true;
    var code = f.id.replace('addForm', ''), file = ours.querySelector('#attachment').files[0];
    SITE_FORM.hideModal();
    return (file ? upload($, groups[7], file) : Promise.resolve()).then(function () {
      var result = outcome($, f);
      if (stuck) $.ajax({ type: 'POST', data: $(f).serialize(), url: '/ajax/form_add.cm', dataType: 'json', cache: false });
      else SITE_FORM.confirmInputForm(code, 'N');
      return result;
    }).then(function (reply) { resetImweb($, f); return reply; }, function (why) { SITE_FORM.hideModal(); throw why; });
  }
  // One generate_lead per Imweb inquiry (keyed by the reply's idx, also across reloads in this tab).
  function leadOnce(reply, params) {
    var key = 'arthurco-leads', id = reply && reply.idx ? String(reply.idx) : '', seen = [];
    try { seen = (sessionStorage.getItem(key) || '').split(','); } catch (e) {}
    if (id && seen.indexOf(id) >= 0) return;
    if (id) try { sessionStorage.setItem(key, seen.concat(id).slice(-20).join(',')); } catch (e) {}
    ga('generate_lead', params);
  }
  // Read Imweb's own requests before any Imweb callback runs: $.ajaxPrefilter attaches our done/fail
  // ahead of the request's success option, so an exception in Imweb's reply handling (or in its global
  // ajaxError handler) can no longer hide the result from us.
  var watchers = [];
  function watch($, re, fn) {
    if (!watch.on) {
      watch.on = true;
      $.ajaxPrefilter(function (o, oo, xhr) {
        watchers.slice().forEach(function (w) { if (w.re.test(o.url || '')) w.fn(xhr); });
      });
    }
    var w = { re: re, fn: fn };
    watchers.push(w);
    return function () { var i = watchers.indexOf(w); if (i >= 0) watchers.splice(i, 1); };
  }
  function errorModal(f) {
    var m = document.getElementById('input_form_error_modal_' + f.id.replace('addForm', ''));
    return m && m.style.display !== 'none' ? (m.textContent.trim() || 'error') : ''; // Imweb shows it with $.show()
  }
  function upload($, group, file) {
    if (file.size > 1e8) return Promise.reject('file over 100MB');
    var code = group.id.split('_')[1];
    if (!$(group).data('blueimp-fileupload') && SITE_FORM.itemFileUpload) SITE_FORM.itemFileUpload($(group), code);
    group.querySelector('._temp_file').value = '';
    var input = group.querySelector('input[type="file"]'), dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    // Imweb reports upload errors with showModal('error', msg) but without the widget code, so no
    // modal ever shows; read the upload reply itself instead.
    var failed = '', stop = watch($, /\/ajax\/form_file_upload\.cm/, function (xhr) {
      xhr.done(function (r) { var x = r && r['form_file_' + code] && r['form_file_' + code][0]; if (!x || x.error || !(x.tmp_idx > 0)) failed = (x && x.error) || 'bad reply'; })
        .fail(function () { failed = 'request failed'; });
    });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return poll(function () {
      if (failed) throw 'upload: ' + failed;
      return group.querySelector('._temp_file').value;
    }, 60000, 'upload timed out').then(function (v) { stop(); return v; }, function (why) { stop(); throw why; });
  }
  function outcome($, f) {
    return new Promise(function (resolve, reject) {
      var settled = false, stop, finish = function (ok, why) {
        if (settled) return; settled = true;
        stop();
        setTimeout(SITE_FORM.hideModal, 0); // after Imweb's own callbacks have shown (hidden) modals
        ok ? resolve(why) : reject(why);
      };
      stop = watch($, /\/ajax\/form_add\.cm/, function (xhr) {
        xhr.done(function (r) { r && r.msg === 'SUCCESS' ? finish(true, r) : finish(false, (r && r.msg) || 'bad reply'); })
          // a failed request leaves Imweb's private "submitting" lock on, so later tries must bypass it
          .fail(function () { finish(false, 'stuck'); });
      });
      poll(function () { var err = errorModal(f); if (err) throw err; return settled; }, 30000, 'no reply from Imweb')
        .catch(function (why) { finish(false, why); });
    });
  }
  function poll(check, ms, timeoutMsg) {
    var t0 = Date.now();
    return new Promise(function (resolve, reject) {
      (function tick() {
        try { var v = check(); if (v) return resolve(v); } catch (e) { return reject(e); }
        if (Date.now() - t0 > ms) return reject(timeoutMsg);
        setTimeout(tick, 150);
      })();
    });
  }
  function resetImweb($, f) {
    f.reset();
    [].forEach.call(f.querySelectorAll('._temp_file,._upload_file'), function (i) { i.value = ''; });
    if (window.TOKEN && TOKEN.makeToken) TOKEN.makeToken(86400, 'form', function (token, key) {
      $(f).find('#input_form_token_obj ._tk_obj').val(token);
      $(f).find('#input_form_token_obj ._tk_key_obj').val(key);
    });
  }

  // ---- Press search → GA4 (no personal data) --------------------------------------------
  function pressAnalytics(shadow) {
    var input = shadow.querySelector('#press-search'), filter = shadow.querySelector('#brand-filter'), sent = {}, timer;
    if (!input) return;
    var fire = function () {
      clearTimeout(timer);
      var term = input.value.trim(), key = term.toLowerCase();
      if (term.length < 2 || sent[key] || /@|\d[\d\s().-]{6,}\d/.test(term)) return; // skip emails / phone numbers
      sent[key] = 1;
      ga('search', { search_term: term });
    };
    input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(fire, 1500); });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') fire(); });
    input.addEventListener('blur', fire);
    if (filter) filter.addEventListener('change', function () {
      if (filter.value) ga('select_content', { content_type: 'brand_filter', item_id: filter.value });
    });
  }

  // ---- SEO head for our 14 pages only: page language, canonical (https, primary domain), hreflang --
  function seoHead(routes, lang, page) {
    var origin = routes.origin || location.origin, head = document.head;
    document.documentElement.lang = lang;
    var canon = head.querySelector('link[rel="canonical"]');
    if (!canon) { canon = document.createElement('link'); canon.rel = 'canonical'; head.appendChild(canon); }
    canon.href = origin + routes[lang][page];
    [].forEach.call(head.querySelectorAll('link[rel="alternate"][data-arthur]'), function (l) { l.remove(); });
    [['ko', 'ko'], ['en', 'en'], ['x-default', 'en']].forEach(function (x) {
      var l = document.createElement('link');
      l.rel = 'alternate'; l.hreflang = x[0]; l.href = origin + routes[x[1]][page]; l.setAttribute('data-arthur', '');
      head.appendChild(l);
    });
  }

  // Only on pages that hold #arthur-imweb (this runs from mount): GitHub Pages has no back-to-top
  // button and no right-click/copy blocking, so Imweb's site-wide versions are switched off here.
  function imwebChrome(host) {
    var st = document.createElement('style');
    st.textContent = 'a.btn_gotop{display:none!important}';
    document.head.appendChild(st);
    var unblock = function () {
      [document, document.body, document.documentElement].forEach(function (n) {
        n.oncontextmenu = n.onselectstart = n.ondragstart = n.oncopy = null;
      });
      var $ = window.jQuery, ev = $ && $._data && $._data(document, 'events');
      if (ev) ['contextmenu', 'keydown', 'selectstart', 'dragstart', 'copy'].forEach(function (type) {
        (ev[type] || []).slice().forEach(function (h) {
          var f = String(h.handler);
          // Imweb's protection: contextmenu → return false; keydown → block Ctrl/Cmd+C (keyCode 67)
          if (type === 'keydown' ? /keyCode\s*==\s*67/.test(f) : type !== 'contextmenu' || /return\s+false/.test(f)) $(document).off(type, h.handler);
        });
      });
      for (var e = host.parentElement; e; e = e.parentElement) {
        var c = getComputedStyle(e);
        if (c.userSelect === 'none' || c.webkitUserSelect === 'none') {
          e.style.setProperty('user-select', 'auto', 'important');
          e.style.setProperty('-webkit-user-select', 'auto', 'important');
        }
      }
    };
    unblock();
    addEventListener('load', unblock);
  }

  function mount(host, routes, lang, page) {
    var s = host.style;
    'display:block;margin:0;padding:0;border:0;width:auto;max-width:none;min-width:0;height:auto;min-height:0;overflow:visible;transform:none;position:static;float:none'
      .split(';').forEach(function (d) { var kv = d.split(':'); s.setProperty(kv[0], kv[1], 'important'); });
    // Imweb's site CSS zooms the whole body to 0.85 between 767px and 1024px
    // (custom.cm: body:not(.video_fullpage){zoom:.85}). Undo it on our box so 1px stays 1px.
    var unzoom = function () {
      var z = 1, e = host.parentElement;
      for (; e; e = e.parentElement) z *= parseFloat(getComputedStyle(e).zoom) || 1;
      if (z === 1) s.removeProperty('zoom'); else s.setProperty('zoom', String(1 / z), 'important');
    };
    unzoom();
    addEventListener('resize', unzoom);
    imwebChrome(host);
    seoHead(routes, lang, page);
    // The snippet may carry a declarative <template shadowrootmode="open"> plus a plain-text copy of the
    // page in the light DOM for crawlers that do not run JavaScript. With a shadow root and no <slot>,
    // browsers never render that copy; we reuse the root the parser already attached.
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
      if (page === 'contact') contactForm(shadow, lang);
      if (page === 'press') pressAnalytics(shadow);
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
