/* =============================================
   GLOWHAIR™ — LANDING PAGE JAVASCRIPT
   ============================================= */

'use strict';

// ============================================
// COUNTDOWN TIMER
// ============================================
function initCountdown() {
  const el = document.getElementById('countdown');
  if (!el) return;

  // Restore or set a deadline 2 hours from now
  const key = 'gh_deadline';
  let deadline = parseInt(sessionStorage.getItem(key), 10);
  if (!deadline || deadline < Date.now()) {
    deadline = Date.now() + 2 * 60 * 60 * 1000;
    sessionStorage.setItem(key, deadline);
  }

  function update() {
    const diff = deadline - Date.now();
    if (diff <= 0) {
      el.textContent = '00:00:00';
      return;
    }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  update();
  setInterval(update, 1000);
}

// ============================================
// HEADER SCROLL EFFECT
// ============================================
function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

// ============================================
// STICKY MOBILE BUY BUTTON
// ============================================
function initStickyBuy() {
  const bar = document.getElementById('stickyBuyBar');
  if (!bar) return;

  const heroSection = document.getElementById('hero');
  const isMobile = () => window.innerWidth <= 640;

  let isVisible = false;

  function update() {
    if (!isMobile()) {
      if (isVisible) { bar.classList.remove('visible'); isVisible = false; }
      return;
    }
    const heroBottom = heroSection ? heroSection.getBoundingClientRect().bottom : 0;
    if (heroBottom < 0 && !isVisible) {
      bar.classList.add('visible');
      isVisible = true;
    } else if (heroBottom >= 0 && isVisible) {
      bar.classList.remove('visible');
      isVisible = false;
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}

// ============================================
// PRICING CARD SELECTION
// ============================================
let selectedPrice = 179;
let selectedLabel = 'Buy 2 Bundle';

function selectCard(num) {
  document.querySelectorAll('.pricing-card').forEach(c => c.classList.remove('selected'));
  const card = document.getElementById('card' + num);
  if (!card) return;
  card.classList.add('selected');
  selectedPrice = parseInt(card.dataset.price, 10);
  selectedLabel = card.querySelector('.card-title').textContent.trim();
  updateTotal();
  updateMainBtn();
}

function updateTotal() {
  let total = selectedPrice;
  document.querySelectorAll('.addon-check').forEach(chk => {
    if (chk.checked) total += parseInt(chk.dataset.price, 10);
  });
  const el = document.getElementById('orderTotal');
  if (el) el.textContent = '$' + total;
  updateMainBtn(total);
}

function updateMainBtn(total) {
  const btn = document.getElementById('mainBuyBtn');
  if (!btn) return;
  if (!total) {
    let t = selectedPrice;
    document.querySelectorAll('.addon-check').forEach(chk => {
      if (chk.checked) t += parseInt(chk.dataset.price, 10);
    });
    total = t;
  }
  btn.textContent = '💬 GET FREE CONSULTATION — ' + selectedLabel + ' ($' + total + ')';
  btn.onclick = () => handleBuy(null, total, selectedLabel);
}

window.selectCard = selectCard;
window.updateTotal = updateTotal;

// ============================================
// BUY NOW HANDLER
// ============================================
window.handleBuy = function(event, price, label) {
  if (event) event.stopPropagation();
  
  // Pre-fill the consultation form message textarea
  const msgEl = document.getElementById('message');
  if (msgEl) {
    msgEl.value = `I want to order the "${label}" package ($${price}). Please provide me a consultation for this package!`;
  }
  
  // Scroll to consultation section smoothly
  const target = document.getElementById('consultation');
  if (target) {
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) + 20;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
  
  showNotification(`💬 Consultation form pre-filled for "${label}"!`);
};

window.selectFinalOfferPackage = function(label) {
  const msgEl = document.getElementById('message');
  if (msgEl) {
    msgEl.value = `I'm interested in the "${label}" package. Please provide me a consultation for this package!`;
  }
};

// ============================================
// THUMBNAIL GALLERY
// ============================================
function initThumbs() {
  const thumbs = document.querySelectorAll('.hero-thumbs .thumb');
  const mainImg = document.querySelector('.hero-main-img');
  if (!mainImg || !thumbs.length) return;

  // Real product images — each thumb maps to its full-size view
  const images = [
    'images/wig-front.png',  // thumb 0 → front view
    'images/wig-side.jpg',   // thumb 1 → side view
    'images/wig-back.jpg',   // thumb 2 → back view
  ];

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      mainImg.style.opacity = '0';
      mainImg.style.transform = 'scale(1.03)';
      setTimeout(() => {
        mainImg.src = images[i] ?? images[0];
        mainImg.style.opacity = '1';
        mainImg.style.transform = 'scale(1)';
      }, 200);
    });
  });

}


// ============================================
// FAQ ACCORDION
// ============================================
window.toggleFaq = function(num) {
  const item = document.getElementById('faq' + num);
  if (!item) return;
  const isOpen = item.classList.contains('open');
  // Close all
  document.querySelectorAll('.faq-item').forEach(i => {
    i.classList.remove('open');
    const btn = i.querySelector('.faq-question');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  });
  // Open this one if it was closed
  if (!isOpen) {
    item.classList.add('open');
    const btn = item.querySelector('.faq-question');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }
};

// ============================================
// CONSULTATION FORM
// ============================================
window.handleFormSubmit = async function(event) {
  event.preventDefault();
  const btn = document.getElementById('consultSubmitBtn');
  const form = document.getElementById('consultationForm');
  const success = document.getElementById('formSuccess');
  if (!btn || !form || !success) return;

  const originalBtnText = btn.innerHTML;
  btn.innerHTML = '⏳ Submitting...';
  btn.disabled = true;

  // Collect form data
  const data = {
    name: document.getElementById('fullName').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim() || '',
    country: document.getElementById('country').value,
    goal: document.getElementById('goal').value,
    message: document.getElementById('message').value.trim() || ''
  };

  const webhookUrl = 'https://script.google.com/macros/s/AKfycbwLr1-kmeysfJzOafiuEFzwCAIpBGKSFSiidY2dufBVG9djG1t6noJh-jIFh_-scKe-/exec';

  try {
    // Send in no-cors mode directly to prevent CORS preflight OPTIONS blocks and duplicate submissions
    const response = await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify(data)
    });

    console.log('Submission response:', response);

    // Clear form fields
    form.reset();
    
    // Show success message
    form.style.display = 'none';
    success.style.display = 'block';
    showNotification('✅ Thank you! Our wig specialist will contact you within 24 hours.');
  } catch (error) {
    console.error('Submission Error:', error);
    showNotification('❌ Submission failed. Please check your connection and try again.');
    btn.innerHTML = originalBtnText;
    btn.disabled = false;
  }
};

// ============================================
// NOTIFICATION TOAST
// ============================================
const NOTIFICATIONS = [
  { icon: '🛍️', text: 'Sarah from Atlanta just ordered the Buy 2 Bundle!', delay: 4000 },
  { icon: '🌟', text: 'Monique from London just left a 5-star review!', delay: 12000 },
  { icon: '🛒', text: 'Jasmine from Toronto just grabbed the Buy 3 Bundle!', delay: 22000 },
  { icon: '❤️', text: 'Brittany from Sydney just ordered — "Love it already!"', delay: 33000 },
  { icon: '🔥', text: '17 people are viewing this page right now', delay: 44000 },
  { icon: '✅', text: 'Camille from Houston just ordered the Single Wig!', delay: 56000 },
  { icon: '⚡', text: 'Only 17 wigs left at this price — order now!', delay: 68000 },
  { icon: '💛', text: 'Layla from Paris just received her order — "Stunning!"', delay: 80000 },
];

function showNotification(message) {
  const el = document.getElementById('notifToast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 4000);
}

function initNotifications() {
  NOTIFICATIONS.forEach(({ icon, text, delay }) => {
    setTimeout(() => showNotification(icon + ' ' + text), delay);
  });
}

// ============================================
// INTERSECTION OBSERVER — SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
  const elements = document.querySelectorAll(
    '.feature-card, .review-card, .spec-card, .shipping-card, .faq-item, ' +
    '.ba-card, .stat-card, .emotional-benefit-item, .guarantee-item, ' +
    '.pricing-card, .fo-card, .addon-item, .sp-item'
  );

  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    return;
  }

  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const siblings = Array.from(el.parentElement?.children || [el]);
        const idx = siblings.indexOf(el);
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, idx * 80);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

// ============================================
// STOCK COUNTER (fake urgency)
// ============================================
function initStockCounter() {
  const el = document.getElementById('stockCount');
  if (!el) return;
  let count = 17;
  // Randomly decrease by 1 every 30-90 seconds
  function decrease() {
    if (count > 3) {
      count--;
      el.textContent = count;
      showNotification(`⚡ Hurry! Only ${count} wigs left at this price!`);
    }
    const next = (Math.random() * 60 + 30) * 1000;
    setTimeout(decrease, next);
  }
  setTimeout(decrease, 45000);
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) + 20;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ============================================
// SECTION HEADLINE ANIMATIONS
// ============================================
function initSectionAnimations() {
  const sectionHeadings = document.querySelectorAll('.section-title, .section-label');
  if (!('IntersectionObserver' in window)) return;

  sectionHeadings.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  sectionHeadings.forEach(el => obs.observe(el));
}

// ============================================
// NUMBER COUNTER ANIMATION
// ============================================
function animateCounter(el, target, suffix, duration) {
  const start = 0;
  const startTime = performance.now();
  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const val = Math.floor(start + (target - start) * easeOut(progress));
    el.textContent = (val >= 1000 ? (val / 1000).toFixed(0) + 'K' : val) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

function initCounters() {
  const counters = [
    { selector: '.sp-customers .sp-number', target: 10000, suffix: '+', dur: 1500 },
    { selector: '.sp-satisfaction .sp-number', target: 95, suffix: '%', dur: 1500 },
    { selector: '.sp-orders .sp-number', target: 50000, suffix: '+', dur: 1800 },
    { selector: '.score-number', target: 49, suffix: '', dur: 1000, display: '4.9' },
  ];

  if (!('IntersectionObserver' in window)) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = '1';
        const cfg = counters.find(c => entry.target.matches(c.selector));
        if (cfg) {
          if (cfg.display) { entry.target.textContent = cfg.display; }
          else animateCounter(entry.target, cfg.target, cfg.suffix, cfg.dur);
        }
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(({ selector }) => {
    const el = document.querySelector(selector);
    if (el) obs.observe(el);
  });
}

// ============================================
// ANNOUNCEMENT BAR DUPLICATE (for seamless loop)
// ============================================
function initAnnouncementBar() {
  const inner = document.querySelector('.announcement-inner');
  if (!inner) return;
  // Duplicate content for seamless scroll
  const clone = inner.cloneNode(true);
  inner.parentElement.appendChild(clone);
}

// ============================================
// MOBILE NAVIGATION
// ============================================
function initMobileNav() {
  const hamburger  = document.getElementById('hamburgerBtn');
  const overlay    = document.getElementById('mobileNavOverlay');
  const nav        = document.getElementById('mobileNav');
  const closeBtn   = document.getElementById('mobileNavClose');
  if (!hamburger || !overlay || !nav) return;

  function openNav() {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    overlay.style.display = 'block';
    nav.classList.add('open');
    requestAnimationFrame(() => { overlay.classList.add('open'); });
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    overlay.classList.remove('open');
    nav.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { if (!nav.classList.contains('open')) overlay.style.display = 'none'; }, 350);
  }

  hamburger.addEventListener('click', openNav);
  closeBtn && closeBtn.addEventListener('click', closeNav);
  overlay.addEventListener('click', closeNav);

  // Close on link click
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) closeNav();
  });
}

// ============================================
// IMAGE LOADING (shimmer + lazy)
// ============================================
function initImageLoading() {
  const allImages = document.querySelectorAll('img');
  allImages.forEach(img => {
    if (!img.complete) {
      img.classList.add('loading');
      img.addEventListener('load', () => img.classList.remove('loading'), { once: true });
      img.addEventListener('error', () => img.classList.remove('loading'), { once: true });
    }
  });

  // Native lazy-load fallback for non-eager images
  const lazyImgs = document.querySelectorAll('img:not([loading="eager"])');
  lazyImgs.forEach(img => {
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
  });
}

// ============================================
// INIT ALL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initHeaderScroll();
  initStickyBuy();
  initThumbs();
  initSmoothScroll();
  initScrollAnimations();
  initSectionAnimations();
  initNotifications();
  initStockCounter();
  initCounters();
  initAnnouncementBar();
  initMobileNav();
  initImageLoading();

  // Set initial state
  selectCard(2); // Default: Most Popular selected
});

