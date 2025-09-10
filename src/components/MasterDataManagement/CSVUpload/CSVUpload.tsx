import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const CSVUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a CSV file.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Upload Successful",
        description: `${selectedFile.name} has been uploaded and processed successfully.`,
      });
      
      setSelectedFile(null);
      const fileInput = document.getElementById('csv-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "There was an error processing your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/master-data')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h2 className="text-2xl font-bold">CSV Upload</h2>
          <p className="text-muted-foreground">Bulk upload master data using CSV files</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload CSV File
            </CardTitle>
            <CardDescription>
              Select and upload a CSV file containing your master data entries.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file">Select CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>

            {selectedFile && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">{selectedFile.name}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Size: {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}

            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading}
              className="w-full"
            >
              {isUploading ? 'Processing...' : 'Upload and Process'}
            </Button>
          </CardContent>
        </Card>

        {/* Guidelines Section */}
        <Card>
          <CardHeader>
            <CardTitle>CSV Format Guidelines</CardTitle>
            <CardDescription>
              Follow these guidelines to ensure successful data import.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Required Columns:</strong> All mandatory fields must be included in your CSV.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h4 className="font-semibold">Mandatory Fields:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Subject</li>
                <li>• Grade</li>
                <li>• Medium</li>
                <li>• Chapter</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Optional Fields:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Learning Outcome</li>
                <li>• Skill</li>
                <li>• Topic</li>
                <li>• Sub Topic</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Multi-language Support:</h4>
              <p className="text-sm text-muted-foreground">
                Use separate columns for different languages:
                <br />
                • Chapter_en, Chapter_hi
                <br />
                • Subject_en, Subject_hi
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sample Template Section */}
      <Card>
        <CardHeader>
          <CardTitle>Sample CSV Template</CardTitle>
          <CardDescription>
            Download a sample template to get started with the correct format.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <div className="text-muted-foreground">
              Subject_en,Subject_hi,Grade,Medium,Chapter_en,Chapter_hi<br />
              Mathematics,गणित,5,English,Algebra,बीजगणित<br />
              Science,विज्ञान,5,English,Physics,भौतिक विज्ञान
            </div>
          </div>
          <Button variant="outline" className="mt-4">
            <FileText className="h-4 w-4 mr-2" />
            Download Sample Template
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CSVUpload;