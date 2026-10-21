const express = require('express');
const { verifyToken, getCurrentUser } = require('../middleware/auth');
const { upload, uploadReceipt, getReceipts, deleteReceipt } = require('../controllers/uploadController');

const router = express.Router();

// All upload routes require authentication
router.use(verifyToken, getCurrentUser);

// Upload receipt
router.post('/receipt', upload.single('file'), uploadReceipt);

// Get receipts
router.get('/', getReceipts);

// Delete receipt
router.delete('/:receiptId', deleteReceipt);

module.exports = router;
