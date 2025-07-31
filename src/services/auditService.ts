
import { AuditLogEntry, UserRole, RepositoryType } from '@/types/content';

class AuditService {
  private logs: AuditLogEntry[] = [];

  // Mock data for demonstration
  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockLogs: AuditLogEntry[] = [
      {
        id: 'audit-001',
        userId: 'user-001',
        userName: 'Sarah Johnson',
        userRole: 'SuperAdmin',
        action: 'create',
        contentId: 'Q001',
        contentTitle: 'Basic Algebra Question',
        repository: 'Public',
        timestamp: '2024-06-24T10:30:00Z',
        outcome: 'success',
        details: 'Created new algebra question',
        ipAddress: '192.168.1.100'
      },
      {
        id: 'audit-002',
        userId: 'user-002',
        userName: 'Admin User',
        userRole: 'Admin',
        action: 'create',
        contentId: 'Q003',
        contentTitle: 'Board Exam Question - Calculus',
        repository: 'Private',
        timestamp: '2024-06-24T09:15:00Z',
        outcome: 'success',
        details: 'Uploaded private assessment content',
        ipAddress: '10.0.0.50'
      },
      {
        id: 'audit-003',
        userId: 'user-003',
        userName: 'John Doe',
        userRole: 'Creator',
        action: 'access_attempt',
        contentId: 'Q003',
        repository: 'Private',
        timestamp: '2024-06-24T11:45:00Z',
        outcome: 'failure',
        details: 'Unauthorized access attempt to private content',
        ipAddress: '192.168.1.105'
      }
    ];

    this.logs = mockLogs;
  }

  logAction(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    this.logs.unshift(newEntry);
    console.log('Audit log entry created:', newEntry);
  }

  getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    repository?: RepositoryType;
    startDate?: string;
    endDate?: string;
  }): AuditLogEntry[] {
    let filteredLogs = [...this.logs];

    if (filters) {
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => log.action === filters.action);
      }
      if (filters.repository) {
        filteredLogs = filteredLogs.filter(log => log.repository === filters.repository);
      }
      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
      }
    }

    return filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getSecurityAlerts(): AuditLogEntry[] {
    return this.logs.filter(log => 
      log.outcome === 'failure' && 
      (log.action === 'access_attempt' || log.action === 'login')
    );
  }
}

export const auditService = new AuditService();
