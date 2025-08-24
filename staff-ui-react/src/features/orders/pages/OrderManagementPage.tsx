import React, { useState, useEffect } from 'react';
import { 
  Clock, Package, CheckCircle, AlertTriangle, TrendingUp, 
  Filter, Search, RefreshCw, Settings, Download, Bell
} from 'lucide-react';
import { OrderStatus, useOrdersStore, useOrdersData, useOrderActions, useOrderFilters, useOrderSelection } from '../store/ordersStore';
import { cn } from '../../../shared/utils/cn';
import OrderQueue from '../components/OrderQueue';
import OrderFilters from '../components/OrderFilters';
import OrderSearch from '../components/OrderSearch';
import OrderDetails from '../components/OrderDetails';

export function OrderManagementPage() {
  const { orders, loading, error } = useOrdersData();
  const { refreshOrders } = useOrderActions();
  const { 
    filters, 
    search, 
    setFilters,
    setSearch,
    clearFilters,
    clearSearch
  } = useOrderFilters();
  
  const { selectedOrder } = useOrderSelection();
  const getTotalOrdersByStatus = useOrdersStore(state => state.getTotalOrdersByStatus);

  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [currentTab, setCurrentTab] = useState<'all' | OrderStatus>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Get order statistics
  const orderStats = getTotalOrdersByStatus();
  const totalOrders = Object.values(orderStats).reduce((sum, count) => sum + count, 0);

  // Tab configuration
  const tabs = [
    {
      key: 'all' as const,
      label: '全部訂單',
      icon: TrendingUp,
      color: 'text-gray-600',
      count: totalOrders,
      description: '顯示所有訂單'
    },
    {
      key: OrderStatus.PENDING,
      label: '待處理',
      icon: Clock,
      color: 'text-yellow-600',
      count: orderStats[OrderStatus.PENDING] || 0,
      description: '需要確認的新訂單',
      priority: true
    },
    {
      key: OrderStatus.CONFIRMED,
      label: '已確認',
      icon: CheckCircle,
      color: 'text-blue-600',
      count: orderStats[OrderStatus.CONFIRMED] || 0,
      description: '已確認待製作的訂單'
    },
    {
      key: OrderStatus.PREPARING,
      label: '製作中',
      icon: AlertTriangle,
      color: 'text-orange-600',
      count: orderStats[OrderStatus.PREPARING] || 0,
      description: '正在廚房製作的訂單',
      priority: true
    },
    {
      key: OrderStatus.READY,
      label: '已完成',
      icon: Package,
      color: 'text-green-600',
      count: orderStats[OrderStatus.READY] || 0,
      description: '已完成待交付的訂單',
      priority: true
    },
    {
      key: OrderStatus.COMPLETED,
      label: '已交付',
      icon: CheckCircle,
      color: 'text-gray-600',
      count: orderStats[OrderStatus.COMPLETED] || 0,
      description: '已交付完成的訂單'
    }
  ];

  // Handle tab change
  const handleTabChange = (tab: typeof currentTab) => {
    setCurrentTab(tab);
    
    // Update filters based on selected tab
    if (tab === 'all') {
      setFilters({ status: undefined });
    } else {
      setFilters({ status: [tab as OrderStatus] });
    }
  };

  // Handle export orders
  const handleExportOrders = () => {
    // This would implement actual export functionality
    console.log('Exporting orders...', { filters, search });
    // You could generate CSV, Excel, or PDF exports here
  };

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshOrders();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshOrders]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + R: Refresh
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        refreshOrders();
      }
      
      // Ctrl/Cmd + F: Focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      }
      
      // Escape: Clear search/filters
      if (event.key === 'Escape') {
        if (search.query) {
          clearSearch();
        } else if (Object.keys(filters).length > 0) {
          clearFilters();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [refreshOrders, search.query, filters, clearSearch, clearFilters]);

  // Render tab navigation
  const renderTabs = () => (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-2 sm:space-x-4 md:space-x-8 overflow-x-auto px-3 sm:px-4 md:px-6 py-2 md:py-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.key;
          
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={cn(
                'flex items-center space-x-1 md:space-x-2 px-2 sm:px-3 md:px-4 py-1.5 md:py-2 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap',
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <Icon className={cn('w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5', isActive ? 'text-blue-600' : tab.color)} />
              <span className="hidden sm:inline md:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.slice(0, 2)}</span>
              
              {/* Count badge */}
              <span className={cn(
                'ml-1 px-1 sm:px-1.5 md:px-2 py-0.5 text-xs font-medium rounded-full',
                isActive
                  ? 'bg-blue-100 text-blue-800'
                  : tab.priority && tab.count > 0
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-600'
              )}>
                {tab.count}
              </span>
              
              {/* Priority indicator */}
              {tab.priority && tab.count > 0 && (
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-400 rounded-full animate-pulse"></div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );

  // Render toolbar
  const renderToolbar = () => (
    <div className="bg-white border-b border-gray-200 p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        {/* Search */}
        <div className="flex-1 w-full sm:max-w-lg">
          <OrderSearch
            search={search}
            onSearchChange={setSearch}
            onClear={clearSearch}
            showAdvanced={false} // Hide advanced features on mobile
            showHistory={false}  // Hide history on mobile
          />
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 w-full sm:w-auto justify-between sm:justify-start">
          {/* Filters */}
          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={cn(
              'flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg transition-colors text-xs sm:text-sm',
              showFiltersPanel || Object.keys(filters).length > 0
                ? 'bg-blue-50 text-blue-600 border-blue-300'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">篩選</span>
            {Object.keys(filters).length > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                {Object.keys(filters).length}
              </span>
            )}
          </button>

          {/* Export */}
          <button
            onClick={handleExportOrders}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
            title="匯出訂單"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">匯出</span>
          </button>

          {/* Refresh */}
          <button
            onClick={refreshOrders}
            disabled={loading}
            className={cn(
              'flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm',
              loading && 'cursor-not-allowed opacity-50'
            )}
            title="重新整理"
          >
            <RefreshCw className={cn('w-3 h-3 sm:w-4 sm:h-4', loading && 'animate-spin')} />
            <span className="hidden sm:inline">重新整理</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettingsPanel(!showSettingsPanel)}
            className={cn(
              'flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg transition-colors text-xs sm:text-sm',
              showSettingsPanel
                ? 'bg-gray-50 text-gray-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
            title="設定"
          >
            <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // Render settings panel
  const renderSettingsPanel = () => {
    if (!showSettingsPanel) return null;

    return (
      <div className="bg-yellow-50 border-b border-yellow-200 p-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-sm font-medium text-yellow-800 mb-3">顯示設定</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Auto refresh settings */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-yellow-700">自動重新整理</span>
              </label>
              
              {autoRefresh && (
                <div className="mt-2">
                  <label className="block text-xs text-yellow-600 mb-1">重新整理間隔（秒）</label>
                  <select
                    value={refreshInterval / 1000}
                    onChange={(e) => setRefreshInterval(parseInt(e.target.value) * 1000)}
                    className="w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="10">10秒</option>
                    <option value="30">30秒</option>
                    <option value="60">60秒</option>
                    <option value="120">2分鐘</option>
                    <option value="300">5分鐘</option>
                  </select>
                </div>
              )}
            </div>

            {/* Notification settings */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-yellow-700">新訂單通知</span>
              </label>
              
              <label className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-yellow-700">緊急訂單提醒</span>
              </label>
            </div>

            {/* View preferences */}
            <div>
              <div className="text-sm text-yellow-700 mb-2">預設視圖模式</div>
              <select className="w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
                <option value="grid">網格視圖</option>
                <option value="list">列表視圖</option>
                <option value="kanban">看板視圖</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between py-3 md:py-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900">訂單管理</h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 truncate">
                統一管理所有訂單狀態和處理流程
              </p>
            </div>
            
            {/* Quick stats - Desktop */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {orderStats[OrderStatus.PENDING] || 0}
                </div>
                <div className="text-xs text-gray-500">待處理</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {orderStats[OrderStatus.PREPARING] || 0}
                </div>
                <div className="text-xs text-gray-500">製作中</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {orderStats[OrderStatus.READY] || 0}
                </div>
                <div className="text-xs text-gray-500">已完成</div>
              </div>
            </div>
            
            {/* Quick stats - Mobile */}
            <div className="flex lg:hidden items-center space-x-3">
              <div className="text-center">
                <div className="text-sm font-bold text-yellow-600">
                  {orderStats[OrderStatus.PENDING] || 0}
                </div>
                <div className="text-xs text-gray-500">待處理</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-orange-600">
                  {orderStats[OrderStatus.PREPARING] || 0}
                </div>
                <div className="text-xs text-gray-500">製作中</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-green-600">
                  {orderStats[OrderStatus.READY] || 0}
                </div>
                <div className="text-xs text-gray-500">完成</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      {renderTabs()}

      {/* Settings Panel */}
      {renderSettingsPanel()}

      {/* Toolbar */}
      {renderToolbar()}

      {/* Filters Panel */}
      {showFiltersPanel && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <OrderFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClear={clearFilters}
              onToggle={() => setShowFiltersPanel(false)}
              showClearButton={true}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6">
        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-red-800 text-sm sm:text-base">載入失敗</div>
                <div className="text-xs sm:text-sm text-red-600 mt-1 truncate">{error}</div>
              </div>
              <button
                onClick={refreshOrders}
                className="ml-2 sm:ml-auto px-2 sm:px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-xs sm:text-sm flex-shrink-0"
              >
                重試
              </button>
            </div>
          </div>
        )}

        {/* Order queue */}
        <OrderQueue
          autoRefresh={autoRefresh}
          refreshInterval={refreshInterval}
          showFilters={false} // Filters are handled at page level
          showStats={false} // Stats are shown in header
          defaultViewMode="grid"
        />
      </div>

      {/* Floating notifications */}
      <div className="fixed bottom-3 sm:bottom-4 right-3 sm:right-4 z-50">
        {/* This would contain real-time notifications */}
        {orderStats[OrderStatus.PENDING] > 0 && (
          <div className="bg-yellow-500 text-white px-3 sm:px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 mb-2 max-w-xs sm:max-w-none">
            <Bell className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium">
              {orderStats[OrderStatus.PENDING]} 個新訂單待處理
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderManagementPage;