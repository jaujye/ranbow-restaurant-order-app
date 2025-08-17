#!/bin/bash

# Ranbow Restaurant Docker 部署腳本
# 此腳本用於簡化 Docker 容器的構建和部署過程

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函數：輸出彩色信息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 檢查 Docker 是否已安裝
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安裝，請先安裝 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose 未安裝，請先安裝 Docker Compose"
        exit 1
    fi
}

# 清理舊的容器和映像
cleanup() {
    print_info "清理舊的容器和映像..."
    
    # 停止並移除容器
    docker-compose down --volumes --remove-orphans
    
    # 移除相關映像
    docker rmi $(docker images "ranbow*" -q) 2>/dev/null || true
    
    print_success "清理完成"
}

# 構建應用程式
build_app() {
    print_info "構建 Spring Boot 應用程式..."
    
    # 確保有 Maven Wrapper
    if [ ! -f "./mvnw" ]; then
        print_error "Maven Wrapper 不存在，請確認專案設置"
        exit 1
    fi
    
    # 賦予執行權限
    chmod +x ./mvnw
    
    # 編譯專案
    ./mvnw clean package -DskipTests
    
    print_success "應用程式構建完成"
}

# 構建 Docker 映像
build_docker() {
    print_info "構建 Docker 映像..."
    
    # 構建單一容器映像
    docker build -t ranbow-restaurant-app:latest .
    
    print_success "Docker 映像構建完成"
}

# 啟動服務
start_services() {
    local profile=${1:-""}
    
    print_info "啟動 Docker 服務..."
    
    # 創建必要的目錄
    mkdir -p logs
    mkdir -p data/postgres
    mkdir -p data/redis
    
    # 複製環境變數檔案
    if [ ! -f ".env" ]; then
        cp .env.example .env
        print_warning "已創建 .env 檔案，請檢查並修改相關配置"
    fi
    
    # 根據 profile 啟動服務
    if [ "$profile" = "dev" ]; then
        docker-compose --profile dev-tools up -d
        print_info "開發工具已啟動:"
        print_info "  - pgAdmin: http://localhost:8081"
        print_info "  - Redis Commander: http://localhost:8082"
    elif [ "$profile" = "nginx" ]; then
        docker-compose --profile nginx up -d
    else
        docker-compose up -d
    fi
    
    print_success "服務啟動完成"
}

# 檢查服務狀態
check_status() {
    print_info "檢查服務狀態..."
    
    # 等待服務啟動
    sleep 10
    
    # 檢查各服務健康狀態
    print_info "PostgreSQL 狀態:"
    docker-compose exec postgres pg_isready -U postgres
    
    print_info "Redis 狀態:"
    docker-compose exec redis redis-cli ping
    
    print_info "應用程式狀態:"
    curl -f http://localhost:8080/api/health || print_warning "應用程式尚未完全啟動"
    
    print_info "容器狀態:"
    docker-compose ps
}

# 顯示日誌
show_logs() {
    local service=${1:-""}
    
    if [ -z "$service" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$service"
    fi
}

# 停止服務
stop_services() {
    print_info "停止服務..."
    docker-compose down
    print_success "服務已停止"
}

# 完全重置
reset_all() {
    print_warning "這將刪除所有容器、映像和數據，確定要繼續嗎？(y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        cleanup
        docker volume prune -f
        docker system prune -f
        print_success "系統已重置"
    else
        print_info "操作已取消"
    fi
}

# 顯示幫助信息
show_help() {
    echo "Ranbow Restaurant Docker 部署腳本"
    echo ""
    echo "使用方法:"
    echo "  $0 [命令] [選項]"
    echo ""
    echo "命令:"
    echo "  build     - 構建應用程式和 Docker 映像"
    echo "  start     - 啟動服務"
    echo "  stop      - 停止服務"
    echo "  restart   - 重啟服務"
    echo "  status    - 檢查服務狀態"
    echo "  logs      - 顯示日誌 (可指定服務名稱)"
    echo "  cleanup   - 清理舊的容器和映像"
    echo "  reset     - 完全重置 (危險操作)"
    echo "  help      - 顯示此幫助信息"
    echo ""
    echo "選項:"
    echo "  --dev     - 啟動開發工具 (pgAdmin, Redis Commander)"
    echo "  --nginx   - 啟動 Nginx 反向代理"
    echo ""
    echo "範例:"
    echo "  $0 build"
    echo "  $0 start --dev"
    echo "  $0 logs app"
    echo "  $0 restart"
}

# 主程式
main() {
    case "$1" in
        "build")
            check_docker
            build_app
            build_docker
            ;;
        "start")
            check_docker
            if [[ "$2" == "--dev" ]]; then
                start_services "dev"
            elif [[ "$2" == "--nginx" ]]; then
                start_services "nginx"
            else
                start_services
            fi
            check_status
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            stop_services
            if [[ "$2" == "--dev" ]]; then
                start_services "dev"
            elif [[ "$2" == "--nginx" ]]; then
                start_services "nginx"
            else
                start_services
            fi
            ;;
        "status")
            check_status
            ;;
        "logs")
            show_logs "$2"
            ;;
        "cleanup")
            cleanup
            ;;
        "reset")
            reset_all
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            print_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

# 執行主程式
main "$@"