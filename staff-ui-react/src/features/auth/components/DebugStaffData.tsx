import React from 'react';
import { useStaffAuth } from '../store/authStore';

/**
 * 調試組件 - 用於檢查員工數據結構
 * 只在開發環境或啟用調試模式時顯示
 */
export function DebugStaffData() {
  const { currentStaff, staffProfile, token, isAuthenticated } = useStaffAuth();
  
  // 檢查是否應該顯示調試組件
  const shouldShowDebug = import.meta.env.DEV || 
                         localStorage.getItem('staff-ui-debug') === 'true' ||
                         (window as any).__STAFF_UI_DEBUG__ === true;

  // 如果不應該顯示調試組件，返回 null
  if (!shouldShowDebug) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs overflow-auto max-h-96 z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold">Debug: Staff Data</h3>
        <button 
          onClick={() => localStorage.setItem('staff-ui-debug', 'false')}
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
    console.log('員工調試面板已啟用');
  };
  
  (window as any).hideStaffDebug = () => {
    localStorage.setItem('staff-ui-debug', 'false');
    console.log('員工調試面板已隱藏');
  };
}

export default DebugStaffData;