/**
 * 🎯 Stage Indicator Component
 * Visual progress indicator for cooking stages with interactive controls
 */

import React, { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChefHat,
  Flame,
  UtensilsCrossed,
  CheckCircle,
  ArrowRight,
  Clock,
  Progress
} from 'lucide-react'
import { cn } from '../../utils'
import { CookingStage } from '../../store/kitchenStore'
import { Button } from '../ui/Button'

interface StageIndicatorProps {
  currentStage: CookingStage
  progress?: number // 0-100
  interactive?: boolean
  showLabels?: boolean
  showProgress?: boolean
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  onStageChange?: (stage: CookingStage) => void
  className?: string
}

const STAGES: Array<{
  key: CookingStage
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  description: string
  estimatedPercentage: number
}> = [
  {
    key: 'PREP',
    label: 'Preparation',
    icon: ChefHat,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
    description: 'Ingredient preparation and setup',
    estimatedPercentage: 15
  },
  {
    key: 'COOKING',
    label: 'Cooking',
    icon: Flame,
    color: 'text-orange-600',
    bgColor: 'bg-orange-500',
    description: 'Main cooking process',
    estimatedPercentage: 70
  },
  {
    key: 'PLATING',
    label: 'Plating',
    icon: UtensilsCrossed,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500',
    description: 'Final presentation and garnishing',
    estimatedPercentage: 10
  },
  {
    key: 'READY',
    label: 'Ready',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-500',
    description: 'Ready for delivery',
    estimatedPercentage: 5
  }
]

