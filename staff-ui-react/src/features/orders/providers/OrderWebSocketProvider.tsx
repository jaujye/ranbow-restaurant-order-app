import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { orderWebSocketService, OrderUpdateEvent, KitchenNotificationEvent } from '../services/websocketService';
import { useOrdersStore } from '../store/ordersStore';

// Context type
interface OrderWebSocketContextType {
  isConnected: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  lastUpdate: string | null;
  notifications: Notification[];
  connect: (staffId: string, token?: string) => Promise<boolean>;
  disconnect: () => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

// Notification type
interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  autoHide?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Create context
const OrderWebSocketContext = createContext<OrderWebSocketContextType | undefined>(undefined);

// Provider props
interface OrderWebSocketProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
  staffId?: string;
  showNotifications?: boolean;
}

export function OrderWebSocketProvider({
  children,
  autoConnect = true,
  staffId,
  showNotifications = true
}: OrderWebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { handleRealtimeUpdate } = useOrdersStore();

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && staffId) {
      handleConnect(staffId);
    }

    // Cleanup on unmount
    return () => {
      orderWebSocketService.disconnect();
    };
  }, [autoConnect, staffId]);

  // Setup event listeners
  useEffect(() => {
    const handleConnectionChange = (connected: boolean) => {
      setIsConnected(connected);
      setConnectionStatus(connected ? 'connected' : 'disconnected');
      
      if (showNotifications) {
        addNotification({
          type: connected ? 'success' : 'warning',
          title: connected ? '已連線' : '連線中斷',
          message: connected ? 'WebSocket 連線已建立' : 'WebSocket 連線已中斷，嘗試重新連線...',
          autoHide: connected
        });
      }
    };

    const handleOrderUpdate = (event: OrderUpdateEvent) => {
      console.log('Order update received in provider:', event);
      setLastUpdate(event.timestamp);
      
      // Update order in store
      if (event.order) {
        handleRealtimeUpdate({
          id: event.orderId,
          ...event.order,
          updatedAt: event.timestamp
        });
      }

      if (showNotifications) {
        let notificationTitle = '訂單更新';
        let notificationMessage = '';
        
        switch (event.type) {
          case 'ORDER_CREATED':
            notificationTitle = '新訂單';
            notificationMessage = `收到新訂單 #${event.order.orderNumber || event.orderId}`;
            break;
          case 'ORDER_STATUS_CHANGED':
            notificationTitle = '狀態更新';
            notificationMessage = `訂單 #${event.order.orderNumber || event.orderId} 狀態已更改`;
            break;
          case 'ORDER_PRIORITY_CHANGED':
            notificationTitle = '優先級更新';
            notificationMessage = `訂單 #${event.order.orderNumber || event.orderId} 優先級已調整`;
            break;
          case 'ORDER_CANCELLED':
            notificationTitle = '訂單取消';
            notificationMessage = `訂單 #${event.order.orderNumber || event.orderId} 已取消`;
            break;
        }

        addNotification({
          type: event.type === 'ORDER_CREATED' ? 'info' : 'success',
          title: notificationTitle,
          message: notificationMessage,
          autoHide: true
        });
      }
    };

    const handleNewOrder = (event: OrderUpdateEvent) => {
      console.log('New order received in provider:', event);
      setLastUpdate(event.timestamp);

      if (event.order) {
        handleRealtimeUpdate({
          id: event.orderId,
          ...event.order,
          createdAt: event.timestamp
        });
      }

      if (showNotifications) {
        addNotification({
          type: 'info',
          title: '新訂單通知',
          message: `收到新訂單 #${event.order.orderNumber || event.orderId}，請儘快處理`,
          autoHide: false,
          action: {
            label: '查看',
            onClick: () => {
              // Navigate to pending orders or specific order
              window.location.href = `/staff/orders/pending`;
            }
          }
        });

        // Request notification permission if not granted
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
          Notification.requestPermission();
        }

        // Show browser notification
        if (Notification.permission === 'granted') {
          new Notification('新訂單通知', {
            body: `收到新訂單 #${event.order.orderNumber || event.orderId}`,
            icon: '/favicon.ico',
            tag: `order-${event.orderId}`,
            requireInteraction: true
          });
        }
      }
    };

    const handleKitchenNotification = (event: KitchenNotificationEvent) => {
      console.log('Kitchen notification received in provider:', event);
      
      if (showNotifications) {
        let type: 'info' | 'warning' | 'error' = 'info';
        
        switch (event.type) {
          case 'NEW_ORDER':
            type = 'info';
            break;
          case 'URGENT_ORDER':
            type = 'warning';
            break;
          case 'ORDER_OVERDUE':
            type = 'error';
            break;
        }

        addNotification({
          type,
          title: '廚房通知',
          message: event.message,
          autoHide: event.priority === 'low',
          action: event.type === 'ORDER_OVERDUE' ? {
            label: '查看',
            onClick: () => {
              window.location.href = `/staff/orders/in-progress`;
            }
          } : undefined
        });
      }
    };

    const handleError = (error: any) => {
      console.error('WebSocket error in provider:', error);
      
      if (showNotifications) {
        addNotification({
          type: 'error',
          title: '連線錯誤',
          message: 'WebSocket 連線發生錯誤，請檢查網路連線',
          autoHide: false
        });
      }
    };

    const handleMaxReconnectAttempts = () => {
      if (showNotifications) {
        addNotification({
          type: 'error',
          title: '連線失敗',
          message: '無法建立 WebSocket 連線，請重新整理頁面或聯絡技術支援',
          autoHide: false,
          action: {
            label: '重新整理',
            onClick: () => window.location.reload()
          }
        });
      }
    };

    // Register event listeners
    orderWebSocketService.on('connect', () => handleConnectionChange(true));
    orderWebSocketService.on('disconnect', () => handleConnectionChange(false));
    orderWebSocketService.on('orderUpdate', handleOrderUpdate);
    orderWebSocketService.on('newOrder', handleNewOrder);
    orderWebSocketService.on('kitchenNotification', handleKitchenNotification);
    orderWebSocketService.on('error', handleError);
    orderWebSocketService.on('maxReconnectAttemptsReached', handleMaxReconnectAttempts);

    return () => {
      // Cleanup event listeners
      orderWebSocketService.off('connect');
      orderWebSocketService.off('disconnect');
      orderWebSocketService.off('orderUpdate');
      orderWebSocketService.off('newOrder');
      orderWebSocketService.off('kitchenNotification');
      orderWebSocketService.off('error');
      orderWebSocketService.off('maxReconnectAttemptsReached');
    };
  }, [handleRealtimeUpdate, showNotifications]);

  // Auto-hide notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => prev.filter(notification => {
        if (notification.autoHide) {
          const age = Date.now() - new Date(notification.timestamp).getTime();
          return age < 5000; // Auto-hide after 5 seconds
        }
        return true;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Helper functions
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep only 10 most recent
  };

  const handleConnect = async (staffId: string, token?: string) => {
    try {
      setConnectionStatus('connecting');
      const success = await orderWebSocketService.connect(staffId, token);
      if (success) {
        setIsConnected(true);
        setConnectionStatus('connected');
      }
      return success;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setConnectionStatus('disconnected');
      setIsConnected(false);
      
      if (showNotifications) {
        addNotification({
          type: 'error',
          title: '連線失敗',
          message: '無法建立 WebSocket 連線',
          autoHide: true
        });
      }
      
      return false;
    }
  };

  const handleDisconnect = () => {
    orderWebSocketService.disconnect();
    setIsConnected(false);
    setConnectionStatus('disconnected');
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const contextValue: OrderWebSocketContextType = {
    isConnected,
    connectionStatus,
    lastUpdate,
    notifications,
    connect: handleConnect,
    disconnect: handleDisconnect,
    dismissNotification,
    clearAllNotifications
  };

  return (
    <OrderWebSocketContext.Provider value={contextValue}>
      {children}
    </OrderWebSocketContext.Provider>
  );
}

