"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import RoleBasedDashboard from '../../components/Auth/RoleBasedDashboard';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <DashboardLayout>
      <RoleBasedDashboard />
    </DashboardLayout>
  );
}
