/**
 * EfficiencyMetrics Component
 * 效率指標展示組件 - KPI儀表板、達成率、效率分析
 */

import React, { useMemo } from 'react';
import { PerformanceMetrics } from '../store/statisticsStore';
import { formatStatsData } from '../services/statisticsApi';
import {
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  CheckCircle,
  Activity,
  Gauge,
  Award,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface EfficiencyMetricsProps {
  metrics: PerformanceMetrics | null;
  loading?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showTargets?: boolean;
  targets?: {
    ordersPerHour: number;
    averageWaitTime: number;
    customerSatisfaction: number;
    errorRate: number;
    peakEfficiency: number;
  };
}

interface MetricCardProps {
  title: string;
  value: number;
  target?: number;
  format: 'number' | 'time' | 'percentage' | 'rating';
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  description?: string;
  showProgress?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  target,
  format,
  icon,
  color,
  trend,
  trendValue,
  description,
  showProgress = false,
}) => {
  const formatValue = (val: number): string => {
    switch (format) {
      case 'time':
        return formatStatsData.formatTime(val);
      case 'percentage':
        return formatStatsData.formatPercentage(val / 100);
      case 'rating':
        return val.toFixed(1);
      default:
        return formatStatsData.formatNumber(val);
    }
  };

  const getColorClasses = () => {
    const colorMap = {
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      green: 'text-green-600 bg-green-50 border-green-200',
      yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      red: 'text-red-600 bg-red-50 border-red-200',
      purple: 'text-purple-600 bg-purple-50 border-purple-200',
      indigo: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    };
    return colorMap[color];
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <ArrowDown className="w-3 h-3 text-red-500" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const getProgressPercentage = (): number => {
    if (!target || target === 0) return 0;
    return Math.min((value / target) * 100, 100);
  };

  const getPerformanceStatus = (): 'excellent' | 'good' | 'average' | 'poor' => {
    if (!target) return 'average';
    
    const percentage = (value / target) * 100;
    if (percentage >= 90) return 'excellent';
    if (percentage >= 80) return 'good';
    if (percentage >= 60) return 'average';
    return 'poor';
  };

  const performanceStatus = getPerformanceStatus();
  const progressPercentage = getProgressPercentage();

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border transition-all hover:shadow-md ${getColorClasses()}`}>
      {/* 指標標題和圖標 */}
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${color === 'blue' ? 'bg-blue-100' : 
                                           color === 'green' ? 'bg-green-100' : 
                                           color === 'yellow' ? 'bg-yellow-100' : 
                                           color === 'red' ? 'bg-red-100' : 
                                           color === 'purple' ? 'bg-purple-100' : 'bg-indigo-100'}`}>
          {icon}
        </div>
        {trend && trendValue && (
          <div className="flex items-center space-x-1">
            {getTrendIcon()}
            <span className={`text-xs font-medium ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {Math.abs(trendValue).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* 數值顯示 */}
      <div className="space-y-2">
        <p className="text-2xl font-bold text-gray-900">
          {formatValue(value)}
        </p>
        <p className="text-sm font-medium text-gray-700">{title}</p>
        
        {/* 目標對比 */}
        {target && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>目標: {formatValue(target)}</span>
              <span className={`font-medium ${
                performanceStatus === 'excellent' ? 'text-green-600' :
                performanceStatus === 'good' ? 'text-blue-600' :
                performanceStatus === 'average' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {performanceStatus === 'excellent' ? '優秀' :
                 performanceStatus === 'good' ? '良好' :
                 performanceStatus === 'average' ? '一般' : '需改善'}
              </span>
            </div>
            
            {showProgress && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    performanceStatus === 'excellent' ? 'bg-green-500' :
                    performanceStatus === 'good' ? 'bg-blue-500' :
                    performanceStatus === 'average' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* 描述文字 */}
        {description && (
          <p className="text-xs text-gray-500 mt-2">{description}</p>
        )}
      </div>
    </div>
  );
};

const EfficiencyMetrics: React.FC<EfficiencyMetricsProps> = ({
  metrics,
  loading = false,
  className = '',
  variant = 'default',
  showTargets = true,
  targets = {
    ordersPerHour: 8,
    averageWaitTime: 15,
    customerSatisfaction: 4.5,
    errorRate: 5,
    peakEfficiency: 85,
  },
}) => {
  // 計算整體效率等級
  const overallEfficiencyGrade = useMemo(() => {
    if (!metrics) return 'N/A';
    
    const scores = [
      (metrics.ordersPerHour / targets.ordersPerHour) * 100,
      ((targets.averageWaitTime - metrics.averageWaitTime) / targets.averageWaitTime) * 100,
      (metrics.customerSatisfaction / 5) * 100,
      ((100 - metrics.errorRate) / 100) * 100,
      metrics.peakEfficiency,
    ];
    
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    if (averageScore >= 90) return 'A+';
    if (averageScore >= 80) return 'A';
    if (averageScore >= 70) return 'B';
    if (averageScore >= 60) return 'C';
    return 'D';
  }, [metrics, targets]);

  // 獲取需要改善的領域
  const improvementAreas = useMemo(() => {
    if (!metrics) return [];
    
    const areas = [];
    
    if (metrics.ordersPerHour < targets.ordersPerHour * 0.8) {
      areas.push({ area: '訂單處理速度', priority: 'high' });
    }
    
    if (metrics.averageWaitTime > targets.averageWaitTime * 1.2) {
      areas.push({ area: '等待時間控制', priority: 'high' });
    }
    
    if (metrics.customerSatisfaction < targets.customerSatisfaction * 0.9) {
      areas.push({ area: '客戶滿意度', priority: 'medium' });
    }
    
    if (metrics.errorRate > targets.errorRate * 1.5) {
      areas.push({ area: '錯誤率控制', priority: 'high' });
    }
    
    return areas;
  }, [metrics, targets]);

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
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

  if (!metrics) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gauge className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">暫無效率指標數據</p>
          <p className="text-xs text-gray-400 mt-1">請稍後再試或聯繫系統管理員</p>
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
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">效率指標儀表板</h3>
              <p className="text-sm text-gray-500">
                實時監控關鍵績效指標 (KPI)
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                overallEfficiencyGrade === 'A+' || overallEfficiencyGrade === 'A' ? 'text-green-600' :
                overallEfficiencyGrade === 'B' ? 'text-blue-600' :
                overallEfficiencyGrade === 'C' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {overallEfficiencyGrade}
              </div>
              <div className="text-xs text-gray-500">整體等級</div>
            </div>
          </div>
        </div>
      </div>

      {/* 指標卡片網格 */}
      <div className="p-6">
        <div className={`grid gap-4 ${
          variant === 'compact' 
            ? 'grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {/* 每小時訂單數 */}
          <MetricCard
            title="每小時訂單數"
            value={metrics.ordersPerHour}
            target={showTargets ? targets.ordersPerHour : undefined}
            format="number"
            icon={<Activity className="w-5 h-5" />}
            color="blue"
            showProgress={showTargets}
            description="處理訂單的平均速度"
          />

          {/* 平均等待時間 */}
          <MetricCard
            title="平均等待時間"
            value={metrics.averageWaitTime}
            target={showTargets ? targets.averageWaitTime : undefined}
            format="time"
            icon={<Clock className="w-5 h-5" />}
            color="green"
            showProgress={showTargets}
            description="客戶平均等待時間"
          />

          {/* 客戶滿意度 */}
          <MetricCard
            title="客戶滿意度"
            value={metrics.customerSatisfaction}
            target={showTargets ? targets.customerSatisfaction : undefined}
            format="rating"
            icon={<Award className="w-5 h-5" />}
            color="purple"
            showProgress={showTargets}
            description="客戶評分 (1-5分)"
          />

          {/* 錯誤率 */}
          <MetricCard
            title="錯誤率"
            value={metrics.errorRate}
            target={showTargets ? targets.errorRate : undefined}
            format="percentage"
            icon={<AlertCircle className="w-5 h-5" />}
            color="red"
            showProgress={showTargets}
            description="訂單處理錯誤比率"
          />

          {/* 巔峰效率 */}
          <MetricCard
            title="巔峰效率"
            value={metrics.peakEfficiency}
            target={showTargets ? targets.peakEfficiency : undefined}
            format="percentage"
            icon={<Zap className="w-5 h-5" />}
            color="yellow"
            showProgress={showTargets}
            description="最高效率表現"
          />

          {/* 低效時段效率 */}
          <MetricCard
            title="低效時段效率"
            value={metrics.lowEfficiency}
            format="percentage"
            icon={<TrendingDown className="w-5 h-5" />}
            color="indigo"
            description="需要改善的時段"
          />
        </div>

        {/* 詳細分析區域 */}
        {variant === 'detailed' && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 改善建議 */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-orange-600" />
                  <span>需要改善的領域</span>
                </h4>
                
                {improvementAreas.length > 0 ? (
                  <div className="space-y-3">
                    {improvementAreas.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            item.priority === 'high' ? 'bg-red-500' :
                            item.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <span className="text-sm font-medium text-gray-900">{item.area}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          item.priority === 'high' ? 'bg-red-100 text-red-700' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {item.priority === 'high' ? '高優先級' :
                           item.priority === 'medium' ? '中優先級' : '低優先級'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="text-green-700 font-medium">所有指標表現良好</p>
                    <p className="text-sm text-green-600">繼續保持優秀表現！</p>
                  </div>
                )}
              </div>

              {/* 具體改善建議 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>系統建議</span>
                </h4>
                
                <div className="space-y-3">
                  {metrics.improvementAreas.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 font-medium">{suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 績效摘要 */}
        {variant !== 'compact' && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round((metrics.ordersPerHour / targets.ordersPerHour) * 100)}%
                </div>
                <div className="text-sm text-gray-600">訂單目標達成率</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(((targets.averageWaitTime - metrics.averageWaitTime) / targets.averageWaitTime) * 100)}%
                </div>
                <div className="text-sm text-gray-600">等待時間改善</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round((metrics.customerSatisfaction / 5) * 100)}%
                </div>
                <div className="text-sm text-gray-600">客戶滿意度</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round((100 - metrics.errorRate))}%
                </div>
                <div className="text-sm text-gray-600">準確率</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EfficiencyMetrics;