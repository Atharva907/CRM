"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import {
  FunnelIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  ArrowTrendingDownIcon as TrendingDownIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SalesForecast() {
  const { isAuthenticated } = useAuth();
  const [forecastData, setForecastData] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('quarter'); // 'month', 'quarter', 'year'
  const [filterMember, setFilterMember] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const timeRangeOptions = [
    { id: 'month', name: 'Monthly Forecast' },
    { id: 'quarter', name: 'Quarterly Forecast' },
    { id: 'year', name: 'Yearly Forecast' }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchForecastData();
      fetchTeamMembers();
    }
  }, [isAuthenticated, timeRange, filterMember, fetchForecastData]);

  const fetchForecastData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filterMember) params.append('memberId', filterMember);
      params.append('timeRange', timeRange);

      const response = await api.get(`/forecast?${params.toString()}`);
      setForecastData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      toast.error('Failed to fetch forecast data');
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

  const openDetailsModal = (period) => {
    setSelectedPeriod(period);
    setShowDetailsModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) {
      return <TrendingUpIcon className="h-5 w-5 text-green-500" />;
    } else if (trend < 0) {
      return <TrendingDownIcon className="h-5 w-5 text-red-500" />;
    }
    return null;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getForecastAccuracy = (forecast, actual) => {
    if (!forecast || !actual) return 0;
    return Math.round((1 - Math.abs(forecast - actual) / forecast) * 100);
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Forecast</h1>
          <p className="mt-1 text-sm text-gray-500">Track and analyze your sales forecasts</p>
        </div>
      </div>

      {/* Forecast Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Current Forecast</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {forecastData.length > 0 ? formatCurrency(forecastData[0].forecast) : '$0'}
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Actual Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {forecastData.length > 0 ? formatCurrency(forecastData[0].actual) : '$0'}
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
                {getTrendIcon(forecastData.length > 0 ? forecastData[0].trend : 0)}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Trend</dt>
                  <dd className={`text-lg font-medium ${getTrendColor(forecastData.length > 0 ? forecastData[0].trend : 0)}`}>
                    {forecastData.length > 0 ? `${forecastData[0].trend > 0 ? '+' : ''}${forecastData[0].trend}%` : '0%'}
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
                <CalendarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Accuracy</dt>
                  <dd className={`text-lg font-medium ${getAccuracyColor(forecastData.length > 0 ? getForecastAccuracy(forecastData[0].forecast, forecastData[0].actual) : 0)}`}>
                    {forecastData.length > 0 ? `${getForecastAccuracy(forecastData[0].forecast, forecastData[0].actual)}%` : '0%'}
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

      {/* Forecast Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading forecast data...</p>
          </div>
        ) : !Array.isArray(forecastData) || forecastData.length === 0 ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No forecast data</h3>
            <p className="mt-1 text-sm text-gray-500">No forecast data available for the selected period.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Forecast
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variance
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accuracy
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View Details</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {forecastData.map((period) => (
                  <tr key={period._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {period.period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(period.forecast)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(period.actual)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <span className={`${period.variance > 0 ? 'text-green-600' : period.variance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {period.variance > 0 ? '+' : ''}{period.variance}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <span className={getAccuracyColor(getForecastAccuracy(period.forecast, period.actual))}>
                          {getForecastAccuracy(period.forecast, period.actual)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        {getTrendIcon(period.trend)}
                        <span className={`ml-1 ${getTrendColor(period.trend)}`}>
                          {period.trend > 0 ? '+' : ''}{period.trend}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openDetailsModal(period)}
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

      {/* Details Modal */}
      {showDetailsModal && selectedPeriod && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Forecast Details: {selectedPeriod.period}
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div className="text-sm font-medium text-gray-500">Forecast</div>
                    <div className="text-sm text-gray-900">{formatCurrency(selectedPeriod.forecast)}</div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-sm font-medium text-gray-500">Actual</div>
                    <div className="text-sm text-gray-900">{formatCurrency(selectedPeriod.actual)}</div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-sm font-medium text-gray-500">Variance</div>
                    <div className={`text-sm ${selectedPeriod.variance > 0 ? 'text-green-600' : selectedPeriod.variance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {selectedPeriod.variance > 0 ? '+' : ''}{selectedPeriod.variance}%
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-sm font-medium text-gray-500">Accuracy</div>
                    <div className={`text-sm ${getAccuracyColor(getForecastAccuracy(selectedPeriod.forecast, selectedPeriod.actual))}`}>
                      {getForecastAccuracy(selectedPeriod.forecast, selectedPeriod.actual)}%
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-sm font-medium text-gray-500">Trend</div>
                    <div className="flex items-center text-sm">
                      {getTrendIcon(selectedPeriod.trend)}
                      <span className={`ml-1 ${getTrendColor(selectedPeriod.trend)}`}>
                        {selectedPeriod.trend > 0 ? '+' : ''}{selectedPeriod.trend}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedPeriod(null);
                  }}
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
