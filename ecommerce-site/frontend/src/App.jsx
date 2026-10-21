import React, { useState, useEffect } from 'react';

const App = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error fetching products:', err));

    fetch('http://localhost:5000/api/cart')
      .then(res => res.json())
      .then(data => setCart(data))
      .catch(err => console.error('Error fetching cart:', err));
  }, []);

  const addToCart = (productId) => {
    fetch('http://localhost:5000/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    })
      .then(res => res.json())
      .then(data => setCart(data))
      .catch(err => console.error('Error adding to cart:', err));
  };

  const checkout = () => {
    fetch('http://localhost:5000/api/cart', { method: 'DELETE' })
      .then(() => {
        setCart([]);
        alert('Checkout successful!');
      })
      .catch(err => console.error('Error during checkout:', err));
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans' }}>
      <h1>My E-commerce Shop</h1>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 2 }}>
          <h2>Products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {products.map(product => (
              <div key={product.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px' }}>
                <img src={product.image} alt={product.name} style={{ width: '100%' }} />
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p><strong>${product.price}</strong></p>
                <button onClick={() => addToCart(product.id)} style={{ cursor: 'pointer', padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, borderLeft: '1px solid #ccc', paddingLeft: '20px' }}>
          <h2>Shopping Cart</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <div>
              <ul>
                {cart.map((item, index) => (
                  <li key={index}>{item.name} - ${item.price}</li>
                ))}
              </ul>
              <p><strong>Total: ${cart.reduce((sum, item) => sum + item.price, 0)}</strong></p>
              <button onClick={checkout} style={{ cursor: 'pointer', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', width: '100%' }}>
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
