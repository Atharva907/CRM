// Define role-based permissions for the CRM system
const ROLE_PERMISSIONS = {
  admin: {
    // Navigation access
    canAccessDashboard: true,
    canAccessLeads: true,
    canAccessCustomers: true,
    canAccessDeals: true,
    canAccessTasks: true,
    canAccessReports: true,
    canAccessUserManagement: true,
    canAccessSystemConfiguration: true,

    // User management
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canViewAllUsers: true,

    // Data access
    canViewAllLeads: true,
    canViewAllCustomers: true,
    canViewAllDeals: true,
    canViewAllTasks: true,
    canViewAllReports: true,

    // Actions
    canAssignTasks: true,
    canApproveDeals: true,
    canDeleteAnyData: true,
    canConvertLeads: true,
    canConvertAllLeads: true,
    canUpdateAllLeads: true,
  },
  manager: {
    // Navigation access
    canAccessDashboard: true,
    canAccessLeads: true,
    canAccessCustomers: true,
    canAccessDeals: true,
    canAccessTasks: true,
    canAccessReports: true,
    canAccessUserManagement: true,
    canAccessSystemConfiguration: false,

    // User management
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canViewAllUsers: true,

    // Data access
    canViewAllLeads: true,
    canViewAllCustomers: true,
    canViewAllDeals: true,
    canViewAllTasks: true,
    canViewAllReports: true,

    // Actions
    canAssignTasks: true,
    canApproveDeals: true,
    canDeleteAnyData: false,
    canConvertLeads: true,
    canConvertAllLeads: true,
    canUpdateAllLeads: true,
  },
  sales: {
    // Navigation access
    canAccessDashboard: true,
    canAccessLeads: true,
    canAccessCustomers: true,
    canAccessDeals: true,
    canAccessTasks: true,
    canAccessReports: false,
    canAccessUserManagement: false,
    canAccessSystemConfiguration: false,

    // User management
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewAllUsers: false,

    // Data access
    canViewAllLeads: false,
    canViewAllCustomers: false,
    canViewAllDeals: false,
    canViewAllTasks: false,
    canViewAllReports: false,

    // Actions
    canAssignTasks: false,
    canApproveDeals: false,
    canDeleteAnyData: false,
    canConvertLeads: true,
  },
  support: {
    // Navigation access
    canAccessDashboard: true,
    canAccessLeads: true,
    canAccessCustomers: true,
    canAccessDeals: false,
    canAccessTasks: true,
    canAccessReports: false,
    canAccessUserManagement: false,
    canAccessSystemConfiguration: false,

    // User management
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewAllUsers: false,

    // Data access
    canViewAllLeads: false,
    canViewAllCustomers: false,
    canViewAllDeals: false,
    canViewAllTasks: false,
    canViewAllReports: false,

    // Actions
    canAssignTasks: false,
    canApproveDeals: false,
    canDeleteAnyData: false,
    canConvertLeads: true,
  },
};

// Helper function to check if a user has a specific permission
const hasPermission = (userRole, permission) => {
  if (!userRole || !ROLE_PERMISSIONS[userRole]) {
    return false;
  }
  return ROLE_PERMISSIONS[userRole][permission] === true;
};

// Helper function to check if a user can access a specific navigation item
const canAccessNavigation = (userRole, navigationHref) => {
  const navigationPermissions = {
    '/dashboard': 'canAccessDashboard',
    '/leads': 'canAccessLeads',
    '/customers': 'canAccessCustomers',
    '/deals': 'canAccessDeals',
    '/tasks': 'canAccessTasks',
    '/reports': 'canAccessReports',
    '/admin/users': 'canAccessUserManagement',
    '/admin/settings': 'canAccessSystemConfiguration',
  };

  const permissionKey = navigationPermissions[navigationHref];
  if (!permissionKey) {
    return true; // Default to allowing access if not explicitly restricted
  }

  return hasPermission(userRole, permissionKey);
};

module.exports = {
  ROLE_PERMISSIONS,
  hasPermission,
  canAccessNavigation
};
