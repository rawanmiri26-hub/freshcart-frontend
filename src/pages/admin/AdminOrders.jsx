import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import './AdminTable.css';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

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

  return (
    <div>
      <h1 className="page-title">Order management</h1>
      <p className="page-subtitle">Review and update order status.</p>

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
                    <button className="icon-btn danger" onClick={() => handleDelete(o.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
