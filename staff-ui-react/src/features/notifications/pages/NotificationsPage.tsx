import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from '../components/NotificationItem';
import NotificationFilters from '../components/NotificationFilters';
import { LoadingSpinner } from '../../../shared/components/ui/LoadingSpinner';
import {
  NotificationData,
  NotificationAction,
  NotificationActionHandler,
  NotificationDisplayConfig,
  NotificationType,
  NotificationPriority
} from '../types/notifications.types';

export function NotificationsPage() {
  const navigate = useNavigate();

  // Get staff ID from localStorage or use default
  const staffId = localStorage.getItem('staff_id') || '21426ec6-dae4-4a82-b52a-a24f85434c2b';

  // Use notifications hook
  const {
    notifications,
    unreadCount,
    loading,
    error,
    filters,
    stats,
    markAsRead,
    markAllAsRead,
    updateFilters,
    clearError,
    refresh
  } = useNotifications(staffId);

  // Local state
  const [selectedNotification, setSelectedNotification] = useState<NotificationData | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
  const handleNotificationAction = useCallback(async (action: NotificationAction, notification: NotificationData) => {
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
            navigate(`/staff/orders/${notification.relatedOrderId}`);
          }
          break;
          
        case 'goToKitchen':
          navigate('/staff/kitchen');
          break;
          
        case 'dismiss':
          // TODO: Implement dismiss logic
          break;
          
        default:
          console.log('Unhandled action:', action);
      }
    } catch (error) {
      console.error('Error handling notification action:', error);
    }
  }, [markAsRead, markAllAsRead, navigate]);

  // Define action handlers for each notification
  const getActionHandlers = useCallback((notification: NotificationData): NotificationActionHandler[] => {
    const handlers: NotificationActionHandler[] = [];

    // Mark as read action
    if (!(notification.isRead || notification.read)) {
      handlers.push({
        action: 'markRead',
        handler: async (n) => handleNotificationAction('markRead', n),
        label: '標記已讀',
        icon: '✓',
        variant: 'primary'
      });
    }

    // Order related action
    if (notification.relatedOrderId) {
      handlers.push({
        action: 'goToOrder',
        handler: async (n) => handleNotificationAction('goToOrder', n),
        label: '查看訂單',
        icon: '📋',
        variant: 'secondary'
      });
    }

    // Kitchen related notifications
    if (notification.type === NotificationType.KITCHEN_ALERT) {
      handlers.push({
        action: 'goToKitchen',
        handler: async (n) => handleNotificationAction('goToKitchen', n),
        label: '前往廚房',
        icon: '🍳',
        variant: 'secondary'
      });
    }

    return handlers;
  }, [handleNotificationAction]);

  // Group notifications by date if enabled
  const groupedNotifications = displayConfig.groupByDate
    ? notifications.reduce((groups, notification) => {
        const date = new Date(notification.sentAt).toDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(notification);
        return groups;
      }, {} as Record<string, NotificationData[]>)
    : { all: notifications };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await refresh();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  // Auto-refresh on mount
  useEffect(() => {
    handleRefresh();
  }, []);

  // Quick stats 簡化為 inline badge 風格 - 以訂單頁面為模板
  const urgentCount = stats.byPriority[NotificationPriority.HIGH] + stats.byPriority[NotificationPriority.URGENT] + stats.byPriority[NotificationPriority.EMERGENCY] || 0;
  
  const QuickStats = () => (
    <div className="bg-white border-b border-gray-200">
      <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto px-2 sm:px-3 md:px-6 py-2">
        
        {/* 全部通知 */}
        <div className="flex items-center space-x-1 md:space-x-2 px-2 sm:px-3 py-1.5 border-b-2 border-transparent text-gray-600 whitespace-nowrap">
          <span className="text-xs sm:text-sm font-medium">總計</span>
          <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
            {stats.total}
          </span>
        </div>
        
        {/* 未讀通知 */}
        <div className="flex items-center space-x-1 md:space-x-2 px-2 sm:px-3 py-1.5 border-b-2 border-blue-500 text-blue-600 whitespace-nowrap">
          <span className="text-xs sm:text-sm font-medium">未讀</span>
          <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            {stats.unread}
          </span>
          {stats.unread > 0 && (
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
          )}
        </div>
        
        {/* 今日通知 */}
        <div className="flex items-center space-x-1 md:space-x-2 px-2 sm:px-3 py-1.5 border-b-2 border-transparent text-gray-600 whitespace-nowrap">
          <span className="text-xs sm:text-sm font-medium">今日</span>
          <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            {stats.recentCount}
          </span>
        </div>
        
        {/* 重要通知 */}
        <div className="flex items-center space-x-1 md:space-x-2 px-2 sm:px-3 py-1.5 border-b-2 border-transparent text-gray-600 whitespace-nowrap">
          <span className="text-xs sm:text-sm font-medium">重要</span>
          <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
            urgentCount > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
          }`}>
            {urgentCount}
          </span>
          {urgentCount > 0 && (
            <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
          )}
        </div>
        
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - 優化手機版標題間距 */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900">通知中心</h1>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">
              {unreadCount > 0 ? `${unreadCount} 則未讀` : '全部已讀'}
              <span className="hidden sm:inline"> · 共 {stats.total} 則通知</span>
            </p>
          </div>
          
          {/* Desktop action buttons - 優化間距和按鈕大小 */}
          <div className="hidden md:flex items-center space-x-1.5">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-2.5 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              🔄 重新整理
            </button>

            {unreadCount > 0 && (
              <button
                onClick={() => handleNotificationAction('markAllRead', {} as NotificationData)}
                className="px-2.5 py-1 border border-transparent rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                ✓ 全部已讀
              </button>
            )}

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-2.5 py-1 border rounded-md text-xs font-medium transition-colors ${
                showFilters 
                  ? 'border-blue-300 text-blue-700 bg-blue-50' 
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              🔍 篩選
            </button>
          </div>

          {/* Mobile menu button - 優化觸控目標 */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-1.5 sm:p-2 rounded-lg bg-gray-100 text-gray-700"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile action menu - 優化手機版按鈕間距 */}
        {showMobileMenu && (
          <div className="md:hidden mt-2 pt-2 border-t border-gray-200 space-y-1.5">
            <button
              onClick={() => {
                handleRefresh();
                setShowMobileMenu(false);
              }}
              disabled={loading}
              className="w-full px-3 py-2 text-left border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              🔄 重新整理
            </button>

            {unreadCount > 0 && (
              <button
                onClick={() => {
                  handleNotificationAction('markAllRead', {} as NotificationData);
                  setShowMobileMenu(false);
                }}
                className="w-full px-3 py-2 text-left border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                ✓ 全部標記已讀
              </button>
            )}

            <button
              onClick={() => {
                setShowFilters(!showFilters);
                setShowMobileMenu(false);
              }}
              className={`w-full px-3 py-2 text-left border rounded-md text-sm font-medium ${
                showFilters 
                  ? 'border-blue-300 text-blue-700 bg-blue-50' 
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              🔍 {showFilters ? '隱藏篩選' : '顯示篩選'}
            </button>
          </div>
        )}
      </div>

      {/* Quick stats - 移到 header 下方作為 tab 風格 */}
      <QuickStats />
      
      {/* Main content - 優化手機版內邊距 */}
      <div className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-6">

        {/* Error message - 優化手機版錯誤提示 */}
        {error && (
          <div className="mb-2 sm:mb-3 md:mb-6 bg-red-50 border border-red-200 rounded-md p-2.5 sm:p-3 md:p-4">
            <div className="flex">
              <span className="text-red-400 mr-1.5 sm:mr-2 text-sm">⚠️</span>
              <div className="flex-1">
                <h3 className="text-xs sm:text-sm font-medium text-red-800">載入通知時發生錯誤</h3>
                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm text-red-700">{error.message}</p>
                <div className="mt-1.5 sm:mt-2 flex space-x-1.5 sm:space-x-2">
                  <button
                    onClick={handleRefresh}
                    className="px-2 py-0.5 sm:py-1 bg-red-100 rounded text-[10px] sm:text-xs font-medium text-red-800 hover:bg-red-200"
                  >
                    重試
                  </button>
                  <button
                    onClick={clearError}
                    className="px-2 py-0.5 sm:py-1 bg-red-100 rounded text-[10px] sm:text-xs font-medium text-red-800 hover:bg-red-200"
                  >
                    忽略
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-6">
          {/* Filters sidebar - responsive */}
          {showFilters && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-3 md:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h3 className="text-xs sm:text-sm md:text-base font-medium text-gray-900">篩選條件</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden text-gray-400 hover:text-gray-500"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <NotificationFilters
                  filters={filters}
                  onFilterChange={updateFilters}
                  stats={stats}
                />
              </div>
            </div>
          )}

          {/* Notifications list */}
          <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {/* Display options - 優化手機版選項 */}
            <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-2.5 md:p-4 mb-2 sm:mb-3">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <label className="flex items-center text-[10px] sm:text-xs md:text-sm">
                  <input
                    type="checkbox"
                    checked={displayConfig.compact}
                    onChange={(e) => setDisplayConfig({ ...displayConfig, compact: e.target.checked })}
                    className="mr-1 sm:mr-1.5 md:mr-2 w-3 h-3"
                  />
                  <span className="text-gray-700">精簡模式</span>
                </label>
                
                <label className="flex items-center text-[10px] sm:text-xs md:text-sm">
                  <input
                    type="checkbox"
                    checked={displayConfig.groupByDate}
                    onChange={(e) => setDisplayConfig({ ...displayConfig, groupByDate: e.target.checked })}
                    className="mr-1 sm:mr-1.5 md:mr-2 w-3 h-3"
                  />
                  <span className="text-gray-700">依日期分組</span>
                </label>

                <label className="hidden sm:flex items-center text-[10px] sm:text-xs md:text-sm">
                  <input
                    type="checkbox"
                    checked={displayConfig.showTimestamp}
                    onChange={(e) => setDisplayConfig({ ...displayConfig, showTimestamp: e.target.checked })}
                    className="mr-1 sm:mr-1.5 md:mr-2 w-3 h-3"
                  />
                  <span className="text-gray-700">顯示時間</span>
                </label>
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" text="載入通知中..." />
              </div>
            )}

            {/* Empty state - 優化手機版空狀態 */}
            {!loading && notifications.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 md:p-12 text-center">
                <div className="text-gray-400 mb-3 sm:mb-4">
                  <span className="text-3xl sm:text-4xl md:text-6xl">🔔</span>
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
                  沒有通知
                </h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">
                  {filters.type !== 'ALL' || filters.priority !== 'ALL' || filters.isRead !== 'ALL'
                    ? '沒有符合篩選條件的通知'
                    : '目前沒有任何通知'}
                </p>
                {(filters.type !== 'ALL' || filters.priority !== 'ALL' || filters.isRead !== 'ALL') && (
                  <button
                    onClick={() => updateFilters({ type: 'ALL', priority: 'ALL', isRead: 'ALL' })}
                    className="mt-3 sm:mt-4 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-blue-600 text-white text-xs sm:text-sm rounded-md hover:bg-blue-700"
                  >
                    清除篩選條件
                  </button>
                )}
              </div>
            )}

            {/* Notifications list - 優化手機版間距 */}
            {!loading && notifications.length > 0 && (
              <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
                {displayConfig.groupByDate ? (
                  // Grouped by date
                  Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
                    <div key={date}>
                      {date !== 'all' && (
                        <div className="sticky top-0 bg-gray-50 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 md:py-2 mb-1.5 sm:mb-2 rounded-md">
                          <h3 className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-700">
                            {new Date(date).toLocaleDateString('zh-TW', { 
                              month: 'long', 
                              day: 'numeric',
                              weekday: 'long'
                            })}
                          </h3>
                        </div>
                      )}
                      {dateNotifications.map(notification => (
                        <NotificationItem
                          key={notification.notificationId}
                          notification={notification}
                          config={displayConfig}
                          actions={getActionHandlers(notification)}
                          onAction={handleNotificationAction}
                          selected={selectedNotification?.notificationId === notification.notificationId}
                          compact={displayConfig.compact}
                        />
                      ))}
                    </div>
                  ))
                ) : (
                  // Not grouped
                  notifications.map(notification => (
                    <NotificationItem
                      key={notification.notificationId}
                      notification={notification}
                      config={displayConfig}
                      actions={getActionHandlers(notification)}
                      onAction={handleNotificationAction}
                      selected={selectedNotification?.notificationId === notification.notificationId}
                      compact={displayConfig.compact}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;