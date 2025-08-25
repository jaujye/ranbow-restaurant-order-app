import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  ClipboardList, 
  ChefHat, 
  BarChart3, 
  Bell, 
  User, 
  LogOut,
  Settings,
  Shield
} from 'lucide-react';
import { useStaffAuth, useStaffAuthActions } from '@/features/auth/store/authStore';

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
    href: '/statistics-demo',
    icon: BarChart3,
    description: '績效統計'
  },
  {
    name: '通知',
    href: '/notifications',
    icon: Bell,
    description: '系統通知',
    badge: true
  },
  {
    name: '個人',
    href: '/profile',
    icon: User,
    description: '個人資料'
  }
];

/**
 * 頂部導航欄組件
 */
export function TopNavigationBar() {
  const { currentStaff, isManager } = useStaffAuth();
  const { logout } = useStaffAuthActions();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 左側 Logo 和標題 */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-white">彩虹餐廳</h1>
                <p className="text-xs text-white/80">員工作業系統</p>
              </div>
            </div>
          </div>

          {/* 右側用戶信息和操作 */}
          <div className="flex items-center space-x-4">
            {/* 用戶信息 */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{currentStaff?.name}</p>
                <p className="text-xs text-white/80">{currentStaff?.position}</p>
              </div>
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                <span className="text-sm font-medium text-white">
                  {currentStaff?.name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>


            {/* 設置和登出 */}
            <div className="flex items-center space-x-2">
              {isManager && (
                <Link
                  to="/settings"
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                  title="系統設置"
                >
                  <Settings className="h-5 w-5" />
                </Link>
              )}
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm border border-white/20"
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 backdrop-blur-md px-2 py-2 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center space-x-2 sm:space-x-4 lg:space-x-8">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href || 
                           (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center space-y-1 px-1 sm:px-2 lg:px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'text-white bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg scale-105'
                    : 'text-white/80 hover:text-white hover:bg-white/10 hover:scale-102'
                }`}
                title={item.description}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 bg-yellow-400 rounded-full animate-pulse border border-white"></span>
                  )}
                </div>
                <span className="text-xs font-medium hidden sm:inline">{item.name}</span>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* 頂部導航 */}
      <TopNavigationBar />
      
      {/* 主內容區域 - 添加上下padding以避免被固定導航遮擋 */}
      <main className="pt-16 pb-20 min-h-screen overflow-y-auto transition-all duration-500 ease-in-out">
        <div className="animate-in slide-in-from-bottom-4 duration-700 ease-out">
          {children}
        </div>
      </main>
      
      {/* 底部導航 */}
      <BottomNavigationBar />
    </div>
  );
}

export default StaffNavigation;