import { Router, Response } from 'express';
import Joi from 'joi';
import Stripe from 'stripe';
import { query } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ValidationError, NotFoundError } from '../middleware/errorHandler';

export const paymentRoutes = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

const paymentIntentSchema = Joi.object({
  expense_id: Joi.string().uuid().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).default('usd')
});

const confirmPaymentSchema = Joi.object({
  payment_intent_id: Joi.string().required(),
  payment_method_id: Joi.string().required()
});

// Create payment intent for expense
paymentRoutes.post('/create-intent', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = paymentIntentSchema.validate(req.body);
    if (error) throw new ValidationError(error.details[0].message);

    if (!req.user) throw new ValidationError('User not authenticated');

    const { expense_id, amount, currency } = value;

    // Verify expense exists and belongs to user
    const expenseResult = await query(
      'SELECT * FROM expenses WHERE id = $1 AND user_id = $2',
      [expense_id, req.user.id]
    );

    if (expenseResult.rows.length === 0) {
      throw new NotFoundError('Expense not found or access denied');
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: (currency || 'usd').toLowerCase(),
      metadata: {
        userId: req.user.id,
        expenseId: expense_id
      }
    });

    // Create payment record
    const paymentResult = await query(
      `INSERT INTO payments (user_id, expense_id, stripe_payment_id, amount, currency, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, expense_id, paymentIntent.id, amount, currency, 'pending']
    );

    res.status(201).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      payment: paymentResult.rows[0]
    });
  } catch (error: any) {
    console.error('Create payment intent error:', error);
    if (error instanceof (ValidationError || NotFoundError)) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Failed to create payment intent' });
    }
  }
});

// Confirm payment
paymentRoutes.post('/confirm', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = confirmPaymentSchema.validate(req.body);
    if (error) throw new ValidationError(error.details[0].message);

    if (!req.user) throw new ValidationError('User not authenticated');

    const { payment_intent_id, payment_method_id } = value;

    // Get payment record
    const paymentResult = await query(
      'SELECT * FROM payments WHERE stripe_payment_id = $1 AND user_id = $2',
      [payment_intent_id, req.user.id]
    );

    if (paymentResult.rows.length === 0) {
      throw new NotFoundError('Payment not found');
    }

    // Confirm with Stripe
    const confirmedIntent = await stripe.paymentIntents.confirm(payment_intent_id, {
      payment_method: payment_method_id
    });

    // Update payment status
    const status = confirmedIntent.status === 'succeeded' ? 'succeeded' : 'processing';

    const updatedPayment = await query(
      `UPDATE payments 
       SET status = $1, stripe_charge_id = $2, updated_at = CURRENT_TIMESTAMP
       WHERE stripe_payment_id = $3
       RETURNING *`,
      [status, confirmedIntent.charges.data[0]?.id || null, payment_intent_id]
    );

    // Update expense status if payment succeeded
    if (status === 'succeeded') {
      await query(
        'UPDATE expenses SET status = $1 WHERE id = $2',
        ['reimbursed', paymentResult.rows[0].expense_id]
      );
    }

    res.status(200).json({
      message: 'Payment confirmed successfully',
      payment: updatedPayment.rows[0],
      status: confirmedIntent.status
    });
  } catch (error: any) {
    console.error('Confirm payment error:', error);
    if (error instanceof (ValidationError || NotFoundError)) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Payment confirmation failed' });
    }
  }
});

// Get payment status
paymentRoutes.get('/:paymentId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new ValidationError('User not authenticated');

    const { paymentId } = req.params;

    const paymentResult = await query(
      'SELECT * FROM payments WHERE stripe_payment_id = $1 AND user_id = $2',
      [paymentId, req.user.id]
    );

    if (paymentResult.rows.length === 0) {
      throw new NotFoundError('Payment not found');
    }

    const payment = paymentResult.rows[0];

    // Get status from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

    res.status(200).json({
      payment: {
        ...payment,
        stripeStatus: paymentIntent.status
      }
    });
  } catch (error: any) {
    console.error('Get payment error:', error);
    if (error instanceof (ValidationError || NotFoundError)) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Failed to fetch payment' });
    }
  }
});

// List user's payments
paymentRoutes.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new ValidationError('User not authenticated');

    const { status, limit = 50, offset = 0 } = req.query;

    let whereClause = 'user_id = $1';
    let params: any[] = [req.user.id];

    if (status) {
      whereClause += ' AND status = $2';
      params.push(status);
    }

    const result = await query(
      `SELECT p.*, e.title as expense_title 
       FROM payments p 
       LEFT JOIN expenses e ON p.expense_id = e.id
       WHERE ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    res.status(200).json({
      payments: result.rows,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error: any) {
    console.error('List payments error:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

// Refund payment
paymentRoutes.post('/:paymentId/refund', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new ValidationError('User not authenticated');

    const { paymentId } = req.params;

    const paymentResult = await query(
      'SELECT * FROM payments WHERE stripe_payment_id = $1 AND user_id = $2',
      [paymentId, req.user.id]
    );

    if (paymentResult.rows.length === 0) {
      throw new NotFoundError('Payment not found');
    }

    const payment = paymentResult.rows[0];

    if (!payment.stripe_charge_id) {
      throw new ValidationError('Cannot refund: no charge found');
    }

    // Create refund with Stripe
    const refund = await stripe.refunds.create({
      charge: payment.stripe_charge_id
    });

    // Update payment status
    const updatedPayment = await query(
      `UPDATE payments 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE stripe_payment_id = $2
       RETURNING *`,
      ['refunded', paymentId]
    );

    res.status(200).json({
      message: 'Refund processed successfully',
      payment: updatedPayment.rows[0],
      refundId: refund.id
    });
  } catch (error: any) {
    console.error('Refund error:', error);
    if (error instanceof (ValidationError || NotFoundError)) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Failed to process refund' });
    }
  }
});
