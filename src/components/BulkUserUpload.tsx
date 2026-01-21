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
import { 
  Upload, Download, CheckCircle, XCircle, AlertTriangle, 
  FileText, Users, Clock, RotateCcw, Edit2, UserX, Mail, Info
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// PRD: Predefined CLMS roles only - no custom roles allowed
const PREDEFINED_ROLES = ['Admin', 'Creator', 'Reviewer', 'Translator', 'SuperAdmin'];

interface BulkUserData {
  id: string;
  rowNumber: number;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  role: string;
  isValid: boolean;
  errors: string[];
  isSelected: boolean;
  validationStatus: 'success' | 'ignore' | 'error';
  statusReason: string;
  isEditing?: boolean;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ImportStatus {
  id: string;
  fileName: string;
  startTime: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalRows: number;
  processedRows: number;
  successCount: number;
  ignoreCount: number;
  errorCount: number;
  canRollback: boolean;
  rollbackDeadline?: string;
  importedBy: string;
}

const BulkUserUpload = ({ onClose }: { onClose: () => void }) => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'processing' | 'complete'>('upload');
  const [uploadedData, setUploadedData] = useState<BulkUserData[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [batchId, setBatchId] = useState<string>('');

  // PRD Requirements
  const MAX_USERS_PER_IMPORT = 100; // TR-1: Configurable batch limit
  const MAX_FILE_SIZE_MB = 2; // 3.1: Maximum 2 MB per file

  // Simulated existing users database
  const existingUsers = [
    { email: 'existing@example.com' },
    { email: 'admin@company.com' },
    { email: 'test@example.com' }
  ];

  const isExistingUser = (email: string): boolean => {
    return existingUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
  };

  const validateDateOfBirth = (dob: string): boolean => {
    if (!dob) return true; // Optional field
    // Support DD-MM-YYYY or YYYY-MM-DD formats
    const ddmmyyyy = /^\d{2}-\d{2}-\d{4}$/;
    const yyyymmdd = /^\d{4}-\d{2}-\d{2}$/;
    return ddmmyyyy.test(dob) || yyyymmdd.test(dob);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // PRD 3.1: Size Limit - Maximum 2 MB per file
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast({
        title: "File Size Exceeded",
        description: `CSV file size exceeds ${MAX_FILE_SIZE_MB}MB limit.`,
        variant: "destructive"
      });
      return;
    }

    // PRD 3.1: File Format - Only .csv files accepted
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Format",
        description: "Only CSV files (.csv) are accepted.",
        variant: "destructive"
      });
      return;
    }

    setFileName(file.name);
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
    
    // PRD TR-1: Batch Limit - Maximum 100 users per import
    if (lines.length - 1 > MAX_USERS_PER_IMPORT) {
      toast({
        title: "Batch Limit Exceeded",
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
      const rowData: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        rowData[header] = values[index] || '';
      });

      const rowErrors: string[] = [];
      let validationStatus: BulkUserData['validationStatus'] = 'success';
      let statusReason = 'New user to be created';
      
      // PRD 3.1: Mandatory Fields - Name, Email
      const name = rowData.name || '';
      const email = rowData.email || '';
      const phone = rowData.phone || rowData['phone number'] || '';
      const dateOfBirth = rowData.dob || rowData['date of birth'] || rowData.dateofbirth || '';
      const role = rowData.role || '';

      // 1. Validate mandatory Name field
      if (!name || name.length < 2) {
        rowErrors.push('Name is required (minimum 2 characters)');
        validationStatus = 'error';
        statusReason = 'Missing required field: Name';
        errors.push({
          row: i,
          field: 'name',
          message: 'Name is required'
        });
      }

      // 2. Validate mandatory Email field (unique identifier per PRD 3.1)
      if (!email) {
        rowErrors.push('Email is required (unique identifier)');
        validationStatus = 'error';
        statusReason = 'Missing required field: Email';
        errors.push({
          row: i,
          field: 'email',
          message: 'Email is required'
        });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        // PRD Validation Message: Bad email format
        rowErrors.push(`Invalid email format at Row ${i}`);
        validationStatus = 'error';
        statusReason = 'Invalid email format';
        errors.push({
          row: i,
          field: 'email',
          message: `Invalid email format at Row ${i}`
        });
      }

      // 3. Check for existing users in system - PRD Validation Message
      if (email && isExistingUser(email)) {
        rowErrors.push(`User with email ${email} already exists and was ignored`);
        validationStatus = 'ignore';
        statusReason = `User with email ${email} already exists`;
        errors.push({
          row: i,
          field: 'email',
          message: `User with email ${email} already exists and was ignored`
        });
      }

      // 4. Check for duplicate entries in CSV upload
      if (email && !isExistingUser(email)) {
        const emailLower = email.toLowerCase();
        if (emailTracker.has(emailLower)) {
          const previousRow = emailTracker.get(emailLower)!;
          rowErrors.push(`Duplicate email (also found in row ${previousRow})`);
          validationStatus = 'error';
          statusReason = 'Duplicate email in CSV';
          errors.push({
            row: i,
            field: 'email',
            message: `Duplicate email found in row ${previousRow}`
          });
        } else {
          emailTracker.set(emailLower, i);
        }
      }

      // 5. PRD 3.2: Role Mapping Logic - Must match predefined roles
      if (!role) {
        // PRD 3.2: Default Role - Empty role = error, skip user
        rowErrors.push('Role is required. Please specify a valid CLMS role');
        validationStatus = 'error';
        statusReason = 'Missing required field: Role';
        errors.push({
          row: i,
          field: 'role',
          message: 'Role column is empty - user will be skipped'
        });
      } else if (!PREDEFINED_ROLES.includes(role)) {
        // PRD Validation Message: Invalid role
        rowErrors.push(`Role '${role}' not found. Please use a predefined CLMS role.`);
        validationStatus = 'error';
        statusReason = `Invalid role: ${role}`;
        errors.push({
          row: i,
          field: 'role',
          message: `Role '${role}' not found. Please use a predefined CLMS role.`
        });
      }

      // 6. Validate optional Date of Birth format (DD-MM-YYYY or YYYY-MM-DD)
      if (dateOfBirth && !validateDateOfBirth(dateOfBirth)) {
        rowErrors.push('Invalid date format. Use DD-MM-YYYY or YYYY-MM-DD');
        errors.push({
          row: i,
          field: 'dob',
          message: 'Invalid date format'
        });
      }

      // 7. Validate optional phone format
      if (phone && !/^\+?[\d\s\-()]+$/.test(phone)) {
        rowErrors.push('Invalid phone number format');
        errors.push({
          row: i,
          field: 'phone',
          message: 'Invalid phone number format'
        });
      }

      const user: BulkUserData = {
        id: `bulk-${i}`,
        rowNumber: i,
        name,
        email,
        phone,
        dateOfBirth,
        role,
        isValid: rowErrors.length === 0,
        errors: rowErrors,
        isSelected: validationStatus === 'success',
        validationStatus,
        statusReason,
        isEditing: false
      };

      data.push(user);
    }

    setUploadedData(data);
    setValidationErrors(errors);
    setBatchId(`batch-${Date.now()}`);
    setCurrentStep('preview');

    // Show validation summary per PRD 3.3
    const successCount = data.filter(u => u.validationStatus === 'success').length;
    const ignoreCount = data.filter(u => u.validationStatus === 'ignore').length;
    const errorCount = data.filter(u => u.validationStatus === 'error').length;
    
    toast({
      title: "File Validated",
      description: `Success: ${successCount} | Ignored: ${ignoreCount} | Errors: ${errorCount}`
    });
  };

  const toggleUserSelection = (userId: string) => {
    setUploadedData(prev => 
      prev.map(user => 
        user.id === userId && user.validationStatus === 'success'
          ? { ...user, isSelected: !user.isSelected }
          : user
      )
    );
  };

  const selectAllValid = () => {
    setUploadedData(prev => 
      prev.map(user => 
        user.validationStatus === 'success'
          ? { ...user, isSelected: true }
          : user
      )
    );
  };

  const startEditingUser = (userId: string) => {
    setUploadedData(prev => 
      prev.map(user => 
        user.id === userId ? { ...user, isEditing: true } : user
      )
    );
  };

  const saveUserEdit = (userId: string, updatedData: Partial<BulkUserData>) => {
    setUploadedData(prev => 
      prev.map(user => {
        if (user.id === userId) {
          const newData = { ...user, ...updatedData };
          const errors: string[] = [];
          let validationStatus: BulkUserData['validationStatus'] = 'success';
          let statusReason = 'New user to be created';

          // Re-validate after edit
          if (!newData.name || newData.name.length < 2) {
            errors.push('Name is required');
            validationStatus = 'error';
            statusReason = 'Missing required field: Name';
          }

          if (!newData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newData.email)) {
            errors.push('Valid email is required');
            validationStatus = 'error';
            statusReason = 'Invalid email';
          } else if (isExistingUser(newData.email)) {
            errors.push(`User with email ${newData.email} already exists`);
            validationStatus = 'ignore';
            statusReason = 'User already exists';
          }

          if (!newData.role || !PREDEFINED_ROLES.includes(newData.role)) {
            errors.push(`Role '${newData.role}' not found. Please use a predefined CLMS role.`);
            validationStatus = 'error';
            statusReason = 'Invalid role';
          }

          return {
            ...newData,
            isValid: errors.length === 0,
            errors,
            validationStatus,
            statusReason,
            isEditing: false,
            isSelected: validationStatus === 'success'
          };
        }
        return user;
      })
    );
  };

  const cancelUserEdit = (userId: string) => {
    setUploadedData(prev => 
      prev.map(user => 
        user.id === userId ? { ...user, isEditing: false } : user
      )
    );
  };

  // PRD 3.3: The Import Workflow - Confirm step
  const processImport = async () => {
    const selectedUsers = uploadedData.filter(user => user.isSelected);
    
    if (selectedUsers.length === 0) {
      toast({
        title: "No Users Selected",
        description: "Please select at least one valid user to import.",
        variant: "destructive"
      });
      return;
    }

    const status: ImportStatus = {
      id: batchId,
      fileName,
      startTime: new Date().toISOString(),
      status: 'processing',
      progress: 0,
      totalRows: selectedUsers.length,
      processedRows: 0,
      successCount: 0,
      ignoreCount: uploadedData.filter(u => u.validationStatus === 'ignore').length,
      errorCount: uploadedData.filter(u => u.validationStatus === 'error').length,
      canRollback: false,
      rollbackDeadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      importedBy: 'Yuktarth Nagar' // Mock current user
    };

    setImportStatus(status);
    setIsProcessing(true);
    setCurrentStep('processing');

    // PRD TR-2: Server-Side Continuity - Simulate server processing
    for (let i = 0; i < selectedUsers.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      
      setImportStatus(prev => prev ? {
        ...prev,
        processedRows: i + 1,
        progress: Math.round(((i + 1) / selectedUsers.length) * 100),
        successCount: i + 1
      } : null);
    }

    // Complete processing
    setImportStatus(prev => prev ? {
      ...prev,
      status: 'completed',
      progress: 100,
      canRollback: true
    } : null);
    
    setIsProcessing(false);
    setCurrentStep('complete');

    // PRD 3.3: Completion - Passwords generated and emailed
    toast({
      title: "Import Completed Successfully",
      description: `${selectedUsers.length} users created. Temporary passwords sent via email.`
    });
  };

  // PRD 7: Rollback button - delete only users from this batch
  const handleRollback = async () => {
    if (!importStatus?.canRollback) return;

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setImportStatus(prev => prev ? { ...prev, canRollback: false } : null);
    setIsProcessing(false);
    
    toast({
      title: "Rollback Successful",
      description: `All ${importStatus.successCount} users from batch ${batchId} have been removed.`
    });
    
    // Reset to start
    setCurrentStep('upload');
    setUploadedData([]);
    setValidationErrors([]);
    setFileName('');
  };

  // PRD 5: Download Sample CSV template
  const downloadTemplate = () => {
    const csvContent = `Name,Email,Phone Number,Date of Birth,Role
John Doe,john.doe@example.com,+91-9876543210,15-03-1990,Creator
Jane Smith,jane.smith@example.com,+91-9876543211,1985-06-22,Reviewer
Mike Johnson,mike.johnson@example.com,,25-12-1992,Admin`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_user_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // PRD 5: Download Error Log CSV
  const downloadErrorLog = () => {
    const errorUsers = uploadedData.filter(u => u.validationStatus === 'error');
    if (errorUsers.length === 0) return;

    const csvContent = [
      'Row,Name,Email,Role,Error Reason',
      ...errorUsers.map(user => 
        `${user.rowNumber},"${user.name}","${user.email}","${user.role}","${user.errors.join('; ')}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'error_log.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: BulkUserData['validationStatus']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'ignore':
        return <Badge className="bg-yellow-100 text-yellow-800">Ignored</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
    }
  };

  const getStatusIcon = (status: BulkUserData['validationStatus']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'ignore':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  // Calculate summary counts
  const successCount = uploadedData.filter(u => u.validationStatus === 'success').length;
  const ignoreCount = uploadedData.filter(u => u.validationStatus === 'ignore').length;
  const errorCount = uploadedData.filter(u => u.validationStatus === 'error').length;
  const selectedCount = uploadedData.filter(u => u.isSelected).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bulk User Import</h2>
          <p className="text-muted-foreground">
            Single CSV upload • Max {MAX_USERS_PER_IMPORT} users • {MAX_FILE_SIZE_MB}MB limit
          </p>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="w-4 h-4 mr-2" />
          Download Sample CSV
        </Button>
      </div>

      <Tabs value={currentStep} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" disabled={currentStep !== 'upload'}>
            1. Upload
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={currentStep !== 'preview'}>
            2. Preview
          </TabsTrigger>
          <TabsTrigger value="processing" disabled={currentStep !== 'processing'}>
            3. Processing
          </TabsTrigger>
          <TabsTrigger value="complete" disabled={currentStep !== 'complete'}>
            4. Complete
          </TabsTrigger>
        </TabsList>

        {/* Step 1: Upload */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Upload CSV File</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <Label htmlFor="csvFile" className="cursor-pointer">
                  <span className="text-lg font-medium text-primary hover:underline">
                    Click to choose CSV file
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">
                    or drag and drop your file here
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

              {/* CSV Format Info */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">CSV Format Requirements:</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-green-700">Mandatory Fields:</p>
                        <ul className="list-disc list-inside text-muted-foreground">
                          <li>Name</li>
                          <li>Email (unique identifier)</li>
                          <li>Role (must match: Admin, Creator, Reviewer, Translator, SuperAdmin)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-blue-700">Optional Fields:</p>
                        <ul className="list-disc list-inside text-muted-foreground">
                          <li>Phone Number</li>
                          <li>Date of Birth (DD-MM-YYYY or YYYY-MM-DD)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> The Role column must match an existing CLMS role exactly. 
                  Custom roles cannot be created via bulk import. Empty roles will cause the row to be skipped.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: Preview - PRD 3.3 */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Validation Preview</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={selectAllValid}>
                    Select All Valid
                  </Button>
                  {errorCount > 0 && (
                    <Button variant="outline" size="sm" onClick={downloadErrorLog}>
                      <Download className="w-4 h-4 mr-2" />
                      Download Error Log
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary Cards - PRD 3.3 Preview */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 rounded-lg text-center border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{successCount}</div>
                  <div className="text-sm text-green-700">Success Count</div>
                  <div className="text-xs text-green-600">New users to be created</div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg text-center border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-600">{ignoreCount}</div>
                  <div className="text-sm text-yellow-700">Ignore Count</div>
                  <div className="text-xs text-yellow-600">Existing users skipped</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg text-center border border-red-200">
                  <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                  <div className="text-sm text-red-700">Error Count</div>
                  <div className="text-xs text-red-600">Invalid data rows</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg text-center border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{selectedCount}</div>
                  <div className="text-sm text-blue-700">Selected</div>
                  <div className="text-xs text-blue-600">To be imported</div>
                </div>
              </div>

              {/* Data Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12">Select</TableHead>
                      <TableHead className="w-16">Row</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>DOB</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                      <TableHead className="min-w-[200px]">Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadedData.map((user) => (
                      <TableRow 
                        key={user.id} 
                        className={
                          user.isEditing ? 'bg-blue-50' : 
                          user.validationStatus === 'error' ? 'bg-red-50/50' :
                          user.validationStatus === 'ignore' ? 'bg-yellow-50/50' : ''
                        }
                      >
                        <TableCell>
                          <Checkbox
                            checked={user.isSelected}
                            onCheckedChange={() => toggleUserSelection(user.id)}
                            disabled={user.validationStatus !== 'success'}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">{user.rowNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(user.validationStatus)}
                            {getStatusBadge(user.validationStatus)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.isEditing ? (
                            <Input
                              defaultValue={user.name}
                              className="w-32 h-8"
                              onBlur={(e) => saveUserEdit(user.id, { name: e.target.value })}
                            />
                          ) : (
                            <span className="font-medium">{user.name || '-'}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.isEditing ? (
                            <Input
                              defaultValue={user.email}
                              className="w-48 h-8"
                              onBlur={(e) => saveUserEdit(user.id, { email: e.target.value })}
                            />
                          ) : (
                            <span className="text-sm">{user.email || '-'}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.phone || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.dateOfBirth || '-'}
                        </TableCell>
                        <TableCell>
                          {user.isEditing ? (
                            <select
                              defaultValue={user.role}
                              className="h-8 px-2 border rounded text-sm"
                              onChange={(e) => saveUserEdit(user.id, { role: e.target.value })}
                            >
                              <option value="">Select Role</option>
                              {PREDEFINED_ROLES.map(role => (
                                <option key={role} value={role}>{role}</option>
                              ))}
                            </select>
                          ) : (
                            user.role ? (
                              <Badge variant="secondary">{user.role}</Badge>
                            ) : (
                              <span className="text-red-500 text-sm">Missing</span>
                            )
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {user.isEditing ? (
                              <>
                                <Button size="sm" variant="ghost" onClick={() => saveUserEdit(user.id, {})}>
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => cancelUserEdit(user.id)}>
                                  <XCircle className="w-4 h-4 text-red-500" />
                                </Button>
                              </>
                            ) : (
                              <Button size="sm" variant="ghost" onClick={() => startEditingUser(user.id)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`text-sm ${
                            user.validationStatus === 'error' ? 'text-red-600' :
                            user.validationStatus === 'ignore' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {user.statusReason}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => {
                  setCurrentStep('upload');
                  setUploadedData([]);
                  setFileName('');
                }}>
                  Upload Different File
                </Button>
                <Button 
                  onClick={processImport}
                  disabled={selectedCount === 0}
                  className="min-w-[200px]"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Import Now ({selectedCount} users)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 3: Processing - PRD 5 Progress Bar */}
        <TabsContent value="processing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 animate-spin" />
                <span>Processing Import</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {importStatus && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing Row {importStatus.processedRows} of {importStatus.totalRows}</span>
                      <span className="font-medium">{importStatus.progress}%</span>
                    </div>
                    <Progress value={importStatus.progress} className="h-3" />
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">{importStatus.successCount}</div>
                      <div className="text-sm text-green-700">Created</div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="text-xl font-bold text-yellow-600">{importStatus.ignoreCount}</div>
                      <div className="text-sm text-yellow-700">Ignored</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="text-xl font-bold text-red-600">{importStatus.errorCount}</div>
                      <div className="text-sm text-red-700">Errors</div>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Server-side processing ensures completion even if you lose connection.
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 4: Complete */}
        <TabsContent value="complete" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Import Complete</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {importStatus && (
                <>
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-6 bg-green-50 rounded-lg text-center border border-green-200">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <div className="text-3xl font-bold text-green-600">{importStatus.successCount}</div>
                      <div className="text-sm text-green-700">Users Created</div>
                    </div>
                    <div className="p-6 bg-yellow-50 rounded-lg text-center border border-yellow-200">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                      <div className="text-3xl font-bold text-yellow-600">{importStatus.ignoreCount}</div>
                      <div className="text-sm text-yellow-700">Users Ignored</div>
                    </div>
                    <div className="p-6 bg-red-50 rounded-lg text-center border border-red-200">
                      <XCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                      <div className="text-3xl font-bold text-red-600">{importStatus.errorCount}</div>
                      <div className="text-sm text-red-700">Errors</div>
                    </div>
                  </div>

                  {/* Email Notification */}
                  <Alert className="bg-blue-50 border-blue-200">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium text-blue-800">
                          Temporary passwords have been sent via email to all new users.
                        </p>
                        <p className="text-sm text-blue-600">
                          Summary email sent to: {importStatus.importedBy} and product@convegenius.ai
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {/* Audit Info - PRD TR-3 */}
                  <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                    <h4 className="font-medium">Audit Log Entry:</h4>
                    <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                      <div>Imported By: <span className="font-medium text-foreground">{importStatus.importedBy}</span></div>
                      <div>Batch ID: <span className="font-mono text-foreground">{importStatus.id}</span></div>
                      <div>Filename: <span className="font-medium text-foreground">{importStatus.fileName}</span></div>
                      <div>Timestamp: <span className="font-medium text-foreground">{new Date(importStatus.startTime).toLocaleString()}</span></div>
                    </div>
                  </div>

                  {/* Rollback Option - PRD 7 */}
                  {importStatus.canRollback && (
                    <Alert className="bg-orange-50 border-orange-200">
                      <RotateCcw className="h-4 w-4 text-orange-500" />
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-orange-800">Rollback Available</p>
                            <p className="text-sm text-orange-600">
                              Until {importStatus.rollbackDeadline ? new Date(importStatus.rollbackDeadline).toLocaleTimeString() : 'N/A'}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            onClick={handleRollback}
                            disabled={isProcessing}
                            className="border-orange-300 text-orange-700 hover:bg-orange-100"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Rollback This Batch
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between pt-4">
                    <div className="space-x-2">
                      {errorCount > 0 && (
                        <Button variant="outline" onClick={downloadErrorLog}>
                          <Download className="w-4 h-4 mr-2" />
                          Download Error Log
                        </Button>
                      )}
                    </div>
                    <Button onClick={onClose}>
                      Close
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BulkUserUpload;
