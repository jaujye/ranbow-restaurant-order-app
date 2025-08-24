import axios from 'axios';
import { KitchenOrder, KitchenOrderStatus, WorkstationType, KitchenStats, StaffPerformance } from '../store/kitchenStore';

// API 基礎配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

const kitchenApiClient = axios.create({
  baseURL: `${API_BASE_URL}/staff/kitchen`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器 - 添加認證 token
kitchenApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('staff_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 響應攔截器 - 統一錯誤處理
kitchenApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Kitchen API Error:', error);
    
    if (error.response?.status === 401) {
      // 認證失效，跳轉到登入頁面
      localStorage.removeItem('staff_token');
      window.location.href = '/staff/login';
    }
    
    return Promise.reject(error);
  }
);

// API 介面定義
export interface KitchenApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface GetOrdersResponse {
  orders: KitchenOrder[];
  total: number;
  page: number;
  pageSize: number;
}

export interface KitchenStatsResponse {
  stats: KitchenStats;
  workstationUtilization: Record<WorkstationType, number>;
  recentPerformance: StaffPerformance[];
}

// 訂單相關 API
export const kitchenOrdersApi = {
  /**
   * 獲取廚房訂單列表
   * @param filters 篩選條件
   */
  async getOrders(filters?: {
    status?: KitchenOrderStatus[];
    workstation?: WorkstationType;
    priority?: string;
    page?: number;
    pageSize?: number;
  }): Promise<KitchenApiResponse<GetOrdersResponse>> {
    const params = new URLSearchParams();
    
    if (filters?.status) {
      filters.status.forEach(status => params.append('status', status));
    }
    if (filters?.workstation) params.append('workstation', filters.workstation);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    
    const response = await kitchenApiClient.get(`/orders?${params.toString()}`);
    return response.data;
  },

  /**
   * 獲取單個訂單詳情
   * @param orderId 訂單 ID
   */
  async getOrderById(orderId: number): Promise<KitchenApiResponse<KitchenOrder>> {
    const response = await kitchenApiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * 更新訂單狀態
   * @param orderId 訂單 ID
   * @param status 新狀態
   */
  async updateOrderStatus(
    orderId: number, 
    status: KitchenOrderStatus
  ): Promise<KitchenApiResponse<KitchenOrder>> {
    const response = await kitchenApiClient.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  /**
   * 開始製作訂單
   * @param orderId 訂單 ID
   * @param staffId 負責員工 ID
   */
  async startOrder(orderId: number, staffId?: number): Promise<KitchenApiResponse<KitchenOrder>> {
    const response = await kitchenApiClient.post(`/orders/${orderId}/start`, { staffId });
    return response.data;
  },

  /**
   * 完成訂單
   * @param orderId 訂單 ID
   */
  async completeOrder(orderId: number): Promise<KitchenApiResponse<KitchenOrder>> {
    const response = await kitchenApiClient.post(`/orders/${orderId}/complete`);
    return response.data;
  },

  /**
   * 分配訂單到工作站
   * @param orderId 訂單 ID
   * @param workstation 工作站類型
   * @param staffId 負責員工 ID (可選)
   */
  async assignToWorkstation(
    orderId: number,
    workstation: WorkstationType,
    staffId?: number
  ): Promise<KitchenApiResponse<KitchenOrder>> {
    const response = await kitchenApiClient.put(`/orders/${orderId}/assign`, {
      workstation,
      staffId,
    });
    return response.data;
  },

  /**
   * 完成訂單項目
   * @param orderId 訂單 ID
   * @param itemId 項目 ID
   */
  async completeOrderItem(
    orderId: number,
    itemId: number
  ): Promise<KitchenApiResponse<KitchenOrder>> {
    const response = await kitchenApiClient.put(`/orders/${orderId}/items/${itemId}/complete`);
    return response.data;
  },

  /**
   * 添加特殊說明
   * @param orderId 訂單 ID
   * @param instructions 特殊說明
   */
  async addInstructions(
    orderId: number,
    instructions: string
  ): Promise<KitchenApiResponse<KitchenOrder>> {
    const response = await kitchenApiClient.put(`/orders/${orderId}/instructions`, {
      instructions,
    });
    return response.data;
  },
};

// 計時器相關 API
export const kitchenTimerApi = {
  /**
   * 開始計時器
   * @param orderId 訂單 ID
   * @param estimatedTime 預估時間(秒)
   * @param itemId 項目 ID (可選)
   */
  async startTimer(
    orderId: number,
    estimatedTime: number,
    itemId?: number
  ): Promise<KitchenApiResponse<{ timerId: string; startTime: Date }>> {
    const response = await kitchenApiClient.post(`/timer/${orderId}/start`, {
      estimatedTime,
      itemId,
    });
    return response.data;
  },

  /**
   * 暫停計時器
   * @param orderId 訂單 ID
   */
  async pauseTimer(orderId: number): Promise<KitchenApiResponse> {
    const response = await kitchenApiClient.put(`/timer/${orderId}/pause`);
    return response.data;
  },

  /**
   * 恢復計時器
   * @param orderId 訂單 ID
   */
  async resumeTimer(orderId: number): Promise<KitchenApiResponse> {
    const response = await kitchenApiClient.put(`/timer/${orderId}/resume`);
    return response.data;
  },

  /**
   * 重置計時器
   * @param orderId 訂單 ID
   */
  async resetTimer(orderId: number): Promise<KitchenApiResponse> {
    const response = await kitchenApiClient.delete(`/timer/${orderId}`);
    return response.data;
  },

  /**
   * 獲取所有活動計時器
   */
  async getActiveTimers(): Promise<KitchenApiResponse<any[]>> {
    const response = await kitchenApiClient.get('/timers');
    return response.data;
  },
};

// 工作站相關 API
export const kitchenWorkstationApi = {
  /**
   * 獲取所有工作站狀態
   */
  async getWorkstations(): Promise<KitchenApiResponse<any[]>> {
    const response = await kitchenApiClient.get('/workstations');
    return response.data;
  },

  /**
   * 更新工作站狀態
   * @param workstation 工作站類型
   * @param status 狀態更新
   */
  async updateWorkstationStatus(
    workstation: WorkstationType,
    status: { isActive?: boolean; capacity?: number }
  ): Promise<KitchenApiResponse> {
    const response = await kitchenApiClient.put(`/workstations/${workstation}`, status);
    return response.data;
  },

  /**
   * 分配員工到工作站
   * @param workstation 工作站類型
   * @param staffId 員工 ID
   */
  async assignStaff(
    workstation: WorkstationType,
    staffId: number
  ): Promise<KitchenApiResponse> {
    const response = await kitchenApiClient.put(`/workstations/${workstation}/assign`, {
      staffId,
    });
    return response.data;
  },

  /**
   * 從工作站移除員工
   * @param workstation 工作站類型
   * @param staffId 員工 ID
   */
  async unassignStaff(
    workstation: WorkstationType,
    staffId: number
  ): Promise<KitchenApiResponse> {
    const response = await kitchenApiClient.delete(
      `/workstations/${workstation}/assign/${staffId}`
    );
    return response.data;
  },
};

// 統計和報告 API
export const kitchenStatsApi = {
  /**
   * 獲取廚房統計數據
   * @param period 統計週期 ('today' | 'week' | 'month')
   */
  async getKitchenStats(
    period: 'today' | 'week' | 'month' = 'today'
  ): Promise<KitchenApiResponse<KitchenStatsResponse>> {
    const response = await kitchenApiClient.get(`/stats?period=${period}`);
    return response.data;
  },

  /**
   * 獲取員工績效數據
   * @param period 統計週期
   * @param workstation 工作站篩選 (可選)
   */
  async getStaffPerformance(
    period: 'today' | 'week' | 'month' = 'today',
    workstation?: WorkstationType
  ): Promise<KitchenApiResponse<StaffPerformance[]>> {
    const params = new URLSearchParams({ period });
    if (workstation) params.append('workstation', workstation);
    
    const response = await kitchenApiClient.get(`/stats/staff?${params.toString()}`);
    return response.data;
  },

  /**
   * 獲取工作站利用率
   * @param period 統計週期
   */
  async getWorkstationUtilization(
    period: 'today' | 'week' | 'month' = 'today'
  ): Promise<KitchenApiResponse<Record<WorkstationType, number>>> {
    const response = await kitchenApiClient.get(`/stats/workstations?period=${period}`);
    return response.data;
  },

  /**
   * 獲取訂單完成時間分析
   * @param period 統計週期
   */
  async getCompletionTimeAnalysis(
    period: 'today' | 'week' | 'month' = 'today'
  ): Promise<KitchenApiResponse<{
    averageTime: number;
    medianTime: number;
    percentiles: { p50: number; p90: number; p95: number; p99: number };
    byWorkstation: Record<WorkstationType, number>;
  }>> {
    const response = await kitchenApiClient.get(`/stats/completion-time?period=${period}`);
    return response.data;
  },
};

// 設定相關 API
export const kitchenSettingsApi = {
  /**
   * 獲取廚房設定
   */
  async getSettings(): Promise<KitchenApiResponse<any>> {
    const response = await kitchenApiClient.get('/settings');
    return response.data;
  },

  /**
   * 更新廚房設定
   * @param settings 設定更新
   */
  async updateSettings(settings: any): Promise<KitchenApiResponse> {
    const response = await kitchenApiClient.put('/settings', settings);
    return response.data;
  },

  /**
   * 重置設定為預設值
   */
  async resetSettings(): Promise<KitchenApiResponse> {
    const response = await kitchenApiClient.post('/settings/reset');
    return response.data;
  },
};

// WebSocket 相關 API
export const kitchenWebSocketApi = {
  /**
   * 獲取 WebSocket 連接 URL
   */
  getWebSocketUrl(): string {
    const wsBaseUrl = API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://');
    return `${wsBaseUrl}/staff/kitchen/ws`;
  },

  /**
   * 創建 WebSocket 連接
   */
  createConnection(): WebSocket {
    const url = this.getWebSocketUrl();
    const token = localStorage.getItem('staff_token');
    
    // 將 token 作為查詢參數傳遞
    const wsUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url;
    
    return new WebSocket(wsUrl);
  },
};

// 健康檢查 API
export const kitchenHealthApi = {
  /**
   * 檢查廚房 API 健康狀態
   */
  async checkHealth(): Promise<KitchenApiResponse<{
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    services: {
      database: 'up' | 'down';
      redis: 'up' | 'down';
      websocket: 'up' | 'down';
    };
  }>> {
    const response = await kitchenApiClient.get('/health');
    return response.data;
  },

  /**
   * 獲取系統版本資訊
   */
  async getVersionInfo(): Promise<KitchenApiResponse<{
    version: string;
    buildTime: string;
    environment: string;
  }>> {
    const response = await kitchenApiClient.get('/version');
    return response.data;
  },
};

// 導出所有 API
export default {
  orders: kitchenOrdersApi,
  timer: kitchenTimerApi,
  workstation: kitchenWorkstationApi,
  stats: kitchenStatsApi,
  settings: kitchenSettingsApi,
  websocket: kitchenWebSocketApi,
  health: kitchenHealthApi,
};

// 錯誤處理工具函數
export const handleKitchenApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return '系統錯誤，請稍後再試';
};

// API 重試工具函數
export const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError!;
};