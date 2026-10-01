/**
 * app.js — VASTRAMAHOTSAV 2026 · SDIT
 * Complete Production System:
 * 1. Preloader Track ('./intro.m4a'), then Popup Intro Track ('./intro-1.m4a')
 * 2. Post-Loading Intro Blast (Viewport Particle Blasters + Sequential Announcement Banners)
 * 3. Sequential 4-Song MPEG Jukebox Loop (track1..track4 on Folk Vibe Stream Card)
 * 4. Daytime Atmosphere Mode, 3D Motion Cards, Live Countdown, and Pass Generator.
 */

'use strict';

/* ══════════════════════════════════════════════════════════════════
   GLOBAL STATE & JUKEBOX TRACKS
══════════════════════════════════════════════════════════════════ */
const folkTracks = ['./track1.m4a', './track2.m4a', './track3.m4a', './track4.m4a'];
let currentIndex = 0;
let loadingAudio = null;
let introAudio = null;
let folkAudio  = null;

function startLoadingAudio(restartIfEnded = false) {
  if (!loadingAudio) {
    loadingAudio = new Audio('./intro.m4a');
    loadingAudio.loop = false;
    loadingAudio.preload = 'auto';
  }
  if (restartIfEnded && loadingAudio.ended) loadingAudio.currentTime = 0;
  if (!loadingAudio.paused) return Promise.resolve(true);
  if (loadingAudio.ended) return Promise.resolve(false);
  return loadingAudio.play().then(() => true).catch(err => {
      console.log('Loading audio autoplay policy prevented playback:', err);
      return false;
    });
}

function startPopupIntroAudio() {
  if (loadingAudio) {
    loadingAudio.pause();
    loadingAudio.currentTime = 0;
  }
  if (!introAudio) {
    introAudio = new Audio('./intro-1.m4a');
    introAudio.loop = false;
    introAudio.preload = 'auto';
  }
  if (introAudio.paused && !introAudio.ended) {
    introAudio.play().catch(err => {
      console.log('Popup intro autoplay policy prevented playback:', err);
    });
  }
}


/* ══════════════════════════════════════════════════════════════════
   1. DAYTIME ATMOSPHERE MODE & THEME TOGGLE
══════════════════════════════════════════════════════════════════ */
(function initTimeTheme() {
  function updateToggleBtnLabel() {
    const btn = document.getElementById('themeToggleBtn');
    if (!btn) return;
    if (document.body.classList.contains('day-theme')) {
      btn.textContent = '⚡ VIBRANT MODE';
    } else {
      btn.textContent = '☀️ DAY MODE';
    }
  }

  // Set default daytime atmosphere
  document.body.classList.add('day-theme');

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
      updateToggleBtnLabel();
      btn.addEventListener('click', () => {
        document.body.classList.toggle('day-theme');
        updateToggleBtnLabel();
      });
    }
  });
})();


