"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  UserIcon,
  DocumentTextIcon,
  CalendarIcon,
  ArrowRightIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function LeadAssignments() {
  const { isAuthenticated } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [unassignedLeads, setUnassignedLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMember, setFilterMember] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Form states
  const [assignmentForm, setAssignmentForm] = useState({
    leadId: '',
    memberId: '',
    notes: ''
  });

  const statusOptions = [
    { id: 'pending', name: 'Pending' },
    { id: 'contacted', name: 'Contacted' },
    { id: 'qualified', name: 'Qualified' },
    { id: 'converted', name: 'Converted' },
    { id: 'lost', name: 'Lost' }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchAssignments();
      fetchTeamMembers();
      fetchUnassignedLeads();
    }
  }, [isAuthenticated, filterMember, filterStatus, searchTerm, fetchAssignments]);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filterMember) params.append('memberId', filterMember);
      if (filterStatus) params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/assignments?${params.toString()}`);
      setAssignments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to fetch assignments');
      setLoading(false);
    }
  }, [filterMember, filterStatus, searchTerm]);

  const fetchTeamMembers = async () => {
    try {
      const response = await api.get('/users/team');
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to fetch team members');
    }
  };

  const fetchUnassignedLeads = async () => {
    try {
      const response = await api.get('/leads/unassigned');
      setUnassignedLeads(response.data);
    } catch (error) {
      console.error('Error fetching unassigned leads:', error);
      toast.error('Failed to fetch unassigned leads');
    }
  };

  const handleAssignLead = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/assignments', assignmentForm);
      setAssignments([...assignments, response.data]);

      // Remove the assigned lead from unassigned leads
      setUnassignedLeads(unassignedLeads.filter(lead => lead._id !== assignmentForm.leadId));

      setShowAssignModal(false);
      resetForm();
      toast.success('Lead assigned successfully');
    } catch (error) {
      console.error('Error assigning lead:', error);
      toast.error(error.response?.data?.msg || 'Failed to assign lead');
    }
  };

  const handleReassignLead = async (assignmentId, newMemberId) => {
    try {
      const response = await api.put(`/assignments/${assignmentId}`, { memberId: newMemberId });
      setAssignments(assignments.map(assignment => 
        assignment._id === assignmentId ? response.data : assignment
      ));
      toast.success('Lead reassigned successfully');
    } catch (error) {
      console.error('Error reassigning lead:', error);
      toast.error('Failed to reassign lead');
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (window.confirm('Are you sure you want to remove this assignment?')) {
      try {
        await api.delete(`/assignments/${assignmentId}`);

        // Add the lead back to unassigned leads
        const assignment = assignments.find(a => a._id === assignmentId);
        if (assignment) {
          setUnassignedLeads([...unassignedLeads, assignment.leadId]);
        }

        setAssignments(assignments.filter(assignment => assignment._id !== assignmentId));
        toast.success('Assignment removed successfully');
      } catch (error) {
        console.error('Error removing assignment:', error);
        toast.error('Failed to remove assignment');
      }
    }
  };

  const openAssignModal = (lead) => {
    setSelectedLead(lead);
    setAssignmentForm({
      leadId: lead._id,
      memberId: '',
      notes: ''
    });
    setShowAssignModal(true);
  };

  const resetForm = () => {
    setAssignmentForm({
      leadId: '',
      memberId: '',
      notes: ''
    });
    setSelectedLead(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterMember('');
    setFilterStatus('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      case 'qualified':
        return 'bg-purple-100 text-purple-800';
      case 'converted':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (createdAt, status) => {
    if (status === 'converted' || status === 'lost') return false;
    const daysSinceCreation = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
    return daysSinceCreation > 3;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Assignments</h1>
          <p className="mt-1 text-sm text-gray-500">Manage lead assignments to your team members</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search assignments..."
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
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <XMarkIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
            Clear
          </button>
        </div>

        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-md flex flex-wrap gap-4 items-center">
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

            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                {statusOptions.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Unassigned Leads */}
      {unassignedLeads.length > 0 && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Unassigned Leads
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>You have {unassignedLeads.length} unassigned lead(s) that need to be assigned to team members.</p>
                <div className="mt-3">
                  <div className="-ml-4 -mt-2 flex flex-wrap items-center">
                    {unassignedLeads.slice(0, 3).map((lead) => (
                      <div key={lead._id} className="ml-4 mt-2">
                        <button
                          type="button"
                          onClick={() => openAssignModal(lead)}
                          className="inline-flex items-center px-3 py-1.5 border border-yellow-300 shadow-sm text-xs leading-4 font-medium rounded-md text-yellow-800 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                          Assign {lead.name}
                        </button>
                      </div>
                    ))}
                    {unassignedLeads.length > 3 && (
                      <div className="ml-4 mt-2">
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-1.5 border border-yellow-300 shadow-sm text-xs leading-4 font-medium rounded-md text-yellow-800 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                          View All ({unassignedLeads.length})
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assignments List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading assignments...</p>
          </div>
        ) : !assignments || assignments.length === 0 ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments</h3>
            <p className="mt-1 text-sm text-gray-500">There are no lead assignments at the moment.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {assignments.map((assignment) => (
              <li key={assignment._id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <UserIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {assignment.leadId.name}
                          </p>
                          <ArrowRightIcon className="mx-2 h-4 w-4 text-gray-400" aria-hidden="true" />
                          <p className="text-sm font-medium text-gray-900">
                            {assignment.memberId.name}
                          </p>
                          {isOverdue(assignment.createdAt, assignment.status) && (
                            <ExclamationCircleIcon className="ml-2 h-4 w-4 text-red-500" aria-hidden="true" />
                          )}
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                            {statusOptions.find(s => s.id === assignment.status)?.name}
                          </span>
                          <span className="ml-2 flex items-center">
                            <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" aria-hidden="true" />
                            Assigned {new Date(assignment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                      <select
                        className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                        defaultValue={assignment.memberId._id}
                        onChange={(e) => handleReassignLead(assignment._id, e.target.value)}
                      >
                        {teamMembers.map((member) => (
                          <option key={member._id} value={member._id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveAssignment(assignment._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Assign Lead Modal */}
      {showAssignModal && selectedLead && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAssignLead}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Assign Lead: {selectedLead.name}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="member" className="block text-sm font-medium text-gray-700">
                        Assign To *
                      </label>
                      <select
                        id="member"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={assignmentForm.memberId}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, memberId: e.target.value })}
                        required
                      >
                        <option value="">Select a team member</option>
                        {teamMembers.map((member) => (
                          <option key={member._id} value={member._id}>
                            {member.name} - {member.role}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                        Notes
                      </label>
                      <textarea
                        id="notes"
                        rows={3}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={assignmentForm.notes}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, notes: e.target.value })}
                        placeholder="Any special notes or instructions for this assignment..."
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Assign Lead
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setShowAssignModal(false);
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
    </div>
  );
}
