const express = require('express');
const { body } = require('express-validator');
const { verifyToken, getCurrentUser } = require('../middleware/auth');
const expenseController = require('../controllers/expenseController');

const router = express.Router();

// All expense routes require authentication
router.use(verifyToken, getCurrentUser);

// Get all expenses with filters
router.get('/', expenseController.getExpenses);

// Get single expense
router.get('/:expenseId', expenseController.getExpense);

// Create new expense
router.post(
  '/',
  [
    body('category').notEmpty().withMessage('Category is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('expenseDate').isISO8601().withMessage('Invalid date format')
  ],
  expenseController.createExpense
);

// Update expense
router.put(
  '/:expenseId',
  [
    body('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('expenseDate').optional().isISO8601().withMessage('Invalid date format')
  ],
  expenseController.updateExpense
);

// Delete expense
router.delete('/:expenseId', expenseController.deleteExpense);

module.exports = router;
