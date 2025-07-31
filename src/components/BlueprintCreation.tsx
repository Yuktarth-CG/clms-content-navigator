import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Save, AlertTriangle, CheckCircle, ArrowRight, Search } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Blueprint, UnitDistribution, QuestionTypeDistribution, BloomsTaxonomyLevel, QuestionType, BloomsTaxonomyLabels, QuestionTypeLabels, LanguageSupport } from '@/types/ocr';

interface LearningOutcome {
  id: string;
  code: string;
  grade: number;
  subject: string;
  medium: string;
  chapter: string;
  topic: string;
  name: string;
  description: string;
}

interface Chapter {
  id: string;
  name: string;
  description: string;
  grade: number;
  subject: string;
  medium: string;
  questionCounts: {
    easy: number;
    medium: number;
    hard: number;
  };
  totalQuestions: number;
}

// Mock LO data based on the image
const mockLearningOutcomes: LearningOutcome[] = [
  {
    id: 'lo1',
    code: 'UPM514',
    grade: 5,
    subject: 'Maths',
    medium: 'Hindi',
    chapter: 'क्षेत्रफल | Area',
    topic: 'शब्द समस्याएं | Word Problems',
    name: 'UPM514',
    description: 'M511-बच्चे एक वर्ग की परिधि, त्रिज्या और व्यास ज्ञात कर सकते हैं और वर्ग, आयत का क्षेत्रफल ज्ञात कर सकते हैं । इसके अतिरिक्त बच्चे 3D आकृतियों का आयतन निकाल पाते हैं।'
  },
  {
    id: 'lo2',
    code: 'UPM813',
    grade: 8,
    subject: 'Maths',
    medium: 'Hindi',
    chapter: 'बैंकिंग | Banking',
    topic: 'बैंक | Bank',
    name: 'UPM813',
    description: 'M812-बच्चा बैंकिंग संबंधी सामान्य जानकारी रखता है।'
  },
  {
    id: 'lo3',
    code: 'MPB1207',
    grade: 12,
    subject: 'Biology',
    medium: 'English',
    chapter: 'Ecosystem',
    topic: 'Ecosystem Structure',
    name: 'MPB1207',
    description: 'पारितंत्र संरचना एवं क्रियाशीलता, उत्पादकता, अपaghटन के बारे में जानना ।'
  },
  {
    id: 'lo4',
    code: 'FLNM172',
    grade: 1,
    subject: 'Maths',
    medium: 'English',
    chapter: 'Shapes and Space',
    topic: 'Use spatial words (above and below)',
    name: 'FLNM172',
    description: 'Uses spatial words like top, bottom, on, under, inside, outside, above, below, near, far, before, after, right, left, and middle'
  },
  {
    id: 'lo5',
    code: 'HPS327',
    grade: 3,
    subject: 'EVS',
    medium: 'English',
    chapter: 'Foods We Eat',
    topic: 'Identify on the basis of features',
    name: 'HPS327',
    description: 'Describes need of food for people of different age groups; animals and birds, availability of food and water and use of water at home and surroundings'
  }
];

// Mock chapters data based on the uploaded image
const mockChapters: Chapter[] = [
  {
    id: 'ch1',
    name: 'Lorem ipsum dolor sit amet, consectetur Lorem ipsum dolor sit amet',
    description: 'Chapter about basic mathematical concepts',
    grade: 5,
    subject: 'Mathematics',
    medium: 'Hindi',
    questionCounts: { easy: 13, medium: 12, hard: 10 },
    totalQuestions: 35
  },
  {
    id: 'ch2', 
    name: 'Lorem ipsum dolor sit amet, consectetur Lorem ipsum dolor sit amet',
    description: 'Chapter about algebra and basic operations',
    grade: 5,
    subject: 'Mathematics', 
    medium: 'Hindi',
    questionCounts: { easy: 13, medium: 12, hard: 10 },
    totalQuestions: 35
  },
  {
    id: 'ch3',
    name: 'Lorem ipsum dolor sit amet, consectetur Lorem ipsum dolor sit amet', 
    description: 'Chapter about geometry and shapes',
    grade: 5,
    subject: 'Mathematics',
    medium: 'Hindi',
    questionCounts: { easy: 13, medium: 12, hard: 10 },
    totalQuestions: 35
  },
  {
    id: 'ch4',
    name: 'Lorem ipsum dolor sit amet, consectetur Lorem ipsum dolor sit amet',
    description: 'Chapter about fractions and decimals',
    grade: 5,
    subject: 'Mathematics',
    medium: 'Hindi', 
    questionCounts: { easy: 13, medium: 12, hard: 10 },
    totalQuestions: 35
  },
  {
    id: 'ch5',
    name: 'Lorem ipsum dolor sit amet, consectetur Lorem ipsum dolor sit amet',
    description: 'Chapter about word problems',
    grade: 5,
    subject: 'Mathematics',
    medium: 'Hindi',
    questionCounts: { easy: 13, medium: 12, hard: 10 },
    totalQuestions: 35
  },
  {
    id: 'ch6',
    name: 'Lorem ipsum dolor sit amet, consectetur Lorem ipsum dolor sit amet',
    description: 'Chapter about measurement and time',
    grade: 5,
    subject: 'Mathematics',
    medium: 'Hindi',
    questionCounts: { easy: 13, medium: 12, hard: 10 },
    totalQuestions: 35
  },
  {
    id: 'ch7',
    name: 'Lorem ipsum dolor sit amet, consectetur Lorem ipsum dolor sit amet',
    description: 'Chapter about data handling',
    grade: 5,
    subject: 'Mathematics',
    medium: 'Hindi',
    questionCounts: { easy: 13, medium: 12, hard: 10 },
    totalQuestions: 35
  }
];

interface EnhancedQuestionTypeDistribution extends QuestionTypeDistribution {
  bloomsLevel?: BloomsTaxonomyLevel;
}

interface BlueprintCreationProps {
  supportedLanguages: LanguageSupport[];
  onSave: (blueprint: Blueprint) => void;
  onLoad: (blueprintId: string) => void;
  onProceed?: () => void;
  savedBlueprints: Blueprint[];
  initialBlueprint?: Partial<Blueprint>;
  sourceType?: 'csv' | 'clms-library'; // New prop to determine question type filtering
}

