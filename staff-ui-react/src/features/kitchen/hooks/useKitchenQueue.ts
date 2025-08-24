import { useEffect, useMemo, useCallback } from 'react';
import { 
  useKitchenStore, 
  useKitchenOrders, 
  useKitchenTimers,
  KitchenOrder,
  KitchenOrderStatus,
  WorkstationType,
} from '../store/kitchenStore';

// Hook 介面定義
interface UseKitchenQueueOptions {
  workstation?: WorkstationType;
  statusFilter?: KitchenOrderStatus[];
  autoRefresh?: boolean;
  refreshInterval?: number;
  maxItems?: number;
}

interface UseKitchenQueueReturn {
  // 數據
  orders: KitchenOrder[];
  filteredOrders: KitchenOrder[];
  timers: any[];
  isLoading: boolean;
  error: string | null;
  
  // 統計
  stats: {
    total: number;
    queued: number;
    active: number;
    overdue: number;
    completed: number;
  };
  
  // 操作方法
  refreshOrders: () => Promise<void>;
  startOrder: (orderId: number) => Promise<void>;
  completeOrder: (orderId: number) => Promise<void>;
  assignToWorkstation: (orderId: number, workstation: WorkstationType) => Promise<void>;
  updateOrderStatus: (orderId: number, status: KitchenOrderStatus) => Promise<void>;
  
  // 選擇相關
  selectedOrderId: number | null;
  selectOrder: (orderId: number | null) => void;
  
  // 實用工具
  getOrderTimer: (orderId: number) => any | undefined;
  isOrderOverdue: (orderId: number) => boolean;
  getOrderElapsedTime: (orderId: number) => number;
}

/**
 * 廚房隊列管理 Hook
 * 提供廚房隊列的完整管理功能，包括數據獲取、篩選、操作等
 */
export const useKitchenQueue = (options: UseKitchenQueueOptions = {}): UseKitchenQueueReturn => {
  const {
    workstation,
    statusFilter,
    autoRefresh = true,
    refreshInterval = 5000,
    maxItems,
  } = options;

  const orders = useKitchenOrders();
  const timers = useKitchenTimers();
  const {
    fetchOrders,
    startOrder: storeStartOrder,
    completeOrder: storeCompleteOrder,
    updateOrderStatus: storeUpdateOrderStatus,
    assignOrderToWorkstation,
    selectedOrderId,
    selectOrder,
    isLoading,
    error,
  } = useKitchenStore();

  // 篩選和排序訂單
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // 工作站篩選
    if (workstation) {
      filtered = filtered.filter(order =>
        order.assignedWorkstation === workstation ||
        order.items.some(item => item.workstation === workstation)
      );
    }

    // 狀態篩選
    if (statusFilter && statusFilter.length > 0) {
      filtered = filtered.filter(order => statusFilter.includes(order.status));
    }

    // 排序：優先級 > 狀態 > 時間
    filtered = filtered.sort((a, b) => {
      // 1. 優先級排序
      const priorityOrder = { urgent: 3, high: 2, normal: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      
      // 2. 狀態排序 (逾時 > 製作中 > 排隊中 > 完成)
      const statusOrder = { overdue: 4, active: 3, queued: 2, completed: 1 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[b.status] - statusOrder[a.status];
      }
      
      // 3. 創建時間排序
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    // 限制數量
    if (maxItems && maxItems > 0) {
      filtered = filtered.slice(0, maxItems);
    }

    return filtered;
  }, [orders, workstation, statusFilter, maxItems]);

  // 統計數據
  const stats = useMemo(() => {
    const total = filteredOrders.length;
    const queued = filteredOrders.filter(o => o.status === 'queued').length;
    const active = filteredOrders.filter(o => o.status === 'active').length;
    const overdue = filteredOrders.filter(o => o.status === 'overdue').length;
    const completed = filteredOrders.filter(o => o.status === 'completed').length;
    
    return { total, queued, active, overdue, completed };
  }, [filteredOrders]);

  // 自動刷新
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchOrders();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchOrders]);

  // 初始數據載入
  useEffect(() => {
    fetchOrders();
  }, []);

  // 操作方法
  const refreshOrders = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  const startOrder = useCallback(async (orderId: number) => {
    await storeStartOrder(orderId);
  }, [storeStartOrder]);

  const completeOrder = useCallback(async (orderId: number) => {
    await storeCompleteOrder(orderId);
  }, [storeCompleteOrder]);

  const assignToWorkstation = useCallback(async (orderId: number, workstationType: WorkstationType) => {
    await assignOrderToWorkstation(orderId, workstationType);
  }, [assignOrderToWorkstation]);

  const updateOrderStatus = useCallback(async (orderId: number, status: KitchenOrderStatus) => {
    await storeUpdateOrderStatus(orderId, status);
  }, [storeUpdateOrderStatus]);

  // 實用工具方法
  const getOrderTimer = useCallback((orderId: number) => {
    return timers.find(timer => timer.orderId === orderId);
  }, [timers]);

  const isOrderOverdue = useCallback((orderId: number) => {
    const timer = getOrderTimer(orderId);
    return timer?.isOverdue || false;
  }, [getOrderTimer]);

  const getOrderElapsedTime = useCallback((orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    if (!order?.actualStartTime) return 0;
    
    return Math.floor((Date.now() - order.actualStartTime.getTime()) / 1000);
  }, [orders]);

  return {
    // 數據
    orders,
    filteredOrders,
    timers,
    isLoading,
    error,
    
    // 統計
    stats,
    
    // 操作方法
    refreshOrders,
    startOrder,
    completeOrder,
    assignToWorkstation,
    updateOrderStatus,
    
    // 選擇相關
    selectedOrderId,
    selectOrder,
    
    // 實用工具
    getOrderTimer,
    isOrderOverdue,
    getOrderElapsedTime,
  };
};