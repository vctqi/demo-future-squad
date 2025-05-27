import React, { ReactNode } from 'react';
import { usePermissions } from '../../contexts/PermissionsContext';

interface PermissionGuardProps {
  children: ReactNode;
  action: string;
  subject: string;
  data?: Record<string, any>;
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  action,
  subject,
  data,
  fallback = null,
}) => {
  const { can } = usePermissions();
  
  if (can(action, subject, data)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

export default PermissionGuard;