import { AbilityBuilder, Ability, AbilityClass, ExtractSubjectType, subject } from '@casl/ability';
import { Role } from '@prisma/client';
import { logger } from '../../config/logger';

// Define actions
export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Approve = 'approve',
}

// Define subject types with proper typing
export interface User {
  id: string;
  role: string;
  email: string;
  status: string;
}

export interface Profile {
  id: string;
  userId: string;
}

export interface ClientProfile {
  id: string;
  userId: string;
}

export interface SupplierProfile {
  id: string;
  userId: string;
}

export interface Service {
  id: string;
  supplierId: string;
}

export interface Contract {
  id: string;
  clientId: string;
  serviceId: string;
}

export interface Category {
  id: string;
}

export interface ServiceReview {
  id: string;
  clientId: string;
  serviceId: string;
}

// Define subject types mapping
export type Subjects = 
  | 'User' 
  | 'Profile'
  | 'ClientProfile'
  | 'SupplierProfile'
  | 'Service'
  | 'Contract'
  | 'Category'
  | 'ServiceReview'
  | 'Dashboard'
  | 'Report'
  | 'all';

// Define AppAbility type
export type AppAbility = Ability<[Action, Subjects]>;
const AppAbility = Ability as AbilityClass<AppAbility>;

// Define ownership checking function
function checkOwnership(user: User, resource: any): boolean {
  if (!user || !resource) return false;
  
  // Check direct ownership
  if (resource.userId && resource.userId === user.id) return true;
  
  // Check supplier ownership for services
  if (resource.supplierId && user.role === Role.SUPPLIER) {
    // This requires a more complex lookup in the actual implementation
    return resource.supplierId === (user as any).supplierProfile?.id;
  }
  
  // Check client ownership for contracts and reviews
  if ((resource.clientId || resource.clientId) && user.role === Role.USER) {
    // This requires a more complex lookup in the actual implementation
    return resource.clientId === (user as any).clientProfile?.id;
  }
  
  return false;
}

/**
 * Define user abilities based on role
 * @param user User object
 * @returns Ability instance
 */
export function defineAbilitiesFor(user: User): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(AppAbility);
  
  logger.debug(`Defining abilities for user ${user.id} with role ${user.role}`);
  
  // Default abilities for inactive users
  if (user.status !== 'ACTIVE') {
    can(Action.Read, 'Profile', { userId: user.id });
    return build();
  }
  
  // User role abilities (CLIENT)
  if (user.role === Role.USER) {
    // Profile management
    can(Action.Read, 'Profile', { userId: user.id });
    can(Action.Update, 'Profile', { userId: user.id });
    
    // Client profile management
    can(Action.Read, 'ClientProfile', { userId: user.id });
    can(Action.Update, 'ClientProfile', { userId: user.id });
    
    // Service browsing
    can(Action.Read, 'Service');
    can(Action.Read, 'Category');
    
    // Contract management
    can(Action.Create, 'Contract');
    can(Action.Read, 'Contract', { clientId: (user as any).clientProfile?.id });
    can(Action.Update, 'Contract', { clientId: (user as any).clientProfile?.id });
    
    // Reviews
    can(Action.Create, 'ServiceReview');
    can(Action.Read, 'ServiceReview');
    can(Action.Update, 'ServiceReview', { clientId: (user as any).clientProfile?.id });
    can(Action.Delete, 'ServiceReview', { clientId: (user as any).clientProfile?.id });
    
    // Dashboard
    can(Action.Read, 'Dashboard');
  }
  
  // Supplier role abilities
  if (user.role === Role.SUPPLIER) {
    // Profile management
    can(Action.Read, 'Profile', { userId: user.id });
    can(Action.Update, 'Profile', { userId: user.id });
    
    // Supplier profile management
    can(Action.Read, 'SupplierProfile', { userId: user.id });
    can(Action.Update, 'SupplierProfile', { userId: user.id });
    
    // Service management
    can(Action.Create, 'Service');
    can(Action.Read, 'Service');
    can(Action.Update, 'Service', { supplierId: (user as any).supplierProfile?.id });
    can(Action.Delete, 'Service', { supplierId: (user as any).supplierProfile?.id });
    
    // Category browsing
    can(Action.Read, 'Category');
    
    // Contract management
    can(Action.Read, 'Contract', { 
      serviceId: { 
        $in: (user as any).supplierProfile?.services.map((s: any) => s.id) || [] 
      } 
    });
    can(Action.Update, 'Contract', { 
      serviceId: { 
        $in: (user as any).supplierProfile?.services.map((s: any) => s.id) || [] 
      } 
    });
    
    // Reviews
    can(Action.Read, 'ServiceReview', { 
      serviceId: { 
        $in: (user as any).supplierProfile?.services.map((s: any) => s.id) || [] 
      } 
    });
    
    // Dashboard
    can(Action.Read, 'Dashboard');
  }
  
  // Admin role abilities
  if (user.role === Role.ADMIN) {
    // Admin can do anything
    can(Action.Manage, 'all');
  }
  
  return build({
    // Use custom detectSubjectType function to extract the type properly
    detectSubjectType: (item) => {
      if (!item) return 'all';
      
      if (typeof item === 'string') {
        return item as ExtractSubjectType<Subjects>;
      }
      
      // Get the constructor name as the subject type
      const subjectType = item.constructor?.name;
      return subjectType as ExtractSubjectType<Subjects>;
    },
  });
}

/**
 * Check if a user can perform an action on a subject
 * @param user User object
 * @param action Action to check
 * @param subject Subject to check
 * @param subjectData Optional subject data
 * @returns True if the user can perform the action
 */
export function canUserDo(
  user: User, 
  action: Action, 
  subjectType: Subjects, 
  subjectData?: any
): boolean {
  const ability = defineAbilitiesFor(user);
  
  // If we have subject data, check permissions on the specific subject
  if (subjectData) {
    return ability.can(action, subject(subjectType, subjectData));
  }
  
  // Otherwise, check permissions on the subject type
  return ability.can(action, subjectType);
}