import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Clock, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { LoginForm } from '../components/LoginForm';
import { useStaffAuth } from '../store/authStore';
import { LoginStatsApi, type LoginSystemStats } from '../services/loginStatsApi';

/**
 * 功能特色項目
 */
interface FeatureItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
}

function FeatureItem({ icon: Icon, title, description, color }: FeatureItemProps) {
  return (
    <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className={`p-2 rounded-full ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/**
 * LoginPage Props
 */
interface LoginPageProps {
  redirectTo?: string;
}

/**
 * 系統統計卡片組件
 */
function SystemStatsCard() {
  const [stats, setStats] = useState<LoginSystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await LoginStatsApi.getLoginSystemStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load system stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    
    // 每分鐘更新一次統計數據
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">系統概況</h3>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="text-center animate-pulse">
              <div className="h-6 bg-gray-200 rounded mx-auto mb-2 w-12"></div>
              <div className="h-3 bg-gray-200 rounded mx-auto w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">系統概況</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {stats?.systemUptime || '24/7'}
          </p>
          <p className="text-xs text-gray-600 mt-1">全天候服務</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {stats?.activeStaff || 0}+
          </p>
          <p className="text-xs text-gray-600 mt-1">員工使用</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            {stats?.systemReliability || '99.9%'}
          </p>
          <p className="text-xs text-gray-600 mt-1">系統穩定性</p>
        </div>
      </div>
      {stats?.dailyOrders !== undefined && stats.dailyOrders > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-lg font-semibold text-green-600">{stats.dailyOrders}</p>
            <p className="text-xs text-gray-600">今日處理訂單</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 員工登入頁面
 * 
 * 特性：
 * - 品牌化設計
 * - 響應式佈局
 * - 功能特色展示
 * - 自動重定向
 * - 錯誤處理
 * - 彩虹主題設計
 */
export function LoginPage({ redirectTo = '/dashboard' }: LoginPageProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useStaffAuth();

  /**
   * 如果已經登入，自動重定向
   */
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  /**
   * 處理登入成功
   */
  const handleLoginSuccess = () => {
    navigate(redirectTo, { replace: true });
  };

  /**
   * 處理登入錯誤
   */
  const handleLoginError = (error: string) => {
    console.error('Login error:', error);
  };

  /**
   * 返回主頁
   */
  const handleGoBack = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* 主要內容 */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              
              {/* 左側 - 功能介紹 */}
              <div className="space-y-6 lg:pr-8">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                    歡迎使用
                    <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      彩虹餐廳員工作業系統
                    </span>
                  </h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    專為彩虹餐廳員工打造的現代化工作平台，提供高效的訂單管理、廚房作業和團隊協作功能。
                  </p>
                </div>

                {/* 功能特色 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FeatureItem
                    icon={Clock}
                    title="即時訂單管理"
                    description="實時接收和處理訂單，自動狀態同步，提升服務效率"
                    color="bg-blue-100 text-blue-600"
                  />
                  <FeatureItem
                    icon={Users}
                    title="團隊協作"
                    description="員工快速切換，權限管理，無縫團隊協作體驗"
                    color="bg-purple-100 text-purple-600"
                  />
                  <FeatureItem
                    icon={TrendingUp}
                    title="績效統計"
                    description="個人績效追蹤，即時數據分析，助力個人成長"
                    color="bg-green-100 text-green-600"
                  />
                  <FeatureItem
                    icon={Shield}
                    title="安全可靠"
                    description="多層安全防護，數據加密傳輸，保障系統安全"
                    color="bg-orange-100 text-orange-600"
                  />
                </div>

              </div>

              {/* 右側 - 登入表單 */}
              <div className="w-full">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                  <LoginForm
                    onSuccess={handleLoginSuccess}
                    onError={handleLoginError}
                    className="w-full"
                    showTitle={false}
                    autoFocus={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* 底部資訊 */}
        <footer className="p-4 sm:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
              <p className="text-sm text-gray-500">
                © 2024 彩虹餐廳. 保留所有權利.
              </p>
              <div className="flex items-center space-x-5 text-sm text-gray-500">
                <a href="#" className="hover:text-gray-700 transition-colors">
                  使用條款
                </a>
                <a href="#" className="hover:text-gray-700 transition-colors">
                  隱私政策
                </a>
                <a href="#" className="hover:text-gray-700 transition-colors">
                  技術支援
                </a>
              </div>
            </div>
            
            {/* 版本資訊 */}
            <div className="mt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                <p className="text-xs text-gray-400">
                  員工作業系統 v2.0.0 • React + TypeScript
                </p>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-400">系統運行正常</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LoginPage;