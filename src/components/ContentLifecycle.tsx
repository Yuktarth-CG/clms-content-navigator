
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Recycle, CheckCircle, Play } from 'lucide-react';
import { RecyclingJob, ContentNotification } from '@/types/content';
import { lifecycleService } from '@/services/lifecycleService';
import { useUser } from '@/contexts/UserContext';

const ContentLifecycle = () => {
  const { user } = useUser();
  const [recyclingJobs, setRecyclingJobs] = useState<RecyclingJob[]>([]);
  const [notifications, setNotifications] = useState<ContentNotification[]>([]);

  useEffect(() => {
    setRecyclingJobs(lifecycleService.getRecyclingJobs());
    if (user) {
      setNotifications(lifecycleService.getNotifications(user.id));
    }
  }, [user]);

  const handleRecycleContent = (contentId: string, contentTitle: string) => {
    if (user) {
      const job = lifecycleService.initiateRecycling(contentId, contentTitle, user.id);
      setRecyclingJobs([job, ...recyclingJobs]);
    }
  };

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'processing': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'failed': 'bg-red-100 text-red-800'
  };

  const priorityColors = {
    'low': 'bg-gray-100 text-gray-800',
    'medium': 'bg-blue-100 text-blue-800',
    'high': 'bg-orange-100 text-orange-800',
    'critical': 'bg-red-100 text-red-800'
  };

  const unreadNotifications = notifications.filter(n => !n.readAt);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Content Lifecycle Management</h1>
        <p className="text-muted-foreground mt-1">
          Monitor content recycling workflows and lifecycle notifications
        </p>
      </div>

      {/* Recycling Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Recycle className="w-5 h-5" />
            <span>Content Recycling Jobs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Initiated</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>IRT System ID</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recyclingJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{job.contentTitle}</p>
                      <p className="text-xs text-muted-foreground">{job.contentId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[job.status]}>
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <p>{new Date(job.initiatedAt).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">by {job.initiatedBy}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {job.completedAt ? (
                      new Date(job.completedAt).toLocaleDateString()
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {job.irtSystemId ? (
                      <code className="text-xs bg-muted px-2 py-1 rounded">{job.irtSystemId}</code>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {job.status === 'pending' && (
                      <Button size="sm" variant="outline">
                        <Play className="w-3 h-3 mr-1" />
                        Start
                      </Button>
                    )}
                    {job.status === 'completed' && (
                      <Button size="sm" variant="ghost">
                        View Details
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {recyclingJobs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Recycle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recycling jobs found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>System Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded border ${
                  notification.readAt ? 'bg-muted/30' : 'bg-background'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={priorityColors[notification.priority]}>
                        {notification.priority}
                      </Badge>
                      <span className="font-medium">{notification.contentTitle}</span>
                      {notification.readAt && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.readAt && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        lifecycleService.markNotificationAsRead(notification.id);
                        setNotifications(notifications.map(n => 
                          n.id === notification.id 
                            ? { ...n, readAt: new Date().toISOString() }
                            : n
                        ));
                      }}
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {notifications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No notifications found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentLifecycle;
