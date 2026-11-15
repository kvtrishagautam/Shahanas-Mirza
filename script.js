(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;

  /* ---------- Split names into letters ---------- */
  document.querySelectorAll('[data-split]').forEach((el, idx) => {
    const text = el.textContent;
    const intro = el.classList.contains('i-name');
    const base = intro ? 0.7 + (idx % 2) * 0.9 : 0.3 + (idx % 2) * 0.8;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.setAttribute('aria-hidden', 'true');
      s.textContent = ch === ' ' ? '\u00A0' : ch;
      s.style.animationDelay = (base + i * 0.08) + 's';
      el.appendChild(s);
    });
  });

  /* ---------- Intro: tap the invitation to open ---------- */
  const intro = document.getElementById('intro');
  let finished = false;
  function finishIntro() {
    if (finished || !intro) return;
    finished = true;
    intro.classList.add('opening');
    setTimeout(() => {
      intro.classList.add('gone');
      document.body.classList.remove('locked');
      window.scrollTo(0, 0);
      petalBurst();
      setTimeout(() => intro.remove(), 1200);
    }, reduce ? 0 : 1200);
  }
  const openBtn = document.getElementById('open-card');
  const envCard = document.getElementById('royal-envelope');
  const tapBtn = document.getElementById('intro-tap-btn');
  if (openBtn) openBtn.addEventListener('click', finishIntro);
  if (envCard) {
    envCard.addEventListener('click', finishIntro);
    envCard.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); finishIntro(); }
    });
  }
  if (tapBtn) tapBtn.addEventListener('click', finishIntro);

  /* ---------- Scroll reveal ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- Scroll-driven effects (one rAF-throttled handler) ---------- */
  const track = document.getElementById('curtain-track');
  const stage = track.querySelector('.curtain-stage');
  const bar = document.getElementById('progress');
  const heroBg = document.querySelector('.hero-bg');
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    // reading progress
    const total = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (total > 0 ? Math.min(1, y / total) : 0).toFixed(4) + ')';
    // hero parallax
    if (!reduce && y < innerHeight * 1.2) heroBg.style.transform = 'translate3d(0,' + (y * 0.25).toFixed(1) + 'px,0)';
    // curtains
    const r = track.getBoundingClientRect();
    const span = track.offsetHeight - innerHeight;
    const p = Math.min(1, Math.max(0, -r.top / span));
    stage.style.setProperty('--p', Math.min(1, p / 0.7).toFixed(4));
    ticking = false;
  }
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Countdown ---------- */
  const target = new Date(2026, 11, 26, 0, 0, 0).getTime();
  const ids = ['d', 'h', 'm', 's'].map(k => document.getElementById('cd-' + k));
  const prev = [];
  function tickCountdown() {
    const diff = Math.max(0, target - Date.now());
    const vals = [
      Math.floor(diff / 864e5),
      Math.floor(diff / 36e5) % 24,
      Math.floor(diff / 6e4) % 60,
      Math.floor(diff / 1e3) % 60
    ];
    vals.forEach((v, i) => {
      const txt = String(v).padStart(2, '0');
      if (prev[i] !== txt) {
        ids[i].textContent = txt;
        ids[i].classList.remove('tick'); void ids[i].offsetWidth; ids[i].classList.add('tick');
        prev[i] = txt;
      }
    });
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ---------- Add to calendar (.ics, all-day) ---------- */
  document.getElementById('ics-btn').addEventListener('click', () => {
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wedding Invitation//EN',
      'BEGIN:VEVENT',
      'UID:shahanas-mirza-20261226@wedding',
      'DTSTAMP:20260101T000000Z',
      'DTSTART;VALUE=DATE:20261226',
      'DTEND;VALUE=DATE:20261227',
      'SUMMARY:Wedding of Shahanas & Mirza',
      'LOCATION:RV Palace\\, CV Jn.\\, Ponnani',
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'wedding-invitation.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  /* ---------- Invitation card modal ---------- */
  const modal = document.getElementById('modal');
  const openModal = () => { modal.hidden = false; };
  const closeModal = () => { modal.hidden = true; };
  document.getElementById('card-btn').addEventListener('click', openModal);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ---------- Organic Falling Rose Petals ---------- */
  const cv = document.getElementById('petals');
  const ctx = cv.getContext('2d');
  let W = innerWidth, H = innerHeight, DPR = 1;

  function size() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth;
    H = innerHeight;
    cv.width = W * DPR;
    cv.height = H * DPR;
  }
  size();
  addEventListener('resize', size);

  const PETAL_THEMES = [
    { base: '#c41d33', light: '#f44358', dark: '#680512' }, // Crimson Rose
    { base: '#a80c22', light: '#d82845', dark: '#48030b' }, // Velvet Burgundy
    { base: '#d82b4a', light: '#ff5c7c', dark: '#800e21' }, // Romantic Ruby
    { base: '#e64e72', light: '#ff85a0', dark: '#9b1b38' }  // Soft Rose Blush
  ];

  const count = innerWidth < 720 ? 26 : 42;
  const petals = [];

  function makePetal(burst) {
    const theme = PETAL_THEMES[Math.floor(Math.random() * PETAL_THEMES.length)];
    const sz = 12 + Math.random() * 12; // 12px to 24px natural petal size
    return {
      x: burst ? W / 2 + (Math.random() - 0.5) * 120 : Math.random() * W,
      y: burst ? H / 2 + (Math.random() - 0.5) * 120 : Math.random() * H,
      sz: sz,
      aspect: 1.25 + Math.random() * 0.35,
      vx: burst ? (Math.random() - 0.5) * 11 : (Math.random() - 0.5) * 0.5,
      vy: burst ? (Math.random() - 0.85) * 10 : 0.8 + Math.random() * 0.95,
      sw: Math.random() * 6.28,
      swSpeed: 0.015 + Math.random() * 0.02,
      rot: Math.random() * 6.28,
      vRot: (Math.random() - 0.5) * 0.025,
      flip: Math.random() * 6.28,
      vFlip: 0.018 + Math.random() * 0.025,
      alpha: 0.65 + Math.random() * 0.32,
      theme: theme,
      life: burst ? 1 : -1
    };
  }

  for (let i = 0; i < count; i++) petals.push(makePetal(false));

  function petalBurst() {
    for (let i = 0; i < 50; i++) petals.push(makePetal(true));
  }

  function drawPetalShape(p) {
    const flipScale = Math.sin(p.flip);
    if (Math.abs(flipScale) < 0.05) return;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(flipScale, 1);

    const w = p.sz;
    const h = p.sz * p.aspect;

    // Organic curved rose petal shape
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.52);
    // Right curved petal lobe
    ctx.bezierCurveTo(w * 0.88, -h * 0.42, w * 1.05, h * 0.32, 0, h * 0.52);
    // Left curved petal lobe
    ctx.bezierCurveTo(-w * 1.05, h * 0.32, -w * 0.88, -h * 0.42, 0, -h * 0.52);
    ctx.closePath();

    const al = p.life > 0 ? p.alpha * p.life : p.alpha;
    ctx.globalAlpha = Math.max(0, Math.min(1, al));

    // Rich velvety petal gradient
    const grad = ctx.createLinearGradient(-w * 0.5, -h * 0.5, w * 0.5, h * 0.5);
    grad.addColorStop(0, p.theme.light);
    grad.addColorStop(0.55, p.theme.base);
    grad.addColorStop(1, p.theme.dark);
    ctx.fillStyle = grad;
    ctx.fill();

    // Delicate rose petal edge highlight
    ctx.strokeStyle = 'rgba(255, 235, 240, 0.35)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.restore();
  }

  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.scale(DPR, DPR);

    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      p.sw += p.swSpeed;
      p.rot += p.vRot;
      p.flip += p.vFlip;
      p.x += p.vx + Math.sin(p.sw) * 0.8;
      p.y += p.vy;

      if (p.life > 0) {
        p.vy += 0.08;
        p.vx *= 0.985;
        p.life -= 0.009;
        if (p.life <= 0) { petals.splice(i, 1); continue; }
      } else if (p.y > H + 30) {
        p.y = -30;
        p.x = Math.random() * W;
      }

      drawPetalShape(p);
    }
    requestAnimationFrame(draw);
  }
  draw();
})();
