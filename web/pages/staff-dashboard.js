// Staff Dashboard - Main workplace interface for staff members

class StaffDashboard {
    constructor() {
        this.refreshInterval = null;
        this.notificationCount = 0;
        this.emergencyOrders = [];
        this.pendingOrders = [];
        this.todayStats = {
            pending: 0,
            inProgress: 0,
            completed: 0
        };
        this.currentUser = null;
    }

    getDashboardTemplate() {
        const user = Storage.getUser();
        this.currentUser = user;
        
        return `
        <div class="staff-dashboard">
            <!-- Header -->
            <div class="staff-header">
                <div class="staff-user-info">
                    <div class="staff-avatar">
                        ${this.getStaffAvatar(user)}
                    </div>
                    <div class="staff-details">
                        <h2>${user?.username || '員工'}</h2>
                        <p class="staff-department">
                            工作台 - ${user?.department || '廚房'}
                        </p>
                    </div>
                </div>
                <div class="staff-header-actions">
                    <button class="notification-btn" onclick="staffDashboard.showNotifications()">
                        <i class="fas fa-bell"></i>
                        <span class="notification-badge" id="notification-count">${this.notificationCount}</span>
                    </button>
                    <button class="settings-btn" onclick="staffDashboard.showSettings()">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            </div>

            <!-- Today's Overview -->
            <div class="today-overview">
                <h3>📊 今日概況</h3>
                <div class="stats-grid">
                    <div class="stat-card pending">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-info">
                            <div class="stat-number" id="pending-count">${this.todayStats.pending}</div>
                            <div class="stat-label">待處理</div>
                        </div>
                    </div>
                    <div class="stat-card in-progress">
                        <div class="stat-icon">
                            <i class="fas fa-utensils"></i>
                        </div>
                        <div class="stat-info">
                            <div class="stat-number" id="in-progress-count">${this.todayStats.inProgress}</div>
                            <div class="stat-label">進行中</div>
                        </div>
                    </div>
                    <div class="stat-card completed">
                        <div class="stat-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-info">
                            <div class="stat-number" id="completed-count">${this.todayStats.completed}</div>
                            <div class="stat-label">已完成</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Emergency Orders -->
            <div class="emergency-orders-section" id="emergency-orders">
                <div class="section-header emergency">
                    <h3>🔥 緊急訂單</h3>
                    <button class="refresh-btn" onclick="staffDashboard.refreshEmergencyOrders()">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
                <div class="emergency-orders-list" id="emergency-orders-list">
                    ${this.getEmergencyOrdersHTML()}
                </div>
            </div>

            <!-- Pending Orders -->
            <div class="pending-orders-section">
                <div class="section-header">
                    <h3>📋 待處理訂單</h3>
                    <button class="view-all-btn" onclick="staffDashboard.viewAllOrders()">
                        查看全部
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
                <div class="pending-orders-list" id="pending-orders-list">
                    ${this.getPendingOrdersHTML()}
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions">
                <button class="quick-action-btn kitchen" onclick="staffDashboard.goToKitchen()">
                    <i class="fas fa-fire"></i>
                    <span>廚房工作台</span>
                </button>
                <button class="quick-action-btn orders" onclick="staffDashboard.goToOrders()">
                    <i class="fas fa-list"></i>
                    <span>訂單管理</span>
                </button>
                <button class="quick-action-btn stats" onclick="staffDashboard.goToStats()">
                    <i class="fas fa-chart-bar"></i>
                    <span>工作統計</span>
                </button>
            </div>

            <!-- Bottom Navigation -->
            <div class="staff-bottom-nav">
                <div class="nav-item active" data-page="staff-dashboard" onclick="app.navigateTo('staff-dashboard')">
                    <i class="fas fa-home"></i>
                    <span>工作台</span>
                </div>
                <div class="nav-item" data-page="staff-orders" onclick="app.navigateTo('staff-orders')">
                    <i class="fas fa-clipboard-list"></i>
                    <span>訂單</span>
                </div>
                <div class="nav-item" data-page="staff-kitchen" onclick="app.navigateTo('staff-kitchen')">
                    <i class="fas fa-utensils"></i>
                    <span>廚房</span>
                </div>
                <div class="nav-item" data-page="staff-stats" onclick="app.navigateTo('staff-stats')">
                    <i class="fas fa-chart-line"></i>
                    <span>統計</span>
                </div>
                <div class="nav-item" data-page="staff-profile" onclick="app.navigateTo('staff-profile')">
                    <i class="fas fa-user"></i>
                    <span>我的</span>
                </div>
            </div>
        </div>`;
    }

    getEmergencyOrdersHTML() {
        if (this.emergencyOrders.length === 0) {
            return `
                <div class="no-emergency-orders">
                    <div class="no-orders-icon">✅</div>
                    <p>目前沒有緊急訂單</p>
                    <small>保持良好的處理速度！</small>
                </div>
            `;
        }

        return this.emergencyOrders.map(order => `
            <div class="emergency-order-card" data-order-id="${order.id}">
                <div class="order-priority">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span class="priority-label">緊急</span>
                </div>
                <div class="order-info">
                    <div class="order-header">
                        <span class="order-id">#${order.id}</span>
                        <span class="table-number">桌號:${order.tableNumber}</span>
                    </div>
                    <div class="overtime-info">
                        <i class="fas fa-clock text-danger"></i>
                        <span class="overtime-text">超時${order.overtimeMinutes}分鐘</span>
                    </div>
                    <div class="order-items">
                        ${order.items.map(item => `${item.name}×${item.quantity}`).join(', ')}
                    </div>
                </div>
                <div class="order-actions">
                    <button class="btn btn-danger btn-small" onclick="staffDashboard.handleEmergencyOrder('${order.id}')">
                        處理
                    </button>
                </div>
            </div>
        `).join('');
    }

    getPendingOrdersHTML() {
        if (this.pendingOrders.length === 0) {
            return `
                <div class="no-pending-orders">
                    <div class="no-orders-icon">📋</div>
                    <p>目前沒有待處理訂單</p>
                    <small>新訂單將在這裡顯示</small>
                </div>
            `;
        }

        return this.pendingOrders.map(order => `
            <div class="pending-order-card" data-order-id="${order.id}">
                <div class="order-header">
                    <span class="order-id">#${order.id}</span>
                    <span class="table-number">桌號:${order.tableNumber}</span>
                </div>
                <div class="order-time">
                    <i class="fas fa-clock"></i>
                    <span>${this.getTimeAgo(order.createdAt)}</span>
                </div>
                <div class="order-items">
                    ${order.items.slice(0, 2).map(item => `${item.name}×${item.quantity}`).join(', ')}
                    ${order.items.length > 2 ? ` +${order.items.length - 2}項` : ''}
                </div>
                <div class="order-actions">
                    <button class="btn btn-primary btn-small" onclick="staffDashboard.acceptOrder('${order.id}')">
                        接受
                    </button>
                </div>
            </div>
        `).join('');
    }

    initialize() {
        this.loadDashboardData();
        this.setupAutoRefresh();
        this.updateNotificationCount();
    }

    async loadDashboardData() {
        try {
            // Load emergency orders (simulated data for now)
            this.emergencyOrders = [
                {
                    id: '12347',
                    tableNumber: 3,
                    overtimeMinutes: 5,
                    items: [
                        { name: '招牌牛排', quantity: 2 },
                        { name: '蜜汁雞腿', quantity: 1 }
                    ],
                    createdAt: new Date(Date.now() - 30 * 60000) // 30 minutes ago
                }
            ];

            // Load pending orders
            this.pendingOrders = [
                {
                    id: '12348',
                    tableNumber: 5,
                    items: [
                        { name: '義式燉飯', quantity: 1 }
                    ],
                    createdAt: new Date(Date.now() - 2 * 60000) // 2 minutes ago
                },
                {
                    id: '12349',
                    tableNumber: 2,
                    items: [
                        { name: '雞腿排', quantity: 1 },
                        { name: '可樂', quantity: 2 }
                    ],
                    createdAt: new Date(Date.now() - 1 * 60000) // 1 minute ago
                }
            ];

            // Update today's stats
            this.todayStats = {
                pending: this.pendingOrders.length,
                inProgress: 3,
                completed: 24
            };

            this.updateDashboardUI();

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            app.showToast('載入工作台數據失敗', 'error');
        }
    }

    updateDashboardUI() {
        // Update stats
        const pendingCountEl = document.getElementById('pending-count');
        const inProgressCountEl = document.getElementById('in-progress-count');
        const completedCountEl = document.getElementById('completed-count');
        
        if (pendingCountEl) pendingCountEl.textContent = this.todayStats.pending;
        if (inProgressCountEl) inProgressCountEl.textContent = this.todayStats.inProgress;
        if (completedCountEl) completedCountEl.textContent = this.todayStats.completed;

        // Update emergency orders
        const emergencyListEl = document.getElementById('emergency-orders-list');
        if (emergencyListEl) {
            emergencyListEl.innerHTML = this.getEmergencyOrdersHTML();
        }

        // Update pending orders
        const pendingListEl = document.getElementById('pending-orders-list');
        if (pendingListEl) {
            pendingListEl.innerHTML = this.getPendingOrdersHTML();
        }

        // Update notification count
        this.updateNotificationCount();
    }

    setupAutoRefresh() {
        // Refresh data every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.loadDashboardData();
        }, 30000);
    }

    cleanup() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    async refreshEmergencyOrders() {
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.classList.add('rotating');
        }

        try {
            await this.loadDashboardData();
            app.showToast('緊急訂單已更新', 'success');
        } catch (error) {
            app.showToast('更新失敗', 'error');
        } finally {
            if (refreshBtn) {
                setTimeout(() => {
                    refreshBtn.classList.remove('rotating');
                }, 1000);
            }
        }
    }

    async handleEmergencyOrder(orderId) {
        try {
            // Show confirmation
            const confirmed = await this.showConfirmDialog(
                '處理緊急訂單',
                `確定要立即處理訂單 #${orderId} 嗎？`
            );

            if (confirmed) {
                // Update order status to in-progress
                await this.updateOrderStatus(orderId, 'IN_PROGRESS');
                
                // Remove from emergency list
                this.emergencyOrders = this.emergencyOrders.filter(order => order.id !== orderId);
                
                // Update stats
                this.todayStats.inProgress++;
                
                this.updateDashboardUI();
                app.showToast('緊急訂單已接受處理', 'success');
                
                // Navigate to kitchen workspace
                setTimeout(() => {
                    app.navigateTo('staff-kitchen');
                }, 1500);
            }
        } catch (error) {
            console.error('Failed to handle emergency order:', error);
            app.showToast('處理緊急訂單失敗', 'error');
        }
    }

    async acceptOrder(orderId) {
        try {
            // Update order status to accepted
            await this.updateOrderStatus(orderId, 'ACCEPTED');
            
            // Remove from pending list
            this.pendingOrders = this.pendingOrders.filter(order => order.id !== orderId);
            
            // Update stats
            this.todayStats.pending--;
            this.todayStats.inProgress++;
            
            this.updateDashboardUI();
            app.showToast(`訂單 #${orderId} 已接受`, 'success');
            
        } catch (error) {
            console.error('Failed to accept order:', error);
            app.showToast('接受訂單失敗', 'error');
        }
    }

    async updateOrderStatus(orderId, status) {
        // This would typically call the API
        // For now, we'll simulate the API call
        return new Promise((resolve) => {
            setTimeout(resolve, 500);
        });
    }

    updateNotificationCount() {
        const emergencyCount = this.emergencyOrders.length;
        const newOrdersCount = this.pendingOrders.filter(order => 
            Date.now() - new Date(order.createdAt).getTime() < 5 * 60000 // New orders in last 5 minutes
        ).length;
        
        this.notificationCount = emergencyCount + newOrdersCount;
        
        const notificationCountEl = document.getElementById('notification-count');
        if (notificationCountEl) {
            notificationCountEl.textContent = this.notificationCount;
            notificationCountEl.style.display = this.notificationCount > 0 ? 'block' : 'none';
        }
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInMinutes = Math.floor((now - time) / (1000 * 60));
        
        if (diffInMinutes < 1) return '剛剛收到';
        if (diffInMinutes < 60) return `${diffInMinutes}分鐘前`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}小時前`;
        
        return time.toLocaleDateString();
    }

    getStaffAvatar(user) {
        if (user?.department === '廚房') return '👨‍🍳';
        if (user?.department === '外場') return '👨‍💼';
        return '👤';
    }

    async showConfirmDialog(title, message) {
        return new Promise((resolve) => {
            // Simple confirmation dialog - can be enhanced with modal
            const confirmed = confirm(`${title}\n\n${message}`);
            resolve(confirmed);
        });
    }

    // Navigation methods
    showNotifications() {
        app.navigateTo('staff-notifications');
    }

    showSettings() {
        app.navigateTo('staff-profile');
    }

    viewAllOrders() {
        app.navigateTo('staff-orders');
    }

    goToKitchen() {
        app.navigateTo('staff-kitchen');
    }

    goToOrders() {
        app.navigateTo('staff-orders');
    }

    goToStats() {
        app.navigateTo('staff-stats');
    }
}

// Create global instance
window.staffDashboard = new StaffDashboard();
window.staffDashboardPage = {
    getStaffDashboardTemplate: () => window.staffDashboard.getDashboardTemplate(),
    initializeStaffDashboardPage: () => window.staffDashboard.initializeDashboardPage()
};