import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { QuestionType, QuestionTypeLabels } from '@/types/assessment';

export interface QuestionTypeConfig {
  type: QuestionType;
  count: number;
  marks: number;
}

export interface Section {
  id: string;
  title: string; // e.g., "Section A"
  label: string; // e.g., "Multiple Choice Questions"
  questionTypeConfigs: QuestionTypeConfig[]; // Detailed config for each question type
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
      questionTypeConfigs: [], // Default empty for new sections
    };
    onSectionsChange([...sections, newSection]);
  };

  const updateSection = (id: string, field: keyof Section, value: any) => {
    onSectionsChange(
      sections.map(section => (section.id === id ? { ...section, [field]: value } : section))
    );
  };

  const addQuestionTypeConfig = (sectionId: string, type: QuestionType) => {
    onSectionsChange(
      sections.map(section => {
        if (section.id === sectionId) {
          const newConfig: QuestionTypeConfig = { type, count: 1, marks: 1 };
          return { ...section, questionTypeConfigs: [...section.questionTypeConfigs, newConfig] };
        }
        return section;
      })
    );
  };

  const removeQuestionTypeConfig = (sectionId: string, type: QuestionType) => {
    onSectionsChange(
      sections.map(section => {
        if (section.id === sectionId) {
          return { 
            ...section, 
            questionTypeConfigs: section.questionTypeConfigs.filter(config => config.type !== type) 
          };
        }
        return section;
      })
    );
  };

  const updateQuestionTypeConfig = (sectionId: string, type: QuestionType, field: 'count' | 'marks', value: number) => {
    onSectionsChange(
      sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            questionTypeConfigs: section.questionTypeConfigs.map(config =>
              config.type === type ? { ...config, [field]: value } : config
            )
          };
        }
        return section;
      })
    );
  };

  const getTotalQuestions = (section: Section) => {
    return section.questionTypeConfigs.reduce((total, config) => total + config.count, 0);
  };

  const getTotalMarks = (section: Section) => {
    return section.questionTypeConfigs.reduce((total, config) => total + (config.count * config.marks), 0);
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
              <div className="text-sm text-muted-foreground">
                Total: {getTotalQuestions(section)} questions, {getTotalMarks(section)} marks
              </div>
              <Button variant="outline" size="icon" onClick={() => removeSection(section.id)} disabled={sections.length <= 1}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Question Types Configuration:</Label>
              
              {section.questionTypeConfigs.length > 0 && (
                <div className="space-y-2 mb-4">
                  {section.questionTypeConfigs.map(config => (
                    <div key={config.type} className="flex items-center space-x-2 p-2 bg-muted rounded">
                      <span className="text-sm font-medium w-32">{QuestionTypeLabels[config.type]}</span>
                      <div className="flex items-center space-x-1">
                        <Label className="text-xs">Count:</Label>
                        <Input
                          type="number"
                          value={config.count}
                          onChange={(e) => updateQuestionTypeConfig(section.id, config.type, 'count', parseInt(e.target.value) || 0)}
                          min="0"
                          className="w-16 h-8"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <Label className="text-xs">Marks each:</Label>
                        <Input
                          type="number"
                          value={config.marks}
                          onChange={(e) => updateQuestionTypeConfig(section.id, config.type, 'marks', parseInt(e.target.value) || 0)}
                          min="0"
                          className="w-16 h-8"
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => removeQuestionTypeConfig(section.id, config.type)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Select onValueChange={(value) => addQuestionTypeConfig(section.id, value as QuestionType)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Add question type..." />
                </SelectTrigger>
                <SelectContent>
                  {ALL_QUESTION_TYPES
                    .filter(type => !section.questionTypeConfigs.some(config => config.type === type.value))
                    .map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
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