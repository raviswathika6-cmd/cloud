// ===== Header scroll effect =====
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
  backToTop.classList.toggle('show', window.scrollY > 400);
});

// ===== Mobile nav toggle =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// ===== Active nav link on scroll =====
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) current = section.id;
  });
  navAnchors.forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
});

// ===== Menu tab filtering =====
const tabButtons = document.querySelectorAll('.tab-btn');
const menuItems = document.querySelectorAll('.menu-item');

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    menuItems.forEach((item) => {
      const show = item.dataset.category === filter;
      item.style.display = show ? 'block' : 'none';
    });
  });
});

// ===== Form validation helper =====
function validateField(input, condition, message) {
  const group = input.closest('.form-group');
  const errorMsg = group.querySelector('.error-msg');
  if (!condition) {
    group.classList.add('invalid');
    errorMsg.textContent = message;
    return false;
  }
  group.classList.remove('invalid');
  errorMsg.textContent = '';
  return true;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+\-\s()]{7,20}$/;

// ===== Reservation form =====
const reservationForm = document.getElementById('reservationForm');
const formSuccess = document.getElementById('formSuccess');
const resDateInput = document.getElementById('resDate');

// Prevent past dates from being selected
resDateInput.min = new Date().toISOString().split('T')[0];

reservationForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('resName');
  const email = document.getElementById('resEmail');
  const phone = document.getElementById('resPhone');
  const guests = document.getElementById('resGuests');
  const date = document.getElementById('resDate');
  const time = document.getElementById('resTime');

  let valid = true;
  valid = validateField(name, name.value.trim().length >= 2, 'Please enter your full name.') && valid;
  valid = validateField(email, emailPattern.test(email.value.trim()), 'Please enter a valid email address.') && valid;
  valid = validateField(phone, phonePattern.test(phone.value.trim()), 'Please enter a valid phone number.') && valid;
  valid = validateField(guests, guests.value !== '', 'Please select number of guests.') && valid;
  valid = validateField(date, date.value !== '', 'Please choose a date.') && valid;
  valid = validateField(time, time.value !== '', 'Please choose a time.') && valid;

  if (!valid) return;

  formSuccess.classList.add('show');
  reservationForm.reset();
  resDateInput.min = new Date().toISOString().split('T')[0];

  setTimeout(() => formSuccess.classList.remove('show'), 6000);
});

// ===== Contact form =====
const contactForm = document.getElementById('contactForm');
const contactSuccess = document.getElementById('contactSuccess');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('cName');
  const email = document.getElementById('cEmail');
  const message = document.getElementById('cMessage');

  let valid = true;
  valid = validateField(name, name.value.trim().length >= 2, 'Please enter your name.') && valid;
  valid = validateField(email, emailPattern.test(email.value.trim()), 'Please enter a valid email address.') && valid;
  valid = validateField(message, message.value.trim().length >= 10, 'Message should be at least 10 characters.') && valid;

  if (!valid) return;

  contactSuccess.classList.add('show');
  contactForm.reset();

  setTimeout(() => contactSuccess.classList.remove('show'), 6000);
});

// ===== Back to top button =====
const backToTop = document.getElementById('backToTop');
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
