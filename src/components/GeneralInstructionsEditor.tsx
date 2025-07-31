import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, X, Edit } from 'lucide-react';

interface GeneralInstructionsEditorProps {
  instructions: string[];
  onInstructionsChange: (instructions: string[]) => void;
}

const GeneralInstructionsEditor: React.FC<GeneralInstructionsEditorProps> = ({ instructions, onInstructionsChange }) => {
  const [isEditing, setIsEditing] = useState(false);

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    onInstructionsChange(updated);
  };

  const addInstruction = () => {
    onInstructionsChange([...instructions, '']);
  };

  const removeInstruction = (index: number) => {
    onInstructionsChange(instructions.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-green-800">General Instructions</h3>
          <p className="text-sm text-green-600">Customize the instructions that appear on the assessment</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className="border-green-300 text-green-700 hover:bg-green-100"
        >
          <Edit className="w-4 h-4 mr-2" />
          {isEditing ? 'Save Instructions' : 'Edit Instructions'}
        </Button>
      </div>
      
      {isEditing ? (
        <div className="space-y-3">
          {instructions.map((instruction, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="font-semibold text-green-700 mt-2">{index + 1}.</span>
              <Textarea
                value={instruction}
                onChange={(e) => updateInstruction(index, e.target.value)}
                className="flex-1 min-h-[60px]"
                placeholder="Enter instruction..."
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeInstruction(index)}
                disabled={instructions.length <= 1}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={addInstruction}
            className="mt-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Instruction
          </Button>
        </div>
      ) : (
        <div className="space-y-2 text-sm text-green-800">
          {instructions.map((instruction, index) => (
            <div key={index} className="flex">
              <span className="font-semibold mr-2">{index + 1}.</span>
              <span>{instruction}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GeneralInstructionsEditor;