import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, CheckCircle, XCircle, AlertTriangle, FileText, Users, Clock, RotateCcw, Edit2, UserX, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import InteractivePermissionsGrid from './InteractivePermissionsGrid';

// Enhanced permission structure based on provided data
const PERMISSION_MODULES = {
  CMS: {
    Questions: ['View', 'Create/Submit', 'Update/Edit', 'Delete', 'Approve', 'Reject', 'Archive', 'Publish', 'Translate', 'Comment'],
    Multimedia: ['View', 'Create', 'Edit', 'Delete', 'Publish']
  },
  LMS: {
    'Mapping (SwiftClass, etc)': ['Create', 'Edit', 'Publish'],
    Worksheet: ['View Worksheet List', 'Create/Edit Worksheet', 'Delete Worksheet', 'Publish Worksheet', 'Archive Worksheet', 'Download Worksheet'],
    'Test Paper': ['View Test Paper List', 'Create/Edit Test Paper', 'Delete Test Paper', 'Publish Test Paper', 'Archive Test Paper', 'Download Test Paper']
  },
  'User Management': {
    User: ['View', 'Create', 'Edit', 'Delete'],
    Role: ['View', 'Create', 'Edit', 'Assign', 'Delete']
  },
  Export: {
    Questions: ['Download'],
    Tags: ['Download']
  },
  'Tagging Management/Master Data': {
    'Learning Outcome': ['View'],
    Subject: ['Edit'],
    Mediums: ['Create'],
    'Skills/EOMs/EOC': ['Delete'],
    'Difficulty Tags': ['View', 'Create', 'Edit', 'Delete'],
    'Grade tags': ['View', 'Create', 'Edit', 'Delete'],
    'Chapter Tags': ['View', 'Create', 'Edit', 'Delete'],
    'Topic Tags': ['View', 'Create', 'Edit', 'Delete'],
    'Competency Tags': ['View', 'Create', 'Edit', 'Delete'],
    'Product Tags': ['View', 'Create', 'Edit', 'Delete']
  }
};

interface BulkUserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  permissions: Record<string, any>;
  isValid: boolean;
  errors: string[];
  isSelected: boolean;
  validationStatus: 'valid' | 'duplicate' | 'exists' | 'missing_data' | 'invalid_format';
  isEditing?: boolean;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  type: 'duplicate' | 'exists' | 'missing' | 'format' | 'validation';
}

interface ImportStatus {
  id: string;
  fileName: string;
  startTime: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  canRollback: boolean;
  rollbackDeadline?: string;
}

