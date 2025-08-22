import { useState, useCallback } from 'react'

export interface AlertOptions {
  title?: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  confirmText?: string
}

export interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'info' | 'warning' | 'error'
}

export const useDialog = () => {
  const [alertState, setAlertState] = useState<{
    isOpen: boolean
    options: AlertOptions
  }>({
    isOpen: false,
    options: { message: '' }
  })

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    options: ConfirmOptions
    onConfirm?: () => void
  }>({
    isOpen: false,
    options: { message: '' }
  })

  // Alert 對話框
  const showAlert = useCallback((options: AlertOptions) => {
    setAlertState({
      isOpen: true,
      options
    })
  }, [])

  const closeAlert = useCallback(() => {
    setAlertState(prev => ({
      ...prev,
      isOpen: false
    }))
  }, [])

  // Confirm 對話框
  const showConfirm = useCallback((options: ConfirmOptions, onConfirm: () => void) => {
    setConfirmState({
      isOpen: true,
      options,
      onConfirm
    })
  }, [])

  const closeConfirm = useCallback(() => {
    setConfirmState(prev => ({
      ...prev,
      isOpen: false
    }))
  }, [])

  // 便利方法 - 替換 alert()
  const alert = useCallback((message: string, type: AlertOptions['type'] = 'info') => {
    showAlert({ message, type })
  }, [showAlert])

  // 便利方法 - 成功訊息
  const success = useCallback((message: string) => {
    showAlert({ message, type: 'success' })
  }, [showAlert])

  // 便利方法 - 錯誤訊息
  const error = useCallback((message: string) => {
    showAlert({ message, type: 'error' })
  }, [showAlert])

  // 便利方法 - 警告訊息
  const warning = useCallback((message: string) => {
    showAlert({ message, type: 'warning' })
  }, [showAlert])

  // 便利方法 - 確認對話框
  const confirm = useCallback((message: string, onConfirm: () => void, type: ConfirmOptions['type'] = 'info') => {
    showConfirm({ message, type }, onConfirm)
  }, [showConfirm])

  return {
    // Alert state
    alertState,
    showAlert,
    closeAlert,
    
    // Confirm state
    confirmState,
    showConfirm,
    closeConfirm,
    
    // 便利方法
    alert,
    success,
    error,
    warning,
    confirm
  }
}

export default useDialog