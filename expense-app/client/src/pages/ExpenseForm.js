import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/ExpenseForm.css';

function ExpenseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    tags: []
  });
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchExpense();
    }
    fetchReceipts();
  }, [id]);

  const fetchExpense = async () => {
    try {
      const response = await api.getExpense(id);
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchReceipts = async () => {
    try {
      const response = await api.getReceipts();
      if (response.ok) {
        setReceipts(await response.json());
      }
    } catch (err) {
      console.error('Error fetching receipts:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        ...formData,
        receiptId: selectedReceipt || null
      };

      const response = id 
        ? await api.updateExpense(id, data)
        : await api.createExpense(data);

      if (response.ok) {
        navigate('/expenses');
      } else {
        setError('Failed to save expense');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expense-form">
      <h1>{id ? 'Edit Expense' : 'Add New Expense'}</h1>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Category *</label>
          <select 
            name="category" 
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="food">Food</option>
            <option value="transportation">Transportation</option>
            <option value="entertainment">Entertainment</option>
            <option value="utilities">Utilities</option>
            <option value="healthcare">Healthcare</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Amount *</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label>Date *</label>
          <input
            type="date"
            name="expenseDate"
            value={formData.expenseDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Payment Method</label>
          <select 
            name="paymentMethod" 
            value={formData.paymentMethod}
            onChange={handleChange}
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="digital_wallet">Digital Wallet</option>
          </select>
        </div>

        <div className="form-group">
          <label>Receipt</label>
          <select 
            value={selectedReceipt}
            onChange={(e) => setSelectedReceipt(e.target.value)}
          >
            <option value="">No Receipt</option>
            {receipts.map(receipt => (
              <option key={receipt.id} value={receipt.id}>
                {receipt.file_name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Expense'}
        </button>
      </form>
    </div>
  );
}

export default ExpenseForm;
