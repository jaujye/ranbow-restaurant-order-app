import { useState, useEffect, useCallback } from 'react';
import {
  NotificationData,
  NotificationFilters,
  NotificationSettings,
  NotificationStats,
  NotificationError,
  NotificationType,
  NotificationPriority
} from '../types/notifications.types';
import { NotificationsApiService } from '../services/notificationsApi';

// Default settings
const DEFAULT_SETTINGS: NotificationSettings = {
  enableSound: true,
  enableDesktopNotifications: true,
  enableVibration: true,
  soundVolume: 0.7,
  autoMarkReadOnView: false,
  showOnlyUnread: false,
  refreshInterval: 30 // 30 seconds
};

// Default filters
const DEFAULT_FILTERS: NotificationFilters = {
  type: 'ALL',
  priority: 'ALL',
  isRead: 'ALL'
};

export function useNotifications(staffId: string) {
  // State
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<NotificationError | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [filters, setFilters] = useState<NotificationFilters>(DEFAULT_FILTERS);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    byType: {} as Record<NotificationType, number>,
    byPriority: {} as Record<NotificationPriority, number>,
    recentCount: 0
  });

  // Calculate stats from notifications
  const calculateStats = useCallback((notifications: NotificationData[]): NotificationStats => {
    const stats: NotificationStats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      byType: {} as Record<NotificationType, number>,
      byPriority: {} as Record<NotificationPriority, number>,
      recentCount: 0
    };

    // Count by type and priority
    Object.values(NotificationType).forEach(type => {
      stats.byType[type] = notifications.filter(n => n.type === type).length;
    });

    Object.values(NotificationPriority).forEach(priority => {
      stats.byPriority[priority] = notifications.filter(n => n.priority === priority).length;
    });

    // Count recent notifications (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    stats.recentCount = notifications.filter(n => 
      new Date(n.sentAt) >= twentyFourHoursAgo
    ).length;

    return stats;
  }, []);

  // Filter notifications based on current filters
  const getFilteredNotifications = useCallback((notifications: NotificationData[]): NotificationData[] => {
    return notifications.filter(notification => {
      // Type filter
      if (filters.type && filters.type !== 'ALL' && notification.type !== filters.type) {
        return false;
      }

      // Priority filter
      if (filters.priority && filters.priority !== 'ALL' && notification.priority !== filters.priority) {
        return false;
      }

      // Read status filter
      if (filters.isRead !== 'ALL') {
        if (filters.isRead === true && notification.isRead === false) return false;
        if (filters.isRead === false && notification.isRead === true) return false;
      }

      // Time range filter
      if (filters.timeRange) {
        const sentTime = new Date(notification.sentAt);
        if (sentTime < filters.timeRange.start || sentTime > filters.timeRange.end) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  // Fetch notifications
  const fetchNotifications = useCallback(async (showLoading = true) => {
    if (!staffId) return;

    try {
      if (showLoading) setLoading(true);
      setError(null);

      const response = await NotificationsApiService.getNotifications(staffId);
      
      // Sort notifications by sent time (newest first)
      const sortedNotifications = response.notifications.sort((a, b) => 
        new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      );

      setNotifications(sortedNotifications);
      setUnreadCount(response.unreadCount);
      setStats(calculateStats(sortedNotifications));

    } catch (error) {
      const notificationError: NotificationError = {
        code: 'FETCH_FAILED',
        message: error instanceof Error ? error.message : 'Failed to fetch notifications',
        recoverable: true
      };
      setError(notificationError);
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [staffId, calculateStats]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!staffId) return;

    try {
      await NotificationsApiService.markNotificationAsRead(staffId, notificationId);
      
      // Update local state
      setNotifications(prev => prev.map(notification =>
        notification.notificationId === notificationId
          ? { ...notification, isRead: true, readAt: new Date().toISOString() }
          : notification
      ));

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));

    } catch (error) {
      const notificationError: NotificationError = {
        code: 'MARK_READ_FAILED',
        message: error instanceof Error ? error.message : 'Failed to mark notification as read',
        recoverable: true
      };
      setError(notificationError);
      console.error('Error marking notification as read:', error);
    }
  }, [staffId]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!staffId) return;

    try {
      const response = await NotificationsApiService.markAllNotificationsAsRead(staffId);
      
      if (response.success) {
        // Update local state - mark all as read
        setNotifications(prev => prev.map(notification => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString()
        })));

        setUnreadCount(0);
      }

    } catch (error) {
      const notificationError: NotificationError = {
        code: 'MARK_ALL_READ_FAILED',
        message: error instanceof Error ? error.message : 'Failed to mark all notifications as read',
        recoverable: true
      };
      setError(notificationError);
      console.error('Error marking all notifications as read:', error);
    }
  }, [staffId]);

  // Get unread notifications only
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !(n.isRead || n.read));
  }, [notifications]);

  // Get urgent notifications
  const getUrgentNotifications = useCallback(() => {
    return notifications.filter(n => 
      n.priority === NotificationPriority.URGENT || 
      n.priority === NotificationPriority.EMERGENCY ||
      n.urgent
    );
  }, [notifications]);

  // Get recent notifications (last 24 hours)
  const getRecentNotifications = useCallback(() => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return notifications.filter(n => new Date(n.sentAt) >= twentyFourHoursAgo);
  }, [notifications]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    // Save to localStorage
    const updatedSettings = { ...settings, ...newSettings };
    localStorage.setItem(`notifications_settings_${staffId}`, JSON.stringify(updatedSettings));
  }, [settings, staffId]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<NotificationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh notifications (alias for fetchNotifications without loading)
  const refresh = useCallback(() => {
    return fetchNotifications(false);
  }, [fetchNotifications]);

  // Play notification sound
  const playNotificationSound = useCallback((notification: NotificationData) => {
    if (!settings.enableSound) return;

    try {
      let soundFile = 'notification.mp3';
      
      // Choose sound based on notification type
      switch (notification.type) {
        case NotificationType.NEW_ORDER:
          soundFile = 'new-order.mp3';
          break;
        case NotificationType.ORDER_OVERDUE:
        case NotificationType.EMERGENCY:
          soundFile = 'urgent-alert.mp3';
          break;
        case NotificationType.ORDER_STATUS_CHANGE:
          soundFile = 'order-ready.mp3';
          break;
        default:
          soundFile = 'notification.mp3';
      }

      const audio = new Audio(`/sounds/${soundFile}`);
      audio.volume = settings.soundVolume;
      audio.play().catch(error => {
        console.warn('無法播放通知音效:', error);
      });
    } catch (error) {
      console.warn('播放通知音效失敗:', error);
    }
  }, [settings.enableSound, settings.soundVolume]);

  // Trigger vibration
  const triggerVibration = useCallback((notification: NotificationData) => {
    if (!settings.enableVibration || !('vibrate' in navigator)) return;

    let pattern = [100]; // Default short vibration

    // Different patterns for different priorities
    switch (notification.priority) {
      case NotificationPriority.URGENT:
      case NotificationPriority.EMERGENCY:
        pattern = [200, 100, 200, 100, 200]; // Long pattern for urgent/emergency
        break;
      case NotificationPriority.HIGH:
        pattern = [100, 50, 100]; // Medium pattern for high
        break;
      default:
        pattern = [100]; // Short vibration for normal/low
    }

    navigator.vibrate(pattern);
  }, [settings.enableVibration]);

  // Show desktop notification
  const showDesktopNotification = useCallback(async (notification: NotificationData) => {
    if (!settings.enableDesktopNotifications) return;

    try {
      // Request permission if not granted
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;
      }

      if (Notification.permission === 'granted') {
        const desktopNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.notificationId, // Prevent duplicates
          requireInteraction: notification.priority === NotificationPriority.URGENT || 
                             notification.priority === NotificationPriority.EMERGENCY
        });

        // Auto-close after 5 seconds (except urgent/emergency notifications)
        if (notification.priority !== NotificationPriority.URGENT && 
            notification.priority !== NotificationPriority.EMERGENCY) {
          setTimeout(() => desktopNotification.close(), 5000);
        }

        // Handle click
        desktopNotification.onclick = () => {
          window.focus();
          markAsRead(notification.notificationId);
          desktopNotification.close();
        };
      }
    } catch (error) {
      console.warn('無法顯示桌面通知:', error);
    }
  }, [settings.enableDesktopNotifications, markAsRead]);

  // Process new notification (with sound, vibration, desktop notification)
  const processNewNotification = useCallback((notification: NotificationData) => {
    // Add to notifications list
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setStats(prev => calculateStats([notification, ...notifications]));

    // Play sound
    playNotificationSound(notification);

    // Trigger vibration
    triggerVibration(notification);

    // Show desktop notification
    showDesktopNotification(notification);

  }, [notifications, calculateStats, playNotificationSound, triggerVibration, showDesktopNotification]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(`notifications_settings_${staffId}`);
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      } catch (error) {
        console.warn('無法載入通知設定:', error);
      }
    }
  }, [staffId]);

  // Initial fetch on mount and staffId change
  useEffect(() => {
    if (staffId) {
      fetchNotifications();
    }
  }, [staffId, fetchNotifications]);

  // Auto-refresh based on settings
  useEffect(() => {
    if (!settings.refreshInterval || settings.refreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      refresh();
    }, settings.refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [settings.refreshInterval, refresh]);

  // Return hook interface
  return {
    // Data
    notifications: getFilteredNotifications(notifications),
    allNotifications: notifications,
    unreadCount,
    loading,
    error,
    settings,
    filters,
    stats,

    // Filtered data
    unreadNotifications: getUnreadNotifications(),
    urgentNotifications: getUrgentNotifications(),
    recentNotifications: getRecentNotifications(),

    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    updateSettings,
    updateFilters,
    clearError,
    refresh,
    processNewNotification,

    // Utility functions
    playNotificationSound,
    triggerVibration,
    showDesktopNotification
  };
}

export default useNotifications;