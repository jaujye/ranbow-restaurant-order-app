/**
 * PerformanceChart Component
 * 使用Recharts的互動式圖表 - 支援折線圖、柱狀圖、圓餅圖、面積圖
 */

import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartData, ChartConfig } from '../store/statisticsStore';
import { formatStatsData } from '../services/statisticsApi';
import { 
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Activity,
  TrendingUp,
  Settings,
  Download,
  Maximize2
} from 'lucide-react';

interface PerformanceChartProps {
  data: ChartData[];
  chartConfig: ChartConfig;
  title?: string;
  subtitle?: string;
  height?: number;
  className?: string;
  onConfigChange?: (config: Partial<ChartConfig>) => void;
  onExport?: (format: 'png' | 'svg' | 'pdf') => void;
  showControls?: boolean;
  showFullscreen?: boolean;
}

// 彩虹主題色彩配置
const RAINBOW_COLORS = [
  '#FF6B6B', // 紅
  '#4ECDC4', // 青
  '#45B7D1', // 藍
  '#96CEB4', // 綠
  '#FFEAA7', // 黃
  '#DDA0DD', // 紫
  '#98D8C8', // 薄荷綠
  '#F7DC6F', // 金黃
  '#BB8FCE', // 淡紫
  '#85C1E9', // 天藍
];

const PROFESSIONAL_COLORS = [
  '#2563EB', '#059669', '#DC2626', '#7C3AED',
  '#EA580C', '#0891B2', '#BE123C', '#9333EA'
];

const PERFORMANCE_COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444',
  '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
];

// 自定義Tooltip
const CustomTooltip: React.FC<any> = ({ active, payload, label, chartType, formatType }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.name}:</span>
            <span className="text-sm font-medium text-gray-900">
              {formatType === 'currency' ? formatStatsData.formatCurrency(entry.value) :
               formatType === 'percentage' ? formatStatsData.formatPercentage(entry.value / 100) :
               formatType === 'time' ? formatStatsData.formatTime(entry.value) :
               formatStatsData.formatNumber(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// 圖表類型選擇器
const ChartTypeSelector: React.FC<{
  current: string;
  onChange: (type: ChartConfig['chartType']) => void;
}> = ({ current, onChange }) => {
  const types = [
    { value: 'line', label: '折線圖', icon: LineChartIcon },
    { value: 'bar', label: '柱狀圖', icon: BarChartIcon },
    { value: 'area', label: '面積圖', icon: Activity },
    { value: 'pie', label: '圓餅圖', icon: PieChartIcon },
    { value: 'radar', label: '雷達圖', icon: TrendingUp },
  ] as const;

  return (
    <div className="flex space-x-2">
      {types.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            current === value
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title={label}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  chartConfig,
  title = '績效圖表',
  subtitle,
  height = 400,
  className = '',
  onConfigChange,
  onExport,
  showControls = true,
  showFullscreen = false,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 獲取色彩配置
  const getColors = useMemo(() => {
    switch (chartConfig.colorScheme) {
      case 'professional':
        return PROFESSIONAL_COLORS;
      case 'performance':
        return PERFORMANCE_COLORS;
      default:
        return RAINBOW_COLORS;
    }
  }, [chartConfig.colorScheme]);

  // 數據格式檢測
  const chartDataType = useMemo(() => {
    if (data.length === 0) return 'number';
    
    const sampleValue = data[0].value;
    if (title.includes('營收') || title.includes('收入')) return 'currency';
    if (title.includes('率') || title.includes('百分比')) return 'percentage';
    if (title.includes('時間') || title.includes('處理')) return 'time';
    
    return 'number';
  }, [data, title]);

  // 渲染圖表內容
  const renderChart = () => {
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChartIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">暫無數據</p>
            <p className="text-sm text-gray-400">請選擇其他時間範圍或檢查數據源</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
    };

    switch (chartConfig.chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              stroke="#9CA3AF"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#9CA3AF"
            />
            <Tooltip content={<CustomTooltip chartType="line" formatType={chartDataType} />} />
            {chartConfig.showComparison && <Legend />}
            <Line
              type="monotone"
              dataKey="value"
              stroke={getColors[0]}
              strokeWidth={3}
              dot={{ fill: getColors[0], strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: getColors[0], strokeWidth: 2 }}
              animationDuration={chartConfig.animations ? 1000 : 0}
            />
            {chartConfig.showTrend && data.some(item => item.trend !== undefined) && (
              <Line
                type="monotone"
                dataKey="trend"
                stroke={getColors[1]}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="趨勢線"
              />
            )}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              stroke="#9CA3AF"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#9CA3AF"
            />
            <Tooltip content={<CustomTooltip chartType="bar" formatType={chartDataType} />} />
            {chartConfig.showComparison && <Legend />}
            <Bar
              dataKey="value"
              fill={getColors[0]}
              radius={[4, 4, 0, 0]}
              animationDuration={chartConfig.animations ? 1000 : 0}
            />
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              stroke="#9CA3AF"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#9CA3AF"
            />
            <Tooltip content={<CustomTooltip chartType="area" formatType={chartDataType} />} />
            {chartConfig.showComparison && <Legend />}
            <Area
              type="monotone"
              dataKey="value"
              stroke={getColors[0]}
              fill={`${getColors[0]}20`}
              strokeWidth={2}
              animationDuration={chartConfig.animations ? 1000 : 0}
            />
          </AreaChart>
        );

      case 'pie':
        const pieData = data.map((item, index) => ({
          ...item,
          fill: getColors[index % getColors.length],
        }));
        
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={60}
              dataKey="value"
              animationDuration={chartConfig.animations ? 1000 : 0}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip chartType="pie" formatType={chartDataType} />} />
            <Legend />
          </PieChart>
        );

      case 'radar':
        return (
          <RadarChart {...commonProps}>
            <PolarGrid stroke="#f0f0f0" />
            <PolarAngleAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={0} 
              domain={[0, 'dataMax']}
              tick={{ fontSize: 10 }}
            />
            <Radar
              name="數值"
              dataKey="value"
              stroke={getColors[0]}
              fill={`${getColors[0]}20`}
              strokeWidth={2}
              animationDuration={chartConfig.animations ? 1000 : 0}
            />
            <Tooltip content={<CustomTooltip chartType="radar" formatType={chartDataType} />} />
          </RadarChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {/* 圖表標題和控制區域 */}
      <div className="p-6 pb-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          
          {showControls && onConfigChange && (
            <div className="flex items-center space-x-4">
              {/* 圖表類型選擇 */}
              <ChartTypeSelector
                current={chartConfig.chartType}
                onChange={(type) => onConfigChange({ chartType: type })}
              />
              
              {/* 配置選項 */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onConfigChange({ showTrend: !chartConfig.showTrend })}
                  className={`p-2 rounded-lg transition-colors ${
                    chartConfig.showTrend
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="顯示趨勢線"
                >
                  <TrendingUp className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => onConfigChange({ animations: !chartConfig.animations })}
                  className={`p-2 rounded-lg transition-colors ${
                    chartConfig.animations
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="動畫效果"
                >
                  <Settings className="w-4 h-4" />
                </button>
                
                {onExport && (
                  <button
                    onClick={() => onExport('png')}
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    title="匯出圖表"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
                
                {showFullscreen && (
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    title="全螢幕"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* 色彩配置選擇 */}
        {showControls && onConfigChange && (
          <div className="mt-4 flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">色彩主題:</span>
            <div className="flex space-x-2">
              {(['rainbow', 'professional', 'performance'] as const).map((scheme) => (
                <button
                  key={scheme}
                  onClick={() => onConfigChange({ colorScheme: scheme })}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    chartConfig.colorScheme === scheme
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {scheme === 'rainbow' ? '彩虹' :
                   scheme === 'professional' ? '專業' : '績效'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 圖表內容區域 */}
      <div className="p-6">
        <div style={{ height: isFullscreen ? '80vh' : height }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 數據摘要 */}
      {data.length > 0 && (
        <div className="px-6 pb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500">最大值</p>
                <p className="text-sm font-semibold text-gray-900">
                  {chartDataType === 'currency' ? 
                    formatStatsData.formatCurrency(Math.max(...data.map(d => d.value))) :
                    formatStatsData.formatNumber(Math.max(...data.map(d => d.value)))
                  }
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">最小值</p>
                <p className="text-sm font-semibold text-gray-900">
                  {chartDataType === 'currency' ? 
                    formatStatsData.formatCurrency(Math.min(...data.map(d => d.value))) :
                    formatStatsData.formatNumber(Math.min(...data.map(d => d.value)))
                  }
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">平均值</p>
                <p className="text-sm font-semibold text-gray-900">
                  {chartDataType === 'currency' ? 
                    formatStatsData.formatCurrency(data.reduce((sum, d) => sum + d.value, 0) / data.length) :
                    formatStatsData.formatNumber(data.reduce((sum, d) => sum + d.value, 0) / data.length)
                  }
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">數據點</p>
                <p className="text-sm font-semibold text-gray-900">{data.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceChart;