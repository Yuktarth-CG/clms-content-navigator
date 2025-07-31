
import { Question, RecyclingJob, ContentNotification } from '@/types/content';

class ContentLifecycleService {
  private recyclingJobs: RecyclingJob[] = [];
  private notifications: ContentNotification[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock recycling job
    this.recyclingJobs = [
      {
        id: 'recycle-001',
        contentId: 'Q005',
        contentTitle: 'Recycled Physics Question',
        status: 'completed',
        initiatedBy: 'system',
        initiatedAt: '2024-06-20T00:00:00Z',
        completedAt: '2024-06-20T00:05:00Z',
        irtSystemId: 'IRT-2024-001',
        transformationLog: [
          'Stripped sensitive metadata',
          'Anonymized question identifiers',
          'Converted to IRT format',
          'Transferred to IRT system'
        ]
      }
    ];

    // Mock notifications
    this.notifications = [
      {
        id: 'notif-001',
        type: 'recycling_complete',
        contentId: 'Q005',
        contentTitle: 'Physics Question',
        repository: 'Private',
        message: 'Question has been successfully recycled to IRT system',
        createdAt: '2024-06-24T09:00:00Z',
        userId: 'user-001',
        priority: 'medium'
      }
    ];
  }

  initiateRecycling(contentId: string, contentTitle: string, userId: string): RecyclingJob {
    const recyclingJob: RecyclingJob = {
      id: `recycle-${Date.now()}`,
      contentId,
      contentTitle,
      status: 'pending',
      initiatedBy: userId,
      initiatedAt: new Date().toISOString(),
      transformationLog: ['Recycling job initiated']
    };

    this.recyclingJobs.unshift(recyclingJob);
    return recyclingJob;
  }

  getRecyclingJobs(): RecyclingJob[] {
    return [...this.recyclingJobs];
  }

  getNotifications(userId: string): ContentNotification[] {
    return this.notifications.filter(n => n.userId === userId || n.userId === 'system');
  }

  markNotificationAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.readAt = new Date().toISOString();
    }
  }
}

export const lifecycleService = new ContentLifecycleService();
