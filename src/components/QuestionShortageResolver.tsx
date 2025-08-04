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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Save, AlertCircle, CheckCircle2, Library, PlusCircle, BookOpen, X } from 'lucide-react';
import { QuestionType, QuestionShortage, ManualQuestion, QuestionTypeLabels } from '@/types/assessment';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

interface DraftQuestion {
  id: string;
  questionType: QuestionType;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  bloomLevel: number;
  marks: number;
  createdBy: string;
  createdAt: string;
  status: 'draft';
}

interface QuestionShortageResolverProps {
  open: boolean;
  shortages: QuestionShortage[];
  onSave: (questions: ManualQuestion[]) => void;
  onCancel: () => void;
}

const QuestionShortageResolver: React.FC<QuestionShortageResolverProps> = ({
  open,
  shortages,
  onSave,
  onCancel
}) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('draft');
  const [selectedDraftQuestions, setSelectedDraftQuestions] = useState<DraftQuestion[]>([]);
  const [manualQuestions, setManualQuestions] = useState<ManualQuestion[]>([]);
  const [draftQuestions, setDraftQuestions] = useState<DraftQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<ManualQuestion>>({
    questionType: shortages[0]?.questionType || 'MCQ',
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1
  });

  // Mock draft questions - in real implementation, fetch from API
  useEffect(() => {
    const mockDraftQuestions: DraftQuestion[] = [
      {
        id: 'draft_1',
        questionType: 'MCQ',
        questionText: 'What is the value of x in the equation 2x + 5 = 15?',
        options: ['5', '10', '15', '20'],
        correctAnswer: '5',
        bloomLevel: 2,
        marks: 1,
        createdBy: 'teacher1',
        createdAt: new Date().toISOString(),
        status: 'draft'
      },
      {
        id: 'draft_2',
        questionType: 'FITB',
        questionText: 'The capital of France is ______.',
        correctAnswer: 'Paris',
        bloomLevel: 1,
        marks: 2,
        createdBy: 'teacher2',
        createdAt: new Date().toISOString(),
        status: 'draft'
      },
      {
        id: 'draft_3',
        questionType: 'MCQ',
        questionText: 'Which of the following is a prime number?',
        options: ['4', '6', '9', '7'],
        correctAnswer: '7',
        bloomLevel: 1,
        marks: 1,
        createdBy: 'teacher1',
        createdAt: new Date().toISOString(),
        status: 'draft'
      }
    ];
    setDraftQuestions(mockDraftQuestions);
  }, []);

  const getAvailableDraftQuestions = (type: QuestionType) => {
    return draftQuestions.filter(q => q.questionType === type);
  };

  const getSelectedCountForType = (type: QuestionType) => {
    return selectedDraftQuestions.filter(q => q.questionType === type).length;
  };

  const getManualCountForType = (type: QuestionType) => {
    return manualQuestions.filter(q => q.questionType === type).length;
  };

  const getTotalAddedForType = (type: QuestionType) => {
    return getSelectedCountForType(type) + getManualCountForType(type);
  };

  const getRemainingShortage = (type: QuestionType) => {
    const shortage = shortages.find(s => s.questionType === type);
    const added = getTotalAddedForType(type);
    return shortage ? Math.max(0, shortage.shortage - added) : 0;
  };

  const toggleDraftQuestion = (question: DraftQuestion) => {
    const isSelected = selectedDraftQuestions.some(q => q.id === question.id);
    if (isSelected) {
      setSelectedDraftQuestions(prev => prev.filter(q => q.id !== question.id));
    } else {
      // Check if adding this question would exceed the shortage for this type
      const currentCount = getTotalAddedForType(question.questionType);
      const shortage = shortages.find(s => s.questionType === question.questionType);
      if (shortage && currentCount < shortage.shortage) {
        setSelectedDraftQuestions(prev => [...prev, question]);
      } else {
        toast({
          title: "Selection Limit Reached",
          description: `You've already selected enough ${QuestionTypeLabels[question.questionType]} questions.`,
          variant: "destructive"
        });
      }
    }
  };

  const addManualQuestion = () => {
    if (!currentQuestion.questionText) {
      toast({
        title: "Validation Error",
        description: "Please enter the question text",
        variant: "destructive"
      });
      return;
    }

    if (currentQuestion.questionType === 'MCQ' && (!currentQuestion.options || currentQuestion.options.some(opt => !opt.trim()))) {
      toast({
        title: "Validation Error", 
        description: "Please fill all MCQ options",
        variant: "destructive"
      });
      return;
    }

    if (!currentQuestion.correctAnswer) {
      toast({
        title: "Validation Error",
        description: "Please provide the correct answer",
        variant: "destructive"
      });
      return;
    }

    const newQuestion: ManualQuestion = {
      id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      questionType: currentQuestion.questionType as QuestionType,
      questionText: currentQuestion.questionText,
      options: currentQuestion.questionType === 'MCQ' ? currentQuestion.options : undefined,
      correctAnswer: currentQuestion.correctAnswer,
      bloomLevel: 1,
      marks: currentQuestion.marks || 1,
      addedBy: user?.id || '',
      addedAt: new Date().toISOString()
    };

    setManualQuestions([...manualQuestions, newQuestion]);
    
    // Reset form
    setCurrentQuestion({
      questionType: shortages[0]?.questionType || 'MCQ',
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1
    });

    toast({
      title: "Question Added",
      description: "Manual question has been added successfully"
    });
  };

  const removeManualQuestion = (index: number) => {
    setManualQuestions(manualQuestions.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(currentQuestion.options || ['', '', '', ''])];
    newOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions
    });
  };

  const isShortageResolved = () => {
    return shortages.every(shortage => 
      getTotalAddedForType(shortage.questionType) >= shortage.shortage
    );
  };

  const canSave = () => {
    return (selectedDraftQuestions.length > 0 || manualQuestions.length > 0) && isShortageResolved();
  };

  const handleSave = () => {
    // Convert selected draft questions to manual questions format
    const draftAsManual: ManualQuestion[] = selectedDraftQuestions.map(draft => ({
      id: draft.id,
      questionType: draft.questionType,
      questionText: draft.questionText,
      options: draft.options,
      correctAnswer: draft.correctAnswer,
      bloomLevel: draft.bloomLevel,
      marks: draft.marks,
      addedBy: draft.createdBy,
      addedAt: draft.createdAt
    }));

    onSave([...draftAsManual, ...manualQuestions]);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Question Shortage Detected
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            <Alert>
              <BookOpen className="h-4 w-4" />
              <AlertDescription>
                The system couldn&apos;t find enough questions to complete your assessment. You can select from available draft questions or add new questions manually. You can also add questions to the CLMS library for future use.
              </AlertDescription>
            </Alert>

            {/* Shortage Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {shortages.map((shortage) => (
                <Card key={shortage.questionType} className="border-orange-200 dark:border-orange-800">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Badge variant="outline" className="mb-2">
                        {QuestionTypeLabels[shortage.questionType]}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        Need: {shortage.shortage} more
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Selected: {getTotalAddedForType(shortage.questionType)}
                      </div>
                      <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                        Remaining: {getRemainingShortage(shortage.questionType)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="draft" className="flex items-center gap-2">
                  <Library className="w-4 h-4" />
                  Draft Questions
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Add Manual Questions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="draft" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Library className="w-5 h-5" />
                      Select from Draft Questions
                    </CardTitle>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Note:</strong> These are draft questions that haven&apos;t been published yet. Selecting these questions will include them in your assessment.
                      </AlertDescription>
                    </Alert>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      {shortages.map(shortage => {
                        const availableQuestions = getAvailableDraftQuestions(shortage.questionType);
                        return (
                          <div key={shortage.questionType} className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-lg font-medium">
                                {QuestionTypeLabels[shortage.questionType]} Questions
                              </h4>
                              <Badge variant="outline">
                                {availableQuestions.length} available
                              </Badge>
                            </div>
                            
                            {availableQuestions.length === 0 ? (
                              <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                  No draft {QuestionTypeLabels[shortage.questionType]} questions available. Please add them manually.
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <div className="space-y-3">
                                {availableQuestions.map(question => (
                                  <Card key={question.id} className="border-blue-200 dark:border-blue-800">
                                    <CardContent className="p-4">
                                      <div className="flex items-start gap-3">
                                        <Checkbox
                                          checked={selectedDraftQuestions.some(q => q.id === question.id)}
                                          onCheckedChange={() => toggleDraftQuestion(question)}
                                          disabled={!selectedDraftQuestions.some(q => q.id === question.id) && getRemainingShortage(question.questionType) === 0}
                                        />
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="secondary" className="text-xs">
                                              Draft
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                              {question.marks} marks
                                            </Badge>
                                          </div>
                                          <p className="text-sm font-medium mb-2">{question.questionText}</p>
                                          {question.options && (
                                            <div className="text-xs text-muted-foreground mb-1">
                                              Options: {question.options.join(', ')}
                                            </div>
                                          )}
                                          <div className="text-xs text-muted-foreground">
                                            Correct Answer: {question.correctAnswer}
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="manual" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Add Manual Questions</CardTitle>
                    <Alert>
                      <PlusCircle className="h-4 w-4" />
                      <AlertDescription>
                        Questions added here can also be saved to the CLMS library for future use. They will be marked as manually added and won&apos;t appear in CLMS until reviewed.
                      </AlertDescription>
                    </Alert>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question Type</Label>
                      <Select 
                        value={currentQuestion.questionType} 
                        onValueChange={(value) => setCurrentQuestion({
                          ...currentQuestion, 
                          questionType: value as QuestionType,
                          options: value === 'MCQ' ? ['', '', '', ''] : undefined
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-background">
                          {shortages.map(shortage => (
                            <SelectItem key={shortage.questionType} value={shortage.questionType}>
                              {QuestionTypeLabels[shortage.questionType]} 
                              {getRemainingShortage(shortage.questionType) > 0 && 
                                ` (${getRemainingShortage(shortage.questionType)} needed)`
                              }
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Question Text</Label>
                      <Textarea
                        placeholder="Enter your question here..."
                        value={currentQuestion.questionText}
                        onChange={(e) => setCurrentQuestion({
                          ...currentQuestion, 
                          questionText: e.target.value
                        })}
                        rows={3}
                      />
                    </div>

                    {currentQuestion.questionType === 'MCQ' && (
                      <div className="space-y-2">
                        <Label>Answer Options</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {(currentQuestion.options || ['', '', '', '']).map((option, index) => (
                            <div key={index} className="space-y-1">
                              <Label className="text-xs">Option {String.fromCharCode(65 + index)}</Label>
                              <Input
                                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                value={option}
                                onChange={(e) => updateOption(index, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Correct Answer</Label>
                        {currentQuestion.questionType === 'MCQ' ? (
                          <Select 
                            value={currentQuestion.correctAnswer} 
                            onValueChange={(value) => setCurrentQuestion({
                              ...currentQuestion, 
                              correctAnswer: value
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select correct option" />
                            </SelectTrigger>
                            <SelectContent className="z-50 bg-background">
                              {(currentQuestion.options || []).map((option, index) => {
                                const optionValue = option.trim() || `option_${index}`;
                                return (
                                  <SelectItem key={index} value={optionValue} disabled={!option.trim()}>
                                    {String.fromCharCode(65 + index)}: {option || 'Empty option'}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            placeholder="Enter the correct answer"
                            value={currentQuestion.correctAnswer}
                            onChange={(e) => setCurrentQuestion({
                              ...currentQuestion, 
                              correctAnswer: e.target.value
                            })}
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Marks</Label>
                        <Input
                          type="number"
                          min="1"
                          value={currentQuestion.marks}
                          onChange={(e) => setCurrentQuestion({
                            ...currentQuestion, 
                            marks: parseInt(e.target.value) || 1
                          })}
                        />
                      </div>
                    </div>

                    <Button onClick={addManualQuestion} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {(selectedDraftQuestions.length > 0 || manualQuestions.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Selected Questions ({selectedDraftQuestions.length + manualQuestions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {selectedDraftQuestions.map((question) => (
                        <Card key={question.id} className="border-blue-200 dark:border-blue-800">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="secondary" className="text-xs">Draft</Badge>
                                  <Badge variant="outline">
                                    {QuestionTypeLabels[question.questionType]}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {question.marks} marks
                                  </Badge>
                                </div>
                                <p className="text-sm font-medium mb-2">{question.questionText}</p>
                                {question.options && (
                                  <div className="text-xs text-muted-foreground">
                                    Options: {question.options.join(', ')}
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground">
                                  Correct Answer: {question.correctAnswer}
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleDraftQuestion(question)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {manualQuestions.map((question, index) => (
                        <Card key={question.id} className="border-green-200 dark:border-green-800">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="default" className="text-xs">Manual</Badge>
                                  <Badge variant="outline">
                                    {QuestionTypeLabels[question.questionType]}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {question.marks} marks
                                  </Badge>
                                </div>
                                <p className="text-sm font-medium mb-2">{question.questionText}</p>
                                {question.options && (
                                  <div className="text-xs text-muted-foreground">
                                    Options: {question.options.join(', ')}
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground">
                                  Correct Answer: {question.correctAnswer}
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeManualQuestion(index)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {!isShortageResolved() && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You still need to select or add more questions to resolve all shortages before continuing.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 pt-4 border-t bg-muted/20">
          <div className="flex gap-4">
            <Button 
              onClick={handleSave} 
              disabled={!canSave()}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Save & Continue ({selectedDraftQuestions.length + manualQuestions.length} questions)
            </Button>
            <Button variant="outline" onClick={onCancel} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionShortageResolver;