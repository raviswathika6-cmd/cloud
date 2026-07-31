import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const FEATURED_PRODUCTS = [
  { id: 1, name: 'Summer Floral Dress', price: 49.99, emoji: '🌸' },
  { id: 2, name: 'Evening Gown', price: 129.99, emoji: '✨' },
  { id: 3, name: 'Casual Midi Dress', price: 59.99, emoji: '👗' },
  { id: 4, name: 'Cocktail Dress', price: 89.99, emoji: '🎉' },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Dress Shop</h1>
          <p>Discover the latest fashion trends and timeless classics</p>
          <button className="btn-shop-now" onClick={() => navigate('/products')}>
            Shop Now
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="feature-card">
          <span className="feature-icon">🚚</span>
          <h3>Free Shipping</h3>
          <p>On orders over $50</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🔄</span>
          <h3>Easy Returns</h3>
          <p>30-day return policy</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">💳</span>
          <h3>Secure Payment</h3>
          <p>100% secure checkout</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">⭐</span>
          <h3>Quality Guarantee</h3>
          <p>Premium quality dresses</p>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        <h2>Featured Products</h2>
        <div className="products-grid">
          {FEATURED_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="product-card"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <div className="product-emoji">{product.emoji}</div>
              <h3>{product.name}</h3>
              <p className="product-price">${product.price}</p>
              <button className="btn-view">View Details</button>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          <div className="category-card" onClick={() => navigate('/products?category=casual')}>
            <span className="emoji">👕</span>
            <h3>Casual Dresses</h3>
          </div>
          <div className="category-card" onClick={() => navigate('/products?category=formal')}>
            <span className="emoji">✨</span>
            <h3>Formal Wear</h3>
          </div>
          <div className="category-card" onClick={() => navigate('/products?category=summer')}>
            <span className="emoji">☀️</span>
            <h3>Summer Collection</h3>
          </div>
          <div className="category-card" onClick={() => navigate('/products?category=sale')}>
            <span className="emoji">🎉</span>
            <h3>On Sale</h3>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter">
        <h2>Stay Updated</h2>
        <p>Subscribe to get special offers and updates</p>
        <div className="newsletter-form">
          <input type="email" placeholder="Enter your email" />
          <button>Subscribe</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>About Us</h4>
            <p>Your one-stop shop for elegant and stylish dresses for every occasion.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#products">Shop</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: info@dressshop.com</p>
            <p>Phone: 1-800-DRESS-SHOP</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Dress Shop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
