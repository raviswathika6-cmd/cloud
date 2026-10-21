const express = require('express');
const { body } = require('express-validator');
const { verifyToken, getCurrentUser } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// All payment routes require authentication
router.use(verifyToken, getCurrentUser);

// Create payment intent
router.post(
  '/create-intent',
  [
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Invalid currency code')
  ],
  paymentController.createPaymentIntent
);

// Confirm payment
router.post(
  '/confirm',
  [
    body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required')
  ],
  paymentController.confirmPayment
);

// Get payment methods
router.get('/methods', paymentController.getPaymentMethods);

// Get payment history
router.get('/history', paymentController.getPaymentHistory);

// Refund payment
router.post('/:paymentId/refund', paymentController.refundPayment);

module.exports = router;
