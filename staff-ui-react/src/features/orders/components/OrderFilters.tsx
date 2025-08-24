import React, { useState, useEffect } from 'react';
import { 
  Filter, Calendar, Clock, CreditCard, Star, MapPin, User,
  ChevronDown, X, RefreshCw, Search, DollarSign
} from 'lucide-react';
import { OrderStatus, OrderPriority, PaymentStatus, OrderFilters as OrderFiltersType } from '../store/ordersStore';
import { cn } from '../../../shared/utils/cn';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface OrderFiltersProps {
  filters: OrderFiltersType;
  onFiltersChange: (filters: Partial<OrderFiltersType>) => void;
  onClear: () => void;
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  showClearButton?: boolean;
  compact?: boolean;
}

export function OrderFilters({
  filters,
  onFiltersChange,
  onClear,
  className,
  isOpen = false,
  onToggle,
  showClearButton = true,
  compact = false
}: OrderFiltersProps) {
  const [localFilters, setLocalFilters] = useState<OrderFiltersType>(filters);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (filters.status?.length) count++;
    if (filters.paymentStatus?.length) count++;
    if (filters.priority?.length) count++;
    if (filters.dateRange) count++;
    if (filters.amountRange) count++;
    if (filters.tableNumber) count++;
    if (filters.customerId) count++;
    setActiveFilterCount(count);
  }, [filters]);

  // Apply filters with debounce
  const applyFilters = (newFilters: Partial<OrderFiltersType>) => {
    const updatedFilters = { ...localFilters, ...newFilters };
    setLocalFilters(updatedFilters);
    onFiltersChange(newFilters);
  };

  // Status filter options
  const statusOptions = [
    { value: OrderStatus.PENDING, label: '待處理', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    { value: OrderStatus.CONFIRMED, label: '已確認', color: 'bg-blue-100 text-blue-800', icon: Clock },
    { value: OrderStatus.PREPARING, label: '製作中', color: 'bg-orange-100 text-orange-800', icon: Clock },
    { value: OrderStatus.READY, label: '準備完成', color: 'bg-green-100 text-green-800', icon: Clock },
    { value: OrderStatus.COMPLETED, label: '已完成', color: 'bg-gray-100 text-gray-800', icon: Clock },
    { value: OrderStatus.CANCELLED, label: '已取消', color: 'bg-red-100 text-red-800', icon: X }
  ];

  // Payment status options
  const paymentStatusOptions = [
    { value: PaymentStatus.PENDING, label: '待付款', color: 'bg-yellow-100 text-yellow-800' },
    { value: PaymentStatus.PAID, label: '已付款', color: 'bg-green-100 text-green-800' },
    { value: PaymentStatus.FAILED, label: '付款失敗', color: 'bg-red-100 text-red-800' },
    { value: PaymentStatus.REFUNDED, label: '已退款', color: 'bg-gray-100 text-gray-800' }
  ];

  // Priority options
  const priorityOptions = [
    { value: OrderPriority.LOW, label: '低', color: 'bg-gray-100 text-gray-600' },
    { value: OrderPriority.NORMAL, label: '普通', color: 'bg-blue-100 text-blue-600' },
    { value: OrderPriority.HIGH, label: '高', color: 'bg-yellow-100 text-yellow-600' },
    { value: OrderPriority.URGENT, label: '緊急', color: 'bg-red-100 text-red-600' }
  ];

  // Date range presets
  const datePresets = [
    { label: '今天', getValue: () => {
      const today = new Date().toISOString().split('T')[0];
      return { start: today, end: today };
    }},
    { label: '本週', getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 6);
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      };
    }},
    { label: '本月', getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      };
    }}
  ];

  // Handle multi-select filter
  const handleMultiSelectFilter = (
    filterKey: keyof OrderFiltersType,
    value: any,
    currentValues: any[] = []
  ) => {
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    applyFilters({ [filterKey]: newValues.length > 0 ? newValues : undefined });
  };

  // Handle date range change
  const handleDateRangeChange = (start: string, end: string) => {
    applyFilters({
      dateRange: start && end ? { start, end } : undefined
    });
  };

  // Handle amount range change
  const handleAmountRangeChange = (min: number, max: number) => {
    applyFilters({
      amountRange: min > 0 || max > 0 ? { min: min || 0, max: max || 999999 } : undefined
    });
  };

  // Render filter badge
  const renderFilterBadge = () => {
    if (activeFilterCount === 0) return null;
    
    return (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {activeFilterCount}
      </span>
    );
  };

  // Render compact version
  if (compact) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div className="relative">
          <button
            onClick={onToggle}
            className={cn(
              'flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors',
              activeFilterCount > 0 && 'bg-blue-50 border-blue-300 text-blue-700'
            )}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">篩選</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {showClearButton && activeFilterCount > 0 && (
          <button
            onClick={onClear}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            清除
          </button>
        )}
      </div>
    );
  }

  // Full filter panel
  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg shadow-sm', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">訂單篩選</h3>
          {renderFilterBadge()}
        </div>
        
        <div className="flex items-center space-x-2">
          {showClearButton && activeFilterCount > 0 && (
            <button
              onClick={onClear}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>清除全部</span>
            </button>
          )}
          
          {onToggle && (
            <button
              onClick={onToggle}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter content */}
      <div className="p-4 space-y-6">
        {/* Order Status */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="w-4 h-4 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">訂單狀態</label>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = localFilters.status?.includes(option.value) || false;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleMultiSelectFilter('status', option.value, localFilters.status)}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-1.5 text-sm rounded-lg border transition-colors',
                    isSelected 
                      ? `${option.color} border-current`
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Status */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <CreditCard className="w-4 h-4 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">付款狀態</label>
          </div>
          <div className="flex flex-wrap gap-2">
            {paymentStatusOptions.map((option) => {
              const isSelected = localFilters.paymentStatus?.includes(option.value) || false;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleMultiSelectFilter('paymentStatus', option.value, localFilters.paymentStatus)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                    isSelected 
                      ? `${option.color} border-current`
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Star className="w-4 h-4 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">優先級</label>
          </div>
          <div className="flex flex-wrap gap-2">
            {priorityOptions.map((option) => {
              const isSelected = localFilters.priority?.includes(option.value) || false;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleMultiSelectFilter('priority', option.value, localFilters.priority)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                    isSelected 
                      ? `${option.color} border-current`
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Calendar className="w-4 h-4 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">訂單日期</label>
          </div>
          
          {/* Date presets */}
          <div className="flex space-x-2 mb-3">
            {datePresets.map((preset, index) => (
              <button
                key={index}
                onClick={() => {
                  const range = preset.getValue();
                  handleDateRangeChange(range.start, range.end);
                }}
                className="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
          
          {/* Custom date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">開始日期</label>
              <input
                type="date"
                value={localFilters.dateRange?.start || ''}
                onChange={(e) => handleDateRangeChange(e.target.value, localFilters.dateRange?.end || '')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">結束日期</label>
              <input
                type="date"
                value={localFilters.dateRange?.end || ''}
                onChange={(e) => handleDateRangeChange(localFilters.dateRange?.start || '', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Amount Range */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <DollarSign className="w-4 h-4 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">訂單金額</label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">最低金額</label>
              <input
                type="number"
                min="0"
                step="10"
                placeholder="0"
                value={localFilters.amountRange?.min || ''}
                onChange={(e) => {
                  const min = parseInt(e.target.value) || 0;
                  handleAmountRangeChange(min, localFilters.amountRange?.max || 999999);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">最高金額</label>
              <input
                type="number"
                min="0"
                step="10"
                placeholder="不限"
                value={localFilters.amountRange?.max || ''}
                onChange={(e) => {
                  const max = parseInt(e.target.value) || 999999;
                  handleAmountRangeChange(localFilters.amountRange?.min || 0, max);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Table Number */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <MapPin className="w-4 h-4 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">桌號</label>
          </div>
          <input
            type="text"
            placeholder="請輸入桌號"
            value={localFilters.tableNumber || ''}
            onChange={(e) => applyFilters({ tableNumber: e.target.value || undefined })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Customer ID */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <User className="w-4 h-4 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">客戶編號</label>
          </div>
          <input
            type="text"
            placeholder="請輸入客戶編號"
            value={localFilters.customerId || ''}
            onChange={(e) => applyFilters({ customerId: e.target.value || undefined })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Active filters summary */}
      {activeFilterCount > 0 && (
        <div className="border-t border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-2">
            已套用 {activeFilterCount} 個篩選條件
          </div>
          <div className="flex flex-wrap gap-2">
            {localFilters.status?.map(status => {
              const option = statusOptions.find(o => o.value === status);
              return option && (
                <span key={status} className={cn('px-2 py-1 text-xs rounded-full', option.color)}>
                  {option.label}
                </span>
              );
            })}
            {localFilters.paymentStatus?.map(status => {
              const option = paymentStatusOptions.find(o => o.value === status);
              return option && (
                <span key={status} className={cn('px-2 py-1 text-xs rounded-full', option.color)}>
                  {option.label}
                </span>
              );
            })}
            {localFilters.priority?.map(priority => {
              const option = priorityOptions.find(o => o.value === priority);
              return option && (
                <span key={priority} className={cn('px-2 py-1 text-xs rounded-full', option.color)}>
                  {option.label}
                </span>
              );
            })}
            {localFilters.dateRange && (
              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                {format(new Date(localFilters.dateRange.start), 'MM/dd', { locale: zhTW })} - 
                {format(new Date(localFilters.dateRange.end), 'MM/dd', { locale: zhTW })}
              </span>
            )}
            {localFilters.amountRange && (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                ${localFilters.amountRange.min} - ${localFilters.amountRange.max}
              </span>
            )}
            {localFilters.tableNumber && (
              <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                桌號: {localFilters.tableNumber}
              </span>
            )}
            {localFilters.customerId && (
              <span className="px-2 py-1 text-xs bg-pink-100 text-pink-800 rounded-full">
                客戶: {localFilters.customerId}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderFilters;