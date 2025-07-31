-- Create enum types for assessments
CREATE TYPE public.assessment_mode AS ENUM ('FA', 'SA');
CREATE TYPE public.assessment_status AS ENUM ('Generated', 'Assigned', 'Archived');
CREATE TYPE public.assessment_source AS ENUM ('Automated', 'Customised', 'CSV Upload', 'OCR');
CREATE TYPE public.repository_type AS ENUM ('Public', 'Private');
CREATE TYPE public.question_type AS ENUM ('MCQ', 'FITB', 'TF', 'Match', 'Short-Answer', 'Long-Answer', 'RC');

-- Create blueprints table
CREATE TABLE public.blueprints (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    total_questions INTEGER NOT NULL CHECK (total_questions > 0),
    allowed_question_types question_type[] NOT NULL,
    bloom_l1 INTEGER NOT NULL DEFAULT 0 CHECK (bloom_l1 >= 0),
    bloom_l2 INTEGER NOT NULL DEFAULT 0 CHECK (bloom_l2 >= 0),
    bloom_l3 INTEGER NOT NULL DEFAULT 0 CHECK (bloom_l3 >= 0),
    bloom_l4 INTEGER NOT NULL DEFAULT 0 CHECK (bloom_l4 >= 0),
    bloom_l5 INTEGER NOT NULL DEFAULT 0 CHECK (bloom_l5 >= 0),
    bloom_l6 INTEGER NOT NULL DEFAULT 0 CHECK (bloom_l6 >= 0),
    mode assessment_mode NOT NULL DEFAULT 'FA',
    total_marks INTEGER,
    duration INTEGER,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create assessments table
CREATE TABLE public.assessments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    grade INTEGER NOT NULL,
    medium TEXT NOT NULL,
    chapters TEXT[],
    learning_outcomes TEXT[],
    blueprint_id UUID REFERENCES public.blueprints(id),
    blueprint_name TEXT,
    total_questions INTEGER NOT NULL,
    total_marks INTEGER,
    duration INTEGER,
    allowed_question_types question_type[] NOT NULL,
    bloom_l1 INTEGER NOT NULL DEFAULT 0,
    bloom_l2 INTEGER NOT NULL DEFAULT 0,
    bloom_l3 INTEGER NOT NULL DEFAULT 0,
    bloom_l4 INTEGER NOT NULL DEFAULT 0,
    bloom_l5 INTEGER NOT NULL DEFAULT 0,
    bloom_l6 INTEGER NOT NULL DEFAULT 0,
    mode assessment_mode NOT NULL DEFAULT 'FA',
    source assessment_source NOT NULL,
    repository repository_type NOT NULL DEFAULT 'Public',
    status assessment_status NOT NULL DEFAULT 'Generated',
    pdf_url TEXT,
    pdf_hash TEXT,
    question_ids UUID[],
    created_by UUID NOT NULL,
    created_by_name TEXT NOT NULL,
    created_by_role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    download_count INTEGER NOT NULL DEFAULT 0
);

-- Create blueprint audit table
CREATE TABLE public.blueprint_audit (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    blueprint_id UUID NOT NULL REFERENCES public.blueprints(id),
    action TEXT NOT NULL,
    user_id UUID NOT NULL,
    user_name TEXT NOT NULL,
    diff JSONB,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assessment audit table
CREATE TABLE public.assessment_audit (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    assessment_id UUID NOT NULL REFERENCES public.assessments(id),
    action TEXT NOT NULL,
    user_id UUID NOT NULL,
    user_name TEXT NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ip_address INET
);

-- Enable Row Level Security
ALTER TABLE public.blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blueprint_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blueprints
CREATE POLICY "Users can view all blueprints" 
ON public.blueprints 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create blueprints" 
ON public.blueprints 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own blueprints" 
ON public.blueprints 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own blueprints" 
ON public.blueprints 
FOR DELETE 
USING (auth.uid() = created_by);

-- RLS Policies for assessments
CREATE POLICY "Users can view assessments based on repository" 
ON public.assessments 
FOR SELECT 
USING (
    repository = 'Public' OR 
    (repository = 'Private' AND auth.uid() = created_by)
);

CREATE POLICY "Users can create assessments" 
ON public.assessments 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own assessments" 
ON public.assessments 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own assessments" 
ON public.assessments 
FOR DELETE 
USING (auth.uid() = created_by);

-- RLS Policies for audit tables
CREATE POLICY "Users can view relevant audit logs" 
ON public.blueprint_audit 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert blueprint audit logs" 
ON public.blueprint_audit 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view relevant assessment audit logs" 
ON public.assessment_audit 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert assessment audit logs" 
ON public.assessment_audit 
FOR INSERT 
WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_blueprints_updated_at
    BEFORE UPDATE ON public.blueprints
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at
    BEFORE UPDATE ON public.assessments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create validation trigger for blueprints bloom totals
CREATE OR REPLACE FUNCTION public.validate_blueprint_bloom_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.bloom_l1 + NEW.bloom_l2 + NEW.bloom_l3 + NEW.bloom_l4 + NEW.bloom_l5 + NEW.bloom_l6) != NEW.total_questions THEN
        RAISE EXCEPTION 'Sum of Bloom levels must equal total questions';
    END IF;
    
    IF array_length(NEW.allowed_question_types, 1) IS NULL OR array_length(NEW.allowed_question_types, 1) = 0 THEN
        RAISE EXCEPTION 'At least one question type must be selected';
    END IF;
    
    IF NEW.mode = 'SA' AND (NEW.total_marks IS NULL OR NEW.duration IS NULL) THEN
        RAISE EXCEPTION 'Total marks and duration are required for Summative Assessment mode';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_blueprint_bloom_totals_trigger
    BEFORE INSERT OR UPDATE ON public.blueprints
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_blueprint_bloom_totals();

-- Create indexes for better performance
CREATE INDEX idx_blueprints_created_by ON public.blueprints(created_by);
CREATE INDEX idx_blueprints_name ON public.blueprints(name);
CREATE INDEX idx_assessments_created_by ON public.assessments(created_by);
CREATE INDEX idx_assessments_repository ON public.assessments(repository);
CREATE INDEX idx_assessments_status ON public.assessments(status);
CREATE INDEX idx_assessments_created_at ON public.assessments(created_at);
CREATE INDEX idx_blueprint_audit_blueprint_id ON public.blueprint_audit(blueprint_id);
CREATE INDEX idx_assessment_audit_assessment_id ON public.assessment_audit(assessment_id);