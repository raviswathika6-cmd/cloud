import { Router, Response } from 'express';
import Joi from 'joi';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { authenticate, AuthRequest, authorizeOwnerOrAdmin } from '../middleware/auth';
import { ValidationError, NotFoundError, ForbiddenError } from '../middleware/errorHandler';

export const expenseRoutes = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/receipts/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF are allowed.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Validation schema for creating expense
const createExpenseSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string(),
  amount: Joi.number().positive().required(),
  category_id: Joi.string().uuid(),
  expense_date: Joi.date().required(),
  payment_method: Joi.string().valid('cash', 'card', 'check', 'online'),
  notes: Joi.string()
});

// Create expense with receipt upload
expenseRoutes.post(
  '/',
  authenticate,
  upload.single('receipt'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { error, value } = createExpenseSchema.validate(req.body);
      if (error) throw new ValidationError(error.details[0].message);

      if (!req.user) throw new ValidationError('User not authenticated');

      const {
        title,
        description,
        amount,
        category_id,
        expense_date,
        payment_method,
        notes
      } = value;

      const receiptUrl = req.file ? `/uploads/receipts/${req.file.filename}` : null;
      const receiptFileName = req.file ? req.file.originalname : null;

      const result = await query(
        `INSERT INTO expenses 
        (user_id, title, description, amount, category_id, expense_date, payment_method, receipt_url, receipt_file_name, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          req.user.id,
          title,
          description || null,
          amount,
          category_id || null,
          expense_date,
          payment_method || 'cash',
          receiptUrl,
          receiptFileName,
          notes || null
        ]
      );

      res.status(201).json({
        message: 'Expense created successfully',
        expense: result.rows[0]
      });
    } catch (error: any) {
      console.error('Create expense error:', error);
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Failed to create expense' });
      }
    }
  }
);

// Get all expenses for current user
expenseRoutes.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new ValidationError('User not authenticated');

    const { status, category, startDate, endDate, limit = 50, offset = 0 } = req.query;

    let whereClause = 'e.user_id = $1';
    let params: any[] = [req.user.id];
    let paramCount = 1;

    if (status) {
      paramCount++;
      whereClause += ` AND e.status = $${paramCount}`;
      params.push(status);
    }

    if (category) {
      paramCount++;
      whereClause += ` AND e.category_id = $${paramCount}`;
      params.push(category);
    }

    if (startDate) {
      paramCount++;
      whereClause += ` AND e.expense_date >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      whereClause += ` AND e.expense_date <= $${paramCount}`;
      params.push(endDate);
    }

    paramCount++;
    const limitParam = paramCount;
    paramCount++;
    const offsetParam = paramCount;

    params.push(limit);
    params.push(offset);

    const result = await query(
      `SELECT e.*, c.name as category_name 
       FROM expenses e 
       LEFT JOIN expense_categories c ON e.category_id = c.id
       WHERE ${whereClause}
       ORDER BY e.expense_date DESC
       LIMIT $${limitParam} OFFSET $${offsetParam}`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM expenses e WHERE ${whereClause.split(' AND ')[0]} ${
        whereClause.includes('AND')
          ? 'AND ' + whereClause.split(' AND ').slice(1).join(' AND ')
          : ''
      }`,
      params.slice(0, paramCount - 2)
    );

    res.status(200).json({
      expenses: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error: any) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
});

// Get single expense
expenseRoutes.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new ValidationError('User not authenticated');

    const { id } = req.params;

    const result = await query(
      `SELECT e.*, c.name as category_name 
       FROM expenses e 
       LEFT JOIN expense_categories c ON e.category_id = c.id
       WHERE e.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Expense not found');
    }

    const expense = result.rows[0];

    // Authorization check
    if (expense.user_id !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenError('Access denied');
    }

    res.status(200).json({ expense });
  } catch (error: any) {
    if (error instanceof (NotFoundError || ForbiddenError)) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      console.error('Get expense error:', error);
      res.status(500).json({ message: 'Failed to fetch expense' });
    }
  }
});

// Update expense
expenseRoutes.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new ValidationError('User not authenticated');

    const { id } = req.params;

    // Get existing expense
    const expenseResult = await query(
      'SELECT * FROM expenses WHERE id = $1',
      [id]
    );

    if (expenseResult.rows.length === 0) {
      throw new NotFoundError('Expense not found');
    }

    const expense = expenseResult.rows[0];

    // Authorization check
    if (expense.user_id !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenError('Access denied');
    }

    const { error, value } = createExpenseSchema.validate(req.body);
    if (error) throw new ValidationError(error.details[0].message);

    const {
      title,
      description,
      amount,
      category_id,
      expense_date,
      payment_method,
      notes
    } = value;

    const result = await query(
      `UPDATE expenses 
       SET title = $1, description = $2, amount = $3, category_id = $4, 
           expense_date = $5, payment_method = $6, notes = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [
        title,
        description || null,
        amount,
        category_id || null,
        expense_date,
        payment_method || 'cash',
        notes || null,
        id
      ]
    );

    res.status(200).json({
      message: 'Expense updated successfully',
      expense: result.rows[0]
    });
  } catch (error: any) {
    console.error('Update expense error:', error);
    if (error instanceof (ValidationError || NotFoundError || ForbiddenError)) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Failed to update expense' });
    }
  }
});

// Delete expense
expenseRoutes.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new ValidationError('User not authenticated');

    const { id } = req.params;

    // Get existing expense
    const expenseResult = await query(
      'SELECT * FROM expenses WHERE id = $1',
      [id]
    );

    if (expenseResult.rows.length === 0) {
      throw new NotFoundError('Expense not found');
    }

    const expense = expenseResult.rows[0];

    // Authorization check
    if (expense.user_id !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenError('Access denied');
    }

    await query('DELETE FROM expenses WHERE id = $1', [id]);

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error: any) {
    console.error('Delete expense error:', error);
    if (error instanceof (ValidationError || NotFoundError || ForbiddenError)) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Failed to delete expense' });
    }
  }
});

// Get expense categories
expenseRoutes.get('/categories/list', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT id, name, description, icon FROM expense_categories ORDER BY name'
    );

    res.status(200).json({
      categories: result.rows
    });
  } catch (error: any) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});
