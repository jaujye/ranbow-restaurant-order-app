/**
 * StatsFilters Component
 * 統計數據篩選組件 - 日期範圍選擇、部門篩選、員工篩選
 */

import React, { useState } from 'react';
import { StatsFilters } from '../store/statisticsStore';
import {
  Calendar,
  Filter,
  Users,
  Building,
  BarChart3,
  RefreshCw,
  Download,
  Settings,
  ChevronDown,
  Search,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface StatsFiltersProps {
  filters: StatsFilters;
  onFiltersChange: (filters: Partial<StatsFilters>) => void;
  onReset?: () => void;
  onExport?: () => void;
  loading?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'sidebar';
  availableStaff?: Array<{ id: string; name: string; department: string }>;
  availableDepartments?: string[];
  availableMetrics?: Array<{ key: string; label: string; description: string }>;
}

interface QuickDateRange {
  label: string;
  days: number;
  key: string;
}

const QUICK_DATE_RANGES: QuickDateRange[] = [
  { label: '今日', days: 0, key: 'today' },
  { label: '昨日', days: 1, key: 'yesterday' },
  { label: '過去7天', days: 7, key: 'week' },
  { label: '過去30天', days: 30, key: 'month' },
  { label: '過去90天', days: 90, key: 'quarter' },
];

const PERIOD_OPTIONS = [
  { value: 'daily' as const, label: '每日', icon: Calendar },
  { value: 'weekly' as const, label: '每週', icon: BarChart3 },
  { value: 'monthly' as const, label: '每月', icon: Clock },
];

const DEFAULT_METRICS = [
  { key: 'orders', label: '訂單數量', description: '處理的總訂單數' },
  { key: 'revenue', label: '營收金額', description: '總營業收入' },
  { key: 'efficiency', label: '工作效率', description: '整體工作效率指標' },
  { key: 'completion_rate', label: '完成率', description: '訂單完成率' },
  { key: 'customer_rating', label: '客戶評分', description: '客戶滿意度評分' },
  { key: 'processing_time', label: '處理時間', description: '平均處理時間' },
];

const StatsFiltersComponent: React.FC<StatsFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  onExport,
  loading = false,
  className = '',
  variant = 'default',
  availableStaff = [],
  availableDepartments = ['廚房', '服務', '管理', '外送'],
  availableMetrics = DEFAULT_METRICS,
}) => {
  const [isExpanded, setIsExpanded] = useState(variant !== 'compact');
  const [staffSearch, setStaffSearch] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 快速日期範圍選擇
  const handleQuickDateRange = (range: QuickDateRange) => {
    const endDate = new Date();
    const startDate = new Date();

    if (range.key === 'today') {
      // 今日
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (range.key === 'yesterday') {
      // 昨日
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // 過去N天
      startDate.setDate(startDate.getDate() - range.days);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    onFiltersChange({
      dateRange: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      }
    });
  };

  // 處理日期範圍變更
  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({
      dateRange: {
        ...filters.dateRange,
        [field]: value,
      }
    });
  };

  // 處理員工選擇
  const handleStaffToggle = (staffId: string) => {
    const currentStaffIds = filters.staffIds || [];
    const isSelected = currentStaffIds.includes(staffId);
    
    const newStaffIds = isSelected
      ? currentStaffIds.filter(id => id !== staffId)
      : [...currentStaffIds, staffId];
      
    onFiltersChange({ staffIds: newStaffIds });
  };

  // 處理部門選擇
  const handleDepartmentToggle = (department: string) => {
    const currentDepartments = filters.departments || [];
    const isSelected = currentDepartments.includes(department);
    
    const newDepartments = isSelected
      ? currentDepartments.filter(dept => dept !== department)
      : [...currentDepartments, department];
      
    onFiltersChange({ departments: newDepartments });
  };

  // 處理指標選擇
  const handleMetricToggle = (metric: string) => {
    const currentMetrics = filters.metrics || [];
    const isSelected = currentMetrics.includes(metric);
    
    const newMetrics = isSelected
      ? currentMetrics.filter(m => m !== metric)
      : [...currentMetrics, metric];
      
    onFiltersChange({ metrics: newMetrics });
  };

  // 篩選員工列表
  const filteredStaff = availableStaff.filter(staff =>
    staff.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
    staff.department.toLowerCase().includes(staffSearch.toLowerCase())
  );

  // 獲取選中的員工數量
  const selectedStaffCount = (filters.staffIds || []).length;
  const selectedDepartmentCount = (filters.departments || []).length;
  const selectedMetricCount = (filters.metrics || []).length;

  // 檢查是否有活動篩選
  const hasActiveFilters = selectedStaffCount > 0 || selectedDepartmentCount > 0 || 
                          selectedMetricCount < availableMetrics.length;

  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-100 ${className}`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <Filter className="w-4 h-4" />
              <span className="font-medium">篩選條件</span>
              {hasActiveFilters && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
              <ChevronDown className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            
            <div className="flex items-center space-x-2">
              {onExport && (
                <button
                  onClick={onExport}
                  disabled={loading}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
              {onReset && hasActiveFilters && (
                <button
                  onClick={onReset}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  重置
                </button>
              )}
            </div>
          </div>
          
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              {/* 快速日期選擇 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {QUICK_DATE_RANGES.map((range) => (
                  <button
                    key={range.key}
                    onClick={() => handleQuickDateRange(range)}
                    className="px-3 py-1 text-xs border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
              
              {/* 統計週期選擇 */}
              <div className="flex space-x-2">
                {PERIOD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onFiltersChange({ period: option.value })}
                    className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                      filters.period === option.value
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <option.icon className="w-3 h-3" />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {/* 標題區域 */}
      <div className="p-6 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">篩選設定</h3>
              <p className="text-sm text-gray-500">
                自訂統計數據的顯示範圍和條件
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                <CheckCircle className="w-3 h-3" />
                <span>已套用篩選</span>
              </div>
            )}
            
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`p-2 rounded-lg transition-colors ${
                showAdvanced ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              title="進階設定"
            >
              <Settings className="w-4 h-4" />
            </button>
            
            {onExport && (
              <button
                onClick={onExport}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                title="匯出數據"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            
            {onReset && (
              <button
                onClick={onReset}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                title="重置篩選"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 日期範圍選擇 */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>日期範圍</span>
          </h4>
          
          {/* 快速選擇按鈕 */}
          <div className="flex flex-wrap gap-2">
            {QUICK_DATE_RANGES.map((range) => (
              <button
                key={range.key}
                onClick={() => handleQuickDateRange(range)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {range.label}
              </button>
            ))}
          </div>
          
          {/* 自訂日期範圍 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">開始日期</label>
              <input
                type="date"
                value={filters.dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">結束日期</label>
              <input
                type="date"
                value={filters.dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 統計週期 */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-green-600" />
            <span>統計週期</span>
          </h4>
          
          <div className="flex space-x-2">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onFiltersChange({ period: option.value })}
                className={`flex items-center space-x-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                  filters.period === option.value
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <option.icon className="w-4 h-4" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 部門篩選 */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center space-x-2">
            <Building className="w-4 h-4 text-purple-600" />
            <span>部門篩選</span>
            {selectedDepartmentCount > 0 && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                {selectedDepartmentCount} 個已選
              </span>
            )}
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {availableDepartments.map((department) => (
              <button
                key={department}
                onClick={() => handleDepartmentToggle(department)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  (filters.departments || []).includes(department)
                    ? 'bg-purple-100 text-purple-700 border-purple-200'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {department}
              </button>
            ))}
          </div>
        </div>

        {/* 員工篩選 */}
        {availableStaff.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <Users className="w-4 h-4 text-orange-600" />
              <span>員工篩選</span>
              {selectedStaffCount > 0 && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                  {selectedStaffCount} 人已選
                </span>
              )}
            </h4>
            
            {/* 員工搜尋 */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜尋員工姓名或部門..."
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* 員工列表 */}
            <div className="max-h-48 overflow-y-auto space-y-2">
              {filteredStaff.map((staff) => (
                <button
                  key={staff.id}
                  onClick={() => handleStaffToggle(staff.id)}
                  className={`w-full flex items-center justify-between p-3 text-sm rounded-lg border transition-colors ${
                    (filters.staffIds || []).includes(staff.id)
                      ? 'bg-orange-100 text-orange-700 border-orange-200'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      (filters.staffIds || []).includes(staff.id) ? 'bg-orange-500' : 'bg-gray-300'
                    }`} />
                    <span className="font-medium">{staff.name}</span>
                    <span className="text-xs text-gray-500">{staff.department}</span>
                  </div>
                </button>
              ))}
            </div>
            
            {filteredStaff.length === 0 && staffSearch && (
              <div className="text-center py-4 text-gray-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>找不到符合條件的員工</p>
              </div>
            )}
          </div>
        )}

        {/* 進階選項 */}
        {showAdvanced && (
          <div className="space-y-3 pt-6 border-t border-gray-100">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <Settings className="w-4 h-4 text-indigo-600" />
              <span>統計指標</span>
              {selectedMetricCount > 0 && selectedMetricCount < availableMetrics.length && (
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                  {selectedMetricCount} / {availableMetrics.length}
                </span>
              )}
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableMetrics.map((metric) => (
                <button
                  key={metric.key}
                  onClick={() => handleMetricToggle(metric.key)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    (filters.metrics || []).includes(metric.key)
                      ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                  title={metric.description}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{metric.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{metric.description}</div>
                    </div>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      (filters.metrics || []).includes(metric.key)
                        ? 'bg-indigo-500 border-indigo-500 text-white'
                        : 'border-gray-300'
                    }`}>
                      {(filters.metrics || []).includes(metric.key) && (
                        <CheckCircle className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 操作按鈕 */}
        <div className="flex justify-between pt-6 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {hasActiveFilters ? (
              <div className="flex items-center space-x-1 text-blue-600">
                <CheckCircle className="w-4 h-4" />
                <span>篩選條件已套用</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>顯示所有數據</span>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            {onReset && hasActiveFilters && (
              <button
                onClick={onReset}
                disabled={loading}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                重置篩選
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsFiltersComponent;