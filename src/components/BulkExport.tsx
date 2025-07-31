
import React, { useState } from 'react';
import { Download, FileText, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const BulkExport = () => {
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    contentType: 'all',
    loCode: '',
    chapter: '',
    dateRange: 'all'
  });

  const [selectedFields, setSelectedFields] = useState({
    id: true,
    title: true,
    content: true,
    loCode: true,
    chapter: true,
    difficulty: true,
    tags: true,
    status: true,
    createdAt: false,
    modifiedAt: false,
    createdBy: false
  });

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (format: string) => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      // In a real app, this would trigger a file download
      console.log(`Exporting as ${format}...`);
    }, 2000);
  };

  const getSelectedCount = () => {
    // Mock calculation - in real app this would query the database
    return 1250;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bulk Export</h1>
        <p className="text-muted-foreground mt-1">Export content from your library in various formats</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Filters */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Export Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Content Status</label>
                <Select 
                  value={selectedFilters.status} 
                  onValueChange={(value) => setSelectedFilters({...selectedFilters, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="drafts">Drafts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content Type</label>
                <Select 
                  value={selectedFilters.contentType} 
                  onValueChange={(value) => setSelectedFilters({...selectedFilters, contentType: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="questions">Questions</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Learning Outcome Code</label>
                <Input 
                  placeholder="Enter LO code..."
                  value={selectedFilters.loCode}
                  onChange={(e) => setSelectedFilters({...selectedFilters, loCode: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Chapter</label>
                <Input 
                  placeholder="Enter chapter name..."
                  value={selectedFilters.chapter}
                  onChange={(e) => setSelectedFilters({...selectedFilters, chapter: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date Range</label>
                <Select 
                  value={selectedFilters.dateRange} 
                  onValueChange={(value) => setSelectedFilters({...selectedFilters, dateRange: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="last-week">Last Week</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="last-quarter">Last Quarter</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Items to Export:</span>
                  <Badge variant="secondary">{getSelectedCount().toLocaleString()}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Field Selection and Export Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Field Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Fields to Export</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(selectedFields).map(([field, checked]) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox 
                      id={field}
                      checked={checked}
                      onCheckedChange={(checked) => 
                        setSelectedFields({...selectedFields, [field]: checked as boolean})
                      }
                    />
                    <label htmlFor={field} className="text-sm font-medium capitalize">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => handleExport('csv')}
                  disabled={isExporting}
                  className="flex items-center justify-center space-x-2 h-24 flex-col bg-green-600 hover:bg-green-700"
                >
                  <FileText className="w-8 h-8" />
                  <span>Export as CSV</span>
                </Button>

                <Button 
                  onClick={() => handleExport('excel')}
                  disabled={isExporting}
                  variant="outline"
                  className="flex items-center justify-center space-x-2 h-24 flex-col"
                >
                  <FileText className="w-8 h-8" />
                  <span>Export as Excel</span>
                </Button>

                <Button 
                  onClick={() => handleExport('json')}
                  disabled={isExporting}
                  variant="outline"
                  className="flex items-center justify-center space-x-2 h-24 flex-col"
                >
                  <FileText className="w-8 h-8" />
                  <span>Export as JSON</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleExport('xml')}
                  disabled={isExporting}
                  variant="outline"
                  className="flex items-center justify-center space-x-2 h-16"
                >
                  <FileText className="w-6 h-6" />
                  <span>Export as XML</span>
                </Button>

                <Button 
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting}
                  variant="outline"
                  className="flex items-center justify-center space-x-2 h-16"
                >
                  <FileText className="w-6 h-6" />
                  <span>Export as PDF Report</span>
                </Button>
              </div>

              {isExporting && (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-blue-600">Preparing your export...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Exports */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Exports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Questions_Export_2024-01-15.csv', date: '2024-01-15 14:30', size: '2.3 MB' },
                  { name: 'Media_Files_Export_2024-01-14.xlsx', date: '2024-01-14 09:15', size: '15.7 MB' },
                  { name: 'Content_Report_2024-01-13.pdf', date: '2024-01-13 16:45', size: '5.1 MB' }
                ].map((export_, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">{export_.name}</p>
                        <p className="text-xs text-muted-foreground">{export_.date} • {export_.size}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BulkExport;