/* ══════════════════════════════════════════════════════════════════
   2. ORIGINAL BRUTALIST PRELOADER WITH INTRO SONG
══════════════════════════════════════════════════════════════════ */
(function initPreloader() {
  const preloader = document.getElementById('preloader');
  const mainSite  = document.getElementById('mainSite');
  const quoteText = document.getElementById('quoteText');
  const loaderBar = document.getElementById('loaderBar');
  const tapPrompt = document.getElementById('tapPrompt');

  if (!preloader) return;

  // Single-Line Welcoming Quotes Sequence
  const quotes = [
    'Unlocking the next chapter...',
    'Seniors Mode: Activated.',
    'Welcome to your new home, CSE / ISE / AIML / AIDS.',
    'Ditch the formal wear, brace the traditional.',
    'VASTRAMAHOTSAV 2026 awaits...'
  ];

  let quoteIdx   = 0;
  let progress   = 0;
  let loaderDone = false;
  let preloaderDismissed = false;
  let entryRequested = false;
  let loadingAudioFailed = false;

  startLoadingAudio();

  // Single-Line Quote Cycling logic
  function cycleQuote() {
    if (!quoteText) return;
    quoteText.style.animation = 'none';
    void quoteText.offsetWidth; // force reflow
    quoteText.textContent = quotes[quoteIdx % quotes.length];
    quoteText.style.animation = 'quoteFade 1.5s ease-in-out';
    quoteIdx++;
  }
  cycleQuote();
  const quoteInterval = setInterval(cycleQuote, 1500);

  // Progress Bar Simulation
  const progressInterval = setInterval(() => {
    progress = Math.min(progress + (Math.random() * 4 + 1.5), 98);
    if (loaderBar) loaderBar.style.width = progress + '%';
    if (progress >= 98) {
      clearInterval(progressInterval);
      loaderDone = true;
    }
    maybeDismissPreloader();
  }, 75);

  // Dismiss the preloader without restarting the loading track.
  function dismissPreloader() {
    if (preloaderDismissed) return;
    preloaderDismissed = true;
    startLoadingAudio();

    if (loaderBar) {
      loaderBar.style.transition = 'width 0.3s ease';
      loaderBar.style.width = '100%';
    }

    clearInterval(quoteInterval);
    clearInterval(progressInterval);

    setTimeout(() => {
      preloader.classList.add('fade-out');
      if (mainSite) mainSite.classList.remove('hidden');

      setTimeout(() => {
        preloader.style.display = 'none';
        initMainSiteComponents();

        // Trigger Post-Loading Intro Blast
        fireIntroBlast();
      }, 650);

    }, 350);
  }

  function maybeDismissPreloader() {
    if (!entryRequested || !loaderDone) return;
    if (loadingAudioFailed || !loadingAudio || loadingAudio.ended) dismissPreloader();
  }

  if (loadingAudio) loadingAudio.addEventListener('ended', maybeDismissPreloader);

  // Click/Tap Trigger
  preloader.addEventListener('click', () => {
    entryRequested = true;
    startLoadingAudio(true).then(played => {
      loadingAudioFailed = !played;
      maybeDismissPreloader();
    });
  });

})();


/* ══════════════════════════════════════════════════════════════════
   3. POST-LOADING INTRO BLAST (Viewport Blasters & Flash Banner)
══════════════════════════════════════════════════════════════════ */
function fireIntroBlast() {
  const blastLayer   = document.getElementById('introBlastLayer');
  const blasterBottomLeft  = document.getElementById('blasterLeft');
  const blasterBottomRight = document.getElementById('blasterRight');
  const blasterTopLeft     = document.getElementById('blasterTopLeft');
  const blasterTopRight    = document.getElementById('blasterTopRight');
  const popupCard1   = document.getElementById('blastPopupCard1');
  const popupCard2   = document.getElementById('blastPopupCard2');
  const jukeboxCard  = document.getElementById('jukeboxCard');
  const vibePointer  = document.getElementById('vibePointerArrow');

  if (!blastLayer || !blasterBottomLeft || !blasterBottomRight || !blasterTopLeft || !blasterTopRight) return;

  blastLayer.classList.remove('hidden');
  blastLayer.setAttribute('aria-hidden', 'false');
  if (popupCard1) popupCard1.classList.remove('hidden');
  if (popupCard2) popupCard2.classList.add('hidden');
  startPopupIntroAudio();

  const particleColors = ['#CCFF00', '#00E5FF', '#FF007F', '#FFFFFF', '#FFE600'];

  function spawnParticles(container, corner) {
    container.innerHTML = '';
    for (let i = 0; i < 35; i++) {
      const particle = document.createElement('div');
      particle.className = 'blaster-particle';

      const color = particleColors[Math.floor(Math.random() * particleColors.length)];
      const size  = Math.floor(Math.random() * 10 + 8) + 'px';
      const tx    = Math.floor(Math.random() * 30 + 15) + 'vw';
      const verticalDistance = Math.floor(Math.random() * 35 + 20);
      const ty = (corner.startsWith('top') ? verticalDistance : -verticalDistance) + 'vh';
      const rot   = Math.floor(Math.random() * 1080 - 540) + 'deg';

      particle.style.setProperty('--color', color);
      particle.style.setProperty('--size', size);
      particle.style.setProperty('--tx', tx);
      particle.style.setProperty('--ty', ty);
      particle.style.setProperty('--rot', rot);
      particle.style.animationDelay = (Math.random() * 0.2) + 's';

      container.appendChild(particle);
    }
  }

  setTimeout(() => {
    if (popupCard1) popupCard1.classList.add('hidden');
  }, 3000);

  setTimeout(() => {
    if (popupCard2) popupCard2.classList.remove('hidden');
    spawnParticles(blasterTopLeft, 'top-left');
    spawnParticles(blasterTopRight, 'top-right');
    spawnParticles(blasterBottomLeft, 'bottom-left');
    spawnParticles(blasterBottomRight, 'bottom-right');

    setTimeout(() => {
      blasterTopLeft.innerHTML = '';
      blasterTopRight.innerHTML = '';
      blasterBottomLeft.innerHTML = '';
      blasterBottomRight.innerHTML = '';
    }, 2000);

    setTimeout(() => {
      if (popupCard2) popupCard2.classList.add('hidden');
      blastLayer.classList.add('fade-out');
      setTimeout(() => {
        blastLayer.classList.add('hidden');
        blastLayer.classList.remove('fade-out');
        blastLayer.setAttribute('aria-hidden', 'true');
        if (jukeboxCard) {
          const startY = window.scrollY;
          const cardTop = jukeboxCard.getBoundingClientRect().top + startY;
          const targetY = cardTop - (window.innerHeight - jukeboxCard.offsetHeight) / 2;
          const startTime = performance.now();
          const duration = 5000;
          const originalScrollBehavior = document.documentElement.style.scrollBehavior;
          document.documentElement.style.scrollBehavior = 'auto';
          if (vibePointer) vibePointer.classList.remove('hidden');

          function scrollToCard(time) {
            const progress = Math.min((time - startTime) / duration, 1);
            const easedProgress = progress * progress * (3 - 2 * progress);
            window.scrollTo(0, startY + (targetY - startY) * easedProgress);
            if (progress < 1) {
              requestAnimationFrame(scrollToCard);
            } else {
              document.documentElement.style.scrollBehavior = originalScrollBehavior;
            }
          }

          requestAnimationFrame(scrollToCard);
        }
      }, 500);
    }, 2400);
  }, 13000);
}


