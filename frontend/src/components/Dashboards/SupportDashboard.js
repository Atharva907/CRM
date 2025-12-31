
import React from 'react';
import {
  UsersIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const SupportDashboard = ({ user }) => {
  // Sample data - in a real app, this would come from API calls
  const stats = [
    { name: 'Open Tickets', value: '12', icon: ExclamationTriangleIcon, color: 'bg-red-500' },
    { name: 'Pending Response', value: '8', icon: ClipboardDocumentListIcon, color: 'bg-yellow-500' },
    { name: 'Resolved Today', value: '15', icon: CheckCircleIcon, color: 'bg-green-500' },
    { name: 'Customers Helped', value: '47', icon: UsersIcon, color: 'bg-blue-500' },
  ];

  const recentTickets = [
    { id: 'TKT-1001', customer: 'Acme Corp', subject: 'Login issues', status: 'Open', priority: 'High' },
    { id: 'TKT-1002', customer: 'Globex Corp', subject: 'Feature request', status: 'Pending', priority: 'Medium' },
    { id: 'TKT-1003', customer: 'Initech', subject: 'Billing question', status: 'Open', priority: 'Low' },
    { id: 'TKT-1004', customer: 'Hooli', subject: 'Data export problem', status: 'Resolved', priority: 'High' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h2>
        <p className="mt-1 text-sm text-gray-600">Here's what's happening with your support tickets today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className={`h-6 w-6 text-white ${stat.color} rounded-md p-1`} aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Tickets */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Tickets</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Latest support tickets assigned to you.</p>
        </div>
        <ul className="divide-y divide-gray-200">
          {recentTickets.map((ticket) => (
            <li key={ticket.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-indigo-600 truncate">{ticket.id}</p>
                    <p className="ml-2 text-sm text-gray-900 truncate">{ticket.customer}</p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      ticket.status === 'Open' ? 'bg-red-100 text-red-800' :
                      ticket.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {ticket.subject}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      ticket.priority === 'High' ? 'bg-red-100 text-red-800' :
                      ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SupportDashboard;
