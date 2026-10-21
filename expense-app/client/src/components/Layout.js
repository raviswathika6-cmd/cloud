import React, { useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Layout.css';

function Layout({ onLogout }) {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    onLogout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>💰 ExpenseApp</h2>
        </div>

        <ul className="nav-menu">
          <li><a href="/">Dashboard</a></li>
          <li><a href="/expenses">Expenses</a></li>
          <li><a href="/expense/new">Add Expense</a></li>
          <li><a href="/summary">Summary & AI</a></li>
          <li><a href="/payments">Payments</a></li>
          {user?.role === 'admin' && (
            <li><a href="/admin">Admin Panel</a></li>
          )}
        </ul>

        <div className="sidebar-footer">
          <div className="user-info">
            <p>{user?.email}</p>
            <small>{user?.role}</small>
          </div>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
