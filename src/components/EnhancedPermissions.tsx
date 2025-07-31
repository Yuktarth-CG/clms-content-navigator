
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface PermissionNode {
  id: string;
  name: string;
  description?: string;
  children?: PermissionNode[];
  isAction?: boolean;
}

interface EnhancedPermissionsProps {
  permissions: any;
  onPermissionChange: (path: string[], value: boolean) => void;
}

// Updated permission structure based on PRD
const permissionStructure: PermissionNode[] = [
  {
    id: 'cms',
    name: 'Content Management System (CMS)',
    children: [
      {
        id: 'questions',
        name: 'Questions',
        children: [
          { id: 'view', name: 'View', description: 'Question data + Metadata + Tags', isAction: true },
          { id: 'create', name: 'Create/Submit', description: 'Create new questions', isAction: true },
          { id: 'edit', name: 'Update/Edit', description: 'Modify existing questions', isAction: true },
          { id: 'delete', name: 'Delete', description: 'Remove questions', isAction: true },
          { id: 'approve', name: 'Approve', description: 'Approve submitted questions', isAction: true },
          { id: 'reject', name: 'Reject', description: 'Reject submitted questions', isAction: true },
          { id: 'archive', name: 'Archive', description: 'Archive published questions', isAction: true },
          { id: 'publish', name: 'Publish', description: 'Publish approved questions', isAction: true },
          { id: 'translate', name: 'Translate', description: 'Translate question data', isAction: true },
          { id: 'comment', name: 'Comment', description: 'Add comments to questions', isAction: true }
        ]
      },
      {
        id: 'multimedia',
        name: 'Multimedia',
        children: [
          { id: 'view', name: 'View', isAction: true },
          { id: 'create', name: 'Create', description: 'Upload media files', isAction: true },
          { id: 'edit', name: 'Edit', isAction: true },
          { id: 'delete', name: 'Delete', isAction: true },
          { id: 'publish', name: 'Publish', isAction: true }
        ]
      }
    ]
  },
  {
    id: 'lms',
    name: 'Learning Management System (LMS)',
    children: [
      {
        id: 'mapping',
        name: 'Mapping (SwiftClass, etc)',
        children: [
          { id: 'create', name: 'Create', isAction: true },
          { id: 'edit', name: 'Edit', isAction: true },
          { id: 'publish', name: 'Publish', isAction: true }
        ]
      },
      {
        id: 'worksheet',
        name: 'Worksheet',
        children: [
          { id: 'view', name: 'View Worksheet List', isAction: true },
          { id: 'create', name: 'Create/Edit Worksheet', isAction: true },
          { id: 'delete', name: 'Delete Worksheet', isAction: true },
          { id: 'publish', name: 'Publish Worksheet', isAction: true },
          { id: 'archive', name: 'Archive Worksheet', isAction: true },
          { id: 'download', name: 'Download Worksheet', isAction: true }
        ]
      },
      {
        id: 'testPaper',
        name: 'Test Paper',
        children: [
          { id: 'view', name: 'View Test Paper List', isAction: true },
          { id: 'create', name: 'Create/Edit Test Paper', isAction: true },
          { id: 'delete', name: 'Delete Test Paper', isAction: true },
          { id: 'publish', name: 'Publish Test Paper', isAction: true },
          { id: 'archive', name: 'Archive Test Paper', isAction: true },
          { id: 'download', name: 'Download Test Paper', isAction: true }
        ]
      }
    ]
  },
  {
    id: 'userManagement',
    name: 'User Management',
    children: [
      {
        id: 'user',
        name: 'User',
        children: [
          { id: 'view', name: 'View', description: 'View user list and details', isAction: true },
          { id: 'create', name: 'Create', description: 'Create new users', isAction: true },
          { id: 'edit', name: 'Edit', description: 'Edit user details', isAction: true },
          { id: 'delete', name: 'Delete', description: 'Deactivate/reactivate users', isAction: true }
        ]
      },
      {
        id: 'role',
        name: 'Role',
        children: [
          { id: 'view', name: 'View', description: 'View role definitions', isAction: true },
          { id: 'create', name: 'Create', description: 'Create new roles', isAction: true },
          { id: 'edit', name: 'Edit', description: 'Edit role permissions', isAction: true },
          { id: 'assign', name: 'Assign Permissions', description: 'Assign permissions to roles', isAction: true },
          { id: 'delete', name: 'Delete', description: 'Delete roles', isAction: true }
        ]
      }
    ]
  },
  {
    id: 'export',
    name: 'Export',
    children: [
      {
        id: 'csv',
        name: 'CSV Export',
        children: [
          { id: 'downloadQuestions', name: 'Download Questions', description: 'Export questions as CSV', isAction: true },
          { id: 'downloadTags', name: 'Download Tags', description: 'Export LO Code, Question format, Medium', isAction: true }
        ]
      },
      {
        id: 'product',
        name: 'Product Export',
        children: [
          { id: 'exportToProduct', name: 'Export to Product', description: 'Generate product-ready bundles', isAction: true }
        ]
      }
    ]
  },
  {
    id: 'taggingManagement',
    name: 'Tagging Management/Master Data',
    children: [
      { id: 'viewLearningOutcome', name: 'View Learning Outcome', isAction: true },
      { id: 'editSubject', name: 'Edit Subject', isAction: true },
      { id: 'createMediums', name: 'Create Mediums', isAction: true },
      { id: 'deleteSkills', name: 'Delete Skills/EOMs/EOC', isAction: true },
      { id: 'manageDifficulty', name: 'Manage Difficulty Tags', isAction: true },
      { id: 'manageGrade', name: 'Manage Grade Tags', isAction: true },
      { id: 'manageChapter', name: 'Manage Chapter Tags', isAction: true },
      { id: 'manageTopic', name: 'Manage Topic Tags', isAction: true },
      { id: 'manageCompetency', name: 'Manage Competency Tags', isAction: true },
      { id: 'manageProduct', name: 'Manage Product Tags', isAction: true }
    ]
  }
];

