
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

        // Fetch real data from API endpoints
        const [teamResponse, dealsResponse, tasksResponse] = await Promise.all([
          api.get('/manager/team'),
          api.get('/deals'),
          api.get('/tasks')
        ]);

        const teamData = await teamResponse.json();
        const dealsData = await dealsResponse.json();
        const tasksData = await tasksResponse.json();

        // Calculate team metrics
        const teamMembers = teamData.data?.length || 0;
        const teamDealsValue = dealsData.data?.reduce((total, deal) => total + (deal.value || 0), 0) || 0;
        const teamTasksPending = tasksData.data?.filter(task => task.status !== 'completed').length || 0;
        const conversionRate = teamMembers > 0 ? 
          Math.round((dealsData.data?.filter(deal => deal.stage === 'won').length / dealsData.data?.length) * 100) || 0 : 0;

        // Get top performers
        const topPerformers = teamData.data?.map(member => ({
          id: member._id,
          name: member.name,
          deals: dealsData.data?.filter(deal => deal.assignedTo === member._id).length || 0,
          value: dealsData.data?.filter(deal => deal.assignedTo === member._id)
            .reduce((total, deal) => total + (deal.value || 0), 0) || 0
        })).sort((a, b) => b.value - a.value).slice(0, 3) || [];

        // Get recent deals
        const recentDeals = dealsData.data?.slice(0, 3).map(deal => ({
          id: deal._id,
          title: deal.title,
          value: deal.value,
          assignedTo: teamData.data?.find(member => member._id === deal.assignedTo)?.name || 'Unassigned',
          stage: deal.stage
        })) || [];

        setStats({
          teamMembers,
          teamDealsValue,
          teamTasksPending,
          conversionRate,
          topPerformers,
          recentDeals
        });
      } catch (error) {
        console.error('Error fetching manager stats:', error);
        // Fallback to mock data if API fails
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
                <Link href="/leads" className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  <span>Lead Assignments</span>
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">Manage</span>
                </Link>
                <Link href="/deals" className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  <span>Deal Approvals</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full">Review</span>
                </Link>
                <Link href="/tasks" className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  <span>Task Management</span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full">Assign</span>
                </Link>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Team Performance
              </h3>
              <div className="space-y-3">
                <Link href="/reports" className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  <span>Sales Reports</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">View</span>
                </Link>
                <Link href="/customers" className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  <span>Customer Management</span>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">Access</span>
                </Link>
                <Link href="/manager/team" className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  <span>Team Performance</span>
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">Monitor</span>
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
