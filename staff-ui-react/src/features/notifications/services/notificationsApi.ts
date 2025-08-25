import axios from 'axios';
import {
  NotificationType,
  NotificationPriority,
  type Notification,
  type GetNotificationsRequest,
  type NotificationsListResponse,
  type MarkReadRequest,
  type MarkReadResponse
} from '../types/notifications.types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
const API_ENDPOINTS = {
  notifications: (staffId: string) => `${API_BASE_URL}/staff/notifications/${staffId}`,
  markRead: (staffId: string) => `${API_BASE_URL}/staff/notifications/${staffId}/mark-read`,
};

// Create axios instance with interceptors
const createApiClient = () => {
  const client = axios.create({
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Request interceptor for authentication
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('staff_auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('staff_auth_token');
        window.location.href = '/staff/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

const apiClient = createApiClient();

// Notifications API Service Class
export class NotificationsApiService {
  // Get notifications for a staff member
  static async getNotifications(
    staffId: string, 
    request: GetNotificationsRequest = {}
  ): Promise<NotificationsListResponse> {
    try {
      const params = new URLSearchParams();
      if (request.unreadOnly) {
        params.append('unreadOnly', 'true');
      }
      if (request.limit) {
        params.append('limit', request.limit.toString());
      }
      if (request.offset) {
        params.append('offset', request.offset.toString());
      }

      const url = `${API_ENDPOINTS.notifications(staffId)}${params.toString() ? '?' + params.toString() : ''}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error(
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Failed to fetch notifications'
      );
    }
  }

  // Get only unread notifications
  static async getUnreadNotifications(staffId: string): Promise<Notification[]> {
    try {
      const response = await this.getNotifications(staffId, { unreadOnly: true });
      return response.notifications;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw new Error('Failed to fetch unread notifications');
    }
  }

  // Get notification count
  static async getNotificationCounts(staffId: string): Promise<{ unread: number; total: number }> {
    try {
      const response = await this.getNotifications(staffId);
      return {
        unread: response.unreadCount,
        total: response.totalCount
      };
    } catch (error) {
      console.error('Error fetching notification counts:', error);
      return { unread: 0, total: 0 };
    }
  }

  // Mark single notification as read
  static async markNotificationAsRead(
    staffId: string, 
    notificationId: string
  ): Promise<MarkReadResponse> {
    try {
      const request: MarkReadRequest = { notificationId };
      const response = await apiClient.post(API_ENDPOINTS.markRead(staffId), request);
      return response.data;
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      throw new Error(
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Failed to mark notification as read'
      );
    }
  }

  // Mark all notifications as read
  static async markAllNotificationsAsRead(staffId: string): Promise<MarkReadResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.markRead(staffId));
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  // Get notifications by type
  static async getNotificationsByType(
    staffId: string, 
    type: NotificationType
  ): Promise<Notification[]> {
    try {
      const response = await this.getNotifications(staffId);
      return response.notifications.filter(notification => notification.type === type);
    } catch (error) {
      console.error(`Error fetching notifications of type ${type}:`, error);
      throw new Error(`Failed to fetch ${type} notifications`);
    }
  }

  // Get notifications by priority
  static async getNotificationsByPriority(
    staffId: string, 
    priority: NotificationPriority
  ): Promise<Notification[]> {
    try {
      const response = await this.getNotifications(staffId);
      return response.notifications.filter(notification => notification.priority === priority);
    } catch (error) {
      console.error(`Error fetching notifications with priority ${priority}:`, error);
      throw new Error(`Failed to fetch ${priority} priority notifications`);
    }
  }

  // Get urgent notifications only
  static async getUrgentNotifications(staffId: string): Promise<Notification[]> {
    try {
      return await this.getNotificationsByPriority(staffId, NotificationPriority.URGENT);
    } catch (error) {
      console.error('Error fetching urgent notifications:', error);
      throw new Error('Failed to fetch urgent notifications');
    }
  }

  // Get recent notifications (within specified hours)
  static async getRecentNotifications(
    staffId: string, 
    hoursBack: number = 24
  ): Promise<Notification[]> {
    try {
      const response = await this.getNotifications(staffId);
      const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
      
      return response.notifications.filter(notification => {
        const sentTime = new Date(notification.sentAt);
        return sentTime >= cutoffTime;
      });
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
      throw new Error('Failed to fetch recent notifications');
    }
  }

  // Get notifications related to specific order
  static async getOrderNotifications(
    staffId: string, 
    orderId: string
  ): Promise<Notification[]> {
    try {
      const response = await this.getNotifications(staffId);
      return response.notifications.filter(
        notification => notification.relatedOrderId === orderId
      );
    } catch (error) {
      console.error(`Error fetching notifications for order ${orderId}:`, error);
      throw new Error('Failed to fetch order notifications');
    }
  }

  // Health check for notifications service
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/health`);
      return response.status === 200;
    } catch (error) {
      console.error('Notifications service health check failed:', error);
      return false;
    }
  }

  // Retry failed request with exponential backoff
  static async retryRequest<T>(
    requestFn: () => Promise<T>, 
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) break;
        
        // Exponential backoff delay
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.warn(`Request attempt ${attempt} failed, retrying in ${delay}ms...`);
      }
    }
    
    throw lastError!;
  }
}

// Default export
export default NotificationsApiService;

// Convenience functions for common operations
export const notificationsApi = {
  // Quick access methods
  getAll: (staffId: string) => NotificationsApiService.getNotifications(staffId),
  getUnread: (staffId: string) => NotificationsApiService.getUnreadNotifications(staffId),
  getCounts: (staffId: string) => NotificationsApiService.getNotificationCounts(staffId),
  
  // Read management
  markRead: (staffId: string, notificationId: string) => 
    NotificationsApiService.markNotificationAsRead(staffId, notificationId),
  markAllRead: (staffId: string) => 
    NotificationsApiService.markAllNotificationsAsRead(staffId),
  
  // Filter methods
  getUrgent: (staffId: string) => NotificationsApiService.getUrgentNotifications(staffId),
  getRecent: (staffId: string, hours?: number) => 
    NotificationsApiService.getRecentNotifications(staffId, hours),
  getForOrder: (staffId: string, orderId: string) => 
    NotificationsApiService.getOrderNotifications(staffId, orderId),
  
  // Type filters
  getNewOrders: (staffId: string) => 
    NotificationsApiService.getNotificationsByType(staffId, NotificationType.NEW_ORDER),
  getKitchenAlerts: (staffId: string) => 
    NotificationsApiService.getNotificationsByType(staffId, NotificationType.KITCHEN_ALERT),
  getSystemMessages: (staffId: string) => 
    NotificationsApiService.getNotificationsByType(staffId, NotificationType.SYSTEM)
};

// Types are imported from notifications.types.ts to avoid circular imports