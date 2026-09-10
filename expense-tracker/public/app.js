// Load expenses on page load
document.addEventListener('DOMContentLoaded', loadExpenses);

// Form submission
document.getElementById('expenseForm').addEventListener('submit', addExpense);

// Set today's date as default
document.getElementById('date').valueAsDate = new Date();

async function loadExpenses() {
  try {
    const response = await fetch('/api/expenses');
    const expenses = await response.json();
    displayExpenses(expenses);
  } catch (error) {
    console.error('Error loading expenses:', error);
  }
}

async function addExpense(e) {
  e.preventDefault();

  const description = document.getElementById('description').value.trim();
  const amount = document.getElementById('amount').value.trim();
  const date = document.getElementById('date').value;

  if (!description || !amount || !date) {
    alert('Please fill in all fields');
    return;
  }

  try {
    const response = await fetch('/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        amount: parseFloat(amount),
        date
      })
    });

    if (!response.ok) {
      throw new Error('Failed to add expense');
    }

    // Reset form
    document.getElementById('expenseForm').reset();
    document.getElementById('date').valueAsDate = new Date();

    // Reload expenses
    loadExpenses();
  } catch (error) {
    console.error('Error adding expense:', error);
    alert('Error adding expense. Please try again.');
  }
}

function displayExpenses(expenses) {
  const expensesList = document.getElementById('expensesList');
  const totalAmount = document.getElementById('totalAmount');

  // Clear existing rows
  expensesList.innerHTML = '';

  if (expenses.length === 0) {
    expensesList.innerHTML = `
      <tr>
        <td colspan="3" style="text-align: center; padding: 40px; color: #999;">
          No expenses yet. Add one to get started!
        </td>
      </tr>
    `;
    totalAmount.textContent = '$0.00';
    return;
  }

  // Sort expenses by date (most recent first)
  const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  let total = 0;

  sorted.forEach(expense => {
    const row = document.createElement('tr');
    const formattedAmount = parseFloat(expense.amount).toFixed(2);
    
    row.innerHTML = `
      <td>${formatDate(expense.date)}</td>
      <td>${escapeHtml(expense.description)}</td>
      <td>$${formattedAmount}</td>
    `;
    
    expensesList.appendChild(row);
    total += parseFloat(expense.amount);
  });

  // Update total
  totalAmount.textContent = `$${total.toFixed(2)}`;
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
