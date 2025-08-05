import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import StudentDetailsForm, { ExtraField } from './StudentDetailsForm';

interface BarcodeStudentConfigProps {
  barcodeConfig: {
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
  };
  setBarcodeConfig: (config: any) => void;
  includeStudentInfo: boolean;
  setIncludeStudentInfo: (value: boolean) => void;
  studentFields: ExtraField[];
  setStudentFields: (fields: ExtraField[]) => void;
}

const BarcodeStudentConfig: React.FC<BarcodeStudentConfigProps> = ({
  barcodeConfig,
  setBarcodeConfig,
  includeStudentInfo,
  setIncludeStudentInfo,
  studentFields,
  setStudentFields
}) => {
  return (
    <div className="space-y-6">
      {/* Barcode Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Barcode Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Top Left Barcode</Label>
              <Input
                value={barcodeConfig.topLeft}
                onChange={(e) => setBarcodeConfig(prev => ({ ...prev, topLeft: e.target.value }))}
                placeholder="Enter barcode data"
              />
            </div>
            <div>
              <Label>Top Right Barcode</Label>
              <Input
                value={barcodeConfig.topRight}
                onChange={(e) => setBarcodeConfig(prev => ({ ...prev, topRight: e.target.value }))}
                placeholder="Enter barcode data"
              />
            </div>
            <div>
              <Label>Bottom Left Barcode</Label>
              <Input
                value={barcodeConfig.bottomLeft}
                onChange={(e) => setBarcodeConfig(prev => ({ ...prev, bottomLeft: e.target.value }))}
                placeholder="Enter barcode data"
              />
            </div>
            <div>
              <Label>Bottom Right Barcode</Label>
              <Input
                value={barcodeConfig.bottomRight}
                onChange={(e) => setBarcodeConfig(prev => ({ ...prev, bottomRight: e.target.value }))}
                placeholder="Enter barcode data"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Information Section */}
      <StudentDetailsForm
        show={includeStudentInfo}
        onToggle={setIncludeStudentInfo}
        fields={studentFields}
        onFieldsChange={setStudentFields}
      />
    </div>
  );
};

export default BarcodeStudentConfig;