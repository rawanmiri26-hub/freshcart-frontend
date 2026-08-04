import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import './AdminTable.css';

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/api/orders', { auth: true }), api.get('/api/products')])
      .then(([orderRes, productRes]) => {
        setOrders(orderRes.data);
        setProducts(productRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const outOfStock = products.filter((p) => !p.in_stock).length;
  const recentOrders = [...orders].slice(0, 5);

  return (
    <div>
      <h1 className="page-title">Store overview</h1>
      <p className="page-subtitle">Live snapshot of FreshCart's performance.</p>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <div className="admin-stats">
            <div className="card admin-stat-card">
              <div className="admin-stat-label">Total revenue</div>
              <div className="admin-stat-value">${totalRevenue.toFixed(2)}</div>
            </div>
            <div className="card admin-stat-card">
              <div className="admin-stat-label">Total orders</div>
              <div className="admin-stat-value">{orders.length}</div>
            </div>
            <div className="card admin-stat-card">
              <div className="admin-stat-label">Products listed</div>
              <div className="admin-stat-value">{products.length}</div>
            </div>
            <div className="card admin-stat-card">
              <div className="admin-stat-label">Out of stock</div>
              <div className="admin-stat-value">{outOfStock}</div>
            </div>
          </div>

          <div className="card admin-table-card">
            <div className="admin-table-header">
              <h2>Recent orders</h2>
            </div>
            {recentOrders.length === 0 ? (
              <div className="empty-state">No orders yet.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Phone</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>{o.contact_phone}</td>
                      <td>${Number(o.total_amount).toFixed(2)}</td>
                      <td>
                        <span className="tag tag-fresh">{o.status_name || '—'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
