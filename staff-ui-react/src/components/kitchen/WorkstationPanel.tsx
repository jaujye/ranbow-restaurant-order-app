/**
 * 🏭 Workstation Panel Component
 * Advanced station management with capacity monitoring and staff assignment
 */

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame,
  ChefHat,
  Users,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Thermometer,
  Zap,
  User,
  Plus,
  Minus,
  MoreVertical,
  Activity,
  TrendingUp,
  Wrench,
  Eye,
  EyeOff
} from 'lucide-react'
import { cn } from '../../utils'
import { 
  useKitchenStore, 
  KitchenStation, 
  StationStatus,
  StaffAssignment,
  Equipment,
  useKitchenStations,
  useKitchenActions
} from '../../store/kitchenStore'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface WorkstationPanelProps {
  stationId?: string
  compact?: boolean
  showDetails?: boolean
  onStationSelect?: (stationId: string) => void
  className?: string
}

const STATION_ICONS = {
  GRILL: Flame,
  WOK: Flame,
  PREP: ChefHat,
  FRYER: Zap,
  OVEN: Thermometer,
  COLD: Thermometer,
  PLATING: Users
} as const

const STATION_COLORS = {
  GRILL: {
    bg: 'bg-red-500',
    text: 'text-red-600',
    light: 'bg-red-50',
    border: 'border-red-200'
  },
  WOK: {
    bg: 'bg-orange-500',
    text: 'text-orange-600',
    light: 'bg-orange-50',
    border: 'border-orange-200'
  },
  PREP: {
    bg: 'bg-blue-500',
    text: 'text-blue-600',
    light: 'bg-blue-50',
    border: 'border-blue-200'
  },
  FRYER: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-600',
    light: 'bg-yellow-50',
    border: 'border-yellow-200'
  },
  OVEN: {
    bg: 'bg-purple-500',
    text: 'text-purple-600',
    light: 'bg-purple-50',
    border: 'border-purple-200'
  },
  COLD: {
    bg: 'bg-cyan-500',
    text: 'text-cyan-600',
    light: 'bg-cyan-50',
    border: 'border-cyan-200'
  },
  PLATING: {
    bg: 'bg-green-500',
    text: 'text-green-600',
    light: 'bg-green-50',
    border: 'border-green-200'
  }
} as const

