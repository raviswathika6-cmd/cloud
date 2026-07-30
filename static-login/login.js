const form = document.getElementById('loginForm');
const messageDiv = document.getElementById('message');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = form.username.value.trim();
  const password = form.password.value;
  messageDiv.textContent = '';
  messageDiv.className = 'message';

  if (!username || !password) {
    messageDiv.textContent = 'Please fill in all fields.';
    messageDiv.classList.add('error');
    return;
  }

  // Dummy authentication (replace with real logic)
  if (username === 'admin' && password === 'password') {
    messageDiv.textContent = 'Login successful!';
    messageDiv.classList.add('success');
  } else {
    messageDiv.textContent = 'Invalid credentials.';
    messageDiv.classList.add('error');
  }
});