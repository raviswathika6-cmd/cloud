/* ================================================================
   SPICY KITCHEN — MAIN SCRIPT
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. NAVBAR: scroll shadow + mobile toggle ──────────────────
  const navbar    = document.getElementById('navbar');
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');

  // Scroll shadow
  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Mobile hamburger
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (navLinks && navLinks.classList.contains('open')) {
      if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
      }
    }
  });


  // ── 2. MENU FILTER ────────────────────────────────────────────
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const menuCards   = document.querySelectorAll('.menu-card');

  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Active state
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        menuCards.forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.classList.remove('hidden');
            // Stagger animation
            card.style.animation = 'none';
            card.offsetHeight; // reflow
            card.style.animation = 'fadeIn .35s ease forwards';
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }


  // ── 3. ADD TO ORDER TOAST ─────────────────────────────────────
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cardBody = btn.closest('.menu-card-body');
      const name = cardBody ? cardBody.querySelector('h3').textContent : 'Item';
      showToast(`🛒 "${name}" added to your order!`);
    });
  });


  // ── 4. CONTACT FORM ───────────────────────────────────────────
  const form        = document.getElementById('contactForm');
  const formSuccess = document.querySelector('.form-success');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Simple validation
      let valid = true;
      const required = form.querySelectorAll('[required]');

      required.forEach(field => {
        field.classList.remove('error');
        if (!field.value.trim()) {
          field.classList.add('error');
          valid = false;
        }
      });

      // Email format check
      const emailField = form.querySelector('#email');
      if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
        emailField.classList.add('error');
        valid = false;
      }

      if (!valid) {
        showToast('⚠️ Please fill in all required fields.');
        return;
      }

      // Simulate submit
      const submitBtn = form.querySelector('.form-submit');
      submitBtn.textContent = '⏳ Sending…';
      submitBtn.disabled = true;

      setTimeout(() => {
        form.style.display = 'none';
        if (formSuccess) formSuccess.classList.add('show');
        showToast('✅ Message sent successfully!');
      }, 1200);
    });

    // Remove error on input
    form.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('input', () => field.classList.remove('error'));
    });
  }


  // ── 5. SCROLL REVEAL (intersection observer) ──────────────────
  const revealEls = document.querySelectorAll(
    '.feature-card, .special-card, .menu-card, .info-card'
  );

  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'fadeInUp .5s ease forwards';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(el => {
      el.style.opacity = '0';
      observer.observe(el);
    });
  }


  // ── 6. KEYFRAME INJECTION ─────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(.97); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

});
