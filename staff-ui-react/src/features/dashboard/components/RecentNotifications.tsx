import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, Info, Bell } from 'lucide-react';
import { useStaffAuth } from '@/features/auth/store/authStore';
import axios from 'axios';
import { env } from '@/config/env.config';

const API_BASE_URL = env.API_BASE_URL || 'http://localhost:8081/api';

interface Notification {
  notificationId: string;
  recipientStaffId: string;
  type: 'NEW_ORDER' | 'ORDER_STATUS_CHANGE' | 'ORDER_OVERTIME' | 'EMERGENCY' | 'SHIFT_REMINDER' | 'SYSTEM' | 'CUSTOMER_FEEDBACK' | 'ANNOUNCEMENT';
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  title: string;
  message: string;
  read: boolean; // API使用read而不是isRead
  sentAt: string;
  urgent?: boolean;
  minutesSinceSent?: number;
}

const getNotificationIcon = (type: string, priority: string) => {
  if (priority === 'HIGH') {
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  }
  
  switch (type) {
    case 'NEW_ORDER':
      return <Bell className="h-4 w-4 text-blue-500" />;
    case 'ORDER_STATUS_CHANGE':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'EMERGENCY':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'SYSTEM':
      return <Info className="h-4 w-4 text-orange-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const getNotificationColor = (type: string, priority: string) => {
  if (priority === 'HIGH') {
    return 'bg-red-50 border-red-200';
  }
  
  switch (type) {
    case 'NEW_ORDER':
      return 'bg-blue-50 border-blue-200';
    case 'ORDER_STATUS_CHANGE':
      return 'bg-green-50 border-green-200';
    case 'EMERGENCY':
      return 'bg-red-50 border-red-200';
    case 'SYSTEM':
      return 'bg-orange-50 border-orange-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

const formatTimeAgo = (sentAt: string): string => {
  const now = new Date();
  const sent = new Date(sentAt);
  const diffMs = now.getTime() - sent.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 1) return '剛剛';
  if (diffMinutes < 60) return `${diffMinutes}分鐘前`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}小時前`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}天前`;
};

export function RecentNotifications() {
  const { currentStaff } = useStaffAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    const staffId = currentStaff?.staff?.staffId || currentStaff?.staffId;
    
    if (!staffId) {
      console.log('❌ No staffId found for notifications:', currentStaff);
      return;
    }

    try {
      console.log('📬 Loading notifications for staffId:', staffId);
      const response = await axios.get(`${API_BASE_URL}/staff/notifications/${staffId}?limit=5`);
      
      console.log('✅ Notifications loaded:', response.data);
      
      // API直接返回數據，不包裝在success/data中
      setNotifications(response.data.notifications || []);
      setError(null);
    } catch (err: any) {
      console.error('❌ Failed to load notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [currentStaff?.staff?.staffId, currentStaff?.staffId]);

  // 每30秒更新一次通知
  useEffect(() => {
    const staffId = currentStaff?.staff?.staffId || currentStaff?.staffId;
    if (!staffId) return;
    
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [currentStaff?.staff?.staffId, currentStaff?.staffId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">重要系統通知</h2>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">重要系統通知</h2>
        <div className="text-center py-8">
          <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">暫無通知數據</p>
          <button 
            onClick={loadNotifications}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">重要系統通知</h2>
        {notifications.filter(n => !n.read).length > 0 && (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
            {notifications.filter(n => !n.read).length} 未讀
          </span>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">目前沒有系統通知</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div 
              key={notification.notificationId} 
              className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${getNotificationColor(notification.type, notification.priority)} ${!notification.read ? 'ring-2 ring-blue-200' : ''}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification.type, notification.priority)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-sm font-medium truncate ${notification.priority === 'HIGH' ? 'text-red-900' : 'text-gray-900'}`}>
                    {notification.title}
                    {notification.priority === 'HIGH' && (
                      <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        緊急
                      </span>
                    )}
                  </p>
                  <span className={`text-xs ml-2 flex-shrink-0 ${notification.priority === 'HIGH' ? 'text-red-600' : 'text-gray-500'}`}>
                    {formatTimeAgo(notification.sentAt)}
                  </span>
                </div>
                <p className={`text-xs truncate ${notification.priority === 'HIGH' ? 'text-red-700' : 'text-gray-600'}`}>
                  {notification.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentNotifications;