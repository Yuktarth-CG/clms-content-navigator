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
import { 
  Settings, 
  Calculator, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  Target, 
  CheckCircle, 
  BookTemplate,
  AlertCircle
} from 'lucide-react';
import PDFPreview from './PDFPreview';
import ChapterLOSelector from './ChapterLOSelector';
import { QuestionType, AssessmentMode, QuestionTypeLabels, BloomLevels, Blueprint } from '@/types/assessment';
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
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loadingBlueprints, setLoadingBlueprints] = useState(false);

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
    duration: ''
  });

  const totalSteps = 4;
  const stepProgress = (currentStep / totalSteps) * 100;

  // Fetch blueprints when component mounts
  useEffect(() => {
    fetchBlueprints();
  }, []);

  const fetchBlueprints = async () => {
    setLoadingBlueprints(true);
    try {
      const { data, error } = await supabase
        .from('blueprints')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlueprints((data || []) as Blueprint[]);
    } catch (error) {
      console.error('Error fetching blueprints:', error);
      toast({
        title: "Error",
        description: "Failed to load blueprint templates",
        variant: "destructive"
      });
    } finally {
      setLoadingBlueprints(false);
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

  const applyBlueprint = (blueprintId: string) => {
    const blueprint = blueprints.find(b => b.id === blueprintId);
    if (!blueprint) return;

    setFormData(prev => ({
      ...prev,
      allowedQuestionTypes: blueprint.allowed_question_types,
      bloomL1: blueprint.bloom_l1,
      bloomL2: blueprint.bloom_l2,
      bloomL3: blueprint.bloom_l3,
      bloomL4: blueprint.bloom_l4,
      bloomL5: blueprint.bloom_l5,
      bloomL6: blueprint.bloom_l6,
      mode: blueprint.mode,
      totalMarks: blueprint.total_marks?.toString() || '',
      duration: blueprint.duration?.toString() || ''
    }));

    setSelectedTemplate(blueprintId);
    toast({
      title: "Blueprint Applied",
      description: `Applied "${blueprint.name}" blueprint template`,
    });
  };

  const getTotalQuestions = () => {
    return formData.bloomL1 + formData.bloomL2 + formData.bloomL3 + 
           formData.bloomL4 + formData.bloomL5 + formData.bloomL6;
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

  const handleCreate = async () => {
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
    return formData.allowedQuestionTypes.length > 0 && getTotalQuestions() > 0;
  };

  const hasQuestionCountExceeded = () => {
    const total = getTotalQuestions();
    return total > 100;
  };

  const canGenerate = () => {
    return canProceedToStep2() && canProceedToStep3() && canProceedToStep4() && canProceedToStep5() &&
           !hasQuestionCountExceeded();
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
                <span className={currentStep >= 1 ? "text-primary font-medium" : "text-muted-foreground"}>Configuration</span>
                <span className={currentStep >= 2 ? "text-primary font-medium" : "text-muted-foreground"}>Basic Info</span>
                <span className={currentStep >= 3 ? "text-primary font-medium" : "text-muted-foreground"}>Content</span>
                <span className={currentStep >= 4 ? "text-primary font-medium" : "text-muted-foreground"}>Questions & Generate</span>
              </div>
              <Progress value={stepProgress} className="h-2" />
            </div>
          </CardHeader>
        </Card>

        {/* Step 1: Assessment Configuration */}
        {currentStep === 1 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</div>
                <span>Assessment Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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

              <Separator />

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

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={nextStep}
                  disabled={!canProceedToStep2()}
                  className="flex items-center space-x-2"
                >
                  <span>Next: Basic Information</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Basic Information */}
        {currentStep === 2 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</div>
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          <SelectItem key={grade} value={grade.toString()}>
                            Grade {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medium">Medium</Label>
                    <Select value={formData.medium} onValueChange={(value) => setFormData(prev => ({ ...prev, medium: value }))}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Hindi">Hindi</SelectItem>
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
                  disabled={!canProceedToStep3()}
                  className="flex items-center space-x-2"
                >
                  <span>Next: Content Selection</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Content Selection */}
        {currentStep === 3 && (
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
                  <span>Next: Question Setup</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Question Setup */}
        {currentStep === 4 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">4</div>
                <span>Question Setup & Generate</span>
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
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Questions: {getTotalQuestions()}
                </div>
              </div>

              {hasQuestionCountExceeded() && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Question count exceeds 100. Please reduce the number of questions.
                  </AlertDescription>
                </Alert>
              )}

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
        />
      </div>
    </div>
  );
};

export default CustomisedGeneration;