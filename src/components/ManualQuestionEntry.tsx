import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { QuestionType, QuestionShortage, ManualQuestion, QuestionTypeLabels } from '@/types/assessment';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

interface ManualQuestionEntryProps {
  shortages: QuestionShortage[];
  onSave: (questions: ManualQuestion[]) => void;
  onCancel: () => void;
}

const ManualQuestionEntry: React.FC<ManualQuestionEntryProps> = ({
  shortages,
  onSave,
  onCancel
}) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [manualQuestions, setManualQuestions] = useState<ManualQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<ManualQuestion>>({
    questionType: shortages[0]?.questionType || 'MCQ',
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1
  });

  const addQuestion = () => {
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
      bloomLevel: 1, // Default level since it's not captured but required by type
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

  const removeQuestion = (index: number) => {
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

  const getShortageForType = (type: QuestionType) => {
    return shortages.find(s => s.questionType === type);
  };

  const getAddedCountForType = (type: QuestionType) => {
    return manualQuestions.filter(q => q.questionType === type).length;
  };

  const getRemainingShortage = (type: QuestionType) => {
    const shortage = getShortageForType(type);
    const added = getAddedCountForType(type);
    return shortage ? Math.max(0, shortage.shortage - added) : 0;
  };

  const isShortageResolved = () => {
    return shortages.every(shortage => 
      getAddedCountForType(shortage.questionType) >= shortage.shortage
    );
  };

  const canSave = () => {
    return manualQuestions.length > 0 && isShortageResolved();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Question Shortage Detected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The system couldn't find enough questions to complete your assessment. Please add the missing questions manually below.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                      Added: {getAddedCountForType(shortage.questionType)}
                    </div>
                    <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      Remaining: {getRemainingShortage(shortage.questionType)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Manual Questions</CardTitle>
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
              <SelectContent>
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
                  <SelectContent>
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

          <Button onClick={addQuestion} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </CardContent>
      </Card>

      {manualQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Added Questions ({manualQuestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {manualQuestions.map((question, index) => (
                <Card key={question.id} className="border-green-200 dark:border-green-800">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
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
                        onClick={() => removeQuestion(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button 
          onClick={() => onSave(manualQuestions)} 
          disabled={!canSave()}
          className="flex-1"
        >
          <Save className="w-4 h-4 mr-2" />
          Save & Continue ({manualQuestions.length} questions)
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>

      {!isShortageResolved() && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You still need to add more questions to resolve all shortages before continuing.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ManualQuestionEntry;