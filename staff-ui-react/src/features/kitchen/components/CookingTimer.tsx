import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle,
  Timer as TimerIcon,
  Bell,
  Volume2,
  VolumeX,
  Settings,
  Clock,
} from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import { 
  CookingTimer,
  useKitchenStore,
  useKitchenTimers,
  useKitchenSettings,
} from '../store/kitchenStore';

// 組件屬性介面
interface CookingTimerProps {
  orderId?: number;
  itemId?: number;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showControls?: boolean;
  autoStart?: boolean;
  onComplete?: (orderId: number, itemId?: number) => void;
  onAlert?: (orderId: number, remainingTime: number) => void;
}

// 計時器顯示組件屬性
interface TimerDisplayProps {
  timer: CookingTimer;
  size: 'small' | 'medium' | 'large';
  showControls: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onComplete: () => void;
}

// 時間格式化工具函數
const formatTime = (totalSeconds: number): { minutes: number; seconds: number; display: string } => {
  const minutes = Math.floor(Math.abs(totalSeconds) / 60);
  const seconds = Math.abs(totalSeconds) % 60;
  const isNegative = totalSeconds < 0;
  
  const display = `${isNegative ? '-' : ''}${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  return { minutes, seconds, display };
};

// 時間顏色根據狀態
const getTimeColor = (timer: CookingTimer): string => {
  if (timer.isOverdue) return 'text-red-600';
  if (timer.remainingTime <= timer.alertThreshold) return 'text-orange-600';
  if (timer.isPaused) return 'text-gray-500';
  return 'text-green-600';
};

// 進度條顏色
const getProgressColor = (timer: CookingTimer): string => {
  if (timer.isOverdue) return 'bg-red-500';
  if (timer.remainingTime <= timer.alertThreshold) return 'bg-orange-500';
  if (timer.isPaused) return 'bg-gray-400';
  return 'bg-green-500';
};

// 獲取進度百分比
const getProgress = (timer: CookingTimer): number => {
  if (timer.estimatedDuration <= 0) return 0;
  const elapsed = timer.estimatedDuration - timer.remainingTime;
  return Math.min(Math.max((elapsed / timer.estimatedDuration) * 100, 0), 100);
};

// 音效播放Hook
const useTimerSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const settings = useKitchenSettings();
  
  const playBeep = (frequency: number = 800, duration: number = 200) => {
    if (!settings.soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(settings.alertVolume * 0.3, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn('無法播放音效:', error);
    }
  };

  const playAlertSound = () => {
    // 播放三聲警告音
    playBeep(800, 300);
    setTimeout(() => playBeep(800, 300), 400);
    setTimeout(() => playBeep(800, 300), 800);
  };

  const playCompletionSound = () => {
    // 播放完成音效
    playBeep(600, 200);
    setTimeout(() => playBeep(800, 200), 250);
    setTimeout(() => playBeep(1000, 300), 500);
  };

  return { playAlertSound, playCompletionSound, playBeep };
};

// 計時器顯示組件
const TimerDisplay: React.FC<TimerDisplayProps> = ({
  timer,
  size,
  showControls,
  onStart,
  onPause,
  onResume,
  onReset,
  onComplete,
}) => {
  const timeInfo = formatTime(timer.remainingTime);
  const progress = getProgress(timer);
  const timeColor = getTimeColor(timer);
  const progressColor = getProgressColor(timer);
  
  // 尺寸映射
  const sizeClasses = {
    small: {
      container: 'p-3',
      timer: 'text-2xl',
      icon: 'w-4 h-4',
      button: 'p-1.5',
      progress: 'h-1',
    },
    medium: {
      container: 'p-4',
      timer: 'text-4xl',
      icon: 'w-5 h-5',
      button: 'p-2',
      progress: 'h-2',
    },
    large: {
      container: 'p-6',
      timer: 'text-6xl',
      icon: 'w-6 h-6',
      button: 'p-3',
      progress: 'h-3',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={cn(
      'bg-white rounded-lg border shadow-sm',
      classes.container,
      timer.isOverdue && 'border-red-300 bg-red-50',
      timer.isPaused && 'border-gray-300 bg-gray-50'
    )}>
      {/* 時間顯示 */}
      <div className="text-center mb-4">
        <div className={cn(
          'font-mono font-bold',
          classes.timer,
          timeColor
        )}>
          {timeInfo.display}
        </div>
        
        {size !== 'small' && (
          <div className="text-sm text-gray-500 mt-1">
            預估時間: {formatTime(timer.estimatedDuration).display}
          </div>
        )}
      </div>

      {/* 進度條 */}
      <div className="mb-4">
        <div className={cn(
          'w-full bg-gray-200 rounded-full overflow-hidden',
          classes.progress
        )}>
          <div
            className={cn('transition-all duration-1000 ease-linear', progressColor, classes.progress)}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {size !== 'small' && (
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0:00</span>
            <span>{progress.toFixed(0)}%</span>
            <span>{formatTime(timer.estimatedDuration).display}</span>
          </div>
        )}
      </div>

      {/* 狀態指示器 */}
      <div className="flex items-center justify-center space-x-2 mb-4">
        {timer.isRunning && !timer.isPaused && (
          <div className="flex items-center space-x-1 text-green-600">
            <Play className={cn(classes.icon, 'animate-pulse')} />
            <span className="text-sm">運行中</span>
          </div>
        )}
        
        {timer.isPaused && (
          <div className="flex items-center space-x-1 text-gray-500">
            <Pause className={classes.icon} />
            <span className="text-sm">已暫停</span>
          </div>
        )}
        
        {timer.isOverdue && (
          <div className="flex items-center space-x-1 text-red-600">
            <AlertTriangle className={cn(classes.icon, 'animate-bounce')} />
            <span className="text-sm">逾時</span>
            <Bell className={cn(classes.icon, 'animate-bounce')} />
          </div>
        )}
        
        {timer.remainingTime <= timer.alertThreshold && !timer.isOverdue && (
          <div className="flex items-center space-x-1 text-orange-600">
            <TimerIcon className={cn(classes.icon, 'animate-pulse')} />
            <span className="text-sm">即將完成</span>
          </div>
        )}
      </div>

      {/* 控制按鈕 */}
      {showControls && (
        <div className="flex items-center justify-center space-x-2">
          {!timer.isRunning && !timer.isPaused && (
            <button
              onClick={onStart}
              className={cn(
                'flex items-center space-x-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors',
                classes.button
              )}
              title="開始計時"
            >
              <Play className={classes.icon} />
              {size === 'large' && <span>開始</span>}
            </button>
          )}
          
          {timer.isRunning && !timer.isPaused && (
            <button
              onClick={onPause}
              className={cn(
                'flex items-center space-x-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors',
                classes.button
              )}
              title="暫停計時"
            >
              <Pause className={classes.icon} />
              {size === 'large' && <span>暫停</span>}
            </button>
          )}
          
          {timer.isPaused && (
            <button
              onClick={onResume}
              className={cn(
                'flex items-center space-x-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors',
                classes.button
              )}
              title="恢復計時"
            >
              <Play className={classes.icon} />
              {size === 'large' && <span>恢復</span>}
            </button>
          )}
          
          <button
            onClick={onReset}
            className={cn(
              'flex items-center space-x-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors',
              classes.button
            )}
            title="重置計時器"
          >
            <RotateCcw className={classes.icon} />
            {size === 'large' && <span>重置</span>}
          </button>
          
          <button
            onClick={onComplete}
            className={cn(
              'flex items-center space-x-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors',
              classes.button
            )}
            title="標記完成"
          >
            <CheckCircle className={classes.icon} />
            {size === 'large' && <span>完成</span>}
          </button>
        </div>
      )}
    </div>
  );
};

// 主烹飪計時器組件
export const CookingTimer: React.FC<CookingTimerProps> = ({
  orderId,
  itemId,
  className,
  size = 'medium',
  showControls = true,
  autoStart = false,
  onComplete,
  onAlert,
}) => {
  const timers = useKitchenTimers();
  const { startTimer, pauseTimer, resumeTimer, resetTimer } = useKitchenStore();
  const settings = useKitchenSettings();
  const { playAlertSound, playCompletionSound } = useTimerSound();
  
  const [hasAlerted, setHasAlerted] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const lastAlertTimeRef = useRef(0);

  // 找到對應的計時器
  const timer = timers.find(t => 
    t.orderId === orderId && 
    (itemId === undefined || t.itemId === itemId)
  );

  // 音效處理
  useEffect(() => {
    if (!timer) return;

    // 警告音效
    if (timer.remainingTime <= timer.alertThreshold && 
        timer.remainingTime > 0 && 
        timer.isRunning && 
        !timer.isPaused && 
        !hasAlerted) {
      
      playAlertSound();
      setHasAlerted(true);
      
      if (onAlert) {
        onAlert(timer.orderId, timer.remainingTime);
      }
    }

    // 完成音效
    if (timer.isOverdue && !hasCompleted) {
      playCompletionSound();
      setHasCompleted(true);
      
      if (onComplete) {
        onComplete(timer.orderId, timer.itemId);
      }
    }

    // 重複警告音效(每30秒)
    if (timer.isOverdue) {
      const now = Date.now();
      if (now - lastAlertTimeRef.current > 30000) {
        playAlertSound();
        lastAlertTimeRef.current = now;
      }
    }
  }, [timer?.remainingTime, timer?.isOverdue, hasAlerted, hasCompleted, playAlertSound, playCompletionSound, onAlert, onComplete]);

  // 重置狀態當計時器重置
  useEffect(() => {
    if (!timer || timer.remainingTime === timer.estimatedDuration) {
      setHasAlerted(false);
      setHasCompleted(false);
    }
  }, [timer?.remainingTime, timer?.estimatedDuration]);

  // 自動開始
  useEffect(() => {
    if (autoStart && timer && !timer.isRunning && !timer.isPaused) {
      handleStart();
    }
  }, [autoStart, timer]);

  const handleStart = () => {
    if (!orderId) return;
    startTimer(orderId, timer?.estimatedDuration || 1800, itemId); // 預設30分鐘
  };

  const handlePause = () => {
    if (!orderId) return;
    pauseTimer(orderId);
  };

  const handleResume = () => {
    if (!orderId) return;
    resumeTimer(orderId);
  };

  const handleReset = () => {
    if (!orderId) return;
    resetTimer(orderId);
    setHasAlerted(false);
    setHasCompleted(false);
  };

  const handleComplete = () => {
    if (!orderId) return;
    resetTimer(orderId);
    
    if (onComplete) {
      onComplete(orderId, itemId);
    }
  };

  // 如果沒有計時器且沒有指定訂單ID，顯示空狀態
  if (!timer && !orderId) {
    return (
      <div className={cn('bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center', className)}>
        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500 mb-4">選擇訂單開始計時</p>
        <p className="text-sm text-gray-400">
          點擊訂單卡片或使用"開始製作"按鈕
        </p>
      </div>
    );
  }

  // 如果沒有找到計時器但有訂單ID，顯示開始計時選項
  if (!timer && orderId) {
    return (
      <div className={cn('bg-white rounded-lg border shadow-sm p-6 text-center', className)}>
        <TimerIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">訂單 #{orderId}</h3>
        <p className="text-gray-500 mb-4">點擊開始計時</p>
        
        <button
          onClick={handleStart}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors mx-auto"
        >
          <Play className="w-4 h-4" />
          <span>開始計時</span>
        </button>
      </div>
    );
  }

  // 渲染計時器
  return (
    <div className={className}>
      <TimerDisplay
        timer={timer!}
        size={size}
        showControls={showControls}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onReset={handleReset}
        onComplete={handleComplete}
      />
    </div>
  );
};

// 多計時器組件
interface MultiTimerProps {
  orderIds: number[];
  className?: string;
  size?: 'small' | 'medium' | 'large';
  columns?: 1 | 2 | 3 | 4;
  onComplete?: (orderId: number) => void;
}

export const MultiTimer: React.FC<MultiTimerProps> = ({
  orderIds,
  className,
  size = 'small',
  columns = 2,
  onComplete,
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={cn(
      'grid gap-4',
      gridClasses[columns],
      className
    )}>
      {orderIds.map(orderId => (
        <CookingTimer
          key={orderId}
          orderId={orderId}
          size={size}
          showControls={true}
          onComplete={onComplete}
        />
      ))}
    </div>
  );
};

export default CookingTimer;