import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Zap, FileText, Download, Send, AlertCircle, ChevronRight, ChevronLeft, ChevronDown, BookOpen, Target, Info, CheckCircle, Search } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import PDFPreview, { ExtraField, AdditionalLine } from './PDFPreview';
import QuestionShortageResolver from './QuestionShortageResolver';
import StudentDetailsForm from './StudentDetailsForm';
import GeneralInstructionsEditor from './GeneralInstructionsEditor';
import AdditionalLinesEditor from './AdditionalLinesEditor';
import SectionEditor, { Section } from './SectionEditor';
import { Blueprint, QuestionShortage, QuestionType, AssessmentMode, ManualQuestion, DifficultyLevels, BloomLevels } from '@/types/assessment';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { debugService } from '@/services/debugService';
import { exportElementToPdf } from '@/utils/pdfExport';

const mockChapters = [
  { 
    id: 'chapter1', 
    name: 'Algebra Basics', 
    description: 'Introduction to algebraic expressions and equations', 
    questionCount: 45,
    learningOutcomes: ['lo1', 'lo4']
  },
  { 
    id: 'chapter2', 
    name: 'Geometry Fundamentals', 
    description: 'Basic geometric shapes, properties, and theorems', 
    questionCount: 38,
    learningOutcomes: ['lo2', 'lo4']
  },
  { 
    id: 'chapter3', 
    name: 'Trigonometry', 
    description: 'Sine, cosine, tangent functions and applications', 
    questionCount: 32,
    learningOutcomes: ['lo1', 'lo4']
  },
  { 
    id: 'chapter4', 
    name: 'Statistics', 
    description: 'Data collection, analysis, and interpretation', 
    questionCount: 41,
    learningOutcomes: ['lo3', 'lo4']
  },
  { 
    id: 'chapter5', 
    name: 'Probability', 
    description: 'Basic probability concepts and calculations', 
    questionCount: 29,
    learningOutcomes: ['lo3', 'lo4']
  }
];

const mockLearningOutcomes = [
  { 
    id: 'lo1', 
    code: 'LO001', 
    title: 'Basic Arithmetic Operations', 
    description: 'Perform basic mathematical operations with accuracy', 
    questionCount: 52,
    chapters: ['chapter1', 'chapter3']
  },
  { 
    id: 'lo2', 
    code: 'LO002', 
    title: 'Geometric Shape Recognition', 
    description: 'Identify and classify various geometric shapes and their properties', 
    questionCount: 36,
    chapters: ['chapter2']
  },
  { 
    id: 'lo3', 
    code: 'LO003', 
    title: 'Data Analysis Skills', 
    description: 'Analyze and interpret data using statistical methods', 
    questionCount: 28,
    chapters: ['chapter4', 'chapter5']
  },
  { 
    id: 'lo4', 
    code: 'LO004', 
    title: 'Problem Solving Techniques', 
    description: 'Apply mathematical problem-solving strategies effectively', 
    questionCount: 44,
    chapters: ['chapter1', 'chapter2', 'chapter3', 'chapter4', 'chapter5']
  }
];

