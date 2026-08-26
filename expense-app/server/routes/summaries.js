const express = require('express');
const { body } = require('express-validator');
const { verifyToken, getCurrentUser } = require('../middleware/auth');
const summaryController = require('../controllers/summaryController');

const router = express.Router();

// All summary routes require authentication
router.use(verifyToken, getCurrentUser);

// Generate expense summary
router.post(
  '/generate',
  [
    body('summaryType').optional().isIn(['daily', 'weekly', 'monthly', 'yearly']),
    body('startDate').isISO8601().withMessage('Invalid start date'),
    body('endDate').isISO8601().withMessage('Invalid end date')
  ],
  summaryController.generateExpenseSummary
);

// Get all summaries
router.get('/', summaryController.getExpenseSummaries);

// Get single summary
router.get('/:summaryId', summaryController.getExpenseSummary);

// Get quick insights
router.get('/quick/insights', summaryController.getQuickInsights);

module.exports = router;
