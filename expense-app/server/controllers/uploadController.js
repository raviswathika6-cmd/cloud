const multer = require('multer');
const AWS = require('aws-sdk');
const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png').split(',');
    const ext = path.extname(file.originalname).substring(1).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`));
    }
  }
});

// Upload receipt
const uploadReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const userId = req.user.id;
    const receiptId = uuidv4();
    const fileName = `${userId}/${receiptId}${path.extname(req.file.originalname)}`;

    // Upload to S3
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      Metadata: {
        'original-filename': req.file.originalname,
        'uploaded-by': userId
      }
    };

    await s3.upload(params).promise();

    // Generate S3 URL
    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    // Save receipt metadata to database
    const result = await pool.query(
      `INSERT INTO receipts 
       (id, user_id, file_name, file_url, file_size, file_type, s3_key, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        receiptId,
        userId,
        req.file.originalname,
        fileUrl,
        req.file.size,
        path.extname(req.file.originalname).substring(1),
        fileName,
        JSON.stringify({
          mimetype: req.file.mimetype,
          encoding: req.file.encoding
        })
      ]
    );

    // Log audit
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id)
       VALUES ($1, 'receipt_uploaded', 'receipt', $2)`,
      [userId, receiptId]
    );

    res.status(201).json({
      message: 'Receipt uploaded successfully',
      receipt: result.rows[0]
    });
  } catch (error) {
    console.error('Error uploading receipt:', error);
    res.status(500).json({ 
      message: error.message || 'Internal server error' 
    });
  }
};

// Get receipts
const getReceipts = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM receipts WHERE user_id = $1 ORDER BY uploaded_at DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete receipt
const deleteReceipt = async (req, res) => {
  try {
    const { receiptId } = req.params;
    const userId = req.user.id;

    // Get receipt details
    const receipt = await pool.query(
      'SELECT * FROM receipts WHERE id = $1 AND user_id = $2',
      [receiptId, userId]
    );

    if (receipt.rows.length === 0) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    const receiptData = receipt.rows[0];

    // Delete from S3
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: receiptData.s3_key
    };

    await s3.deleteObject(params).promise();

    // Delete from database
    await pool.query(
      'DELETE FROM receipts WHERE id = $1 AND user_id = $2',
      [receiptId, userId]
    );

    // Log audit
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id)
       VALUES ($1, 'receipt_deleted', 'receipt', $2)`,
      [userId, receiptId]
    );

    res.json({ message: 'Receipt deleted successfully' });
  } catch (error) {
    console.error('Error deleting receipt:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  upload,
  uploadReceipt,
  getReceipts,
  deleteReceipt
};