/* ══════════════════════════════════════════════════════════════════
   4. SEQUENTIAL 4-SONG MPEG JUKEBOX LOOP
══════════════════════════════════════════════════════════════════ */
function initSequentialJukebox() {
  const jukeboxCard = document.getElementById('jukeboxCard');
  const statusText  = document.getElementById('jukeboxStatusText');
  const waveform    = document.getElementById('jukeboxWaveform');
  const vibePointer = document.getElementById('vibePointerArrow');
  let clickTimer = null;

  if (!jukeboxCard) return;

  function stopPlayback() {
    if (folkAudio) {
      folkAudio.pause();
      folkAudio.currentTime = 0;
      folkAudio = null;
    }
    if (loadingAudio) {
      loadingAudio.pause();
      loadingAudio.currentTime = 0;
    }
    if (introAudio) {
      introAudio.pause();
      introAudio.currentTime = 0;
      introAudio = null;
    }
    if (waveform) waveform.querySelectorAll('.wave-bar').forEach(bar => bar.classList.remove('playing'));
    for (let i = 1; i <= 4; i++) {
      const tag = document.getElementById(`vtag${i}`);
      if (tag) tag.classList.remove('active-track');
    }
    if (statusText) statusText.textContent = 'Vibe State: Playback stopped. Click to play.';
  }

  function playNextTrack() {
    stopPlayback();
    const trackPath = folkTracks[currentIndex];
    const trackNumber = currentIndex + 1;

    try {
      folkAudio = new Audio(trackPath);
      folkAudio.play().catch(e => {
        console.log(`Track ${trackNumber} playback blocked by browser policy:`, e);
      });
    } catch (err) {
      console.log('Jukebox Audio Error:', err);
    }

    if (statusText) {
      statusText.textContent = `Vibe State: Playing Track ${trackNumber} of 4`;
    }

    if (waveform) {
      waveform.querySelectorAll('.wave-bar').forEach(bar => bar.classList.add('playing'));
    }

    for (let i = 1; i <= 4; i++) {
      const tag = document.getElementById(`vtag${i}`);
      if (tag) {
        if (i === trackNumber) {
          tag.classList.add('active-track');
        } else {
          tag.classList.remove('active-track');
        }
      }
    }

    currentIndex = (currentIndex + 1) % folkTracks.length;
  }

  jukeboxCard.addEventListener('click', () => {
    if (vibePointer) vibePointer.classList.add('hidden');
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
      return;
    }
    clickTimer = setTimeout(() => {
      clickTimer = null;
      playNextTrack();
    }, 280);
  });

  jukeboxCard.addEventListener('dblclick', event => {
    event.preventDefault();
    if (clickTimer) clearTimeout(clickTimer);
    clickTimer = null;
    stopPlayback();
  });
}


