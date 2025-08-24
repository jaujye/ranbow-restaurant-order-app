import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  useKitchenStore, 
  useKitchenTimers,
  CookingTimer,
} from '../store/kitchenStore';

// Hook 選項介面
interface UseCookingTimerOptions {
  orderId?: number;
  itemId?: number;
  autoStart?: boolean;
  onComplete?: (orderId: number, itemId?: number) => void;
  onAlert?: (orderId: number, remainingTime: number) => void;
  enableSound?: boolean;
  alertThreshold?: number; // 警告閾值(秒)
}

// 返回值介面
interface UseCookingTimerReturn {
  // 計時器狀態
  timer: CookingTimer | null;
  isRunning: boolean;
  isPaused: boolean;
  isOverdue: boolean;
  remainingTime: number;
  progress: number; // 進度百分比 0-100
  
  // 格式化時間
  timeDisplay: {
    minutes: number;
    seconds: number;
    formatted: string; // "MM:SS" 格式
  };
  
  // 控制方法
  start: (estimatedTime?: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  complete: () => void;
  
  // 狀態檢查
  hasTimer: boolean;
  canStart: boolean;
  canPause: boolean;
  canResume: boolean;
  
  // 音效控制
  playAlert: () => void;
  playComplete: () => void;
}

/**
 * 烹飪計時器 Hook
 * 提供完整的計時器管理功能，包括音效、警告、自動完成等
 */
export const useCookingTimer = (options: UseCookingTimerOptions = {}): UseCookingTimerReturn => {
  const {
    orderId,
    itemId,
    autoStart = false,
    onComplete,
    onAlert,
    enableSound = true,
    alertThreshold = 300, // 預設5分鐘警告
  } = options;

  const timers = useKitchenTimers();
  const {
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
  } = useKitchenStore();

  const [hasAlerted, setHasAlerted] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastAlertTimeRef = useRef(0);

  // 找到對應的計時器
  const timer = timers.find(t => 
    t.orderId === orderId && 
    (itemId === undefined || t.itemId === itemId)
  ) || null;

  // 計算狀態
  const isRunning = timer?.isRunning || false;
  const isPaused = timer?.isPaused || false;
  const isOverdue = timer?.isOverdue || false;
  const remainingTime = timer?.remainingTime || 0;
  
  // 計算進度百分比
  const progress = timer ? 
    Math.min(Math.max(((timer.estimatedDuration - timer.remainingTime) / timer.estimatedDuration) * 100, 0), 100) : 
    0;

  // 格式化時間顯示
  const timeDisplay = {
    minutes: Math.floor(Math.abs(remainingTime) / 60),
    seconds: Math.abs(remainingTime) % 60,
    formatted: `${Math.floor(Math.abs(remainingTime) / 60)}:${(Math.abs(remainingTime) % 60).toString().padStart(2, '0')}`,
  };

  // 狀態檢查
  const hasTimer = timer !== null;
  const canStart = orderId !== undefined && !timer;
  const canPause = hasTimer && isRunning && !isPaused;
  const canResume = hasTimer && isPaused;

  // 音效播放功能
  const playBeep = useCallback((frequency: number = 800, duration: number = 200, volume: number = 0.3) => {
    if (!enableSound) return;

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
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn('無法播放音效:', error);
    }
  }, [enableSound]);

  const playAlert = useCallback(() => {
    // 播放三聲警告音
    playBeep(800, 300);
    setTimeout(() => playBeep(800, 300), 400);
    setTimeout(() => playBeep(800, 300), 800);
  }, [playBeep]);

  const playComplete = useCallback(() => {
    // 播放完成音效
    playBeep(600, 200);
    setTimeout(() => playBeep(800, 200), 250);
    setTimeout(() => playBeep(1000, 300), 500);
  }, [playBeep]);

  // 控制方法
  const start = useCallback((estimatedTime: number = 1800) => {
    if (!orderId) return;
    
    startTimer(orderId, estimatedTime, itemId);
    setHasAlerted(false);
    setHasCompleted(false);
  }, [orderId, itemId, startTimer]);

  const pause = useCallback(() => {
    if (!orderId) return;
    pauseTimer(orderId);
  }, [orderId, pauseTimer]);

  const resume = useCallback(() => {
    if (!orderId) return;
    resumeTimer(orderId);
  }, [orderId, resumeTimer]);

  const reset = useCallback(() => {
    if (!orderId) return;
    resetTimer(orderId);
    setHasAlerted(false);
    setHasCompleted(false);
  }, [orderId, resetTimer]);

  const complete = useCallback(() => {
    if (!orderId) return;
    
    resetTimer(orderId);
    setHasCompleted(false);
    setHasAlerted(false);
    
    if (onComplete) {
      onComplete(orderId, itemId);
    }
  }, [orderId, itemId, resetTimer, onComplete]);

  // 警告和完成處理
  useEffect(() => {
    if (!timer || !isRunning || isPaused) return;

    // 警告音效
    if (remainingTime <= alertThreshold && 
        remainingTime > 0 && 
        !hasAlerted) {
      
      playAlert();
      setHasAlerted(true);
      
      if (onAlert) {
        onAlert(timer.orderId, remainingTime);
      }
    }

    // 完成音效
    if (isOverdue && !hasCompleted) {
      playComplete();
      setHasCompleted(true);
      
      if (onComplete) {
        onComplete(timer.orderId, timer.itemId);
      }
    }

    // 重複警告音效(每30秒)
    if (isOverdue) {
      const now = Date.now();
      if (now - lastAlertTimeRef.current > 30000) {
        playAlert();
        lastAlertTimeRef.current = now;
      }
    }
  }, [
    timer, 
    isRunning, 
    isPaused, 
    remainingTime, 
    isOverdue, 
    alertThreshold, 
    hasAlerted, 
    hasCompleted, 
    playAlert, 
    playComplete, 
    onAlert, 
    onComplete
  ]);

  // 重置狀態當計時器重置
  useEffect(() => {
    if (!timer || timer.remainingTime === timer.estimatedDuration) {
      setHasAlerted(false);
      setHasCompleted(false);
    }
  }, [timer?.remainingTime, timer?.estimatedDuration]);

  // 自動開始
  useEffect(() => {
    if (autoStart && canStart) {
      start();
    }
  }, [autoStart, canStart, start]);

  // 清理音頻上下文
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    // 計時器狀態
    timer,
    isRunning,
    isPaused,
    isOverdue,
    remainingTime,
    progress,
    
    // 格式化時間
    timeDisplay,
    
    // 控制方法
    start,
    pause,
    resume,
    reset,
    complete,
    
    // 狀態檢查
    hasTimer,
    canStart,
    canPause,
    canResume,
    
    // 音效控制
    playAlert,
    playComplete,
  };
};