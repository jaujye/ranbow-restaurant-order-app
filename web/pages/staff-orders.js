// Staff Order Management - Order listing, filtering, and detail view

class StaffOrders {
    constructor() {
        this.currentFilter = 'all';
        this.currentDate = new Date().toISOString().split('T')[0];
        this.orders = [];
        this.selectedOrder = null;
        this.refreshInterval = null;
        
        // Order status color mapping as per specification
        this.statusColors = {
            'EMERGENCY': { color: '#FF4444', label: '緊急/超時', icon: 'fas fa-exclamation-triangle' },
            'IN_PROGRESS': { color: '#FFAA00', label: '進行中', icon: 'fas fa-utensils' },
            'COMPLETED': { color: '#00AA00', label: '已完成', icon: 'fas fa-check-circle' },
            'PENDING': { color: '#0088FF', label: '待處理', icon: 'fas fa-clock' },
            'CANCELLED': { color: '#888888', label: '已取消', icon: 'fas fa-times-circle' }
        };
    }

    getOrdersPageTemplate() {
        return `
        <div class="staff-orders">
            <!-- Header -->
            <div class="staff-orders-header">
                <div class="header-left">
                    <button class="back-btn" onclick="app.goBack()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h2>訂單管理</h2>
                </div>
                <div class="header-actions">
                    <button class="search-btn" onclick="staffOrders.showSearch()">
                        <i class="fas fa-search"></i>
                    </button>
                    <button class="settings-btn" onclick="staffOrders.showFilterSettings()">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            </div>

            <!-- Filter Tabs -->
            <div class="order-filter-tabs">
                <button class="filter-tab ${this.currentFilter === 'all' ? 'active' : ''}" 
                        data-filter="all" onclick="staffOrders.setFilter('all')">
                    全部
                </button>
                <button class="filter-tab ${this.currentFilter === 'pending' ? 'active' : ''}" 
                        data-filter="pending" onclick="staffOrders.setFilter('pending')">
                    待處理
                </button>
                <button class="filter-tab ${this.currentFilter === 'in-progress' ? 'active' : ''}" 
                        data-filter="in-progress" onclick="staffOrders.setFilter('in-progress')">
                    進行中
                </button>
                <button class="filter-tab ${this.currentFilter === 'completed' ? 'active' : ''}" 
                        data-filter="completed" onclick="staffOrders.setFilter('completed')">
                    已完成
                </button>
                <button class="filter-tab ${this.currentFilter === 'cancelled' ? 'active' : ''}" 
                        data-filter="cancelled" onclick="staffOrders.setFilter('cancelled')">
                    已取消
                </button>
            </div>

            <!-- Date Selector -->
            <div class="date-selector">
                <i class="fas fa-calendar"></i>
                <input type="date" id="order-date" value="${this.currentDate}" 
                       onchange="staffOrders.changeDate(this.value)">
                <button class="today-btn" onclick="staffOrders.setToday()">今日</button>
            </div>

            <!-- Orders List -->
            <div class="orders-list" id="orders-list">
                ${this.getOrdersListHTML()}
            </div>

            <!-- Order Detail Modal -->
            <div class="order-detail-modal" id="order-detail-modal" style="display: none;">
                <div class="modal-content" id="order-detail-content">
                    <!-- Order detail content will be populated here -->
                </div>
            </div>

            <!-- Status Update Modal -->
            <div class="status-update-modal" id="status-update-modal" style="display: none;">
                <div class="modal-content" id="status-update-content">
                    <!-- Status update content will be populated here -->
                </div>
            </div>
        </div>`;
    }

