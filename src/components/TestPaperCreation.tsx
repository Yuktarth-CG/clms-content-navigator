import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Plus, Eye, Clock, FileText } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Question, TestPaper, QuestionType } from '@/types/content';
import { efficientLifecycleService } from '@/services/efficientLifecycleService';

const TestPaperCreation = () => {
  const { user } = useUser();
  const [testPaper, setTestPaper] = useState<Partial<TestPaper>>({
    title: '',
    description: '',
    questionIds: [],
    repository: 'Private',
    status: 'Draft',
    tags: [],
    totalQuestions: 0,
    totalMarks: 0,
    duration: 180,
    hasHighReusage: false,
    reusagePercentage: 0,
    includesAssessmentQuestions: false
  });

  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<QuestionType | 'all'>('all');

  // Mock private questions data
  const mockPrivateQuestions: Question[] = [
    {
      id: 'PQ001',
      title: 'Advanced Algebra Problem',
      content: 'Solve for x in the equation...',
      loCode: 'LO-MATH-001',
      chapter: 'Algebra',
      difficulty: 'Hard',
      contentType: 'Question',
      questionType: 'assessment',
      tags: ['algebra', 'advanced'],
      status: 'Published',
      repository: 'Private',
      createdAt: '2024-01-15T00:00:00Z',
      modifiedAt: '2024-01-15T00:00:00Z',
      createdBy: 'user-001',
      usageCount: 2,
      lastUsed: '2024-06-20T00:00:00Z',
      firstUsed: '2024-03-15T00:00:00Z'
    },
    {
      id: 'PQ002',
      title: 'Biology Cell Structure',
      content: 'Describe the function of mitochondria...',
      loCode: 'LO-BIO-001',
      chapter: 'Cell Biology',
      difficulty: 'Medium',
      contentType: 'Question',
      questionType: 'formative',
      tags: ['biology', 'cells'],
      status: 'Published',
      repository: 'Private',
      createdAt: '2024-02-10T00:00:00Z',
      modifiedAt: '2024-02-10T00:00:00Z',
      createdBy: 'user-002',
      usageCount: 1,
      lastUsed: '2024-05-10T00:00:00Z',
      firstUsed: '2024-05-10T00:00:00Z'
    },
    {
      id: 'PQ003',
      title: 'Physics Quantum Mechanics',
      content: 'Explain the uncertainty principle...',
      loCode: 'LO-PHY-001',
      chapter: 'Quantum Physics',
      difficulty: 'Hard',
      contentType: 'Question',
      questionType: 'assessment',
      tags: ['physics', 'quantum'],
      status: 'Published',
      repository: 'Private',
      createdAt: '2024-03-01T00:00:00Z',
      modifiedAt: '2024-03-01T00:00:00Z',
      createdBy: 'user-003',
      usageCount: 0
    }
  ];

  const handleQuestionSelection = (question: Question) => {
    const isSelected = selectedQuestions.find(q => q.id === question.id);
    if (isSelected) {
      setSelectedQuestions(prev => prev.filter(q => q.id !== question.id));
    } else {
      setSelectedQuestions(prev => [...prev, question]);
    }
  };

  const calculateTotalMarks = () => {
    // Mock calculation - in real implementation, questions would have marks
    return selectedQuestions.length * 5; // Assuming 5 marks per question
  };

  const handleSaveTestPaper = () => {
    const newTestPaper: TestPaper = {
      ...testPaper,
      id: `TP-${Date.now()}`,
      questionIds: selectedQuestions.map(q => q.id),
      totalQuestions: selectedQuestions.length,
      totalMarks: calculateTotalMarks(),
      createdAt: new Date().toISOString(),
      createdBy: user?.id || 'current-user'
    } as TestPaper;

    // Record usage for each selected question
    selectedQuestions.forEach(question => {
      efficientLifecycleService.recordQuestionUsage(
        question.id,
        newTestPaper.id,
        newTestPaper.title,
        'test-paper'
      );
    });

    console.log('Saving test paper:', newTestPaper);
    // Here you would typically save to your backend
  };

  const getQuestionTypeColor = (type: QuestionType): string => {
    const colors = {
      formative: 'bg-blue-100 text-blue-800',
      evaluate: 'bg-green-100 text-green-800',
      practice: 'bg-yellow-100 text-yellow-800',
      assessment: 'bg-red-100 text-red-800'
    };
    return colors[type];
  };

  const renderQuestionUsageInfo = (question: Question) => {
    const usageHistory = efficientLifecycleService.getQuestionUsageHistory(question.id);
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            Usage Info
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Question Usage History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Question: {question.title}</Label>
              <p className="text-sm text-gray-600">Added: {new Date(question.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Usage Count</Label>
                <p className="text-2xl font-bold text-blue-600">{question.usageCount || 0}</p>
              </div>
              <div>
                <Label>Last Used</Label>
                <p className="text-sm">{question.lastUsed ? new Date(question.lastUsed).toLocaleDateString() : 'Never'}</p>
              </div>
            </div>

            {usageHistory && usageHistory.examsUsedIn.length > 0 && (
              <div>
                <Label>Used in Exams:</Label>
                <div className="mt-2 space-y-2">
                  {usageHistory.examsUsedIn.map((exam, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>{exam.examName}</span>
                      <Badge variant="outline">{exam.examType}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const filteredQuestions = mockPrivateQuestions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         question.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || question.questionType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Test Paper</h1>
        <p className="text-gray-600">Create test papers using private questions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Paper Details */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Test Paper Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={testPaper.title}
                  onChange={(e) => setTestPaper(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter test paper title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={testPaper.description}
                  onChange={(e) => setTestPaper(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter test paper description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={testPaper.duration}
                    onChange={(e) => setTestPaper(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Total Marks</Label>
                  <Input value={calculateTotalMarks()} disabled />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <Label>Selected Questions</Label>
                  <Badge variant="secondary">{selectedQuestions.length}</Badge>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedQuestions.map(question => (
                    <div key={question.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <span className="truncate">{question.title}</span>
                      <Badge className={getQuestionTypeColor(question.questionType)}>
                        {question.questionType}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleSaveTestPaper}
                disabled={!testPaper.title || selectedQuestions.length === 0}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Save Test Paper
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Question Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Questions from Private Repository</CardTitle>
              <div className="flex space-x-4">
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Select value={filterType} onValueChange={(value) => setFilterType(value as QuestionType | 'all')}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="formative">Formative</SelectItem>
                    <SelectItem value="evaluate">Evaluate</SelectItem>
                    <SelectItem value="practice">Practice</SelectItem>
                    <SelectItem value="assessment">Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredQuestions.map(question => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={selectedQuestions.some(q => q.id === question.id)}
                        onCheckedChange={() => handleQuestionSelection(question)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{question.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge className={getQuestionTypeColor(question.questionType)}>
                              {question.questionType}
                            </Badge>
                            <Badge variant="outline">{question.difficulty}</Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{question.content}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Added: {new Date(question.createdAt).toLocaleDateString()}</span>
                            {question.usageCount && question.usageCount > 0 && (
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                Used {question.usageCount} time(s)
                              </span>
                            )}
                          </div>
                          
                          {renderQuestionUsageInfo(question)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestPaperCreation;
