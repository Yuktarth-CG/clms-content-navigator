-- Create master data management schema
CREATE TYPE master_data_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'BULK_UPLOAD');

-- Master data types configuration table
CREATE TABLE public.master_data_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  is_mandatory BOOLEAN DEFAULT false,
  is_hierarchical BOOLEAN DEFAULT false,
  parent_type_id UUID REFERENCES master_data_types(id),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- State-specific field configuration
CREATE TABLE public.state_field_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id TEXT NOT NULL, -- Using text for state identifier
  field_type_id UUID REFERENCES master_data_types(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(state_id, field_type_id)
);

-- Master data entries
CREATE TABLE public.master_data_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_id UUID REFERENCES master_data_types(id) ON DELETE CASCADE,
  name JSONB NOT NULL, -- Multi-language support {"en": "Mathematics", "hi": "गणित"}
  parent_id UUID REFERENCES master_data_entries(id) ON DELETE CASCADE,
  state_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}', -- Additional flexible data
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CSV upload jobs tracking
CREATE TABLE public.csv_upload_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  state_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  error_rows INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Master data audit trail
CREATE TABLE public.master_data_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action master_data_action NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  state_id TEXT,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.master_data_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.state_field_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_data_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csv_upload_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_data_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for master_data_types (globally readable, admin manageable)
CREATE POLICY "Master data types are readable by everyone"
ON public.master_data_types FOR SELECT
USING (true);

CREATE POLICY "Admins can manage master data types"
ON public.master_data_types FOR ALL
USING (auth.uid() IS NOT NULL); -- Will be refined based on user roles

-- RLS Policies for state_field_config (state-specific)
CREATE POLICY "Users can view their state field config"
ON public.state_field_config FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage state field config"
ON public.state_field_config FOR ALL
USING (auth.uid() IS NOT NULL);

-- RLS Policies for master_data_entries (state-specific)
CREATE POLICY "Users can view master data entries"
ON public.master_data_entries FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create master data entries"
ON public.master_data_entries FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their master data entries"
ON public.master_data_entries FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their master data entries"
ON public.master_data_entries FOR DELETE
USING (auth.uid() = created_by);

-- RLS Policies for csv_upload_jobs
CREATE POLICY "Users can view their upload jobs"
ON public.csv_upload_jobs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create upload jobs"
ON public.csv_upload_jobs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their upload jobs"
ON public.csv_upload_jobs FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for audit logs
CREATE POLICY "Users can view relevant audit logs"
ON public.master_data_audit FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs"
ON public.master_data_audit FOR INSERT
WITH CHECK (true);

-- Insert default master data types
INSERT INTO public.master_data_types (name, display_name, is_mandatory, is_hierarchical, display_order) VALUES
('subject', 'Subject', true, false, 1),
('grade', 'Grade', true, false, 2),
('medium', 'Medium', true, false, 3),
('chapter', 'Chapter', true, true, 4),
('learning_outcome', 'Learning Outcome', false, true, 5),
('skill', 'Skill', false, true, 6),
('topic', 'Topic', false, true, 7),
('subtopic', 'Sub Topic', false, true, 8);

-- Set up hierarchical relationships
UPDATE public.master_data_types SET parent_type_id = (SELECT id FROM master_data_types WHERE name = 'subject') WHERE name = 'chapter';
UPDATE public.master_data_types SET parent_type_id = (SELECT id FROM master_data_types WHERE name = 'chapter') WHERE name = 'learning_outcome';
UPDATE public.master_data_types SET parent_type_id = (SELECT id FROM master_data_types WHERE name = 'learning_outcome') WHERE name = 'skill';
UPDATE public.master_data_types SET parent_type_id = (SELECT id FROM master_data_types WHERE name = 'chapter') WHERE name = 'topic';
UPDATE public.master_data_types SET parent_type_id = (SELECT id FROM master_data_types WHERE name = 'topic') WHERE name = 'subtopic';

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_master_data_types_updated_at
    BEFORE UPDATE ON public.master_data_types
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_state_field_config_updated_at
    BEFORE UPDATE ON public.state_field_config
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_master_data_entries_updated_at
    BEFORE UPDATE ON public.master_data_entries
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create indexes for performance
CREATE INDEX idx_master_data_entries_type_state ON public.master_data_entries(type_id, state_id);
CREATE INDEX idx_master_data_entries_parent ON public.master_data_entries(parent_id);
CREATE INDEX idx_state_field_config_state ON public.state_field_config(state_id);
CREATE INDEX idx_master_data_audit_user_timestamp ON public.master_data_audit(user_id, timestamp);