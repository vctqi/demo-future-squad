import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import permissionsService from '../services/permissionsService';
import { RootState } from '../store';

// Permission rule type
interface PermissionRule {
  action: string | string[];
  subject: string;
  conditions?: Record<string, any>;
  inverted?: boolean;
}

// Common permissions interface
interface CommonPermissions {
  canManageUsers: boolean;
  canApproveSuppliers: boolean;
  canCreateServices: boolean;
  canApproveServices: boolean;
  canManageCategories: boolean;
  canCreateContracts: boolean;
  canViewReports: boolean;
  canViewDashboard: boolean;
  isAdmin: boolean;
  isSupplier: boolean;
  isClient: boolean;
}

// Permissions context type
interface PermissionsContextType {
  permissions: CommonPermissions;
  rules: PermissionRule[];
  userRole: string | null;
  loading: boolean;
  error: string | null;
  refreshPermissions: () => Promise<void>;
  can: (action: string, subject: string, data?: Record<string, any>) => boolean;
}

// Default permissions
const defaultPermissions: CommonPermissions = {
  canManageUsers: false,
  canApproveSuppliers: false,
  canCreateServices: false,
  canApproveServices: false,
  canManageCategories: false,
  canCreateContracts: false,
  canViewReports: false,
  canViewDashboard: false,
  isAdmin: false,
  isSupplier: false,
  isClient: false,
};

// Create context
const PermissionsContext = createContext<PermissionsContextType>({
  permissions: defaultPermissions,
  rules: [],
  userRole: null,
  loading: false,
  error: null,
  refreshPermissions: async () => {},
  can: () => false,
});

// Hook to use permissions context
export const usePermissions = () => useContext(PermissionsContext);

// Permissions provider component
export const PermissionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<CommonPermissions>(defaultPermissions);
  const [rules, setRules] = useState<PermissionRule[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Function to check if a user can perform an action on a subject
  const can = (action: string, subject: string, data?: Record<string, any>): boolean => {
    // If not authenticated, deny all permissions
    if (!isAuthenticated) return false;
    
    // Quick checks for common permissions
    if (permissions.isAdmin) return true;
    
    if (action === 'manage' && subject === 'users' && permissions.canManageUsers) return true;
    if (action === 'approve' && subject === 'suppliers' && permissions.canApproveSuppliers) return true;
    if (action === 'create' && subject === 'services' && permissions.canCreateServices) return true;
    if (action === 'approve' && subject === 'services' && permissions.canApproveServices) return true;
    if (action === 'manage' && subject === 'categories' && permissions.canManageCategories) return true;
    if (action === 'create' && subject === 'contracts' && permissions.canCreateContracts) return true;
    if (action === 'read' && subject === 'reports' && permissions.canViewReports) return true;
    if (action === 'read' && subject === 'dashboard' && permissions.canViewDashboard) return true;
    
    // If no quick check matched, check rules
    for (const rule of rules) {
      const actionsMatch = Array.isArray(rule.action)
        ? rule.action.includes(action)
        : rule.action === action;
        
      const subjectMatch = rule.subject === subject || rule.subject === 'all';
      
      if (actionsMatch && subjectMatch) {
        // Check conditions if present
        if (rule.conditions && data) {
          // Simple condition matching logic
          const conditionsMatch = Object.entries(rule.conditions).every(([key, value]) => {
            if (key === '$in' && Array.isArray(value)) {
              return data[key] && value.includes(data[key]);
            }
            return data[key] === value;
          });
          
          // Apply inverted flag
          return rule.inverted ? !conditionsMatch : conditionsMatch;
        }
        
        // No conditions, just check inverted flag
        return !rule.inverted;
      }
    }
    
    // Default to denying permission
    return false;
  };
  
  // Function to fetch user permissions
  const fetchPermissions = async () => {
    if (!isAuthenticated) {
      setPermissions(defaultPermissions);
      setRules([]);
      setUserRole(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await permissionsService.getUserPermissions();
      
      setPermissions(data.permissions);
      setRules(data.rules);
      setUserRole(data.role);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch permissions when authentication state changes
  useEffect(() => {
    fetchPermissions();
  }, [isAuthenticated]);
  
  // Context value
  const value = {
    permissions,
    rules,
    userRole,
    loading,
    error,
    refreshPermissions: fetchPermissions,
    can,
  };
  
  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};