import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import './AdminTable.css';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [adjustOrder, setAdjustOrder] = useState(null); // the order object currently being adjusted
  const [adjustForm, setAdjustForm] = useState({ delivery_fee: '', discount: '' });
  const [adjustError, setAdjustError] = useState('');
  const [adjustSaving, setAdjustSaving] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([api.get('/api/orders', { auth: true }), api.get('/api/lookups/order-statuses')])
      .then(([o, s]) => {
        setOrders(o.data);
        setStatuses(s.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const handleStatusChange = async (orderId, statusId) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/api/orders/${orderId}/status`, { status_id: Number(statusId) }, { auth: true });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status_id: Number(statusId), status_name: statuses.find((s) => s.id === Number(statusId))?.name }
            : o
        )
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (orderId) => {
    if (!confirm('Delete this order? This cannot be undone.')) return;
    try {
      await api.delete(`/api/orders/${orderId}`, { auth: true });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const openAdjust = (order) => {
    setAdjustOrder(order);
    setAdjustForm({ delivery_fee: order.delivery_fee, discount: order.discount });
    setAdjustError('');
  };

  const handleAdjustSave = async (e) => {
    e.preventDefault();
    setAdjustSaving(true);
    setAdjustError('');
    try {
      const res = await api.put(
        `/api/orders/${adjustOrder.id}/adjust`,
        { delivery_fee: Number(adjustForm.delivery_fee), discount: Number(adjustForm.discount) },
        { auth: true }
      );
      setOrders((prev) =>
        prev.map((o) => (o.id === adjustOrder.id ? { ...o, ...res.data } : o))
      );
      setAdjustOrder(null);
    } catch (err) {
      setAdjustError(err.message);
    } finally {
      setAdjustSaving(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Order management</h1>
      <p className="page-subtitle">Review status, and adjust delivery fee or discount per order.</p>

      <div className="card admin-table-card">
        {loading ? (
          <div className="empty-state">Loading…</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">No orders yet.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Delivery fee</th>
                <th>Discount</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.contact_phone}</td>
                  <td>{o.delivery_address}</td>
                  <td>${Number(o.delivery_fee).toFixed(2)}</td>
                  <td>${Number(o.discount).toFixed(2)}</td>
                  <td>${Number(o.total_amount).toFixed(2)}</td>
                  <td>
                    <select
                      value={o.status_id}
                      disabled={updatingId === o.id}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    >
                      {statuses.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="icon-btn" onClick={() => openAdjust(o)}>
                        Adjust
                      </button>
                      <button className="icon-btn danger" onClick={() => handleDelete(o.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {adjustOrder && (
        <div className="admin-form-modal-backdrop" onClick={() => setAdjustOrder(null)}>
          <form
            className="admin-form-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleAdjustSave}
          >
            <h2>Adjust order #{adjustOrder.id}</h2>

            {adjustError && <p className="error-text">{adjustError}</p>}

            <div className="form-field">
              <label htmlFor="delivery_fee">Delivery fee ($)</label>
              <input
                id="delivery_fee"
                type="number"
                step="0.01"
                min="0"
                required
                value={adjustForm.delivery_fee}
                onChange={(e) => setAdjustForm({ ...adjustForm, delivery_fee: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label htmlFor="discount">Discount ($)</label>
              <input
                id="discount"
                type="number"
                step="0.01"
                min="0"
                required
                value={adjustForm.discount}
                onChange={(e) => setAdjustForm({ ...adjustForm, discount: e.target.value })}
              />
            </div>

            <p className="page-subtitle">
              The order total will be recalculated automatically based on these values.
            </p>

            <div className="admin-form-modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setAdjustOrder(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={adjustSaving}>
                {adjustSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
