import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface BarcodeConfig {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
}

interface StudentInfoConfig {
  nameLabel: string;
  sectionLabel: string;
  rollLabel: string;
  idBoxCount: number;
  instructionText: string;
}

interface BarcodeStudentConfigProps {
  barcodeConfig: BarcodeConfig;
  setBarcodeConfig: React.Dispatch<React.SetStateAction<BarcodeConfig>>;
  includeStudentInfo: boolean;
  setIncludeStudentInfo: React.Dispatch<React.SetStateAction<boolean>>;
  studentInfoConfig: StudentInfoConfig;
  setStudentInfoConfig: React.Dispatch<React.SetStateAction<StudentInfoConfig>>;
  onBack: () => void;
  onNext: () => void;
}

const BarcodeStudentConfig: React.FC<BarcodeStudentConfigProps> = ({
  barcodeConfig,
  setBarcodeConfig,
  includeStudentInfo,
  setIncludeStudentInfo,
  studentInfoConfig,
  setStudentInfoConfig,
  onBack,
  onNext
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Barcode & Student Information</h2>
        <p className="text-muted-foreground">Configure barcodes and student information section</p>
      </div>

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
                placeholder="e.g., TL001"
              />
            </div>
            <div>
              <Label>Top Right Barcode</Label>
              <Input
                value={barcodeConfig.topRight}
                onChange={(e) => setBarcodeConfig(prev => ({ ...prev, topRight: e.target.value }))}
                placeholder="e.g., TR001"
              />
            </div>
            <div>
              <Label>Bottom Left Barcode</Label>
              <Input
                value={barcodeConfig.bottomLeft}
                onChange={(e) => setBarcodeConfig(prev => ({ ...prev, bottomLeft: e.target.value }))}
                placeholder="e.g., BL001"
              />
            </div>
            <div>
              <Label>Bottom Right Barcode</Label>
              <Input
                value={barcodeConfig.bottomRight}
                onChange={(e) => setBarcodeConfig(prev => ({ ...prev, bottomRight: e.target.value }))}
                placeholder="e.g., BR001"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Student Information Section</span>
            <Switch
              checked={includeStudentInfo}
              onCheckedChange={setIncludeStudentInfo}
            />
          </CardTitle>
        </CardHeader>
        {includeStudentInfo && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Student Name Label</Label>
                <Input
                  value={studentInfoConfig.nameLabel}
                  onChange={(e) => setStudentInfoConfig(prev => ({ ...prev, nameLabel: e.target.value }))}
                  placeholder="Student Name"
                />
              </div>
              <div>
                <Label>Student Section Label</Label>
                <Input
                  value={studentInfoConfig.sectionLabel}
                  onChange={(e) => setStudentInfoConfig(prev => ({ ...prev, sectionLabel: e.target.value }))}
                  placeholder="Section"
                />
              </div>
              <div>
                <Label>Student Roll Label</Label>
                <Input
                  value={studentInfoConfig.rollLabel}
                  onChange={(e) => setStudentInfoConfig(prev => ({ ...prev, rollLabel: e.target.value }))}
                  placeholder="Roll No."
                />
              </div>
              <div>
                <Label>Student ID Box Count</Label>
                <Input
                  type="number"
                  value={studentInfoConfig.idBoxCount}
                  onChange={(e) => setStudentInfoConfig(prev => ({ ...prev, idBoxCount: parseInt(e.target.value) || 10 }))}
                  placeholder="10"
                  min="5"
                  max="20"
                />
              </div>
            </div>
            <div>
              <Label>Instruction Text</Label>
              <Textarea
                value={studentInfoConfig.instructionText}
                onChange={(e) => setStudentInfoConfig(prev => ({ ...prev, instructionText: e.target.value }))}
                placeholder="Fill in your details clearly"
                rows={2}
              />
            </div>
          </CardContent>
        )}
      </Card>

      <div className="flex space-x-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          Next: Content Selection
        </Button>
      </div>
    </div>
  );
};

export default BarcodeStudentConfig;