import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, BookOpen, Target, ChevronRight, ChevronDown } from 'lucide-react';

// Mock data with cross-references
const mockChapters = [{
  id: 'chapter1',
  name: 'Photosynthesis',
  description: 'Process of photosynthesis in plants',
  questionCount: 42,
  learningOutcomes: ['lo1', 'lo2']
}, {
  id: 'chapter2',
  name: 'Cell Structure',
  description: 'Basic structure and function of cells',
  questionCount: 35,
  learningOutcomes: ['lo2', 'lo3']
}, {
  id: 'chapter3',
  name: 'Human Body Systems',
  description: 'Various systems in human body',
  questionCount: 48,
  learningOutcomes: ['lo3', 'lo4']
}, {
  id: 'chapter4',
  name: 'Ecosystems',
  description: 'Environmental systems and interactions',
  questionCount: 33,
  learningOutcomes: ['lo4', 'lo1']
}, {
  id: 'chapter5',
  name: 'Chemical Reactions',
  description: 'Basic chemical reactions and properties',
  questionCount: 27,
  learningOutcomes: ['lo1', 'lo5']
}];
const mockLearningOutcomes = [{
  id: 'lo1',
  code: 'LO001',
  title: 'Plant Biology Understanding',
  description: 'Understand basic plant biology concepts',
  questionCount: 38,
  chapters: ['chapter1', 'chapter4', 'chapter5']
}, {
  id: 'lo2',
  code: 'LO002',
  title: 'Cellular Structure Knowledge',
  description: 'Knowledge of cell structure and function',
  questionCount: 41,
  chapters: ['chapter1', 'chapter2']
}, {
  id: 'lo3',
  code: 'LO003',
  title: 'Body System Functions',
  description: 'Understanding of human body systems',
  questionCount: 29,
  chapters: ['chapter2', 'chapter3']
}, {
  id: 'lo4',
  code: 'LO004',
  title: 'Environmental Interactions',
  description: 'Understanding ecosystem interactions',
  questionCount: 36,
  chapters: ['chapter3', 'chapter4']
}, {
  id: 'lo5',
  code: 'LO005',
  title: 'Chemical Process Knowledge',
  description: 'Understanding chemical reactions',
  questionCount: 22,
  chapters: ['chapter5']
}];
interface ChapterLOSelectorProps {
  selectedChapters: string[];
  selectedLearningOutcomes: string[];
  onChapterChange: (chapters: string[]) => void;
  onLearningOutcomeChange: (outcomes: string[]) => void;
  mode: 'chapters' | 'learningOutcomes';
  onModeChange: (mode: 'chapters' | 'learningOutcomes') => void;
}
const ChapterLOSelector: React.FC<ChapterLOSelectorProps> = ({
  selectedChapters,
  selectedLearningOutcomes,
  onChapterChange,
  onLearningOutcomeChange,
  mode,
  onModeChange
}) => {
  const [chapterSearch, setChapterSearch] = useState('');
  const [loSearch, setLoSearch] = useState('');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [expandedLOs, setExpandedLOs] = useState<Set<string>>(new Set());
  console.log('ChapterLOSelector rendering, mode:', mode, 'expandedChapters:', expandedChapters);

  // Filter chapters based on search and show related LOs
  const filteredChapters = useMemo(() => {
    return mockChapters.filter(chapter => chapter.name.toLowerCase().includes(chapterSearch.toLowerCase()) || chapter.description.toLowerCase().includes(chapterSearch.toLowerCase()));
  }, [chapterSearch]);

  // Filter LOs based on search and show related chapters
  const filteredLOs = useMemo(() => {
    return mockLearningOutcomes.filter(lo => lo.title.toLowerCase().includes(loSearch.toLowerCase()) || lo.description.toLowerCase().includes(loSearch.toLowerCase()) || lo.code.toLowerCase().includes(loSearch.toLowerCase()));
  }, [loSearch]);

  // Get related LOs for selected chapters
  const relatedLOs = useMemo(() => {
    if (selectedChapters.length === 0) return [];
    const relatedIds = new Set<string>();
    selectedChapters.forEach(chapterId => {
      const chapter = mockChapters.find(c => c.id === chapterId);
      if (chapter) {
        chapter.learningOutcomes.forEach(loId => relatedIds.add(loId));
      }
    });
    return mockLearningOutcomes.filter(lo => relatedIds.has(lo.id));
  }, [selectedChapters]);

  // Get related chapters for selected LOs
  const relatedChapters = useMemo(() => {
    if (selectedLearningOutcomes.length === 0) return [];
    const relatedIds = new Set<string>();
    selectedLearningOutcomes.forEach(loId => {
      const lo = mockLearningOutcomes.find(l => l.id === loId);
      if (lo) {
        lo.chapters.forEach(chapterId => relatedIds.add(chapterId));
      }
    });
    return mockChapters.filter(ch => relatedIds.has(ch.id));
  }, [selectedLearningOutcomes]);
  const handleChapterToggle = (chapterId: string, checked: boolean) => {
    if (checked) {
      onChapterChange([...selectedChapters, chapterId]);
    } else {
      onChapterChange(selectedChapters.filter(id => id !== chapterId));
    }
  };
  const handleLOToggle = (loId: string, checked: boolean) => {
    if (checked) {
      onLearningOutcomeChange([...selectedLearningOutcomes, loId]);
    } else {
      onLearningOutcomeChange(selectedLearningOutcomes.filter(id => id !== loId));
    }
  };
  const handleChapterExpand = (chapterId: string) => {
    console.log('handleChapterExpand called with:', chapterId);
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
      console.log('Collapsing chapter:', chapterId);
    } else {
      newExpanded.add(chapterId);
      console.log('Expanding chapter:', chapterId);
    }
    setExpandedChapters(newExpanded);
  };
  const handleLOExpand = (loId: string) => {
    const newExpanded = new Set(expandedLOs);
    if (newExpanded.has(loId)) {
      newExpanded.delete(loId);
    } else {
      newExpanded.add(loId);
    }
    setExpandedLOs(newExpanded);
  };

  // Error boundary check
  if (!mode || !onModeChange || !onChapterChange || !onLearningOutcomeChange) {
    return <div className="p-4 border border-destructive rounded-lg">
        <p className="text-destructive">Error: Missing required props for ChapterLOSelector</p>
      </div>;
  }
  return <div className="space-y-6">
      {/* Selection Mode */}
      <Card>
        <CardHeader>
          <CardTitle>How would you like to choose content?</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={mode} onValueChange={(value: 'chapters' | 'learningOutcomes') => onModeChange(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="chapters" id="chapters" />
              <Label htmlFor="chapters" className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Choose by Chapters</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="learningOutcomes" id="learningOutcomes" />
              <Label htmlFor="learningOutcomes" className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Choose by Learning Outcomes</span>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Chapter Selection */}
      {mode === 'chapters' && <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Choose Chapters</span>
              <Badge variant="outline">{selectedChapters.length} selected</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search chapters..." value={chapterSearch} onChange={e => setChapterSearch(e.target.value)} className="pl-9" />
            </div>

            <div className="grid gap-4">
              {filteredChapters.map(chapter => <Collapsible key={chapter.id} open={expandedChapters.has(chapter.id)} onOpenChange={() => handleChapterExpand(chapter.id)}>
                  <div className="border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3 p-3">
                      <Checkbox id={chapter.id} checked={selectedChapters.includes(chapter.id)} onCheckedChange={checked => handleChapterToggle(chapter.id, !!checked)} />
                      <div className="flex-1">
                        <Label htmlFor={chapter.id} className="font-medium cursor-pointer">
                          {chapter.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">{chapter.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {chapter.questionCount} questions
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {chapter.learningOutcomes.length} skills
                          </Badge>
                        </div>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" size="sm" className="w-8 h-8 p-0 hover:bg-muted border-muted-foreground/20">
                          {expandedChapters.has(chapter.id) ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                          <span className="sr-only">Toggle skills</span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                      <div className="px-3 pb-3 border-t bg-muted/30">
                        <div className="text-xs font-medium text-muted-foreground mt-2 mb-1">
                          Related Skills:
                        </div>
                        {mockLearningOutcomes.filter(lo => chapter.learningOutcomes.includes(lo.id)).map(lo => <div key={lo.id} className="flex justify-between text-xs mb-1 p-1 rounded hover:bg-muted/50">
                              <span>{lo.code}: {lo.title}</span>
                              <span>{lo.questionCount} questions</span>
                            </div>)}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>)}
            </div>

            {/* Show related skills summary */}
            {relatedLOs.length > 0 && <div className="pt-4 border-t">
                
                <div className="grid gap-2">
                  {relatedLOs.map(lo => <div key={lo.id} className="p-2 bg-muted/50 rounded text-sm">
                      <span className="font-medium">{lo.code}:</span> {lo.title}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {lo.questionCount} questions
                      </Badge>
                    </div>)}
                </div>
              </div>}
          </CardContent>
        </Card>}

      {/* Learning Outcome Selection */}
      {mode === 'learningOutcomes' && <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Choose Learning Outcomes</span>
              <Badge variant="outline">{selectedLearningOutcomes.length} selected</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search learning outcomes..." value={loSearch} onChange={e => setLoSearch(e.target.value)} className="pl-9" />
            </div>

            <div className="grid gap-4">
              {filteredLOs.map(lo => <Collapsible key={lo.id} open={expandedLOs.has(lo.id)} onOpenChange={() => handleLOExpand(lo.id)}>
                  <div className="border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3 p-3">
                      <Checkbox id={lo.id} checked={selectedLearningOutcomes.includes(lo.id)} onCheckedChange={checked => handleLOToggle(lo.id, !!checked)} />
                      <div className="flex-1">
                        <Label htmlFor={lo.id} className="font-medium cursor-pointer">
                          {lo.code}: {lo.title}
                        </Label>
                        <p className="text-sm text-muted-foreground">{lo.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {lo.questionCount} questions
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {lo.chapters.length} topics
                          </Badge>
                        </div>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" size="sm" className="w-8 h-8 p-0 hover:bg-muted border-muted-foreground/20">
                          {expandedLOs.has(lo.id) ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                          <span className="sr-only">Toggle topics</span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                      <div className="px-3 pb-3 border-t bg-muted/30">
                        <div className="text-xs font-medium text-muted-foreground mt-2 mb-1">
                          Related Topics:
                        </div>
                        {mockChapters.filter(ch => lo.chapters.includes(ch.id)).map(ch => <div key={ch.id} className="flex justify-between text-xs mb-1 p-1 rounded hover:bg-muted/50">
                              <span>{ch.name}</span>
                              <span>{ch.questionCount} questions</span>
                            </div>)}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>)}
            </div>

            {/* Show related topics summary */}
            {relatedChapters.length > 0 && <div className="pt-4 border-t">
                <h4 className="font-medium mb-2 flex items-center space-x-2">
                  <ChevronRight className="w-4 h-4" />
                  <span>Topics Covered by Selected Skills</span>
                </h4>
                <div className="grid gap-2">
                  {relatedChapters.map(chapter => <div key={chapter.id} className="p-2 bg-muted/50 rounded text-sm">
                      <span className="font-medium">{chapter.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {chapter.questionCount} questions
                      </Badge>
                    </div>)}
                </div>
              </div>}
          </CardContent>
        </Card>}
    </div>;
};
export default ChapterLOSelector;