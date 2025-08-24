import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

// Types for Order Management
export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
  category?: string;
}

export interface CustomerInfo {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  estimatedPrepTime?: number;
  actualPrepTime?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  specialInstructions?: string;
  tableNumber?: string;
  isUrgent?: boolean;
  priority: OrderPriority;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed', 
  PREPARING = 'preparing',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum OrderPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Filter and Search Types
export interface OrderFilters {
  status?: OrderStatus[];
  paymentStatus?: PaymentStatus[];
  priority?: OrderPriority[];
  dateRange?: {
    start: string;
    end: string;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  tableNumber?: string;
  customerId?: string;
}

export interface OrderSearch {
  query: string;
  fields: ('orderNumber' | 'customerName' | 'customerPhone' | 'items')[];
}

// Store State Interface
interface OrdersState {
  // Orders Data
  orders: Order[];
  selectedOrder: Order | null;
  
  // Loading States
  loading: boolean;
  updating: Record<string, boolean>; // Track individual order updates
  
  // Error States
  error: string | null;
  
  // Filters and Search
  filters: OrderFilters;
  search: OrderSearch;
  
  // View Settings
  viewMode: 'list' | 'grid' | 'kanban';
  sortBy: 'createdAt' | 'updatedAt' | 'totalAmount' | 'estimatedPrepTime';
  sortOrder: 'asc' | 'desc';
  
  // Real-time Updates
  isConnected: boolean;
  lastUpdate: string | null;
  
