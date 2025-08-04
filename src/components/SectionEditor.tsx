import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { QuestionType, QuestionTypeLabels } from '@/types/assessment';

export interface Section {
  id: string;
  title: string; // e.g., "Section A"
  label: string; // e.g., "Multiple Choice Questions"
  questionTypes: QuestionType[]; // Selected question types for this section
  questionCount: number; // Number of questions for this section
}

interface SectionEditorProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
}

const ALL_QUESTION_TYPES: { value: QuestionType; label: string }[] = Object.entries(QuestionTypeLabels).map(([key, value]) => ({
  value: key as QuestionType,
  label: value,
}));

const SectionEditor: React.FC<SectionEditorProps> = ({ sections, onSectionsChange }) => {
  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: `Section ${String.fromCharCode(65 + sections.length)}`,
      label: '',
      questionTypes: [], // Default empty for new sections
      questionCount: 0, // Default question count
    };
    onSectionsChange([...sections, newSection]);
  };

  const updateSection = (id: string, field: keyof Section, value: any) => {
    onSectionsChange(
      sections.map(section => (section.id === id ? { ...section, [field]: value } : section))
    );
  };

  const handleQuestionTypeToggle = (sectionId: string, type: QuestionType, checked: boolean) => {
    onSectionsChange(
      sections.map(section => {
        if (section.id === sectionId) {
          const newTypes = checked
            ? [...section.questionTypes, type]
            : section.questionTypes.filter(t => t !== type);
          return { ...section, questionTypes: newTypes };
        }
        return section;
      })
    );
  };

  const removeSection = (id: string) => {
    onSectionsChange(
      sections.filter(section => section.id !== id)
        .map((section, index) => ({
          ...section,
          title: `Section ${String.fromCharCode(65 + index)}`
        }))
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Sections</CardTitle>
        <p className="text-muted-foreground">Add, label, and organize sections for your assessment.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map(section => (
          <div key={section.id} className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center space-x-4">
              <div className="font-medium w-24">{section.title}</div>
              <Input
                placeholder="Very Short Answer Questions, Long Answer Questions"
                value={section.label}
                onChange={(e) => updateSection(section.id, 'label', e.target.value)}
                className="flex-1"
              />
              <div className="w-32">
                <Input
                  type="number"
                  placeholder="Questions"
                  value={section.questionCount || ''}
                  onChange={(e) => updateSection(section.id, 'questionCount', parseInt(e.target.value) || 0)}
                  min="0"
                  className="text-center"
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => removeSection(section.id)} disabled={sections.length <= 1}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Question Types for this Section:</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_QUESTION_TYPES.map(type => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${section.id}-${type.value}`}
                      checked={section.questionTypes.includes(type.value)}
                      onCheckedChange={(checked) => handleQuestionTypeToggle(section.id, type.value, Boolean(checked))}
                    />
                    <Label htmlFor={`${section.id}-${type.value}`} className="text-sm">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        <Button onClick={addSection}>
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </CardContent>
    </Card>
  );
};

export default SectionEditor;