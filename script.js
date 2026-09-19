/* =================================================================
   THE SACRED GARDEN — LUXURY WEDDING INVITATION
   Cinematic Opening + Full Interactivity + Mobile Support
   ================================================================= */

(() => {
  'use strict';

  /* ────────────────────────────────────────────────────────────────
     1. CINEMATIC OPENING & STAGE MANAGER
  ──────────────────────────────────────────────────────────────── */
  const cinematicEl   = document.getElementById('cinematicOpening');
  const mainContentEl = document.getElementById('mainContent');
  const stage1El      = document.getElementById('stage1');
  const stage2El      = document.getElementById('stage2');
  const stage3El      = document.getElementById('stage3');
  const waxBtn        = document.getElementById('waxBtn');
  const tapHint       = document.getElementById('tapHint');
  const enterBtn      = document.getElementById('enterMainBtn');
  const openCanvas    = document.getElementById('openingCanvas');
  const openCtx       = openCanvas ? openCanvas.getContext('2d') : null;

  let openingParticles = [];
  let openingAnimId;

  // Resize opening canvas
  function resizeOpenCanvas() {
    if (!openCanvas) return;
    openCanvas.width  = window.innerWidth;
    openCanvas.height = window.innerHeight;
  }
  if (openCanvas) {
    resizeOpenCanvas();
    window.addEventListener('resize', resizeOpenCanvas);
  }

  // Particle engine for opening intro
  class OpenParticle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x      = Math.random() * openCanvas.width;
      this.y      = initial ? Math.random() * openCanvas.height : openCanvas.height + 10;
      this.size   = Math.random() * 2.5 + 0.5;
      this.speedY = -(Math.random() * 0.6 + 0.2);
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.alpha  = Math.random() * 0.8 + 0.2;
      this.wobble = Math.random() * Math.PI * 2;
      this.isPetal= Math.random() > 0.65;
      this.hue    = 45 + Math.random() * 15; // gold tones
    }
    update() {
      this.wobble += 0.02;
      this.x += this.speedX + Math.sin(this.wobble) * 0.3;
      this.y += this.speedY;
      if (this.y < -12) this.reset();
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha * 0.7;
      if (this.isPetal) {
        ctx.translate(this.x, this.y);
        ctx.rotate(this.wobble);
        ctx.fillStyle = `hsla(${this.hue}, 75%, 75%, 1)`;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 1.8, this.size * 3.5, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.shadowBlur = 8;
        ctx.shadowColor = `hsla(${this.hue}, 80%, 65%, 1)`;
        ctx.fillStyle = `hsla(${this.hue}, 80%, 80%, 1)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function initOpenParticles(count = 45) {
    if (!openCanvas) return;
    openingParticles = Array.from({ length: count }, () => new OpenParticle());
  }

  function renderOpenParticles() {
    if (!openCtx) return;
    openCtx.clearRect(0, 0, openCanvas.width, openCanvas.height);
    openingParticles.forEach(p => { p.update(); p.draw(openCtx); });
    openingAnimId = requestAnimationFrame(renderOpenParticles);
  }

  function showStage(n) {
    [stage1El, stage2El, stage3El].forEach((el, i) => {
      if (el) {
        if (i + 1 === n) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      }
    });
  }

  // ── Stage 1 → Main Invitation Transition (on click, tap, or swipe up) ──
  const stage1TapPrompt = document.getElementById('stage1TapPrompt');
  let touchStartY = 0;

  [cinematicEl, stage1El, stage1TapPrompt].forEach(el => {
    if (!el) return;
    el.addEventListener('click', revealMainContent);
    el.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });
    el.addEventListener('touchend', (e) => {
      const touchEndY = (e.changedTouches && e.changedTouches.length > 0) ? e.changedTouches[0].clientY : touchStartY;
      if (touchStartY - touchEndY > 25 || Math.abs(touchStartY - touchEndY) < 15) {
        revealMainContent();
      }
    });
  });

  // ── Wax Seal Break (Stage 2 → Stage 3) ──
  function breakWaxSeal(e) {
    e.stopPropagation();
    if (waxBtn && waxBtn.classList.contains('breaking')) return;

    playWaxBreak();
    if (waxBtn) waxBtn.classList.add('breaking');

    if (tapHint) {
      tapHint.style.opacity = '0';
      tapHint.style.transition = 'opacity 0.3s';
    }

    spawnSealExplosion(e);

    setTimeout(() => {
      showStage(3);
    }, 900);
  }

  if (waxBtn) {
    waxBtn.addEventListener('click', breakWaxSeal);
    waxBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      breakWaxSeal(e);
    });
  }

  function spawnSealExplosion(e) {
    if (!openCtx || !waxBtn) return;
    const rect   = waxBtn.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    const colors = ['#D4AF37','#F3E09A','#C0392B','#FFFFFF','#BF953F'];

    const tempParticles = [];
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 10 + 3;
      tempParticles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: Math.random() * 7 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1, life: 1,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
      });
    }

    let af;
    function animateExplosion() {
      tempParticles.forEach(p => {
        p.x    += p.vx;
        p.y    += p.vy;
        p.vy   += 0.28;
        p.vx   *= 0.96;
        p.life -= 0.025;
        p.alpha = Math.max(0, p.life);
        p.rotation += p.rotSpeed;

        openCtx.save();
        openCtx.globalAlpha = p.alpha;
        openCtx.translate(p.x, p.y);
        openCtx.rotate(p.rotation * Math.PI / 180);
        openCtx.fillStyle = p.color;
        openCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        openCtx.restore();
      });

      if (tempParticles.some(p => p.life > 0)) {
        af = requestAnimationFrame(animateExplosion);
      } else {
        cancelAnimationFrame(af);
      }
    }
    animateExplosion();
  }

  // ── Enter Garden Button ──
  if (enterBtn) {
    enterBtn.addEventListener('click', revealMainContent);
    enterBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      revealMainContent();
    });
  }

  let isRevealed = false;
  function revealMainContent() {
    if (isRevealed) return;
    isRevealed = true;

    try { playChime(); } catch (_) {}

    document.body.classList.remove('cinematic-active');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (cinematicEl) {
      cinematicEl.classList.add('fade-out');
    }

    if (mainContentEl) {
      mainContentEl.classList.remove('is-hidden');
      mainContentEl.style.transition = 'opacity 1s ease';
      mainContentEl.style.opacity = '1';
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (openingAnimId) {
      cancelAnimationFrame(openingAnimId);
    }

    initMainParticles();
    renderMainParticles();
    triggerScrollReveals();
    try { playBgMusic(); } catch (_) {}

    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (cinematicEl) {
        cinematicEl.style.display = 'none';
      }
    }, 1200);
  }

  window.revealMainContent = revealMainContent;

  /* ────────────────────────────────────────────────────────────────
     2. WEB AUDIO & SOUND EFFECTS
  ──────────────────────────────────────────────────────────────── */
  let audioCtx;

  function initAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }

  function playChime() {
    try {
      initAudio();
      if (!audioCtx) return;
      const t = audioCtx.currentTime;
      const freqs = [523.25, 659.25, 783.99];
      freqs.forEach((f, i) => {
        const osc  = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t + i * 0.12);
        gain.gain.setValueAtTime(0.12, t + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.6 + i * 0.12);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t + i * 0.12);
        osc.stop(t + 2 + i * 0.12);
      });
    } catch (_) {}
  }

  function playWaxBreak() {
    try {
      initAudio();
      if (!audioCtx) return;
      const t = audioCtx.currentTime;

      const bufLen = Math.floor(audioCtx.sampleRate * 0.12);
      const buf    = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
      const data   = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1);
      const noise = audioCtx.createBufferSource();
      noise.buffer = buf;
      const bpf = audioCtx.createBiquadFilter();
      bpf.type = 'bandpass'; bpf.frequency.value = 1400; bpf.Q.value = 2;
      const ng = audioCtx.createGain();
      ng.gain.setValueAtTime(0.5, t);
      ng.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      noise.connect(bpf); bpf.connect(ng); ng.connect(audioCtx.destination);
      noise.start(t);

      [349.23, 440.00, 523.25, 659.25].forEach((f, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.14, t + i * 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, t + 1.2 + i * 0.08);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(t + i * 0.04); o.stop(t + 1.6);
      });
    } catch (_) {}
  }

  /* ────────────────────────────────────────────────────────────────
     3. BACKGROUND FLOATING PARTICLES & CURSOR
  ──────────────────────────────────────────────────────────────── */
  const mainCanvas = document.getElementById('particleCanvas');
  const mCtx       = mainCanvas ? mainCanvas.getContext('2d') : null;
  let   mainParticles = [];

  let mouseX = window.innerWidth  / 2;
  let mouseY = window.innerHeight / 2;

  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  class MainParticle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x      = Math.random() * window.innerWidth;
      this.y      = initial ? Math.random() * window.innerHeight : window.innerHeight + 10;
      this.size   = Math.random() * 2.5 + 0.5;
      this.speedY = -(Math.random() * 0.7 + 0.15);
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.alpha  = Math.random() * 0.7 + 0.25;
      this.wobble = Math.random() * Math.PI * 2;
      this.isPetal= Math.random() > 0.7;
    }
    update() {
      this.wobble += 0.018;
      this.x += this.speedX + Math.sin(this.wobble) * 0.35;
      this.y += this.speedY;

      const dx = mouseX - this.x, dy = mouseY - this.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 90) {
        this.x -= (dx / d) * 1.2;
        this.y -= (dy / d) * 1.2;
      }

      if (this.y < -12 || this.x < -20 || this.x > window.innerWidth + 20) this.reset();
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha * 0.65;
      if (this.isPetal) {
        ctx.translate(this.x, this.y);
        ctx.rotate(this.wobble);
        ctx.fillStyle = '#E6C875';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 1.8, this.size * 3.5, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.shadowBlur  = 10;
        ctx.shadowColor = '#D4AF37';
        ctx.fillStyle   = '#F3E5AB';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function initMainParticles() {
    if (!mainCanvas) return;
    mainCanvas.width  = window.innerWidth;
    mainCanvas.height = window.innerHeight;
    mainParticles = Array.from({ length: 50 }, () => new MainParticle());
    window.addEventListener('resize', () => {
      mainCanvas.width  = window.innerWidth;
      mainCanvas.height = window.innerHeight;
    });
  }

  function renderMainParticles() {
    if (!mCtx) return;
    mCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    mainParticles.forEach(p => { p.update(); p.draw(mCtx); });
    requestAnimationFrame(renderMainParticles);
  }

  // Custom Cursor
  const cursor         = document.getElementById('customCursor');
  const cursorFollower = document.getElementById('customCursorFollower');
  let fx = window.innerWidth / 2, fy = window.innerHeight / 2;

  function animateCursor() {
    fx += (mouseX - fx) * 0.14;
    fy += (mouseY - fy) * 0.14;
    if (cursor)         { cursor.style.left = `${mouseX}px`; cursor.style.top = `${mouseY}px`; }
    if (cursorFollower) { cursorFollower.style.left = `${fx}px`; cursorFollower.style.top = `${fy}px`; }
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  /* ────────────────────────────────────────────────────────────────
     4. BACKGROUND MUSIC ENGINE
  ──────────────────────────────────────────────────────────────── */
  const bgAudio  = document.getElementById('bgAudio');
  const audioBtn = document.getElementById('audioToggleBtn');
  let audioUnlocked = false;
  let userManuallyPaused = false;

  function playBgMusic() {
    if (!bgAudio || userManuallyPaused) return;
    try { initAudio(); } catch (_) {}
    bgAudio.volume = 0.55;
    if (bgAudio.paused) {
      const promise = bgAudio.play();
      if (promise !== undefined) {
        promise.then(() => {
          audioUnlocked = true;
          if (audioBtn) audioBtn.classList.add('playing');
        }).catch((err) => {
          console.warn("Audio playback deferred:", err);
        });
      }
    }
  }

  if (bgAudio) {
    bgAudio.addEventListener('play', () => {
      audioUnlocked = true;
      if (audioBtn) audioBtn.classList.add('playing');
    });
    bgAudio.addEventListener('playing', () => {
      audioUnlocked = true;
      if (audioBtn) audioBtn.classList.add('playing');
    });
    bgAudio.addEventListener('pause', () => {
      if (audioBtn) audioBtn.classList.remove('playing');
    });
  }

  function unlockMobileAudio() {
    try { initAudio(); } catch (_) {}
    if (!userManuallyPaused && (!audioUnlocked || (bgAudio && bgAudio.paused))) {
      playBgMusic();
    }
  }

  ['pointerdown', 'touchstart', 'touchend', 'mousedown', 'click'].forEach(evt => {
    window.addEventListener(evt, unlockMobileAudio, { capture: true, passive: true });
  });

  if (audioBtn) {
    audioBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      try { initAudio(); } catch (_) {}
      if (!bgAudio) return;
      if (bgAudio.paused) {
        userManuallyPaused = false;
        playBgMusic();
      } else {
        userManuallyPaused = true;
        bgAudio.pause();
        if (audioBtn) audioBtn.classList.remove('playing');
      }
    });
  }

  /* ────────────────────────────────────────────────────────────────
     5. COUNTDOWN TIMER
  ──────────────────────────────────────────────────────────────── */
  const WEDDING_DATE = new Date('October 24, 2026 16:00:00').getTime();
  const daysEl    = document.getElementById('daysNum');
  const hoursEl   = document.getElementById('hoursNum');
  const minutesEl = document.getElementById('minutesNum');
  const secondsEl = document.getElementById('secondsNum');

  function updateCountdown() {
    const diff = WEDDING_DATE - Date.now();
    if (diff > 0) {
      const d = Math.floor(diff / 864e5);
      const h = Math.floor((diff % 864e5) / 36e5);
      const m = Math.floor((diff % 36e5)  / 6e4);
      const s = Math.floor((diff % 6e4)   / 1e3);
      if (daysEl)    daysEl.textContent    = String(d).padStart(2,'0');
      if (hoursEl)   hoursEl.textContent   = String(h).padStart(2,'0');
      if (minutesEl) minutesEl.textContent = String(m).padStart(2,'0');
      if (secondsEl) secondsEl.textContent = String(s).padStart(2,'0');
    }
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ────────────────────────────────────────────────────────────────
     6. SCROLL REVEAL ANIMATIONS
  ──────────────────────────────────────────────────────────────── */
  function triggerScrollReveals() {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
  }

  /* ────────────────────────────────────────────────────────────────
     7. MODALS (RSVP & VENUE MAP)
  ──────────────────────────────────────────────────────────────── */
  const rsvpModal = document.getElementById('rsvpModal');
  const mapModal  = document.getElementById('mapModal');

  function openModal(el)  { if (el) el.classList.add('active'); }
  function closeModal(el) { if (el) el.classList.remove('active'); }

  document.getElementById('closeRsvpBtn')?.addEventListener('click', () => closeModal(rsvpModal));
  document.getElementById('closeMapBtn')?.addEventListener('click', () => closeModal(mapModal));

  [rsvpModal, mapModal].forEach(m => {
    if (m) m.addEventListener('click', e => { if (e.target === m) closeModal(m); });
  });

  /* ── RSVP Form Submission ── */
  function handleRsvpSubmit(formEl, containerSelector) {
    if (!formEl) return;
    formEl.addEventListener('submit', () => {
      const nameInput = formEl.querySelector('input[type="text"]');
      const name = nameInput?.value || 'Guest';
      triggerConfetti();
      showToast(`✨ Thank you, ${name}! Your RSVP has been sent.`);

      const parentContainer = formEl.closest(containerSelector) || formEl.parentElement;
      if (parentContainer) {
        parentContainer.innerHTML = `
          <div class="rsvp-thank-you-box">
            <div class="ty-icon">🥂</div>
            <h3>Thank You, ${name}!</h3>
            <p class="ty-msg">Your RSVP response has been received. We look forward to celebrating together in The Sacred Garden!</p>
            <div class="ty-ornament">❖ ✦ ❖</div>
            <p class="ty-sub">To submit a new response, please reload the page.</p>
          </div>
        `;
      }
    });
  }

  handleRsvpSubmit(document.getElementById('rsvpForm'), '.modal-box');
  handleRsvpSubmit(document.getElementById('sectionRsvpForm'), '.rsvp-card-box');

  /* ────────────────────────────────────────────────────────────────
     8. FAQ ACCORDION
  ──────────────────────────────────────────────────────────────── */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item, index) => {
    if (index === 0) item.classList.add('active');
    const btn = item.querySelector('.faq-question');
    btn?.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });

  /* ────────────────────────────────────────────────────────────────
     9. CONFETTI & TOAST UTILITIES
  ──────────────────────────────────────────────────────────────── */
  function triggerConfetti() {
    const cc = document.createElement('canvas');
    Object.assign(cc.style, { position:'fixed', inset:'0', zIndex:'999999', pointerEvents:'none' });
    cc.width  = window.innerWidth;
    cc.height = window.innerHeight;
    document.body.appendChild(cc);
    const cCtx = cc.getContext('2d');

    const items = [];
    const colors = ['#D4AF37','#F3E09A','#135A43','#7A2E3B','#fff'];
    for (let i = 0; i < 110; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 14 + 3;
      items.push({
        x: window.innerWidth / 2, y: window.innerHeight / 2,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 6,
        size: Math.random() * 9 + 3, alpha: 1, life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * 360, rs: (Math.random() - 0.5) * 10,
      });
    }

    let af;
    function draw() {
      cCtx.clearRect(0, 0, cc.width, cc.height);
      let alive = 0;
      items.forEach(p => {
        if (p.life <= 0) return;
        alive++;
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.22; p.vx *= 0.97;
        p.life -= 0.014; p.alpha = Math.max(0, p.life);
        p.rot  += p.rs;
        cCtx.save();
        cCtx.globalAlpha = p.alpha;
        cCtx.translate(p.x, p.y);
        cCtx.rotate(p.rot * Math.PI / 180);
        cCtx.fillStyle = p.color;
        cCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        cCtx.restore();
      });
      if (alive > 0) af = requestAnimationFrame(draw);
      else { cancelAnimationFrame(af); document.body.removeChild(cc); }
    }
    draw();
  }

  const toastContainer = document.getElementById('toastContainer');
  function showToast(msg) {
    if (!toastContainer) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    toastContainer.appendChild(t);
    setTimeout(() => {
      t.style.transition = 'opacity 0.4s, transform 0.4s';
      t.style.opacity = '0';
      t.style.transform = 'translateY(10px)';
      setTimeout(() => t.remove(), 400);
    }, 4200);
  }

  /* ────────────────────────────────────────────────────────────────
     10. SAVE DATE TO CALENDAR
  ──────────────────────────────────────────────────────────────── */
  document.getElementById('saveDateBtn')?.addEventListener('click', () => {
    const title  = encodeURIComponent("Wedding of Eleanor & Alexander");
    const details= encodeURIComponent("You are cordially invited to The Sacred Garden wedding celebration.");
    const loc    = encodeURIComponent("The Glasshouse Estate, 774 Emerald Valley Road, Highland Estate, CA 90210");
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=20261024T160000Z/20261024T230000Z&details=${details}&location=${loc}`, '_blank');
  });

  /* ────────────────────────────────────────────────────────────────
     11. SCRATCH CARD DATE REVEAL LOGIC
  ──────────────────────────────────────────────────────────────── */
  function triggerMusicOnScratch() {
    if (!userManuallyPaused && bgAudio && bgAudio.paused) {
      try { playBgMusic(); } catch (_) {}
    }
  }

  function initScratchCards() {
    const tiles = document.querySelectorAll('.scratch-tile');
    const fullDateEl = document.getElementById('scratchFullDate');
    let isFullyRevealed = false;

    if (!tiles.length) return;

    function revealAllDateTiles() {
      triggerMusicOnScratch();
      if (isFullyRevealed) return;
      isFullyRevealed = true;

      try { playChime(); } catch (_) {}

      document.querySelectorAll('.scratch-canvas').forEach(canvas => {
        canvas.classList.add('revealed-fade');
      });

      if (fullDateEl) {
        fullDateEl.classList.add('is-visible');
      }

      try { triggerConfetti(); } catch (_) {}
    }

    tiles.forEach(tile => {
      const canvas = tile.querySelector('.scratch-canvas');
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;

      function drawFoil() {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';

        const grad = ctx.createLinearGradient(0, h, w, 0);
        grad.addColorStop(0.0, '#FFF993');
        grad.addColorStop(0.35, '#E6B828');
        grad.addColorStop(0.70, '#B37D0E');
        grad.addColorStop(1.0, '#784300');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const foilImg = new Image();
        foilImg.src = './assets/gold_scratch_gradient.png';
        foilImg.onload = () => {
          ctx.save();
          ctx.globalCompositeOperation = 'source-over';
          ctx.drawImage(foilImg, 0, 0, w, h);
          ctx.restore();
        };

        ctx.restore();
      }

      drawFoil();

      let isDrawing = false;
      let scratchStrokes = 0;

      function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
          x: (clientX - rect.left) * (w / rect.width),
          y: (clientY - rect.top) * (h / rect.height)
        };
      }

      function scratch(e) {
        triggerMusicOnScratch();
        if (!isDrawing || isFullyRevealed) return;

        const pos = getPos(e);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 18, 0, Math.PI * 2);
        ctx.fill();

        scratchStrokes++;

        if (scratchStrokes >= 3) {
          revealAllDateTiles();
        }
      }

      function startScratch(e) {
        triggerMusicOnScratch();
        isDrawing = true;
        scratch(e);
      }

      function stopScratch() {
        isDrawing = false;
      }

      canvas.addEventListener('mousedown', startScratch);
      canvas.addEventListener('mousemove', scratch);
      window.addEventListener('mouseup', stopScratch);

      canvas.addEventListener('touchstart', (e) => {
        triggerMusicOnScratch();
        startScratch(e);
      }, { passive: true });
      canvas.addEventListener('touchmove', (e) => {
        triggerMusicOnScratch();
        scratch(e);
      }, { passive: true });
      canvas.addEventListener('touchend', stopScratch);

      canvas.addEventListener('click', () => {
        triggerMusicOnScratch();
        revealAllDateTiles();
      });
    });
  }

  initScratchCards();

  /* ────────────────────────────────────────────────────────────────
     12. INITIAL BOOT
  ──────────────────────────────────────────────────────────────── */
  document.body.classList.add('cinematic-active');
  initOpenParticles(45);
  renderOpenParticles();
  showStage(1);

})();
