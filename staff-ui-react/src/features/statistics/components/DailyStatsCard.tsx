/**
 * DailyStatsCard Component
 * 每日統計數據卡片組件 - 顯示訂單數量、完成率、平均處理時間、營收等
 */

import React from 'react';
import { DailyStats } from '../store/statisticsStore';
import { formatStatsData } from '../services/statisticsApi';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Clock,
  CheckCircle,
  ShoppingBag,
  DollarSign,
  Calendar,
  Target,
  Activity
} from 'lucide-react';

export interface DailyStatsCardProps {
  stats: DailyStats | null;
  loading?: boolean;
  className?: string;
  showComparison?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export interface StatItemProps {
  label: string;
  value: string | number;
  previousValue?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  format?: 'number' | 'currency' | 'percentage' | 'time';
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const StatItem: React.FC<StatItemProps> = ({
  label,
  value,
  previousValue,
  trend,
  icon,
  format = 'number',
  color = 'blue'
}) => {
  // 格式化數值顯示
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return formatStatsData.formatCurrency(val);
      case 'percentage':
        return formatStatsData.formatPercentage(val / 100);
      case 'time':
        return formatStatsData.formatTime(val);
      default:
        return formatStatsData.formatNumber(val);
    }
  };

  // 計算變化百分比
  const getChangePercent = (): number | null => {
    if (!previousValue || previousValue === 0) return null;
    const currentVal = typeof value === 'string' ? parseFloat(value) : value;
    return ((currentVal - previousValue) / previousValue) * 100;
  };

  const changePercent = getChangePercent();

  // 趨勢顏色類名
  const getTrendColors = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // 圖標顏色類名
  const getIconColors = () => {
    const colorMap = {
      blue: 'text-blue-600 bg-blue-50',
      green: 'text-green-600 bg-green-50',
      purple: 'text-purple-600 bg-purple-50',
      orange: 'text-orange-600 bg-orange-50',
      red: 'text-red-600 bg-red-50',
    };
    return colorMap[color];
  };

  // 趨勢圖標
  const TrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3" />;
      case 'down':
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${getIconColors()}`}>
          {icon}
        </div>
        {changePercent !== null && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColors()}`}>
            <TrendIcon />
            <span>{Math.abs(changePercent).toFixed(1)}%</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">
          {formatValue(value)}
        </p>
        <p className="text-sm text-gray-600">{label}</p>
        {previousValue && (
          <p className="text-xs text-gray-500">
            昨日: {formatValue(previousValue)}
          </p>
        )}
      </div>
    </div>
  );
};

const DailyStatsCard: React.FC<DailyStatsCardProps> = ({
  stats,
  loading = false,
  className = '',
  showComparison = true,
  variant = 'default'
}) => {
  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4">
                <div className="w-8 h-8 bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">暫無今日統計數據</p>
          <p className="text-xs text-gray-400 mt-1">請稍後再試或聯繫系統管理員</p>
        </div>
      </div>
    );
  }

  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {/* 標題區域 */}
      <div className="p-6 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">今日統計概況</h3>
              <p className="text-sm text-gray-500">
                {new Date(stats.date).toLocaleDateString('zh-TW', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </p>
            </div>
          </div>
          
          {!isCompact && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Target className="w-3 h-3" />
                <span>完成率目標: 85%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 統計數據區域 */}
      <div className="p-6">
        <div className={`grid gap-4 ${
          isCompact 
            ? 'grid-cols-2' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        }`}>
          {/* 訂單總數 */}
          <StatItem
            label="訂單總數"
            value={stats.totalOrders}
            previousValue={showComparison ? stats.previousDayOrders : undefined}
            trend={stats.ordersTrend}
            icon={<ShoppingBag className="w-5 h-5" />}
            color="blue"
          />

          {/* 完成率 */}
          <StatItem
            label="完成率"
            value={stats.completionRate}
            trend={stats.completionRate >= 0.85 ? 'up' : 'down'}
            icon={<CheckCircle className="w-5 h-5" />}
            format="percentage"
            color="green"
          />

          {/* 平均處理時間 */}
          <StatItem
            label="平均處理時間"
            value={stats.averageProcessingTime}
            trend={stats.averageProcessingTime <= 15 ? 'up' : 'down'}
            icon={<Clock className="w-5 h-5" />}
            format="time"
            color="purple"
          />

          {/* 營收總額 */}
          <StatItem
            label="營收總額"
            value={stats.totalRevenue}
            previousValue={showComparison ? stats.previousDayRevenue : undefined}
            trend={stats.revenueTrend}
            icon={<DollarSign className="w-5 h-5" />}
            format="currency"
            color="orange"
          />
        </div>

        {/* 詳細模式額外信息 */}
        {isDetailed && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 效率指標 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">效率指標</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">每小時訂單</span>
                    <span className="font-medium">
                      {Math.round(stats.totalOrders / 8)} 單/時
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">平均單價</span>
                    <span className="font-medium">
                      {formatStatsData.formatCurrency(stats.totalRevenue / stats.totalOrders)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 同期比較 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">同期比較</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">訂單成長</span>
                    <span className={`font-medium flex items-center space-x-1 ${
                      stats.ordersTrend === 'up' ? 'text-green-600' : 
                      stats.ordersTrend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {stats.ordersTrend === 'up' ? <TrendingUp className="w-3 h-3" /> :
                       stats.ordersTrend === 'down' ? <TrendingDown className="w-3 h-3" /> :
                       <Minus className="w-3 h-3" />}
                      <span>
                        {Math.abs(((stats.totalOrders - stats.previousDayOrders) / stats.previousDayOrders) * 100).toFixed(1)}%
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">營收成長</span>
                    <span className={`font-medium flex items-center space-x-1 ${
                      stats.revenueTrend === 'up' ? 'text-green-600' : 
                      stats.revenueTrend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {stats.revenueTrend === 'up' ? <TrendingUp className="w-3 h-3" /> :
                       stats.revenueTrend === 'down' ? <TrendingDown className="w-3 h-3" /> :
                       <Minus className="w-3 h-3" />}
                      <span>
                        {Math.abs(((stats.totalRevenue - stats.previousDayRevenue) / stats.previousDayRevenue) * 100).toFixed(1)}%
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 績效評級 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">績效評級</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">整體評分</span>
                    <span className="font-medium text-purple-600">
                      {stats.completionRate >= 0.9 ? 'A+' :
                       stats.completionRate >= 0.8 ? 'A' :
                       stats.completionRate >= 0.7 ? 'B' : 'C'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">效率等級</span>
                    <span className="font-medium text-purple-600">
                      {stats.averageProcessingTime <= 10 ? '優秀' :
                       stats.averageProcessingTime <= 15 ? '良好' :
                       stats.averageProcessingTime <= 20 ? '普通' : '需改善'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyStatsCard;