import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings } from 'lucide-react';

const HierarchyConfig = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/master-data')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Hierarchy Configuration</h2>
          <p className="text-muted-foreground">Configure your state's curriculum hierarchy</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Field Configuration
          </CardTitle>
          <CardDescription>
            Configure which fields are active and required for your state.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Configuration interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HierarchyConfig;