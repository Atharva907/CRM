"use client";

import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { UserGroupIcon, BuildingOfficeIcon, CurrencyDollarIcon, ClipboardDocumentCheckIcon, ArrowTrendingUpIcon, CalendarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function SalesDashboard({ user }) {
  const [stats, setStats] = useState({
    myLeads: 0,
    myCustomers: 0,
    myDeals: 0,
    myTasks: 0,
    recentLeads: [],
    recentDeals: [],
    upcomingTasks: []
  });
  const [loading, setLoading] = useState(true);
  
  // Fetch sales-specific data
  useEffect(() => {
    const fetchSalesStats = async () => {
      try {
        setLoading(true);
        // In a real implementation, you would fetch data from your API
        // For now, we'll use mock data
        setStats({
          myLeads: 24,
          myCustomers: 18,
          myDeals: 7,
          myTasks: 12,
          recentLeads: [
            { id: 1, name: 'Acme Corporation', email: 'contact@acme.com', status: 'new', createdAt: '2023-12-28' },
            { id: 2, name: 'Global Industries', email: 'info@globalindustries.com', status: 'contacted', createdAt: '2023-12-27' },
            { id: 3, name: 'Tech Solutions Inc', email: 'hello@techsolutions.com', status: 'qualified', createdAt: '2023-12-26' }
          ],
          recentDeals: [
            { id: 1, title: 'Enterprise Software License', value: 25000, stage: 'negotiation', customerId: 'Acme Corporation' },
            { id: 2, title: 'Annual Support Contract', value: 15000, stage: 'proposal', customerId: 'Global Industries' },
            { id: 3, title: 'Training Services', value: 8000, stage: 'qualification', customerId: 'Tech Solutions Inc' }
          ],
          upcomingTasks: [
            { id: 1, title: 'Follow up with Acme Corp', dueDate: '2023-12-31', priority: 'high' },
            { id: 2, title: 'Prepare proposal for Global Industries', dueDate: '2024-01-02', priority: 'medium' },
            { id: 3, title: 'Schedule demo with Tech Solutions', dueDate: '2024-01-05', priority: 'medium' }
          ]
        });
      } catch (error) {
        console.error('Error fetching sales stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSalesStats();
  }, [user._id]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sales Dashboard</h2>
        <p className="text-gray-600">Your sales activities and performance</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* Sales-specific stats cards */}
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
                        My Leads
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.myLeads}</dd>
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
                        My Customers
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.myCustomers}</dd>
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
                        My Deals
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.myDeals}</dd>
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
                        My Tasks
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.myTasks}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Leads */}
            <div className="bg-white shadow rounded-lg lg:col-span-1">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Recent Leads
                </h3>
                <div className="flow-root">
                  <ul className="-my-5 divide-y divide-gray-200">
                    {stats.recentLeads.length > 0 ? (
                      stats.recentLeads.map((lead) => (
                        <li key={lead.id} className="py-4">
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
                <div className="mt-4">
                  <Link href="/leads" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    View all leads <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Deals */}
            <div className="bg-white shadow rounded-lg lg:col-span-1">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Recent Deals
                </h3>
                <div className="flow-root">
                  <ul className="-my-5 divide-y divide-gray-200">
                    {stats.recentDeals.length > 0 ? (
                      stats.recentDeals.map((deal) => (
                        <li key={deal.id} className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {deal.title.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {deal.title}
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
                <div className="mt-4">
                  <Link href="/deals" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    View all deals <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white shadow rounded-lg lg:col-span-1">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Upcoming Tasks
                </h3>
                <div className="flow-root">
                  <ul className="-my-5 divide-y divide-gray-200">
                    {stats.upcomingTasks.length > 0 ? (
                      stats.upcomingTasks.map((task) => (
                        <li key={task.id} className="py-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 pt-0.5">
                              <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {task.title}
                              </p>
                              <div className="flex items-center mt-1">
                                <p className="text-sm text-gray-500 truncate mr-2">
                                  {task.dueDate}
                                </p>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="py-4">
                        <p className="text-sm text-gray-500">No upcoming tasks</p>
                      </li>
                    )}
                  </ul>
                </div>
                <div className="mt-4">
                  <Link href="/tasks" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    View all tasks <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/leads/new" className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Add New Lead
              </Link>
              <Link href="/customers/new" className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Add New Customer
              </Link>
              <Link href="/deals/new" className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Create New Deal
              </Link>
              <Link href="/tasks/new" className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Create New Task
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
