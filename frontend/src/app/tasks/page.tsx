"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import TasksList from '../../components/Tasks/TasksList';

export default function Tasks() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  if (loading) return null;
  if (!isAuthenticated) {
    router.replace('/login');
    return null;
  }

  return (
    <DashboardLayout>
      <TasksList />
    </DashboardLayout>
  );
}