  // Pagination
  pagination: {
    page: number;
    size: number;
    total: number;
    hasMore: boolean;
  };
}

// Store Actions Interface
interface OrdersActions {
  // Data Loading
  loadOrders: (filters?: OrderFilters) => Promise<void>;
  loadOrdersByStatus: (status: OrderStatus) => Promise<void>;
  loadOrderDetails: (orderId: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
  
  // Order Status Management
  updateOrderStatus: (orderId: string, status: OrderStatus, optimistic?: boolean) => Promise<void>;
  updateMultipleOrderStatus: (orderIds: string[], status: OrderStatus) => Promise<void>;
  
  // Order Priority Management
  updateOrderPriority: (orderId: string, priority: OrderPriority) => Promise<void>;
  markOrderUrgent: (orderId: string, urgent: boolean) => Promise<void>;
  
  // Filter and Search
  setFilters: (filters: Partial<OrderFilters>) => void;
  clearFilters: () => void;
  setSearch: (search: Partial<OrderSearch>) => void;
  clearSearch: () => void;
  
  // View Controls
  setViewMode: (mode: 'list' | 'grid' | 'kanban') => void;
  setSortBy: (sortBy: string, order?: 'asc' | 'desc') => void;
  
  // Selection
  selectOrder: (order: Order | null) => void;
  
  // Pagination
  loadMore: () => Promise<void>;
  resetPagination: () => void;
  
  // Real-time Updates
  handleRealtimeUpdate: (update: Partial<Order> & { id: string }) => void;
  setConnectionStatus: (connected: boolean) => void;
  
  // Error Handling
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Utility
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getFilteredOrders: () => Order[];
  getTotalOrdersByStatus: () => Record<OrderStatus, number>;
  
  // Optimistic Updates
  addOptimisticUpdate: (orderId: string, update: Partial<Order>) => void;
  removeOptimisticUpdate: (orderId: string) => void;
}

// Combined Store Type
type OrdersStore = OrdersState & OrdersActions;

// Initial State
const initialState: OrdersState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  updating: {},
  error: null,
  filters: {},
  search: {
    query: '',
    fields: ['orderNumber', 'customerName', 'customerPhone']
  },
  viewMode: 'list',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  isConnected: false,
  lastUpdate: null,
  pagination: {
    page: 0,
    size: 20,
    total: 0,
    hasMore: true
  }
};

// Create Zustand Store
export const useOrdersStore = create<OrdersStore>()(
  devtools(
    subscribeWithSelector(
      (set, get) => ({
        ...initialState,
        
        // Data Loading Actions
        loadOrders: async (filters) => {
          set({ loading: true, error: null });
          try {
            const API_BASE_URL = 'http://localhost:8081';
            let allOrders: any[] = [];

            // If specific status filter is provided, fetch only that status
            if (filters?.status && filters.status.length === 1) {
              const status = filters.status[0];
              let endpoint = '';
              switch (status) {
                case 'pending':
                  endpoint = `${API_BASE_URL}/api/staff/orders/pending`;
                  break;
                case 'preparing':
                  endpoint = `${API_BASE_URL}/api/staff/orders/in-progress`;
                  break;
                case 'completed':
                case 'ready':
                  endpoint = `${API_BASE_URL}/api/staff/orders/completed`;
                  break;
                default:
                  endpoint = `${API_BASE_URL}/api/staff/orders/pending`;
              }
              
              const response = await fetch(endpoint);
              if (!response.ok) throw new Error(`Failed to load ${status} orders`);
              const data = await response.json();
              
              if (status === 'preparing') {
                // For in-progress endpoint, combine preparing and ready orders
                allOrders = [...(data.preparing || []), ...(data.ready || [])];
              } else if (status === 'completed') {
                // For completed endpoint, combine delivered and completed orders
                allOrders = [...(data.delivered || []), ...(data.completed || [])];
              } else {
                allOrders = data[status] || data.pending || [];
              }
            } else {
              // Load all orders by fetching all endpoints
              const [pendingRes, inProgressRes, completedRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/staff/orders/pending`),
                fetch(`${API_BASE_URL}/api/staff/orders/in-progress`),
                fetch(`${API_BASE_URL}/api/staff/orders/completed`)
              ]);

              const [pendingData, inProgressData, completedData] = await Promise.all([
                pendingRes.ok ? pendingRes.json() : { pending: [], confirmed: [] },
                inProgressRes.ok ? inProgressRes.json() : { preparing: [], ready: [] },
                completedRes.ok ? completedRes.json() : { delivered: [], completed: [] }
              ]);

              // Combine all orders
              allOrders = [
                ...(pendingData.pending || []),
                ...(pendingData.confirmed || []),
                ...(inProgressData.preparing || []),
                ...(inProgressData.ready || []),
                ...(completedData.delivered || []),
                ...(completedData.completed || [])
              ];
            }

            // Transform the data to match our Order interface
            const transformedOrders = allOrders.map((order: any) => {
              // Map backend status to frontend OrderStatus enum
              const mapStatus = (backendStatus: string): OrderStatus => {
                const statusMap: Record<string, OrderStatus> = {
                  'PENDING': OrderStatus.PENDING,
                  'CONFIRMED': OrderStatus.CONFIRMED, 
                  'PREPARING': OrderStatus.PREPARING,
                  'READY': OrderStatus.READY,
                  'COMPLETED': OrderStatus.COMPLETED,
                  'DELIVERED': OrderStatus.COMPLETED, // Map DELIVERED to COMPLETED
                  'CANCELLED': OrderStatus.CANCELLED
                };
                return statusMap[backendStatus] || OrderStatus.PENDING;
              };

              return {
                id: order.orderId || order.id,
                orderNumber: order.orderId || order.orderNumber || order.id,
                customerId: order.customerId || order.customer_id || 'unknown',
                customer: {
                  id: order.customerId || order.customer_id || 'unknown',
                  name: order.customerName || 'Unknown Customer',
                  phone: order.customerPhone || '',
                  email: order.customerEmail || '',
                },
                items: order.items || order.orderItems || [],
                totalAmount: order.totalAmount || order.total_amount || 0,
                status: mapStatus(order.status),
                paymentStatus: 'paid' as any, // Default since backend doesn't provide this yet
                estimatedPrepTime: order.estimatedPrepTime,
                actualPrepTime: order.actualPrepTime,
                createdAt: order.orderTime || order.createdAt || new Date().toISOString(),
                updatedAt: order.updatedAt || new Date().toISOString(),
                completedAt: order.completedTime || order.completedAt,
                specialInstructions: order.specialInstructions || order.special_instructions,
                tableNumber: order.tableNumber || order.table_number?.toString(),
                isUrgent: false,
                priority: OrderPriority.NORMAL
              };
            });

            set({ 
              orders: transformedOrders,
              loading: false,
              lastUpdate: new Date().toISOString()
            });
          } catch (error) {
            console.error('Error loading orders:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Failed to load orders',
              loading: false 
            });
          }
        },
        
        loadOrdersByStatus: async (status) => {
          await get().loadOrders({ status: [status] });
        },
        
        loadOrderDetails: async (orderId) => {
          set(state => ({ updating: { ...state.updating, [orderId]: true } }));
          try {
            const API_BASE_URL = 'http://localhost:8081';
            const response = await fetch(`${API_BASE_URL}/api/staff/orders/${orderId}/details`);
            if (!response.ok) throw new Error('Failed to load order details');
            
            const data = await response.json();
            const order = data.order || data; // Handle different response formats
            
            set(state => ({
              orders: state.orders.map(o => o.id === orderId ? order : o),
              selectedOrder: state.selectedOrder?.id === orderId ? order : state.selectedOrder,
              updating: { ...state.updating, [orderId]: false }
            }));
          } catch (error) {
            set(state => ({ 
              error: error instanceof Error ? error.message : 'Failed to load order details',
              updating: { ...state.updating, [orderId]: false }
            }));
          }
        },
        
        refreshOrders: async () => {
          const { filters } = get();
          await get().loadOrders(filters);
        },
        
        // Status Management Actions
        updateOrderStatus: async (orderId, status, optimistic = true) => {
          // Optimistic update
          if (optimistic) {
            get().addOptimisticUpdate(orderId, { status, updatedAt: new Date().toISOString() });
          }
          
          set(state => ({ updating: { ...state.updating, [orderId]: true } }));
          try {
            const API_BASE_URL = 'http://localhost:8081';
            const response = await fetch(`${API_BASE_URL}/api/staff/orders/${orderId}/status`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                status: status,
                staffId: '21426ec6-dae4-4a82-b52a-a24f85434c2b', // Use actual staff ID from auth
                notes: `狀態更新為: ${status}`
              })
            });
            
            if (!response.ok) throw new Error('Failed to update order status');
            
            const data = await response.json();
            const updatedOrder = data.order || data; // Handle different response formats
            
            set(state => ({
              orders: state.orders.map(o => o.id === orderId ? updatedOrder : o),
              selectedOrder: state.selectedOrder?.id === orderId ? updatedOrder : state.selectedOrder,
              updating: { ...state.updating, [orderId]: false }
            }));
            
            get().removeOptimisticUpdate(orderId);
          } catch (error) {
            // Revert optimistic update on error
            if (optimistic) {
              get().removeOptimisticUpdate(orderId);
            }
            set(state => ({ 
              error: error instanceof Error ? error.message : 'Failed to update order status',
              updating: { ...state.updating, [orderId]: false }
            }));
          }
        },
        
        updateMultipleOrderStatus: async (orderIds, status) => {
          // Optimistic updates for all orders
          orderIds.forEach(id => {
            get().addOptimisticUpdate(id, { status, updatedAt: new Date().toISOString() });
          });
          
          try {
            const response = await fetch('/api/staff/orders/batch-status', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderIds, status })
            });
            
            if (!response.ok) throw new Error('Failed to update orders status');
            
            const updatedOrders = await response.json();
            set(state => ({
              orders: state.orders.map(order => {
                const updated = updatedOrders.find((u: Order) => u.id === order.id);
                return updated || order;
              })
            }));
            
            // Clear optimistic updates
            orderIds.forEach(id => get().removeOptimisticUpdate(id));
          } catch (error) {
            // Revert all optimistic updates on error
            orderIds.forEach(id => get().removeOptimisticUpdate(id));
            set({ error: error instanceof Error ? error.message : 'Failed to update orders status' });
          }
        },
        
        updateOrderPriority: async (orderId, priority) => {
          get().addOptimisticUpdate(orderId, { priority });
          
          try {
            const response = await fetch(`/api/staff/orders/${orderId}/priority`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ priority })
            });
            
            if (!response.ok) throw new Error('Failed to update order priority');
            
            const updatedOrder = await response.json();
            set(state => ({
              orders: state.orders.map(o => o.id === orderId ? updatedOrder : o),
              selectedOrder: state.selectedOrder?.id === orderId ? updatedOrder : state.selectedOrder
            }));
            
            get().removeOptimisticUpdate(orderId);
          } catch (error) {
            get().removeOptimisticUpdate(orderId);
            set({ error: error instanceof Error ? error.message : 'Failed to update order priority' });
          }
        },
        
        markOrderUrgent: async (orderId, urgent) => {
          const priority = urgent ? OrderPriority.URGENT : OrderPriority.NORMAL;
          await get().updateOrderPriority(orderId, priority);
        },
        
        // Filter and Search Actions
        setFilters: (filters) => {
          set(state => ({ 
            filters: { ...state.filters, ...filters },
            pagination: { ...state.pagination, page: 0 } // Reset pagination
          }));
          get().loadOrders(get().filters);
        },
        
        clearFilters: () => {
          set({ filters: {} });
          get().loadOrders();
        },
        
        setSearch: (search) => {
          set(state => ({ search: { ...state.search, ...search } }));
        },
        
        clearSearch: () => {
          set({ search: { query: '', fields: ['orderNumber', 'customerName', 'customerPhone'] } });
        },
        
        // View Controls
        setViewMode: (viewMode) => {
          set({ viewMode });
        },
        
        setSortBy: (sortBy, sortOrder = 'desc') => {
          set({ sortBy: sortBy as any, sortOrder });
        },
        
        // Selection
        selectOrder: (order) => {
          set({ selectedOrder: order });
        },
        
        // Pagination
        loadMore: async () => {
          const state = get();
          if (!state.pagination.hasMore || state.loading) return;
          
          set(state => ({ 
            pagination: { ...state.pagination, page: state.pagination.page + 1 }
          }));
          
          await get().loadOrders(state.filters);
        },
        
        resetPagination: () => {
          set(state => ({ 
            pagination: { ...state.pagination, page: 0, hasMore: true }
          }));
        },
        
        // Real-time Updates
        handleRealtimeUpdate: (update) => {
          set(state => ({
            orders: state.orders.map(order => 
              order.id === update.id 
                ? { ...order, ...update, updatedAt: new Date().toISOString() }
                : order
            ),
            selectedOrder: state.selectedOrder?.id === update.id 
              ? { ...state.selectedOrder, ...update, updatedAt: new Date().toISOString() }
              : state.selectedOrder,
            lastUpdate: new Date().toISOString()
          }));
        },
        
        setConnectionStatus: (connected) => {
          set({ isConnected: connected });
        },
        
        // Error Handling
        setError: (error) => {
          set({ error });
        },
        
        clearError: () => {
          set({ error: null });
        },
        
        // Utility Functions
        getOrdersByStatus: (status) => {
          return get().orders.filter(order => order.status === status);
        },
        
        getFilteredOrders: () => {
          const { orders, filters, search } = get();
          let filtered = [...orders];
          
          // Apply filters
          if (filters.status?.length) {
            filtered = filtered.filter(order => filters.status!.includes(order.status));
          }
          
          if (filters.paymentStatus?.length) {
            filtered = filtered.filter(order => filters.paymentStatus!.includes(order.paymentStatus));
          }
          
          if (filters.priority?.length) {
            filtered = filtered.filter(order => filters.priority!.includes(order.priority));
          }
          
          if (filters.dateRange) {
            const start = new Date(filters.dateRange.start);
            const end = new Date(filters.dateRange.end);
            filtered = filtered.filter(order => {
              const orderDate = new Date(order.createdAt);
              return orderDate >= start && orderDate <= end;
            });
          }
          
          if (filters.amountRange) {
            filtered = filtered.filter(order => 
              order.totalAmount >= filters.amountRange!.min && 
              order.totalAmount <= filters.amountRange!.max
            );
          }
          
          if (filters.tableNumber) {
            filtered = filtered.filter(order => order.tableNumber === filters.tableNumber);
          }
          
          if (filters.customerId) {
            filtered = filtered.filter(order => order.customerId === filters.customerId);
          }
          
          // Apply search
          if (search.query.trim()) {
            const query = search.query.toLowerCase();
            filtered = filtered.filter(order => {
              return search.fields.some(field => {
                switch (field) {
                  case 'orderNumber':
                    return order.orderNumber.toLowerCase().includes(query);
                  case 'customerName':
                    return order.customer.name.toLowerCase().includes(query);
                  case 'customerPhone':
                    return order.customer.phone?.toLowerCase().includes(query) || false;
                  case 'items':
                    return order.items.some(item => 
                      item.name.toLowerCase().includes(query)
                    );
                  default:
                    return false;
                }
              });
            });
          }
          
          return filtered;
        },
        
        getTotalOrdersByStatus: () => {
          const { orders } = get();
          return Object.values(OrderStatus).reduce((acc, status) => {
            acc[status] = orders.filter(order => order.status === status).length;
            return acc;
          }, {} as Record<OrderStatus, number>);
        },
        
        // Optimistic Updates
        addOptimisticUpdate: (orderId, update) => {
          set(state => ({
            orders: state.orders.map(order => 
              order.id === orderId ? { ...order, ...update } : order
            ),
            selectedOrder: state.selectedOrder?.id === orderId 
              ? { ...state.selectedOrder, ...update }
              : state.selectedOrder
          }));
        },
        
        removeOptimisticUpdate: (orderId) => {
          // This would ideally revert to the last known server state
          // For now, we'll refresh the specific order
          get().loadOrderDetails(orderId);
        }
      }),
      {
        name: 'orders-store'
      }
    )
  )
);

// Selector hooks for performance optimization
export const useOrdersData = () => useOrdersStore(state => ({
  orders: state.getFilteredOrders(),
  loading: state.loading,
  error: state.error,
  pagination: state.pagination
}));

export const useOrderActions = () => useOrdersStore(state => ({
  loadOrders: state.loadOrders,
  updateOrderStatus: state.updateOrderStatus,
  updateOrderPriority: state.updateOrderPriority,
  refreshOrders: state.refreshOrders,
  setFilters: state.setFilters,
  setSearch: state.setSearch
}));

export const useOrderSelection = () => useOrdersStore(state => ({
  selectedOrder: state.selectedOrder,
  selectOrder: state.selectOrder
}));

export const useOrderFilters = () => useOrdersStore(state => ({
  filters: state.filters,
  search: state.search,
  viewMode: state.viewMode,
  setFilters: state.setFilters,
  setSearch: state.setSearch,
  setViewMode: state.setViewMode,
  clearFilters: state.clearFilters,
  clearSearch: state.clearSearch
}));

export const useRealtimeOrders = () => useOrdersStore(state => ({
  isConnected: state.isConnected,
  lastUpdate: state.lastUpdate,
  handleRealtimeUpdate: state.handleRealtimeUpdate,
  setConnectionStatus: state.setConnectionStatus
}));