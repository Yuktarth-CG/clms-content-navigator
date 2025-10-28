import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Hook for fetching all knowledge graphs
export const useKnowledgeGraphs = (stateId: string = 'default') => {
  return useQuery({
    queryKey: ['knowledge-graphs', stateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_graphs')
        .select('*')
        .eq('state_id', stateId)
        .eq('is_active', true)
        .order('display_name');
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook for fetching a single knowledge graph with its fields
export const useKnowledgeGraph = (graphId: string | null) => {
  return useQuery({
    queryKey: ['knowledge-graph', graphId],
    queryFn: async () => {
      if (!graphId) return null;
      
      const { data, error } = await supabase
        .from('knowledge_graphs')
        .select(`
          *,
          knowledge_graph_fields(
            *,
            master_data_types(*)
          )
        `)
        .eq('id', graphId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!graphId,
  });
};

// Hook for creating a knowledge graph
export const useCreateKnowledgeGraph = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (graph: {
      name: string;
      display_name: string;
      description?: string;
      state_id: string;
      is_default?: boolean;
      fields: Array<{
        field_type_id: string;
        parent_field_id?: string | null;
        hierarchy_level: number;
        is_mandatory: boolean;
        display_order: number;
      }>;
    }) => {
      // MOCK: Skip auth check for testing
      const mockUserId = 'mock-user-id';

      // Create the graph
      const { data: graphData, error: graphError } = await supabase
        .from('knowledge_graphs')
        .insert({
          name: graph.name,
          display_name: graph.display_name,
          description: graph.description,
          state_id: graph.state_id,
          is_default: graph.is_default || false,
          created_by: mockUserId,
        })
        .select()
        .single();
      
      if (graphError) throw graphError;

      // Create the fields
      const fieldsToInsert = graph.fields.map(field => ({
        ...field,
        graph_id: graphData.id,
      }));

      const { error: fieldsError } = await supabase
        .from('knowledge_graph_fields')
        .insert(fieldsToInsert);
      
      if (fieldsError) throw fieldsError;

      return graphData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-graphs'] });
      toast({
        title: "Success",
        description: "Knowledge graph created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create knowledge graph: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Hook for updating a knowledge graph
export const useUpdateKnowledgeGraph = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, updates }: {
      id: string;
      updates: {
        name?: string;
        display_name?: string;
        description?: string;
        is_active?: boolean;
        is_default?: boolean;
      };
    }) => {
      const { data, error } = await supabase
        .from('knowledge_graphs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-graphs'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-graph'] });
      toast({
        title: "Success",
        description: "Knowledge graph updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update knowledge graph: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Hook for deleting a knowledge graph
export const useDeleteKnowledgeGraph = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('knowledge_graphs')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-graphs'] });
      toast({
        title: "Success",
        description: "Knowledge graph deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete knowledge graph: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
