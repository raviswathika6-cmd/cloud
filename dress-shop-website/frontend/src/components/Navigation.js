import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import './Navigation.css';

export default function Navigation() {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          👗 Dress Shop
        </Link>

        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/products" className="nav-link">
              Shop
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/cart" className="nav-link cart-link">
              🛒 Cart
              {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
            </Link>
          </li>
          {user ? (
            <>
              <li className="nav-item">
                <span className="nav-user">👤 {user.name}</span>
              </li>
              <li className="nav-item">
                <button className="nav-link logout-btn" onClick={logout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <Link to="/login" className="nav-link login-link">
                Login / Register
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
