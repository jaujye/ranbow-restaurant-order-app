import React, { useEffect, useState } from 'react';
import { 
  Clock, AlertTriangle, CheckCircle, X, RefreshCw, 
  Zap, Star, Bell, Filter, Search
} from 'lucide-react';
import { OrderStatus, OrderPriority, useOrdersStore, useOrdersData, useOrderActions } from '../store/ordersStore';
import { cn } from '../../../shared/utils/cn';
import OrderCard from '../components/OrderCard';
import OrderDetails from '../components/OrderDetails';
import StatusUpdater from '../components/StatusUpdater';
import OrderFilters from '../components/OrderFilters';
import OrderSearch from '../components/OrderSearch';

export function PendingOrdersPage() {
  const { orders, loading, error } = useOrdersData();
  const { loadOrdersByStatus, updateOrderStatus, updateOrderPriority, refreshOrders } = useOrderActions();
  const { 
    selectedOrder, 
    selectOrder, 
    updating, 
    filters, 
    search,
    setFilters,
    setSearch,
    clearFilters,
    clearSearch
  } = useOrdersStore();

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount' | 'priority'>('newest');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load pending orders on mount
  useEffect(() => {
    loadOrdersByStatus(OrderStatus.PENDING);
  }, [loadOrdersByStatus]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadOrdersByStatus(OrderStatus.PENDING);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, loadOrdersByStatus]);

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => order.status === OrderStatus.PENDING)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'amount':
          return b.totalAmount - a.totalAmount;
        case 'priority':
          const priorityOrder = {
            [OrderPriority.URGENT]: 4,
            [OrderPriority.HIGH]: 3,
            [OrderPriority.NORMAL]: 2,
            [OrderPriority.LOW]: 1
          };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });

  // Get urgent orders count
  const urgentCount = filteredOrders.filter(order => order.isUrgent).length;
  const totalAmount = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  // Handle batch operations
  const handleBatchConfirm = async () => {
    for (const orderId of selectedOrders) {
      try {
        await updateOrderStatus(orderId, OrderStatus.CONFIRMED);
      } catch (error) {
        console.error(`Failed to confirm order ${orderId}:`, error);
      }
    }
    setSelectedOrders([]);
  };

  const handleBatchPriority = async (priority: OrderPriority) => {
    for (const orderId of selectedOrders) {
      try {
        await updateOrderPriority(orderId, priority);
      } catch (error) {
        console.error(`Failed to update priority for order ${orderId}:`, error);
      }
    }
    setSelectedOrders([]);
  };

  // Handle order selection
  const handleOrderSelect = (orderId: string, selected: boolean) => {
    setSelectedOrders(prev => 
      selected 
        ? [...prev, orderId]
        : prev.filter(id => id !== orderId)
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
  };

  // Quick actions
  const quickActions = [
    {
      label: '確認全部',
      action: handleBatchConfirm,
      icon: CheckCircle,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      disabled: selectedOrders.length === 0
    },
    {
      label: '設為高優先級',
      action: () => handleBatchPriority(OrderPriority.HIGH),
      icon: Star,
      color: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      disabled: selectedOrders.length === 0
    },
    {
      label: '標記緊急',
      action: () => handleBatchPriority(OrderPriority.URGENT),
      icon: Zap,
      color: 'bg-red-600 hover:bg-red-700 text-white',
      disabled: selectedOrders.length === 0
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">待處理訂單</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    管理新進的訂單，確認並開始處理流程
                  </p>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {filteredOrders.length}
                </div>
                <div className="text-sm text-gray-600">待處理訂單</div>
              </div>
              
              {urgentCount > 0 && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 animate-pulse">
                    {urgentCount}
                  </div>
                  <div className="text-sm text-gray-600">緊急訂單</div>
                </div>
              )}
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  ${Math.round(totalAmount).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">總金額</div>
              </div>
            </div>
          </div>

          {/* Urgent orders alert */}
          {urgentCount > 0 && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
                <div className="flex-1">
                  <div className="font-medium text-red-800">
                    注意：有 {urgentCount} 個緊急訂單需要優先處理
                  </div>
                  <div className="text-sm text-red-600 mt-1">
                    請儘快確認這些訂單以避免客戶等候時間過長
                  </div>
                </div>
                <Bell className="w-5 h-5 text-red-500 animate-bounce" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Search and filters */}
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex-1 max-w-md">
                <OrderSearch
                  search={search}
                  onSearchChange={setSearch}
                  onClear={clearSearch}
                  placeholder="搜尋待處理訂單..."
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg transition-colors',
                  showFilters ? 'bg-blue-50 text-blue-600 border-blue-300' : 'hover:bg-gray-50'
                )}
              >
                <Filter className="w-4 h-4" />
                <span>篩選</span>
              </button>
            </div>

            {/* Sort and actions */}
            <div className="flex items-center space-x-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">最新訂單</option>
                <option value="oldest">最舊訂單</option>
                <option value="amount">金額排序</option>
                <option value="priority">優先級排序</option>
              </select>

              {/* Auto refresh toggle */}
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>自動更新</span>
              </label>

              {/* Refresh */}
              <button
                onClick={() => loadOrdersByStatus(OrderStatus.PENDING)}
                disabled={loading}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors',
                  loading && 'opacity-50 cursor-not-allowed'
                )}
              >
                <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                <span>重新整理</span>
              </button>
            </div>
          </div>

          {/* Selection and batch actions */}
          {filteredOrders.length > 0 && (
            <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    選取全部 ({selectedOrders.length}/{filteredOrders.length})
                  </span>
                </label>
              </div>

              {selectedOrders.length > 0 && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    已選取 {selectedOrders.length} 個訂單
                  </span>
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={index}
                        onClick={action.action}
                        disabled={action.disabled}
                        className={cn(
                          'flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                          action.color,
                          action.disabled && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <OrderFilters
              filters={{...filters, status: [OrderStatus.PENDING]}} // Force pending status
              onFiltersChange={(newFilters) => setFilters({...newFilters, status: [OrderStatus.PENDING]})}
              onClear={() => {
                clearFilters();
                setFilters({status: [OrderStatus.PENDING]});
              }}
              onToggle={() => setShowFilters(false)}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={cn(
          'flex gap-6',
          selectedOrder ? 'lg:grid lg:grid-cols-3' : ''
        )}>
          {/* Orders list */}
          <div className={cn('space-y-4', selectedOrder ? 'lg:col-span-2' : '')}>
            {loading && filteredOrders.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2 text-gray-600">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>載入待處理訂單中...</span>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="text-lg font-medium text-red-800 mb-2">載入失敗</div>
                <div className="text-red-600 mb-4">{error}</div>
                <button
                  onClick={() => loadOrdersByStatus(OrderStatus.PENDING)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  重新載入
                </button>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <div className="text-xl font-medium text-gray-900 mb-2">
                  目前沒有待處理的訂單
                </div>
                <div className="text-gray-600">
                  所有新訂單都會在這裡顯示，請稍候或重新整理頁面
                </div>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.id} className="relative">
                  {/* Selection checkbox */}
                  <div className="absolute top-4 left-4 z-10">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={(e) => handleOrderSelect(order.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <OrderCard
                    order={order}
                    onSelect={selectOrder}
                    onStatusUpdate={updateOrderStatus}
                    onPriorityUpdate={updateOrderPriority}
                    isSelected={selectedOrder?.id === order.id}
                    isUpdating={updating[order.id]}
                    className="ml-8"
                    variant="default"
                  />
                </div>
              ))
            )}
          </div>

          {/* Order details sidebar */}
          {selectedOrder && selectedOrder.status === OrderStatus.PENDING && (
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <OrderDetails
                  order={selectedOrder}
                  onClose={() => selectOrder(null)}
                  onStatusUpdate={updateOrderStatus}
                  onPriorityUpdate={updateOrderPriority}
                  onRefresh={() => loadOrdersByStatus(OrderStatus.PENDING)}
                  isUpdating={updating[selectedOrder.id]}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PendingOrdersPage;