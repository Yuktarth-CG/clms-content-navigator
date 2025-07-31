
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types/content';
import { getRolePermissions } from '@/utils/permissions';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  hasPermission: (permission: keyof import('@/types/content').UserPermissions) => boolean;
  canAccessRepository: (repositoryType: 'Public' | 'Private') => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  console.log('UserProvider rendering');
  
  // Demo user with updated name
  const [user, setUser] = useState<User | null>({
    id: 'user-001',
    name: 'Yuktarth Nagar',
    email: 'yuktarth.nagar@example.com',
    role: 'SuperAdmin',
    permissions: getRolePermissions('SuperAdmin'),
    createdAt: '2024-01-01',
    lastLogin: '2024-06-24',
    isActive: true,
  });
  
  console.log('UserProvider user state:', user);

  const hasPermission = (permission: keyof import('@/types/content').UserPermissions): boolean => {
    if (!user) return false;
    return user.permissions[permission];
  };

  const canAccessRepository = (repositoryType: 'Public' | 'Private'): boolean => {
    if (!user) return false;
    
    if (repositoryType === 'Public') {
      return user.permissions.canAccessPublicRepository;
    } else {
      return user.permissions.canAccessPrivateRepository;
    }
  };

  const value = {
    user,
    setUser,
    hasPermission,
    canAccessRepository,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
