import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <div className="footer-logo">FreshCart</div>
          <p>Fresh groceries, delivered to your door.</p>
        </div>
        <nav className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/store/login">Store login</Link>
        </nav>
      </div>
    </footer>
  );
}
