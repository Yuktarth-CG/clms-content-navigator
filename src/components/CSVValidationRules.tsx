
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Image as ImageIcon,
  Hash,
  Type,
  Layers
} from 'lucide-react';

const CSVValidationRules = () => {
  const validationSections = [
    {
      title: "File Upload Requirements",
      icon: FileText,
      color: "bg-blue-100 text-blue-800",
      rules: [
        { label: "Maximum File Size", value: "10 MB", description: "Maximum allowed size for CSV file upload" },
        { label: "File Type", value: "CSV Only", description: "CSV files are accepted" },
        { label: "File Extension", value: ".csv", description: "Required file extension" }
      ]
    },
    {
      title: "Required Fields",
      icon: CheckCircle,
      color: "bg-green-100 text-green-800",
      rules: [
        { label: "S No.", value: "Required", description: "Mandatory field for question numbering" },
        { label: "Question Statement", value: "Required", description: "Mandatory field for question text" },
        { label: "Question Image Link", value: "Required", description: "Mandatory field for question image path" },
        { label: "Option 1", value: "Required", description: "Mandatory field for first option" },
        { label: "Option 2", value: "Required", description: "Mandatory field for second option" },
        { label: "Option 3", value: "Required", description: "Mandatory field for third option" },
        { label: "Option 4", value: "Required", description: "Mandatory field for fourth option" },
        { label: "Image Option 1", value: "Required", description: "Mandatory field for first image option" },
        { label: "Image Option 2", value: "Required", description: "Mandatory field for second image option" },
        { label: "Image Option 3", value: "Required", description: "Mandatory field for third image option" },
        { label: "Image Option 4", value: "Required", description: "Mandatory field for fourth image option" },
        { label: "Group", value: "Required", description: "Mandatory field for question grouping" }
      ]
    },
    {
      title: "Text Length Constraints",
      icon: Type,
      color: "bg-orange-100 text-orange-800",
      rules: [
        { label: "Question Statement", value: "150 characters", description: "Maximum length for question text" },
        { label: "Group Description", value: "500 characters", description: "Maximum length for group description" },
        { label: "Options", value: "75 characters", description: "Maximum length per option" }
      ]
    },
    {
      title: "Image Format Requirements",
      icon: ImageIcon,
      color: "bg-purple-100 text-purple-800",
      rules: [
        { label: "Supported Types", value: "JPG/JPEG/PNG", description: "Allowed image file formats" },
        { label: "Width", value: "20-150 pixels", description: "Allowed width range for images" },
        { label: "Height", value: "20-150 pixels", description: "Allowed height range for images" }
      ]
    },
    {
      title: "Group Headers",
      icon: Layers,
      color: "bg-indigo-100 text-indigo-800",
      rules: [
        { label: "Format", value: "Ends with .0", description: "Group header must end with .0 (e.g. GP1.0)" },
        { label: "Options", value: "Not allowed", description: "Group headers cannot have options" }
      ]
    },
    {
      title: "Child Questions",
      icon: Hash,
      color: "bg-cyan-100 text-cyan-800",
      rules: [
        { label: "Group ID Format", value: "GP1.1", description: "Valid format for child question group ID" },
        { label: "Options", value: "Required", description: "Must have either text or image options" },
        { label: "Option Type", value: "Exclusive", description: "Must use either all text or all image options" }
      ]
    },
    {
      title: "Question Numbering",
      icon: Hash,
      color: "bg-yellow-100 text-yellow-800",
      rules: [
        { label: "Format", value: "Sequential", description: "Must be in sequential order" },
        { label: "Duplicates", value: "Not allowed", description: "No duplicate question numbers" },
        { label: "Missing", value: "Not allowed", description: "No missing question numbers" }
      ]
    },
    {
      title: "Option Validation",
      icon: AlertCircle,
      color: "bg-red-100 text-red-800",
      rules: [
        { label: "Type", value: "Exclusive", description: "Must use either all text or all image options" },
        { label: "Completeness", value: "Required", description: "All options must be filled" },
        { label: "Image Validity", value: "Required", description: "Image options must be valid files" },
        { label: "Image Format", value: "Required", description: "Images must be in supported formats" },
        { label: "Image Accessibility", value: "Required", description: "Images must be accessible via path" }
      ]
    },
    {
      title: "Question Image Validation",
      icon: ImageIcon,
      color: "bg-pink-100 text-pink-800",
      rules: [
        { label: "Format", value: "Required", description: "Must be in supported formats" },
        { label: "Validity", value: "Required", description: "Must be a valid image file" },
        { label: "Accessibility", value: "Required", description: "Must be accessible via path" }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">CSV Validation Rules</h2>
        <p className="text-gray-600">Complete validation requirements for OCR CSV uploads</p>
      </div>

      <div className="grid gap-6">
        {validationSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className={`p-2 rounded-full ${section.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.rules.map((rule, ruleIndex) => (
                    <div key={ruleIndex} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{rule.label}</span>
                          <Badge variant="outline" className="text-xs">
                            {rule.value}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{rule.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Important Notes</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• All validation rules must be satisfied for successful CSV processing</li>
              <li>• Image paths must be accessible and valid at the time of upload</li>
              <li>• Group headers and child questions follow a hierarchical structure</li>
              <li>• Option types (text or image) must be consistent within each question</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVValidationRules;
