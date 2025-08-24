import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

// 廚房訂單狀態類型
export type KitchenOrderStatus = 'queued' | 'active' | 'overdue' | 'completed';

// 工作站類型
export type WorkstationType = 'cold' | 'hot' | 'grill' | 'prep' | 'dessert' | 'beverage';

// 廚房訂單接口
export interface KitchenOrder {
  id: number;
  orderNumber: string;
  customerName?: string;
  items: KitchenOrderItem[];
  status: KitchenOrderStatus;
  priority: 'normal' | 'high' | 'urgent';
  estimatedTime: number; // 預估製作時間(分鐘)
  actualStartTime?: Date;
  actualEndTime?: Date;
  assignedWorkstation?: WorkstationType;
  assignedStaffId?: number;
  assignedStaffName?: string;
  specialInstructions?: string;
  allergenAlerts?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 廚房訂單項目
export interface KitchenOrderItem {
  id: number;
  menuItemId: number;
  name: string;
  quantity: number;
  specialRequests?: string;
  workstation: WorkstationType;
  estimatedTime: number;
  status: 'pending' | 'preparing' | 'ready';
  preparationSteps?: PreparationStep[];
}

// 準備步驟
export interface PreparationStep {
  id: string;
  description: string;
  completed: boolean;
  estimatedTime: number; // 秒
  actualTime?: number;
}

// 烹飪計時器
export interface CookingTimer {
  orderId: number;
  itemId?: number;
  startTime: Date;
  estimatedDuration: number; // 秒
  remainingTime: number;
  isRunning: boolean;
  isPaused: boolean;
  isOverdue: boolean;
  alertThreshold: number; // 剩餘時間警告閾值(秒)
}

// 工作站狀態
export interface WorkstationStatus {
  type: WorkstationType;
  name: string;
  isActive: boolean;
  assignedStaffId?: number;
  assignedStaffName?: string;
  currentOrders: number[];
  capacity: number;
  efficiency: number; // 工作效率百分比
}

// 廚房統計數據
export interface KitchenStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  overdueOrders: number;
  averageCompletionTime: number;
  workstationUtilization: Record<WorkstationType, number>;
  staffPerformance: StaffPerformance[];
}

// 員工績效
export interface StaffPerformance {
  staffId: number;
  staffName: string;
  ordersCompleted: number;
  averageTime: number;
  efficiency: number;
  workstation: WorkstationType;
}

// 廚房設定
export interface KitchenSettings {
  autoRefreshInterval: number; // 毫秒
  soundEnabled: boolean;
  alertVolume: number;
  overdueThreshold: number; // 分鐘
  language: 'zh-TW' | 'en';
  displayMode: 'workstation' | 'unified' | 'timeline';
  showCustomerNames: boolean;
  showEstimatedTimes: boolean;
}

// 廚房狀態接口
export interface KitchenState {
  // 數據狀態
  orders: KitchenOrder[];
  timers: CookingTimer[];
  workstations: WorkstationStatus[];
  stats: KitchenStats | null;
  settings: KitchenSettings;
  
  // UI 狀態
  isLoading: boolean;
  error: string | null;
  selectedOrderId: number | null;
  selectedWorkstation: WorkstationType | null;
  isFullscreen: boolean;
  
  // WebSocket 狀態
  isConnected: boolean;
  lastUpdate: Date | null;
  
  // Actions - 訂單管理
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: number, status: KitchenOrderStatus) => Promise<void>;
  assignOrderToWorkstation: (orderId: number, workstation: WorkstationType, staffId?: number) => Promise<void>;
  startOrder: (orderId: number) => Promise<void>;
  completeOrder: (orderId: number) => Promise<void>;
  completeOrderItem: (orderId: number, itemId: number) => Promise<void>;
  
  // Actions - 計時器管理
  startTimer: (orderId: number, estimatedDuration: number, itemId?: number) => void;
  pauseTimer: (orderId: number) => void;
  resumeTimer: (orderId: number) => void;
  resetTimer: (orderId: number) => void;
  updateTimers: () => void;
  
  // Actions - 工作站管理
  updateWorkstationStatus: (type: WorkstationType, updates: Partial<WorkstationStatus>) => void;
  assignStaffToWorkstation: (staffId: number, staffName: string, workstation: WorkstationType) => void;
  
  // Actions - 設定管理
  updateSettings: (settings: Partial<KitchenSettings>) => void;
  
  // Actions - UI 控制
  selectOrder: (orderId: number | null) => void;
  selectWorkstation: (workstation: WorkstationType | null) => void;
  toggleFullscreen: () => void;
  clearError: () => void;
  
  // Actions - WebSocket
  setConnected: (connected: boolean) => void;
  handleWebSocketMessage: (message: any) => void;
}

// 預設工作站配置
const defaultWorkstations: WorkstationStatus[] = [
  { type: 'cold', name: '冷盤區', isActive: true, currentOrders: [], capacity: 5, efficiency: 100 },
  { type: 'hot', name: '熱食區', isActive: true, currentOrders: [], capacity: 8, efficiency: 100 },
  { type: 'grill', name: '燒烤區', isActive: true, currentOrders: [], capacity: 6, efficiency: 100 },
  { type: 'prep', name: '備料區', isActive: true, currentOrders: [], capacity: 4, efficiency: 100 },
  { type: 'dessert', name: '甜點區', isActive: true, currentOrders: [], capacity: 3, efficiency: 100 },
  { type: 'beverage', name: '飲品區', isActive: true, currentOrders: [], capacity: 10, efficiency: 100 },
];

// 預設設定
const defaultSettings: KitchenSettings = {
  autoRefreshInterval: 5000,
  soundEnabled: true,
  alertVolume: 0.8,
  overdueThreshold: 30,
  language: 'zh-TW',
  displayMode: 'workstation',
  showCustomerNames: true,
  showEstimatedTimes: true,
};

// 創建廚房狀態管理
export const useKitchenStore = create<KitchenState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // 初始狀態
      orders: [],
      timers: [],
      workstations: defaultWorkstations,
      stats: null,
      settings: defaultSettings,
      isLoading: false,
      error: null,
      selectedOrderId: null,
      selectedWorkstation: null,
      isFullscreen: false,
      isConnected: false,
      lastUpdate: null,

      // 訂單管理 Actions
      fetchOrders: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // 實現 API 呼叫獲取真實廚房隊列數據
          const response = await fetch('http://localhost:8081/api/staff/kitchen/queue', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (!response.ok) throw new Error('Failed to fetch kitchen queue');
          
          const data = await response.json();
          
          // 轉換後端數據格式為前端期望的格式
          const orders: KitchenOrder[] = [];
          
          // 處理排隊中的訂單
          if (data.queued) {
            data.queued.forEach((kitchenOrder: any) => {
              orders.push({
                id: parseInt(kitchenOrder.kitchenOrderId?.replace(/\D/g, '') || '0'),
                orderNumber: kitchenOrder.orderId || 'UNKNOWN',
                customerName: '客戶', // 後端可能需要增加客戶信息
                status: 'queued',
                priority: 'normal',
                estimatedTime: kitchenOrder.estimatedCookingMinutes || 15,
                items: [{
                  id: 1,
                  menuItemId: 1,
                  name: '訂單項目',
                  quantity: 1,
                  workstation: 'hot',
                  estimatedTime: kitchenOrder.estimatedCookingMinutes || 15,
                  status: 'pending',
                }],
                createdAt: new Date(kitchenOrder.createdAt || Date.now()),
                updatedAt: new Date(kitchenOrder.updatedAt || Date.now()),
              });
            });
          }
          
          // 處理製作中的訂單
          if (data.active) {
            data.active.forEach((kitchenOrder: any) => {
              orders.push({
                id: parseInt(kitchenOrder.kitchenOrderId?.replace(/\D/g, '') || '0'),
                orderNumber: kitchenOrder.orderId || 'UNKNOWN',
                customerName: '客戶',
                status: 'active',
                priority: 'normal',
                estimatedTime: kitchenOrder.estimatedCookingMinutes || 15,
                actualStartTime: kitchenOrder.startTime ? new Date(kitchenOrder.startTime) : new Date(),
                assignedStaffId: kitchenOrder.assignedStaffId ? 1 : undefined,
                assignedStaffName: kitchenOrder.assignedStaffId ? '廚師' : undefined,
                items: [{
                  id: 1,
                  menuItemId: 1,
                  name: '訂單項目',
                  quantity: 1,
                  workstation: 'hot',
                  estimatedTime: kitchenOrder.estimatedCookingMinutes || 15,
                  status: 'preparing',
                }],
                createdAt: new Date(kitchenOrder.createdAt || Date.now()),
                updatedAt: new Date(kitchenOrder.updatedAt || Date.now()),
              });
            });
          }
          
          set({ orders: orders, lastUpdate: new Date() });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '獲取訂單失敗' });
        } finally {
          set({ isLoading: false });
        }
      },

      updateOrderStatus: async (orderId: number, status: KitchenOrderStatus) => {
        try {
          // TODO: 實現 API 呼叫
          // await kitchenApi.updateOrderStatus(orderId, status);
          
          set(state => ({
            orders: state.orders.map(order =>
              order.id === orderId
                ? { 
                    ...order, 
                    status, 
                    updatedAt: new Date(),
                    ...(status === 'active' && !order.actualStartTime ? { actualStartTime: new Date() } : {}),
                    ...(status === 'completed' ? { actualEndTime: new Date() } : {}),
                  }
                : order
            ),
            lastUpdate: new Date(),
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '更新訂單狀態失敗' });
        }
      },

      assignOrderToWorkstation: async (orderId: number, workstation: WorkstationType, staffId?: number) => {
        try {
          // TODO: 實現 API 呼叫
          
          const staffInfo = staffId ? { assignedStaffId: staffId, assignedStaffName: `員工${staffId}` } : {};
          
          set(state => ({
            orders: state.orders.map(order =>
              order.id === orderId
                ? { ...order, assignedWorkstation: workstation, ...staffInfo, updatedAt: new Date() }
                : order
            ),
            workstations: state.workstations.map(ws =>
              ws.type === workstation
                ? { ...ws, currentOrders: [...ws.currentOrders, orderId] }
                : ws
            ),
            lastUpdate: new Date(),
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '分配工作站失敗' });
        }
      },

      startOrder: async (orderId: number) => {
        try {
          await get().updateOrderStatus(orderId, 'active');
          
          // 找到訂單並啟動計時器
          const order = get().orders.find(o => o.id === orderId);
          if (order) {
            get().startTimer(orderId, order.estimatedTime * 60); // 轉換為秒
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '開始製作失敗' });
        }
      },

      completeOrder: async (orderId: number) => {
        try {
          await get().updateOrderStatus(orderId, 'completed');
          get().resetTimer(orderId);
          
          // 從工作站移除
          set(state => ({
            workstations: state.workstations.map(ws => ({
              ...ws,
              currentOrders: ws.currentOrders.filter(id => id !== orderId),
            })),
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '完成訂單失敗' });
        }
      },

      completeOrderItem: async (orderId: number, itemId: number) => {
        try {
          // TODO: 實現 API 呼叫
          
          set(state => ({
            orders: state.orders.map(order =>
              order.id === orderId
                ? {
                    ...order,
                    items: order.items.map(item =>
                      item.id === itemId ? { ...item, status: 'ready' as const } : item
                    ),
                    updatedAt: new Date(),
                  }
                : order
            ),
            lastUpdate: new Date(),
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '完成項目失敗' });
        }
      },

      // 計時器管理
      startTimer: (orderId: number, estimatedDuration: number, itemId?: number) => {
        const newTimer: CookingTimer = {
          orderId,
          itemId,
          startTime: new Date(),
          estimatedDuration,
          remainingTime: estimatedDuration,
          isRunning: true,
          isPaused: false,
          isOverdue: false,
          alertThreshold: Math.min(300, estimatedDuration * 0.1), // 5分鐘或10%，取較小值
        };

        set(state => ({
          timers: state.timers.filter(t => !(t.orderId === orderId && t.itemId === itemId)).concat(newTimer),
        }));
      },

      pauseTimer: (orderId: number) => {
        set(state => ({
          timers: state.timers.map(timer =>
            timer.orderId === orderId ? { ...timer, isPaused: true, isRunning: false } : timer
          ),
        }));
      },

      resumeTimer: (orderId: number) => {
        set(state => ({
          timers: state.timers.map(timer =>
            timer.orderId === orderId ? { ...timer, isPaused: false, isRunning: true } : timer
          ),
        }));
      },

      resetTimer: (orderId: number) => {
        set(state => ({
          timers: state.timers.filter(timer => timer.orderId !== orderId),
        }));
      },

      updateTimers: () => {
        const now = new Date();
        
        set(state => ({
          timers: state.timers.map(timer => {
            if (!timer.isRunning || timer.isPaused) return timer;
            
            const elapsed = Math.floor((now.getTime() - timer.startTime.getTime()) / 1000);
            const remainingTime = Math.max(0, timer.estimatedDuration - elapsed);
            const isOverdue = remainingTime === 0;
            
            return {
              ...timer,
              remainingTime,
              isOverdue,
            };
          }),
        }));

        // 檢查逾時訂單
        const { timers, orders } = get();
        const overdueOrderIds = timers.filter(t => t.isOverdue).map(t => t.orderId);
        
        if (overdueOrderIds.length > 0) {
          set({
            orders: orders.map(order =>
              overdueOrderIds.includes(order.id) ? { ...order, status: 'overdue' as const } : order
            ),
          });
        }
      },

      // 工作站管理
      updateWorkstationStatus: (type: WorkstationType, updates: Partial<WorkstationStatus>) => {
        set(state => ({
          workstations: state.workstations.map(ws =>
            ws.type === type ? { ...ws, ...updates } : ws
          ),
        }));
      },

      assignStaffToWorkstation: (staffId: number, staffName: string, workstation: WorkstationType) => {
        get().updateWorkstationStatus(workstation, {
          assignedStaffId: staffId,
          assignedStaffName: staffName,
        });
      },

      // 設定管理
      updateSettings: (settings: Partial<KitchenSettings>) => {
        set(state => ({
          settings: { ...state.settings, ...settings },
        }));
      },

      // UI 控制
      selectOrder: (orderId: number | null) => {
        set({ selectedOrderId: orderId });
      },

      selectWorkstation: (workstation: WorkstationType | null) => {
        set({ selectedWorkstation: workstation });
      },

      toggleFullscreen: () => {
        set(state => ({ isFullscreen: !state.isFullscreen }));
      },

      clearError: () => {
        set({ error: null });
      },

      // WebSocket
      setConnected: (connected: boolean) => {
        set({ isConnected: connected });
      },

      handleWebSocketMessage: (message: any) => {
        switch (message.type) {
          case 'ORDER_CREATED':
            set(state => ({
              orders: [...state.orders, message.data],
              lastUpdate: new Date(),
            }));
            break;
            
          case 'ORDER_UPDATED':
            set(state => ({
              orders: state.orders.map(order =>
                order.id === message.data.id ? message.data : order
              ),
              lastUpdate: new Date(),
            }));
            break;
            
          case 'ORDER_DELETED':
            set(state => ({
              orders: state.orders.filter(order => order.id !== message.data.id),
              lastUpdate: new Date(),
            }));
            break;
            
          default:
            console.log('未知的 WebSocket 消息類型:', message.type);
        }
      },
    })),
    {
      name: 'kitchen-store',
      partialize: (state) => ({
        settings: state.settings,
        selectedWorkstation: state.selectedWorkstation,
      }),
    }
  )
);

// 計時器更新間隔
let timerInterval: NodeJS.Timeout | null = null;

// 開始計時器更新循環
export const startTimerUpdates = () => {
  if (timerInterval) return;
  
  timerInterval = setInterval(() => {
    useKitchenStore.getState().updateTimers();
  }, 1000);
};

// 停止計時器更新循環
export const stopTimerUpdates = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

// 選擇器 - 方便組件使用
export const useKitchenOrders = () => useKitchenStore(state => state.orders);
export const useKitchenTimers = () => useKitchenStore(state => state.timers);
export const useWorkstations = () => useKitchenStore(state => state.workstations);
export const useKitchenSettings = () => useKitchenStore(state => state.settings);
export const useKitchenStats = () => useKitchenStore(state => state.stats);
export const useKitchenLoading = () => useKitchenStore(state => state.isLoading);
export const useKitchenError = () => useKitchenStore(state => state.error);
export const useSelectedOrder = () => useKitchenStore(state => state.selectedOrderId);
export const useSelectedWorkstation = () => useKitchenStore(state => state.selectedWorkstation);