const express = require('express');
const { body } = require('express-validator');
const { verifyToken, requireRole, getCurrentUser } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// Registration
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required')
  ],
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  authController.login
);

// Refresh token
router.post('/refresh-token', verifyToken, authController.refreshToken);

// Logout
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
