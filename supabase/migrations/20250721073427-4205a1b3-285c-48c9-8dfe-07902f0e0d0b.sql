-- Add manual question tracking to assessments table
ALTER TABLE public.assessments ADD COLUMN manual_questions_count integer DEFAULT 0;
ALTER TABLE public.assessments ADD COLUMN has_manual_questions boolean DEFAULT false;
ALTER TABLE public.assessments ADD COLUMN manual_questions_data jsonb;

-- Add comment to explain the new columns
COMMENT ON COLUMN public.assessments.manual_questions_count IS 'Number of manually added questions due to shortage';
COMMENT ON COLUMN public.assessments.has_manual_questions IS 'Flag to indicate if assessment contains manually added questions';
COMMENT ON COLUMN public.assessments.manual_questions_data IS 'JSON data containing manually added questions with metadata';