const EnhancedPermissions: React.FC<EnhancedPermissionsProps> = ({
  permissions,
  onPermissionChange
}) => {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set(['cms']));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getPermissionValue = (path: string[]): boolean => {
    let current = permissions;
    console.log('Checking permission path:', path, 'in permissions:', permissions);
    for (const key of path) {
      if (current && typeof current === 'object') {
        current = current[key];
        console.log(`Step: ${key} -> `, current);
      } else {
        console.log('Failed at key:', key, 'current was:', current);
        return false;
      }
    }
    const result = Boolean(current);
    console.log('Final result for path', path, ':', result);
    return result;
  };

  const renderPermissionNode = (node: PermissionNode, path: string[] = []) => {
    const currentPath = [...path, node.id];
    const isExpanded = expandedSections.has(currentPath.join('.'));
    
    if (node.isAction) {
      return (
        <div key={node.id} className="flex items-center space-x-2 py-1">
          <Checkbox
            id={currentPath.join('.')}
            checked={getPermissionValue(currentPath)}
            onCheckedChange={(checked) => {
              onPermissionChange(currentPath, Boolean(checked));
            }}
          />
          <Label htmlFor={currentPath.join('.')} className="text-sm">
            {node.name}
            {node.description && (
              <span className="text-xs text-muted-foreground ml-2">
                ({node.description})
              </span>
            )}
          </Label>
        </div>
      );
    }

    return (
      <div key={node.id} className="space-y-2">
        <Collapsible
          open={isExpanded}
          onOpenChange={() => toggleSection(currentPath.join('.'))}
        >
          <CollapsibleTrigger className="flex items-center space-x-2 hover:bg-muted/50 p-2 rounded w-full text-left">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span className="font-medium">{node.name}</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-6 space-y-2">
            {node.children?.map(child => renderPermissionNode(child, currentPath))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enhanced Permissions Structure</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {permissionStructure.map(node => renderPermissionNode(node))}
      </CardContent>
    </Card>
  );
};

export default EnhancedPermissions;
