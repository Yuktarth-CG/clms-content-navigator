
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download, Shield, AlertTriangle } from 'lucide-react';
import { AuditLogEntry } from '@/types/content';
import { auditService } from '@/services/auditService';
import RepositoryBadge from './RepositoryBadge';

const AuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedRepository, setSelectedRepository] = useState('all');

  useEffect(() => {
    setAuditLogs(auditService.getAuditLogs());
  }, []);

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.contentTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = selectedAction === 'all' || log.action === selectedAction;
    const matchesRepository = selectedRepository === 'all' || log.repository === selectedRepository;
    
    return matchesSearch && matchesAction && matchesRepository;
  });

  const securityAlerts = auditService.getSecurityAlerts();

  const actionColors = {
    'create': 'bg-green-100 text-green-800',
    'read': 'bg-blue-100 text-blue-800',
    'update': 'bg-yellow-100 text-yellow-800',
    'delete': 'bg-red-100 text-red-800',
    'import': 'bg-purple-100 text-purple-800',
    'export': 'bg-orange-100 text-orange-800',
    'access_attempt': 'bg-gray-100 text-gray-800',
    'expiry_triggered': 'bg-amber-100 text-amber-800',
    'recycled': 'bg-teal-100 text-teal-800',
    'login': 'bg-indigo-100 text-indigo-800',
    'logout': 'bg-slate-100 text-slate-800'
  };

  const outcomeColors = {
    'success': 'bg-green-100 text-green-800',
    'failure': 'bg-red-100 text-red-800',
    'pending': 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive security and activity monitoring
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export Logs</span>
        </Button>
      </div>

      {/* Security Alerts Summary */}
      {securityAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <span>Security Alerts ({securityAlerts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              {securityAlerts.length} failed access attempt(s) detected. Review the audit logs below for details.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by user, content, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="access_attempt">Access Attempt</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedRepository} onValueChange={setSelectedRepository}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Repository" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Repositories</SelectItem>
                <SelectItem value="Public">Public Repository</SelectItem>
                <SelectItem value="Private">Private Repository</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Activity Log ({filteredLogs.length} entries)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Repository</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{log.userName}</p>
                      <p className="text-xs text-muted-foreground">{log.userRole}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={actionColors[log.action as keyof typeof actionColors]}>
                      {log.action.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.contentTitle ? (
                      <div>
                        <p className="font-medium text-sm">{log.contentTitle}</p>
                        <p className="text-xs text-muted-foreground">{log.contentId}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.repository ? (
                      <RepositoryBadge repository={log.repository} />
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={outcomeColors[log.outcome]}>
                      {log.outcome}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm max-w-xs truncate">
                    {log.details || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No audit logs found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
