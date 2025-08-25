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
  if (diffInMinutes < 60) return `${diffInMinutes} 分鐘前`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} 小時前`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} 天前`;
  
  return sent.toLocaleDateString('zh-TW');
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
  
  return (
    <div
      className={`
        relative border rounded-lg p-4 cursor-pointer transition-all duration-200
        ${selected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
        ${isUnread ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200'}
        ${isUrgent ? 'border-red-300 shadow-md' : ''}
        ${compact ? 'p-3' : 'p-4'}
        hover:shadow-sm hover:bg-opacity-80
      `}
      onClick={handleNotificationClick}
    >
      {/* Unread indicator */}
      {isUnread && (
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
      )}

      {/* Urgent indicator */}
      {isUrgent && (
        <div className="absolute right-2 top-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            🚨 緊急
          </span>
        </div>
      )}

      <div className={`${isUnread ? 'ml-4' : ''} ${isUrgent ? 'mr-16' : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            {/* Type icon */}
            <span className="text-lg">{getTypeIcon(notification.type)}</span>
            
            {/* Title */}
            <h3 className={`font-medium ${compact ? 'text-sm' : 'text-base'} ${isUnread ? 'text-gray-900' : 'text-gray-600'}`}>
              {notification.title}
            </h3>

            {/* Type badge */}
            {config.showType && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${NOTIFICATION_TYPE_COLORS[notification.type]}`}>
                {NOTIFICATION_TYPE_LABELS[notification.type]}
              </span>
            )}

            {/* Priority badge */}
            {config.showPriority && notification.priority !== NotificationPriority.NORMAL && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${NOTIFICATION_PRIORITY_COLORS[notification.priority]}`}>
                {getPriorityIcon(notification.priority)} {NOTIFICATION_PRIORITY_LABELS[notification.priority]}
              </span>
            )}
          </div>

          {/* Timestamp */}
          {config.showTimestamp && (
            <span className={`text-xs text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
              {formatTimeAgo(notification.sentAt)}
            </span>
          )}
        </div>

        {/* Message */}
        <p className={`text-gray-700 ${compact ? 'text-sm' : 'text-base'} ${isUnread ? 'font-normal' : 'font-light'}`}>
          {notification.message}
        </p>

        {/* Related order info */}
        {notification.relatedOrderId && (
          <div className="mt-2">
            <button
              onClick={handleOrderClick}
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              📋 查看相關訂單 #{notification.relatedOrderId.slice(-6)}
            </button>
          </div>
        )}

        {/* Sender info */}
        {config.showSender && notification.senderStaffId && (
          <div className="mt-2 text-sm text-gray-500">
            來自: {notification.senderStaffId}
          </div>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div className="mt-3 flex space-x-2">
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
                    inline-flex items-center px-3 py-1 rounded text-sm font-medium transition-colors
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
                  {action.icon && <span className="mr-1">{action.icon}</span>}
                  {action.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Expiry warning */}
        {notification.expiresAt && new Date(notification.expiresAt) < new Date(Date.now() + 60 * 60 * 1000) && (
          <div className="mt-2 flex items-center text-sm text-orange-600">
            <span className="mr-1">⚠️</span>
            將於 {formatTimeAgo(notification.expiresAt)} 過期
          </div>
        )}

        {/* Read timestamp */}
        {(notification.isRead || notification.read) && notification.readAt && config.showTimestamp && (
          <div className="mt-2 text-xs text-gray-400">
            已讀於 {formatTimeAgo(notification.readAt)}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationItem;