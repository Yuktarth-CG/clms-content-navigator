import { supabase } from '@/integrations/supabase/client';

/**
 * Mock function to assign roles to the current user for testing
 * In production, this would be done by proper admin workflows
 */
export const assignMockRole = async (role: 'system_admin' | 'state_admin' | 'lead_admin' | 'content_creator') => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('No user logged in');
  }

  // Check if role already exists
  const { data: existingRoles } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user.id)
    .eq('role', role);

  if (existingRoles && existingRoles.length > 0) {
    console.log(`User already has ${role} role`);
    return existingRoles[0];
  }

  // Insert new role
  const { data, error } = await supabase
    .from('user_roles')
    .insert({
      user_id: user.id,
      role: role,
      state_id: 'default',
    })
    .select()
    .single();

  if (error) throw error;
  
  console.log(`Assigned ${role} role to user`);
  return data;
};

/**
 * Helper to log current user's roles
 */
export const logCurrentUserRoles = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('No user logged in');
    return;
  }

  const { data: roles } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user.id);

  console.log('Current user roles:', roles);
  return roles;
};
