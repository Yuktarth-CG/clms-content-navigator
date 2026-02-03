import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import QuestionLibrary from '@/components/QuestionLibrary';
import BulkUserUpload from '@/components/BulkUserUpload';
import BulkExport from '@/components/BulkExport';
import ContentValidation from '@/components/ContentValidation';
import AuditLogs from '@/components/AuditLogs';
import ContentLifecycle from '@/components/ContentLifecycle';
import UserManagement from '@/components/UserManagement';
import OCRTestPaperCreation from '@/components/OCRTestPaperCreation';
import OCRTestPaperManagement from '@/components/OCRTestPaperManagement';
import OCRWorksheetCreation from '@/components/OCRWorksheetCreation';
import OCRTemplateManagement from '@/components/OCRTemplateManagement';
import ContentTagging from '@/components/ContentTagging';
import PrintManager from '@/components/PrintManager';
import QuestionPaperCreation from '@/components/QuestionPaperCreation';
import ManageAssessments from '@/components/ManageAssessments';
import Settings from '@/components/Settings';
import DebugCenter from '@/components/DebugCenter';
import MasterDataManagement from '@/components/MasterDataManagement';
import AICreditDashboard from '@/components/AICreditDashboard';
import TermsConsentOverlay from '@/components/TermsConsentOverlay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, FileText, Upload, Download, CheckCircle, TrendingUp, Clock, Shield, Layout } from 'lucide-react';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { useTermsConsent } from '@/hooks/useTermsConsent';

const IndexContent = () => {
  const [activeSection, setActiveSection] = useState('question-library');
  const { user } = useUser();
  const { needsConsent, isLoading, acceptTerms } = useTermsConsent();
  
  console.log('IndexContent rendering, user:', user, 'activeSection:', activeSection);

  const renderContent = () => {
    console.log('renderContent called with activeSection:', activeSection);
    
    try {
      switch (activeSection) {
        case 'home':
          return <Dashboard />;
        case 'question-library':
          return <QuestionLibrary />;
        case 'question-paper-creation':
          return <QuestionPaperCreation />;
        case 'bulk-import':
          return <BulkUserUpload onClose={() => setActiveSection('question-library')} />;
        case 'bulk-export':
          return <BulkExport />;
        case 'ocr-test-paper':
          return <OCRTestPaperCreation />;
        case 'ocr-test-paper-management':
          return <OCRTestPaperManagement />;
        case 'ocr-worksheet':
          return <OCRWorksheetCreation />;
        case 'ocr-templates':
          return <OCRTemplateManagement />;
        case 'content-tagging':
          return <ContentTagging />;
        case 'print-manager':
          return <PrintManager />;
        case 'content-validation':
          return <ContentValidation />;
        case 'content-lifecycle':
          return <ContentLifecycle />;
        case 'reports':
          return <Reports />;
        case 'user-management':
          return <UserManagement />;
        case 'manage-assessments':
          return <ManageAssessments />;
        case 'audit-logs':
          return <AuditLogs />;
        case 'settings':
          return <Settings />;
        case 'debug-center':
          return <DebugCenter />;
        case 'master-data':
          return <MasterDataManagement />;
        case 'ai-credits':
          return <AICreditDashboard />;
        default:
          return <QuestionLibrary />;
      }
    } catch (error) {
      console.error('Error rendering content:', error);
      return (
        <div className="p-6">
          <div className="bg-destructive/10 border border-destructive text-destructive rounded p-4">
            <h2 className="font-bold">Rendering Error</h2>
            <p>There was an error rendering the {activeSection} component.</p>
            <p className="text-sm mt-2">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </div>
      );
    }
  };

  console.log('About to render IndexContent layout');

  // Show loading state while checking consent
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* T&C Consent Overlay - blocks access until accepted */}
      {needsConsent && <TermsConsentOverlay onAccept={acceptTerms} />}
      
      <div className="min-h-screen bg-background flex">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
        />
        <div className="flex-1 flex flex-col">
          <Header userRole={user?.role || 'Unknown'} userName={user?.name || 'Unknown User'} />
          <main className="flex-1 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </>
  );
};

const Index = () => {
  console.log('Index component rendering');
  
  return (
    <UserProvider>
      <IndexContent />
    </UserProvider>
  );
};

const Dashboard = () => {
  const { user } = useUser();
  
  const stats = [
    { title: 'Total Questions', value: '12,459', icon: FileText, color: 'text-blue-600' },
    { title: 'Published Content', value: '8,932', icon: CheckCircle, color: 'text-green-600' },
    { title: 'Pending Review', value: '234', icon: Upload, color: 'text-yellow-600' },
    { title: 'Expiring Soon', value: '7', icon: Clock, color: 'text-orange-600' }
  ];

  // Add OCR metrics for users with OCR permissions
  if (user?.permissions.canCreateTestPaperFromCSV) {
    stats.push({ title: 'Test Papers Created', value: '89', icon: Layout, color: 'text-purple-600' });
  }

  // Add security metrics for SuperAdmins
  if (user?.role === 'SuperAdmin') {
    stats.push({ title: 'Security Alerts', value: '3', icon: Shield, color: 'text-red-600' });
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          {user?.role === 'Admin' 
            ? 'Monitor your private assessment content and security status'
            : 'Overview of your content management system'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'Test paper generated', details: 'Mathematics Grade 10 - 50 questions from CSV', time: '30 min ago', priority: 'normal' },
                { action: 'Content tagged', details: 'Physics questions tagged with State Exam template', time: '1 hour ago', priority: 'normal' },
                { action: 'Content expiry warning', details: 'Board Exam Question - Calculus expires in 7 days', time: '2 hours ago', priority: 'high' },
                { action: 'Bulk import completed', details: '156 questions imported successfully', time: '3 hours ago', priority: 'normal' },
                { action: 'Security alert', details: 'Failed access attempt to private content', time: '4 hours ago', priority: 'critical' }
              ].map((activity, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{activity.action}</p>
                      {activity.priority === 'high' && (
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      )}
                      {activity.priority === 'critical' && (
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg text-center hover:bg-muted/50 cursor-pointer transition-colors">
                <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium">Bulk Import</p>
              </div>
              <div className="p-4 border rounded-lg text-center hover:bg-muted/50 cursor-pointer transition-colors">
                <Download className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium">Export Data</p>
              </div>
              <div className="p-4 border rounded-lg text-center hover:bg-muted/50 cursor-pointer transition-colors">
                <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium">Test Paper</p>
              </div>
              <div className="p-4 border rounded-lg text-center hover:bg-muted/50 cursor-pointer transition-colors">
                <Layout className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <p className="font-medium">Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Reports = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-foreground mb-4">Reports & Analytics</h1>
    <Card>
      <CardContent className="p-12 text-center">
        <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">Reports Coming Soon</h3>
        <p className="text-muted-foreground">Detailed analytics and reporting features will be available here.</p>
      </CardContent>
    </Card>
  </div>
);

// Settings component moved to separate file

export default Index;
