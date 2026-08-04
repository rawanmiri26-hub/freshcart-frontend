import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wrap any admin page with this. Redirects to the store login if not
// authenticated, or not staff (Admin/Store Manager per config/roles.js).
export default function ProtectedRoute({ children }) {
  const { user, loading, isStaff } = useAuth();

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!user || !isStaff) return <Navigate to="/store/login" replace />;

  return children;
}
