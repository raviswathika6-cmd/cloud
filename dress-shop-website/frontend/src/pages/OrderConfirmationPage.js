import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './OrderConfirmationPage.css';

export default function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || { orderId: 'ORD-123456', total: 0, items: [] };

  return (
    <div className="order-confirmation-page">
      <div className="page-container">
        <div className="confirmation-card">
          <div className="success-icon">✓</div>
          <h1>Order Confirmed!</h1>
          <p className="confirmation-message">Thank you for your order. We're excited to help you look great!</p>

          <div className="confirmation-details">
            <div className="detail-row">
              <span className="label">Order ID:</span>
              <span className="value">{state.orderId}</span>
            </div>
            <div className="detail-row">
              <span className="label">Order Total:</span>
              <span className="value">${state.total?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Status:</span>
              <span className="value status">Processing</span>
            </div>
          </div>

          {state.items && state.items.length > 0 && (
            <div className="items-summary">
              <h2>Order Items</h2>
              {state.items.map((item, index) => (
                <div key={index} className="item-line">
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="confirmation-info">
            <div className="info-box">
              <span className="icon">📧</span>
              <p>A confirmation email has been sent to your email address</p>
            </div>
            <div className="info-box">
              <span className="icon">📦</span>
              <p>You'll receive a tracking number once your order ships</p>
            </div>
            <div className="info-box">
              <span className="icon">🔄</span>
              <p>30-day returns are available on all items</p>
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn-primary" onClick={() => navigate('/products')}>
              Continue Shopping
            </button>
            <button className="btn-secondary" onClick={() => navigate('/')}>
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