/* ══════════════════════════════════════════════════════════════════
   5. MAIN SITE COMPONENTS INITIALIZATION
══════════════════════════════════════════════════════════════════ */
function initMainSiteComponents() {
  initCountdownTimer();
  init3DMotionCards();
  initSequentialJukebox();
  initIntersectionObserver();
  initTicketGenerator();
  initFlashBadge();
  initQuotesCarousel();
  initStatsCounter();
  initCustomCursor();
}


/* ── COUNTDOWN TIMER (Target: Oct 14, 2026 IST) ── */
function initCountdownTimer() {
  const targetDate = new Date('2026-10-14T00:00:00+05:30').getTime();

  const elDays  = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMins  = document.getElementById('cd-mins');
  const elSecs  = document.getElementById('cd-secs');

  const pad = n => String(Math.max(0, n)).padStart(2, '0');
  let prev = { d: '', h: '', m: '', s: '' };

  function update() {
    const delta = Math.max(0, targetDate - Date.now());
    const ts = Math.floor(delta / 1000);
    const s  = ts % 60;
    const tm = Math.floor(ts / 60);
    const m  = tm % 60;
    const th = Math.floor(tm / 60);
    const h  = th % 24;
    const d  = Math.floor(th / 24);

    const pD = pad(d), pH = pad(h), pM = pad(m), pS = pad(s);

    if (pD !== prev.d && elDays)  { elDays.textContent  = pD;  prev.d = pD; }
    if (pH !== prev.h && elHours) { elHours.textContent = pH;  prev.h = pH; }
    if (pM !== prev.m && elMins)  { elMins.textContent  = pM;  prev.m = pM; }
    if (pS !== prev.s && elSecs)  { elSecs.textContent  = pS;  prev.s = pS; }
  }

  update();
  setInterval(update, 1000);
}


/* ── 3D MOTION CARDS (Tilt Engine) ── */
function init3DMotionCards() {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    const inner = card.querySelector('.card-inner');
    if (!inner) return;

    card.addEventListener('mousemove', e => {
      const r   = card.getBoundingClientRect();
      const dx  = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
      const dy  = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
      const rY  = dx * 12;
      const rX  = -dy * 10;

      card.style.transition  = 'transform 0.05s ease';
      inner.style.transition = 'transform 0.05s ease';
      card.style.transform   = `perspective(900px) rotateX(${rX}deg) rotateY(${rY}deg) scale3d(1.02,1.02,1.02)`;
      inner.style.transform  = 'translateZ(16px)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition  = 'transform 0.5s cubic-bezier(.23,1,.32,1)';
      inner.style.transition = 'transform 0.5s cubic-bezier(.23,1,.32,1)';
      card.style.transform   = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
      inner.style.transform  = 'translateZ(0)';
    });
  });

  // Card 1 Pattern Toggle
  const toggleBtn   = document.getElementById('togglePatternBtn');
  const cyberGrid   = document.getElementById('cyberGrid');
  const ethnicMotif = document.getElementById('ethnicMotif');
  let isEthnic = false;

  if (toggleBtn) {
    toggleBtn.addEventListener('click', e => {
      e.stopPropagation();
      isEthnic = !isEthnic;
      if (cyberGrid) cyberGrid.classList.toggle('hidden', isEthnic);
      if (ethnicMotif) ethnicMotif.classList.toggle('hidden', !isEthnic);
    });
  }

  // Card 5 Dress Code Outfit Tabs
  document.querySelectorAll('.outfit-tab').forEach(tab => {
    tab.addEventListener('click', e => {
      e.stopPropagation();
      const target = tab.dataset.tab;
      document.querySelectorAll('.outfit-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.outfit-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const content = document.getElementById(`outfit-${target}`);
      if (content) content.classList.add('active');
    });
  });
}


/* ── INTERSECTION OBSERVER (Scroll Reveal) ── */
function initIntersectionObserver() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal-up').forEach(el => io.observe(el));
}


/* ── FLASH BADGE CYCLER ── */
function initFlashBadge() {
  const badge = document.getElementById('flashBadge');
  if (!badge) return;

  const messages = [
    'BRANCH ACCESS: CSE // ISE // AIML // AIDS',
    'ETHNIC WEAR: MANDATORY ✓',
    'OCT 14, 2026 · SDIT AUDITORIUM',
    'VASTRAMAHOTSAV 2026 · LIVE 🔴'
  ];
  let idx = 0;

  setInterval(() => {
    idx = (idx + 1) % messages.length;
    badge.style.opacity = '0';
    setTimeout(() => {
      badge.childNodes[badge.childNodes.length - 1].textContent = messages[idx];
      badge.style.opacity = '1';
    }, 200);
  }, 3000);
}