const BlueprintCreation: React.FC<BlueprintCreationProps> = ({
  supportedLanguages,
  onSave,
  onLoad,
  onProceed,
  savedBlueprints,
  initialBlueprint,
  sourceType = 'csv' // Default to csv if not provided
}) => {
  const [blueprint, setBlueprint] = useState<Partial<Blueprint>>({
    name: '',
    description: '',
    courseCode: '',
    courseName: '',
    duration: 90,
    totalMarks: 35,
    language: 'hindi',
    unitDistribution: [],
    bloomsDistribution: [],
    questionTypeDistribution: [],
    ...initialBlueprint
  });

  const [selectedBlueprint, setSelectedBlueprint] = useState<string>('');
  const [enhancedQuestionTypes, setEnhancedQuestionTypes] = useState<EnhancedQuestionTypeDistribution[]>([]);
  const [currentStep, setCurrentStep] = useState<'basic' | 'units' | 'questions'>('basic');
  const [isLoadedBlueprint, setIsLoadedBlueprint] = useState<boolean>(false);
  const [selectionMode, setSelectionMode] = useState<'chapters' | 'los'>('chapters');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [chapterSearchTerm, setChapterSearchTerm] = useState<string>('');
  const [showSelectedOnly, setShowSelectedOnly] = useState<boolean>(false);

  // Calculate total marks from units
  const totalUnitsMarks = blueprint.unitDistribution?.reduce((sum, unit) => sum + (unit.marks || 0), 0) || 0;
  
  // Calculate total marks from question types
  const totalQuestionMarks = enhancedQuestionTypes.reduce((sum, qType) => sum + (qType.totalMarks || 0), 0);

  useEffect(() => {
    // Auto-calculate total marks for question types
    setEnhancedQuestionTypes(prev => 
      prev.map(qType => ({
        ...qType,
        totalMarks: (qType.totalCount || 0) * (qType.marksPerQuestion || 0)
      }))
    );
  }, [enhancedQuestionTypes.length]);

  const addUnitDistribution = () => {
    setBlueprint(prev => ({
      ...prev,
      unitDistribution: [
        ...(prev.unitDistribution || []),
        {
          loCode: '',
          unitName: '',
          marks: 0,
          questionTypes: []
        }
      ]
    }));
  };

  const updateUnitDistribution = (index: number, field: keyof UnitDistribution, value: any) => {
    setBlueprint(prev => ({
      ...prev,
      unitDistribution: prev.unitDistribution?.map((unit, i) => {
        if (i === index) {
          if (field === 'loCode') {
            const selectedLO = mockLearningOutcomes.find(lo => lo.code === value);
            return { 
              ...unit, 
              [field]: value,
              unitName: selectedLO ? `${selectedLO.chapter} - ${selectedLO.topic}` : ''
            };
          }
          return { ...unit, [field]: value };
        }
        return unit;
      }) || []
    }));
  };

  const removeUnitDistribution = (index: number) => {
    setBlueprint(prev => ({
      ...prev,
      unitDistribution: prev.unitDistribution?.filter((_, i) => i !== index) || []
    }));
  };

  const addQuestionTypeDistribution = () => {
    setEnhancedQuestionTypes(prev => [
      ...prev,
      {
        type: 'VSA',
        totalCount: 0,
        totalMarks: 0,
        marksPerQuestion: 1,
        bloomsLevel: 1
      }
    ]);
  };

  const updateQuestionTypeDistribution = (index: number, field: keyof EnhancedQuestionTypeDistribution, value: any) => {
    setEnhancedQuestionTypes(prev => 
      prev.map((qType, i) => {
        if (i === index) {
          const updated = { ...qType, [field]: value };
          if (field === 'totalCount' || field === 'marksPerQuestion') {
            updated.totalMarks = (updated.totalCount || 0) * (updated.marksPerQuestion || 0);
          }
          return updated;
        }
        return qType;
      })
    );
  };

  const removeQuestionTypeDistribution = (index: number) => {
    setEnhancedQuestionTypes(prev => prev.filter((_, i) => i !== index));
  };

  
  // Filter question types based on source type
  const getAvailableQuestionTypes = () => {
    if (sourceType === 'clms-library') {
      // Only MCQ and Reading Comprehension for CLMS Library
      return Object.entries(QuestionTypeLabels).filter(([type]) => 
        type === 'MCQ' || type === 'RC'
      );
    }
    // All question types for CSV upload
    return Object.entries(QuestionTypeLabels);
  };

  const handleSave = () => {
    if (!blueprint.name || !blueprint.courseName || isLoadedBlueprint) return;
    
    // Convert enhanced question types to regular format for blueprint
    const questionTypeDistribution = enhancedQuestionTypes.map(({ bloomsLevel, ...rest }) => rest);
    
    const completeBlueprint: Blueprint = {
      ...blueprint,
      id: `bp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user',
      updatedAt: new Date().toISOString(),
      questionTypeDistribution
    } as Blueprint;
    
    onSave(completeBlueprint);
  };

  const handleLoad = (blueprintId: string) => {
    setSelectedBlueprint(blueprintId);
    setIsLoadedBlueprint(true);
    onLoad(blueprintId);
    const loadedBlueprint = savedBlueprints.find(bp => bp.id === blueprintId);
    if (loadedBlueprint) {
      setBlueprint(loadedBlueprint);
      // Convert loaded question types to enhanced format
      setEnhancedQuestionTypes(loadedBlueprint.questionTypeDistribution?.map(qType => ({
        ...qType,
        bloomsLevel: 1 // Default Bloom's level
      })) || []);
    }
  };

  const canProceedToUnits = () => {
    return blueprint.name && blueprint.courseName && blueprint.totalMarks;
  };

  const canProceedToQuestions = () => {
    return blueprint.unitDistribution && blueprint.unitDistribution.length > 0 && 
           blueprint.unitDistribution.every(unit => unit.loCode && unit.marks > 0);
  };

  const renderBasicStep = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Assessment Details - Takes up 2 columns */}
        <div className="xl:col-span-2">
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-primary">📋 Assessment Blueprint Details</CardTitle>
              <p className="text-sm text-muted-foreground">Set up the basic information for your test paper</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Assessment Name & Description */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Assessment Blueprint Name (Header 1) <span className="text-destructive">*</span></Label>
                  <Input
                    value={blueprint.name}
                    onChange={(e) => setBlueprint(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Grade 9 Mathematics Mid-term Assessment"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">💡 This will appear as the main title on your test paper</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Assessment Description</Label>
                  <Textarea
                    value={blueprint.description}
                    onChange={(e) => setBlueprint(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description to help other teachers understand when to use this template"
                    rows={2}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">📝 Internal note - won't appear on the test paper</p>
                </div>
              </div>

              {/* Class & Subject Information */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-base mb-4 text-primary">🎓 Class & Subject Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Class Name (Header 2) <span className="text-destructive">*</span></Label>
                    <Input
                      value={blueprint.courseCode}
                      onChange={(e) => setBlueprint(prev => ({ ...prev, courseCode: e.target.value }))}
                      placeholder="e.g., Class 9-A, Grade 10"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">📚 Will appear below the main title</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Subject Name (Header 3) <span className="text-destructive">*</span></Label>
                    <Input
                      value={blueprint.courseName}
                      onChange={(e) => setBlueprint(prev => ({ ...prev, courseName: e.target.value }))}
                      placeholder="e.g., Mathematics, Science, English"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">📖 Subject name for the test paper</p>
                  </div>
                </div>
              </div>

              {/* Exam Settings */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-base mb-4 text-primary">⏱️ Exam Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={blueprint.duration}
                      onChange={(e) => setBlueprint(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      placeholder="90"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">⏰ How long students have to complete</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Total Marks</Label>
                    <Input
                      type="number"
                      value={blueprint.totalMarks}
                      onChange={(e) => setBlueprint(prev => ({ ...prev, totalMarks: parseInt(e.target.value) }))}
                      placeholder="100"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">🏆 Maximum score possible</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Language</Label>
                    <Select 
                      value={blueprint.language} 
                      onValueChange={(value) => setBlueprint(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        {supportedLanguages.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.nativeName} ({lang.name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">🌐 Test paper language</p>
                  </div>
                </div>
              </div>

              {/* Layout Template */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-base mb-4 text-primary">🎨 Paper Layout</h4>
                <div>
                  <Label className="text-sm font-medium">Layout Template</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose how your test paper will look" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      <SelectItem value="standard">📄 Standard Layout - Traditional format</SelectItem>
                      <SelectItem value="compact">📋 Compact Layout - More questions per page</SelectItem>
                      <SelectItem value="detailed">📝 Detailed Layout - Extra space for answers</SelectItem>
                      <SelectItem value="bilingual">🌏 Bilingual Layout - Two language support</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">🖼️ Controls the overall appearance and spacing of your test paper</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Load Saved Blueprint - Sidebar */}
        <div className="xl:col-span-1">
          <Card className="h-fit sticky top-4">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-primary">💾 Load Saved Blueprint</CardTitle>
              <p className="text-sm text-muted-foreground">Use a previously created template</p>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="text-sm font-medium">Select Saved Blueprint</Label>
                <Select value={selectedBlueprint} onValueChange={handleLoad}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose from your saved templates" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    {savedBlueprints.map(bp => (
                      <SelectItem key={bp.id} value={bp.id}>
                        {bp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">📂 Previously saved assessment templates</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Advanced Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Barcode Configuration */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-primary">📊 Barcode Configuration</CardTitle>
            <p className="text-sm text-muted-foreground">Add tracking codes to your test paper (optional)</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Top Left Barcode</Label>
                <Input placeholder="e.g., MATH001" className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">🔍 Appears in top-left corner</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Top Right Barcode</Label>
                <Input placeholder="e.g., V1.0" className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">🔍 Appears in top-right corner</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Bottom Left Barcode</Label>
                <Input placeholder="e.g., SCH001" className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">🔍 Appears in bottom-left corner</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Bottom Right Barcode</Label>
                <Input placeholder="e.g., 2024-Q1" className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">🔍 Appears in bottom-right corner</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Information */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-primary">👥 Student Information Section</CardTitle>
                <p className="text-sm text-muted-foreground">Add fields for student details on the test paper</p>
              </div>
              <Switch id="student-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-50">
              <div>
                <Label className="text-sm font-medium">Student Name Label</Label>
                <Input placeholder="Student Name" disabled className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">👤 Label for name field</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Student Section Label</Label>
                <Input placeholder="Section" disabled className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">🏫 Label for section field</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Student Roll Label</Label>
                <Input placeholder="Roll No." disabled className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">🎫 Label for roll number</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Student ID Box Count</Label>
                <Input type="number" min="5" max="20" placeholder="10" disabled className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">📦 Number of boxes (5-20)</p>
              </div>
            </div>
            
            <div className="mt-4 opacity-50">
              <Label className="text-sm font-medium">Instructions for Students</Label>
              <Textarea 
                placeholder="Fill in your details clearly in the boxes above..."
                disabled
                rows={2}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">📋 Instructions that appear with student info section</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="flex items-center space-x-2">
          {!canProceedToUnits() && (
            <Alert className="max-w-md">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Complete required fields (marked with *) to continue
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={!blueprint.name || !blueprint.courseName || isLoadedBlueprint}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Template</span>
          </Button>
          
          <Button
            onClick={() => setCurrentStep('units')}
            disabled={!canProceedToUnits()}
            className="flex items-center space-x-2"
          >
            <span>Next: Choose Course Content</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  // Filter chapters based on search term and selected only option
  const filteredChapters = mockChapters.filter(chapter => {
    const matchesSearch = chapter.name.toLowerCase().includes(chapterSearchTerm.toLowerCase()) ||
                         chapter.description.toLowerCase().includes(chapterSearchTerm.toLowerCase());
    const matchesSelectedFilter = !showSelectedOnly || selectedChapters.includes(chapter.id);
    return matchesSearch && matchesSelectedFilter;
  });

  const handleChapterSelection = (chapterId: string, checked: boolean) => {
    setSelectedChapters(prev => 
      checked 
        ? [...prev, chapterId]
        : prev.filter(id => id !== chapterId)
    );
  };

  const renderChapterSelection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Chapters</h3>
          <p className="text-sm text-muted-foreground">
            Total Chapters selected: <span className="font-medium text-foreground">{selectedChapters.length}</span>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-selected"
            checked={showSelectedOnly}
            onCheckedChange={(checked) => setShowSelectedOnly(checked as boolean)}
          />
          <Label htmlFor="show-selected" className="text-sm">Show selected chapters</Label>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search here"
          value={chapterSearchTerm}
          onChange={(e) => setChapterSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredChapters.map((chapter) => (
          <div key={chapter.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
            <Checkbox
              id={`chapter-${chapter.id}`}
              checked={selectedChapters.includes(chapter.id)}
              onCheckedChange={(checked) => handleChapterSelection(chapter.id, checked as boolean)}
            />
            <div className="flex-1 min-w-0">
              <Label htmlFor={`chapter-${chapter.id}`} className="cursor-pointer">
                <div className="font-medium truncate">{chapter.name}</div>
              </Label>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <span className="text-muted-foreground">Questions:</span>
                <span className="font-medium">{chapter.totalQuestions}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  Easy: {chapter.questionCounts.easy}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Medium: {chapter.questionCounts.medium}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Hard: {chapter.questionCounts.hard}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLOSelection = () => (
    <div className="space-y-4">
      {blueprint.unitDistribution?.map((unit, index) => (
        <div key={index} className="border rounded-lg p-4">
          <div className="grid grid-cols-12 gap-2 items-center mb-3">
            <div className="col-span-5">
              <Label className="text-xs text-gray-600">Learning Outcome (LO)</Label>
              <Select 
                value={unit.loCode} 
                onValueChange={(value) => updateUnitDistribution(index, 'loCode', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Learning Outcome" />
                </SelectTrigger>
                <SelectContent>
                  {mockLearningOutcomes.map(lo => (
                    <SelectItem key={lo.id} value={lo.code}>
                      <div>
                        <div className="font-medium">{lo.code}</div>
                        <div className="text-sm text-gray-600">
                          Grade {lo.grade} • {lo.subject} • {lo.medium}
                        </div>
                        <div className="text-xs text-gray-500">
                          {lo.chapter} - {lo.topic}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-4">
              <Label className="text-xs text-gray-600">Unit Name (Auto-populated)</Label>
              <Input
                placeholder="Unit Name"
                value={unit.unitName}
                onChange={(e) => updateUnitDistribution(index, 'unitName', e.target.value)}
                className="bg-gray-50"
              />
            </div>
            
            <div className="col-span-2">
              <Label className="text-xs text-gray-600">Marks</Label>
              <Input
                type="number"
                placeholder="Marks"
                value={unit.marks}
                onChange={(e) => updateUnitDistribution(index, 'marks', parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
            
            <div className="col-span-1">
              <Button variant="outline" size="sm" onClick={() => removeUnitDistribution(index)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {unit.loCode && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              {(() => {
                const selectedLO = mockLearningOutcomes.find(lo => lo.code === unit.loCode);
                return selectedLO ? (
                  <div className="text-sm">
                    <div className="font-semibold text-blue-800 mb-1">
                      {selectedLO.name} - {selectedLO.topic}
                    </div>
                    <div className="text-blue-700 mb-2">
                      Grade {selectedLO.grade} | {selectedLO.subject} | {selectedLO.medium} | {selectedLO.chapter}
                    </div>
                    <div className="text-blue-600 text-xs">
                      {selectedLO.description}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderUnitsStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Unit-wise Distribution</CardTitle>
            {selectionMode === 'los' && (
              <Button variant="outline" size="sm" onClick={addUnitDistribution}>
                <Plus className="w-4 h-4 mr-2" />
                Add Unit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectionMode} onValueChange={(value) => setSelectionMode(value as 'chapters' | 'los')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="chapters">Choose by Chapters</TabsTrigger>
              <TabsTrigger value="los">Choose by LOs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chapters">
              {renderChapterSelection()}
            </TabsContent>
            
            <TabsContent value="los">
              {renderLOSelection()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Marks validation alert */}
      {totalUnitsMarks !== blueprint.totalMarks && blueprint.unitDistribution && blueprint.unitDistribution.length > 0 && (
        <Alert variant={totalUnitsMarks < (blueprint.totalMarks || 0) ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unit marks total ({totalUnitsMarks}) {totalUnitsMarks < (blueprint.totalMarks || 0) ? 'is less than' : 'does not match'} the blueprint total marks ({blueprint.totalMarks}). 
            {totalUnitsMarks < (blueprint.totalMarks || 0) && ' Please add more units or increase marks.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Success alert */}
      {totalUnitsMarks === blueprint.totalMarks && blueprint.unitDistribution && blueprint.unitDistribution.length > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Perfect! Unit marks total ({totalUnitsMarks}) matches the blueprint total marks.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex space-x-4">
        <Button variant="outline" onClick={() => setCurrentStep('basic')} className="flex-1">
          Back: Basic Info
        </Button>
        <Button 
          onClick={() => setCurrentStep('questions')} 
          disabled={!canProceedToQuestions()}
          className="flex-1"
        >
          Next: Question Types
        </Button>
      </div>
    </div>
  );

  const renderQuestionsStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Question Type Distribution</CardTitle>
            <Button variant="outline" size="sm" onClick={addQuestionTypeDistribution}>
              <Plus className="w-4 h-4 mr-2" />
              Add Question Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {enhancedQuestionTypes.map((qType, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-lg">
                <div className="col-span-2">
                  <Label className="text-xs text-gray-600">Question Type</Label>
                  <Select 
                    value={qType.type} 
                    onValueChange={(value) => updateQuestionTypeDistribution(index, 'type', value as QuestionType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableQuestionTypes().map(([type, label]) => (
                        <SelectItem key={type} value={type}>
                          {type} - {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label className="text-xs text-gray-600">Bloom's Level</Label>
                  <Select 
                    value={qType.bloomsLevel?.toString()} 
                    onValueChange={(value) => updateQuestionTypeDistribution(index, 'bloomsLevel', parseInt(value) as BloomsTaxonomyLevel)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(BloomsTaxonomyLabels).map(([level, label]) => (
                        <SelectItem key={level} value={level}>
                          L{level}: {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2">
                  <Label className="text-xs text-gray-600">Question Count</Label>
                  <Input
                    type="number"
                    placeholder="Count"
                    value={qType.totalCount}
                    onChange={(e) => updateQuestionTypeDistribution(index, 'totalCount', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label className="text-xs text-gray-600">Marks per Question</Label>
                  <Input
                    type="number"
                    placeholder="Marks/Q"
                    value={qType.marksPerQuestion}
                    onChange={(e) => updateQuestionTypeDistribution(index, 'marksPerQuestion', parseInt(e.target.value) || 0)}
                    min="1"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label className="text-xs text-gray-600">Total Marks</Label>
                  <Input
                    type="number"
                    placeholder="Total Marks"
                    value={qType.totalMarks}
                    className="bg-gray-50"
                    readOnly
                  />
                </div>
                
                <div className="col-span-2">
                  <Button variant="outline" size="sm" onClick={() => removeQuestionTypeDistribution(index)} className="w-full">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Question marks validation alert */}
      {totalQuestionMarks !== blueprint.totalMarks && enhancedQuestionTypes.length > 0 && (
        <Alert variant={totalQuestionMarks < (blueprint.totalMarks || 0) ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Question type marks total ({totalQuestionMarks}) {totalQuestionMarks < (blueprint.totalMarks || 0) ? 'is less than' : 'does not match'} the blueprint total marks ({blueprint.totalMarks}). 
            {totalQuestionMarks < (blueprint.totalMarks || 0) && ' Please add more question types or increase marks.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Success alert */}
      {totalQuestionMarks === blueprint.totalMarks && enhancedQuestionTypes.length > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Perfect! Question type marks total ({totalQuestionMarks}) matches the blueprint total marks.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex space-x-4">
        <Button variant="outline" onClick={() => setCurrentStep('units')} className="flex-1">
          Back: Units
        </Button>
        {!isLoadedBlueprint && (
          <Button onClick={handleSave} disabled={!blueprint.name || !blueprint.courseName} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save Blueprint
          </Button>
        )}
        {isLoadedBlueprint && onProceed && (
          <Button onClick={onProceed} className="flex-1">
            <ArrowRight className="w-4 h-4 mr-2" />
            Proceed to Test Paper Creation
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center space-x-4 mb-6">
        <div className={`flex items-center space-x-2 ${currentStep === 'basic' ? 'text-blue-600' : currentStep === 'units' || currentStep === 'questions' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'basic' ? 'bg-blue-100 text-blue-600' : currentStep === 'units' || currentStep === 'questions' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
            1
          </div>
          <span className="font-medium">Basic Info</span>
        </div>
        <div className={`w-4 h-0.5 ${currentStep === 'units' || currentStep === 'questions' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
        <div className={`flex items-center space-x-2 ${currentStep === 'units' ? 'text-blue-600' : currentStep === 'questions' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'units' ? 'bg-blue-100 text-blue-600' : currentStep === 'questions' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
            2
          </div>
          <span className="font-medium">Units</span>
        </div>
        <div className={`w-4 h-0.5 ${currentStep === 'questions' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
        <div className={`flex items-center space-x-2 ${currentStep === 'questions' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'questions' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
            3
          </div>
          <span className="font-medium">Questions</span>
        </div>
      </div>

      {currentStep === 'basic' && renderBasicStep()}
      {currentStep === 'units' && renderUnitsStep()}
      {currentStep === 'questions' && renderQuestionsStep()}

      {/* Summary */}
      {currentStep === 'questions' && (
        <div className="text-sm text-gray-500 text-center">
          {enhancedQuestionTypes.reduce((sum, q) => sum + (q.totalCount || 0), 0)} total questions • {' '}
          {totalQuestionMarks} total marks • {' '}
          {blueprint.unitDistribution?.length || 0} units selected
        </div>
      )}
    </div>
  );
};

export default BlueprintCreation;
