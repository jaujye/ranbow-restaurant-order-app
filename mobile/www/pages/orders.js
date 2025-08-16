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
                <h2>我的訂單</h2>
                <button class="refresh-btn" onclick="ordersPage.refreshOrders()">
                    <i class="fas fa-sync-alt"></i>
                </button>
            </div>

            <!-- Order Tabs -->
            <div class="order-tabs">
                <button class="tab-btn active" data-tab="current" onclick="ordersPage.switchTab('current')">
                    <i class="fas fa-clock"></i>
                    進行中
                    <span class="tab-badge" id="current-count">0</span>
                </button>
                <button class="tab-btn" data-tab="history" onclick="ordersPage.switchTab('history')">
                    <i class="fas fa-history"></i>
                    歷史訂單
                    <span class="tab-badge" id="history-count">0</span>
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
            console.log('Initializing orders page...');
            this.isLoading = true;
            
            await this.loadOrders();
            console.log('Orders loaded:', this.orders.length);
            
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
        console.log('Loading orders for user:', user);
        if (!user) {
            console.log('No user found, redirecting to login');
            app.navigateTo('login');
            return;
        }

        try {
            console.log('Fetching orders from API for customer:', user.userId);
            const response = await api.getCustomerOrders(user.userId);
            console.log('API response:', response);
            this.orders = response || [];
            
            // Cache orders locally
            this.orders.forEach(order => {
                Storage.cacheOrder(order);
            });
            
        } catch (error) {
            console.error('Failed to load orders:', error);
            console.error('Error details:', error.message, error.stack);
            
            // Load from cache if API fails
            this.orders = Storage.getCachedOrders() || [];
            console.log('Loaded from cache:', this.orders.length, 'orders');
            
            // Show user-friendly message for empty orders vs API error
            if (this.orders.length === 0) {
                console.warn('No orders found in API or cache');
                // Don't throw error - just show empty state
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
        const activeStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'];
        return this.orders.filter(order => activeStatuses.includes(order.status));
    }

    getHistoryOrders() {
        const inactiveStatuses = ['DELIVERED', 'CANCELLED'];
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
            container.innerHTML = sortedOrders.map(order => this.renderOrderCard(order, false)).join('');
        }
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

        return `
            <div class="order-card ${order.status.toLowerCase()}" onclick="ordersPage.showOrderDetail('${order.orderId}')">
                <div class="order-header">
                    <div class="order-id">
                        <span class="order-number">#${order.orderId}</span>
                        <span class="table-number">桌號 ${order.tableNumber}</span>
                    </div>
                    <div class="order-status" style="color: ${statusInfo.color}">
                        <i class="fas fa-${statusInfo.icon}"></i>
                        ${statusInfo.text}
                    </div>
                </div>

                <div class="order-items">
                    ${order.items.slice(0, 3).map(item => `
                        <div class="order-item-summary">
                            <span class="item-name">${item.menuItem.name}</span>
                            <span class="item-quantity">×${item.quantity}</span>
                        </div>
                    `).join('')}
                    ${order.items.length > 3 ? `<div class="more-items">還有 ${order.items.length - 3} 道菜...</div>` : ''}
                </div>

                <div class="order-footer">
                    <div class="order-time">
                        <div class="created-time">${orderTime}</div>
                        <div class="time-ago">${timeAgo}</div>
                        ${estimatedTime ? `<div class="estimated-time">預計完成: ${estimatedTime}</div>` : ''}
                    </div>
                    
                    <div class="order-amount">
                        ${Helpers.formatCurrency(order.totalAmount)}
                    </div>
                </div>

                ${isCurrent ? this.renderOrderActions(order) : ''}
            </div>
        `;
    }

    renderOrderActions(order) {
        const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);
        const canTrack = ['PREPARING', 'READY'].includes(order.status);
        
        if (!canCancel && !canTrack) return '';

        return `
            <div class="order-actions" onclick="event.stopPropagation()">
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
        const tabBtns = document.querySelectorAll('.tab-btn');
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
                    ${order.items.map(item => `
                        <div class="order-item-detail">
                            <div class="item-info">
                                <h5>${item.menuItem.name}</h5>
                                <p class="item-price">${Helpers.formatCurrency(item.price)} × ${item.quantity}</p>
                                ${item.specialRequests ? `<p class="item-requests">備註: ${item.specialRequests}</p>` : ''}
                            </div>
                            <div class="item-total">
                                ${Helpers.formatCurrency(item.price * item.quantity)}
                            </div>
                        </div>
                    `).join('')}
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
            </div>
        `;
    }

    renderOrderProgress(status) {
        const steps = [
            { key: 'PENDING', text: '訂單確認', icon: 'clock' },
            { key: 'CONFIRMED', text: '廚房接單', icon: 'check' },
            { key: 'PREPARING', text: '正在製作', icon: 'utensils' },
            { key: 'READY', text: '製作完成', icon: 'bell' },
            { key: 'DELIVERED', text: '已送達', icon: 'check-double' }
        ];

        const currentIndex = steps.findIndex(step => step.key === status);
        
        return `
            <div class="progress-steps">
                ${steps.map((step, index) => {
                    let stepClass = 'step';
                    if (index < currentIndex) stepClass += ' completed';
                    if (index === currentIndex) stepClass += ' current';
                    if (status === 'CANCELLED') stepClass = index === 0 ? 'step cancelled' : 'step';
                    
                    return `
                        <div class="${stepClass}">
                            <div class="step-icon">
                                <i class="fas fa-${step.icon}"></i>
                            </div>
                            <div class="step-text">${step.text}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderDetailActions(order) {
        const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);
        const canReorder = ['DELIVERED', 'CANCELLED'].includes(order.status);
        
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
            if (!order) return;

            // Add items to cart
            order.items.forEach(item => {
                cart.addItem({
                    id: item.menuItem.itemId,
                    name: item.menuItem.name,
                    price: item.price,
                    imageUrl: item.menuItem.imageUrl,
                    description: item.menuItem.description
                }, item.quantity, item.specialRequests);
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

    // Cleanup when leaving page
    cleanup() {
        this.stopAutoRefresh();
    }
}

// Create global orders page instance
window.ordersPage = new OrdersPage();