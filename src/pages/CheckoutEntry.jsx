import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './CheckoutEntry.css';

export default function CheckoutEntry() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already logged in — skip straight to checkout. Using <Navigate> (a
  // declarative redirect) instead of calling navigate() during render,
  // which React doesn't reliably support and caused intermittent blank pages.
  if (user) {
    return <Navigate to="/checkout" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/checkout');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container section checkout-entry">
      <span className="tag tag-fresh">Final step</span>
      <h1 className="page-title">Almost at the harvest line!</h1>
      <p className="page-subtitle checkout-entry-sub">
        Choose how you'd like to proceed with your checkout.
      </p>

      <div className="checkout-entry-cards">
        <form className="card checkout-entry-card" onSubmit={handleLogin}>
          <h2>Log in to your account</h2>
          <p className="page-subtitle">Access your saved addresses and order history.</p>

          {error && <p className="error-text">{error}</p>}

          <div className="form-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in & checkout →'}
          </button>
        </form>

        <div className="card checkout-entry-card checkout-entry-contact">
          <h2>Need help?</h2>
          <p className="page-subtitle">
            Our support team can help you complete your order over the phone.
          </p>
          <Link to="/contact" className="btn btn-outline">
            Contact support
          </Link>
        </div>
      </div>

      <button className="checkout-entry-guest" onClick={() => navigate('/checkout')}>
        Continue as guest →
      </button>
    </div>
  );
}
