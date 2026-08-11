/* ============================================================
   MIYA MIYA RESTAURANT — JAVASCRIPT
   Version: 1.0
   ============================================================ */

'use strict';

// ============================================================
// 1. UTILITY HELPERS
// ============================================================

/**
 * Select a single element
 * @param {string} selector
 * @param {Element} [scope=document]
 */
const qs = (selector, scope = document) => scope.querySelector(selector);

/**
 * Select multiple elements
 * @param {string} selector
 * @param {Element} [scope=document]
 */
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];


// ============================================================
// 2. NAVBAR — Scroll behaviour & mobile menu
// ============================================================
(function initNavbar() {
  const navbar    = qs('#navbar');
  const hamburger = qs('#hamburger');
  const navLinks  = qs('#nav-links');
  const allLinks  = qsa('.nav-link');
  const sections  = qsa('section[id]');

  if (!navbar || !hamburger || !navLinks) return;

  // Scroll → sticky dark background
  const handleScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active nav link highlight
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    allLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run once on load

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu on link click
  allLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('open') &&
        !navbar.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    }
  });
})();


// ============================================================
// 3. REVEAL ON SCROLL — IntersectionObserver
// ============================================================
(function initReveal() {
  const revealEls = qsa('.reveal-up, .reveal-left, .reveal-right');

  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // animate once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => observer.observe(el));
})();


// ============================================================
// 4. MENU TABS
// ============================================================
(function initMenuTabs() {
  const tabs   = qsa('.menu-tab');
  const panels = qsa('.menu-panel');

  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const category = tab.dataset.category;

      // Update tabs
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Update panels with fade
      panels.forEach(panel => {
        if (panel.id === `panel-${category}`) {
          panel.style.opacity = '0';
          panel.classList.add('active');
          requestAnimationFrame(() => {
            panel.style.transition = 'opacity 0.3s ease';
            panel.style.opacity = '1';
          });
        } else {
          panel.classList.remove('active');
          panel.style.opacity = '';
          panel.style.transition = '';
        }
      });
    });
  });
})();


// ============================================================
// 5. RESERVATION FORM
// ============================================================
(function initReservationForm() {
  const form    = qs('#reservation-form');
  const success = qs('#form-success');
  const submitBtn = qs('#submit-btn');
  const dateInput = qs('#res-date');

  if (!form) return;

  // Set minimum date to today
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Collect form data
    const data = new FormData(form);
    const values = Object.fromEntries(data.entries());

    // Button loading state
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
      // Construct WhatsApp message (fallback delivery method)
      const whatsappMsg = encodeURIComponent(
        `🍽️ New Reservation Request — Miya Miya Restaurant\n\n` +
        `Name: ${values.name}\n` +
        `Phone: ${values.phone}\n` +
        `Email: ${values.email || 'Not provided'}\n` +
        `Guests: ${values.guests}\n` +
        `Date: ${values.date}\n` +
        `Time: ${values.time}\n` +
        `Special Request: ${values.special_request || 'None'}`
      );

      // Simulate async (replace with actual fetch to backend / FormSpree / EmailJS)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success message
      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      form.reset();
      submitBtn.textContent = '✓ Sent!';

      // Reset button after delay
      setTimeout(() => {
        submitBtn.textContent = 'Reserve a Table';
        submitBtn.disabled = false;
        if (success) success.hidden = true;
      }, 6000);

      // Also open WhatsApp as secondary confirmation (optional)
      // const waNumber = '[ADD-WHATSAPP-NUMBER]';
      // window.open(`https://wa.me/${waNumber}?text=${whatsappMsg}`, '_blank');

    } catch (err) {
      console.error('Form submission error:', err);
      submitBtn.textContent = 'Error — Try Again';
      submitBtn.disabled = false;
      setTimeout(() => {
        submitBtn.textContent = 'Reserve a Table';
      }, 3000);
    }
  });
})();


