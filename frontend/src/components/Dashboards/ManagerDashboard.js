"use client";

import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { UserGroupIcon, CurrencyDollarIcon, ClipboardDocumentCheckIcon, ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ManagerDashboard({ user }) {
  const [stats, setStats] = useState({
    teamMembers: 0,
    teamDealsValue: 0,
    teamTasksPending: 0,
    conversionRate: 0,
    topPerformers: [],
    recentDeals: []
  });
  const [loading, setLoading] = useState(true);
  
  // Fetch manager-specific data
  useEffect(() => {
    const fetchManagerStats = async () => {
      try {
        setLoading(true);
        // In a real implementation, you would have an endpoint for manager stats
        // For now, we'll use mock data
        setStats({
          teamMembers: 8,
          teamDealsValue: 125000,
          teamTasksPending: 23,
          conversionRate: 32,
          topPerformers: [
            { id: 1, name: 'John Smith', deals: 12, value: 45000 },
            { id: 2, name: 'Sarah Johnson', deals: 10, value: 38000 },
            { id: 3, name: 'Michael Davis', deals: 8, value: 32000 }
          ],
          recentDeals: [
            { id: 1, title: 'Enterprise Software License', value: 25000, assignedTo: 'John Smith', stage: 'negotiation' },
            { id: 2, title: 'Annual Support Contract', value: 15000, assignedTo: 'Sarah Johnson', stage: 'proposal' },
            { id: 3, title: 'Training Services', value: 8000, assignedTo: 'Michael Davis', stage: 'qualification' }
          ]
        });
      } catch (error) {
        console.error('Error fetching manager stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchManagerStats();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manager Dashboard</h2>
        <p className="text-gray-600">Team performance and management</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* Manager-specific stats cards */}
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
                        Team Members
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.teamMembers}</dd>
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
                        Pipeline Value
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">${stats.teamDealsValue.toLocaleString()}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClipboardDocumentCheckIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending Tasks
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.teamTasksPending}</dd>
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
                        Conversion Rate
                      </dt>
                      <dd className="flex items-center text-lg font-medium text-gray-900">
                        {stats.conversionRate}%
                        <ArrowTrendingUpIcon className="h-5 w-5 text-green-500 ml-2" aria-hidden="true" />
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Manager-specific features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Team Management
              </h3>
              <div className="space-y-3">
                <Link href="/manager/team" className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  View Team Performance
                </Link>
                <Link href="/manager/assignments" className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  Lead Assignments
                </Link>
                <Link href="/manager/schedule" className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  Team Schedule
                </Link>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Team Reports
              </h3>
              <div className="space-y-3">
                <Link href="/manager/performance" className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  Performance Metrics
                </Link>
                <Link href="/manager/pipeline" className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  Sales Pipeline
                </Link>
                <Link href="/manager/forecast" className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  Sales Forecast
                </Link>
              </div>
            </div>
          </div>
          
          {/* Top Performers */}
          <div className="bg-white shadow rounded-lg mt-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Top Performers This Month
              </h3>
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {stats.topPerformers.length > 0 ? (
                    stats.topPerformers.map((performer) => (
                      <li key={performer.id} className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {performer.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {performer.name}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {performer.deals} deals
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              ${performer.value.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="py-4">
                      <p className="text-sm text-gray-500">No performance data available</p>
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
