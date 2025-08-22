/**
 * 🍳 Kitchen Management Store
 * Advanced kitchen operations with real-time timer management and workstation control
 */

import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { orderService } from '../services/api'

// 🎯 Types for Kitchen Management
export type CookingStage = 'PREP' | 'COOKING' | 'PLATING' | 'READY'
export type TimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'OVERDUE'
export type StationStatus = 'AVAILABLE' | 'BUSY' | 'MAINTENANCE' | 'OFFLINE'
export type AlertType = 'TIMER_WARNING' | 'TIMER_CRITICAL' | 'TIMER_OVERDUE' | 'CAPACITY_HIGH' | 'STATION_DOWN'

export interface CookingTimer {
  id: string
  orderId: number
  assignmentId: string
  estimatedDuration: number // seconds
  actualDuration: number
  remainingTime: number
  elapsed: number
  status: TimerStatus
  stage: CookingStage
  startTime: Date | null
  pausedTime: Date | null
  completedTime: Date | null
  lastUpdate: Date
  isOverdue: boolean
  overdueTime: number
  progress: number // 0-100
  colorCode: string // Visual progression color
  priority: number // 1-5, 5 being highest
}

export interface KitchenStation {
  id: string
  name: string
  type: 'GRILL' | 'WOK' | 'PREP' | 'FRYER' | 'OVEN' | 'COLD' | 'PLATING'
  capacity: number // 0-100%
  status: StationStatus
  activeOrders: string[] // Timer IDs
  maxConcurrent: number
  averageTime: number // Average cooking time in seconds
  assignedStaff: StaffAssignment[]
  equipment: Equipment[]
  temperature?: number
  lastMaintenance: Date
  efficiency: number // 0-100%
}

export interface StaffAssignment {
  staffId: string
  name: string
  role: string
  skillLevel: number // 1-5
  activeTimers: string[]
  workloadScore: number // 0-100
}

export interface Equipment {
  id: string
  name: string
  status: 'OPERATIONAL' | 'WARNING' | 'ERROR' | 'MAINTENANCE'
  temperature?: number
  lastCheck: Date
}

export interface CookingOrder {
  id: number
  tableNumber?: string
  items: OrderItem[]
  priority: number
  estimatedTime: number
  waitTime: number
  stage: CookingStage
  status: string
  assignedStation?: string
  assignedStaff?: string
  specialInstructions?: string
  allergies?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  name: string
  quantity: number
  cookingTime: number
  station: string
  specialRequests?: string
  allergies?: string[]
}

export interface KitchenWorkload {
  totalActiveTimers: number
  averageWaitTime: number
  completionRate: number // orders/hour
  efficiency: number // 0-100%
  rushMode: boolean
  peakTime: boolean
  staffUtilization: number // 0-100%
  stationUtilization: Record<string, number>
}

export interface KitchenAlert {
  id: string
  type: AlertType
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  message: string
  timerId?: string
  stationId?: string
  timestamp: Date
  acknowledged: boolean
  autoResolve: boolean
  soundEnabled: boolean
  actionRequired?: boolean
}

export interface KitchenPerformance {
  avgCookingTime: Record<string, number> // by dish type
  completionRate: number // orders per hour
  efficiencyScore: number // 0-100%
  overdueOrders: number
  onTimePercentage: number
  staffPerformance: Record<string, StaffMetrics>
  revenuePerHour: number
  customerSatisfaction: number
  wastePercentage: number
}

export interface StaffMetrics {
  ordersCompleted: number
  avgTime: number
  accuracy: number // 0-100%
  efficiency: number // 0-100%
}

export interface AudioSettings {
  enabled: boolean
  volume: number // 0-1
  alerts: {
    warning: boolean // 50%
    critical: boolean // 80%
    complete: boolean // 100%
    overdue: boolean // overdue
    capacity: boolean // station capacity
  }
  soundPack: 'default' | 'classic' | 'modern' | 'minimal'
}

export interface KitchenState {
  // Core Data
  activeTimers: CookingTimer[]
  cookingQueue: CookingOrder[]
  kitchenStations: KitchenStation[]
  workloadMetrics: KitchenWorkload
  performanceData: KitchenPerformance
  alerts: KitchenAlert[]
  
