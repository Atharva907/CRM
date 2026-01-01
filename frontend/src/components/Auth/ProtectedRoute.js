
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../utils/permissions';

/**
 * Component that protects routes based on user permissions
 * @param {Object} props
 * @param {React.ReactNode} props.children - The components to render if user has permission
 * @param {string} props.permission - The permission required to access the route
 * @param {string} props.redirectTo - The path to redirect to if user doesn't have permission (default: '/dashboard')
 */
const ProtectedRoute = ({ children, permission, redirectTo = '/dashboard' }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // wait until auth state resolves
    // If user is not authenticated, redirect to login (replace to avoid back loop)
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    // If user doesn't have the required permission, redirect (replace)
    if (permission && !hasPermission(user?.role, permission)) {
      router.replace(redirectTo);
      return;
    }
  }, [isAuthenticated, user, permission, router, redirectTo, loading]);

  // While loading or if not allowed, render nothing
  if (loading || !isAuthenticated || (permission && !hasPermission(user?.role, permission))) {
    return null;
  }

  // If user has permission, render children
  return <>{children}</>;
};

export default ProtectedRoute;
