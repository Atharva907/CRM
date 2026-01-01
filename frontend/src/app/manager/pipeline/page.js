"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import {
  FunnelIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SalesPipeline() {
  const { isAuthenticated } = useAuth();
  const [pipelineData, setPipelineData] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'quarter', 'year'
  const [filterMember, setFilterMember] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showDealDetailsModal, setShowDealDetailsModal] = useState(false);

  // Pipeline stages
  const pipelineStages = [
    { id: 'lead', name: 'Lead', color: 'bg-blue-500' },
    { id: 'qualified', name: 'Qualified', color: 'bg-indigo-500' },
    { id: 'proposal', name: 'Proposal', color: 'bg-purple-500' },
    { id: 'negotiation', name: 'Negotiation', color: 'bg-yellow-500' },
    { id: 'closed-won', name: 'Closed Won', color: 'bg-green-500' },
    { id: 'closed-lost', name: 'Closed Lost', color: 'bg-red-500' }
  ];

  const timeRangeOptions = [
    { id: 'week', name: 'Last Week' },
    { id: 'month', name: 'Last Month' },
    { id: 'quarter', name: 'Last Quarter' },
    { id: 'year', name: 'Last Year' }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchPipelineData();
      fetchTeamMembers();
    }
  }, [isAuthenticated, timeRange, filterMember]);

  const fetchPipelineData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filterMember) params.append('memberId', filterMember);
      params.append('timeRange', timeRange);

      const response = await api.get(`/pipeline?${params.toString()}`);
      setPipelineData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pipeline data:', error);
      toast.error('Failed to fetch pipeline data');
      setLoading(false);
    }
  }, [filterMember, timeRange]);

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

  const openDealDetails = (deal) => {
    setSelectedDeal(deal);
    setShowDealDetailsModal(true);
  };

  const getStageColor = (stageId) => {
    const stage = pipelineStages.find(s => s.id === stageId);
    return stage ? stage.color : 'bg-gray-500';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDealsByStage = (stageId) => {
    return pipelineData.filter(deal => deal.stage === stageId);
  };

  const getStageValue = (stageId) => {
    return getDealsByStage(stageId).reduce((sum, deal) => sum + (deal.value || 0), 0);
  };

  const getAverageDealAge = (stageId) => {
    const deals = getDealsByStage(stageId);
    if (!Array.isArray(deals) || deals.length === 0) return 0;

    const totalDays = deals.reduce((sum, deal) => {
      const createdDate = new Date(deal.createdAt);
      const currentDate = new Date();
      const diffTime = Math.abs(currentDate - createdDate);
      return sum + Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }, 0);

    return Math.round(totalDays / deals.length);
  };

  const isStalled = (deal) => {
    const createdDate = new Date(deal.createdAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - createdDate);
    const daysOld = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Define stall thresholds for each stage
    const stallThresholds = {
      'lead': 14,
      'qualified': 21,
      'proposal': 30,
      'negotiation': 45
    };

    const threshold = stallThresholds[deal.stage] || 60;
    return daysOld > threshold;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="mt-1 text-sm text-gray-500">Track and manage your sales pipeline</p>
        </div>
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pipeline Value</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(pipelineData.reduce((sum, deal) => sum + (deal.value || 0), 0))}
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Closed Won</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(getStageValue('closed-won'))}
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
                <UserIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Deals</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {pipelineData.filter(deal => !['closed-won', 'closed-lost'].includes(deal.stage)).length}
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
                <ExclamationTriangleIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Stalled Deals</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {pipelineData.filter(deal => isStalled(deal) && !['closed-won', 'closed-lost'].includes(deal.stage)).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
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
                {teamMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Pipeline Board */}
      {loading ? (
        <div className="px-4 py-5 sm:p-6 text-center bg-white shadow rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading pipeline data...</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="grid grid-cols-6 gap-4">
                  {pipelineStages.map((stage) => (
                    <div key={stage.id} className="flex flex-col h-full">
                      <div className="flex items-center mb-3">
                        <div className={`h-3 w-3 rounded-full ${stage.color} mr-2`}></div>
                        <h3 className="text-sm font-medium text-gray-900">{stage.name}</h3>
                        <span className="ml-auto text-xs text-gray-500">
                          {getDealsByStage(stage.id).length}
                        </span>
                      </div>

                      <div className="bg-gray-50 rounded-md p-3 mb-2">
                        <div className="text-xs text-gray-500">Value</div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(getStageValue(stage.id))}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-md p-3 mb-4">
                        <div className="text-xs text-gray-500">Avg. Age</div>
                        <div className="text-sm font-medium text-gray-900">
                          {getAverageDealAge(stage.id)} days
                        </div>
                      </div>

                      <div className="space-y-2 flex-1">
                        {getDealsByStage(stage.id).map((deal) => (
                          <div 
                            key={deal._id} 
                            className={`bg-white border rounded-md p-3 cursor-pointer hover:shadow-md transition-shadow ${
                              isStalled(deal) ? 'border-yellow-400' : 'border-gray-200'
                            }`}
                            onClick={() => openDealDetails(deal)}
                          >
                            <div className="font-medium text-sm text-gray-900 truncate">
                              {deal.title}
                            </div>

                            <div className="mt-1 text-xs text-gray-500">
                              {deal.customer?.name || 'Unknown Customer'}
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                              <div className="text-xs font-medium text-gray-900">
                                {formatCurrency(deal.value || 0)}
                              </div>

                              {isStalled(deal) && (
                                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" aria-hidden="true" />
                              )}
                            </div>

                            <div className="mt-1 flex items-center text-xs text-gray-500">
                              <CalendarIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                              {new Date(deal.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deal Details Modal */}
      {showDealDetailsModal && selectedDeal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Deal Details</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedDeal.title}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedDeal.customer?.name || 'Unknown Customer'}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Value</label>
                    <div className="mt-1 text-sm text-gray-900">{formatCurrency(selectedDeal.value || 0)}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stage</label>
                    <div className="mt-1 flex items-center">
                      <div className={`h-3 w-3 rounded-full ${getStageColor(selectedDeal.stage)} mr-2`}></div>
                      <span className="text-sm text-gray-900">
                        {pipelineStages.find(s => s.id === selectedDeal.stage)?.name || selectedDeal.stage}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedDeal.assignedTo?.name || 'Unassigned'}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created Date</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {new Date(selectedDeal.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {selectedDeal.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <div className="mt-1 text-sm text-gray-900">{selectedDeal.description}</div>
                    </div>
                  )}

                  {isStalled(selectedDeal) && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            This deal has been in the current stage for longer than recommended and may be stalled.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDealDetailsModal(false)}
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