const BulkUserUpload = ({ onClose }: { onClose: () => void }) => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'role-selection' | 'upload' | 'validate' | 'processing' | 'complete'>('role-selection');
  const [uploadedData, setUploadedData] = useState<BulkUserData[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);
  const [processedResults, setProcessedResults] = useState<{
    successful: number;
    failed: number;
    skipped: BulkUserData[];
  } | null>(null);
  const [importedUsers, setImportedUsers] = useState<BulkUserData[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, any>>>({});

  // Enhanced validation configuration
  const MAX_USERS_PER_IMPORT = 100;
  const MAX_FILE_SIZE_MB = 2;

  // Default permissions for each role - transformed to match EnhancedPermissions structure
  const getDefaultPermissions = (role: string): Record<string, any> => {
    const transformPermissions = (perms: Record<string, any>): Record<string, any> => {
      const transformed: Record<string, any> = {};
      
      for (const [module, modulePerms] of Object.entries(perms)) {
        const moduleKey = module.toLowerCase().replace(/\s+/g, '');
        transformed[moduleKey] = {};
        
        for (const [section, sectionPerms] of Object.entries(modulePerms as Record<string, string[]>)) {
          const sectionKey = section.toLowerCase().replace(/[^a-z0-9]/g, '');
          transformed[moduleKey][sectionKey] = {};
          
          // Transform array of permission names to boolean structure
          if (Array.isArray(sectionPerms)) {
            sectionPerms.forEach(perm => {
              const permKey = perm.toLowerCase().replace(/[^a-z0-9]/g, '');
              transformed[moduleKey][sectionKey][permKey] = true;
            });
          }
        }
      }
      
      return transformed;
    };

    switch (role) {
      case 'SuperAdmin':
        return transformPermissions({
          CMS: {
            Questions: ['View', 'Create/Submit', 'Update/Edit', 'Delete', 'Approve', 'Reject', 'Archive', 'Publish', 'Translate', 'Comment'],
            Multimedia: ['View', 'Create', 'Edit', 'Delete', 'Publish']
          },
          LMS: {
            'Mapping': ['Create', 'Edit', 'Publish'],
            Worksheet: ['View Worksheet List', 'Create/Edit Worksheet', 'Delete Worksheet', 'Publish Worksheet', 'Archive Worksheet', 'Download Worksheet'],
            'Test Paper': ['View Test Paper List', 'Create/Edit Test Paper', 'Delete Test Paper', 'Publish Test Paper', 'Archive Test Paper', 'Download Test Paper']
          },
          'User Management': {
            User: ['View', 'Create', 'Edit', 'Delete'],
            Role: ['View', 'Create', 'Edit', 'Assign', 'Delete']
          }
        });
      case 'Admin':
        return transformPermissions({
          CMS: {
            Questions: ['View', 'Create/Submit', 'Update/Edit', 'Delete', 'Approve', 'Reject', 'Archive', 'Publish', 'Comment'],
            Multimedia: ['View', 'Create', 'Edit', 'Delete', 'Publish']
          },
          LMS: {
            'Mapping': ['Create', 'Edit', 'Publish'],
            Worksheet: ['View Worksheet List', 'Create/Edit Worksheet', 'Delete Worksheet', 'Publish Worksheet', 'Archive Worksheet', 'Download Worksheet'],
            'Test Paper': ['View Test Paper List', 'Create/Edit Test Paper', 'Delete Test Paper', 'Publish Test Paper', 'Archive Test Paper', 'Download Test Paper']
          },
          'User Management': {
            User: ['View', 'Create', 'Edit'],
            Role: ['View', 'Assign']
          }
        });
      case 'Reviewer':
        return transformPermissions({
          CMS: {
            Questions: ['View', 'Approve', 'Reject', 'Comment'],
            Multimedia: ['View']
          },
          LMS: {
            Worksheet: ['View Worksheet List', 'Download Worksheet'],
            'Test Paper': ['View Test Paper List', 'Download Test Paper']
          }
        });
      case 'Creator':
        return transformPermissions({
          CMS: {
            Questions: ['View', 'Create/Submit', 'Update/Edit', 'Comment'],
            Multimedia: ['View', 'Create', 'Edit']
          },
          LMS: {
            Worksheet: ['View Worksheet List', 'Create/Edit Worksheet', 'Download Worksheet'],
            'Test Paper': ['View Test Paper List', 'Create/Edit Test Paper', 'Download Test Paper']
          }
        });
      case 'Translator':
        return transformPermissions({
          CMS: {
            Questions: ['View', 'Translate', 'Comment'],
            Multimedia: ['View']
          }
        });
      default:
        return {};
    }
  };

  // Simulated existing users database
  const existingUsers = [
    { email: 'existing@example.com', id: 'user-001' },
    { email: 'admin@company.com', id: 'user-002' },
    { email: 'test@example.com', id: 'user-003' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast({
        title: "File size exceeds limit",
        description: `CSV file size exceeds ${MAX_FILE_SIZE_MB}MB limit.`,
        variant: "destructive"
      });
      return;
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file format",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSVData(text, file.name);
    };
    reader.readAsText(file);
  };

  const parseCSVData = (csvText: string, fileName: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    
    if (lines.length - 1 > MAX_USERS_PER_IMPORT) {
      toast({
        title: "User limit exceeded",
        description: `Maximum ${MAX_USERS_PER_IMPORT} users allowed per import batch.`,
        variant: "destructive"
      });
      return;
    }

    const data: BulkUserData[] = [];
    const errors: ValidationError[] = [];
    const emailTracker = new Map<string, number>();

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const rowData: any = {};
      
      headers.forEach((header, index) => {
        rowData[header] = values[index] || '';
      });

      const rowErrors: string[] = [];
      let validationStatus: BulkUserData['validationStatus'] = 'valid';
      
      // Enhanced validation logic
      
      // 1. Missing unique ID or required fields
      if (!rowData.email) {
        rowErrors.push('Email is required (unique identifier)');
        validationStatus = 'missing_data';
        errors.push({
          row: i,
          field: 'email',
          message: 'Missing required unique identifier (email)',
          type: 'missing'
        });
      }
      
      // Handle both "name" and "first name"/"last name" formats
      const firstName = rowData['first name'] || rowData.firstname || '';
      const lastName = rowData['last name'] || rowData.lastname || '';
      const fullName = rowData.name || `${firstName} ${lastName}`.trim();
      
      if (!fullName || fullName.length < 2 || fullName.length > 60) {
        rowErrors.push('Name is required (2-60 characters)');
        validationStatus = 'missing_data';
        errors.push({
          row: i,
          field: 'name',
          message: 'Name is required and must be 2-60 characters',
          type: 'validation'
        });
      }

      // 2. Email format validation
      if (rowData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rowData.email)) {
        rowErrors.push('Invalid email format');
        validationStatus = 'invalid_format';
        errors.push({
          row: i,
          field: 'email',
          message: 'Invalid email format',
          type: 'format'
        });
      }

      // 3. Check for existing users in system
      if (rowData.email && existingUsers.some(u => u.email.toLowerCase() === rowData.email.toLowerCase())) {
        rowErrors.push('User with this email already exists in system');
        validationStatus = 'exists';
        errors.push({
          row: i,
          field: 'email',
          message: 'User already exists in system',
          type: 'exists'
        });
      }

      // 4. Check for duplicate entries in upload
      if (rowData.email) {
        const emailLower = rowData.email.toLowerCase();
        if (emailTracker.has(emailLower)) {
          const previousRow = emailTracker.get(emailLower)!;
          rowErrors.push(`Duplicate email (also found in row ${previousRow})`);
          validationStatus = 'duplicate';
          errors.push({
            row: i,
            field: 'email',
            message: `Duplicate entry (also in row ${previousRow})`,
            type: 'duplicate'
          });
        } else {
          emailTracker.set(emailLower, i);
        }
      }

      // Phone validation
      if (rowData.phone && !/^\+?[\d\s\-()]+$/.test(rowData.phone)) {
        rowErrors.push('Invalid phone number format');
        errors.push({
          row: i,
          field: 'phone',
          message: 'Invalid phone number format',
          type: 'format'
        });
      }

      // Use selected role for all users (role column no longer needed in CSV)
      const userRole = selectedRole;

      const user: BulkUserData = {
        id: `bulk-${i}`,
        name: fullName,
        email: rowData.email || '',
        phone: rowData.phone || '',
        role: userRole,
        permissions: getDefaultPermissions(userRole),
        isValid: rowErrors.length === 0,
        errors: rowErrors,
        isSelected: rowErrors.length === 0,
        validationStatus,
        isEditing: false
      };

      data.push(user);
    }

    setUploadedData(data);
    setValidationErrors(errors);
    setCurrentStep('validate');

    // Show validation summary
    const validCount = data.filter(u => u.isValid).length;
    const invalidCount = data.filter(u => !u.isValid).length;
    
    toast({
      title: "File processed",
      description: `${validCount} valid users, ${invalidCount} users need attention`
    });
  };

  const parsePermissions = (permissionString: string) => {
    try {
      return JSON.parse(permissionString || '{}');
    } catch {
      return {};
    }
  };

  const toggleUserSelection = (userId: string) => {
    setUploadedData(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, isSelected: !user.isSelected }
          : user
      )
    );
  };

  const skipAllInvalidUsers = () => {
    setUploadedData(prev => 
      prev.map(user => 
        user.isValid 
          ? user 
          : { ...user, isSelected: false }
      )
    );
    
    toast({
      title: "Invalid users skipped",
      description: `${uploadedData.filter(u => !u.isValid).length} invalid users have been unselected`
    });
  };

  const selectAllValidUsers = () => {
    setUploadedData(prev => 
      prev.map(user => 
        user.isValid 
          ? { ...user, isSelected: true }
          : user
      )
    );
  };

  const startEditingUser = (userId: string) => {
    setUploadedData(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, isEditing: true }
          : user
      )
    );
  };

  const saveUserEdit = (userId: string, updatedData: Partial<BulkUserData>) => {
    setUploadedData(prev => 
      prev.map(user => {
        if (user.id === userId) {
          // Re-validate the updated user
          const errors: string[] = [];
          let validationStatus: BulkUserData['validationStatus'] = 'valid';
          
          if (!updatedData.email) {
            errors.push('Email is required');
            validationStatus = 'missing_data';
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedData.email)) {
            errors.push('Invalid email format');
            validationStatus = 'invalid_format';
          } else if (existingUsers.some(u => u.email.toLowerCase() === updatedData.email!.toLowerCase())) {
            errors.push('User already exists in system');
            validationStatus = 'exists';
          }
          
          if (!updatedData.name || updatedData.name.length < 2) {
            errors.push('Name is required (2+ characters)');
          }
          
          return {
            ...user,
            ...updatedData,
            isValid: errors.length === 0,
            errors,
            validationStatus,
            isEditing: false,
            isSelected: errors.length === 0
          };
        }
        return user;
      })
    );
  };

  const cancelUserEdit = (userId: string) => {
    setUploadedData(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, isEditing: false }
          : user
      )
    );
  };

  const processBulkUpload = async () => {
    const selectedUsers = uploadedData.filter(user => user.isSelected);
    
    const status: ImportStatus = {
      id: `import-${Date.now()}`,
      fileName: 'bulk_users.csv',
      startTime: new Date().toISOString(),
      status: 'processing',
      progress: 0,
      totalRows: selectedUsers.length,
      processedRows: 0,
      successfulRows: 0,
      failedRows: 0,
      canRollback: false,
      rollbackDeadline: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    };

    setImportStatus(status);
    setIsProcessing(true);
    setCurrentStep('processing');

    for (let i = 0; i < selectedUsers.length; i++) {
      const user = selectedUsers[i];
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const updatedStatus = {
        ...status,
        processedRows: i + 1,
        progress: Math.round(((i + 1) / selectedUsers.length) * 100),
        successfulRows: user.isValid ? status.successfulRows + 1 : status.successfulRows,
        failedRows: !user.isValid ? status.failedRows + 1 : status.failedRows
      };
      
      setImportStatus(updatedStatus);
    }

    const finalStatus = {
      ...status,
      status: 'completed' as const,
      progress: 100,
      canRollback: true
    };

    setImportStatus(finalStatus);
    setIsProcessing(false);

    const successful = selectedUsers.filter(u => u.isValid).length;
    const failed = selectedUsers.filter(u => !u.isValid).length;
    const skipped = uploadedData.filter(user => !user.isSelected);

    setProcessedResults({
      successful,
      failed,
      skipped
    });

    // Store imported users for permission assignment
    setImportedUsers(selectedUsers.filter(u => u.isValid));
    
    // Initialize default permissions for each role
    const uniqueRoles = [...new Set(selectedUsers.filter(u => u.isValid).map(user => user.role))];
    const defaultRolePermissions: Record<string, Record<string, any>> = {};
    uniqueRoles.forEach(role => {
      defaultRolePermissions[role] = getDefaultPermissions(role);
    });
    setRolePermissions(defaultRolePermissions);
    
    // Processing complete - user will manually navigate using continue button

    if (successful === 0) {
      toast({
        title: "Bulk upload completed",
        description: `No users were successfully imported. ${skipped.length} users skipped.`
      });
    }
  };

  const handleRollback = async () => {
    if (!importStatus?.canRollback) return;

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setImportStatus(prev => prev ? { ...prev, canRollback: false } : null);
    setIsProcessing(false);
    
    toast({
      title: "Import rolled back",
      description: "All users from the last import batch have been removed."
    });
    
    setCurrentStep('upload');
    setUploadedData([]);
    setValidationErrors([]);
    setProcessedResults(null);
  };

  const downloadTemplate = () => {
    const csvContent = `"First Name","Last Name","Email","Phone"
"Yuktarth","Nagar","yuktarth.nagar@example.com","9876543210"
"Harpreet","Singh","harpreet.singh@example.com","9876543211"
"Ritu","Maurya","ritu.maurya@example.com","9876543212"
"Akanksha","Pandey","akanksha.pandey@example.com","9876543213"
"James","Bond","james.bond@example.com","9876543214"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_user_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadSkippedUsers = () => {
    if (!processedResults?.skipped.length) return;

    const csvContent = [
      'name,email,phone,role,validation_status,errors,skip_reason',
      ...processedResults.skipped.map(user => 
        `"${user.name}","${user.email}","${user.phone}","${user.role}","${user.validationStatus}","${user.errors.join('; ')}","User validation failed or manually skipped"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skipped_users_detailed_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const updateRolePermissions = (role: string, permissions: Record<string, any>) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: permissions
    }));
  };

  const savePermissionsAndComplete = () => {
    // Apply permissions to all imported users of each role
    const finalUsers = importedUsers.map(user => ({
      ...user,
      permissions: rolePermissions[user.role] || user.permissions
    }));

    toast({
      title: "Permissions assigned and users created",
      description: `${finalUsers.length} users created with custom permissions. Temporary passwords sent via email.`
    });

    setCurrentStep('complete');
  };

  const skipPermissionAssignment = () => {
    toast({
      title: "Bulk upload completed",
      description: `${importedUsers.length} users created with default role permissions. Temporary passwords sent via email.`
    });

    setCurrentStep('complete');
  };

  const getUniqueRoles = () => {
    return [...new Set(importedUsers.map(user => user.role))];
  };

  const downloadErrorLog = () => {
    const errorContent = [
      'row,field,error_type,error_message,severity',
      ...validationErrors.map(error => 
        `${error.row},"${error.field}","${error.type}","${error.message}","${error.type === 'exists' || error.type === 'duplicate' ? 'HIGH' : 'MEDIUM'}"`
      )
    ].join('\n');

    const blob = new Blob([errorContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'validation_errors_detailed_log.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getValidationIcon = (status: BulkUserData['validationStatus']) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'duplicate':
        return <XCircle className="w-4 h-4 text-orange-500" />;
      case 'exists':
        return <UserX className="w-4 h-4 text-red-500" />;
      case 'missing_data':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'invalid_format':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getValidationBadge = (status: BulkUserData['validationStatus']) => {
    const badges = {
      valid: <Badge className="bg-green-100 text-green-800">Valid</Badge>,
      duplicate: <Badge className="bg-orange-100 text-orange-800">Duplicate</Badge>,
      exists: <Badge className="bg-red-100 text-red-800">Exists</Badge>,
      missing_data: <Badge className="bg-yellow-100 text-yellow-800">Missing Data</Badge>,
      invalid_format: <Badge className="bg-red-100 text-red-800">Invalid Format</Badge>
    };
    return badges[status];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Bulk User Upload</h2>
          <p className="text-muted-foreground">Advanced validation with digital checks and error handling</p>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="w-4 h-4 mr-2" />
          Download Template
        </Button>
      </div>

      <Tabs value={currentStep} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="role-selection" disabled={currentStep !== 'role-selection'}>
            1. Select Role
          </TabsTrigger>
          <TabsTrigger value="upload" disabled={currentStep !== 'upload'}>
            2. Upload File
          </TabsTrigger>
          <TabsTrigger value="validate" disabled={currentStep !== 'validate'}>
            3. Digital Validation
          </TabsTrigger>
          <TabsTrigger value="processing" disabled={currentStep !== 'processing'}>
            4. Processing
          </TabsTrigger>
          <TabsTrigger value="complete" disabled={currentStep !== 'complete'}>
            5. Complete
          </TabsTrigger>
        </TabsList>

        <TabsContent value="role-selection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Select Role for Bulk Import</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Single Role Import:</strong> All users in this import will be assigned the same role. 
                  Permissions will be automatically assigned based on the selected role and cannot be modified during import.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Label>Select Role for All Users</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a role for all imported users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SuperAdmin">SuperAdmin - Full system access</SelectItem>
                    <SelectItem value="Admin">Admin - Administrative privileges</SelectItem>
                    <SelectItem value="Reviewer">Reviewer - Review and approve content</SelectItem>
                    <SelectItem value="Creator">Creator - Create and edit content</SelectItem>
                    <SelectItem value="Translator">Translator - Translate content</SelectItem>
                  </SelectContent>
                </Select>

                {selectedRole && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Default Permissions for {selectedRole}:</h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      {selectedRole === 'SuperAdmin' && (
                        <>
                          <li>Full access to CMS (Questions, Multimedia)</li>
                          <li>Complete LMS management (Worksheets, Test Papers)</li>
                          <li>User and Role management</li>
                        </>
                      )}
                      {selectedRole === 'Admin' && (
                        <>
                          <li>CMS content management and approval</li>
                          <li>LMS creation and publishing</li>
                          <li>Limited user management</li>
                        </>
                      )}
                      {selectedRole === 'Reviewer' && (
                        <>
                          <li>Review and approve content</li>
                          <li>View and download materials</li>
                        </>
                      )}
                      {selectedRole === 'Creator' && (
                        <>
                          <li>Create and edit content</li>
                          <li>Create worksheets and test papers</li>
                        </>
                      )}
                      {selectedRole === 'Translator' && (
                        <>
                          <li>Translate content</li>
                          <li>View materials</li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => setCurrentStep('upload')}
                  disabled={!selectedRole}
                >
                  Continue to Upload
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Upload CSV File</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <Label htmlFor="csvFile" className="cursor-pointer">
                  <span className="text-lg font-medium">Choose CSV file</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Max {MAX_FILE_SIZE_MB}MB, up to {MAX_USERS_PER_IMPORT} users per import
                  </p>
                </Label>
                <Input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Enhanced Validation Features:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Automatic detection of existing users in system</li>
                    <li>Duplicate email detection within upload</li>
                    <li>Missing unique identifier validation</li>
                    <li>Format validation for email and phone</li>
                    <li>Individual row editing and bulk skip options</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validate" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Digital Validation & Review</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={selectAllValidUsers}>
                    Select All Valid
                  </Button>
                  <Button variant="outline" onClick={skipAllInvalidUsers} className="bg-orange-50 hover:bg-orange-100">
                    <UserX className="w-4 h-4 mr-2" />
                    Skip Invalid Users
                  </Button>
                  {validationErrors.length > 0 && (
                    <Button variant="outline" onClick={downloadErrorLog}>
                      <Download className="w-4 h-4 mr-2" />
                      Download Error Log
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid grid-cols-6 gap-2">
                <Badge variant="default">Total: {uploadedData.length}</Badge>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Valid: {uploadedData.filter(u => u.validationStatus === 'valid').length}
                </Badge>
                <Badge variant="destructive" className="bg-red-100 text-red-800">
                  Exists: {uploadedData.filter(u => u.validationStatus === 'exists').length}
                </Badge>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Duplicates: {uploadedData.filter(u => u.validationStatus === 'duplicate').length}
                </Badge>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Missing: {uploadedData.filter(u => u.validationStatus === 'missing_data').length}
                </Badge>
                <Badge variant="secondary">
                  Selected: {uploadedData.filter(u => u.isSelected).length}
                </Badge>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Validation</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                    <TableHead>Errors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploadedData.map((user) => (
                    <TableRow key={user.id} className={user.isEditing ? 'bg-blue-50' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={user.isSelected}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                          disabled={user.isEditing}
                        />
                      </TableCell>
                      <TableCell>
                        {getValidationIcon(user.validationStatus)}
                      </TableCell>
                      <TableCell>
                        {getValidationBadge(user.validationStatus)}
                      </TableCell>
                      <TableCell>
                        {user.isEditing ? (
                          <Input
                            defaultValue={user.name}
                            className="w-32"
                            onBlur={(e) => saveUserEdit(user.id, { name: e.target.value })}
                          />
                        ) : (
                          <span className="font-medium">{user.name}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.isEditing ? (
                          <Input
                            defaultValue={user.email}
                            className="w-48"
                            onBlur={(e) => saveUserEdit(user.id, { email: e.target.value })}
                          />
                        ) : (
                          user.email
                        )}
                      </TableCell>
                      <TableCell>
                        {user.isEditing ? (
                          <Select defaultValue={user.role} onValueChange={(role) => saveUserEdit(user.id, { role })}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="Reviewer">Reviewer</SelectItem>
                              <SelectItem value="Creator">Creator</SelectItem>
                              <SelectItem value="Translator">Translator</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="secondary">{user.role}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {user.isEditing ? (
                            <>
                              <Button size="sm" variant="outline" onClick={() => saveUserEdit(user.id, {})}>
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => cancelUserEdit(user.id)}>
                                <XCircle className="w-3 h-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => startEditingUser(user.id)}>
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => toggleUserSelection(user.id)}
                                className={user.isSelected ? 'bg-red-50' : 'bg-gray-50'}
                              >
                                <UserX className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.errors.length > 0 && (
                          <div className="text-sm text-red-600 max-w-xs">
                            {user.errors.slice(0, 2).join(', ')}
                            {user.errors.length > 2 && '...'}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setCurrentStep('role-selection')}>
                  Back to Role Selection
                </Button>
                <Button 
                  onClick={processBulkUpload}
                  disabled={uploadedData.filter(u => u.isSelected).length === 0 || isProcessing}
                >
                  {isProcessing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Import {uploadedData.filter(u => u.isSelected).length} Users
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Processing Import</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {importStatus && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Progress: {importStatus.processedRows} of {importStatus.totalRows} users processed
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {importStatus.progress}%
                    </span>
                  </div>
                  
                  <Progress value={importStatus.progress} className="w-full" />
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {importStatus.successfulRows}
                      </div>
                      <div className="text-sm text-green-600">Successful</div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="text-lg font-bold text-red-600">
                        {importStatus.failedRows}
                      </div>
                      <div className="text-sm text-red-600">Failed</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-600">
                        {importStatus.totalRows - importStatus.processedRows}
                      </div>
                      <div className="text-sm text-gray-600">Remaining</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    {importStatus.progress < 100 ? (
                      <Button 
                        variant="destructive" 
                        onClick={() => {
                          setIsProcessing(false);
                          setCurrentStep('validate');
                          toast({
                            title: "Import cancelled",
                            description: "Bulk user import has been cancelled."
                          });
                        }}
                      >
                        Cancel Import
                      </Button>
                    ) : (
                      <div></div>
                    )}
                    
                     {importStatus.progress >= 100 && (
                       <Button 
                         onClick={() => setCurrentStep('complete')}
                         className="ml-auto"
                       >
                         Complete Import
                       </Button>
                     )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="complete" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Bulk Upload Complete</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {processedResults && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {processedResults.successful}
                    </div>
                    <div className="text-sm text-green-600">Users Created</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {processedResults.failed}
                    </div>
                    <div className="text-sm text-red-600">Failed</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {processedResults.skipped.length}
                    </div>
                    <div className="text-sm text-gray-600">Skipped</div>
                  </div>
                </div>
              )}

              {importStatus?.canRollback && (
                <Alert>
                  <RotateCcw className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span>
                        Rollback available until {importStatus.rollbackDeadline ? 
                          new Date(importStatus.rollbackDeadline).toLocaleTimeString() : 'N/A'}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRollback}
                        disabled={isProcessing}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Rollback Import
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between">
                <div className="space-x-2">
                  <Button variant="outline" onClick={downloadSkippedUsers}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Detailed Skipped Report
                  </Button>
                  {validationErrors.length > 0 && (
                    <Button variant="outline" onClick={downloadErrorLog}>
                      <Download className="w-4 h-4 mr-2" />
                      Download Error Analysis
                    </Button>
                  )}
                </div>
                <Button onClick={onClose}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BulkUserUpload;
