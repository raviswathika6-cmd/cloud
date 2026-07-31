import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductListingPage.css';

const SAMPLE_PRODUCTS = [
  { id: 1, name: 'Summer Floral Dress', price: 49.99, emoji: '🌸', category: 'casual' },
  { id: 2, name: 'Evening Gown', price: 129.99, emoji: '✨', category: 'formal' },
  { id: 3, name: 'Casual Midi Dress', price: 59.99, emoji: '👗', category: 'casual' },
  { id: 4, name: 'Cocktail Dress', price: 89.99, emoji: '🎉', category: 'formal' },
  { id: 5, name: 'Beach Sundress', price: 39.99, emoji: '☀️', category: 'summer' },
  { id: 6, name: 'Vintage Style Dress', price: 69.99, emoji: '🕰️', category: 'casual' },
  { id: 7, name: 'Black Tie Gown', price: 149.99, emoji: '💎', category: 'formal' },
  { id: 8, name: 'Boho Maxi Dress', price: 79.99, emoji: '🌿', category: 'casual' },
];

export default function ProductListingPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  let filtered = SAMPLE_PRODUCTS;

  if (selectedCategory !== 'all') {
    filtered = filtered.filter((p) => p.category === selectedCategory);
  }

  if (searchTerm) {
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (sortBy === 'price-low') {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  } else {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="product-listing-page">
      <div className="page-container">
        <h1>Shop Our Collection</h1>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search dresses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
              <option value="summer">Summer</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="results-info">
          <p>Showing {filtered.length} product(s)</p>
        </div>

        {/* Products Grid */}
        {filtered.length > 0 ? (
          <div className="products-grid">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div className="product-image">{product.emoji}</div>
                <h3>{product.name}</h3>
                <p className="product-price">${product.price}</p>
                <div className="product-actions">
                  <button className="btn-details">View Details</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No products found matching your criteria</p>
            <button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
