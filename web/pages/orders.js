// Orders Page - Order history and tracking

class OrdersPage {
    constructor() {
        this.orders = [];
        this.currentOrder = null;
        this.activeTab = 'current';
        this.isLoading = false;
        this.refreshInterval = null;
    }

    getOrdersPageTemplate() {
        return `
        <div class="orders-page">
            <!-- Orders Header -->
            <div class="orders-header">
                <div class="header-content">
                    <h2><i class="fas fa-receipt"></i> 我的訂單</h2>
                    <p class="header-subtitle">查看您的訂單狀態與歷史記錄</p>
                </div>
                <button class="refresh-btn" onclick="ordersPage.refreshOrders()" title="重新整理">
                    <i class="fas fa-sync-alt"></i>
                    <span>更新</span>
                </button>
            </div>

            <!-- Order Tabs -->
            <div class="order-tabs">
                <button class="order-tab active" data-tab="current" onclick="ordersPage.switchTab('current')">
                    <div class="tab-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="tab-content">
                        <span class="tab-label">進行中</span>
                        <span class="tab-badge" id="current-count">0</span>
                    </div>
                </button>
                <button class="order-tab" data-tab="history" onclick="ordersPage.switchTab('history')">
                    <div class="tab-icon">
                        <i class="fas fa-history"></i>
                    </div>
                    <div class="tab-content">
                        <span class="tab-label">歷史訂單</span>
                        <span class="tab-badge" id="history-count">0</span>
                    </div>
                </button>
            </div>

            <!-- Orders Content -->
            <div class="orders-content">
                <!-- Current Orders Tab -->
                <div class="tab-content active" id="current-tab">
                    <div class="orders-list" id="current-orders-list">
                        <!-- Current orders will be loaded here -->
                    </div>
                </div>

                <!-- History Orders Tab -->
                <div class="tab-content" id="history-tab">
                    <div class="orders-filter">
                        <select id="history-filter" onchange="ordersPage.filterHistory()">
                            <option value="all">全部</option>
                            <option value="today">今天</option>
                            <option value="week">本週</option>
                            <option value="month">本月</option>
                        </select>
                    </div>
                    <div class="orders-list" id="history-orders-list">
                        <!-- History orders will be loaded here -->
                    </div>
                </div>
            </div>

            <!-- Order Detail Modal -->
            <div class="modal-overlay hidden" id="order-detail-modal">
                <div class="order-detail-modal">
                    <div class="modal-header">
                        <h3>訂單詳情</h3>
                        <button class="modal-close" onclick="ordersPage.hideOrderDetail()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content" id="order-detail-content">
                        <!-- Order detail will be loaded here -->
                    </div>
                </div>
            </div>

            <!-- Cancel Order Modal -->
            <div class="modal-overlay hidden" id="cancel-order-modal">
                <div class="cancel-order-modal">
                    <div class="modal-header">
                        <h3>取消訂單</h3>
                        <button class="modal-close" onclick="ordersPage.hideCancelModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        <p>確定要取消這個訂單嗎？</p>
                        <div class="cancel-reasons">
                            <p>請選擇取消原因:</p>
                            <label class="reason-option">
                                <input type="radio" name="cancel-reason" value="changed-mind">
                                <span>改變主意</span>
                            </label>
                            <label class="reason-option">
                                <input type="radio" name="cancel-reason" value="wrong-order">
                                <span>點錯菜品</span>
                            </label>
                            <label class="reason-option">
                                <input type="radio" name="cancel-reason" value="too-long">
                                <span>等候時間太長</span>
                            </label>
                            <label class="reason-option">
                                <input type="radio" name="cancel-reason" value="other">
                                <span>其他原因</span>
                            </label>
                        </div>
                        <textarea id="cancel-reason-text" placeholder="請詳細說明取消原因..." rows="3"></textarea>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="ordersPage.hideCancelModal()">保留訂單</button>
                        <button class="btn btn-danger" onclick="ordersPage.confirmCancelOrder()">確定取消</button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    async initializeOrdersPage() {
        try {
            this.isLoading = true;
            
            await this.loadOrders();
            this.setupEventListeners();
            this.updateDisplay();
            this.startAutoRefresh();
            
        } catch (error) {
            console.error('Failed to initialize orders page:', error);
            toast.error('載入訂單時發生錯誤');
        } finally {
            this.isLoading = false;
        }
    }

    async loadOrders() {
        const user = Storage.getUser();
        if (!user) {
            app.navigateTo('login');
            return;
        }

        try {
            this.orders = await api.getCustomerOrders(user.userId);
            
            // Cache orders locally
            this.orders.forEach(order => {
                Storage.cacheOrder(order);
            });
            
        } catch (error) {
            console.error('Failed to load orders:', error);
            
            // Load from cache if API fails
            this.orders = Storage.getCachedOrders();
            if (this.orders.length === 0) {
                throw error;
            }
        }
    }

    setupEventListeners() {
        // Auto refresh current orders every 30 seconds
        this.refreshInterval = setInterval(() => {
            if (this.activeTab === 'current') {
                this.refreshCurrentOrders();
            }
        }, 30000);

        // Handle page visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.activeTab === 'current') {
                this.refreshCurrentOrders();
            }
        });
    }

    updateDisplay() {
        this.updateTabCounts();
        this.renderCurrentOrders();
        this.renderHistoryOrders();
    }

    updateTabCounts() {
        const currentOrders = this.getCurrentOrders();
        const historyOrders = this.getHistoryOrders();
        
        const currentCount = document.getElementById('current-count');
        const historyCount = document.getElementById('history-count');
        
        if (currentCount) {
            currentCount.textContent = currentOrders.length;
            currentCount.style.display = currentOrders.length > 0 ? 'inline' : 'none';
        }
        
        if (historyCount) {
            historyCount.textContent = historyOrders.length;
            historyCount.style.display = historyOrders.length > 0 ? 'inline' : 'none';
        }
    }

    getCurrentOrders() {
        const activeStatuses = ['PENDING_PAYMENT', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY'];
        return this.orders.filter(order => activeStatuses.includes(order.status));
    }

    getHistoryOrders() {
        const inactiveStatuses = ['DELIVERED', 'COMPLETED', 'CANCELLED'];
        return this.orders.filter(order => inactiveStatuses.includes(order.status));
    }

    renderCurrentOrders() {
        const container = document.getElementById('current-orders-list');
        if (!container) return;

        const currentOrders = this.getCurrentOrders();
        
        if (currentOrders.length === 0) {
            container.innerHTML = this.getEmptyStateHTML('current');
        } else {
            const sortedOrders = currentOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            container.innerHTML = sortedOrders.map(order => this.renderOrderCard(order, true)).join('');
        }
    }

    renderHistoryOrders() {
        const container = document.getElementById('history-orders-list');
        if (!container) return;

        let historyOrders = this.getHistoryOrders();
        
        // Apply filter
        const filter = document.getElementById('history-filter')?.value || 'all';
        historyOrders = this.applyHistoryFilter(historyOrders, filter);
        
        if (historyOrders.length === 0) {
            container.innerHTML = this.getEmptyStateHTML('history');
        } else {
            const sortedOrders = historyOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            container.innerHTML = this.renderOrdersByDateGroups(sortedOrders);
        }
    }

    renderOrdersByDateGroups(orders) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const groups = {
            today: [],
            yesterday: [],
            thisWeek: [],
            older: []
        };

        // Group orders by date
        orders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
            
            if (orderDay.getTime() === today.getTime()) {
                groups.today.push(order);
            } else if (orderDay.getTime() === yesterday.getTime()) {
                groups.yesterday.push(order);
            } else if (orderDate >= weekAgo) {
                groups.thisWeek.push(order);
            } else {
                groups.older.push(order);
            }
        });

        let html = '';
        
        // Render each group with headers
        if (groups.today.length > 0) {
            html += `
                <div class="orders-date-group">
                    <div class="date-group-header">
                        <i class="fas fa-calendar-day"></i>
                        <h4>📅 今天</h4>
                    </div>
                    <div class="date-group-orders">
                        ${groups.today.map(order => this.renderHistoryOrderCard(order)).join('')}
                    </div>
                </div>
            `;
        }

        if (groups.yesterday.length > 0) {
            html += `
                <div class="orders-date-group">
                    <div class="date-group-header">
                        <i class="fas fa-calendar-minus"></i>
                        <h4>📅 昨天</h4>
                    </div>
                    <div class="date-group-orders">
                        ${groups.yesterday.map(order => this.renderHistoryOrderCard(order)).join('')}
                    </div>
                </div>
            `;
        }

        if (groups.thisWeek.length > 0) {
            html += `
                <div class="orders-date-group">
                    <div class="date-group-header">
                        <i class="fas fa-calendar-week"></i>
                        <h4>📅 本週</h4>
                    </div>
                    <div class="date-group-orders">
                        ${groups.thisWeek.map(order => this.renderHistoryOrderCard(order)).join('')}
                    </div>
                </div>
            `;
        }

        if (groups.older.length > 0) {
            html += `
                <div class="orders-date-group">
                    <div class="date-group-header">
                        <i class="fas fa-calendar-alt"></i>
                        <h4>📅 更早</h4>
                    </div>
                    <div class="date-group-orders">
                        ${groups.older.map(order => this.renderHistoryOrderCard(order)).join('')}
                    </div>
                </div>
            `;
        }

        return html;
    }

    renderHistoryOrderCard(order) {
        const statusInfo = Helpers.getOrderStatusInfo(order.status);
        const orderTime = Helpers.formatDateTime(order.createdAt);
        
        return `
            <div class="history-order-card" onclick="ordersPage.showOrderDetail('${order.orderId}')">
                <div class="history-order-header">
                    <div class="order-id-section">
                        <span class="order-id">#${order.orderId}</span>
                        <span class="order-status ${order.status.toLowerCase()}">
                            <i class="fas fa-${statusInfo.icon}"></i>
                            ${statusInfo.text}
                        </span>
                    </div>
                    <div class="order-time">${orderTime}</div>
                </div>
                
                <div class="history-order-summary">
                    <div class="order-items-count">
                        <i class="fas fa-utensils"></i>
                        <span>${order.items ? order.items.length : 0} 項商品</span>
                    </div>
                    <div class="order-amount">
                        <span class="amount">${Helpers.formatCurrency(order.totalAmount)}</span>
                    </div>
                </div>

                <div class="history-order-actions">
                    <button class="btn btn-outline btn-small" onclick="event.stopPropagation(); ordersPage.showOrderDetail('${order.orderId}')">
                        <i class="fas fa-eye"></i>
                        查看詳情
                    </button>
                    <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); ordersPage.reorderItems('${order.orderId}')">
                        <i class="fas fa-redo"></i>
                        再次訂購
                    </button>
                </div>
            </div>
        `;
    }

    applyHistoryFilter(orders, filter) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (filter) {
            case 'today':
                return orders.filter(order => new Date(order.createdAt) >= today);
            case 'week':
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                return orders.filter(order => new Date(order.createdAt) >= weekAgo);
            case 'month':
                const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                return orders.filter(order => new Date(order.createdAt) >= monthAgo);
            default:
                return orders;
        }
    }

    renderOrderCard(order, isCurrent) {
        const statusInfo = Helpers.getOrderStatusInfo(order.status);
        const orderTime = Helpers.formatDateTime(order.createdAt);
        const timeAgo = Helpers.getTimeAgo(order.createdAt);
        
        // Calculate estimated completion time
        let estimatedTime = '';
        if (order.estimatedCompletionTime) {
            estimatedTime = Helpers.formatTime(order.estimatedCompletionTime);
        }

        // Get status theme color
        const statusClass = this.getStatusClass(order.status);

        return `
            <div class="enhanced-order-card ${statusClass}" onclick="ordersPage.showOrderDetail('${order.orderId}')">
                <div class="order-status-indicator"></div>
                
