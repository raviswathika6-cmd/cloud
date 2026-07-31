import React, { useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import './ProductDetailsPage.css';

const PRODUCT_DETAILS = {
  1: { name: 'Summer Floral Dress', price: 49.99, emoji: '🌸', description: 'Perfect for sunny days with beautiful floral patterns', sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Red', 'Blue', 'Yellow'] },
  2: { name: 'Evening Gown', price: 129.99, emoji: '✨', description: 'Elegant evening wear for special occasions', sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Silver', 'Gold'] },
  3: { name: 'Casual Midi Dress', price: 59.99, emoji: '👗', description: 'Comfortable and stylish for everyday wear', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], colors: ['Black', 'White', 'Navy'] },
  4: { name: 'Cocktail Dress', price: 89.99, emoji: '🎉', description: 'Perfect for parties and cocktail events', sizes: ['S', 'M', 'L', 'XL'], colors: ['Red', 'Black', 'Pink'] },
  5: { name: 'Beach Sundress', price: 39.99, emoji: '☀️', description: 'Light and breezy for beach days', sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Pink', 'Turquoise'] },
  6: { name: 'Vintage Style Dress', price: 69.99, emoji: '🕰️', description: 'Retro charm with modern comfort', sizes: ['S', 'M', 'L', 'XL'], colors: ['Polka Dot', 'Stripes'] },
  7: { name: 'Black Tie Gown', price: 149.99, emoji: '💎', description: 'Formal wear for the most elegant occasions', sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Burgundy'] },
  8: { name: 'Boho Maxi Dress', price: 79.99, emoji: '🌿', description: 'Free-spirited bohemian style', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Earth Tone', 'Multicolor'] },
};

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  const product = PRODUCT_DETAILS[id];

  if (!product) {
    return (
      <div className="product-details-page">
        <div className="error-message">
          <p>Product not found</p>
          <button onClick={() => navigate('/products')}>Back to Shop</button>
        </div>
      </div>
    );
  }

  if (!selectedColor) {
    setSelectedColor(product.colors[0]);
  }

  const handleAddToCart = () => {
    addToCart({
      id,
      name: product.name,
      price: product.price,
      emoji: product.emoji,
      selectedSize,
      selectedColor,
      quantity,
    });
    alert('Added to cart!');
  };

  return (
    <div className="product-details-page">
      <div className="page-container">
        <button className="btn-back" onClick={() => navigate('/products')}>
          ← Back to Products
        </button>

        <div className="details-content">
          <div className="product-display">
            <div className="product-emoji-large">{product.emoji}</div>
          </div>

          <div className="product-info">
            <h1>{product.name}</h1>
            <p className="price">${product.price}</p>
            <p className="description">{product.description}</p>

            <div className="selection-group">
              <label>Size</label>
              <div className="size-options">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="selection-group">
              <label>Color</label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="color-select"
              >
                {product.colors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>

            <div className="selection-group">
              <label>Quantity</label>
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <input type="number" value={quantity} readOnly />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn-add-to-cart" onClick={handleAddToCart}>
                🛒 Add to Cart
              </button>
              <button className="btn-buy-now" onClick={() => { handleAddToCart(); navigate('/cart'); }}>
                Buy Now
              </button>
            </div>

            <div className="product-info-section">
              <h3>Product Details</h3>
              <ul>
                <li>High-quality fabric</li>
                <li>Comfortable fit</li>
                <li>Easy care and maintenance</li>
                <li>30-day return policy</li>
                <li>Free shipping on orders over $50</li>
              </ul>
            </div>

            <div className="product-info-section">
              <h3>Customer Reviews</h3>
              <div className="reviews">
                <div className="review">
                  <span className="stars">⭐⭐⭐⭐⭐</span>
                  <p>"Great quality and comfortable!"</p>
                </div>
                <div className="review">
                  <span className="stars">⭐⭐⭐⭐</span>
                  <p>"Perfect fit, arrived quickly"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
