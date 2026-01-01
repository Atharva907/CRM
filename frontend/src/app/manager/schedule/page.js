"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  XMarkIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function TeamSchedule() {
  const { isAuthenticated } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'
  const [filterMember, setFilterMember] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  // Form states
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    date: '',
    memberId: '',
    type: 'meeting' // 'meeting', 'task', 'appointment', 'reminder'
  });

  const eventTypes = [
    { id: 'meeting', name: 'Meeting', color: 'bg-blue-500' },
    { id: 'task', name: 'Task', color: 'bg-green-500' },
    { id: 'appointment', name: 'Appointment', color: 'bg-purple-500' },
    { id: 'reminder', name: 'Reminder', color: 'bg-yellow-500' }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchSchedule();
      fetchTeamMembers();
    }
  }, [isAuthenticated, currentDate, filterMember]);

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filterMember) params.append('memberId', filterMember);
      params.append('date', currentDate.toISOString());
      params.append('viewMode', viewMode);

      const response = await api.get(`/schedule?${params.toString()}`);
      setSchedule(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Failed to fetch schedule');
      setLoading(false);
    }
  }, [currentDate, filterMember, viewMode]);

  const fetchTeamMembers = async () => {
    try {
      const response = await api.get('/users/team');
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to fetch team members');
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/schedule', eventForm);
      setSchedule([...schedule, response.data]);
      setShowAddEventModal(false);
      resetEventForm();
      toast.success('Event added successfully');
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error(error.response?.data?.msg || 'Failed to add event');
    }
  };

  const handleUpdateEvent = async (eventId, updatedEvent) => {
    try {
      const response = await api.put(`/schedule/${eventId}`, updatedEvent);
      setSchedule(schedule.map(event => 
        event._id === eventId ? response.data : event
      ));
      toast.success('Event updated successfully');
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/schedule/${eventId}`);
        setSchedule(schedule.filter(event => event._id !== eventId));
        toast.success('Event deleted successfully');
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      memberId: '',
      type: 'meeting'
    });
  };

  const openAddEventModal = (date) => {
    setSelectedDate(date);
    setEventForm({
      ...eventForm,
      date: date.toISOString().split('T')[0]
    });
    setShowAddEventModal(true);
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);

    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }

    setCurrentDate(newDate);
  };

  const clearFilters = () => {
    setFilterMember('');
  };

  const getEventTypeColor = (type) => {
    const eventType = eventTypes.find(t => t.id === type);
    return eventType ? eventType.color : 'bg-gray-500';
  };

  const formatDateHeader = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', options);
    } else if (viewMode === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  const generateDaysForView = () => {
    const days = [];

    if (viewMode === 'day') {
      days.push(new Date(currentDate));
    } else if (viewMode === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());

      for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        days.push(day);
      }
    } else if (viewMode === 'month') {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Add previous month's trailing days
      const startDate = new Date(monthStart);
      startDate.setDate(monthStart.getDate() - monthStart.getDay());

      // Add next month's leading days
      const endDate = new Date(monthEnd);
      endDate.setDate(monthEnd.getDate() + (6 - monthEnd.getDay()));

      while (startDate <= endDate) {
        days.push(new Date(startDate));
        startDate.setDate(startDate.getDate() + 1);
      }
    }

    return days;
  };

  const getEventsForDay = (day) => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    return schedule.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= dayStart && eventDate <= dayEnd;
    });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Schedule</h1>
          <p className="mt-1 text-sm text-gray-500">View and manage your team&apos;s schedule</p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <div className="flex items-center bg-white rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                viewMode === 'day' 
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Day
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`px-3 py-2 text-sm font-medium border-t border-b ${
                viewMode === 'week' 
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`px-3 py-2 text-sm font-medium rounded-r-md border ${
                viewMode === 'month' 
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
          </div>

          <button
            type="button"
            onClick={() => openAddEventModal(new Date())}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Event
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="mb-6 bg-white shadow rounded-lg p-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigateDate('prev')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
          </button>

          <h2 className="text-lg font-medium text-gray-900">
            {formatDateHeader()}
          </h2>

          <button
            type="button"
            onClick={() => navigateDate('next')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex gap-2">
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

      {/* Calendar Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading schedule...</p>
          </div>
        ) : (
          <div className={viewMode === 'month' ? 'grid grid-cols-7' : ''}>
            {/* Day headers */}
            {viewMode === 'week' || viewMode === 'month' ? (
              <div className="grid grid-cols-7 border-b border-gray-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="px-2 py-3 text-center text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
            ) : null}

            {/* Calendar days */}
            <div className={viewMode === 'month' ? 'grid grid-cols-7' : ''}>
              {generateDaysForView().map((day, index) => {
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isToday = new Date().toDateString() === day.toDateString();
                const dayEvents = getEventsForDay(day);

                return (
                  <div 
                    key={index} 
                    className={`${
                      viewMode === 'month' ? 'min-h-[120px] border-r border-b border-gray-200' : ''
                    } ${!isCurrentMonth && viewMode === 'month' ? 'bg-gray-50' : ''}`}
                    onClick={() => viewMode === 'day' || viewMode === 'week' ? openAddEventModal(day) : null}
                  >
                    <div className={`p-2 ${viewMode === 'day' || viewMode === 'week' ? '' : 'h-full'}`}>
                      <div className={`flex justify-between items-center mb-2 ${
                        viewMode === 'day' || viewMode === 'week' ? '' : 'mb-1'
                      }`}>
                        <span className={`text-sm font-medium ${
                          isToday ? 'text-indigo-600' : 'text-gray-900'
                        } ${!isCurrentMonth && viewMode === 'month' ? 'text-gray-400' : ''}`}>
                          {day.getDate()}
                        </span>
                        {isToday && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            Today
                          </span>
                        )}
                      </div>

                      {/* Events list */}
                      <div className="space-y-1">
                        {dayEvents.slice(0, viewMode === 'month' ? 3 : dayEvents.length).map((event) => (
                          <div 
                            key={event._id}
                            className={`text-xs p-1 rounded truncate text-white ${getEventTypeColor(event.type)}`}
                          >
                            <div className="flex items-center">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {new Date(event.startTime).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit' 
                              })}
                            </div>
                            <div>{event.title}</div>
                            {event.memberId && (
                              <div className="flex items-center mt-1">
                                <UserIcon className="h-3 w-3 mr-1" />
                                {event.memberId.name}
                              </div>
                            )}
                          </div>
                        ))}

                        {viewMode === 'month' && dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddEvent}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Add Event</h3>
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
                        value={eventForm.title}
                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
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
                        value={eventForm.description}
                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                          Date *
                        </label>
                        <input
                          type="date"
                          id="date"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={eventForm.date}
                          onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                          Type *
                        </label>
                        <select
                          id="type"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={eventForm.type}
                          onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                          required
                        >
                          {eventTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                          Start Time *
                        </label>
                        <input
                          type="time"
                          id="startTime"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={eventForm.startTime}
                          onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                          End Time *
                        </label>
                        <input
                          type="time"
                          id="endTime"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={eventForm.endTime}
                          onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="memberId" className="block text-sm font-medium text-gray-700">
                        Team Member
                      </label>
                      <select
                        id="memberId"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={eventForm.memberId}
                        onChange={(e) => setEventForm({ ...eventForm, memberId: e.target.value })}
                      >
                        <option value="">None</option>
                        {teamMembers.map((member) => (
                          <option key={member._id} value={member._id}>
                            {member.name}
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
                    Add Event
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setShowAddEventModal(false);
                      resetEventForm();
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
