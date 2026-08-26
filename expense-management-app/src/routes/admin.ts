import { Router, Response } from 'express';
import { query } from '../config/database';
import { authenticate, authorizeAdmin, AuthRequest } from '../middleware/auth';
import { ValidationError, ForbiddenError } from '../middleware/errorHandler';

export const adminRoutes = Router();

// Middleware to verify admin role
const checkAdmin = (req: AuthRequest, res: Response, next: Function) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get all users (admin only)
adminRoutes.get(
  '/users',
  authenticate,
  checkAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { role, status, limit = 50, offset = 0 } = req.query;

      let whereClause = '1=1';
      let params: any[] = [];

      if (role) {
        whereClause += ` AND role = $${params.length + 1}`;
        params.push(role);
      }

      if (status === 'active') {
        whereClause += ` AND is_active = true`;
      } else if (status === 'inactive') {
        whereClause += ` AND is_active = false`;
      }

      const result = await query(
        `SELECT id, email, first_name, last_name, role, is_active, 
                is_email_verified, created_at, last_login
         FROM users 
         WHERE ${whereClause}
         ORDER BY created_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      );

      const countResult = await query(`SELECT COUNT(*) as total FROM users WHERE ${whereClause}`, params);

      res.status(200).json({
        users: result.rows,
        total: parseInt(countResult.rows[0].total),
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
    } catch (error: any) {
      console.error('Get users error:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  }
);

// Get user details (admin only)
adminRoutes.get(
  '/users/:userId',
  authenticate,
  checkAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;

      const userResult = await query(
        `SELECT id, email, first_name, last_name, role, is_active, 
                is_email_verified, created_at, last_login
         FROM users WHERE id = $1`,
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const expenseResult = await query(
        `SELECT COUNT(*) as total, SUM(amount) as total_amount 
         FROM expenses WHERE user_id = $1`,
        [userId]
      );

      const paymentResult = await query(
        `SELECT COUNT(*) as total, SUM(amount) as total_amount 
         FROM payments WHERE user_id = $1`,
        [userId]
      );

      res.status(200).json({
        user: userResult.rows[0],
        stats: {
          totalExpenses: parseInt(expenseResult.rows[0].total) || 0,
          expenseAmount: expenseResult.rows[0].total_amount || 0,
          totalPayments: parseInt(paymentResult.rows[0].total) || 0,
          paymentAmount: paymentResult.rows[0].total_amount || 0
        }
      });
    } catch (error: any) {
      console.error('Get user details error:', error);
      res.status(500).json({ message: 'Failed to fetch user details' });
    }
  }
);

// Update user role (admin only)
adminRoutes.put(
  '/users/:userId/role',
  authenticate,
  checkAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }

      // Prevent self-demotion
      if (userId === req.user?.id && role !== 'admin') {
        return res.status(400).json({ message: 'Cannot demote yourself' });
      }

      const result = await query(
        `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [role, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        message: `User role updated to ${role}`,
        user: result.rows[0]
      });
    } catch (error: any) {
      console.error('Update user role error:', error);
      res.status(500).json({ message: 'Failed to update user role' });
    }
  }
);

// Deactivate/Activate user (admin only)
adminRoutes.put(
  '/users/:userId/status',
  authenticate,
  checkAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      // Prevent self-deactivation
      if (userId === req.user?.id && !isActive) {
        return res.status(400).json({ message: 'Cannot deactivate yourself' });
      }

      const result = await query(
        `UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [isActive, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        message: `User ${isActive ? 'activated' : 'deactivated'}`,
        user: result.rows[0]
      });
    } catch (error: any) {
      console.error('Update user status error:', error);
      res.status(500).json({ message: 'Failed to update user status' });
    }
  }
);

// Get all expenses (admin only)
adminRoutes.get(
  '/expenses',
  authenticate,
  checkAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { userId, status, limit = 50, offset = 0 } = req.query;

      let whereClause = '1=1';
      let params: any[] = [];

      if (userId) {
        whereClause += ` AND e.user_id = $${params.length + 1}`;
        params.push(userId);
      }

      if (status) {
        whereClause += ` AND e.status = $${params.length + 1}`;
        params.push(status);
      }

      const result = await query(
        `SELECT e.*, c.name as category_name, u.email as user_email
         FROM expenses e
         LEFT JOIN expense_categories c ON e.category_id = c.id
         LEFT JOIN users u ON e.user_id = u.id
         WHERE ${whereClause}
         ORDER BY e.created_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      );

      res.status(200).json({
        expenses: result.rows,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
    } catch (error: any) {
      console.error('Get expenses error:', error);
      res.status(500).json({ message: 'Failed to fetch expenses' });
    }
  }
);

