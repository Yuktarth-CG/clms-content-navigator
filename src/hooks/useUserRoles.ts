import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'system_admin' | 'state_admin' | 'lead_admin' | 'content_creator';

// Hook for fetching current user's roles
export const useUserRoles = () => {
  return useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook to check if user has a specific role
export const useHasRole = (role: AppRole) => {
  const { data: roles, isLoading } = useUserRoles();
  
  const hasRole = roles?.some(r => r.role === role) || false;
  
  return { hasRole, isLoading };
};

// Hook to check if user can publish (lead_admin or system_admin)
export const useCanPublish = () => {
  const { data: roles, isLoading } = useUserRoles();
  
  const canPublish = roles?.some(r => 
    r.role === 'lead_admin' || r.role === 'system_admin'
  ) || false;
  
  return { canPublish, isLoading };
};
