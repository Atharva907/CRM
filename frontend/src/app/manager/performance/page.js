"use client";

import React, { useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import {
  ChartBarIcon,
  FunnelIcon,
  XMarkIcon,
  UserIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function TeamPerformance() {
  const { isAuthenticated } = useAuth();
  const [performanceData, setPerformanceData] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'quarter', 'year'
  const [filterMember, setFilterMember] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const timeRangeOptions = [
    { id: 'week', name: 'Last Week' },
    { id: 'month', name: 'Last Month' },
    { id: 'quarter', name: 'Last Quarter' },
    { id: 'year', name: 'Last Year' }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchPerformanceData();
      fetchTeamMembers();
    }
  }, [isAuthenticated, timeRange, filterMember]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filterMember) params.append('memberId', filterMember);
      params.append('timeRange', timeRange);

      const response = await api.get(`/performance?${params.toString()}`);
      setPerformanceData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast.error('Failed to fetch performance data');
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await api.get('/users/team');
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to fetch team members');
    }
  };

  const clearFilters = () => {
    setFilterMember('');
  };

  const openDetailsModal = (member) => {
    setSelectedMember(member);
    setShowDetailsModal(true);
  };

  const getPerformanceColor = (value, type) => {
    if (type === 'conversionRate') {
      if (value >= 20) return 'text-green-600';
      if (value >= 10) return 'text-yellow-600';
      return 'text-red-600';
    }

    if (type === 'callsPerDay') {
      if (value >= 20) return 'text-green-600';
      if (value >= 10) return 'text-yellow-600';
      return 'text-red-600';
    }

    if (type === 'revenue') {
      // This would depend on your target revenue
      if (value >= 50000) return 'text-green-600';
      if (value >= 25000) return 'text-yellow-600';
      return 'text-red-600';
    }

    return 'text-gray-600';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Performance</h1>
          <p className="mt-1 text-sm text-gray-500">Track and analyze your team's performance metrics</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex gap-2">
          <div>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              {timeRangeOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FunnelIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
            Filters
          </button>

          {filterMember && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <XMarkIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
              Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 bg-gray-50 p-4 rounded-md">
            <div>
              <label htmlFor="member-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Team Member
              </label>
              <select
                id="member-filter"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={filterMember}
                onChange={(e) => setFilterMember(e.target.value)}
              >
                <option value="">All Members</option>
                {teamMembers && teamMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Performance Metrics Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(performanceData ? performanceData.reduce((sum, member) => sum + (member.revenue || 0), 0) : 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PhoneIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Calls</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {performanceData ? performanceData.reduce((sum, member) => sum + (member.calls || 0), 0) : 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Conversion Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {performanceData && performanceData.length > 0 
                      ? `${(performanceData.reduce((sum, member) => sum + (member.conversionRate || 0), 0) / performanceData.length).toFixed(1)}%`
                      : '0%'
                    }
                  </dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Team Performance</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {performanceData && performanceData.length > 0 
                      ? `${(performanceData.reduce((sum, member) => sum + (member.performanceScore || 0), 0) / performanceData.length).toFixed(1)}/100`
                      : '0/100'
                    }
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Performance Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading performance data...</p>
          </div>
        ) : !Array.isArray(performanceData) || performanceData.length === 0 ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No performance data</h3>
            <p className="mt-1 text-sm text-gray-500">No performance data available for the selected period.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team Member
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calls
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance Score
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View Details</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {performanceData.map((member) => (
                  <tr key={member._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {member.avatar ? (
                            <img className="h-10 w-10 rounded-full" src={member.avatar} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getPerformanceColor(member.revenue, 'revenue')}`}>
                        {formatCurrency(member.revenue || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getPerformanceColor(member.callsPerDay, 'callsPerDay')}`}>
                        {member.calls || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getPerformanceColor(member.conversionRate, 'conversionRate')}`}>
                        {member.conversionRate || 0}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900 mr-2">
                              {member.performanceScore || 0}/100
                            </div>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full" 
                                style={{ width: `${member.performanceScore || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => openDetailsModal(member)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Performance Details Modal */}
      {showDetailsModal && selectedMember && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Performance Details
                    </h3>

                    <div className="flex items-center mb-6">
                      <div className="flex-shrink-0 h-12 w-12">
                        {selectedMember.avatar ? (
                          <img className="h-12 w-12 rounded-full" src={selectedMember.avatar} alt="" />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center">
                            <span className="text-white font-medium text-lg">
                              {selectedMember.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-lg font-medium text-gray-900">{selectedMember.name}</div>
                        <div className="text-sm text-gray-500">{selectedMember.role}</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Revenue</span>
                        <span className={`text-sm font-bold ${getPerformanceColor(selectedMember.revenue, 'revenue')}`}>
                          {formatCurrency(selectedMember.revenue || 0)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Total Calls</span>
                        <span className={`text-sm font-bold ${getPerformanceColor(selectedMember.callsPerDay, 'callsPerDay')}`}>
                          {selectedMember.calls || 0}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Conversion Rate</span>
                        <span className={`text-sm font-bold ${getPerformanceColor(selectedMember.conversionRate, 'conversionRate')}`}>
                          {selectedMember.conversionRate || 0}%
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Performance Score</span>
                        <div className="flex items-center">
                          <span className="text-sm font-bold text-gray-900 mr-2">
                            {selectedMember.performanceScore || 0}/100
                          </span>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full" 
                              style={{ width: `${selectedMember.performanceScore || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
