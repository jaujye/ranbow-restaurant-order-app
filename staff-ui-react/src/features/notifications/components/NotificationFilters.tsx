import React from 'react';
import {
  NotificationFilters as NotificationFiltersType,
  NotificationType,
  NotificationPriority,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_PRIORITY_LABELS
} from '../types/notifications.types';

export interface NotificationFiltersProps {
  filters: NotificationFiltersType;
  onFilterChange: (filters: Partial<NotificationFiltersType>) => void;
  stats?: {
    total: number;
    unread: number;
    byType: Record<NotificationType, number>;
    byPriority: Record<NotificationPriority, number>;
  };
  className?: string;
}

export function NotificationFilters({ 
  filters, 
  onFilterChange, 
  stats,
  className = '' 
}: NotificationFiltersProps) {
  const handleTypeChange = (type: NotificationType | 'ALL') => {
    onFilterChange({ type });
  };

  const handlePriorityChange = (priority: NotificationPriority | 'ALL') => {
    onFilterChange({ priority });
  };

  const handleReadStatusChange = (isRead: boolean | 'ALL') => {
    onFilterChange({ isRead });
  };

  const clearFilters = () => {
    onFilterChange({
      type: 'ALL',
      priority: 'ALL',
      isRead: 'ALL',
      timeRange: undefined
    });
  };

  const hasActiveFilters = 
    filters.type !== 'ALL' || 
    filters.priority !== 'ALL' || 
    filters.isRead !== 'ALL' ||
    filters.timeRange !== undefined;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">篩選通知</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            清除篩選
          </button>
        )}
      </div>

      {/* Quick stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
            <div className="text-sm text-gray-600">未讀</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
            <div className="text-sm text-gray-600">總計</div>
          </div>
        </div>
      )}

      {/* Read Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          狀態
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleReadStatusChange('ALL')}
            className={`px-3 py-2 text-sm rounded-md font-medium transition-colors ${
              filters.isRead === 'ALL'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            全部
            {stats && <span className="block text-xs">{stats.total}</span>}
          </button>
          <button
            onClick={() => handleReadStatusChange(false)}
            className={`px-3 py-2 text-sm rounded-md font-medium transition-colors ${
              filters.isRead === false
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            未讀
            {stats && <span className="block text-xs">{stats.unread}</span>}
          </button>
          <button
            onClick={() => handleReadStatusChange(true)}
            className={`px-3 py-2 text-sm rounded-md font-medium transition-colors ${
              filters.isRead === true
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            已讀
            {stats && <span className="block text-xs">{stats.total - stats.unread}</span>}
          </button>
        </div>
      </div>

      {/* Type Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          類型
        </label>
        <div className="space-y-2">
          <button
            onClick={() => handleTypeChange('ALL')}
            className={`w-full px-3 py-2 text-left text-sm rounded-md font-medium transition-colors ${
              filters.type === 'ALL'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            <div className="flex justify-between items-center">
              <span>全部類型</span>
              {stats && <span className="text-xs">{stats.total}</span>}
            </div>
          </button>

          {Object.values(NotificationType).map(type => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`w-full px-3 py-2 text-left text-sm rounded-md font-medium transition-colors ${
                filters.type === type
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{NOTIFICATION_TYPE_LABELS[type]}</span>
                {stats && (
                  <span className="text-xs">
                    {stats.byType[type] || 0}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Priority Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          優先級
        </label>
        <div className="space-y-2">
          <button
            onClick={() => handlePriorityChange('ALL')}
            className={`w-full px-3 py-2 text-left text-sm rounded-md font-medium transition-colors ${
              filters.priority === 'ALL'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            <div className="flex justify-between items-center">
              <span>全部優先級</span>
              {stats && <span className="text-xs">{stats.total}</span>}
            </div>
          </button>

          {Object.values(NotificationPriority).map(priority => (
            <button
              key={priority}
              onClick={() => handlePriorityChange(priority)}
              className={`w-full px-3 py-2 text-left text-sm rounded-md font-medium transition-colors ${
                filters.priority === priority
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <span>
                  {priority === NotificationPriority.URGENT && '🔴 '}
                  {priority === NotificationPriority.HIGH && '🟠 '}
                  {priority === NotificationPriority.NORMAL && '🟡 '}
                  {priority === NotificationPriority.LOW && '🔵 '}
                  {NOTIFICATION_PRIORITY_LABELS[priority]}
                </span>
                {stats && (
                  <span className="text-xs">
                    {stats.byPriority[priority] || 0}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Time Range Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          時間範圍
        </label>
        <div className="space-y-2">
          <button
            onClick={() => onFilterChange({ timeRange: undefined })}
            className={`w-full px-3 py-2 text-left text-sm rounded-md font-medium transition-colors ${
              !filters.timeRange
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            全部時間
          </button>
          
          <button
            onClick={() => {
              const now = new Date();
              const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
              onFilterChange({ timeRange: { start, end: now } });
            }}
            className={`w-full px-3 py-2 text-left text-sm rounded-md font-medium transition-colors ${
              filters.timeRange && 
              filters.timeRange.start.getTime() > Date.now() - 25 * 60 * 60 * 1000 &&
              filters.timeRange.end.getTime() > Date.now() - 60 * 60 * 1000
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            過去 24 小時
          </button>
          
          <button
            onClick={() => {
              const now = new Date();
              const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              onFilterChange({ timeRange: { start, end: now } });
            }}
            className={`w-full px-3 py-2 text-left text-sm rounded-md font-medium transition-colors ${
              filters.timeRange && 
              filters.timeRange.start.getTime() > Date.now() - 8 * 24 * 60 * 60 * 1000 &&
              filters.timeRange.end.getTime() > Date.now() - 60 * 60 * 1000
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            過去 7 天
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationFilters;