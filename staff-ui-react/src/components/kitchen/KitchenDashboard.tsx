/**
 * 🍳 Kitchen Dashboard Component
 * Main kitchen interface with real-time management and comprehensive controls
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChefHat,
  Timer,
  Users,
  Activity,
  AlertTriangle,
  Settings,
  Maximize2,
  Minimize2,
  Grid,
  List,
  Filter,
  Volume2,
  VolumeX,
  RefreshCw,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  Pause,
  Play
} from 'lucide-react'
import { cn } from '../../utils'
import { 
  useKitchenStore,
  useActiveTimers,
  useCookingQueue,
  useKitchenStations,
  useKitchenAlerts,
  useKitchenWorkload,
  useKitchenPerformance,
  useKitchenActions,
  useAudioSettings,
  CookingStage,
  useKitchenViewMode,
  useTimerUpdates
} from '../../store/kitchenStore'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import CookingTimer from './CookingTimer'
import KitchenQueue from './KitchenQueue'
import WorkstationPanel from './WorkstationPanel'
import TimerControls from './TimerControls'
import { KitchenPerformance } from './KitchenPerformance'

interface KitchenDashboardProps {
  className?: string
}

export const KitchenDashboard: React.FC<KitchenDashboardProps> = ({ className }) => {
  // Store hooks
  const activeTimers = useActiveTimers()
  const cookingQueue = useCookingQueue()
  const kitchenStations = useKitchenStations()
  const alerts = useKitchenAlerts()
  const workload = useKitchenWorkload()
  const performance = useKitchenPerformance()
  const audioSettings = useAudioSettings()
  const viewMode = useKitchenViewMode()
  
  const {
    selectedTimer,
    selectedStation,
    selectTimer,
    selectStation,
    setViewMode,
    updateAudioSettings,
    acknowledgeAlert,
    dismissAlert,
    clearAllAlerts,
    fetchCookingQueue,
    updateKitchenMetrics
  } = useKitchenActions()

  // Initialize timer updates
  useTimerUpdates()

  // Local state
  const [selectedTimers, setSelectedTimers] = useState<string[]>([])
  const [showPerformance, setShowPerformance] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds
  const [compactMode, setCompactMode] = useState(false)
  const [filterStage, setFilterStage] = useState<CookingStage | 'ALL'>('ALL')

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchCookingQueue()
      updateKitchenMetrics()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchCookingQueue, updateKitchenMetrics])

  // Dashboard statistics
  const dashboardStats = useMemo(() => {
    const runningTimers = activeTimers.filter(t => t.status === 'RUNNING').length
    const overdueTimers = activeTimers.filter(t => t.isOverdue).length
    const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length
    const totalOrders = cookingQueue.length
    const avgCapacity = kitchenStations.length > 0 
      ? kitchenStations.reduce((acc, station) => acc + station.capacity, 0) / kitchenStations.length
      : 0

    return {
      runningTimers,
      overdueTimers,
      criticalAlerts,
      totalOrders,
      avgCapacity,
      rushMode: workload.rushMode,
      efficiency: performance.efficiencyScore
    }
  }, [activeTimers, alerts, cookingQueue, kitchenStations, workload, performance])

  // Handle timer selection
  const handleTimerSelection = useCallback((timerId: string, isCtrlClick = false) => {
    if (isCtrlClick) {
      setSelectedTimers(prev => 
        prev.includes(timerId) 
          ? prev.filter(id => id !== timerId)
          : [...prev, timerId]
      )
    } else {
      setSelectedTimers([timerId])
      selectTimer(timerId)
    }
  }, [selectTimer])

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Filter timers based on stage
  const filteredTimers = useMemo(() => {
    if (filterStage === 'ALL') return activeTimers
    return activeTimers.filter(timer => timer.stage === filterStage)
  }, [activeTimers, filterStage])

  // Render dashboard header
  const renderHeader = () => (
    <Card className="p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Kitchen Dashboard</h1>
              <p className="text-sm text-gray-500">
                Real-time cooking management system
              </p>
            </div>
          </div>

          {/* Rush Mode Indicator */}
          {dashboardStats.rushMode && (
            <motion.div
              className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-4 h-4" />
              <span className="font-medium">RUSH MODE</span>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Toggle */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateAudioSettings({ enabled: !audioSettings.enabled })}
            className={cn(audioSettings.enabled ? 'text-blue-600' : 'text-gray-400')}
          >
            {audioSettings.enabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </Button>

          {/* Auto Refresh Toggle */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(autoRefresh ? 'text-green-600' : 'text-gray-400')}
          >
            <RefreshCw className={cn('w-4 h-4', autoRefresh && 'animate-spin')} />
          </Button>

          {/* View Mode Toggle */}
          <div className="flex rounded-md border">
            <Button
              size="sm"
              variant={viewMode === 'GRID' ? 'primary' : 'ghost'}
              onClick={() => setViewMode('GRID')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'LIST' ? 'primary' : 'ghost'}
              onClick={() => setViewMode('LIST')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Settings */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* Fullscreen Toggle */}
          <Button
            size="sm"
            variant="outline"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  )

  // Render stats overview
  const renderStatsOverview = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-blue-600">
          {dashboardStats.runningTimers}
        </div>
        <div className="text-sm text-gray-500">Running</div>
        <Timer className="w-4 h-4 mx-auto mt-1 text-blue-400" />
      </Card>

      <Card className="p-4 text-center">
        <div className={cn(
          'text-2xl font-bold',
          dashboardStats.overdueTimers > 0 ? 'text-red-600' : 'text-gray-600'
        )}>
          {dashboardStats.overdueTimers}
        </div>
        <div className="text-sm text-gray-500">Overdue</div>
        <AlertTriangle className="w-4 h-4 mx-auto mt-1 text-red-400" />
      </Card>

      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-orange-600">
          {dashboardStats.totalOrders}
        </div>
        <div className="text-sm text-gray-500">Queue</div>
        <Clock className="w-4 h-4 mx-auto mt-1 text-orange-400" />
      </Card>

      <Card className="p-4 text-center">
        <div className={cn(
          'text-2xl font-bold',
          dashboardStats.criticalAlerts > 0 ? 'text-red-600' : 'text-green-600'
        )}>
          {dashboardStats.criticalAlerts}
        </div>
        <div className="text-sm text-gray-500">Alerts</div>
        <Bell className="w-4 h-4 mx-auto mt-1 text-yellow-400" />
      </Card>

      <Card className="p-4 text-center">
        <div className={cn(
          'text-2xl font-bold',
          dashboardStats.avgCapacity > 80 ? 'text-red-600' : 
          dashboardStats.avgCapacity > 60 ? 'text-yellow-600' : 'text-green-600'
        )}>
          {Math.round(dashboardStats.avgCapacity)}%
        </div>
        <div className="text-sm text-gray-500">Capacity</div>
        <Activity className="w-4 h-4 mx-auto mt-1 text-blue-400" />
      </Card>

      <Card className="p-4 text-center">
        <div className={cn(
          'text-2xl font-bold',
          dashboardStats.efficiency >= 80 ? 'text-green-600' : 
          dashboardStats.efficiency >= 60 ? 'text-yellow-600' : 'text-red-600'
        )}>
          {Math.round(dashboardStats.efficiency)}%
        </div>
        <div className="text-sm text-gray-500">Efficiency</div>
        {dashboardStats.efficiency >= 80 ? (
          <TrendingUp className="w-4 h-4 mx-auto mt-1 text-green-400" />
        ) : (
          <TrendingDown className="w-4 h-4 mx-auto mt-1 text-red-400" />
        )}
      </Card>
    </div>
  )

  // Render alerts bar
  const renderAlertsBar = () => {
    const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged)
    if (criticalAlerts.length === 0) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <Card className="p-3 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <span className="font-medium text-red-800">
                  {criticalAlerts.length} Critical Alert{criticalAlerts.length !== 1 ? 's' : ''}
                </span>
                <p className="text-sm text-red-600">
                  {criticalAlerts[0]?.message}
                  {criticalAlerts.length > 1 && ` +${criticalAlerts.length - 1} more`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => criticalAlerts.forEach(alert => acknowledgeAlert(alert.id))}
              >
                Acknowledge
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => criticalAlerts.forEach(alert => dismissAlert(alert.id))}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  // Render main content based on view mode
  const renderMainContent = () => {
    if (compactMode) {
      return renderCompactView()
    }

    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Timers */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Active Timers</h2>
            <div className="flex items-center gap-2">
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value as CookingStage | 'ALL')}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Stages</option>
                <option value="PREP">Preparation</option>
                <option value="COOKING">Cooking</option>
                <option value="PLATING">Plating</option>
                <option value="READY">Ready</option>
              </select>
            </div>
          </div>

          {viewMode === 'GRID' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredTimers.map(timer => (
                  <motion.div
                    key={timer.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <CookingTimer
                      timer={timer}
                      size="md"
                      onSelect={(timerId) => handleTimerSelection(timerId)}
                      className={cn(
                        selectedTimers.includes(timer.id) && 'ring-2 ring-blue-500'
                      )}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredTimers.map(timer => (
                  <motion.div
                    key={timer.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <CookingTimer
                      timer={timer}
                      size="sm"
                      showControls={false}
                      onSelect={(timerId) => handleTimerSelection(timerId)}
                      className={cn(
                        'cursor-pointer',
                        selectedTimers.includes(timer.id) && 'ring-2 ring-blue-500'
                      )}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {filteredTimers.length === 0 && (
            <Card className="p-8 text-center text-gray-500">
              <Timer className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No active timers</p>
              {activeTimers.length > 0 && filterStage !== 'ALL' && (
                <p className="text-sm mt-1">Try changing the stage filter</p>
              )}
            </Card>
          )}
        </div>

        {/* Right Column - Queue & Controls */}
        <div className="space-y-6">
          {/* Timer Controls */}
          {selectedTimers.length > 0 && (
            <TimerControls
              selectedTimers={selectedTimers}
              showBatchControls={selectedTimers.length > 1}
            />
          )}

          {/* Kitchen Queue */}
          <KitchenQueue
            maxHeight={400}
            onOrderSelect={(orderId) => {
              // Handle order selection
            }}
          />

          {/* Station Overview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Stations</h3>
            <WorkstationPanel
              compact={true}
              onStationSelect={selectStation}
            />
          </div>
        </div>
      </div>
    )
  }

  // Render compact view for smaller screens
  const renderCompactView = () => (
    <div className="space-y-4">
      {/* Timers */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Active Timers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredTimers.slice(0, 4).map(timer => (
            <CookingTimer
              key={timer.id}
              timer={timer}
              size="sm"
              showDetails={false}
              onSelect={(timerId) => handleTimerSelection(timerId)}
            />
          ))}
        </div>
        {filteredTimers.length > 4 && (
          <p className="text-sm text-gray-500 mt-2">
            +{filteredTimers.length - 4} more timers
          </p>
        )}
      </Card>

      {/* Queue */}
      <KitchenQueue maxHeight={300} showFilters={false} />
    </div>
  )

  return (
    <div className={cn('min-h-screen bg-gray-50 p-4', className)}>
      {/* Header */}
      {renderHeader()}

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <DashboardSettings
              compactMode={compactMode}
              onCompactModeChange={setCompactMode}
              autoRefresh={autoRefresh}
              onAutoRefreshChange={setAutoRefresh}
              refreshInterval={refreshInterval}
              onRefreshIntervalChange={setRefreshInterval}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Overview */}
      {!compactMode && renderStatsOverview()}

      {/* Alerts Bar */}
      {renderAlertsBar()}

      {/* Performance Panel */}
      <AnimatePresence>
        {showPerformance && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <KitchenPerformance />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      {renderMainContent()}

      {/* Floating Performance Toggle */}
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      >
        <Button
          onClick={() => setShowPerformance(!showPerformance)}
          className="rounded-full w-12 h-12 shadow-lg"
          variant={showPerformance ? 'primary' : 'outline'}
        >
          <TrendingUp className="w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  )
}

/**
 * ⚙️ Dashboard Settings Panel
 */
const DashboardSettings: React.FC<{
  compactMode: boolean
  onCompactModeChange: (compact: boolean) => void
  autoRefresh: boolean
  onAutoRefreshChange: (enabled: boolean) => void
  refreshInterval: number
  onRefreshIntervalChange: (interval: number) => void
}> = ({
  compactMode,
  onCompactModeChange,
  autoRefresh,
  onAutoRefreshChange,
  refreshInterval,
  onRefreshIntervalChange
}) => {
  return (
    <Card className="p-4">
      <h3 className="font-semibold text-gray-800 mb-4">Dashboard Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={compactMode}
              onChange={(e) => onCompactModeChange(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">Compact Mode</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Simplified view for smaller screens
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => onAutoRefreshChange(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">Auto Refresh</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Automatically update data
          </p>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Refresh Interval
          </label>
          <select
            value={refreshInterval}
            onChange={(e) => onRefreshIntervalChange(Number(e.target.value))}
            disabled={!autoRefresh}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value={10000}>10 seconds</option>
            <option value={30000}>30 seconds</option>
            <option value={60000}>1 minute</option>
            <option value={300000}>5 minutes</option>
          </select>
        </div>
      </div>
    </Card>
  )
}

export default KitchenDashboard