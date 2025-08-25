import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, BookOpen, Target, ChevronRight, Star, Clock, Brain, Zap } from 'lucide-react';

interface Question {
  id: string;
  questionStem: string;
  questionType: 'MCQ' | 'FITB' | 'Match' | 'Arrange' | 'SA' | 'ETA' | 'TF';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  bloomLevel: 1 | 2 | 3 | 4 | 5 | 6;
  marks: number;
  chapter: string;
  topic: string;
  estimatedTime: number; // in minutes
  options?: string[];
  answer: string;
}

interface ManualQuestionPickerProps {
  selectedChapters: string[];
  selectedLearningOutcomes: string[];
  selectedQuestions: string[];
  onQuestionsChange: (questionIds: string[]) => void;
  maxQuestions?: number;
}

// Mock questions with varying difficulties and types - Updated with more variety
const mockQuestions: Question[] = [
  // Easy MCQ Questions
  {
    id: 'q1',
    questionStem: 'What is the primary function of chlorophyll in plants?',
    questionType: 'MCQ',
    difficulty: 'Easy',
    bloomLevel: 1,
    marks: 1,
    chapter: 'Photosynthesis',
    topic: 'Plant Biology',
    estimatedTime: 1,
    options: [
      'A) To absorb sunlight for photosynthesis',
      'B) To store water in plant cells',
      'C) To transport nutrients through stems',
      'D) To protect plants from insects'
    ],
    answer: 'A) To absorb sunlight for photosynthesis'
  },
  {
    id: 'q2',
    questionStem: 'Which organelle is responsible for cellular respiration?',
    questionType: 'MCQ',
    difficulty: 'Easy',
    bloomLevel: 1,
    marks: 1,
    chapter: 'Cell Structure',
    topic: 'Cellular Biology',
    estimatedTime: 1,
    options: [
      'A) Nucleus',
      'B) Mitochondria',
      'C) Chloroplast',
      'D) Ribosome'
    ],
    answer: 'B) Mitochondria'
  },
  {
    id: 'q3',
    questionStem: 'How many chambers does a human heart have?',
    questionType: 'MCQ',
    difficulty: 'Easy',
    bloomLevel: 1,
    marks: 1,
    chapter: 'Human Body Systems',
    topic: 'Circulatory System',
    estimatedTime: 1,
    options: [
      'A) Two',
      'B) Three',
      'C) Four',
      'D) Five'
    ],
    answer: 'C) Four'
  },
  {
    id: 'q4',
    questionStem: 'What type of blood vessels carry blood away from the heart?',
    questionType: 'MCQ',
    difficulty: 'Easy',
    bloomLevel: 1,
    marks: 1,
    chapter: 'Human Body Systems',
    topic: 'Circulatory System',
    estimatedTime: 1,
    options: [
      'A) Veins',
      'B) Arteries',
      'C) Capillaries',
      'D) Lymph vessels'
    ],
    answer: 'B) Arteries'
  },
  {
    id: 'q5',
    questionStem: 'Which gas do plants absorb from the atmosphere during photosynthesis?',
    questionType: 'MCQ',
    difficulty: 'Easy',
    bloomLevel: 1,
    marks: 1,
    chapter: 'Photosynthesis',
    topic: 'Plant Biology',
    estimatedTime: 1,
    options: [
      'A) Oxygen',
      'B) Nitrogen',
      'C) Carbon dioxide',
      'D) Hydrogen'
    ],
    answer: 'C) Carbon dioxide'
  },
  // Easy Fill in the Blank
  {
    id: 'q6',
    questionStem: 'The process by which plants make their own food using sunlight is called _______.',
    questionType: 'FITB',
    difficulty: 'Easy',
    bloomLevel: 1,
    marks: 1,
    chapter: 'Photosynthesis',
    topic: 'Plant Biology',
    estimatedTime: 1,
    answer: 'photosynthesis'
  },
  {
    id: 'q7',
    questionStem: 'The basic unit of life is called a _______.',
    questionType: 'FITB',
    difficulty: 'Easy',
    bloomLevel: 1,
    marks: 1,
    chapter: 'Cell Structure',
    topic: 'Cellular Biology',
    estimatedTime: 1,
    answer: 'cell'
  },
  {
    id: 'q8',
    questionStem: 'The green pigment in plants that captures light energy is called _______.',
    questionType: 'FITB',
    difficulty: 'Easy',
    bloomLevel: 1,
    marks: 1,
    chapter: 'Photosynthesis',
    topic: 'Plant Biology',
    estimatedTime: 1,
    answer: 'chlorophyll'
  },
  // Easy True/False
  {
    id: 'q9',
    questionStem: 'True or False: All living organisms require oxygen for survival.',
    questionType: 'TF',
    difficulty: 'Easy',
    bloomLevel: 1,
    marks: 1,
    chapter: 'Cell Structure',
    topic: 'Cellular Respiration',
    estimatedTime: 1,
    answer: 'False (anaerobic organisms exist)'
  },
  {
    id: 'q10',
    questionStem: 'True or False: The human brain is part of the nervous system.',
    questionType: 'TF',
    difficulty: 'Easy',
    bloomLevel: 1,
    marks: 1,
    chapter: 'Human Body Systems',
    topic: 'Nervous System',
    estimatedTime: 1,
    answer: 'True'
  },
  // Medium Questions
  {
    id: 'q11',
    questionStem: 'Explain how the structure of the leaf is adapted for photosynthesis. Include at least three specific adaptations.',
    questionType: 'SA',
    difficulty: 'Medium',
    bloomLevel: 2,
    marks: 3,
    chapter: 'Photosynthesis',
    topic: 'Plant Adaptations',
    estimatedTime: 5,
    answer: 'Broad flat surface for maximum light absorption, waxy cuticle to reduce water loss, stomata for gas exchange, chloroplasts in palisade layer for photosynthesis'
  },
  {
    id: 'q12',
    questionStem: 'Compare and contrast mitosis and meiosis. Discuss their purposes and key differences.',
    questionType: 'SA',
    difficulty: 'Medium',
    bloomLevel: 2,
    marks: 4,
    chapter: 'Cell Structure',
    topic: 'Cell Division',
    estimatedTime: 6,
    answer: 'Mitosis produces identical diploid cells for growth and repair, while meiosis produces genetically diverse gametes for reproduction'
  },
  {
    id: 'q13',
    questionStem: 'Which of the following best describes the relationship between predators and prey in an ecosystem?',
    questionType: 'MCQ',
    difficulty: 'Medium',
    bloomLevel: 3,
    marks: 2,
    chapter: 'Ecosystems',
    topic: 'Food Webs',
    estimatedTime: 2,
    options: [
      'A) Predators always eliminate all prey species',
      'B) Predator and prey populations fluctuate in cycles',
      'C) Prey populations are not affected by predators',
      'D) Predators only hunt the strongest prey'
    ],
    answer: 'B) Predator and prey populations fluctuate in cycles'
  },
  {
    id: 'q14',
    questionStem: 'What happens during the light-dependent reactions of photosynthesis?',
    questionType: 'MCQ',
    difficulty: 'Medium',
    bloomLevel: 2,
    marks: 2,
    chapter: 'Photosynthesis',
    topic: 'Light Reactions',
    estimatedTime: 2,
    options: [
      'A) Glucose is produced directly',
      'B) ATP and NADPH are generated',
      'C) Carbon dioxide is fixed',
      'D) Oxygen is consumed'
    ],
    answer: 'B) ATP and NADPH are generated'
  },
  {
    id: 'q15',
    questionStem: 'The human respiratory system includes the _______, _______, and _______.',
    questionType: 'FITB',
    difficulty: 'Medium',
    bloomLevel: 1,
    marks: 2,
    chapter: 'Human Body Systems',
    topic: 'Respiratory System',
    estimatedTime: 2,
    answer: 'nose/mouth, trachea, lungs'
  },
  // Medium Matching and Arrangement
  {
    id: 'q16',
    questionStem: 'Match the following organelles with their functions: 1) Nucleus 2) Ribosome 3) Vacuole',
    questionType: 'Match',
    difficulty: 'Medium',
    bloomLevel: 2,
    marks: 3,
    chapter: 'Cell Structure',
    topic: 'Organelle Functions',
    estimatedTime: 3,
    answer: '1-Controls cell activities, 2-Protein synthesis, 3-Storage'
  },
  {
    id: 'q17',
    questionStem: 'Arrange the following steps of cellular respiration in correct order: Krebs cycle, Glycolysis, Electron transport chain',
    questionType: 'Arrange',
    difficulty: 'Medium',
    bloomLevel: 3,
    marks: 3,
    chapter: 'Cell Structure',
    topic: 'Cellular Respiration',
    estimatedTime: 4,
    answer: 'Glycolysis, Krebs cycle, Electron transport chain'
  },
  // Hard Questions
  {
    id: 'q18',
    questionStem: 'Analyze the biochemical pathway of photosynthesis and evaluate how environmental factors (light intensity, CO2 concentration, temperature) affect the rate of photosynthesis. Design an experiment to test one of these factors.',
    questionType: 'ETA',
    difficulty: 'Hard',
    bloomLevel: 5,
    marks: 8,
    chapter: 'Photosynthesis',
    topic: 'Biochemical Processes',
    estimatedTime: 15,
    answer: 'Detailed analysis of light and dark reactions, discussion of limiting factors, experimental design with controls and variables'
  },
  {
    id: 'q19',
    questionStem: 'Evaluate the impact of climate change on ecosystem dynamics. Predict how rising temperatures and changing precipitation patterns might affect species interactions and biodiversity.',
    questionType: 'ETA',
    difficulty: 'Hard',
    bloomLevel: 6,
    marks: 10,
    chapter: 'Ecosystems',
    topic: 'Environmental Change',
    estimatedTime: 20,
    answer: 'Comprehensive analysis of climate impacts, species migration patterns, ecosystem disruption, and biodiversity loss predictions'
  },
  {
    id: 'q20',
    questionStem: 'Critically analyze the role of different cell organelles in maintaining cellular homeostasis. How do mitochondria, endoplasmic reticulum, and Golgi apparatus work together?',
    questionType: 'ETA',
    difficulty: 'Hard',
    bloomLevel: 5,
    marks: 8,
    chapter: 'Cell Structure',
    topic: 'Cellular Organization',
    estimatedTime: 18,
    answer: 'Detailed analysis of organelle interactions, protein synthesis pathway, energy production, and cellular transport mechanisms'
  },
  // Additional Medium Questions for variety
  {
    id: 'q21',
    questionStem: 'Describe the pathway of blood circulation through the human heart.',
    questionType: 'SA',
    difficulty: 'Medium',
    bloomLevel: 2,
    marks: 4,
    chapter: 'Human Body Systems',
    topic: 'Circulatory System',
    estimatedTime: 5,
    answer: 'Blood flows from body → right atrium → right ventricle → lungs → left atrium → left ventricle → body'
  },
  {
    id: 'q22',
    questionStem: 'What role do decomposers play in an ecosystem?',
    questionType: 'SA',
    difficulty: 'Medium',
    bloomLevel: 2,
    marks: 3,
    chapter: 'Ecosystems',
    topic: 'Nutrient Cycling',
    estimatedTime: 4,
    answer: 'Break down dead organic matter, recycle nutrients back to soil, maintain ecosystem balance'
  },
  {
    id: 'q23',
    questionStem: 'Which process occurs in the chloroplasts of plant cells?',
    questionType: 'MCQ',
    difficulty: 'Easy',
    bloomLevel: 1,
    marks: 1,
    chapter: 'Photosynthesis',
    topic: 'Plant Biology',
    estimatedTime: 1,
    options: [
      'A) Cellular respiration',
      'B) Photosynthesis',
      'C) Protein synthesis',
      'D) DNA replication'
    ],
    answer: 'B) Photosynthesis'
  },
  {
    id: 'q24',
    questionStem: 'The largest organ in the human body is the _______.',
    questionType: 'FITB',
    difficulty: 'Easy',
    bloomLevel: 1,
    marks: 1,
    chapter: 'Human Body Systems',
    topic: 'Organ Systems',
    estimatedTime: 1,
    answer: 'skin'
  },
  {
    id: 'q25',
    questionStem: 'True or False: Photosynthesis only occurs during the day.',
    questionType: 'TF',
    difficulty: 'Medium',
    bloomLevel: 2,
    marks: 2,
    chapter: 'Photosynthesis',
    topic: 'Plant Biology',
    estimatedTime: 2,
    answer: 'True (light-dependent reactions require sunlight)'
  }
];

