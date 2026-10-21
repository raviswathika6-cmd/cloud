import React from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

export const api = {
  // Auth endpoints
  register: (email, password, firstName, lastName) =>
    fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName })
    }),

  login: (email, password) =>
    fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }),

  logout: () =>
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    }),

  // Expense endpoints
  getExpenses: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return fetch(`${API_BASE_URL}/expenses?${params}`, {
      headers: getAuthHeaders()
    });
  },

  getExpense: (id) =>
    fetch(`${API_BASE_URL}/expenses/${id}`, {
      headers: getAuthHeaders()
    }),

  createExpense: (data) =>
    fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }),

  updateExpense: (id, data) =>
    fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }),

  deleteExpense: (id) =>
    fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }),

  // Payment endpoints
  createPaymentIntent: (amount, currency, description, expenseId) =>
    fetch(`${API_BASE_URL}/payments/create-intent`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, currency, description, expenseId })
    }),

  confirmPayment: (paymentIntentId) =>
    fetch(`${API_BASE_URL}/payments/confirm`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ paymentIntentId })
    }),

  getPaymentHistory: () =>
    fetch(`${API_BASE_URL}/payments/history`, {
      headers: getAuthHeaders()
    }),

  // Receipt endpoints
  uploadReceipt: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    delete headers['Content-Type'];
    
    return fetch(`${API_BASE_URL}/uploads/receipt`, {
      method: 'POST',
      headers: headers,
      body: formData
    });
  },

  getReceipts: () =>
    fetch(`${API_BASE_URL}/uploads`, {
      headers: getAuthHeaders()
    }),

  deleteReceipt: (id) =>
    fetch(`${API_BASE_URL}/uploads/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }),

  // Summary endpoints
  generateSummary: (summaryType, startDate, endDate) =>
    fetch(`${API_BASE_URL}/summaries/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ summaryType, startDate, endDate })
    }),

  getSummaries: () =>
    fetch(`${API_BASE_URL}/summaries`, {
      headers: getAuthHeaders()
    }),

  getQuickInsights: () =>
    fetch(`${API_BASE_URL}/summaries/quick/insights`, {
      headers: getAuthHeaders()
    })
};
