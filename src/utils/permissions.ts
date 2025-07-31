
import { UserRole, UserPermissions } from '@/types/content';

export const getRolePermissions = (role: UserRole): UserPermissions => {
  switch (role) {
    case 'SuperAdmin':
      return {
        canAccessPublicRepository: true,
        canAccessPrivateRepository: true,
        canCreateContent: true,
        canEditContent: true,
        canDeleteContent: true,
        canManageUsers: true,
        canViewAuditLogs: true,
        canExportContent: true,
        canImportContent: true,
        canCreateTestPaperFromCSV: true,
        canDigitizeContent: true,
        canManageOCRTemplates: true,
        canUseVisualEditor: true,
      };
    
    case 'Admin':
      return {
        canAccessPublicRepository: true,
        canAccessPrivateRepository: true,
        canCreateContent: true,
        canEditContent: true,
        canDeleteContent: false, // Admin cannot delete questions per PRD
        canManageUsers: true, // Admin can view users
        canViewAuditLogs: true,
        canExportContent: false, // Export limited to Super Admin by default
        canImportContent: true,
        canCreateTestPaperFromCSV: true,
        canDigitizeContent: true,
        canManageOCRTemplates: true,
        canUseVisualEditor: true,
      };
    
    case 'Reviewer':
      return {
        canAccessPublicRepository: true,
        canAccessPrivateRepository: false,
        canCreateContent: false,
        canEditContent: true, // Reviewer can edit during review
        canDeleteContent: false,
        canManageUsers: false,
        canViewAuditLogs: false,
        canExportContent: false,
        canImportContent: false,
        canCreateTestPaperFromCSV: false,
        canDigitizeContent: true,
        canManageOCRTemplates: false,
        canUseVisualEditor: true,
      };
    
    case 'Creator':
      return {
        canAccessPublicRepository: true,
        canAccessPrivateRepository: false,
        canCreateContent: true,
        canEditContent: true,
        canDeleteContent: false, // Creator cannot delete
        canManageUsers: false,
        canViewAuditLogs: false,
        canExportContent: false,
        canImportContent: false,
        canCreateTestPaperFromCSV: true,
        canDigitizeContent: true,
        canManageOCRTemplates: false,
        canUseVisualEditor: true,
      };
    
    case 'Translator':
      return {
        canAccessPublicRepository: true,
        canAccessPrivateRepository: false,
        canCreateContent: false,
        canEditContent: true, // Can edit during translation
        canDeleteContent: false,
        canManageUsers: false,
        canViewAuditLogs: false,
        canExportContent: false,
        canImportContent: false,
        canCreateTestPaperFromCSV: false,
        canDigitizeContent: true,
        canManageOCRTemplates: false,
        canUseVisualEditor: true,
      };
    
    default:
      return {
        canAccessPublicRepository: false,
        canAccessPrivateRepository: false,
        canCreateContent: false,
        canEditContent: false,
        canDeleteContent: false,
        canManageUsers: false,
        canViewAuditLogs: false,
        canExportContent: false,
        canImportContent: false,
        canCreateTestPaperFromCSV: false,
        canDigitizeContent: false,
        canManageOCRTemplates: false,
        canUseVisualEditor: false,
      };
  }
};

export const canAccessRepository = (role: UserRole, repositoryType: 'Public' | 'Private'): boolean => {
  const permissions = getRolePermissions(role);
  
  if (repositoryType === 'Public') {
    return permissions.canAccessPublicRepository;
  } else {
    return permissions.canAccessPrivateRepository;
  }
};

export const canPerformAction = (role: UserRole, action: keyof UserPermissions): boolean => {
  const permissions = getRolePermissions(role);
  return permissions[action];
};
