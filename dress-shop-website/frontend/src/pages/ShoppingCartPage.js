import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import './ShoppingCartPage.css';

export default function ShoppingCartPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity } = useContext(CartContext);
  const { user, isLoggedIn } = useContext(AuthContext);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (!isLoggedIn()) {
      alert('Please login first');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="shopping-cart-page">
      <div className="page-container">
        <h1>Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <button onClick={() => navigate('/products')}>Continue Shopping</button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cart.map((item, index) => (
                <div key={index} className="cart-item">
                  <div className="item-emoji">{item.emoji}</div>
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p>Size: {item.selectedSize} | Color: {item.selectedColor}</p>
                    <p className="item-price">${item.price}</p>
                  </div>
                  <div className="item-quantity">
                    <button onClick={() => updateQuantity(index, Math.max(1, item.quantity - 1))}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(index, item.quantity + 1)}>+</button>
                  </div>
                  <div className="item-total">${(item.price * item.quantity).toFixed(2)}</div>
                  <button className="btn-remove" onClick={() => removeFromCart(index)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="summary-row">
                <span>Tax (10%):</span>
                <span>${(total * 0.1).toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${(total + total * 0.1).toFixed(2)}</span>
              </div>
              <button className="btn-checkout" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
              <button className="btn-continue-shopping" onClick={() => navigate('/products')}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
