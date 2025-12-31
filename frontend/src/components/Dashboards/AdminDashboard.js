"use client";

import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { UserGroupIcon, CogIcon, BuildingOfficeIcon, ChartBarIcon, ArrowTrendingUpIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AdminDashboard({ user }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    systemHealth: 'Good',
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  
  // Fetch admin-specific data
  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        // In a real implementation, you would have an endpoint for admin stats
        // For now, we'll use mock data
        setStats({
          totalUsers: 15,
          totalCompanies: 5,
          systemHealth: 'Good',
          recentActivities: [
            { id: 1, action: 'New user registered', user: 'John Doe', time: '2 hours ago' },
            { id: 2, action: 'System backup completed', user: 'System', time: '6 hours ago' },
            { id: 3, action: 'New company created', user: 'Jane Smith', time: '1 day ago' }
          ]
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminStats();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-gray-600">System overview and management</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* Admin-specific stats cards */}
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
                        Total Users
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
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
                        Total Companies
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalCompanies}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ShieldCheckIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        System Health
                      </dt>
                      <dd className="text-lg font-medium text-green-600">{stats.systemHealth}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Reports Generated
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">47</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Admin-specific features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                User Management
              </h3>
              <div className="space-y-3">
                <Link href="/admin/users" className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  Manage Users
                </Link>
                <Link href="/admin/roles" className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  Role Permissions
                </Link>
                <Link href="/admin/activity" className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  User Activity Logs
                </Link>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                System Settings
              </h3>
              <div className="space-y-3">
                <Link href="/admin/settings" className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  System Configuration
                </Link>
                <Link href="/admin/integrations" className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  Third-party Integrations
                </Link>
                <Link href="/admin/backup" className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  Data Backup & Restore
                </Link>
              </div>
            </div>
          </div>
          
          {/* Recent Activities */}
          <div className="bg-white shadow rounded-lg mt-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent System Activities
              </h3>
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {stats.recentActivities.length > 0 ? (
                    stats.recentActivities.map((activity) => (
                      <li key={activity.id} className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {activity.action}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              by {activity.user} • {activity.time}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="py-4">
                      <p className="text-sm text-gray-500">No recent activities</p>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