export const StageIndicator: React.FC<StageIndicatorProps> = ({
  currentStage,
  progress = 0,
  interactive = false,
  showLabels = true,
  showProgress = true,
  orientation = 'horizontal',
  size = 'md',
  onStageChange,
  className
}) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      icon: 'w-4 h-4',
      circle: 'w-8 h-8',
      text: 'text-xs',
      spacing: 'gap-2'
    },
    md: {
      icon: 'w-5 h-5',
      circle: 'w-10 h-10',
      text: 'text-sm',
      spacing: 'gap-3'
    },
    lg: {
      icon: 'w-6 h-6',
      circle: 'w-12 h-12',
      text: 'text-base',
      spacing: 'gap-4'
    }
  }[size]

  // Get current stage index
  const currentIndex = STAGES.findIndex(stage => stage.key === currentStage)
  
  // Calculate which stages are completed
  const getStageStatus = useCallback((index: number) => {
    if (index < currentIndex) return 'completed'
    if (index === currentIndex) return 'active'
    return 'pending'
  }, [currentIndex])

  // Handle stage click
  const handleStageClick = useCallback((stage: CookingStage) => {
    if (interactive && onStageChange) {
      onStageChange(stage)
    }
  }, [interactive, onStageChange])

  // Render horizontal layout
  const renderHorizontal = () => (
    <div className={cn('flex items-center', sizeConfig.spacing, className)}>
      {STAGES.map((stage, index) => {
        const status = getStageStatus(index)
        const Icon = stage.icon
        const isClickable = interactive && onStageChange
        
        return (
          <React.Fragment key={stage.key}>
            {/* Stage Circle */}
            <div className="flex flex-col items-center">
              <motion.button
                className={cn(
                  'rounded-full flex items-center justify-center transition-all duration-300',
                  sizeConfig.circle,
                  status === 'completed' && `${stage.bgColor} text-white shadow-md`,
                  status === 'active' && `${stage.bgColor} text-white shadow-lg ring-2 ring-offset-2 ring-blue-300`,
                  status === 'pending' && 'bg-gray-200 text-gray-400',
                  isClickable && 'hover:shadow-lg cursor-pointer',
                  !isClickable && 'cursor-default'
                )}
                onClick={() => handleStageClick(stage.key)}
                disabled={!isClickable}
                whileHover={isClickable ? { scale: 1.05 } : {}}
                whileTap={isClickable ? { scale: 0.95 } : {}}
              >
                <Icon className={sizeConfig.icon} />
              </motion.button>
              
              {/* Stage Label */}
              {showLabels && (
                <span className={cn(
                  'mt-2 font-medium text-center',
                  sizeConfig.text,
                  status === 'active' && stage.color,
                  status === 'completed' && 'text-gray-600',
                  status === 'pending' && 'text-gray-400'
                )}>
                  {stage.label}
                </span>
              )}
              
              {/* Progress Bar for Active Stage */}
              {showProgress && status === 'active' && progress > 0 && (
                <div className="mt-1 w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className={stage.bgColor}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, progress)}%` }}
                    transition={{ duration: 0.5 }}
                    style={{ height: '100%' }}
                  />
                </div>
              )}
            </div>
            
            {/* Connecting Line */}
            {index < STAGES.length - 1 && (
              <div className="flex-1 relative">
                <div className="h-0.5 bg-gray-200 w-full" />
                <motion.div
                  className={cn(
                    'absolute top-0 left-0 h-0.5',
                    status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                  )}
                  initial={{ width: 0 }}
                  animate={{ 
                    width: status === 'completed' ? '100%' : '0%'
                  }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                />
                
                {/* Arrow */}
                <ArrowRight className="w-4 h-4 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white" />
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )

  // Render vertical layout
  const renderVertical = () => (
    <div className={cn('flex flex-col', sizeConfig.spacing, className)}>
      {STAGES.map((stage, index) => {
        const status = getStageStatus(index)
        const Icon = stage.icon
        const isClickable = interactive && onStageChange
        
        return (
          <React.Fragment key={stage.key}>
            {/* Stage Row */}
            <div className="flex items-center gap-3">
              {/* Stage Circle */}
              <motion.button
                className={cn(
                  'rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0',
                  sizeConfig.circle,
                  status === 'completed' && `${stage.bgColor} text-white shadow-md`,
                  status === 'active' && `${stage.bgColor} text-white shadow-lg ring-2 ring-offset-2 ring-blue-300`,
                  status === 'pending' && 'bg-gray-200 text-gray-400',
                  isClickable && 'hover:shadow-lg cursor-pointer',
                  !isClickable && 'cursor-default'
                )}
                onClick={() => handleStageClick(stage.key)}
                disabled={!isClickable}
                whileHover={isClickable ? { scale: 1.05 } : {}}
                whileTap={isClickable ? { scale: 0.95 } : {}}
              >
                <Icon className={sizeConfig.icon} />
              </motion.button>
              
              {/* Stage Info */}
              <div className="flex-1">
                {showLabels && (
                  <div className={cn(
                    'font-medium',
                    sizeConfig.text,
                    status === 'active' && stage.color,
                    status === 'completed' && 'text-gray-600',
                    status === 'pending' && 'text-gray-400'
                  )}>
                    {stage.label}
                  </div>
                )}
                
                {/* Description */}
                <div className="text-xs text-gray-500 mt-0.5">
                  {stage.description}
                </div>
                
                {/* Progress Bar for Active Stage */}
                {showProgress && status === 'active' && progress > 0 && (
                  <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className={stage.bgColor}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, progress)}%` }}
                      transition={{ duration: 0.5 }}
                      style={{ height: '100%' }}
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Connecting Line */}
            {index < STAGES.length - 1 && (
              <div className="flex items-center pl-5">
                <div className="w-0.5 h-8 bg-gray-200 relative">
                  <motion.div
                    className={cn(
                      'absolute top-0 left-0 w-0.5',
                      status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                    )}
                    initial={{ height: 0 }}
                    animate={{ 
                      height: status === 'completed' ? '100%' : '0%'
                    }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )

  return orientation === 'horizontal' ? renderHorizontal() : renderVertical()
}

/**
 * 📊 Stage Progress Summary
 * Compact summary showing overall stage progress
 */
export const StageProgressSummary: React.FC<{
  currentStage: CookingStage
  progress: number
  showPercentage?: boolean
  className?: string
}> = ({
  currentStage,
  progress,
  showPercentage = true,
  className
}) => {
  const currentStageData = STAGES.find(s => s.key === currentStage)
  const currentIndex = STAGES.findIndex(s => s.key === currentStage)
  
  // Calculate overall progress across all stages
  const overallProgress = STAGES.slice(0, currentIndex).reduce((acc, stage) => 
    acc + stage.estimatedPercentage, 0
  ) + ((currentStageData?.estimatedPercentage || 0) * (progress / 100))

  if (!currentStageData) return null

  const Icon = currentStageData.icon

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Current Stage Icon */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center',
        currentStageData.bgColor,
        'text-white shadow-sm'
      )}>
        <Icon className="w-4 h-4" />
      </div>
      
      {/* Progress Info */}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {currentStageData.label}
          </span>
          {showPercentage && (
            <span className="text-xs text-gray-500">
              {Math.round(overallProgress)}%
            </span>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-orange-500 via-purple-500 to-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, overallProgress)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * 🎛️ Stage Selector
 * Interactive stage selection component
 */
export const StageSelector: React.FC<{
  currentStage: CookingStage
  onStageChange: (stage: CookingStage) => void
  disabled?: boolean
  className?: string
}> = ({
  currentStage,
  onStageChange,
  disabled = false,
  className
}) => {
  return (
    <div className={cn('flex gap-1', className)}>
      {STAGES.map(stage => {
        const Icon = stage.icon
        const isActive = currentStage === stage.key
        
        return (
          <Button
            key={stage.key}
            size="sm"
            variant={isActive ? 'primary' : 'outline'}
            onClick={() => onStageChange(stage.key)}
            disabled={disabled}
            className={cn(
              'flex items-center gap-1 px-2 py-1',
              isActive && stage.bgColor
            )}
          >
            <Icon className="w-3 h-3" />
            <span className="text-xs">{stage.label}</span>
          </Button>
        )
      })}
    </div>
  )
}

export default StageIndicator