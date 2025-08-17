@echo off
setlocal enabledelayedexpansion

REM Ranbow Restaurant Docker 部署腳本 (Windows 版本)
REM 此腳本用於簡化 Docker 容器的構建和部署過程

title Ranbow Restaurant Docker Manager

REM 顏色定義 (Windows CMD)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM 函數：輸出彩色信息
:print_info
echo %BLUE%[INFO]%NC% %~1
goto :eof

:print_success
echo %GREEN%[SUCCESS]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

REM 檢查 Docker 是否已安裝
:check_docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "Docker 未安裝，請先安裝 Docker Desktop"
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "Docker Compose 未安裝，請先安裝 Docker Compose"
    pause
    exit /b 1
)
goto :eof

REM 清理舊的容器和映像
:cleanup
call :print_info "清理舊的容器和映像..."

REM 停止並移除容器
docker-compose down --volumes --remove-orphans

REM 移除相關映像
for /f "tokens=*" %%i in ('docker images "ranbow*" -q 2^>nul') do (
    docker rmi %%i 2>nul
)

call :print_success "清理完成"
goto :eof

REM 構建應用程式
:build_app
call :print_info "構建 Spring Boot 應用程式..."

REM 檢查 Maven Wrapper
if not exist "mvnw.cmd" (
    call :print_error "Maven Wrapper 不存在，請確認專案設置"
    pause
    exit /b 1
)

REM 編譯專案
call mvnw.cmd clean package -DskipTests
if %errorlevel% neq 0 (
    call :print_error "應用程式構建失敗"
    pause
    exit /b 1
)

call :print_success "應用程式構建完成"
goto :eof

REM 構建 Docker 映像
:build_docker
call :print_info "構建 Docker 映像..."

docker build -t ranbow-restaurant-app:latest .
if %errorlevel% neq 0 (
    call :print_error "Docker 映像構建失敗"
    pause
    exit /b 1
)

call :print_success "Docker 映像構建完成"
goto :eof

REM 啟動服務
:start_services
set "profile=%~1"
call :print_info "啟動 Docker 服務..."

REM 創建必要的目錄
if not exist "logs" mkdir logs
if not exist "data\postgres" mkdir data\postgres
if not exist "data\redis" mkdir data\redis

REM 複製環境變數檔案
if not exist ".env" (
    copy ".env.example" ".env" >nul
    call :print_warning "已創建 .env 檔案，請檢查並修改相關配置"
)

REM 根據 profile 啟動服務
if "%profile%"=="dev" (
    docker-compose --profile dev-tools up -d
    call :print_info "開發工具已啟動:"
    call :print_info "  - pgAdmin: http://localhost:8081"
    call :print_info "  - Redis Commander: http://localhost:8082"
) else if "%profile%"=="nginx" (
    docker-compose --profile nginx up -d
) else (
    docker-compose up -d
)

if %errorlevel% neq 0 (
    call :print_error "服務啟動失敗"
    pause
    exit /b 1
)

call :print_success "服務啟動完成"
goto :eof

REM 檢查服務狀態
:check_status
call :print_info "檢查服務狀態..."

REM 等待服務啟動
timeout /t 10 /nobreak >nul

call :print_info "容器狀態:"
docker-compose ps

REM 檢查應用程式健康狀態
call :print_info "檢查應用程式健康狀態..."
timeout /t 5 /nobreak >nul
curl -f http://localhost:8080/api/health >nul 2>&1
if %errorlevel% neq 0 (
    call :print_warning "應用程式尚未完全啟動，請稍後檢查"
) else (
    call :print_success "應用程式運行正常"
)
goto :eof

REM 顯示日誌
:show_logs
set "service=%~1"
if "%service%"=="" (
    docker-compose logs -f
) else (
    docker-compose logs -f %service%
)
goto :eof

REM 停止服務
:stop_services
call :print_info "停止服務..."
docker-compose down
call :print_success "服務已停止"
goto :eof

REM 完全重置
:reset_all
call :print_warning "這將刪除所有容器、映像和數據，確定要繼續嗎？(y/N)"
set /p response="請輸入選擇: "
if /i "%response%"=="y" (
    call :cleanup
    docker volume prune -f
    docker system prune -f
    call :print_success "系統已重置"
) else (
    call :print_info "操作已取消"
)
goto :eof

REM 顯示幫助信息
:show_help
echo.
echo Ranbow Restaurant Docker 部署腳本 (Windows)
echo.
echo 使用方法:
echo   %~n0 [命令] [選項]
echo.
echo 命令:
echo   build     - 構建應用程式和 Docker 映像
echo   start     - 啟動服務
echo   stop      - 停止服務
echo   restart   - 重啟服務
echo   status    - 檢查服務狀態
echo   logs      - 顯示日誌 (可指定服務名稱)
echo   cleanup   - 清理舊的容器和映像
echo   reset     - 完全重置 (危險操作)
echo   help      - 顯示此幫助信息
echo.
echo 選項:
echo   dev       - 啟動開發工具 (pgAdmin, Redis Commander)
echo   nginx     - 啟動 Nginx 反向代理
echo.
echo 範例:
echo   %~n0 build
echo   %~n0 start dev
echo   %~n0 logs app
echo   %~n0 restart
echo.
goto :eof

REM 主程式
:main
set "command=%~1"
set "option=%~2"

if "%command%"=="build" (
    call :check_docker
    call :build_app
    call :build_docker
) else if "%command%"=="start" (
    call :check_docker
    call :start_services %option%
    call :check_status
) else if "%command%"=="stop" (
    call :stop_services
) else if "%command%"=="restart" (
    call :stop_services
    call :start_services %option%
    call :check_status
) else if "%command%"=="status" (
    call :check_status
) else if "%command%"=="logs" (
    call :show_logs %option%
) else if "%command%"=="cleanup" (
    call :cleanup
) else if "%command%"=="reset" (
    call :reset_all
) else if "%command%"=="help" (
    call :show_help
) else if "%command%"=="--help" (
    call :show_help
) else if "%command%"=="-h" (
    call :show_help
) else if "%command%"=="" (
    call :show_help
) else (
    call :print_error "未知命令: %command%"
    call :show_help
)

goto :eof

REM 執行主程式
call :main %*

REM 暫停以查看結果
if "%1"=="" pause