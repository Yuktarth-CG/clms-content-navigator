import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, CheckCircle, XCircle, AlertTriangle, FileText, Users, Clock, RotateCcw, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BulkUserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  customPermissions?: any;
  isValid: boolean;
  errors: string[];
  isSelected: boolean;
}

interface BulkRoleData {
  id: string;
  roleName: string;
  roleDescription: string;
  permissions: Record<string, boolean>;
  isValid: boolean;
  errors: string[];
  isSelected: boolean;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  type: 'user' | 'role';
}

interface ImportStatus {
  id: string;
  userFileName?: string;
  roleFileName?: string;
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

const BulkImport = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'validate' | 'processing' | 'complete'>('upload');
  const [uploadedUsers, setUploadedUsers] = useState<BulkUserData[]>([]);
  const [uploadedRoles, setUploadedRoles] = useState<BulkRoleData[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);
  const [processedResults, setProcessedResults] = useState<{
    users: { successful: number; failed: number; skipped: BulkUserData[] };
    roles: { successful: number; failed: number; skipped: BulkRoleData[] };
  } | null>(null);

  // PRD Requirements: User CSV max 2MB, Role CSV max 10MB, max 100 users
  const MAX_USERS_PER_IMPORT = 100;
  const MAX_USER_FILE_SIZE_MB = 2;
  const MAX_ROLE_FILE_SIZE_MB = 10;

  const handleUserFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // PRD 6.6.1: File size validation (2MB limit for users)
    if (file.size > MAX_USER_FILE_SIZE_MB * 1024 * 1024) {
      toast({
        title: "File size exceeds limit",
        description: `User CSV file size exceeds ${MAX_USER_FILE_SIZE_MB}MB limit.`,
        variant: "destructive"
      });
      return;
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file format",
        description: "Only CSV files (.csv) are accepted.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseUserCSV(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleRoleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // PRD 6.6.2: File size validation (10MB limit for roles)
    if (file.size > MAX_ROLE_FILE_SIZE_MB * 1024 * 1024) {
      toast({
        title: "File size exceeds limit",
        description: `Role CSV file size exceeds ${MAX_ROLE_FILE_SIZE_MB}MB limit.`,
        variant: "destructive"
      });
      return;
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file format",
        description: "Only CSV files (.csv) are accepted.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseRoleCSV(text, file.name);
    };
    reader.readAsText(file);
  };

  const parseUserCSV = (csvText: string, fileName: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // PRD 6.6.5: Check max users limit
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
    const existingEmails = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      const rowData: any = {};
      
      headers.forEach((header, index) => {
        rowData[header] = values[index] || '';
      });

      const rowErrors: string[] = [];
      
      // PRD 6.6.3: Field validation
      if (!rowData.name || rowData.name.length < 2 || rowData.name.length > 60) {
        rowErrors.push('Name is required (2-60 characters)');
      }
      
      if (!rowData.email) {
        rowErrors.push('Email is required');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rowData.email)) {
        rowErrors.push('Invalid email format');
      }

      // PRD 6.6.3: Phone number format validation
      if (rowData.phone && !/^\+?[\d\s\-()]+$/.test(rowData.phone)) {
        rowErrors.push('Invalid phone number format');
      }

      // PRD 6.6.3: Existing user handling (by email)
      if (rowData.email && existingEmails.has(rowData.email.toLowerCase())) {
        rowErrors.push('Duplicate email in upload');
      } else if (rowData.email) {
        existingEmails.add(rowData.email.toLowerCase());
        if (isExistingUser(rowData.email)) {
          rowErrors.push('User with this email already exists and will be ignored');
        }
      }

      // PRD 6.6.4: Default role assignment
      const userRole = rowData.role || 'Creator';
      if (!['SuperAdmin', 'Admin', 'Reviewer', 'Creator', 'Translator'].includes(userRole)) {
        rowErrors.push('Invalid role. Must be SuperAdmin, Admin, Reviewer, Creator, or Translator');
      }

      const user: BulkUserData = {
        id: `bulk-user-${i}`,
        name: rowData.name || '',
        email: rowData.email || '',
        phone: rowData.phone || '',
        role: userRole,
        customPermissions: parseCustomPermissions(rowData.permissions),
        isValid: rowErrors.length === 0,
        errors: rowErrors,
        isSelected: rowErrors.length === 0
      };

