import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import './AdminTable.css';

export default function CallCenter() {
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

  // Only orders paid via "Call for Confirmation" need a staff phone call —
  // everything else skips this queue entirely.
  const callOrders = orders.filter((o) =>
    o.payment_method_name?.toLowerCase().includes('call')
  );

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

  return (
    <div>
      <h1 className="page-title">Call center</h1>
      <p className="page-subtitle">
        Orders placed with "Call for Confirmation" — call the customer, then update their status here.
      </p>

      <div className="card admin-table-card">
        {loading ? (
          <div className="empty-state">Loading…</div>
        ) : callOrders.length === 0 ? (
          <div className="empty-state">No orders waiting on a confirmation call right now.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {callOrders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>
                    <a href={`tel:${o.contact_phone}`}>{o.contact_phone}</a>
                  </td>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
