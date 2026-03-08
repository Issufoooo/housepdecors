/* ====================================================
   House Prime Decors — app.js
   Clean, mobile-first, all features working.
   ==================================================== */
'use strict';

const PHONE = '258866812508';
const WA_MSG = encodeURIComponent('Olá! Quero pedir um orçamento com a House Prime Decors.');
const WA_URL = 'https://wa.me/' + PHONE + '?text=' + WA_MSG;

/* ── Helpers ── */
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => [...(el || document).querySelectorAll(s)];

/* ── WhatsApp links ── */
$$('.js-wa').forEach(el => {
  el.href = WA_URL;
  el.target = '_blank';
  el.rel = 'noopener noreferrer';
});

/* ── Header scroll ── */
(function () {
  var header = $('#header');
  if (!header) return;
  var ticking = false;
  function check() {
    header.classList.toggle('solid', window.scrollY > 50);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(check); ticking = true; }
  }, { passive: true });
  check();
})();

/* ── Mobile menu ── */
(function () {
  var btn = $('#menuBtn');
  var menu = $('#mmenu');
  var closeBtn = $('#mmenuClose');
  if (!btn || !menu) return;

  function open() {
    menu.classList.add('open');
    menu.removeAttribute('aria-hidden');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', open);
  closeBtn && closeBtn.addEventListener('click', close);
  $$('[data-close]', menu).forEach(function (a) { a.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();

/* ── Hero slider ── */
(function () {
  var slides = $$('.hero-slide');
  var dots = $$('.hero-dot');
  var captionEl = $('#heroCaption');
  var captions = [
    'Cozinha americana · Maputo',
    'Cozinha bege & madeira',
    'Sala com teto LED · Maputo',
    'Painel TV iluminado · Maputo'
  ];
  if (!slides.length) return;
  var cur = 0, timer;

  function go(i) {
    slides[cur].classList.remove('active');
    dots[cur] && dots[cur].classList.remove('active');
    cur = (i + slides.length) % slides.length;
    slides[cur].classList.add('active');
    dots[cur] && dots[cur].classList.add('active');
    if (captionEl) captionEl.textContent = captions[cur] || '';
  }

  function reset() {
    clearInterval(timer);
    timer = setInterval(function () { go(cur + 1); }, 5500);
  }

  dots.forEach(function (d, i) {
    d.addEventListener('click', function () { go(i); reset(); });
  });

  var prev = $('#heroPrev');
  var next = $('#heroNext');
  if (prev) prev.addEventListener('click', function () { go(cur - 1); reset(); });
  if (next) next.addEventListener('click', function () { go(cur + 1); reset(); });

  /* touch swipe */
  var sx = 0;
  var heroEl = $('.hero');
  if (heroEl) {
    heroEl.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    heroEl.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) { go(dx < 0 ? cur + 1 : cur - 1); reset(); }
    }, { passive: true });
  }

  go(0);
  reset();
})();

/* ── Count-up ── */
(function () {
  var els = $$('[data-count]');
  if (!els.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      var el = en.target;
      var end = parseInt(el.dataset.count, 10);
      var sfx = el.dataset.suffix || '+';
      var dur = 1400;
      var t0 = performance.now();
      function tick(now) {
        var p = Math.min((now - t0) / dur, 1);
        var v = Math.round(end * (1 - Math.pow(1 - p, 3)));
        el.textContent = v + (p >= 1 ? sfx : '');
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  els.forEach(function (el) { io.observe(el); });
})();

/* ── Gallery filter ── */
(function () {
  var chips = $$('.chip[data-filter]');
  var items = $$('.gitem[data-cat]');
  if (!chips.length || !items.length) return;

  function apply(f) {
    chips.forEach(function (c) { c.classList.toggle('on', c.dataset.filter === f); });
    items.forEach(function (it) {
      var cats = it.dataset.cat.split(' ');
      var show = f === 'all' || cats.indexOf(f) > -1;
      it.style.display = show ? '' : 'none';
    });
  }

  chips.forEach(function (c) { c.addEventListener('click', function () { apply(c.dataset.filter); }); });
  apply('all');
})();

/* ── Lightbox ── */
(function () {
  var lb = $('#lb');
  if (!lb) return;

  var lbImg     = $('#lbImg');
  var lbTitle   = $('#lbTitle');
  var lbCounter = $('#lbCounter');
  var closeBtn  = $('#lbClose');
  var prevBtn   = $('#lbPrev');
  var nextBtn   = $('#lbNext');

  /* Collect all clickable gallery items on the page */
  var items = $$('.gitem[data-img]');
  var cur = 0;

  function visible() {
    return items.filter(function (it) { return it.style.display !== 'none'; });
  }

  function open(idx) {
    cur = idx;
    render();
    lb.classList.add('open');
    lb.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function move(dir) {
    var vis = visible();
    var pos = vis.indexOf(items[cur]);
    cur = items.indexOf(vis[(pos + dir + vis.length) % vis.length]);
    render();
  }

  function render() {
    var it = items[cur];
    if (!it) return;
    if (lbImg) {
      lbImg.src = it.dataset.img;
      lbImg.alt = it.dataset.title || '';
    }
    if (lbTitle) lbTitle.textContent = it.dataset.title || '';
    var vis = visible();
    var pos = vis.indexOf(it) + 1;
    if (lbCounter) lbCounter.textContent = pos + ' / ' + vis.length;
  }

  items.forEach(function (it, i) {
    it.addEventListener('click', function () { open(i); });
  });

  if (closeBtn) closeBtn.addEventListener('click', close);
  if (prevBtn)  prevBtn.addEventListener('click', function () { move(-1); });
  if (nextBtn)  nextBtn.addEventListener('click', function () { move(1); });

  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });

  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  move(-1);
    if (e.key === 'ArrowRight') move(1);
  });

  /* Swipe in lightbox */
  var sx = 0;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) move(dx < 0 ? 1 : -1);
  }, { passive: true });
})();