// Approve/Reject expense (admin only)
adminRoutes.put(
  '/expenses/:expenseId/status',
  authenticate,
  checkAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { expenseId } = req.params;
      const { status } = req.body;

      if (!['pending', 'approved', 'rejected', 'reimbursed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const result = await query(
        `UPDATE expenses SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [status, expenseId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Expense not found' });
      }

      res.status(200).json({
        message: `Expense status updated to ${status}`,
        expense: result.rows[0]
      });
    } catch (error: any) {
      console.error('Update expense status error:', error);
      res.status(500).json({ message: 'Failed to update expense status' });
    }
  }
);

// Get dashboard statistics (admin only)
adminRoutes.get(
  '/statistics/dashboard',
  authenticate,
  checkAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      // Total users
      const usersResult = await query('SELECT COUNT(*) as total FROM users');
      const totalUsers = parseInt(usersResult.rows[0].total);

      // Total expenses
      const expensesResult = await query(
        `SELECT COUNT(*) as total, SUM(amount) as total_amount FROM expenses`
      );
      const totalExpenses = parseInt(expensesResult.rows[0].total);
      const totalExpenseAmount = expensesResult.rows[0].total_amount || 0;

      // Pending expenses
      const pendingResult = await query(
        `SELECT COUNT(*) as total, SUM(amount) as total_amount FROM expenses WHERE status = 'pending'`
      );
      const pendingExpenses = parseInt(pendingResult.rows[0].total);
      const pendingAmount = pendingResult.rows[0].total_amount || 0;

      // Payment statistics
      const paymentsResult = await query(
        `SELECT COUNT(*) as total, SUM(amount) as total_amount FROM payments WHERE status = 'succeeded'`
      );
      const successfulPayments = parseInt(paymentsResult.rows[0].total);
      const successfulPaymentAmount = paymentsResult.rows[0].total_amount || 0;

      // Recent activity
      const activityResult = await query(
        `SELECT event_type, COUNT(*) as count FROM webhooks 
         WHERE created_at >= NOW() - INTERVAL '7 days'
         GROUP BY event_type`
      );

      res.status(200).json({
        statistics: {
          users: {
            total: totalUsers
          },
          expenses: {
            total: totalExpenses,
            totalAmount: totalExpenseAmount,
            pending: pendingExpenses,
            pendingAmount
          },
          payments: {
            successful: successfulPayments,
            successfulAmount: successfulPaymentAmount
          },
          recentActivity: activityResult.rows
        }
      });
    } catch (error: any) {
      console.error('Get dashboard statistics error:', error);
      res.status(500).json({ message: 'Failed to fetch statistics' });
    }
  }
);

// Get audit logs (admin only)
adminRoutes.get(
  '/audit-logs',
  authenticate,
  checkAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { userId, action, limit = 100, offset = 0 } = req.query;

      let whereClause = '1=1';
      let params: any[] = [];

      if (userId) {
        whereClause += ` AND user_id = $${params.length + 1}`;
        params.push(userId);
      }

      if (action) {
        whereClause += ` AND action = $${params.length + 1}`;
        params.push(action);
      }

      const result = await query(
        `SELECT * FROM audit_logs 
         WHERE ${whereClause}
         ORDER BY created_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      );

      res.status(200).json({
        logs: result.rows,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
    } catch (error: any) {
      console.error('Get audit logs error:', error);
      res.status(500).json({ message: 'Failed to fetch audit logs' });
    }
  }
);
