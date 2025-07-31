import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Zap, Settings, BookTemplate } from 'lucide-react';
import AutomatedGeneration from './AutomatedGeneration';
import CustomisedGeneration from './CustomisedGeneration';
import BlueprintManagement from './BlueprintManagement';


const CreateAssessments = () => {
  const [activeTab, setActiveTab] = useState('automated');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create Assessments</h1>
        <p className="text-muted-foreground mt-1">
          Generate test papers and worksheets easily with our teacher-friendly assessment creation tools
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="automated" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Quick Generation</span>
            <Badge variant="outline" className="ml-2 text-xs">Fast & Easy</Badge>
          </TabsTrigger>
          <TabsTrigger value="customised" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Build Your Own</span>
            <Badge variant="secondary" className="ml-2 text-xs">Full Control</Badge>
          </TabsTrigger>
          <TabsTrigger value="blueprints" className="flex items-center space-x-2">
            <BookTemplate className="w-4 h-4" />
            <span>Create Blueprints</span>
            <Badge variant="outline" className="ml-2 text-xs">Manage Templates</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automated" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <span>Quick Generation</span>
                <Badge variant="outline">Fast & Easy</Badge>
              </CardTitle>
              <p className="text-muted-foreground">
                Instantly generate assessments from your templates. Simply select a template, choose your content, and create the perfect test for your students.
              </p>
            </CardHeader>
            <CardContent>
              <AutomatedGeneration />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customised" className="mt-6">
          <CustomisedGeneration />
        </TabsContent>

        <TabsContent value="blueprints" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookTemplate className="w-5 h-5 text-purple-600" />
                <span>Create Blueprints</span>
                <Badge variant="outline">Manage Templates</Badge>
              </CardTitle>
              <p className="text-muted-foreground">
                Create and manage reusable assessment blueprints that define the structure and requirements for your tests. Set up your assessment framework here.
              </p>
            </CardHeader>
            <CardContent>
              <BlueprintManagement />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default CreateAssessments;