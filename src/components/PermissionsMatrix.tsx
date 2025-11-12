import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Plus, Edit, CheckCircle, Globe, Archive, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb } from 'lucide-react';

interface PermissionsMatrixProps {
  selectedRoles: string[];
  mergedPermissions: any;
}

const PermissionsMatrix = ({ selectedRoles, mergedPermissions }: PermissionsMatrixProps) => {
  const permissionCategories = [
    {
      id: 'cms',
      label: 'CMS',
      modules: [
        { id: 'content', label: 'Content' },
        { id: 'questions', label: 'Questions' },
      ]
    },
    {
      id: 'lms',
      label: 'LMS',
      modules: [
        { id: 'mapping', label: 'Mapping' },
        { id: 'testPaper', label: 'Test Paper' },
        { id: 'worksheet', label: 'Worksheet' },
      ]
    },
    {
      id: 'userMgmt',
      label: 'User & Role Management',
      modules: [
        { id: 'users', label: 'Users' },
        { id: 'roles', label: 'Roles' },
      ]
    }
  ];

  const actions = [
    { id: 'view', label: 'View', icon: Eye, color: 'text-blue-500' },
    { id: 'create', label: 'Create', icon: Plus, color: 'text-green-500' },
    { id: 'edit', label: 'Edit', icon: Edit, color: 'text-yellow-500' },
    { id: 'review', label: 'Review', icon: CheckCircle, color: 'text-green-600' },
    { id: 'publish', label: 'Publish', icon: Globe, color: 'text-blue-600' },
    { id: 'archive', label: 'Archive', icon: Archive, color: 'text-gray-500' },
    { id: 'download', label: 'Download', icon: Download, color: 'text-purple-500' },
  ];

  const getPermissionValue = (category: string, module: string, action: string) => {
    // This is a simplified version - you would map your actual permissions structure here
    const categoryPerms = mergedPermissions[category];
    if (!categoryPerms) return false;
    
    // Map action IDs to actual permission keys
    const actionMap: Record<string, string> = {
      'view': 'view',
      'create': 'create',
      'edit': 'edit',
      'review': 'approve',
      'publish': 'publish',
      'archive': 'archive',
      'download': 'downloadCSV'
    };
    
    return categoryPerms[actionMap[action]] || false;
  };

  if (selectedRoles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">Permissions</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Read-only view of merged permissions from selected roles
        </p>
      </div>

      <div className="flex gap-6">
        {/* Left sidebar - Categories */}
        <div className="w-48 space-y-2">
          {permissionCategories.map((category, idx) => (
            <div key={category.id}>
              <div className={`flex items-center space-x-2 p-3 rounded-lg ${idx === 1 ? 'bg-blue-50 border border-blue-200' : 'hover:bg-muted/50'}`}>
                <Checkbox checked={idx === 1} disabled className="pointer-events-none" />
                <Label className="font-medium cursor-default">{category.label}</Label>
              </div>
            </div>
          ))}
        </div>

        {/* Right side - Permissions matrix */}
        <div className="flex-1 border rounded-lg p-4 bg-muted/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  {actions.map((action) => (
                    <th key={action.id} className="text-center py-3 px-2">
                      <div className="flex flex-col items-center gap-1">
                        <action.icon className={`h-4 w-4 ${action.color}`} />
                        <span className="text-xs font-medium">{action.label}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissionCategories[1].modules.map((module) => (
                  <tr key={module.id} className="border-b hover:bg-muted/30">
                    <td className="py-3 px-4 font-medium">{module.label}</td>
                    {actions.map((action) => (
                      <td key={action.id} className="text-center py-3 px-2">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={getPermissionValue('lms', module.id, action.id)}
                            disabled
                            className="pointer-events-none"
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Tip */}
      <Alert className="bg-yellow-50 border-yellow-200">
        <Lightbulb className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Quick Tip:</strong> Choose the appropriate role to auto-configure basic permissions.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PermissionsMatrix;
