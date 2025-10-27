import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Upload, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHasRole } from '@/hooks/useUserRoles';
import RoleAssignmentHelper from './RoleAssignmentHelper';

const MasterDataDashboard = () => {
  const navigate = useNavigate();
  const { hasRole: isSystemAdmin } = useHasRole('system_admin');
  const { hasRole: isStateAdmin } = useHasRole('state_admin');

  const modules = [
    {
      title: 'Knowledge Graphs',
      description: 'Define and manage curriculum structures for different contexts',
      icon: GitBranch,
      path: '/master-data/knowledge-graphs',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      accessible: isSystemAdmin,
      role: 'System Admin Only',
    },
    {
      title: 'Upload Master Data',
      description: 'Upload curriculum data via CSV or manual entry (Draft → Live workflow)',
      icon: Upload,
      path: '/master-data/upload',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      accessible: isStateAdmin || isSystemAdmin,
      role: 'State Admin',
    },
    {
      title: 'View Data',
      description: 'Browse and search all live master data entries',
      icon: Database,
      path: '/master-data/data-view',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      accessible: true,
      role: 'All Users',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-foreground">Master Data Management</h1>
        <p className="text-muted-foreground mt-2">
          Knowledge Graph-based curriculum data management with Draft/Live staging workflow
        </p>
      </div>

      {/* Role Assignment Helper */}
      <RoleAssignmentHelper />

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Card
              key={module.path}
              className={`hover:shadow-lg transition-all ${
                !module.accessible ? 'opacity-60' : 'cursor-pointer'
              }`}
              onClick={() => module.accessible && navigate(module.path)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${module.bgColor} flex items-center justify-center mb-3`}>
                  <Icon className={`h-6 w-6 ${module.color}`} />
                </div>
                <CardTitle className="flex items-center justify-between">
                  {module.title}
                  <Badge variant={module.accessible ? "secondary" : "outline"}>
                    {module.role}
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-2">
                  {module.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant={module.accessible ? "default" : "outline"}
                  className="w-full"
                  disabled={!module.accessible}
                >
                  {module.accessible ? 'Open' : 'Access Restricted'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Section */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="font-semibold">Configure</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                System admins create Knowledge Graphs defining the field hierarchy for different curriculum contexts
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="font-semibold">Upload</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                State admins upload data via CSV or manual entry. All data goes to Draft state for review
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="font-semibold">Publish</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Lead admins review and publish Draft data to Live, making it available for content creation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterDataDashboard;