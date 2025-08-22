/**
 * 📊 Statistics Management Store
 * Zustand store for managing staff performance and kitchen statistics
 */

import { create } from 'zustand'
import type { 
  StaffPerformance, 
  OrderAnalytics, 
  ChartDataPoint,
  HourlyOrderData
} from '@/types'

interface StatsStore {
  // 📊 Core State
  staffPerformance: StaffPerformance[]
  kitchenAnalytics: OrderAnalytics | null
  revenueData: ChartDataPoint[]
  efficiencyData: ChartDataPoint[]
  hourlyData: HourlyOrderData[]
  
  // 📅 Time Period
  currentPeriod: {
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY'
    startDate: Date
    endDate: Date
  }
  
  // 📱 UI State
  selectedStaffId: string | null
  chartType: 'line' | 'bar' | 'pie'
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  
  // 🔄 Data Actions
  fetchStaffPerformance: (staffId?: string, period?: 'DAILY' | 'WEEKLY' | 'MONTHLY') => Promise<void>
  fetchKitchenAnalytics: (startDate: Date, endDate: Date) => Promise<void>
  fetchRevenueData: (period: 'DAILY' | 'WEEKLY' | 'MONTHLY') => Promise<void>
  fetchEfficiencyData: (staffIds?: string[]) => Promise<void>
  refreshAllData: () => Promise<void>
  
  // 📅 Period Management
  setPeriod: (type: 'DAILY' | 'WEEKLY' | 'MONTHLY', date?: Date) => void
  nextPeriod: () => void
  previousPeriod: () => void
  
  // 📱 UI Actions
  setSelectedStaff: (staffId: string | null) => void
  setChartType: (type: 'line' | 'bar' | 'pie') => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // 📊 Computed Properties
  getTopPerformers: (count?: number) => StaffPerformance[]
  getAverageEfficiency: () => number
  getTotalRevenue: () => number
  getCompletionRate: () => number
  getEfficiencyTrend: () => 'up' | 'down' | 'stable'
  
  // 📈 Chart Data Generators
  generateEfficiencyChart: () => ChartDataPoint[]
  generateRevenueChart: () => ChartDataPoint[]
  generateOrderVolumeChart: () => ChartDataPoint[]
  generateComparisonChart: (metric: 'efficiency' | 'revenue' | 'orders') => ChartDataPoint[]
}

// 🏪 Stats Store Implementation
export const useStatsStore = create<StatsStore>((set, get) => ({
  // 📊 Initial State
  staffPerformance: [],
  kitchenAnalytics: null,
  revenueData: [],
  efficiencyData: [],
  hourlyData: [],
  
  // 📅 Default Period (Today)
  currentPeriod: {
    type: 'DAILY',
    startDate: new Date(new Date().setHours(0, 0, 0, 0)),
    endDate: new Date(new Date().setHours(23, 59, 59, 999))
  },
  
  // 📱 UI State
  selectedStaffId: null,
  chartType: 'line',
  loading: false,
  error: null,
  lastUpdated: null,

  // 🔄 Data Actions
  fetchStaffPerformance: async (staffId?: string, period: 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'DAILY'): Promise<void> => {
    try {
      set({ loading: true, error: null })
      
      const { currentPeriod } = get()
      const params = new URLSearchParams({
        period: period || currentPeriod.type,
        date: currentPeriod.startDate.toISOString().split('T')[0]
      })
      
      if (staffId) {
        params.append('staffId', staffId)
      }
      
      const response = await fetch(`/api/staff/stats/performance?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        set({
          staffPerformance: Array.isArray(data.data) ? data.data : [data.data],
          loading: false,
          lastUpdated: new Date()
        })
      } else {
        throw new Error(data.message || 'Failed to fetch staff performance')
      }
    } catch (error) {
      console.error('Fetch staff performance error:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch staff performance',
        loading: false 
      })
    }
  },

  fetchKitchenAnalytics: async (startDate: Date, endDate: Date): Promise<void> => {
    try {
      set({ loading: true, error: null })
      
      const response = await fetch('/api/staff/kitchen/analytics', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        set({
          kitchenAnalytics: data.data,
          loading: false,
          lastUpdated: new Date()
        })
      } else {
        throw new Error(data.message || 'Failed to fetch kitchen analytics')
      }
    } catch (error) {
      console.error('Fetch kitchen analytics error:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch kitchen analytics',
        loading: false 
      })
    }
  },

  fetchRevenueData: async (period: 'DAILY' | 'WEEKLY' | 'MONTHLY'): Promise<void> => {
    try {
      const { currentPeriod } = get()
      
      const response = await fetch(`/api/staff/stats/revenue?period=${period}&date=${currentPeriod.startDate.toISOString().split('T')[0]}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Transform API data to chart format
        const revenueData: ChartDataPoint[] = data.data.map((item: any) => ({
          label: item.label,
          value: item.revenue,
          color: getRevenueColor(item.revenue),
          metadata: item
        }))
        
        set({ revenueData })
      } else {
        throw new Error(data.message || 'Failed to fetch revenue data')
      }
    } catch (error) {
      console.error('Fetch revenue data error:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to fetch revenue data' })
    }
  },

  fetchEfficiencyData: async (staffIds?: string[]): Promise<void> => {
    try {
      const params = new URLSearchParams()
      if (staffIds && staffIds.length > 0) {
        params.append('staffIds', staffIds.join(','))
      }
      
      const response = await fetch(`/api/staff/stats/efficiency?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Transform API data to chart format
        const efficiencyData: ChartDataPoint[] = data.data.map((item: any) => ({
          label: item.staffName,
          value: item.efficiencyScore,
          color: getEfficiencyColor(item.efficiencyScore),
          metadata: item
        }))
        
        set({ efficiencyData })
      } else {
        throw new Error(data.message || 'Failed to fetch efficiency data')
      }
    } catch (error) {
      console.error('Fetch efficiency data error:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to fetch efficiency data' })
    }
  },

  refreshAllData: async (): Promise<void> => {
    const { fetchStaffPerformance, fetchKitchenAnalytics, fetchRevenueData, fetchEfficiencyData, currentPeriod } = get()
    
    try {
      await Promise.all([
        fetchStaffPerformance(),
        fetchKitchenAnalytics(currentPeriod.startDate, currentPeriod.endDate),
        fetchRevenueData(currentPeriod.type),
        fetchEfficiencyData()
      ])
    } catch (error) {
      console.error('Refresh all data error:', error)
    }
  },

  // 📅 Period Management
  setPeriod: (type: 'DAILY' | 'WEEKLY' | 'MONTHLY', date: Date = new Date()): void => {
    let startDate: Date, endDate: Date
    
    switch (type) {
      case 'DAILY':
        startDate = new Date(date.setHours(0, 0, 0, 0))
        endDate = new Date(date.setHours(23, 59, 59, 999))
        break
      case 'WEEKLY':
        const firstDay = date.getDate() - date.getDay()
        startDate = new Date(date.setDate(firstDay))
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)
        endDate.setHours(23, 59, 59, 999)
        break
      case 'MONTHLY':
        startDate = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
        break
    }
    
    set({
      currentPeriod: { type, startDate, endDate }
    })
    
    // Refresh data for new period
    get().refreshAllData()
  },

  nextPeriod: (): void => {
    const { currentPeriod, setPeriod } = get()
    const nextDate = new Date(currentPeriod.startDate)
    
    switch (currentPeriod.type) {
      case 'DAILY':
        nextDate.setDate(nextDate.getDate() + 1)
        break
      case 'WEEKLY':
        nextDate.setDate(nextDate.getDate() + 7)
        break
      case 'MONTHLY':
        nextDate.setMonth(nextDate.getMonth() + 1)
        break
    }
    
    setPeriod(currentPeriod.type, nextDate)
  },

  previousPeriod: (): void => {
    const { currentPeriod, setPeriod } = get()
    const prevDate = new Date(currentPeriod.startDate)
    
    switch (currentPeriod.type) {
      case 'DAILY':
        prevDate.setDate(prevDate.getDate() - 1)
        break
      case 'WEEKLY':
        prevDate.setDate(prevDate.getDate() - 7)
        break
      case 'MONTHLY':
        prevDate.setMonth(prevDate.getMonth() - 1)
        break
    }
    
    setPeriod(currentPeriod.type, prevDate)
  },

  // 📱 UI Actions
  setSelectedStaff: (staffId: string | null): void => {
    set({ selectedStaffId: staffId })
  },

  setChartType: (type: 'line' | 'bar' | 'pie'): void => {
    set({ chartType: type })
  },

  setLoading: (loading: boolean): void => {
    set({ loading })
  },

  setError: (error: string | null): void => {
    set({ error })
  },

  // 📊 Computed Properties
  getTopPerformers: (count: number = 5): StaffPerformance[] => {
    return get().staffPerformance
      .sort((a, b) => b.efficiency.score - a.efficiency.score)
      .slice(0, count)
  },

  getAverageEfficiency: (): number => {
    const { staffPerformance } = get()
    if (staffPerformance.length === 0) return 0
    
    const totalEfficiency = staffPerformance.reduce((sum, staff) => sum + staff.efficiency.score, 0)
    return Math.round((totalEfficiency / staffPerformance.length) * 10) / 10
  },

  getTotalRevenue: (): number => {
    const { revenueData } = get()
    return revenueData.reduce((sum, item) => sum + item.value, 0)
  },

  getCompletionRate: (): number => {
    const { kitchenAnalytics } = get()
    return kitchenAnalytics?.completionRate || 0
  },

  getEfficiencyTrend: (): 'up' | 'down' | 'stable' => {
    const { efficiencyData } = get()
    if (efficiencyData.length < 2) return 'stable'
    
    const current = efficiencyData[efficiencyData.length - 1].value
    const previous = efficiencyData[efficiencyData.length - 2].value
    
    if (current > previous) return 'up'
    if (current < previous) return 'down'
    return 'stable'
  },

  // 📈 Chart Data Generators
  generateEfficiencyChart: (): ChartDataPoint[] => {
    return get().efficiencyData
  },

  generateRevenueChart: (): ChartDataPoint[] => {
    return get().revenueData
  },

  generateOrderVolumeChart: (): ChartDataPoint[] => {
    const { hourlyData } = get()
    return hourlyData.map(item => ({
      label: `${item.hour}:00`,
      value: item.orderCount,
      color: getOrderVolumeColor(item.orderCount),
      metadata: item
    }))
  },

  generateComparisonChart: (metric: 'efficiency' | 'revenue' | 'orders'): ChartDataPoint[] => {
    const { staffPerformance } = get()
    
    return staffPerformance.map(staff => {
      let value: number
      let color: string
      
      switch (metric) {
        case 'efficiency':
          value = staff.efficiency.score
          color = getEfficiencyColor(value)
          break
        case 'revenue':
          value = staff.orderStats.totalProcessed * 100 // Rough revenue estimate
          color = getRevenueColor(value)
          break
        case 'orders':
          value = staff.orderStats.totalProcessed
          color = getOrderVolumeColor(value)
          break
        default:
          value = 0
          color = '#6B7280'
      }
      
      return {
        label: staff.staffName,
        value,
        color,
        metadata: staff
      }
    })
  }
}))

// 🎨 Color Utilities
const getEfficiencyColor = (score: number): string => {
  if (score >= 90) return '#10B981' // Green
  if (score >= 80) return '#F59E0B' // Yellow
  if (score >= 70) return '#EF4444' // Red
  return '#6B7280' // Gray
}

const getRevenueColor = (revenue: number): string => {
  if (revenue >= 10000) return '#8B5CF6' // Purple
  if (revenue >= 5000) return '#3B82F6' // Blue
  if (revenue >= 1000) return '#10B981' // Green
  return '#6B7280' // Gray
}

const getOrderVolumeColor = (count: number): string => {
  if (count >= 50) return '#EF4444' // Red
  if (count >= 30) return '#F59E0B' // Yellow
  if (count >= 15) return '#10B981' // Green
  return '#6B7280' // Gray
}

// 🔗 Stats Hooks & Selectors
export const useStaffStats = () => useStatsStore(state => state.staffPerformance)
export const useKitchenStats = () => useStatsStore(state => state.kitchenAnalytics)
export const useRevenueStats = () => useStatsStore(state => state.revenueData)
export const useEfficiencyStats = () => useStatsStore(state => state.efficiencyData)
export const useCurrentPeriod = () => useStatsStore(state => state.currentPeriod)

// 🎯 Stats Actions Hook
export const useStatsActions = () => {
  const store = useStatsStore()
  return {
    fetchStaffPerformance: store.fetchStaffPerformance,
    fetchKitchenAnalytics: store.fetchKitchenAnalytics,
    fetchRevenueData: store.fetchRevenueData,
    refreshAllData: store.refreshAllData,
    setPeriod: store.setPeriod,
    nextPeriod: store.nextPeriod,
    previousPeriod: store.previousPeriod,
    setSelectedStaff: store.setSelectedStaff,
    setChartType: store.setChartType
  }
}