import { QuestionType, QuestionTypeLabels as AssessmentQuestionTypeLabels } from './assessment'; // Import from assessment.ts

export type OCRProcessType = 'test-paper-csv' | 'test-paper-blueprint' | 'content-digitization' | 'worksheet-creation';

export interface CSVTemplate {
  id: string;
  name: string;
  description: string;
  requiredColumns: string[];
  sampleData: Record<string, any>;
  constraints?: {
    minQuestions?: number;
    requiredQuestionTypes?: QuestionType[];
  };
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaperLayoutTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  constraints?: {
    minQuestions?: number;
    questionTypes?: QuestionType[];
  };
  version: string;
  createdAt: string;
  updatedAt: string;
  customizable: boolean;
}

export interface WorksheetTemplate {
  id: string;
  name: string;
  description: string;
  type: 'state-exam' | 'board-exam' | 'practice-paper' | 'diagnostic';
  layout: 'single-column' | 'dual-column' | 'grid';
  supportedLanguages: string[];
  preview: string;
  constraints?: {
    minQuestions?: number;
    maxQuestions?: number;
    questionTypes?: QuestionType[];
  };
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentOCRTemplate {
  id: string;
  name: string;
  description: string;
  supportedFormats: string[];
  expectedStructure: string;
  supportedLanguages: string[];
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface OCRJob {
  id: string;
  type: OCRProcessType;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'reviewing';
  progress: number;
  fileName?: string;
  templateId: string;
  language: string;
  createdAt: string;
  completedAt?: string;
  userId: string;
  resultData?: any;
  errorMessage?: string;
  contentIds?: string[];
}

export interface StructuredContent {
  id: string;
  type: 'test-paper' | 'question-bank' | 'learning-material' | 'worksheet';
  title: string;
  questions: ExtractedQuestion[];
  metadata: {
    subject?: string;
    difficulty?: string;
    totalMarks?: number;
    duration?: number;
    language: string;
    templateId?: string;
    ocrTemplateId?: string;
  };
  rawData: any;
  tags: string[];
  ocrTags: string[];
}

export interface ExtractedQuestion {
  id: string;
  text: string;
  type: QuestionType; // Use unified type
  options?: string[];
  correctAnswer?: string | number;
  explanation?: string;
  marks: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  subject?: string;
  chapter?: string;
  topic?: string;
  loCode?: string;
  confidence: number;
  language: string;
  ocrTags: string[];
}

export interface ContentTag {
  id: string;
  contentId: string;
  templateId: string;
  templateType: 'worksheet' | 'paper-layout' | 'csv';
  taggedBy: string;
  taggedAt: string;
  isActive: boolean;
}

export interface PrintOptions {
  format: 'pdf' | 'doc' | 'html';
  layout: 'portrait' | 'landscape';
  includeAnswerKey: boolean;
  includeQRCode: boolean;
  watermark?: string;
  customHeader?: string;
  customFooter?: string;
  questionDensity: 'compact' | 'normal' | 'spacious';
  language: string;
}

export interface LanguageSupport {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  isSupported: boolean;
  ocrAccuracy: number;
}

export interface Blueprint {
  id: string;
  name: string;
  description: string;
  courseCode: string;
  courseName: string;
  duration: number; // in minutes
  totalMarks: number;
  language: string;
  unitDistribution: UnitDistribution[];
  bloomsDistribution: BloomsDistribution[];
  questionTypeDistribution: QuestionTypeDistribution[];
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
}

export interface UnitDistribution {
  loCode: string;
  unitName: string;
  marks: number;
  questionTypes: {
    type: QuestionType;
    count: number;
    marksPerQuestion: number;
  }[];
}

export interface BloomsDistribution {
  level: BloomsTaxonomyLevel;
  questionCount: number;
  totalMarks: number;
  questionTypes: {
    type: QuestionType;
    count: number;
  }[];
}

export interface QuestionTypeDistribution {
  type: QuestionType;
  totalCount: number;
  totalMarks: number;
  marksPerQuestion: number;
}

export type BloomsTaxonomyLevel = 1 | 2 | 3 | 4 | 5 | 6;

// Re-export QuestionTypeLabels from assessment.ts for consistency
export const BloomsTaxonomyLabels: Record<BloomsTaxonomyLevel, string> = {
  1: 'Remembering',
  2: 'Understanding', 
  3: 'Applying',
  4: 'Analyzing',
  5: 'Evaluating',
  6: 'Creating'
};

export const QuestionTypeLabels = AssessmentQuestionTypeLabels;