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
import { Question, Worksheet, QuestionType } from '@/types/content';
import { efficientLifecycleService } from '@/services/efficientLifecycleService';

const WorksheetCreation = () => {
  const { user } = useUser();
  const [worksheet, setWorksheet] = useState<Partial<Worksheet>>({
    title: '',
    description: '',
    questionIds: [],
    repository: 'Public',
    status: 'Draft',
    tags: [],
    totalQuestions: 0,
    estimatedDuration: 60
  });

  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<QuestionType | 'all'>('all');

  // Mock public questions data
  const mockPublicQuestions: Question[] = [
    {
      id: 'PUB001',
      title: 'Basic Math Addition',
      content: 'What is 25 + 37?',
      loCode: 'LO-MATH-BASIC-001',
      chapter: 'Basic Math',
      difficulty: 'Easy',
      contentType: 'Question',
      questionType: 'practice',
      tags: ['math', 'addition'],
      status: 'Published',
      repository: 'Public',
      createdAt: '2024-01-10T00:00:00Z',
      modifiedAt: '2024-01-10T00:00:00Z',
      createdBy: 'user-001',
      usageCount: 5,
      lastUsed: '2024-06-15T00:00:00Z'
    },
    {
      id: 'PUB002',
      title: 'English Grammar - Tenses',
      content: 'Choose the correct tense: "She ___ to school yesterday"',
      loCode: 'LO-ENG-001',
      chapter: 'Grammar',
      difficulty: 'Medium',
      contentType: 'Question',
      questionType: 'evaluate',
      tags: ['english', 'grammar'],
      status: 'Published',
      repository: 'Public',
      createdAt: '2024-01-20T00:00:00Z',
      modifiedAt: '2024-01-20T00:00:00Z',
      createdBy: 'user-002',
      usageCount: 8,
      lastUsed: '2024-06-10T00:00:00Z'
    },
    {
      id: 'PUB003',
      title: 'Science - Photosynthesis',
      content: 'What gas is produced during photosynthesis?',
      loCode: 'LO-SCI-001',
      chapter: 'Biology',
      difficulty: 'Medium',
      contentType: 'Question',
      questionType: 'formative',
      tags: ['science', 'biology'],
      status: 'Published',
      repository: 'Public',
      createdAt: '2024-02-01T00:00:00Z',
      modifiedAt: '2024-02-01T00:00:00Z',
      createdBy: 'user-003',
      usageCount: 3,
      lastUsed: '2024-05-20T00:00:00Z'
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

  const handleSaveWorksheet = () => {
    const newWorksheet: Worksheet = {
      ...worksheet,
      id: `WS-${Date.now()}`,
      questionIds: selectedQuestions.map(q => q.id),
      totalQuestions: selectedQuestions.length,
      createdAt: new Date().toISOString(),
      createdBy: user?.id || 'current-user'
    } as Worksheet;

    // Record usage for each selected question
    selectedQuestions.forEach(question => {
      efficientLifecycleService.recordQuestionUsage(
        question.id,
        newWorksheet.id,
        newWorksheet.title,
        'worksheet'
      );
    });

    console.log('Saving worksheet:', newWorksheet);
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

  const filteredQuestions = mockPublicQuestions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         question.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || question.questionType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Worksheet</h1>
        <p className="text-gray-600">Create worksheets using public questions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Worksheet Details */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Worksheet Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={worksheet.title}
                  onChange={(e) => setWorksheet(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter worksheet title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={worksheet.description}
                  onChange={(e) => setWorksheet(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter worksheet description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={worksheet.estimatedDuration}
                  onChange={(e) => setWorksheet(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
                />
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
                onClick={handleSaveWorksheet}
                disabled={!worksheet.title || selectedQuestions.length === 0}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Save Worksheet
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Question Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Questions from Public Repository</CardTitle>
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
                            {question.usageCount && question.usageCount > 3 && (
                              <Badge variant="destructive" className="text-xs">
                                Reused {question.usageCount}x
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{question.content}</p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Created: {new Date(question.createdAt).toLocaleDateString()}</span>
                          {question.lastUsed && (
                            <span>Last used: {new Date(question.lastUsed).toLocaleDateString()}</span>
                          )}
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

export default WorksheetCreation;
