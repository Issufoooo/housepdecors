/* =========================================================
   House Prime Decors — interações cinematográficas
   Passive listeners · RAF cursor · Intersection counters
   ========================================================= */

const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));

const PHONE   = "+258866812508";
const WA_LINK = `https://wa.me/${PHONE.replace(/\D/g,"")}?text=${encodeURIComponent("Olá! Quero pedir um orçamento com a House Prime Decors.")}`;

/* ── WhatsApp ── */
(function wireWA() {
  $$(".js-wa").forEach(b => { b.href = WA_LINK; b.target = "_blank"; b.rel = "noopener noreferrer"; });
})();

/* ── Header scroll ── */
(function headerScroll() {
  const h = $(".header");
  if (!h) return;
  let ticking = false;
  const fn = () => {
    if (!ticking) {
      requestAnimationFrame(() => { h.classList.toggle("scrolled", window.scrollY > 50); ticking = false; });
      ticking = true;
    }
  };
  window.addEventListener("scroll", fn, { passive: true });
  fn();
})();

/* ── Menu mobile ── */
(function mobileMenu() {
  const btn = $("#menuBtn"), panel = $("#mmenu");
  if (!btn || !panel) return;
  const open  = () => { panel.classList.add("open");    panel.setAttribute("aria-hidden","false"); btn.setAttribute("aria-expanded","true");  document.body.style.overflow = "hidden"; };
  const close = () => { panel.classList.remove("open"); panel.setAttribute("aria-hidden","true");  btn.setAttribute("aria-expanded","false"); document.body.style.overflow = ""; };
  btn.addEventListener("click", open);
  $("#menuClose")?.addEventListener("click", close);
  $$(".mmenu a[data-close]").forEach(a => a.addEventListener("click", close));
  panel.addEventListener("click", e => { if (e.target === panel) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
})();

/* ── Scroll reveal com stagger ── */
(function reveal() {
  const items = $$(".reveal");
  if (!items.length) return;
  const seen = new Set();
  items.forEach(el => {
    const p = el.parentElement;
    if (!seen.has(p)) {
      seen.add(p);
      $$(".reveal", p).forEach((sib, i) => { sib.style.transitionDelay = `${i * 80}ms`; });
    }
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      en.target.addEventListener("transitionend", () => { en.target.style.transitionDelay = ""; }, { once: true });
      io.unobserve(en.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -36px 0px" });
  items.forEach(el => io.observe(el));
})();

/* ── Slider hero ── */
(function heroSlider() {
  const slider = $("#heroSlider");
  if (!slider) return;
  const track  = $(".slide-track", slider);
  const slides = $$(".slide", slider);
  const dots   = $$(".dot", slider);
  const total  = slides.length;
  let idx = 0, timer = null;

  const go = (i, user = false) => {
    idx = (i + total) % total;
    track.style.transform = `translateX(${-idx * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle("active", di === idx));
    if (user) reset();
  };
  const reset = () => { clearInterval(timer); timer = setInterval(() => go(idx + 1), 5600); };

  dots.forEach((d, i) => d.addEventListener("click", () => go(i, true)));
  $("#heroPrev")?.addEventListener("click", () => go(idx - 1, true));
  $("#heroNext")?.addEventListener("click", () => go(idx + 1, true));

  let sx = 0, sy = 0, dx = 0, on = false;
  slider.addEventListener("touchstart",  e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; dx = 0; on = true; }, { passive: true });
  slider.addEventListener("touchmove",   e => { if (!on) return; dx = e.touches[0].clientX - sx; if (Math.abs(e.touches[0].clientY - sy) > Math.abs(dx) + 4) on = false; }, { passive: true });
  slider.addEventListener("touchend",    () => { if (on && Math.abs(dx) > 44) go(idx + (dx < 0 ? 1 : -1), true); on = false; }, { passive: true });

  let mx = 0, mOn = false;
  slider.addEventListener("mousedown",  e => { mx = e.clientX; mOn = true; });
  slider.addEventListener("mouseup",    e => { if (mOn && Math.abs(e.clientX - mx) > 40) go(idx + (e.clientX - mx < 0 ? 1 : -1), true); mOn = false; });
  slider.addEventListener("mouseleave", () => { mOn = false; });

  go(0); reset();
})();

/* ── Contadores animados ── */
(function counters() {
  const els = $$(".count[data-to]");
  if (!els.length) return;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const DURATION = 1800;
  const animate = el => {
    const target = parseInt(el.dataset.to, 10), start = performance.now();
    const step = now => {
      const t = Math.min((now - start) / DURATION, 1);
      el.textContent = Math.round(easeOut(t) * target);
      if (t < 1) requestAnimationFrame(step); else el.textContent = target;
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { animate(en.target); io.unobserve(en.target); } });
  }, { threshold: 0.3 });
  els.forEach(el => io.observe(el));
})();

/* ── Galeria — filtro + lightbox ── */
(function gallery() {
  const chips = $$(".chip[data-filter]");
  const tiles = $$(".tile[data-cat]");
  const lb    = $("#lightbox");
  if (!tiles.length || !lb) return;

  const lbTitle = $("#lbTitle"), lbNote = $("#lbNote"), lbBody = $("#lbBody");
  const items = tiles.map(t => ({ el: t, title: t.dataset.title || "Projeto", cat: (t.dataset.cat || "all").split(" "), note: t.dataset.note || "", img: t.dataset.img || "" }));
  let current = 0;

  const visible = () => items.map((it,i) => ({it,i})).filter(x => x.it.el.style.display !== "none").map(x => x.i);
  const render = () => {
    const it  = items[current];
    const vis = visible();
    const pos = vis.indexOf(current) + 1;
    if (lbTitle) lbTitle.textContent = it.title + "  ·  " + pos + "/" + vis.length;
    if (lbNote)  lbNote.textContent  = it.note;
    lbBody.style.backgroundImage    = it.img ? "url('" + it.img + "')" : "";
    lbBody.style.backgroundSize     = it.img ? "cover"  : "";
    lbBody.style.backgroundPosition = it.img ? "center" : "";
    lbBody.classList.toggle("has-img", !!it.img);
  };
  const openLB = i => { current = i; lb.classList.add("open"); lb.setAttribute("aria-hidden","false"); render(); document.body.style.overflow = "hidden"; };
  const closeLB = () => { lb.classList.remove("open"); lb.setAttribute("aria-hidden","true"); document.body.style.overflow = ""; };
  const move = dir => { const arr = visible(); current = arr[(arr.indexOf(current) + dir + arr.length) % arr.length]; render(); };

  const applyFilter = f => {
    chips.forEach(c => c.classList.toggle("active", c.dataset.filter === f));
    items.forEach(it => { it.el.style.display = (f === "all" || it.cat.includes(f)) ? "" : "none"; });
  };
  chips.forEach(c => c.addEventListener("click", () => applyFilter(c.dataset.filter)));
  applyFilter("all");

  tiles.forEach((t, i) => t.addEventListener("click", () => openLB(i)));
  $("#lbPrev")?.addEventListener("click", () => move(-1));
  $("#lbNext")?.addEventListener("click", () => move(1));
  $("#lbClose")?.addEventListener("click", closeLB);
  lb.addEventListener("click", e => { if (e.target === lb) closeLB(); });
  document.addEventListener("keydown", e => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLB();
    if (e.key === "ArrowLeft") move(-1);
    if (e.key === "ArrowRight") move(1);
  });

  let sx = 0, dd = 0, on = false;
  lbBody?.addEventListener("touchstart",  e => { sx = e.touches[0].clientX; dd = 0; on = true; }, { passive: true });
  lbBody?.addEventListener("touchmove",   e => { if (on) dd = e.touches[0].clientX - sx; }, { passive: true });
  lbBody?.addEventListener("touchend",    () => { if (on && Math.abs(dd) > 44) move(dd < 0 ? 1 : -1); on = false; }, { passive: true });
})();

/* ── Antes / Depois ── */
(function beforeAfter() {
  $$(".ba[data-ba]").forEach(wrap => {
    const stage  = $(".ba-stage",  wrap);
    const after  = $(".ba-after",  wrap);
    const handle = $(".ba-handle", wrap);
    let p = .5, dragging = false;

    const set = ratio => {
      p = Math.max(.03, Math.min(.97, ratio));
      after.style.clipPath = `inset(0 0 0 ${p * 100}%)`;
      handle.style.left    = `${p * 100}%`;
    };
    const ratio = x => (x - stage.getBoundingClientRect().left) / stage.offsetWidth;

    stage.addEventListener("mousedown",  e => { dragging = true; set(ratio(e.clientX)); });
    window.addEventListener("mousemove", e => { if (dragging) set(ratio(e.clientX)); });
    window.addEventListener("mouseup",   () => { dragging = false; });

    stage.addEventListener("touchstart",  e => set(ratio(e.touches[0].clientX)), { passive: true });
    stage.addEventListener("touchmove",   e => { e.preventDefault(); set(ratio(e.touches[0].clientX)); }, { passive: false });
    set(.5);
  });
})();

/* ── Formulário ── */
(function contactForm() {
  const form = $("#contactForm");
  if (!form) return;
  form.addEventListener("submit", e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form).entries());
    const msg = `Olá! Quero um orçamento.\n\nNome: ${d.name||""}\nTelefone: ${d.phone||""}\nTipo: ${d.type||""}\nMensagem: ${d.message||""}`;
    window.open(`https://wa.me/${PHONE.replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  });
})();

/* ── Cursor — só desktop com mouse fino ── */
(function cursor() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const dot  = Object.assign(document.createElement("div"), { className: "hp-cursor" });
  const ring = Object.assign(document.createElement("div"), { className: "hp-cursor-ring" });
  document.body.append(dot, ring);

  let cx = -200, cy = -200, rx = -200, ry = -200;
  document.addEventListener("mousemove", e => { cx = e.clientX; cy = e.clientY; }, { passive: true });

  (function loop() {
    dot.style.left  = cx + "px";
    dot.style.top   = cy + "px";
    rx += (cx - rx) * .16;
    ry += (cy - ry) * .16;
    ring.style.left = rx + "px";
    ring.style.top  = ry + "px";
    requestAnimationFrame(loop);
  })();

  document.addEventListener("mouseleave", () => ring.classList.add("hidden"),    { passive: true });
  document.addEventListener("mouseenter", () => ring.classList.remove("hidden"), { passive: true });

  const targets = "a, button, .tile, .card, .chip, .step, .ba-stage, .dot";
  document.addEventListener("mouseover", e => {
    if (!e.target.closest(targets)) return;
    dot.classList.add("expanded");
    Object.assign(ring.style, { width: "52px", height: "52px", opacity: ".18" });
  }, { passive: true });
  document.addEventListener("mouseout", e => {
    if (!e.target.closest(targets)) return;
    dot.classList.remove("expanded");
    Object.assign(ring.style, { width: "32px", height: "32px", opacity: ".4" });
  }, { passive: true });
})();
