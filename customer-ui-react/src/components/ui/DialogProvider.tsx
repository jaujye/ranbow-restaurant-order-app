import React, { createContext, useContext } from 'react'
import { AlertDialog, ConfirmDialog } from './Dialog'
import { useDialog, AlertOptions, ConfirmOptions } from '@/hooks/useDialog'

interface DialogContextType {
  alert: (message: string, type?: AlertOptions['type']) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  confirm: (message: string, onConfirm: () => void, type?: ConfirmOptions['type']) => void
  showAlert: (options: AlertOptions) => void
  showConfirm: (options: ConfirmOptions, onConfirm: () => void) => void
}

const DialogContext = createContext<DialogContextType | null>(null)

export const useDialogContext = () => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('useDialogContext must be used within a DialogProvider')
  }
  return context
}

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    alertState,
    closeAlert,
    confirmState,
    closeConfirm,
    alert,
    success,
    error,
    warning,
    confirm,
    showAlert,
    showConfirm
  } = useDialog()

  const contextValue: DialogContextType = {
    alert,
    success,
    error,
    warning,
    confirm,
    showAlert,
    showConfirm
  }

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      
      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.options.title}
        message={alertState.options.message}
        type={alertState.options.type}
        confirmText={alertState.options.confirmText}
      />
      
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm || (() => {})}
        title={confirmState.options.title}
        message={confirmState.options.message}
        confirmText={confirmState.options.confirmText}
        cancelText={confirmState.options.cancelText}
        type={confirmState.options.type}
      />
    </DialogContext.Provider>
  )
}

export default DialogProvider