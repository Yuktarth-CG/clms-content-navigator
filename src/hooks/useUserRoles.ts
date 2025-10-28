import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'system_admin' | 'state_admin' | 'lead_admin' | 'content_creator';

// Hook for fetching current user's roles (MOCK: returns all roles for testing)
export const useUserRoles = () => {
  return useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      // MOCK: Return all roles for testing without DB check
      return [
        { role: 'system_admin', user_id: 'mock', state_id: 'default', id: '1', created_at: new Date().toISOString() },
        { role: 'lead_admin', user_id: 'mock', state_id: 'default', id: '2', created_at: new Date().toISOString() },
        { role: 'state_admin', user_id: 'mock', state_id: 'default', id: '3', created_at: new Date().toISOString() },
        { role: 'content_creator', user_id: 'mock', state_id: 'default', id: '4', created_at: new Date().toISOString() },
      ];
    },
  });
};

// Hook to check if user has a specific role (MOCK: always returns true)
export const useHasRole = (role: AppRole) => {
  const { data: roles, isLoading } = useUserRoles();
  
  // MOCK: Always return true for testing
  const hasRole = true;
  
  return { hasRole, isLoading };
};

// Hook to check if user can publish (MOCK: always returns true)
export const useCanPublish = () => {
  const { data: roles, isLoading } = useUserRoles();
  
  // MOCK: Always return true for testing
  const canPublish = true;
  
  return { canPublish, isLoading };
};
