import React, { useState } from 'react';
import { api } from '../services/api';
import '../styles/Payments.css';

function Payments() {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('usd');
  const [description, setDescription] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreatePaymentIntent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.createPaymentIntent(
        parseFloat(amount),
        currency,
        description
      );

      if (response.ok) {
        const data = await response.json();
        setClientSecret(data.clientSecret);
        setSuccess('Payment intent created. Ready for payment processing.');
      } else {
        setError('Failed to create payment intent');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payments-container">
      <h1>Payment Gateway</h1>

      <div className="payment-form">
        <h2>Create Payment</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleCreatePaymentIntent}>
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
              <option value="gbp">GBP</option>
              <option value="inr">INR</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Create Payment Intent'}
          </button>
        </form>

        {clientSecret && (
          <div className="client-secret-display">
            <h3>Payment Ready</h3>
            <p>Client Secret: {clientSecret.substring(0, 20)}...</p>
            <p className="info">Use this client secret to complete payment in your payment form</p>
          </div>
        )}
      </div>

      <div className="info-card">
        <h3>Stripe Payment Integration</h3>
        <p>This payment gateway is integrated with Stripe for secure transactions. Follow these steps:</p>
        <ol>
          <li>Enter payment details above</li>
          <li>Create a payment intent</li>
          <li>Complete payment using Stripe payment form</li>
          <li>Webhooks will automatically update payment status</li>
        </ol>
      </div>
    </div>
  );
}

export default Payments;
