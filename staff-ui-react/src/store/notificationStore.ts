/**
 * 🔔 Notification Management Store
 * Zustand store for handling staff notifications and alerts
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { 
  StaffNotification, 
  NotificationType, 
  NotificationPriority,
  WSNotificationDisplay,
  NotificationAction
} from '@/types'

interface NotificationStore {
  // 📊 Core State
  notifications: StaffNotification[]
  displayQueue: WSNotificationDisplay[]
  unreadCount: number
  
  // 🔧 Settings
  soundEnabled: boolean
  vibrationEnabled: boolean
  desktopEnabled: boolean
  autoMarkAsRead: boolean
  maxNotifications: number
  
  // 🎛️ UI State
  panelOpen: boolean
  selectedNotification: StaffNotification | null
  
  // 🔄 Actions
  addNotification: (notification: Omit<StaffNotification, 'id' | 'createdAt'>) => string
  removeNotification: (id: string) => boolean
  markAsRead: (id: string) => boolean
  markAllAsRead: () => void
  clearNotification: (id: string) => boolean
  clearAllNotifications: () => void
  clearOldNotifications: (olderThanDays: number) => number
  
  // 📱 Display Queue Management
  showNotificationDisplay: (notification: WSNotificationDisplay) => void
  hideNotificationDisplay: (id: string) => void
  clearDisplayQueue: () => void
  
  // 🔧 Settings
  updateSettings: (settings: Partial<Pick<NotificationStore, 'soundEnabled' | 'vibrationEnabled' | 'desktopEnabled' | 'autoMarkAsRead' | 'maxNotifications'>>) => void
  
  // 📱 UI Actions
  togglePanel: () => void
  setSelectedNotification: (notification: StaffNotification | null) => void
  
  // 📊 Getters
  getNotificationsByType: (type: NotificationType) => StaffNotification[]
  getNotificationsByPriority: (priority: NotificationPriority) => StaffNotification[]
  getUnreadNotifications: () => StaffNotification[]
  getRecentNotifications: (hours: number) => StaffNotification[]
  
  // 🔊 Sound & Vibration
  playNotificationSound: (type: NotificationType) => void
  vibrateDevice: (pattern?: number | number[]) => void
  
  // 🖥️ Desktop Notifications
  requestDesktopPermission: () => Promise<boolean>
  showDesktopNotification: (notification: StaffNotification) => void
}

// 🔊 Sound Manager
class NotificationSoundManager {
  private audioContext: AudioContext | null = null
  private sounds: Map<NotificationType, AudioBuffer> = new Map()

  constructor() {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext()
      this.preloadSounds()
    }
  }

  private async preloadSounds() {
    const soundMap: Record<NotificationType, string> = {
      'NEW_ORDER': '/sounds/new-order.mp3',
      'ORDER_UPDATE': '/sounds/update.mp3',
      'URGENT_ORDER': '/sounds/urgent.mp3',
      'KITCHEN_ALERT': '/sounds/alert.mp3',
      'STAFF_MESSAGE': '/sounds/message.mp3',
      'SYSTEM_NOTIFICATION': '/sounds/system.mp3',
      'ACHIEVEMENT': '/sounds/achievement.mp3',
      'PERFORMANCE_REPORT': '/sounds/notification.mp3'
    }

    for (const [type, url] of Object.entries(soundMap)) {
      try {
        const response = await fetch(url)
        const arrayBuffer = await response.arrayBuffer()
        if (this.audioContext) {
          const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
          this.sounds.set(type as NotificationType, audioBuffer)
        }
      } catch (error) {
        console.warn(`Failed to load sound for ${type}:`, error)
      }
    }
  }

  async playSound(type: NotificationType, volume: number = 0.5) {
    if (!this.audioContext || !this.sounds.has(type)) return

    try {
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()
      
      source.buffer = this.sounds.get(type)!
      gainNode.gain.value = volume
      
      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      source.start()
    } catch (error) {
      console.warn(`Failed to play sound for ${type}:`, error)
    }
  }
}

// 🏪 Notification Store Implementation
export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => {
      const soundManager = new NotificationSoundManager()

      return {
        // 📊 Initial State
        notifications: [],
        displayQueue: [],
        unreadCount: 0,
        
        // 🔧 Default Settings
        soundEnabled: true,
        vibrationEnabled: true,
        desktopEnabled: false,
        autoMarkAsRead: false,
        maxNotifications: 100,
        
        // 🎛️ UI State
        panelOpen: false,
        selectedNotification: null,

        // 🔄 Core Actions
        addNotification: (notificationData: Omit<StaffNotification, 'id' | 'createdAt'>): string => {
          const notification: StaffNotification = {
            ...notificationData,
            id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            isRead: false
          }
          
          set(state => {
            const newNotifications = [notification, ...state.notifications]
            
            // Limit notifications to maxNotifications
            if (newNotifications.length > state.maxNotifications) {
              newNotifications.splice(state.maxNotifications)
            }
            
            const newUnreadCount = newNotifications.filter(n => !n.isRead).length
            
            return {
              notifications: newNotifications,
              unreadCount: newUnreadCount
            }
          })
          
          // Handle notification display
          const displayNotification: WSNotificationDisplay = {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            priority: notification.priority,
            timestamp: notification.createdAt,
            autoClose: notification.priority !== 'URGENT',
            duration: notification.priority === 'URGENT' ? 0 : 5000,
            sound: get().soundEnabled,
            vibration: get().vibrationEnabled
          }
          
          get().showNotificationDisplay(displayNotification)
          
          // Play sound if enabled
          if (get().soundEnabled) {
            get().playNotificationSound(notification.type)
          }
          
          // Vibrate if enabled and supported
          if (get().vibrationEnabled) {
            const pattern = notification.priority === 'URGENT' ? [200, 100, 200] : [100]
            get().vibrateDevice(pattern)
          }
          
          // Show desktop notification if enabled
          if (get().desktopEnabled) {
            get().showDesktopNotification(notification)
          }
          
          return notification.id
        },

        removeNotification: (id: string): boolean => {
          set(state => {
            const notifications = state.notifications.filter(n => n.id !== id)
            const unreadCount = notifications.filter(n => !n.isRead).length
            
            return {
              notifications,
              unreadCount,
              selectedNotification: state.selectedNotification?.id === id ? null : state.selectedNotification
            }
          })
          return true
        },

        markAsRead: (id: string): boolean => {
          set(state => {
            const notifications = state.notifications.map(n => 
              n.id === id ? { ...n, isRead: true } : n
            )
            const unreadCount = notifications.filter(n => !n.isRead).length
            
            return { notifications, unreadCount }
          })
          return true
        },

        markAllAsRead: (): void => {
          set(state => ({
            notifications: state.notifications.map(n => ({ ...n, isRead: true })),
            unreadCount: 0
          }))
        },

        clearNotification: (id: string): boolean => {
          return get().removeNotification(id)
        },

        clearAllNotifications: (): void => {
          set({ 
            notifications: [], 
            unreadCount: 0, 
            selectedNotification: null 
          })
        },

        clearOldNotifications: (olderThanDays: number): number => {
          const cutoffDate = new Date()
          cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)
          
          const { notifications } = get()
          const oldNotifications = notifications.filter(n => n.createdAt < cutoffDate)
          const newNotifications = notifications.filter(n => n.createdAt >= cutoffDate)
          
          set({
            notifications: newNotifications,
            unreadCount: newNotifications.filter(n => !n.isRead).length
          })
          
          return oldNotifications.length
        },

        // 📱 Display Queue Management
        showNotificationDisplay: (notification: WSNotificationDisplay): void => {
          set(state => ({
            displayQueue: [...state.displayQueue, notification]
          }))
          
          // Auto-hide after duration if specified
          if (notification.autoClose && notification.duration && notification.duration > 0) {
            setTimeout(() => {
              get().hideNotificationDisplay(notification.id)
            }, notification.duration)
          }
        },

        hideNotificationDisplay: (id: string): void => {
          set(state => ({
            displayQueue: state.displayQueue.filter(n => n.id !== id)
          }))
        },

        clearDisplayQueue: (): void => {
          set({ displayQueue: [] })
        },

        // 🔧 Settings
        updateSettings: (settings): void => {
          set(settings)
          
          // Request desktop permission if enabling desktop notifications
          if (settings.desktopEnabled) {
            get().requestDesktopPermission()
          }
        },

        // 📱 UI Actions
        togglePanel: (): void => {
          set(state => ({ panelOpen: !state.panelOpen }))
        },

        setSelectedNotification: (notification: StaffNotification | null): void => {
          set({ selectedNotification: notification })
          
          // Mark as read when selected if autoMarkAsRead is enabled
          if (notification && get().autoMarkAsRead && !notification.isRead) {
            get().markAsRead(notification.id)
          }
        },

        // 📊 Getters
        getNotificationsByType: (type: NotificationType): StaffNotification[] => {
          return get().notifications.filter(n => n.type === type)
        },

        getNotificationsByPriority: (priority: NotificationPriority): StaffNotification[] => {
          return get().notifications.filter(n => n.priority === priority)
        },

        getUnreadNotifications: (): StaffNotification[] => {
          return get().notifications.filter(n => !n.isRead)
        },

        getRecentNotifications: (hours: number): StaffNotification[] => {
          const cutoffTime = new Date()
          cutoffTime.setHours(cutoffTime.getHours() - hours)
          
          return get().notifications.filter(n => n.createdAt >= cutoffTime)
        },

        // 🔊 Sound & Vibration
        playNotificationSound: (type: NotificationType): void => {
          soundManager.playSound(type)
        },

        vibrateDevice: (pattern: number | number[] = 100): void => {
          if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
            navigator.vibrate(pattern)
          }
        },

        // 🖥️ Desktop Notifications
        requestDesktopPermission: async (): Promise<boolean> => {
          if (typeof window === 'undefined' || !('Notification' in window)) {
            return false
          }
          
          if (Notification.permission === 'granted') {
            return true
          }
          
          if (Notification.permission === 'denied') {
            return false
          }
          
          const permission = await Notification.requestPermission()
          return permission === 'granted'
        },

        showDesktopNotification: (notification: StaffNotification): void => {
          if (typeof window === 'undefined' || !('Notification' in window)) {
            return
          }
          
          if (Notification.permission !== 'granted') {
            return
          }
          
          const options: NotificationOptions = {
            body: notification.message,
            icon: '/icons/notification.png',
            badge: '/icons/badge.png',
            tag: notification.id,
            renotify: notification.priority === 'URGENT',
            requireInteraction: notification.priority === 'URGENT',
            timestamp: notification.createdAt.getTime(),
            data: {
              notificationId: notification.id,
              type: notification.type,
              priority: notification.priority
            }
          }
          
          const desktopNotification = new Notification(notification.title, options)
          
          desktopNotification.onclick = () => {
            window.focus()
            get().setSelectedNotification(notification)
            get().togglePanel()
            desktopNotification.close()
          }
          
          // Auto-close after timeout for non-urgent notifications
          if (notification.priority !== 'URGENT') {
            setTimeout(() => {
              desktopNotification.close()
            }, 5000)
          }
        }
      }
    },
    {
      name: 'staff-notification-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 50), // Only persist recent notifications
        soundEnabled: state.soundEnabled,
        vibrationEnabled: state.vibrationEnabled,
        desktopEnabled: state.desktopEnabled,
        autoMarkAsRead: state.autoMarkAsRead,
        maxNotifications: state.maxNotifications
      })
    }
  )
)

// 🔗 Notification Hooks & Selectors
export const useNotifications = () => useNotificationStore(state => state.notifications)
export const useUnreadCount = () => useNotificationStore(state => state.unreadCount)
export const useNotificationPanel = () => useNotificationStore(state => state.panelOpen)
export const useNotificationDisplayQueue = () => useNotificationStore(state => state.displayQueue)

// 🎯 Notification Actions Hook
export const useNotificationActions = () => {
  const store = useNotificationStore()
  return {
    addNotification: store.addNotification,
    markAsRead: store.markAsRead,
    markAllAsRead: store.markAllAsRead,
    clearNotification: store.clearNotification,
    clearAllNotifications: store.clearAllNotifications,
    togglePanel: store.togglePanel,
    setSelectedNotification: store.setSelectedNotification,
    updateSettings: store.updateSettings
  }
}