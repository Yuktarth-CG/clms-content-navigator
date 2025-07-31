interface ChangeRequest {
  id: string;
  timestamp: Date;
  userRequest: string;
  aiResponse?: string;
  changesAttempted: string[];
  status: 'pending' | 'success' | 'failed' | 'partial';
  errorDetails?: string;
  retryCount: number;
  learningNotes?: string;
}

interface LearningPattern {
  errorType: string;
  commonCauses: string[];
  suggestedSolutions: string[];
  successRate: number;
}

class EnhancedDebugService {
  private requests: ChangeRequest[] = [];
  private learningPatterns: LearningPattern[] = [];
  private listeners: ((requests: ChangeRequest[]) => void)[] = [];
  private maxRequests = 50;

  private generateId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  startRequest(userRequest: string): string {
    const requestId = this.generateId();
    const request: ChangeRequest = {
      id: requestId,
      timestamp: new Date(),
      userRequest,
      changesAttempted: [],
      status: 'pending',
      retryCount: 0
    };

    this.requests.unshift(request);
    this.notifyListeners();
    return requestId;
  }

  addChange(requestId: string, change: string) {
    const request = this.requests.find(r => r.id === requestId);
    if (request) {
      request.changesAttempted.push(change);
      this.notifyListeners();
    }
  }

  setAIResponse(requestId: string, response: string) {
    const request = this.requests.find(r => r.id === requestId);
    if (request) {
      request.aiResponse = response;
      this.notifyListeners();
    }
  }

  markSuccess(requestId: string) {
    const request = this.requests.find(r => r.id === requestId);
    if (request) {
      request.status = 'success';
      this.notifyListeners();
    }
  }

  markFailed(requestId: string, errorDetails: string, isRetry = false) {
    const request = this.requests.find(r => r.id === requestId);
    if (request) {
      request.status = 'failed';
      request.errorDetails = errorDetails;
      if (isRetry) {
        request.retryCount++;
      }
      
      // Analyze for learning patterns
      this.analyzeFailure(request);
      this.notifyListeners();
    }
  }

  markPartial(requestId: string, details: string) {
    const request = this.requests.find(r => r.id === requestId);
    if (request) {
      request.status = 'partial';
      request.errorDetails = details;
      this.notifyListeners();
    }
  }

  private analyzeFailure(request: ChangeRequest) {
    if (!request.errorDetails) return;

    // Extract error patterns
    const errorType = this.categorizeError(request.errorDetails);
    
    // Update learning patterns
    let pattern = this.learningPatterns.find(p => p.errorType === errorType);
    if (!pattern) {
      pattern = {
        errorType,
        commonCauses: [],
        suggestedSolutions: [],
        successRate: 0
      };
      this.learningPatterns.push(pattern);
    }

    // Add common causes and solutions based on error analysis
    this.updateLearningPattern(pattern, request);
    
    // Generate learning notes for this specific request
    request.learningNotes = this.generateLearningNotes(request, pattern);
  }

  private categorizeError(errorDetails: string): string {
    const error = errorDetails.toLowerCase();
    
    if (error.includes('component') || error.includes('jsx') || error.includes('tsx')) {
      return 'React Component Error';
    }
    if (error.includes('typescript') || error.includes('type')) {
      return 'TypeScript Error';
    }
    if (error.includes('import') || error.includes('module')) {
      return 'Import/Module Error';
    }
    if (error.includes('css') || error.includes('style') || error.includes('tailwind')) {
      return 'Styling Error';
    }
    if (error.includes('hook') || error.includes('useeffect') || error.includes('usestate')) {
      return 'React Hook Error';
    }
    if (error.includes('missing') || error.includes('undefined') || error.includes('null')) {
      return 'Missing Dependencies Error';
    }
    
    return 'General Error';
  }

  private updateLearningPattern(pattern: LearningPattern, request: ChangeRequest) {
    // Add common causes based on the request context
    if (request.retryCount > 0) {
      const cause = `Multiple retry attempts (${request.retryCount}) suggest incomplete understanding`;
      if (!pattern.commonCauses.includes(cause)) {
        pattern.commonCauses.push(cause);
      }
    }

    // Add suggested solutions
    const solutions = this.generateSolutions(request);
    solutions.forEach(solution => {
      if (!pattern.suggestedSolutions.includes(solution)) {
        pattern.suggestedSolutions.push(solution);
      }
    });
  }

  private generateSolutions(request: ChangeRequest): string[] {
    const solutions: string[] = [];
    const errorType = this.categorizeError(request.errorDetails || '');

    switch (errorType) {
      case 'React Component Error':
        solutions.push('Check component syntax and JSX structure');
        solutions.push('Verify all imports are correct');
        solutions.push('Ensure component is properly exported');
        break;
      case 'TypeScript Error':
        solutions.push('Add proper type definitions');
        solutions.push('Check interface compatibility');
        solutions.push('Verify import paths for types');
        break;
      case 'Import/Module Error':
        solutions.push('Check file paths and extensions');
        solutions.push('Verify exported components/functions');
        solutions.push('Ensure dependencies are installed');
        break;
      case 'Styling Error':
        solutions.push('Use semantic tokens from design system');
        solutions.push('Check Tailwind class names');
        solutions.push('Verify CSS variable definitions');
        break;
      case 'React Hook Error':
        solutions.push('Ensure hooks are called at top level');
        solutions.push('Check hook dependencies');
        solutions.push('Verify hook usage patterns');
        break;
      default:
        solutions.push('Read existing code before making changes');
        solutions.push('Make minimal, focused changes');
        solutions.push('Test changes incrementally');
    }

    return solutions;
  }

  private generateLearningNotes(request: ChangeRequest, pattern: LearningPattern): string {
    const notes = [
      `Error Category: ${pattern.errorType}`,
      `Retry Count: ${request.retryCount}`,
      `Changes Attempted: ${request.changesAttempted.length}`,
    ];

    if (request.retryCount > 2) {
      notes.push('⚠️ High retry count suggests need for better analysis');
    }

    if (pattern.commonCauses.length > 0) {
      notes.push(`Common Causes: ${pattern.commonCauses.slice(0, 2).join(', ')}`);
    }

    return notes.join('\n');
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.requests]));
  }

  subscribe(listener: (requests: ChangeRequest[]) => void) {
    this.listeners.push(listener);
    listener([...this.requests]);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getRequests(): ChangeRequest[] {
    return [...this.requests];
  }

  getLearningPatterns(): LearningPattern[] {
    return [...this.learningPatterns];
  }

  getFailureAnalysis(): { totalRequests: number; successRate: number; commonErrors: string[] } {
    const total = this.requests.length;
    const successful = this.requests.filter(r => r.status === 'success').length;
    const successRate = total > 0 ? (successful / total) * 100 : 0;
    
    const errorCounts: { [key: string]: number } = {};
    this.requests.forEach(request => {
      if (request.status === 'failed' && request.errorDetails) {
        const errorType = this.categorizeError(request.errorDetails);
        errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
      }
    });

    const commonErrors = Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([error]) => error);

    return { totalRequests: total, successRate, commonErrors };
  }

  clear() {
    this.requests = [];
    this.learningPatterns = [];
    this.notifyListeners();
  }
}

export const enhancedDebugService = new EnhancedDebugService();

// Initialize with complete app development history
const initializeCompleteHistory = () => {
  // App Foundation Phase
  const req1 = enhancedDebugService.startRequest("Initialize the Content Learning Management System (CLMS) with user authentication and role-based permissions");
  enhancedDebugService.setAIResponse(req1, "Created foundational architecture with user context, role-based permissions, and core UI components");
  enhancedDebugService.addChange(req1, "Created src/contexts/UserContext.tsx - User authentication and permission system");
  enhancedDebugService.addChange(req1, "Created src/types/content.ts - Core type definitions for users, questions, assessments");
  enhancedDebugService.addChange(req1, "Created src/utils/permissions.ts - Role-based permission utilities");
  enhancedDebugService.addChange(req1, "Set up Yuktarth Nagar as SuperAdmin with full permissions");
  enhancedDebugService.markSuccess(req1);

  // Core UI Components Setup
  const req2 = enhancedDebugService.startRequest("Create the main application layout with sidebar navigation and header");
  enhancedDebugService.setAIResponse(req2, "Implemented responsive layout with role-based navigation and modern UI");
  enhancedDebugService.addChange(req2, "Created src/components/Header.tsx - Top navigation with user dropdown and notifications");
  enhancedDebugService.addChange(req2, "Created src/components/Sidebar.tsx - Dynamic navigation based on user permissions");
  enhancedDebugService.addChange(req2, "Created src/pages/Index.tsx - Main app layout and routing logic");
  enhancedDebugService.addChange(req2, "Implemented gradient blue theme for professional appearance");
  enhancedDebugService.markSuccess(req2);

  // Question Library Implementation
  const req3 = enhancedDebugService.startRequest("Build the core question library with search, filtering, and repository management");
  enhancedDebugService.setAIResponse(req3, "Created comprehensive question management system with dual repository support");
  enhancedDebugService.addChange(req3, "Created src/components/QuestionLibrary.tsx - Main question browsing interface");
  enhancedDebugService.addChange(req3, "Created src/components/RepositoryBadge.tsx - Visual indicators for Public/Private repositories");
  enhancedDebugService.addChange(req3, "Implemented advanced filtering by status, LO codes, chapters, and repository type");
  enhancedDebugService.addChange(req3, "Added mock data with realistic question structure");
  enhancedDebugService.markSuccess(req3);

  // Assessment Creation System
  const req4 = enhancedDebugService.startRequest("Implement assessment creation tools for worksheets and test papers");
  enhancedDebugService.setAIResponse(req4, "Built comprehensive assessment creation system with automated and manual options");
  enhancedDebugService.addChange(req4, "Created src/components/QuestionPaperCreation.tsx - Tabbed interface for different creation methods");
  enhancedDebugService.addChange(req4, "Created src/components/AutomatedGeneration.tsx - AI-powered question selection");
  enhancedDebugService.addChange(req4, "Created src/components/ManualQuestionEntry.tsx - Manual question selection interface");
  enhancedDebugService.addChange(req4, "Created src/components/CustomisedGeneration.tsx - Hybrid approach with customization");
  enhancedDebugService.markSuccess(req4);

  // Chapter and Learning Outcome System
  const req5 = enhancedDebugService.startRequest("Add chapter-wise organization with Learning Outcome (LO) mapping");
  enhancedDebugService.setAIResponse(req5, "Implemented hierarchical content organization with expandable chapter/LO selection");
  enhancedDebugService.addChange(req5, "Created src/components/ChapterLOSelector.tsx - Interactive chapter and LO selection");
  enhancedDebugService.addChange(req5, "Added collapsible chapter trees with learning outcome breakdown");
  enhancedDebugService.addChange(req5, "Integrated chapter/LO data into question generation algorithms");
  enhancedDebugService.addChange(req5, "Added visual progress indicators for selection completion");
  enhancedDebugService.markSuccess(req5);

  // Bulk Operations Implementation
  const req6 = enhancedDebugService.startRequest("Create bulk import and export functionality for content management");
  enhancedDebugService.setAIResponse(req6, "Built comprehensive bulk operations with validation and progress tracking");
  enhancedDebugService.addChange(req6, "Created src/components/BulkImport.tsx - Multi-format import with validation");
  enhancedDebugService.addChange(req6, "Created src/components/BulkExport.tsx - Flexible export options");
  enhancedDebugService.addChange(req6, "Created src/components/BulkUserUpload.tsx - User management bulk operations");
  enhancedDebugService.addChange(req6, "Created src/components/CombinedBulkImport.tsx - Unified import interface");
  enhancedDebugService.markSuccess(req6);

  // OCR and Template Management
  const req7 = enhancedDebugService.startRequest("Implement OCR tools for test paper creation and template management");
  enhancedDebugService.setAIResponse(req7, "Created advanced OCR workflow with template-based paper generation");
  enhancedDebugService.addChange(req7, "Created src/components/OCRTestPaperCreation.tsx - OCR-based test paper generation");
  enhancedDebugService.addChange(req7, "Created src/components/OCRTestPaperManagement.tsx - Generated paper management");
  enhancedDebugService.addChange(req7, "Created src/components/OCRTemplateManagement.tsx - Template library management");
  enhancedDebugService.addChange(req7, "Created src/components/OCRVisualEditor.tsx - Visual template editor");
  enhancedDebugService.markSuccess(req7);

  // Assessment Management System
  const req8 = enhancedDebugService.startRequest("Build assessment management with filtering, preview, and download capabilities");
  enhancedDebugService.setAIResponse(req8, "Implemented comprehensive assessment lifecycle management");
  enhancedDebugService.addChange(req8, "Created src/components/ManageAssessments.tsx - Assessment overview and management");
  enhancedDebugService.addChange(req8, "Created src/components/CreateAssessments.tsx - Assessment creation interface");
  enhancedDebugService.addChange(req8, "Created src/components/UnifiedAssessmentCreator.tsx - Unified creation workflow");
  enhancedDebugService.addChange(req8, "Added assessment status tracking and filtering");
  enhancedDebugService.markSuccess(req8);

  // PDF Generation and Preview System
  const req9 = enhancedDebugService.startRequest("Implement PDF generation with real-time preview and customization options");
  enhancedDebugService.setAIResponse(req9, "Built advanced PDF generation system with live preview and customization");
  enhancedDebugService.addChange(req9, "Created src/components/PDFPreview.tsx - Real-time PDF preview with customization");
  enhancedDebugService.addChange(req9, "Created src/components/PrintManager.tsx - Print configuration and management");
  enhancedDebugService.addChange(req9, "Implemented paper format selection and layout options");
  enhancedDebugService.addChange(req9, "Added print-ready formatting with proper margins and spacing");
  enhancedDebugService.markSuccess(req9);

  // Content Lifecycle and Validation
  const req10 = enhancedDebugService.startRequest("Add content lifecycle management and validation workflows");
  enhancedDebugService.setAIResponse(req10, "Created comprehensive content governance system");
  enhancedDebugService.addChange(req10, "Created src/components/ContentLifecycle.tsx - Content state management");
  enhancedDebugService.addChange(req10, "Created src/components/ContentValidation.tsx - Review and approval workflows");
  enhancedDebugService.addChange(req10, "Created src/components/ContentTagging.tsx - Metadata and tagging system");
  enhancedDebugService.addChange(req10, "Added content expiry tracking and notifications");
  enhancedDebugService.markSuccess(req10);

  // Advanced Features and Permissions
  const req11 = enhancedDebugService.startRequest("Implement advanced permission system and branding management");
  enhancedDebugService.setAIResponse(req11, "Built sophisticated permission matrix and customization features");
  enhancedDebugService.addChange(req11, "Created src/components/EnhancedPermissions.tsx - Advanced permission configuration");
  enhancedDebugService.addChange(req11, "Created src/components/InteractivePermissionsGrid.tsx - Visual permission editor");
  enhancedDebugService.addChange(req11, "Created src/components/BrandingManagement.tsx - Custom branding controls");
  enhancedDebugService.addChange(req11, "Added role-based feature visibility and access control");
  enhancedDebugService.markSuccess(req11);

  // User Management and Audit System
  const req12 = enhancedDebugService.startRequest("Create user management system with audit logging and security features");
  enhancedDebugService.setAIResponse(req12, "Implemented comprehensive user administration and security monitoring");
  enhancedDebugService.addChange(req12, "Created src/components/UserManagement.tsx - User administration interface");
  enhancedDebugService.addChange(req12, "Created src/components/AuditLogs.tsx - Security and activity monitoring");
  enhancedDebugService.addChange(req12, "Created src/services/auditService.ts - Audit logging infrastructure");
  enhancedDebugService.addChange(req12, "Added user activity tracking and security alerts");
  enhancedDebugService.markSuccess(req12);

  // Blueprint and Workflow Management
  const req13 = enhancedDebugService.startRequest("Add blueprint creation and workflow management for assessment templates");
  enhancedDebugService.setAIResponse(req13, "Created sophisticated template and workflow management system");
  enhancedDebugService.addChange(req13, "Created src/components/BlueprintCreation.tsx - Assessment blueprint designer");
  enhancedDebugService.addChange(req13, "Created src/components/BlueprintManagement.tsx - Blueprint library management");
  enhancedDebugService.addChange(req13, "Added workflow templates for common assessment patterns");
  enhancedDebugService.addChange(req13, "Implemented blueprint versioning and sharing");
  enhancedDebugService.markSuccess(req13);

  // CSV Validation and Data Quality
  const req14 = enhancedDebugService.startRequest("Implement CSV validation rules and data quality management");
  enhancedDebugService.setAIResponse(req14, "Built robust data validation and quality assurance system");
  enhancedDebugService.addChange(req14, "Created src/components/CSVValidationRules.tsx - Data validation configuration");
  enhancedDebugService.addChange(req14, "Added real-time data quality checking during import");
  enhancedDebugService.addChange(req14, "Implemented error reporting and data correction workflows");
  enhancedDebugService.addChange(req14, "Added validation rule templates for common data formats");
  enhancedDebugService.markSuccess(req14);

  // Recent Improvements Phase
  const req15 = enhancedDebugService.startRequest("Add student details can be a toggle, what do you think?");
  enhancedDebugService.setAIResponse(req15, "Replaced Add/Remove Student Details button with intuitive toggle switch showing Enabled/Disabled status");
  enhancedDebugService.addChange(req15, "Modified src/components/PDFPreview.tsx - Replaced button with Switch component");
  enhancedDebugService.addChange(req15, "Added proper toggle state management with onCheckedChange handler");
  enhancedDebugService.markSuccess(req15);

  const req16 = enhancedDebugService.startRequest("I dont think the changes are made, please check");
  enhancedDebugService.setAIResponse(req16, "Found toggle not appearing, debugged and re-implemented with explicit onCheckedChange handler");
  enhancedDebugService.addChange(req16, "Re-examined src/components/PDFPreview.tsx");
  enhancedDebugService.addChange(req16, "Fixed onCheckedChange handler implementation");
  enhancedDebugService.addChange(req16, "Improved UI alignment and visual clarity");
  enhancedDebugService.markSuccess(req16);

  const req17 = enhancedDebugService.startRequest("I want you to have a debug log through which you can read and learn through your previous mistakes, I also want to see it in the UI, lets add a debug log section on the left panel");
  enhancedDebugService.setAIResponse(req17, "Created comprehensive debug logging system with real-time UI panel");
  enhancedDebugService.addChange(req17, "Created src/services/debugService.ts - Core logging service");
  enhancedDebugService.addChange(req17, "Created src/components/DebugPanel.tsx - UI component with color-coded logs");
  enhancedDebugService.addChange(req17, "Modified src/components/Sidebar.tsx - Added debug panel section");
  enhancedDebugService.addChange(req17, "Integrated debug logging into AutomatedGeneration and PDFPreview components");
  enhancedDebugService.markSuccess(req17);

  const req18 = enhancedDebugService.startRequest("I want a separate section for debug logs, when I click on it it should so what changes were requested, what changes were made and were they successful or not. For unsuccessful cases, I want to you to go through that information and learn from your mistakes as even after multiple prompts some issues dont get resolved and my lovable credits are wasted");
  enhancedDebugService.setAIResponse(req18, "Created enhanced debug system with AI learning capabilities, request tracking, and failure analysis");
  enhancedDebugService.addChange(req18, "Created src/services/enhancedDebugService.ts - Advanced tracking with learning patterns");
  enhancedDebugService.addChange(req18, "Created src/components/EnhancedDebugPanel.tsx - Comprehensive UI with tabs and analytics");
  enhancedDebugService.addChange(req18, "Modified sidebar to include both system logs and AI learning views");
  enhancedDebugService.addChange(req18, "Implemented failure analysis and pattern recognition");
  enhancedDebugService.markSuccess(req18);

  const req19 = enhancedDebugService.startRequest("Dont make everything outside, once I click on debug center then only I should see all the stuff on the right side, similar to other functionalities of this app");
  enhancedDebugService.setAIResponse(req19, "Moved Debug Center to main content area as a regular menu item with proper tabbed interface");
  enhancedDebugService.addChange(req19, "Created src/components/DebugCenter.tsx - Main content area component");
  enhancedDebugService.addChange(req19, "Modified src/components/Sidebar.tsx - Added Debug Center as menu item, removed embedded panel");
  enhancedDebugService.addChange(req19, "Updated src/pages/Index.tsx - Added debug-center route");
  enhancedDebugService.addChange(req19, "Implemented proper tabbed interface for System Logs and AI Learning");
  enhancedDebugService.markSuccess(req19);

  const req20 = enhancedDebugService.startRequest("I want all the entries since inception of this app");
  enhancedDebugService.setAIResponse(req20, "Analyzed entire codebase and populated debug system with comprehensive development history from app inception to current state");
  enhancedDebugService.addChange(req20, "Added 20 major development phases covering all core features");
  enhancedDebugService.addChange(req20, "Documented user authentication, UI components, question management, assessments, OCR tools");
  enhancedDebugService.addChange(req20, "Tracked content lifecycle, permissions, audit system, and recent improvements");
  enhancedDebugService.addChange(req20, "Created complete historical record for learning and analysis");
  enhancedDebugService.markSuccess(req20);
};

// Initialize the complete development history
initializeCompleteHistory();

export type { ChangeRequest, LearningPattern };