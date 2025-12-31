
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../utils/permissions';
import AdminDashboard from '../Dashboards/AdminDashboard';
import ManagerDashboard from '../Dashboards/ManagerDashboard';
import SalesDashboard from '../Dashboards/SalesDashboard';
import SupportDashboard from '../Dashboards/SupportDashboard';

/**
 * Component that renders the appropriate dashboard based on user role
 */
const RoleBasedDashboard = () => {
  const { user } = useAuth();

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard user={user} />;
      case 'manager':
        return <ManagerDashboard user={user} />;
      case 'sales':
        return <SalesDashboard user={user} />;
      case 'support':
        return <SupportDashboard user={user} />;
      default:
        // Default to sales dashboard if role is not recognized
        return <SalesDashboard user={user} />;
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      {renderDashboard()}
    </div>
  );
};

export default RoleBasedDashboard;
