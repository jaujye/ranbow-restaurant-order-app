import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from '../components/NotificationItem';
import NotificationFilters from '../components/NotificationFilters';
import { LoadingSpinner } from '../../../shared/components/ui/LoadingSpinner';
import {
  type Notification,
  type NotificationAction,
  type NotificationActionHandler,
  type NotificationDisplayConfig,
  NotificationType,
  NotificationPriority
} from '../types/notifications.types';

export function NotificationsPage() {
  const navigate = useNavigate();
  
  // Get current staff ID from auth context/localStorage
  const staffId = localStorage.getItem('staff_id') || '21426ec6-dae4-4a82-b52a-a24f85434c2b'; // Fallback for testing

  // Use notifications hook
  const {
    notifications,
    unreadCount,
    loading,
    error,
    filters,
    stats,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    updateFilters,
    clearError,
    refresh
  } = useNotifications(staffId);

  // Local state
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Display configuration
  const [displayConfig, setDisplayConfig] = useState<NotificationDisplayConfig>({
    showTimestamp: true,
    showSender: true,
    showPriority: true,
    showType: true,
    compact: false,
    groupByDate: false
  });

  // Handle notification actions
  const handleNotificationAction = useCallback(async (action: NotificationAction, notification: Notification) => {
    try {
      switch (action) {
        case 'view':
          setSelectedNotification(notification);
          break;
          
        case 'markRead':
          if (!notification.isRead) {
            await markAsRead(notification.notificationId);
          }
          break;
          
        case 'markAllRead':
          await markAllAsRead();
          break;
          
        case 'goToOrder':
          if (notification.relatedOrderId) {
            navigate(`/orders/${notification.relatedOrderId}`);
          }
          break;
          
        case 'goToKitchen':
          navigate('/kitchen');
          break;
          
        case 'dismiss':
          // For urgent notifications, mark as read to dismiss
          if (!notification.isRead) {
            await markAsRead(notification.notificationId);
          }
          break;
          
        case 'respond':
          // Handle response action if needed
          console.log('Respond to notification:', notification);
          break;
          
        default:
          console.warn('Unhandled notification action:', action);
      }
    } catch (error) {
      console.error('Error handling notification action:', error);
    }
  }, [markAsRead, markAllAsRead, navigate]);

  // Define action handlers
  const actionHandlers: NotificationActionHandler[] = [
    {
      action: 'markRead',
      handler: (notification) => handleNotificationAction('markRead', notification),
      label: '標記已讀',
      icon: '✓',
      variant: 'primary'
    },
    {
      action: 'goToOrder',
      handler: (notification) => handleNotificationAction('goToOrder', notification),
      label: '查看訂單',
      icon: '📋',
      variant: 'secondary'
    },
    {
      action: 'dismiss',
      handler: (notification) => handleNotificationAction('dismiss', notification),
      label: '忽略',
      icon: '✕',
      variant: 'secondary'
    }
  ];

  // Group notifications by date if enabled
  const groupedNotifications = displayConfig.groupByDate
    ? notifications.reduce((groups, notification) => {
        const date = new Date(notification.sentAt).toDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(notification);
        return groups;
      }, {} as Record<string, Notification[]>)
    : { all: notifications };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await refresh();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(handleRefresh, 30000);
    return () => clearInterval(interval);
  }, [handleRefresh]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">通知中心</h1>
          <p className="mt-1 text-sm text-gray-600">
            {unreadCount > 0 ? `${unreadCount} 則未讀通知` : '所有通知已讀'} · 共 {stats.total} 則通知
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <span className="mr-2">🔄</span>
            重新整理
          </button>

          {/* Mark all read button */}
          {unreadCount > 0 && (
            <button
              onClick={() => handleNotificationAction('markAllRead', {} as Notification)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <span className="mr-2">✓</span>
              全部標記已讀
            </button>
          )}

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
              showFilters 
                ? 'border-blue-300 text-blue-700 bg-blue-50' 
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <span className="mr-2">🔍</span>
            篩選
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">載入通知時發生錯誤</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message}</p>
              </div>
              <div className="mt-4">
                <div className="flex space-x-2">
                  <button
                    onClick={handleRefresh}
                    className="bg-red-100 px-2 py-1 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    重試
                  </button>
                  <button
                    onClick={clearError}
                    className="bg-red-100 px-2 py-1 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    忽略
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters sidebar */}
        <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <NotificationFilters
            filters={filters}
            onFilterChange={updateFilters}
            stats={stats}
          />
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          {/* Display options */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">顯示選項</span>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={displayConfig.compact}
                    onChange={(e) => setDisplayConfig(prev => ({ ...prev, compact: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">緊湊模式</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={displayConfig.groupByDate}
                    onChange={(e) => setDisplayConfig(prev => ({ ...prev, groupByDate: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">依日期分組</span>
                </label>
              </div>
            </div>
          </div>

          {/* Notifications list */}
          <div className="space-y-4">
            {loading && notifications.length === 0 ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">沒有通知</h3>
                <p className="text-gray-500">
                  {filters.isRead === false ? '沒有未讀通知' : '暫無通知訊息'}
                </p>
              </div>
            ) : displayConfig.groupByDate ? (
              // Grouped by date
              Object.entries(groupedNotifications).map(([date, notifications]) => (
                <div key={date}>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 sticky top-0 bg-gray-50 py-2 rounded">
                    {date === new Date().toDateString() ? '今天' :
                     date === new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString() ? '昨天' :
                     new Date(date).toLocaleDateString('zh-TW')}
                  </h3>
                  <div className="space-y-3">
                    {notifications.map(notification => (
                      <NotificationItem
                        key={notification.notificationId}
                        notification={notification}
                        config={displayConfig}
                        actions={actionHandlers}
                        onAction={handleNotificationAction}
                        selected={selectedNotification?.notificationId === notification.notificationId}
                        compact={displayConfig.compact}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              // Regular list
              notifications.map(notification => (
                <NotificationItem
                  key={notification.notificationId}
                  notification={notification}
                  config={displayConfig}
                  actions={actionHandlers}
                  onAction={handleNotificationAction}
                  selected={selectedNotification?.notificationId === notification.notificationId}
                  compact={displayConfig.compact}
                />
              ))
            )}
          </div>

          {/* Load more or pagination could go here */}
          {notifications.length > 0 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                顯示 {notifications.length} 則通知 (共 {stats.total} 則)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;