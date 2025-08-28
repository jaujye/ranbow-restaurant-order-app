import { io, Socket } from 'socket.io-client';
import { Order, OrderStatus, useOrdersStore } from '../store/ordersStore';

// WebSocket event types
export interface OrderUpdateEvent {
  type: 'ORDER_CREATED' | 'ORDER_STATUS_CHANGED' | 'ORDER_PRIORITY_CHANGED' | 'ORDER_CANCELLED';
  orderId: string;
  order: Partial<Order>;
  timestamp: string;
  staffId?: string;
  changes?: Record<string, any>;
}

export interface KitchenNotificationEvent {
  type: 'NEW_ORDER' | 'URGENT_ORDER' | 'ORDER_OVERDUE';
  orderId: string;
  order: Order;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface SystemNotificationEvent {
  type: 'SYSTEM_MESSAGE' | 'MAINTENANCE' | 'UPDATE';
  message: string;
  level: 'info' | 'warning' | 'error';
  timestamp: string;
}

// WebSocket service class
export class OrderWebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private isConnecting = false;
  private eventListeners: Map<string, Function[]> = new Map();

  // Connection configuration
  private readonly config = {
    serverUrl: import.meta.env.VITE_WS_URL || 'ws://192.168.0.113:8087',
    transports: ['websocket', 'polling'] as const,
    timeout: 10000,
    forceNew: true,
    autoConnect: false
  };

  constructor() {
    this.setupEventListeners();
  }

