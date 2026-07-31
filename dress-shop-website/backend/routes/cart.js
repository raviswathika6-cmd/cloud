const express = require('express');
const router = express.Router();

// Cart stored in session/local storage on frontend
// This is a simple endpoint for cart validation
router.post('/validate', (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid cart data' });
    }

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
      valid: true,
      total: total.toFixed(2),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
