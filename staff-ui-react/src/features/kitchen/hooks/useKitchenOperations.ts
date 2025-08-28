import { useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { 
  useKitchenStore, 
  useKitchenOrders, 
  useWorkstations,
  KitchenOrder,
  KitchenOrderStatus,
  WorkstationType,
} from '../store/kitchenStore';
import kitchenApi, { handleKitchenApiError, retryApiCall } from '../services/kitchenApi';

// 操作選項介面
interface UseKitchenOperationsOptions {
  enableNotifications?: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

// 返回值介面
interface UseKitchenOperationsReturn {
  // 訂單操作
  startOrder: (orderId: number, staffId?: number) => Promise<boolean>;
  completeOrder: (orderId: number) => Promise<boolean>;
  pauseOrder: (orderId: number) => Promise<boolean>;
  cancelOrder: (orderId: number) => Promise<boolean>;
  updateOrderStatus: (orderId: number, status: KitchenOrderStatus) => Promise<boolean>;
  assignOrderToWorkstation: (orderId: number, workstation: WorkstationType, staffId?: number) => Promise<boolean>;
  completeOrderItem: (orderId: number, itemId: number) => Promise<boolean>;
  addOrderInstructions: (orderId: number, instructions: string) => Promise<boolean>;
  
  // 批量操作
  startMultipleOrders: (orderIds: number[]) => Promise<{ success: number[]; failed: number[] }>;
  completeMultipleOrders: (orderIds: number[]) => Promise<{ success: number[]; failed: number[] }>;
  
  // 工作站操作
  toggleWorkstation: (workstation: WorkstationType, active: boolean) => Promise<boolean>;
  assignStaffToWorkstation: (workstation: WorkstationType, staffId: number, staffName: string) => Promise<boolean>;
  unassignStaffFromWorkstation: (workstation: WorkstationType) => Promise<boolean>;
  updateWorkstationCapacity: (workstation: WorkstationType, capacity: number) => Promise<boolean>;
  
  // 計時器操作
  startTimer: (orderId: number, estimatedTime: number, itemId?: number) => Promise<boolean>;
  pauseTimer: (orderId: number) => Promise<boolean>;
  resumeTimer: (orderId: number) => Promise<boolean>;
  resetTimer: (orderId: number) => Promise<boolean>;
  
  // 數據同步
  syncWithServer: () => Promise<boolean>;
  refreshAllData: () => Promise<boolean>;
  
  // 狀態查詢
  canStartOrder: (orderId: number) => boolean;
  canCompleteOrder: (orderId: number) => boolean;
  canAssignToWorkstation: (orderId: number, workstation: WorkstationType) => boolean;
  getWorkstationLoad: (workstation: WorkstationType) => number;
  isWorkstationAvailable: (workstation: WorkstationType) => boolean;
  
  // 通知相關
  showSuccessNotification: (message: string) => void;
  showErrorNotification: (message: string) => void;
  showWarningNotification: (message: string) => void;
}

/**
 * 廚房操作 Hook
 * 提供所有廚房相關的操作方法，包括訂單管理、工作站控制、計時器操作等
 */
export const useKitchenOperations = (options: UseKitchenOperationsOptions = {}): UseKitchenOperationsReturn => {
  const {
    enableNotifications = true,
    autoRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
  } = options;

  const orders = useKitchenOrders();
  const workstations = useWorkstations();
  const {
    startOrder: storeStartOrder,
    completeOrder: storeCompleteOrder,
    updateOrderStatus: storeUpdateOrderStatus,
    assignOrderToWorkstation: storeAssignOrderToWorkstation,
    completeOrderItem: storeCompleteOrderItem,
    updateWorkstationStatus,
    assignStaffToWorkstation: storeAssignStaffToWorkstation,
    startTimer: storeStartTimer,
    pauseTimer: storePauseTimer,
    resumeTimer: storeResumeTimer,
    resetTimer: storeResetTimer,
    fetchOrders,
  } = useKitchenStore();

  // 通知方法
  const showSuccessNotification = useCallback((message: string) => {
    if (enableNotifications) {
      toast.success(message, {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#10b981',
          color: '#ffffff',
        },
      });
    }
  }, [enableNotifications]);

  const showErrorNotification = useCallback((message: string) => {
    if (enableNotifications) {
      toast.error(message, {
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#ffffff',
        },
      });
    }
  }, [enableNotifications]);

  const showWarningNotification = useCallback((message: string) => {
    if (enableNotifications) {
      toast.warning(message, {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#f59e0b',
          color: '#ffffff',
        },
      });
    }
  }, [enableNotifications]);

  // API 操作包裝器
  const performApiOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    successMessage: string,
    errorMessage: string
  ): Promise<boolean> => {
    try {
      const result = autoRetry 
        ? await retryApiCall(operation, maxRetries, retryDelay)
        : await operation();
      
      showSuccessNotification(successMessage);
      return true;
    } catch (error) {
      const errorMsg = handleKitchenApiError(error);
      showErrorNotification(`${errorMessage}: ${errorMsg}`);
      return false;
    }
  }, [autoRetry, maxRetries, retryDelay, showSuccessNotification, showErrorNotification]);

  // 訂單操作
  const startOrder = useCallback(async (orderId: number, staffId?: number): Promise<boolean> => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      showErrorNotification('找不到指定的訂單');
      return false;
    }

    if (order.status !== 'queued') {
      showWarningNotification('只能開始排隊中的訂單');
      return false;
    }

    return performApiOperation(
      () => kitchenApi.orders.startOrder(orderId, staffId),
      `訂單 #${order.orderNumber} 已開始製作`,
      '開始製作訂單失敗'
    );
  }, [orders, performApiOperation, showErrorNotification, showWarningNotification]);

  const completeOrder = useCallback(async (orderId: number): Promise<boolean> => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      showErrorNotification('找不到指定的訂單');
      return false;
    }

    if (order.status !== 'active') {
      showWarningNotification('只能完成製作中的訂單');
      return false;
    }

    return performApiOperation(
      () => kitchenApi.orders.completeOrder(orderId),
      `訂單 #${order.orderNumber} 已完成`,
      '完成訂單失敗'
    );
  }, [orders, performApiOperation, showErrorNotification, showWarningNotification]);

  const pauseOrder = useCallback(async (orderId: number): Promise<boolean> => {
    return performApiOperation(
      () => kitchenApi.orders.updateOrderStatus(orderId, 'queued'),
      '訂單已暫停',
      '暫停訂單失敗'
    );
  }, [performApiOperation]);

  const cancelOrder = useCallback(async (orderId: number): Promise<boolean> => {
    return performApiOperation(
      () => kitchenApi.orders.updateOrderStatus(orderId, 'completed'),
      '訂單已取消',
      '取消訂單失敗'
    );
  }, [performApiOperation]);

  const updateOrderStatus = useCallback(async (orderId: number, status: KitchenOrderStatus): Promise<boolean> => {
    return performApiOperation(
      () => kitchenApi.orders.updateOrderStatus(orderId, status),
      '訂單狀態已更新',
      '更新訂單狀態失敗'
    );
  }, [performApiOperation]);

  const assignOrderToWorkstation = useCallback(async (
    orderId: number, 
    workstation: WorkstationType, 
    staffId?: number
  ): Promise<boolean> => {
    const ws = workstations.find(w => w.type === workstation);
    if (!ws || !ws.isActive) {
      showErrorNotification('指定的工作站不可用');
      return false;
    }

    if (ws.currentOrders.length >= ws.capacity) {
      showWarningNotification('工作站已達到最大容量');
      return false;
    }

    return performApiOperation(
      () => kitchenApi.orders.assignToWorkstation(orderId, workstation, staffId),
      `訂單已分配到${workstation}工作站`,
      '分配工作站失敗'
    );
  }, [workstations, performApiOperation, showErrorNotification, showWarningNotification]);

  const completeOrderItem = useCallback(async (orderId: number, itemId: number): Promise<boolean> => {
    return performApiOperation(
      () => kitchenApi.orders.completeOrderItem(orderId, itemId),
      '訂單項目已完成',
      '完成訂單項目失敗'
    );
  }, [performApiOperation]);

  const addOrderInstructions = useCallback(async (orderId: number, instructions: string): Promise<boolean> => {
    return performApiOperation(
      () => kitchenApi.orders.addInstructions(orderId, instructions),
      '特殊說明已添加',
      '添加特殊說明失敗'
    );
  }, [performApiOperation]);

  // 批量操作
  const startMultipleOrders = useCallback(async (orderIds: number[]): Promise<{ success: number[]; failed: number[] }> => {
    const results = { success: [] as number[], failed: [] as number[] };
    
    for (const orderId of orderIds) {
      const success = await startOrder(orderId);
      if (success) {
        results.success.push(orderId);
      } else {
        results.failed.push(orderId);
      }
    }

    if (results.success.length > 0) {
      showSuccessNotification(`成功開始 ${results.success.length} 個訂單`);
    }
    if (results.failed.length > 0) {
      showErrorNotification(`${results.failed.length} 個訂單開始失敗`);
    }

    return results;
  }, [startOrder, showSuccessNotification, showErrorNotification]);

  const completeMultipleOrders = useCallback(async (orderIds: number[]): Promise<{ success: number[]; failed: number[] }> => {
    const results = { success: [] as number[], failed: [] as number[] };
    
    for (const orderId of orderIds) {
      const success = await completeOrder(orderId);
      if (success) {
        results.success.push(orderId);
      } else {
        results.failed.push(orderId);
      }
    }

    if (results.success.length > 0) {
      showSuccessNotification(`成功完成 ${results.success.length} 個訂單`);
    }
    if (results.failed.length > 0) {
      showErrorNotification(`${results.failed.length} 個訂單完成失敗`);
    }

    return results;
  }, [completeOrder, showSuccessNotification, showErrorNotification]);

  // 工作站操作
  const toggleWorkstation = useCallback(async (workstation: WorkstationType, active: boolean): Promise<boolean> => {
    return performApiOperation(
      () => kitchenApi.workstation.updateWorkstationStatus(workstation, { isActive: active }),
      `工作站已${active ? '啟用' : '停用'}`,
      '工作站狀態更新失敗'
    );
  }, [performApiOperation]);

  const assignStaffToWorkstation = useCallback(async (
    workstation: WorkstationType, 
    staffId: number, 
    staffName: string
  ): Promise<boolean> => {
    return performApiOperation(
      () => kitchenApi.workstation.assignStaff(workstation, staffId),
      `${staffName} 已分配到工作站`,
      '分配員工失敗'
    );
  }, [performApiOperation]);

  const unassignStaffFromWorkstation = useCallback(async (workstation: WorkstationType): Promise<boolean> => {
    const ws = workstations.find(w => w.type === workstation);
    if (!ws?.assignedStaffId) {
      showWarningNotification('該工作站沒有分配的員工');
      return false;
    }

    return performApiOperation(
      () => kitchenApi.workstation.unassignStaff(workstation, ws.assignedStaffId!),
      '員工已從工作站移除',
      '移除員工失敗'
    );
  }, [workstations, performApiOperation, showWarningNotification]);

  const updateWorkstationCapacity = useCallback(async (
    workstation: WorkstationType, 
    capacity: number
  ): Promise<boolean> => {
    return performApiOperation(
      () => kitchenApi.workstation.updateWorkstationStatus(workstation, { capacity }),
      '工作站容量已更新',
      '更新工作站容量失敗'
    );
  }, [performApiOperation]);

  // 計時器操作
  const startTimer = useCallback(async (
    orderId: number, 
    estimatedTime: number, 
    itemId?: number
  ): Promise<boolean> => {
    return performApiOperation(
      () => kitchenApi.timer.startTimer(orderId, estimatedTime, itemId),
      '計時器已開始',
      '啟動計時器失敗'
    );
  }, [performApiOperation]);

  const pauseTimer = useCallback(async (orderId: number): Promise<boolean> => {
    return performApiOperation(
      () => kitchenApi.timer.pauseTimer(orderId),
      '計時器已暫停',
      '暫停計時器失敗'
    );
  }, [performApiOperation]);

  const resumeTimer = useCallback(async (orderId: number): Promise<boolean> => {
    return performApiOperation(
      () => kitchenApi.timer.resumeTimer(orderId),
      '計時器已恢復',
      '恢復計時器失敗'
    );
  }, [performApiOperation]);

  const resetTimer = useCallback(async (orderId: number): Promise<boolean> => {
    return performApiOperation(
      () => kitchenApi.timer.resetTimer(orderId),
      '計時器已重置',
      '重置計時器失敗'
    );
  }, [performApiOperation]);

  // 數據同步
  const syncWithServer = useCallback(async (): Promise<boolean> => {
    return performApiOperation(
      () => fetchOrders(),
      '數據同步完成',
      '數據同步失敗'
    );
  }, [fetchOrders, performApiOperation]);

  const refreshAllData = useCallback(async (): Promise<boolean> => {
    return performApiOperation(
      async () => {
        await Promise.all([
          fetchOrders(),
          // 可以添加其他數據刷新邏輯
        ]);
      },
      '所有數據已刷新',
      '數據刷新失敗'
    );
  }, [fetchOrders, performApiOperation]);

  // 狀態查詢
  const canStartOrder = useCallback((orderId: number): boolean => {
    const order = orders.find(o => o.id === orderId);
    return order?.status === 'queued';
  }, [orders]);

  const canCompleteOrder = useCallback((orderId: number): boolean => {
    const order = orders.find(o => o.id === orderId);
    return order?.status === 'active';
  }, [orders]);

  const canAssignToWorkstation = useCallback((orderId: number, workstation: WorkstationType): boolean => {
    const ws = workstations.find(w => w.type === workstation);
    return ws ? ws.isActive && ws.currentOrders.length < ws.capacity : false;
  }, [workstations]);

  const getWorkstationLoad = useCallback((workstation: WorkstationType): number => {
    const ws = workstations.find(w => w.type === workstation);
    return ws ? (ws.currentOrders.length / ws.capacity) * 100 : 0;
  }, [workstations]);

  const isWorkstationAvailable = useCallback((workstation: WorkstationType): boolean => {
    const ws = workstations.find(w => w.type === workstation);
    return ws ? ws.isActive && ws.currentOrders.length < ws.capacity : false;
  }, [workstations]);

  return {
    // 訂單操作
    startOrder,
    completeOrder,
    pauseOrder,
    cancelOrder,
    updateOrderStatus,
    assignOrderToWorkstation,
    completeOrderItem,
    addOrderInstructions,
    
    // 批量操作
    startMultipleOrders,
    completeMultipleOrders,
    
    // 工作站操作
    toggleWorkstation,
    assignStaffToWorkstation,
    unassignStaffFromWorkstation,
    updateWorkstationCapacity,
    
    // 計時器操作
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    
    // 數據同步
    syncWithServer,
    refreshAllData,
    
    // 狀態查詢
    canStartOrder,
    canCompleteOrder,
    canAssignToWorkstation,
    getWorkstationLoad,
    isWorkstationAvailable,
    
    // 通知相關
    showSuccessNotification,
    showErrorNotification,
    showWarningNotification,
  };
};