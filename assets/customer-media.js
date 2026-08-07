(() => {
  const lang = document.documentElement.lang;
  const page = document.body.dataset.page;
  document.title = lang === 'ko' ? '아더앤컴퍼니' : 'Arthur & Company';
  document.documentElement.classList.add('js');
  const asset = (path) => window.SHARE_ASSETS?.[path] || `../assets/media/${path}`;

  document.querySelectorAll('.wordmark').forEach((node) => {
    const logoSource = asset('company/arthur-lockup.png');
    node.innerHTML = `<svg class="brand-lockup" viewBox="350 140 580 470" role="img" aria-label="ARTHUR&CO"><image href="${logoSource}" width="1280" height="747"></image></svg>`;
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
      }), { threshold: .12, rootMargin: '0px 0px -4% 0px' });
      footerObserver.observe(sharedFooter);
    }
  }
  const revealTargets = document.querySelectorAll('.section, .page-hero, .hero-copy, .brand-card, .press-card');
  revealTargets.forEach((node) => node.classList.add('reveal'));
  if (reducedMotion || window.matchMedia('(max-width: 48rem)').matches || !('IntersectionObserver' in window)) {
    revealTargets.forEach((node) => node.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }), { threshold: .08, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach((node) => observer.observe(node));
  }

  if (page !== 'about') return;

  document.querySelectorAll('main .section').forEach((section) => {
    if (section.querySelector('.media--brand, .channel-list')) section.remove();
  });

  const legacyMap = [...document.querySelectorAll('main .section')].find((section) => section.querySelector('a[href*="maps.google.com"]'));
  if (legacyMap) {
    const address = lang === 'ko' ? '서울특별시 중구 창경궁로6 부성카멜리아 4층' : '4F, 6 Changgyeonggung-ro, Jung-gu, Seoul';
    const mapTitle = lang === 'ko' ? '오시는 길' : 'Location';
    const openLabel = lang === 'ko' ? 'Google Maps에서 열기' : 'Open in Google Maps';
    legacyMap.innerHTML = `<div class="shell map-layout"><div class="map-copy"><p class="section-kicker">Arthur & Company</p><h2>${mapTitle}</h2><p>${address}</p><a class="outline-button" href="https://maps.google.com/?q=${encodeURIComponent(address)}" target="_blank" rel="noopener noreferrer">${openLabel}</a></div><iframe class="map-frame" title="${mapTitle}" src="https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>`;
  }

  const copy = lang === 'ko' ? {
    kicker: 'Company introduction',
    businessTitle: '브랜드의 시작부터 판매 이후까지',
    businessLead: '시장 조사, 유통 전략, 마케팅, 사후 관리까지 브랜드의 한국 시장 운영 전반을 함께합니다.',
    channelsTitle: '주요 유통 채널',
    channelsLead: '전달받은 회사 안내 자료와 유통채널 로고를 기준으로 정리했습니다.',
    locationsTitle: '오프라인 운영 현장',
    locationsLead: '면세점과 오프라인 매장에서 운영 중인 브랜드 현장입니다.',
    locationNames: ['Disney Store · 제주', 'VERUTUM · 부산', 'DINECH · 나트랑', 'TOUS / DINECH · 제주', 'HYERES LOR · 인천', 'SSIL · 인천'],
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
    businessTitle: 'From market entry to post-sales care',
    businessLead: 'We support the full Korean-market journey: research, distribution strategy, marketing and post-sales management.',
    channelsTitle: 'Distribution channels',
    channelsLead: 'Organized from the supplied company introduction and channel assets.',
    locationsTitle: 'Retail presence',
    locationsLead: 'A selection of brand operations across duty-free and offline retail locations.',
    locationNames: ['Disney Store · Jeju', 'VERUTUM · Busan', 'DINECH · Nha Trang', 'TOUS / DINECH · Jeju', 'HYERES LOR · Incheon', 'SSIL · Incheon'],
    business: [
      ['Brand discovery', 'Identify promising brands and assess their fit for the Korean market.'],
      ['Market research', 'Study market dynamics and competition to define the right entry path.'],
      ['Distribution strategy', 'Plan operations for duty-free, department-store and online channels.'],
      ['Promotion planning', 'Design channel-appropriate promotions and customer events.'],
      ['Digital marketing', 'Run communications that connect brand awareness with conversion.'],
      ['Post-sales care', 'Manage inspection, partnerships and customer support after purchase.']
    ]
  };

  const channelFiles = [
    'local-29cm.png','local-Hmall.png','local-kakaotalk-선물하기.png','local-SSG.png','local-W컨셉.png','local-롯데백화점몰.png','local-롯데온.png','local-롯데홈쇼핑.png','local-무신사.png','local-스마트스토어.png','local-한섬-EQL.png',
    'dutyfree-면세점-JTO.png','dutyfree-면세점-SSG.png','dutyfree-면세점-대한항공.png','dutyfree-면세점-롯데.png','dutyfree-면세점-신라.png','dutyfree-면세점-현대.png'
  ];
  const locations = ['disney-store.jpg','verutum.jpg','dinech.jpg','tous-dinech.jpg','hyeres-lor.jpg','ssil.jpg'];
  const html = `<section class="section evidence-section"><div class="shell"><p class="section-kicker">${copy.kicker}</p><div class="section-head"><h2>${copy.businessTitle}</h2><p>${copy.businessLead}</p></div><div class="business-grid">${copy.business.map((item,index)=>`<article class="business-item"><span class="index">0${index+1}</span><h3>${item[0]}</h3><p>${item[1]}</p></article>`).join('')}</div></div></section><section class="section section--tint evidence-section"><div class="shell"><div class="section-head"><h2>${copy.channelsTitle}</h2><p>${copy.channelsLead}</p></div><div class="channel-grid">${channelFiles.map(file=>`<div class="channel-card"><img src="${asset(`channels/${file}`)}" alt="${file.replace(/^(local-|dutyfree-면세점-)|\.[^.]+$/g,'')}"></div>`).join('')}</div></div></section><section class="section evidence-section"><div class="shell"><div class="section-head"><h2>${copy.locationsTitle}</h2><p>${copy.locationsLead}</p></div><div class="location-grid">${locations.map((file,index)=>`<figure class="location-card"><img src="${asset(`locations/${file}`)}" alt="${copy.locationNames[index]}"><figcaption>${copy.locationNames[index]}</figcaption></figure>`).join('')}</div></div></section>`;
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
    }), { threshold: .18 });
    document.querySelectorAll('.media-clip').forEach((image) => mediaObserver.observe(image));
  } else document.querySelectorAll('.media-clip').forEach((image) => image.classList.add('is-visible'));

  document.querySelectorAll('.stats .stat strong').forEach((number) => {
    const target = Number(number.textContent.trim());
    if (!Number.isFinite(target)) return;
    number.dataset.target = String(target);
    if (reducedMotion || !('IntersectionObserver' in window)) {
      number.textContent = target.toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US');
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
        entry.target.textContent = value.toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US');
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
    const open = () => { viewerImage.src = image.src; viewerImage.alt = image.alt; viewer.showModal(); };
    image.addEventListener('click', open);
    image.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
  });
  viewer.querySelector('button').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', (event) => { if (event.target === viewer) viewer.close(); });
})();