    getOrdersListHTML() {
        const filteredOrders = this.getFilteredOrders();
        
        if (filteredOrders.length === 0) {
            return `
                <div class="no-orders">
                    <div class="no-orders-icon">
                        <i class="fas fa-clipboard-list"></i>
                    </div>
                    <h3>沒有找到訂單</h3>
                    <p>在「${this.getFilterLabel()}」分類中沒有找到訂單</p>
                    <button class="btn btn-primary" onclick="staffOrders.setFilter('all')">
                        查看全部訂單
                    </button>
                </div>
            `;
        }

        return filteredOrders.map(order => {
            const statusInfo = this.getOrderStatusInfo(order);
            const isEmergency = this.isEmergencyOrder(order);
            
            return `
                <div class="order-card ${isEmergency ? 'emergency' : ''}" 
                     data-order-id="${order.id}"
                     onclick="staffOrders.showOrderDetail('${order.id}')">
                    <div class="order-status-indicator" style="background-color: ${statusInfo.color}">
                        <i class="${statusInfo.icon}"></i>
                    </div>
                    
                    <div class="order-header">
                        <div class="order-id-table">
                            <span class="order-id">#${order.id}</span>
                            <span class="table-number">桌號:${order.tableNumber}</span>
                        </div>
                        <div class="order-time">
                            <i class="fas fa-clock"></i>
                            <span>${this.formatOrderTime(order)}</span>
                        </div>
                    </div>
                    
                    <div class="order-items">
                        ${order.items.slice(0, 3).map(item => `${item.name}×${item.quantity}`).join(', ')}
                        ${order.items.length > 3 ? ` +${order.items.length - 3}項` : ''}
                    </div>
                    
                    <div class="order-footer">
                        <div class="order-total">
                            <i class="fas fa-dollar-sign"></i>
                            <span>NT$ ${order.totalAmount}</span>
                        </div>
                        <div class="order-actions">
                            ${this.getOrderActionButtons(order)}
                        </div>
                    </div>
                    
                    ${isEmergency ? `
                        <div class="emergency-badge">
                            <i class="fas fa-exclamation-triangle"></i>
                            緊急處理
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    getOrderDetailTemplate(order) {
        const statusInfo = this.getOrderStatusInfo(order);
        const isEmergency = this.isEmergencyOrder(order);
        
        return `
            <div class="order-detail-header">
                <button class="modal-close-btn" onclick="staffOrders.hideOrderDetail()">
                    <i class="fas fa-times"></i>
                </button>
                <h3>訂單 #${order.id}</h3>
            </div>
            
            <div class="order-detail-body">
                <!-- Order Status -->
                <div class="order-status-section">
                    <h4>📊 訂單狀態</h4>
                    <div class="status-info-card ${isEmergency ? 'emergency' : ''}">
                        <div class="status-badge" style="background-color: ${statusInfo.color}">
                            <i class="${statusInfo.icon}"></i>
                            <span>${statusInfo.label}</span>
                        </div>
                        ${isEmergency ? `
                            <div class="emergency-info">
                                <i class="fas fa-clock text-danger"></i>
                                <span>超時 ${this.getOvertimeMinutes(order)} 分鐘</span>
                            </div>
                        ` : ''}
                        <div class="order-basic-info">
                            <div class="info-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>桌號: ${order.tableNumber}</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-user"></i>
                                <span>顾客: ${order.customerName || '訪客'}</span>
                            </div>
                            ${order.customerPhone ? `
                                <div class="info-item">
                                    <i class="fas fa-phone"></i>
                                    <span>${order.customerPhone}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <!-- Menu Items -->
                <div class="order-items-section">
                    <h4>🍽️ 菜品詳情</h4>
                    <div class="items-detail-list">
                        ${order.items.map(item => `
                            <div class="item-detail-card">
                                <div class="item-info">
                                    <div class="item-name">${item.name} × ${item.quantity}</div>
                                    <div class="item-cooking-time">
                                        <i class="fas fa-clock"></i>
                                        <span>${item.cookingTime || '25'}分鐘</span>
                                    </div>
                                    ${item.notes ? `
                                        <div class="item-notes">
                                            <i class="fas fa-comment"></i>
                                            <span>${item.notes}</span>
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="item-price">
                                    NT$ ${item.price * item.quantity}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Order Notes -->
                ${order.notes ? `
                    <div class="order-notes-section">
                        <h4>📝 整單備註</h4>
                        <div class="notes-card">
                            <p>"${order.notes}"</p>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Time Records -->
                <div class="time-records-section">
                    <h4>⏰ 時間記錄</h4>
                    <div class="time-records">
                        <div class="time-record">
                            <span class="time-label">下單時間:</span>
                            <span class="time-value">${this.formatDateTime(order.createdAt)}</span>
                        </div>
                        ${order.acceptedAt ? `
                            <div class="time-record">
                                <span class="time-label">接單時間:</span>
                                <span class="time-value">${this.formatDateTime(order.acceptedAt)}</span>
                            </div>
                        ` : ''}
                        ${order.estimatedCompletionTime ? `
                            <div class="time-record estimated">
                                <span class="time-label">預計完成:</span>
                                <span class="time-value">${this.formatDateTime(order.estimatedCompletionTime)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <div class="order-detail-actions">
                ${this.getDetailActionButtons(order)}
            </div>
        `;
    }

    getStatusUpdateTemplate(order) {
        const currentStatus = order.status;
        const availableStatuses = this.getAvailableStatuses(order);
        
        return `
            <div class="status-update-header">
                <button class="modal-close-btn" onclick="staffOrders.hideStatusUpdate()">
                    <i class="fas fa-times"></i>
                </button>
                <h3>🔄 更新訂單狀態</h3>
            </div>
            
            <div class="status-update-body">
                <div class="current-status">
                    <p>當前狀態: <strong>${this.statusColors[currentStatus]?.label || currentStatus}</strong></p>
                </div>
                
                <div class="status-options">
                    <p>選擇新狀態:</p>
                    ${availableStatuses.map(status => `
                        <label class="status-option">
                            <input type="radio" name="newStatus" value="${status}" 
                                   ${status === currentStatus ? 'disabled' : ''}>
                            <div class="status-option-content">
                                <div class="status-indicator" style="background-color: ${this.statusColors[status].color}">
                                    <i class="${this.statusColors[status].icon}"></i>
                                </div>
                                <span>${this.statusColors[status].label}</span>
                            </div>
                        </label>
                    `).join('')}
                </div>
                
                <div class="update-notes">
                    <label class="form-label">
                        📝 備註 (可選):
                    </label>
                    <textarea 
                        class="form-textarea" 
                        id="status-update-notes" 
                        placeholder="輸入狀態更新備註..."
                        rows="3"></textarea>
                </div>
            </div>
            
            <div class="status-update-actions">
                <button class="btn btn-secondary" onclick="staffOrders.hideStatusUpdate()">
                    取消
                </button>
                <button class="btn btn-primary" onclick="staffOrders.confirmStatusUpdate('${order.id}')">
                    確認更新
                </button>
            </div>
        `;
    }

    initialize() {
        this.loadOrders();
        this.setupAutoRefresh();
    }

    async loadOrders() {
        try {
            let allOrders = [];

            // Load orders from different API endpoints based on filter
            if (this.currentFilter === 'all' || this.currentFilter === 'pending') {
                const pendingResponse = await api.staffRequest('/staff/orders/pending');
                if (pendingResponse.pending) {
                    allOrders = allOrders.concat(pendingResponse.pending);
                }
                if (pendingResponse.confirmed) {
                    allOrders = allOrders.concat(pendingResponse.confirmed);
                }
            }

            if (this.currentFilter === 'all' || this.currentFilter === 'in-progress') {
                const inProgressResponse = await api.staffRequest('/staff/orders/in-progress');
                if (inProgressResponse.preparing) {
                    allOrders = allOrders.concat(inProgressResponse.preparing);
                }
                if (inProgressResponse.ready) {
                    allOrders = allOrders.concat(inProgressResponse.ready);
                }
            }

            if (this.currentFilter === 'all' || this.currentFilter === 'completed') {
                const completedResponse = await api.staffRequest('/staff/orders/completed');
                if (completedResponse.delivered) {
                    allOrders = allOrders.concat(completedResponse.delivered);
                }
                if (completedResponse.completed) {
                    allOrders = allOrders.concat(completedResponse.completed);
                }
            }

            // Process and normalize order data
            this.orders = allOrders.map(order => this.normalizeOrderData(order));

            this.updateOrdersList();
            
        } catch (error) {
            console.error('Failed to load orders:', error);
            
            // Fallback to demo data if API fails
            this.loadDemoOrders();
            app.showToast('使用示範數據 - API連接失敗', 'warning');
        }
    }

    normalizeOrderData(order) {
        // Normalize different API response formats
        return {
            id: order.orderId || order.id,
            tableNumber: order.tableNumber || order.table_number || 1,
            customerName: order.customerName || order.customer_name || '顧客',
            customerPhone: order.customerPhone || order.customer_phone || '',
            status: this.mapOrderStatus(order.status),
            totalAmount: order.totalAmount || order.total_amount || 0,
            items: this.parseOrderItems(order.items || order.order_items || []),
            notes: order.notes || order.special_requests || '',
            createdAt: new Date(order.createdAt || order.created_at || order.orderTime),
            acceptedAt: order.acceptedAt ? new Date(order.acceptedAt) : null,
            completedAt: order.completedAt ? new Date(order.completedAt) : null,
            estimatedCompletionTime: order.estimatedCompletionTime ? new Date(order.estimatedCompletionTime) : null,
            overtimeMinutes: this.calculateOvertimeMinutes(order)
        };
    }

    mapOrderStatus(status) {
        // Map backend status to frontend status
        const statusMap = {
            'PENDING': 'PENDING',
            'CONFIRMED': 'PENDING',
            'PREPARING': 'IN_PROGRESS',
            'READY': 'COMPLETED',
            'DELIVERED': 'COMPLETED',
            'COMPLETED': 'COMPLETED',
            'CANCELLED': 'CANCELLED'
        };
        return statusMap[status] || 'PENDING';
    }

    parseOrderItems(items) {
        return items.map(item => ({
            name: item.menuItemName || item.name || item.item_name,
            quantity: item.quantity || 1,
            price: item.price || item.unit_price || 0,
            cookingTime: item.cookingTime || item.cooking_time || '25',
            notes: item.notes || item.special_requests || ''
        }));
    }

    calculateOvertimeMinutes(order) {
        if (!order.estimatedCompletionTime) return 0;
        
        const now = new Date();
        const estimated = new Date(order.estimatedCompletionTime);
        const diffMinutes = Math.floor((now - estimated) / (1000 * 60));
        
        return diffMinutes > 0 ? diffMinutes : 0;
    }

    loadDemoOrders() {
        // Fallback demo data
        this.orders = [
            {
                id: '12347',
                tableNumber: 3,
                customerName: '王先生',
                customerPhone: '0912-345-678',
                status: 'EMERGENCY',
                totalAmount: 940,
                items: [
                    { name: '招牌牛排', quantity: 2, price: 380, cookingTime: '25', notes: '不要洋蔥' },
                    { name: '蜜汁雞腿', quantity: 1, price: 180, cookingTime: '20', notes: '無特殊要求' }
                ],
                notes: '請盡快準備，謝謝',
                createdAt: new Date(Date.now() - 30 * 60000),
                acceptedAt: new Date(Date.now() - 29 * 60000),
                estimatedCompletionTime: new Date(Date.now() - 5 * 60000),
                overtimeMinutes: 5
            },
            {
                id: '12348',
                tableNumber: 5,
                status: 'IN_PROGRESS',
                totalAmount: 260,
                items: [{ name: '義式燉飯', quantity: 1, price: 260, cookingTime: '18' }],
                createdAt: new Date(Date.now() - 15 * 60000),
                acceptedAt: new Date(Date.now() - 14 * 60000),
                estimatedCompletionTime: new Date(Date.now() + 3 * 60000)
            }
        ];
    }

    setupAutoRefresh() {
        // Refresh orders every 60 seconds
        this.refreshInterval = setInterval(() => {
            this.loadOrders();
        }, 60000);
    }

    cleanup() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    updateOrdersList() {
        const ordersListEl = document.getElementById('orders-list');
        if (ordersListEl) {
            ordersListEl.innerHTML = this.getOrdersListHTML();
        }
    }

    getFilteredOrders() {
        let filtered = this.orders;
        
        // Filter by status
        if (this.currentFilter !== 'all') {
            const filterMap = {
                'pending': ['PENDING'],
                'in-progress': ['IN_PROGRESS', 'EMERGENCY'],
                'completed': ['COMPLETED'],
                'cancelled': ['CANCELLED']
            };
            
            const allowedStatuses = filterMap[this.currentFilter] || [];
            filtered = filtered.filter(order => allowedStatuses.includes(order.status));
        }
        
        // Filter by date (if needed)
        // const selectedDate = new Date(this.currentDate);
        // filtered = filtered.filter(order => {
        //     const orderDate = new Date(order.createdAt);
        //     return orderDate.toDateString() === selectedDate.toDateString();
        // });
        
        // Sort orders: emergency first, then by creation time
        return filtered.sort((a, b) => {
            if (a.status === 'EMERGENCY' && b.status !== 'EMERGENCY') return -1;
            if (b.status === 'EMERGENCY' && a.status !== 'EMERGENCY') return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.filter === filter) {
                tab.classList.add('active');
            }
        });
        
        this.updateOrdersList();
    }

    changeDate(date) {
        this.currentDate = date;
        this.loadOrders();
    }

    setToday() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('order-date');
        if (dateInput) {
            dateInput.value = today;
            this.changeDate(today);
        }
    }

    showOrderDetail(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;
        
        this.selectedOrder = order;
        const modal = document.getElementById('order-detail-modal');
        const content = document.getElementById('order-detail-content');
        
        if (modal && content) {
            content.innerHTML = this.getOrderDetailTemplate(order);
            modal.style.display = 'flex';
        }
    }

    hideOrderDetail() {
        const modal = document.getElementById('order-detail-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.selectedOrder = null;
    }

    showStatusUpdate(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;
        
        this.selectedOrder = order;
        const modal = document.getElementById('status-update-modal');
        const content = document.getElementById('status-update-content');
        
        if (modal && content) {
            content.innerHTML = this.getStatusUpdateTemplate(order);
            modal.style.display = 'flex';
        }
    }

    hideStatusUpdate() {
        const modal = document.getElementById('status-update-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async confirmStatusUpdate(orderId) {
        try {
            const selectedStatus = document.querySelector('input[name="newStatus"]:checked')?.value;
            const notes = document.getElementById('status-update-notes')?.value;
            
            if (!selectedStatus) {
                app.showToast('請選擇新狀態', 'warning');
                return;
            }
            
            // Update order status
            await this.updateOrderStatus(orderId, selectedStatus, notes);
            
            // Update local data
            const orderIndex = this.orders.findIndex(o => o.id === orderId);
            if (orderIndex !== -1) {
                this.orders[orderIndex].status = selectedStatus;
                this.orders[orderIndex].lastUpdated = new Date();
                if (notes) {
                    this.orders[orderIndex].statusNotes = notes;
                }
            }
            
            this.hideStatusUpdate();
            this.hideOrderDetail();
            this.updateOrdersList();
            
            app.showToast('訂單狀態已更新', 'success');
            
        } catch (error) {
            console.error('Failed to update order status:', error);
            app.showToast('更新狀態失敗', 'error');
        }
    }

    async updateOrderStatus(orderId, status, notes) {
        try {
            const currentUser = Storage.getUser();
            if (!currentUser || !currentUser.staffId) {
                throw new Error('員工身份驗證失敗');
            }

            const requestBody = {
                status: status.toUpperCase(),
                staffId: currentUser.staffId,
                notes: notes || ''
            };

            const response = await api.staffRequest(`/staff/orders/${orderId}/status`, {
                method: 'PUT',
                body: JSON.stringify(requestBody)
            });

            if (!response.success) {
                throw new Error(response.message || '更新狀態失敗');
            }

            return response;
        } catch (error) {
            console.error('Failed to update order status:', error);
            throw error;
        }
    }

    // Helper methods
    getOrderStatusInfo(order) {
        return this.statusColors[order.status] || {
            color: '#999999',
            label: '未知狀態',
            icon: 'fas fa-question'
        };
    }

    isEmergencyOrder(order) {
        return order.status === 'EMERGENCY' || 
               (order.overtimeMinutes && order.overtimeMinutes > 0);
    }

    getOvertimeMinutes(order) {
        return order.overtimeMinutes || 0;
    }

    formatOrderTime(order) {
        const now = new Date();
        const orderTime = new Date(order.createdAt);
        const diffMinutes = Math.floor((now - orderTime) / (1000 * 60));
        
        if (order.status === 'EMERGENCY' && order.overtimeMinutes) {
            return `超時${order.overtimeMinutes}分鐘`;
        }
        
        if (diffMinutes < 1) return '剛剛';
        if (diffMinutes < 60) return `${diffMinutes}分鐘前`;
        
        return orderTime.toLocaleTimeString('zh-TW', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    formatDateTime(date) {
        return new Date(date).toLocaleString('zh-TW', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getFilterLabel() {
        const labels = {
            'all': '全部',
            'pending': '待處理',
            'in-progress': '進行中',
            'completed': '已完成',
            'cancelled': '已取消'
        };
        return labels[this.currentFilter] || '全部';
    }

    getOrderActionButtons(order) {
        const status = order.status;
        
        switch (status) {
            case 'PENDING':
                return `
                    <button class="btn btn-primary btn-small" onclick="staffOrders.quickAccept('${order.id}', event)">
                        接受
                    </button>
                `;
            case 'EMERGENCY':
                return `
                    <button class="btn btn-danger btn-small" onclick="staffOrders.quickHandle('${order.id}', event)">
                        🚨 緊急處理
                    </button>
                `;
            case 'IN_PROGRESS':
                return `
                    <button class="btn btn-success btn-small" onclick="staffOrders.quickComplete('${order.id}', event)">
                        ✅ 完成
                    </button>
                    <button class="btn btn-warning btn-small" onclick="staffOrders.reportProblem('${order.id}', event)">
                        ❌ 問題
                    </button>
                `;
            case 'COMPLETED':
                return `
                    <button class="btn btn-info btn-small" onclick="staffOrders.markDelivered('${order.id}', event)">
                        📤 已送達
                    </button>
                `;
            default:
                return '';
        }
    }

    getDetailActionButtons(order) {
        const status = order.status;
        
        switch (status) {
            case 'PENDING':
                return `
                    <button class="btn btn-primary btn-large" onclick="staffOrders.acceptOrder('${order.id}')">
                        🚀 開始製作
                    </button>
                    <button class="btn btn-danger btn-large" onclick="staffOrders.cancelOrder('${order.id}')">
                        ❌ 取消
                    </button>
                `;
            case 'EMERGENCY':
            case 'IN_PROGRESS':
                return `
                    <button class="btn btn-success btn-large" onclick="staffOrders.completeOrder('${order.id}')">
                        ✅ 製作完成
                    </button>
                    <button class="btn btn-warning btn-large" onclick="staffOrders.showStatusUpdate('${order.id}')">
                        🔄 更新狀態
                    </button>
                `;
            default:
                return `
                    <button class="btn btn-info btn-large" onclick="staffOrders.showStatusUpdate('${order.id}')">
                        🔄 更新狀態
                    </button>
                `;
        }
    }

    getAvailableStatuses(order) {
        const status = order.status;
        
        switch (status) {
            case 'PENDING':
                return ['IN_PROGRESS', 'CANCELLED'];
            case 'IN_PROGRESS':
            case 'EMERGENCY':
                return ['COMPLETED', 'CANCELLED'];
            case 'COMPLETED':
                return ['IN_PROGRESS']; // Allow going back to in-progress if needed
            default:
                return [];
        }
    }

    // Quick action methods
    async quickAccept(orderId, event) {
        event.stopPropagation();
        await this.acceptOrder(orderId);
    }

    async quickHandle(orderId, event) {
        event.stopPropagation();
        await this.handleEmergencyOrder(orderId);
    }

    async quickComplete(orderId, event) {
        event.stopPropagation();
        await this.completeOrder(orderId);
    }

    async reportProblem(orderId, event) {
        event.stopPropagation();
        // TODO: Implement problem reporting
        app.showToast('問題回報功能建構中', 'info');
    }

    async markDelivered(orderId, event) {
        event.stopPropagation();
        // TODO: Implement delivery marking
        app.showToast('送達標記功能建構中', 'info');
    }

    async acceptOrder(orderId) {
        await this.updateOrderStatus(orderId, 'IN_PROGRESS');
        this.reloadAndUpdate(orderId, '訂單已接受');
    }

    async handleEmergencyOrder(orderId) {
        await this.updateOrderStatus(orderId, 'IN_PROGRESS');
        this.reloadAndUpdate(orderId, '緊急訂單已處理');
    }

    async completeOrder(orderId) {
        await this.updateOrderStatus(orderId, 'COMPLETED');
        this.reloadAndUpdate(orderId, '訂單已完成');
    }

    async cancelOrder(orderId) {
        const confirmed = confirm('確定要取消此訂單嗎？');
        if (confirmed) {
            await this.updateOrderStatus(orderId, 'CANCELLED');
            this.reloadAndUpdate(orderId, '訂單已取消');
        }
    }

    reloadAndUpdate(orderId, message) {
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            this.loadOrders(); // Reload fresh data
            this.hideOrderDetail();
            app.showToast(message, 'success');
        }
    }

    // Search and settings methods
    showSearch() {
        // TODO: Implement search functionality
        app.showToast('搜尋功能建構中', 'info');
    }

    showFilterSettings() {
        // TODO: Implement filter settings
        app.showToast('篩選設定功能建構中', 'info');
    }
}

// Create global instance
window.staffOrders = new StaffOrders();