  // Settings
  audioSettings: AudioSettings
  timerUpdateInterval: number
  autoAssignment: boolean
  rushModeThreshold: number
  
  // UI State
  selectedTimer: string | null
  selectedStation: string | null
  viewMode: 'GRID' | 'LIST' | 'TIMELINE'
  filterStage: CookingStage | 'ALL'
  sortBy: 'PRIORITY' | 'TIME' | 'STATION'
  
  // Real-time State
  isConnected: boolean
  lastSync: Date | null
  updateCount: number
  
  // Loading States
  loading: {
    timers: boolean
    queue: boolean
    stations: boolean
    performance: boolean
  }
  
  // Errors
  errors: {
    timers: string | null
    queue: string | null
    stations: string | null
    performance: string | null
  }
}

export interface KitchenActions {
  // Timer Management
  startTimer: (orderId: number, estimatedDuration: number) => void
  pauseTimer: (timerId: string) => void
  resumeTimer: (timerId: string) => void
  completeTimer: (timerId: string) => void
  updateTimerStage: (timerId: string, stage: CookingStage) => void
  resetTimer: (timerId: string) => void
  deleteTimer: (timerId: string) => void
  
  // Queue Management
  fetchCookingQueue: () => Promise<void>
  reorderQueue: (orderId: number, newPosition: number) => void
  assignToStation: (orderId: number, stationId: string) => void
  assignToStaff: (orderId: number, staffId: string) => void
  updateOrderPriority: (orderId: number, priority: number) => void
  
  // Station Management
  updateStationCapacity: (stationId: string, capacity: number) => void
  updateStationStatus: (stationId: string, status: StationStatus) => void
  assignStaffToStation: (staffId: string, stationId: string) => void
  removeStaffFromStation: (staffId: string, stationId: string) => void
  
  // Performance Tracking
  recordCompletionTime: (orderId: number, actualDuration: number) => void
  updateKitchenMetrics: () => void
  generatePerformanceReport: (period: string) => Promise<KitchenPerformance>
  
  // Alert Management
  createAlert: (alert: Omit<KitchenAlert, 'id' | 'timestamp'>) => void
  acknowledgeAlert: (alertId: string) => void
  dismissAlert: (alertId: string) => void
  clearAllAlerts: () => void
  
  // Real-time Updates
  onTimerUpdate: (timerId: string, elapsed: number) => void
  onNewOrder: (order: CookingOrder) => void
  onOrderComplete: (orderId: number) => void
  onStationUpdate: (stationId: string, data: Partial<KitchenStation>) => void
  
  // Settings
  updateAudioSettings: (settings: Partial<AudioSettings>) => void
  toggleAutoAssignment: () => void
  setTimerUpdateInterval: (interval: number) => void
  
  // UI Actions
  selectTimer: (timerId: string | null) => void
  selectStation: (stationId: string | null) => void
  setViewMode: (mode: 'GRID' | 'LIST' | 'TIMELINE') => void
  setFilterStage: (stage: CookingStage | 'ALL') => void
  setSortBy: (sortBy: 'PRIORITY' | 'TIME' | 'STATION') => void
  
  // Utilities
  getTimerProgress: (timerId: string) => number
  getTimerColorCode: (timerId: string) => string
  getStationWorkload: (stationId: string) => number
  getStaffWorkload: (staffId: string) => number
  calculateETA: (orderId: number) => Date | null
  isRushMode: () => boolean
  
  // Reset & Cleanup
  resetKitchenStore: () => void
  clearCompletedTimers: () => void
  cleanupOldData: () => void
}

