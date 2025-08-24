import axios from 'axios';
import { Order, OrderStatus, OrderPriority, OrderFilters, OrderSearch } from '../store/ordersStore';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.0.113:8087';
const API_ENDPOINTS = {
  orders: `${API_BASE_URL}/api/staff/orders`,
  orderDetails: (id: string) => `${API_BASE_URL}/api/staff/orders/${id}`,
  orderStatus: (id: string) => `${API_BASE_URL}/api/staff/orders/${id}/status`,
  orderPriority: (id: string) => `${API_BASE_URL}/api/staff/orders/${id}/priority`,
  batchStatus: `${API_BASE_URL}/api/staff/orders/batch-status`,
  orderStats: `${API_BASE_URL}/api/staff/orders/statistics`,
  pendingOrders: `${API_BASE_URL}/api/staff/orders/pending`,
  inProgressOrders: `${API_BASE_URL}/api/staff/orders/in-progress`,
  completedOrders: `${API_BASE_URL}/api/staff/orders/completed`
};

// Request/Response Types
export interface OrdersListRequest {
  filters?: OrderFilters;
  search?: OrderSearch;
  pagination?: {
    page: number;
    size: number;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OrdersListResponse {
  orders: Order[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  statistics?: {
    totalByStatus: Record<OrderStatus, number>;
    averagePrepTime: number;
    totalRevenue: number;
  };
}

export interface OrderStatusUpdateRequest {
  status: OrderStatus;
  estimatedPrepTime?: number;
  notes?: string;
}

export interface OrderPriorityUpdateRequest {
  priority: OrderPriority;
  isUrgent?: boolean;
  reason?: string;
}

export interface BatchStatusUpdateRequest {
  orderIds: string[];
  status: OrderStatus;
  notes?: string;
}

export interface OrderStatisticsResponse {
  totalOrders: number;
  totalByStatus: Record<OrderStatus, number>;
  totalByPriority: Record<OrderPriority, number>;
  averagePrepTime: number;
  averageOrderValue: number;
  totalRevenue: number;
  ordersPerHour: number;
  completionRate: number;
  trendsData: {
    hourly: Array<{ hour: number; count: number; revenue: number }>;
    daily: Array<{ date: string; count: number; revenue: number }>;
  };
}

// Create axios instance with interceptors
const createApiClient = () => {
  const client = axios.create({
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Request interceptor for authentication
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('staff_auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('staff_auth_token');
        window.location.href = '/staff/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

const apiClient = createApiClient();

// Orders API Service Class
export class OrdersApiService {
  // Get orders with filters, search, and pagination
  static async getOrders(request: OrdersListRequest = {}): Promise<OrdersListResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.orders, request);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error(
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Failed to fetch orders'
      );
    }
  }

  // Get orders by specific status
  static async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    try {
      let endpoint = API_ENDPOINTS.orders;
      switch (status) {
        case OrderStatus.PENDING:
          endpoint = API_ENDPOINTS.pendingOrders;
          break;
        case OrderStatus.PREPARING:
          endpoint = API_ENDPOINTS.inProgressOrders;
          break;
        case OrderStatus.COMPLETED:
          endpoint = API_ENDPOINTS.completedOrders;
          break;
        default:
          endpoint = `${API_ENDPOINTS.orders}/status/${status}`;
      }

      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${status} orders:`, error);
      throw new Error(`Failed to fetch ${status} orders`);
    }
  }

  // Get order details by ID
  static async getOrderDetails(orderId: string): Promise<Order> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.orderDetails(orderId));
      return response.data;
    } catch (error) {
      console.error(`Error fetching order details for ${orderId}:`, error);
      throw new Error('Failed to fetch order details');
    }
  }

  // Update order status
  static async updateOrderStatus(
    orderId: string, 
    request: OrderStatusUpdateRequest
  ): Promise<Order> {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.orderStatus(orderId), 
        request
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating order status for ${orderId}:`, error);
      throw new Error(
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Failed to update order status'
      );
    }
  }

  // Update order priority
  static async updateOrderPriority(
    orderId: string, 
    request: OrderPriorityUpdateRequest
  ): Promise<Order> {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.orderPriority(orderId), 
        request
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating order priority for ${orderId}:`, error);
      throw new Error('Failed to update order priority');
    }
  }

  // Batch update order status
  static async batchUpdateOrderStatus(
    request: BatchStatusUpdateRequest
  ): Promise<Order[]> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.batchStatus, request);
      return response.data;
    } catch (error) {
      console.error('Error batch updating order status:', error);
      throw new Error('Failed to update order status for multiple orders');
    }
  }

  // Get order statistics
  static async getOrderStatistics(): Promise<OrderStatisticsResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.orderStats);
      return response.data;
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      throw new Error('Failed to fetch order statistics');
    }
  }

  // Advanced filtering and search
  static async searchOrders(
    query: string, 
    fields: string[] = ['orderNumber', 'customerName'],
    filters?: OrderFilters
  ): Promise<Order[]> {
    try {
      const request: OrdersListRequest = {
        search: { query, fields },
        filters
      };
      const response = await this.getOrders(request);
      return response.orders;
    } catch (error) {
      console.error('Error searching orders:', error);
      throw new Error('Failed to search orders');
    }
  }

  // Get orders by date range
  static async getOrdersByDateRange(
    startDate: string, 
    endDate: string
  ): Promise<Order[]> {
    try {
      const filters: OrderFilters = {
        dateRange: { start: startDate, end: endDate }
      };
      const response = await this.getOrders({ filters });
      return response.orders;
    } catch (error) {
      console.error('Error fetching orders by date range:', error);
      throw new Error('Failed to fetch orders by date range');
    }
  }

  // Get orders by customer
  static async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    try {
      const filters: OrderFilters = { customerId };
      const response = await this.getOrders({ filters });
      return response.orders;
    } catch (error) {
      console.error(`Error fetching orders for customer ${customerId}:`, error);
      throw new Error('Failed to fetch customer orders');
    }
  }

  // Get orders by table number
  static async getOrdersByTable(tableNumber: string): Promise<Order[]> {
    try {
      const filters: OrderFilters = { tableNumber };
      const response = await this.getOrders({ filters });
      return response.orders;
    } catch (error) {
      console.error(`Error fetching orders for table ${tableNumber}:`, error);
      throw new Error('Failed to fetch table orders');
    }
  }

  // Cancel order
  static async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.orderStatus(orderId), 
        { status: OrderStatus.CANCELLED, notes: reason }
      );
      return response.data;
    } catch (error) {
      console.error(`Error cancelling order ${orderId}:`, error);
      throw new Error('Failed to cancel order');
    }
  }

  // Complete order
  static async completeOrder(orderId: string): Promise<Order> {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.orderStatus(orderId), 
        { status: OrderStatus.COMPLETED }
      );
      return response.data;
    } catch (error) {
      console.error(`Error completing order ${orderId}:`, error);
      throw new Error('Failed to complete order');
    }
  }

  // Mark order as ready
  static async markOrderReady(orderId: string): Promise<Order> {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.orderStatus(orderId), 
        { status: OrderStatus.READY }
      );
      return response.data;
    } catch (error) {
      console.error(`Error marking order ${orderId} as ready:`, error);
      throw new Error('Failed to mark order as ready');
    }
  }

  // Start preparing order
  static async startPreparing(
    orderId: string, 
    estimatedPrepTime?: number
  ): Promise<Order> {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.orderStatus(orderId), 
        { status: OrderStatus.PREPARING, estimatedPrepTime }
      );
      return response.data;
    } catch (error) {
      console.error(`Error starting preparation for order ${orderId}:`, error);
      throw new Error('Failed to start order preparation');
    }
  }

  // Confirm order
  static async confirmOrder(orderId: string): Promise<Order> {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.orderStatus(orderId), 
        { status: OrderStatus.CONFIRMED }
      );
      return response.data;
    } catch (error) {
      console.error(`Error confirming order ${orderId}:`, error);
      throw new Error('Failed to confirm order');
    }
  }

  // Set order as urgent
  static async markOrderUrgent(
    orderId: string, 
    urgent: boolean = true, 
    reason?: string
  ): Promise<Order> {
    try {
      const priority = urgent ? OrderPriority.URGENT : OrderPriority.NORMAL;
      const response = await apiClient.put(
        API_ENDPOINTS.orderPriority(orderId), 
        { priority, isUrgent: urgent, reason }
      );
      return response.data;
    } catch (error) {
      console.error(`Error marking order ${orderId} as urgent:`, error);
      throw new Error('Failed to update order urgency');
    }
  }

  // Health check for orders service
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/api/health`);
      return response.status === 200;
    } catch (error) {
      console.error('Orders service health check failed:', error);
      return false;
    }
  }

  // Retry failed request with exponential backoff
  static async retryRequest<T>(
    requestFn: () => Promise<T>, 
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) break;
        
        // Exponential backoff delay
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.warn(`Request attempt ${attempt} failed, retrying in ${delay}ms...`);
      }
    }
    
    throw lastError!;
  }
}

// Default export
export default OrdersApiService;

// Convenience functions for common operations
export const ordersApi = {
  // Quick status updates
  pending: (orderId: string) => OrdersApiService.updateOrderStatus(orderId, { status: OrderStatus.PENDING }),
  confirm: (orderId: string) => OrdersApiService.confirmOrder(orderId),
  startPreparing: (orderId: string, estimatedTime?: number) => OrdersApiService.startPreparing(orderId, estimatedTime),
  markReady: (orderId: string) => OrdersApiService.markOrderReady(orderId),
  complete: (orderId: string) => OrdersApiService.completeOrder(orderId),
  cancel: (orderId: string, reason?: string) => OrdersApiService.cancelOrder(orderId, reason),
  
  // Quick priority updates
  setUrgent: (orderId: string) => OrdersApiService.markOrderUrgent(orderId, true),
  removeUrgent: (orderId: string) => OrdersApiService.markOrderUrgent(orderId, false),
  setHighPriority: (orderId: string) => OrdersApiService.updateOrderPriority(orderId, { priority: OrderPriority.HIGH }),
  setNormalPriority: (orderId: string) => OrdersApiService.updateOrderPriority(orderId, { priority: OrderPriority.NORMAL }),
  
  // Quick filters
  getToday: () => {
    const today = new Date().toISOString().split('T')[0];
    return OrdersApiService.getOrdersByDateRange(today, today);
  },
  getPending: () => OrdersApiService.getOrdersByStatus(OrderStatus.PENDING),
  getInProgress: () => OrdersApiService.getOrdersByStatus(OrderStatus.PREPARING),
  getCompleted: () => OrdersApiService.getOrdersByStatus(OrderStatus.COMPLETED)
};

// Export types for use in components
export type {
  OrdersListRequest,
  OrdersListResponse,
  OrderStatusUpdateRequest,
  OrderPriorityUpdateRequest,
  BatchStatusUpdateRequest,
  OrderStatisticsResponse
};