"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import RoleBasedDashboard from '../../components/Auth/RoleBasedDashboard';

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated (after loading resolved)
  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router, loading]);

  if (loading || !isAuthenticated) {
    return null; // Wait for auth or redirect
  }

  return (
    <DashboardLayout>
      <RoleBasedDashboard />
    </DashboardLayout>
  );
}
