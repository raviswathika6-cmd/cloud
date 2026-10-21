const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

// Get all expenses for a user
const getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, category, status } = req.query;

    let query = `
      SELECT e.*, r.file_url as receipt_url
      FROM expenses e
      LEFT JOIN receipts r ON e.receipt_id = r.id
      WHERE e.user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND e.expense_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND e.expense_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (category) {
      query += ` AND e.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (status === 'approved') {
      query += ` AND e.is_approved = true`;
    } else if (status === 'pending') {
      query += ` AND e.is_approved = false`;
    }

    query += ` ORDER BY e.expense_date DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single expense
const getExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT e.*, r.file_url as receipt_url
       FROM expenses e
       LEFT JOIN receipts r ON e.receipt_id = r.id
       WHERE e.id = $1 AND e.user_id = $2`,
      [expenseId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new expense
const createExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const {
      category,
      amount,
      currency = 'USD',
      description,
      expenseDate,
      paymentMethod = 'cash',
      tags = [],
      receiptId
    } = req.body;

    const expenseId = uuidv4();

    const result = await pool.query(
      `INSERT INTO expenses 
       (id, user_id, category, amount, currency, description, expense_date, 
        payment_method, tags, receipt_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        expenseId,
        userId,
        category,
        amount,
        currency,
        description || null,
        expenseDate,
        paymentMethod,
        tags.length > 0 ? tags : null,
        receiptId || null
      ]
    );

    // Log audit
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id)
       VALUES ($1, 'expense_created', 'expense', $2)`,
      [userId, expenseId]
    );

    res.status(201).json({
      message: 'Expense created successfully',
      expense: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update expense
const updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const userId = req.user.id;
    const {
      category,
      amount,
      currency,
      description,
      expenseDate,
      paymentMethod,
      tags,
      receiptId
    } = req.body;

    // Check if expense belongs to user
    const expenseCheck = await pool.query(
      'SELECT id FROM expenses WHERE id = $1 AND user_id = $2',
      [expenseId, userId]
    );

    if (expenseCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(category);
    }
    if (amount !== undefined) {
      updates.push(`amount = $${paramIndex++}`);
      values.push(amount);
    }
    if (currency !== undefined) {
      updates.push(`currency = $${paramIndex++}`);
      values.push(currency);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (expenseDate !== undefined) {
      updates.push(`expense_date = $${paramIndex++}`);
      values.push(expenseDate);
    }
    if (paymentMethod !== undefined) {
      updates.push(`payment_method = $${paramIndex++}`);
      values.push(paymentMethod);
    }
    if (tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      values.push(tags.length > 0 ? tags : null);
    }
    if (receiptId !== undefined) {
      updates.push(`receipt_id = $${paramIndex++}`);
      values.push(receiptId);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(expenseId, userId);

    const query = `
      UPDATE expenses
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex + 1} AND user_id = $${paramIndex + 2}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    // Log audit
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id)
       VALUES ($1, 'expense_updated', 'expense', $2)`,
      [userId, expenseId]
    );

    res.json({
      message: 'Expense updated successfully',
      expense: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id',
      [expenseId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Log audit
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id)
       VALUES ($1, 'expense_deleted', 'expense', $2)`,
      [userId, expenseId]
    );

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Approve expense (Admin only)
const approveExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const adminId = req.user.id;

    const result = await pool.query(
      `UPDATE expenses
       SET is_approved = true, approved_by = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [adminId, expenseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Log audit
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id)
       VALUES ($1, 'expense_approved', 'expense', $2)`,
      [adminId, expenseId]
    );

    res.json({
      message: 'Expense approved successfully',
      expense: result.rows[0]
    });
  } catch (error) {
    console.error('Error approving expense:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  approveExpense
};
