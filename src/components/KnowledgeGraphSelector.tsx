import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Brain, Search, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { AVAILABLE_KNOWLEDGE_GRAPHS, Skill } from '@/data/cgiKnowledgeGraph';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
                      subtopicName: subtopic.name
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
          cognitiveLevel: selectedSkill.cognitiveLevel
        }
      });
    }
  }, [selectedSkill, onSelectionChange]);
  const getCognitiveLevelColor = (level: string) => {
    switch (level) {
      case 'Knowing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Applying':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Reasoning':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  const handleSelectSkill = (skill: SkillWithContext) => {
    setSelectedSkill(skill);
    setSearchValue(skill.id);
    setOpen(false);
  };
  const filteredSkills = allSkills.filter(skill => skill.id.toLowerCase().includes(searchValue.toLowerCase()));
  const codeBreakdown = [{
    code: 'HI',
    label: 'Subject Code',
    example: 'HI = Hindi, MA = Mathematics'
  }, {
    code: 'KG',
    label: 'Grade',
    example: 'KG = Kindergarten, 8 = Grade 8'
  }, {
    code: 'A01',
    label: 'Strand Code',
    example: 'A01, VO = Vocabulary, GR = Grammar'
  }, {
    code: 'L01',
    label: 'LO Code',
    example: 'L01 = Learning Outcome 1'
  }, {
    code: 'S01',
    label: 'Skill Code',
    example: 'S01 = Skill 1, S02 = Skill 2'
  }];
  const DetailBox = ({
    label,
    value,
    code,
    tooltip
  }: {
    label: string;
    value: string;
    code?: string;
    tooltip?: string;
  }) => <div className="p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        {tooltip && <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[250px]">
                <p className="text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>}
      </div>
      <p className="text-sm font-medium">{value}</p>
      {code && <span className="text-xs font-mono text-muted-foreground mt-1 inline-block">{code}</span>}
    </div>;
  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Skill Code Selection
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96" align="end">
              <div className="space-y-4">
                <h4 className="font-semibold text-sm">Knowledge Graph Nomenclature</h4>
                
                {/* Visual Code Breakdown */}
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-xs text-muted-foreground mb-2">Example:</p>
                  <div className="font-mono text-sm font-medium flex flex-wrap gap-0.5">
                    <span className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded-l">HI</span>
                    <span className="bg-green-100 dark:bg-green-900 px-1.5 py-0.5">KG</span>
                    <span className="bg-yellow-100 dark:bg-yellow-900 px-1.5 py-0.5">A01</span>
                    <span className="bg-orange-100 dark:bg-orange-900 px-1.5 py-0.5">_L01</span>
                    <span className="bg-purple-100 dark:bg-purple-900 px-1.5 py-0.5 rounded-r">_S01</span>
                  </div>
                </div>

                {/* Code Breakdown Legend */}
                <div className="space-y-2">
                  {codeBreakdown.map(item => <div key={item.code} className="flex items-start gap-2 text-sm">
                      <span className="font-mono font-semibold bg-muted px-1.5 py-0.5 rounded min-w-[40px] text-center">
                        {item.code}
                      </span>
                      <div>
                        <span className="font-medium">{item.label}</span>
                        <p className="text-xs text-muted-foreground">{item.example}</p>
                      </div>
                    </div>)}
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Full code: <span className="font-mono font-medium">HIKGA01_L01_S01</span>
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
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
              <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-mono">
                {selectedSkill ? selectedSkill.id : "Search or enter skill code..."}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 min-w-[400px]" align="start">
              <Command>
                <CommandInput placeholder="Type skill code (e.g., HI_8_VO_L1_SHN_S1)..." value={searchValue} onValueChange={setSearchValue} />
                <CommandList>
                  <CommandEmpty>
                    <div className="flex items-center gap-2 text-muted-foreground p-2">
                      <AlertCircle className="w-4 h-4" />
                      No skill found with this code
                    </div>
                  </CommandEmpty>
                  <CommandGroup heading="Available Skills">
                    {filteredSkills.slice(0, 20).map(skill => <CommandItem key={skill.id} value={skill.id} onSelect={() => handleSelectSkill(skill)} className="cursor-pointer">
                        <div className="flex items-center gap-2 w-full">
                          <CheckCircle className={`w-4 h-4 ${selectedSkill?.id === skill.id ? 'text-primary' : 'text-transparent'}`} />
                          <span className="font-mono text-sm">{skill.id}</span>
                          <Badge className={`text-xs ml-auto ${getCognitiveLevelColor(skill.cognitiveLevel)}`}>
                            {skill.cognitiveLevel}
                          </Badge>
                        </div>
                      </CommandItem>)}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Selected Skill Details - Individual Boxes */}
        {selectedSkill && <div className="space-y-4">
            {/* Skill Summary */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
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
              </CardContent>
            </Card>

            {/* Hierarchy Details - Individual Boxes */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <DetailBox label="Grade" value={selectedSkill.gradeName} tooltip="The class/grade level for this content" />
              <DetailBox label="Subject" value={selectedSkill.subjectName} tooltip="The academic subject area" />
              <DetailBox label="Strand" value={selectedSkill.strandName} tooltip="A major thematic area within the subject" />
            </div>

            <DetailBox label="Topic" value={selectedSkill.topicName} code={selectedSkill.topicId} tooltip="A specific topic within the strand" />

            <DetailBox label="Learning Outcome (LO)" value={selectedSkill.loDescription} code={selectedSkill.loId} tooltip="Expected learning achievement students should demonstrate" />

            <DetailBox label="Subtopic" value={selectedSkill.subtopicName} code={selectedSkill.subtopicId} tooltip="A focused area within the learning outcome" />
          </div>}
      </CardContent>
    </Card>;
};
export default KnowledgeGraphSelector;