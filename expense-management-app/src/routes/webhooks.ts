import { Router, Response, Request } from 'express';
import Stripe from 'stripe';
import { query } from '../config/database';
import { ValidationError } from '../middleware/errorHandler';

export const webhookRoutes = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// Webhook to handle Stripe events
webhookRoutes.post('/stripe', async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'] as string;

    if (!sig) {
      return res.status(400).json({ message: 'Missing stripe-signature header' });
    }

    let event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        JSON.stringify(req.body),
        sig,
        WEBHOOK_SECRET
      );
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error.message);
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    // Log webhook event
    const webhookResult = await query(
      `INSERT INTO webhooks (event_type, external_id, payload, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [event.type, event.id, JSON.stringify(event.data), 'received']
    );

    const webhookId = webhookResult.rows[0].id;

    // Process event
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.refunded':
          await handleChargeRefunded(event.data.object as Stripe.Charge);
          break;

        case 'charge.dispute.created':
          await handleChargeDispute(event.data.object as Stripe.Dispute);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Mark webhook as processed
      await query(
        `UPDATE webhooks SET status = $1, processed_at = CURRENT_TIMESTAMP WHERE id = $2`,
        ['processed', webhookId]
      );

      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Error processing webhook:', error);

      // Mark webhook as failed
      await query(
        `UPDATE webhooks SET status = $1, error_message = $2, retry_count = retry_count + 1 
         WHERE id = $3`,
        ['failed', error.message, webhookId]
      );

      res.status(500).json({ message: 'Webhook processing failed' });
    }
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Payment intent succeeded
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { id, charges, metadata } = paymentIntent;

  const charge = charges.data[0];
  if (!charge) return;

  // Update payment record
  const paymentResult = await query(
    `SELECT * FROM payments WHERE stripe_payment_id = $1`,
    [id]
  );

  if (paymentResult.rows.length === 0) {
    console.warn(`Payment record not found for intent: ${id}`);
    return;
  }

  const payment = paymentResult.rows[0];

  // Update payment status
  await query(
    `UPDATE payments 
     SET status = $1, stripe_charge_id = $2, metadata = $3, updated_at = CURRENT_TIMESTAMP
     WHERE stripe_payment_id = $4`,
    ['succeeded', charge.id, JSON.stringify(charge.metadata), id]
  );

  // Update expense status to reimbursed
  if (payment.expense_id) {
    await query(
      `UPDATE expenses SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      ['reimbursed', payment.expense_id]
    );
  }

  console.log(`✅ Payment succeeded: ${id}`);
}

// Payment intent failed
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { id, last_payment_error } = paymentIntent;

  // Update payment record
  await query(
    `UPDATE payments 
     SET status = $1, metadata = $2, updated_at = CURRENT_TIMESTAMP
     WHERE stripe_payment_id = $3`,
    ['failed', JSON.stringify({ error: last_payment_error }), id]
  );

  // Update expense status to pending
  const paymentResult = await query(
    'SELECT expense_id FROM payments WHERE stripe_payment_id = $1',
    [id]
  );

  if (paymentResult.rows.length > 0 && paymentResult.rows[0].expense_id) {
    await query(
      `UPDATE expenses SET status = $1 WHERE id = $2`,
      ['pending', paymentResult.rows[0].expense_id]
    );
  }

  console.log(`❌ Payment failed: ${id}`);
}

// Charge refunded
async function handleChargeRefunded(charge: Stripe.Charge) {
  // Update payment record
  await query(
    `UPDATE payments 
     SET status = $1, updated_at = CURRENT_TIMESTAMP
     WHERE stripe_charge_id = $2`,
    ['refunded', charge.id]
  );

  console.log(`🔄 Charge refunded: ${charge.id}`);
}

// Charge dispute
async function handleChargeDispute(dispute: Stripe.Dispute) {
  console.log(`⚠️ Charge disputed: ${dispute.charge}`);

  // Log dispute
  await query(
    `UPDATE webhooks 
     SET metadata = $1
     WHERE external_id = $2`,
    [JSON.stringify(dispute), dispute.id]
  );
}

// Webhook health check
webhookRoutes.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'Webhook service running' });
});

// Get webhook logs (admin only)
webhookRoutes.get('/logs', async (req: Request, res: Response) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let whereClause = '1=1';
    let params: any[] = [];

    if (status) {
      whereClause += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    const result = await query(
      `SELECT * FROM webhooks 
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    res.status(200).json({
      webhooks: result.rows,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error: any) {
    console.error('Get webhook logs error:', error);
    res.status(500).json({ message: 'Failed to fetch webhook logs' });
  }
});
