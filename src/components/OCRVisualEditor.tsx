
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Save, 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Type, 
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle 
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { ExtractedQuestion, StructuredContent } from '@/types/ocr';

interface VisualEditorProps {
  content: StructuredContent;
  onSave: (updatedContent: StructuredContent) => void;
  onCancel: () => void;
}

const OCRVisualEditor = ({ content, onSave, onCancel }: VisualEditorProps) => {
  const { hasPermission } = useUser();
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<StructuredContent>(content);
  const [zoom, setZoom] = useState(100);
  const [tool, setTool] = useState<'select' | 'text' | 'image' | 'move'>('select');

  if (!hasPermission('canUseVisualEditor')) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Edit className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to use the visual editor.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const updateQuestion = (questionId: string, updates: Partial<ExtractedQuestion>) => {
    setEditedContent(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return <Badge className="bg-green-100 text-green-800">High</Badge>;
    if (confidence >= 0.7) return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    return <Badge className="bg-red-100 text-red-800">Low</Badge>;
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="border-b p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">Visual Editor</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant={tool === 'select' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('select')}
              >
                <Move className="w-4 h-4" />
              </Button>
              <Button
                variant={tool === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('text')}
              >
                <Type className="w-4 h-4" />
              </Button>
              <Button
                variant={tool === 'image' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('image')}
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Undo className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Redo className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm w-12 text-center">{zoom}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(200, zoom + 10))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={() => onSave(editedContent)}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex">
        {/* Left Panel - Question List */}
        <div className="w-80 border-r bg-gray-50 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold mb-4">Questions ({editedContent.questions.length})</h3>
            <div className="space-y-3">
              {editedContent.questions.map((question, index) => (
                <Card
                  key={question.id}
                  className={`cursor-pointer transition-colors ${
                    selectedQuestion === question.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedQuestion(question.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">Q{index + 1}</div>
                        <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {question.text}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">
                            {question.type}
                          </Badge>
                          {getConfidenceBadge(question.confidence)}
                        </div>
                      </div>
                      <div className="ml-2">
                        {question.confidence < 0.7 && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Center Panel - Visual Editor */}
        <div className="flex-1 bg-gray-100 overflow-auto">
          <div className="p-6">
            <div 
              className="bg-white rounded-lg shadow-lg mx-auto"
              style={{ 
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                width: '210mm',
                minHeight: '297mm',
                padding: '20mm'
              }}
            >
              {/* Document Header */}
              <div className="text-center mb-8 border-b pb-4">
                <h1 className="text-2xl font-bold">{editedContent.title}</h1>
                <div className="text-sm text-gray-600 mt-2">
                  Subject: {editedContent.metadata.subject} | 
                  Language: {editedContent.metadata.language}
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {editedContent.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className={`p-4 rounded border-2 transition-colors ${
                      selectedQuestion === question.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedQuestion(question.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">
                          {index + 1}. {question.text}
                        </div>
                        
                        {question.type === 'MCQ' && question.options && (
                          <div className="mt-3 space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center">
                                <span className="w-6 h-6 rounded-full border flex items-center justify-center text-sm mr-3">
                                  {String.fromCharCode(65 + optIndex)}
                                </span>
                                <span>{option}</span>
                                {question.correctAnswer === optIndex && (
                                  <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="mt-2 text-sm text-gray-600">
                          Marks: {question.marks} | 
                          Confidence: <span className={getConfidenceColor(question.confidence)}>
                            {(question.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Properties */}
        <div className="w-80 border-l bg-white overflow-y-auto">
          <div className="p-4">
            {selectedQuestion ? (
              <div>
                <h3 className="font-semibold mb-4">Edit Question</h3>
                {(() => {
                  const question = editedContent.questions.find(q => q.id === selectedQuestion);
                  if (!question) return null;
                  
                  return (
                    <Tabs defaultValue="content">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="content">Content</TabsTrigger>
                        <TabsTrigger value="metadata">Metadata</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="content" className="space-y-4">
                        <div>
                          <Label>Question Text</Label>
                          <Textarea
                            value={question.text}
                            onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                        
                        {question.type === 'MCQ' && (
                          <div>
                            <Label>Options</Label>
                            <div className="space-y-2 mt-1">
                              {question.options?.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <Input
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...(question.options || [])];
                                      newOptions[index] = e.target.value;
                                      updateQuestion(question.id, { options: newOptions });
                                    }}
                                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                  />
                                  <Button
                                    variant={question.correctAnswer === index ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => updateQuestion(question.id, { correctAnswer: index })}
                                  >
                                    ✓
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="metadata" className="space-y-4">
                        <div>
                          <Label>Marks</Label>
                          <Input
                            type="number"
                            value={question.marks}
                            onChange={(e) => updateQuestion(question.id, { marks: parseInt(e.target.value) || 1 })}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label>Difficulty</Label>
                          <select
                            value={question.difficulty || 'Medium'}
                            onChange={(e) => updateQuestion(question.id, { difficulty: e.target.value as any })}
                            className="w-full mt-1 p-2 border rounded"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </div>
                        
                        <div>
                          <Label>Subject</Label>
                          <Input
                            value={question.subject || ''}
                            onChange={(e) => updateQuestion(question.id, { subject: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label>Chapter</Label>
                          <Input
                            value={question.chapter || ''}
                            onChange={(e) => updateQuestion(question.id, { chapter: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label>LO Code</Label>
                          <Input
                            value={question.loCode || ''}
                            onChange={(e) => updateQuestion(question.id, { loCode: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-8">
                <Edit className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a question to edit its properties</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OCRVisualEditor;
