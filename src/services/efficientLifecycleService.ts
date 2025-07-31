
import { Question, ContentNotification } from '@/types/content';

export interface QuestionUsageHistory {
  questionId: string;
  dateAdded: string;
  usageCount: number;
  lastUsed?: string;
  examsUsedIn: ExamUsage[];
  reusageHistory: ReusageRecord[];
}

export interface ExamUsage {
  examId: string;
  examName: string;
  examDate: string;
  examType: 'worksheet' | 'test-paper';
}

export interface ReusageRecord {
  date: string;
  examId: string;
  examName: string;
  reuseType: 'same-question' | 'modified-question';
}

export interface TestPaperAnalysis {
  testPaperId: string;
  totalQuestions: number;
  reusedQuestions: number;
  reusagePercentage: number;
  hasHighReusage: boolean; // true if >60% questions are reused
  reusageDetails: {
    questionId: string;
    previousExamIds: string[];
    timesReused: number;
  }[];
}

class EfficientLifecycleService {
  private usageHistory: Map<string, QuestionUsageHistory> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock usage history for demonstration
    this.usageHistory.set('Q001', {
      questionId: 'Q001',
      dateAdded: '2024-01-15T00:00:00Z',
      usageCount: 3,
      lastUsed: '2024-06-20T00:00:00Z',
      examsUsedIn: [
        { examId: 'E001', examName: 'Math Mid-term 2024', examDate: '2024-03-15', examType: 'test-paper' },
        { examId: 'E002', examName: 'Practice Sheet 1', examDate: '2024-05-10', examType: 'worksheet' }
      ],
      reusageHistory: [
        { date: '2024-06-20T00:00:00Z', examId: 'E003', examName: 'Final Exam 2024', reuseType: 'same-question' }
      ]
    });
  }

  // Track question usage
  recordQuestionUsage(questionId: string, examId: string, examName: string, examType: 'worksheet' | 'test-paper'): void {
    const history = this.usageHistory.get(questionId);
    const usage: ExamUsage = { examId, examName, examDate: new Date().toISOString(), examType };

    if (history) {
      history.usageCount++;
      history.lastUsed = new Date().toISOString();
      history.examsUsedIn.push(usage);
      
      // Check for reusage
      if (history.usageCount > 1) {
        history.reusageHistory.push({
          date: new Date().toISOString(),
          examId,
          examName,
          reuseType: 'same-question'
        });
      }
    } else {
      this.usageHistory.set(questionId, {
        questionId,
        dateAdded: new Date().toISOString(),
        usageCount: 1,
        lastUsed: new Date().toISOString(),
        examsUsedIn: [usage],
        reusageHistory: []
      });
    }
  }

  // Get question usage history
  getQuestionUsageHistory(questionId: string): QuestionUsageHistory | null {
    return this.usageHistory.get(questionId) || null;
  }

  // Analyze test paper for reusage
  analyzeTestPaperReusage(testPaperId: string, questionIds: string[]): TestPaperAnalysis {
    const reusageDetails: TestPaperAnalysis['reusageDetails'] = [];
    let reusedCount = 0;

    questionIds.forEach(questionId => {
      const history = this.usageHistory.get(questionId);
      if (history && history.usageCount > 1) {
        reusedCount++;
        reusageDetails.push({
          questionId,
          previousExamIds: history.examsUsedIn.map(exam => exam.examId),
          timesReused: history.usageCount - 1
        });
      }
    });

    const reusagePercentage = (reusedCount / questionIds.length) * 100;

    return {
      testPaperId,
      totalQuestions: questionIds.length,
      reusedQuestions: reusedCount,
      reusagePercentage,
      hasHighReusage: reusagePercentage > 60,
      reusageDetails
    };
  }
}

export const efficientLifecycleService = new EfficientLifecycleService();
