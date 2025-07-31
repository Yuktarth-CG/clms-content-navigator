import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

export interface ExtraField {
  label: string;
  value: string;
}

interface StudentDetailsFormProps {
  show: boolean;
  onToggle: (show: boolean) => void;
  fields: ExtraField[];
  onFieldsChange: (fields: ExtraField[]) => void;
}

const StudentDetailsForm: React.FC<StudentDetailsFormProps> = ({ show, onToggle, fields, onFieldsChange }) => {
  const addField = () => {
    onFieldsChange([...fields, { label: '', value: '' }]);
  };

  const removeField = (index: number) => {
    onFieldsChange(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, newLabel: string) => {
    const updated = [...fields];
    updated[index].label = newLabel;
    onFieldsChange(updated);
  };

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-blue-800">Student Details</h3>
          <p className="text-sm text-blue-600">Add space for student information on the assessment</p>
        </div>
        <div className="flex items-center space-x-3">
          <Label htmlFor="student-details-toggle" className="text-sm text-blue-700 font-medium">
            {show ? 'Enabled' : 'Disabled'}
          </Label>
          <Switch
            id="student-details-toggle"
            checked={show}
            onCheckedChange={onToggle}
          />
        </div>
      </div>
      
      {show && (
        <div className="space-y-3">
          <div className="text-sm text-blue-700 mb-2">
            Customize what information students should fill in:
          </div>
          
          {fields.map((field, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                placeholder="e.g., Student Name, Class, Roll Number"
                value={field.label}
                onChange={(e) => updateField(index, e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeField(index)}
                disabled={fields.length <= 1}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={addField}
            className="mt-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add More Fields
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudentDetailsForm;