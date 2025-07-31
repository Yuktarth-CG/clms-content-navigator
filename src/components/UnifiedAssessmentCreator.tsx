import React, { useState, useMemo } from 'react';
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
import { 
  FileText, 
  BookOpen, 
  Target, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  PieChart
} from 'lucide-react';
import ChapterLOSelector from './ChapterLOSelector';
import PDFPreview from './PDFPreview';
import { QuestionType, AssessmentMode, QuestionTypeLabels, BloomLevels } from '@/types/assessment';
import { useToast } from '@/hooks/use-toast';

// Template definitions
const assessmentTemplates = {
  assessment: [
    {
      name: 'Quick Test',
      description: 'Short 10-question assessment for regular testing',
      totalQuestions: 10,
      bloomDistribution: { L1: 4, L2: 4, L3: 2, L4: 0, L5: 0, L6: 0 },
      questionTypes: ['MCQ', 'FITB'] as QuestionType[],
      mode: 'FA' as AssessmentMode,
      headers: ['Student Name', 'Class', 'Roll Number', 'Date']
    },
    {
      name: 'Unit Assessment',
      description: 'Comprehensive 25-question unit test',
      totalQuestions: 25,
      bloomDistribution: { L1: 8, L2: 8, L3: 5, L4: 3, L5: 1, L6: 0 },
      questionTypes: ['MCQ', 'FITB', 'Match'] as QuestionType[],
      mode: 'SA' as AssessmentMode,
      headers: ['Student Name', 'Class', 'Roll Number', 'Date', 'Subject']
    },
    {
      name: 'Final Exam',
      description: 'Comprehensive 40-question final examination',
      totalQuestions: 40,
      bloomDistribution: { L1: 12, L2: 12, L3: 8, L4: 5, L5: 2, L6: 1 },
      questionTypes: ['MCQ', 'FITB', 'Match', 'Arrange'] as QuestionType[],
      mode: 'SA' as AssessmentMode,
      headers: ['Student Name', 'Class', 'Roll Number', 'Date', 'Subject', 'Time']
    }
  ],
  worksheet: [
    {
      name: 'Practice Sheet',
      description: 'Basic practice worksheet for skill building',
      totalQuestions: 15,
      bloomDistribution: { L1: 6, L2: 6, L3: 3, L4: 0, L5: 0, L6: 0 },
      questionTypes: ['MCQ', 'FITB'] as QuestionType[],
      mode: 'FA' as AssessmentMode,
      headers: ['Student Name', 'Class', 'Roll Number']
    },
    {
      name: 'Homework Sheet',
      description: 'Extended practice for home study',
      totalQuestions: 20,
      bloomDistribution: { L1: 8, L2: 7, L3: 4, L4: 1, L5: 0, L6: 0 },
      questionTypes: ['MCQ', 'FITB', 'Match'] as QuestionType[],
      mode: 'FA' as AssessmentMode,
      headers: ['Student Name', 'Class', 'Roll Number', 'Parent Signature']
    },
    {
      name: 'Revision Worksheet',
      description: 'Comprehensive revision before exams',
      totalQuestions: 30,
      bloomDistribution: { L1: 10, L2: 10, L3: 6, L4: 3, L5: 1, L6: 0 },
      questionTypes: ['MCQ', 'FITB', 'Match', 'Arrange'] as QuestionType[],
      mode: 'FA' as AssessmentMode,
      headers: ['Student Name', 'Class', 'Roll Number', 'Date', 'Completion Time']
    }
  ]
};

const UnifiedAssessmentCreator = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [documentType, setDocumentType] = useState<'assessment' | 'worksheet'>('assessment');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [contentSelectionMode, setContentSelectionMode] = useState<'chapters' | 'learningOutcomes'>('chapters');
  
  const [formData, setFormData] = useState({
    title: '',
    grade: '',
    medium: 'English',
    subject: '',
    chapters: [] as string[],
    learningOutcomes: [] as string[],
    allowedQuestionTypes: [] as QuestionType[],
    bloomL1: 0,
    bloomL2: 0,
    bloomL3: 0,
    bloomL4: 0,
    bloomL5: 0,
    bloomL6: 0,
    mode: 'FA' as AssessmentMode,
    totalMarks: '',
    duration: '',
    customHeaders: [] as string[]
  });

  const totalSteps = 6;
  const stepProgress = ((currentStep + 1) / totalSteps) * 100;

  const applyTemplate = (templateName: string) => {
    const templates = assessmentTemplates[documentType];
    const template = templates.find(t => t.name === templateName);
    if (!template) return;

    setFormData(prev => ({
      ...prev,
      allowedQuestionTypes: template.questionTypes,
      bloomL1: template.bloomDistribution.L1,
      bloomL2: template.bloomDistribution.L2,
      bloomL3: template.bloomDistribution.L3,
      bloomL4: template.bloomDistribution.L4,
      bloomL5: template.bloomDistribution.L5,
      bloomL6: template.bloomDistribution.L6,
      mode: template.mode,
      totalMarks: template.mode === 'SA' ? '100' : '',
      duration: template.mode === 'SA' ? '90' : '',
      customHeaders: template.headers
    }));

    setSelectedTemplate(templateName);
    toast({
      title: "Template Applied",
      description: `${templateName} template has been applied successfully`,
    });
  };

  const getTotalQuestions = () => {
    try {
      return (formData.bloomL1 || 0) + (formData.bloomL2 || 0) + (formData.bloomL3 || 0) + 
             (formData.bloomL4 || 0) + (formData.bloomL5 || 0) + (formData.bloomL6 || 0);
    } catch (error) {
      console.error('Error calculating total questions:', error);
      return 0;
    }
  };

  // Generate mock questions for preview based on current form data
  const mockQuestions = useMemo(() => {
    const questions = [];
    let questionNumber = 1;
    
    // Only generate questions if we have the minimum required data
    if (!formData.title || getTotalQuestions() === 0) {
      return [];
    }
    
    // Generate questions based on Bloom's levels
    const bloomLevels = [
      { level: 'L1', count: formData.bloomL1, name: 'Remember' },
      { level: 'L2', count: formData.bloomL2, name: 'Understand' },
      { level: 'L3', count: formData.bloomL3, name: 'Apply' },
      { level: 'L4', count: formData.bloomL4, name: 'Analyze' },
      { level: 'L5', count: formData.bloomL5, name: 'Evaluate' },
      { level: 'L6', count: formData.bloomL6, name: 'Create' }
    ];
    
    bloomLevels.forEach(bloom => {
      for (let i = 0; i < bloom.count; i++) {
        const questionType = formData.allowedQuestionTypes[i % formData.allowedQuestionTypes.length] || 'MCQ';
        questions.push({
          id: `question-${questionNumber}`,
          questionNumber,
          questionStem: `Sample ${bloom.name} level question ${i + 1} - This is a placeholder question for ${questionType} type focusing on ${bloom.name} cognitive level.`,
          questionType,
          bloomLevel: parseInt(bloom.level.substring(1)),
          marks: formData.mode === 'SA' ? (bloom.level === 'L1' || bloom.level === 'L2' ? 1 : 2) : 1,
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
    
    return questions;
  }, [formData.bloomL1, formData.bloomL2, formData.bloomL3, formData.bloomL4, formData.bloomL5, formData.bloomL6, formData.allowedQuestionTypes, formData.mode, formData.chapters, formData.title]);

  const handleQuestionAction = (questionId: string, action: 'move-up' | 'move-down' | 'replace' | 'edit') => {
    // Handle question actions in preview
    console.log('Question action:', { questionId, action });
  };

  const handleDownload = () => {
    // Handle PDF download
    console.log('Download PDF');
  };

  const canProceedFromTemplate = () => {
    return documentType && selectedTemplate;
  };

  const canProceedToStep2 = () => {
    return formData.title && formData.grade && formData.medium && formData.subject;
  };

  const canProceedToStep3 = () => {
    return (contentSelectionMode === 'chapters' && formData.chapters.length > 0) ||
           (contentSelectionMode === 'learningOutcomes' && formData.learningOutcomes.length > 0);
  };

  const canProceedToStep4 = () => {
    return formData.allowedQuestionTypes.length > 0 && getTotalQuestions() > 0;
  };

  const canGenerate = () => {
    try {
      return canProceedToStep2() && canProceedToStep3() && canProceedToStep4() &&
             (!formData.totalMarks || formData.duration);
    } catch (error) {
      console.error('Error in canGenerate validation:', error);
      return false;
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleQuestionTypeChange = (questionType: QuestionType, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      allowedQuestionTypes: checked 
        ? [...prev.allowedQuestionTypes, questionType]
        : prev.allowedQuestionTypes.filter(type => type !== questionType)
    }));
  };

  const handleBloomChange = (level: keyof typeof BloomLevels, value: number[]) => {
    const fieldName = `bloom${level}` as keyof typeof formData;
    setFormData(prev => ({
      ...prev,
      [fieldName]: value[0]
    }));
  };

  const addCustomHeader = () => {
    setFormData(prev => ({
      ...prev,
      customHeaders: [...prev.customHeaders, '']
    }));
  };

  const updateCustomHeader = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      customHeaders: prev.customHeaders.map((header, i) => i === index ? value : header)
    }));
  };

  const removeCustomHeader = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customHeaders: prev.customHeaders.filter((_, i) => i !== index)
    }));
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
                <CardTitle className="text-xl">
                  Create {documentType === 'assessment' ? 'Assessment' : 'Practice Worksheet'}
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Configure your assessment settings
                </p>
              </div>
              <Badge variant="outline" className="text-sm">
                Step {currentStep + 1} of {totalSteps}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className={currentStep >= 0 ? "text-primary font-medium" : "text-muted-foreground"}>Template</span>
                <span className={currentStep >= 1 ? "text-primary font-medium" : "text-muted-foreground"}>Setup</span>
                <span className={currentStep >= 2 ? "text-primary font-medium" : "text-muted-foreground"}>Content</span>
                <span className={currentStep >= 3 ? "text-primary font-medium" : "text-muted-foreground"}>Questions</span>
                <span className={currentStep >= 4 ? "text-primary font-medium" : "text-muted-foreground"}>Configure</span>
                <span className={currentStep >= 5 ? "text-primary font-medium" : "text-muted-foreground"}>Review</span>
              </div>
              <Progress value={stepProgress} className="h-2" />
            </div>
          </CardHeader>
        </Card>

        {/* Step 0: Template Selection */}
        {currentStep === 0 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</div>
                <span>Choose Template</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Document Type Selection */}
              <div className="space-y-4">
                <Label className="text-base font-medium">What would you like to create?</Label>
                <RadioGroup value={documentType} onValueChange={(value: 'assessment' | 'worksheet') => {
                  setDocumentType(value);
                  setSelectedTemplate('');
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 border rounded-lg cursor-pointer ${
                      documentType === 'assessment' ? 'border-primary bg-primary/5' : ''
                    }`} onClick={() => setDocumentType('assessment')}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="assessment" id="assessment" />
                        <FileText className="w-5 h-5" />
                        <Label htmlFor="assessment" className="cursor-pointer font-medium">Assessment</Label>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Create formal assessments with grading and time limits
                      </p>
                    </div>
                    <div className={`p-4 border rounded-lg cursor-pointer ${
                      documentType === 'worksheet' ? 'border-primary bg-primary/5' : ''
                    }`} onClick={() => setDocumentType('worksheet')}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="worksheet" id="worksheet" />
                        <BookOpen className="w-5 h-5" />
                        <Label htmlFor="worksheet" className="cursor-pointer font-medium">Practice Worksheet</Label>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Create practice sheets for homework and skill building
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* Template Selection */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <PieChart className="w-5 h-5 text-blue-600" />
                  <Label className="text-base font-medium">Choose a Template</Label>
                  <Badge variant="secondary" className="text-xs">Required</Badge>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {assessmentTemplates[documentType].map(template => (
                    <div key={template.name} className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-primary/50 ${
                      selectedTemplate === template.name ? 'border-primary bg-primary/5' : ''
                    }`} onClick={() => {
                      setSelectedTemplate(template.name);
                      applyTemplate(template.name);
                    }}>
                      <div className="space-y-2">
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-muted-foreground">{template.description}</div>
                        <div className="flex justify-between items-center text-xs">
                          <span>{template.totalQuestions} questions</span>
                          <Badge variant={template.mode === 'SA' ? 'default' : 'secondary'} className="text-xs">
                            {template.mode}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Types: {template.questionTypes.map(type => QuestionTypeLabels[type]).join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedTemplate && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Template "{selectedTemplate}" selected. This will pre-configure your {documentType} settings.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={nextStep}
                  disabled={!canProceedFromTemplate()}
                  className="flex items-center space-x-2"
                >
                  <span>Next: Basic Information</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</div>
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selected Template Info */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Selected Template: {selectedTemplate}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {documentType === 'assessment' ? 'Assessment' : 'Worksheet'} • {getTotalQuestions()} questions • {formData.mode}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center space-x-1">
                    <span>{documentType === 'assessment' ? 'Assessment' : 'Worksheet'} Title</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder={`e.g., ${documentType === 'assessment' ? 'Science Unit Test' : 'Math Practice Sheet'}`}
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grade" className="flex items-center space-x-1">
                      <span>Grade Level</span>
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.grade} onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
                          <SelectItem key={grade} value={grade.toString()}>
                            Grade {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medium">Language Medium</Label>
                    <Select value={formData.medium} onValueChange={(value) => setFormData(prev => ({ ...prev, medium: value }))}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Hindi">Hindi</SelectItem>
                        <SelectItem value="Tamil">Tamil</SelectItem>
                        <SelectItem value="Bengali">Bengali</SelectItem>
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
                        <SelectItem value="Social Studies">Social Studies</SelectItem>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                        <SelectItem value="Biology">Biology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep} className="flex items-center space-x-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
                <Button 
                  onClick={nextStep}
                  disabled={!canProceedToStep2()}
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
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</div>
                <span>Content Selection</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ChapterLOSelector
                selectedChapters={formData.chapters}
                selectedLearningOutcomes={formData.learningOutcomes}
                onChapterChange={(chapters) => setFormData(prev => ({ ...prev, chapters }))}
                onLearningOutcomeChange={(outcomes) => setFormData(prev => ({ ...prev, learningOutcomes: outcomes }))}
                mode={contentSelectionMode}
                onModeChange={setContentSelectionMode}
              />

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep} className="flex items-center space-x-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
                <Button 
                  onClick={nextStep}
                  disabled={!canProceedToStep3()}
                  className="flex items-center space-x-2"
                >
                  <span>Next: Question Setup</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Question Setup */}
        {currentStep === 3 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">4</div>
                <span>Question Setup</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Allowed Question Types */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Allowed Question Types</Label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(QuestionTypeLabels).map(([type, label]) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={formData.allowedQuestionTypes.includes(type as QuestionType)}
                        onCheckedChange={(checked) => handleQuestionTypeChange(type as QuestionType, !!checked)}
                      />
                      <Label htmlFor={type} className="cursor-pointer">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Bloom's Taxonomy Distribution */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Bloom's Taxonomy Distribution</Label>
                <p className="text-sm text-muted-foreground">
                  Specify the number of questions for each Bloom's Taxonomy level.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(BloomLevels).map(([level, label]) => (
                    <div key={level} className="space-y-2">
                      <Label htmlFor={`bloom-${level}`}>{label}</Label>
                      <Input
                        id={`bloom-${level}`}
                        type="number"
                        min="0"
                        value={formData[`bloom${level}` as keyof typeof formData] || 0}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          handleBloomChange(level as keyof typeof BloomLevels, [value]);
                        }}
                        placeholder={`e.g., ${level === 'L1' ? '4' : '2'}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

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
                  <span>Next: Configuration</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Configuration */}
        {currentStep === 4 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">5</div>
                <span>Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Assessment Mode */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Assessment Mode</Label>
                <RadioGroup value={formData.mode} onValueChange={(value: AssessmentMode) => setFormData(prev => ({ ...prev, mode: value }))}>
                  <div className="grid grid-cols-1 gap-4">
                    <div className={`p-4 border rounded-lg cursor-pointer ${
                      formData.mode === 'FA' ? 'border-primary bg-primary/5' : ''
                    }`} onClick={() => setFormData(prev => ({ ...prev, mode: 'FA' }))}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="FA" id="fa" />
                        <Label htmlFor="fa" className="cursor-pointer font-medium">Formative Assessment (FA)/Practice Sheet</Label>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Regular assessments for continuous feedback and improvement.
                      </p>
                    </div>
                    <div className={`p-4 border rounded-lg cursor-pointer ${
                      formData.mode === 'SA' ? 'border-primary bg-primary/5' : ''
                    }`} onClick={() => setFormData(prev => ({ ...prev, mode: 'SA' }))}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="SA" id="sa" />
                        <Label htmlFor="sa" className="cursor-pointer font-medium">Summative Assessment (SA)/Evaluation Sheet</Label>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Comprehensive assessments to evaluate learning outcomes at the end of a unit or term.
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* Marks and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="totalMarks">Total Marks <Badge variant="secondary" className="text-xs ml-1">Optional</Badge></Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    placeholder="e.g., 100"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalMarks: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) {formData.totalMarks ? <span className="text-destructive ml-1">*</span> : <Badge variant="secondary" className="text-xs ml-1">Optional</Badge>}</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="e.g., 90"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    className={formData.totalMarks && !formData.duration ? "border-destructive" : ""}
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep} className="flex items-center space-x-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
                <Button
                  onClick={nextStep}
                  className="flex items-center space-x-2"
                  disabled={!canGenerate()}
                >
                  <span>Next: Preview</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Preview */}
        {currentStep === 5 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">6</div>
                <span>Final Review</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Assessment Summary</Label>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div><strong>Title:</strong> {formData.title}</div>
                  <div><strong>Grade:</strong> {formData.grade}</div>
                  <div><strong>Subject:</strong> {formData.subject}</div>
                  <div><strong>Total Questions:</strong> {getTotalQuestions()}</div>
                  <div><strong>Assessment Mode:</strong> {formData.mode}</div>
                  {formData.totalMarks && <div><strong>Total Marks:</strong> {formData.totalMarks}</div>}
                  {formData.duration && <div><strong>Duration:</strong> {formData.duration} minutes</div>}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep} className="flex items-center space-x-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
                <Button
                  className="flex items-center space-x-2"
                  disabled={!canGenerate()}
                  onClick={handleDownload}
                >
                  <span>Generate {documentType === 'assessment' ? 'Assessment' : 'Worksheet'}</span>
                  <CheckCircle className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Duration Logic Alert */}
        {formData.totalMarks && !formData.duration && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Duration is required when total marks is specified.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Right Panel - Real-time Preview */}
      <div className="overflow-y-auto">
        <PDFPreview
          title={formData.title || 'Assessment Preview'}
          questions={mockQuestions}
          onDownload={handleDownload}
          onQuestionAction={handleQuestionAction}
          documentType={documentType}
        />
      </div>
    </div>
  );
};

export default UnifiedAssessmentCreator;