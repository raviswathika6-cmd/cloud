import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import '../styles/ExpenseList.css';

function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    status: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await api.getExpenses(filters);
      if (response.ok) {
        setExpenses(await response.json());
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this expense?')) {
      try {
        const response = await api.deleteExpense(id);
        if (response.ok) {
          fetchExpenses();
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="expense-list">Loading...</div>;

  const categories = [...new Set(expenses.map(e => e.category))];

  return (
    <div className="expense-list">
      <div className="list-header">
        <h1>Expenses</h1>
        <a href="/expense/new" className="btn-primary">Add Expense</a>
      </div>

      <div className="filters">
        <select 
          value={filters.category}
          onChange={(e) => setFilters({...filters, category: e.target.value})}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select 
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      <table className="expenses-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td>{new Date(expense.expense_date).toLocaleDateString()}</td>
              <td>{expense.category}</td>
              <td>${expense.amount}</td>
              <td>{expense.description}</td>
              <td>{expense.is_approved ? 'Approved' : 'Pending'}</td>
              <td>
                <a href={`/expense/edit/${expense.id}`} className="btn-small">Edit</a>
                <button onClick={() => handleDelete(expense.id)} className="btn-small btn-danger">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExpenseList;
