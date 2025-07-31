
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Layout, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye,
  BookOpen
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { CSVTemplate, PaperLayoutTemplate, WorksheetTemplate } from '@/types/ocr';

const OCRTemplateManagement = () => {
  const { user, hasPermission } = useUser();
  const [activeTab, setActiveTab] = useState<'csv' | 'layout' | 'worksheet'>('csv');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Template form states
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateConstraints, setTemplateConstraints] = useState('');

  const csvTemplates: CSVTemplate[] = [
    {
      id: 'template-b-csv',
      name: 'Template B - Enhanced CSV Format',
      description: 'Advanced CSV template with comprehensive question support and Learning Outcome mapping',
      requiredColumns: ['S No.', 'Question Statement', 'Question Image Link', 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Image Option 1', 'Image Option 2', 'Image Option 3', 'Image Option 4', 'Group', 'LO Code', 'Difficulty', 'Marks', 'Question Type'],
      sampleData: {},
      constraints: { 
        minQuestions: 15, 
        requiredQuestionTypes: ['mcq', 'subjective', 'fill-in-blank']
      },
      version: '2.1',
      createdAt: '2024-01-01',
      updatedAt: '2024-12-26'
    }
  ];

  const layoutTemplates: PaperLayoutTemplate[] = [
    {
      id: 'template-b-layout',
      name: 'Template B - Advanced Paper Layout',
      description: 'Enhanced layout template with intelligent QR positioning, dynamic headers, and modular content blocks',
      preview: '/template-previews/template-b-layout.png',
      constraints: { 
        minQuestions: 20,
        questionTypes: ['mcq', 'subjective', 'fill-in-blank']
      },
      version: '2.1',
      createdAt: '2024-01-01',
      updatedAt: '2024-12-26',
      customizable: true
    }
  ];

  const worksheetTemplates: WorksheetTemplate[] = [
    {
      id: 'template-b-worksheet',
      name: 'Template B - OCR Worksheet Format',
      description: 'Modular worksheet template supporting state exams, board exams, and practice papers with OCR optimization',
      type: 'state-exam',
      layout: 'dual-column',
      supportedLanguages: ['en', 'hi', 'mr'],
      preview: '/template-previews/template-b-worksheet.png',
      constraints: {
        minQuestions: 15,
        maxQuestions: 50,
        questionTypes: ['mcq', 'subjective', 'fill-in-blank', 'true-false']
      },
      version: '2.1',
      createdAt: '2024-01-01',
      updatedAt: '2024-12-26'
    }
  ];

  if (!hasPermission('canManageOCRTemplates')) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Layout className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to manage templates.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateTemplate = () => {
    // Mock template creation
    console.log('Creating template:', { templateName, templateDescription, templateConstraints, activeTab });
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEditTemplate = () => {
    // Mock template editing
    console.log('Editing template:', selectedTemplate);
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDeleteTemplate = (templateId: string) => {
    // Mock template deletion
    console.log('Deleting template:', templateId);
  };

  const handleDuplicateTemplate = (templateId: string) => {
    // Mock template duplication
    console.log('Duplicating template:', templateId);
  };

  const resetForm = () => {
    setTemplateName('');
    setTemplateDescription('');
    setTemplateConstraints('');
  };

  const renderCSVTemplates = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">CSV Templates</h3>
          <p className="text-sm text-gray-600">Manage templates for CSV file structure validation</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create CSV Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {csvTemplates.map(template => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                </div>
                <Badge variant="outline">v{template.version}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="text-xs text-gray-500">
                  <div>Columns: {template.requiredColumns.length}</div>
                  <div>Min Questions: {template.constraints?.minQuestions || 'None'}</div>
                  <div>Updated: {new Date(template.updatedAt).toLocaleDateString()}</div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => console.log('Preview template:', template.id)}>
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedTemplate(template.id);
                    setTemplateName(template.name);
                    setTemplateDescription(template.description);
                    setIsEditDialogOpen(true);
                  }}>
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDuplicateTemplate(template.id)}>
                    <Copy className="w-3 h-3 mr-1" />
                    Duplicate
                  </Button>
                </div>
                  
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderLayoutTemplates = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Paper Layout Templates</h3>
          <p className="text-sm text-gray-600">Manage templates for test paper visual layout and formatting</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Layout Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {layoutTemplates.map(template => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                <Layout className="w-8 h-8 text-gray-400" />
              </div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge variant="outline">v{template.version}</Badge>
                  {template.customizable && (
                    <Badge variant="secondary" className="text-xs">Customizable</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="text-xs text-gray-500">
                  <div>Min Questions: {template.constraints?.minQuestions || 'None'}</div>
                  {template.constraints?.questionTypes && (
                    <div>Types: {template.constraints.questionTypes.join(', ')}</div>
                  )}
                  <div>Updated: {new Date(template.updatedAt).toLocaleDateString()}</div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => console.log('Preview template:', template.id)}>
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedTemplate(template.id);
                    setTemplateName(template.name);
                    setTemplateDescription(template.description);
                    setIsEditDialogOpen(true);
                  }}>
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDuplicateTemplate(template.id)}>
                    <Copy className="w-3 h-3 mr-1" />
                    Duplicate
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderWorksheetTemplates = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">OCR Worksheet Templates</h3>
          <p className="text-sm text-gray-600">Manage modular worksheet templates for OCR-optimized test creation</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Worksheet Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {worksheetTemplates.map(template => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge variant="outline">v{template.version}</Badge>
                  <Badge variant="secondary" className="text-xs">{template.type}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="text-xs text-gray-500">
                  <div>Layout: {template.layout}</div>
                  <div>Questions: {template.constraints?.minQuestions}-{template.constraints?.maxQuestions}</div>
                  <div>Languages: {template.supportedLanguages.join(', ')}</div>
                  <div>Updated: {new Date(template.updatedAt).toLocaleDateString()}</div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => console.log('Preview template:', template.id)}>
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedTemplate(template.id);
                    setTemplateName(template.name);
                    setTemplateDescription(template.description);
                    setIsEditDialogOpen(true);
                  }}>
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDuplicateTemplate(template.id)}>
                    <Copy className="w-3 h-3 mr-1" />
                    Duplicate
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCreateDialog = () => (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Create New {activeTab === 'csv' ? 'CSV' : activeTab === 'layout' ? 'Layout' : 'Worksheet'} Template
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter template name"
            />
          </div>
          <div>
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Enter template description"
              rows={3}
            />
          </div>
          {activeTab === 'csv' && (
            <div>
              <Label htmlFor="template-constraints">Constraints (JSON format)</Label>
              <Textarea
                id="template-constraints"
                value={templateConstraints}
                onChange={(e) => setTemplateConstraints(e.target.value)}
                placeholder='{"minQuestions": 10, "requiredQuestionTypes": ["mcq"]}'
                rows={3}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateTemplate}>
            Create Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderEditDialog = () => (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Edit {activeTab === 'csv' ? 'CSV' : activeTab === 'layout' ? 'Layout' : 'Worksheet'} Template
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-template-name">Template Name</Label>
            <Input
              id="edit-template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter template name"
            />
          </div>
          <div>
            <Label htmlFor="edit-template-description">Description</Label>
            <Textarea
              id="edit-template-description"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Enter template description"
              rows={3}
            />
          </div>
          {activeTab === 'csv' && (
            <div>
              <Label htmlFor="edit-template-constraints">Constraints (JSON format)</Label>
              <Textarea
                id="edit-template-constraints"
                value={templateConstraints}
                onChange={(e) => setTemplateConstraints(e.target.value)}
                placeholder='{"minQuestions": 10, "requiredQuestionTypes": ["mcq"]}'
                rows={3}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleEditTemplate}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Template Management</h1>
          <p className="text-gray-600 mt-1">
            Manage CSV, paper layout, and OCR worksheet templates for comprehensive test paper generation
          </p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'csv' | 'layout' | 'worksheet')}>
            <TabsList>
              <TabsTrigger value="csv" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>CSV Templates</span>
              </TabsTrigger>
              <TabsTrigger value="layout" className="flex items-center space-x-2">
                <Layout className="w-4 h-4" />
                <span>Layout Templates</span>
              </TabsTrigger>
              <TabsTrigger value="worksheet" className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>OCR Worksheets</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'csv' | 'layout' | 'worksheet')}>
              <TabsContent value="csv">
                {renderCSVTemplates()}
              </TabsContent>
              <TabsContent value="layout">
                {renderLayoutTemplates()}
              </TabsContent>
              <TabsContent value="worksheet">
                {renderWorksheetTemplates()}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {renderCreateDialog()}
        {renderEditDialog()}
      </div>
    </div>
  );
};

export default OCRTemplateManagement;
