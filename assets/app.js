(()=>{
const root=document.querySelector("#app"),lang=document.documentElement.lang,page=document.body.dataset.page,d=SITE_DATA.copy[lang][page];
const asset=p=>window.SHARE_ASSETS?.[p]||`../assets/media/${p}`;
const has=p=>!window.SHARE_ASSETS||!!window.SHARE_ASSETS[p];
const pick=v=>(v&&typeof v==="object"&&!Array.isArray(v))?(v[lang]??v.ko??""):v;
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const labels=lang==="ko"?{about:"회사소개",brands:"브랜드",press:"보도자료",careers:"채용",contact:"문의",exclusive:"독점 유통",dutyfree:"면세 비즈니스",placeholder:"최종 이미지 제공 예정",official:"외부 링크",search:"제목과 내용 검색",all:"전체 브랜드",submit:"문의 보내기",more:"자세히 보기",gallery:"브랜드 이미지",channels:"입점 채널",source:"원문 기사",moreSources:"본문이 제공되지 않은 원문 기사",noResult:"조건에 맞는 소식이 없습니다.",privacy:"개인정보처리방침",view:"내용 보기"}:{about:"About Us",brands:"Brands",press:"Press &amp; Brand News",careers:"Careers",contact:"Contact",exclusive:"Exclusive Distribution",dutyfree:"Duty-Free Business",placeholder:"Final image pending",official:"External link",search:"Search title and content",all:"All brands",submit:"Send inquiry",more:"Read more",gallery:"Brand imagery",channels:"Retail channels",source:"Original article",moreSources:"Articles linked without supplied copy",noResult:"No stories match this filter.",privacy:"Privacy Policy",view:"View details"};
const routes=["about","brands","press","careers","contact"];
const href=p=>p==="home"?"index.html":`${p}.html`;
const other=lang==="ko"?"en":"ko";

const header=`<header class="site-header"><div class="shell header-row"><a class="wordmark" href="index.html">${lang==="ko"?"아더앤컴퍼니":"Arthur &amp; Company"}</a><nav class="desktop-nav" aria-label="Primary">${routes.map(r=>`<a class="nav-link" ${page===r?'aria-current="page"':''} href="${href(r)}">${labels[r]}</a>`).join("")}<a class="language-link" hreflang="${other}" href="../${other}/${href(page)}">${other.toUpperCase()}</a></nav><button class="menu-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="Menu">☰</button></div><nav id="mobile-nav" class="mobile-nav shell" hidden>${routes.map(r=>`<a href="${href(r)}">${labels[r]}</a>`).join("")}<a hreflang="${other}" href="../${other}/${href(page)}">${other.toUpperCase()}</a></nav></header>`;
const footer=`<footer class="site-footer"><div class="shell footer-grid"><div><div class="wordmark">${lang==="ko"?"아더앤컴퍼니":"Arthur &amp; Company"}</div><div class="company-info">${lang==="ko"?`<p>(주)아더앤컴퍼니</p><p>서울특별시 중구 창경궁로 6, 4층 (충무로5가, 부성빌딩)</p>`:`<p>Arthur &amp; Company Co., Ltd.</p><p>4F, Busung Bldg., 6 Changgyeonggung-ro, Jung-gu, Seoul, Republic of Korea</p>`}<p>${lang==="ko"?"문의":"Contact"} <a href="mailto:arthur@arthurnco.com">arthur@arthurnco.com</a></p><p><a class="footer-privacy" href="privacy.html">${labels.privacy}</a></p></div></div><nav class="footer-links" aria-label="Footer">${routes.map(r=>`<a href="${href(r)}">${labels[r]}</a>`).join("")}</nav><a class="language-link" hreflang="${other}" href="../${other}/${href(page)}">${other.toUpperCase()}</a></div></footer>`;

// A media box either carries the delivered photography or keeps the pending-image note.
const media=cls=>`<div class="media ${cls}" role="img" aria-label="${labels.placeholder}">${labels.placeholder}</div>`;
const shot=(src,alt,cls,extra="")=>`<img class="brand-shot ${cls}" src="${asset(src)}" alt="${esc(alt)}" loading="lazy" decoding="async"${extra}>`;
// 00 HOME.zip ships no Compressport frame, so the home rail falls back to that
// brand's own brand-page cut rather than leaving one card empty mid-row.
const brandMedia=(b,cls,primary,hover)=>{
  const base=b[primary]||b.card,over=b[hover]||(b[primary]?null:b.cardHover);
  if(!base)return media(cls);
  return `<div class="media ${cls} has-image">${shot(base,b.name,"brand-shot--base")}${over?shot(over,"","brand-shot--hover",' aria-hidden="true"'):""}</div>`;
};
const links=b=>b.links.length?`<div class="link-row">${b.links.map(([n,u])=>`<a class="text-link" href="${u}" target="_blank" rel="noopener noreferrer">${n}</a>`).join("")}</div>`:"";
const excerpt=b=>{const d=pick(b.description);return d.length?`<p class="brand-summary">${esc(d[0])}</p>`:""};

const byGroup=g=>SITE_DATA.brands.filter(b=>b.group===g);
const homeCards=g=>byGroup(g).map(b=>`<article class="brand-card">${brandMedia(b,"media--brand","home","homeHover")}<h3>${esc(b.name)}</h3>${links(b)}</article>`).join("");
const brandCards=g=>byGroup(g).map(b=>`<article class="brand-card" data-brand="${esc(b.slug)}">${brandMedia(b,"media--brand","card","cardHover")}<h3>${esc(b.name)}</h3>${excerpt(b)}${links(b)}${pick(b.description).length||b.gallery.filter(has).length?`<button class="text-link brand-open" data-slug="${esc(b.slug)}">${labels.more}</button>`:""}</article>`).join("");

const privacyList=`<dl class="privacy-list"><dt>${lang==="ko"?"수집 항목":"Information collected"}</dt><dd>${lang==="ko"?"업체명, 담당자명, 이메일, 연락처, 문의 내용":"Company, contact name, email, phone number and message"}</dd><dt>${lang==="ko"?"수집 목적":"Purpose"}</dt><dd>${lang==="ko"?"문의 답변":"To answer your inquiry"}</dd><dt>${lang==="ko"?"보관 기간":"Retention"}</dt><dd>${lang==="ko"?"문의 처리 후 1년":"One year after your inquiry is handled"}</dd></dl>`;
const privacyMore=h=>`<${h}>${lang==="ko"?"동의를 거부할 권리":"Your right to refuse"}</${h}><p>${lang==="ko"?"개인정보 수집에 동의하지 않을 수 있습니다. 다만 동의하지 않으면 문의를 접수할 수 없습니다.":"You may decline to give consent. Without it, we cannot accept your inquiry."}</p><${h}>${lang==="ko"?"문의":"Contact"}</${h}><p>${lang==="ko"?"개인정보 열람·정정·삭제 요청은 아래 이메일로 보내 주세요.":"To access, correct or delete your personal information, email us at the address below."}</p><p><a class="text-link" href="mailto:arthur@arthurnco.com">arthur@arthurnco.com</a></p>`;
const pageHero=`<section class="page-hero"><div class="shell"><p class="eyebrow">${lang==="ko"?"Arthur & Company":"Arthur&Co."}</p><h1>${d.title}</h1><p>${d.lead}</p></div></section>`;
let main="";

if(page==="home")main=`<main><section class="hero"><div class="shell hero-copy"><p class="eyebrow">Distribution · Retail · Duty Free</p><h1>${d.title}</h1><p>${d.lead}</p></div></section><section class="section"><div class="shell"><div class="section-head"><h2>${labels.dutyfree}</h2><p>${lang==="ko"?"면세 유통 포트폴리오를 소개합니다.":"Our duty-free distribution portfolio."}</p></div><div class="rail">${homeCards("dutyfree")}</div></div></section><section class="section section--tint"><div class="shell"><div class="section-head"><h2>${labels.exclusive}</h2><p>${lang==="ko"?"브랜드별 공식 채널로 바로 연결됩니다.":"Visit each brand's official channels."}</p></div><div class="rail">${homeCards("exclusive")}</div></div></section></main>`;

if(page==="about")main=`<main>${pageHero}<section class="section"><div class="shell prose"><p>${lang==="ko"?"아더앤컴퍼니는 국내외 우수 브랜드의 가치를 발굴하고, 면세점·백화점·온라인 등 다양한 유통 채널을 통해 한국 시장에 성공적으로 연결하는 브랜드 유통 전문기업입니다.":"Arthur&Co. discovers outstanding Korean and international brands and connects them successfully with the Korean market through duty-free, department store and online channels."}</p><p>${lang==="ko"?"각 브랜드의 고유한 가치와 정체성을 존중하며 한국의 시장과 유통 환경에 적합한 마케팅 및 판매 전략을 수립합니다.":"We respect each brand's identity and build marketing and sales strategies suited to the Korean market and its retail environment."}</p></div></section><section class="section section--tint"><div class="shell"><div class="stats"><div class="stat"><strong data-year>2012</strong><span>${lang==="ko"?"면세 유통 시작":"Duty-free since"}</span></div><div class="stat"><strong>${new Set(SITE_DATA.brands.map(b=>b.name)).size}</strong><span>${lang==="ko"?"운영 브랜드":"Brands"}</span></div><div class="stat"><strong>${byGroup("exclusive").length}</strong><span>${lang==="ko"?"독점 유통 브랜드":"Exclusive brands"}</span></div><div class="stat"><strong>67</strong><span>${lang==="ko"?"유통 매장":"Retail & distribution locations"}</span></div></div></div></section><section class="section"><div class="shell columns"><div><h2>${lang==="ko"?"온라인 채널":"Online channels"}</h2><ul class="channel-list"><li>29CM</li></ul></div><div><h2>${lang==="ko"?"오프라인·면세 채널":"Retail & duty-free"}</h2><ul class="channel-list"><li>JTO</li></ul></div></div></section><section class="section section--tint"><div class="shell columns"><div>${media("media--brand")}<h2>Business Areas</h2></div><div>${media("media--brand")}<h2>CI</h2></div></div></section><section class="section"><div class="shell"><div class="section-head"><h2>${lang==="ko"?"오시는 길":"Location"}</h2><a class="outline-button" href="https://maps.google.com/?q=서울특별시+중구+창경궁로6" target="_blank" rel="noopener noreferrer">Google Maps</a></div><p>${lang==="ko"?"서울특별시 중구 창경궁로 6, 4층 (충무로5가, 부성빌딩)":"4F, Busung Bldg., 6 Changgyeonggung-ro, Jung-gu, Seoul, Republic of Korea"}</p></div></section></main>`;

if(page==="brands")main=`<main>${pageHero}<section class="section"><div class="shell"><div class="section-head"><h2>${labels.dutyfree}</h2><p>${lang==="ko"?"면세 채널에서 운영 중인 브랜드입니다.":"Brands we operate across duty-free channels."}</p></div><div class="brand-grid">${brandCards("dutyfree")}</div></div></section><section class="section section--tint"><div class="shell"><div class="section-head"><h2>${labels.exclusive}</h2><p>${lang==="ko"?"아더앤컴퍼니가 국내 독점 유통하는 브랜드입니다.":"Brands we distribute exclusively in Korea."}</p></div><div class="brand-grid">${brandCards("exclusive")}</div></div></section><dialog id="brand-dialog"><div class="dialog-inner"><button class="dialog-close" aria-label="Close">×</button><div id="brand-dialog-content"></div></div></dialog></main>`;

const posts=SITE_DATA.press;
// B2: show the year only in the popup byline, date-only stamp lines and card summaries; data and sentences keep the full date.
const DATE=/(\d{4})\s*[.\-\/]\s*\d{1,2}\s*[.\-\/]\s*\d{1,2}\.?(?:\s*(?:오전|오후|AM|PM))?(?:\s*\d{1,2}:\d{2}(?::\d{2})?)?/g;
const yearOnly=t=>t.replace(DATE,"$1").replace(/(\d{4})년\s*\d{1,2}월\s*\d{1,2}일/g,(m,y,o,str)=>y+"년"+(/\S/.test(str[o+m.length]||"")?" ":"")).replace(/\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{4})\b/g,"$1");
const stampOnly=t=>/^\s*\d{4}\s*$/.test(yearOnly(t))&&yearOnly(t).trim()!==t.trim();
const cardLead=p=>{if(p.summary)return pick(p.summary);const t=pick(p.body)[0]||"";return stampOnly(t)?yearOnly(t):t;};
const postCard=(p,i)=>`<article class="press-card" data-brand="${esc(p.brand)}" data-search="${esc(`${pick(p.title)} ${pick(p.body).join(" ")}`)}">${p.images.length?`<div class="media media--press has-image">${shot(p.images[0],pick(p.title),"brand-shot--base")}</div>`:media("media--press")}<p class="eyebrow">${esc(p.brand)} · ${esc((p.date||"").slice(0,4))}</p><h3>${esc(pick(p.title))}</h3><p>${esc(cardLead(p).slice(0,120))}${cardLead(p).length>120?"…":""}</p><button class="text-link press-open" data-index="${i}">${labels.more}</button></article>`;
const extraSources=SITE_DATA.pressExtraSources||[];
// 03 PRESS - BRANDS NEWS.zip/협찬 · KO caption names the wearer (and the DINECH piece; TOUS items are SKU numbers), EN keeps the brand only so the English page stays Hangul-free.
const lookbook=Object.entries(SITE_DATA.sponsorship||{}).flatMap(([slug,items])=>{const name=SITE_DATA.brands.find(b=>b.slug===slug)?.name||slug.toUpperCase();return items.filter(x=>has(x.image)).map(x=>({...x,image:lang==="en"&&x.imageEn&&has(x.imageEn)?x.imageEn:x.image,caption:lang==="ko"?[name,x.person,...(slug==="dinech"?[x.item]:[])].join(" · "):name}))});
const lookbookSection=lookbook.length?`<section class="lookbook" aria-labelledby="lookbook-title"><h2 id="lookbook-title">${lang==="ko"?"룩북":"Lookbook"}</h2><div class="press-grid lookbook-grid">${lookbook.map(x=>`<figure class="lookbook-card"><div class="media media--press has-image">${shot(x.image,x.caption,"brand-shot--base",' tabindex="0" role="button"')}</div><figcaption class="eyebrow">${esc(x.caption)}</figcaption></figure>`).join("")}</div></section>`:"";

if(page==="press")main=`<main>${pageHero}<section class="section"><div class="shell"><div class="tools"><div class="field"><label for="brand-filter">${labels.all}</label><select id="brand-filter"><option value="">${labels.all}</option>${[...new Set(posts.map(p=>p.brand))].map(b=>`<option>${esc(b)}</option>`).join("")}</select></div><div class="field"><label for="press-search">${labels.search}</label><input id="press-search" type="search" placeholder="${labels.search}"></div></div><div id="press-grid" class="press-grid">${posts.map(postCard).join("")}</div><p id="press-empty" class="placeholder-note" hidden>${labels.noResult}</p>${lookbookSection}${extraSources.length?`<div class="source-list"><h2>${labels.moreSources}</h2><ul>${extraSources.map(s=>`<li><span>${esc(s.brand)}</span><a class="text-link" href="${s.url}" target="_blank" rel="noopener noreferrer">${labels.source}</a></li>`).join("")}</ul></div>`:""}</div></section><dialog id="press-dialog"><div class="dialog-inner"><button class="dialog-close" aria-label="Close">×</button><div id="dialog-content"></div></div></dialog></main>`;

if(page==="careers")main=`<main>${pageHero}<section class="section"><div class="shell columns"><article><h2>${lang==="ko"?"방법을 스스로 만드는 사람":"Find your own way"}</h2><p>${lang==="ko"?"전례가 없는 일이 많습니다. ‘어떻게 하면 되나요’보다 ‘이렇게 해보겠습니다’로 시작합니다.":"Much of our work has no precedent. We start with \"Here's what I'll try,\" not \"How should I do this?\""}</p></article><article><h2>${lang==="ko"?"결과로 말하는 사람":"Let results speak"}</h2><p>${lang==="ko"?"과정의 성실함을 넘어 실제 결과를 만들어 낸 경험을 봅니다.":"Hard work matters, but we look for people who have delivered real results."}</p></article><article><h2>${lang==="ko"?"브랜드를 자기 사업처럼":"Run the brand like your own business"}</h2><p>${lang==="ko"?"매출과 손익까지 생각하며 브랜드 전체를 책임지는 사람을 찾습니다.":"We look for people who take responsibility for the whole brand, down to sales and profit."}</p></article></div></section><section class="section section--tint"><div class="shell"><div class="section-head"><h2>${lang==="ko"?"채용 안내":"How to apply"}</h2><p>blue0919@arthurnco.com</p></div><div class="link-row"><a class="outline-button" href="https://www.saramin.co.kr/zf_user/company-info/view?csn=MmtleG01aVFzYkt6WjI5WElKL2Jkdz09" target="_blank" rel="noopener noreferrer">Saramin</a><a class="outline-button" href="https://www.jobkorea.co.kr/Recruit/Co_Read/C/13273104" target="_blank" rel="noopener noreferrer">JobKorea</a></div></div></section></main>`;

if(page==="contact")main=`<main>${pageHero}<section class="section"><div class="shell"><form class="contact-form" novalidate><fieldset class="field"><legend>${lang==="ko"?"문의 유형":"Inquiry type"} *</legend><div class="radio-row">${(lang==="ko"?["회사 일반 문의","신규 브랜드 제안 · 파트너십","채용 문의","기타"]:["General inquiry","Brand proposal · Partnership","Recruitment","Other"]).map((x,i)=>`<label><input type="radio" name="type" value="${x}" ${i===0?"required":""}>${x}</label>`).join("")}</div><p class="helper" data-error="type"></p></fieldset>${[["company",lang==="ko"?"업체명":"Company",false],["website",lang==="ko"?"홈페이지 주소":"Website",false],["name",lang==="ko"?"담당자명":"Contact name",true],["email",lang==="ko"?"이메일":"Email",true],["phone",lang==="ko"?"연락처":"Phone",true]].map(([n,l,r])=>`<div class="field"><label for="${n}">${l}${r?" *":""}</label><input id="${n}" name="${n}" type="${n==='email'?'email':n==='website'?'url':'text'}" ${r?"required":""}><p class="helper" data-error="${n}"></p></div>`).join("")}<div class="field"><label for="message">${lang==="ko"?"문의 내용":"Message"} *</label><textarea id="message" name="message" required></textarea><p class="helper" data-error="message"></p></div><div class="field"><label class="file-label" for="attachment">${lang==="ko"?"첨부 파일 선택":"Choose attachment"}</label><input id="attachment" name="attachment" type="file" hidden></div><div class="consent-row"><input type="checkbox" id="consent" name="consent" required><p class="consent-text"><label for="consent">${lang==="ko"?"개인정보 수집에 동의합니다.":"I agree to the collection of personal information."}</label><button type="button" class="consent-toggle" aria-expanded="false" aria-controls="consent-detail">${labels.view}</button></p></div><div id="consent-detail" class="consent-detail" hidden><div class="consent-detail-clip"><div class="consent-detail-box">${privacyList}<button type="button" class="consent-toggle" aria-expanded="false" aria-controls="policy-detail">${labels.privacy}</button><div id="policy-detail" class="consent-detail" hidden><div class="consent-detail-clip"><div class="policy-body">${privacyMore("h3")}</div></div></div></div></div></div><p class="helper" data-error="consent"></p><button class="solid-button" type="submit">${labels.submit}</button><p class="form-status" role="status"></p></form></div></section></main>`;

if(page==="privacy")main=`<main>${pageHero}<section class="section"><div class="shell prose privacy-policy">${privacyList}${privacyMore("h2")}</div></section></main>`;

root.innerHTML=header+main+footer;

const toggle=document.querySelector(".menu-toggle"),mobile=document.querySelector("#mobile-nav");
toggle?.addEventListener("click",()=>{const open=toggle.getAttribute("aria-expanded")==="true";toggle.setAttribute("aria-expanded",String(!open));mobile.hidden=open});

const bindDialog=dialog=>{
  dialog.querySelector(".dialog-close").addEventListener("click",()=>dialog.close());
  dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close()});
};

