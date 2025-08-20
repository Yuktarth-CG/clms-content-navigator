import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  FolderOpen, 
  FileText, 
  ClipboardList,
  Lightbulb,
  Archive,
  Wand2,
  Upload
} from 'lucide-react';
import CreateAssessments from './CreateAssessments';
import ManageAssessments from './ManageAssessments';
import OCRTestPaperCreation from './OCRTestPaperCreation';
import OCRTestPaperManagement from './OCRTestPaperManagement';

const CreateTests = () => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create Tests</h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive test creation and management hub - create, manage, and generate assessments using various methods
        </p>
      </div>

      {activeTab === 'home' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50"
            onClick={() => setActiveTab('create-assessments')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Wand2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl flex items-center justify-center gap-2">
                Create Worksheets & Test Papers
                <Badge variant="secondary">Core</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Generate worksheets, test papers, and personalized assessments using automated generation, 
                custom building, blueprints, and more
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Lightbulb className="w-4 h-4" />
                  AI-Powered
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  Multiple Formats
                </span>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50"
            onClick={() => setActiveTab('manage-assessments')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Archive className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl flex items-center justify-center gap-2">
                Manage Assessments
                <Badge variant="secondary">Library</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Browse, filter, download, and manage all your generated assessment papers and worksheets 
                with advanced search and organization tools
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FolderOpen className="w-4 h-4" />
                  Organized
                </span>
                <span className="flex items-center gap-1">
                  <Upload className="w-4 h-4" />
                  Searchable
                </span>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50"
            onClick={() => setActiveTab('ocr-generation')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl flex items-center justify-center gap-2">
                OCR Generation
                <Badge variant="secondary">Advanced</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Generate test papers automatically from CSV files or CLMS content using OCR templates 
                and blueprints with intelligent question mapping
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Upload className="w-4 h-4" />
                  CSV Upload
                </span>
                <span className="flex items-center gap-1">
                  <Lightbulb className="w-4 h-4" />
                  Smart Mapping
                </span>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50"
            onClick={() => setActiveTab('ocr-management')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl flex items-center justify-center gap-2">
                OCR Management
                <Badge variant="secondary">Archive</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                View, download, and manage test papers that were generated through OCR tools and CSV uploads 
                with detailed tracking and version control
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Archive className="w-4 h-4" />
                  Archive
                </span>
                <span className="flex items-center gap-1">
                  <ClipboardList className="w-4 h-4" />
                  Track History
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-6 flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('home')} 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Create Tests Home
            </button>
          </div>

        <TabsContent value="create-assessments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Assessment Creation Hub
              </CardTitle>
              <p className="text-muted-foreground">
                Create worksheets, test papers, and personalized assessments using automated generation, 
                custom building, blueprints, and more
              </p>
            </CardHeader>
            <CardContent>
              <CreateAssessments />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage-assessments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5" />
                Assessment Library
              </CardTitle>
              <p className="text-muted-foreground">
                Browse, filter, download, and manage all your generated assessment papers and worksheets
              </p>
            </CardHeader>
            <CardContent>
              <ManageAssessments />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ocr-generation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                OCR Test Paper Generation
              </CardTitle>
              <p className="text-muted-foreground">
                Generate test papers automatically from CSV files or CLMS content using OCR templates and blueprints
              </p>
            </CardHeader>
            <CardContent>
              <OCRTestPaperCreation />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ocr-management" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                OCR Generated Papers
              </CardTitle>
              <p className="text-muted-foreground">
                View, download, and manage test papers that were generated through OCR tools and CSV uploads
              </p>
            </CardHeader>
            <CardContent>
              <OCRTestPaperManagement />
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default CreateTests;