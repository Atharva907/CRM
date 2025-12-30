"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { api } from '../../utils/api';
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CheckSquareIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalCustomers: 0,
    totalDeals: 0,
    pendingTasks: 0,
    recentLeads: [],
    recentDeals: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats data
      const statsResponse = await api.get('/reports/stats');
      const statsData = await statsResponse.json();

      // Fetch recent leads
      const leadsResponse = await api.get('/leads?limit=5');
      const leadsData = await leadsResponse.json();

      // Fetch recent deals
      const dealsResponse = await api.get('/deals?limit=5');
      const dealsData = await dealsResponse.json();

      // Fetch pending tasks
      const tasksResponse = await api.get('/tasks?status=pending&limit=5');
      const tasksData = await tasksResponse.json();

      setStats({
        totalLeads: statsData.data.totalLeads || 0,
        totalCustomers: statsData.data.totalCustomers || 0,
        totalDeals: statsData.data.totalDeals || 0,
        pendingTasks: tasksData.pagination?.total || 0,
        recentLeads: leadsData.data || [],
        recentDeals: dealsData.data || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Fetch data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 mb-6 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h2>
            <p className="text-gray-600">Here's an overview of your CRM system</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Leads
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalLeads}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BuildingOfficeIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Customers
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalCustomers}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Deals
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalDeals}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckSquareIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Tasks
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.pendingTasks}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Leads */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Leads
              </h3>
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {stats.recentLeads.length > 0 ? (
                    stats.recentLeads.map((lead) => (
                      <li key={lead._id} className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {lead.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {lead.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {lead.email}
                            </p>
                          </div>
                          <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {lead.status}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="py-4">
                      <p className="text-sm text-gray-500">No recent leads</p>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Deals */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Deals
              </h3>
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {stats.recentDeals.length > 0 ? (
                    stats.recentDeals.map((deal) => (
                      <li key={deal._id} className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {deal.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {deal.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              ${deal.value.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {deal.stage}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="py-4">
                      <p className="text-sm text-gray-500">No recent deals</p>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
