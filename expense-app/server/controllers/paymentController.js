const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Create payment intent
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd', description, expenseId } = req.body;
    const userId = req.user.id;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Get or create Stripe customer
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    const user = userResult.rows[0];

    let customerId;
    const paymentResult = await pool.query(
      'SELECT stripe_customer_id FROM payments WHERE user_id = $1 LIMIT 1',
      [userId]
    );

    if (paymentResult.rows.length > 0 && paymentResult.rows[0].stripe_customer_id) {
      customerId = paymentResult.rows[0].stripe_customer_id;
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        metadata: {
          userId
        }
      });
      customerId = customer.id;
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      description: description || 'Expense payment',
      metadata: {
        userId,
        expenseId: expenseId || null
      }
    });

    // Save payment record
    const paymentId = uuidv4();
    await pool.query(
      `INSERT INTO payments 
       (id, user_id, expense_id, stripe_payment_id, stripe_customer_id, amount, currency, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')`,
      [paymentId, userId, expenseId || null, paymentIntent.id, customerId, amount, currency.toUpperCase()]
    );

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Confirm payment
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = req.user.id;

    // Get payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        message: 'Payment not yet succeeded',
        status: paymentIntent.status 
      });
    }

    // Update payment record
    await pool.query(
      `UPDATE payments 
       SET status = 'succeeded', updated_at = CURRENT_TIMESTAMP
       WHERE stripe_payment_id = $1 AND user_id = $2`,
      [paymentIntentId, userId]
    );

    // Log audit
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id)
       VALUES ($1, 'payment_confirmed', 'payment', $2)`,
      [userId, paymentIntentId]
    );

    res.json({ message: 'Payment confirmed successfully' });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get payment methods
const getPaymentMethods = async (req, res) => {
  try {
    const userId = req.user.id;

    const paymentResult = await pool.query(
      'SELECT stripe_customer_id FROM payments WHERE user_id = $1 LIMIT 1',
      [userId]
    );

    if (paymentResult.rows.length === 0) {
      return res.json([]);
    }

    const customerId = paymentResult.rows[0].stripe_customer_id;
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card'
    });

    res.json(paymentMethods.data);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get payment history
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Refund payment
const refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    // Get payment details
    const paymentResult = await pool.query(
      'SELECT * FROM payments WHERE id = $1 AND user_id = $2',
      [paymentId, userId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const payment = paymentResult.rows[0];

    if (payment.stripe_payment_id) {
      // Create refund on Stripe
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripe_payment_id
      });

      // Update payment status
      await pool.query(
        `UPDATE payments 
         SET status = 'refunded', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [paymentId]
      );

      // Log audit
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id)
         VALUES ($1, 'payment_refunded', 'payment', $2)`,
        [userId, paymentId]
      );

      return res.json({ 
        message: 'Payment refunded successfully',
        refundId: refund.id 
      });
    }

    res.status(400).json({ message: 'Cannot refund this payment' });
  } catch (error) {
    console.error('Error refunding payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getPaymentMethods,
  getPaymentHistory,
  refundPayment
};
