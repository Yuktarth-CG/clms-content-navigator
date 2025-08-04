import React, { useState, useEffect, RefObject } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Download, Edit, ArrowUpDown, RotateCcw, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { debugService } from '@/services/debugService';
import { Section } from './SectionEditor';
import { QuestionTypeLabels } from '@/types/assessment';
interface Question {
  id: string;
  questionNumber: number;
  questionStem: string;
  questionType: string;
  bloomLevel: number;
  marks: number;
  chapter: string;
  topic: string;
  options?: string[];
  answer?: string;
}
export interface ExtraField {
  label: string;
  value: string;
}
export interface AdditionalLine {
  text: string;
  orientation: 'left' | 'center' | 'right';
}
interface Theme {
  id: string;
  state_name: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  button_color: string;
}
interface PDFPreviewProps {
  title: string;
  grade?: string;
  questions: Question[];
  onDownload: () => void;
  onQuestionAction: (questionId: string, action: 'move-up' | 'move-down' | 'replace' | 'edit') => void;
  documentType?: 'assessment' | 'worksheet';
  isReadyForDownload?: boolean;
  showStudentDetails?: boolean;
  studentDetailFields?: ExtraField[];
  generalInstructions?: string[];
  pdfContentRef?: RefObject<HTMLDivElement>;
  additionalLines?: AdditionalLine[];
  sections?: Section[];
  totalMarks?: string;
  duration?: string;
  showGenerationInstructions?: boolean;
}
const PDFPreview: React.FC<PDFPreviewProps> = ({
  title,
  grade,
  questions,
  onDownload,
  onQuestionAction,
  documentType = 'assessment',
  isReadyForDownload = false,
  showStudentDetails = false,
  studentDetailFields = [],
  generalInstructions = [],
  pdfContentRef,
  additionalLines = [],
  sections,
  totalMarks,
  duration,
  showGenerationInstructions = false
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [theme, setTheme] = useState<Theme | null>(null);
  React.useEffect(() => {
    debugService.info('PDFPreview component mounted', 'PDFPreview', {
      title,
      questionCount: questions.length,
      documentType
    });
    return () => {
      debugService.info('PDFPreview component unmounted', 'PDFPreview');
    };
  }, [title, questions.length, documentType]);
  const handleQuestionSelect = (question: Question) => {
    debugService.debug('Question selected for action', 'PDFPreview', {
      questionId: question.id,
      questionNumber: question.questionNumber,
      questionType: question.questionType,
      questionStem: question.questionStem.substring(0, 50) + '...'
    });
    setSelectedQuestion(question);
    setShowQuestionDialog(true);
  };
  const handleQuestionAction = (action: 'move-up' | 'move-down' | 'replace' | 'edit') => {
    if (selectedQuestion) {
      debugService.info(`Question action performed: ${action}`, 'PDFPreview', {
        questionId: selectedQuestion.id,
        questionNumber: selectedQuestion.questionNumber,
        action,
        questionType: selectedQuestion.questionType
      });
      onQuestionAction(selectedQuestion.id, action);
      setShowQuestionDialog(false);
    }
  };
  const handleDirectAction = (e: React.MouseEvent, question: Question, action: 'move-up' | 'move-down' | 'replace' | 'edit') => {
    e.stopPropagation();
    onQuestionAction(question.id, action);
  };
  useEffect(() => {
    fetchTheme();
  }, []);
  const fetchTheme = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('themes').select('*').order('created_at', {
        ascending: false
      }).limit(1).single();
      if (data && !error) {
        setTheme(data);
      }
    } catch (error) {
      console.log('No theme found, using defaults');
    }
  };
  const sectionsToRender = sections && sections.length > 0 ? sections : [{
    id: 'default',
    title: 'All Questions',
    label: '',
    questionTypeConfigs: []
  }];
  return <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle>Assessment Preview</CardTitle>
              <p className="text-sm text-muted-foreground">
                {title} • {questions.length} questions
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isReadyForDownload && <>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Ready for Download
                </Badge>
                <Button onClick={onDownload} className="flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </Button>
              </>}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6 min-h-[500px]">
          <div ref={pdfContentRef} className="bg-white shadow-lg rounded-lg p-8 max-w-4xl mx-auto font-serif">
            <div className="border-b pb-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                {theme?.logo_url ? <img src={theme.logo_url} alt={`${theme.state_name} Logo`} className="h-16 w-auto" /> : <div className="h-16 w-16 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>}
                
                <div className="text-right">
                  <h2 className="text-lg font-semibold text-gray-700">
                    {theme?.state_name || 'Swift Chat CLMS'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {documentType === 'worksheet' ? 'Practice Worksheet' : 'Assessment Paper'}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center border-b-2 border-black pb-6 mb-6">
              <h1 className="text-xl font-bold uppercase tracking-wider mb-2">
                {title}
              </h1>
              {grade && <p className="text-lg font-semibold mb-2">
                  Grade {grade}
                </p>}
              {additionalLines.map((line, index) => line.text && <p key={index} className={`text-sm 
                      ${line.orientation === 'left' ? 'text-left' : ''}
                      ${line.orientation === 'center' ? 'text-center' : ''}
                      ${line.orientation === 'right' ? 'text-right' : ''}`}>
                    {line.text}
                  </p>)}
            </div>

            <div className="flex justify-between mb-6 text-sm font-semibold">
              {duration && duration.trim() !== '' && (
                <div>
                  <strong>Max. Time: {(() => {
                    const minutes = parseInt(duration);
                    if (minutes >= 60) {
                      const hours = Math.floor(minutes / 60);
                      const remainingMinutes = minutes % 60;
                      if (remainingMinutes === 0) {
                        return `${hours} ${hours === 1 ? 'Hour' : 'Hours'}`;
                      } else {
                        return `${hours} ${hours === 1 ? 'Hour' : 'Hours'} ${remainingMinutes} Minutes`;
                      }
                    } else {
                      return `${minutes} Minutes`;
                    }
                  })()}</strong>
                </div>
              )}
              {totalMarks && totalMarks.trim() !== '' && (
                <div>
                  <strong>Max. Marks: {totalMarks}</strong>
                </div>
              )}
            </div>

            {showStudentDetails && <div className="mb-6 p-4 border border-gray-400">
                <h4 className="font-bold mb-3">Student Details:</h4>
                <div className="grid grid-cols-2 gap-4">
                  {studentDetailFields?.map((field, index) => <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm font-medium min-w-[80px]">{field.label}:</span>
                      <div className="border-b border-black flex-1 h-6"></div>
                    </div>)}
                </div>
              </div>}

            {generalInstructions && generalInstructions.length > 0 && <div className="mb-6">
                <h3 className="font-bold text-base mb-3">General Instructions:</h3>
                <div className="space-y-2 text-sm">
                  {generalInstructions.map((instruction, index) => <div key={index} className="flex">
                      <span className="font-semibold mr-2">{index + 1}.</span>
                      <span>{instruction}</span>
                    </div>)}
                </div>
              </div>}

            <ScrollArea className="h-96">
              {showGenerationInstructions ? (
                <div className="space-y-6 p-6 text-center">
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4">🎯 Assessment Generation Instructions</h3>
                    <p className="text-muted-foreground mb-6">Complete the setup process to generate your custom assessment</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <h4 className="font-semibold text-blue-800 mb-2">✅ Step 1: Setup & Blueprint</h4>
                      <p className="text-sm text-blue-700">Configure your assessment details and select a blueprint that defines the structure and question distribution.</p>
                    </div>

                    <div className="p-4 border rounded-lg bg-orange-50">
                      <h4 className="font-semibold text-orange-800 mb-2">📚 Step 2: Content Selection</h4>
                      <p className="text-sm text-orange-700">Choose specific chapters or learning outcomes that will be covered in your assessment.</p>
                    </div>

                    <div className="p-4 border rounded-lg bg-purple-50">
                      <h4 className="font-semibold text-purple-800 mb-2">📊 Step 3: Distribution</h4>
                      <p className="text-sm text-purple-700">Customize question distribution by Bloom's Taxonomy levels or difficulty for personalized assessment targeting.</p>
                    </div>

                    <div className="p-4 border rounded-lg bg-green-50">
                      <h4 className="font-semibold text-green-800 mb-2">📝 Step 4: Sections</h4>
                      <p className="text-sm text-green-700">Organize your questions into labeled sections and configure question types and marks for each section.</p>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>💡 Tip:</strong> Your assessment preview will appear here as you progress through the steps. 
                      Questions will be generated based on your selections and will be fully customizable.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {sectionsToRender.map((section, sectionIndex) => {
                  // Filter questions based on section's allowed types
                  const sectionQuestionTypes = section.questionTypeConfigs?.map(config => config.type) || [];
                  const sectionQuestions = questions.filter(q => sectionQuestionTypes.includes(q.questionType as any));
                  if (sectionQuestions.length === 0 && section.id !== 'default') return null; // Only hide if it's not the default 'All Questions' section and has no questions

                  return <div key={section.id}>
                        <div className="mb-4">
                          <h3 className="font-bold text-base text-center uppercase tracking-wider">
                            {section.title}{section.label && `: ${section.label}`}
                          </h3>
                          {sectionQuestionTypes.length > 0}
                        </div>

                        <div className="border border-black">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-black p-2 text-center font-bold w-16">Q. No.</th>
                                <th className="border border-black p-2 text-center font-bold">QUESTION</th>
                                <th className="border border-black p-2 text-center font-bold w-20">Marks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sectionQuestions.map((question, index) => <tr key={question.id} className="hover:bg-gray-50 cursor-pointer transition-colors group" onClick={() => handleQuestionSelect(question)}>
                                  <td className="border border-black p-3 text-center font-semibold align-top">
                                    Q.{question.questionNumber}
                                  </td>
                                  <td className="border border-black p-3 align-top relative">
                                    <div className="mb-2">
                                      <span className="font-medium">{question.questionStem}</span>
                                      {question.questionType === 'MCQ' && question.options && <div className="mt-2 space-y-1">
                                          {question.options.map((option, idx) => <div key={idx} className="ml-4">
                                              <span className="font-medium">
                                                {String.fromCharCode(97 + idx)}) 
                                              </span>
                                              <span className="ml-2">{option}</span>
                                            </div>)}
                                        </div>}
                                    </div>
                                    
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="flex items-center space-x-1 bg-white border rounded shadow-sm p-1">
                                        <Button size="sm" variant="ghost" className="p-1 h-6 w-6" onClick={e => handleDirectAction(e, question, 'move-up')} title="Move Up">
                                          <ArrowUpDown className="w-3 h-3 rotate-180" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="p-1 h-6 w-6" onClick={e => handleDirectAction(e, question, 'move-down')} title="Move Down">
                                          <ArrowUpDown className="w-3 h-3" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="p-1 h-6 w-6" onClick={e => handleDirectAction(e, question, 'replace')} title="Replace Question">
                                          <RefreshCw className="w-3 h-3" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="p-1 h-6 w-6" onClick={e => handleDirectAction(e, question, 'edit')} title="Edit Question">
                                          <Edit className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="border border-black p-3 text-center font-semibold align-top">
                                    {question.marks}
                                  </td>
                                </tr>)}
                            </tbody>
                          </table>
                        </div>
                      </div>;
                })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Question Actions</DialogTitle>
            </DialogHeader>
            
            {selectedQuestion && <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium mb-1">
                    Question {selectedQuestion.questionNumber}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedQuestion.questionStem.substring(0, 100)}...
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button onClick={() => handleQuestionAction('edit')} className="w-full justify-start" variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Question Content
                  </Button>
                  
                  <Button onClick={() => handleQuestionAction('move-up')} className="w-full justify-start" variant="outline">
                    <ArrowUpDown className="w-4 h-4 mr-2 rotate-180" />
                    Move Question Up
                  </Button>
                  
                  <Button onClick={() => handleQuestionAction('move-down')} className="w-full justify-start" variant="outline">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Move Question Down
                  </Button>
                  
                  <Button onClick={() => handleQuestionAction('replace')} className="w-full justify-start" variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Replace with Similar Question
                  </Button>
                </div>
              </div>}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>;
};
export default PDFPreview;