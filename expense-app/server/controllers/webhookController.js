const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../config/database');

// Handle Stripe webhook
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark webhook as received
    await pool.query(
      `UPDATE payments 
       SET webhook_received = true 
       WHERE stripe_payment_id = $1`,
      [event.data.object.id]
    );

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Handle payment succeeded
const handlePaymentSucceeded = async (paymentIntent) => {
  try {
    const result = await pool.query(
      `UPDATE payments 
       SET status = 'succeeded', updated_at = CURRENT_TIMESTAMP
       WHERE stripe_payment_id = $1
       RETURNING *`,
      [paymentIntent.id]
    );

    if (result.rows.length > 0) {
      const payment = result.rows[0];

      // Update expense to mark as paid
      if (payment.expense_id) {
        await pool.query(
          `UPDATE expenses 
           SET payment_method = 'paid_online', updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [payment.expense_id]
        );
      }

      console.log(`Payment succeeded: ${paymentIntent.id}`);
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
};

// Handle payment failed
const handlePaymentFailed = async (paymentIntent) => {
  try {
    await pool.query(
      `UPDATE payments 
       SET status = 'failed', updated_at = CURRENT_TIMESTAMP
       WHERE stripe_payment_id = $1`,
      [paymentIntent.id]
    );

    console.log(`Payment failed: ${paymentIntent.id}`);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
};

// Handle charge refunded
const handleChargeRefunded = async (charge) => {
  try {
    const paymentIntentId = charge.payment_intent;

    await pool.query(
      `UPDATE payments 
       SET status = 'refunded', updated_at = CURRENT_TIMESTAMP
       WHERE stripe_payment_id = $1`,
      [paymentIntentId]
    );

    console.log(`Charge refunded: ${charge.id}`);
  } catch (error) {
    console.error('Error handling charge refunded:', error);
  }
};

// Handle subscription updated
const handleSubscriptionUpdated = async (subscription) => {
  try {
    console.log(`Subscription updated: ${subscription.id}`);
    // Add custom logic for subscription updates
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
};

module.exports = {
  handleStripeWebhook
};
