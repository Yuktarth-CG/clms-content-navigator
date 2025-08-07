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
      <div className="space-y-4">
        <Label className="text-base font-medium">How would you like to choose content?</Label>
        <RadioGroup 
          value={mode} 
          onValueChange={(value: 'chapters' | 'learningOutcomes') => onModeChange(value)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Label htmlFor="chapters-option" className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="chapters" id="chapters-option" />
            <div className="flex items-center space-x-3">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium">By Chapters</div>
                <div className="text-sm text-muted-foreground">Pick chapters from your syllabus</div>
              </div>
            </div>
          </Label>
          <Label htmlFor="los-option" className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="learningOutcomes" id="los-option" />
            <div className="flex items-center space-x-3">
              <Target className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium">By Learning Outcomes</div>
                <div className="text-sm text-muted-foreground">Pick specific learning outcomes to test</div>
              </div>
            </div>
          </Label>
        </RadioGroup>
      </div>

      {/* Chapter Selection */}
      {mode === 'chapters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <Label className="text-base font-medium">Select Chapters</Label>
              <Badge variant="outline" className="text-xs">
                {selectedChapters.length} selected
              </Badge>
            </div>
            <Input
              placeholder="Search chapters..."
              value={chapterSearch}
              onChange={(e) => setChapterSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div className="grid gap-3">
            {filteredChapters.map(chapter => (
              <Collapsible key={chapter.id} open={expandedChapters.has(chapter.id)} onOpenChange={() => handleChapterExpand(chapter.id)}>
                <div className="border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3 p-3">
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-8 h-8 p-0 hover:bg-muted border-muted-foreground/20"
                      >
                        {expandedChapters.has(chapter.id) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">Toggle skills</span>
                      </Button>
                    </CollapsibleTrigger>
                    <div className="flex-1">
                      <div className="font-medium">{chapter.name}</div>
                      <div className="text-sm text-muted-foreground">{chapter.description}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {chapter.questionCount} questions available
                        </Badge>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      id={chapter.id}
                      checked={selectedChapters.includes(chapter.id)}
                      onChange={(e) => handleChapterToggle(chapter.id, e.target.checked)}
                      className="w-4 h-4"
                    />
                  </div>
                  <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <div className="px-3 pb-3 border-t bg-muted/30">
                      <div className="text-xs font-medium text-muted-foreground mt-2 mb-1">
                        Related Skills ({mockLearningOutcomes.filter(lo => chapter.learningOutcomes.includes(lo.id)).length}):
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-2">
                        {mockLearningOutcomes
                          .filter(lo => chapter.learningOutcomes.includes(lo.id))
                          .map(lo => (
                            <div key={lo.id} className="flex items-start justify-between text-xs p-2 rounded hover:bg-muted/50 transition-colors">
                              <div className="flex items-start space-x-2 flex-1 min-w-0">
                                <input
                                  type="checkbox"
                                  id={`${chapter.id}-${lo.id}`}
                                  checked={selectedLearningOutcomes.includes(lo.id)}
                                  onChange={(e) => handleLOToggle(lo.id, e.target.checked)}
                                  className="w-3 h-3 mt-0.5 flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium truncate">{lo.code}: {lo.title}</div>
                                  {lo.description && (
                                    <div className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{lo.description}</div>
                                  )}
                                </div>
                              </div>
                              <span className="text-muted-foreground ml-2 flex-shrink-0">{lo.questionCount}q</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        </div>
      )}

      {/* Learning Outcome Selection */}
      {mode === 'learningOutcomes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-600" />
              <Label className="text-base font-medium">Select Learning Outcomes</Label>
              <Badge variant="outline" className="text-xs">
                {selectedLearningOutcomes.length} selected
              </Badge>
            </div>
            <Input
              placeholder="Search learning outcomes..."
              value={loSearch}
              onChange={(e) => setLoSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div className="grid gap-3">
            {filteredLOs.map(lo => (
              <Collapsible key={lo.id} open={expandedLOs.has(lo.id)} onOpenChange={() => handleLOExpand(lo.id)}>
                <div className="border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3 p-3">
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-8 h-8 p-0 hover:bg-muted border-muted-foreground/20"
                      >
                        {expandedLOs.has(lo.id) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">Toggle topics</span>
                      </Button>
                    </CollapsibleTrigger>
                    <div className="flex-1">
                      <div className="font-medium">{lo.code}: {lo.title}</div>
                      <div className="text-sm text-muted-foreground">{lo.description}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {lo.questionCount} questions available
                        </Badge>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      id={lo.id}
                      checked={selectedLearningOutcomes.includes(lo.id)}
                      onChange={(e) => handleLOToggle(lo.id, e.target.checked)}
                      className="w-4 h-4"
                    />
                  </div>
                  <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <div className="px-3 pb-3 border-t bg-muted/30">
                      <div className="text-xs font-medium text-muted-foreground mt-2 mb-1">
                        Related Topics ({mockChapters.filter(ch => lo.chapters.includes(ch.id)).length}):
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-2">
                        {mockChapters
                          .filter(ch => lo.chapters.includes(ch.id))
                          .map(ch => (
                            <div key={ch.id} className="flex items-start justify-between text-xs p-2 rounded hover:bg-muted/50 transition-colors">
                              <div className="flex items-start space-x-2 flex-1 min-w-0">
                                <input
                                  type="checkbox"
                                  id={`${lo.id}-${ch.id}`}
                                  checked={selectedChapters.includes(ch.id)}
                                  onChange={(e) => handleChapterToggle(ch.id, e.target.checked)}
                                  className="w-3 h-3 mt-0.5 flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium truncate">{ch.name}</div>
                                  {ch.description && (
                                    <div className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{ch.description}</div>
                                  )}
                                </div>
                              </div>
                              <span className="text-muted-foreground ml-2 flex-shrink-0">{ch.questionCount}q</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        </div>
      )}
    </div>;
};
export default ChapterLOSelector;