/**
 * 🎛️ Timer Controls Component
 * Advanced control panel for timer management and batch operations
 */

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  CheckCircle,
  Settings,
  Volume2,
  VolumeX,
  Timer,
  FastForward,
  SkipForward,
  Zap,
  Users,
  Clock
} from 'lucide-react'
import { cn } from '../../utils'
import { useKitchenStore, CookingTimer, CookingStage } from '../../store/kitchenStore'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface TimerControlsProps {
  selectedTimers?: string[]
  showBatchControls?: boolean
  showSettings?: boolean
  compact?: boolean
  className?: string
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  selectedTimers = [],
  showBatchControls = false,
  showSettings = true,
  compact = false,
  className
}) => {
  const {
    activeTimers,
    audioSettings,
    pauseTimer,
    resumeTimer,
    completeTimer,
    resetTimer,
    updateTimerStage,
    updateAudioSettings
  } = useKitchenStore()

  const [showAudioSettings, setShowAudioSettings] = useState(false)
  const [customDuration, setCustomDuration] = useState('')

  // Get selected timer objects
  const selectedTimerObjects = activeTimers.filter(timer => 
    selectedTimers.includes(timer.id)
  )

  // Get control states based on selected timers
  const getControlState = useCallback(() => {
    if (selectedTimerObjects.length === 0) {
      return {
        canPlay: false,
        canPause: false,
        canComplete: false,
        canReset: false,
        hasRunning: false,
        hasPaused: false,
        hasCompleted: false
      }
    }

    const running = selectedTimerObjects.filter(t => t.status === 'RUNNING')
    const paused = selectedTimerObjects.filter(t => t.status === 'PAUSED')
    const completed = selectedTimerObjects.filter(t => t.status === 'COMPLETED')
    const idle = selectedTimerObjects.filter(t => t.status === 'IDLE')

    return {
      canPlay: paused.length > 0 || idle.length > 0,
      canPause: running.length > 0,
      canComplete: (running.length + paused.length) > 0,
      canReset: selectedTimerObjects.length > 0,
      hasRunning: running.length > 0,
      hasPaused: paused.length > 0,
      hasCompleted: completed.length > 0
    }
  }, [selectedTimerObjects])

  const controlState = getControlState()

  // Batch control handlers
  const handleBatchPlay = useCallback(() => {
    selectedTimerObjects.forEach(timer => {
      if (timer.status === 'PAUSED' || timer.status === 'IDLE') {
        resumeTimer(timer.id)
      }
    })
  }, [selectedTimerObjects, resumeTimer])

  const handleBatchPause = useCallback(() => {
    selectedTimerObjects.forEach(timer => {
      if (timer.status === 'RUNNING') {
        pauseTimer(timer.id)
      }
    })
  }, [selectedTimerObjects, pauseTimer])

  const handleBatchComplete = useCallback(() => {
    selectedTimerObjects.forEach(timer => {
      if (timer.status === 'RUNNING' || timer.status === 'PAUSED') {
        completeTimer(timer.id)
      }
    })
  }, [selectedTimerObjects, completeTimer])

  const handleBatchReset = useCallback(() => {
    selectedTimerObjects.forEach(timer => {
      resetTimer(timer.id)
    })
  }, [selectedTimerObjects, resetTimer])

  const handleBatchStageUpdate = useCallback((stage: CookingStage) => {
    selectedTimerObjects.forEach(timer => {
      updateTimerStage(timer.id, stage)
    })
  }, [selectedTimerObjects, updateTimerStage])

  // Audio settings handlers
  const toggleAudio = useCallback(() => {
    updateAudioSettings({
      enabled: !audioSettings.enabled
    })
  }, [audioSettings.enabled, updateAudioSettings])

  const updateVolume = useCallback((volume: number) => {
    updateAudioSettings({ volume })
  }, [updateAudioSettings])

  const toggleAlertType = useCallback((alertType: keyof typeof audioSettings.alerts) => {
    updateAudioSettings({
      alerts: {
        ...audioSettings.alerts,
        [alertType]: !audioSettings.alerts[alertType]
      }
    })
  }, [audioSettings.alerts, updateAudioSettings])

  if (compact) {
    return (
      <Card className={cn('p-3', className)}>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={controlState.canPlay ? 'primary' : 'outline'}
            onClick={handleBatchPlay}
            disabled={!controlState.canPlay}
            className="flex-1"
          >
            <Play className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant={controlState.canPause ? 'secondary' : 'outline'}
            onClick={handleBatchPause}
            disabled={!controlState.canPause}
            className="flex-1"
          >
            <Pause className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant={controlState.canComplete ? 'primary' : 'outline'}
            onClick={handleBatchComplete}
            disabled={!controlState.canComplete}
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4" />
          </Button>

          {showSettings && (
            <Button
              size="sm"
              variant="outline"
              onClick={toggleAudio}
              className="ml-2"
            >
              {audioSettings.enabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-800">Timer Controls</h3>
          {selectedTimers.length > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {selectedTimers.length} selected
            </span>
          )}
        </div>
        
        {showSettings && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={toggleAudio}
              className={cn(
                audioSettings.enabled ? 'text-blue-500' : 'text-gray-400'
              )}
            >
              {audioSettings.enabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAudioSettings(!showAudioSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {selectedTimers.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-500">
              {controlState.hasRunning ? selectedTimerObjects.filter(t => t.status === 'RUNNING').length : 0}
            </div>
            <div className="text-xs text-gray-500">Running</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-500">
              {controlState.hasPaused ? selectedTimerObjects.filter(t => t.status === 'PAUSED').length : 0}
            </div>
            <div className="text-xs text-gray-500">Paused</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-500">
              {controlState.hasCompleted ? selectedTimerObjects.filter(t => t.status === 'COMPLETED').length : 0}
            </div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-500">
              {selectedTimerObjects.filter(t => t.isOverdue).length}
            </div>
            <div className="text-xs text-gray-500">Overdue</div>
          </div>
        </div>
      )}

      {/* Primary Controls */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Button
          variant={controlState.canPlay ? 'primary' : 'outline'}
          onClick={handleBatchPlay}
          disabled={!controlState.canPlay}
          className="flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          <span>Start</span>
          {controlState.canPlay && (
            <span className="text-xs opacity-70">
              ({selectedTimerObjects.filter(t => t.status === 'PAUSED' || t.status === 'IDLE').length})
            </span>
          )}
        </Button>

        <Button
          variant={controlState.canPause ? 'secondary' : 'outline'}
          onClick={handleBatchPause}
          disabled={!controlState.canPause}
          className="flex items-center gap-2"
        >
          <Pause className="w-4 h-4" />
          <span>Pause</span>
          {controlState.canPause && (
            <span className="text-xs opacity-70">
              ({selectedTimerObjects.filter(t => t.status === 'RUNNING').length})
            </span>
          )}
        </Button>

        <Button
          variant={controlState.canComplete ? 'primary' : 'outline'}
          onClick={handleBatchComplete}
          disabled={!controlState.canComplete}
          className="flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Complete</span>
          {controlState.canComplete && (
            <span className="text-xs opacity-70">
              ({selectedTimerObjects.filter(t => t.status === 'RUNNING' || t.status === 'PAUSED').length})
            </span>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handleBatchReset}
          disabled={!controlState.canReset}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
          {selectedTimers.length > 0 && (
            <span className="text-xs opacity-70">
              ({selectedTimers.length})
            </span>
          )}
        </Button>
      </div>

      {/* Stage Controls */}
      {showBatchControls && selectedTimers.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Batch Stage Update</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBatchStageUpdate('PREP')}
              className="flex items-center gap-1 text-blue-600"
            >
              <Users className="w-3 h-3" />
              <span>Prep</span>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBatchStageUpdate('COOKING')}
              className="flex items-center gap-1 text-orange-600"
            >
              <Zap className="w-3 h-3" />
              <span>Cook</span>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBatchStageUpdate('PLATING')}
              className="flex items-center gap-1 text-purple-600"
            >
              <FastForward className="w-3 h-3" />
              <span>Plate</span>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBatchStageUpdate('READY')}
              className="flex items-center gap-1 text-green-600"
            >
              <CheckCircle className="w-3 h-3" />
              <span>Ready</span>
            </Button>
          </div>
        </div>
      )}

      {/* Audio Settings Panel */}
      <AnimatePresence>
        {showAudioSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t pt-4 mt-4"
          >
            <h4 className="text-sm font-medium text-gray-700 mb-3">Audio Settings</h4>
            
            {/* Volume Control */}
            <div className="mb-3">
              <label className="block text-xs text-gray-600 mb-1">Volume</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={audioSettings.volume}
                onChange={(e) => updateVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>{Math.round(audioSettings.volume * 100)}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Alert Types */}
            <div className="space-y-2">
              <label className="block text-xs text-gray-600">Alert Types</label>
              
              {Object.entries(audioSettings.alerts).map(([type, enabled]) => (
                <label key={type} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => toggleAlertType(type as keyof typeof audioSettings.alerts)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="capitalize">{type.replace('_', ' ')}</span>
                </label>
              ))}
            </div>

            {/* Sound Pack Selection */}
            <div className="mt-3">
              <label className="block text-xs text-gray-600 mb-1">Sound Pack</label>
              <select
                value={audioSettings.soundPack}
                onChange={(e) => updateAudioSettings({ 
                  soundPack: e.target.value as any 
                })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="default">Default</option>
                <option value="classic">Classic</option>
                <option value="modern">Modern</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Selection State */}
      {selectedTimers.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select timers to use controls</p>
        </div>
      )}
    </Card>
  )
}

export default TimerControls