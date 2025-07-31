import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Download, Eye, CheckCircle, Info, Search, Plus, Save, Edit, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { CSVTemplate, PaperLayoutTemplate, OCRJob, LanguageSupport, Blueprint } from '@/types/ocr';
import BlueprintCreation from './BlueprintCreation';
import ChapterLOSelector from './ChapterLOSelector';

interface QuestionPreview {
  id: string;
  questionNumber: number;
  questionStem: string;
  grade: number;
  subject: string;
  chapter: string;
  topic: string;
  nodeId: string;
  bloomsTag: number;
  difficultyTag: number;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
  explanation?: string;
  questionImage?: string;
  medium: string;
}

// Sample question data with 20 diverse questions
const sampleQuestions: QuestionPreview[] = [
  {
    id: "20600415301",
    questionNumber: 1,
    questionStem: "भारत का भौगोलिक क्षेत्रफल विश्व के भौगोलिक क्षेत्रफल का कितना प्रतिशत भाग है?",
    grade: 9,
    subject: "Social Science",
    chapter: "भारत - आकार और स्थिति | India - Size and Location",
    topic: "क्षेत्रफल | Area",
    nodeId: "MPT905",
    bloomsTag: 1,
    difficultyTag: 1,
    optionA: "32.80%",
    optionB: "8.40%",
    optionC: "2.40%",
    optionD: "4.20%",
    answer: "2.40%",
    medium: "Hindi"
  },
  {
    id: "20600415401",
    questionNumber: 2,
    questionStem: "भारत के दक्षिण में कौन सा महासागर स्थित है?",
    grade: 9,
    subject: "Social Science",
    chapter: "भारत - आकार और स्थिति | India - Size and Location",
    topic: "स्थिति | Location",
    nodeId: "MPT905",
    bloomsTag: 1,
    difficultyTag: 1,
    optionA: "प्रशांत महासागर",
    optionB: "आर्कटिक सागर",
    optionC: "अटलांटिक महासागर",
    optionD: "हिंद महासागर",
    answer: "हिंद महासागर",
    medium: "Hindi"
  },
  {
    id: "20600415501",
    questionNumber: 3,
    questionStem: "भारत के भूभाग का कुल क्षेत्रफल कितना है?",
    grade: 9,
    subject: "Social Science",
    chapter: "भारत - आकार और स्थिति | India - Size and Location",
    topic: "क्षेत्रफल | Area",
    nodeId: "MPT905",
    bloomsTag: 1,
    difficultyTag: 1,
    optionA: "32.8 लाख वर्ग कि.मी.",
    optionB: "24.6 लाख वर्ग कि.मी.",
    optionC: "34.8 हजार वर्ग कि.मी.",
    optionD: "42.6 वर्ग कि.मी.",
    answer: "32.8 लाख वर्ग कि.मी.",
    medium: "Hindi"
  },
  {
    id: "20101425800",
    questionNumber: 4,
    questionStem: "Identify the adverbial clause in the given sentence. The cake isn't as delicious as it looks.",
    grade: 10,
    subject: "English",
    chapter: "Grammar",
    topic: "Clause",
    nodeId: "MPE1106",
    bloomsTag: 2,
    difficultyTag: 3,
    optionA: "it looks",
    optionB: "delicious",
    optionC: "cake isn't",
    optionD: "as it looks",
    answer: "as it looks",
    medium: "English"
  },
  {
    id: "20400506701",
    questionNumber: 5,
    questionStem: "इनमें से कौन-सा जीव मिट्टी में पोषक तत्व लौटाता है?",
    grade: 10,
    subject: "Science",
    chapter: "हमारा पर्यावरण | Our environment",
    topic: "पारितंत्र | Ecosystem",
    nodeId: "UKSX18",
    bloomsTag: 1,
    difficultyTag: 2,
    optionA: "उत्पादक",
    optionB: "प्राथमिक उपभोगता",
    optionC: "द्वितीय उपभोगता",
    optionD: "मृतजीवी",
    answer: "मृतजीवी",
    medium: "Hindi"
  },
  {
    id: "31500035301",
    questionNumber: 6,
    questionStem: "लेखांकन की परिभाषा के प्रासंगिक पहलू क्या हैं?",
    grade: 11,
    subject: "Accountancy",
    chapter: "लेखांकन-एक परिचय | Introduction to Accounting",
    topic: "लेखांकन का अर्थ | Meaning of accounting",
    nodeId: "RJA1116",
    bloomsTag: 1,
    difficultyTag: 1,
    optionA: "आर्थिक घटनाएँ, मौद्रिक मूल्य और समय",
    optionB: "पहचान, माप, अभिलेखन और सम्प्रेषण",
    optionC: "व्यवसाय का आकार, उद्योग का प्रकार और स्थान",
    optionD: "ऐतिहासिक संदर्भ, कानूनी अनुपालन और डेटा सुरक्षा",
    answer: "पहचान, माप, अभिलेखन और सम्प्रेषण",
    medium: "Hindi"
  },
  {
    id: "31800032901",
    questionNumber: 7,
    questionStem: "विद्युत्-धारा का SI मात्रक क्या है?",
    grade: 11,
    subject: "Physics",
    chapter: "मात्रक और मापन | Units and Measurements",
    topic: "मात्रकों की अंतर्राष्ट्रीय प्रणाली | International system of units",
    nodeId: "RJY1129",
    bloomsTag: 1,
    difficultyTag: 1,
    optionA: "ऐम्पियर",
    optionB: "मीटर",
    optionC: "केल्विन",
    optionD: "केन्डेला",
    answer: "ऐम्पियर",
    medium: "Hindi"
  },
  {
    id: "30800009301",
    questionNumber: 8,
    questionStem: "पत्थर के औजारों को बनाने और इस्तेमाल करने का सबसे पहला प्रमाण हमें कहाँ से मिला?",
    grade: 11,
    subject: "History",
    chapter: "लेखन कला और शहरी जीवन | Writing and city life",
    topic: "पत्थर के औज़ार | Stone Tools",
    nodeId: "HPR1124",
    bloomsTag: 1,
    difficultyTag: 2,
    optionA: "इथियोपिया",
    optionB: "केन्या",
    optionC: "दोनों",
    optionD: "इनमें से कोई भी नहीं",
    answer: "दोनों",
    medium: "Hindi"
  },
  {
    id: "31800034101",
    questionNumber: 9,
    questionStem: "दिखाए गए प्रणाली की विद्युत क्षमता क्या है? (नोट - चित्र को बड़ा करने के लिए क्लिक कीजिए।)",
    grade: 12,
    subject: "Physics",
    chapter: "स्थिरवैद्युत विभव तथा धारिता | Electrostatic potential and capacitance",
    topic: "आवेशों की प्रणाली में स्थिर वैद्युत विभव | Electrostatic potential in the system of charges",
    nodeId: "RJY1237",
    bloomsTag: 1,
    difficultyTag: 1,
    optionA: "q²/4πεr",
    optionB: "3q²/4πεr",
    optionC: "0",
    optionD: "(q²/12πεr)",
    answer: "0",
    medium: "Hindi",
    questionImage: "S12.02.png"
  },
  {
    id: "20300408901",
    questionNumber: 10,
    questionStem: "What is the square root of 144?",
    grade: 9,
    subject: "Mathematics",
    chapter: "Number Systems",
    topic: "Square Roots",
    nodeId: "MAT901",
    bloomsTag: 1,
    difficultyTag: 1,
    optionA: "10",
    optionB: "12",
    optionC: "14",
    optionD: "16",
    answer: "12",
    medium: "English"
  },
  {
    id: "20300409001",
    questionNumber: 11,
    questionStem: "If x + 5 = 12, what is the value of x?",
    grade: 9,
    subject: "Mathematics",
    chapter: "Linear Equations",
    topic: "Simple Equations",
    nodeId: "MAT902",
    bloomsTag: 2,
    difficultyTag: 2,
    optionA: "5",
    optionB: "6",
    optionC: "7",
    optionD: "8",
    answer: "7",
    medium: "English"
  },
  {
    id: "20400507801",
    questionNumber: 12,
    questionStem: "Which gas is most abundant in Earth's atmosphere?",
    grade: 10,
    subject: "Science",
    chapter: "Natural Resources",
    topic: "Air and Atmosphere",
    nodeId: "SCI1001",
    bloomsTag: 1,
    difficultyTag: 1,
    optionA: "Oxygen",
    optionB: "Carbon Dioxide",
    optionC: "Nitrogen",
    optionD: "Argon",
    answer: "Nitrogen",
    medium: "English"
  },
  {
    id: "20400507901",
    questionNumber: 13,
    questionStem: "What is the chemical formula for water?",
    grade: 10,
    subject: "Science",
    chapter: "Acids, Bases and Salts",
    topic: "Chemical Formulas",
    nodeId: "SCI1002",
    bloomsTag: 1,
    difficultyTag: 1,
    optionA: "H2O",
    optionB: "CO2",
    optionC: "NaCl",
    optionD: "HCl",
    answer: "H2O",
    medium: "English"
  },
  {
    id: "20101426001",
    questionNumber: 14,
    questionStem: "Choose the correct synonym for 'enormous':",
    grade: 10,
    subject: "English",
    chapter: "Vocabulary",
    topic: "Synonyms",
    nodeId: "ENG1001",
    bloomsTag: 1,
    difficultyTag: 2,
    optionA: "tiny",
    optionB: "huge",
    optionC: "medium",
    optionD: "small",
    answer: "huge",
    medium: "English"
  },
  {
    id: "20600416101",
    questionNumber: 15,
    questionStem: "कर्क रेखा भारत के कितने राज्यों से होकर गुजरती है?",
    grade: 9,
    subject: "Social Science",
    chapter: "भारत - आकार और स्थिति | India - Size and Location",
    topic: "अक्षांश रेखाएं | Latitude Lines",
    nodeId: "MPT906",
    bloomsTag: 1,
    difficultyTag: 2,
    optionA: "6",
    optionB: "7",
    optionC: "8",
    optionD: "9",
    answer: "8",
    medium: "Hindi"
  },
  {
    id: "31800033001",
    questionNumber: 16,
    questionStem: "न्यूटन के गति के प्रथम नियम को क्या कहते हैं?",
    grade: 11,
    subject: "Physics",
    chapter: "गति के नियम | Laws of Motion",
    topic: "न्यूटन के नियम | Newton's Laws",
    nodeId: "PHY1101",
    bloomsTag: 1,
    difficultyTag: 1,
    optionA: "जड़त्व का नियम",
    optionB: "संवेग का नियम",
    optionC: "क्रिया-प्रतिक्रिया का नियम",
    optionD: "गुरुत्वाकर्षण का नियम",
    answer: "जड़त्व का नियम",
    medium: "Hindi"
  },
  {
    id: "31700033101",
    questionNumber: 17,
    questionStem: "कोशिका की खोज किसने की थी?",
    grade: 11,
    subject: "Biology",
    chapter: "कोशिका - जीवन की इकाई | Cell - The Unit of Life",
    topic: "कोशिका की खोज | Discovery of Cell",
    nodeId: "BIO1101",
    bloomsTag: 1,
    difficultyTag: 1,
    optionA: "रॉबर्ट हुक",
    optionB: "एंटोन वैन लीवेनहुक",
    optionC: "रॉबर्ट ब्राउन",
    optionD: "मैथियास श्लाइडेन",
    answer: "रॉबर्ट हुक",
    medium: "Hindi"
  },
  {
    id: "31600033201",
    questionNumber: 18,
    questionStem: "आवर्त सारणी में कितने आवर्त हैं?",
    grade: 11,
    subject: "Chemistry",
    chapter: "तत्वों का वर्गीकरण | Classification of Elements",
    topic: "आवर्त सारणी | Periodic Table",
    nodeId: "CHE1101",
    bloomsTag: 1,
    difficultyTag: 1,
    optionA: "6",
    optionB: "7",
    optionC: "8",
    optionD: "9",
    answer: "7",
    medium: "Hindi"
  },
  {
    id: "31400033301",
    questionNumber: 19,
    questionStem: "द्विघात समीकरण ax² + bx + c = 0 का विविक्तकर क्या है?",
    grade: 11,
    subject: "Mathematics",
    chapter: "द्विघात समीकरण | Quadratic Equations",
    topic: "विविक्तकर | Discriminant",
    nodeId: "MAT1101",
    bloomsTag: 2,
    difficultyTag: 2,
    optionA: "b² - 4ac",
    optionB: "b² + 4ac",
    optionC: "4ac - b²",
    optionD: "-b ± √(b² - 4ac)",
    answer: "b² - 4ac",
    medium: "Hindi"
  },
  {
    id: "32800033401",
    questionNumber: 20,
    questionStem: "भारतीय संविधान में कितनी अनुसूचियां हैं?",
    grade: 12,
    subject: "Political Science",
    chapter: "भारतीय संविधान | Indian Constitution",
    topic: "संविधान की संरचना | Structure of Constitution",
    nodeId: "POL1201",
    bloomsTag: 1,
    difficultyTag: 1,
    optionA: "10",
    optionB: "11",
    optionC: "12",
    optionD: "13",
    answer: "12",
    medium: "Hindi"
  }
];

const OCRTestPaperCreation = () => {
  const { user, hasPermission } = useUser();
  const [activeTab, setActiveTab] = useState<'csv' | 'blueprint'>('csv');
  const [step, setStep] = useState<'source' | 'basic-info' | 'content' | 'questions' | 'processing' | 'review' | 'complete'>('source');
  
  // Basic info states
  const [assessmentTitle, setAssessmentTitle] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedMedium, setSelectedMedium] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLayoutTemplate, setSelectedLayoutTemplate] = useState<string>('');
  
  // CSV workflow states
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [selectedCSVTemplate, setSelectedCSVTemplate] = useState<string>('');
  
  // Blueprint workflow states
  const [currentBlueprint, setCurrentBlueprint] = useState<Partial<Blueprint>>({});
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>('');
  
  // Chapter/LO selection states
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [selectedLearningOutcomes, setSelectedLearningOutcomes] = useState<string[]>([]);
  const [contentMode, setContentMode] = useState<'chapters' | 'learningOutcomes'>('chapters');
  const [chapterQuestionCounts, setChapterQuestionCounts] = useState<Record<string, number>>({});
  const [loQuestionCounts, setLoQuestionCounts] = useState<Record<string, number>>({});
  
  // Barcode configuration
  const [barcodeConfig, setBarcodeConfig] = useState({
    topLeft: '',
    topRight: '',
    bottomLeft: '',
    bottomRight: ''
  });
  
  // Student information configuration
  const [includeStudentInfo, setIncludeStudentInfo] = useState(false);
  const [studentInfoConfig, setStudentInfoConfig] = useState({
    nameLabel: 'Student Name',
    sectionLabel: 'Section',
    rollLabel: 'Roll No.',
    idBoxCount: 10,
    instructionText: 'Fill in your details clearly'
  });
  
  // Initialize with a demo blueprint
  const [savedBlueprints, setSavedBlueprints] = useState<Blueprint[]>([
    {
      id: 'demo-bp-001',
      name: 'Mathematics Assessment Paper - Grade 9',
      description: 'Comprehensive assessment covering algebra, geometry, and data analysis for grade 9 students',
      courseCode: generateRandomCourseCode(),
      courseName: 'Mathematics - Grade 9 CBSE',
      duration: 90,
      totalMarks: 35,
      language: 'hindi',
      createdAt: '2024-12-28T10:00:00Z',
      createdBy: 'demo-user',
      updatedAt: '2024-12-30T15:30:00Z',
      unitDistribution: [
        {
          loCode: 'UPM514',
          unitName: 'क्षेत्रफल | Area - शब्द समस्याएं | Word Problems',
          marks: 15,
          questionTypes: []
        },
        {
          loCode: 'UPM813',
          unitName: 'बैंकिंग | Banking - बैंक | Bank',
          marks: 10,
          questionTypes: []
        },
        {
          loCode: 'FLNM172',
          unitName: 'Shapes and Space - Use spatial words (above and below)',
          marks: 10,
          questionTypes: []
        }
      ],
      bloomsDistribution: [
        { level: 1, questionCount: 14, totalMarks: 14, questionTypes: [{ type: 'VSA', count: 10 }, { type: 'SA', count: 4 }] },
        { level: 2, questionCount: 12, totalMarks: 12, questionTypes: [{ type: 'SA', count: 4 }, { type: 'ETA', count: 8 }] },
        { level: 3, questionCount: 9, totalMarks: 9, questionTypes: [{ type: 'ETA', count: 9 }] }
      ],
      questionTypeDistribution: [
        { type: 'VSA', totalCount: 10, totalMarks: 10, marksPerQuestion: 1 },
        { type: 'SA', totalCount: 8, totalMarks: 16, marksPerQuestion: 2 },
        { type: 'ETA', totalCount: 3, totalMarks: 9, marksPerQuestion: 3 }
      ]
    }
  ]);
  
  const [questionPreviews, setQuestionPreviews] = useState<QuestionPreview[]>([]);
  const [showQuestionPreview, setShowQuestionPreview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [blueprintSaveSuccess, setBlueprintSaveSuccess] = useState(false);
  const questionsPerPage = 10;
  
  // Question replacement dialog states
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [replaceQuestionIndex, setReplaceQuestionIndex] = useState<number | null>(null);
  const [replaceDialogPage, setReplaceDialogPage] = useState(1);
  const [availableQuestionsForReplace, setAvailableQuestionsForReplace] = useState<QuestionPreview[]>([]);
  
  // Common states
  const [currentJob, setCurrentJob] = useState<OCRJob | null>(null);

  // Mock data for chapters and LOs
  const mockChapters = [
    { 
      id: 'chapter1', 
      name: 'Photosynthesis', 
      description: 'Process of photosynthesis in plants', 
      questionCount: 42,
      learningOutcomes: ['lo1', 'lo2']
    },
    { 
      id: 'chapter2', 
      name: 'Cell Structure', 
      description: 'Basic structure and function of cells', 
      questionCount: 35,
      learningOutcomes: ['lo2', 'lo3']
    },
    { 
      id: 'chapter3', 
      name: 'Human Body Systems', 
      description: 'Various systems in human body', 
      questionCount: 48,
      learningOutcomes: ['lo3', 'lo4']
    },
    { 
      id: 'chapter4', 
      name: 'Ecosystems', 
      description: 'Environmental systems and interactions', 
      questionCount: 33,
      learningOutcomes: ['lo4', 'lo1']
    },
    { 
      id: 'chapter5', 
      name: 'Chemical Reactions', 
      description: 'Basic chemical reactions and properties', 
      questionCount: 27,
      learningOutcomes: ['lo1', 'lo5']
    }
  ];

  const mockLearningOutcomes = [
    { 
      id: 'lo1', 
      code: 'LO001', 
      title: 'Plant Biology Understanding', 
      description: 'Understand basic plant biology concepts', 
      questionCount: 38,
      chapters: ['chapter1', 'chapter4', 'chapter5']
    },
    { 
      id: 'lo2', 
      code: 'LO002', 
      title: 'Cellular Structure Knowledge', 
      description: 'Knowledge of cell structure and function', 
      questionCount: 41,
      chapters: ['chapter1', 'chapter2']
    },
    { 
      id: 'lo3', 
      code: 'LO003', 
      title: 'Body System Functions', 
      description: 'Understanding of human body systems', 
      questionCount: 29,
      chapters: ['chapter2', 'chapter3']
    },
    { 
      id: 'lo4', 
      code: 'LO004', 
      title: 'Environmental Interactions', 
      description: 'Understanding ecosystem interactions', 
      questionCount: 36,
      chapters: ['chapter3', 'chapter4']
    },
    { 
      id: 'lo5', 
      code: 'LO005', 
      title: 'Chemical Process Knowledge', 
      description: 'Understanding chemical reactions', 
      questionCount: 22,
      chapters: ['chapter5']
    }
  ];

  // Generate more sample questions for replacement dialog
  const generateAdditionalQuestions = (): QuestionPreview[] => {
    const additionalQuestions: QuestionPreview[] = [];
    
    // Add 15 more questions to ensure we have enough for replacement
    for (let i = 21; i <= 35; i++) {
      additionalQuestions.push({
        id: `additional-${i}`,
        questionNumber: i,
        questionStem: `Sample question ${i} - What is the main concept being tested in this question?`,
        grade: 9 + (i % 4),
        subject: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science'][i % 5],
        chapter: `Chapter ${Math.ceil(i / 5)}`,
        topic: `Topic ${i % 3 + 1}`,
        nodeId: `NODE${i.toString().padStart(3, '0')}`,
        bloomsTag: (i % 3) + 1,
        difficultyTag: (i % 3) + 1,
        optionA: `Option A for question ${i}`,
        optionB: `Option B for question ${i}`,
        optionC: `Option C for question ${i}`,
        optionD: `Option D for question ${i}`,
        answer: `Option ${String.fromCharCode(65 + (i % 4))} for question ${i}`,
        medium: i % 2 === 0 ? 'English' : 'Hindi'
      });
    }
    
    return additionalQuestions;
  };

  const allSampleQuestions = [...sampleQuestions, ...generateAdditionalQuestions()];

  // Function to generate random course codes
  function generateRandomCourseCode(): string {
    const prefixes = ['MAT', 'SCI', 'ENG', 'HIN', 'SST', 'BIO', 'PHY', 'CHE'];
    const grades = ['09', '10', '11', '12'];
    const sequences = ['01', '02', '03', '04', '05'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const grade = grades[Math.floor(Math.random() * grades.length)];
    const sequence = sequences[Math.floor(Math.random() * sequences.length)];
    
    return `${prefix}${grade}${sequence}`;
  }

  const supportedLanguages: LanguageSupport[] = [
    { code: 'english', name: 'English', nativeName: 'English', direction: 'ltr', isSupported: true, ocrAccuracy: 0.98 },
    { code: 'hindi', name: 'Hindi', nativeName: 'हिंदी', direction: 'ltr', isSupported: true, ocrAccuracy: 0.95 },
    { code: 'bengali', name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr', isSupported: true, ocrAccuracy: 0.93 },
    { code: 'tamil', name: 'Tamil', nativeName: 'தமிழ்', direction: 'ltr', isSupported: true, ocrAccuracy: 0.92 },
    { code: 'telugu', name: 'Telugu', nativeName: 'తెలుగు', direction: 'ltr', isSupported: true, ocrAccuracy: 0.90 },
    { code: 'kannada', name: 'Kannada', nativeName: 'ಕನ್ನಡ', direction: 'ltr', isSupported: true, ocrAccuracy: 0.89 },
    { code: 'malayalam', name: 'Malayalam', nativeName: 'മലയാളം', direction: 'ltr', isSupported: true, ocrAccuracy: 0.88 },
    { code: 'gujarati', name: 'Gujarati', nativeName: 'ગુજરાતી', direction: 'ltr', isSupported: true, ocrAccuracy: 0.90 },
    { code: 'punjabi', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', direction: 'ltr', isSupported: true, ocrAccuracy: 0.87 },
    { code: 'marathi', name: 'Marathi', nativeName: 'मराठी', direction: 'ltr', isSupported: true, ocrAccuracy: 0.91 }
  ];

  const csvTemplates: CSVTemplate[] = [
    {
      id: 'mcq-standard',
      name: 'Standard MCQ Template',
      description: 'Standard multiple choice questions with groups and image support',
      requiredColumns: [
        'S No.', 
        'Group', 
        'Question Statement', 
        'Question image Link / Source Path', 
        'Option 1', 
        'Option 2', 
        'Option 3', 
        'Option 4', 
        'Correct Option',
        'Image Option 1',
        'Image Option 2', 
        'Image Option 3', 
        'Image Option 4', 
        'Correct answer image'
      ],
      sampleData: {
        'S No.': '1',
        'Group': 'gp1.1',
        'Question Statement': 'उस विकल्प का चयन कीजिए जिसकी वर्तनी शुद्ध है।',
        'Question image Link / Source Path': 'चित्र-04.png',
        'Option 1': 'परीचय',
        'Option 2': 'गरीमा',
        'Option 3': 'पूजनीय',
        'Option 4': 'समाधी',
        'Correct Option': 'पूजनीय',
        'Image Option 1': '',
        'Image Option 2': '',
        'Image Option 3': '',
        'Image Option 4': '',
        'Correct answer image': ''
      },
      constraints: { minQuestions: 10 },
      version: '2.1',
      createdAt: '2024-01-01',
      updatedAt: '2024-12-30'
    },
    {
      id: 'mcq-grouped',
      name: 'Grouped MCQ Template',
      description: 'MCQ template with group-based question organization and passage support',
      requiredColumns: [
        'S No.', 
        'Group', 
        'Question Statement', 
        'Question image Link / Source Path', 
        'Option 1', 
        'Option 2', 
        'Option 3', 
        'Option 4', 
        'Correct Option',
        'Image Option 1',
        'Image Option 2', 
        'Image Option 3', 
        'Image Option 4', 
        'Correct answer image'
      ],
      sampleData: {
        'S No.': '22',
        'Group': 'gp1.1',
        'Question Statement': 'समय बचाने की होड़ का मुख्य कारण क्या है?',
        'Question image Link / Source Path': '',
        'Option 1': 'बेहतर स्वास्थ्य प्राप्त करने की आकांक्षा।',
        'Option 2': 'अधिक काम करने की लालसा।',
        'Option 3': 'जीवन को फास्ट-फॉरवर्ड में जीने की प्रवृत्ति।',
        'Option 4': 'आध्यात्मिक शांति प्राप्त करने की कोशिश।',
        'Correct Option': 'जीवन को फास्ट-फॉरवर्ड में जीने की प्रवृत्ति।',
        'Image Option 1': '',
        'Image Option 2': '',
        'Image Option 3': '',
        'Image Option 4': '',
        'Correct answer image': ''
      },
      constraints: { minQuestions: 15, requiredQuestionTypes: ['mcq'] },
      version: '2.1',
      createdAt: '2024-01-01',
      updatedAt: '2024-12-30'
    }
  ];

  const layoutTemplates: PaperLayoutTemplate[] = [
    {
      id: 'state-exam',
      name: 'State Examination Format',
      description: 'Official state exam layout with enhanced QR codes and headers',
      preview: '/template-previews/state-exam.png',
      constraints: { minQuestions: 20 },
      version: '2.0',
      createdAt: '2024-01-01',
      updatedAt: '2024-12-26',
      customizable: true
    },
    {
      id: 'practice-paper',
      name: 'Practice Paper Format',
      description: 'Enhanced layout for practice tests with customizable elements',
      preview: '/template-previews/practice.png',
      version: '2.0',
      createdAt: '2024-01-01',
      updatedAt: '2024-12-26',
      customizable: true
    },
    {
      id: 'diagnostic-test',
      name: 'Diagnostic Test Format',
      description: 'LO-aware diagnostic test layout for structured assessment',
      preview: '/template-previews/diagnostic.png',
      constraints: { minQuestions: 25, questionTypes: ['mcq', 'subjective'] },
      version: '2.0',
      createdAt: '2024-01-01',
      updatedAt: '2024-12-26',
      customizable: false
    }
  ];

  if (!hasPermission('canCreateTestPaperFromCSV')) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to create test papers.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    }
  };

  const handleBlueprintSave = (blueprint: Blueprint) => {
    // Generate random course code if not provided
    const blueprintWithCourseCode = {
      ...blueprint,
      courseCode: blueprint.courseCode || generateRandomCourseCode()
    };
    
    setSavedBlueprints(prev => [...prev, blueprintWithCourseCode]);
    setCurrentBlueprint(blueprintWithCourseCode);
    setBlueprintSaveSuccess(true);
    console.log('Blueprint saved:', blueprintWithCourseCode);
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setBlueprintSaveSuccess(false);
    }, 3000);
  };

  const handleBlueprintLoad = (blueprintId: string) => {
    if (blueprintId === 'none') {
      // "None" option selected - clear current blueprint
      setCurrentBlueprint({});
      setSelectedBlueprintId('');
      return;
    }
    
    const blueprint = savedBlueprints.find(bp => bp.id === blueprintId);
    if (blueprint) {
      setCurrentBlueprint(blueprint);
      setSelectedBlueprintId(blueprintId);
      // Auto-generate question previews when blueprint is loaded
      generateQuestionPreviews(1);
    }
  };

  const generateQuestionPreviews = (page: number = 1) => {
    // Use actual sample questions with pagination
    setTotalQuestions(allSampleQuestions.length);
    const startIndex = (page - 1) * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    const pageQuestions = allSampleQuestions.slice(startIndex, endIndex);
    
    setQuestionPreviews(pageQuestions);
    setCurrentPage(page);
    setShowQuestionPreview(true);
  };

  const handlePageChange = (page: number) => {
    generateQuestionPreviews(page);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questionPreviews.length) return;
    
    const newPreviews = [...questionPreviews];
    [newPreviews[index], newPreviews[newIndex]] = [newPreviews[newIndex], newPreviews[index]];
    setQuestionPreviews(newPreviews);
  };

  const openReplaceDialog = (index: number) => {
    setReplaceQuestionIndex(index);
    // Get available questions that are not currently displayed
    const currentQuestionIds = questionPreviews.map(q => q.id);
    const available = allSampleQuestions.filter(q => !currentQuestionIds.includes(q.id));
    setAvailableQuestionsForReplace(available);
    setReplaceDialogPage(1);
    setShowReplaceDialog(true);
  };

  const handleQuestionReplace = (newQuestion: QuestionPreview) => {
    if (replaceQuestionIndex !== null) {
      const newPreviews = [...questionPreviews];
      newPreviews[replaceQuestionIndex] = newQuestion;
      setQuestionPreviews(newPreviews);
      setShowReplaceDialog(false);
      setReplaceQuestionIndex(null);
    }
  };

  const handleReplaceDialogPageChange = (page: number) => {
    setReplaceDialogPage(page);
  };

  const getReplaceDialogQuestions = () => {
    const startIndex = (replaceDialogPage - 1) * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    return availableQuestionsForReplace.slice(startIndex, endIndex);
  };

  const canProceedToBasicInfo = () => {
    if (activeTab === 'csv') {
      return csvFile && selectedCSVTemplate;
    } else {
      return currentBlueprint.name && currentBlueprint.bloomsDistribution && 
             currentBlueprint.bloomsDistribution.length > 0;
    }
  };

  const canProceedToContent = () => {
    return assessmentTitle && selectedGrade && selectedMedium && selectedSubject && selectedLayoutTemplate;
  };

  const canProceedToQuestions = () => {
    if (contentMode === 'chapters') {
      return selectedChapters.length > 0 && Object.keys(chapterQuestionCounts).length > 0;
    } else {
      return selectedLearningOutcomes.length > 0 && Object.keys(loQuestionCounts).length > 0;
    }
  };

  const handleSourceSelection = () => {
    setStep('basic-info');
  };

  const handleBasicInfoConfirm = () => {
    setStep('content');
  };

  const handleContentSelection = () => {
    // Generate questions and move to questions step
    generateQuestionPreviews(1);
    setStep('questions');
  };


  const handleQuestionsConfirm = () => {
    setStep('processing');
    const job: OCRJob = {
      id: `job-${Date.now()}`,
      type: activeTab === 'csv' ? 'test-paper-csv' : 'test-paper-blueprint',
      status: 'processing',
      progress: 0,
      fileName: activeTab === 'csv' ? csvFile?.name : `Assessment: ${assessmentTitle}`,
      templateId: selectedLayoutTemplate,
      language: activeTab === 'csv' ? 'hindi' : (currentBlueprint.language || 'hindi'),
      createdAt: new Date().toISOString(),
      userId: user?.id || ''
    };
    setCurrentJob(job);
    simulateProcessing(job);
  };

  const simulateProcessing = (job: OCRJob) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setCurrentJob(prev => prev ? { ...prev, progress } : null);
      
      if (progress >= 100) {
        clearInterval(interval);
        setCurrentJob(prev => prev ? { 
          ...prev, 
          status: 'completed',
          completedAt: new Date().toISOString(),
          resultData: { testPaperUrl: '/mock-test-paper.pdf' }
        } : null);
        setStep('review');
      }
    }, 500);
  };

  const totalPages = Math.ceil(totalQuestions / questionsPerPage);

  const renderSourceStep = () => (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'csv' | 'blueprint')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="csv">From CSV File</TabsTrigger>
          <TabsTrigger value="blueprint">From CLMS Library</TabsTrigger>
        </TabsList>
        
        <TabsContent value="csv" className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="csv-upload">Upload CSV File</Label>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Info className="w-4 h-4 mr-2" />
                  View Template Format
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>CSV Template Format</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Your CSV file should contain the following columns in this exact order:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-mono space-y-1">
                      {csvTemplates.find(t => t.id === 'mcq-standard')?.requiredColumns.map((col, index) => (
                        <div key={index} className="flex">
                          <span className="w-8 text-gray-500">{index + 1}.</span>
                          <span>{col}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Sample Row:</h4>
                    <div className="bg-blue-50 p-3 rounded text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(csvTemplates.find(t => t.id === 'mcq-standard')?.sampleData || {}).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-semibold">{key}:</span> {value || '(empty)'}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">CSV files only (max 10MB)</p>
            </div>
            <Input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="mt-4"
            />
          </div>
          {csvFile && (
            <div className="mt-2 flex items-center text-sm text-green-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              {csvFile.name} uploaded successfully
            </div>
          )}

          <div>
            <Label>CSV Template</Label>
            <Select value={selectedCSVTemplate} onValueChange={setSelectedCSVTemplate}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select CSV template" />
              </SelectTrigger>
              <SelectContent>
                {csvTemplates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-500">{template.description}</div>
                      <div className="text-xs text-gray-400">v{template.version} • {template.requiredColumns.length} columns</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="blueprint" className="space-y-6">
          {blueprintSaveSuccess && (
            <div className="flex items-center p-3 bg-green-50 text-green-800 rounded-lg">
              <CheckCircle className="w-5 h-5 mr-2" />
              Blueprint saved successfully!
            </div>
          )}
          
          <BlueprintCreation
            supportedLanguages={supportedLanguages}
            onSave={handleBlueprintSave}
            onLoad={handleBlueprintLoad}
            savedBlueprints={savedBlueprints}
            initialBlueprint={currentBlueprint}
            sourceType="clms-library"
          />
        </TabsContent>
      </Tabs>


      {/* Question Replace Dialog */}
      <Dialog open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Select Replacement Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Choose a question to replace the current one
              </p>
              <Badge variant="secondary">
                {availableQuestionsForReplace.length} questions available
              </Badge>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-3">
              {getReplaceDialogQuestions().map((question) => (
                <Card key={question.id} className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => handleQuestionReplace(question)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">{question.nodeId}</Badge>
                        <Badge variant="outline">Grade {question.grade}</Badge>
                        <Badge variant="outline">{question.subject}</Badge>
                        <Badge variant="outline">Bloom's L{question.bloomsTag}</Badge>
                        <Badge variant="outline">Difficulty {question.difficultyTag}</Badge>
                      </div>
                      <h4 className="font-medium mb-2">{question.questionStem}</h4>
                      <div className="text-xs text-gray-500 mb-2">
                        {question.chapter} → {question.topic}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {[question.optionA, question.optionB, question.optionC, question.optionD].map((option, optIndex) => (
                          <div key={optIndex} className={`p-2 rounded ${option === question.answer ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-gray-50'}`}>
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </div>
                        ))}
                      </div>
                      {question.questionImage && (
                        <div className="mt-2 text-xs text-blue-600">
                          📷 Image: {question.questionImage}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {availableQuestionsForReplace.length > questionsPerPage && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (replaceDialogPage > 1) handleReplaceDialogPageChange(replaceDialogPage - 1);
                        }}
                        className={replaceDialogPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.ceil(availableQuestionsForReplace.length / questionsPerPage) }, (_, i) => i + 1)
                      .filter(page => {
                        const totalPages = Math.ceil(availableQuestionsForReplace.length / questionsPerPage);
                        return page === 1 || page === totalPages || Math.abs(page - replaceDialogPage) <= 2;
                      })
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] < page - 1 && (
                            <PaginationItem>
                              <span className="px-4 py-2">...</span>
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleReplaceDialogPageChange(page);
                              }}
                              isActive={replaceDialogPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        </React.Fragment>
                      ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (replaceDialogPage < Math.ceil(availableQuestionsForReplace.length / questionsPerPage)) {
                            handleReplaceDialogPageChange(replaceDialogPage + 1);
                          }
                        }}
                        className={replaceDialogPage >= Math.ceil(availableQuestionsForReplace.length / questionsPerPage) ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Assessment Blueprint Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Assessment Blueprint Name (Header 1)</Label>
              <Input
                value={assessmentTitle}
                onChange={(e) => setAssessmentTitle(e.target.value)}
                placeholder="e.g., Grade 9 Mathematics Mid-term Assessment"
              />
              <p className="text-xs text-muted-foreground mt-1">Give your assessment template a descriptive name</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Class Name (Header 2)</Label>
                <Select value={selectedGrade?.toString() || ''} onValueChange={(value) => setSelectedGrade(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
                      <SelectItem key={grade} value={grade.toString()}>
                        Grade {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Subject Name (Header 3)</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Social Science">Social Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Medium</Label>
              <Select value={selectedMedium} onValueChange={setSelectedMedium}>
                <SelectTrigger>
                  <SelectValue placeholder="Select medium" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                  <SelectItem value="Regional">Regional Language</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Paper Layout Template</Label>
              <div className="grid grid-cols-1 gap-4 mt-4">
                {layoutTemplates.map(template => (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedLayoutTemplate === template.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedLayoutTemplate(template.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{template.name}</h3>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">v{template.version}</span>
                          {template.customizable && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Customizable</span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Barcode Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Top Left Barcode</Label>
                <Input
                  value={barcodeConfig.topLeft}
                  onChange={(e) => setBarcodeConfig(prev => ({ ...prev, topLeft: e.target.value }))}
                  placeholder="e.g., TL001"
                />
              </div>
              <div>
                <Label>Top Right Barcode</Label>
                <Input
                  value={barcodeConfig.topRight}
                  onChange={(e) => setBarcodeConfig(prev => ({ ...prev, topRight: e.target.value }))}
                  placeholder="e.g., TR001"
                />
              </div>
              <div>
                <Label>Bottom Left Barcode</Label>
                <Input
                  value={barcodeConfig.bottomLeft}
                  onChange={(e) => setBarcodeConfig(prev => ({ ...prev, bottomLeft: e.target.value }))}
                  placeholder="e.g., BL001"
                />
              </div>
              <div>
                <Label>Bottom Right Barcode</Label>
                <Input
                  value={barcodeConfig.bottomRight}
                  onChange={(e) => setBarcodeConfig(prev => ({ ...prev, bottomRight: e.target.value }))}
                  placeholder="e.g., BR001"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Student Information Section</span>
            <Switch
              checked={includeStudentInfo}
              onCheckedChange={setIncludeStudentInfo}
            />
          </CardTitle>
        </CardHeader>
        {includeStudentInfo && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Student Name Label</Label>
                <Input
                  value={studentInfoConfig.nameLabel}
                  onChange={(e) => setStudentInfoConfig(prev => ({ ...prev, nameLabel: e.target.value }))}
                  placeholder="Student Name"
                />
              </div>
              <div>
                <Label>Student Section Label</Label>
                <Input
                  value={studentInfoConfig.sectionLabel}
                  onChange={(e) => setStudentInfoConfig(prev => ({ ...prev, sectionLabel: e.target.value }))}
                  placeholder="Section"
                />
              </div>
              <div>
                <Label>Student Roll Label</Label>
                <Input
                  value={studentInfoConfig.rollLabel}
                  onChange={(e) => setStudentInfoConfig(prev => ({ ...prev, rollLabel: e.target.value }))}
                  placeholder="Roll No."
                />
              </div>
              <div>
                <Label>Student ID Box Count</Label>
                <Input
                  type="number"
                  value={studentInfoConfig.idBoxCount}
                  onChange={(e) => setStudentInfoConfig(prev => ({ ...prev, idBoxCount: parseInt(e.target.value) || 10 }))}
                  placeholder="10"
                  min="5"
                  max="20"
                />
              </div>
            </div>
            <div>
              <Label>Instruction Text</Label>
              <Textarea
                value={studentInfoConfig.instructionText}
                onChange={(e) => setStudentInfoConfig(prev => ({ ...prev, instructionText: e.target.value }))}
                placeholder="Fill in your details clearly"
                rows={2}
              />
            </div>
          </CardContent>
        )}
      </Card>

      <div className="flex space-x-4">
        <Button variant="outline" onClick={() => setStep('source')} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={handleBasicInfoConfirm}
          disabled={!canProceedToContent()}
          className="flex-1"
        >
          Next
        </Button>
      </div>
    </div>
  );

  const renderContentStep = () => (
    <div className="space-y-6">
      <ChapterLOSelector
        selectedChapters={selectedChapters}
        selectedLearningOutcomes={selectedLearningOutcomes}
        onChapterChange={setSelectedChapters}
        onLearningOutcomeChange={setSelectedLearningOutcomes}
        mode={contentMode}
        onModeChange={setContentMode}
      />

      {/* Question Count Selection */}
      {contentMode === 'chapters' && selectedChapters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Number of Questions per Chapter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedChapters.map(chapterId => {
              const chapter = mockChapters.find(c => c.id === chapterId);
              return chapter ? (
                <div key={chapterId} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">{chapter.name}</h4>
                    <p className="text-sm text-muted-foreground">{chapter.questionCount} questions available</p>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="1"
                      max={chapter.questionCount}
                      value={chapterQuestionCounts[chapterId] || ''}
                      onChange={(e) => setChapterQuestionCounts(prev => ({ 
                        ...prev, 
                        [chapterId]: parseInt(e.target.value) || 0 
                      }))}
                      placeholder="0"
                    />
                  </div>
                </div>
              ) : null;
            })}
          </CardContent>
        </Card>
      )}

      {contentMode === 'learningOutcomes' && selectedLearningOutcomes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Number of Questions per Learning Outcome</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedLearningOutcomes.map(loId => {
              const lo = mockLearningOutcomes.find(l => l.id === loId);
              return lo ? (
                <div key={loId} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">{lo.title}</h4>
                    <p className="text-sm text-muted-foreground">{lo.questionCount} questions available</p>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="1"
                      max={lo.questionCount}
                      value={loQuestionCounts[loId] || ''}
                      onChange={(e) => setLoQuestionCounts(prev => ({ 
                        ...prev, 
                        [loId]: parseInt(e.target.value) || 0 
                      }))}
                      placeholder="0"
                    />
                  </div>
                </div>
              ) : null;
            })}
          </CardContent>
        </Card>
      )}

      <div className="flex space-x-4">
        <Button variant="outline" onClick={() => setStep('basic-info')} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={handleContentSelection}
          disabled={!canProceedToQuestions()}
          className="flex-1"
        >
          Generate Questions
        </Button>
      </div>
    </div>
  );

  const renderTemplateStep = () => (
    <div className="space-y-6">
      <div>
        <Label>Paper Layout Template</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {layoutTemplates.map(template => (
            <Card 
              key={template.id} 
              className={`cursor-pointer transition-colors ${
                selectedLayoutTemplate === template.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedLayoutTemplate(template.id)}
            >
              <CardContent className="p-4">
                <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{template.name}</h3>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">v{template.version}</span>
                    {template.customizable && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Customizable</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                {template.constraints && (
                  <div className="text-xs text-gray-500 mt-2">
                    Min questions: {template.constraints.minQuestions}
                    {template.constraints.questionTypes && (
                      <span> | Types: {template.constraints.questionTypes.join(', ')}</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex space-x-4">
        <Button variant="outline" onClick={() => setStep('basic-info')} className="flex-1">
          Back
        </Button>
        {selectedLayoutTemplate && (
          <Button 
            onClick={handleContentSelection}
            className="flex-1"
          >
            Select Content
          </Button>
        )}
      </div>
    </div>
  );


  const renderQuestionsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Questions from CLMS</h3>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {totalQuestions} questions available
          </Badge>
          <Badge variant="outline">
            Page {currentPage} of {totalPages}
          </Badge>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto space-y-3">
        {questionPreviews.map((question, index) => (
          <Card key={question.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline">
                    Q{(currentPage - 1) * questionsPerPage + index + 1}
                  </Badge>
                  <Badge variant="outline">{question.nodeId}</Badge>
                  <Badge variant="outline">Grade {question.grade}</Badge>
                  <Badge variant="outline">{question.subject}</Badge>
                  <Badge variant="outline">Bloom's L{question.bloomsTag}</Badge>
                  <Badge variant="outline">Difficulty {question.difficultyTag}</Badge>
                </div>
                <h4 className="font-medium mb-2">{question.questionStem}</h4>
                <div className="text-xs text-gray-500 mb-2">
                  {question.chapter} → {question.topic}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[question.optionA, question.optionB, question.optionC, question.optionD].map((option, optIndex) => (
                    <div key={optIndex} className={`p-2 rounded ${option === question.answer ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-gray-50'}`}>
                      {String.fromCharCode(65 + optIndex)}. {option}
                    </div>
                  ))}
                </div>
                {question.questionImage && (
                  <div className="mt-2 text-xs text-blue-600">
                    📷 Image: {question.questionImage}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col space-y-1 ml-4">
                <Button variant="outline" size="sm" onClick={() => moveQuestion(index, 'up')} disabled={index === 0}>
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => moveQuestion(index, 'down')} disabled={index === questionPreviews.length - 1}>
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => openReplaceDialog(index)}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2;
                })
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] < page - 1 && (
                      <PaginationItem>
                        <span className="px-4 py-2">...</span>
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  </React.Fragment>
                ))}
              
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                      handlePageChange(currentPage + 1);
                    }
                  }}
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <div className="flex space-x-4">
        <Button variant="outline" onClick={() => setStep('content')} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={handleQuestionsConfirm}
          className="flex-1"
        >
          Generate Test Paper
        </Button>
      </div>

      {/* Question Replace Dialog */}
      <Dialog open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Select Replacement Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Choose a question to replace the current one
              </p>
              <Badge variant="secondary">
                {availableQuestionsForReplace.length} questions available
              </Badge>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-3">
              {getReplaceDialogQuestions().map((question) => (
                <Card key={question.id} className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => handleQuestionReplace(question)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">{question.nodeId}</Badge>
                        <Badge variant="outline">Grade {question.grade}</Badge>
                        <Badge variant="outline">{question.subject}</Badge>
                        <Badge variant="outline">Bloom's L{question.bloomsTag}</Badge>
                        <Badge variant="outline">Difficulty {question.difficultyTag}</Badge>
                      </div>
                      <h4 className="font-medium mb-2">{question.questionStem}</h4>
                      <div className="text-xs text-gray-500 mb-2">
                        {question.chapter} → {question.topic}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {[question.optionA, question.optionB, question.optionC, question.optionD].map((option, optIndex) => (
                          <div key={optIndex} className={`p-2 rounded ${option === question.answer ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-gray-50'}`}>
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </div>
                        ))}
                      </div>
                      {question.questionImage && (
                        <div className="mt-2 text-xs text-blue-600">
                          📷 Image: {question.questionImage}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {availableQuestionsForReplace.length > questionsPerPage && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (replaceDialogPage > 1) handleReplaceDialogPageChange(replaceDialogPage - 1);
                        }}
                        className={replaceDialogPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.ceil(availableQuestionsForReplace.length / questionsPerPage) }, (_, i) => i + 1)
                      .filter(page => {
                        const totalPages = Math.ceil(availableQuestionsForReplace.length / questionsPerPage);
                        return page === 1 || page === totalPages || Math.abs(page - replaceDialogPage) <= 2;
                      })
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] < page - 1 && (
                            <PaginationItem>
                              <span className="px-4 py-2">...</span>
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleReplaceDialogPageChange(page);
                              }}
                              isActive={replaceDialogPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        </React.Fragment>
                      ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (replaceDialogPage < Math.ceil(availableQuestionsForReplace.length / questionsPerPage)) {
                            handleReplaceDialogPageChange(replaceDialogPage + 1);
                          }
                        }}
                        className={replaceDialogPage >= Math.ceil(availableQuestionsForReplace.length / questionsPerPage) ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="space-y-6 text-center">
      <div className="space-y-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <FileText className="w-8 h-8 text-blue-600 animate-pulse" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Generating Test Paper</h3>
          <p className="text-gray-600">
            Processing {activeTab === 'csv' ? 'CSV file' : 'blueprint'} using OCR tool...
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <Progress value={currentJob?.progress || 0} className="w-full" />
        <p className="text-sm text-gray-500">{currentJob?.progress || 0}% complete</p>
      </div>

      <div className="text-sm text-gray-600">
        <p>Source: {currentJob?.fileName}</p>
        <p>Template: {layoutTemplates.find(t => t.id === selectedLayoutTemplate)?.name}</p>
        <p>Language: {supportedLanguages.find(l => l.code === currentJob?.language)?.nativeName}</p>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Test Paper Generated Successfully</h3>
        <p className="text-gray-600">Review using integrated visual editor before saving to CLMS</p>
      </div>

      <div className="border rounded-lg p-6 bg-gray-50">
        <div className="aspect-video bg-white rounded border flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Visual Editor Integration</p>
            <p className="text-xs text-gray-500">OCR tool's visual editor would be embedded here</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button variant="outline" className="flex-1">
          <Eye className="w-4 h-4 mr-2" />
          Visual Editor
        </Button>
        <Button variant="outline" className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button onClick={() => setStep('complete')} className="flex-1">
          Save to CLMS
        </Button>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6 text-center">
      <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
      <div>
        <h3 className="text-lg font-semibold">Test Paper Saved Successfully</h3>
        <p className="text-gray-600">Test paper saved to CLMS with OCR metadata and language tags</p>
      </div>
      <Button onClick={() => {
        setStep('source');
        setActiveTab('csv');
        setCsvFile(null);
        setCurrentBlueprint({});
        setQuestionPreviews([]);
        setShowQuestionPreview(false);
        setSelectedCSVTemplate('');
        setSelectedLayoutTemplate('');
        setCurrentJob(null);
        setBlueprintSaveSuccess(false);
        setAssessmentTitle('');
        setSelectedGrade(null);
        setSelectedMedium('');
        setSelectedSubject('');
        setSelectedChapters([]);
        setSelectedLearningOutcomes([]);
        setChapterQuestionCounts({});
        setLoQuestionCounts({});
        setBarcodeConfig({ topLeft: '', topRight: '', bottomLeft: '', bottomRight: '' });
        setIncludeStudentInfo(false);
      }}>
        Create Another Test Paper
      </Button>
    </div>
  );

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Test Paper Generation</h1>
          <p className="text-gray-600 mt-1">
            Create structured test papers from CSV files or blueprints using enhanced OCR templates
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enhanced Test Paper Generation Workflow</CardTitle>
          </CardHeader>
           <CardContent>
             <div className="mb-4 text-sm text-gray-500">
               Current step: {step} | Active tab: {activeTab}
             </div>
             {step === 'source' && renderSourceStep()}
             {step === 'basic-info' && renderBasicInfoStep()}
             {step === 'content' && renderContentStep()}
             {step === 'questions' && renderQuestionsStep()}
             {step === 'processing' && renderProcessingStep()}
             {step === 'review' && renderReviewStep()}
             {step === 'complete' && renderCompleteStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OCRTestPaperCreation;
