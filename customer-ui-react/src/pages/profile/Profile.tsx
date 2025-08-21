import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input } from '@/components/ui'
import { useAuth, useAuthActions, useGlobalReset } from '@/store'
import { User, ProfileService, UpdateProfileRequest, ChangePasswordRequest } from '@/services/api'
import { 
  ArrowLeft, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Lock, 
  Edit3, 
  Save, 
  X,
  Shield,
  Bell,
  Moon,
  Globe,
  CreditCard,
  MapPin,
  LogOut,
  Trash2
} from 'lucide-react'

const Profile: React.FC = () => {
  const navigate = useNavigate()
  const { user, isLoading } = useAuth()
  const { updateProfile, logout, clearError } = useAuthActions()
  const globalReset = useGlobalReset()

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<User>>({})
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isSaving, setIsSaving] = useState(false)

  // Settings
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: 'zh-TW',
    orderUpdates: true,
    promotions: true
  })

  const handleEditProfile = () => {
    setIsEditing(true)
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    })
    clearError()
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditForm({})
    clearError()
  }

  const handleSaveProfile = async () => {
    if (!editForm.name?.trim() || !editForm.email?.trim() || !editForm.phone?.trim()) {
      alert('請填寫完整的個人資料')
      return
    }

    setIsSaving(true)
    try {
      // Use ProfileService for updating profile
      const updateData: UpdateProfileRequest = {
        username: editForm.name,
        phoneNumber: editForm.phone
        // Note: email changes might require special handling/verification
      }
      
      const response = await ProfileService.updateCurrentUserProfile(updateData)
      if (response.success) {
        // Update local store with new data
        const success = await updateProfile(editForm)
        setIsEditing(false)
        setEditForm({})
        alert('個人資料已更新')
      } else {
        alert(`更新失敗: ${response.error || '請重試'}`)
      }
    } catch (error: any) {
      alert(`更新失敗: ${error.message || '請重試'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = () => {
    setIsChangingPassword(true)
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  const handleSavePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('請填寫完整的密碼資料')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('新密碼與確認密碼不一致')
      return
    }

    if (newPassword.length < 6) {
      alert('新密碼至少需要6個字符')
      return
    }

    setIsSaving(true)
    try {
      // Use ProfileService for changing password
      const passwordData: ChangePasswordRequest = {
        currentPassword,
        newPassword
      }
      
      const response = await ProfileService.changeCurrentUserPassword(passwordData)
      if (response.success) {
        setIsChangingPassword(false)
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        alert('密碼已成功更新')
      } else {
        alert(`密碼更新失敗: ${response.error || '請重試'}`)
      }
    } catch (error: any) {
      alert(`密碼更新失敗: ${error.message || '請重試'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    if (window.confirm('確定要登出嗎？')) {
      await globalReset()
      navigate('/login')
    }
  }

  const handleDeleteAccount = () => {
    if (window.confirm('確定要刪除帳號嗎？此操作無法復原。')) {
      alert('帳號刪除功能開發中...')
    }
  }

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'CUSTOMER': '顧客',
      'STAFF': '員工',
      'ADMIN': '管理員'
    }
    return roleMap[role] || role
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-8">
          <p className="text-text-secondary">請先登入</p>
          <Button onClick={() => navigate('/login')} className="mt-4">
            前往登入
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="p-2"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">個人資料</h1>
          <p className="text-text-secondary text-sm">
            管理您的帳號設定和偏好
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                基本資料
              </h2>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditProfile}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  編輯
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">姓名</label>
                  <Input
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="請輸入您的姓名"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="請輸入您的Email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">手機號碼</label>
                  <Input
                    type="tel"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="請輸入您的手機號碼"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? '儲存中...' : '儲存'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-5 h-5 text-text-secondary" />
                  <div>
                    <p className="text-sm text-text-secondary">姓名</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-text-secondary" />
                  <div>
                    <p className="text-sm text-text-secondary">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-text-secondary" />
                  <div>
                    <p className="text-sm text-text-secondary">手機號碼</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-text-secondary" />
                  <div>
                    <p className="text-sm text-text-secondary">帳號類型</p>
                    <p className="font-medium">{getRoleDisplayName(user.role)}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Security Settings */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              安全設定
            </h2>

            {isChangingPassword ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">目前密碼</label>
                  <Input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="請輸入目前密碼"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">新密碼</label>
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="請輸入新密碼（至少6個字符）"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">確認新密碼</label>
                  <Input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="請再次輸入新密碼"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSavePassword}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? '更新中...' : '更新密碼'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setIsChangingPassword(false)}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">密碼</p>
                    <p className="text-text-secondary text-sm">上次更新：2024年8月</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleChangePassword}
                  >
                    修改密碼
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* App Settings */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              應用設定
            </h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">通知設定</p>
                  <p className="text-text-secondary text-sm">接收應用通知和訂單更新</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">深色模式</p>
                  <p className="text-text-secondary text-sm">切換應用外觀主題</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.darkMode}
                    onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">訂單更新</p>
                  <p className="text-text-secondary text-sm">接收訂單狀態變更通知</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.orderUpdates}
                    onChange={(e) => setSettings({ ...settings, orderUpdates: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">促銷通知</p>
                  <p className="text-text-secondary text-sm">接收優惠活動和促銷資訊</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.promotions}
                    onChange={(e) => setSettings({ ...settings, promotions: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-text-secondary" />
                  <div>
                    <p className="font-medium">語言</p>
                    <p className="text-text-secondary text-sm">選擇應用語言</p>
                  </div>
                </div>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="border border-border-default rounded-lg px-3 py-2 text-sm"
                >
                  <option value="zh-TW">繁體中文</option>
                  <option value="zh-CN">简体中文</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">快捷操作</h2>
              
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/orders')}
                  className="w-full justify-start flex items-center gap-3"
                >
                  <MapPin className="w-4 h-4" />
                  我的訂單
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => alert('付款方式管理功能開發中...')}
                  className="w-full justify-start flex items-center gap-3"
                >
                  <CreditCard className="w-4 h-4" />
                  付款方式
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => alert('地址管理功能開發中...')}
                  className="w-full justify-start flex items-center gap-3"
                >
                  <MapPin className="w-4 h-4" />
                  常用地址
                </Button>
              </div>
            </Card>

            {/* Account Actions */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">帳號管理</h2>
              
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start flex items-center gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  登出
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={handleDeleteAccount}
                  className="w-full justify-start flex items-center gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  刪除帳號
                </Button>
              </div>
            </Card>

            {/* App Info */}
            <Card className="p-6 bg-background-light">
              <div className="text-center">
                <div className="text-4xl mb-3">🌈</div>
                <h3 className="font-semibold mb-2">Ranbow Restaurant</h3>
                <p className="text-text-secondary text-sm mb-4">
                  版本 1.0.0
                </p>
                <div className="text-xs text-text-secondary space-y-1">
                  <p>© 2024 Ranbow Restaurant</p>
                  <p>享受美味，享受生活</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile