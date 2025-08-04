export type AssessmentMode = 'FA' | 'SA';
export type AssessmentStatus = 'Generated' | 'Assigned' | 'Archived';
export type AssessmentSource = 'Automated' | 'Customised' | 'CSV Upload' | 'OCR';
export type RepositoryType = 'Public' | 'Private';

// Unified QuestionType definition
export type QuestionType = 'MCQ' | 'FITB' | 'Match' | 'Arrange' | 'VSA' | 'SA' | 'ETA' | 'TF' | 'RC';

export interface Blueprint {
  id: string;
  name: string;
  total_questions: number;
  allowed_question_types: QuestionType[];
  bloom_l1: number;
  bloom_l2: number;
  bloom_l3: number;
  bloom_l4: number;
  bloom_l5: number;
  bloom_l6: number;
  difficulty_l1?: number;
  difficulty_l2?: number;
  difficulty_l3?: number;
  difficulty_l4?: number;
  difficulty_l5?: number;
  mode: AssessmentMode;
  total_marks?: number;
  duration?: number;
  mcq_marks?: number;
  fitb_marks?: number;
  match_marks?: number;
  arrange_marks?: number;
  subjective_marks?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  version: number;
  is_active: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  grade: number;
  medium: string;
  chapters?: string[];
  learning_outcomes?: string[];
  blueprint_id?: string;
  blueprint_name?: string;
  total_questions: number;
  total_marks?: number;
  duration?: number;
  allowed_question_types: QuestionType[];
  bloom_l1: number;
  bloom_l2: number;
  bloom_l3: number;
  bloom_l4: number;
  bloom_l5: number;
  bloom_l6: number;
  difficulty_l1?: number;
  difficulty_l2?: number;
  difficulty_l3?: number;
  difficulty_l4?: number;
  difficulty_l5?: number;
  mode: AssessmentMode;
  source: AssessmentSource;
  repository: RepositoryType;
  status: AssessmentStatus;
  pdf_url?: string;
  pdf_hash?: string;
  question_ids?: string[];
  manual_questions_count?: number;
  has_manual_questions?: boolean;
  manual_questions_data?: ManualQuestion[];
  created_by: string;
  created_by_name: string;
  created_by_role: string;
  created_at: string;
  updated_at: string;
  download_count: number;
}

export interface BlueprintFormData {
  name: string;
  total_questions: number;
  allowed_question_types: QuestionType[];
  bloom_l1: number;
  bloom_l2: number;
  bloom_l3: number;
  bloom_l4: number;
  bloom_l5: number;
  bloom_l6: number;
  difficulty_l1?: number;
  difficulty_l2?: number;
  difficulty_l3?: number;
  difficulty_l4?: number;
  difficulty_l5?: number;
  mode: AssessmentMode;
  total_marks?: number;
  duration?: number;
  mcq_marks?: number;
  fitb_marks?: number;
  match_marks?: number;
  arrange_marks?: number;
  subjective_marks?: number;
}

export interface AssessmentFormData {
  title: string;
  grade: number;
  medium: string;
  chapters: string[];
  learning_outcomes: string[];
  blueprint_id?: string;
  allowed_question_types: QuestionType[];
  distributionMethod?: 'blooms' | 'difficulty';
  bloom_l1: number;
  bloom_l2: number;
  bloom_l3: number;
  bloom_l4: number;
  bloom_l5: number;
  bloom_l6: number;
  difficulty_l1?: number;
  difficulty_l2?: number;
  difficulty_l3?: number;
  difficulty_l4?: number;
  difficulty_l5?: number;
  mode: AssessmentMode;
  total_marks?: number;
  duration?: number;
  repository: RepositoryType;
}

export interface QuestionShortage {
  questionType: QuestionType;
  required: number;
  available: number;
  shortage: number;
}

export interface ManualQuestion {
  id: string;
  questionType: QuestionType;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  bloomLevel: number;
  marks: number;
  addedBy: string;
  addedAt: string;
}

// Unified QuestionTypeLabels
export const QuestionTypeLabels: Record<QuestionType, string> = {
  'MCQ': 'Multiple Choice Questions',
  'FITB': 'Fill in the Blank',
  'Match': 'Match the Column',
  'Arrange': 'Arrange in the Correct Order',
  'VSA': 'Very Short Answer',
  'SA': 'Short Answer',
  'ETA': 'Essay Type Answer',
  'TF': 'True/False',
  'RC': 'Reading Comprehension'
};

export const BloomLevels = {
  L1: 'Remember',
  L2: 'Understand', 
  L3: 'Apply',
  L4: 'Analyze',
  L5: 'Evaluate',
  L6: 'Create'
};

export const DifficultyLevels = {
  L1: 'Very Easy',
  L2: 'Easy',
  L3: 'Medium',
  L4: 'Hard',
  L5: 'Very Hard'
};