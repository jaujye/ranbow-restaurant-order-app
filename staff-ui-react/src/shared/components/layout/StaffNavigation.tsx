import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  ClipboardList, 
  ChefHat, 
  BarChart3, 
  Bell, 
  User, 
  LogOut,
  Users,
  Settings,
  Shield
} from 'lucide-react';
import { useStaffAuth, useStaffAuthActions } from '@/features/auth/store/authStore';
import { QuickSwitchPanel } from '@/features/auth/components/QuickSwitchPanel';

/**
 * 導航項目配置
 */
const navigationItems = [
  {
    name: '首頁',
    href: '/dashboard',
    icon: Home,
    description: '工作台概覽'
  },
  {
    name: '訂單',
    href: '/orders',
    icon: ClipboardList,
    description: '訂單管理'
  },
  {
    name: '廚房',
    href: '/kitchen',
    icon: ChefHat,
    description: '廚房作業'
  },
  {
    name: '報表',
    href: '/stats',
    icon: BarChart3,
    description: '績效統計'
  },
  {
    name: '通知',
    href: '/notifications',
    icon: Bell,
    description: '系統通知',
    badge: true
  }
];

/**
 * 頂部導航欄組件
 */
export function TopNavigationBar() {
  const { currentStaff, isManager } = useStaffAuth();
  const { logout } = useStaffAuthActions();
  const [showQuickSwitch, setShowQuickSwitch] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 左側 Logo 和標題 */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900">彩虹餐廳</h1>
                <p className="text-xs text-gray-500">員工作業系統</p>
              </div>
            </div>
          </div>

          {/* 右側用戶信息和操作 */}
          <div className="flex items-center space-x-4">
            {/* 用戶信息 */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentStaff?.name}</p>
                <p className="text-xs text-gray-500">{currentStaff?.position}</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {currentStaff?.name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>

            {/* 快速切換按鈕 */}
            <div className="relative">
              <button
                onClick={() => setShowQuickSwitch(!showQuickSwitch)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="快速切換員工"
              >
                <Users className="h-5 w-5" />
              </button>

              {/* 快速切換面板 */}
              {showQuickSwitch && (
                <div className="absolute right-0 mt-2 z-50">
                  <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                    <QuickSwitchPanel 
                      maxDisplay={5}
                      onSwitchSuccess={() => setShowQuickSwitch(false)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 設置和登出 */}
            <div className="flex items-center space-x-2">
              {isManager && (
                <Link
                  to="/settings"
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="系統設置"
                >
                  <Settings className="h-5 w-5" />
                </Link>
              )}
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="登出系統"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">登出</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * 底部導航欄組件
 */
export function BottomNavigationBar() {
  const location = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center space-x-8 lg:space-x-12">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href || 
                           (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title={item.description}
              >
                <div className="relative">
                  <item.icon className="h-6 w-6" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                  )}
                </div>
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

/**
 * 主導航組件 - 整合頂部和底部導航
 */
export function StaffNavigation({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <TopNavigationBar />
      
      {/* 主內容區域 - 添加上下padding以避免被固定導航遮擋 */}
      <main className="pt-16 pb-20 min-h-screen overflow-y-auto">
        {children}
      </main>
      
      {/* 底部導航 */}
      <BottomNavigationBar />
    </div>
  );
}

export default StaffNavigation;