import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

export interface Section {
  id: string;
  title: string; // e.g., "Section A"
  label: string; // e.g., "Multiple Choice Questions"
}

interface SectionEditorProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({ sections, onSectionsChange }) => {
  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: `Section ${String.fromCharCode(65 + sections.length)}`,
      label: '',
    };
    onSectionsChange([...sections, newSection]);
  };

  const updateSectionLabel = (id: string, label: string) => {
    onSectionsChange(
      sections.map(section => (section.id === id ? { ...section, label } : section))
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
          <div key={section.id} className="flex items-center space-x-4 p-3 border rounded-lg">
            <div className="font-medium w-24">{section.title}</div>
            <Input
              placeholder="Enter section label (e.g., Multiple Choice)"
              value={section.label}
              onChange={(e) => updateSectionLabel(section.id, e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" size="icon" onClick={() => removeSection(section.id)} disabled={sections.length <= 1}>
              <Trash2 className="w-4 h-4" />
            </Button>
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