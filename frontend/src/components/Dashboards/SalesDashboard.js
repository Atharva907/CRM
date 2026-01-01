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
        
        // Fetch real data from API
        const [leadsResponse, customersResponse, dealsResponse, tasksResponse] = await Promise.all([
          api.get(`/leads?assignedTo=${user._id}&limit=5&sort=-createdAt`),
          api.get(`/customers?assignedTo=${user._id}&limit=5&sort=-createdAt`),
          api.get(`/deals?assignedTo=${user._id}&limit=5&sort=-createdAt`),
          api.get(`/tasks?assignedTo=${user._id}&limit=5&sort=dueDate`)
        ]);
        
        const leads = await leadsResponse.json();
        const customers = await customersResponse.json();
        const deals = await dealsResponse.json();
        const tasks = await tasksResponse.json();
        
        // Extract data from API responses
        const leadsData = leads.data || [];
        const customersData = customers.data || [];
        const dealsData = deals.data || [];
        const tasksData = tasks.data || [];
        
        setStats({
          myLeads: leads.total || leadsData.length,
          myCustomers: customers.total || customersData.length,
          myDeals: deals.total || dealsData.length,
          myTasks: tasks.total || tasksData.length,
          recentLeads: leadsData,
          recentDeals: dealsData,
          upcomingTasks: tasksData
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

          {(stats.recentLeads.length > 0 || stats.recentDeals.length > 0 || stats.upcomingTasks.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Recent Leads */}
              {stats.recentLeads.length > 0 && (
                <div className="bg-white shadow rounded-lg lg:col-span-1">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Recent Leads
                    </h3>
                    <div className="flow-root">
                      <ul className="-my-5 divide-y divide-gray-200">
                        {stats.recentLeads.map((lead) => (
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
                        ))}
                      </ul>
                    </div>
                    <div className="mt-4">
                      <Link href="/leads" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        View all leads <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Deals */}
              {stats.recentDeals.length > 0 && (
                <div className="bg-white shadow rounded-lg lg:col-span-1">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Recent Deals
                    </h3>
                    <div className="flow-root">
                      <ul className="-my-5 divide-y divide-gray-200">
                        {stats.recentDeals.map((deal) => (
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
                        ))}
                      </ul>
                    </div>
                    <div className="mt-4">
                      <Link href="/deals" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        View all deals <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Upcoming Tasks */}
              {stats.upcomingTasks.length > 0 && (
                <div className="bg-white shadow rounded-lg lg:col-span-1">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Upcoming Tasks
                    </h3>
                    <div className="flow-root">
                      <ul className="-my-5 divide-y divide-gray-200">
                        {stats.upcomingTasks.map((task) => (
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
                        ))}
                      </ul>
                    </div>
                    <div className="mt-4">
                      <Link href="/tasks" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        View all tasks <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}


        </>
      )}
    </div>
  );
}
