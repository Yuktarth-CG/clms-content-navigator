
export type RepositoryType = 'Public' | 'Private';

export type QuestionType = 'formative' | 'evaluate' | 'practice' | 'assessment';

export interface Question {
  id: string;
  title: string;
  content: string;
  loCode: string;
  chapter: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  contentType: 'Question' | 'Media' | 'Document';
  questionType: QuestionType; // New field for question classification
  tags: string[];
  status: 'Drafts' | 'Assigned for Review' | 'Rejected' | 'Approved' | 'Published' | 'Archived';
  repository: RepositoryType;
  createdAt: string;
  modifiedAt: string;
  createdBy: string;
  mediaFiles?: string[];
  // Usage tracking
  usageCount?: number;
  lastUsed?: string;
  firstUsed?: string;
}

export interface Worksheet {
  id: string;
  title: string;
  description: string;
  questionIds: string[]; // References to questions
  repository: RepositoryType; // Can use either public or private questions
  createdAt: string;
  createdBy: string;
  status: 'Draft' | 'Published' | 'Archived';
  tags: string[];
  totalQuestions: number;
  estimatedDuration: number; // in minutes
}

export interface TestPaper {
  id: string;
  title: string;
  description: string;
  questionIds: string[]; // References to questions
  repository: RepositoryType; // Can use either public or private questions
  createdAt: string;
  createdBy: string;
  status: 'Draft' | 'Published' | 'Archived';
  tags: string[];
  totalQuestions: number;
  totalMarks: number;
  duration: number; // in minutes
  hasHighReusage: boolean; // Flag for high reusage
  reusagePercentage: number;
  includesAssessmentQuestions: boolean; // Flag if contains assessment type questions
}

export interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: string[];
}

export interface ValidationResult {
  itemId: string;
  errors: string[];
  warnings: string[];
}

export interface BulkOperation {
  id: string;
  type: 'import' | 'export' | 'validation';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  fileName?: string;
  recordsProcessed: number;
  recordsFailed: number;
  timestamp: string;
  userId: string;
}

export type UserRole = 'SuperAdmin' | 'Admin' | 'Reviewer' | 'Creator' | 'Translator';

export interface UserPermissions {
  canAccessPublicRepository: boolean;
  canAccessPrivateRepository: boolean;
  canCreateContent: boolean;
  canEditContent: boolean;
  canDeleteContent: boolean;
  canManageUsers: boolean;
  canViewAuditLogs: boolean;
  canExportContent: boolean;
  canImportContent: boolean;
  // OCR Integration permissions
  canCreateTestPaperFromCSV: boolean;
  canDigitizeContent: boolean;
  canManageOCRTemplates: boolean;
  canUseVisualEditor: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

// Content Lifecycle & Security types
export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'create' | 'read' | 'update' | 'delete' | 'import' | 'export' | 'access_attempt' | 'recycled' | 'login' | 'logout';
  contentId?: string;
  contentTitle?: string;
  repository?: RepositoryType;
  timestamp: string;
  outcome: 'success' | 'failure' | 'pending';
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ContentNotification {
  id: string;
  type: 'recycling_complete' | 'access_denied' | 'security_alert' | 'system_update';
  contentId?: string;
  contentTitle?: string;
  repository?: RepositoryType;
  message: string;
  createdAt: string;
  readAt?: string;
  userId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface RecyclingJob {
  id: string;
  contentId: string;
  contentTitle: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  initiatedBy: string;
  initiatedAt: string;
  completedAt?: string;
  irtSystemId?: string;
  transformationLog?: string[];
  errorMessage?: string;
}

export interface SecurityMetrics {
  totalAccessAttempts: number;
  failedLoginAttempts: number;
  suspiciousActivities: number;
  privateContentAccesses: number;
  lastSecurityScan: string;
}
