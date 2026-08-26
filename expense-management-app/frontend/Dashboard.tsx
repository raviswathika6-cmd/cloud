import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category_name: string;
  expense_date: string;
  status: string;
}

interface DashboardProps {
  token: string;
}

const Dashboard: React.FC<DashboardProps> = ({ token }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: 0,
    category_id: '',
    expense_date: '',
    description: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0
  });

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 10 }
      });
      setExpenses(response.data.expenses);
      
      // Calculate stats
      const total = response.data.expenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0);
      const pending = response.data.expenses.filter((exp: Expense) => exp.status === 'pending').length;
      const approved = response.data.expenses.filter((exp: Expense) => exp.status === 'approved').length;
      
      setStats({ total, pending, approved });
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', newExpense.title);
      formData.append('amount', newExpense.amount.toString());
      formData.append('category_id', newExpense.category_id);
      formData.append('expense_date', newExpense.expense_date);
      formData.append('description', newExpense.description);

      await axios.post(`${API_URL}/expenses`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setNewExpense({
        title: '',
        amount: 0,
        category_id: '',
        expense_date: '',
        description: ''
      });

      fetchExpenses();
      alert('Expense added successfully!');
    } catch (error) {
      console.error('Failed to add expense:', error);
      alert('Failed to add expense');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>💰 Expense Dashboard</h1>
        <p>Manage your expenses and payments</p>
      </div>

      {/* Statistics */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3>Total Spent</h3>
          <p style={styles.statValue}>${stats.total.toFixed(2)}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Pending</h3>
          <p style={styles.statValue}>{stats.pending}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Approved</h3>
          <p style={styles.statValue}>{stats.approved}</p>
        </div>
      </div>

      {/* Add Expense Form */}
      <div style={styles.formSection}>
        <h2>Add New Expense</h2>
        <form onSubmit={handleAddExpense} style={styles.form}>
          <div style={styles.formRow}>
            <input
              type="text"
              placeholder="Title"
              value={newExpense.title}
              onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
              required
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Amount"
              step="0.01"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formRow}>
            <input
              type="date"
              value={newExpense.expense_date}
              onChange={(e) => setNewExpense({ ...newExpense, expense_date: e.target.value })}
              required
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.button}>Add Expense</button>
        </form>
      </div>

      {/* Expenses List */}
      <div style={styles.listSection}>
        <h2>Recent Expenses</h2>
        {loading ? (
          <p>Loading...</p>
        ) : expenses.length === 0 ? (
          <p>No expenses yet. Add one to get started!</p>
        ) : (
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <div style={styles.tableCell}>Title</div>
              <div style={styles.tableCell}>Amount</div>
              <div style={styles.tableCell}>Category</div>
              <div style={styles.tableCell}>Date</div>
              <div style={styles.tableCell}>Status</div>
            </div>
            {expenses.map((expense) => (
              <div key={expense.id} style={styles.tableRow}>
                <div style={styles.tableCell}>{expense.title}</div>
                <div style={styles.tableCell}>${expense.amount.toFixed(2)}</div>
                <div style={styles.tableCell}>{expense.category_name}</div>
                <div style={styles.tableCell}>{expense.expense_date}</div>
                <div style={{ ...styles.tableCell, ...getStatusStyle(expense.status) }}>
                  {expense.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const getStatusStyle = (status: string): React.CSSProperties => {
  const colors: { [key: string]: string } = {
    pending: '#FFA500',
    approved: '#4CAF50',
    rejected: '#F44336',
    reimbursed: '#2196F3'
  };
  return { color: colors[status] || '#000' };
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#333'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2196F3',
    margin: '10px 0 0 0'
  },
  formSection: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  listSection: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    backgroundColor: '#f9f9f9',
    fontWeight: 'bold',
    padding: '10px',
    borderBottom: '2px solid #ddd'
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    padding: '10px',
    borderBottom: '1px solid #eee',
    alignItems: 'center'
  },
  tableCell: {
    padding: '10px'
  }
};

export default Dashboard;
