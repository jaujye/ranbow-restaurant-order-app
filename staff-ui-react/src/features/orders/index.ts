// Orders Feature Exports
// Complete order management system for Ranbow Restaurant Staff UI

// Store
export * from './store/ordersStore';

// Services
export { default as OrdersApiService, ordersApi } from './services/ordersApi';
export { orderWebSocketService, useOrderWebSocket as useOrderWebSocketService } from './services/websocketService';

// Components
export { default as OrderCard } from './components/OrderCard';
export { default as OrderDetails } from './components/OrderDetails';
export { default as OrderQueue } from './components/OrderQueue';
export { default as StatusUpdater } from './components/StatusUpdater';
export { default as OrderFilters } from './components/OrderFilters';
export { default as OrderSearch } from './components/OrderSearch';

// Pages
export { default as OrderManagementPage } from './pages/OrderManagementPage';
export { default as PendingOrdersPage } from './pages/PendingOrdersPage';
export { default as InProgressOrdersPage } from './pages/InProgressOrdersPage';
export { default as CompletedOrdersPage } from './pages/CompletedOrdersPage';

// Providers
export { 
  default as OrderWebSocketProvider,
  useOrderWebSocket,
  useConnectionStatus,
  OrderNotifications
} from './providers/OrderWebSocketProvider';

// Types
export type {
  Order,
  OrderItem,
  CustomerInfo,
  OrderFilters,
  OrderSearch,
  OrderStatus,
  OrderPriority,
  PaymentStatus
} from './store/ordersStore';

export type {
  OrdersListRequest,
  OrdersListResponse,
  OrderStatusUpdateRequest,
  OrderPriorityUpdateRequest,
  BatchStatusUpdateRequest,
  OrderStatisticsResponse
} from './services/ordersApi';

export type {
  OrderUpdateEvent,
  KitchenNotificationEvent,
  SystemNotificationEvent
} from './services/websocketService';