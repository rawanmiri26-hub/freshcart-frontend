import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wrap any admin page with this.
 * Default (no flags): any store staff (Admin, Store Manager, Employee) can enter.
 * requireAdmin: Admin + Store Manager only — Employees redirected to Inventory.
 * requireOwner: Admin only — Store Manager/Employee redirected to Inventory.
 */
export default function ProtectedRoute({ children, requireAdmin = false, requireOwner = false }) {
  const { user, loading, isOwner, isAdmin, isStoreStaff } = useAuth();

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!user || !isStoreStaff) return <Navigate to="/store/login" replace />;
  if (requireOwner && !isOwner) return <Navigate to="/store/inventory" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/store/inventory" replace />;

  return children;
}
