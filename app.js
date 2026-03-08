/* ============================================================
   House Prime Decors — app.js
   ============================================================ */
'use strict';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ── WhatsApp ── */
const PHONE = '258866812508';
const WA_MSG = encodeURIComponent('Olá! Gostaria de pedir um orçamento com a House Prime Decors.');
const WA_URL = `https://wa.me/${PHONE}?text=${WA_MSG}`;
$$('.js-wa').forEach(el => { el.href = WA_URL; el.target = '_blank'; el.rel = 'noopener' });

/* ── Header scroll ── */
(function () {
  const hdr = $('.site-header');
  if (!hdr) return;
  const hero = $('.hero');
  let ticking = false;

  const update = () => {
    const past = window.scrollY > 20;
    hdr.classList.toggle('scrolled', past);
    if (hero) hdr.classList.toggle('on-hero', !past);
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
  update();
})();

/* ── Mobile menu ── */
(function () {
  const btn  = $('#menuBtn');
  const menu = $('#mobileMenu');
  if (!btn || !menu) return;

  const open  = () => { menu.classList.add('open'); btn.classList.add('open'); document.body.style.overflow = 'hidden'; btn.setAttribute('aria-expanded', 'true'); };
  const close = () => { menu.classList.remove('open'); btn.classList.remove('open'); document.body.style.overflow = ''; btn.setAttribute('aria-expanded', 'false'); };

  btn.addEventListener('click', () => menu.classList.contains('open') ? close() : open());
  $$('a[data-close]', menu).forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

/* ── Hero slider ── */
(function () {
  const slides = $$('.hero-slide');
  const dots   = $$('.hero-dot');
  if (!slides.length) return;

  let cur = 0, timer;

  const go = i => {
    slides[cur].classList.remove('active');
    dots[cur]?.classList.remove('active');
    cur = (i + slides.length) % slides.length;
    slides[cur].classList.add('active');
    dots[cur]?.classList.add('active');
  };

  const start = () => { timer = setInterval(() => go(cur + 1), 5500); };
  const reset = () => { clearInterval(timer); start(); };

  dots.forEach((d, i) => d.addEventListener('click', () => { go(i); reset(); }));

  const prev = $('#heroPrev'), next = $('#heroNext');
  prev?.addEventListener('click', () => { go(cur - 1); reset(); });
  next?.addEventListener('click', () => { go(cur + 1); reset(); });

  slides[0].classList.add('active');
  dots[0]?.classList.add('active');
  start();
})();

/* ── Reveal (IntersectionObserver) ── */
(function () {
  const els = $$('.reveal');
  if (!els.length) return;

  // stagger siblings
  const seen = new Map();
  els.forEach(el => {
    const p = el.parentElement;
    const n = seen.get(p) || 0;
    el.style.transitionDelay = `${n * 75}ms`;
    seen.set(p, n + 1);
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      io.unobserve(en.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

  els.forEach(el => io.observe(el));
})();

/* ── Count-up ── */
(function () {
  const els = $$('[data-count]');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const el  = en.target;
      const end = +el.dataset.count;
      const suf = el.dataset.suffix || (end === 100 ? '%' : '+');
      const dur = 1400;
      const t0  = performance.now();
      const tick = now => {
        const p   = Math.min((now - t0) / dur, 1);
        const val = Math.round(end * (1 - Math.pow(1 - p, 3)));
        el.textContent = val + (p < 1 ? '' : suf);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  els.forEach(el => io.observe(el));
})();

/* ── Gallery filters ── */
(function () {
  const btns  = $$('.filter-btn');
  const items = $$('.gallery-item');
  if (!btns.length || !items.length) return;

  const apply = f => {
    btns.forEach(b => b.classList.toggle('active', b.dataset.filter === f));
    items.forEach(it => {
      const cats = (it.dataset.cat || '').split(' ');
      it.hidden = !(f === 'all' || cats.includes(f));
    });
  };

  btns.forEach(b => b.addEventListener('click', () => apply(b.dataset.filter)));
  apply('all');
})();

/* ── Lightbox ── */
(function () {
  const lb      = $('#lightbox');
  const lbImg   = $('#lbImage');
  const lbTitle = $('#lbTitle');
  const lbCount = $('#lbCount');
  const lbDesc  = $('#lbDesc');
  if (!lb || !lbImg) return;

  const items = $$('.gallery-item[data-img]');
  if (!items.length) return;

  let cur = 0;

  const visible = () => items.filter(it => !it.hidden);

  const render = () => {
    const arr = visible();
    const it  = arr[cur];
    if (!it) return;

    if (lbTitle) lbTitle.textContent = it.dataset.title || '';
    if (lbCount) lbCount.textContent = (cur + 1) + ' / ' + arr.length;
    if (lbDesc)  lbDesc.textContent  = it.dataset.desc  || '';

    // Use real <img> tag
    lbImg.innerHTML = '';
    const img = document.createElement('img');
    img.alt = it.dataset.title || '';
    img.classList.add('loading');
    img.onload  = () => img.classList.remove('loading');
    img.onerror = () => img.classList.remove('loading');
    img.src = it.dataset.img;
    lbImg.appendChild(img);
  };

  const open = i => {
    cur = i;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    render();
  };
  const close = () => {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  const move = dir => {
    const arr = visible();
    cur = (cur + dir + arr.length) % arr.length;
    render();
  };

  // open from gallery
  items.forEach((it, i) => {
    it.addEventListener('click', () => {
      const arr = visible();
      const visIdx = arr.indexOf(it);
      open(visIdx >= 0 ? visIdx : 0);
    });
    it.setAttribute('role', 'button');
    it.setAttribute('tabindex', '0');
    it.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') it.click(); });
  });

  $('#lbClose')?.addEventListener('click', close);
  $('#lbPrev')?.addEventListener('click', () => move(-1));
  $('#lbNext')?.addEventListener('click', () => move(1));
  lb.addEventListener('click', e => { if (e.target === lb || e.target === lbImg) close(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  move(-1);
    if (e.key === 'ArrowRight') move(1);
  });

  // Swipe
  let sx = 0;
  const stage = $('#lbStage');
  stage?.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  stage?.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 48) move(dx < 0 ? 1 : -1);
  }, { passive: true });
})();

/* ── Before/After slider ── */
(function () {
  $$('[data-ba]').forEach(wrap => {
    const stage = $('.ba-stage', wrap);
    if (!stage) return;
    const after  = $('.ba-after', stage);
    const handle = $('.ba-handle', stage);
    let p = .5, on = false;
    const pct = x => Math.max(.03, Math.min(.97, (x - stage.getBoundingClientRect().left) / stage.offsetWidth));
    const set = v => { p = v; after.style.clipPath = `inset(0 0 0 ${p*100}%)`; handle.style.left = `${p*100}%`; };
    stage.addEventListener('mousedown',  e => { on = true; set(pct(e.clientX)); e.preventDefault(); });
    window.addEventListener('mousemove', e => { if (on) set(pct(e.clientX)); });
    window.addEventListener('mouseup',   () => { on = false; });
    stage.addEventListener('touchstart', e => set(pct(e.touches[0].clientX)), { passive: true });
    stage.addEventListener('touchmove',  e => { set(pct(e.touches[0].clientX)); e.preventDefault(); }, { passive: false });
    set(.5);
  });
})();

/* ── Contact form → WhatsApp ── */
(function () {
  const form = $('#contactForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const msg = `Olá! Quero pedir um orçamento.\n\nNome: ${d.name||''}\nTelefone: ${d.phone||''}\nServiço: ${d.service||''}\nMensagem: ${d.message||''}`;
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });
})();
