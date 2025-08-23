/**
 * 🔌 WebSocket Connection Store
 * Manages real-time WebSocket connections for order updates, notifications, and kitchen status
 */

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { io, Socket } from 'socket.io-client'

export interface WebSocketState {
  // Connection state
  socket: Socket | null
  isConnected: boolean
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
  lastConnectedAt: string | null
  reconnectAttempts: number
  
  // Message handling
  messageHandlers: Map<string, Array<(data: any) => void>>
  lastMessage: any
  messageCount: number
  
  // Error handling
  lastError: string | null
  errorCount: number
  
  // Performance metrics
  latency: number
  messagesReceived: number
  messagesSent: number
}

export interface WebSocketActions {
  // Connection management
  connect: (url?: string, options?: any) => void
  disconnect: () => void
  reconnect: () => void
  
  // Message handling
  on: (event: string, handler: (data: any) => void) => void
  off: (event: string, handler?: (data: any) => void) => void
  emit: (event: string, data?: any) => void
  
  // Handler management
  addHandler: (event: string, handler: (data: any) => void) => void
  removeHandler: (event: string, handler: (data: any) => void) => void
  clearHandlers: (event?: string) => void
  
  // State management
  setConnectionStatus: (status: WebSocketState['connectionStatus']) => void
  setError: (error: string | null) => void
  updateLatency: (latency: number) => void
  incrementMessageCount: () => void
  
  // Reset
  reset: () => void
}

const initialState: WebSocketState = {
  socket: null,
  isConnected: false,
  connectionStatus: 'disconnected',
  lastConnectedAt: null,
  reconnectAttempts: 0,
  messageHandlers: new Map(),
  lastMessage: null,
  messageCount: 0,
  lastError: null,
  errorCount: 0,
  latency: 0,
  messagesReceived: 0,
  messagesSent: 0
}