/* ── Before/After slider ── */
(function () {
  $$('[data-ba]').forEach(function (wrap) {
    var after  = wrap.querySelector('.ba-after');
    var line   = wrap.querySelector('.ba-line');
    var handle = wrap.querySelector('.ba-handle');
    if (!after) return;

    var pct = 0.5;
    var dragging = false;

    function getRect() { return wrap.getBoundingClientRect(); }
    function clamp(v) { return Math.max(0.04, Math.min(0.96, v)); }
    function set(x) {
      var r = getRect();
      pct = clamp((x - r.left) / r.width);
      var p = pct * 100;
      after.style.clipPath = 'inset(0 0 0 ' + p + '%)';
      if (line)   line.style.left   = p + '%';
      if (handle) handle.style.left = p + '%';
    }

    /* Mouse */
    wrap.addEventListener('mousedown', function (e) { dragging = true; set(e.clientX); e.preventDefault(); });
    document.addEventListener('mousemove', function (e) { if (dragging) set(e.clientX); });
    document.addEventListener('mouseup',   function ()  { dragging = false; });

    /* Touch */
    wrap.addEventListener('touchstart', function (e) { set(e.touches[0].clientX); }, { passive: true });
    wrap.addEventListener('touchmove',  function (e) { set(e.touches[0].clientX); e.preventDefault(); }, { passive: false });

    set(wrap.getBoundingClientRect().left + wrap.offsetWidth * 0.5);
  });
})();

/* ── Contact form → WhatsApp ── */
(function () {
  var form = $('#contactForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = Object.fromEntries(new FormData(form));
    var msg = 'Olá! Pedido de orçamento:\n\nNome: ' + (d.name || '') +
              '\nTelefone: ' + (d.phone || '') +
              '\nTipo de projeto: ' + (d.type || '') +
              '\nMensagem: ' + (d.message || '');
    window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });
})();

/* ── Scroll reveal ── */
(function () {
  var els = $$('.reveal');
  if (!els.length) return;

  /* stagger siblings */
  var seen = new Map();
  els.forEach(function (el) {
    var p = el.parentElement;
    var i = seen.has(p) ? seen.get(p) : 0;
    el.style.transitionDelay = (i * 70) + 'ms';
    seen.set(p, i + 1);
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      setTimeout(function () { en.target.style.transitionDelay = ''; }, 800);
      io.unobserve(en.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  els.forEach(function (el) { io.observe(el); });
})();
