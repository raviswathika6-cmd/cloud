const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');
const Order = require('../models/Order');
const router = express.Router();

// Create payment intent
router.post('/create-intent', async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({ error: 'Amount and orderId required' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: { orderId },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm payment
router.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentId: paymentIntentId, status: 'confirmed' },
      { new: true }
    );

    res.json({
      message: 'Payment confirmed',
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
