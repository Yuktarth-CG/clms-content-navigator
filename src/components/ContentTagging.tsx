
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Tag, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  X,
  FileText,
  Layers
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { WorksheetTemplate, PaperLayoutTemplate, CSVTemplate, ContentTag } from '@/types/ocr';

const ContentTagging = () => {
  const { user, hasPermission } = useUser();
  const [selectedContent, setSelectedContent] = useState<string[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [templateType, setTemplateType] = useState<'worksheet' | 'paper-layout' | 'csv'>('worksheet');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Mock data
  const mockContent = [
    { id: '1', title: 'Algebra Fundamentals', type: 'question', subject: 'Mathematics', currentTags: ['algebra', 'basic'], ocrTags: ['state-exam-ws'] },
    { id: '2', title: 'Photosynthesis Quiz', type: 'question-set', subject: 'Biology', currentTags: ['biology', 'plants'], ocrTags: [] },
    { id: '3', title: 'English Grammar Module', type: 'module', subject: 'English', currentTags: ['grammar', 'language'], ocrTags: ['practice-ws'] },
    { id: '4', title: 'Physics Problem Set', type: 'question-set', subject: 'Physics', currentTags: ['physics', 'problems'], ocrTags: ['board-exam-ws'] }
  ];

  const worksheetTemplates: WorksheetTemplate[] = [
    {
      id: 'state-exam-ws',
      name: 'State Exam Worksheet',
      description: 'For state board examination preparation',
      type: 'state-exam',
      layout: 'dual-column',
      supportedLanguages: ['english', 'hindi'],
      preview: '',
      version: '1.0',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'board-exam-ws',
      name: 'Board Exam Worksheet',
      description: 'For comprehensive board exam preparation',
      type: 'board-exam',
      layout: 'single-column',
      supportedLanguages: ['english', 'hindi'],
      preview: '',
      version: '1.0',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'practice-ws',
      name: 'Practice Worksheet',
      description: 'For regular practice sessions',
      type: 'practice-paper',
      layout: 'grid',
      supportedLanguages: ['english'],
      preview: '',
      version: '1.0',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];

  const paperLayoutTemplates: PaperLayoutTemplate[] = [
    {
      id: 'state-exam-layout',
      name: 'State Exam Layout',
      description: 'Official state exam paper layout',
      preview: '',
      version: '1.0',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      customizable: true
    },
    {
      id: 'practice-layout',
      name: 'Practice Paper Layout',
      description: 'Simple layout for practice papers',
      preview: '',
      version: '1.0',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      customizable: false
    }
  ];

  const csvTemplates: CSVTemplate[] = [
    {
      id: 'mcq-basic',
      name: 'MCQ Basic Template',
      description: 'Standard MCQ format',
      requiredColumns: ['question', 'option_a', 'option_b', 'option_c', 'option_d'],
      sampleData: {},
      version: '1.0',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];

  if (!hasPermission('canManageOCRTemplates')) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Tag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to manage content tagging.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getAvailableTemplates = () => {
    switch (templateType) {
      case 'worksheet':
        return worksheetTemplates;
      case 'paper-layout':
        return paperLayoutTemplates;
      case 'csv':
        return csvTemplates;
      default:
        return [];
    }
  };

  const handleContentSelection = (contentId: string, checked: boolean) => {
    if (checked) {
      setSelectedContent([...selectedContent, contentId]);
    } else {
      setSelectedContent(selectedContent.filter(id => id !== contentId));
    }
  };

  const handleTemplateSelection = (templateId: string, checked: boolean) => {
    if (checked) {
      setSelectedTemplates([...selectedTemplates, templateId]);
    } else {
      setSelectedTemplates(selectedTemplates.filter(id => id !== templateId));
    }
  };

  const applyTagsToContent = () => {
    console.log('Applying tags:', selectedTemplates, 'to content:', selectedContent);
    // In real implementation, this would call the API
    setSelectedContent([]);
    setSelectedTemplates([]);
  };

  const removeTagFromContent = (contentId: string, templateId: string) => {
    console.log('Removing tag:', templateId, 'from content:', contentId);
    // In real implementation, this would call the API
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Content Tagging</h1>
          <p className="text-gray-600 mt-1">Tag CLMS content with OCR templates for structured reuse</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Content Selection Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Select Content</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBulkActions(!showBulkActions)}
                    >
                      <Layers className="w-4 h-4 mr-2" />
                      Bulk Actions
                    </Button>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <Input
                      placeholder="Search content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>

                  {showBulkActions && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {selectedContent.length} items selected
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={applyTagsToContent}>
                            Apply Tags
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedContent([])}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {mockContent.map(content => (
                      <Card key={content.id} className="p-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={selectedContent.includes(content.id)}
                            onCheckedChange={(checked) => handleContentSelection(content.id, checked as boolean)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{content.title}</h4>
                              <Badge variant="outline">{content.type}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Subject: {content.subject}</p>
                            
                            <div className="mt-3 space-y-2">
                              <div>
                                <span className="text-xs font-medium text-gray-500">Current Tags:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {content.currentTags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <span className="text-xs font-medium text-blue-600">OCR Tags:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {content.ocrTags.length > 0 ? (
                                    content.ocrTags.map(tag => (
                                      <div key={tag} className="flex items-center">
                                        <Badge variant="outline" className="text-xs text-blue-600">
                                          <Tag className="w-3 h-3 mr-1" />
                                          {tag}
                                        </Badge>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-5 w-5 p-0 ml-1"
                                          onClick={() => removeTagFromContent(content.id, tag)}
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-xs text-gray-400">No OCR tags</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Template Selection Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>OCR Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Template Type</Label>
                    <Select value={templateType} onValueChange={(value: any) => setTemplateType(value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="worksheet">Worksheet Templates</SelectItem>
                        <SelectItem value="paper-layout">Paper Layout Templates</SelectItem>
                        <SelectItem value="csv">CSV Templates</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    {getAvailableTemplates().map(template => (
                      <Card key={template.id} className="p-3">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={selectedTemplates.includes(template.id)}
                            onCheckedChange={(checked) => handleTemplateSelection(template.id, checked as boolean)}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{template.name}</h4>
                            <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                            <Badge variant="outline" className="text-xs mt-2">
                              v{template.version}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Button
                    onClick={applyTagsToContent}
                    disabled={selectedContent.length === 0 || selectedTemplates.length === 0}
                    className="w-full"
                  >
                    <Tag className="w-4 h-4 mr-2" />
                    Apply Tags ({selectedTemplates.length})
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentTagging;
