const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store form data in memory (in production, use a session store)
const formData = {};

// Main form page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to get current step
app.get('/api/step/:step', (req, res) => {
  const step = parseInt(req.params.step);
  res.json({ step, data: formData });
});

// API endpoint to save form data and move to next step
app.post('/api/save', (req, res) => {
  const { step, data } = req.body;
  
  // Validate based on step
  if (step === 1) {
    const { name, email } = data;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
  } else if (step === 2) {
    const { plan } = data;
    if (!plan || !['basic', 'professional', 'enterprise'].includes(plan)) {
      return res.status(400).json({ error: 'Valid plan selection is required' });
    }
  }
  
  // Merge data
  Object.assign(formData, data);
  res.json({ success: true, data: formData });
});

// API endpoint for final submission
app.post('/api/submit', (req, res) => {
  const data = formData;
  
  // Final validation
  if (!data.name || !data.email || !data.plan) {
    return res.status(400).json({ error: 'Incomplete form data' });
  }
  
  // In production, save to database here
  console.log('Form submitted:', data);
  
  // Clear form data after submission
  Object.keys(formData).forEach(key => delete formData[key]);
  
  res.json({ success: true, message: 'Form submitted successfully!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Form wizard server running on http://localhost:${PORT}`);
});
