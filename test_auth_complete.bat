@echo off
chcp 65001 > nul
echo ========================================
echo 🧪 Ranbow Restaurant 認證功能完整測試
echo ========================================

echo.
echo 1. 檢查PostgreSQL數據庫連接...
echo SELECT 'Database OK' as status, COUNT(*) as user_count FROM users; | psql -h 192.168.0.114 -U postgres -d ranbow_restaurant -A -t

echo.
echo 2. 檢查後端API服務器狀態...
curl -s http://localhost:8080/api/health | echo.

echo.
echo 3. 測試用戶註冊功能...
curl -X POST http://localhost:8080/api/users ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"完整測試用戶\",\"email\":\"fulltest@example.com\",\"password\":\"test123456\",\"phoneNumber\":\"0911223344\"}" ^
  -w "\nHTTP Status: %%{http_code}\n"

echo.
echo 4. 測試用戶登入功能...
curl -X POST http://localhost:8080/api/users/authenticate ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"fulltest@example.com\",\"password\":\"test123456\"}" ^
  -w "\nHTTP Status: %%{http_code}\n"

echo.
echo 5. 測試錯誤密碼登入...
curl -X POST http://localhost:8080/api/users/authenticate ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"fulltest@example.com\",\"password\":\"wrongpassword\"}" ^
  -w "\nHTTP Status: %%{http_code}\n"

echo.
echo 6. 檢查數據庫中的用戶記錄...
echo SELECT username, email, role, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 3; | psql -h 192.168.0.114 -U postgres -d ranbow_restaurant

echo.
echo ========================================
echo 🎯 測試完成！
echo ========================================
echo.
echo 📝 測試說明：
echo   - HTTP 201: 註冊成功
echo   - HTTP 200: 登入成功  
echo   - HTTP 401: 認證失敗
echo   - HTTP 409: Email已存在
echo.
echo 🌐 前端測試頁面: http://127.0.0.1:3001/test_frontend_auth.html
echo 🖥️ 主應用程式: http://127.0.0.1:3001/
echo.
pause