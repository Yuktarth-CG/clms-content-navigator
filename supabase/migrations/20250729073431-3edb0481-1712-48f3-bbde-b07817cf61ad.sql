-- Insert sample blueprints for testing
INSERT INTO public.blueprints (
  name,
  total_questions,
  allowed_question_types,
  bloom_l1,
  bloom_l2,
  bloom_l3,
  bloom_l4,
  bloom_l5,
  bloom_l6,
  mode,
  total_marks,
  duration,
  created_by
) VALUES 
-- Quick Assessment Blueprint
(
  'Quick Assessment - 10 Questions',
  10,
  ARRAY['MCQ', 'FITB']::question_type[],
  4,
  4,
  2,
  0,
  0,
  0,
  'FA'::assessment_mode,
  20,
  30,
  '00000000-0000-0000-0000-000000000000'
),
-- Unit Test Blueprint
(
  'Standard Unit Test',
  25,
  ARRAY['MCQ', 'FITB', 'Match']::question_type[],
  8,
  8,
  5,
  3,
  1,
  0,
  'SA'::assessment_mode,
  50,
  60,
  '00000000-0000-0000-0000-000000000000'
),
-- Comprehensive Exam Blueprint
(
  'Comprehensive Final Exam',
  50,
  ARRAY['MCQ', 'FITB', 'Match', 'Arrange']::question_type[],
  15,
  15,
  10,
  6,
  3,
  1,
  'SA'::assessment_mode,
  100,
  120,
  '00000000-0000-0000-0000-000000000000'
),
-- Mathematics Focused Blueprint
(
  'Mathematics Problem Solving',
  20,
  ARRAY['MCQ', 'FITB']::question_type[],
  5,
  6,
  5,
  3,
  1,
  0,
  'SA'::assessment_mode,
  40,
  75,
  '00000000-0000-0000-0000-000000000000'
),
-- Science Practical Blueprint
(
  'Science Practical Assessment',
  30,
  ARRAY['MCQ', 'FITB', 'Match']::question_type[],
  10,
  8,
  7,
  3,
  2,
  0,
  'SA'::assessment_mode,
  60,
  90,
  '00000000-0000-0000-0000-000000000000'
),
-- Language Arts Blueprint
(
  'Language & Literature Quiz',
  15,
  ARRAY['MCQ', 'FITB', 'Arrange']::question_type[],
  5,
  5,
  3,
  2,
  0,
  0,
  'FA'::assessment_mode,
  30,
  45,
  '00000000-0000-0000-0000-000000000000'
),
-- Critical Thinking Blueprint
(
  'Critical Thinking Assessment',
  18,
  ARRAY['MCQ', 'Match', 'Arrange']::question_type[],
  2,
  4,
  5,
  4,
  2,
  1,
  'SA'::assessment_mode,
  36,
  60,
  '00000000-0000-0000-0000-000000000000'
),
-- Basic Knowledge Check
(
  'Foundation Knowledge Check',
  12,
  ARRAY['MCQ', 'FITB']::question_type[],
  6,
  4,
  2,
  0,
  0,
  0,
  'FA'::assessment_mode,
  24,
  25,
  '00000000-0000-0000-0000-000000000000'
);