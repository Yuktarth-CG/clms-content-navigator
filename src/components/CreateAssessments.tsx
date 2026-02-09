import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Zap, Settings, BookTemplate, UserCheck, AlertTriangle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AutomatedGeneration from './AutomatedGeneration';
import CustomisedGeneration from './CustomisedGeneration';
import BlueprintManagement from './BlueprintManagement';
import PersonalizedWorksheet from './PersonalizedWorksheet';

// Mock storage limit constants
const MAX_SAVED_ASSESSMENTS = 100;

const CreateAssessments = () => {
  const [activeTab, setActiveTab] = useState('automated');
  const navigate = useNavigate();
  
  // Mock state: Simulating user has reached 100 assessments
  // Change this value to test the blocked state (100 = blocked, < 100 = allowed)
  const [savedAssessmentCount] = useState(100); // Set to 100 to show blocked state
  
  const isAtLimit = savedAssessmentCount >= MAX_SAVED_ASSESSMENTS;
  
  // Log creation blocked event
  useEffect(() => {
    if (isAtLimit) {
      const eventLog = `[${new Date().toISOString()}] Assessment creation blocked - User reached ${savedAssessmentCount}/${MAX_SAVED_ASSESSMENTS} limit`;
      console.log('📊 SYSTEM LOG:', eventLog);
    }
  }, [isAtLimit, savedAssessmentCount]);
  
  const handleNavigateToManage = () => {
    // Navigate to manage assessments to delete old papers
    navigate('/');
    // In real implementation, this would navigate to the manage section
    window.dispatchEvent(new CustomEvent('navigate-to-section', { detail: 'manage-assessments' }));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create Assessments</h1>
        <p className="text-muted-foreground mt-1">
          Generate test papers and worksheets easily with our teacher-friendly assessment creation tools
        </p>
      </div>

      {/* Storage Limit Warning Banner */}
      {isAtLimit && (
        <Alert variant="destructive" className="border-2 border-destructive bg-destructive/10">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">Assessment Storage Limit Reached</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>
              You have saved <strong>{savedAssessmentCount}</strong> assessments, which is the maximum allowed limit of <strong>{MAX_SAVED_ASSESSMENTS}</strong> papers.
            </p>
            <p>
              To create new assessments, please delete some existing papers from your repository to free up space.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <Button 
                variant="outline" 
                onClick={handleNavigateToManage}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Go to Manage Assessments
              </Button>
              <span className="text-sm text-muted-foreground">
                Delete old papers to create new ones
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Near Limit Warning (90%+) */}
      {!isAtLimit && savedAssessmentCount >= MAX_SAVED_ASSESSMENTS * 0.9 && (
        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-400">Approaching Storage Limit</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            You have used <strong>{savedAssessmentCount}</strong> of <strong>{MAX_SAVED_ASSESSMENTS}</strong> assessment slots. 
            Consider archiving old assessments to ensure you can continue creating new ones.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="automated" className="flex items-center space-x-2" disabled={isAtLimit}>
            <Zap className="w-4 h-4" />
            <span>Quick Generation</span>
            <Badge variant="outline" className="ml-2 text-xs">Fast & Easy</Badge>
          </TabsTrigger>
          <TabsTrigger value="customised" className="flex items-center space-x-2" disabled={isAtLimit}>
            <Settings className="w-4 h-4" />
            <span>Build Your Own</span>
            <Badge variant="secondary" className="ml-2 text-xs">Full Control</Badge>
          </TabsTrigger>
          <TabsTrigger value="blueprints" className="flex items-center space-x-2">
            <BookTemplate className="w-4 h-4" />
            <span>Create Blueprints</span>
            <Badge variant="outline" className="ml-2 text-xs">Manage Templates</Badge>
          </TabsTrigger>
          <TabsTrigger value="personalized" className="flex items-center space-x-2" disabled={isAtLimit}>
            <UserCheck className="w-4 h-4" />
            <span>Personalised Worksheet</span>
            <Badge variant="outline" className="ml-2 text-xs">Student-specific</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automated" className="mt-6">
          {isAtLimit ? (
            <Card className="border-destructive/50">
              <CardContent className="py-12 text-center">
                <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Creation Disabled</h3>
                <p className="text-muted-foreground mb-4">
                  You cannot create new assessments until you free up storage space.
                </p>
                <Button variant="outline" onClick={handleNavigateToManage}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Manage Assessments
                </Button>
              </CardContent>
            </Card>
          ) : (
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
          )}
        </TabsContent>

        <TabsContent value="customised" className="mt-6">
          {isAtLimit ? (
            <Card className="border-destructive/50">
              <CardContent className="py-12 text-center">
                <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Creation Disabled</h3>
                <p className="text-muted-foreground mb-4">
                  You cannot create new assessments until you free up storage space.
                </p>
                <Button variant="outline" onClick={handleNavigateToManage}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Manage Assessments
                </Button>
              </CardContent>
            </Card>
          ) : (
            <CustomisedGeneration />
          )}
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

        <TabsContent value="personalized" className="mt-6">
          {isAtLimit ? (
            <Card className="border-destructive/50">
              <CardContent className="py-12 text-center">
                <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Creation Disabled</h3>
                <p className="text-muted-foreground mb-4">
                  You cannot create new assessments until you free up storage space.
                </p>
                <Button variant="outline" onClick={handleNavigateToManage}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Manage Assessments
                </Button>
              </CardContent>
            </Card>
          ) : (
            <PersonalizedWorksheet />
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default CreateAssessments;