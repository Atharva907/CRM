"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { AdminDashboard, ManagerDashboard, SalesDashboard } from '../../components/Dashboards';

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

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard user={user} />;
      case 'manager':
        return <ManagerDashboard user={user} />;
      case 'sales':
      default:
        return <SalesDashboard user={user} />;
    }
  };

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        {renderDashboard()}
      </div>
    </DashboardLayout>
  );
}