// 🏪 Kitchen Store Implementation
export const useKitchenStore = create<KitchenState & KitchenActions>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial State
        activeTimers: [],
        cookingQueue: [],
        kitchenStations: [],
        workloadMetrics: {
          totalActiveTimers: 0,
          averageWaitTime: 0,
          completionRate: 0,
          efficiency: 0,
          rushMode: false,
          peakTime: false,
          staffUtilization: 0,
          stationUtilization: {}
        },
        performanceData: {
          avgCookingTime: {},
          completionRate: 0,
          efficiencyScore: 0,
          overdueOrders: 0,
          onTimePercentage: 0,
          staffPerformance: {},
          revenuePerHour: 0,
          customerSatisfaction: 0,
          wastePercentage: 0
        },
        alerts: [],
        
        // Settings
        audioSettings: {
          enabled: true,
          volume: 0.8,
          alerts: {
            warning: true,
            critical: true,
            complete: true,
            overdue: true,
            capacity: true
          },
          soundPack: 'default'
        },
        timerUpdateInterval: 1000, // 1 second
        autoAssignment: true,
        rushModeThreshold: 15, // orders
        
        // UI State
        selectedTimer: null,
        selectedStation: null,
        viewMode: 'GRID',
        filterStage: 'ALL',
        sortBy: 'PRIORITY',
        
        // Real-time State
        isConnected: false,
        lastSync: null,
        updateCount: 0,
        
        // Loading States
        loading: {
          timers: false,
          queue: false,
          stations: false,
          performance: false
        },
        
        // Errors
        errors: {
          timers: null,
          queue: null,
          stations: null,
          performance: null
        },

        // Timer Management Actions
        startTimer: (orderId: number, estimatedDuration: number) => {
          const timerId = `timer_${orderId}_${Date.now()}`
          const now = new Date()
          
          const newTimer: CookingTimer = {
            id: timerId,
            orderId,
            assignmentId: `assign_${timerId}`,
            estimatedDuration,
            actualDuration: 0,
            remainingTime: estimatedDuration,
            elapsed: 0,
            status: 'RUNNING',
            stage: 'PREP',
            startTime: now,
            pausedTime: null,
            completedTime: null,
            lastUpdate: now,
            isOverdue: false,
            overdueTime: 0,
            progress: 0,
            colorCode: '#007AFF', // Blue - normal
            priority: 3
          }

          set(state => ({
            activeTimers: [...state.activeTimers, newTimer],
            updateCount: state.updateCount + 1
          }))

          // Update workload metrics
          get().updateKitchenMetrics()
        },

        pauseTimer: (timerId: string) => {
          set(state => ({
            activeTimers: state.activeTimers.map(timer =>
              timer.id === timerId
                ? {
                    ...timer,
                    status: 'PAUSED' as TimerStatus,
                    pausedTime: new Date(),
                    lastUpdate: new Date()
                  }
                : timer
            ),
            updateCount: state.updateCount + 1
          }))
        },

        resumeTimer: (timerId: string) => {
          set(state => ({
            activeTimers: state.activeTimers.map(timer => {
              if (timer.id === timerId && timer.status === 'PAUSED') {
                const pauseDuration = timer.pausedTime 
                  ? Date.now() - timer.pausedTime.getTime() 
                  : 0
                
                return {
                  ...timer,
                  status: 'RUNNING' as TimerStatus,
                  pausedTime: null,
                  lastUpdate: new Date(),
                  // Adjust remaining time to account for pause
                  remainingTime: Math.max(0, timer.remainingTime)
                }
              }
              return timer
            }),
            updateCount: state.updateCount + 1
          }))
        },

        completeTimer: (timerId: string) => {
          const timer = get().activeTimers.find(t => t.id === timerId)
          if (!timer) return

          const completedTime = new Date()
          const actualDuration = completedTime.getTime() - (timer.startTime?.getTime() || 0)

          set(state => ({
            activeTimers: state.activeTimers.map(t =>
              t.id === timerId
                ? {
                    ...t,
                    status: 'COMPLETED' as TimerStatus,
                    actualDuration: actualDuration / 1000,
                    completedTime,
                    lastUpdate: completedTime,
                    progress: 100,
                    stage: 'READY' as CookingStage
                  }
                : t
            ),
            updateCount: state.updateCount + 1
          }))

          // Record completion time for performance tracking
          get().recordCompletionTime(timer.orderId, actualDuration / 1000)
          
          // Play completion sound
          if (get().audioSettings.enabled && get().audioSettings.alerts.complete) {
            // Audio will be handled by AudioAlert component
          }
        },

        updateTimerStage: (timerId: string, stage: CookingStage) => {
          set(state => ({
            activeTimers: state.activeTimers.map(timer =>
              timer.id === timerId
                ? {
                    ...timer,
                    stage,
                    lastUpdate: new Date()
                  }
                : timer
            ),
            updateCount: state.updateCount + 1
          }))
        },

        resetTimer: (timerId: string) => {
          set(state => ({
            activeTimers: state.activeTimers.map(timer =>
              timer.id === timerId
                ? {
                    ...timer,
                    status: 'IDLE' as TimerStatus,
                    elapsed: 0,
                    remainingTime: timer.estimatedDuration,
                    progress: 0,
                    isOverdue: false,
                    overdueTime: 0,
                    startTime: null,
                    pausedTime: null,
                    completedTime: null,
                    lastUpdate: new Date(),
                    colorCode: '#007AFF',
                    stage: 'PREP' as CookingStage
                  }
                : timer
            ),
            updateCount: state.updateCount + 1
          }))
        },

        deleteTimer: (timerId: string) => {
          set(state => ({
            activeTimers: state.activeTimers.filter(timer => timer.id !== timerId),
            updateCount: state.updateCount + 1
          }))
        },

        // Queue Management
        fetchCookingQueue: async () => {
          set(state => ({ 
            loading: { ...state.loading, queue: true },
            errors: { ...state.errors, queue: null }
          }))

          try {
            // In a real implementation, this would call the API
            const response = await orderService.getKitchenQueue()
            
            set(state => ({
              cookingQueue: response.data || [],
              loading: { ...state.loading, queue: false },
              lastSync: new Date()
            }))
          } catch (error) {
            set(state => ({
              loading: { ...state.loading, queue: false },
              errors: { ...state.errors, queue: 'Failed to fetch cooking queue' }
            }))
          }
        },

        reorderQueue: (orderId: number, newPosition: number) => {
          set(state => {
            const orders = [...state.cookingQueue]
            const orderIndex = orders.findIndex(o => o.id === orderId)
            if (orderIndex === -1) return state

            const [order] = orders.splice(orderIndex, 1)
            orders.splice(newPosition, 0, order)

            return {
              cookingQueue: orders,
              updateCount: state.updateCount + 1
            }
          })
        },

        assignToStation: (orderId: number, stationId: string) => {
          set(state => ({
            cookingQueue: state.cookingQueue.map(order =>
              order.id === orderId
                ? { ...order, assignedStation: stationId }
                : order
            ),
            updateCount: state.updateCount + 1
          }))
        },

        assignToStaff: (orderId: number, staffId: string) => {
          set(state => ({
            cookingQueue: state.cookingQueue.map(order =>
              order.id === orderId
                ? { ...order, assignedStaff: staffId }
                : order
            ),
            updateCount: state.updateCount + 1
          }))
        },

        updateOrderPriority: (orderId: number, priority: number) => {
          set(state => ({
            cookingQueue: state.cookingQueue.map(order =>
              order.id === orderId
                ? { ...order, priority }
                : order
            ),
            updateCount: state.updateCount + 1
          }))
        },

        // Station Management
        updateStationCapacity: (stationId: string, capacity: number) => {
          set(state => ({
            kitchenStations: state.kitchenStations.map(station =>
              station.id === stationId
                ? { ...station, capacity }
                : station
            ),
            updateCount: state.updateCount + 1
          }))

          // Create capacity alert if high
          if (capacity > 90) {
            get().createAlert({
              type: 'CAPACITY_HIGH',
              severity: 'HIGH',
              title: 'Station Capacity Critical',
              message: `Station ${stationId} is at ${capacity}% capacity`,
              stationId,
              acknowledged: false,
              autoResolve: true,
              soundEnabled: true,
              actionRequired: true
            })
          }
        },

        updateStationStatus: (stationId: string, status: StationStatus) => {
          set(state => ({
            kitchenStations: state.kitchenStations.map(station =>
              station.id === stationId
                ? { ...station, status }
                : station
            ),
            updateCount: state.updateCount + 1
          }))
        },

        assignStaffToStation: (staffId: string, stationId: string) => {
          set(state => ({
            kitchenStations: state.kitchenStations.map(station => {
              if (station.id === stationId) {
                const existingAssignment = station.assignedStaff.find(s => s.staffId === staffId)
                if (!existingAssignment) {
                  return {
                    ...station,
                    assignedStaff: [
                      ...station.assignedStaff,
                      {
                        staffId,
                        name: 'Staff Member', // Would be fetched from staff store
                        role: 'Cook',
                        skillLevel: 3,
                        activeTimers: [],
                        workloadScore: 0
                      }
                    ]
                  }
                }
              }
              return station
            }),
            updateCount: state.updateCount + 1
          }))
        },

        removeStaffFromStation: (staffId: string, stationId: string) => {
          set(state => ({
            kitchenStations: state.kitchenStations.map(station =>
              station.id === stationId
                ? {
                    ...station,
                    assignedStaff: station.assignedStaff.filter(s => s.staffId !== staffId)
                  }
                : station
            ),
            updateCount: state.updateCount + 1
          }))
        },

        // Performance Tracking
        recordCompletionTime: (orderId: number, actualDuration: number) => {
          // This would update performance metrics
          set(state => ({
            performanceData: {
              ...state.performanceData,
              // Update completion metrics
            },
            updateCount: state.updateCount + 1
          }))
        },

        updateKitchenMetrics: () => {
          const state = get()
          const activeCount = state.activeTimers.filter(t => t.status === 'RUNNING').length
          const overdueCount = state.activeTimers.filter(t => t.isOverdue).length
          const totalOrders = state.cookingQueue.length

          set({
            workloadMetrics: {
              ...state.workloadMetrics,
              totalActiveTimers: activeCount,
              rushMode: totalOrders > state.rushModeThreshold
            },
            performanceData: {
              ...state.performanceData,
              overdueOrders: overdueCount
            },
            updateCount: state.updateCount + 1
          })
        },

        generatePerformanceReport: async (period: string) => {
          // This would call an API to generate a detailed report
          const report: KitchenPerformance = {
            avgCookingTime: {},
            completionRate: 12, // orders per hour
            efficiencyScore: 85,
            overdueOrders: get().activeTimers.filter(t => t.isOverdue).length,
            onTimePercentage: 92,
            staffPerformance: {},
            revenuePerHour: 1200,
            customerSatisfaction: 4.2,
            wastePercentage: 3.5
          }

          set(state => ({
            performanceData: report,
            updateCount: state.updateCount + 1
          }))

          return report
        },

        // Alert Management
        createAlert: (alertData: Omit<KitchenAlert, 'id' | 'timestamp'>) => {
          const alert: KitchenAlert = {
            ...alertData,
            id: `alert_${Date.now()}`,
            timestamp: new Date()
          }

          set(state => ({
            alerts: [...state.alerts, alert],
            updateCount: state.updateCount + 1
          }))
        },

        acknowledgeAlert: (alertId: string) => {
          set(state => ({
            alerts: state.alerts.map(alert =>
              alert.id === alertId
                ? { ...alert, acknowledged: true }
                : alert
            ),
            updateCount: state.updateCount + 1
          }))
        },

        dismissAlert: (alertId: string) => {
          set(state => ({
            alerts: state.alerts.filter(alert => alert.id !== alertId),
            updateCount: state.updateCount + 1
          }))
        },

        clearAllAlerts: () => {
          set(state => ({
            alerts: [],
            updateCount: state.updateCount + 1
          }))
        },

        // Real-time Updates
        onTimerUpdate: (timerId: string, elapsed: number) => {
          set(state => ({
            activeTimers: state.activeTimers.map(timer => {
              if (timer.id === timerId && timer.status === 'RUNNING') {
                const remaining = Math.max(0, timer.estimatedDuration - elapsed)
                const progress = (elapsed / timer.estimatedDuration) * 100
                const isOverdue = elapsed > timer.estimatedDuration
                const overdueTime = Math.max(0, elapsed - timer.estimatedDuration)
                
                // Determine color code based on progress
                let colorCode = '#007AFF' // Blue - normal
                if (progress >= 80) colorCode = '#FF3B30' // Red - critical
                else if (progress >= 50) colorCode = '#FF9500' // Orange - warning
                
                // Create alerts based on progress
                if (progress >= 80 && !timer.isOverdue && state.audioSettings.enabled) {
                  get().createAlert({
                    type: 'TIMER_CRITICAL',
                    severity: 'HIGH',
                    title: 'Timer Critical',
                    message: `Order ${timer.orderId} is 80% complete`,
                    timerId,
                    acknowledged: false,
                    autoResolve: true,
                    soundEnabled: state.audioSettings.alerts.critical
                  })
                }
                
                if (isOverdue && !timer.isOverdue) {
                  get().createAlert({
                    type: 'TIMER_OVERDUE',
                    severity: 'CRITICAL',
                    title: 'Timer Overdue',
                    message: `Order ${timer.orderId} is overdue!`,
                    timerId,
                    acknowledged: false,
                    autoResolve: false,
                    soundEnabled: state.audioSettings.alerts.overdue,
                    actionRequired: true
                  })
                }

                return {
                  ...timer,
                  elapsed,
                  remainingTime: remaining,
                  progress: Math.min(100, progress),
                  isOverdue,
                  overdueTime,
                  colorCode,
                  lastUpdate: new Date()
                }
              }
              return timer
            }),
            updateCount: state.updateCount + 1
          }))
        },

        onNewOrder: (order: CookingOrder) => {
          set(state => ({
            cookingQueue: [order, ...state.cookingQueue],
            updateCount: state.updateCount + 1
          }))

          // Auto-assignment logic
          if (get().autoAssignment) {
            // Find best station based on order items
            const bestStation = get().kitchenStations
              .filter(s => s.status === 'AVAILABLE' && s.capacity < 80)
              .sort((a, b) => a.capacity - b.capacity)[0]

            if (bestStation) {
              get().assignToStation(order.id, bestStation.id)
            }
          }
        },

        onOrderComplete: (orderId: number) => {
          set(state => ({
            cookingQueue: state.cookingQueue.filter(order => order.id !== orderId),
            activeTimers: state.activeTimers.filter(timer => timer.orderId !== orderId),
            updateCount: state.updateCount + 1
          }))
        },

        onStationUpdate: (stationId: string, data: Partial<KitchenStation>) => {
          set(state => ({
            kitchenStations: state.kitchenStations.map(station =>
              station.id === stationId
                ? { ...station, ...data }
                : station
            ),
            updateCount: state.updateCount + 1
          }))
        },

        // Settings
        updateAudioSettings: (settings: Partial<AudioSettings>) => {
          set(state => ({
            audioSettings: { ...state.audioSettings, ...settings },
            updateCount: state.updateCount + 1
          }))
        },

        toggleAutoAssignment: () => {
          set(state => ({
            autoAssignment: !state.autoAssignment,
            updateCount: state.updateCount + 1
          }))
        },

        setTimerUpdateInterval: (interval: number) => {
          set(state => ({
            timerUpdateInterval: Math.max(100, interval), // Minimum 100ms
            updateCount: state.updateCount + 1
          }))
        },

        // UI Actions
        selectTimer: (timerId: string | null) => {
          set({ selectedTimer: timerId })
        },

        selectStation: (stationId: string | null) => {
          set({ selectedStation: stationId })
        },

        setViewMode: (mode: 'GRID' | 'LIST' | 'TIMELINE') => {
          set({ viewMode: mode })
        },

        setFilterStage: (stage: CookingStage | 'ALL') => {
          set({ filterStage: stage })
        },

        setSortBy: (sortBy: 'PRIORITY' | 'TIME' | 'STATION') => {
          set({ sortBy })
        },

        // Utilities
        getTimerProgress: (timerId: string) => {
          const timer = get().activeTimers.find(t => t.id === timerId)
          return timer ? timer.progress : 0
        },

        getTimerColorCode: (timerId: string) => {
          const timer = get().activeTimers.find(t => t.id === timerId)
          return timer ? timer.colorCode : '#007AFF'
        },

        getStationWorkload: (stationId: string) => {
          const station = get().kitchenStations.find(s => s.id === stationId)
          return station ? station.capacity : 0
        },

        getStaffWorkload: (staffId: string) => {
          const stations = get().kitchenStations
          for (const station of stations) {
            const staff = station.assignedStaff.find(s => s.staffId === staffId)
            if (staff) return staff.workloadScore
          }
          return 0
        },

        calculateETA: (orderId: number) => {
          const order = get().cookingQueue.find(o => o.id === orderId)
          if (!order) return null

          const now = new Date()
          const eta = new Date(now.getTime() + (order.estimatedTime * 1000))
          return eta
        },

        isRushMode: () => {
          const state = get()
          return state.workloadMetrics.rushMode
        },

        // Reset & Cleanup
        resetKitchenStore: () => {
          set({
            activeTimers: [],
            cookingQueue: [],
            alerts: [],
            selectedTimer: null,
            selectedStation: null,
            updateCount: 0
          })
        },

        clearCompletedTimers: () => {
          set(state => ({
            activeTimers: state.activeTimers.filter(timer => 
              timer.status !== 'COMPLETED' && 
              (timer.completedTime ? Date.now() - timer.completedTime.getTime() < 300000 : true) // Keep for 5 minutes
            ),
            updateCount: state.updateCount + 1
          }))
        },

        cleanupOldData: () => {
          const now = Date.now()
          const oneHourAgo = now - 3600000 // 1 hour

          set(state => ({
            alerts: state.alerts.filter(alert => 
              !alert.autoResolve || alert.timestamp.getTime() > oneHourAgo
            ),
            activeTimers: state.activeTimers.filter(timer =>
              timer.status !== 'COMPLETED' ||
              (timer.completedTime && timer.completedTime.getTime() > oneHourAgo)
            ),
            updateCount: state.updateCount + 1
          }))
        }
      }),
      {
        name: 'kitchen-storage',
        partialize: (state) => ({
          audioSettings: state.audioSettings,
          timerUpdateInterval: state.timerUpdateInterval,
          autoAssignment: state.autoAssignment,
          rushModeThreshold: state.rushModeThreshold,
          viewMode: state.viewMode,
          filterStage: state.filterStage,
          sortBy: state.sortBy
        })
      }
    )
  )
)

// 🎯 Selector Hooks for Better Performance
export const useActiveTimers = () => useKitchenStore(state => state.activeTimers)
export const useCookingQueue = () => useKitchenStore(state => state.cookingQueue)
export const useKitchenStations = () => useKitchenStore(state => state.kitchenStations)
export const useKitchenAlerts = () => useKitchenStore(state => state.alerts)
export const useKitchenWorkload = () => useKitchenStore(state => state.workloadMetrics)
export const useKitchenPerformance = () => useKitchenStore(state => state.performanceData)
export const useAudioSettings = () => useKitchenStore(state => state.audioSettings)
export const useSelectedTimer = () => useKitchenStore(state => state.selectedTimer)
export const useSelectedStation = () => useKitchenStore(state => state.selectedStation)
export const useKitchenViewMode = () => useKitchenStore(state => state.viewMode)
export const useKitchenActions = () => useKitchenStore(state => ({
  startTimer: state.startTimer,
  pauseTimer: state.pauseTimer,
  resumeTimer: state.resumeTimer,
  completeTimer: state.completeTimer,
  updateTimerStage: state.updateTimerStage,
  assignToStation: state.assignToStation,
  reorderQueue: state.reorderQueue,
  createAlert: state.createAlert,
  acknowledgeAlert: state.acknowledgeAlert,
  updateAudioSettings: state.updateAudioSettings,
  setViewMode: state.setViewMode,
  selectTimer: state.selectTimer,
  selectStation: state.selectStation
}))

/**
 * 🔄 Timer Update Hook
 * Custom hook for managing timer updates with proper cleanup
 */
export const useTimerUpdates = () => {
  const { activeTimers, timerUpdateInterval, onTimerUpdate } = useKitchenStore()
  
  React.useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    
    if (activeTimers.some(timer => timer.status === 'RUNNING')) {
      intervalId = setInterval(() => {
        const now = Date.now()
        
        activeTimers.forEach(timer => {
          if (timer.status === 'RUNNING' && timer.startTime) {
            const elapsed = Math.floor((now - timer.startTime.getTime()) / 1000)
            onTimerUpdate(timer.id, elapsed)
          }
        })
      }, timerUpdateInterval)
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [activeTimers, timerUpdateInterval, onTimerUpdate])
}