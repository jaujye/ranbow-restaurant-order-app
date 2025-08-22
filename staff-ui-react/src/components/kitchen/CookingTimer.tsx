/**
 * ⏰ Cooking Timer Component
 * Advanced timer with visual progression, stage indicators, and audio alerts
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  ChefHat,
  Flame,
  UtensilsCrossed,
  CheckCircle,
  AlertTriangle,
  Volume2,
  VolumeX,
  Clock,
  Timer as TimerIcon,
  Zap
} from 'lucide-react'
import { cn } from '../../utils'
import { useKitchenStore, CookingTimer as TimerType, CookingStage } from '../../store/kitchenStore'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface CookingTimerProps {
  timer: TimerType
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showControls?: boolean
  showStageSelector?: boolean
  showDetails?: boolean
  interactive?: boolean
  onSelect?: (timerId: string) => void
  className?: string
}

const STAGE_ICONS = {
  PREP: ChefHat,
  COOKING: Flame,
  PLATING: UtensilsCrossed,
  READY: CheckCircle
} as const

const STAGE_COLORS = {
  PREP: 'bg-blue-500',
  COOKING: 'bg-orange-500',
  PLATING: 'bg-purple-500',
  READY: 'bg-green-500'
} as const

const STAGE_LABELS = {
  PREP: 'Preparing',
  COOKING: 'Cooking',
  PLATING: 'Plating',
  READY: 'Ready'
} as const

export const CookingTimer: React.FC<CookingTimerProps> = ({
  timer,
  size = 'md',
  showControls = true,
  showStageSelector = true,
  showDetails = true,
  interactive = true,
  onSelect,
  className
}) => {
  const {
    pauseTimer,
    resumeTimer,
    completeTimer,
    resetTimer,
    updateTimerStage,
    audioSettings
  } = useKitchenStore()

  const [isPlaying, setIsPlaying] = useState(timer.status === 'RUNNING')
  const [showSettings, setShowSettings] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(audioSettings.enabled)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastAlertRef = useRef<number>(0)

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'p-3',
      timer: 'text-lg font-mono',
      progress: 'h-1',
      controls: 'gap-1',
      button: 'w-6 h-6',
      icon: 'w-3 h-3'
    },
    md: {
      container: 'p-4',
      timer: 'text-2xl font-mono',
      progress: 'h-2',
      controls: 'gap-2',
      button: 'w-8 h-8',
      icon: 'w-4 h-4'
    },
    lg: {
      container: 'p-6',
      timer: 'text-4xl font-mono',
      progress: 'h-3',
      controls: 'gap-3',
      button: 'w-10 h-10',
      icon: 'w-5 h-5'
    },
    xl: {
      container: 'p-8',
      timer: 'text-6xl font-mono',
      progress: 'h-4',
      controls: 'gap-4',
      button: 'w-12 h-12',
      icon: 'w-6 h-6'
    }
  }[size]

  // Format time display
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(Math.abs(seconds) / 60)
    const secs = Math.abs(seconds) % 60
    const sign = seconds < 0 ? '-' : ''
    return `${sign}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Get timer color based on progress and status
  const getTimerColor = useCallback(() => {
    if (timer.status === 'COMPLETED') return 'text-green-500'
    if (timer.status === 'PAUSED') return 'text-gray-500'
    if (timer.isOverdue) return 'text-red-500'
    if (timer.progress >= 80) return 'text-red-500'
    if (timer.progress >= 50) return 'text-orange-500'
    return 'text-blue-500'
  }, [timer.status, timer.isOverdue, timer.progress])

  // Get background color for progress
  const getProgressColor = useCallback(() => {
    if (timer.status === 'COMPLETED') return 'bg-green-500'
    if (timer.status === 'PAUSED') return 'bg-gray-400'
    if (timer.isOverdue) return 'bg-red-500'
    if (timer.progress >= 80) return 'bg-red-500'
    if (timer.progress >= 50) return 'bg-orange-500'
    return 'bg-blue-500'
  }, [timer.status, timer.isOverdue, timer.progress])

  // Play alert sounds
  const playAlert = useCallback((type: 'warning' | 'critical' | 'complete' | 'overdue') => {
    if (!soundEnabled || !audioSettings.enabled) return
    
    const alertSettings = audioSettings.alerts
    const shouldPlay = (
      (type === 'warning' && alertSettings.warning) ||
      (type === 'critical' && alertSettings.critical) ||
      (type === 'complete' && alertSettings.complete) ||
      (type === 'overdue' && alertSettings.overdue)
    )

    if (shouldPlay && audioRef.current) {
      audioRef.current.volume = audioSettings.volume
      audioRef.current.play().catch(console.warn)
    }
  }, [soundEnabled, audioSettings])

  // Handle audio alerts based on timer progress
  useEffect(() => {
    if (timer.status !== 'RUNNING') return

    const progress = timer.progress
    const now = Date.now()

    // Prevent duplicate alerts within 5 seconds
    if (now - lastAlertRef.current < 5000) return

    if (timer.isOverdue && progress > 100) {
      playAlert('overdue')
      lastAlertRef.current = now
    } else if (progress >= 80 && progress < 100) {
      playAlert('critical')
      lastAlertRef.current = now
    } else if (progress >= 50 && progress < 80) {
      playAlert('warning')
      lastAlertRef.current = now
    }

    if (timer.status === 'COMPLETED') {
      playAlert('complete')
      lastAlertRef.current = now
    }
  }, [timer.progress, timer.status, timer.isOverdue, playAlert])

  // Timer control handlers
  const handlePlay = useCallback(() => {
    if (timer.status === 'PAUSED') {
      resumeTimer(timer.id)
    }
    setIsPlaying(true)
  }, [timer.status, timer.id, resumeTimer])

  const handlePause = useCallback(() => {
    if (timer.status === 'RUNNING') {
      pauseTimer(timer.id)
    }
    setIsPlaying(false)
  }, [timer.status, timer.id, pauseTimer])

  const handleComplete = useCallback(() => {
    completeTimer(timer.id)
    setIsPlaying(false)
  }, [timer.id, completeTimer])

  const handleReset = useCallback(() => {
    resetTimer(timer.id)
    setIsPlaying(false)
  }, [timer.id, resetTimer])

  const handleStageChange = useCallback((stage: CookingStage) => {
    updateTimerStage(timer.id, stage)
  }, [timer.id, updateTimerStage])

  const handleClick = useCallback(() => {
    if (interactive && onSelect) {
      onSelect(timer.id)
    }
  }, [interactive, onSelect, timer.id])

  // Get stage icon component
  const StageIcon = STAGE_ICONS[timer.stage]

  return (
    <Card
      className={cn(
        'relative transition-all duration-300 hover:shadow-md',
        interactive && 'cursor-pointer hover:shadow-lg',
        timer.isOverdue && 'ring-2 ring-red-500 animate-pulse',
        timer.status === 'COMPLETED' && 'ring-2 ring-green-500',
        sizeConfig.container,
        className
      )}
      onClick={handleClick}
    >
      {/* Audio element for alerts */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/timer-alert.mp3" type="audio/mpeg" />
      </audio>

      {/* Header with order info */}
      {showDetails && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">
              Order #{timer.orderId}
            </span>
            {timer.priority > 3 && (
              <Zap className="w-4 h-4 text-yellow-500" />
            )}
          </div>
          <div className="flex items-center gap-1">
            {soundEnabled ? (
              <Volume2 
                className="w-4 h-4 text-gray-400 cursor-pointer" 
                onClick={(e) => {
                  e.stopPropagation()
                  setSoundEnabled(false)
                }}
              />
            ) : (
              <VolumeX 
                className="w-4 h-4 text-gray-400 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  setSoundEnabled(true)
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Stage Indicator */}
      {showStageSelector && (
        <div className="flex items-center gap-2 mb-4">
          {Object.entries(STAGE_ICONS).map(([stage, Icon]) => (
            <button
              key={stage}
              onClick={(e) => {
                e.stopPropagation()
                handleStageChange(stage as CookingStage)
              }}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all',
                timer.stage === stage
                  ? `${STAGE_COLORS[stage as CookingStage]} text-white`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <Icon className="w-3 h-3" />
              <span>{STAGE_LABELS[stage as CookingStage]}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Timer Display */}
      <div className="text-center mb-4">
        <motion.div
          className={cn(
            sizeConfig.timer,
            'font-bold tracking-wider transition-colors duration-300',
            getTimerColor()
          )}
          animate={{
            scale: timer.isOverdue ? [1, 1.05, 1] : 1
          }}
          transition={{
            duration: 1,
            repeat: timer.isOverdue ? Infinity : 0
          }}
        >
          {timer.isOverdue ? formatTime(-timer.overdueTime) : formatTime(timer.remainingTime)}
        </motion.div>

        {showDetails && (
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Est: {formatTime(timer.estimatedDuration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <TimerIcon className="w-3 h-3" />
              <span>Elapsed: {formatTime(timer.elapsed)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className={cn('w-full bg-gray-200 rounded-full mb-4', sizeConfig.progress)}>
        <motion.div
          className={cn(
            'rounded-full transition-all duration-300',
            sizeConfig.progress,
            getProgressColor()
          )}
          initial={{ width: 0 }}
          animate={{ 
            width: `${Math.min(100, timer.progress)}%` 
          }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Progress Percentage */}
      <div className="text-center mb-4">
        <span className={cn('text-sm font-medium', getTimerColor())}>
          {Math.round(timer.progress)}%
        </span>
        {timer.isOverdue && (
          <span className="ml-2 text-xs text-red-500 font-medium">
            OVERDUE
          </span>
        )}
      </div>

      {/* Timer Controls */}
      {showControls && (
        <div className={cn('flex items-center justify-center', sizeConfig.controls)}>
          <AnimatePresence mode="wait">
            {timer.status === 'RUNNING' ? (
              <motion.div
                key="pause"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePause()
                  }}
                  className={cn(sizeConfig.button, 'text-orange-500 hover:text-orange-600')}
                >
                  <Pause className={sizeConfig.icon} />
                </Button>
              </motion.div>
            ) : timer.status === 'PAUSED' ? (
              <motion.div
                key="play"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePlay()
                  }}
                  className={cn(sizeConfig.button, 'text-green-500 hover:text-green-600')}
                >
                  <Play className={sizeConfig.icon} />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex gap-2"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePlay()
                  }}
                  className={cn(sizeConfig.button, 'text-green-500 hover:text-green-600')}
                >
                  <Play className={sizeConfig.icon} />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Additional Controls */}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleComplete()
            }}
            className={cn(
              sizeConfig.button,
              'text-green-500 hover:text-green-600',
              timer.status === 'COMPLETED' && 'bg-green-100'
            )}
            disabled={timer.status === 'COMPLETED'}
          >
            <CheckCircle className={sizeConfig.icon} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleReset()
            }}
            className={cn(sizeConfig.button, 'text-gray-500 hover:text-gray-600')}
          >
            <RotateCcw className={sizeConfig.icon} />
          </Button>
        </div>
      )}

      {/* Status Indicator */}
      <div className="absolute top-2 right-2">
        <motion.div
          className={cn(
            'w-3 h-3 rounded-full',
            timer.status === 'RUNNING' && 'bg-green-500',
            timer.status === 'PAUSED' && 'bg-yellow-500',
            timer.status === 'COMPLETED' && 'bg-blue-500',
            timer.status === 'IDLE' && 'bg-gray-400',
            timer.isOverdue && 'bg-red-500'
          )}
          animate={{
            scale: timer.status === 'RUNNING' ? [1, 1.2, 1] : 1,
            opacity: timer.status === 'PAUSED' ? [0.5, 1, 0.5] : 1
          }}
          transition={{
            duration: 1,
            repeat: timer.status === 'RUNNING' || timer.status === 'PAUSED' ? Infinity : 0
          }}
        />
      </div>

      {/* Overdue Warning */}
      <AnimatePresence>
        {timer.isOverdue && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>OVERDUE</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Priority Indicator */}
      {timer.priority > 3 && (
        <div className="absolute top-2 left-2">
          <motion.div
            className="bg-yellow-500 text-white text-xs px-1 py-0.5 rounded font-bold"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            HIGH
          </motion.div>
        </div>
      )}
    </Card>
  )
}

/**
 * 🎵 Audio Alert Component
 * Separate component for managing audio alerts with user preferences
 */
export const AudioAlert: React.FC<{
  enabled: boolean
  volume: number
  alertType: 'warning' | 'critical' | 'complete' | 'overdue'
}> = ({ enabled, volume, alertType }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (enabled && audioRef.current) {
      audioRef.current.volume = volume
      audioRef.current.play().catch(console.warn)
    }
  }, [enabled, volume, alertType])

  const getSoundFile = () => {
    switch (alertType) {
      case 'warning': return '/sounds/timer-warning.mp3'
      case 'critical': return '/sounds/timer-critical.mp3'
      case 'complete': return '/sounds/timer-complete.mp3'
      case 'overdue': return '/sounds/timer-overdue.mp3'
      default: return '/sounds/timer-alert.mp3'
    }
  }

  return (
    <audio ref={audioRef} preload="auto">
      <source src={getSoundFile()} type="audio/mpeg" />
    </audio>
  )
}

export default CookingTimer