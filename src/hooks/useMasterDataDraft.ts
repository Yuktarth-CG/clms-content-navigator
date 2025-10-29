import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Hook for fetching draft master data entries
export const useDraftMasterDataEntries = (graphId: string | null, typeId?: string) => {
  return useQuery({
    queryKey: ['draft-master-data-entries', graphId, typeId],
    queryFn: async () => {
      if (!graphId) return [];
      
      let query = supabase
        .from('master_data_entries')
        .select(`
          *,
          master_data_types(*)
        `)
        .eq('graph_id', graphId)
        .eq('status', 'draft')
        .eq('is_active', true);
      
      if (typeId) {
        query = query.eq('type_id', typeId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!graphId,
  });
};

// Hook for fetching live master data entries
export const useLiveMasterDataEntries = (graphId: string | null, typeId?: string) => {
  return useQuery({
    queryKey: ['live-master-data-entries', graphId, typeId],
    queryFn: async () => {
      if (!graphId) return [];
      
      let query = supabase
        .from('master_data_entries')
        .select(`
          *,
          master_data_types(*)
        `)
        .eq('graph_id', graphId)
        .eq('status', 'live')
        .eq('is_active', true);
      
      if (typeId) {
        query = query.eq('type_id', typeId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!graphId,
  });
};

// Hook for publishing draft entries to live
export const usePublishMasterData = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (graphId: string) => {
      // Get all draft entries for this graph
      const { data: draftEntries, error: fetchError } = await supabase
        .from('master_data_entries')
        .select('id')
        .eq('graph_id', graphId)
        .eq('status', 'draft')
        .eq('is_active', true);
      
      if (fetchError) throw fetchError;

      if (!draftEntries || draftEntries.length === 0) {
        throw new Error('No draft entries to publish');
      }

      // Update all draft entries to live
      const { error: updateError } = await supabase
        .from('master_data_entries')
        .update({
          status: 'live',
          published_at: new Date().toISOString(),
          published_by: null,
        })
        .eq('graph_id', graphId)
        .eq('status', 'draft')
        .eq('is_active', true);
      
      if (updateError) throw updateError;

      // Log the publication
      const { error: auditError } = await supabase
        .from('publication_audit')
        .insert({
          graph_id: graphId,
          published_by: null,
          published_by_name: 'Mock User',
          records_count: draftEntries.length,
          publication_metadata: {
            timestamp: new Date().toISOString(),
          },
        });
      
      if (auditError) throw auditError;

      return { count: draftEntries.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['draft-master-data-entries'] });
      queryClient.invalidateQueries({ queryKey: ['live-master-data-entries'] });
      queryClient.invalidateQueries({ queryKey: ['master-data-entries'] });
      toast({
        title: "Published Successfully",
        description: `${data.count} records have been published to live.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Publication Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for creating draft master data entry
export const useCreateDraftMasterDataEntry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (entry: {
      graph_id: string;
      type_id: string;
      name: any;
      parent_id?: string | null;
      state_id: string;
      metadata?: any;
    }) => {
      const { data, error } = await supabase
        .from('master_data_entries')
        .insert({
          graph_id: entry.graph_id,
          type_id: entry.type_id,
          name: entry.name,
          parent_id: entry.parent_id || null,
          state_id: entry.state_id,
          metadata: entry.metadata || {},
          status: 'draft',
          is_active: true,
          created_by: null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft-master-data-entries'] });
      toast({
        title: "Success",
        description: "Draft entry created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create draft entry: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Hook for bulk CSV upload to draft
export const useBulkUploadDraft = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (params: {
      graph_id: string;
      state_id: string;
      entries: Array<{
        type_id: string;
        name: any;
        parent_id?: string | null;
        metadata?: any;
      }>;
    }) => {
      const entriesToInsert = params.entries.map(entry => ({
        graph_id: params.graph_id,
        type_id: entry.type_id,
        name: entry.name,
        parent_id: entry.parent_id || null,
        state_id: params.state_id,
        metadata: entry.metadata || {},
        status: 'draft',
        is_active: true,
        created_by: null,
      }));

      const { data, error } = await supabase
        .from('master_data_entries')
        .insert(entriesToInsert)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['draft-master-data-entries'] });
      toast({
        title: "Upload Successful",
        description: `${data.length} entries uploaded to draft successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
