import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Settings, Users, FileText, Download, Database } from 'lucide-react';

interface PermissionCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  permissions: {
    id: string;
    name: string;
    description: string;
  }[];
}

interface InteractivePermissionsGridProps {
  permissions: any;
  onPermissionChange: (path: string[], value: boolean) => void;
}

const permissionCategories: PermissionCategory[] = [
  {
    id: 'cms',
    name: 'Content Management',
    icon: FileText,
    description: 'Manage questions, multimedia, and content lifecycle',
    permissions: [
      { id: 'cms.questions.view', name: 'View Questions', description: 'Access question data and metadata' },
      { id: 'cms.questions.create', name: 'Create Questions', description: 'Submit new questions' },
      { id: 'cms.questions.edit', name: 'Edit Questions', description: 'Modify existing questions' },
      { id: 'cms.questions.delete', name: 'Delete Questions', description: 'Remove questions' },
      { id: 'cms.questions.approve', name: 'Approve Questions', description: 'Approve submitted questions' },
      { id: 'cms.questions.reject', name: 'Reject Questions', description: 'Reject submitted questions' },
      { id: 'cms.questions.publish', name: 'Publish Questions', description: 'Publish approved questions' },
      { id: 'cms.questions.archive', name: 'Archive Questions', description: 'Archive published questions' },
      { id: 'cms.multimedia.view', name: 'View Media', description: 'Access multimedia files' },
      { id: 'cms.multimedia.create', name: 'Upload Media', description: 'Upload new media files' },
      { id: 'cms.multimedia.edit', name: 'Edit Media', description: 'Modify media files' },
      { id: 'cms.multimedia.delete', name: 'Delete Media', description: 'Remove media files' },
    ]
  },
  {
    id: 'lms',
    name: 'Learning Management',
    icon: Settings,
    description: 'Create and manage worksheets, test papers, and mappings',
    permissions: [
      { id: 'lms.worksheet.view', name: 'View Worksheets', description: 'Access worksheet listings' },
      { id: 'lms.worksheet.create', name: 'Create Worksheets', description: 'Create and edit worksheets' },
      { id: 'lms.worksheet.delete', name: 'Delete Worksheets', description: 'Remove worksheets' },
      { id: 'lms.worksheet.publish', name: 'Publish Worksheets', description: 'Publish worksheets' },
      { id: 'lms.worksheet.download', name: 'Download Worksheets', description: 'Download worksheet files' },
      { id: 'lms.testPaper.view', name: 'View Test Papers', description: 'Access test paper listings' },
      { id: 'lms.testPaper.create', name: 'Create Test Papers', description: 'Create and edit test papers' },
      { id: 'lms.testPaper.delete', name: 'Delete Test Papers', description: 'Remove test papers' },
      { id: 'lms.testPaper.publish', name: 'Publish Test Papers', description: 'Publish test papers' },
      { id: 'lms.testPaper.download', name: 'Download Test Papers', description: 'Download test paper files' },
    ]
  },
  {
    id: 'userManagement',
    name: 'User Management',
    icon: Users,
    description: 'Manage users, roles, and permissions',
    permissions: [
      { id: 'userManagement.user.view', name: 'View Users', description: 'Access user listings and details' },
      { id: 'userManagement.user.create', name: 'Create Users', description: 'Add new users to the system' },
      { id: 'userManagement.user.edit', name: 'Edit Users', description: 'Modify user information' },
      { id: 'userManagement.user.delete', name: 'Delete Users', description: 'Deactivate or remove users' },
      { id: 'userManagement.role.view', name: 'View Roles', description: 'Access role definitions' },
      { id: 'userManagement.role.create', name: 'Create Roles', description: 'Define new user roles' },
      { id: 'userManagement.role.edit', name: 'Edit Roles', description: 'Modify role permissions' },
      { id: 'userManagement.role.assign', name: 'Assign Permissions', description: 'Assign permissions to roles' },
    ]
  },
  {
    id: 'export',
    name: 'Export & Reporting',
    icon: Download,
    description: 'Export data and generate reports',
    permissions: [
      { id: 'export.csv.downloadQuestions', name: 'Export Questions CSV', description: 'Download questions as CSV files' },
      { id: 'export.csv.downloadTags', name: 'Export Tags CSV', description: 'Download tag data as CSV' },
      { id: 'export.product.exportToProduct', name: 'Product Export', description: 'Generate product-ready bundles' },
    ]
  },
  {
    id: 'taggingManagement',
    name: 'Master Data',
    icon: Database,
    description: 'Manage tags, subjects, and taxonomy',
    permissions: [
      { id: 'taggingManagement.viewLearningOutcome', name: 'View Learning Outcomes', description: 'Access learning outcome data' },
      { id: 'taggingManagement.editSubject', name: 'Edit Subjects', description: 'Modify subject classifications' },
      { id: 'taggingManagement.createMediums', name: 'Create Mediums', description: 'Add new medium types' },
      { id: 'taggingManagement.deleteSkills', name: 'Delete Skills', description: 'Remove skill classifications' },
      { id: 'taggingManagement.manageDifficulty', name: 'Manage Difficulty', description: 'Control difficulty tags' },
      { id: 'taggingManagement.manageGrade', name: 'Manage Grades', description: 'Control grade classifications' },
      { id: 'taggingManagement.manageChapter', name: 'Manage Chapters', description: 'Control chapter tags' },
      { id: 'taggingManagement.manageTopic', name: 'Manage Topics', description: 'Control topic classifications' },
    ]
  }
];

