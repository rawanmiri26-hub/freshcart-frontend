import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="container section">
        <h1 className="page-title">Your cart</h1>
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Link to="/shop" className="btn btn-primary" style={{ marginTop: 16 }}>
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="page-title">Your cart</h1>
      <p className="page-subtitle">{items.length} item{items.length > 1 ? 's' : ''} in your cart</p>

      <div className="cart-layout">
        <ul className="cart-list">
          {items.map((item) => (
            <li key={item.product_id} className="cart-row">
              <div className="cart-row-info">
                <span className="cart-row-name">{item.name}</span>
                <span className="cart-row-price">${item.price.toFixed(2)} each</span>
              </div>

              <div className="cart-row-qty">
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                  aria-label={`Decrease quantity of ${item.name}`}
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                  aria-label={`Increase quantity of ${item.name}`}
                >
                  +
                </button>
              </div>

              <span className="cart-row-total">${(item.price * item.quantity).toFixed(2)}</span>

              <button
                className="cart-row-remove"
                onClick={() => removeItem(item.product_id)}
                aria-label={`Remove ${item.name} from cart`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <aside className="cart-summary card">
          <h2>Order summary</h2>
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <p className="page-subtitle" style={{ marginBottom: 20 }}>
            Delivery fee and any discounts are calculated at checkout.
          </p>
          <Link to="/checkout-entry" className="btn btn-primary cart-checkout-btn">
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
