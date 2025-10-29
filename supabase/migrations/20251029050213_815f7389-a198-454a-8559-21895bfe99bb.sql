-- Temporarily allow knowledge graph creation for testing/mock flow
-- Drop the restrictive policy and add a more permissive one
DROP POLICY IF EXISTS "System admins can manage knowledge graphs" ON public.knowledge_graphs;

-- Allow any user to manage knowledge graphs for mock flow
CREATE POLICY "Allow knowledge graph management for mock flow"
ON public.knowledge_graphs
FOR ALL
USING (true)
WITH CHECK (true);

-- Do the same for knowledge_graph_fields
DROP POLICY IF EXISTS "System admins can manage knowledge graph fields" ON public.knowledge_graph_fields;

CREATE POLICY "Allow knowledge graph fields management for mock flow"
ON public.knowledge_graph_fields
FOR ALL
USING (true)
WITH CHECK (true);