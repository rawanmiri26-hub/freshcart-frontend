import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import './Checkout.css';

const DELIVERY_FEE = 3.0;

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [contactPhone, setContactPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [whishAccount, setWhishAccount] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api
      .get('/api/lookups/payment-methods')
      .then((res) => {
        setPaymentMethods(res.data);
        if (res.data.length > 0) setSelectedMethod(res.data[0].id);
      })
      .catch(() => setPaymentMethods([]));
  }, []);

  const total = subtotal + DELIVERY_FEE;
  const selectedMethodObj = paymentMethods.find((m) => m.id === selectedMethod);
  const isWhish = selectedMethodObj?.name.toLowerCase().includes('whish');

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedMethod) {
      setError('Please select a payment option.');
      return;
    }
    if (isWhish && !whishAccount.trim()) {
      setError('Please enter your Whish Money account number.');
      return;
    }

    setSubmitting(true);
    try {
      // Look up the "pending" statuses so the order/payment start in the right state.
      const [orderStatuses, paymentStatuses] = await Promise.all([
        api.get('/api/lookups/order-statuses'),
        api.get('/api/lookups/payment-statuses'),
      ]);
      const findPending = (list) =>
        list.data.find((s) => s.name.toLowerCase().includes('pending'))?.id || list.data[0]?.id;

      const orderStatusId = findPending(orderStatuses);
      const paymentStatusId = findPending(paymentStatuses);

      const orderRes = await api.post('/api/orders', {
        user_id: user?.id,
        status_id: orderStatusId,
        contact_phone: contactPhone,
        delivery_address: deliveryAddress,
        delivery_fee: DELIVERY_FEE,
        discount: 0,
        total_amount: total,
        items: items.map((i) => ({
          product_id: i.product_id,
          name: i.name,
          price: i.price,
        })),
      });

      await api.post('/api/payments', {
        order_id: orderRes.data.id,
        user_id: user?.id,
        method_id: selectedMethod,
        status_id: paymentStatusId,
        amount: total,
        account_info: isWhish ? whishAccount.trim() : undefined,
      });

      clearCart();
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="container section checkout-success">
        <span className="tag tag-fresh">Order placed</span>
        <h1 className="page-title">Thanks — your order is on its way to being picked!</h1>
        <p className="page-subtitle">We'll text you updates as it's prepared and delivered.</p>
        <Link to="/shop" className="btn btn-primary">
          Continue shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container section">
        <div className="empty-state">
          <p>Your cart is empty — nothing to check out yet.</p>
          <Link to="/shop" className="btn btn-primary" style={{ marginTop: 16 }}>
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <Link to="/cart" className="checkout-back">← Back to cart</Link>
      <h1 className="page-title">Checkout</h1>

      <form className="checkout-layout" onSubmit={handleConfirm}>
        <div className="checkout-main">
          <div className="card checkout-section">
            <h2>Delivery details</h2>
            <div className="form-field">
              <label htmlFor="phone">Contact phone</label>
              <input
                id="phone"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+961 1 555 555"
              />
            </div>
            <div className="form-field">
              <label htmlFor="address">Delivery address</label>
              <input
                id="address"
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Street, building, city"
              />
            </div>
          </div>

          <div className="card checkout-section">
            <h2>Payment options</h2>
            <div className="checkout-payment-grid">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`checkout-payment-option ${selectedMethod === method.id ? 'checkout-payment-option-active' : ''}`}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    checked={selectedMethod === method.id}
                    onChange={() => setSelectedMethod(method.id)}
                  />
                  <span>{method.name}</span>
                </label>
              ))}
              {paymentMethods.length === 0 && (
                <p className="page-subtitle">No payment methods configured yet.</p>
              )}
            </div>

            {isWhish && (
              <div className="form-field checkout-whish-field">
                <label htmlFor="whish-account">Whish Money account number</label>
                <input
                  id="whish-account"
                  required
                  value={whishAccount}
                  onChange={(e) => setWhishAccount(e.target.value)}
                  placeholder="e.g. 03 123 456"
                />
              </div>
            )}
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="btn btn-primary checkout-confirm-btn" type="submit" disabled={submitting}>
            {submitting ? 'Placing order…' : 'Confirm order'}
          </button>
        </div>

        <aside className="checkout-summary card">
          <h2>Order summary</h2>
          <ul className="checkout-summary-items">
            {items.map((item) => (
              <li key={item.product_id}>
                <span>{item.name} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="checkout-summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="checkout-summary-row">
            <span>Delivery fee</span>
            <span>${DELIVERY_FEE.toFixed(2)}</span>
          </div>
          <div className="checkout-summary-row checkout-summary-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </aside>
      </form>
    </div>
  );
}
