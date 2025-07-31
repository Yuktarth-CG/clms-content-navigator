import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Brain, Bug, Lightbulb } from 'lucide-react';
import DebugPanel from './DebugPanel';
import EnhancedDebugPanel from './EnhancedDebugPanel';

const DebugCenter = () => {
  const [selectedView, setSelectedView] = useState<'system' | 'enhanced'>('enhanced');

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Debug Center</h1>
          </div>
          <p className="text-gray-600">
            Track AI requests, analyze failures, and improve system performance through intelligent debugging
          </p>
        </div>

        <Tabs value={selectedView} onValueChange={(value: string) => setSelectedView(value as 'system' | 'enhanced')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="system" className="flex items-center space-x-2">
              <Bug className="w-4 h-4" />
              <span>System Logs</span>
            </TabsTrigger>
            <TabsTrigger value="enhanced" className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4" />
              <span>AI Learning</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="system" className="mt-6">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bug className="w-5 h-5 text-gray-600" />
                  <span>System Debug Logs</span>
                </CardTitle>
                <CardDescription>
                  Real-time system activity and debugging information
                </CardDescription>
              </CardHeader>
              <CardContent className="h-full p-0">
                <div className="h-full border rounded-lg overflow-hidden">
                  <DebugPanel />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="enhanced" className="mt-6">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-purple-600" />
                  <span>AI Learning Center</span>
                </CardTitle>
                <CardDescription>
                  Track requests, analyze failures, and learn from patterns to improve AI performance
                </CardDescription>
              </CardHeader>
              <CardContent className="h-full p-0">
                <div className="h-full border rounded-lg overflow-hidden">
                  <EnhancedDebugPanel />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DebugCenter;