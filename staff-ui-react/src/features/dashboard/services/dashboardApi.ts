import axios from 'axios';
import { env } from '@/config/env.config';

/**
 * Dashboard API Client
 * 處理員工儀表板相關的API呼叫
 */

const API_BASE_URL = env.API_BASE_URL || 'http://localhost:8081/api';

// 定義API回應類型
export interface DashboardData {
  todayStats: {
    ordersProcessed: number;
    averageProcessingTime: number;
    efficiencyRating: number;
  } | null;
  orders: {
    pending: number;
    confirmed: number;
    preparing: number;
    ready: number;
    total: number;
    recentOrders: any[];
  };
  kitchen: {
    queueLength: number;
    activeQueues: number;
    recentItems: any[];
  };
  team: {
    totalStaff: number;
    activeStaff: number;
    todayOrders: number;
    avgEfficiency: number;
  };
  notifications: {
    unread: number;
  };
  lastUpdated: number;
}

export interface RealTimeOverview {
  orders: {
    pending: number;
    confirmed: number;
    preparing: number;
    ready: number;
    total: number;
  };
  kitchen: {
    activeQueues: number;
    totalItems: number;
  };
  timestamp: number;
}

/**
 * 獲取完整儀表板數據
 * @param staffId 員工ID
 */
export const getDashboardData = async (staffId: string): Promise<DashboardData> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/staff/dashboard/${staffId}`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || 'Failed to fetch dashboard data');
    }
  } catch (error: any) {
    console.error('Dashboard API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load dashboard data');
  }
};

/**
 * 獲取即時概覽數據 (輕量級，用於頻繁輪詢)
 */
export const getRealTimeOverview = async (): Promise<RealTimeOverview> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/staff/overview`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || 'Failed to fetch overview data');
    }
  } catch (error: any) {
    console.error('Overview API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load overview data');
  }
};

/**
 * 獲取待處理訂單
 */
export const getPendingOrders = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/staff/orders/pending`);
    return response.data;
  } catch (error: any) {
    console.error('Pending Orders API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load pending orders');
  }
};

/**
 * 獲取進行中的訂單
 */
export const getInProgressOrders = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/staff/orders/in-progress`);
    return response.data;
  } catch (error: any) {
    console.error('In Progress Orders API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load in-progress orders');
  }
};

/**
 * Dashboard API Client 服務
 */
export const DashboardApi = {
  getDashboardData,
  getRealTimeOverview,
  getPendingOrders,
  getInProgressOrders,
};

export default DashboardApi;