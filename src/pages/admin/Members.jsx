import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import './AdminTable.css';

export default function Members() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([api.get('/api/users', { auth: true }), api.get('/api/lookups/roles')])
      .then(([u, r]) => {
        setUsers(u.data);
        setRoles(r.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const handleRoleChange = async (member, roleId) => {
    setUpdatingId(member.id);
    try {
      await api.put(
        `/api/users/${member.id}`,
        { role_id: Number(roleId), name: member.name, email: member.email, phone: member.phone },
        { auth: true }
      );
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this member? This cannot be undone.')) return;
    try {
      await api.delete(`/api/users/${id}`, { auth: true });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1 className="page-title">Member workspace</h1>
      <p className="page-subtitle">Manage staff and customer accounts.</p>

      <div className="card admin-table-card">
        {loading ? (
          <div className="empty-state">Loading…</div>
        ) : users.length === 0 ? (
          <div className="empty-state">No members yet.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '—'}</td>
                  <td>
                    <select
                      value={u.role_id}
                      disabled={updatingId === u.id}
                      onChange={(e) => handleRoleChange(u, e.target.value)}
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button className="icon-btn danger" onClick={() => handleDelete(u.id)}>
                      Remove
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