if(page==="brands"){
  const dialog=document.querySelector("#brand-dialog"),content=document.querySelector("#brand-dialog-content");
  document.querySelector("main").addEventListener("click",e=>{
    const button=e.target.closest(".brand-open");
    if(!button)return;
    const b=SITE_DATA.brands.find(x=>x.slug===button.dataset.slug);
    if(!b)return;
    const gallery=b.gallery.filter(has);
    content.innerHTML=`<p class="eyebrow">${b.group==="exclusive"?labels.exclusive:labels.dutyfree}</p><h2>${esc(b.name)}</h2>${pick(b.description).map(p=>`<p>${esc(p)}</p>`).join("")}${links(b)}${b.channels.length?`<h3>${labels.channels}</h3><div class="channel-grid channel-grid--compact">${b.channels.map(c=>`<div class="channel-card"><img src="${asset(c)}" alt="" loading="lazy"></div>`).join("")}</div>`:""}${gallery.length?`<h3>${labels.gallery}</h3><div class="gallery-grid">${gallery.map(g=>`<img src="${asset(g)}" alt="${esc(b.name)}" loading="lazy" decoding="async" tabindex="0" role="button">`).join("")}</div>`:""}`;
    dialog.showModal();
  });
  bindDialog(dialog);
}

if(page==="press"){
  const filter=document.querySelector("#brand-filter"),search=document.querySelector("#press-search"),grid=document.querySelector("#press-grid"),empty=document.querySelector("#press-empty"),dialog=document.querySelector("#press-dialog"),content=document.querySelector("#dialog-content");
  const apply=()=>{
    let shown=0;
    [...grid.children].forEach(card=>{
      const matchBrand=!filter.value||card.dataset.brand===filter.value;
      const matchText=card.dataset.search.toLowerCase().includes(search.value.toLowerCase());
      card.hidden=!(matchBrand&&matchText);
      if(!card.hidden)shown++;
    });
    empty.hidden=shown>0;
  };
  filter.addEventListener("change",apply);
  search.addEventListener("input",apply);
  grid.addEventListener("click",e=>{
    const button=e.target.closest(".press-open");
    if(!button)return;
    const p=posts[Number(button.dataset.index)];
    content.innerHTML=`<p class="eyebrow">${esc(p.brand)} · ${esc((p.date||"").slice(0,4))}</p><h2>${esc(pick(p.title))}</h2>${pick(p.byline)?`<p class="byline">${esc(yearOnly(pick(p.byline)))}</p>`:""}${p.images.map(src=>`<img class="press-figure" src="${asset(src)}" alt="${esc(pick(p.title))}" loading="lazy" decoding="async">`).join("")}${pick(p.body).map(x=>`<p>${esc(stampOnly(x)?yearOnly(x):x)}</p>`).join("")}${p.source?`<p class="link-row"><a class="text-link" href="${p.source}" target="_blank" rel="noopener noreferrer">${labels.source}</a></p>`:""}`;
    dialog.showModal();
  });
  bindDialog(dialog);
}

