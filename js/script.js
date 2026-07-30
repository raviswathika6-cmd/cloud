const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('nav-active');
});

const form = document.getElementById('reservation-form');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value;
    const email = form.email.value;
    alert(`Thank you, ${name}! Your reservation request has been received.`);
    form.reset();
});