const AutomatedGeneration = () => {
  const { user } = useUser();
  const { toast } = useToast();
  
  React.useEffect(() => {
    debugService.info('AutomatedGeneration component mounted', 'AutomatedGeneration', { 
      user: user?.name,
      role: user?.role 
    });
    return () => {
      debugService.info('AutomatedGeneration component unmounted', 'AutomatedGeneration');
    };
  }, [user]);

  const [currentStep, setCurrentStep] = useState(1);
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [selectedBlueprint, setSelectedBlueprint] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [generatedPdf, setGeneratedPdf] = useState<string | null>(null);
  const [shortage, setShortage] = useState<QuestionShortage[]>([]);
  const [contentType, setContentType] = useState<'chapters' | 'learningOutcomes'>('chapters');
  const [chapterSearch, setChapterSearch] = useState('');
  const [loSearch, setLoSearch] = useState('');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [expandedLOs, setExpandedLOs] = useState<Set<string>>(new Set());
  const [addedManualQuestions, setAddedManualQuestions] = useState<ManualQuestion[]>([]);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [blueprintPage, setBlueprintPage] = useState(1);
  const blueprintsPerPage = 6;

  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [studentDetailFields, setStudentDetailFields] = useState<ExtraField[]>([
    { label: 'Name', value: '' }, { label: 'Roll No.', value: '' }, { label: 'Class', value: '' }, { label: 'Date', value: '' }
  ]);
  const [generalInstructions, setGeneralInstructions] = useState([
    'Please read the instructions carefully.',
    'This paper consists of multiple sections.',
    'All questions are compulsory.'
  ]);
  const [additionalLines, setAdditionalLines] = useState<AdditionalLine[]>([
    { text: '', orientation: 'center' }
  ]);
  const [isHeaderSectionOpen, setIsHeaderSectionOpen] = useState(false);
  const [sections, setSections] = useState<Section[]>([
    { id: 'section-a', title: 'Section A', label: 'Multiple Choice Questions', questionTypes: ['MCQ', 'FITB', 'Match'], questionCount: 10 },
    { id: 'section-b', title: 'Section B', label: 'Short Answer Questions', questionTypes: ['Arrange', 'SA'], questionCount: 5 },
    { id: 'section-c', title: 'Section C', label: 'Essay Type Questions', questionTypes: ['ETA'], questionCount: 3 }
  ]);

  const [formData, setFormData] = useState({
    title: '',
    grade: '',
    medium: 'English',
    subject: '',
    chapters: [] as string[],
    learningOutcomes: [] as string[],
    mode: 'FA' as AssessmentMode
  });


  const pdfContentRef = useRef<HTMLDivElement>(null);

  const totalSteps = 4;
  const stepProgress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    fetchBlueprints();
  }, []);

  const fetchBlueprints = async () => {
    setLoading(true);
    try {
      const sampleBlueprints = [
        {
          id: 'sample-1',
          name: 'Quick Assessment Blueprint',
          total_questions: 15,
          total_marks: 75,
          duration: 45,
          allowed_question_types: ['MCQ', 'FITB', 'Match'] as QuestionType[],
          bloom_l1: 6,
          bloom_l2: 5,
          bloom_l3: 3,
          bloom_l4: 1,
          bloom_l5: 0,
          bloom_l6: 0,
          mode: 'FA' as AssessmentMode,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: 1,
          created_by: 'system'
        },
        {
          id: 'sample-2',
          name: 'Comprehensive Test Blueprint',
          total_questions: 30,
          total_marks: undefined,
          duration: undefined,
          allowed_question_types: ['MCQ', 'FITB', 'Match', 'Arrange'] as QuestionType[],
          bloom_l1: 10,
          bloom_l2: 8,
          bloom_l3: 6,
          bloom_l4: 4,
          bloom_l5: 2,
          bloom_l6: 0,
          mode: 'SA' as AssessmentMode,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: 1,
          created_by: 'system'
        },
        {
          id: 'sample-3',
          name: 'Less questions on CLMS test',
          total_questions: 15,
          total_marks: 30,
          duration: 45,
          allowed_question_types: ['MCQ', 'FITB'] as QuestionType[],
          difficulty_l1: 6,
          difficulty_l2: 5,
          difficulty_l3: 3,
          difficulty_l4: 1,
          difficulty_l5: 0,
          bloom_l1: 0,
          bloom_l2: 0,
          bloom_l3: 0,
          bloom_l4: 0,
          bloom_l5: 0,
          bloom_l6: 0,
          mode: 'FA' as AssessmentMode,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: 1,
          created_by: 'system'
        }
      ];

      const { data, error } = await supabase
        .from('blueprints')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        setBlueprints(sampleBlueprints);
      } else {
        const filteredData = (data || []).map(bp => ({
          ...bp,
          allowed_question_types: bp.allowed_question_types.filter((type: string) => 
            ['MCQ', 'FITB', 'Match', 'Arrange'].includes(type)
          ) as QuestionType[]
        }));
        setBlueprints([...sampleBlueprints, ...filteredData]);
      }
    } catch (error) {
      console.error('Error fetching blueprints:', error);
      setBlueprints([
        {
          id: 'sample-1',
          name: 'Quick Assessment Blueprint',
          total_questions: 15,
          total_marks: 75,
          duration: 45,
          allowed_question_types: ['MCQ', 'FITB', 'Match'] as QuestionType[],
          bloom_l1: 6,
          bloom_l2: 5,
          bloom_l3: 3,
          bloom_l4: 1,
          bloom_l5: 0,
          bloom_l6: 0,
          mode: 'FA' as AssessmentMode,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: 1,
          created_by: 'system'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    const blueprint = blueprints.find(b => b.id === selectedBlueprint);
    if (blueprint) {
      const shortages = checkQuestionShortage(blueprint);
      if (shortages.length > 0) {
        setShortage(shortages);
        setShowManualEntry(true);
        return;
      }
    }

    await proceedWithGeneration();
  };

  const proceedWithGeneration = async () => {
    setGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setGeneratedPdf('/generated-assessments/mock-assessment.pdf');
      setShowPDFPreview(true);
      setIsGenerated(true);
      
      const hasManualQuestions = addedManualQuestions.length > 0;
      const hasDraftQuestions = addedManualQuestions.some(q => q.addedBy !== user?.id);
      
      let description = "Your assessment has been created and is ready for download.";
      if (hasManualQuestions) {
        if (hasDraftQuestions) {
          description = `Your assessment has been created with ${addedManualQuestions.length} additional questions (including draft questions). Draft questions won't be added to CLMS until reviewed.`;
        } else {
          description = `Your assessment has been created with ${addedManualQuestions.length} manually added questions. Manual questions won't be added to CLMS.`;
        }
      }
      
      toast({
        title: "Assessment Generated Successfully!",
        description
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate assessment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleManualQuestionsSave = (questions: ManualQuestion[]) => {
    setAddedManualQuestions(questions);
    setShortage([]);
    setShowManualEntry(false);
    
    proceedWithGeneration();
  };

  const handleManualQuestionsCancel = () => {
    setShortage([]);
    setShowManualEntry(false);
    setAddedManualQuestions([]);
  };

  const checkQuestionShortage = (blueprint: Blueprint): QuestionShortage[] => {
    const availableQuestions = blueprint.name === 'Less questions on CLMS test' ? {
      'MCQ': 8,
      'FITB': 5,
      'Match': 2,
      'Arrange': 3
    } : {
      'MCQ': 25,
      'FITB': 15,
      'Match': 8,
      'Arrange': 10
    };

    const shortages: QuestionShortage[] = [];
    
    blueprint.allowed_question_types.forEach(type => {
      const required = Math.ceil(blueprint.total_questions / blueprint.allowed_question_types.length);
      const available = availableQuestions[type] || 0;
      
      if (required > available) {
        shortages.push({
          questionType: type,
          required,
          available,
          shortage: required - available
        });
      }
    });

    return shortages;
  };

  const handleDownload = async () => {
    if (pdfContentRef.current) {
      debugService.info('Attempting to download PDF', 'AutomatedGeneration', {
        title: formData.title,
        questionsCount: mockQuestions.length,
      });
      toast({
        title: "Download Started",
        description: "Your assessment PDF is being downloaded",
      });
      try {
        await exportElementToPdf(pdfContentRef.current, `${formData.title || 'Assessment'}.pdf`);
        debugService.info('PDF download initiated successfully', 'AutomatedGeneration');
      } catch (error) {
        debugService.error('Failed to generate or download PDF', 'AutomatedGeneration', error);
        toast({
          title: "Download Failed",
          description: "Failed to generate or download PDF. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      debugService.warn('PDF content ref is null, cannot download', 'AutomatedGeneration');
      toast({
        title: "Download Failed",
        description: "PDF content not ready for download.",
        variant: "destructive"
      });
    }
  };

  const canProceedToStep2 = () => {
    return formData.title && formData.grade && formData.medium && formData.subject;
  };

  const canProceedToStep3 = () => {
    return (contentType === 'chapters' && formData.chapters.length > 0) ||
           (contentType === 'learningOutcomes' && formData.learningOutcomes.length > 0);
  };

  const canProceedToStep4 = () => {
    const blueprint = blueprints.find(b => b.id === selectedBlueprint);
    if (!blueprint) return false;
    
    const isClmsBlueprint = blueprint.name === 'Less questions on CLMS test';
    
    if (isClmsBlueprint) {
      const totalDifficultyQuestions = 
        (blueprint.difficulty_l1 || 0) + (blueprint.difficulty_l2 || 0) + (blueprint.difficulty_l3 || 0) + 
        (blueprint.difficulty_l4 || 0) + (blueprint.difficulty_l5 || 0);
      return totalDifficultyQuestions > 0;
    } else {
      const totalBloomQuestions = 
        blueprint.bloom_l1 + blueprint.bloom_l2 + blueprint.bloom_l3 + 
        blueprint.bloom_l4 + blueprint.bloom_l5 + blueprint.bloom_l6;
      return totalBloomQuestions > 0;
    }
  };

  const canProceedToStep5 = () => {
    return sections.length > 0 && sections.every(s => s.label.trim() !== '' && s.questionTypes.length > 0);
  };

  const canGenerate = () => {
    return selectedBlueprint && canProceedToStep2() && canProceedToStep3() && canProceedToStep4() && canProceedToStep5();
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChapterExpand = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    const action = newExpanded.has(chapterId) ? 'collapsed' : 'expanded';
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
    
    const chapter = mockChapters.find(c => c.id === chapterId);
    debugService.debug(`Chapter ${action}: ${chapter?.name}`, 'AutomatedGeneration', {
      chapterId,
      chapterName: chapter?.name,
      action,
      relatedLOs: chapter?.learningOutcomes
    });
  };

  const handleLOExpand = (loId: string) => {
    const newExpanded = new Set(expandedLOs);
    const action = newExpanded.has(loId) ? 'collapsed' : 'expanded';
    if (newExpanded.has(loId)) {
      newExpanded.delete(loId);
    } else {
      newExpanded.add(loId);
    }
    setExpandedLOs(newExpanded);
    
    const lo = mockLearningOutcomes.find(l => l.id === loId);
    debugService.debug(`Learning Outcome ${action}: ${lo?.title}`, 'AutomatedGeneration', {
      loId,
      loTitle: lo?.title,
      loCode: lo?.code,
      action,
      relatedChapters: lo?.chapters
    });
  };

  const mockQuestions = useMemo(() => {
    const questions = [];
    let questionNumber = 1;
    
    // Only generate questions if we're in step 3 or later AND have required data
    if (!formData.title || !selectedBlueprint || currentStep < 3) {
      return [];
    }
    
    const blueprint = blueprints.find(b => b.id === selectedBlueprint);
    if (!blueprint) return [];
    
    const isClmsBlueprint = blueprint.name === 'Less questions on CLMS test';
    
    if (isClmsBlueprint) {
      // Use difficulty levels for CLMS blueprint
      const difficultyLevels = [
        { level: 'L1', count: blueprint.difficulty_l1 || 0, name: 'Very Easy' },
        { level: 'L2', count: blueprint.difficulty_l2 || 0, name: 'Easy' },
        { level: 'L3', count: blueprint.difficulty_l3 || 0, name: 'Medium' },
        { level: 'L4', count: blueprint.difficulty_l4 || 0, name: 'Hard' },
        { level: 'L5', count: blueprint.difficulty_l5 || 0, name: 'Very Hard' }
      ];
      
      difficultyLevels.forEach(difficulty => {
        for (let i = 0; i < difficulty.count; i++) {
          const questionType = blueprint.allowed_question_types[i % blueprint.allowed_question_types.length] || 'MCQ';
          questions.push({
            id: `q${questionNumber}`,
            questionNumber: questionNumber++,
            questionType,
            questionText: `Sample ${questionType} question ${questionNumber - 1} (${difficulty.name} level)`,
            options: questionType === 'MCQ' ? ['Option A', 'Option B', 'Option C', 'Option D'] : undefined,
            correctAnswer: questionType === 'MCQ' ? 'Option A' : 'Sample answer',
            difficultyLevel: difficulty.level,
            marks: questionType === 'MCQ' ? 1 : questionType === 'FITB' ? 2 : 3,
            bloomLevel: 'L1',
            addedBy: 'System',
            addedAt: new Date().toISOString()
          });
        }
      });
    } else {
      // Use Bloom's taxonomy for other blueprints
      const bloomLevels = [
        { level: 'L1', count: blueprint.bloom_l1, name: 'Remember' },
        { level: 'L2', count: blueprint.bloom_l2, name: 'Understand' },
        { level: 'L3', count: blueprint.bloom_l3, name: 'Apply' },
        { level: 'L4', count: blueprint.bloom_l4, name: 'Analyze' },
        { level: 'L5', count: blueprint.bloom_l5, name: 'Evaluate' },
        { level: 'L6', count: blueprint.bloom_l6, name: 'Create' }
      ];
      
      bloomLevels.forEach(bloom => {
        for (let i = 0; i < bloom.count; i++) {
          const questionType = blueprint.allowed_question_types[i % blueprint.allowed_question_types.length] || 'MCQ';
          questions.push({
            id: `question-${questionNumber}`,
            questionNumber,
            questionStem: `Sample ${bloom.name} level question ${i + 1} - This is a placeholder question for ${questionType} type focusing on ${bloom.name} cognitive level.`,
            questionType,
            bloomLevel: parseInt(bloom.level.substring(1)),
            marks: blueprint.mode === 'SA' ? (bloom.level === 'L1' || bloom.level === 'L2' ? 1 : 2) : 1,
            chapter: formData.chapters[0] || 'Sample Chapter',
            topic: 'Sample Topic',
            options: questionType === 'MCQ' ? [
              'Option A - Sample answer choice',
              'Option B - Another choice',
              'Option C - Third option',
              'Option D - Fourth option'
            ] : undefined,
            answer: questionType === 'MCQ' ? 'Option A' : 'Sample Answer'
          });
          questionNumber++;
        }
      });
    }
    
    return questions;
  }, [selectedBlueprint, blueprints, formData.title, formData.chapters, currentStep]);

  const handleQuestionAction = (questionId: string, action: 'move-up' | 'move-down' | 'replace' | 'edit') => {
    console.log('Question action:', { questionId, action });
  };

  const selectedBlueprintData = blueprints.find(b => b.id === selectedBlueprint);
  const filteredBlueprints = blueprints.filter(blueprint => blueprint.mode === formData.mode);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
      <div className="space-y-6 overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="text-xl">Quick Generation</CardTitle>
              </div>
              <Badge variant="outline" className="text-sm">
                Step {currentStep} of {totalSteps}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className={currentStep >= 1 ? "text-primary font-medium" : "text-muted-foreground"}>Blueprint & Info</span>
                <span className={currentStep >= 2 ? "text-primary font-medium" : "text-muted-foreground"}>Content</span>
                <span className={currentStep >= 3 ? "text-primary font-medium" : "text-muted-foreground"}>Sections & Generate</span>
              </div>
              <Progress value={stepProgress} className="h-2" />
            </div>
          </CardHeader>
        </Card>

      {currentStep === 1 && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</div>
              <span>Assessment Information</span>
            </CardTitle>
            <p className="text-muted-foreground">Provide basic assessment details and choose a pre-configured template</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <Label className="text-base font-medium">Assessment Information</Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center space-x-1">
                    <span>Assessment Title</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Science Unit Test"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade" className="flex items-center space-x-1">
                    <span>Grade</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.grade} onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
                        <SelectItem key={grade} value={grade.toString()}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medium" className="flex items-center space-x-1">
                    <span>Medium</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.medium} onValueChange={(value) => setFormData(prev => ({ ...prev, medium: value }))}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                      <SelectItem value="Tamil">Tamil</SelectItem>
                      <SelectItem value="Telugu">Telugu</SelectItem>
                      <SelectItem value="Kannada">Kannada</SelectItem>
                      <SelectItem value="Malayalam">Malayalam</SelectItem>
                      <SelectItem value="Marathi">Marathi</SelectItem>
                      <SelectItem value="Gujarati">Gujarati</SelectItem>
                      <SelectItem value="Bengali">Bengali</SelectItem>
                      <SelectItem value="Punjabi">Punjabi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="flex items-center space-x-1">
                    <span>Subject</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                      <SelectItem value="Social Science">Social Science</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <AdditionalLinesEditor lines={additionalLines} onLinesChange={setAdditionalLines} />

            <Collapsible open={isHeaderSectionOpen} onOpenChange={setIsHeaderSectionOpen}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <Label className="text-sm font-medium">Header & Instructions</Label>
                  <Button variant="ghost" size="sm">
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 border border-t-0 rounded-b-lg space-y-4">
                <StudentDetailsForm
                  show={showStudentDetails}
                  onToggle={setShowStudentDetails}
                  fields={studentDetailFields}
                  onFieldsChange={setStudentDetailFields}
                />
                <GeneralInstructionsEditor
                  instructions={generalInstructions}
                  onInstructionsChange={setGeneralInstructions}
                />
              </CollapsibleContent>
            </Collapsible>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <Label className="text-base font-medium">Assessment Type</Label>
              </div>
              
              <RadioGroup 
                value={formData.mode} 
                onValueChange={(value: AssessmentMode) => {
                  setFormData(prev => ({ ...prev, mode: value }));
                  setSelectedBlueprint('');
                  setBlueprintPage(1);
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <Label htmlFor="fa-option" className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="FA" id="fa-option" />
                  <div className="font-medium">Formative Assessment (FA)/ Practice</div>
                </Label>
                <Label htmlFor="sa-option" className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="SA" id="sa-option" />
                  <div className="font-medium">Summative Assessment (SA)/ Evaluative</div>
                </Label>
              </RadioGroup>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <Label className="text-base font-medium">Available Blueprints</Label>
              {filteredBlueprints.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {filteredBlueprints
                      .slice((blueprintPage - 1) * blueprintsPerPage, blueprintPage * blueprintsPerPage)
                      .slice((blueprintPage - 1) * blueprintsPerPage, blueprintPage * blueprintsPerPage)
                      .map(blueprint => (
                        <div key={blueprint.id} className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-primary/50 ${
                          selectedBlueprint === blueprint.id ? 'border-primary bg-primary/5' : ''
                        }`} onClick={() => setSelectedBlueprint(blueprint.id)}>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="radio"
                                  name="blueprint"
                                  value={blueprint.id}
                                  checked={selectedBlueprint === blueprint.id}
                                  onChange={() => setSelectedBlueprint(blueprint.id)}
                                  className="w-4 h-4"
                                />
                                <div className="font-medium">{blueprint.name}</div>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-8 w-8 hover:bg-primary/10"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Info className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl">{blueprint.name}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-medium text-muted-foreground">Total Questions</Label>
                                        <p className="text-lg">{blueprint.total_questions}</p>
                                      </div>
                                      <div>
                                        <Label className="font-medium text-muted-foreground">Total Marks</Label>
                                        <p className="text-lg">{blueprint.total_marks || 'Not specified'}</p>
                                      </div>
                                      <div>
                                        <Label className="font-medium text-muted-foreground">Duration</Label>
                                        <p className="text-lg">{blueprint.duration ? `${blueprint.duration} minutes` : 'Not specified'}</p>
                                      </div>
                                      <div>
                                        <Label className="font-medium text-muted-foreground">Assessment Mode</Label>
                                        <Badge variant={blueprint.mode === 'SA' ? 'default' : 'secondary'} className="text-sm">
                                          {blueprint.mode}
                                        </Badge>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <Label className="font-medium text-muted-foreground">Question Types</Label>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {blueprint.allowed_question_types.map((type, index) => (
                                          <Badge key={index} variant="outline" className="text-xs">
                                            {type}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>

                                    <div>
                                      <Label className="font-medium text-muted-foreground">Bloom's Taxonomy Distribution</Label>
                                      <div className="grid grid-cols-3 gap-2 mt-2">
                                        <div className="text-center p-2 bg-muted/50 rounded">
                                          <p className="text-xs text-muted-foreground">L1 (Remember)</p>
                                          <p className="font-medium">{blueprint.bloom_l1}</p>
                                        </div>
                                        <div className="text-center p-2 bg-muted/50 rounded">
                                          <p className="text-xs text-muted-foreground">L2 (Understand)</p>
                                          <p className="font-medium">{blueprint.bloom_l2}</p>
                                        </div>
                                        <div className="text-center p-2 bg-muted/50 rounded">
                                          <p className="text-xs text-muted-foreground">L3 (Apply)</p>
                                          <p className="font-medium">{blueprint.bloom_l3}</p>
                                        </div>
                                        <div className="text-center p-2 bg-muted/50 rounded">
                                          <p className="text-xs text-muted-foreground">L4 (Analyze)</p>
                                          <p className="font-medium">{blueprint.bloom_l4}</p>
                                        </div>
                                        <div className="text-center p-2 bg-muted/50 rounded">
                                          <p className="text-xs text-muted-foreground">L5 (Evaluate)</p>
                                          <p className="font-medium">{blueprint.bloom_l5}</p>
                                        </div>
                                        <div className="text-center p-2 bg-muted/50 rounded">
                                          <p className="text-xs text-muted-foreground">L6 (Create)</p>
                                          <p className="font-medium">{blueprint.bloom_l6}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {(blueprint.difficulty_l1 || blueprint.difficulty_l2 || blueprint.difficulty_l3 || blueprint.difficulty_l4 || blueprint.difficulty_l5) && (
                                      <div>
                                        <Label className="font-medium text-muted-foreground">Difficulty Distribution</Label>
                                        <div className="grid grid-cols-5 gap-2 mt-2">
                                          {blueprint.difficulty_l1 && (
                                            <div className="text-center p-2 bg-muted/50 rounded">
                                              <p className="text-xs text-muted-foreground">Very Easy</p>
                                              <p className="font-medium">{blueprint.difficulty_l1}</p>
                                            </div>
                                          )}
                                          {blueprint.difficulty_l2 && (
                                            <div className="text-center p-2 bg-muted/50 rounded">
                                              <p className="text-xs text-muted-foreground">Easy</p>
                                              <p className="font-medium">{blueprint.difficulty_l2}</p>
                                            </div>
                                          )}
                                          {blueprint.difficulty_l3 && (
                                            <div className="text-center p-2 bg-muted/50 rounded">
                                              <p className="text-xs text-muted-foreground">Medium</p>
                                              <p className="font-medium">{blueprint.difficulty_l3}</p>
                                            </div>
                                          )}
                                          {blueprint.difficulty_l4 && (
                                            <div className="text-center p-2 bg-muted/50 rounded">
                                              <p className="text-xs text-muted-foreground">Hard</p>
                                              <p className="font-medium">{blueprint.difficulty_l4}</p>
                                            </div>
                                          )}
                                          {blueprint.difficulty_l5 && (
                                            <div className="text-center p-2 bg-muted/50 rounded">
                                              <p className="text-xs text-muted-foreground">Very Hard</p>
                                              <p className="font-medium">{blueprint.difficulty_l5}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    <div className="text-xs text-muted-foreground border-t pt-2">
                                      <p>Created: {new Date(blueprint.created_at).toLocaleDateString()}</p>
                                      <p>Version: {blueprint.version}</p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {blueprint.total_questions} questions • {blueprint.allowed_question_types.join(', ')}
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex flex-wrap gap-1">
                                {blueprint.total_marks && <span>{blueprint.total_marks} marks</span>}
                                {blueprint.duration && <span>{blueprint.duration} minutes</span>}
                              </div>
                              <Badge variant={blueprint.mode === 'SA' ? 'default' : 'secondary'} className="text-xs">
                                {blueprint.mode}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  {blueprints.length > blueprintsPerPage && (
                    <div className="flex justify-center mt-6">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (blueprintPage > 1) setBlueprintPage(blueprintPage - 1);
                              }}
                              className={blueprintPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                            />
                          </PaginationItem>
                          {Array.from({ length: Math.ceil(filteredBlueprints.length / blueprintsPerPage) }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setBlueprintPage(page);
                                }}
                                isActive={page === blueprintPage}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (blueprintPage < Math.ceil(filteredBlueprints.length / blueprintsPerPage)) setBlueprintPage(blueprintPage + 1);
                              }}
                              className={blueprintPage >= Math.ceil(filteredBlueprints.length / blueprintsPerPage) ? 'pointer-events-none opacity-50' : ''}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {blueprints.length > 0 
                    ? `No ${formData.mode} blueprints available`
                    : "No blueprints available"
                  }
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                onClick={nextStep}
                disabled={!selectedBlueprint || !canProceedToStep2()}
                className="flex items-center space-x-2"
              >
                <span>Next: Content Selection</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</div>
              <span>Content Selection</span>
            </CardTitle>
            <p className="text-muted-foreground">Select the chapters or learning outcomes for your assessment</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">How would you like to choose content?</Label>
              <RadioGroup 
                value={contentType} 
                onValueChange={(value: 'chapters' | 'learningOutcomes') => {
                  setContentType(value);
                  setFormData(prev => ({ ...prev, chapters: [], learningOutcomes: [] }));
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <Label htmlFor="chapters-option" className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="chapters" id="chapters-option" />
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium">By Chapters</div>
                      <div className="text-sm text-muted-foreground">Pick chapters from your syllabus</div>
                    </div>
                  </div>
                </Label>
                <Label htmlFor="los-option" className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="learningOutcomes" id="los-option" />
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium">By Learning Outcomes</div>
                      <div className="text-sm text-muted-foreground">Pick specific learning outcomes to test</div>
                    </div>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            {contentType === 'chapters' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <Label className="text-base font-medium">Select Chapters</Label>
                    <Badge variant="outline" className="text-xs">
                      {formData.chapters.length} selected
                    </Badge>
                  </div>
                  <Input
                    placeholder="Search chapters..."
                    value={chapterSearch}
                    onChange={(e) => setChapterSearch(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
                <div className="grid gap-3">
                  {mockChapters
                    .filter(chapter => chapter.name.toLowerCase().includes(chapterSearch.toLowerCase()) || 
                                     chapter.description.toLowerCase().includes(chapterSearch.toLowerCase()))
                    .map(chapter => (
                    <Collapsible key={chapter.id} open={expandedChapters.has(chapter.id)} onOpenChange={() => handleChapterExpand(chapter.id)}>
                      <div className="border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3 p-3">
                          <CollapsibleTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-8 h-8 p-0 hover:bg-muted border-muted-foreground/20"
                            >
                              {expandedChapters.has(chapter.id) ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="sr-only">Toggle skills</span>
                            </Button>
                          </CollapsibleTrigger>
                          <div className="flex-1">
                            <div className="font-medium">{chapter.name}</div>
                            <div className="text-sm text-muted-foreground">{chapter.description}</div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                45 questions available
                              </Badge>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            id={chapter.id}
                            checked={formData.chapters.includes(chapter.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const newChapters = [...formData.chapters, chapter.id];
                                const newLOs = [...new Set([...formData.learningOutcomes, ...chapter.learningOutcomes])];
                                setFormData(prev => ({ 
                                  ...prev, 
                                  chapters: newChapters,
                                  learningOutcomes: newLOs
                                }));
                              } else {
                                const newChapters = formData.chapters.filter(id => id !== chapter.id);
                                const remainingLOs = new Set();
                                newChapters.forEach(chId => {
                                  const ch = mockChapters.find(c => c.id === chId);
                                  if (ch) ch.learningOutcomes.forEach(loId => remainingLOs.add(loId));
                                });
                                const newLOs = formData.learningOutcomes.filter(loId => remainingLOs.has(loId));
                                setFormData(prev => ({ 
                                  ...prev, 
                                  chapters: newChapters,
                                  learningOutcomes: newLOs
                                }));
                              }
                            }}
                            className="w-4 h-4"
                          />
                        </div>
                        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                          <div className="px-3 pb-3 border-t bg-muted/30">
                            <div className="text-xs font-medium text-muted-foreground mt-2 mb-1">
                              Related Skills:
                            </div>
                            {mockLearningOutcomes
                              .filter(lo => chapter.learningOutcomes.includes(lo.id))
                              .map(lo => (
                                <div key={lo.id} className="flex items-center justify-between text-xs mb-1 p-2 rounded hover:bg-muted/50">
                                  <div className="flex items-center space-x-2 flex-1">
                                    <input
                                      type="checkbox"
                                      id={`${chapter.id}-${lo.id}`}
                                      checked={formData.learningOutcomes.includes(lo.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setFormData(prev => ({ 
                                            ...prev, 
                                            learningOutcomes: [...prev.learningOutcomes, lo.id] 
                                          }));
                                        } else {
                                          setFormData(prev => ({ 
                                            ...prev, 
                                            learningOutcomes: prev.learningOutcomes.filter(id => id !== lo.id) 
                                          }));
                                        }
                                      }}
                                      className="w-3 h-3"
                                    />
                                    <span className={formData.learningOutcomes.includes(lo.id) ? "font-medium text-primary" : ""}>
                                      {lo.code}: {lo.title}
                                    </span>
                                  </div>
                                  <span className="text-muted-foreground">{lo.questionCount} questions</span>
                                </div>
                              ))
                            }
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))}
                </div>
              </div>
            )}

            {contentType === 'learningOutcomes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-green-600" />
                    <Label className="text-base font-medium">Select Learning Outcomes</Label>
                    <Badge variant="outline" className="text-xs">
                      {formData.learningOutcomes.length} selected
                    </Badge>
                  </div>
                  <Input
                    placeholder="Search learning outcomes..."
                    value={loSearch}
                    onChange={(e) => setLoSearch(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
                <div className="grid gap-3">
                  {mockLearningOutcomes
                    .filter(lo => lo.title.toLowerCase().includes(loSearch.toLowerCase()) || 
                                 lo.description.toLowerCase().includes(loSearch.toLowerCase()) ||
                                 lo.code.toLowerCase().includes(loSearch.toLowerCase()))
                    .map(lo => (
                    <Collapsible key={lo.id} open={expandedLOs.has(lo.id)} onOpenChange={() => handleLOExpand(lo.id)}>
                      <div className="border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3 p-3">
                          <CollapsibleTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-8 h-8 p-0 hover:bg-muted border-muted-foreground/20"
                            >
                              {expandedLOs.has(lo.id) ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="sr-only">Toggle topics</span>
                            </Button>
                          </CollapsibleTrigger>
                          <div className="flex-1">
                            <div className="font-medium">{lo.code} - {lo.title}</div>
                            <div className="text-sm text-muted-foreground">{lo.description}</div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {lo.questionCount} questions
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {lo.chapters.length} topics
                              </Badge>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            id={lo.id}
                            checked={formData.learningOutcomes.includes(lo.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const newLOs = [...formData.learningOutcomes, lo.id];
                                const newChapters = [...new Set([...formData.chapters, ...lo.chapters])];
                                setFormData(prev => ({ 
                                  ...prev, 
                                  learningOutcomes: newLOs,
                                  chapters: newChapters
                                }));
                              } else {
                                const newLOs = formData.learningOutcomes.filter(id => id !== lo.id);
                                const remainingChapters = new Set();
                                newLOs.forEach(loId => {
                                  const learningOutcome = mockLearningOutcomes.find(l => l.id === loId);
                                  if (learningOutcome) learningOutcome.chapters.forEach(chId => remainingChapters.add(chId));
                                });
                                const newChapters = formData.chapters.filter(chId => remainingChapters.has(chId));
                                setFormData(prev => ({ 
                                  ...prev, 
                                  learningOutcomes: newLOs,
                                  chapters: newChapters
                                }));
                              }
                            }}
                            className="w-4 h-4"
                          />
                        </div>
                        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                          <div className="px-3 pb-3 border-t bg-muted/30">
                            <div className="text-xs font-medium text-muted-foreground mt-2 mb-1">
                              Related Topics:
                            </div>
                            {mockChapters
                              .filter(ch => lo.chapters.includes(ch.id))
                              .map(ch => (
                                <div key={ch.id} className="flex items-center justify-between text-xs mb-1 p-2 rounded hover:bg-muted/50">
                                  <div className="flex items-center space-x-2 flex-1">
                                    <input
                                      type="checkbox"
                                      id={`${lo.id}-${ch.id}`}
                                      checked={formData.chapters.includes(ch.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setFormData(prev => ({ 
                                            ...prev, 
                                            chapters: [...prev.chapters, ch.id] 
                                          }));
                                        } else {
                                          setFormData(prev => ({ 
                                            ...prev, 
                                            chapters: prev.chapters.filter(id => id !== ch.id) 
                                          }));
                                        }
                                      }}
                                      className="w-3 h-3"
                                    />
                                    <span className={formData.chapters.includes(ch.id) ? "font-medium text-primary" : ""}>
                                      {ch.name}
                                    </span>
                                  </div>
                                  <span className="text-muted-foreground">{ch.questionCount} questions</span>
                                </div>
                              ))
                            }
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={prevStep} className="flex items-center space-x-2">
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>
              <Button 
                onClick={nextStep}
                disabled={!canProceedToStep3()}
                className="flex items-center space-x-2"
              >
                <span>Next: Question Distribution</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</div>
              <span>Question Distribution</span>
            </CardTitle>
            <p className="text-muted-foreground">Review Bloom's taxonomy levels and set difficulty distribution for your assessment</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedBlueprint && (
              <>


                {/* Automatically show distribution based on blueprint */}
                {(() => {
                  const blueprint = blueprints.find(b => b.id === selectedBlueprint);
                  const isClmsBlueprint = blueprint?.name === 'Less questions on CLMS test';
                  
                  if (isClmsBlueprint) {
                    // Show difficulty levels for CLMS blueprint (only L1-L4: Very Easy to Hard)
                    const relevantDifficultyLevels = Object.entries(DifficultyLevels).slice(0, 4); // Only L1-L4
                    return (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">Difficulty Level Distribution (from Blueprint)</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {relevantDifficultyLevels.map(([level, label]) => {
                            const count = blueprint ? blueprint[`difficulty_l${level.slice(1)}` as keyof Blueprint] as number : 0;
                            return (
                              <div key={level} className="flex items-center justify-between p-2 border rounded bg-muted/20 text-sm">
                                <span className="font-medium">{label}</span>
                                <Badge variant="outline" className="text-xs">{count}</Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  } else {
                    // Show Bloom's taxonomy for other blueprints
                    return (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">Bloom's Taxonomy Distribution (from Blueprint)</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(BloomLevels).map(([level, label]) => {
                            const count = blueprint ? blueprint[`bloom_l${level.slice(1)}` as keyof Blueprint] as number : 0;
                            return (
                              <div key={level} className="flex items-center justify-between p-2 border rounded bg-muted/20 text-sm">
                                <span className="font-medium">{label}</span>
                                <Badge variant="outline" className="text-xs">{count}</Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                })()}
              </>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={prevStep} className="flex items-center space-x-2">
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>
              <Button 
                onClick={nextStep}
                disabled={!canProceedToStep4()}
                className="flex items-center space-x-2"
              >
                <span>Next: Manage Sections</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 4 && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">4</div>
              <span>Section Management & Generation</span>
            </CardTitle>
            <p className="text-muted-foreground">Organize your assessment into labeled sections and generate the final document.</p>
          </CardHeader>
          <CardContent>
            <SectionEditor sections={sections} onSectionsChange={setSections} />
            <div className="flex justify-between pt-4 mt-4">
              <Button variant="outline" onClick={prevStep} className="flex items-center space-x-2">
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>
              {isGenerated ? (
                  <Alert className="border-green-200 bg-green-50 max-w-xs">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Generated!</strong> Download from the preview panel.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Button 
                    onClick={handleGenerate}
                    disabled={!canGenerate() || generating}
                    className="flex items-center space-x-2"
                    size="lg"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{generating ? 'Generating...' : 'Generate Assessment'}</span>
                  </Button>
                )}
            </div>
          </CardContent>
        </Card>
      )}

      {showManualEntry && shortage.length > 0 && (
        <QuestionShortageResolver 
          open={showManualEntry}
          shortages={shortage}
          onSave={handleManualQuestionsSave}
          onCancel={handleManualQuestionsCancel}
        />
      )}
      </div>

      <div className="overflow-y-auto">
        <PDFPreview
          title={formData.title || 'Assessment Preview'}
          grade={formData.grade}
          questions={mockQuestions}
          onDownload={handleDownload}
          onQuestionAction={handleQuestionAction}
          documentType='assessment'
          isReadyForDownload={isGenerated}
          showStudentDetails={showStudentDetails}
          studentDetailFields={studentDetailFields}
          generalInstructions={generalInstructions}
          pdfContentRef={pdfContentRef}
          additionalLines={additionalLines}
          sections={sections}
        />
      </div>
    </div>
  );
};

export default AutomatedGeneration;