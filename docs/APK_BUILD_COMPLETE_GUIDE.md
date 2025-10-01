# 📱 Android APK 構建完整指南

> **項目**: Ranbow Restaurant Order Application  
> **狀態**: 準備構建APK  
> **需求**: Android SDK環境設置

## 🚀 快速開始方案

### 方案A: Android Studio 完整安裝 (推薦)

#### 1. 安裝Android Studio
```bash
# 已嘗試但超時，建議手動下載
# winget install Google.AndroidStudio
```

**手動安裝步驟:**
1. 訪問 https://developer.android.com/studio
2. 下載 Android Studio (約1.4GB)
3. 運行安裝程序並選擇標準安裝
4. 啟動Android Studio並完成初始設置

#### 2. 配置環境變量
安裝完成後設置以下環境變量：
```cmd
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
set JAVA_HOME=C:\Program Files\Java\jdk-21
set PATH=%PATH%;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools
```

#### 3. 驗證安裝
```bash
cd mobile
cordova requirements android
```

#### 4. 構建APK
```bash
cd mobile
cordova clean
cordova prepare android
cordova build android --debug
```

### 方案B: 最小化Android SDK 安裝

#### 1. 下載命令行工具
```bash
curl -L -o android-tools.zip "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
unzip android-tools.zip
```

#### 2. 創建SDK目錄
```cmd
mkdir C:\android-sdk\cmdline-tools\latest
# 將下載的工具移動到 latest 目錄
```

#### 3. 安裝必需組件
```bash
sdkmanager "platforms;android-35" "build-tools;35.0.0" "platform-tools"
```

### 方案C: 使用在線構建服務

#### 1. PhoneGap Build (已停用)
- Adobe PhoneGap Build 已於2022年停用

#### 2. AppCenter (Microsoft)
- 需要GitHub集成
- 免費層有限制

#### 3. GitHub Actions (推薦替代)
創建 `.github/workflows/android.yml`:
```yaml
name: Build Android APK
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Setup Java
        uses: actions/setup-java@v2
        with:
          java-version: '11'
      - name: Setup Android SDK
        uses: android-actions/setup-android@v2
      - name: Install Cordova
        run: npm install -g cordova
      - name: Install dependencies
        run: cd mobile && npm install
      - name: Build APK
        run: cd mobile && cordova build android --debug
      - name: Upload APK
        uses: actions/upload-artifact@v2
        with:
          name: app-debug
          path: mobile/platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

## 📂 項目結構檢查

### 已完成的準備工作 ✅
```
mobile/
├── config.xml                    # Cordova配置 ✅
├── package.json                  # 依賴管理 ✅
├── www/                          # 網頁應用 ✅
│   ├── index.html               # 主頁面 ✅
│   ├── assets/                  # 資源文件 ✅
│   ├── components/              # 組件 ✅
│   ├── pages/                   # 頁面 ✅
│   └── utils/                   # 工具 ✅
├── platforms/android/            # Android項目 ✅
│   ├── app/                     # 應用代碼 ✅
│   ├── build.gradle             # 構建配置 ✅
│   └── gradlew.bat             # Gradle Wrapper ✅ (新增)
└── plugins/                      # Cordova插件 ✅
```

### 缺少的環境
- ❌ Android SDK
- ❌ Android Build Tools  
- ❌ Gradle (需要Android SDK)

## 🔧 當前狀態

### Java環境 ✅
```
Java版本: 21.0.4
位置: 已安裝並可用
```

### Cordova項目 ✅
```
平台: android, browser
插件: whitelist, network-information, statusbar, splashscreen
配置: 完整並準備構建
```

### 網絡連接問題 ⚠️
```
SSL證書問題影響下載
建議使用瀏覽器手動下載Android Studio
```

## 🚀 立即可用的替代方案

### 1. 使用現有的瀏覽器測試
```bash
cd mobile/platforms/browser/www
# 已經運行在 http://localhost:3000
```

### 2. 導出項目給有Android Studio的環境
```bash
zip -r ranbow-restaurant-mobile.zip mobile/
# 傳輸到有Android Studio的電腦進行構建
```

### 3. 設置Android Studio後的快速構建命令
```bash
# 一旦Android Studio安裝完成
cd mobile
cordova build android --debug

# APK位置
mobile/platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

## 📱 APK安裝指南

### 手機準備
1. 設置 → 安全 → 允許安裝未知來源
2. 或者 設置 → 應用 → 特殊訪問權限 → 安裝未知應用

### 安裝方法
1. **USB連接**: `adb install app-debug.apk`
2. **文件傳輸**: 將APK複製到手機並點擊安裝
3. **雲端分享**: 上傳到雲端硬碟後在手機下載安裝

## 🔍 故障排除

### 常見錯誤
1. **JAVA_HOME未設置**
   ```cmd
   set JAVA_HOME=C:\Program Files\Java\jdk-21
   ```

2. **ANDROID_HOME未設置**
   ```cmd
   set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
   ```

3. **Gradle版本衝突**
   ```bash
   cd mobile/platforms/android
   ./gradlew clean
   ```

4. **網絡連接問題**
   - 使用移動熱點
   - 配置代理設置
   - 手動下載並安裝

## 🎯 建議的下一步

### 優先級1: 完成Android Studio安裝
```bash
# 手動下載並安裝Android Studio
# 設置環境變量
# 驗證安裝: cordova requirements android
```

### 優先級2: 構建APK
```bash
cd mobile
cordova build android --debug
```

### 優先級3: 測試APK
```bash
# 安裝到手機
# 測試功能
# 驗證API連接
```

---

## 📞 需要協助時

如果遇到問題：
1. 檢查Java和Android SDK版本
2. 清理並重新構建項目
3. 檢查網絡連接
4. 參考Cordova官方文檔

**項目已準備好構建APK，只需要Android SDK環境！**