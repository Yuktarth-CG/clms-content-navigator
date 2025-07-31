import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, Plus, X } from 'lucide-react';
import { AdditionalLine } from './PDFPreview';

interface AdditionalLinesEditorProps {
  lines: AdditionalLine[];
  onLinesChange: (lines: AdditionalLine[]) => void;
}

const AdditionalLinesEditor: React.FC<AdditionalLinesEditorProps> = ({ lines, onLinesChange }) => {
  const addLine = () => {
    onLinesChange([...lines, { text: '', orientation: 'center' }]);
  };

  const removeLine = (index: number) => {
    onLinesChange(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof AdditionalLine, value: string) => {
    const updatedLines = [...lines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };
    onLinesChange(updatedLines);
  };

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
          <Label className="text-base font-medium">Add Additional Lines</Label>
          <Button variant="ghost" size="sm">
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 border border-t-0 rounded-b-lg">
        <div className="space-y-4">
          {lines.map((line, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                placeholder={`Line ${index + 1}`}
                value={line.text}
                onChange={(e) => updateLine(index, 'text', e.target.value)}
                className="flex-1"
              />
              <Select
                value={line.orientation}
                onValueChange={(value: 'left' | 'center' | 'right') => updateLine(index, 'orientation', value)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => removeLine(index)}
                disabled={lines.length <= 1}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addLine}>
            <Plus className="w-4 h-4 mr-2" />
            Add Line
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AdditionalLinesEditor;