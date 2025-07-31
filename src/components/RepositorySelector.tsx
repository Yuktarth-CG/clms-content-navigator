
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Globe, Info } from 'lucide-react';
import { RepositoryType } from '@/types/content';

interface RepositorySelectorProps {
  selectedRepository: RepositoryType;
  onRepositoryChange: (repository: RepositoryType) => void;
  userRole: string;
}

const RepositorySelector = ({ selectedRepository, onRepositoryChange, userRole }: RepositorySelectorProps) => {
  const canAccessPrivate = ['SuperAdmin', 'State Official'].includes(userRole);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Content Repository</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Public Repository Option */}
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedRepository === 'Public' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
          }`}
          onClick={() => onRepositoryChange('Public')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Globe className="w-5 h-5 text-blue-600" />
              <span>Public Repository</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              General educational content available for internal use and bots.
            </p>
            <div className="flex items-center space-x-1 text-xs text-blue-600">
              <Info className="w-3 h-3" />
              <span>Accessible to all content managers</span>
            </div>
          </CardContent>
        </Card>

        {/* Private Repository Option */}
        <Card 
          className={`transition-all ${
            canAccessPrivate 
              ? `cursor-pointer hover:shadow-md ${
                  selectedRepository === 'Private' ? 'ring-2 ring-gray-600 bg-gray-50' : ''
                }` 
              : 'opacity-50 cursor-not-allowed'
          }`}
          onClick={canAccessPrivate ? () => onRepositoryChange('Private') : undefined}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Lock className="w-5 h-5 text-gray-700" />
              <span>Private Repository</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Highly secure content for official assessments and board exams.
            </p>
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <Info className="w-3 h-3" />
              <span>
                {canAccessPrivate 
                  ? 'Restricted to SuperAdmins and State Officials' 
                  : 'Access denied for your role'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RepositorySelector;
