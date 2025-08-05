import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BarcodeConfig {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
}

interface StudentInfoConfig {
  nameLabel: string;
  sectionLabel: string;
  rollLabel: string;
  idBoxCount: number;
  instructionText: string;
}

interface OCRTestPaperPreviewProps {
  assessmentTitle: string;
  selectedGrade?: number;
  selectedSubject?: string;
  selectedMedium?: string;
  barcodeConfig: BarcodeConfig;
  includeStudentInfo: boolean;
  studentInfoConfig: StudentInfoConfig;
  duration?: string;
  totalMarks?: string;
  className?: string;
  showQuestions?: boolean; // New prop to control when questions are shown
}

const OCRTestPaperPreview: React.FC<OCRTestPaperPreviewProps> = ({
  assessmentTitle,
  selectedGrade,
  selectedSubject,
  selectedMedium,
  barcodeConfig,
  includeStudentInfo,
  studentInfoConfig,
  duration,
  totalMarks,
  className,
  showQuestions = false // Default to false - don't show questions unless explicitly requested
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-center">Assessment Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white border border-gray-300 p-4 min-h-[800px] text-black" style={{ fontFamily: 'serif' }}>
          {/* Header with barcodes */}
          <div className="flex justify-between items-start mb-4">
            <div className="text-xs">
              {barcodeConfig.topLeft && (
                <div className="border border-black p-1 text-center w-16">
                  |||||||||||
                  <div>{barcodeConfig.topLeft}</div>
                </div>
              )}
            </div>
            <div className="text-center flex-1 mx-4">
              <h1 className="font-bold text-lg">Classroom Based Practice Assessment</h1>
              {selectedGrade && selectedSubject && selectedMedium && (
                <p className="text-sm">
                  Class {selectedGrade}, {selectedSubject}({selectedMedium === 'hindi' ? 'Hindi' : 'English'})
                </p>
              )}
            </div>
            <div className="text-xs">
              {barcodeConfig.topRight && (
                <div className="border border-black p-1 text-center w-16">
                  |||||||||||
                  <div>{barcodeConfig.topRight}</div>
                </div>
              )}
            </div>
          </div>

          {/* Student Information Section */}
          {includeStudentInfo && (
            <div className="border border-black p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-semibold">{studentInfoConfig.nameLabel}:</span>
                  <div className="flex space-x-1">
                    {Array.from({ length: studentInfoConfig.idBoxCount }).map((_, i) => (
                      <div key={i} className="w-6 h-6 border border-gray-400"></div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <span>{studentInfoConfig.sectionLabel}:</span>
                  <span>{studentInfoConfig.rollLabel}:</span>
                  <div className="text-xs">{studentInfoConfig.instructionText}</div>
                </div>
              </div>
            </div>
          )}

          {/* Assessment Details */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold mb-2">{assessmentTitle || 'Assessment Title'}</h2>
            {(duration || totalMarks) && (
              <div className="flex justify-center space-x-6 text-sm">
                {duration && <span>Time: {duration} minutes</span>}
                {totalMarks && <span>Total Marks: {totalMarks}</span>}
              </div>
            )}
          </div>

          {/* Sample Questions - Only show when explicitly requested */}
          {showQuestions && (
            <div className="space-y-4">
              <div className="border border-gray-300 p-3">
                <p className="font-semibold mb-2">1. निम्न में से पेड़ों की सही गिनती पर ☑ का निशान लगाएं:</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border border-black"></div>
                    <span>🌳🌳🌳🌳 = 120 मिलीलीटर</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border border-black"></div>
                    <span>80 मिलीलीटर</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border border-black"></div>
                    <span>20 मिलीलीटर</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border border-black"></div>
                    <span>280 मिलीलीटर</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-300 p-3">
                <p className="font-semibold mb-2">2. एक बोतल में 200 मिलीलीटर दूध है। अगर 80 मिलीलीटर दूध एक गिलास में डाला जाता है, तो बोतल में कितना दूध बचेगा?</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border border-black"></div>
                    <span>120 मिलीलीटर</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border border-black"></div>
                    <span>80 मिलीलीटर</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border border-black"></div>
                    <span>20 मिलीलीटर</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border border-black"></div>
                    <span>280 मिलीलीटर</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-300 p-3">
                <p className="font-semibold mb-2">3. 63 को किस संख्या से भाग देने पर शेष दिशाया गया है?</p>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(num => (
                    <div key={num} className="border border-gray-400 p-2 text-center text-sm">
                      <div className="w-4 h-4 border border-black mx-auto mb-1"></div>
                      <div>विकल्प {num}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-300 p-3">
                <p className="font-semibold mb-2">4. 25 जुलाई का क्या कौन सा दिन है?</p>
                <div className="flex justify-between">
                  <div className="text-center text-xs">
                    <div className="border border-gray-400 p-2 mb-1">
                      <div className="grid grid-cols-7 gap-px">
                        {Array.from({length: 31}, (_, i) => (
                          <div key={i} className="w-4 h-4 text-xs flex items-center justify-center border">
                            {i + 1}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border border-black"></div>
                      <span>शुक्रवार</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border border-black"></div>
                      <span>शनिवार</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border border-black"></div>
                      <span>रविवार</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border border-black"></div>
                      <span>सोमवार</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder when no questions should be shown */}
          {!showQuestions && (
            <div className="border-2 border-dashed border-gray-300 p-8 text-center text-gray-500">
              <p className="text-lg font-medium">Questions will appear here</p>
              <p className="text-sm">Once you select content in the next step, questions will be displayed in this preview</p>
            </div>
          )}

          {/* Footer with barcodes */}
          <div className="flex justify-between items-end mt-8">
            <div className="text-xs">
              {barcodeConfig.bottomLeft && (
                <div className="border border-black p-1 text-center w-16">
                  |||||||||||
                  <div>{barcodeConfig.bottomLeft}</div>
                </div>
              )}
            </div>
            <div className="text-xs">
              {barcodeConfig.bottomRight && (
                <div className="border border-black p-1 text-center w-16">
                  |||||||||||
                  <div>{barcodeConfig.bottomRight}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OCRTestPaperPreview;