const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const products = [
  { id: 1, name: 'Laptop', price: 999, description: 'High-performance laptop for work and play.', image: 'https://via.placeholder.com/150' },
  { id: 2, name: 'Smartphone', price: 699, description: 'Latest model with advanced camera features.', image: 'https://via.placeholder.com/150' },
  { id: 3, name: 'Headphones', price: 199, description: 'Noise-canceling over-ear headphones.', image: 'https://via.placeholder.com/150' },
  { id: 4, name: 'Smartwatch', price: 249, description: 'Track your fitness and stay connected.', image: 'https://via.placeholder.com/150' }
];

let cart = [];

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/cart', (req, res) => {
  res.json(cart);
});

app.post('/api/cart', (req, res) => {
  const { productId } = req.body;
  const product = products.find(p => p.id === productId);
  if (product) {
    cart.push(product);
    res.status(201).json(cart);
  } else {
    res.status(404).send('Product not found');
  }
});

app.delete('/api/cart', (req, res) => {
  cart = [];
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
