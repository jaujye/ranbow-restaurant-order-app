import React, { useState, useEffect } from 'react';
import { useStaffAuth } from '../store/authStore';

/**
 * 調試組件 - 用於檢查員工數據結構
 * 智能顯示控制：可通過多種方式控制顯示/隱藏
 */
export function DebugStaffData() {
  const { currentStaff, staffProfile, token, isAuthenticated } = useStaffAuth();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // 檢查是否應該顯示調試組件的邏輯
    const checkShouldShow = () => {
      const debugSetting = localStorage.getItem('staff-ui-debug');
      const windowDebug = (window as any).__STAFF_UI_DEBUG__ === true;
      
      // 優先級：localStorage 設置 > 全局變數 > 開發環境默認
      if (debugSetting === 'false') {
        return false;
      } else if (debugSetting === 'true' || windowDebug) {
        return true;
      } else {
        // 在開發環境下默認顯示（但可以被 localStorage 覆蓋）
        return import.meta.env.DEV;
      }
    };
    
    setIsVisible(checkShouldShow());
  }, []);
  
  const handleClose = () => {
    localStorage.setItem('staff-ui-debug', 'false');
    setIsVisible(false);
    window.location.reload(); // 刷新頁面確保狀態重置
  };

  // 如果不應該顯示調試組件，返回 null
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs overflow-auto max-h-96 z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold">Debug: Staff Data</h3>
        <button 
          onClick={handleClose}
          className="text-white hover:text-red-400 ml-2"
          title="隱藏調試面板"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <strong>isAuthenticated:</strong> {isAuthenticated ? 'true' : 'false'}
        </div>
        
        <div>
          <strong>token:</strong> {token ? 'exists' : 'null'}
        </div>
        
        <div>
          <strong>currentStaff:</strong>
          {currentStaff ? (
            <pre className="mt-1 whitespace-pre-wrap break-all">
              {JSON.stringify(currentStaff, null, 2)}
            </pre>
          ) : (
            ' null'
          )}
        </div>
        
        <div>
          <strong>staffProfile:</strong>
          {staffProfile ? (
            <pre className="mt-1 whitespace-pre-wrap break-all">
              {JSON.stringify(staffProfile, null, 2)}
            </pre>
          ) : (
            ' null'
          )}
        </div>
        
        <div>
          <strong>localStorage staff_auth_token:</strong> {localStorage.getItem('staff_auth_token') ? 'exists' : 'null'}
        </div>
        
        <div>
          <strong>localStorage staff-auth-store:</strong>
          <pre className="mt-1 whitespace-pre-wrap break-all">
            {localStorage.getItem('staff-auth-store') || 'null'}
          </pre>
        </div>
        
        <div className="mt-4 pt-2 border-t border-gray-600 text-xs text-gray-300">
          <p>控制台命令:</p>
          <p>• <code>localStorage.setItem('staff-ui-debug', 'true')</code> - 顯示</p>
          <p>• <code>localStorage.setItem('staff-ui-debug', 'false')</code> - 隱藏</p>
        </div>
      </div>
    </div>
  );
}

// 在開發環境下，為控制台提供便捷的調試控制函數
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).showStaffDebug = () => {
    localStorage.setItem('staff-ui-debug', 'true');
    console.log('員工調試面板已啟用，正在刷新頁面...');
    setTimeout(() => window.location.reload(), 100);
  };
  
  (window as any).hideStaffDebug = () => {
    localStorage.setItem('staff-ui-debug', 'false');
    console.log('員工調試面板已隱藏，正在刷新頁面...');
    setTimeout(() => window.location.reload(), 100);
  };
  
  // 添加狀態檢查函數
  (window as any).checkStaffDebug = () => {
    const setting = localStorage.getItem('staff-ui-debug');
    console.log('當前調試面板狀態:', setting || '默認(開發環境顯示)');
    console.log('可用命令: showStaffDebug(), hideStaffDebug(), checkStaffDebug()');
  };
}

export default DebugStaffData;