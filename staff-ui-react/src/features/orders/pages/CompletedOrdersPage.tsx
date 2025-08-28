import React, { useEffect, useState } from 'react';
import { 
  CheckCircle, Package, Calendar, TrendingUp, Clock, 
  Download, RefreshCw, Filter, Search, BarChart3, Target
} from 'lucide-react';
import { OrderStatus, useOrdersStore, useOrdersData, useOrderActions } from '../store/ordersStore';
import { cn } from '../../../shared/utils/cn';
import OrderCard from '../components/OrderCard';
import OrderDetails from '../components/OrderDetails';
import OrderFilters from '../components/OrderFilters';
import OrderSearch from '../components/OrderSearch';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export function CompletedOrdersPage() {
  const { orders, loading, error } = useOrdersData();
  const { loadOrdersByStatus, refreshOrders } = useOrderActions();
  const { 
    selectedOrder, 
    selectOrder,
    filters,
    search,
    setFilters,
    setSearch,
    clearFilters,
    clearSearch
  } = useOrdersStore();

  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showStats, setShowStats] = useState(true);

  // Load completed orders on mount
  useEffect(() => {
    loadOrdersByStatus(OrderStatus.COMPLETED);
  }, [loadOrdersByStatus]);

  // Apply date range filter
  useEffect(() => {
    const now = new Date();
    let start: Date, end: Date;

    switch (dateRange) {
      case 'today':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'week':
        start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        end = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'custom':
        if (customStart && customEnd) {
          start = startOfDay(new Date(customStart));
          end = endOfDay(new Date(customEnd));
        } else {
          return; // Don't apply filter if custom dates are incomplete
        }
        break;
      default:
        return;
    }

    setFilters({
      ...filters,
      status: [OrderStatus.COMPLETED],
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    });
  }, [dateRange, customStart, customEnd, setFilters]);

  // Filter completed orders
  const completedOrders = orders.filter(order => order.status === OrderStatus.COMPLETED);

  // Calculate statistics
  const stats = {
    total: completedOrders.length,
    totalRevenue: completedOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    avgOrderValue: completedOrders.length > 0 
      ? completedOrders.reduce((sum, order) => sum + order.totalAmount, 0) / completedOrders.length 
      : 0,
    avgPrepTime: completedOrders.length > 0
      ? completedOrders
          .filter(order => order.actualPrepTime)
          .reduce((sum, order) => sum + (order.actualPrepTime || 0), 0) / 
          completedOrders.filter(order => order.actualPrepTime).length
      : 0,
    completionRate: 100, // All orders here are completed
    topCustomers: getTopCustomers(completedOrders),
    hourlyDistribution: getHourlyDistribution(completedOrders)
  };

  // Get top customers
  function getTopCustomers(orders: any[]) {
    const customerStats: Record<string, {name: string, count: number, totalAmount: number}> = {};
    
    orders.forEach(order => {
      const key = order.customer.id;
      if (!customerStats[key]) {
        customerStats[key] = {
          name: order.customer.name,
          count: 0,
          totalAmount: 0
        };
      }
      customerStats[key].count++;
      customerStats[key].totalAmount += order.totalAmount;
    });

    return Object.values(customerStats)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);
  }

  // Get hourly order distribution
  function getHourlyDistribution(orders: any[]) {
    const hourly: Record<number, number> = {};
    
    orders.forEach(order => {
      const hour = new Date(order.completedAt || order.updatedAt).getHours();
      hourly[hour] = (hourly[hour] || 0) + 1;
    });

    return Object.entries(hourly)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => a.hour - b.hour);
  }

  // Handle export
  const handleExport = () => {
    const csvContent = [
      ['訂單編號', '客戶姓名', '完成時間', '訂單金額', '製作時間', '商品'].join(','),
      ...completedOrders.map(order => [
        order.orderNumber,
        order.customer.name,
        format(new Date(order.completedAt || order.updatedAt), 'yyyy-MM-dd HH:mm'),
        order.totalAmount,
        order.actualPrepTime || '',
        order.items.map(item => `${item.name}x${item.quantity}`).join(';')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `completed-orders-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render statistics cards
  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">已完成訂單</div>
          </div>
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              ${Math.round(stats.totalRevenue).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">總營收</div>
          </div>
          <TrendingUp className="w-8 h-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              ${Math.round(stats.avgOrderValue)}
            </div>
            <div className="text-sm text-gray-600">平均訂單金額</div>
          </div>
          <Target className="w-8 h-8 text-purple-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(stats.avgPrepTime)}分
            </div>
            <div className="text-sm text-gray-600">平均製作時間</div>
          </div>
          <Clock className="w-8 h-8 text-orange-500" />
        </div>
      </div>
    </div>
  );

  // Render analytics section
  const renderAnalytics = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Top customers */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">熱門客戶</h3>
        <div className="space-y-3">
          {stats.topCustomers.map((customer, index) => (
            <div key={customer.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <span className="font-medium text-gray-900">{customer.name}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  ${customer.totalAmount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  {customer.count} 筆訂單
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly distribution */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">訂單時段分布</h3>
        <div className="space-y-2">
          {stats.hourlyDistribution.map(({ hour, count }) => (
            <div key={hour} className="flex items-center space-x-3">
              <div className="w-16 text-sm text-gray-600">
                {hour}:00
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                <div
                  className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                  style={{
                    width: `${(count / Math.max(...stats.hourlyDistribution.map(h => h.count))) * 100}%`
                  }}
                />
              </div>
              <div className="w-8 text-sm font-medium text-gray-900">
                {count}
              </div>
            </div>
          ))}
        </div>
      </div>
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
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">已完成訂單</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    查看歷史訂單記錄和營運分析
                  </p>
                </div>
              </div>
            </div>

            {/* Date range selector */}
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {[
                  { key: 'today', label: '今日' },
                  { key: 'week', label: '本週' },
                  { key: 'month', label: '本月' },
                  { key: 'custom', label: '自訂' }
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setDateRange(option.key as any)}
                    className={cn(
                      'px-4 py-2 text-sm rounded-md transition-colors',
                      dateRange === option.key
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Custom date range inputs */}
          {dateRange === 'custom' && (
            <div className="mt-4 flex items-center space-x-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">開始日期</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">結束日期</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <OrderSearch
                search={search}
                onSearchChange={setSearch}
                onClear={clearSearch}
                placeholder="搜尋已完成訂單..."
                showAdvanced={true}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Analytics toggle */}
              <button
                onClick={() => setShowStats(!showStats)}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg transition-colors',
                  showStats ? 'bg-blue-50 text-blue-600 border-blue-300' : 'hover:bg-gray-50'
                )}
              >
                <BarChart3 className="w-4 h-4" />
                <span>統計分析</span>
              </button>

              {/* Filters */}
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

              {/* Export */}
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={completedOrders.length === 0}
              >
                <Download className="w-4 h-4" />
                <span>匯出</span>
              </button>

              {/* Refresh */}
              <button
                onClick={() => loadOrdersByStatus(OrderStatus.COMPLETED)}
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

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <OrderFilters
              filters={{...filters, status: [OrderStatus.COMPLETED]}}
              onFiltersChange={(newFilters) => setFilters({...newFilters, status: [OrderStatus.COMPLETED]})}
              onClear={() => {
                clearFilters();
                setFilters({status: [OrderStatus.COMPLETED]});
              }}
              onToggle={() => setShowFilters(false)}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showStats && renderStats()}
        {showStats && renderAnalytics()}

        {/* Orders list */}
        <div className={cn('flex gap-6', selectedOrder ? 'lg:grid lg:grid-cols-3' : '')}>
          <div className={cn('space-y-4', selectedOrder ? 'lg:col-span-2' : '')}>
            {loading && completedOrders.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2 text-gray-600">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>載入已完成訂單...</span>
                </div>
              </div>
            ) : completedOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <div className="text-xl font-medium text-gray-900 mb-2">
                  所選時間範圍內沒有已完成的訂單
                </div>
                <div className="text-gray-600">
                  嘗試調整日期範圍或清除篩選條件
                </div>
              </div>
            ) : (
              completedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onSelect={selectOrder}
                  isSelected={selectedOrder?.id === order.id}
                  variant="default"
                  showActions={false} // No actions needed for completed orders
                />
              ))
            )}
          </div>

          {/* Order details sidebar */}
          {selectedOrder && selectedOrder.status === OrderStatus.COMPLETED && (
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <OrderDetails
                  order={selectedOrder}
                  onClose={() => selectOrder(null)}
                  showPrintOptions={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompletedOrdersPage;