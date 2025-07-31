
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus, 
  Search, 
  CheckCircle, 
  Eye, 
  Download,
  Filter,
  Tag,
  Languages
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { WorksheetTemplate, OCRJob, StructuredContent, LanguageSupport } from '@/types/ocr';

const OCRWorksheetCreation = () => {
  const { user, hasPermission } = useUser();
  const [step, setStep] = useState<'select' | 'template' | 'processing' | 'review' | 'complete'>('select');
  const [selectedContent, setSelectedContent] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('english');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentJob, setCurrentJob] = useState<OCRJob | null>(null);

  const worksheetTemplates: WorksheetTemplate[] = [
    {
      id: 'state-exam-ws',
      name: 'State Examination Worksheet',
      description: 'Structured worksheet format for state board examinations',
      type: 'state-exam',
      layout: 'dual-column',
      supportedLanguages: ['english', 'hindi', 'bengali'],
      preview: '/template-previews/state-exam-worksheet.png',
      constraints: { minQuestions: 15, maxQuestions: 50 },
      version: '1.0',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'board-exam-ws',
      name: 'Board Exam Worksheet',
      description: 'Comprehensive worksheet for board exam preparation',
      type: 'board-exam',
      layout: 'single-column',
      supportedLanguages: ['english', 'hindi', 'tamil', 'bengali'],
      preview: '/template-previews/board-exam-worksheet.png',
      constraints: { minQuestions: 20, maxQuestions: 100 },
      version: '1.0',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'practice-ws',
      name: 'Practice Paper Worksheet',
      description: 'Flexible worksheet format for practice sessions',
      type: 'practice-paper',
      layout: 'grid',
      supportedLanguages: ['english', 'hindi', 'gujarati', 'marathi'],
      preview: '/template-previews/practice-worksheet.png',
      constraints: { minQuestions: 10, maxQuestions: 30 },
      version: '1.0',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];

  const supportedLanguages: LanguageSupport[] = [
    { code: 'english', name: 'English', nativeName: 'English', direction: 'ltr', isSupported: true, ocrAccuracy: 0.98 },
    { code: 'hindi', name: 'Hindi', nativeName: 'हिंदी', direction: 'ltr', isSupported: true, ocrAccuracy: 0.95 },
    { code: 'bengali', name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr', isSupported: true, ocrAccuracy: 0.93 },
    { code: 'tamil', name: 'Tamil', nativeName: 'தமிழ்', direction: 'ltr', isSupported: true, ocrAccuracy: 0.92 },
    { code: 'gujarati', name: 'Gujarati', nativeName: 'ગુજરાતી', direction: 'ltr', isSupported: true, ocrAccuracy: 0.90 },
    { code: 'marathi', name: 'Marathi', nativeName: 'मराठी', direction: 'ltr', isSupported: true, ocrAccuracy: 0.91 }
  ];

  // Mock content data
  const mockContent = [
    { id: '1', title: 'Algebra Basics', type: 'question', subject: 'Mathematics', tags: ['algebra', 'state-exam'], ocrTags: ['state-exam-ws'] },
    { id: '2', title: 'Photosynthesis Process', type: 'question', subject: 'Biology', tags: ['biology', 'board-exam'], ocrTags: ['board-exam-ws'] },
    { id: '3', title: 'English Grammar Set', type: 'question-set', subject: 'English', tags: ['grammar', 'practice'], ocrTags: ['practice-ws'] },
    { id: '4', title: 'Physics Laws', type: 'topic', subject: 'Physics', tags: ['physics', 'state-exam'], ocrTags: ['state-exam-ws'] }
  ];

  if (!hasPermission('canCreateTestPaperFromCSV')) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to create OCR worksheets.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleContentSelection = (contentId: string, checked: boolean) => {
    if (checked) {
      setSelectedContent([...selectedContent, contentId]);
    } else {
      setSelectedContent(selectedContent.filter(id => id !== contentId));
    }
  };

  const startWorksheetCreation = () => {
    if (selectedContent.length > 0 && selectedTemplate) {
      setStep('processing');
      const job: OCRJob = {
        id: `worksheet-${Date.now()}`,
        type: 'worksheet-creation',
        status: 'processing',
        progress: 0,
        templateId: selectedTemplate,
        language: selectedLanguage,
        createdAt: new Date().toISOString(),
        userId: user?.id || '',
        contentIds: selectedContent
      };
      setCurrentJob(job);
      simulateProcessing(job);
    }
  };

  const simulateProcessing = (job: OCRJob) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 12;
      setCurrentJob(prev => prev ? { ...prev, progress } : null);
      
      if (progress >= 100) {
        clearInterval(interval);
        setCurrentJob(prev => prev ? { 
          ...prev, 
          status: 'completed',
          completedAt: new Date().toISOString(),
          resultData: { worksheetUrl: '/mock-worksheet.pdf' }
        } : null);
        setStep('review');
      }
    }, 500);
  };

  const renderContentSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Content from CLMS</h3>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>
      
      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Button variant="outline">
          <Search className="w-4 h-4" />
        </Button>
      </div>

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
                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex flex-wrap gap-1">
                    {content.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Tag className="w-3 h-3 text-blue-600" />
                    {content.ocrTags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs text-blue-600">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <p className="text-sm text-gray-600">
          {selectedContent.length} content item(s) selected
        </p>
        <Button 
          onClick={() => setStep('template')}
          disabled={selectedContent.length === 0}
        >
          Next: Select Template
        </Button>
      </div>
    </div>
  );

  const renderTemplateSelection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Select Worksheet Template</h3>
      
      <div>
        <Label>Language</Label>
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {supportedLanguages.map(lang => (
              <SelectItem key={lang.code} value={lang.code}>
                <div className="flex items-center space-x-2">
                  <Languages className="w-4 h-4" />
                  <span>{lang.nativeName} ({lang.name})</span>
                  <Badge variant="outline" className="text-xs">
                    {(lang.ocrAccuracy * 100).toFixed(0)}% accuracy
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {worksheetTemplates
          .filter(template => template.supportedLanguages.includes(selectedLanguage))
          .map(template => (
            <Card 
              key={template.id} 
              className={`cursor-pointer transition-colors ${
                selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardContent className="p-4">
                <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="font-medium">{template.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Layout:</span>
                    <Badge variant="outline" className="text-xs">{template.layout}</Badge>
                  </div>
                  {template.constraints && (
                    <div className="text-xs text-gray-500">
                      Questions: {template.constraints.minQuestions}-{template.constraints.maxQuestions}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      <div className="flex space-x-4">
        <Button variant="outline" onClick={() => setStep('select')} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={startWorksheetCreation}
          disabled={!selectedTemplate}
          className="flex-1"
        >
          Generate Worksheet
        </Button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="space-y-6 text-center">
      <div className="space-y-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <FileText className="w-8 h-8 text-blue-600 animate-pulse" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Creating OCR Worksheet</h3>
          <p className="text-gray-600">Processing selected content with OCR template...</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <Progress value={currentJob?.progress || 0} className="w-full" />
        <p className="text-sm text-gray-500">{currentJob?.progress || 0}% complete</p>
      </div>

      <div className="text-sm text-gray-600">
        <p>Content items: {selectedContent.length}</p>
        <p>Template: {worksheetTemplates.find(t => t.id === selectedTemplate)?.name}</p>
        <p>Language: {supportedLanguages.find(l => l.code === selectedLanguage)?.nativeName}</p>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Worksheet Generated Successfully</h3>
        <p className="text-gray-600">Review and modify the worksheet before saving</p>
      </div>

      <div className="border rounded-lg p-6 bg-gray-50">
        <div className="aspect-video bg-white rounded border flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">OCR Worksheet Preview</p>
            <p className="text-xs text-gray-500">Visual editor integration would be embedded here</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button variant="outline" className="flex-1">
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button variant="outline" className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button onClick={() => setStep('complete')} className="flex-1">
          Save to CLMS
        </Button>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="space-y-6 text-center">
      <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
      <div>
        <h3 className="text-lg font-semibold">Worksheet Saved Successfully</h3>
        <p className="text-gray-600">Your OCR worksheet has been saved to the CLMS repository</p>
      </div>
      <Button onClick={() => {
        setStep('select');
        setSelectedContent([]);
        setSelectedTemplate('');
        setCurrentJob(null);
      }}>
        Create Another Worksheet
      </Button>
    </div>
  );

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create OCR Worksheet</h1>
          <p className="text-gray-600 mt-1">Generate structured worksheets from existing CLMS content using OCR templates</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>OCR Worksheet Creation Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            {step === 'select' && renderContentSelection()}
            {step === 'template' && renderTemplateSelection()}
            {step === 'processing' && renderProcessing()}
            {step === 'review' && renderReview()}
            {step === 'complete' && renderComplete()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OCRWorksheetCreation;
