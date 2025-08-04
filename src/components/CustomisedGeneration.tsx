import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings, 
  Calculator, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown,
  BookOpen, 
  Target, 
  CheckCircle, 
  BookTemplate,
  AlertCircle,
  FileText,
  Info
} from 'lucide-react';
import PDFPreview, { AdditionalLine } from './PDFPreview';
import QuestionShortageResolver from './QuestionShortageResolver';
import ChapterLOSelector from './ChapterLOSelector';
import SectionEditor, { Section } from './SectionEditor';
import AdditionalLinesEditor from './AdditionalLinesEditor';
import StudentDetailsForm from './StudentDetailsForm';
import GeneralInstructionsEditor from './GeneralInstructionsEditor';
import { QuestionType, AssessmentMode, QuestionTypeLabels, BloomLevels, Blueprint, DifficultyLevels, QuestionShortage, ManualQuestion } from '@/types/assessment';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

const CustomisedGeneration = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [contentType, setContentType] = useState<'chapters' | 'learningOutcomes'>('chapters');
  
  // Blueprint state
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [selectedBlueprint, setSelectedBlueprint] = useState<string>('');
  const [blueprintPage, setBlueprintPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Additional state for matching AutomatedGeneration
  const [additionalLines, setAdditionalLines] = useState<AdditionalLine[]>([]);
  const [isHeaderSectionOpen, setIsHeaderSectionOpen] = useState(false);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [studentDetailFields, setStudentDetailFields] = useState<any[]>([]);
  const [generalInstructions, setGeneralInstructions] = useState<string[]>([]);
  
  // Question shortage detection state
  const [shortage, setShortage] = useState<QuestionShortage[]>([]);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [addedManualQuestions, setAddedManualQuestions] = useState<ManualQuestion[]>([]);
  
  const [sections, setSections] = useState<Section[]>([{
    id: 'section-1',
    title: 'Section A',
    label: '',
    questionTypeConfigs: []
  }]);

  const [formData, setFormData] = useState({
    title: '',
    grade: '',
    medium: 'English',
    subject: '',
    chapters: [] as string[],
    learningOutcomes: [] as string[],
    allowedQuestionTypes: [] as QuestionType[],
    distributionMethod: 'blooms' as 'blooms' | 'difficulty',
    bloomL1: 0,
    bloomL2: 0,
    bloomL3: 0,
    bloomL4: 0,
    bloomL5: 0,
    bloomL6: 0,
    difficultyL1: 0,
    difficultyL2: 0,
    difficultyL3: 0,
    difficultyL4: 0,
    difficultyL5: 0,
    mode: 'FA' as AssessmentMode,
    totalMarks: '',
    duration: ''
  });

  const totalSteps = 5;
  const stepProgress = (currentStep / totalSteps) * 100;

  // Blueprint functionality
  const fetchBlueprints = async () => {
    console.log('🔄 Fetching blueprints for mode:', formData.mode);
    setLoading(true);
    try {
      // Add sample blueprints including the CLMS test blueprint
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
        .eq('mode', formData.mode)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('⚠️ Database error, using sample blueprints');
        setBlueprints(sampleBlueprints.filter(bp => bp.mode === formData.mode));
      } else {
        console.log('✅ Blueprints fetched:', data?.length || 0, 'blueprints');
        const filteredData = (data || []).map(bp => ({
          ...bp,
          allowed_question_types: bp.allowed_question_types.filter((type: string) => 
            ['MCQ', 'FITB', 'Match', 'Arrange'].includes(type)
          ) as QuestionType[]
        }));
        setBlueprints([...sampleBlueprints.filter(bp => bp.mode === formData.mode), ...filteredData]);
      }
    } catch (error) {
      console.error('❌ Error fetching blueprints:', error);
      toast({
        title: "Error",
        description: "Failed to load blueprints",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load blueprints when component mounts or mode changes
  useEffect(() => {
    fetchBlueprints();
    setSelectedBlueprint(''); // Reset blueprint selection when mode changes
    setBlueprintPage(1);
  }, [formData.mode]);

  // Debug: Log blueprints when they change
  useEffect(() => {
    console.log('🔍 [CustomisedGeneration] Available blueprints:', blueprints.map(b => ({ id: b.id, name: b.name })));
  }, [blueprints]);

  // Auto-populate sections when blueprint is selected
  useEffect(() => {
    if (selectedBlueprint) {
      const blueprint = blueprints.find(b => b.id === selectedBlueprint);
      if (blueprint) {
        // Auto-populate sections based on blueprint
        const autoSections: Section[] = [
          { 
            id: 'section-a', 
            title: 'Section A', 
            label: 'Multiple Choice Questions', 
            questionTypeConfigs: blueprint.allowed_question_types.slice(0, 2).map(type => ({
              type,
              count: Math.ceil(blueprint.total_questions * 0.4 / blueprint.allowed_question_types.slice(0, 2).length),
              marks: type === 'MCQ' || type === 'FITB' || type === 'TF' ? 1 : 2
            }))
          },
          { 
            id: 'section-b', 
            title: 'Section B', 
            label: 'Short Answer Questions', 
            questionTypeConfigs: blueprint.allowed_question_types.slice(2, 4).map(type => ({
              type,
              count: Math.ceil(blueprint.total_questions * 0.6 / Math.max(1, blueprint.allowed_question_types.slice(2, 4).length)),
              marks: type === 'ETA' ? 5 : type === 'SA' ? 3 : 2
            }))
          }
        ].filter(section => section.questionTypeConfigs.length > 0);

        setSections(autoSections);
        
        // Prefill distribution from selected blueprint
        setFormData(prev => ({
          ...prev,
          bloomL1: blueprint.bloom_l1,
          bloomL2: blueprint.bloom_l2,
          bloomL3: blueprint.bloom_l3,
          bloomL4: blueprint.bloom_l4,
          bloomL5: blueprint.bloom_l5,
          bloomL6: blueprint.bloom_l6,
        }));
      }
    }
  }, [selectedBlueprint, blueprints]);

  // Update allowed question types from sections
  useEffect(() => {
    const allQuestionTypes = sections.reduce<QuestionType[]>((acc, section) => {
      section.questionTypeConfigs.forEach(config => {
        if (!acc.includes(config.type)) {
          acc.push(config.type);
        }
      });
      return acc;
    }, []);
    
    setFormData(prev => ({
      ...prev,
      allowedQuestionTypes: allQuestionTypes
    }));
  }, [sections]);

  const handleBloomChange = (level: keyof typeof BloomLevels, value: number[]) => {
    const fieldName = `bloom${level}` as keyof typeof formData;
    const newValue = value[0];
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: newValue
    }));
  };

  const getTotalQuestions = () => {
    return sections.reduce((total, section) => {
      return total + section.questionTypeConfigs.reduce((sectionTotal, config) => sectionTotal + config.count, 0);
    }, 0);
  };

  const getTotalMarks = () => {
    return sections.reduce((total, section) => {
      return total + section.questionTypeConfigs.reduce((sectionTotal, config) => sectionTotal + (config.count * config.marks), 0);
    }, 0);
  };

  const getTotalDifficultyQuestions = () => {
    return formData.difficultyL1 + formData.difficultyL2 + formData.difficultyL3 + 
           formData.difficultyL4 + formData.difficultyL5;
  };

  // Generate mock questions for preview based on sections
  const mockQuestions = useMemo(() => {
    console.log('🔍 [CustomisedGeneration] Generating mock questions with sections:', sections);
    console.log('🔍 [CustomisedGeneration] Form data title:', formData.title);
    
    const questions = [];
    let questionNumber = 1;
    
    // Only generate questions if we have the minimum required data
    if (!formData.title || sections.length === 0) {
      console.log('🔍 [CustomisedGeneration] No questions generated - missing title or no sections');
      return [];
    }
    
    // Generate questions based on sections
    sections.forEach((section, sectionIndex) => {
      console.log('🔍 [CustomisedGeneration] Processing section:', section);
      
      // Generate questions based on question type configs
      section.questionTypeConfigs.forEach(config => {
        for (let i = 0; i < config.count; i++) {
          questions.push({
            id: `question-${questionNumber}`,
            questionNumber,
            questionStem: `${section.title} - Sample ${config.type} question ${i + 1} - This is a placeholder question for ${section.label || 'this section'}.`,
            questionType: config.type,
            bloomLevel: Math.floor(Math.random() * 6) + 1,
            marks: config.marks,
            chapter: formData.chapters[0] || 'Sample Chapter',
            topic: 'Sample Topic',
            section: section.title,
            sectionLabel: section.label,
            options: config.type === 'MCQ' ? [
              'Option A - Sample answer choice',
              'Option B - Another choice',
              'Option C - Third option',
              'Option D - Fourth option'
            ] : undefined,
            answer: config.type === 'MCQ' ? 'Option A' : 'Sample Answer'
          });
          questionNumber++;
        }
      });
    });
    
    console.log('🔍 [CustomisedGeneration] Generated questions:', questions);
    return questions;
  }, [sections, formData.title, formData.chapters, formData.subject, formData.grade]);

  const handleQuestionAction = (questionId: string, action: 'move-up' | 'move-down' | 'replace' | 'edit') => {
    // Handle question actions in preview
    console.log('Question action:', { questionId, action });
  };

  const checkQuestionShortage = (blueprint: Blueprint): QuestionShortage[] => {
    console.log('🔍 [CustomisedGeneration] Checking question shortage for blueprint:', blueprint.name);
    console.log('🔍 [CustomisedGeneration] Blueprint total questions:', blueprint.total_questions);
    console.log('🔍 [CustomisedGeneration] Blueprint allowed types:', blueprint.allowed_question_types);
    
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
    console.log('🔍 [CustomisedGeneration] Available questions for blueprint:', availableQuestions);
    
    // Check shortage based on blueprint requirements, not current sections
    blueprint.allowed_question_types.forEach(type => {
      const required = Math.ceil(blueprint.total_questions / blueprint.allowed_question_types.length);
      const available = availableQuestions[type] || 0;
      
      console.log(`🔍 [CustomisedGeneration] ${type}: required=${required}, available=${available}`);
      
      if (required > available) {
        shortages.push({
          questionType: type,
          required,
          available,
          shortage: required - available
        });
      }
    });

    console.log('🔍 [CustomisedGeneration] Final shortages detected:', shortages);
    return shortages;
  };

  const handleCreate = async () => {
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
      setIsGenerated(true);
      toast({
        title: "Assessment Created Successfully!",
        description: "Your custom assessment has been created and is ready for download",
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create assessment. Please try again.",
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
    // Proceed to next step (Section Management) instead of generating
    setCurrentStep(currentStep + 1);
  };

  const handleManualQuestionsCancel = () => {
    setShortage([]);
    setShowManualEntry(false);
    setAddedManualQuestions([]);
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Your custom assessment PDF is being downloaded",
    });
  };

  const canProceedToStep2 = () => {
    return formData.mode === 'SA' ? (formData.totalMarks && formData.duration) : true;
  };

  const canProceedToStep3 = () => {
    return formData.title && formData.grade && formData.medium && formData.subject;
  };

  const canProceedToStep4 = () => {
    return (contentType === 'chapters' && formData.chapters.length > 0) ||
           (contentType === 'learningOutcomes' && formData.learningOutcomes.length > 0);
  };

  const canProceedToStep5 = () => {
    return selectedBlueprint !== '';
  };

  const canProceedToStep6 = () => {
    const blueprint = blueprints.find(b => b.id === selectedBlueprint);
    if (!blueprint) return false;
    
    const hasValidSections = sections.some(section => section.questionTypeConfigs.length > 0);
    const totalSectionQuestions = getTotalQuestions();
    const validSectionCount = totalSectionQuestions === blueprint.total_questions;
    
    return hasValidSections && validSectionCount;
  };

  const canProceedToStep7 = () => {
    return canProceedToStep6();
  };

  const hasQuestionCountExceeded = () => {
    const blueprint = blueprints.find(b => b.id === selectedBlueprint);
    if (!blueprint) return false;
    
    const totalSectionQuestions = getTotalQuestions();
    return totalSectionQuestions > blueprint.total_questions;
  };

  const canGenerate = () => {
    const blueprint = blueprints.find(b => b.id === selectedBlueprint);
    if (!blueprint) return false;
    
    const totalSectionQuestions = getTotalQuestions();
    const validSectionCount = totalSectionQuestions === blueprint.total_questions;
    
    return canProceedToStep2() && canProceedToStep3() && canProceedToStep4() && 
           canProceedToStep5() && canProceedToStep6() && validSectionCount;
  };

  const nextStep = () => {
    console.log('🚀 [CustomisedGeneration] NextStep called - Current step:', currentStep);
    console.log('🚀 [CustomisedGeneration] Selected blueprint ID:', selectedBlueprint);
    
    // Check for question shortage when moving to section management step (step 4)
    if (currentStep === 3 && selectedBlueprint) {
      const blueprint = blueprints.find(b => b.id === selectedBlueprint);
      console.log('🚀 [CustomisedGeneration] Found blueprint:', blueprint);
      console.log('🚀 [CustomisedGeneration] Blueprint name:', blueprint?.name);
      console.log('🚀 [CustomisedGeneration] Is CLMS blueprint?', blueprint?.name === 'Less questions on CLMS test');
      
      if (blueprint) {
        const shortages = checkQuestionShortage(blueprint);
        console.log('🚀 [CustomisedGeneration] Detected shortages:', shortages);
        
        if (shortages.length > 0) {
          console.log('🚀 [CustomisedGeneration] Shortages found, showing manual entry dialog');
          setShortage(shortages);
          setShowManualEntry(true);
          return; // Don't proceed to next step
        } else {
          console.log('🚀 [CustomisedGeneration] No shortages detected, proceeding to next step');
        }
      }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      console.log('🚀 [CustomisedGeneration] Moving to step:', currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
      {/* Left Panel - Form Steps */}
      <div className="space-y-6 overflow-y-auto">
        {/* Progress Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="text-xl">Build Your Assessment</CardTitle>
                <p className="text-muted-foreground text-sm">Create your assessment exactly how you want it</p>
              </div>
              <Badge variant="outline" className="text-sm">
                Step {currentStep} of {totalSteps}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className={currentStep >= 1 ? "text-primary font-medium" : "text-muted-foreground"}>Setup & Blueprint</span>
                <span className={currentStep >= 2 ? "text-primary font-medium" : "text-muted-foreground"}>Content</span>
                <span className={currentStep >= 3 ? "text-primary font-medium" : "text-muted-foreground"}>Distribution</span>
                <span className={currentStep >= 4 ? "text-primary font-medium" : "text-muted-foreground"}>Sections</span>
                <span className={currentStep >= 5 ? "text-primary font-medium" : "text-muted-foreground"}>Generate</span>
              </div>
              <Progress value={stepProgress} className="h-2" />
            </div>
          </CardHeader>
        </Card>

        {/* Step 1: Assessment Configuration & Basic Information */}
        {currentStep === 1 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</div>
                <span>Assessment Configuration & Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Assessment Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-primary" />
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
                  <div className="flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:bg-muted/50">
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

              {/* Assessment Mode */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary" />
                  <Label className="text-base font-medium">Assessment Type</Label>
                </div>
                
                <RadioGroup 
                  value={formData.mode} 
                  onValueChange={(value: AssessmentMode) => setFormData(prev => ({ ...prev, mode: value }))}
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

              {/* Marks and Duration */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5 text-green-600" />
                  <Label className="text-base font-medium">Assessment Parameters</Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="totalMarks" className="flex items-center space-x-1">
                      <span>Total Marks</span>
                      {formData.mode === 'SA' && <span className="text-destructive">*</span>}
                    </Label>
                    <Input
                      id="totalMarks"
                      type="number"
                      min="1"
                      placeholder="e.g., 100"
                      value={formData.totalMarks}
                      onChange={(e) => setFormData(prev => ({ ...prev, totalMarks: e.target.value }))}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="flex items-center space-x-1">
                      <span>Duration (minutes)</span>
                      {formData.mode === 'SA' && <span className="text-destructive">*</span>}
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      placeholder="e.g., 90"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Blueprint Selection */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <BookTemplate className="w-5 h-5 text-primary" />
                  <Label className="text-base font-medium">Blueprint Selection</Label>
                </div>
                
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {blueprints.length === 0 ? (
                      <Alert>
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>
                          No blueprints available for {formData.mode} mode. Please check your assessment mode or create a blueprint first.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {blueprints.slice((blueprintPage - 1) * 6, blueprintPage * 6).map(blueprint => (
                          <div 
                            key={blueprint.id} 
                            className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-primary/50 ${
                              selectedBlueprint === blueprint.id ? 'border-primary bg-primary/5' : ''
                            }`} 
                            onClick={() => setSelectedBlueprint(blueprint.id)}
                          >
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
                                              {QuestionTypeLabels[type] || type}
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

                                      <div className="text-xs text-muted-foreground border-t pt-2">
                                        <p>Created: {new Date(blueprint.created_at).toLocaleDateString()}</p>
                                        <p>Version: {blueprint.version}</p>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {blueprint.total_questions} questions • {blueprint.allowed_question_types.map(type => QuestionTypeLabels[type] || type).join(', ')}
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
                    )}
                    
                    {blueprints.length > 6 && (
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setBlueprintPage(Math.max(1, blueprintPage - 1))}
                          disabled={blueprintPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {blueprintPage} of {Math.ceil(blueprints.length / 6)}
                        </span>
                        <Button
                          variant="outline"
                          onClick={() => setBlueprintPage(Math.min(Math.ceil(blueprints.length / 6), blueprintPage + 1))}
                          disabled={blueprintPage >= Math.ceil(blueprints.length / 6)}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={nextStep}
                  disabled={!canProceedToStep3() || !canProceedToStep5()}
                  className="flex items-center space-x-2"
                >
                  <span>Next: Content Selection</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Content Selection */}
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
              <ChapterLOSelector
                selectedChapters={formData.chapters}
                selectedLearningOutcomes={formData.learningOutcomes}
                onChapterChange={(chapters) => setFormData(prev => ({ ...prev, chapters }))}
                onLearningOutcomeChange={(outcomes) => setFormData(prev => ({ ...prev, learningOutcomes: outcomes }))}
                mode={contentType}
                onModeChange={setContentType}
              />

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep} className="flex items-center space-x-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
                <Button 
                  onClick={nextStep}
                  disabled={!canProceedToStep4()}
                  className="flex items-center space-x-2"
                >
                  <span>Next: Question Distribution</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Question Distribution */}
        {currentStep === 3 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</div>
                <span>Question Distribution</span>
              </CardTitle>
              <p className="text-muted-foreground">Customize the distribution of questions based on Bloom's Taxonomy or Difficulty levels</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedBlueprint && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <Label className="text-base font-medium">Question Distribution</Label>
                    </div>
                    {(() => {
                      const blueprint = blueprints.find(b => b.id === selectedBlueprint);
                      if (!blueprint) return null;
                      
                      const totalQuestions = formData.bloomL1 + formData.bloomL2 + formData.bloomL3 + formData.bloomL4 + formData.bloomL5 + formData.bloomL6;
                      
                      return (
                        <div className={`px-3 py-1 rounded-md text-sm font-medium ${
                          totalQuestions > blueprint.total_questions 
                            ? 'bg-red-100 text-red-700' 
                            : totalQuestions < blueprint.total_questions 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {totalQuestions} / {blueprint.total_questions}
                        </div>
                      );
                    })()}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(BloomLevels).map(([level, label]) => {
                      const fieldName = `bloom${level}` as keyof typeof formData;
                      const value = formData[fieldName] as number;
                      const blueprint = blueprints.find(b => b.id === selectedBlueprint);
                      const maxValue = blueprint ? blueprint.total_questions : 50;
                      
                      return (
                        <div key={level} className="flex items-center justify-between space-x-2">
                          <Label className="text-sm flex-1">L{level.slice(1)} {label.split(' ')[0]}</Label>
                          <Input
                            type="number"
                            min="0"
                            max={maxValue}
                            value={value}
                            onChange={(e) => {
                              const newValue = parseInt(e.target.value) || 0;
                              handleBloomChange(level as keyof typeof BloomLevels, [newValue]);
                            }}
                            className="w-16 h-8 text-center text-sm"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {(() => {
                    const blueprint = blueprints.find(b => b.id === selectedBlueprint);
                    if (!blueprint) return null;
                    
                    const totalQuestions = formData.bloomL1 + formData.bloomL2 + formData.bloomL3 + formData.bloomL4 + formData.bloomL5 + formData.bloomL6;
                    
                    if (totalQuestions > blueprint.total_questions) {
                      return (
                        <p className="text-red-600 text-sm text-center">
                          ⚠️ Total exceeds blueprint by {totalQuestions - blueprint.total_questions} questions. Please reduce from other levels.
                        </p>
                      );
                    } else if (totalQuestions < blueprint.total_questions) {
                      return (
                        <p className="text-yellow-600 text-sm text-center">
                          📊 {blueprint.total_questions - totalQuestions} more questions needed
                        </p>
                      );
                    } else {
                      return (
                        <p className="text-green-600 text-sm text-center">
                          ✅ Perfect! Matches blueprint exactly
                        </p>
                      );
                    }
                  })()}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep} className="flex items-center space-x-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
                <Button 
                  onClick={nextStep}
                  className="flex items-center space-x-2"
                >
                  <span>Next: Section Setup</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Section Management */}
        {currentStep === 4 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">4</div>
                <span>Section Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Section validation feedback */}
              {selectedBlueprint && (
                <div className={`p-4 rounded-lg border text-center ${(() => {
                  const blueprint = blueprints.find(b => b.id === selectedBlueprint);
                  if (!blueprint) return 'bg-muted/50';
                  
                  const totalSectionQuestions = getTotalQuestions();
                  
                  if (totalSectionQuestions > blueprint.total_questions) {
                    return 'bg-red-50 border-red-200';
                  } else if (totalSectionQuestions < blueprint.total_questions) {
                    return 'bg-yellow-50 border-yellow-200';
                  } else {
                    return 'bg-green-50 border-green-200';
                  }
                })()}`}>
                  {(() => {
                    const blueprint = blueprints.find(b => b.id === selectedBlueprint);
                    if (!blueprint) return null;
                    
                    const totalSectionQuestions = getTotalQuestions();
                    const totalSectionMarks = getTotalMarks();
                    
                    return (
                      <div>
                        <div className={`text-lg font-semibold mb-2 ${
                          totalSectionQuestions > blueprint.total_questions ? 'text-red-700' : 
                          totalSectionQuestions < blueprint.total_questions ? 'text-yellow-700' : 
                          'text-green-700'
                        }`}>
                          {totalSectionQuestions} / {blueprint.total_questions} Questions | {totalSectionMarks} Marks
                        </div>
                        {totalSectionQuestions > blueprint.total_questions ? (
                          <p className="text-red-600 text-sm">
                            ⚠️ Sections exceed blueprint by {totalSectionQuestions - blueprint.total_questions} questions. Please reduce question counts.
                          </p>
                        ) : totalSectionQuestions < blueprint.total_questions ? (
                          <p className="text-yellow-600 text-sm">
                            📊 {blueprint.total_questions - totalSectionQuestions} more questions needed in sections
                          </p>
                        ) : (
                          <p className="text-green-600 text-sm">
                            ✅ Perfect! Section totals match blueprint exactly
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
              
              <SectionEditor
                sections={sections}
                onSectionsChange={setSections}
                selectedBlueprint={blueprints.find(b => b.id === selectedBlueprint)}
              />

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep} className="flex items-center space-x-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={!canProceedToStep6()}
                  className="flex items-center space-x-2"
                >
                  <span>Next: Generate</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Generate */}
        {currentStep === 5 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">5</div>
                <span>Final Review & Generate</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Assessment Summary</Label>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div><strong>Title:</strong> {formData.title}</div>
                  <div><strong>Grade:</strong> Grade {formData.grade}</div>
                  <div><strong>Subject:</strong> {formData.subject}</div>
                  <div><strong>Assessment Mode:</strong> {formData.mode}</div>
                  <div><strong>Total Questions:</strong> {getTotalQuestions()}</div>
                  {formData.totalMarks && <div><strong>Total Marks:</strong> {formData.totalMarks}</div>}
                  {formData.duration && <div><strong>Duration:</strong> {formData.duration} minutes</div>}
                  <div><strong>Sections:</strong> {sections.length} section{sections.length !== 1 ? 's' : ''} configured</div>
                  <div><strong>Question Types:</strong> {formData.allowedQuestionTypes.map(type => QuestionTypeLabels[type]).join(', ')}</div>
                  <div><strong>Content:</strong> {contentType === 'chapters' ? `${formData.chapters.length} chapters selected` : `${formData.learningOutcomes.length} learning outcomes selected`}</div>
                  <div><strong>Distribution:</strong> {formData.distributionMethod === 'blooms' ? 'Bloom\'s Taxonomy' : 'Difficulty Levels'}</div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep} className="flex items-center space-x-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
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
                    onClick={handleCreate}
                    disabled={!canGenerate() || generating}
                    className="flex items-center space-x-2"
                  >
                    <span>{generating ? 'Generating...' : 'Generate Assessment'}</span>
                    <CheckCircle className="w-4 h-4" />
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

      {/* Right Panel - Real-time Preview */}
      <div className="overflow-y-auto">
        <PDFPreview
          title={formData.title || 'Assessment Preview'}
          grade={formData.grade}
          questions={mockQuestions}
          onDownload={handleDownload}
          onQuestionAction={handleQuestionAction}
          documentType='assessment'
          isReadyForDownload={isGenerated}
          totalMarks={formData.totalMarks && formData.totalMarks.trim() !== '' ? formData.totalMarks : undefined}
          duration={formData.duration && formData.duration.trim() !== '' ? formData.duration : undefined}
        />
      </div>
    </div>
  );
};

export default CustomisedGeneration;