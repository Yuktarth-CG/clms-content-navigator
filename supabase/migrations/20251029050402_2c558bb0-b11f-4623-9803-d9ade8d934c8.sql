-- Make created_by nullable for mock flow
ALTER TABLE public.knowledge_graphs 
ALTER COLUMN created_by DROP NOT NULL;

-- Also make created_by nullable in master_data_entries for consistency
ALTER TABLE public.master_data_entries 
ALTER COLUMN created_by DROP NOT NULL;

-- Make published_by nullable as well
ALTER TABLE public.master_data_entries 
ALTER COLUMN published_by DROP NOT NULL;