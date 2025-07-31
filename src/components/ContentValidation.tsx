
import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Play, 
  Calendar,
  FileText,
  Settings,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ValidationResult } from '@/types/content';

const ContentValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [selectedScope, setSelectedScope] = useState('all');

  const startValidation = () => {
    setIsValidating(true);
    setValidationProgress(0);
    setValidationResults([]);
    
    // Simulate validation process
    const interval = setInterval(() => {
      setValidationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsValidating(false);
          // Mock validation results
          setValidationResults([
            {
              itemId: 'Q001',
              errors: ['Missing required field: Learning Outcome'],
              warnings: ['Difficulty level not specified']
            },
            {
              itemId: 'Q002',
              errors: [],
              warnings: ['Media file size exceeds recommended limit']
            },
            {
              itemId: 'Q003',
              errors: ['Invalid character encoding in question text', 'Broken media link'],
              warnings: []
            }
          ]);
          return 100;
        }
        return prev + 12.5;
      });
    }, 400);
  };

  const getValidationSummary = () => {
    const total = validationResults.length;
    const withErrors = validationResults.filter(r => r.errors.length > 0).length;
    const withWarnings = validationResults.filter(r => r.warnings.length > 0).length;
    const clean = total - withErrors - withWarnings;
    
    return { total, withErrors, withWarnings, clean };
  };

  const summary = getValidationSummary();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Content Validation</h1>
        <p className="text-muted-foreground mt-1">Validate existing content against quality standards and schema</p>
      </div>

      {/* Validation Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Validation Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Validation Scope</label>
              <Select value={selectedScope} onValueChange={setSelectedScope}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Entire Repository</SelectItem>
                  <SelectItem value="published">Published Content Only</SelectItem>
                  <SelectItem value="recent">Recent Changes</SelectItem>
                  <SelectItem value="custom">Custom Selection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Validation Rules</label>
              <Select defaultValue="comprehensive">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive Check</SelectItem>
                  <SelectItem value="schema-only">Schema Validation Only</SelectItem>
                  <SelectItem value="media-check">Media Integrity Check</SelectItem>
                  <SelectItem value="business-rules">Business Rules Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Priority Level</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Issues</SelectItem>
                  <SelectItem value="errors-only">Errors Only</SelectItem>
                  <SelectItem value="critical">Critical Issues</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Estimated items to validate: <strong>2,450</strong>
            </div>
            <Button 
              onClick={startValidation} 
              disabled={isValidating}
              className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>{isValidating ? 'Validating...' : 'Start Validation'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Validation Progress */}
      {isValidating && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Validation in Progress</h3>
                <span className="text-sm text-muted-foreground">{validationProgress.toFixed(0)}%</span>
              </div>
              <Progress value={validationProgress} className="w-full" />
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Checking content integrity and business rules...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Results Summary */}
      {validationResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-foreground">{summary.total}</div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-red-600">{summary.withErrors}</div>
              <div className="text-sm text-muted-foreground">With Errors</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.withWarnings}</div>
              <div className="text-sm text-muted-foreground">With Warnings</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">{summary.clean}</div>
              <div className="text-sm text-muted-foreground">Clean</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Results */}
      {validationResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Validation Results</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Export Report</Button>
                <Button variant="outline" size="sm">Filter Results</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {validationResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">Content ID: {result.itemId}</h4>
                        <p className="text-sm text-muted-foreground">Question • Chapter: Linear Equations</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {result.errors.length > 0 && (
                        <Badge variant="destructive" className="flex items-center space-x-1">
                          <XCircle className="w-3 h-3" />
                          <span>{result.errors.length} Error{result.errors.length !== 1 ? 's' : ''}</span>
                        </Badge>
                      )}
                      {result.warnings.length > 0 && (
                        <Badge variant="secondary" className="flex items-center space-x-1 bg-yellow-100 text-yellow-800">
                          <AlertCircle className="w-3 h-3" />
                          <span>{result.warnings.length} Warning{result.warnings.length !== 1 ? 's' : ''}</span>
                        </Badge>
                      )}
                      {result.errors.length === 0 && result.warnings.length === 0 && (
                        <Badge variant="secondary" className="flex items-center space-x-1 bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3" />
                          <span>Clean</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {result.errors.length > 0 && (
                    <div className="mb-3">
                      <h5 className="font-medium text-red-600 mb-2">Errors:</h5>
                      {result.errors.map((error, errorIndex) => (
                        <Alert key={errorIndex} variant="destructive" className="mb-2">
                          <XCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                  
                  {result.warnings.length > 0 && (
                    <div className="mb-3">
                      <h5 className="font-medium text-yellow-600 mb-2">Warnings:</h5>
                      {result.warnings.map((warning, warningIndex) => (
                        <Alert key={warningIndex} className="mb-2 border-yellow-200 bg-yellow-50">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <AlertDescription className="text-yellow-800">{warning}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">View Content</Button>
                    <Button variant="outline" size="sm">Fix Issues</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduled Validations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Scheduled Validations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Weekly Content Health Check</h4>
                <p className="text-sm text-muted-foreground">Every Sunday at 2:00 AM • Last run: Jan 14, 2024</p>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Monthly Media Integrity Scan</h4>
                <p className="text-sm text-muted-foreground">First Sunday of each month • Next run: Feb 4, 2024</p>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
          </div>
          
          <Button variant="outline" className="w-full mt-4">
            Configure Scheduled Validations
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentValidation;