// Hook to use the WebSocket context
export function useOrderWebSocket() {
  const context = useContext(OrderWebSocketContext);
  
  if (context === undefined) {
    throw new Error('useOrderWebSocket must be used within an OrderWebSocketProvider');
  }
  
  return context;
}

// Hook for connection status indicator
export function useConnectionStatus() {
  const { isConnected, connectionStatus } = useOrderWebSocket();
  
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'green';
      case 'connecting': return 'yellow';
      case 'disconnected': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '已連線';
      case 'connecting': return '連線中';
      case 'disconnected': return '已中斷';
      default: return '未知';
    }
  };

  return {
    isConnected,
    connectionStatus,
    statusColor: getStatusColor(),
    statusText: getStatusText()
  };
}

// Notification component
export function OrderNotifications() {
  const { notifications, dismissNotification, clearAllNotifications } = useOrderWebSocket();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.slice(0, 3).map((notification) => (
        <div
          key={notification.id}
          className={`bg-white border border-gray-200 rounded-lg shadow-lg p-4 transition-all duration-300 ${
            notification.type === 'error' ? 'border-red-200 bg-red-50' :
            notification.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
            notification.type === 'success' ? 'border-green-200 bg-green-50' :
            'border-blue-200 bg-blue-50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className={`font-medium text-sm ${
                notification.type === 'error' ? 'text-red-800' :
                notification.type === 'warning' ? 'text-yellow-800' :
                notification.type === 'success' ? 'text-green-800' :
                'text-blue-800'
              }`}>
                {notification.title}
              </div>
              <div className={`text-sm mt-1 ${
                notification.type === 'error' ? 'text-red-600' :
                notification.type === 'warning' ? 'text-yellow-600' :
                notification.type === 'success' ? 'text-green-600' :
                'text-blue-600'
              }`}>
                {notification.message}
              </div>
              
              {notification.action && (
                <button
                  onClick={notification.action.onClick}
                  className={`mt-2 text-sm font-medium underline ${
                    notification.type === 'error' ? 'text-red-700 hover:text-red-800' :
                    notification.type === 'warning' ? 'text-yellow-700 hover:text-yellow-800' :
                    notification.type === 'success' ? 'text-green-700 hover:text-green-800' :
                    'text-blue-700 hover:text-blue-800'
                  }`}
                >
                  {notification.action.label}
                </button>
              )}
            </div>
            
            <button
              onClick={() => dismissNotification(notification.id)}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
      
      {notifications.length > 3 && (
        <div className="text-center">
          <button
            onClick={clearAllNotifications}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            清除全部通知 ({notifications.length})
          </button>
        </div>
      )}
    </div>
  );
}

export default OrderWebSocketProvider;