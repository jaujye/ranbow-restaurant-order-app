/**
 * 🔄 QuickStaffSwitch Component
 * Display recent staff with avatar and enable quick switching with PIN verification
 */

import React, { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  Users, 
  ArrowRight, 
  Lock, 
  Crown, 
  ChefHat, 
  Coffee, 
  Calculator,
  AlertCircle,
  Loader2,
  CheckCircle2,
  User
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { useAuthStore, useAuthActions, useCurrentStaff } from '@/store/authStore'
import { quickSwitchSchema, type QuickSwitchFormData } from '@/lib/validations'
import type { StaffMember, StaffRole } from '@/types'

interface QuickStaffSwitchProps {
  onSuccess?: (newStaff: StaffMember) => void
  onError?: (error: string) => void
  className?: string
  maxStaff?: number
}

// Role configuration for icons and colors
const RoleConfig: Record<StaffRole, { icon: React.ComponentType<any>, color: string, label: string }> = {
  MANAGER: { icon: Crown, color: 'text-primary', label: '經理' },
  KITCHEN: { icon: ChefHat, color: 'text-secondary', label: '廚師' },
  SERVICE: { icon: Coffee, color: 'text-accent', label: '服務員' },
  CASHIER: { icon: Calculator, color: 'text-processing', label: '收銀員' }
}

const QuickStaffSwitch: React.FC<QuickStaffSwitchProps> = ({
  onSuccess,
  onError,
  className = '',
  maxStaff = 4
}) => {
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPinInput, setShowPinInput] = useState(false)

  const currentStaff = useCurrentStaff()
  const availableStaff = useAuthStore(state => state.availableStaff)
  const { quickSwitch } = useAuthActions()

  // PIN verification form
  const pinForm = useForm<{ pin: string }>({
    resolver: zodResolver(quickSwitchSchema.pick({ pin: true })),
    mode: 'onChange',
    defaultValues: { pin: '' }
  })

  // Load available staff for quick switch
  useEffect(() => {
    const loadQuickSwitchStaff = async () => {
      try {
        // TODO: Replace with actual API call
        const mockStaff: StaffMember[] = [
          {
            staffId: '2',
            employeeNumber: 'MGR001',
            name: '李經理',
            role: 'MANAGER',
            department: '管理部',
            avatar: '/avatars/manager.jpg',
            isActive: true,
            quickSwitchEnabled: true,
            permissions: ['*'],
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLoginAt: new Date()
          },
          {
            staffId: '3',
            employeeNumber: 'CHF001',
            name: '王主廚',
            role: 'KITCHEN',
            department: '廚房部',
            avatar: '/avatars/chef.jpg',
            isActive: true,
            quickSwitchEnabled: true,
            permissions: ['ORDER_VIEW', 'ORDER_UPDATE', 'KITCHEN_MANAGE'],
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLoginAt: new Date()
          },
          {
            staffId: '4',
            employeeNumber: 'SRV001',
            name: '陳服務員',
            role: 'SERVICE',
            department: '服務部',
            avatar: '/avatars/service.jpg',
            isActive: true,
            quickSwitchEnabled: true,
            permissions: ['ORDER_VIEW', 'ORDER_UPDATE'],
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLoginAt: new Date()
          },
          {
            staffId: '5',
            employeeNumber: 'CSH001',
            name: '張收銀員',
            role: 'CASHIER',
            department: '收銀部',
            avatar: '/avatars/cashier.jpg',
            isActive: true,
            quickSwitchEnabled: true,
            permissions: ['ORDER_VIEW', 'ORDER_UPDATE'],
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLoginAt: new Date()
          }
        ].filter(staff => staff.staffId !== currentStaff?.staffId)

        useAuthStore.getState().setAvailableStaff(mockStaff)
      } catch (error) {
        console.error('Failed to load quick switch staff:', error)
      }
    }

    if (currentStaff) {
      loadQuickSwitchStaff()
    }
  }, [currentStaff])

  // Handle staff selection
  const handleStaffSelect = useCallback((staff: StaffMember) => {
    setSelectedStaff(staff)
    setShowPinInput(true)
    pinForm.reset()
  }, [pinForm])

  // Handle PIN submission
  const handlePinSubmit = useCallback(async (data: { pin: string }) => {
    if (!selectedStaff || !currentStaff) return

    setIsLoading(true)
    try {
      const success = await quickSwitch({
        currentStaffId: currentStaff.staffId,
        targetStaffId: selectedStaff.staffId,
        pin: data.pin
      })

      if (success) {
        onSuccess?.(selectedStaff)
        setShowPinInput(false)
        setSelectedStaff(null)
      } else {
        throw new Error('快速切換失敗')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '快速切換失敗'
      onError?.(message)
      pinForm.setError('pin', { message })
    } finally {
      setIsLoading(false)
    }
  }, [selectedStaff, currentStaff, quickSwitch, onSuccess, onError, pinForm])

  // Cancel PIN input
  const handleCancel = useCallback(() => {
    setShowPinInput(false)
    setSelectedStaff(null)
    pinForm.reset()
  }, [pinForm])

  // Get staff avatar with fallback
  const getStaffAvatar = useCallback((staff: StaffMember): string => {
    if (staff.avatar && staff.avatar !== '/avatars/default.jpg') {
      return staff.avatar
    }
    
    // Generate avatar based on role and name
    const colors = ['FF6B35', '2E8B57', 'FFD700', '007AFF', 'FF9500']
    const colorIndex = staff.staffId.charCodeAt(0) % colors.length
    const initials = staff.name.substring(0, 1)
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${colors[colorIndex]}&color=fff&size=64&bold=true`
  }, [])

  // Filter and limit staff list
  const displayStaff = availableStaff.slice(0, maxStaff)

  if (!currentStaff || displayStaff.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-staff bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-body-large font-semibold text-gray-800">
            快速切換員工
          </h3>
          <p className="text-caption text-gray-600">
            選擇員工並輸入PIN碼進行切換
          </p>
        </div>
      </div>

      {/* Staff Grid */}
      {!showPinInput && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {displayStaff.map((staff) => {
            const RoleIcon = RoleConfig[staff.role]?.icon || User
            const roleColor = RoleConfig[staff.role]?.color || 'text-gray-500'
            const roleLabel = RoleConfig[staff.role]?.label || staff.role

            return (
              <button
                key={staff.staffId}
                onClick={() => handleStaffSelect(staff)}
                className="group p-4 bg-white border border-gray-200 rounded-card hover:border-primary hover:shadow-card transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading}
              >
                {/* Avatar */}
                <div className="relative mb-3">
                  <img
                    src={getStaffAvatar(staff)}
                    alt={staff.name}
                    className="w-12 h-12 mx-auto rounded-full border-2 border-gray-200 group-hover:border-primary transition-colors"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = getStaffAvatar(staff)
                    }}
                  />
                  
                  {/* Role Badge */}
                  <div className={`absolute -bottom-1 -right-1 p-1 bg-white rounded-full border-2 border-gray-200 group-hover:border-primary transition-colors`}>
                    <RoleIcon className={`h-3 w-3 ${roleColor}`} />
                  </div>
                </div>

                {/* Staff Info */}
                <div className="text-center">
                  <p className="text-body font-medium text-gray-800 truncate">
                    {staff.name}
                  </p>
                  <p className="text-small text-gray-500 truncate">
                    {staff.employeeNumber}
                  </p>
                  <p className="text-small text-gray-400 truncate">
                    {roleLabel}
                  </p>
                </div>

                {/* Switch Arrow */}
                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="h-4 w-4 mx-auto text-primary" />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* PIN Input Modal */}
      {showPinInput && selectedStaff && (
        <Card className="p-6 bg-gray-50 border-2 border-primary/20">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-4 mb-3">
              {/* Current Staff */}
              <div className="text-center">
                <img
                  src={getStaffAvatar(currentStaff)}
                  alt={currentStaff.name}
                  className="w-12 h-12 mx-auto rounded-full border-2 border-gray-300"
                />
                <p className="text-small text-gray-600 mt-1">{currentStaff.name}</p>
              </div>

              {/* Arrow */}
              <ArrowRight className="h-6 w-6 text-primary animate-pulse" />

              {/* Target Staff */}
              <div className="text-center">
                <img
                  src={getStaffAvatar(selectedStaff)}
                  alt={selectedStaff.name}
                  className="w-12 h-12 mx-auto rounded-full border-2 border-primary"
                />
                <p className="text-small text-primary font-medium mt-1">{selectedStaff.name}</p>
              </div>
            </div>

            <p className="text-body text-gray-700">
              切換到 <span className="font-semibold text-primary">{selectedStaff.name}</span>
            </p>
            <p className="text-caption text-gray-500">
              請輸入 {selectedStaff.name} 的PIN碼
            </p>
          </div>

          {/* PIN Form */}
          <form onSubmit={pinForm.handleSubmit(handlePinSubmit)} className="space-y-4">
            <div>
              <input
                {...pinForm.register('pin')}
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="••••••"
                className={`w-full px-4 py-3 border rounded-staff focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-center text-h3 tracking-widest ${
                  pinForm.formState.errors.pin ? 'border-error' : 'border-gray-300'
                }`}
                autoComplete="off"
                autoFocus
                disabled={isLoading}
              />
              {pinForm.formState.errors.pin && (
                <div className="flex items-center gap-2 mt-2 text-small text-error">
                  <AlertCircle className="h-4 w-4" />
                  {pinForm.formState.errors.pin.message}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={!pinForm.formState.isValid || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    切換中...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    確認切換
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* No Staff Available */}
      {displayStaff.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-body">目前沒有可切換的員工</p>
          <p className="text-caption">請聯繫管理員設置快速切換權限</p>
        </div>
      )}
    </div>
  )
}

export default QuickStaffSwitch