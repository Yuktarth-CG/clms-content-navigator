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
  const [activeTab, setActiveTab] = useState('create-assessments');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create Tests</h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive test creation and management hub - create, manage, and generate assessments using various methods
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create-assessments" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Create Assessments
            <Badge variant="secondary" className="ml-1">Core</Badge>
          </TabsTrigger>
          <TabsTrigger value="manage-assessments" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Manage Assessments
            <Badge variant="secondary" className="ml-1">Library</Badge>
          </TabsTrigger>
          <TabsTrigger value="ocr-generation" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            OCR Generation
            <Badge variant="secondary" className="ml-1">Advanced</Badge>
          </TabsTrigger>
          <TabsTrigger value="ocr-management" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            OCR Management
            <Badge variant="secondary" className="ml-1">Archive</Badge>
          </TabsTrigger>
        </TabsList>

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
    </div>
  );
};

export default CreateTests;