export const useWebSocketStore = create<WebSocketState & WebSocketActions>()(
  devtools(
    subscribeWithSelector(
      (set, get) => ({
        ...initialState,
        
        // Connection management
        connect: (url = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8084', options = {}) => {
          const state = get()
          
          if (state.socket?.connected) {
            console.log('WebSocket already connected')
            return
          }
          
          set({ connectionStatus: 'connecting' }, false, 'ws/connect')
          
          try {
            const socket = io(url, {
              autoConnect: false,
              reconnection: true,
              reconnectionDelay: 1000,
              reconnectionAttempts: 5,
              ...options
            })
            
            // Connection event handlers
            socket.on('connect', () => {
              set({
                isConnected: true,
                connectionStatus: 'connected',
                lastConnectedAt: new Date().toISOString(),
                reconnectAttempts: 0,
                lastError: null
              }, false, 'ws/connected')
              
              console.log('🔌 WebSocket connected')
            })
            
            socket.on('disconnect', (reason) => {
              set({
                isConnected: false,
                connectionStatus: 'disconnected',
                lastError: `Disconnected: ${reason}`
              }, false, 'ws/disconnected')
              
              console.log('🔌 WebSocket disconnected:', reason)
            })
            
            socket.on('connect_error', (error) => {
              set((state) => ({
                connectionStatus: 'error',
                lastError: error.message,
                errorCount: state.errorCount + 1
              }), false, 'ws/error')
              
              console.error('🔌 WebSocket connection error:', error)
            })
            
            socket.on('reconnect_attempt', (attemptNumber) => {
              set({
                connectionStatus: 'connecting',
                reconnectAttempts: attemptNumber
              }, false, 'ws/reconnectAttempt')
              
              console.log(`🔌 WebSocket reconnect attempt ${attemptNumber}`)
            })
            
            // Generic message handler
            socket.onAny((event, data) => {
              const handlers = get().messageHandlers.get(event) || []
              handlers.forEach(handler => {
                try {
                  handler(data)
                } catch (error) {
                  console.error(`Error in WebSocket handler for ${event}:`, error)
                }
              })
              
              set((state) => ({
                lastMessage: { event, data, timestamp: new Date().toISOString() },
                messageCount: state.messageCount + 1,
                messagesReceived: state.messagesReceived + 1
              }), false, 'ws/message')
            })
            
            set({ socket }, false, 'ws/socketCreated')
            socket.connect()
            
          } catch (error) {
            console.error('Failed to create WebSocket connection:', error)
            set({
              connectionStatus: 'error',
              lastError: error instanceof Error ? error.message : 'Unknown connection error'
            }, false, 'ws/connectionError')
          }
        },
        
        disconnect: () => {
          const socket = get().socket
          if (socket) {
            socket.disconnect()
            set({
              socket: null,
              isConnected: false,
              connectionStatus: 'disconnected'
            }, false, 'ws/disconnect')
          }
        },
        
        reconnect: () => {
          const socket = get().socket
          if (socket) {
            socket.connect()
          }
        },
        
        // Message handling
        on: (event, handler) => {
          get().addHandler(event, handler)
        },
        
        off: (event, handler) => {
          if (handler) {
            get().removeHandler(event, handler)
          } else {
            get().clearHandlers(event)
          }
        },
        
        emit: (event, data) => {
          const socket = get().socket
          if (socket?.connected) {
            socket.emit(event, data)
            set((state) => ({
              messagesSent: state.messagesSent + 1
            }), false, 'ws/emit')
          } else {
            console.warn('Cannot emit: WebSocket not connected')
          }
        },
        
        // Handler management
        addHandler: (event, handler) => {
          set((state) => {
            const handlers = state.messageHandlers.get(event) || []
            const newHandlers = new Map(state.messageHandlers)
            newHandlers.set(event, [...handlers, handler])
            return { messageHandlers: newHandlers }
          }, false, 'ws/addHandler')
        },
        
        removeHandler: (event, handler) => {
          set((state) => {
            const handlers = state.messageHandlers.get(event) || []
            const newHandlers = new Map(state.messageHandlers)
            newHandlers.set(event, handlers.filter(h => h !== handler))
            return { messageHandlers: newHandlers }
          }, false, 'ws/removeHandler')
        },
        
        clearHandlers: (event) => {
          set((state) => {
            const newHandlers = new Map(state.messageHandlers)
            if (event) {
              newHandlers.delete(event)
            } else {
              newHandlers.clear()
            }
            return { messageHandlers: newHandlers }
          }, false, 'ws/clearHandlers')
        },
        
        // State management
        setConnectionStatus: (connectionStatus) => {
          set({ connectionStatus }, false, 'ws/setStatus')
        },
        
        setError: (lastError) => {
          set({ lastError }, false, 'ws/setError')
        },
        
        updateLatency: (latency) => {
          set({ latency }, false, 'ws/updateLatency')
        },
        
        incrementMessageCount: () => {
          set((state) => ({ messageCount: state.messageCount + 1 }), false, 'ws/incrementCount')
        },
        
        // Reset
        reset: () => {
          const socket = get().socket
          if (socket) {
            socket.disconnect()
          }
          set(initialState, false, 'ws/reset')
        }
      })
    ),
    {
      name: 'WebSocket Store'
    }
  )
)

// Selector hooks
export const useConnectionStatus = () => useWebSocketStore((state) => ({
  isConnected: state.isConnected,
  status: state.connectionStatus,
  error: state.lastError,
  reconnectAttempts: state.reconnectAttempts,
  lastConnectedAt: state.lastConnectedAt
}))

export const useMessageHandlers = (event?: string) => useWebSocketStore((state) => {
  if (event) {
    return state.messageHandlers.get(event) || []
  }
  return Array.from(state.messageHandlers.entries())
})

export const useWebSocketActions = () => useWebSocketStore((state) => ({
  connect: state.connect,
  disconnect: state.disconnect,
  reconnect: state.reconnect,
  on: state.on,
  off: state.off,
  emit: state.emit,
  addHandler: state.addHandler,
  removeHandler: state.removeHandler,
  clearHandlers: state.clearHandlers
}))

// WebSocket event types for type safety
export const WebSocketEvents = {
  // Order events
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_STATUS_CHANGED: 'order:status_changed',
  
  // Kitchen events
  KITCHEN_ORDER_ASSIGNED: 'kitchen:order_assigned',
  KITCHEN_TIMER_UPDATE: 'kitchen:timer_update',
  KITCHEN_STATUS_CHANGE: 'kitchen:status_change',
  
  // Notification events
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  
  // Staff events
  STAFF_STATUS_UPDATE: 'staff:status_update',
  SHIFT_CHANGE: 'shift:change',
  
  // System events
  SYSTEM_ALERT: 'system:alert',
  CONNECTION_TEST: 'connection:test'
} as const

export type WebSocketEvent = typeof WebSocketEvents[keyof typeof WebSocketEvents]