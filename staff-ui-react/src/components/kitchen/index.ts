/**
 * 🍳 Kitchen Components Export
 * Centralized export for all kitchen management components
 */

// Main Components
export { default as KitchenDashboard } from './KitchenDashboard'
export { default as CookingTimer } from './CookingTimer'
export { default as KitchenQueue } from './KitchenQueue'
export { default as WorkstationPanel } from './WorkstationPanel'
export { default as KitchenPerformance } from './KitchenPerformance'

// Control Components
export { default as TimerControls } from './TimerControls'
export { 
  default as StageIndicator,
  StageProgressSummary,
  StageSelector 
} from './StageIndicator'

// Audio Component
export { AudioAlert } from './CookingTimer'

// Type exports for external use
export type {
  CookingTimer as CookingTimerType,
  CookingStage,
  TimerStatus,
  KitchenStation,
  StationStatus,
  CookingOrder,
  KitchenWorkload,
  KitchenPerformance as KitchenPerformanceType,
  KitchenAlert,
  AlertType,
  StaffAssignment,
  Equipment,
  AudioSettings
} from '../../store/kitchenStore'