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
import KnowledgeGraphSelector, { KGSelection } from './KnowledgeGraphSelector';

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
  const [kgSelection, setKgSelection] = useState<KGSelection>({
    knowledgeGraphId: '',
    gradeId: '',
    subjectId: '',
    strandId: '',
    topicId: '',
    loId: '',
    subtopicId: '',
    skillId: ''
  });
  const [currentQuestion, setCurrentQuestion] = useState<Partial<ManualQuestion>>({
    questionType: shortages[0]?.questionType || 'MCQ',
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1
  });

  const addQuestion = () => {
    if (!kgSelection.knowledgeGraphId) {
      toast({
        title: "Validation Error",
        description: "Please select a Knowledge Graph",
        variant: "destructive"
      });
      return;
    }

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
      bloomLevel: kgSelection.skill?.cognitiveLevel === 'Knowing' ? 1 : 
                  kgSelection.skill?.cognitiveLevel === 'Applying' ? 3 : 
                  kgSelection.skill?.cognitiveLevel === 'Reasoning' ? 5 : 1,
      marks: currentQuestion.marks || 1,
      addedBy: user?.id || '',
      addedAt: new Date().toISOString(),
      // Add KG metadata
      kgMetadata: {
        knowledgeGraphId: kgSelection.knowledgeGraphId,
        gradeId: kgSelection.gradeId,
        subjectId: kgSelection.subjectId,
        strandId: kgSelection.strandId,
        topicId: kgSelection.topicId,
        loId: kgSelection.loId,
        subtopicId: kgSelection.subtopicId,
        skillId: kgSelection.skillId,
        cognitiveLevel: kgSelection.skill?.cognitiveLevel
      }
    };

    setManualQuestions([...manualQuestions, newQuestion]);
    
    // Reset form (keep KG selection)
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
    <div className="space-y-4">
      {/* Split Layout: Left - KG Selection, Right - Question Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Knowledge Graph Selection */}
        <div className="space-y-4">
          <KnowledgeGraphSelector
            selection={kgSelection}
            onSelectionChange={setKgSelection}
          />
        </div>

        {/* Right Panel - Question Addition */}
        <div className="space-y-4">
          {/* Shortage Summary */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Question Shortage
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-2">
                {shortages.map((shortage) => (
                  <div key={shortage.questionType} className="p-2 rounded-md border bg-muted/30 text-center">
                    <Badge variant="outline" className="mb-1 text-xs">
                      {QuestionTypeLabels[shortage.questionType]}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {getAddedCountForType(shortage.questionType)}/{shortage.shortage}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Question Form */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base">Add Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-sm">Question Type</Label>
                  <Select 
                    value={currentQuestion.questionType} 
                    onValueChange={(value) => setCurrentQuestion({
                      ...currentQuestion, 
                      questionType: value as QuestionType,
                      options: value === 'MCQ' ? ['', '', '', ''] : undefined
                    })}
                  >
                    <SelectTrigger className="h-9">
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

                <div className="space-y-1">
                  <Label className="text-sm">Marks</Label>
                  <Input
                    type="number"
                    min="1"
                    className="h-9"
                    value={currentQuestion.marks}
                    onChange={(e) => setCurrentQuestion({
                      ...currentQuestion, 
                      marks: parseInt(e.target.value) || 1
                    })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-sm">Question Text</Label>
                <Textarea
                  placeholder="Enter your question here..."
                  value={currentQuestion.questionText}
                  onChange={(e) => setCurrentQuestion({
                    ...currentQuestion, 
                    questionText: e.target.value
                  })}
                  rows={2}
                  className="resize-none"
                />
              </div>

              {currentQuestion.questionType === 'MCQ' && (
                <div className="space-y-1">
                  <Label className="text-sm">Options</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(currentQuestion.options || ['', '', '', '']).map((option, index) => (
                      <Input
                        key={index}
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="h-9"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-sm">Correct Answer</Label>
                {currentQuestion.questionType === 'MCQ' ? (
                  <Select 
                    value={currentQuestion.correctAnswer} 
                    onValueChange={(value) => setCurrentQuestion({
                      ...currentQuestion, 
                      correctAnswer: value
                    })}
                  >
                    <SelectTrigger className="h-9">
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
                    className="h-9"
                    value={currentQuestion.correctAnswer}
                    onChange={(e) => setCurrentQuestion({
                      ...currentQuestion, 
                      correctAnswer: e.target.value
                    })}
                  />
                )}
              </div>

              <Button onClick={addQuestion} className="w-full" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </CardContent>
          </Card>

          {/* Added Questions */}
          {manualQuestions.length > 0 && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Added ({manualQuestions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {manualQuestions.map((question, index) => (
                    <div key={question.id} className="p-2 rounded-md border bg-muted/30 flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {QuestionTypeLabels[question.questionType]}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {question.marks}m
                          </Badge>
                        </div>
                        <p className="text-xs truncate">{question.questionText}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(index)}
                        className="h-6 w-6 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex gap-4 pt-2 border-t">
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
            You still need to add more questions to resolve all shortages.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ManualQuestionEntry;