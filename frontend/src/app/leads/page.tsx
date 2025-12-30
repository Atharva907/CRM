"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import LeadsKanban from '../../components/Leads/LeadsKanban';

export default function Leads() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  return (
    <DashboardLayout>
      <LeadsKanban />
    </DashboardLayout>
  );
}
