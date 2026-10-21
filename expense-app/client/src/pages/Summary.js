import React, { useState } from 'react';
import { api } from '../services/api';
import '../styles/Summary.css';

function Summary() {
  const [summaryType, setSummaryType] = useState('monthly');
  const [startDate, setStartDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateSummary = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.generateSummary(summaryType, startDate, endDate);
      if (response.ok) {
        setSummary(await response.json());
      } else {
        setError('Failed to generate summary');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="summary-container">
      <h1>Expense Summary & AI Analysis</h1>

      <form onSubmit={handleGenerateSummary} className="summary-form">
        <div className="form-group">
          <label>Summary Type</label>
          <select value={summaryType} onChange={(e) => setSummaryType(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Summary'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {summary && (
        <div className="summary-results">
          <div className="summary-card">
            <h2>Analysis Results</h2>
            
            <div className="summary-stat">
              <span className="label">Total Expenses:</span>
              <span className="value">${summary.summary?.totalExpenses?.toFixed(2) || '0.00'}</span>
            </div>

            <div className="category-breakdown">
              <h3>Category Breakdown</h3>
              <ul>
                {Object.entries(summary.summary?.categoryBreakdown || {}).map(([cat, data]) => (
                  <li key={cat}>
                    <span>{cat}</span>
                    <span>${data.total?.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="insights-section">
              <h3>AI-Powered Insights</h3>
              <p>{summary.summary?.insights}</p>
            </div>

            <div className="recommendations-section">
              <h3>Recommendations</h3>
              <p>{summary.summary?.recommendations}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Summary;
