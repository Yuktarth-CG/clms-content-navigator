-- Create themes table for state-specific branding
CREATE TABLE public.themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state_name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  background_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#3b82f6',
  secondary_color TEXT NOT NULL DEFAULT '#64748b',
  button_color TEXT NOT NULL DEFAULT '#059669',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create theme audit table for tracking changes
CREATE TABLE public.theme_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID NOT NULL,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  field_changes JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_audit ENABLE ROW LEVEL SECURITY;

-- Create policies for themes (only Super Admins can manage)
CREATE POLICY "Super Admins can view all themes" 
ON public.themes 
FOR SELECT 
USING (true);

CREATE POLICY "Super Admins can create themes" 
ON public.themes 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Super Admins can update themes" 
ON public.themes 
FOR UPDATE 
USING (true);

CREATE POLICY "Super Admins can delete themes" 
ON public.themes 
FOR DELETE 
USING (true);

-- Create policies for theme audit
CREATE POLICY "Super Admins can view audit logs" 
ON public.theme_audit 
FOR SELECT 
USING (true);

CREATE POLICY "System can insert audit logs" 
ON public.theme_audit 
FOR INSERT 
WITH CHECK (true);

-- Create storage bucket for theme assets
INSERT INTO storage.buckets (id, name, public) VALUES ('theme-assets', 'theme-assets', true);

-- Create storage policies for theme assets
CREATE POLICY "Theme assets are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'theme-assets');

CREATE POLICY "Super Admins can upload theme assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'theme-assets');

CREATE POLICY "Super Admins can update theme assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'theme-assets');

CREATE POLICY "Super Admins can delete theme assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'theme-assets');

-- Create function to update timestamps
CREATE TRIGGER update_themes_updated_at
BEFORE UPDATE ON public.themes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();