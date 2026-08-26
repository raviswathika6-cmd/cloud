import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import '../styles/Dashboard.css';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [insights, setInsights] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [insightsRes, expensesRes] = await Promise.all([
          api.getQuickInsights(),
          api.getExpenses()
        ]);

        if (insightsRes.ok) {
          setInsights(await insightsRes.json());
        }

        if (expensesRes.ok) {
          setExpenses((await expensesRes.json()).slice(0, 5));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="dashboard">Loading...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.firstName}!</h1>
        <p>Your expense management dashboard</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {insights && (
        <div className="insights-card">
          <h2>Quick Insights (Last 30 Days)</h2>
          <div className="stats-grid">
            <div className="stat-box">
              <span className="label">Total Spent</span>
              <span className="value">${insights.totalSpent?.toFixed(2)}</span>
            </div>
            <div className="stat-box">
              <span className="label">Daily Average</span>
              <span className="value">${insights.dailyAverage?.toFixed(2)}</span>
            </div>
            <div className="stat-box">
              <span className="label">Top Category</span>
              <span className="value">{insights.topCategory}</span>
            </div>
            <div className="stat-box">
              <span className="label">Categories</span>
              <span className="value">{insights.categoryBreakdown?.length}</span>
            </div>
          </div>

          {insights.categoryBreakdown && (
            <div className="category-breakdown">
              <h3>Category Breakdown</h3>
              <ul>
                {insights.categoryBreakdown.map((cat, idx) => (
                  <li key={idx}>
                    <span>{cat.category}</span>
                    <span className="amount">${cat.amount.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="recent-expenses">
        <h2>Recent Expenses</h2>
        {expenses.length > 0 ? (
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{new Date(expense.expense_date).toLocaleDateString()}</td>
                  <td>{expense.category}</td>
                  <td>${expense.amount}</td>
                  <td>{expense.is_approved ? 'Approved' : 'Pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No expenses yet. <a href="/expense/new">Add one</a></p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
