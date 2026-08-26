import React from 'react';
import '../styles/AdminPanel.css';

function AdminPanel() {
  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      
      <div className="admin-sections">
        <div className="admin-card">
          <h2>User Management</h2>
          <p>Manage users and their roles</p>
          <button>View Users</button>
        </div>

        <div className="admin-card">
          <h2>Expense Approvals</h2>
          <p>Review and approve pending expenses</p>
          <button>View Pending</button>
        </div>

        <div className="admin-card">
          <h2>Reports</h2>
          <p>View system reports and analytics</p>
          <button>View Reports</button>
        </div>

        <div className="admin-card">
          <h2>Audit Logs</h2>
          <p>View system audit logs</p>
          <button>View Logs</button>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
