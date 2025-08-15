@echo off
echo ========================================
echo    Ranbow Restaurant APK Builder
echo ========================================
echo.

REM 檢查Java環境
echo [1/6] 檢查Java環境...
java -version
if %ERRORLEVEL% neq 0 (
    echo ERROR: Java未安裝或未在PATH中
    pause
    exit /b 1
)
echo ✅ Java環境正常
echo.

REM 檢查Cordova
echo [2/6] 檢查Cordova環境...
cordova --version
if %ERRORLEVEL% neq 0 (
    echo ERROR: Cordova未安裝
    echo 請運行: npm install -g cordova
    pause
    exit /b 1
)
echo ✅ Cordova環境正常
echo.

REM 檢查Android環境
echo [3/6] 檢查Android環境...
cd mobile
cordova requirements android
if %ERRORLEVEL% neq 0 (
    echo WARNING: Android環境未完全準備好
    echo 請確保已安裝Android Studio和SDK
    echo 繼續構建可能會失敗...
    echo.
    set /p continue="是否繼續？ (y/N): "
    if /i not "%continue%"=="y" exit /b 1
)
echo ✅ Android環境檢查完成
echo.

REM 清理項目
echo [4/6] 清理項目...
cordova clean
echo ✅ 項目清理完成
echo.

REM 準備構建
echo [5/6] 準備構建...
cordova prepare android
if %ERRORLEVEL% neq 0 (
    echo ERROR: 準備構建失敗
    pause
    exit /b 1
)
echo ✅ 構建準備完成
echo.

REM 構建APK
echo [6/6] 構建APK...
echo 正在構建Debug版本...
cordova build android --debug --verbose
if %ERRORLEVEL% neq 0 (
    echo ERROR: APK構建失敗
    pause
    exit /b 1
)

echo.
echo ========================================
echo          構建完成！
echo ========================================
echo.
echo APK文件位置:
echo platforms\android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo 文件大小:
dir platforms\android\app\build\outputs\apk\debug\app-debug.apk | findstr app-debug.apk
echo.
echo 🎉 成功構建 Ranbow Restaurant APK!
echo.
echo 安裝指南:
echo 1. 複製APK到手機
echo 2. 啟用'允許安裝未知來源'
echo 3. 點擊APK文件安裝
echo 4. 啟動 Ranbow Restaurant 應用
echo.
pause