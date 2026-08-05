import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wrap any admin page with this.
 * requireAdmin=false (default): any store staff (Admin, Store Manager, Employee) can enter.
 * requireAdmin=true: only Admin/Store Manager — Employees get redirected to Inventory.
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading, isAdmin, isStoreStaff } = useAuth();

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!user || !isStoreStaff) return <Navigate to="/store/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/store/inventory" replace />;

  return children;
}