  // Connect to WebSocket server
  connect(staffId: string, token?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(true);
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;
      
      try {
        this.socket = io(this.config.serverUrl, {
          ...this.config,
          auth: {
            staffId,
            token: token || localStorage.getItem('staff_auth_token'),
            role: 'staff'
          },
          query: {
            staffId,
            timestamp: Date.now()
          }
        });

        // Connection successful
        this.socket.on('connect', () => {
          console.log('✅ WebSocket connected successfully');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.updateConnectionStatus(true);
          
          // Join staff room for order updates
          this.socket?.emit('join-staff-room', { staffId });
          
          resolve(true);
        });

        // Connection error
        this.socket.on('connect_error', (error) => {
          console.error('❌ WebSocket connection error:', error);
          this.isConnecting = false;
          this.handleReconnection();
          reject(error);
        });

        // Disconnection
        this.socket.on('disconnect', (reason) => {
          console.warn('🔌 WebSocket disconnected:', reason);
          this.updateConnectionStatus(false);
          
          if (reason !== 'io client disconnect') {
            this.handleReconnection();
          }
        });

        // Setup event handlers
        this.setupSocketEventHandlers();
        
        // Attempt connection
        this.socket.connect();

        // Timeout fallback
        setTimeout(() => {
          if (this.isConnecting) {
            this.isConnecting = false;
            reject(new Error('Connection timeout'));
          }
        }, this.config.timeout);

      } catch (error) {
        this.isConnecting = false;
        console.error('Failed to initialize WebSocket:', error);
        reject(error);
      }
    });
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.updateConnectionStatus(false);
    this.reconnectAttempts = 0;
  }

  // Setup socket event handlers
  private setupSocketEventHandlers(): void {
    if (!this.socket) return;

    // Order updates
    this.socket.on('order:updated', (event: OrderUpdateEvent) => {
      console.log('📦 Order update received:', event);
      this.handleOrderUpdate(event);
      this.emit('orderUpdate', event);
    });

    // New order notifications
    this.socket.on('order:created', (event: OrderUpdateEvent) => {
      console.log('🆕 New order received:', event);
      this.handleNewOrder(event);
      this.emit('newOrder', event);
    });

    // Kitchen notifications
    this.socket.on('kitchen:notification', (event: KitchenNotificationEvent) => {
      console.log('👨‍🍳 Kitchen notification:', event);
      this.handleKitchenNotification(event);
      this.emit('kitchenNotification', event);
    });

    // System notifications
    this.socket.on('system:notification', (event: SystemNotificationEvent) => {
      console.log('🔔 System notification:', event);
      this.emit('systemNotification', event);
    });

    // Ping/pong for connection health
    this.socket.on('ping', () => {
      this.socket?.emit('pong');
    });

    // Server acknowledgments
    this.socket.on('ack', (data) => {
      console.log('✅ Server acknowledgment:', data);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('🚨 WebSocket error:', error);
      this.emit('error', error);
    });
  }

  // Handle order updates
  private handleOrderUpdate(event: OrderUpdateEvent): void {
    const store = useOrdersStore.getState();
    
    // Update order in store
    if (event.order) {
      store.handleRealtimeUpdate({
        id: event.orderId,
        ...event.order,
        updatedAt: event.timestamp
      });
    }

    // Show notification based on update type
    switch (event.type) {
      case 'ORDER_STATUS_CHANGED':
        this.showNotification(
          `訂單 #${event.order.orderNumber} 狀態已更新`,
          'info'
        );
        break;
      case 'ORDER_PRIORITY_CHANGED':
        this.showNotification(
          `訂單 #${event.order.orderNumber} 優先級已調整`,
          'warning'
        );
        break;
      case 'ORDER_CANCELLED':
        this.showNotification(
          `訂單 #${event.order.orderNumber} 已取消`,
          'error'
        );
        break;
    }
  }

  // Handle new order
  private handleNewOrder(event: OrderUpdateEvent): void {
    const store = useOrdersStore.getState();
    
    if (event.order) {
      // Add new order to store
      store.handleRealtimeUpdate({
        id: event.orderId,
        ...event.order,
        createdAt: event.timestamp
      } as Order);

      // Play notification sound
      this.playNotificationSound();
      
      // Show notification
      this.showNotification(
        `新訂單 #${event.order.orderNumber} 已收到`,
        'info',
        true // Auto-hide
      );
    }
  }

  // Handle kitchen notifications
  private handleKitchenNotification(event: KitchenNotificationEvent): void {
    let notificationType: 'info' | 'warning' | 'error' = 'info';
    
    switch (event.type) {
      case 'NEW_ORDER':
        notificationType = 'info';
        break;
      case 'URGENT_ORDER':
        notificationType = 'warning';
        this.playUrgentNotificationSound();
        break;
      case 'ORDER_OVERDUE':
        notificationType = 'error';
        this.playUrgentNotificationSound();
        break;
    }

    this.showNotification(event.message, notificationType, false);
  }

  // Handle reconnection logic
  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      if (this.socket && !this.socket.connected) {
        this.socket.connect();
      }
    }, delay);
  }

  // Update connection status in store
  private updateConnectionStatus(connected: boolean): void {
    const store = useOrdersStore.getState();
    store.setConnectionStatus(connected);
  }

  // Event listener management
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!callback) {
      this.eventListeners.delete(event);
      return;
    }

    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Utility methods
  private setupEventListeners(): void {
    // Window focus/blur handling
    window.addEventListener('focus', () => {
      if (!this.socket?.connected) {
        this.handleReconnection();
      }
    });

    // Online/offline handling
    window.addEventListener('online', () => {
      console.log('Network back online, reconnecting...');
      this.handleReconnection();
    });

    window.addEventListener('offline', () => {
      console.log('Network offline');
      this.updateConnectionStatus(false);
    });

    // Page unload cleanup
    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });
  }

  // Notification methods
  private showNotification(message: string, type: 'info' | 'warning' | 'error', autoHide = true): void {
    // This would integrate with your notification system
    // For now, we'll use browser notifications if permitted
    if (Notification.permission === 'granted') {
      new Notification('訂單系統通知', {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }

    // Also emit event for in-app notifications
    this.emit('notification', { message, type, autoHide });
  }

  // Sound notifications
  private playNotificationSound(): void {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(console.error);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }

  private playUrgentNotificationSound(): void {
    try {
      const audio = new Audio('/sounds/urgent.mp3');
      audio.volume = 0.8;
      audio.play().catch(console.error);
    } catch (error) {
      console.warn('Could not play urgent notification sound:', error);
    }
  }

  // Public getters
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  get connectionState(): 'connected' | 'connecting' | 'disconnected' {
    if (this.socket?.connected) return 'connected';
    if (this.isConnecting) return 'connecting';
    return 'disconnected';
  }

  // Send events to server
  sendStatusUpdate(orderId: string, status: OrderStatus, staffId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('order:status-update', {
        orderId,
        status,
        staffId,
        timestamp: new Date().toISOString()
      });
    }
  }

  sendPriorityUpdate(orderId: string, priority: string, staffId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('order:priority-update', {
        orderId,
        priority,
        staffId,
        timestamp: new Date().toISOString()
      });
    }
  }

  joinOrderRoom(orderId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-order-room', { orderId });
    }
  }

  leaveOrderRoom(orderId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-order-room', { orderId });
    }
  }
}

// Singleton instance
export const orderWebSocketService = new OrderWebSocketService();

// React hook for WebSocket integration
export function useOrderWebSocket() {
  const [connectionStatus, setConnectionStatus] = React.useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [lastUpdate, setLastUpdate] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleConnectionChange = () => {
      setConnectionStatus(orderWebSocketService.connectionState);
    };

    const handleOrderUpdate = (event: OrderUpdateEvent) => {
      setLastUpdate(event.timestamp);
    };

    orderWebSocketService.on('connectionChanged', handleConnectionChange);
    orderWebSocketService.on('orderUpdate', handleOrderUpdate);

    return () => {
      orderWebSocketService.off('connectionChanged', handleConnectionChange);
      orderWebSocketService.off('orderUpdate', handleOrderUpdate);
    };
  }, []);

  return {
    connectionStatus,
    lastUpdate,
    isConnected: orderWebSocketService.isConnected,
    connect: orderWebSocketService.connect.bind(orderWebSocketService),
    disconnect: orderWebSocketService.disconnect.bind(orderWebSocketService)
  };
}

export default orderWebSocketService;