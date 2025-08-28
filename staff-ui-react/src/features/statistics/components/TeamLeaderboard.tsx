/**
 * TeamLeaderboard Component
 * 員工排行榜組件 - 顯示員工績效排名、統計數據
 */

import React, { useState, useMemo } from 'react';
import { StaffPerformance } from '../store/statisticsStore';
import { formatStatsData } from '../services/statisticsApi';
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Target,
  Clock,
  CheckCircle,
  Users,
  Crown,
  Zap,
  Heart,
  Filter,
  Search,
  MoreHorizontal,
  ShoppingBag
} from 'lucide-react';

interface TeamLeaderboardProps {
  leaderboard: Array<StaffPerformance & {
    change: number;
    previousRank: number;
    isRising: boolean;
    isFalling: boolean;
    isNew: boolean;
  }>;
  totalStaff: number;
  averagePerformance: number;
  loading?: boolean;
  className?: string;
  showFilters?: boolean;
  maxDisplay?: number;
  onStaffClick?: (staffId: string) => void;
  variant?: 'default' | 'compact' | 'detailed';
}

interface BadgeConfig {
  type: 'top_performer' | 'most_improved' | 'speed_demon' | 'quality_star';
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const BADGE_CONFIGS: Record<string, BadgeConfig> = {
  top_performer: {
    type: 'top_performer',
    label: '頂尖表現',
    icon: <Crown className="w-4 h-4" />,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
  },
  most_improved: {
    type: 'most_improved',
    label: '進步之星',
    icon: <Zap className="w-4 h-4" />,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  speed_demon: {
    type: 'speed_demon',
    label: '效率達人',
    icon: <Target className="w-4 h-4" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  quality_star: {
    type: 'quality_star',
    label: '品質之星',
    icon: <Heart className="w-4 h-4" />,
    color: 'text-pink-700',
    bgColor: 'bg-pink-100',
  },
};

const TeamLeaderboard: React.FC<TeamLeaderboardProps> = ({
  leaderboard,
  totalStaff,
  averagePerformance,
  loading = false,
  className = '',
  showFilters = true,
  maxDisplay = 10,
  onStaffClick,
  variant = 'default',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rank' | 'efficiency' | 'orders' | 'rating'>('rank');

  // 獲取排名圖標
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-500" />;
      default:
        return (
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-gray-600">{rank}</span>
          </div>
        );
    }
  };

  // 獲取排名變化圖標
  const getRankChangeIcon = (change: number, isNew: boolean) => {
    if (isNew) {
      return <Star className="w-4 h-4 text-blue-500" />;
    }
    if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    }
    if (change < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  // 獲取效率等級顏色
  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600 bg-green-50';
    if (efficiency >= 80) return 'text-blue-600 bg-blue-50';
    if (efficiency >= 70) return 'text-yellow-600 bg-yellow-50';
    if (efficiency >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  // 篩選和排序邏輯
  const filteredAndSortedLeaderboard = useMemo(() => {
    let filtered = leaderboard.filter(staff => {
      const matchesSearch = staff.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           staff.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = !departmentFilter || staff.position === departmentFilter;
      
      return matchesSearch && matchesDepartment;
    });

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'efficiency':
          return b.efficiency - a.efficiency;
        case 'orders':
          return b.ordersProcessed - a.ordersProcessed;
        case 'rating':
          return b.customerRating - a.customerRating;
        default:
          return a.rank - b.rank;
      }
    });

    return filtered.slice(0, maxDisplay);
  }, [leaderboard, searchTerm, departmentFilter, sortBy, maxDisplay]);

  // 獲取部門列表
  const departments = useMemo(() => {
    const depts = [...new Set(leaderboard.map(staff => staff.position))];
    return depts;
  }, [leaderboard]);

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {/* 標題區域 */}
      <div className="p-6 pb-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">團隊排行榜</h3>
              <p className="text-sm text-gray-500">
                共 {totalStaff} 名員工，平均績效 {averagePerformance.toFixed(1)} 分
              </p>
            </div>
          </div>

          {variant !== 'compact' && (
            <div className="flex items-center space-x-2">
              <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                顯示前 {maxDisplay} 名
              </div>
            </div>
          )}
        </div>

        {/* 篩選和搜尋區域 */}
        {showFilters && variant !== 'compact' && (
          <div className="mt-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            {/* 搜尋框 */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜尋員工姓名或職位..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 部門篩選 */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">所有部門</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* 排序選擇 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="rank">按排名</option>
              <option value="efficiency">按效率</option>
              <option value="orders">按訂單數</option>
              <option value="rating">按評分</option>
            </select>
          </div>
        )}
      </div>

      {/* 排行榜內容 */}
      <div className="p-6">
        {filteredAndSortedLeaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">暫無符合條件的員工資料</p>
            <p className="text-sm text-gray-400 mt-1">請調整搜尋條件或檢查數據</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedLeaderboard.map((staff, index) => (
              <div
                key={staff.staffId}
                onClick={() => onStaffClick?.(staff.staffId)}
                className={`flex items-center space-x-4 p-4 rounded-lg border transition-all ${
                  onStaffClick ? 'cursor-pointer hover:bg-gray-50 hover:shadow-sm' : ''
                } ${
                  staff.rank <= 3 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                    : 'bg-white border-gray-100'
                }`}
              >
                {/* 排名和變化 */}
                <div className="flex items-center space-x-2">
                  {getRankIcon(staff.rank)}
                  <div className="flex flex-col items-center">
                    {getRankChangeIcon(staff.change, staff.isNew)}
                    {!staff.isNew && staff.change !== 0 && (
                      <span className={`text-xs font-medium ${
                        staff.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {Math.abs(staff.change)}
                      </span>
                    )}
                  </div>
                </div>

                {/* 員工信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {staff.staffName}
                    </h4>
                    {staff.badge && (
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                        BADGE_CONFIGS[staff.badge]?.color
                      } ${BADGE_CONFIGS[staff.badge]?.bgColor}`}>
                        {BADGE_CONFIGS[staff.badge]?.icon}
                        <span>{BADGE_CONFIGS[staff.badge]?.label}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{staff.position}</p>
                  
                  {variant === 'detailed' && (
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <ShoppingBag className="w-3 h-3" />
                        <span>{staff.ordersProcessed} 單</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatStatsData.formatTime(staff.averageProcessingTime)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>{formatStatsData.formatPercentage(staff.completionRate)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 績效指標 */}
                <div className="flex items-center space-x-4">
                  {/* 效率分數 */}
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${getEfficiencyColor(staff.efficiency)}`}>
                    {staff.efficiency}
                  </div>

                  {/* 客戶評分 */}
                  {variant !== 'compact' && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-700">
                        {staff.customerRating.toFixed(1)}
                      </span>
                    </div>
                  )}

                  {/* 更多選項 */}
                  {onStaffClick && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStaffClick(staff.staffId);
                      }}
                      className="p-1 rounded hover:bg-gray-100 transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 統計摘要 */}
        {variant === 'detailed' && filteredAndSortedLeaderboard.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {filteredAndSortedLeaderboard.filter(s => s.efficiency >= 90).length}
                </p>
                <p className="text-sm text-blue-600">優秀表現 (≥90)</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {filteredAndSortedLeaderboard.filter(s => s.isRising).length}
                </p>
                <p className="text-sm text-green-600">排名上升</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {filteredAndSortedLeaderboard.filter(s => s.badge).length}
                </p>
                <p className="text-sm text-purple-600">獲得徽章</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {(filteredAndSortedLeaderboard.reduce((sum, s) => sum + s.efficiency, 0) / filteredAndSortedLeaderboard.length).toFixed(1)}
                </p>
                <p className="text-sm text-orange-600">平均效率</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamLeaderboard;