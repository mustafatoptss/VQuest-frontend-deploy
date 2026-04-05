import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, token } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  if (!user || !token) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  
  return children;
};