if(page==="contact"){
  const form=document.querySelector("form"),file=document.querySelector("#attachment"),fileLabel=document.querySelector(".file-label");
  file.addEventListener("change",()=>{fileLabel.textContent=file.files[0]?.name||fileLabel.textContent});
  form.querySelectorAll(".consent-toggle").forEach(consentToggle=>{const consentDetail=form.querySelector("#"+consentToggle.getAttribute("aria-controls"));
  consentToggle.addEventListener("click",()=>{const open=consentToggle.getAttribute("aria-expanded")==="true";consentToggle.setAttribute("aria-expanded",String(!open));if(open){consentDetail.classList.remove("is-open");consentDetail.addEventListener("transitionend",()=>{if(!consentDetail.classList.contains("is-open"))consentDetail.hidden=true},{once:true})}else{consentDetail.hidden=false;requestAnimationFrame(()=>requestAnimationFrame(()=>consentDetail.classList.add("is-open")))}})});
  form.addEventListener("submit",e=>{
    e.preventDefault();
    let valid=true;
    form.querySelectorAll("[required]").forEach(field=>{
      const key=field.name,helper=form.querySelector(`[data-error="${key}"]`);
      if(!helper)return;
      const ok=field.type==="radio"?[...form.querySelectorAll(`[name="${key}"]`)].some(x=>x.checked):field.type==="checkbox"?field.checked:field.validity.valid;
      field.setAttribute("aria-invalid",String(!ok));
      helper.textContent=ok?"":lang==="ko"?"필수 항목을 확인해 주세요.":"Please complete this required field.";
      helper.classList.toggle("error",!ok);
      valid&&=ok;
    });
    if(valid){form.querySelector(".form-status").textContent=lang==="ko"?"입력 내용을 확인했습니다.":"Your input has been checked."}
  });
}
})();
