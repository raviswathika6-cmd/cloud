const { OpenAI } = require('openai');
const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate expense summary
const generateExpenseSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { summaryType = 'monthly', startDate, endDate } = req.body;

    // Fetch expenses for the period
    const result = await pool.query(
      `SELECT category, SUM(amount) as total, COUNT(*) as count
       FROM expenses
       WHERE user_id = $1 
       AND expense_date >= $2 
       AND expense_date <= $3
       GROUP BY category
       ORDER BY total DESC`,
      [userId, startDate, endDate]
    );

    const categoryBreakdown = {};
    let totalExpenses = 0;

    result.rows.forEach(row => {
      categoryBreakdown[row.category] = {
        total: parseFloat(row.total),
        count: row.count
      };
      totalExpenses += parseFloat(row.total);
    });

    // Get all expenses for detailed analysis
    const expensesResult = await pool.query(
      `SELECT * FROM expenses
       WHERE user_id = $1 
       AND expense_date >= $2 
       AND expense_date <= $3
       ORDER BY expense_date DESC`,
      [userId, startDate, endDate]
    );

    const expensesData = expensesResult.rows;

    // Prepare data for AI analysis
    const analysisPrompt = `
    Analyze the following expense data for the period ${startDate} to ${endDate}:
    
    Total Expenses: $${totalExpenses}
    Number of Expenses: ${expensesData.length}
    
    Category Breakdown:
    ${JSON.stringify(categoryBreakdown, null, 2)}
    
    Recent Expenses:
    ${expensesData.slice(0, 10).map(e => `- ${e.category}: $${e.amount} on ${e.expense_date}`).join('\n')}
    
    Please provide:
    1. A brief summary of spending patterns
    2. Key insights about the user's spending habits
    3. 3-5 actionable recommendations to reduce expenses
    4. Any unusual spending patterns to watch out for
    
    Format your response as JSON with keys: "summary", "insights", "recommendations"
    `;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a financial advisor analyzing expense data. Provide actionable insights and recommendations.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.7
    });

    const aiResponse = completion.choices[0].message.content;
    let parsedResponse;

    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (e) {
      // If response isn't valid JSON, parse it as text
      parsedResponse = {
        insights: aiResponse,
        recommendations: 'Please review the insights above for recommendations.'
      };
    }

    // Save summary to database
    const summaryId = uuidv4();
    await pool.query(
      `INSERT INTO expense_summaries 
       (id, user_id, summary_type, period_start, period_end, total_expenses, category_breakdown, insights, recommendations)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        summaryId,
        userId,
        summaryType,
        startDate,
        endDate,
        totalExpenses,
        JSON.stringify(categoryBreakdown),
        parsedResponse.insights,
        parsedResponse.recommendations
      ]
    );

    // Log audit
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id)
       VALUES ($1, 'summary_generated', 'summary', $2)`,
      [userId, summaryId]
    );

    res.json({
      message: 'Expense summary generated successfully',
      summary: {
        id: summaryId,
        totalExpenses,
        categoryBreakdown,
        insights: parsedResponse.insights,
        recommendations: parsedResponse.recommendations
      }
    });
  } catch (error) {
    console.error('Error generating expense summary:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get expense summaries
const getExpenseSummaries = async (req, res) => {
  try {
    const userId = req.user.id;
    const { summaryType } = req.query;

    let query = 'SELECT * FROM expense_summaries WHERE user_id = $1';
    const params = [userId];

    if (summaryType) {
      query += ' AND summary_type = $2';
      params.push(summaryType);
    }

    query += ' ORDER BY generated_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching summaries:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single summary
const getExpenseSummary = async (req, res) => {
  try {
    const { summaryId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM expense_summaries WHERE id = $1 AND user_id = $2',
      [summaryId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Summary not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get quick insights
const getQuickInsights = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get last 30 days of expenses
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await pool.query(
      `SELECT category, SUM(amount) as total, COUNT(*) as count
       FROM expenses
       WHERE user_id = $1 
       AND expense_date >= $2
       GROUP BY category
       ORDER BY total DESC`,
      [userId, thirtyDaysAgo.toISOString().split('T')[0]]
    );

    let topCategory = null;
    let totalSpent = 0;

    const insights = result.rows.map(row => {
      totalSpent += parseFloat(row.total);
      if (!topCategory) {
        topCategory = row.category;
      }
      return {
        category: row.category,
        amount: parseFloat(row.total),
        count: row.count,
        average: parseFloat(row.total) / row.count
      };
    });

    const dailyAverage = totalSpent / 30;

    res.json({
      period: 'Last 30 days',
      totalSpent: totalSpent,
      dailyAverage,
      topCategory,
      categoryBreakdown: insights
    });
  } catch (error) {
    console.error('Error fetching quick insights:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  generateExpenseSummary,
  getExpenseSummaries,
  getExpenseSummary,
  getQuickInsights
};
