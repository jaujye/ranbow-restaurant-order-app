import React, { useEffect, useState } from 'react';
import { 
  Play, Clock, Package, AlertTriangle, RefreshCw, Timer,
  CheckCircle, Zap, TrendingUp, Target
} from 'lucide-react';
import { OrderStatus, OrderPriority, useOrdersStore, useOrdersData, useOrderActions } from '../store/ordersStore';
import { cn } from '../../../shared/utils/cn';
import OrderCard from '../components/OrderCard';
import OrderDetails from '../components/OrderDetails';
import StatusUpdater from '../components/StatusUpdater';

export function InProgressOrdersPage() {
  const { orders, loading, error } = useOrdersData();
  const { loadOrdersByStatus, updateOrderStatus, updateOrderPriority, refreshOrders } = useOrderActions();
  const { 
    selectedOrder, 
    selectOrder, 
    updating
  } = useOrdersStore();

  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'estimated'>('priority');
  const [viewMode, setViewMode] = useState<'kitchen' | 'timeline'>('kitchen');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load in-progress orders on mount
  useEffect(() => {
    loadOrdersByStatus(OrderStatus.PREPARING);
  }, [loadOrdersByStatus]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadOrdersByStatus(OrderStatus.PREPARING);
    }, 15000); // More frequent updates for active orders

    return () => clearInterval(interval);
  }, [autoRefresh, loadOrdersByStatus]);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Filter and sort orders
  const inProgressOrders = orders
    .filter(order => order.status === OrderStatus.PREPARING)
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = {
            [OrderPriority.URGENT]: 4,
            [OrderPriority.HIGH]: 3,
            [OrderPriority.NORMAL]: 2,
            [OrderPriority.LOW]: 1
          };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        
        case 'time':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        
        case 'estimated':
          const aTime = a.estimatedPrepTime || 999;
          const bTime = b.estimatedPrepTime || 999;
          return aTime - bTime;
          
        default:
          return 0;
      }
    });

  // Calculate statistics
  const stats = {
    total: inProgressOrders.length,
    urgent: inProgressOrders.filter(order => order.isUrgent).length,
    overdue: inProgressOrders.filter(order => {
      if (!order.estimatedPrepTime) return false;
      const startTime = new Date(order.updatedAt);
      const estimatedComplete = new Date(startTime.getTime() + order.estimatedPrepTime * 60000);
      return currentTime > estimatedComplete;
    }).length,
    avgPrepTime: inProgressOrders.length > 0 
      ? Math.round(inProgressOrders.reduce((sum, order) => sum + (order.estimatedPrepTime || 0), 0) / inProgressOrders.length)
      : 0
  };

  // Calculate preparation progress for each order
  const getOrderProgress = (order: any) => {
    if (!order.estimatedPrepTime) return null;
    
    const startTime = new Date(order.updatedAt);
    const estimatedComplete = new Date(startTime.getTime() + order.estimatedPrepTime * 60000);
    const elapsed = Math.max(0, currentTime.getTime() - startTime.getTime());
    const total = estimatedComplete.getTime() - startTime.getTime();
    const progress = Math.min(100, (elapsed / total) * 100);
    
    return {
      progress,
      elapsed: Math.floor(elapsed / 60000), // minutes
      remaining: Math.max(0, Math.floor((total - elapsed) / 60000)),
      isOverdue: progress > 100
    };
  };

  // Handle mark as ready
  const handleMarkReady = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, OrderStatus.READY);
    } catch (error) {
      console.error('Failed to mark order as ready:', error);
    }
  };

  // Render kitchen view (visual cooking station layout)
  const renderKitchenView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {inProgressOrders.map((order) => {
        const progress = getOrderProgress(order);
        
        return (
          <div
            key={order.id}
            className={cn(
              'bg-white rounded-xl shadow-sm border-2 transition-all duration-200',
              order.isUrgent ? 'border-red-300 bg-red-50' : 'border-orange-200',
              progress?.isOverdue && 'border-red-500 bg-red-50 animate-pulse'
            )}
          >
            {/* Header with timer */}
            <div className={cn(
              'p-4 rounded-t-xl',
              order.isUrgent ? 'bg-red-100' : 'bg-orange-100'
            )}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Play className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-gray-900">
                    #{order.orderNumber}
                  </span>
                  {order.isUrgent && (
                    <Zap className="w-4 h-4 text-red-500" />
                  )}
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    ${order.totalAmount}
                  </div>
                  <div className="text-sm text-gray-600">
                    {order.customer.name}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              {progress && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className={cn(
                      'font-medium',
                      progress.isOverdue ? 'text-red-600' : 'text-orange-600'
                    )}>
                      {progress.isOverdue ? '已超時' : `進度 ${Math.round(progress.progress)}%`}
                    </span>
                    <span className="text-gray-600">
                      {progress.isOverdue 
                        ? `超時 ${progress.elapsed - (order.estimatedPrepTime || 0)} 分鐘`
                        : `剩餘 ${progress.remaining} 分鐘`
                      }
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all duration-500',
                        progress.isOverdue 
                          ? 'bg-red-500' 
                          : progress.progress > 75 
                          ? 'bg-green-500' 
                          : progress.progress > 50 
                          ? 'bg-yellow-500' 
                          : 'bg-orange-500'
                      )}
                      style={{ width: `${Math.min(100, progress.progress)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Order items */}
            <div className="p-4">
              <div className="space-y-2 mb-4">
                {order.items.slice(0, 4).map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium">${item.price * item.quantity}</span>
                  </div>
                ))}
                {order.items.length > 4 && (
                  <div className="text-sm text-gray-500">
                    還有 {order.items.length - 4} 項商品...
                  </div>
                )}
              </div>

              {/* Special instructions */}
              {order.specialInstructions && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                  <div className="text-xs font-medium text-yellow-800 mb-1">特殊要求：</div>
                  <div className="text-sm text-yellow-700">{order.specialInstructions}</div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleMarkReady(order.id)}
                  disabled={updating[order.id]}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Package className="w-4 h-4" />
                  <span>{updating[order.id] ? '處理中...' : '標記完成'}</span>
                </button>
                
                <button
                  onClick={() => selectOrder(order)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  詳情
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Render timeline view (chronological list)
  const renderTimelineView = () => (
    <div className="space-y-4">
      {inProgressOrders.map((order) => {
        const progress = getOrderProgress(order);
        
        return (
          <div
            key={order.id}
            className={cn(
              'bg-white rounded-lg shadow-sm border-l-4 p-6',
              progress?.isOverdue ? 'border-red-500' : 'border-orange-400'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    #{order.orderNumber}
                  </h3>
                  {order.isUrgent && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      緊急
                    </span>
                  )}
                  {progress?.isOverdue && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      超時
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  客戶：{order.customer.name} • 
                  金額：${order.totalAmount} • 
                  開始時間：{new Date(order.updatedAt).toLocaleTimeString()}
                </div>

                {progress && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>製作進度</span>
                      <span>
                        {progress.isOverdue 
                          ? `超時 ${progress.elapsed - (order.estimatedPrepTime || 0)} 分鐘`
                          : `剩餘 ${progress.remaining} 分鐘`
                        }
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={cn(
                          'h-2 rounded-full',
                          progress.isOverdue ? 'bg-red-500' : 'bg-orange-500'
                        )}
                        style={{ width: `${Math.min(100, progress.progress)}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  商品：{order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <StatusUpdater
                  order={order}
                  onStatusUpdate={updateOrderStatus}
                  onPriorityUpdate={updateOrderPriority}
                  isUpdating={updating[order.id]}
                  variant="quick"
                  size="sm"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <Play className="w-8 h-8 text-orange-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">製作中訂單</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    監控廚房製作進度，確保訂單按時完成
                  </p>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="hidden md:grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-600">製作中</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.urgent}
                </div>
                <div className="text-sm text-gray-600">緊急</div>
              </div>
              
              <div className="text-center">
                <div className={cn(
                  'text-2xl font-bold',
                  stats.overdue > 0 ? 'text-red-600 animate-pulse' : 'text-gray-600'
                )}>
                  {stats.overdue}
                </div>
                <div className="text-sm text-gray-600">超時</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.avgPrepTime}分
                </div>
                <div className="text-sm text-gray-600">平均時間</div>
              </div>
            </div>
          </div>

          {/* Overdue alert */}
          {stats.overdue > 0 && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-3 animate-bounce" />
                <div className="flex-1">
                  <div className="font-medium text-red-800">
                    警告：有 {stats.overdue} 個訂單已超過預計完成時間
                  </div>
                  <div className="text-sm text-red-600 mt-1">
                    請檢查廚房狀況並優先處理超時訂單
                  </div>
                </div>
                <Timer className="w-5 h-5 text-red-500" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* View mode toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('kitchen')}
                  className={cn(
                    'px-4 py-2 text-sm rounded-md transition-colors',
                    viewMode === 'kitchen'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  廚房視圖
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={cn(
                    'px-4 py-2 text-sm rounded-md transition-colors',
                    viewMode === 'timeline'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  時間軸
                </button>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="priority">優先級排序</option>
                <option value="time">開始時間</option>
                <option value="estimated">預計完成時間</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              {/* Auto refresh */}
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
                onClick={() => loadOrdersByStatus(OrderStatus.PREPARING)}
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
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && inProgressOrders.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2 text-gray-600">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>載入製作中訂單...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-lg font-medium text-red-800 mb-2">載入失敗</div>
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={() => loadOrdersByStatus(OrderStatus.PREPARING)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              重新載入
            </button>
          </div>
        ) : inProgressOrders.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <div className="text-xl font-medium text-gray-900 mb-2">
              目前沒有製作中的訂單
            </div>
            <div className="text-gray-600">
              所有正在製作的訂單都會在這裡顯示
            </div>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Main content area */}
            <div className={cn('flex-1', selectedOrder ? 'lg:max-w-4xl' : '')}>
              {viewMode === 'kitchen' ? renderKitchenView() : renderTimelineView()}
            </div>

            {/* Order details sidebar */}
            {selectedOrder && selectedOrder.status === OrderStatus.PREPARING && (
              <div className="w-96 flex-shrink-0">
                <div className="sticky top-6">
                  <OrderDetails
                    order={selectedOrder}
                    onClose={() => selectOrder(null)}
                    onStatusUpdate={updateOrderStatus}
                    onPriorityUpdate={updateOrderPriority}
                    onRefresh={() => loadOrdersByStatus(OrderStatus.PREPARING)}
                    isUpdating={updating[selectedOrder.id]}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default InProgressOrdersPage;