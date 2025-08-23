/**
 * 📊 Kitchen Performance Component
 * Real-time metrics and performance analytics dashboard
 */

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  DollarSign,
  Activity,
  Target,
  Award,
  Zap,
  BarChart,
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  Filter
} from 'lucide-react'
import { cn } from '../../utils'
import { 
  useKitchenPerformance,
  useKitchenWorkload,
  useActiveTimers,
  useKitchenStations,
  useKitchenActions,
  KitchenPerformance as PerformanceType,
  StaffMetrics
} from '../../store/kitchenStore'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface KitchenPerformanceProps {
  period?: 'today' | 'week' | 'month'
  showDetailsPanel?: boolean
  className?: string
}

export const KitchenPerformance: React.FC<KitchenPerformanceProps> = ({
  period = 'today',
  showDetailsPanel = true,
  className
}) => {
  const performance = useKitchenPerformance()
  const workload = useKitchenWorkload()
  const activeTimers = useActiveTimers()
  const kitchenStations = useKitchenStations()
  const { generatePerformanceReport } = useKitchenActions()

  const [selectedPeriod, setSelectedPeriod] = useState(period)
  const [showDetails, setShowDetails] = useState(showDetailsPanel)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)

  // Real-time calculations
  const realTimeMetrics = useMemo(() => {
    const runningTimers = activeTimers.filter(t => t.status === 'RUNNING')
    const completedTimers = activeTimers.filter(t => t.status === 'COMPLETED')
    const overdueTimers = activeTimers.filter(t => t.isOverdue)
    
    const avgExecutionTime = completedTimers.length > 0
      ? completedTimers.reduce((acc, timer) => acc + timer.actualDuration, 0) / completedTimers.length
      : 0

    const onTimePercentage = completedTimers.length > 0
      ? ((completedTimers.length - overdueTimers.length) / completedTimers.length) * 100
      : 100

    const currentThroughput = runningTimers.length + completedTimers.length

    return {
      currentLoad: runningTimers.length,
      avgExecutionTime,
      onTimePercentage,
      currentThroughput,
      overdueCount: overdueTimers.length
    }
  }, [activeTimers])

  // Refresh performance data
  const refreshData = async () => {
    setIsLoading(true)
    try {
      await generatePerformanceReport(selectedPeriod)
    } catch (error) {
      console.error('Failed to refresh performance data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [selectedPeriod])

  // Performance score calculation
  const calculateOverallScore = () => {
    const weights = {
      efficiency: 0.3,
      onTime: 0.25,
      throughput: 0.2,
      quality: 0.15,
      waste: 0.1
    }

    const score = 
      (performance.efficiencyScore * weights.efficiency) +
      (performance.onTimePercentage * weights.onTime) +
      (Math.min(performance.completionRate / 15, 1) * 100 * weights.throughput) + // 15 orders/hour = 100%
      (performance.customerSatisfaction * 20 * weights.quality) + // 5.0 rating = 100%
      ((100 - performance.wastePercentage) * weights.waste)

    return Math.round(score)
  }

  const overallScore = calculateOverallScore()

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart className="w-6 h-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Kitchen Performance</h2>
              <p className="text-sm text-gray-500">Real-time analytics and metrics</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Period Selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            {/* Refresh Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={refreshData}
              disabled={isLoading}
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            </Button>

            {/* Details Toggle */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Overall Score */}
      <Card className="p-6">
        <div className="text-center">
          <motion.div
            className="relative inline-flex items-center justify-center w-32 h-32 mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-200"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="56"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                className={cn(
                  overallScore >= 80 ? 'text-green-500' :
                  overallScore >= 60 ? 'text-yellow-500' : 'text-red-500'
                )}
                initial={{ strokeDasharray: "0 351.86" }}
                animate={{ 
                  strokeDasharray: `${(overallScore / 100) * 351.86} 351.86` 
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn(
                'text-3xl font-bold',
                overallScore >= 80 ? 'text-green-600' :
                overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'
              )}>
                {overallScore}
              </span>
              <span className="text-sm text-gray-500">Overall Score</span>
            </div>
          </motion.div>

          <div className="flex items-center justify-center gap-2 mb-2">
            {overallScore >= 80 ? (
              <>
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-green-600 font-medium">Excellent Performance</span>
              </>
            ) : overallScore >= 60 ? (
              <>
                <Activity className="w-5 h-5 text-yellow-500" />
                <span className="text-yellow-600 font-medium">Good Performance</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-5 h-5 text-red-500" />
                <span className="text-red-600 font-medium">Needs Improvement</span>
              </>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Based on efficiency, timing, throughput, and quality metrics
          </p>
        </div>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Efficiency"
          value={`${performance.efficiencyScore}%`}
          change={+2.5}
          icon={Target}
          color="blue"
          onClick={() => setSelectedMetric('efficiency')}
          selected={selectedMetric === 'efficiency'}
        />
        
        <MetricCard
          title="On-Time"
          value={`${Math.round(realTimeMetrics.onTimePercentage)}%`}
          change={-1.2}
          icon={Clock}
          color="green"
          onClick={() => setSelectedMetric('onTime')}
          selected={selectedMetric === 'onTime'}
        />
        
        <MetricCard
          title="Throughput"
          value={`${performance.completionRate}/hr`}
          change={+3.8}
          icon={Zap}
          color="orange"
          onClick={() => setSelectedMetric('throughput')}
          selected={selectedMetric === 'throughput'}
        />
        
        <MetricCard
          title="Revenue"
          value={`$${performance.revenuePerHour}`}
          change={+15.2}
          icon={DollarSign}
          color="green"
          onClick={() => setSelectedMetric('revenue')}
          selected={selectedMetric === 'revenue'}
        />
        
        <MetricCard
          title="Satisfaction"
          value={performance.customerSatisfaction.toFixed(1)}
          change={+0.3}
          icon={Award}
          color="purple"
          onClick={() => setSelectedMetric('satisfaction')}
          selected={selectedMetric === 'satisfaction'}
        />
        
        <MetricCard
          title="Waste"
          value={`${performance.wastePercentage}%`}
          change={-0.8}
          icon={AlertTriangle}
          color="red"
          onClick={() => setSelectedMetric('waste')}
          selected={selectedMetric === 'waste'}
        />
      </div>

      {/* Detailed Analytics */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Staff Performance */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Staff Performance</h3>
              <div className="space-y-3">
                {Object.entries(performance.staffPerformance).map(([staffId, metrics]) => (
                  <StaffPerformanceItem
                    key={staffId}
                    staffId={staffId}
                    metrics={metrics}
                  />
                ))}
                {Object.keys(performance.staffPerformance).length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No staff performance data available</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Average Cooking Times */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Cooking Times by Dish</h3>
              <div className="space-y-3">
                {Object.entries(performance.avgCookingTime).length > 0 ? (
                  Object.entries(performance.avgCookingTime).map(([dish, time]) => (
                    <div key={dish} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{dish}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.min((time / 1800) * 100, 100)}%` }} // 30 min max
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No cooking time data available</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Real-time Workload */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Current Workload</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Orders</span>
                  <span className="font-semibold text-gray-800">
                    {realTimeMetrics.currentLoad}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Wait Time</span>
                  <span className="font-semibold text-gray-800">
                    {Math.floor(workload.averageWaitTime / 60)}:{(workload.averageWaitTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Staff Utilization</span>
                  <span className="font-semibold text-gray-800">
                    {workload.staffUtilization}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rush Mode</span>
                  <span className={cn(
                    'font-semibold',
                    workload.rushMode ? 'text-red-600' : 'text-green-600'
                  )}>
                    {workload.rushMode ? 'ACTIVE' : 'NORMAL'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Station Utilization */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Station Utilization</h3>
              <div className="space-y-3">
                {kitchenStations.map(station => (
                  <div key={station.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{station.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={cn(
                            'h-2 rounded-full',
                            station.capacity >= 80 ? 'bg-red-500' :
                            station.capacity >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                          )}
                          style={{ width: `${station.capacity}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {station.capacity}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metric Detail Modal */}
      <AnimatePresence>
        {selectedMetric && (
          <MetricDetailModal
            metric={selectedMetric}
            data={performance}
            onClose={() => setSelectedMetric(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * 📊 Metric Card Component
 */
const MetricCard: React.FC<{
  title: string
  value: string
  change: number
  icon: React.ComponentType<{ className?: string }>
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple'
  onClick?: () => void
  selected?: boolean
}> = ({ title, value, change, icon: Icon, color, onClick, selected = false }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    orange: 'text-orange-600 bg-orange-100',
    red: 'text-red-600 bg-red-100',
    purple: 'text-purple-600 bg-purple-100'
  }

  const changeColor = change >= 0 ? 'text-green-600' : 'text-red-600'
  const ChangeIcon = change >= 0 ? TrendingUp : TrendingDown

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={cn(
          'p-4 cursor-pointer transition-all duration-200',
          selected && 'ring-2 ring-blue-500'
        )}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-2">
          <div className={cn('p-2 rounded-lg', colorClasses[color])}>
            <Icon className="w-4 h-4" />
          </div>
          <div className={cn('flex items-center gap-1 text-xs', changeColor)}>
            <ChangeIcon className="w-3 h-3" />
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        </div>
        
        <div className="text-2xl font-bold text-gray-800 mb-1">
          {value}
        </div>
        
        <div className="text-sm text-gray-500">
          {title}
        </div>
      </Card>
    </motion.div>
  )
}

/**
 * 👤 Staff Performance Item
 */
const StaffPerformanceItem: React.FC<{
  staffId: string
  metrics: StaffMetrics
}> = ({ staffId, metrics }) => {
  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <span className="font-medium text-gray-800">Staff #{staffId}</span>
        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
          <span>{metrics.ordersCompleted} orders</span>
          <span>{Math.floor(metrics.avgTime / 60)}min avg</span>
        </div>
      </div>
      
      <div className="text-right">
        <div className={cn('font-semibold', getPerformanceColor(metrics.efficiency))}>
          {metrics.efficiency}%
        </div>
        <div className="text-xs text-gray-500">efficiency</div>
      </div>
    </div>
  )
}

/**
 * 📈 Metric Detail Modal
 */
const MetricDetailModal: React.FC<{
  metric: string
  data: PerformanceType
  onClose: () => void
}> = ({ metric, data, onClose }) => {
  const getMetricInfo = () => {
    switch (metric) {
      case 'efficiency':
        return {
          title: 'Kitchen Efficiency',
          value: `${data.efficiencyScore}%`,
          description: 'Overall kitchen operational efficiency based on resource utilization and output quality.',
          details: [
            'Resource utilization: 85%',
            'Time management: 92%',
            'Quality consistency: 88%'
          ]
        }
      case 'onTime':
        return {
          title: 'On-Time Performance',
          value: `${data.onTimePercentage}%`,
          description: 'Percentage of orders completed within estimated time frames.',
          details: [
            `Orders completed: ${Object.values(data.staffPerformance).reduce((acc, staff) => acc + staff.ordersCompleted, 0)}`,
            `Overdue orders: ${data.overdueOrders}`,
            'Target: 95%'
          ]
        }
      case 'throughput':
        return {
          title: 'Kitchen Throughput',
          value: `${data.completionRate} orders/hr`,
          description: 'Number of orders completed per hour during peak times.',
          details: [
            'Peak capacity: 18 orders/hr',
            'Average capacity: 12 orders/hr',
            'Current trend: +15%'
          ]
        }
      default:
        return {
          title: 'Metric Details',
          value: 'N/A',
          description: 'Detailed information not available.',
          details: []
        }
    }
  }

  const metricInfo = getMetricInfo()

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg p-6 max-w-md w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {metricInfo.value}
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {metricInfo.title}
          </h3>
          <p className="text-sm text-gray-600">
            {metricInfo.description}
          </p>
        </div>

        {metricInfo.details.length > 0 && (
          <div className="space-y-2">
            {metricInfo.details.map((detail, index) => (
              <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{detail}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default KitchenPerformance