const difficultyColors = {
  Easy: 'bg-green-100 text-green-800 border-green-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Hard: 'bg-red-100 text-red-800 border-red-200'
};

const questionTypeLabels = {
  MCQ: 'Multiple Choice',
  FITB: 'Fill in the Blank',
  Match: 'Matching',
  Arrange: 'Arrange/Order',
  SA: 'Short Answer',
  ETA: 'Essay Type',
  TF: 'True/False'
};

const ManualQuestionPicker: React.FC<ManualQuestionPickerProps> = ({
  selectedChapters,
  selectedLearningOutcomes,
  selectedQuestions,
  onQuestionsChange,
  maxQuestions = 20
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterQuestionType, setFilterQuestionType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'difficulty' | 'marks' | 'time' | 'chapter'>('difficulty');

  // Filter and sort questions
  const filteredQuestions = useMemo(() => {
    let filtered = mockQuestions;

    // Only filter by selected chapters if chapters are actually selected
    // This allows all questions to show when no specific chapters are chosen
    if (selectedChapters.length > 0) {
      filtered = filtered.filter(q => selectedChapters.includes(q.chapter));
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.questionStem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.chapter.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by difficulty
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === filterDifficulty);
    }

    // Filter by question type
    if (filterQuestionType !== 'all') {
      filtered = filtered.filter(q => q.questionType === filterQuestionType);
    }

    // Sort questions
    const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
    
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'difficulty':
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'marks':
          return a.marks - b.marks;
        case 'time':
          return a.estimatedTime - b.estimatedTime;
        case 'chapter':
          return a.chapter.localeCompare(b.chapter);
        default:
          return 0;
      }
    });

    return filtered;
  }, [selectedChapters, searchTerm, filterDifficulty, filterQuestionType, sortBy]);

  const handleQuestionToggle = (questionId: string, checked: boolean) => {
    if (checked) {
      if (selectedQuestions.length < maxQuestions) {
        onQuestionsChange([...selectedQuestions, questionId]);
      }
    } else {
      onQuestionsChange(selectedQuestions.filter(id => id !== questionId));
    }
  };

  const handleSelectAll = (difficulty?: string) => {
    const questionsToSelect = difficulty 
      ? filteredQuestions.filter(q => q.difficulty === difficulty)
      : filteredQuestions;
    
    const newSelection = [...selectedQuestions];
    questionsToSelect.forEach(q => {
      if (!newSelection.includes(q.id) && newSelection.length < maxQuestions) {
        newSelection.push(q.id);
      }
    });
    onQuestionsChange(newSelection);
  };

  const getTotalMarks = () => {
    return selectedQuestions.reduce((total, id) => {
      const question = mockQuestions.find(q => q.id === id);
      return total + (question?.marks || 0);
    }, 0);
  };

  const getTotalTime = () => {
    return selectedQuestions.reduce((total, id) => {
      const question = mockQuestions.find(q => q.id === id);
      return total + (question?.estimatedTime || 0);
    }, 0);
  };

  const getDifficultyBreakdown = () => {
    const breakdown = { Easy: 0, Medium: 0, Hard: 0 };
    selectedQuestions.forEach(id => {
      const question = mockQuestions.find(q => q.id === id);
      if (question) {
        breakdown[question.difficulty]++;
      }
    });
    return breakdown;
  };

  const difficultyBreakdown = getDifficultyBreakdown();

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Manual Question Selection</h3>
            <p className="text-sm text-muted-foreground">
              Choose questions individually to create your perfect assessment
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{selectedQuestions.length}/{maxQuestions}</div>
            <div className="text-sm text-muted-foreground">Questions Selected</div>
          </div>
        </div>
        
        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="font-semibold">{getTotalMarks()}</div>
            <div className="text-xs text-muted-foreground">Total Marks</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{getTotalTime()} min</div>
            <div className="text-xs text-muted-foreground">Est. Time</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center space-x-1">
              <span className="text-green-600 font-medium">{difficultyBreakdown.Easy}</span>
              <span className="text-yellow-600 font-medium">{difficultyBreakdown.Medium}</span>
              <span className="text-red-600 font-medium">{difficultyBreakdown.Hard}</span>
            </div>
            <div className="text-xs text-muted-foreground">E/M/H Distribution</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{filteredQuestions.length}</div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-60">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search questions, chapters, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterQuestionType} onValueChange={setFilterQuestionType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Question Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="MCQ">Multiple Choice</SelectItem>
              <SelectItem value="FITB">Fill in Blank</SelectItem>
              <SelectItem value="SA">Short Answer</SelectItem>
              <SelectItem value="ETA">Essay Type</SelectItem>
              <SelectItem value="TF">True/False</SelectItem>
              <SelectItem value="Match">Matching</SelectItem>
              <SelectItem value="Arrange">Arrange</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="difficulty">Difficulty</SelectItem>
              <SelectItem value="marks">Marks</SelectItem>
              <SelectItem value="time">Time</SelectItem>
              <SelectItem value="chapter">Chapter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick select buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => handleSelectAll()}>
            Select All Visible
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleSelectAll('Easy')}>
            Select All Easy
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleSelectAll('Medium')}>
            Select All Medium
          </Button>
          <Button variant="outline" size="sm" onClick={() => onQuestionsChange([])}>
            Clear Selection
          </Button>
        </div>
      </div>

      {/* Questions List */}
      <ScrollArea className="h-[600px] w-full rounded-md border">
        <div className="p-4 space-y-4">
          {filteredQuestions.map((question) => (
            <Card key={question.id} className={`transition-all duration-200 ${
              selectedQuestions.includes(question.id) 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:shadow-md'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={selectedQuestions.includes(question.id)}
                    onCheckedChange={(checked) => handleQuestionToggle(question.id, checked as boolean)}
                    disabled={!selectedQuestions.includes(question.id) && selectedQuestions.length >= maxQuestions}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 space-y-3">
                    {/* Question header with badges */}
                    <div className="flex items-start justify-between">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={`text-xs ${difficultyColors[question.difficulty]}`}>
                          {question.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {questionTypeLabels[question.questionType]}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {question.marks} mark{question.marks !== 1 ? 's' : ''}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {question.estimatedTime} min
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Brain className="w-3 h-3 mr-1" />
                          Bloom L{question.bloomLevel}
                        </Badge>
                      </div>
                    </div>

                    {/* Question content */}
                    <div>
                      <p className="font-medium text-foreground mb-2">{question.questionStem}</p>
                      
                      {/* Show options for MCQ */}
                      {question.options && (
                        <div className="space-y-1 text-sm text-muted-foreground ml-4">
                          {question.options.map((option, index) => (
                            <div key={index}>{option}</div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Question metadata */}
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <BookOpen className="w-3 h-3 mr-1" />
                        {question.chapter}
                      </span>
                      <span className="flex items-center">
                        <Target className="w-3 h-3 mr-1" />
                        {question.topic}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredQuestions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-2">No questions found</div>
              <div className="text-sm text-muted-foreground">
                Try adjusting your filters or search terms
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ManualQuestionPicker;