const InteractivePermissionsGrid: React.FC<InteractivePermissionsGridProps> = ({
  permissions,
  onPermissionChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const getPermissionValue = (permissionId: string): boolean => {
    const path = permissionId.split('.');
    let current = permissions;
    
    for (const key of path) {
      if (current && typeof current === 'object') {
        current = current[key];
      } else {
        return false;
      }
    }
    
    return Boolean(current);
  };

  const handlePermissionToggle = (permissionId: string, value: boolean) => {
    const path = permissionId.split('.');
    onPermissionChange(path, value);
  };

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return permissionCategories;
    
    return permissionCategories.map(category => ({
      ...category,
      permissions: category.permissions.filter(
        permission =>
          permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          permission.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(category => category.permissions.length > 0);
  }, [searchTerm]);

  const selectedPermissions = useMemo(() => {
    const selected: string[] = [];
    permissionCategories.forEach(category => {
      category.permissions.forEach(permission => {
        if (getPermissionValue(permission.id)) {
          selected.push(permission.name);
        }
      });
    });
    return selected;
  }, [permissions]);

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Assign Permissions</h3>
          <p className="text-sm text-muted-foreground">
            Select the permissions for this role. Use the search to quickly find specific permissions.
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search permissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              const categoryPermissions = category.permissions.filter(p => 
                getPermissionValue(p.id)
              ).length;
              
              return (
                <Card 
                  key={category.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCategory === category.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedCategory(
                    selectedCategory === category.id ? null : category.id
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-5 h-5 text-primary" />
                        <CardTitle className="text-sm">{category.name}</CardTitle>
                      </div>
                      {categoryPermissions > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {categoryPermissions}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-3">
                      {category.description}
                    </p>
                    
                    <div className="space-y-2">
                      {category.permissions.slice(0, 3).map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between">
                          <Label htmlFor={permission.id} className="text-xs font-normal flex-1">
                            {permission.name}
                          </Label>
                          <Switch
                            id={permission.id}
                            checked={getPermissionValue(permission.id)}
                            onCheckedChange={(checked) => 
                              handlePermissionToggle(permission.id, checked)
                            }
                          />
                        </div>
                      ))}
                      
                      {category.permissions.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{category.permissions.length - 3} more permissions
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Expanded Category Details */}
          {selectedCategory && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {(() => {
                    const category = permissionCategories.find(c => c.id === selectedCategory);
                    const Icon = category?.icon || Settings;
                    return (
                      <>
                        <Icon className="w-5 h-5" />
                        <span>{category?.name} - All Permissions</span>
                      </>
                    );
                  })()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {permissionCategories
                    .find(c => c.id === selectedCategory)
                    ?.permissions.map((permission) => (
                    <div key={permission.id} className="flex items-start justify-between space-x-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <Label htmlFor={permission.id} className="text-sm font-medium">
                          {permission.name}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          {permission.description}
                        </p>
                      </div>
                      <Switch
                        id={permission.id}
                        checked={getPermissionValue(permission.id)}
                        onCheckedChange={(checked) => 
                          handlePermissionToggle(permission.id, checked)
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Selected Permissions Preview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Selected Permissions</CardTitle>
              <p className="text-xs text-muted-foreground">
                {selectedPermissions.length} permissions selected
              </p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {selectedPermissions.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    No permissions selected
                  </p>
                ) : (
                  <div className="space-y-1">
                    {selectedPermissions.map((permission, index) => (
                      <div key={index} className="text-xs p-2 bg-muted rounded">
                        {permission}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InteractivePermissionsGrid;