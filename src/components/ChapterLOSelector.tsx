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
  learningOutcomes: ['lo1', 'lo2', 'lo3', 'lo4', 'lo5', 'lo6', 'lo7', 'lo8', 'lo9', 'lo10', 'lo11', 'lo12', 'lo13', 'lo14', 'lo15', 'lo16', 'lo17', 'lo18', 'lo19', 'lo20', 'lo21', 'lo22', 'lo23', 'lo24', 'lo25']
}, {
  id: 'chapter2',
  name: 'Cell Structure',
  description: 'Basic structure and function of cells',
  questionCount: 35,
  learningOutcomes: ['lo2', 'lo3', 'lo6', 'lo9', 'lo12', 'lo15', 'lo18']
}, {
  id: 'chapter3',
  name: 'Human Body Systems',
  description: 'Various systems in human body',
  questionCount: 48,
  learningOutcomes: ['lo3', 'lo4', 'lo7', 'lo10', 'lo13', 'lo16', 'lo19']
}, {
  id: 'chapter4',
  name: 'Ecosystems',
  description: 'Environmental systems and interactions',
  questionCount: 33,
  learningOutcomes: ['lo4', 'lo1', 'lo8', 'lo11', 'lo14', 'lo17', 'lo20']
}, {
  id: 'chapter5',
  name: 'Chemical Reactions',
  description: 'Basic chemical reactions and properties',
  questionCount: 27,
  learningOutcomes: ['lo1', 'lo5', 'lo9', 'lo12', 'lo15', 'lo21', 'lo22', 'lo23', 'lo24', 'lo25']
}];
const mockLearningOutcomes = [{
  id: 'lo1',
  code: 'LO001',
  title: 'Plant Biology Understanding',
  description: 'Understand basic plant biology concepts and photosynthetic processes',
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
  description: 'Understanding of human body systems and their interactions',
  questionCount: 29,
  chapters: ['chapter1', 'chapter2', 'chapter3']
}, {
  id: 'lo4',
  code: 'LO004',
  title: 'Environmental Interactions',
  description: 'Understanding ecosystem interactions and environmental balance',
  questionCount: 36,
  chapters: ['chapter1', 'chapter3', 'chapter4']
}, {
  id: 'lo5',
  code: 'LO005',
  title: 'Chemical Process Knowledge',
  description: 'Understanding chemical reactions and molecular processes',
  questionCount: 22,
  chapters: ['chapter1', 'chapter5']
}, {
  id: 'lo6',
  code: 'LO006',
  title: 'Membrane Transport',
  description: 'Understand how substances move across cell membranes',
  questionCount: 31,
  chapters: ['chapter1', 'chapter2']
}, {
  id: 'lo7',
  code: 'LO007',
  title: 'Energy Metabolism',
  description: 'Analyze cellular energy production and consumption pathways',
  questionCount: 25,
  chapters: ['chapter1', 'chapter3']
}, {
  id: 'lo8',
  code: 'LO008',
  title: 'Genetic Information Flow',
  description: 'Trace the flow of genetic information from DNA to proteins',
  questionCount: 33,
  chapters: ['chapter1', 'chapter4']
}, {
  id: 'lo9',
  code: 'LO009',
  title: 'Enzyme Function',
  description: 'Explain how enzymes catalyze biochemical reactions',
  questionCount: 28,
  chapters: ['chapter1', 'chapter2', 'chapter5']
}, {
  id: 'lo10',
  code: 'LO010',
  title: 'Homeostatic Regulation',
  description: 'Describe how organisms maintain internal balance',
  questionCount: 35,
  chapters: ['chapter1', 'chapter3']
}, {
  id: 'lo11',
  code: 'LO011',
  title: 'Population Dynamics',
  description: 'Analyze factors affecting population growth and decline',
  questionCount: 27,
  chapters: ['chapter1', 'chapter4']
}, {
  id: 'lo12',
  code: 'LO012',
  title: 'Molecular Bonding',
  description: 'Understand different types of chemical bonds in biological systems',
  questionCount: 24,
  chapters: ['chapter1', 'chapter2', 'chapter5']
}, {
  id: 'lo13',
  code: 'LO013',
  title: 'Nervous System Function',
  description: 'Explain how nerve cells transmit electrical and chemical signals',
  questionCount: 30,
  chapters: ['chapter1', 'chapter3']
}, {
  id: 'lo14',
  code: 'LO014',
  title: 'Food Web Analysis',
  description: 'Analyze energy flow and nutrient cycling in ecosystems',
  questionCount: 32,
  chapters: ['chapter1', 'chapter4']
}, {
  id: 'lo15',
  code: 'LO015',
  title: 'pH and Buffer Systems',
  description: 'Understand acid-base balance in biological systems',
  questionCount: 26,
  chapters: ['chapter1', 'chapter2', 'chapter5']
}, {
  id: 'lo16',
  code: 'LO016',
  title: 'Respiratory Physiology',
  description: 'Explain gas exchange mechanisms in living organisms',
  questionCount: 29,
  chapters: ['chapter1', 'chapter3']
}, {
  id: 'lo17',
  code: 'LO017',
  title: 'Biodiversity Conservation',
  description: 'Evaluate strategies for preserving biological diversity',
  questionCount: 23,
  chapters: ['chapter1', 'chapter4']
}, {
  id: 'lo18',
  code: 'LO018',
  title: 'Cell Division Processes',
  description: 'Compare and contrast mitosis and meiosis',
  questionCount: 34,
  chapters: ['chapter1', 'chapter2']
}, {
  id: 'lo19',
  code: 'LO019',
  title: 'Circulatory System',
  description: 'Analyze blood flow and cardiovascular function',
  questionCount: 31,
  chapters: ['chapter1', 'chapter3']
}, {
  id: 'lo20',
  code: 'LO020',
  title: 'Climate Change Impact',
  description: 'Assess effects of climate change on ecosystems',
  questionCount: 28,
  chapters: ['chapter1', 'chapter4']
}, {
  id: 'lo21',
  code: 'LO021',
  title: 'Protein Structure',
  description: 'Relate protein structure to biological function',
  questionCount: 25,
  chapters: ['chapter1', 'chapter5']
}, {
  id: 'lo22',
  code: 'LO022',
  title: 'Organic Compound Properties',
  description: 'Identify characteristics of biological macromolecules',
  questionCount: 27,
  chapters: ['chapter1', 'chapter5']
}, {
  id: 'lo23',
  code: 'LO023',
  title: 'Reaction Kinetics',
  description: 'Analyze factors affecting reaction rates in biological systems',
  questionCount: 22,
  chapters: ['chapter1', 'chapter5']
}, {
  id: 'lo24',
  code: 'LO024',
  title: 'Thermodynamics in Biology',
  description: 'Apply thermodynamic principles to biological processes',
  questionCount: 24,
  chapters: ['chapter1', 'chapter5']
}, {
  id: 'lo25',
  code: 'LO025',
  title: 'Spectroscopy Applications',
  description: 'Use spectroscopic techniques to analyze biological molecules',
  questionCount: 20,
  chapters: ['chapter1', 'chapter5']
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