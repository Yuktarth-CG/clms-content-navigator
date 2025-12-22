import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Brain, Search, CheckCircle, AlertCircle } from 'lucide-react';
import {
  AVAILABLE_KNOWLEDGE_GRAPHS,
  KnowledgeGraph,
  Skill
} from '@/data/cgiKnowledgeGraph';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export interface KGSelection {
  knowledgeGraphId: string;
  gradeId: string;
  subjectId: string;
  strandId: string;
  topicId: string;
  loId: string;
  subtopicId: string;
  skillId: string;
  skill?: Skill;
}

interface SkillWithContext extends Skill {
  knowledgeGraphId: string;
  gradeId: string;
  gradeName: string;
  subjectId: string;
  subjectName: string;
  strandId: string;
  strandName: string;
  topicId: string;
  topicName: string;
  loId: string;
  loDescription: string;
  subtopicId: string;
  subtopicName: string;
}

interface KnowledgeGraphSelectorProps {
  onSelectionChange: (selection: KGSelection) => void;
  selection?: Partial<KGSelection>;
}

const KnowledgeGraphSelector: React.FC<KnowledgeGraphSelectorProps> = ({
  onSelectionChange,
  selection: initialSelection
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<SkillWithContext | null>(null);

  // Build a flat list of all skills with their context
  const allSkills = useMemo<SkillWithContext[]>(() => {
    const skills: SkillWithContext[] = [];
    
    for (const kg of AVAILABLE_KNOWLEDGE_GRAPHS) {
      for (const grade of kg.grades) {
        for (const subject of grade.subjects) {
          for (const strand of subject.strands) {
            for (const topic of strand.topics) {
              for (const lo of topic.learningOutcomes) {
                for (const subtopic of lo.subtopics) {
                  for (const skill of subtopic.skills) {
                    skills.push({
                      ...skill,
                      knowledgeGraphId: kg.id,
                      gradeId: grade.id,
                      gradeName: grade.name,
                      subjectId: subject.id,
                      subjectName: subject.name,
                      strandId: strand.id,
                      strandName: strand.name,
                      topicId: topic.id,
                      topicName: topic.name,
                      loId: lo.id,
                      loDescription: lo.description,
                      subtopicId: subtopic.id,
                      subtopicName: subtopic.name,
                    });
                  }
                }
              }
            }
          }
        }
      }
    }
    
    return skills;
  }, []);

  // Initialize with initial selection if provided
  useEffect(() => {
    if (initialSelection?.skillId) {
      const skill = allSkills.find(s => s.id === initialSelection.skillId);
      if (skill) {
        setSelectedSkill(skill);
        setSearchValue(skill.id);
      }
    }
  }, [initialSelection?.skillId, allSkills]);

  // Notify parent when selection changes
  useEffect(() => {
    if (selectedSkill) {
      onSelectionChange({
        knowledgeGraphId: selectedSkill.knowledgeGraphId,
        gradeId: selectedSkill.gradeId,
        subjectId: selectedSkill.subjectId,
        strandId: selectedSkill.strandId,
        topicId: selectedSkill.topicId,
        loId: selectedSkill.loId,
        subtopicId: selectedSkill.subtopicId,
        skillId: selectedSkill.id,
        skill: {
          id: selectedSkill.id,
          name: selectedSkill.name,
          cognitiveLevel: selectedSkill.cognitiveLevel,
        },
      });
    }
  }, [selectedSkill, onSelectionChange]);

  const getCognitiveLevelColor = (level: string) => {
    switch (level) {
      case 'Knowing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Applying': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Reasoning': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleSelectSkill = (skill: SkillWithContext) => {
    setSelectedSkill(skill);
    setSearchValue(skill.id);
    setOpen(false);
  };

  const filteredSkills = allSkills.filter(skill =>
    skill.id.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Skill Code Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Skill Code Input */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Enter Skill Code
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between font-mono"
              >
                {selectedSkill ? selectedSkill.id : "Search or enter skill code..."}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 min-w-[400px]" align="start">
              <Command>
                <CommandInput 
                  placeholder="Type skill code (e.g., HI_8_VO_L1_SHN_S1)..." 
                  value={searchValue}
                  onValueChange={setSearchValue}
                />
                <CommandList>
                  <CommandEmpty>
                    <div className="flex items-center gap-2 text-muted-foreground p-2">
                      <AlertCircle className="w-4 h-4" />
                      No skill found with this code
                    </div>
                  </CommandEmpty>
                  <CommandGroup heading="Available Skills">
                    {filteredSkills.slice(0, 20).map((skill) => (
                      <CommandItem
                        key={skill.id}
                        value={skill.id}
                        onSelect={() => handleSelectSkill(skill)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 w-full">
                          <CheckCircle className={`w-4 h-4 ${selectedSkill?.id === skill.id ? 'text-primary' : 'text-transparent'}`} />
                          <span className="font-mono text-sm">{skill.id}</span>
                          <Badge className={`text-xs ml-auto ${getCognitiveLevelColor(skill.cognitiveLevel)}`}>
                            {skill.cognitiveLevel}
                          </Badge>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground">
            Format: Subject_Grade_Strand_LO_Subtopic_Skill (e.g., HI_8_VO_L1_SHN_S1)
          </p>
        </div>

        {/* Selected Skill Details */}
        {selectedSkill && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-primary mt-0.5" />
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">Selected Skill:</span>
                    <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">{selectedSkill.id}</span>
                    <Badge className={getCognitiveLevelColor(selectedSkill.cognitiveLevel)}>
                      {selectedSkill.cognitiveLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedSkill.name}</p>
                </div>
              </div>

              {/* Hierarchy Details */}
              <div className="grid grid-cols-2 gap-3 text-sm border-t pt-4">
                <div>
                  <span className="text-muted-foreground">Grade:</span>
                  <span className="ml-2 font-medium">{selectedSkill.gradeName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Subject:</span>
                  <span className="ml-2 font-medium">{selectedSkill.subjectName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Strand:</span>
                  <span className="ml-2 font-medium">{selectedSkill.strandName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Topic:</span>
                  <span className="ml-2 font-medium font-mono text-xs">{selectedSkill.topicId}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Topic Name:</span>
                  <span className="ml-2 font-medium">{selectedSkill.topicName}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">LO:</span>
                  <span className="ml-2 font-mono text-xs">{selectedSkill.loId}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">LO Description:</span>
                  <p className="mt-1 text-muted-foreground bg-muted/50 p-2 rounded text-xs">
                    {selectedSkill.loDescription}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Subtopic:</span>
                  <span className="ml-2 font-medium">{selectedSkill.subtopicName}</span>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">({selectedSkill.subtopicId})</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default KnowledgeGraphSelector;