                <div class="order-card-header">
                    <div class="order-primary-info">
                        <div class="order-number-section">
                            <i class="fas fa-hashtag"></i>
                            <span class="order-number">${order.orderId}</span>
                        </div>
                        <div class="table-info-section">
                            <i class="fas fa-table"></i>
                            <span class="table-number">桌號 ${order.tableNumber}</span>
                        </div>
                    </div>
                    <div class="order-status-badge ${order.status.toLowerCase()}">
                        <i class="fas fa-${statusInfo.icon}"></i>
                        <span>${statusInfo.text}</span>
                    </div>
                </div>

                <div class="order-items-preview">
                    <div class="items-header">
                        <i class="fas fa-utensils"></i>
                        <span>訂單內容</span>
                    </div>
                    <div class="items-list">
                        ${(order.items && order.items.length > 0) ? order.items.slice(0, 3).map(item => `
                            <div class="order-item-preview">
                                <span class="item-name">${item.menuItem ? item.menuItem.name : '未知商品'}</span>
                                <span class="item-quantity">×${item.quantity || 0}</span>
                            </div>
                        `).join('') : `
                            <div class="order-item-preview">
                                <span class="item-name">訂單詳情載入中...</span>
                                <span class="item-quantity"></span>
                            </div>
                        `}
                        ${(order.items && order.items.length > 3) ? `
                            <div class="more-items-indicator">
                                <i class="fas fa-ellipsis-h"></i>
                                <span>還有 ${order.items.length - 3} 道菜</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="order-card-footer">
                    <div class="order-time-info">
                        <div class="time-primary">
                            <i class="fas fa-clock"></i>
                            <span>${orderTime}</span>
                        </div>
                        <div class="time-secondary">${timeAgo}</div>
                        ${estimatedTime ? `
                            <div class="estimated-time">
                                <i class="fas fa-hourglass-half"></i>
                                <span>預計完成: ${estimatedTime}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="order-amount-section">
                        <span class="amount-label">總計</span>
                        <span class="order-amount">${Helpers.formatCurrency(order.totalAmount)}</span>
                    </div>
                </div>

                ${isCurrent ? this.renderOrderActions(order) : ''}
            </div>
        `;
    }

    getStatusClass(status) {
        const statusMap = {
            'PENDING_PAYMENT': 'status-pending-payment',
            'PENDING': 'status-pending',
            'CONFIRMED': 'status-confirmed', 
            'PREPARING': 'status-preparing',
            'READY': 'status-ready',
            'DELIVERED': 'status-delivered',
            'COMPLETED': 'status-completed',
            'CANCELLED': 'status-cancelled'
        };
        return statusMap[status] || 'status-default';
    }

    renderOrderActions(order) {
        const canCancel = ['PENDING_PAYMENT', 'PENDING', 'CONFIRMED'].includes(order.status);
        const canTrack = ['PREPARING', 'READY'].includes(order.status);
        
        if (!canCancel && !canTrack) return '';

        return `
            <div class="order-actions"">
                ${canTrack ? `<button class="btn btn-outline btn-small" onclick="ordersPage.trackOrder('${order.orderId}')">追蹤訂單</button>` : ''}
                ${canCancel ? `<button class="btn btn-danger btn-small" onclick="ordersPage.showCancelModal('${order.orderId}')">取消訂單</button>` : ''}
            </div>
        `;
    }

    getEmptyStateHTML(type) {
        if (type === 'current') {
            return `
                <div class="empty-orders">
                    <div class="empty-icon">
                        <i class="fas fa-clipboard-list"></i>
                    </div>
                    <h3>沒有進行中的訂單</h3>
                    <p>您目前沒有進行中的訂單</p>
                    <button class="btn btn-primary" onclick="app.navigateTo('menu')">
                        <i class="fas fa-utensils"></i>
                        立即點餐
                    </button>
                </div>
            `;
        } else {
            return `
                <div class="empty-orders">
                    <div class="empty-icon">
                        <i class="fas fa-history"></i>
                    </div>
                    <h3>沒有歷史訂單</h3>
                    <p>您還沒有完成的訂單記錄</p>
                </div>
            `;
        }
    }

    // Tab switching
    switchTab(tabName) {
        this.activeTab = tabName;
        
        // Update tab buttons
        const tabBtns = document.querySelectorAll('.order-tab');
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update tab content
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });

        // Load data if needed
        if (tabName === 'current' && this.getCurrentOrders().length === 0) {
            this.refreshCurrentOrders();
        }
    }

    // Order detail modal
    async showOrderDetail(orderId) {
        try {
            const order = this.orders.find(o => o.orderId === orderId);
            if (!order) {
                // Try to fetch from API
                const fetchedOrder = await api.getOrder(orderId);
                this.orders.push(fetchedOrder);
                this.currentOrder = fetchedOrder;
            } else {
                this.currentOrder = order;
            }

            this.renderOrderDetail();
            
            const modal = document.getElementById('order-detail-modal');
            if (modal) {
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }
            
        } catch (error) {
            console.error('Failed to load order detail:', error);
            toast.error('載入訂單詳情失敗');
        }
    }

    hideOrderDetail() {
        const modal = document.getElementById('order-detail-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
        this.currentOrder = null;
    }

    renderOrderDetail() {
        const container = document.getElementById('order-detail-content');
        if (!container || !this.currentOrder) return;

        const order = this.currentOrder;
        const statusInfo = Helpers.getOrderStatusInfo(order.status);
        
        container.innerHTML = `
            <div class="order-detail">
                <!-- Order Status Progress -->
                <div class="order-progress">
                    <h4>訂單狀態</h4>
                    ${this.renderOrderProgress(order.status)}
                </div>

                <!-- Order Information -->
                <div class="order-info">
                    <h4>訂單資訊</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="label">訂單編號:</span>
                            <span class="value">#${order.orderId}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">桌號:</span>
                            <span class="value">${order.tableNumber}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">下單時間:</span>
                            <span class="value">${Helpers.formatDateTime(order.createdAt)}</span>
                        </div>
                        ${order.estimatedCompletionTime ? `
                        <div class="info-item">
                            <span class="label">預計完成:</span>
                            <span class="value">${Helpers.formatTime(order.estimatedCompletionTime)}</span>
                        </div>
                        ` : ''}
                        <div class="info-item">
                            <span class="label">當前狀態:</span>
                            <span class="value" style="color: ${statusInfo.color}">
                                <i class="fas fa-${statusInfo.icon}"></i>
                                ${statusInfo.text}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Order Items -->
                <div class="order-items-detail">
                    <h4>訂單明細</h4>
                    ${(order.items && order.items.length > 0) ? order.items.map(item => `
                        <div class="order-item-detail">
                            <div class="item-info">
                                <h5>${item.menuItem ? item.menuItem.name : '未知商品'}</h5>
                                <p class="item-price">${Helpers.formatCurrency(item.price || 0)} × ${item.quantity || 0}</p>
                                ${item.specialRequests ? `<p class="item-requests">備註: ${item.specialRequests}</p>` : ''}
                            </div>
                            <div class="item-total">
                                ${Helpers.formatCurrency((item.price || 0) * (item.quantity || 0))}
                            </div>
                        </div>
                    `).join('') : `
                        <div class="order-item-detail">
                            <div class="item-info">
                                <h5>訂單詳情載入中...</h5>
                                <p class="item-price">請稍候</p>
                            </div>
                        </div>
                    `}
                </div>

                <!-- Order Summary -->
                <div class="order-summary-detail">
                    <div class="summary-row">
                        <span>小計</span>
                        <span>${Helpers.formatCurrency(order.totalAmount - Math.round(order.totalAmount * 0.1))}</span>
                    </div>
                    <div class="summary-row">
                        <span>稅金 (10%)</span>
                        <span>${Helpers.formatCurrency(Math.round(order.totalAmount * 0.1))}</span>
                    </div>
                    <div class="summary-row total-row">
                        <span>總計</span>
                        <span>${Helpers.formatCurrency(order.totalAmount)}</span>
                    </div>
                </div>

                <!-- Order Actions -->
                ${this.renderDetailActions(order)}
                
                <!-- Contact Restaurant Section -->
                <div class="contact-section">
                    <h4>需要協助？</h4>
                    <div class="contact-actions">
                        <button class="btn btn-outline" onclick="ordersPage.contactRestaurant('${order.orderId}')">
                            <i class="fas fa-phone"></i>
                            聯繫餐廳
                        </button>
                        <button class="btn btn-outline" onclick="ordersPage.viewTableLocation('${order.tableNumber}')">
                            <i class="fas fa-map-marker-alt"></i>
                            桌位位置
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderOrderProgress(status) {
        const steps = [
            { key: 'PENDING_PAYMENT', text: '等待付款', icon: 'credit-card', desc: '請完成付款' },
            { key: 'PENDING', text: '訂單確認', icon: 'clock', desc: '訂單處理中' },
            { key: 'CONFIRMED', text: '廚房接單', icon: 'check', desc: '廚房已確認' },
            { key: 'PREPARING', text: '正在製作', icon: 'utensils', desc: '正在烹飪中' },
            { key: 'READY', text: '製作完成', icon: 'bell', desc: '請取餐' },
            { key: 'DELIVERED', text: '已送達', icon: 'check-double', desc: '用餐愉快' }
        ];

        const currentIndex = steps.findIndex(step => step.key === status);
        const currentTime = new Date();
        
        return `
            <div class="progress-timeline">
                ${steps.map((step, index) => {
                    let stepClass = 'progress-step';
                    let timeInfo = '';
                    
                    if (index < currentIndex) {
                        stepClass += ' completed';
                        // 模擬已完成步驟的時間
                        const minutesAgo = (currentIndex - index) * 5;
                        timeInfo = `<span class="step-time">${minutesAgo}分鐘前</span>`;
                    } else if (index === currentIndex) {
                        stepClass += ' current';
                        if (status === 'PREPARING') {
                            timeInfo = `<span class="step-time estimate">預計還需15分鐘</span>`;
                        } else {
                            timeInfo = `<span class="step-time current">進行中</span>`;
                        }
                    } else {
                        stepClass += ' pending';
                    }
                    
                    if (status === 'CANCELLED') {
                        stepClass = index === 0 ? 'progress-step cancelled' : 'progress-step disabled';
                    }
                    
                    return `
                        <div class="${stepClass}">
                            <div class="step-connector"></div>
                            <div class="step-marker">
                                <div class="step-icon">
                                    ${index < currentIndex || (index === currentIndex && status !== 'CANCELLED') ? 
                                      `<i class="fas fa-${step.icon}"></i>` : 
                                      `<i class="fas fa-${step.icon}"></i>`
                                    }
                                </div>
                            </div>
                            <div class="step-content">
                                <div class="step-title">${index < currentIndex ? '✅' : (index === currentIndex ? '🔄' : '⏳')} ${step.text}</div>
                                <div class="step-description">${step.desc}</div>
                                ${timeInfo}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderDetailActions(order) {
        const canCancel = ['PENDING_PAYMENT', 'PENDING', 'CONFIRMED'].includes(order.status);
        const canReorder = ['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status);
        
        if (!canCancel && !canReorder) return '';

        return `
            <div class="detail-actions">
                ${canReorder ? `<button class="btn btn-outline" onclick="ordersPage.reorderItems('${order.orderId}')">再次訂購</button>` : ''}
                ${canCancel ? `<button class="btn btn-danger" onclick="ordersPage.showCancelModal('${order.orderId}')">取消訂單</button>` : ''}
            </div>
        `;
    }

    // Order actions
    async trackOrder(orderId) {
        // Real-time tracking could open a separate modal or navigate to tracking page
        this.showOrderDetail(orderId);
    }

    showCancelModal(orderId) {
        this.orderToCancel = orderId;
        
        const modal = document.getElementById('cancel-order-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    hideCancelModal() {
        const modal = document.getElementById('cancel-order-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
        this.orderToCancel = null;
    }

    async confirmCancelOrder() {
        if (!this.orderToCancel) return;

        const reason = document.querySelector('input[name="cancel-reason"]:checked')?.value;
        const reasonText = document.getElementById('cancel-reason-text')?.value || '';

        if (!reason) {
            toast.warning('請選擇取消原因');
            return;
        }

        try {
            await api.cancelOrder(this.orderToCancel, {
                reason,
                description: reasonText
            });

            // Update local order status
            const order = this.orders.find(o => o.orderId === this.orderToCancel);
            if (order) {
                order.status = 'CANCELLED';
            }

            this.hideCancelModal();
            this.updateDisplay();
            toast.success('訂單已取消');
            
        } catch (error) {
            console.error('Failed to cancel order:', error);
            toast.error('取消訂單失敗，請聯繫客服');
        }
    }

    async reorderItems(orderId) {
        try {
            const order = this.orders.find(o => o.orderId === orderId);
            if (!order || !order.items || order.items.length === 0) {
                toast.warning('訂單資料不完整，無法重新訂購');
                return;
            }

            // Add items to cart
            order.items.forEach(item => {
                if (item && item.menuItem) {
                    cart.addItem({
                        id: item.menuItem.itemId,
                        name: item.menuItem.name,
                        price: item.price,
                        imageUrl: item.menuItem.imageUrl,
                        description: item.menuItem.description
                    }, item.quantity, item.specialRequests);
                }
            });

            toast.success('商品已加入購物車');
            app.navigateTo('cart');
            
        } catch (error) {
            console.error('Failed to reorder:', error);
            toast.error('重新訂購失敗');
        }
    }

    // Data refresh
    async refreshOrders() {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            await this.loadOrders();
            this.updateDisplay();
            toast.success('訂單已更新');
            
        } catch (error) {
            console.error('Failed to refresh orders:', error);
            toast.error('更新失敗');
        } finally {
            this.isLoading = false;
        }
    }

    async refreshCurrentOrders() {
        // Silent refresh for current orders only
        try {
            const user = Storage.getUser();
            if (!user) return;

            const currentOrderIds = this.getCurrentOrders().map(o => o.orderId);
            const updates = await Promise.all(
                currentOrderIds.map(id => api.getOrder(id).catch(() => null))
            );

            // Update orders with fresh data
            updates.forEach(updatedOrder => {
                if (updatedOrder) {
                    const index = this.orders.findIndex(o => o.orderId === updatedOrder.orderId);
                    if (index !== -1) {
                        this.orders[index] = updatedOrder;
                    }
                }
            });

            this.updateDisplay();
            
        } catch (error) {
            console.error('Silent refresh failed:', error);
        }
    }

    filterHistory() {
        this.renderHistoryOrders();
    }

    startAutoRefresh() {
        // Start auto refresh when page becomes visible
        if (!document.hidden) {
            this.refreshInterval = setInterval(() => {
                if (this.activeTab === 'current') {
                    this.refreshCurrentOrders();
                }
            }, 30000);
        }
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // Contact restaurant functionality
    contactRestaurant(orderId) {
        const order = this.orders.find(o => o.orderId === orderId);
        if (!order) return;
        
        const contactInfo = `
            <div class="restaurant-contact">
                <div class="contact-header">
                    <i class="fas fa-phone-alt"></i>
                    <h4>聯絡餐廳</h4>
                </div>
                <div class="contact-info">
                    <p><strong>訂單編號:</strong> #${orderId}</p>
                    <p><strong>桌號:</strong> ${order.tableNumber}</p>
                    <hr>
                    <div class="contact-methods">
                        <a href="tel:+886-2-1234-5678" class="contact-method">
                            <i class="fas fa-phone"></i>
                            <span>電話: 02-1234-5678</span>
                        </a>
                        <button class="contact-method" onclick="ordersPage.callWaiter('${order.tableNumber}')">
                            <i class="fas fa-bell"></i>
                            <span>呼叫服務生</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        modal.show(contactInfo, {
            title: '聯絡餐廳',
            size: 'small'
        });
    }
    
    async callWaiter(tableNumber) {
        try {
            // 模擬呼叫服務生API
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success(`已通知服務生前往桌號 ${tableNumber}`);
        } catch (error) {
            console.error('Failed to call waiter:', error);
            toast.error('呼叫服務生失敗，請直接聯繫餐廳');
        }
    }
    
    viewTableLocation(tableNumber) {
        const locationInfo = `
            <div class="table-location">
                <div class="location-header">
                    <i class="fas fa-map-marker-alt"></i>
                    <h4>桌位位置</h4>
                </div>
                <div class="location-content">
                    <div class="table-map">
                        <div class="restaurant-layout">
                            <div class="table-indicator table-${tableNumber}">
                                <span>${tableNumber}</span>
                            </div>
                        </div>
                    </div>
                    <div class="location-description">
                        <p><strong>桌號 ${tableNumber}</strong></p>
                        <p>位於餐廳${this.getTableLocation(tableNumber)}</p>
                        <p class="location-hint">如需協助找到座位，請聯繫服務生</p>
                    </div>
                </div>
            </div>
        `;
        
        modal.show(locationInfo, {
            title: '桌位位置',
            size: 'medium'
        });
    }
    
    getTableLocation(tableNumber) {
        // 簡單的桌位區域對應
        const table = parseInt(tableNumber);
        if (table <= 4) return '靠窗區域';
        if (table <= 8) return '中央用餐區';
        if (table <= 12) return '包廂區域';
        return '其他區域';
    }

    // Cleanup when leaving page
    cleanup() {
        this.stopAutoRefresh();
    }
}

// Create global orders page instance
window.ordersPage = new OrdersPage();