import React, { useState, useEffect } from 'react'
import { apiUrlManager } from '@/services/api/client'

interface ApiTestResult {
  success: boolean
  url: string
  message: string
  timestamp?: string
}

const ApiTester: React.FC = () => {
  const [currentUrl, setCurrentUrl] = useState<string>('')
  const [customUrl, setCustomUrl] = useState<string>('')
  const [testResult, setTestResult] = useState<ApiTestResult | null>(null)
  const [isTesting, setIsTesting] = useState<boolean>(false)
  const [availableEnvs] = useState(apiUrlManager.getAvailableEnvironments())

  // 更新當前 URL 顯示
  const updateCurrentUrl = () => {
    setCurrentUrl(apiUrlManager.getCurrentUrl())
  }

  useEffect(() => {
    updateCurrentUrl()
  }, [])

  // 切換到預設環境
  const handleSwitchEnvironment = (env: string) => {
    apiUrlManager.switchToEnvironment(env as keyof typeof availableEnvs)
    updateCurrentUrl()
    setTestResult(null)
  }

  // 設置自定義 URL
  const handleSetCustomUrl = () => {
    if (customUrl.trim()) {
      apiUrlManager.setCustomUrl(customUrl.trim())
      updateCurrentUrl()
      setCustomUrl('')
      setTestResult(null)
    }
  }

  // 重置為預設
  const handleResetToDefault = () => {
    apiUrlManager.resetToDefault()
    updateCurrentUrl()
    setTestResult(null)
  }

  // 測試 API 連接
  const handleTestConnection = async () => {
    setIsTesting(true)
    try {
      const result = await apiUrlManager.testConnection()
      setTestResult({
        ...result,
        timestamp: new Date().toLocaleTimeString()
      })
    } catch (error: any) {
      setTestResult({
        success: false,
        url: currentUrl,
        message: `測試失敗: ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      })
    } finally {
      setIsTesting(false)
    }
  }

  // 執行快速 API 測試組合
  const handleQuickTests = async () => {
    setIsTesting(true)
    const tests = [
      { name: '健康檢查', endpoint: '/health' },
      { name: '菜單 API', endpoint: '/menu' },
      { name: '認證 API', endpoint: '/auth/check' }
    ]

    for (const test of tests) {
      try {
        const response = await fetch(`${currentUrl}${test.endpoint}`)
        console.log(`${test.name}: ${response.status} ${response.statusText}`)
      } catch (error) {
        console.error(`${test.name} 失敗:`, error)
      }
    }
    setIsTesting(false)
  }

  return (
    <div className="api-tester p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🛠️ API 環境測試工具</h2>
      
      {/* 當前 API URL 顯示 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          當前 API 位址:
        </label>
        <div className="text-lg font-mono text-blue-600 break-all">
          {currentUrl}
        </div>
      </div>

      {/* 預設環境切換 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          快速切換環境:
        </label>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(availableEnvs).map(([env, url]) => (
            <button
              key={env}
              onClick={() => handleSwitchEnvironment(env)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                currentUrl === url
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-sm font-medium">{env}</div>
              <div className="text-xs opacity-75 truncate">{url}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 自定義 URL 輸入 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          自定義 API 位址:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="例如: http://localhost:8080/api"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSetCustomUrl}
            disabled={!customUrl.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 transition-colors"
          >
            設置
          </button>
        </div>
      </div>

      {/* 控制按鈕 */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={handleTestConnection}
          disabled={isTesting}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors flex items-center gap-2"
        >
          {isTesting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              測試中...
            </>
          ) : (
            '🔌 測試連接'
          )}
        </button>
        
        <button
          onClick={handleQuickTests}
          disabled={isTesting}
          className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 transition-colors"
        >
          ⚡ 快速測試
        </button>
        
        <button
          onClick={handleResetToDefault}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          🔄 重置預設
        </button>
      </div>

      {/* 測試結果顯示 */}
      {testResult && (
        <div className={`p-4 rounded-lg ${
          testResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-lg ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {testResult.success ? '✅' : '❌'}
            </span>
            <span className="font-medium text-gray-800">連接測試結果</span>
            {testResult.timestamp && (
              <span className="text-sm text-gray-500">({testResult.timestamp})</span>
            )}
          </div>
          <div className="text-sm text-gray-600 mb-2">
            <strong>URL:</strong> {testResult.url}
          </div>
          <div className={`text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
            {testResult.message}
          </div>
        </div>
      )}

      {/* 使用說明 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-800 mb-2">💡 使用說明</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• <strong>預設環境</strong>: 點擊按鈕快速切換到常用環境</p>
          <p>• <strong>自定義 URL</strong>: 輸入任意 API 位址進行測試</p>
          <p>• <strong>測試連接</strong>: 檢查當前 API 位址的健康狀態</p>
          <p>• <strong>快速測試</strong>: 同時測試多個重要 API 端點</p>
          <p>• <strong>Console 查看</strong>: 打開瀏覽器開發者工具查看詳細日誌</p>
        </div>
      </div>

      {/* 開發者命令快捷方式 */}
      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
        <details>
          <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
            🔧 開發者命令 (點擊展開)
          </summary>
          <div className="text-xs font-mono text-gray-600 space-y-1">
            <div>
              <code>apiUrlManager.switchToEnvironment('local')</code> - 切換到本地環境
            </div>
            <div>
              <code>apiUrlManager.getCurrentUrl()</code> - 查看當前 URL
            </div>
            <div>
              <code>apiUrlManager.testConnection()</code> - 測試連接
            </div>
            <div>
              <code>apiUrlManager.resetToDefault()</code> - 重置為預設
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}

export default ApiTester