"use client";

import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  PlusIcon,
  EllipsisVerticalIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  TagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const leadStatuses = [
  { id: 'new', title: 'New', color: 'bg-gray-100 text-gray-800' },
  { id: 'contacted', title: 'Contacted', color: 'bg-blue-100 text-blue-800' },
  { id: 'follow_up', title: 'Follow-up', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'interested', title: 'Interested', color: 'bg-purple-100 text-purple-800' },
  { id: 'converted', title: 'Converted', color: 'bg-green-100 text-green-800' },
  { id: 'lost', title: 'Lost', color: 'bg-red-100 text-red-800' },
];

const priorities = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High', color: 'bg-red-100 text-red-800' },
};

const LeadsKanban = () => {
  const [leadsData, setLeadsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const { user } = useAuth();
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    source: 'other',
    status: 'new',
    priority: 'medium',
    notes: '',
    tags: [],
    assignedTo: user?.id || '',
  });

  // Fetch leads data
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leads/kanban');
      const data = await response.json();
      setLeadsData(data.data || []);
    } catch (error) {
      toast.error('Failed to fetch leads');
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLead((prev) => ({ ...prev, [name]: value }));
  };

  // Add new lead
  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      // Always set assignedTo to current user if empty
      const leadData = {
        ...newLead,
        assignedTo: newLead.assignedTo || user.id,
        // Backend will handle default companyId if not provided
      };
      
      const response = await api.post('/leads', leadData);
      const data = await response.json();

      if (data.success) {
        toast.success('Lead created successfully');
        setShowAddModal(false);
        setNewLead({
          name: '',
          email: '',
          phone: '',
          company: '',
          position: '',
          source: 'other',
          status: 'new',
          priority: 'medium',
          notes: '',
          tags: [],
          assignedTo: user?.id || '',
        });
        fetchLeads();
      } else {
        toast.error(data.message || 'Failed to create lead');
      }
    } catch (error) {
      toast.error('Failed to create lead');
      console.error('Error creating lead:', error);
    }
  };

  // Update lead status
  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      const response = await api.put(`/leads/${leadId}`, { status: newStatus });
      const data = await response.json();

      if (data.success) {
        toast.success('Lead status updated successfully');
        fetchLeads();
      } else {
        toast.error(data.message || 'Failed to update lead status');
      }
    } catch (error) {
      toast.error('Failed to update lead status');
      console.error('Error updating lead status:', error);
    }
  };

  // View lead details
  const viewLead = (lead) => {
    setSelectedLead(lead);
    setShowLeadModal(true);
  };

  // Fetch leads on component mount
  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Leads Pipeline</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and track your leads through the sales pipeline.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            onClick={() => setShowAddModal(true)}
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {leadsData && leadsData.map((column) => (
            <div key={column.status} className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                {leadStatuses.find((s) => s.id === column.status)?.title}
                <span className="ml-2 text-xs text-gray-500">
                  ({column.leads.length})
                </span>
              </h3>
              <div className="space-y-3 min-h-[200px]">
                {column.leads.map((lead) => (
                  <div
                    key={lead._id}
                    className="bg-white p-3 rounded-md shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => viewLead(lead)}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {lead.name}
                      </h4>
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle menu
                        }}
                      >
                        <EllipsisVerticalIcon className="h-5 w-5" />
                      </button>
                    </div>

                    {lead.company && (
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                        {lead.company}
                      </div>
                    )}

                    {lead.email && (
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <EnvelopeIcon className="h-4 w-4 mr-1" />
                        {lead.email}
                      </div>
                    )}

                    {lead.phone && (
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <PhoneIcon className="h-4 w-4 mr-1" />
                        {lead.phone}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          priorities[lead.priority]?.color
                        }`}
                      >
                        {priorities[lead.priority]?.label}
                      </span>

                      {lead.assignedTo && (
                        <div className="flex items-center text-xs text-gray-500">
                          <UserIcon className="h-4 w-4 mr-1" />
                          {lead.assignedTo.name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              onClick={() => setShowAddModal(false)}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddLead}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Add New Lead</h3>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={() => setShowAddModal(false)}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={newLead.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={newLead.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={newLead.phone}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                      />
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                        Company
                      </label>
                      <input
                        type="text"
                        name="company"
                        id="company"
                        value={newLead.company}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                      />
                    </div>

                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                        Position
                      </label>
                      <input
                        type="text"
                        name="position"
                        id="position"
                        value={newLead.position}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                      />
                    </div>

                    <div>
                      <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                        Source
                      </label>
                      <select
                        name="source"
                        id="source"
                        value={newLead.source}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                      >
                        <option value="website">Website</option>
                        <option value="referral">Referral</option>
                        <option value="social_media">Social Media</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="advertisement">Advertisement</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        name="status"
                        id="status"
                        value={newLead.status}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                      >
                        {leadStatuses.map((status) => (
                          <option key={status.id} value={status.id}>
                            {status.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <select
                        name="priority"
                        id="priority"
                        value={newLead.priority}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
                        Assign To
                      </label>
                      <select
                        name="assignedTo"
                        id="assignedTo"
                        value={newLead.assignedTo}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                      >
                        <option value="">-- Select User --</option>
                        <option value={user.id}>{user.name} (Me)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                        Notes
                      </label>
                      <textarea
                        name="notes"
                        id="notes"
                        rows={3}
                        value={newLead.notes}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Lead Details Modal */}
      {showLeadModal && selectedLead && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              onClick={() => setShowLeadModal(false)}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Lead Details</h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={() => setShowLeadModal(false)}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">{selectedLead.name}</h4>
                      <p className="text-sm text-gray-500">
                        {selectedLead.position} {selectedLead.company && `at ${selectedLead.company}`}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      {selectedLead.email && (
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Email</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedLead.email}</dd>
                        </div>
                      )}

                      {selectedLead.phone && (
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Phone</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedLead.phone}</dd>
                        </div>
                      )}

                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="mt-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              leadStatuses.find((s) => s.id === selectedLead.status)?.color
                            }`}
                          >
                            {leadStatuses.find((s) => s.id === selectedLead.status)?.title}
                          </span>
                        </dd>
                      </div>

                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Priority</dt>
                        <dd className="mt-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              priorities[selectedLead.priority]?.color
                            }`}
                          >
                            {priorities[selectedLead.priority]?.label}
                          </span>
                        </dd>
                      </div>

                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Source</dt>
                        <dd className="mt-1 text-sm text-gray-900 capitalize">{selectedLead.source}</dd>
                      </div>

                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedLead.assignedTo.name}</dd>
                      </div>

                      {selectedLead.nextFollowUpDate && (
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Next Follow-up</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {new Date(selectedLead.nextFollowUpDate).toLocaleDateString()}
                          </dd>
                        </div>
                      )}

                      {selectedLead.notes && (
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">Notes</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedLead.notes}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <div>
                        <label htmlFor="status-update" className="block text-sm font-medium text-gray-700">
                          Update Status
                        </label>
                        <select
                          id="status-update"
                          value={selectedLead.status}
                          onChange={(e) => updateLeadStatus(selectedLead._id, e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                        >
                          {leadStatuses.map((status) => (
                            <option key={status.id} value={status.id}>
                              {status.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedLead.status !== 'converted' && (
                        <button
                          type="button"
                          className="ml-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          onClick={() => {
                            // Handle convert to customer
                            toast.success('Lead converted to customer');
                            setShowLeadModal(false);
                            fetchLeads();
                          }}
                        >
                          Convert to Customer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsKanban;
