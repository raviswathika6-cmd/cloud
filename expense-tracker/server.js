const express = require('express');
const path = require('path');
const app = express();

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Hardcoded expenses
let expenses = [
  { id: 1, description: 'Grocery Shopping', amount: 45.50, date: '2024-01-15' },
  { id: 2, description: 'Gas Station', amount: 60.00, date: '2024-01-14' },
  { id: 3, description: 'Coffee & Lunch', amount: 18.75, date: '2024-01-13' }
];

let nextId = 4;

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to get expenses
app.get('/api/expenses', (req, res) => {
  res.json(expenses);
});

// API endpoint to add an expense
app.post('/api/expenses', (req, res) => {
  const { description, amount, date } = req.body;
  
  if (!description || !amount || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const expense = {
    id: nextId++,
    description,
    amount: parseFloat(amount),
    date
  };

  expenses.push(expense);
  res.json(expense);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Expense tracker running on port ${PORT}`);
});
