import React, { useState } from 'react'
import ApiTester from '@/components/dev/ApiTester'
import { apiUrlManager } from '@/services/api/client'

interface DevToolsProps {}

const DevTools: React.FC<DevToolsProps> = () => {
  const [showApiTester, setShowApiTester] = useState(true)
  const [logs, setLogs] = useState<string[]>([])

  // 添加日誌記錄
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]) // 保留最新50條
  }

  // 清除日誌
  const clearLogs = () => {
    setLogs([])
  }

  // 執行常用開發者命令
  const executeDevCommand = async (command: string) => {
    addLog(`執行命令: ${command}`)
    
    try {
      switch (command) {
        case 'testConnection':
          const result = await apiUrlManager.testConnection()
          addLog(`連接測試: ${result.message}`)
          break
        case 'getCurrentUrl':
          const url = apiUrlManager.getCurrentUrl()
          addLog(`當前 API URL: ${url}`)
          break
        case 'getEnvs':
          const envs = apiUrlManager.getAvailableEnvironments()
          addLog(`可用環境: ${Object.keys(envs).join(', ')}`)
          break
        case 'clearStorage':
          localStorage.clear()
          sessionStorage.clear()
          addLog('已清除所有本地存儲')
          break
        case 'reloadPage':
          window.location.reload()
          break
        default:
          addLog(`未知命令: ${command}`)
      }
    } catch (error: any) {
      addLog(`命令執行失敗: ${error.message}`)
    }
  }

  return (
    <div className="dev-tools min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 頁面標題 */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🛠️ 開發者工具面板
          </h1>
          <p className="text-gray-600">
            React 前端開發測試與除錯工具集
          </p>
        </div>

        {/* 工具導航 */}
        <div className="mb-6 flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setShowApiTester(true)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showApiTester
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            🔌 API 測試器
          </button>
          <button
            onClick={() => setShowApiTester(false)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              !showApiTester
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            📝 系統日誌
          </button>
        </div>

        {/* 工具內容區域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主要工具區域 */}
          <div className="lg:col-span-2">
            {showApiTester ? (
              <ApiTester />
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">📝 系統日誌</h2>
                  <button
                    onClick={clearLogs}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    清除日誌
                  </button>
                </div>
                
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
                  {logs.length === 0 ? (
                    <div className="text-gray-500">暫無日誌記錄...</div>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="mb-1">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 快捷操作側邊欄 */}
          <div className="space-y-6">
            {/* 快捷命令 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">⚡ 快捷命令</h3>
              <div className="space-y-2">
                <button
                  onClick={() => executeDevCommand('testConnection')}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  測試 API 連接
                </button>
                <button
                  onClick={() => executeDevCommand('getCurrentUrl')}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  查看當前 URL
                </button>
                <button
                  onClick={() => executeDevCommand('getEnvs')}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                >
                  列出可用環境
                </button>
                <button
                  onClick={() => executeDevCommand('clearStorage')}
                  className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                >
                  清除本地存儲
                </button>
                <button
                  onClick={() => executeDevCommand('reloadPage')}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  重新載入頁面
                </button>
              </div>
            </div>

            {/* 環境資訊 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📊 環境資訊</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-600">React 模式:</span>
                  <span className="ml-2 text-blue-600">
                    {import.meta.env.MODE}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">開發模式:</span>
                  <span className="ml-2 text-blue-600">
                    {import.meta.env.DEV ? '是' : '否'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">生產模式:</span>
                  <span className="ml-2 text-blue-600">
                    {import.meta.env.PROD ? '是' : '否'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Node 環境:</span>
                  <span className="ml-2 text-blue-600">
                    {process.env.NODE_ENV}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">當前時間:</span>
                  <span className="ml-2 text-blue-600">
                    {new Date().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* 快速導航 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🧭 快速導航</h3>
              <div className="space-y-2">
                <a
                  href="/"
                  className="block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  🏠 回到首頁
                </a>
                <a
                  href="/menu"
                  className="block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  📋 菜單頁面
                </a>
                <a
                  href="/cart"
                  className="block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  🛒 購物車
                </a>
                <a
                  href="/profile"
                  className="block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  👤 個人資料
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 頁面底部說明 */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            💡 這個頁面僅在開發環境中可用，用於測試和除錯 React 前端應用
          </p>
          <p className="mt-1">
            使用瀏覽器開發者工具的 Console 可以查看更詳細的日誌訊息
          </p>
        </div>
      </div>
    </div>
  )
}

export default DevTools