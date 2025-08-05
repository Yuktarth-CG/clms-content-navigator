import React from 'react';
import { Card } from '@/components/ui/card';
import { ExtraField } from './StudentDetailsForm';

interface QuestionPreview {
  id: string;
  questionNumber: number;
  questionStem: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
  medium: string;
}

interface OCRTestPaperPreviewProps {
  assessmentTitle: string;
  selectedGrade: number | null;
  selectedSubject: string;
  barcodeConfig: {
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
  };
  includeStudentInfo: boolean;
  studentFields: ExtraField[];
  questions: QuestionPreview[];
}

const OCRTestPaperPreview: React.FC<OCRTestPaperPreviewProps> = ({
  assessmentTitle,
  selectedGrade,
  selectedSubject,
  barcodeConfig,
  includeStudentInfo,
  studentFields,
  questions
}) => {
  const renderBarcode = (position: string, data: string) => {
    if (!data) return null;
    return (
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border border-black flex items-center justify-center">
          <div className="flex space-x-1">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-1 bg-black" style={{ height: `${Math.random() * 30 + 10}px` }} />
            ))}
          </div>
        </div>
        <span className="text-xs mt-1">{data}</span>
      </div>
    );
  };

  const renderStudentInfoSection = () => {
    if (!includeStudentInfo || studentFields.length === 0) return null;
    
    return (
      <div className="border border-black p-3 mb-4">
        <div className="grid grid-cols-3 gap-4 mb-2">
          {studentFields.slice(0, 3).map((field, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-sm font-medium">{field.label}:</span>
              <div className="border-b border-dotted border-black flex-1 h-6"></div>
            </div>
          ))}
        </div>
        
        {/* Student ID boxes */}
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-sm">Student ID:</span>
          <div className="flex space-x-1">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="w-6 h-6 border border-black"></div>
            ))}
          </div>
          <span className="text-xs ml-2">Fill in the bubbles with the right pencil per box</span>
        </div>
      </div>
    );
  };

  const renderQuestion = (question: QuestionPreview, index: number) => {
    const isEven = index % 2 === 1;
    const gridClass = isEven ? "bg-gray-50" : "";
    
    return (
      <div key={question.id} className={`p-3 border-b border-gray-300 ${gridClass}`}>
        <div className="flex items-start space-x-3">
          <span className="font-bold text-sm">{question.questionNumber}.</span>
          <div className="flex-1">
            <p className="text-sm mb-2">{question.questionStem}</p>
            
            {/* Options in a 2x2 grid */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'A', text: question.optionA },
                { label: 'B', text: question.optionB },
                { label: 'C', text: question.optionC },
                { label: 'D', text: question.optionD }
              ].map((option) => (
                <div key={option.label} className="flex items-center space-x-2">
                  <div className="w-4 h-4 border border-black flex-shrink-0"></div>
                  <span className="text-xs">{option.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-300 shadow-lg rounded-lg overflow-hidden">
      {/* Header with barcodes */}
      <div className="border-b border-black p-4">
        <div className="flex justify-between items-start">
          {renderBarcode('topLeft', barcodeConfig.topLeft)}
          
          <div className="text-center flex-1 mx-4">
            <h1 className="font-bold text-lg">Classroom Based Practice Assessment</h1>
            <h2 className="font-semibold text-md">{assessmentTitle || 'Class 3, Hindi(1)'}</h2>
          </div>
          
          {renderBarcode('topRight', barcodeConfig.topRight)}
        </div>
      </div>

      {/* Student Information Section */}
      {renderStudentInfoSection()}

      {/* Questions Section */}
      <div className="p-4">
        {questions.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {questions.slice(0, 6).map((question, index) => renderQuestion(question, index))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Questions will appear here once you configure content</p>
          </div>
        )}
      </div>

      {/* Footer with barcodes */}
      <div className="border-t border-black p-4">
        <div className="flex justify-between items-center">
          {renderBarcode('bottomLeft', barcodeConfig.bottomLeft)}
          {renderBarcode('bottomRight', barcodeConfig.bottomRight)}
        </div>
      </div>
    </div>
  );
};

export default OCRTestPaperPreview;