// ============================================================
// 6. BACK TO TOP BUTTON
// ============================================================
(function initBackToTop() {
  const btn = qs('#back-to-top');
  if (!btn) return;

  const toggleVisibility = () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


// ============================================================
// 7. FOOTER YEAR
// ============================================================
(function setFooterYear() {
  const yearEl = qs('#year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();


// ============================================================
// 8. SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================================
(function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href');
    if (targetId === '#') return;

    const target = qs(targetId);
    if (!target) return;

    e.preventDefault();

    const navbarHeight = qs('#navbar')?.offsetHeight || 80;
    const targetPos = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

    window.scrollTo({
      top: targetPos,
      behavior: 'smooth'
    });
  });
})();


// ============================================================
// 9. GALLERY LIGHTBOX (Simple)
// ============================================================
(function initGalleryLightbox() {
  const galleryItems = qsa('.gallery-item img');
  if (!galleryItems.length) return;

  // Create lightbox elements
  const overlay = document.createElement('div');
  overlay.id = 'lightbox-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(23,19,15,0.95);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.35s ease;
    cursor: pointer; padding: 2rem;
  `;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Image viewer');
  overlay.hidden = true;

  const img = document.createElement('img');
  img.style.cssText = `
    max-width: 90vw; max-height: 88vh;
    object-fit: contain;
    border-radius: 2px;
    box-shadow: 0 20px 80px rgba(0,0,0,0.7);
    transform: scale(0.96);
    transition: transform 0.35s ease;
    pointer-events: none;
  `;
  img.alt = '';

  const closeBtn = document.createElement('button');
  closeBtn.style.cssText = `
    position: absolute; top: 1.5rem; right: 1.5rem;
    background: rgba(245,240,232,0.1); border: 1px solid rgba(245,240,232,0.2);
    color: rgba(245,240,232,0.8); border-radius: 2px;
    width: 44px; height: 44px; font-size: 1.2rem;
    cursor: pointer; transition: all 0.25s ease;
    display: flex; align-items: center; justify-content: center;
  `;
  closeBtn.innerHTML = '✕';
  closeBtn.setAttribute('aria-label', 'Close image viewer');

  overlay.appendChild(img);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);

  const openLightbox = (src, alt) => {
    img.src = src;
    img.alt = alt || '';
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      img.style.transform = 'scale(1)';
    });
  };

  const closeLightbox = () => {
    overlay.style.opacity = '0';
    img.style.transform = 'scale(0.96)';
    setTimeout(() => {
      overlay.hidden = true;
      document.body.style.overflow = '';
    }, 350);
  };

  galleryItems.forEach(item => {
    item.style.cursor = 'zoom-in';
    item.addEventListener('click', () => {
      openLightbox(item.src, item.alt);
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        openLightbox(item.src, item.alt);
      }
    });
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target === closeBtn) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) {
      closeLightbox();
    }
  });
})();


// ============================================================
// 10. NAV TRANSPARENCY — Initial state
// ============================================================
(function initNavTransparency() {
  // Ensure nav starts transparent (no background) over hero
  const navbar = qs('#navbar');
  if (!navbar) return;

  if (window.scrollY === 0) {
    navbar.classList.remove('scrolled');
  }
})();


// ============================================================
// 11. PERFORMANCE — Lazy image loading polyfill guard
// ============================================================
(function checkLazyLoad() {
  if ('loading' in HTMLImageElement.prototype) return; // natively supported

  // Basic polyfill for older browsers
  const lazyImages = qsa('img[loading="lazy"]');
  if (!lazyImages.length) return;

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        imageObserver.unobserve(img);
      }
    });
  });

  lazyImages.forEach(img => imageObserver.observe(img));
})();


// ============================================================
// 12. ANALYTICS READY — Google Analytics placeholder
// ============================================================
// Uncomment and replace GA_MEASUREMENT_ID when ready:
/*
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'GA_MEASUREMENT_ID');
*/

// Track reservation form submission event (add when GA is connected):
/*
document.getElementById('reservation-form')?.addEventListener('submit', () => {
  gtag('event', 'form_submit', {
    'event_category': 'Reservation',
    'event_label': 'Table Reservation Form'
  });
});
*/

// ============================================================
// 13. FAQ ACCORDION INTERACTION
// ============================================================
(function initFaqAccordion() {
  const toggles = qsa('.faq-toggle');
  if (!toggles.length) return;

  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      const content = toggle.nextElementSibling;
      const icon = toggle.querySelector('.faq-icon');

      // Toggle state
      toggle.setAttribute('aria-expanded', !expanded);
      content.hidden = expanded;

      if (!expanded) {
        icon.textContent = '－';
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        icon.textContent = '＋';
        content.style.maxHeight = '0px';
      }
      
      // Optional: close other open items
      toggles.forEach(otherToggle => {
        if (otherToggle !== toggle && otherToggle.getAttribute('aria-expanded') === 'true') {
          otherToggle.setAttribute('aria-expanded', 'false');
          otherToggle.nextElementSibling.hidden = true;
          otherToggle.nextElementSibling.style.maxHeight = '0px';
          otherToggle.querySelector('.faq-icon').textContent = '＋';
        }
      });
    });
  });
})();

