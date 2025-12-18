import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Layers, Target, FileText, BookMarked, Lightbulb, Brain } from 'lucide-react';
import {
  AVAILABLE_KNOWLEDGE_GRAPHS,
  KnowledgeGraph,
  getSubjectsForGrade,
  getStrandsForSubject,
  getTopicsForStrand,
  getLOsForTopic,
  getSubtopicsForLO,
  getSkillsForSubtopic,
  Skill
} from '@/data/cgiKnowledgeGraph';

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

interface KnowledgeGraphSelectorProps {
  onSelectionChange: (selection: KGSelection) => void;
  selection?: Partial<KGSelection>;
}

const KnowledgeGraphSelector: React.FC<KnowledgeGraphSelectorProps> = ({
  onSelectionChange,
  selection: initialSelection
}) => {
  const [selection, setSelection] = useState<KGSelection>({
    knowledgeGraphId: initialSelection?.knowledgeGraphId || '',
    gradeId: initialSelection?.gradeId || '',
    subjectId: initialSelection?.subjectId || '',
    strandId: initialSelection?.strandId || '',
    topicId: initialSelection?.topicId || '',
    loId: initialSelection?.loId || '',
    subtopicId: initialSelection?.subtopicId || '',
    skillId: initialSelection?.skillId || ''
  });

  const selectedKG = AVAILABLE_KNOWLEDGE_GRAPHS.find(kg => kg.id === selection.knowledgeGraphId);

  // Get filtered options based on current selections
  const grades = selectedKG?.grades || [];
  const subjects = selectedKG && selection.gradeId ? getSubjectsForGrade(selectedKG, selection.gradeId) : [];
  const strands = selectedKG && selection.gradeId && selection.subjectId 
    ? getStrandsForSubject(selectedKG, selection.gradeId, selection.subjectId) : [];
  const topics = selectedKG && selection.gradeId && selection.subjectId && selection.strandId
    ? getTopicsForStrand(selectedKG, selection.gradeId, selection.subjectId, selection.strandId) : [];
  const los = selectedKG && selection.gradeId && selection.subjectId && selection.strandId && selection.topicId
    ? getLOsForTopic(selectedKG, selection.gradeId, selection.subjectId, selection.strandId, selection.topicId) : [];
  const subtopics = selectedKG && selection.gradeId && selection.subjectId && selection.strandId && selection.topicId && selection.loId
    ? getSubtopicsForLO(selectedKG, selection.gradeId, selection.subjectId, selection.strandId, selection.topicId, selection.loId) : [];
  const skills = selectedKG && selection.gradeId && selection.subjectId && selection.strandId && selection.topicId && selection.loId && selection.subtopicId
    ? getSkillsForSubtopic(selectedKG, selection.gradeId, selection.subjectId, selection.strandId, selection.topicId, selection.loId, selection.subtopicId) : [];

  const selectedSkill = skills.find(s => s.id === selection.skillId);

  useEffect(() => {
    onSelectionChange({ ...selection, skill: selectedSkill });
  }, [selection, selectedSkill]);

  const updateSelection = (field: keyof KGSelection, value: string) => {
    const newSelection = { ...selection, [field]: value };

    // Clear dependent fields when parent changes (cascading)
    switch (field) {
      case 'knowledgeGraphId':
        newSelection.gradeId = '';
        newSelection.subjectId = '';
        newSelection.strandId = '';
        newSelection.topicId = '';
        newSelection.loId = '';
        newSelection.subtopicId = '';
        newSelection.skillId = '';
        break;
      case 'gradeId':
        newSelection.subjectId = '';
        newSelection.strandId = '';
        newSelection.topicId = '';
        newSelection.loId = '';
        newSelection.subtopicId = '';
        newSelection.skillId = '';
        break;
      case 'subjectId':
        newSelection.strandId = '';
        newSelection.topicId = '';
        newSelection.loId = '';
        newSelection.subtopicId = '';
        newSelection.skillId = '';
        break;
      case 'strandId':
        newSelection.topicId = '';
        newSelection.loId = '';
        newSelection.subtopicId = '';
        newSelection.skillId = '';
        break;
      case 'topicId':
        newSelection.loId = '';
        newSelection.subtopicId = '';
        newSelection.skillId = '';
        break;
      case 'loId':
        newSelection.subtopicId = '';
        newSelection.skillId = '';
        break;
      case 'subtopicId':
        newSelection.skillId = '';
        break;
    }

    setSelection(newSelection);
  };

  const getCognitiveLevelColor = (level: string) => {
    switch (level) {
      case 'Knowing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Applying': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Reasoning': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Knowledge Graph Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Knowledge Graph */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Knowledge Graph
          </Label>
          <Select
            value={selection.knowledgeGraphId}
            onValueChange={(value) => updateSelection('knowledgeGraphId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Knowledge Graph" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_KNOWLEDGE_GRAPHS.map(kg => (
                <SelectItem key={kg.id} value={kg.id}>
                  {kg.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selection.knowledgeGraphId && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Grade */}
            <div className="space-y-2">
              <Label>Grade</Label>
              <Select
                value={selection.gradeId}
                onValueChange={(value) => updateSelection('gradeId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(grade => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select
                value={selection.subjectId}
                onValueChange={(value) => updateSelection('subjectId', value)}
                disabled={!selection.gradeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Strand */}
            <div className="space-y-2">
              <Label>Strand</Label>
              <Select
                value={selection.strandId}
                onValueChange={(value) => updateSelection('strandId', value)}
                disabled={!selection.subjectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Strand" />
                </SelectTrigger>
                <SelectContent>
                  {strands.map(strand => (
                    <SelectItem key={strand.id} value={strand.id}>
                      {strand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {selection.strandId && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Topic */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Topic ID
                </Label>
                <Select
                  value={selection.topicId}
                  onValueChange={(value) => updateSelection('topicId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Topic ID" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map(topic => (
                      <SelectItem key={topic.id} value={topic.id}>
                        <span className="font-mono">{topic.id}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selection.topicId && (
                  <div className="p-2 rounded-md bg-muted/50 border text-sm">
                    {topics.find(t => t.id === selection.topicId)?.name}
                  </div>
                )}
              </div>

              {/* Learning Outcome */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  LO ID
                </Label>
                <Select
                  value={selection.loId}
                  onValueChange={(value) => updateSelection('loId', value)}
                  disabled={!selection.topicId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select LO ID" />
                  </SelectTrigger>
                  <SelectContent>
                    {los.map(lo => (
                      <SelectItem key={lo.id} value={lo.id}>
                        <span className="font-mono">{lo.id}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selection.loId && (
                  <div className="p-2 rounded-md bg-muted/50 border text-sm max-h-24 overflow-y-auto">
                    {los.find(l => l.id === selection.loId)?.description}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {selection.loId && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Subtopic */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <BookMarked className="w-4 h-4" />
                Subtopic ID
              </Label>
              <Select
                value={selection.subtopicId}
                onValueChange={(value) => updateSelection('subtopicId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Subtopic ID" />
                </SelectTrigger>
                <SelectContent>
                  {subtopics.map(subtopic => (
                    <SelectItem key={subtopic.id} value={subtopic.id}>
                      <span className="font-mono">{subtopic.id}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selection.subtopicId && (
                <div className="p-2 rounded-md bg-muted/50 border text-sm">
                  {subtopics.find(s => s.id === selection.subtopicId)?.name}
                </div>
              )}
            </div>

            {/* Skill */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Skill ID
              </Label>
              <Select
                value={selection.skillId}
                onValueChange={(value) => updateSelection('skillId', value)}
                disabled={!selection.subtopicId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Skill ID" />
                </SelectTrigger>
                <SelectContent>
                  {skills.map(skill => (
                    <SelectItem key={skill.id} value={skill.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{skill.id}</span>
                        <Badge className={`text-xs ${getCognitiveLevelColor(skill.cognitiveLevel)}`}>
                          {skill.cognitiveLevel}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selection.skillId && (
                <div className="p-2 rounded-md bg-muted/50 border text-sm">
                  {skills.find(s => s.id === selection.skillId)?.name}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selected Skill Summary */}
        {selectedSkill && (
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
        )}
      </CardContent>
    </Card>
  );
};

export default KnowledgeGraphSelector;
