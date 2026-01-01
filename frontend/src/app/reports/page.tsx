"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import ReportsDashboard from '../../components/Reports/ReportsDashboard';

export default function Reports() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  if (loading) return null;
  if (!isAuthenticated) {
    router.replace('/login');
    return null;
  }

  return (
    <DashboardLayout>
      <ReportsDashboard />
    </DashboardLayout>
  );
}
