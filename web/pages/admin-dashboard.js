// Admin Dashboard - Rainbow Theme Real-time Analytics

class AdminDashboard {
    constructor() {
        this.refreshInterval = null;
        this.chartInstances = {};
        this.realTimeData = {
            orders: { pending: 0, processing: 0, completed: 0, cancelled: 0 },
            revenue: { today: 0, week: 0, month: 0 },
            customers: { active: 0, total: 0, new: 0 },
            performance: { avgPrepTime: 0, satisfaction: 0, efficiency: 0 }
        };
    }

    getDashboardTemplate() {
        return `
        <div class="admin-dashboard-container">
            <!-- Rainbow Background Effects -->
            <div class="admin-background-effects">
                <div class="rainbow-wave rainbow-wave-1"></div>
                <div class="rainbow-wave rainbow-wave-2"></div>
                <div class="rainbow-particles"></div>
            </div>

            <!-- Dashboard Header -->
            <header class="admin-dashboard-header glass-morphism">
                <div class="header-content">
                    <div class="header-left">
                        <h1 class="dashboard-title rainbow-text">
                            <i class="fas fa-tachometer-alt"></i>
                            管理控制台
                        </h1>
                        <p class="dashboard-subtitle">Ranbow Restaurant 即時營運監控</p>
                    </div>
                    <div class="header-right">
                        <div class="quick-actions">
                            <button class="quick-action-btn rainbow-btn-ghost" onclick="adminDashboard.refreshData()">
                                <i class="fas fa-sync-alt"></i>
                                <span>重新整理</span>
                            </button>
                            <button class="quick-action-btn rainbow-btn-ghost" onclick="app.navigateTo('admin-settings')">
                                <i class="fas fa-cog"></i>
                                <span>設定</span>
                            </button>
                        </div>
                        <div class="admin-profile">
                            <div class="profile-info">
                                <span class="admin-name">${app.currentUser?.name || '管理員'}</span>
                                <span class="admin-role">系統管理員</span>
                            </div>
                            <div class="profile-avatar rainbow-avatar">
                                <i class="fas fa-user-shield"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="status-bar">
                    <div class="status-item">
                        <div class="status-indicator rainbow-pulse"></div>
                        <span>系統運行正常</span>
                    </div>
                    <div class="status-item">
                        <i class="fas fa-clock"></i>
                        <span id="current-time">載入中...</span>
                    </div>
                    <div class="status-item">
                        <i class="fas fa-users"></i>
                        <span id="online-users">0 位線上用戶</span>
                    </div>
                </div>
            </header>

            <!-- Main Dashboard Content -->
            <main class="admin-dashboard-main">
                <!-- Key Metrics Row -->
                <section class="metrics-section">
                    <div class="metrics-grid">
                        <!-- Today's Revenue -->
                        <div class="metric-card glass-morphism" data-metric="revenue">
                            <div class="metric-header">
                                <div class="metric-icon rainbow-bg-red">
                                    <i class="fas fa-dollar-sign"></i>
                                </div>
                                <div class="metric-trend trend-up">
                                    <i class="fas fa-arrow-up"></i>
                                    <span>+12.5%</span>
                                </div>
                            </div>
                            <div class="metric-content">
                                <h3 class="metric-title">今日營收</h3>
                                <div class="metric-value" id="today-revenue">$0</div>
                                <p class="metric-subtitle">較昨日成長</p>
                            </div>
                            <div class="metric-chart">
                                <canvas id="revenue-chart"></canvas>
                            </div>
                        </div>

                        <!-- Active Orders -->
                        <div class="metric-card glass-morphism" data-metric="orders">
                            <div class="metric-header">
                                <div class="metric-icon rainbow-bg-orange">
                                    <i class="fas fa-shopping-cart"></i>
                                </div>
                                <div class="metric-trend trend-stable">
                                    <i class="fas fa-minus"></i>
                                    <span>穩定</span>
                                </div>
                            </div>
                            <div class="metric-content">
                                <h3 class="metric-title">進行中訂單</h3>
                                <div class="metric-value" id="active-orders">0</div>
                                <p class="metric-subtitle">等待處理</p>
                            </div>
                            <div class="metric-breakdown">
                                <div class="breakdown-item">
                                    <span class="breakdown-label">等待確認</span>
                                    <span class="breakdown-value" id="pending-orders">0</span>
                                </div>
                                <div class="breakdown-item">
                                    <span class="breakdown-label">準備中</span>
                                    <span class="breakdown-value" id="processing-orders">0</span>
                                </div>
                            </div>
                        </div>

                        <!-- Customer Satisfaction -->
                        <div class="metric-card glass-morphism" data-metric="satisfaction">
                            <div class="metric-header">
                                <div class="metric-icon rainbow-bg-green">
                                    <i class="fas fa-heart"></i>
                                </div>
                                <div class="metric-trend trend-up">
                                    <i class="fas fa-arrow-up"></i>
                                    <span>+3.2%</span>
                                </div>
                            </div>
                            <div class="metric-content">
                                <h3 class="metric-title">顧客滿意度</h3>
                                <div class="metric-value" id="satisfaction-score">0%</div>
                                <p class="metric-subtitle">本週平均</p>
                            </div>
                            <div class="satisfaction-stars">
                                <div class="stars-container" id="satisfaction-stars">
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                </div>
                            </div>
                        </div>

                        <!-- Average Prep Time -->
                        <div class="metric-card glass-morphism" data-metric="prep-time">
                            <div class="metric-header">
                                <div class="metric-icon rainbow-bg-blue">
                                    <i class="fas fa-clock"></i>
                                </div>
                                <div class="metric-trend trend-down">
                                    <i class="fas fa-arrow-down"></i>
                                    <span>-2.1%</span>
                                </div>
                            </div>
                            <div class="metric-content">
                                <h3 class="metric-title">平均準備時間</h3>
                                <div class="metric-value" id="avg-prep-time">0 分鐘</div>
                                <p class="metric-subtitle">較上週減少</p>
                            </div>
                            <div class="prep-time-gauge">
                                <canvas id="prep-time-gauge"></canvas>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Charts and Analytics Row -->
                <section class="analytics-section">
                    <div class="analytics-grid">
                        <!-- Sales Chart -->
                        <div class="chart-card glass-morphism">
                            <div class="chart-header">
                                <h3 class="chart-title">
                                    <i class="fas fa-chart-line rainbow-text"></i>
                                    營收趨勢
                                </h3>
                                <div class="chart-controls">
                                    <select class="period-selector rainbow-select" id="revenue-period">
                                        <option value="today">今日</option>
                                        <option value="week" selected>本週</option>
                                        <option value="month">本月</option>
                                        <option value="year">本年</option>
                                    </select>
                                </div>
                            </div>
                            <div class="chart-container">
                                <canvas id="sales-chart"></canvas>
                            </div>
                        </div>

                        <!-- Order Status Distribution -->
                        <div class="chart-card glass-morphism">
                            <div class="chart-header">
                                <h3 class="chart-title">
                                    <i class="fas fa-chart-pie rainbow-text"></i>
                                    訂單狀態分布
                                </h3>
                                <div class="chart-legend" id="order-status-legend">
                                    <!-- Legend items will be generated dynamically -->
                                </div>
                            </div>
                            <div class="chart-container">
                                <canvas id="order-status-chart"></canvas>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Recent Activity and Quick Actions -->
                <section class="activity-section">
                    <div class="activity-grid">
                        <!-- Recent Orders -->
                        <div class="activity-card glass-morphism">
                            <div class="activity-header">
                                <h3 class="activity-title">
                                    <i class="fas fa-clock rainbow-text"></i>
                                    最新訂單
                                </h3>
                                <a href="#" class="view-all-link rainbow-link" onclick="app.navigateTo('admin-orders')">
                                    查看全部
                                    <i class="fas fa-arrow-right"></i>
                                </a>
                            </div>
                            <div class="activity-content">
                                <div class="recent-orders-list" id="recent-orders-list">
                                    <!-- Recent orders will be loaded here -->
                                </div>
                            </div>
                        </div>

                        <!-- Quick Actions -->
                        <div class="activity-card glass-morphism">
                            <div class="activity-header">
                                <h3 class="activity-title">
                                    <i class="fas fa-bolt rainbow-text"></i>
                                    快速操作
                                </h3>
                            </div>
                            <div class="activity-content">
                                <div class="quick-actions-grid">
                                    <button class="quick-action-item rainbow-btn-gradient" onclick="app.navigateTo('admin-menu')">
                                        <i class="fas fa-utensils"></i>
                                        <span>菜單管理</span>
                                    </button>
                                    <button class="quick-action-item rainbow-btn-gradient" onclick="app.navigateTo('admin-users')">
                                        <i class="fas fa-users"></i>
                                        <span>用戶管理</span>
                                    </button>
                                    <button class="quick-action-item rainbow-btn-gradient" onclick="app.navigateTo('admin-reports')">
                                        <i class="fas fa-chart-bar"></i>
                                        <span>報表分析</span>
                                    </button>
                                    <button class="quick-action-item rainbow-btn-gradient" onclick="adminDashboard.exportData()">
                                        <i class="fas fa-download"></i>
                                        <span>匯出資料</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- System Status -->
                <section class="system-section">
                    <div class="system-card glass-morphism">
                        <div class="system-header">
                            <h3 class="system-title">
                                <i class="fas fa-server rainbow-text"></i>
                                系統狀態監控
                            </h3>
                            <div class="system-status-indicator">
                                <div class="status-dot rainbow-pulse"></div>
                                <span>所有系統正常運行</span>
                            </div>
                        </div>
                        <div class="system-metrics">
                            <div class="system-metric">
                                <div class="metric-label">API 回應時間</div>
                                <div class="metric-progress">
                                    <div class="progress-bar rainbow-bg-green" style="width: 85%"></div>
                                </div>
                                <div class="metric-value">142ms</div>
                            </div>
                            <div class="system-metric">
                                <div class="metric-label">資料庫連線</div>
                                <div class="metric-progress">
                                    <div class="progress-bar rainbow-bg-blue" style="width: 92%"></div>
                                </div>
                                <div class="metric-value">正常</div>
                            </div>
                            <div class="system-metric">
                                <div class="metric-label">緩存命中率</div>
                                <div class="metric-progress">
                                    <div class="progress-bar rainbow-bg-purple" style="width: 78%"></div>
                                </div>
                                <div class="metric-value">78.2%</div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
        `;
    }

    render() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = this.getDashboardTemplate();
        
        // Set admin theme
        document.body.setAttribute('data-role', 'admin');
        
        // Hide navigation bars
        this.hideNavigationBars();
        
        // Initialize dashboard components
        this.initializeDashboard();
        
        // Start real-time updates
        this.startRealTimeUpdates();
    }

    hideNavigationBars() {
        const bottomNav = document.getElementById('bottom-nav');
        // Don't hide top-nav for admin - let the main app handle navigation display
        
        if (bottomNav) {
            bottomNav.classList.add('hidden');
            bottomNav.style.display = 'none';
        }
        
        // Ensure top navigation is shown for admin users
        this.showTopNavigation();
    }
    
    showTopNavigation() {
        const topNav = document.getElementById('top-nav');
        if (topNav) {
            topNav.classList.remove('hidden');
            topNav.style.display = '';
        }
    }
    
    showNavigationBars() {
        const bottomNav = document.getElementById('bottom-nav');
        const topNav = document.getElementById('top-nav');
        
        if (bottomNav) {
            bottomNav.classList.remove('hidden');
            bottomNav.style.display = '';
        }
        if (topNav) {
            topNav.classList.remove('hidden');
            topNav.style.display = '';
        }
    }

    initializeDashboard() {
        // Initialize clock
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        
        // Load initial data
        this.loadDashboardData();
        
        // Initialize charts
        this.initializeCharts();
        
        // Initialize animations
        this.initializeAnimations();
        
        // Set up event listeners
        this.setupEventListeners();
    }

    updateClock() {
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('zh-TW', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            timeElement.textContent = timeString;
        }
    }

    async loadDashboardData() {
        try {
            // Simulate API calls to get dashboard data
            const [orders, revenue, customers, performance] = await Promise.all([
                this.fetchOrdersData(),
                this.fetchRevenueData(),
                this.fetchCustomersData(),
                this.fetchPerformanceData()
            ]);
            
            this.realTimeData = { orders, revenue, customers, performance };
            this.updateMetrics();
            this.loadRecentOrders();
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            Toast.show('載入儀表板資料失敗', 'error');
        }
    }

    async fetchOrdersData() {
        // Mock data - replace with actual API call
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    pending: Math.floor(Math.random() * 10) + 2,
                    processing: Math.floor(Math.random() * 15) + 5,
                    completed: Math.floor(Math.random() * 50) + 20,
                    cancelled: Math.floor(Math.random() * 3) + 1
                });
            }, 300);
        });
    }

    async fetchRevenueData() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    today: Math.floor(Math.random() * 5000) + 15000,
                    week: Math.floor(Math.random() * 20000) + 80000,
                    month: Math.floor(Math.random() * 50000) + 300000
                });
            }, 400);
        });
    }

    async fetchCustomersData() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    active: Math.floor(Math.random() * 20) + 10,
                    total: Math.floor(Math.random() * 500) + 1200,
                    new: Math.floor(Math.random() * 10) + 3
                });
            }, 350);
        });
    }

    async fetchPerformanceData() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    avgPrepTime: Math.floor(Math.random() * 10) + 15,
                    satisfaction: Math.floor(Math.random() * 15) + 85,
                    efficiency: Math.floor(Math.random() * 20) + 75
                });
            }, 450);
        });
    }

    updateMetrics() {
        // Update revenue
        const revenueElement = document.getElementById('today-revenue');
        if (revenueElement) {
            revenueElement.textContent = `$${this.realTimeData.revenue.today.toLocaleString()}`;
        }
        
        // Update orders
        const activeOrdersElement = document.getElementById('active-orders');
        const pendingOrdersElement = document.getElementById('pending-orders');
        const processingOrdersElement = document.getElementById('processing-orders');
        
        if (activeOrdersElement) {
            const activeTotal = this.realTimeData.orders.pending + this.realTimeData.orders.processing;
            activeOrdersElement.textContent = activeTotal;
        }
        
        if (pendingOrdersElement) {
            pendingOrdersElement.textContent = this.realTimeData.orders.pending;
        }
        
        if (processingOrdersElement) {
            processingOrdersElement.textContent = this.realTimeData.orders.processing;
        }
        
        // Update satisfaction
        const satisfactionElement = document.getElementById('satisfaction-score');
        if (satisfactionElement) {
            satisfactionElement.textContent = `${this.realTimeData.performance.satisfaction}%`;
        }
        
        // Update prep time
        const prepTimeElement = document.getElementById('avg-prep-time');
        if (prepTimeElement) {
            prepTimeElement.textContent = `${this.realTimeData.performance.avgPrepTime} 分鐘`;
        }
        
        // Update online users
        const onlineUsersElement = document.getElementById('online-users');
        if (onlineUsersElement) {
            onlineUsersElement.textContent = `${this.realTimeData.customers.active} 位線上用戶`;
        }
    }

    initializeCharts() {
        // Initialize revenue chart
        this.initializeRevenueChart();
        
        // Initialize order status chart
        this.initializeOrderStatusChart();
        
        // Initialize prep time gauge
        this.initializePrepTimeGauge();
    }

    initializeRevenueChart() {
        const canvas = document.getElementById('sales-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Mock data for the chart
        const data = {
            labels: ['週一', '週二', '週三', '週四', '週五', '週六', '週日'],
            datasets: [{
                label: '營收',
                data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
                borderColor: 'var(--rainbow-blue)',
                backgroundColor: 'rgba(0, 122, 255, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };
        
        // Store chart instance for updates
        this.chartInstances.salesChart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    }

    initializeOrderStatusChart() {
        const canvas = document.getElementById('order-status-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        const data = {
            labels: ['等待確認', '準備中', '已完成', '已取消'],
            datasets: [{
                data: [
                    this.realTimeData.orders.pending,
                    this.realTimeData.orders.processing,
                    this.realTimeData.orders.completed,
                    this.realTimeData.orders.cancelled
                ],
                backgroundColor: [
                    'var(--rainbow-yellow)',
                    'var(--rainbow-blue)',
                    'var(--rainbow-green)',
                    'var(--rainbow-red)'
                ],
                borderWidth: 0
            }]
        };
        
        this.chartInstances.orderStatusChart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    initializePrepTimeGauge() {
        const canvas = document.getElementById('prep-time-gauge');
        if (!canvas) return;
        
        // Simple gauge implementation
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw gauge background
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 8;
        ctx.stroke();
        
        // Draw gauge value
        const percentage = Math.min(this.realTimeData.performance.avgPrepTime / 30, 1);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + (2 * Math.PI * percentage));
        ctx.strokeStyle = 'var(--rainbow-green)';
        ctx.lineWidth = 8;
        ctx.stroke();
    }

    async loadRecentOrders() {
        const container = document.getElementById('recent-orders-list');
        if (!container) return;
        
        // Mock recent orders data
        const recentOrders = [
            { id: 'ORD001', customer: '李小明', items: 3, total: 450, status: 'processing', time: '2分鐘前' },
            { id: 'ORD002', customer: '王大華', items: 2, total: 320, status: 'pending', time: '5分鐘前' },
            { id: 'ORD003', customer: '陳小美', items: 1, total: 180, status: 'completed', time: '8分鐘前' },
            { id: 'ORD004', customer: '張三', items: 4, total: 620, status: 'processing', time: '12分鐘前' },
            { id: 'ORD005', customer: '劉五', items: 2, total: 280, status: 'pending', time: '15分鐘前' }
        ];
        
        container.innerHTML = recentOrders.map(order => `
            <div class="recent-order-item" data-status="${order.status}">
                <div class="order-info">
                    <div class="order-id">#${order.id}</div>
                    <div class="order-customer">${order.customer}</div>
                </div>
                <div class="order-details">
                    <div class="order-items">${order.items} 項商品</div>
                    <div class="order-total">$${order.total}</div>
                </div>
                <div class="order-status">
                    <span class="status-badge status-${order.status}">
                        ${this.getStatusText(order.status)}
                    </span>
                    <div class="order-time">${order.time}</div>
                </div>
            </div>
        `).join('');
    }

    getStatusText(status) {
        const statusMap = {
            'pending': '等待確認',
            'processing': '準備中',
            'completed': '已完成',
            'cancelled': '已取消'
        };
        return statusMap[status] || status;
    }

    initializeAnimations() {
        // Animate metric cards on load
        const metricCards = document.querySelectorAll('.metric-card');
        metricCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-in');
            }, index * 150);
        });
        
        // Start background animations
        this.startBackgroundAnimations();
    }

    startBackgroundAnimations() {
        // Animate rainbow waves
        const waves = document.querySelectorAll('.rainbow-wave');
        waves.forEach((wave, index) => {
            wave.style.animationDelay = `${index * 2}s`;
        });
    }

    setupEventListeners() {
        // Period selector for revenue chart
        const periodSelector = document.getElementById('revenue-period');
        if (periodSelector) {
            periodSelector.addEventListener('change', (e) => {
                this.updateRevenueChart(e.target.value);
            });
        }
        
        // Metric card hover effects
        const metricCards = document.querySelectorAll('.metric-card');
        metricCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.classList.add('hovered');
            });
            
            card.addEventListener('mouseleave', () => {
                card.classList.remove('hovered');
            });
        });
    }

    startRealTimeUpdates() {
        // Update data every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.loadDashboardData();
        }, 30000);
    }

    async refreshData() {
        const refreshBtn = document.querySelector('.quick-action-btn');
        const originalContent = refreshBtn.innerHTML;
        
        try {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>重新整理</span>';
            
            await this.loadDashboardData();
            
            refreshBtn.innerHTML = '<i class="fas fa-check"></i><span>已更新</span>';
            Toast.show('資料已更新', 'success');
            
            setTimeout(() => {
                refreshBtn.innerHTML = originalContent;
            }, 2000);
            
        } catch (error) {
            refreshBtn.innerHTML = originalContent;
            Toast.show('更新失敗', 'error');
        }
    }

    async exportData() {
        try {
            Toast.show('正在準備匯出資料...', 'info');
            
            // Simulate data export
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            Toast.show('資料匯出完成', 'success');
            
        } catch (error) {
            Toast.show('匯出失敗', 'error');
        }
    }

    updateRevenueChart(period) {
        // Update chart based on selected period
        const chart = this.chartInstances.salesChart;
        if (!chart) return;
        
        // Mock data for different periods
        const periodData = {
            today: {
                labels: ['09:00', '12:00', '15:00', '18:00', '21:00'],
                data: [2000, 5000, 3000, 8000, 6000]
            },
            week: {
                labels: ['週一', '週二', '週三', '週四', '週五', '週六', '週日'],
                data: [12000, 19000, 15000, 25000, 22000, 30000, 28000]
            },
            month: {
                labels: ['第1週', '第2週', '第3週', '第4週'],
                data: [85000, 92000, 78000, 95000]
            },
            year: {
                labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                data: [250000, 280000, 320000, 300000, 350000, 380000, 400000, 420000, 390000, 450000, 480000, 520000]
            }
        };
        
        const newData = periodData[period];
        chart.data.labels = newData.labels;
        chart.data.datasets[0].data = newData.data;
        chart.update();
    }

    destroy() {
        // Clean up intervals and chart instances
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        Object.values(this.chartInstances).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
    }
}

// Initialize admin dashboard
const adminDashboard = new AdminDashboard();