/* ── SENIOR QUOTES CAROUSEL ── */
function initQuotesCarousel() {
  const quotesData = [
    { text: "The campus felt alien on day one. By the end of Vastramahotsav, it felt like home.", author: "Priya Shetty", branch: "CSE · 2024 Batch" },
    { text: "Wearing a kurta to college felt weird. Walking onto that stage? Absolutely legendary.", author: "Aditya Kumar", branch: "ISE · 2024 Batch" },
    { text: "I never knew ethnic wear could hit so different. The whole auditorium was electric.", author: "Meghna Rao", branch: "AIML · 2024 Batch" },
    { text: "Four branches, one party. The chaos was organized perfection.", author: "Rohan D'Souza", branch: "AIDS · 2024 Batch" }
  ];

  let qi = 0;
  const quoteEl  = document.getElementById('qs-quote');
  const authorEl = document.getElementById('qs-author');
  const branchEl = document.getElementById('qs-branch');
  const dotsEl   = document.getElementById('qs-dots');

  if (!quoteEl || !dotsEl) return;

  dotsEl.innerHTML = '';
  quotesData.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'qs-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function goTo(idx) {
    qi = (idx + quotesData.length) % quotesData.length;
    quoteEl.style.opacity = '0';
    setTimeout(() => {
      quoteEl.textContent  = `"${quotesData[qi].text}"`;
      if (authorEl) authorEl.textContent = `— ${quotesData[qi].author}`;
      if (branchEl) branchEl.textContent = quotesData[qi].branch;
      quoteEl.style.opacity = '1';

      dotsEl.querySelectorAll('.qs-dot').forEach((d, i) => d.classList.toggle('active', i === qi));
    }, 200);
  }

  document.getElementById('qs-prev')?.addEventListener('click', () => goTo(qi - 1));
  document.getElementById('qs-next')?.addEventListener('click', () => goTo(qi + 1));

  setInterval(() => goTo(qi + 1), 5000);
}


/* ── STATS COUNTER ANIMATION ── */
function initStatsCounter() {
  const stats = document.querySelectorAll('.stat-num[data-target]');
  if (!stats.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      let current  = 0;
      const step   = Math.ceil(target / 45);

      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current + suffix;
        if (current >= target) {
          el.textContent = target + suffix;
          clearInterval(timer);
        }
      }, 30);

      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  stats.forEach(el => io.observe(el));
}


/* ── PERSONALIZED TICKET GENERATOR ── */
function initTicketGenerator() {
  const generateBtn     = document.getElementById('generateBtn');
  const ticketOverlay   = document.getElementById('ticketOverlay');
  const ticketOverlayBg = document.getElementById('ticketOverlayBg');
  const ticketClose     = document.getElementById('ticketClose');
  const downloadBtn     = document.getElementById('downloadBtn');
  const juniorNameInput = document.getElementById('juniorName');
  const juniorBranchSel = document.getElementById('juniorBranch');
  const ticketNameEl    = document.getElementById('ticketName');
  const ticketBranchEl  = document.getElementById('ticketBranch');
  const ticketCodeEl    = document.getElementById('ticketCode');

  if (!generateBtn) return;

  const branchColors = {
    CSE:  { bg: '#CCFF00', text: '#000' },
    ISE:  { bg: '#00E5FF', text: '#000' },
    AIML: { bg: '#FF007F', text: '#fff' },
    AIDS: { bg: '#FFFFFF', text: '#000' },
  };

  function genCode(branch) {
    const ch = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return `SDIT-${branch}-` + Array.from({ length: 6 }, () => ch[Math.floor(Math.random() * ch.length)]).join('');
  }

  function openTicket() {
    const name   = juniorNameInput.value.trim().toUpperCase();
    const branch = juniorBranchSel.value;
    if (!name || !branch) {
      if (!name) juniorNameInput.focus();
      else juniorBranchSel.focus();
      return;
    }

    if (ticketNameEl)   ticketNameEl.textContent   = name;
    if (ticketBranchEl) ticketBranchEl.textContent = branch;
    if (ticketCodeEl)   ticketCodeEl.textContent   = genCode(branch);

    const col = branchColors[branch] || branchColors.CSE;
    if (ticketBranchEl) {
      ticketBranchEl.style.background = col.bg;
      ticketBranchEl.style.color      = col.text;
    }

    if (ticketOverlay) {
      ticketOverlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeTicket() {
    if (ticketOverlay) {
      ticketOverlay.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  generateBtn.addEventListener('click', openTicket);
  if (ticketClose) ticketClose.addEventListener('click', closeTicket);
  if (ticketOverlayBg) ticketOverlayBg.addEventListener('click', closeTicket);

  // 2x Retina Canvas PNG Export
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const name   = ticketNameEl ? ticketNameEl.textContent : 'JUNIOR';
      const branch = ticketBranchEl ? ticketBranchEl.textContent : 'CSE';
      const code   = ticketCodeEl ? ticketCodeEl.textContent : 'SDIT-2026';
      const col    = branchColors[branch] || branchColors.CSE;

      const W = 820, H = 360, SC = 2;
      const canvas = document.createElement('canvas');
      canvas.width = W * SC; canvas.height = H * SC;
      const ctx = canvas.getContext('2d');
      ctx.scale(SC, SC);

      // Background & Grid
      ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(204,255,0,0.06)';
      for (let x = 0; x < W; x += 20) {
        for (let y = 0; y < H; y += 20) {
          ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
        }
      }

      // Border
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.strokeRect(2, 2, W - 4, H - 4);

      // Left Panel
      ctx.fillStyle = '#111'; ctx.fillRect(0, 0, W * 0.44, H);
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '700 9px monospace'; ctx.fillText('ADMIT ONE', 28, 40);
      ctx.fillStyle = '#fff'; ctx.font = '800 42px sans-serif'; ctx.fillText('VASTRA', 28, 104); ctx.fillText('MAHOTSAV', 28, 152);
      ctx.fillStyle = '#CCFF00'; ctx.font = '800 36px sans-serif'; ctx.fillText('2026', 28, 194);
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '400 9px monospace'; ctx.fillText('SHREE DEVI INSTITUTE OF TECHNOLOGY', 28, 235);

      // Right Panel
      const rX = W * 0.44 + 26;
      ctx.fillStyle = col.bg; ctx.fillRect(rX, 26, 82, 30);
      ctx.fillStyle = col.text; ctx.font = '700 13px monospace'; ctx.fillText(branch, rX + 12, 47);
      ctx.fillStyle = '#fff'; ctx.font = '800 34px sans-serif'; ctx.fillText(name, rX, 105);

      // Details
      const details = [
        ['VENUE',    'SDIT AUDITORIUM'],
        ['DATE',     '14 OCTOBER 2026 · 09:30 AM'],
        ['DRESS',    'ETHNIC / TRADITIONAL'],
        ['HOSTED BY','SDIT SENIORS']
      ];
      ctx.font = '400 10px monospace';
      details.forEach(([k, v], i) => {
        const y = 138 + i * 28;
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillText(k, rX, y);
        ctx.fillStyle = k === 'DRESS' ? '#CCFF00' : '#fff'; ctx.fillText(v, rX + 90, y);
      });

      // Barcode
      let bx = rX;
      [2,1,3,1,2,1,4,1,2,1,1,2,3,1,2,2,1,3,1,2].forEach((bw, i) => {
        if (i % 2 === 0) { ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(bx, H - 68, bw * 2.2, 24); }
        bx += bw * 2.2;
      });
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '400 9px monospace'; ctx.fillText(code, rX, H - 14);

      // Trigger download
      const a = document.createElement('a');
      a.download = `VASTRAMAHOTSAV-2026-${name.replace(/\s+/g, '_')}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    });
  }
}


/* ── CUSTOM CURSOR ── */
function initCustomCursor() {
  const dot  = document.querySelector('.cursor-dot') || document.createElement('div');
  const ring = document.querySelector('.cursor-ring') || document.createElement('div');
  dot.className  = 'cursor-dot';
  ring.className = 'cursor-ring';
  if (!document.body.contains(dot))  document.body.appendChild(dot);
  if (!document.body.contains(ring)) document.body.appendChild(ring);

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function animateRing() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  document.addEventListener('mousedown', () => { dot.classList.add('active'); ring.classList.add('active'); });
  document.addEventListener('mouseup',   () => { dot.classList.remove('active'); ring.classList.remove('active'); });
}
