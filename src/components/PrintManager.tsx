
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  Printer, 
  Download, 
  Eye, 
  Settings, 
  FileText,
  Languages 
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { PrintOptions, LanguageSupport } from '@/types/ocr';

const PrintManager = () => {
  const { hasPermission } = useUser();
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    format: 'pdf',
    layout: 'portrait',
    includeAnswerKey: false,
    includeQRCode: true,
    questionDensity: 'normal',
    language: 'english'
  });

  const supportedLanguages: LanguageSupport[] = [
    { code: 'english', name: 'English', nativeName: 'English', direction: 'ltr', isSupported: true, ocrAccuracy: 0.98 },
    { code: 'hindi', name: 'Hindi', nativeName: 'हिंदी', direction: 'ltr', isSupported: true, ocrAccuracy: 0.95 },
    { code: 'bengali', name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr', isSupported: true, ocrAccuracy: 0.93 }
  ];

  // Mock content data
  const mockContent = [
    { id: '1', title: 'Mathematics Test Paper - Algebra', type: 'test-paper', language: 'english', questionCount: 25 },
    { id: '2', title: 'Physics Worksheet - Mechanics', type: 'worksheet', language: 'hindi', questionCount: 15 },
    { id: '3', title: 'Biology Quiz - Photosynthesis', type: 'test-paper', language: 'english', questionCount: 20 }
  ];

  if (!hasPermission('canExportContent')) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Printer className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to access print management.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const updatePrintOption = (key: keyof PrintOptions, value: any) => {
    setPrintOptions(prev => ({ ...prev, [key]: value }));
  };

  const handlePrint = (contentId: string) => {
    console.log('Printing content:', contentId, 'with options:', printOptions);
    // In real implementation, this would call the print API
  };

  const handlePreview = (contentId: string) => {
    console.log('Previewing content:', contentId, 'with options:', printOptions);
    // In real implementation, this would show print preview
  };

  const handleDownload = (contentId: string) => {
    console.log('Downloading content:', contentId, 'with options:', printOptions);
    // In real implementation, this would trigger download
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Print Management</h1>
          <p className="text-gray-600 mt-1">Enhanced print options for OCR-generated content</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Print Options Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Print Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Output Format</Label>
                  <Select 
                    value={printOptions.format} 
                    onValueChange={(value: any) => updatePrintOption('format', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="doc">Word Document</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Page Layout</Label>
                  <Select 
                    value={printOptions.layout} 
                    onValueChange={(value: any) => updatePrintOption('layout', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Question Density</Label>
                  <Select 
                    value={printOptions.questionDensity} 
                    onValueChange={(value: any) => updatePrintOption('questionDensity', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Language</Label>
                  <Select 
                    value={printOptions.language} 
                    onValueChange={(value) => updatePrintOption('language', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedLanguages.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <div className="flex items-center space-x-2">
                            <Languages className="w-4 h-4" />
                            <span>{lang.nativeName}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="answer-key"
                      checked={printOptions.includeAnswerKey}
                      onCheckedChange={(checked) => updatePrintOption('includeAnswerKey', checked)}
                    />
                    <Label htmlFor="answer-key" className="text-sm">Include Answer Key</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="qr-code"
                      checked={printOptions.includeQRCode}
                      onCheckedChange={(checked) => updatePrintOption('includeQRCode', checked)}
                    />
                    <Label htmlFor="qr-code" className="text-sm">Include QR Code</Label>
                  </div>
                </div>

                <div>
                  <Label>Custom Header</Label>
                  <Input
                    value={printOptions.customHeader || ''}
                    onChange={(e) => updatePrintOption('customHeader', e.target.value)}
                    placeholder="Enter custom header text"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Custom Footer</Label>
                  <Input
                    value={printOptions.customFooter || ''}
                    onChange={(e) => updatePrintOption('customFooter', e.target.value)}
                    placeholder="Enter custom footer text"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Watermark</Label>
                  <Input
                    value={printOptions.watermark || ''}
                    onChange={(e) => updatePrintOption('watermark', e.target.value)}
                    placeholder="Enter watermark text"
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content List Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>OCR Generated Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockContent.map(content => (
                    <Card key={content.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <h4 className="font-medium">{content.title}</h4>
                          </div>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                            <span>Type: {content.type}</span>
                            <span>Questions: {content.questionCount}</span>
                            <span>Language: {supportedLanguages.find(l => l.code === content.language)?.nativeName}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(content.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(content.id)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handlePrint(content.id)}
                          >
                            <Printer className="w-4 h-4 mr-1" />
                            Print
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Print Preview */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Print Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-[8.5/11] bg-white border rounded-lg p-8 shadow-sm">
                  <div className="text-center mb-6">
                    {printOptions.customHeader && (
                      <div className="text-lg font-bold mb-2">{printOptions.customHeader}</div>
                    )}
                    <h2 className="text-xl font-bold">Sample Test Paper Preview</h2>
                    <p className="text-sm text-gray-600 mt-2">
                      Language: {supportedLanguages.find(l => l.code === printOptions.language)?.nativeName}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-3 border rounded">
                      <p className="font-medium">1. Sample Question Text</p>
                      {printOptions.questionDensity === 'spacious' && <div className="h-4"></div>}
                      <div className="mt-2 space-y-1 text-sm">
                        <p>A) Option A</p>
                        <p>B) Option B</p>
                        <p>C) Option C</p>
                        <p>D) Option D</p>
                      </div>
                      {printOptions.questionDensity === 'spacious' && <div className="h-4"></div>}
                    </div>
                  </div>
                  
                  {printOptions.includeQRCode && (
                    <div className="mt-6 flex justify-end">
                      <div className="w-16 h-16 border-2 border-dashed border-gray-400 flex items-center justify-center text-xs text-gray-500">
                        QR Code
                      </div>
                    </div>
                  )}
                  
                  {printOptions.watermark && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-gray-200 text-6xl font-bold transform rotate-45 opacity-20">
                        {printOptions.watermark}
                      </div>
                    </div>
                  )}
                  
                  {printOptions.customFooter && (
                    <div className="mt-6 text-center text-sm text-gray-600 border-t pt-2">
                      {printOptions.customFooter}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintManager;
