"use client";

import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const dealStages = [
  { id: 'prospecting', name: 'Prospecting' },
  { id: 'qualification', name: 'Qualification' },
  { id: 'proposal', name: 'Proposal' },
  { id: 'negotiation', name: 'Negotiation' },
  { id: 'closed_won', name: 'Closed Won' },
  { id: 'closed_lost', name: 'Closed Lost' }
];

const statusOptions = [
  { id: 'active', name: 'Active' },
  { id: 'inactive', name: 'Inactive' },
  { id: 'pending', name: 'Pending' }
];

export default function DealsList() {
  const { isAuthenticated } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentDeal, setCurrentDeal] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    value: '',
    stage: 'lead',
    status: 'active',
    customerId: '',
    expectedCloseDate: ''
  });
  
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchDeals();
      fetchCustomers();
    }
  }, [isAuthenticated, pagination.currentPage, filterStage, searchTerm]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 10
      });
      
      if (filterStage) params.append('stage', filterStage);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await api.get(`/deals?${params.toString()}`);
      
      const data = await response.json();
      setDeals(data.data || []);
      setPagination({
        currentPage: data.pagination?.page || 1,
        totalPages: data.pagination?.pages || 1,
        total: data.pagination?.total || 0
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast.error('Failed to fetch deals');
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers?limit=100');
      const data = await response.json();
      setCustomers(data.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/deals', formData);
      setDeals([response.data, ...deals]);
      setShowCreateModal(false);
      resetForm();
      toast.success('Deal created successfully');
    } catch (error) {
      console.error('Error creating deal:', error);
      toast.error(error.response?.data?.msg || 'Failed to create deal');
    }
  };

  const handleUpdateDeal = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.put(`/deals/${currentDeal._id}`, formData);
      
      setDeals(deals.map(deal => 
        deal._id === currentDeal._id ? response.data : deal
      ));
      
      setShowEditModal(false);
      resetForm();
      setCurrentDeal(null);
      toast.success('Deal updated successfully');
    } catch (error) {
      console.error('Error updating deal:', error);
      toast.error(error.response?.data?.msg || 'Failed to update deal');
    }
  };

  const handleDeleteDeal = async (id) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      try {
        await api.delete(`/deals/${id}`);
        setDeals(deals.filter(deal => deal._id !== id));
        toast.success('Deal deleted successfully');
      } catch (error) {
        console.error('Error deleting deal:', error);
        toast.error('Failed to delete deal');
      }
    }
  };

  const openEditModal = (deal) => {
    setCurrentDeal(deal);
    setFormData({
      title: deal.title,
      description: deal.description || '',
      value: deal.value || '',
      stage: deal.stage,
      status: deal.status,
      customerId: deal.customerId?._id || '',
      expectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      value: '',
      stage: 'lead',
      status: 'active',
      customerId: '',
      expectedCloseDate: ''
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, currentPage: 1 });
    fetchDeals();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStage('');
    setPagination({ ...pagination, currentPage: 1 });
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'lead':
        return 'bg-gray-100 text-gray-800';
      case 'qualified':
        return 'bg-blue-100 text-blue-800';
      case 'proposal':
        return 'bg-yellow-100 text-yellow-800';
      case 'negotiation':
        return 'bg-purple-100 text-purple-800';
      case 'closed-won':
        return 'bg-green-100 text-green-800';
      case 'closed-lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your sales deals and opportunities</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Deal
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FunnelIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
            Filters
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Search
          </button>
        </form>

        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-md flex flex-wrap gap-4 items-center">
            <div>
              <label htmlFor="stage-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Stage
              </label>
              <select
                id="stage-filter"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
              >
                <option value="">All Stages</option>
                {dealStages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-6"
            >
              <XMarkIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Deals Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading deals...</p>
          </div>
        ) : deals.length === 0 ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No deals</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new deal.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                New Deal
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {deals.map((deal) => (
              <li key={deal._id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-indigo-600 truncate">{deal.title}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <BuildingOfficeIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        <span>{deal.customerId?.name || 'No customer'}</span>
                      </div>
                      {deal.description && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{deal.description}</p>
                      )}
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        {deal.value && (
                          <div className="flex items-center">
                            <CurrencyDollarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <span>${parseFloat(deal.value).toLocaleString()}</span>
                          </div>
                        )}
                        {deal.expectedCloseDate && (
                          <div className="flex items-center">
                            <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <span>{new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(deal.stage)}`}>
                          {dealStages.find(s => s.id === deal.stage)?.name || deal.stage}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(deal.status)}`}>
                          {statusOptions.find(s => s.id === deal.status)?.name || deal.status}
                        </span>
                      </div>
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Toggle dropdown menu here
                          }}
                        >
                          <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                        {/* Dropdown menu would go here */}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(deal)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDeal(deal._id)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-md shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPagination({ ...pagination, currentPage: Math.max(1, pagination.currentPage - 1) })}
              disabled={pagination.currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination({ ...pagination, currentPage: Math.min(pagination.totalPages, pagination.currentPage + 1) })}
              disabled={pagination.currentPage === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.currentPage - 1) * 10 + 1}</span> to{" "}
                <span className="font-medium">{Math.min(pagination.currentPage * 10, pagination.total)}</span> of{" "}
                <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPagination({ ...pagination, currentPage: Math.max(1, pagination.currentPage - 1) })}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {/* Page numbers would go here */}
                <button
                  onClick={() => setPagination({ ...pagination, currentPage: Math.min(pagination.totalPages, pagination.currentPage + 1) })}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Create Deal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateDeal}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Deal</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="description"
                        rows={3}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                          Deal Value ($)
                        </label>
                        <input
                          type="number"
                          id="value"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={formData.value}
                          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="expectedCloseDate" className="block text-sm font-medium text-gray-700">
                          Expected Close Date
                        </label>
                        <input
                          type="date"
                          id="expectedCloseDate"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={formData.expectedCloseDate}
                          onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="stage" className="block text-sm font-medium text-gray-700">
                          Stage *
                        </label>
                        <select
                          id="stage"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={formData.stage}
                          onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                          required
                        >
                          {dealStages.map((stage) => (
                            <option key={stage.id} value={stage.id}>
                              {stage.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <select
                          id="status"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                          {statusOptions.map((status) => (
                            <option key={status.id} value={status.id}>
                              {status.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
                        Customer
                      </label>
                      <select
                        id="customerId"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.customerId}
                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      >
                        <option value="">Select a customer</option>
                        {customers.map((customer) => (
                          <option key={customer._id} value={customer._id}>
                            {customer.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Deal Modal */}
      {showEditModal && currentDeal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleUpdateDeal}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Deal</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">
                        Title *
                      </label>
                      <input
                        type="text"
                        id="edit-title"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="edit-description"
                        rows={3}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="edit-value" className="block text-sm font-medium text-gray-700">
                          Deal Value ($)
                        </label>
                        <input
                          type="number"
                          id="edit-value"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={formData.value}
                          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-expectedCloseDate" className="block text-sm font-medium text-gray-700">
                          Expected Close Date
                        </label>
                        <input
                          type="date"
                          id="edit-expectedCloseDate"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={formData.expectedCloseDate}
                          onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="edit-stage" className="block text-sm font-medium text-gray-700">
                          Stage *
                        </label>
                        <select
                          id="edit-stage"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={formData.stage}
                          onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                          required
                        >
                          {dealStages.map((stage) => (
                            <option key={stage.id} value={stage.id}>
                              {stage.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <select
                          id="edit-status"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                          {statusOptions.map((status) => (
                            <option key={status.id} value={status.id}>
                              {status.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="edit-customerId" className="block text-sm font-medium text-gray-700">
                        Customer
                      </label>
                      <select
                        id="edit-customerId"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.customerId}
                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      >
                        <option value="">Select a customer</option>
                        {customers.map((customer) => (
                          <option key={customer._id} value={customer._id}>
                            {customer.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                      setCurrentDeal(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}