      data.push(user);

      rowErrors.forEach(error => {
        errors.push({
          row: i,
          field: 'validation',
          message: error,
          type: 'user'
        });
      });
    }

    setUploadedUsers(data);
    setValidationErrors(prev => [...prev.filter(e => e.type !== 'user'), ...errors]);
  };

  const parseRoleCSV = (csvText: string, fileName: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    const data: BulkRoleData[] = [];
    const errors: ValidationError[] = [];
    const existingRoleNames = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      const rowData: any = {};
      
      headers.forEach((header, index) => {
        rowData[header] = values[index] || '';
      });

      const rowErrors: string[] = [];
      
      // PRD 6.6.3: Role validation
      if (!rowData.role_name) {
        rowErrors.push('Role_Name is mandatory');
      } else if (rowData.role_name.length < 2 || rowData.role_name.length > 60) {
        rowErrors.push('Role_Name length must be between 2 and 60 characters');
      }

      if (rowData.role_description && rowData.role_description.length > 500) {
        rowErrors.push('Role_Description cannot exceed 500 characters');
      }

      // Check for duplicate role names in CSV
      if (rowData.role_name && existingRoleNames.has(rowData.role_name.toLowerCase())) {
        rowErrors.push(`Duplicate Role_Name '${rowData.role_name}' found in CSV`);
      } else if (rowData.role_name) {
        existingRoleNames.add(rowData.role_name.toLowerCase());
        if (isExistingRole(rowData.role_name)) {
          rowErrors.push(`Role_Name '${rowData.role_name}' already exists in system and will be ignored`);
        }
      }

      // Parse permissions from CSV columns starting with permission prefixes
      const permissions: Record<string, boolean> = {};
      let hasPermissions = false;
      
      headers.forEach(header => {
        if (header.startsWith('cms_') || header.startsWith('lms_') || 
            header.startsWith('usermgmt_') || header.startsWith('export_') || 
            header.startsWith('tagging_')) {
          const value = rowData[header];
          if (value === 'X') {
            permissions[header] = true;
            hasPermissions = true;
          } else if (value === '') {
            permissions[header] = false;
          } else {
            rowErrors.push(`Invalid permission value for column ${header}. Expected 'X' or empty`);
          }
        }
      });

      // PRD 6.6.3: At least one permission must be assigned
      if (!hasPermissions && rowErrors.length === 0) {
        rowErrors.push(`At least one permission must be assigned for new role '${rowData.role_name}'`);
      }

      const role: BulkRoleData = {
        id: `bulk-role-${i}`,
        roleName: rowData.role_name || '',
        roleDescription: rowData.role_description || '',
        permissions,
        isValid: rowErrors.length === 0,
        errors: rowErrors,
        isSelected: rowErrors.length === 0
      };

      data.push(role);

      rowErrors.forEach(error => {
        errors.push({
          row: i,
          field: 'validation',
          message: error,
          type: 'role'
        });
      });
    }

    setUploadedRoles(data);
    setValidationErrors(prev => [...prev.filter(e => e.type !== 'role'), ...errors]);
  };

  const isExistingUser = (email: string): boolean => {
    // Simulate checking against existing users
    const existingEmails = ['existing@example.com', 'test@example.com'];
    return existingEmails.includes(email.toLowerCase());
  };

  const isExistingRole = (roleName: string): boolean => {
    // Check against system-defined roles
    const existingRoles = ['SuperAdmin', 'Admin', 'Reviewer', 'Creator', 'Translator'];
    return existingRoles.includes(roleName);
  };

  const parseCustomPermissions = (permissionString: string) => {
    try {
      return JSON.parse(permissionString || '{}');
    } catch {
      return {};
    }
  };

  const validateCombined = () => {
    // PRD 6.6.3: Pre-import validation across both CSVs
    const combinedErrors: ValidationError[] = [];
    
    // Check role dependencies: roles in user CSV must exist or be defined in role CSV
    uploadedUsers.forEach((user, index) => {
      if (user.role && !['SuperAdmin', 'Admin', 'Reviewer', 'Creator', 'Translator'].includes(user.role)) {
        const roleExists = uploadedRoles.some(role => role.roleName === user.role && role.isValid);
        if (!roleExists) {
          combinedErrors.push({
            row: index + 1,
            field: 'role',
            message: `Role '${user.role}' specified in user CSV is not defined in role CSV`,
            type: 'user'
          });
        }
      }
    });

    setValidationErrors(prev => [...prev, ...combinedErrors]);
    setCurrentStep('validate');
  };

  const processCombinedImport = async () => {
    const selectedUsers = uploadedUsers.filter(user => user.isSelected);
    const selectedRoles = uploadedRoles.filter(role => role.isSelected);
    
    const status: ImportStatus = {
      id: `import-${Date.now()}`,
      userFileName: selectedUsers.length > 0 ? 'bulk_users.csv' : undefined,
      roleFileName: selectedRoles.length > 0 ? 'bulk_roles.csv' : undefined,
      startTime: new Date().toISOString(),
      status: 'processing',
      progress: 0,
      totalRows: selectedUsers.length + selectedRoles.length,
      processedRows: 0,
      successfulRows: 0,
      failedRows: 0,
      canRollback: false,
      rollbackDeadline: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    };

    setImportStatus(status);
    setIsProcessing(true);
    setCurrentStep('processing');

    // Process roles first, then users (roles need to exist before user assignment)
    let processedCount = 0;
    
    // Process roles
    for (let i = 0; i < selectedRoles.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      processedCount++;
      
      const updatedStatus = {
        ...status,
        processedRows: processedCount,
        progress: Math.round((processedCount / status.totalRows) * 100),
        successfulRows: selectedRoles[i].isValid ? status.successfulRows + 1 : status.successfulRows,
        failedRows: !selectedRoles[i].isValid ? status.failedRows + 1 : status.failedRows
      };
      
      setImportStatus(updatedStatus);
    }

    // Process users
    for (let i = 0; i < selectedUsers.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      processedCount++;
      
      const updatedStatus = {
        ...status,
        processedRows: processedCount,
        progress: Math.round((processedCount / status.totalRows) * 100),
        successfulRows: selectedUsers[i].isValid ? status.successfulRows + 1 : status.successfulRows,
        failedRows: !selectedUsers[i].isValid ? status.failedRows + 1 : status.failedRows
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

    const userResults = {
      successful: selectedUsers.filter(u => u.isValid).length,
      failed: selectedUsers.filter(u => !u.isValid).length,
      skipped: uploadedUsers.filter(user => !user.isSelected)
    };

    const roleResults = {
      successful: selectedRoles.filter(r => r.isValid).length,
      failed: selectedRoles.filter(r => !r.isValid).length,
      skipped: uploadedRoles.filter(role => !role.isSelected)
    };

    setProcessedResults({ users: userResults, roles: roleResults });
    setCurrentStep('complete');

    // PRD 6.6.6: Post-import notification
    toast({
      title: "Bulk import completed",
      description: `${userResults.successful} users and ${roleResults.successful} roles created successfully. Temporary passwords sent via email.`
    });
  };

  const downloadUserTemplate = () => {
    const csvContent = `name,email,phone,role,permissions
John Doe,john@example.com,+91-9876543210,Creator,"{""customPermission"":true}"
Jane Smith,jane@example.com,+91-9876543211,Reviewer,"{}"
Mike Johnson,mike@example.com,+91-9876543212,Translator,"{}"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_user_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadRoleTemplate = () => {
    const csvContent = `role_name,role_description,cms_questions_view,cms_questions_create,lms_worksheet_create,usermgmt_user_view,export_questions_download,tagging_management_view
State Content Reviewer,Reviews state-specific educational content,X,X,,,X,X
Regional Admin,Manages regional user accounts and content,X,X,X,X,X,X
Subject Expert,Expert in specific subject matter,X,X,X,,,X`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_role_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bulk Import - Users & Roles</h1>
          <p className="text-muted-foreground">
            Upload users (max {MAX_USERS_PER_IMPORT}, {MAX_USER_FILE_SIZE_MB}MB) and roles (max {MAX_ROLE_FILE_SIZE_MB}MB) via CSV files
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={downloadUserTemplate}>
            <Download className="w-4 h-4 mr-2" />
            User Template
          </Button>
          <Button variant="outline" onClick={downloadRoleTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Role Template
          </Button>
        </div>
      </div>

      <Tabs value={currentStep} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">1. Upload CSVs</TabsTrigger>
          <TabsTrigger value="validate">2. Validate & Review</TabsTrigger>
          <TabsTrigger value="processing">3. Processing</TabsTrigger>
          <TabsTrigger value="complete">4. Complete</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Upload User CSV</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <Label htmlFor="userCsvFile" className="cursor-pointer">
                    <span className="font-medium">Choose User CSV</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Max {MAX_USER_FILE_SIZE_MB}MB, up to {MAX_USERS_PER_IMPORT} users
                    </p>
                  </Label>
                  <Input
                    id="userCsvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleUserFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline" className="mt-2" onClick={() => document.getElementById('userCsvFile')?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Select User CSV
                  </Button>
                </div>
                {uploadedUsers.length > 0 && (
                  <Badge variant="default">
                    {uploadedUsers.length} users loaded
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Upload Role CSV</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <Label htmlFor="roleCsvFile" className="cursor-pointer">
                    <span className="font-medium">Choose Role CSV</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Max {MAX_ROLE_FILE_SIZE_MB}MB, role definitions
                    </p>
                  </Label>
                  <Input
                    id="roleCsvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleRoleFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline" className="mt-2" onClick={() => document.getElementById('roleCsvFile')?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Select Role CSV
                  </Button>
                </div>
                {uploadedRoles.length > 0 && (
                  <Badge variant="default">
                    {uploadedRoles.length} roles loaded
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Combined Import Requirements (PRD 6.6):</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>User CSV: Name, Email (unique), Phone, Role (optional, defaults to Creator)</li>
                <li>Role CSV: Role_Name (unique), Role_Description, Permission columns (X = granted)</li>
                <li>Roles in user CSV must exist in system or be defined in role CSV</li>
                <li>Existing users/roles will be ignored automatically</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex justify-end">
            <Button 
              onClick={validateCombined}
              disabled={uploadedUsers.length === 0 && uploadedRoles.length === 0}
            >
              Validate & Preview
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="validate" className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{uploadedUsers.length}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{uploadedRoles.length}</div>
                <div className="text-sm text-muted-foreground">Total Roles</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {uploadedUsers.filter(u => u.isValid).length + uploadedRoles.filter(r => r.isValid).length}
                </div>
                <div className="text-sm text-muted-foreground">Valid Records</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {validationErrors.length}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </CardContent>
            </Card>
          </div>

          {/* Validation results tables would go here */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep('upload')}>
              Back to Upload
            </Button>
            <Button 
              onClick={processCombinedImport}
              disabled={uploadedUsers.filter(u => u.isSelected).length === 0 && 
                       uploadedRoles.filter(r => r.isSelected).length === 0}
            >
              Import Selected Records
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="processing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Processing Combined Import</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {importStatus && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Progress: {importStatus.processedRows} of {importStatus.totalRows} records processed
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {importStatus.progress}%
                    </span>
                  </div>
                  
                  <Progress value={importStatus.progress} className="w-full" />
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
                <span>Import Complete</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {processedResults && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">User Import Results</h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-green-50 rounded">
                        <div className="font-bold text-green-600">{processedResults.users.successful}</div>
                        <div className="text-xs text-green-600">Created</div>
                      </div>
                      <div className="p-2 bg-red-50 rounded">
                        <div className="font-bold text-red-600">{processedResults.users.failed}</div>
                        <div className="text-xs text-red-600">Failed</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="font-bold text-gray-600">{processedResults.users.skipped.length}</div>
                        <div className="text-xs text-gray-600">Skipped</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Role Import Results</h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-green-50 rounded">
                        <div className="font-bold text-green-600">{processedResults.roles.successful}</div>
                        <div className="text-xs text-green-600">Created</div>
                      </div>
                      <div className="p-2 bg-red-50 rounded">
                        <div className="font-bold text-red-600">{processedResults.roles.failed}</div>
                        <div className="text-xs text-red-600">Failed</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="font-bold text-gray-600">{processedResults.roles.skipped.length}</div>
                        <div className="text-xs text-gray-600">Skipped</div>
                      </div>
                    </div>
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
                      <Button variant="outline" size="sm">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Rollback Import
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BulkImport;
