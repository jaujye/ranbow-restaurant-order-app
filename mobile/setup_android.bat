chcp 65001
@echo off
echo ======================================
echo Ranbow Restaurant Android Setup
echo ======================================
echo.

echo 檢查當前環境...
echo.

echo Java版本:
java -version
echo.

echo Cordova版本:
cordova --version
echo.

echo 檢查Android需求:
cordova requirements android
echo.

echo ======================================
echo 如果上面顯示錯誤，請按照以下步驟操作:
echo.
echo 1. 下載並安裝Android Studio:
echo    https://developer.android.com/studio
echo.
echo 2. 安裝Android SDK (API 35+)
echo.
echo 3. 設置環境變量:
echo    ANDROID_HOME=你的Android SDK路徑
echo    JAVA_HOME=你的Java JDK路徑
echo.
echo 4. 重新運行此腳本檢查
echo.
echo 5. 如果一切正常，運行以下命令構建APK:
echo    cordova build android --debug
echo.
echo ======================================

pause