(() => {
  const lang = document.documentElement.lang;
  const page = document.body.dataset.page;
  document.title = lang === 'ko' ? '아더앤컴퍼니' : 'Arthur&Co.';
  document.documentElement.classList.add('js');
  const asset = (path) => window.SHARE_ASSETS?.[path] || `../assets/media/${path}`;

  document.querySelectorAll('.wordmark').forEach((node) => {
    const logoSource = asset('company/arthur-lockup.png');
    // Header carries the text-only wordmark; the footer keeps the full emblem lockup.
    const textOnly = !!node.closest('.site-header');
    const viewBox = textOnly ? '441 518 407 67' : '350 140 580 470';
    const variant = textOnly ? ' brand-lockup--text' : '';
    node.innerHTML = `<svg class="brand-lockup${variant}" viewBox="${viewBox}" role="img" aria-label="ARTHUR&CO"><image href="${logoSource}" width="1280" height="747"></image></svg>`;
  });

  const sharedFooter = document.querySelector('.site-footer');
  const footerParts = sharedFooter
    ? [...sharedFooter.querySelectorAll('.footer-grid > *')]
    : [];
  footerParts.forEach((node, index) => {
    node.classList.add('footer-reveal');
    node.style.setProperty('--reveal-order', String(index));
  });

  const header = document.querySelector('.site-header');
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.prepend(progress);
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 16);
  const updateProgress = () => {
    const maximum = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${maximum > 0 ? Math.min(scrollY / maximum, 1) : 0})`;
  };
  updateHeader();
  updateProgress();
  window.addEventListener('scroll', () => { updateHeader(); updateProgress(); }, { passive: true });

  document.querySelectorAll('.brand-card').forEach((card, index) => {
    card.dataset.index = String(index + 1).padStart(2, '0');
  });

  if (page === 'home') {
    const hero = document.querySelector('.hero');
    hero?.insertAdjacentHTML('beforeend', `<svg class="hero-emblem" viewBox="350 140 580 470" aria-hidden="true"><image href="${asset('company/arthur-lockup.png')}" width="1280" height="747"></image></svg>`);
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (sharedFooter) {
    if (reducedMotion || !('IntersectionObserver' in window)) {
      sharedFooter.classList.add('is-footer-visible');
    } else {
      const footerObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-footer-visible');
        footerObserver.unobserve(entry.target);
      }), { threshold: 0, rootMargin: '0px 0px -4% 0px' });
      footerObserver.observe(sharedFooter);
    }
  }
  const revealTargets = document.querySelectorAll('.section, .page-hero, .hero-copy, .brand-card, .press-card');
  revealTargets.forEach((node) => node.classList.add('reveal'));
  // 10/28 owner: phones get the same scroll reveal as PC (reduced motion still shows everything at once).
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((node) => node.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
      // A ratio threshold is unreachable once the target is taller than the
      // viewport: the press section is 9198px, so on a 773px window the best
      // possible ratio is 0.077 and a 0.08 threshold never fires, leaving the
      // whole section at opacity 0 however far the reader scrolls. For a scroll
      // reveal the correct trigger is 'any part has entered', which is height
      // independent; the negative rootMargin still holds it until the element is
      // properly inside the viewport.
    }), { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach((node) => observer.observe(node));
  }

  // 브랜드 상세 갤러리와 BRANDS NEWS 룩북은 회사소개와 같은 큰 사진 보기를 연다.
  // 이 창은 브랜드 다이얼로그 위에 쌓이므로 Esc·닫기·바깥 클릭은 큰 사진만 닫는다.
  if (page === 'brands' || page === 'press') {
    const viewer = document.createElement('dialog');
    viewer.className = 'image-viewer';
    viewer.innerHTML = '<div class="image-viewer-inner"><button type="button" aria-label="Close">×</button><img alt=""></div>';
    document.body.append(viewer);
    const viewerImage = viewer.querySelector('img');
    const zoomable = '#brand-dialog .gallery-grid img, .lookbook-grid img';
    const open = (image) => { viewerImage.src = image.src; viewerImage.alt = image.alt; viewerImage.decode().catch(() => {}).then(() => { if (!viewer.open) viewer.showModal(); }); };
    document.addEventListener('click', (event) => { const image = event.target.closest?.(zoomable); if (image) open(image); });
    document.addEventListener('keydown', (event) => { const image = event.target.closest?.(zoomable); if (image && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); open(image); } });
    viewer.querySelector('button').addEventListener('click', () => viewer.close());
    viewer.addEventListener('click', (event) => { if (event.target === viewer) viewer.close(); });
  }

  if (page !== 'about') return;

  document.querySelectorAll('main .section').forEach((section) => {
    if (section.querySelector('.media--brand, .channel-list')) section.remove();
  });

  const legacyMap = [...document.querySelectorAll('main .section')].find((section) => section.querySelector('a[href*="maps.google.com"]'));
  if (legacyMap) {
    const address = lang === 'ko' ? '서울특별시 중구 창경궁로 6, 4층 (충무로5가, 부성빌딩)' : '4F, Busung Bldg., 6 Changgyeonggung-ro, Jung-gu, Seoul, Republic of Korea';
    const mapQuery = lang === 'ko' ? '서울특별시 중구 창경궁로 6' : '6 Changgyeonggung-ro, Jung-gu, Seoul';
    const mapTitle = lang === 'ko' ? '오시는 길' : 'Location';
    const openLabel = lang === 'ko' ? 'Google Maps에서 열기' : 'Open in Google Maps';
    legacyMap.innerHTML = `<div class="shell map-layout"><div class="map-copy"><p class="section-kicker">${lang === 'ko' ? 'Arthur & Company' : 'Arthur&Co.'}</p><h2>${mapTitle}</h2><p>${address}</p><a class="outline-button" href="https://maps.google.com/?q=${encodeURIComponent(mapQuery)}" target="_blank" rel="noopener noreferrer">${openLabel}</a></div><iframe class="map-frame" title="${mapTitle}" src="https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>`;
  }

  const copy = lang === 'ko' ? {
    kicker: 'Company introduction',
    businessTitle: '브랜드의 시작부터 판매 이후까지',
    businessLead: '시장 조사, 유통 전략, 마케팅, 사후 관리까지 브랜드의 한국 시장 운영 전반을 함께합니다.',
    channelsTitle: '주요 유통 채널',
    locationsTitle: '오프라인 운영 현장',
    locationsLead: '면세점과 오프라인 매장에서 운영 중인 브랜드 현장입니다.',
    business: [
      ['브랜드 발굴', '성장 가능성이 높은 브랜드를 발굴하고 국내 시장 적합성을 검토합니다.'],
      ['시장 조사', '시장 흐름과 경쟁 환경을 분석해 브랜드의 진입 방향을 설계합니다.'],
      ['유통 전략', '면세점, 백화점, 온라인 채널에 맞춘 운영 전략을 수립합니다.'],
      ['프로모션 기획', '채널과 고객 특성에 맞는 프로모션과 이벤트를 기획합니다.'],
      ['디지털 마케팅', '브랜드 인지도와 전환을 연결하는 디지털 커뮤니케이션을 운영합니다.'],
      ['사후 관리', '제품 검수, 파트너십 관리, 고객 지원까지 판매 이후를 관리합니다.']
    ]
  } : {
    kicker: 'Company introduction',
    businessTitle: 'From market entry to after-sales care',
    businessLead: 'We support every stage of a brand\'s journey in Korea: market research, distribution strategy, marketing and after-sales care.',
    channelsTitle: 'Key distribution channels',
    locationsTitle: 'Retail presence',
    locationsLead: 'Our brands in duty-free and retail stores.',
    business: [
      ['Brand discovery', 'We identify promising brands and assess their fit for the Korean market.'],
      ['Market research', 'We study market trends and competition to plan the right entry.'],
      ['Distribution strategy', 'We build operating strategies for duty-free, department store and online channels.'],
      ['Promotion planning', 'We plan promotions and events that suit each channel and its customers.'],
      ['Digital marketing', 'We run digital communications that turn brand awareness into sales.'],
      ['After-sales care', 'We manage product inspection, partnerships and customer support after the sale.']
    ]
  };

  const channelCards = [...SITE_DATA.channels.local, ...SITE_DATA.channels.dutyfree];
  const locationCards = SITE_DATA.locations;
  const html = `<section class="section evidence-section"><div class="shell"><p class="section-kicker">${copy.kicker}</p><div class="section-head"><h2>${copy.businessTitle}</h2><p>${copy.businessLead}</p></div><div class="business-grid">${copy.business.map((item,index)=>`<article class="business-item"><span class="index">0${index+1}</span><h3>${item[0]}</h3><p>${item[1]}</p></article>`).join('')}</div></div></section><section class="section section--tint evidence-section"><div class="shell"><div class="section-head"><h2>${copy.channelsTitle}</h2></div><div class="channel-grid">${channelCards.map(c=>`<div class="channel-card"><img src="${asset(c.image)}" alt="${c.label}" loading="lazy"></div>`).join('')}</div></div></section><section class="section evidence-section"><div class="shell"><div class="section-head"><h2>${copy.locationsTitle}</h2><p>${copy.locationsLead}</p></div><div class="location-grid">${locationCards.map(l=>{const venue=lang==='ko'?l.venue:(l.venueEn||l.venue);return `<figure class="location-card"><img src="${asset(l.image)}" alt="${l.brand} · ${venue}" loading="lazy"><figcaption><strong>${l.brand}</strong><span>${venue}</span></figcaption></figure>`}).join('')}</div></div></section>`;
  document.querySelector('main').insertAdjacentHTML('beforeend', html);

  const evidenceSections = document.querySelectorAll('.evidence-section');
  evidenceSections[0]?.setAttribute('data-layout', 'ledger');
  evidenceSections[1]?.setAttribute('data-layout', 'index');
  evidenceSections[2]?.setAttribute('data-layout', 'grid');

  document.querySelectorAll('.location-card img').forEach((image) => image.classList.add('media-clip'));
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const mediaObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      mediaObserver.unobserve(entry.target);
    }), { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    document.querySelectorAll('.media-clip').forEach((image) => mediaObserver.observe(image));
  } else document.querySelectorAll('.media-clip').forEach((image) => image.classList.add('is-visible'));

  document.querySelectorAll('.stats .stat strong').forEach((number) => {
    const target = Number(number.textContent.trim());
    if (!Number.isFinite(target)) return;
    number.dataset.target = String(target);
    const format = (value) => number.hasAttribute('data-year') ? String(value) : value.toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US');
    if (reducedMotion || !('IntersectionObserver' in window)) {
      number.textContent = format(target);
      return;
    }
    number.textContent = '0';
    const counterObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      counterObserver.unobserve(entry.target);
      entry.target.classList.add('is-counting');
      const duration = 1100;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const value = Math.round(target * (1 - Math.pow(1 - progress, 3)));
        entry.target.textContent = format(value);
        if (progress < 1) requestAnimationFrame(tick);
        else entry.target.classList.replace('is-counting', 'is-counted');
      };
      requestAnimationFrame(tick);
    }), { threshold: .25 });
    counterObserver.observe(number);
  });

  const viewer = document.createElement('dialog');
  viewer.className = 'image-viewer';
  viewer.innerHTML = '<div class="image-viewer-inner"><button type="button" aria-label="Close">×</button><img alt=""></div>';
  document.body.append(viewer);
  const viewerImage = viewer.querySelector('img');
  document.querySelectorAll('.location-card img').forEach((image) => {
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    const open = () => { viewerImage.src = image.src; viewerImage.alt = image.alt; viewerImage.decode().catch(() => {}).then(() => { if (!viewer.open) viewer.showModal(); }); };
    image.addEventListener('click', open);
    image.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
  });
  viewer.querySelector('button').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', (event) => { if (event.target === viewer) viewer.close(); });
})();
