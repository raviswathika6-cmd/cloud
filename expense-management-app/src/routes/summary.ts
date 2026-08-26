import { Router, Response } from 'express';
import axios from 'axios';
import { query } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ValidationError, NotFoundError } from '../middleware/errorHandler';

export const summaryRoutes = Router();

interface ExpenseData {
  category: string;
  total: number;
  count: number;
}

// Generate AI-powered expense summary
summaryRoutes.post('/generate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new ValidationError('User not authenticated');

    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      throw new ValidationError('Start date and end date are required');
    }

    // Get user's expenses for the period
    const expenseResult = await query(
      `SELECT e.*, c.name as category_name 
       FROM expenses e
       LEFT JOIN expense_categories c ON e.category_id = c.id
       WHERE e.user_id = $1 AND e.expense_date >= $2 AND e.expense_date <= $3
       ORDER BY e.expense_date DESC`,
      [req.user.id, startDate, endDate]
    );

    const expenses = expenseResult.rows;

    if (expenses.length === 0) {
      return res.status(200).json({
        message: 'No expenses found for the given period',
        summary: {
          period_start: startDate,
          period_end: endDate,
          total_expenses: 0,
          category_breakdown: {},
          ai_summary: 'No expenses recorded for this period.'
        }
      });
    }

    // Calculate category breakdown
    const categoryBreakdown: { [key: string]: ExpenseData } = {};
    let totalExpenses = 0;

    expenses.forEach(expense => {
      const category = expense.category_name || 'Other';
      const amount = parseFloat(expense.amount);

      totalExpenses += amount;

      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = { category, total: 0, count: 0 };
      }

      categoryBreakdown[category].total += amount;
      categoryBreakdown[category].count += 1;
    });

    // Generate AI insights
    const aiSummary = generateAISummary(
      expenses,
      categoryBreakdown,
      totalExpenses,
      startDate,
      endDate
    );

    const insights = generateInsights(categoryBreakdown, totalExpenses);

    // Save summary to database
    const summaryResult = await query(
      `INSERT INTO expense_summaries 
       (user_id, period_start, period_end, total_expenses, category_breakdown, ai_summary, insights)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user.id,
        startDate,
        endDate,
        totalExpenses,
        JSON.stringify(categoryBreakdown),
        aiSummary,
        JSON.stringify(insights)
      ]
    );

    res.status(201).json({
      message: 'Expense summary generated successfully',
      summary: {
        id: summaryResult.rows[0].id,
        period_start: startDate,
        period_end: endDate,
        total_expenses: totalExpenses,
        category_breakdown: categoryBreakdown,
        ai_summary: aiSummary,
        insights
      }
    });
  } catch (error: any) {
    console.error('Generate summary error:', error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Failed to generate summary' });
    }
  }
});

// Get expense summary for a specific period
summaryRoutes.get('/period', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new ValidationError('User not authenticated');

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new ValidationError('Start date and end date are required');
    }

    const result = await query(
      `SELECT * FROM expense_summaries 
       WHERE user_id = $1 AND period_start = $2 AND period_end = $3`,
      [req.user.id, startDate, endDate]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Summary not found for this period');
    }

    res.status(200).json({
      summary: result.rows[0]
    });
  } catch (error: any) {
    console.error('Get summary error:', error);
    if (error instanceof (ValidationError || NotFoundError)) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Failed to fetch summary' });
    }
  }
});

// Get all summaries for user
summaryRoutes.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new ValidationError('User not authenticated');

    const { limit = 12, offset = 0 } = req.query;

    const result = await query(
      `SELECT * FROM expense_summaries 
       WHERE user_id = $1
       ORDER BY period_start DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.status(200).json({
      summaries: result.rows,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error: any) {
    console.error('Get summaries error:', error);
    res.status(500).json({ message: 'Failed to fetch summaries' });
  }
});

// Helper function to generate AI summary
function generateAISummary(
  expenses: any[],
  categoryBreakdown: { [key: string]: ExpenseData },
  totalExpenses: number,
  startDate: string,
  endDate: string
): string {
  const topCategory = Object.values(categoryBreakdown).reduce((max, current) =>
    current.total > max.total ? current : max
  );

  const numDays = Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const avgPerDay = (totalExpenses / numDays).toFixed(2);

  let summary = `📊 Expense Summary (${startDate} to ${endDate})\n\n`;
  summary += `💰 Total Spent: $${totalExpenses.toFixed(2)}\n`;
  summary += `📅 Period: ${numDays} days\n`;
  summary += `📈 Average per Day: $${avgPerDay}\n\n`;
  summary += `🏆 Top Category: ${topCategory.category} ($${topCategory.total.toFixed(2)})\n\n`;
  summary += `📋 Breakdown:\n`;

  Object.values(categoryBreakdown)
    .sort((a, b) => b.total - a.total)
    .forEach(cat => {
      const percentage = ((cat.total / totalExpenses) * 100).toFixed(1);
      summary += `   • ${cat.category}: $${cat.total.toFixed(2)} (${percentage}%) - ${cat.count} transactions\n`;
    });

  return summary;
}

// Helper function to generate insights
function generateInsights(
  categoryBreakdown: { [key: string]: ExpenseData },
  totalExpenses: number
): {
  trend: string;
  recommendation: string;
  alert?: string;
} {
  const insights = {
    trend: '',
    recommendation: '',
    alert: undefined as string | undefined
  };

  const foodSpending = categoryBreakdown['Food & Dining']?.total || 0;
  const transportSpending = categoryBreakdown['Transportation']?.total || 0;
  const entertainmentSpending = categoryBreakdown['Entertainment']?.total || 0;

  const foodPercentage = (foodSpending / totalExpenses) * 100;
  const transportPercentage = (transportSpending / totalExpenses) * 100;

  // Generate trend
  if (foodPercentage > 30) {
    insights.trend = '🍽️ High spending on food & dining';
    insights.recommendation = 'Consider meal planning to reduce food expenses';
  } else if (transportPercentage > 25) {
    insights.trend = '🚗 High spending on transportation';
    insights.recommendation = 'Look into public transportation or carpooling options';
  } else if (entertainmentSpending > 100) {
    insights.trend = '🎬 Significant entertainment expenses';
    insights.recommendation = 'Consider setting a monthly entertainment budget';
  } else {
    insights.trend = '✅ Balanced spending across categories';
    insights.recommendation = 'Keep maintaining your current spending patterns';
  }

  // Generate alert
  if (foodPercentage > 40) {
    insights.alert = '⚠️ Food spending exceeds 40% of total - consider reviewing';
  } else if (totalExpenses > 5000) {
    insights.alert = '⚠️ Total spending is over $5000 - review for optimization opportunities';
  }

  return insights;
}

// Monthly summary (convenience endpoint)
summaryRoutes.get('/monthly/:year/:month', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new ValidationError('User not authenticated');

    const { year, month } = req.params;

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(parseInt(year), parseInt(month), 0)
      .toISOString()
      .split('T')[0];

    const result = await query(
      `SELECT * FROM expense_summaries 
       WHERE user_id = $1 AND period_start = $2 AND period_end = $3`,
      [req.user.id, startDate, endDate]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Summary not found for this month');
    }

    res.status(200).json({
      summary: result.rows[0]
    });
  } catch (error: any) {
    console.error('Get monthly summary error:', error);
    if (error instanceof (ValidationError || NotFoundError)) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Failed to fetch monthly summary' });
    }
  }
});
