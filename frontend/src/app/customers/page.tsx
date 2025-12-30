"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import CustomersList from '../../components/Customers/CustomersList';

export default function Customers() {
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
      <CustomersList />
    </DashboardLayout>
  );
}
