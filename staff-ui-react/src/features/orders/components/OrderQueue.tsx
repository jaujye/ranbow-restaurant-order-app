import React, { useState, useEffect } from 'react';
import { 
  Grid, List, Kanban, RefreshCw, Filter, Search,
  AlertTriangle, Clock, TrendingUp, Eye, EyeOff
} from 'lucide-react';
import { Order, OrderStatus, useOrdersStore, useOrdersData, useOrderActions } from '../store/ordersStore';
import { cn } from '../../../shared/utils/cn';
import OrderCard from './OrderCard';
import OrderDetails from './OrderDetails';

interface OrderQueueProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showFilters?: boolean;
  showStats?: boolean;
  defaultViewMode?: 'list' | 'grid' | 'kanban';
  onOrderSelect?: (order: Order) => void;
}

export function OrderQueue({
  className,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
  showFilters = true,
  showStats = true,
  defaultViewMode = 'grid',
  onOrderSelect
}: OrderQueueProps) {
  const { orders, loading, error, pagination } = useOrdersData();
  const { 
    loadOrders, 
    updateOrderStatus, 
    updateOrderPriority, 
    refreshOrders, 
    setFilters, 
    setSearch 
  } = useOrderActions();
  
  const {
    viewMode,
    setViewMode,
    filters,
    search,
    selectedOrder,
    selectOrder,
    updating,
    getTotalOrdersByStatus
  } = useOrdersStore();

  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Initialize view mode
  useEffect(() => {
    if (viewMode !== defaultViewMode) {
      setViewMode(defaultViewMode);
    }
  }, [defaultViewMode, setViewMode, viewMode]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (!loading) {
        refreshOrders();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loading, refreshOrders]);

  // Load initial data
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Handle search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch({ query: searchQuery });
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, setSearch]);

  // Get order statistics
  const orderStats = getTotalOrdersByStatus();
  const totalOrders = Object.values(orderStats).reduce((sum, count) => sum + count, 0);

  // Handle order selection
  const handleOrderSelect = (order: Order) => {
    selectOrder(order);
    setShowDetailsPanel(true);
    onOrderSelect?.(order);
  };

  // Handle status update
  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status, true); // Optimistic update
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  // Handle priority update
  const handlePriorityUpdate = async (orderId: string, priority: any) => {
    try {
      await updateOrderPriority(orderId, priority);
    } catch (error) {
      console.error('Failed to update order priority:', error);
    }
  };

  // Kanban columns configuration
  const kanbanColumns = [
    {
      status: OrderStatus.PENDING,
      title: '待處理',
      color: 'border-yellow-200 bg-yellow-50',
      headerColor: 'bg-yellow-100 text-yellow-800'
    },
    {
      status: OrderStatus.CONFIRMED,
      title: '已確認',
      color: 'border-blue-200 bg-blue-50',
      headerColor: 'bg-blue-100 text-blue-800'
    },
    {
      status: OrderStatus.PREPARING,
      title: '製作中',
      color: 'border-orange-200 bg-orange-50',
      headerColor: 'bg-orange-100 text-orange-800'
    },
    {
      status: OrderStatus.READY,
      title: '已完成',
      color: 'border-green-200 bg-green-50',
      headerColor: 'bg-green-100 text-green-800'
    },
    {
      status: OrderStatus.COMPLETED,
      title: '已交付',
      color: 'border-gray-200 bg-gray-50',
      headerColor: 'bg-gray-100 text-gray-800'
    }
  ];

  // Filter orders by status for kanban view
  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter(order => order.status === status);
  };

  // Render view mode controls
  const renderViewControls = () => (
    <div className="flex items-center space-x-2">
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setViewMode('list')}
          className={cn(
            'p-2 rounded-md transition-colors',
            viewMode === 'list' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          )}
          title="列表視圖"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={cn(
            'p-2 rounded-md transition-colors',
            viewMode === 'grid' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          )}
          title="網格視圖"
        >
          <Grid className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode('kanban')}
          className={cn(
            'p-2 rounded-md transition-colors',
            viewMode === 'kanban' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          )}
          title="看板視圖"
        >
          <Kanban className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // Render statistics
  const renderStats = () => {
    if (!showStats) return null;

    const urgentOrders = orders.filter(order => order.isUrgent).length;
    const avgWaitTime = Math.floor(Math.random() * 15) + 5; // Mock calculation

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalOrders}</div>
              <div className="text-sm text-gray-600">總訂單</div>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-600">{orderStats[OrderStatus.PENDING]}</div>
              <div className="text-sm text-gray-600">待處理</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">{orderStats[OrderStatus.PREPARING]}</div>
              <div className="text-sm text-gray-600">製作中</div>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{orderStats[OrderStatus.READY]}</div>
              <div className="text-sm text-gray-600">已完成</div>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">{urgentOrders}</div>
              <div className="text-sm text-gray-600">緊急</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{avgWaitTime}分</div>
              <div className="text-sm text-gray-600">平均等候</div>
            </div>
            <Clock className="w-8 h-8 text-gray-500" />
          </div>
        </div>
      </div>
    );
  };

  // Render toolbar
  const renderToolbar = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-2xl font-bold text-gray-900">訂單隊列</h2>
        <button
          onClick={refreshOrders}
          disabled={loading}
          className={cn(
            'p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors',
            loading && 'animate-spin'
          )}
          title="重新整理"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋訂單..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={cn(
              'p-2 border border-gray-300 rounded-lg transition-colors',
              showFiltersPanel 
                ? 'bg-blue-50 text-blue-600 border-blue-300'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
            title="篩選器"
          >
            <Filter className="w-4 h-4" />
          </button>
        )}

        {renderViewControls()}

        {/* Details panel toggle */}
        <button
          onClick={() => setShowDetailsPanel(!showDetailsPanel)}
          className={cn(
            'p-2 border border-gray-300 rounded-lg transition-colors',
            showDetailsPanel 
              ? 'bg-blue-50 text-blue-600 border-blue-300'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          )}
          title={showDetailsPanel ? '隱藏詳情面板' : '顯示詳情面板'}
        >
          {showDetailsPanel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  // Render list view
  const renderListView = () => (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onSelect={handleOrderSelect}
          onStatusUpdate={handleStatusUpdate}
          onPriorityUpdate={handlePriorityUpdate}
          isSelected={selectedOrder?.id === order.id}
          isUpdating={updating[order.id]}
          variant="default"
        />
      ))}
    </div>
  );

  // Render grid view
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onSelect={handleOrderSelect}
          onStatusUpdate={handleStatusUpdate}
          onPriorityUpdate={handlePriorityUpdate}
          isSelected={selectedOrder?.id === order.id}
          isUpdating={updating[order.id]}
          variant="default"
        />
      ))}
    </div>
  );

  // Render kanban view
  const renderKanbanView = () => (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {kanbanColumns.map((column) => {
        const columnOrders = getOrdersByStatus(column.status);
        return (
          <div
            key={column.status}
            className={cn('flex-shrink-0 w-80 rounded-lg border-2', column.color)}
          >
            {/* Column Header */}
            <div className={cn('p-4 font-semibold rounded-t-lg', column.headerColor)}>
              <div className="flex items-center justify-between">
                <span>{column.title}</span>
                <span className="bg-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  {columnOrders.length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className="p-4 space-y-4 max-h-screen overflow-y-auto">
              {columnOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onSelect={handleOrderSelect}
                  onStatusUpdate={handleStatusUpdate}
                  onPriorityUpdate={handlePriorityUpdate}
                  isSelected={selectedOrder?.id === order.id}
                  isUpdating={updating[order.id]}
                  variant="compact"
                  className="shadow-sm hover:shadow-md"
                />
              ))}
              
              {columnOrders.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-sm">目前沒有{column.title}的訂單</div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Render content based on view mode
  const renderContent = () => {
    if (loading && orders.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2 text-gray-600">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>載入訂單中...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-lg font-medium text-gray-900 mb-2">載入失敗</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={refreshOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新嘗試
          </button>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-lg font-medium text-gray-900 mb-2">暫無訂單</div>
          <div className="text-gray-600">目前沒有符合條件的訂單</div>
        </div>
      );
    }

    switch (viewMode) {
      case 'list':
        return renderListView();
      case 'grid':
        return renderGridView();
      case 'kanban':
        return renderKanbanView();
      default:
        return renderGridView();
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {renderStats()}
      {renderToolbar()}
      
      <div className={cn('flex', showDetailsPanel && selectedOrder ? 'space-x-6' : '')}>
        {/* Main content */}
        <div className={cn('flex-1', showDetailsPanel && selectedOrder ? 'max-w-3xl' : '')}>
          {renderContent()}
        </div>

        {/* Details panel */}
        {showDetailsPanel && selectedOrder && (
          <div className="w-96 flex-shrink-0">
            <OrderDetails
              order={selectedOrder}
              onClose={() => {
                setShowDetailsPanel(false);
                selectOrder(null);
              }}
              onStatusUpdate={handleStatusUpdate}
              onPriorityUpdate={handlePriorityUpdate}
              onRefresh={() => refreshOrders()}
              isUpdating={updating[selectedOrder.id]}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderQueue;