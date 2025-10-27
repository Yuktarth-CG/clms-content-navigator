-- =====================================================
-- KNOWLEDGE GRAPH-BASED MASTER DATA MANAGEMENT SYSTEM
-- =====================================================

-- 1. CREATE USER ROLES SYSTEM
-- =====================================================

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM (
  'system_admin',
  'state_admin', 
  'lead_admin',
  'content_creator'
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  state_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role, state_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'system_admin'));

-- 2. CREATE KNOWLEDGE GRAPHS SYSTEM
-- =====================================================

-- Knowledge Graphs table
CREATE TABLE public.knowledge_graphs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  state_id TEXT NOT NULL DEFAULT 'default',
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(name, state_id, version)
);

-- Knowledge Graph Fields (defines the hierarchy)
CREATE TABLE public.knowledge_graph_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  graph_id UUID REFERENCES public.knowledge_graphs(id) ON DELETE CASCADE NOT NULL,
  field_type_id UUID REFERENCES public.master_data_types(id) NOT NULL,
  parent_field_id UUID REFERENCES public.knowledge_graph_fields(id),
  hierarchy_level INTEGER NOT NULL,
  is_mandatory BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_graphs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_graph_fields ENABLE ROW LEVEL SECURITY;

-- RLS Policies for knowledge_graphs
CREATE POLICY "Anyone can view active knowledge graphs"
  ON public.knowledge_graphs FOR SELECT
  USING (is_active = true);

CREATE POLICY "System admins can manage knowledge graphs"
  ON public.knowledge_graphs FOR ALL
  USING (public.has_role(auth.uid(), 'system_admin'));

-- RLS Policies for knowledge_graph_fields
CREATE POLICY "Anyone can view knowledge graph fields"
  ON public.knowledge_graph_fields FOR SELECT
  USING (true);

CREATE POLICY "System admins can manage knowledge graph fields"
  ON public.knowledge_graph_fields FOR ALL
  USING (public.has_role(auth.uid(), 'system_admin'));

-- 3. UPDATE MASTER DATA ENTRIES FOR DRAFT/LIVE
-- =====================================================

-- Add new columns to master_data_entries
ALTER TABLE public.master_data_entries 
  ADD COLUMN graph_id UUID REFERENCES public.knowledge_graphs(id),
  ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'live')),
  ADD COLUMN published_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN published_by UUID REFERENCES auth.users(id);

-- Create index for performance
CREATE INDEX idx_master_data_entries_graph_status ON public.master_data_entries(graph_id, status);
CREATE INDEX idx_master_data_entries_type_status ON public.master_data_entries(type_id, status, is_active);

-- 4. PUBLICATION AUDIT TABLE
-- =====================================================

CREATE TABLE public.publication_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  graph_id UUID REFERENCES public.knowledge_graphs(id) NOT NULL,
  published_by UUID REFERENCES auth.users(id) NOT NULL,
  published_by_name TEXT NOT NULL,
  records_count INTEGER NOT NULL,
  publication_metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.publication_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view publication audit logs"
  ON public.publication_audit FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert publication audit logs"
  ON public.publication_audit FOR INSERT
  WITH CHECK (true);

-- 5. UPDATE EXISTING TABLES
-- =====================================================

-- Add triggers for updated_at
CREATE TRIGGER update_knowledge_graphs_updated_at
  BEFORE UPDATE ON public.knowledge_graphs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_knowledge_graph_fields_updated_at
  BEFORE UPDATE ON public.knowledge_graph_fields
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6. MIGRATE EXISTING DATA
-- =====================================================

-- Create a default knowledge graph from existing master_data_types
INSERT INTO public.knowledge_graphs (
  name, 
  display_name, 
  description, 
  state_id, 
  is_active, 
  is_default,
  created_by
)
SELECT 
  'default_graph',
  'Default Knowledge Graph',
  'Migrated from existing master data structure',
  'default',
  true,
  true,
  (SELECT id FROM auth.users LIMIT 1)
WHERE EXISTS (SELECT 1 FROM master_data_types LIMIT 1);

-- Migrate master_data_types to knowledge_graph_fields
INSERT INTO public.knowledge_graph_fields (
  graph_id,
  field_type_id,
  parent_field_id,
  hierarchy_level,
  is_mandatory,
  display_order
)
SELECT 
  (SELECT id FROM public.knowledge_graphs WHERE name = 'default_graph'),
  mdt.id,
  NULL,
  COALESCE(mdt.display_order, 0),
  COALESCE(mdt.is_mandatory, false),
  COALESCE(mdt.display_order, 0)
FROM public.master_data_types mdt
WHERE EXISTS (SELECT 1 FROM public.knowledge_graphs WHERE name = 'default_graph');

-- Update existing master_data_entries to link to default graph and set as live
UPDATE public.master_data_entries
SET 
  graph_id = (SELECT id FROM public.knowledge_graphs WHERE name = 'default_graph'),
  status = 'live',
  published_at = created_at,
  published_by = created_by
WHERE graph_id IS NULL;