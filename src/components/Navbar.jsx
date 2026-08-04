import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          Fresh<span>Cart</span>
        </Link>

        <nav className="navbar-links">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/ai-planner">AI Planner</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>

        <div className="navbar-actions">
          {user ? (
            <div className="navbar-user">
              <span>Hi, {user.name.split(' ')[0]}</span>
              <button className="btn-link" onClick={handleLogout}>
                Log out
              </button>
            </div>
          ) : (
            <Link to="/login" className="navbar-login">
              Log in
            </Link>
          )}

          <Link to="/cart" className="navbar-cart" aria-label={`Cart, ${itemCount} items`}>
            🛒
            {itemCount > 0 && <span className="navbar-cart-badge">{itemCount}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
