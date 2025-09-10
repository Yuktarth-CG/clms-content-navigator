import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye } from 'lucide-react';

const DataView = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/master-data')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Data View</h2>
          <p className="text-muted-foreground">Browse and manage master data entries</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Master Data Browser
          </CardTitle>
          <CardDescription>
            View, search, and manage all your master data entries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Data browser interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataView;