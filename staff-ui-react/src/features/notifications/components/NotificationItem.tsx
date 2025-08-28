import React from 'react';
import {
  NotificationData,
  NotificationDisplayConfig,
  NotificationActionHandler,
  NotificationAction,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_PRIORITY_LABELS,
  NOTIFICATION_TYPE_COLORS,
  NOTIFICATION_PRIORITY_COLORS,
  NotificationType,
  NotificationPriority
} from '../types/notifications.types';

export interface NotificationItemProps {
  notification: NotificationData;
  config: NotificationDisplayConfig;
  actions: NotificationActionHandler[];
  onAction: (action: NotificationAction, notification: NotificationData) => void;
  selected?: boolean;
  compact?: boolean;
}

const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const sent = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - sent.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return '剛剛';
  if (diffInMinutes < 60) return `${diffInMinutes}分鐘前`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}小時前`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}天前`;
  
  // Format for mobile - shorter date format
  return sent.toLocaleDateString('zh-TW', { 
    month: 'numeric', 
    day: 'numeric' 
  });
};

const getTypeIcon = (type: NotificationType): string => {
  switch (type) {
    case NotificationType.NEW_ORDER:
      return '📋';
    case NotificationType.ORDER_STATUS_CHANGE:
      return '🔄';
    case NotificationType.ORDER_OVERDUE:
      return '⏰';
    case NotificationType.KITCHEN_ALERT:
      return '🔥';
    case NotificationType.STAFF_MESSAGE:
      return '💬';
    case NotificationType.SYSTEM:
      return '⚙️';
    case NotificationType.SHIFT_START:
      return '🟢';
    case NotificationType.SHIFT_END:
      return '🔴';
    case NotificationType.EMERGENCY:
      return '🚨';
    default:
      return '🔔';
  }
};

const getPriorityIcon = (priority: NotificationPriority): string => {
  switch (priority) {
    case NotificationPriority.LOW:
      return '🔵';
    case NotificationPriority.NORMAL:
      return '🟡';
    case NotificationPriority.HIGH:
      return '🟠';
    case NotificationPriority.URGENT:
      return '🔴';
    case NotificationPriority.EMERGENCY:
      return '🚨';
    default:
      return '⚪';
  }
};

export function NotificationItem({ 
  notification, 
  config, 
  actions, 
  onAction, 
  selected = false, 
  compact = false 
}: NotificationItemProps) {
  const handleAction = (action: NotificationAction) => {
    onAction(action, notification);
  };

  const handleNotificationClick = () => {
    if (!(notification.isRead || notification.read)) {
      handleAction('markRead');
    }
    handleAction('view');
  };

  const handleOrderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.relatedOrderId) {
      handleAction('goToOrder');
    }
  };

  const isUrgent = notification.priority === NotificationPriority.URGENT || 
                   notification.priority === NotificationPriority.EMERGENCY || 
                   notification.urgent;
  const isUnread = !(notification.isRead || notification.read);
  
  // Compact mode for mobile
  if (compact) {
    return (
      <div
        className={`
          relative border rounded-lg p-3 cursor-pointer transition-all duration-200
          ${selected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
          ${isUnread ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200'}
          ${isUrgent ? 'border-red-300 shadow-sm' : ''}
          hover:shadow-sm hover:bg-opacity-80
        `}
        onClick={handleNotificationClick}
      >
        {/* Unread indicator */}
        {isUnread && (
          <div className="absolute left-1.5 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
        )}

        <div className={isUnread ? 'ml-3' : ''}>
          {/* Header row */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1.5 flex-1 min-w-0">
              <span className="text-base">{getTypeIcon(notification.type)}</span>
              <h3 className="font-medium text-sm text-gray-900 truncate">
                {notification.title}
              </h3>
              {isUrgent && (
                <span className="text-xs">🚨</span>
              )}
            </div>
            {config.showTimestamp && (
              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                {formatTimeAgo(notification.sentAt)}
              </span>
            )}
          </div>

          {/* Message */}
          <p className="text-xs text-gray-600 line-clamp-2">
            {notification.message}
          </p>

          {/* Quick actions for compact mode */}
          {notification.relatedOrderId && (
            <button
              onClick={handleOrderClick}
              className="mt-1 text-xs text-blue-600 hover:text-blue-800"
            >
              查看訂單 →
            </button>
          )}
        </div>
      </div>
    );
  }

  // Normal mode (tablet/desktop)
  return (
    <div
      className={`
        relative border rounded-lg p-3 md:p-4 cursor-pointer transition-all duration-200
        ${selected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
        ${isUnread ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200'}
        ${isUrgent ? 'border-red-300 shadow-md' : ''}
        hover:shadow-sm hover:bg-opacity-80
      `}
      onClick={handleNotificationClick}
    >
      {/* Unread indicator */}
      {isUnread && (
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
      )}

      {/* Urgent badge - responsive positioning */}
      {isUrgent && (
        <div className="absolute right-2 top-2 md:right-3 md:top-3">
          <span className="inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            🚨 緊急
          </span>
        </div>
      )}

      <div className={`${isUnread ? 'ml-4' : ''} ${isUrgent ? 'mr-12 md:mr-16' : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            {/* Type icon */}
            <span className="text-base md:text-lg">{getTypeIcon(notification.type)}</span>
            
            {/* Title */}
            <h3 className={`font-medium text-sm md:text-base ${isUnread ? 'text-gray-900' : 'text-gray-600'}`}>
              {notification.title}
            </h3>

            {/* Type badge - hide on mobile if not urgent */}
            {config.showType && (
              <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${NOTIFICATION_TYPE_COLORS[notification.type]}`}>
                {NOTIFICATION_TYPE_LABELS[notification.type]}
              </span>
            )}

            {/* Priority badge - only show high priority on mobile */}
            {config.showPriority && notification.priority !== NotificationPriority.NORMAL && 
             notification.priority !== NotificationPriority.LOW && (
              <span className={`inline-flex items-center px-1.5 md:px-2 py-0.5 rounded-full text-xs font-medium ${NOTIFICATION_PRIORITY_COLORS[notification.priority]}`}>
                <span className="hidden sm:inline">{getPriorityIcon(notification.priority)}</span>
                <span className="ml-0.5 sm:ml-1">{NOTIFICATION_PRIORITY_LABELS[notification.priority]}</span>
              </span>
            )}
          </div>

          {/* Timestamp */}
          {config.showTimestamp && (
            <span className="text-xs md:text-sm text-gray-500 ml-2">
              {formatTimeAgo(notification.sentAt)}
            </span>
          )}
        </div>

        {/* Message - responsive text size */}
        <p className={`text-gray-700 text-sm md:text-base ${isUnread ? 'font-normal' : 'font-light'}`}>
          {notification.message}
        </p>

        {/* Related order info */}
        {notification.relatedOrderId && (
          <div className="mt-2">
            <button
              onClick={handleOrderClick}
              className="inline-flex items-center text-xs md:text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              📋 查看相關訂單 #{notification.relatedOrderId.slice(-6)}
            </button>
          </div>
        )}

        {/* Sender info - hide on mobile */}
        {config.showSender && notification.senderStaffId && (
          <div className="hidden md:block mt-2 text-sm text-gray-500">
            來自: {notification.senderStaffId}
          </div>
        )}

        {/* Actions - responsive layout */}
        {actions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {actions.map((action) => {
              // Skip certain actions based on notification state
              if (action.action === 'markRead' && (notification.isRead || notification.read)) return null;
              if (action.action === 'goToOrder' && !notification.relatedOrderId) return null;

              return (
                <button
                  key={action.action}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.handler(notification);
                  }}
                  className={`
                    inline-flex items-center px-2 md:px-3 py-1 rounded text-xs md:text-sm font-medium transition-colors
                    ${action.variant === 'primary' 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : action.variant === 'danger'
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : action.variant === 'success'
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <span className="mr-0.5 md:mr-1">{action.icon}</span>
                  <span className="hidden sm:inline">{action.label}</span>
                  <span className="sm:hidden">{action.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Expiry warning - hide on mobile */}
        {notification.expiresAt && new Date(notification.expiresAt) < new Date(Date.now() + 60 * 60 * 1000) && (
          <div className="hidden md:flex mt-2 items-center text-sm text-orange-600">
            <span className="mr-1">⚠️</span>
            將於 {formatTimeAgo(notification.expiresAt)} 過期
          </div>
        )}

        {/* Read timestamp - hide on mobile */}
        {(notification.isRead || notification.read) && notification.readAt && config.showTimestamp && (
          <div className="hidden md:block mt-2 text-xs text-gray-400">
            已讀於 {formatTimeAgo(notification.readAt)}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationItem;