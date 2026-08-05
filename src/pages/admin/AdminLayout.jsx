import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

export default function AdminLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/store/login');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          FreshCart <span>Admin</span>
        </div>
        <nav className="admin-nav">
          {isAdmin && <NavLink to="/store/dashboard">📊 Dashboard</NavLink>}
          <NavLink to="/store/inventory">📦 Inventory</NavLink>
          {isAdmin && <NavLink to="/store/orders">🛒 Orders</NavLink>}
          {isAdmin && <NavLink to="/store/members">👥 Members</NavLink>}
        </nav>
        <div className="admin-user-box">
          <div>
            <strong>{user?.name}</strong>
            <p>{user?.role_name}</p>
          </div>
          <button className="btn-link" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
