import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MasterDataType {
  id: string;
  name: string;
  display_name: string;
  is_mandatory: boolean;
  is_hierarchical: boolean;
  parent_type_id: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface MasterDataEntry {
  id: string;
  type_id: string;
  name: any; // JSON field
  parent_id: string | null;
  state_id: string;
  metadata: any; // JSON field
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface StateFieldConfig {
  id: string;
  state_id: string;
  field_type_id: string;
  is_active: boolean;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

// Hook for fetching master data types
export const useMasterDataTypes = () => {
  return useQuery({
    queryKey: ['master-data-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('master_data_types')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook for fetching state field configuration
export const useStateFieldConfig = (stateId: string) => {
  return useQuery({
    queryKey: ['state-field-config', stateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('state_field_config')
        .select(`
          *,
          master_data_types(*)
        `)
        .eq('state_id', stateId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!stateId,
  });
};

// Hook for fetching master data entries
export const useMasterDataEntries = (stateId: string, typeId?: string) => {
  return useQuery({
    queryKey: ['master-data-entries', stateId, typeId],
    queryFn: async () => {
      let query = supabase
        .from('master_data_entries')
        .select(`
          *,
          master_data_types(*)
        `)
        .eq('state_id', stateId)
        .eq('is_active', true);
      
      if (typeId) {
        query = query.eq('type_id', typeId);
      }
      
      const { data, error } = await query.order('created_at');
      
      if (error) throw error;
      return data;
    },
    enabled: !!stateId,
  });
};

// Hook for creating master data entry
export const useCreateMasterDataEntry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (entry: {
      type_id: string;
      name: any;
      parent_id?: string | null;
      state_id: string;
      metadata?: any;
      created_by: string;
    }) => {
      const { data, error } = await supabase
        .from('master_data_entries')
        .insert({
          type_id: entry.type_id,
          name: entry.name,
          parent_id: entry.parent_id || null,
          state_id: entry.state_id,
          metadata: entry.metadata || {},
          is_active: true,
          created_by: entry.created_by,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-data-entries'] });
      toast({
        title: "Success",
        description: "Master data entry created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create entry: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Hook for updating master data entry
export const useUpdateMasterDataEntry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { 
      id: string; 
      updates: {
        name?: any;
        parent_id?: string | null;
        metadata?: any;
        is_active?: boolean;
      }
    }) => {
      const { data, error } = await supabase
        .from('master_data_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-data-entries'] });
      toast({
        title: "Success",
        description: "Master data entry updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update entry: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Hook for deleting master data entry (soft delete)
export const useDeleteMasterDataEntry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('master_data_entries')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-data-entries'] });
      toast({
        title: "Success",
        description: "Master data entry deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete entry: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Hook for updating state field configuration
export const useUpdateStateFieldConfig = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (configs: Array<{
      id?: string;
      state_id: string;
      field_type_id: string;
      is_active: boolean;
      is_required: boolean;
    }>) => {
      const { error } = await supabase
        .from('state_field_config')
        .upsert(configs);
      
      if (error) throw error;
      return configs;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['state-field-config'] });
      toast({
        title: "Success",
        description: "Field configuration updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update configuration: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};