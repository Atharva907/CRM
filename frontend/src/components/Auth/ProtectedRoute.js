
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
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // If user doesn't have the required permission, redirect
    if (permission && !hasPermission(user?.role, permission)) {
      router.push(redirectTo);
      return;
    }
  }, [isAuthenticated, user, permission, router, redirectTo]);

  // If user is not authenticated or doesn't have permission, render nothing
  if (!isAuthenticated || (permission && !hasPermission(user?.role, permission))) {
    return null;
  }

  // If user has permission, render children
  return <>{children}</>;
};

export default ProtectedRoute;
