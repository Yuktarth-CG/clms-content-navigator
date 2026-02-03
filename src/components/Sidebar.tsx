import React, { useState } from 'react';
import { 
  Home, 
  Search, 
  Upload, 
  Download, 
  CheckCircle, 
  Settings, 
  Users,
  FileText,
  BarChart3,
  Shield,
  Clock,
  Layout,
  Edit,
  HelpCircle,
  ClipboardList,
  BookOpen,
  FolderOpen,
  Bug,
  Brain,
  Lightbulb,
  Database,
  CreditCard
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  const { user, hasPermission } = useUser();

  const menuItems = [
    { 
      id: 'home', 
      label: 'Dashboard', 
      icon: Home, 
      requiresPermission: null,
      tooltip: 'Overview of your content management system with key metrics and recent activity'
    },
    { 
      id: 'question-library', 
      label: 'Content Library', 
      icon: Search, 
      requiresPermission: null,
      tooltip: 'Browse, search, and manage your collection of questions and educational content'
    },
  ];

  // Add assessment creation feature
  if (hasPermission('canCreateContent')) {
    menuItems.push({ 
      id: 'question-paper-creation', 
      label: 'Create Assessments', 
      icon: BookOpen, 
      requiresPermission: 'canCreateContent',
      tooltip: 'Create worksheets using private questions or test papers using public questions'
    });
  }

  // Add manage assessments for Super Admin, Admin, and Creator (right after Create Assessments)
  if (user?.role === 'SuperAdmin' || user?.role === 'Admin' || user?.role === 'Creator') {
    menuItems.push({ 
      id: 'manage-assessments', 
      label: 'Manage Assessments', 
      icon: FolderOpen, 
      requiresPermission: null,
      tooltip: 'View, download, and manage generated assessments with filtering and search capabilities'
    });
  }

  // Add import/export based on permissions
  if (hasPermission('canImportContent')) {
    menuItems.push({ 
      id: 'bulk-import', 
      label: 'Bulk Import', 
      icon: Upload, 
      requiresPermission: 'canImportContent',
      tooltip: 'Upload multiple questions and content files at once using CSV or other formats'
    });
  }

  if (hasPermission('canExportContent')) {
    menuItems.push({ 
      id: 'bulk-export', 
      label: 'Bulk Export', 
      icon: Download, 
      requiresPermission: 'canExportContent',
      tooltip: 'Download your content library in various formats for backup or external use'
    });
  }

  // Add content validation for Reviewers and above
  if (user?.role === 'Reviewer' || user?.role === 'Admin' || user?.role === 'SuperAdmin') {
    menuItems.push({ 
      id: 'content-validation', 
      label: 'Content Validation', 
      icon: CheckCircle, 
      requiresPermission: null,
      tooltip: 'Review and approve content submissions, ensuring quality and accuracy standards'
    });
  }

  // Add content lifecycle management for users with private repository access
  if (hasPermission('canAccessPrivateRepository') || user?.role === 'SuperAdmin') {
    menuItems.push({ 
      id: 'content-lifecycle', 
      label: 'Content Lifecycle', 
      icon: Clock, 
      requiresPermission: null,
      tooltip: 'Manage content stages from creation to retirement, including versioning and updates'
    });
  }


  // Add reports for admins and above
  if (hasPermission('canViewAuditLogs')) {
    menuItems.push({ 
      id: 'reports', 
      label: 'Reports & Analytics', 
      icon: BarChart3, 
      requiresPermission: 'canViewAuditLogs',
      tooltip: 'View detailed analytics on content usage, user activity, and system performance'
    });
  }

  // Add user management for SuperAdmins only
  if (hasPermission('canManageUsers')) {
    menuItems.push({ 
      id: 'user-management', 
      label: 'User Management', 
      icon: Users, 
      requiresPermission: 'canManageUsers',
      tooltip: 'Add, edit, and manage user accounts, roles, and permissions across the system'
    });
  }

  // Add audit logs for those with permission
  if (hasPermission('canViewAuditLogs')) {
    menuItems.push({ 
      id: 'audit-logs', 
      label: 'Audit Logs', 
      icon: Shield, 
      requiresPermission: 'canViewAuditLogs',
      tooltip: 'Track all system activities and changes for security and compliance monitoring'
    });
  }

  // Add Master Data Management for admins and above
  if (user?.role === 'Admin' || user?.role === 'SuperAdmin') {
    menuItems.push({ 
      id: 'master-data', 
      label: 'Master Data', 
      icon: Database, 
      requiresPermission: null,
      tooltip: 'Manage curriculum framework and content taxonomy with flexible data management tools'
    });
  }

  // Add AI Credits Dashboard for admins and above
  if (user?.role === 'Admin' || user?.role === 'SuperAdmin') {
    menuItems.push({ 
      id: 'ai-credits', 
      label: 'AI Credits', 
      icon: CreditCard, 
      requiresPermission: null,
      tooltip: 'Monitor AI credit usage, consumption trends, and request additional credits'
    });
  }

  // Always show settings
  menuItems.push({ 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings, 
    requiresPermission: null,
    tooltip: 'Configure your personal preferences and system settings'
  });

  // Add Debug Center
  menuItems.push({ 
    id: 'debug-center', 
    label: 'Debug Center', 
    icon: Brain, 
    requiresPermission: null,
    tooltip: 'Track AI requests, analyze failures, and improve system performance'
  });

  // OCR Tools section items
  const ocrToolItems = [];
  
  if (hasPermission('canCreateTestPaperFromCSV')) {
    ocrToolItems.push({
      id: 'ocr-test-paper',
      label: 'Test Paper Generation',
      icon: FileText,
      tooltip: 'Create test papers from CSV files or existing CLMS content using templates'
    });
  }
  
  if (hasPermission('canCreateTestPaperFromCSV')) {
    ocrToolItems.push({
      id: 'ocr-test-paper-management',
      label: 'Test Paper Management',
      icon: ClipboardList,
      tooltip: 'View, download, and manage test papers generated through OCR tools'
    });
  }

  if (hasPermission('canManageOCRTemplates')) {
    ocrToolItems.push({
      id: 'ocr-templates',
      label: 'Template Management',
      icon: Layout,
      tooltip: 'Manage templates for CSV formats and paper layouts'
    });
  }

  return (
    <TooltipProvider>
      <div className="w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white min-h-screen shadow-lg flex flex-col">
        <div className="p-6 border-b border-blue-500">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-xl font-bold">CLMS</h1>
          </div>
          <p className="text-blue-200 text-sm mt-1">Content & Learning Management</p>
        </div>
        
        {/* User Info */}
        <div className="p-4 border-b border-blue-500">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium">{user?.name.charAt(0) || 'U'}</span>
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name || 'User'}</p>
              <p className="text-xs text-blue-200">{user?.role || 'Unknown Role'}</p>
            </div>
          </div>
        </div>
        
        <nav className="mt-6 flex-1 overflow-y-auto">
          {/* Main menu items */}
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex items-center">
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-blue-700 transition-colors ${
                    activeSection === item.id ? 'bg-blue-700 border-r-4 border-white' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                </button>
                <div className="pr-3">
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-blue-300 hover:text-white transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="text-sm">{item.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            );
          })}

          {/* OCR Tools Section */}
          {ocrToolItems.length > 0 && (
            <>
              <div className="px-6 py-3 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="text-xs text-blue-300 font-medium">OCR TOOLS</div>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-3 h-3 text-blue-300 hover:text-white transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="text-sm">
                        OCR tools help you create test papers automatically from CSV data or existing CLMS content using predefined templates.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {ocrToolItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="flex items-center">
                    <button
                      onClick={() => onSectionChange(item.id)}
                      className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-blue-700 transition-colors ${
                        activeSection === item.id ? 'bg-blue-700 border-r-4 border-white' : ''
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="flex-1">{item.label}</span>
                    </button>
                    <div className="pr-3">
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-blue-300 hover:text-white transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="text-sm">{item.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </nav>
      </div>
    </TooltipProvider>
  );
};

export default Sidebar;
