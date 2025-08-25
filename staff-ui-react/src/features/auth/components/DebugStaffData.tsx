import React from 'react';
import { useStaffAuth } from '../store/authStore';

/**
 * 調試組件 - 用於檢查員工數據結構
 */
export function DebugStaffData() {
  const { currentStaff, staffProfile, token, isAuthenticated } = useStaffAuth();

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs overflow-auto max-h-96 z-50">
      <h3 className="text-sm font-bold mb-2">Debug: Staff Data</h3>
      
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
      </div>
    </div>
  );
}

export default DebugStaffData;