export const WorkstationPanel: React.FC<WorkstationPanelProps> = ({
  stationId,
  compact = false,
  showDetails = true,
  onStationSelect,
  className
}) => {
  const kitchenStations = useKitchenStations()
  const { updateStationCapacity, updateStationStatus, assignStaffToStation } = useKitchenActions()
  
  const [selectedStation, setSelectedStation] = useState<string | null>(stationId || null)
  const [showStaffPanel, setShowStaffPanel] = useState(false)

  // If no specific station, show all stations
  if (!stationId) {
    return (
      <div className={cn('grid gap-4', className)}>
        {compact ? (
          // Compact grid layout
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {kitchenStations.map(station => (
              <CompactStationCard
                key={station.id}
                station={station}
                onSelect={() => onStationSelect?.(station.id)}
              />
            ))}
          </div>
        ) : (
          // Full detailed view
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {kitchenStations.map(station => (
              <StationCard
                key={station.id}
                station={station}
                showDetails={showDetails}
                onSelect={() => onStationSelect?.(station.id)}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Single station detailed view
  const station = kitchenStations.find(s => s.id === stationId)
  if (!station) {
    return (
      <Card className={cn('p-6 text-center', className)}>
        <div className="text-gray-500">
          <Settings className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Station not found</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('', className)}>
      <StationDetailView
        station={station}
        showStaffPanel={showStaffPanel}
        onToggleStaffPanel={() => setShowStaffPanel(!showStaffPanel)}
      />
    </Card>
  )
}

/**
 * 📊 Compact Station Card
 * Minimal station overview for grid layouts
 */
const CompactStationCard: React.FC<{
  station: KitchenStation
  onSelect: () => void
}> = ({ station, onSelect }) => {
  const Icon = STATION_ICONS[station.type] || Settings
  const colors = STATION_COLORS[station.type]
  
  const getStatusColor = () => {
    switch (station.status) {
      case 'AVAILABLE': return 'text-green-500'
      case 'BUSY': return 'text-yellow-500'
      case 'MAINTENANCE': return 'text-red-500'
      case 'OFFLINE': return 'text-gray-500'
      default: return 'text-gray-500'
    }
  }

  const getCapacityColor = () => {
    if (station.capacity >= 90) return 'bg-red-500'
    if (station.capacity >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <motion.div
      className={cn(
        'p-3 rounded-lg border cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:scale-105',
        colors.light,
        colors.border
      )}
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className={cn('p-2 rounded', colors.bg, 'text-white')}>
          <Icon className="w-4 h-4" />
        </div>
        <div className={cn('w-2 h-2 rounded-full', getStatusColor().replace('text-', 'bg-'))} />
      </div>

      {/* Station Name */}
      <h3 className="font-medium text-gray-800 text-sm mb-2">{station.name}</h3>

      {/* Capacity Bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-500">Capacity</span>
          <span className="font-medium">{station.capacity}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <motion.div
            className={cn('h-1.5 rounded-full', getCapacityColor())}
            initial={{ width: 0 }}
            animate={{ width: `${station.capacity}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{station.assignedStaff.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <Activity className="w-3 h-3" />
          <span>{station.activeOrders.length}</span>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * 🏪 Station Card
 * Detailed station overview with controls
 */
const StationCard: React.FC<{
  station: KitchenStation
  showDetails: boolean
  onSelect: () => void
}> = ({ station, showDetails, onSelect }) => {
  const Icon = STATION_ICONS[station.type] || Settings
  const colors = STATION_COLORS[station.type]
  const { updateStationCapacity, updateStationStatus } = useKitchenActions()

  const getStatusInfo = () => {
    switch (station.status) {
      case 'AVAILABLE':
        return { color: 'text-green-600', bg: 'bg-green-100', label: 'Available' }
      case 'BUSY':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Busy' }
      case 'MAINTENANCE':
        return { color: 'text-red-600', bg: 'bg-red-100', label: 'Maintenance' }
      case 'OFFLINE':
        return { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Offline' }
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Unknown' }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={onSelect}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-3 rounded-lg', colors.bg, 'text-white')}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{station.name}</h3>
            <p className="text-sm text-gray-500">{station.type}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            statusInfo.bg,
            statusInfo.color
          )}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Capacity Gauge */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Capacity</span>
          <span className="text-sm font-bold text-gray-800">{station.capacity}%</span>
        </div>
        
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className={cn(
                'h-3 rounded-full transition-colors',
                station.capacity >= 90 ? 'bg-red-500' :
                station.capacity >= 70 ? 'bg-yellow-500' : 'bg-green-500'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${station.capacity}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          {station.capacity >= 90 && (
            <AlertTriangle className="absolute -top-1 -right-1 w-5 h-5 text-red-500" />
          )}
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{station.activeOrders.length}</div>
          <div className="text-xs text-gray-500">Active</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{station.assignedStaff.length}</div>
          <div className="text-xs text-gray-500">Staff</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">{station.efficiency}%</div>
          <div className="text-xs text-gray-500">Efficiency</div>
        </div>
      </div>

      {/* Staff List */}
      {showDetails && station.assignedStaff.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Staff</h4>
          <div className="space-y-1">
            {station.assignedStaff.slice(0, 3).map(staff => (
              <StaffItem key={staff.staffId} staff={staff} compact />
            ))}
            {station.assignedStaff.length > 3 && (
              <div className="text-xs text-gray-500 pl-2">
                +{station.assignedStaff.length - 3} more staff
              </div>
            )}
          </div>
        </div>
      )}

      {/* Equipment Status */}
      {showDetails && station.equipment.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Equipment</h4>
          <div className="flex flex-wrap gap-1">
            {station.equipment.map(equipment => (
              <EquipmentBadge key={equipment.id} equipment={equipment} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center gap-2 pt-2 border-t">
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            // Handle status change
          }}
          className="flex-1"
        >
          <Settings className="w-3 h-3 mr-1" />
          Settings
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            // Handle maintenance
          }}
        >
          <Wrench className="w-3 h-3" />
        </Button>
      </div>
    </Card>
  )
}

/**
 * 🔍 Station Detail View
 * Comprehensive station management interface
 */
const StationDetailView: React.FC<{
  station: KitchenStation
  showStaffPanel: boolean
  onToggleStaffPanel: () => void
}> = ({ station, showStaffPanel, onToggleStaffPanel }) => {
  const Icon = STATION_ICONS[station.type] || Settings
  const colors = STATION_COLORS[station.type]
  const { updateStationCapacity, updateStationStatus, assignStaffToStation } = useKitchenActions()

  const [showSettings, setShowSettings] = useState(false)

  const handleCapacityChange = useCallback((newCapacity: number) => {
    updateStationCapacity(station.id, Math.max(0, Math.min(100, newCapacity)))
  }, [station.id, updateStationCapacity])

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={cn('p-4 rounded-xl', colors.bg, 'text-white')}>
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{station.name}</h2>
            <p className="text-gray-600">{station.type} Station</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            onClick={onToggleStaffPanel}
          >
            <Users className="w-4 h-4" />
            Staff ({station.assignedStaff.length})
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">{station.capacity}%</div>
          <div className="text-sm text-gray-600">Capacity</div>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCapacityChange(station.capacity - 10)}
              disabled={station.capacity <= 0}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCapacityChange(station.capacity + 10)}
              disabled={station.capacity >= 100}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-3xl font-bold text-green-600">{station.activeOrders.length}</div>
          <div className="text-sm text-gray-600">Active Orders</div>
          <div className="text-xs text-gray-500 mt-1">
            Max: {station.maxConcurrent}
          </div>
        </div>

        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-3xl font-bold text-orange-600">{station.efficiency}%</div>
          <div className="text-sm text-gray-600">Efficiency</div>
          <div className="flex items-center justify-center mt-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
        </div>

        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-3xl font-bold text-purple-600">
            {Math.floor(station.averageTime / 60)}m
          </div>
          <div className="text-sm text-gray-600">Avg Time</div>
          <div className="text-xs text-gray-500 mt-1">per order</div>
        </div>
      </div>

      {/* Capacity Visualization */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Real-time Capacity</h3>
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-6">
            <motion.div
              className={cn(
                'h-6 rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium',
                station.capacity >= 90 ? 'bg-red-500' :
                station.capacity >= 70 ? 'bg-yellow-500' : 'bg-green-500'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${station.capacity}%` }}
              transition={{ duration: 1 }}
            >
              {station.capacity >= 20 && `${station.capacity}%`}
            </motion.div>
          </div>
          {station.capacity >= 90 && (
            <div className="absolute -top-8 right-0 flex items-center gap-1 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>High Capacity Alert</span>
            </div>
          )}
        </div>
      </div>

      {/* Staff Panel */}
      <AnimatePresence>
        {showStaffPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <StaffPanel station={station} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Equipment Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Equipment Status</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {station.equipment.map(equipment => (
            <EquipmentCard key={equipment.id} equipment={equipment} />
          ))}
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t pt-6"
          >
            <StationSettings station={station} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * 👥 Staff Panel
 * Staff assignment and management
 */
const StaffPanel: React.FC<{ station: KitchenStation }> = ({ station }) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-800">Assigned Staff</h4>
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" />
          Add Staff
        </Button>
      </div>

      {station.assignedStaff.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No staff assigned</p>
        </div>
      ) : (
        <div className="space-y-3">
          {station.assignedStaff.map(staff => (
            <StaffItem key={staff.staffId} staff={staff} />
          ))}
        </div>
      )}
    </Card>
  )
}

/**
 * 👤 Staff Item
 * Individual staff member display
 */
const StaffItem: React.FC<{ 
  staff: StaffAssignment
  compact?: boolean 
}> = ({ staff, compact = false }) => {
  const getSkillColor = (level: number) => {
    if (level >= 4) return 'text-green-600'
    if (level >= 3) return 'text-yellow-600'
    return 'text-gray-600'
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="w-3 h-3 text-gray-500" />
        </div>
        <span className="flex-1">{staff.name}</span>
        <span className={cn('text-xs', getSkillColor(staff.skillLevel))}>
          L{staff.skillLevel}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
        <User className="w-5 h-5 text-gray-500" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-800">{staff.name}</span>
          <span className="text-xs text-gray-500">{staff.role}</span>
        </div>
        <div className="flex items-center gap-4 mt-1">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Skill:</span>
            <span className={cn('text-xs font-medium', getSkillColor(staff.skillLevel))}>
              Level {staff.skillLevel}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Workload:</span>
            <span className="text-xs font-medium">{staff.workloadScore}%</span>
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-sm font-medium">{staff.activeTimers.length}</div>
        <div className="text-xs text-gray-500">active</div>
      </div>
    </div>
  )
}

/**
 * 🔧 Equipment Badge
 * Small equipment status indicator
 */
const EquipmentBadge: React.FC<{ equipment: Equipment }> = ({ equipment }) => {
  const getStatusColor = () => {
    switch (equipment.status) {
      case 'OPERATIONAL': return 'bg-green-100 text-green-800'
      case 'WARNING': return 'bg-yellow-100 text-yellow-800'
      case 'ERROR': return 'bg-red-100 text-red-800'
      case 'MAINTENANCE': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <span className={cn(
      'px-2 py-1 rounded text-xs font-medium',
      getStatusColor()
    )}>
      {equipment.name}
    </span>
  )
}

/**
 * 🔧 Equipment Card
 * Detailed equipment status
 */
const EquipmentCard: React.FC<{ equipment: Equipment }> = ({ equipment }) => {
  const getStatusInfo = () => {
    switch (equipment.status) {
      case 'OPERATIONAL':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' }
      case 'WARNING':
        return { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100' }
      case 'ERROR':
        return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' }
      case 'MAINTENANCE':
        return { icon: Wrench, color: 'text-gray-600', bg: 'bg-gray-100' }
      default:
        return { icon: Settings, color: 'text-gray-600', bg: 'bg-gray-100' }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <div className="p-3 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h5 className="font-medium text-gray-800">{equipment.name}</h5>
        <div className={cn('p-1 rounded', statusInfo.bg)}>
          <StatusIcon className={cn('w-4 h-4', statusInfo.color)} />
        </div>
      </div>
      
      {equipment.temperature && (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Thermometer className="w-3 h-3" />
          <span>{equipment.temperature}°C</span>
        </div>
      )}
      
      <div className="text-xs text-gray-500 mt-1">
        Last check: {equipment.lastCheck.toLocaleDateString()}
      </div>
    </div>
  )
}

/**
 * ⚙️ Station Settings
 * Station configuration panel
 */
const StationSettings: React.FC<{ station: KitchenStation }> = ({ station }) => {
  const { updateStationStatus } = useKitchenActions()

  return (
    <div>
      <h4 className="font-semibold text-gray-800 mb-4">Station Settings</h4>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={station.status}
            onChange={(e) => updateStationStatus(station.id, e.target.value as StationStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="AVAILABLE">Available</option>
            <option value="BUSY">Busy</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Concurrent Orders
          </label>
          <input
            type="number"
            value={station.maxConcurrent}
            min="1"
            max="20"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )
}

export default WorkstationPanel