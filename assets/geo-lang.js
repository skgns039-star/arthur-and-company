/* 접속 국가가 한국이 아니면 국문 페이지에서 같은 영문 페이지로 옮긴다(2026-10-26 대표님 지시).
 * - 방문자가 KO/EN 링크로 언어를 고르면 그 선택을 기억하고 다시 옮기지 않는다.
 * - 국가는 api.country.is → 실패 시 Cloudflare trace로 확인하고 7일 기억한다. 둘 다 실패하면 국문 그대로.
 * - 확인이 2.5초 넘게 걸리면 지금 화면은 그대로 두고 다음 페이지부터 옮긴다. 검색 로봇은 옮기지 않는다.
 */
(function () {
  var PICK = 'arthurco-lang', GEO = 'arthurco-country', WEEK = 6048e5, LATE = 2500;
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[hreflang]');
    if (a) set(PICK, a.getAttribute('hreflang'));
  }, true);

  var m = location.pathname.match(/\/ko\/((?:index|about|brands|press|careers|contact)\.html)?$/);
  if (!m || get(PICK) || /bot|crawl|spider|slurp|lighthouse|preview/i.test(navigator.userAgent)) return;

  function go(country) {
    if (!country || country === 'KR') return;
    location.replace(location.pathname.replace(/\/ko\/[^/]*$/, '/en/' + (m[1] || 'index.html')) + location.search + location.hash);
  }

  var saved = (get(GEO) || '').split('|');
  if (saved[0] && Date.now() - Number(saved[1]) < WEEK) return go(saved[0]);

  var start = Date.now();
  fetch('https://api.country.is/')
    .then(function (r) { return r.json(); })
    .then(function (j) { return j.country; })
    .catch(function () {
      return fetch('https://www.cloudflare.com/cdn-cgi/trace')
        .then(function (r) { return r.text(); })
        .then(function (t) { return (t.match(/^loc=([A-Z]{2})$/m) || [])[1]; });
    })
    .then(function (country) {
      if (!country) return;
      set(GEO, country + '|' + Date.now());
      if (Date.now() - start <= LATE) go(country);
    })
    .catch(function () {});
})();
