/**
 * Statistics Test Page
 * 統計功能測試頁面 - 測試API整合和組件展示
 */

import React, { useEffect, useState } from 'react';
import { DailyStatsCard } from '../components';
import { useStaffStats } from '../hooks';
import { StatisticsApiService } from '../services/statisticsApi';
import { DailyStats } from '../store/statisticsStore';
import { RefreshCcw, Users, Activity } from 'lucide-react';

const StatsTestPage: React.FC = () => {
  // 測試用的員工ID - 使用資料庫中的現有員工
  const testStaffIds = [
    '21426ec6-dae4-4a82-b52a-a24f85434c2b', // ST002 Manager
    '1ef8a5d2-d7ed-48f2-9de2-7ccbaf58f64f', // ST001 Chef
  ];

  const [selectedStaffId, setSelectedStaffId] = useState(testStaffIds[0]);
  const [manualStats, setManualStats] = useState<DailyStats | null>(null);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  // 使用Hook測試
  const {
    getTodayStats,
    loading: hookLoading,
    error: hookError,
    refreshStats,
    lastUpdated,
  } = useStaffStats({
    staffId: selectedStaffId,
    autoRefresh: false,
  });

  const todayStats = getTodayStats();

  // 手動API測試
  const loadManualStats = async () => {
    setManualLoading(true);
    setManualError(null);
    
    try {
      const stats = await StatisticsApiService.getDailyStats(selectedStaffId);
      setManualStats(stats);
    } catch (error) {
      setManualError(error instanceof Error ? error.message : '載入失敗');
      console.error('Manual API test failed:', error);
    } finally {
      setManualLoading(false);
    }
  };

  // 初始載入
  useEffect(() => {
    loadManualStats();
  }, [selectedStaffId]);

  // 取得員工資訊
  const getStaffInfo = (staffId: string) => {
    switch (staffId) {
      case '21426ec6-dae4-4a82-b52a-a24f85434c2b':
        return { name: 'ST002 管理員', department: '管理', position: 'Manager' };
      case '1ef8a5d2-d7ed-48f2-9de2-7ccbaf58f64f':
        return { name: 'ST001 廚師長', department: '廚房', position: 'Chef' };
      default:
        return { name: '未知員工', department: '未知', position: 'Unknown' };
    }
  };

  const staffInfo = getStaffInfo(selectedStaffId);

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* 頁面標題 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">統計系統API測試</h1>
                <p className="text-gray-600">測試統計報表模組與後端API整合</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={refreshStats}
                disabled={hookLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                <RefreshCcw className={`w-4 h-4 ${hookLoading ? 'animate-spin' : ''}`} />
                <span>刷新Hook數據</span>
              </button>
              
              <button
                onClick={loadManualStats}
                disabled={manualLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                <RefreshCcw className={`w-4 h-4 ${manualLoading ? 'animate-spin' : ''}`} />
                <span>手動API測試</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 員工選擇器 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <Users className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">選擇測試員工</h3>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {testStaffIds.map((staffId) => {
              const info = getStaffInfo(staffId);
              return (
                <div
                  key={staffId}
                  onClick={() => setSelectedStaffId(staffId)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedStaffId === staffId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{info.name}</div>
                  <div className="text-sm text-gray-600">{info.department} - {info.position}</div>
                  <div className="text-xs text-gray-500 mt-1">ID: {staffId.slice(0, 8)}...</div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900">當前選擇員工資訊</h4>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <div><span className="font-medium">姓名:</span> {staffInfo.name}</div>
              <div><span className="font-medium">部門:</span> {staffInfo.department}</div>
              <div><span className="font-medium">職位:</span> {staffInfo.position}</div>
              <div><span className="font-medium">員工ID:</span> {selectedStaffId}</div>
            </div>
          </div>
        </div>
      </div>

      {/* API測試結果 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hook測試 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Hook測試 (useStaffStats)</h3>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <div>狀態: {hookLoading ? '載入中...' : '完成'}</div>
              {hookError && <div className="text-red-600">錯誤: {hookError}</div>}
              {lastUpdated && <div>最後更新: {new Date(lastUpdated).toLocaleString('zh-TW')}</div>}
              <div>數據狀態: {todayStats ? '有數據' : '無數據'}</div>
            </div>
          </div>
          
          <div className="p-6">
            <DailyStatsCard
              stats={todayStats}
              loading={hookLoading}
              variant="detailed"
              showComparison={true}
            />
          </div>
        </div>

        {/* 手動API測試 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">手動API測試</h3>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <div>狀態: {manualLoading ? '載入中...' : '完成'}</div>
              {manualError && <div className="text-red-600">錯誤: {manualError}</div>}
              <div>數據狀態: {manualStats ? '有數據' : '無數據'}</div>
            </div>
          </div>
          
          <div className="p-6">
            <DailyStatsCard
              stats={manualStats}
              loading={manualLoading}
              variant="detailed"
              showComparison={true}
            />
          </div>
        </div>
      </div>

      {/* API響應原始數據 */}
      {manualStats && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">API響應原始數據</h3>
          </div>
          
          <div className="p-6">
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
              {JSON.stringify(manualStats, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* 使用說明 */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">🧪 測試說明</h3>
          <div className="space-y-2 text-blue-800">
            <div>• <span className="font-medium">Hook測試:</span> 使用 useStaffStats Hook 自動載入和管理狀態</div>
            <div>• <span className="font-medium">手動API測試:</span> 直接調用 StatisticsApiService API</div>
            <div>• <span className="font-medium">員工選擇:</span> 測試不同員工的統計數據</div>
            <div>• <span className="font-medium">組件展示:</span> DailyStatsCard 組件在詳細模式下的展示</div>
          </div>
          
          <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900">✅ 測試檢查清單</h4>
            <div className="mt-2 space-y-1 text-sm text-blue-800">
              <div>□ API 請求成功回應</div>
              <div>□ 數據格式正確對應組件</div>
              <div>□ 載入狀態正常顯示</div>
              <div>□ 錯誤處理機制運作</div>
              <div>□ 組件渲染無問題</div>
              <div>□ 響應式設計適配</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsTestPage;