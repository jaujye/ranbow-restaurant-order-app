# Android Build Guide - Ranbow Restaurant App

## 📱 將餐廳應用程式打包為Android APK

### 🚀 快速測試 (瀏覽器版本)
目前已完成Cordova項目設置，可以在瀏覽器中測試：

```bash
cd mobile
cordova run browser
```

### 📋 Android APK 構建要求

為了在Android手機上測試，需要安裝以下工具：

#### 1. Android Studio & SDK
- 下載並安裝 [Android Studio](https://developer.android.com/studio)
- 安裝Android SDK (API level 35+)
- 設置環境變量：
  ```
  ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
  JAVA_HOME=C:\Program Files\Java\jdk-21
  ```

#### 2. Gradle (通常隨Android Studio一起安裝)
確保Gradle在PATH中可用

#### 3. 驗證安裝
```bash
cordova requirements android
```

### 🔨 構建Android APK

1. **準備構建**
   ```bash
   cd mobile
   cordova clean
   cordova prepare android
   ```

2. **構建APK**
   ```bash
   # Debug版本 (用於測試)
   cordova build android --debug
   
   # Release版本 (用於發布)
   cordova build android --release
   ```

3. **APK位置**
   構建完成後，APK文件位於：
   ```
   mobile/platforms/android/app/build/outputs/apk/debug/app-debug.apk
   ```

### 📱 安裝到手機

#### 方法1: USB連接
1. 啟用手機的開發者選項和USB調試
2. 連接手機到電腦
3. 運行：
   ```bash
   cordova run android
   ```

#### 方法2: 手動安裝
1. 將APK文件傳輸到手機
2. 在手機上啟用"允許安裝未知來源"
3. 點擊APK文件進行安裝

### 🔧 項目結構

```
mobile/
├── config.xml          # Cordova配置
├── package.json         # 項目依賴
├── www/                 # 網頁應用程式代碼
│   ├── index.html       # 主頁面 (已添加Cordova支持)
│   ├── assets/          # CSS, JS, 圖片
│   ├── components/      # Vue組件
│   ├── pages/          # 頁面組件
│   └── utils/          # 工具函數
├── platforms/          # 平台特定代碼
│   ├── android/        # Android項目
│   └── browser/        # 瀏覽器測試版本
└── plugins/            # 已安裝的插件
```

### 📦 已安裝的插件

- `cordova-plugin-whitelist` - 網絡訪問控制
- `cordova-plugin-network-information` - 網絡狀態檢測
- `cordova-plugin-statusbar` - 狀態欄控制
- `cordova-plugin-splashscreen` - 啟動畫面

### 🎯 應用程式特性

- ✅ 響應式設計，適配手機螢幕
- ✅ 離線存儲支持
- ✅ 原生應用程式體驗
- ✅ 網絡狀態檢測
- ✅ 手機生命週期事件處理 (暫停/恢復)

### 🐛 常見問題

1. **構建失敗**: 確保所有環境變量正確設置
2. **權限錯誤**: 檢查AndroidManifest.xml中的權限設置
3. **網絡問題**: 確保CSP策略允許必要的網絡訪問

### 📞 需要幫助？

如果遇到構建問題，可以：
1. 檢查 `cordova requirements android` 輸出
2. 查看詳細錯誤日誌
3. 確保所有依賴項已正確安裝

---

**注意**: 第一次構建可能需要較長時間，因為需要下載Android依賴項。