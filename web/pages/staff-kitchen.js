// Staff Kitchen Workspace - Active cooking management with timers

class StaffKitchen {
    constructor() {
        this.activeOrders = [];
        this.waitingOrders = [];
        this.timers = new Map();
        this.refreshInterval = null;
        this.timerInterval = null;
        this.currentTime = new Date();
    }

    getKitchenTemplate() {
        return `
        <div class="staff-kitchen">
            <!-- Kitchen Header -->
            <div class="kitchen-header">
                <div class="header-left">
                    <h2>🍳 廚房工作台</h2>
                    <div class="current-time" id="current-time">
                        ${this.formatCurrentTime()}
                    </div>
                </div>
                <div class="header-actions">
                    <button class="refresh-btn" onclick="staffKitchen.refreshOrders()">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button class="timer-btn" onclick="staffKitchen.showAllTimers()">
                        <i class="fas fa-stopwatch"></i>
                    </button>
                </div>
            </div>

            <!-- Active Orders (In Progress) -->
            <div class="active-orders-section">
                <div class="section-header active">
                    <h3>🔥 正在製作 (${this.activeOrders.length}單)</h3>
                    <div class="section-actions">
                        <button class="batch-action-btn" onclick="staffKitchen.batchComplete()">
                            批量完成
                        </button>
                    </div>
                </div>
                <div class="active-orders-grid" id="active-orders-grid">
                    ${this.getActiveOrdersHTML()}
                </div>
            </div>

            <!-- Waiting Orders (Queue) -->
            <div class="waiting-orders-section">
                <div class="section-header">
                    <h3>📋 等待製作 (${this.waitingOrders.length}單)</h3>
                    <div class="section-actions">
                        <button class="batch-action-btn" onclick="staffKitchen.acceptNext()">
                            接受下一單
                        </button>
                    </div>
                </div>
                <div class="waiting-orders-list" id="waiting-orders-list">
                    ${this.getWaitingOrdersHTML()}
                </div>
            </div>

            <!-- Kitchen Quick Actions -->
            <div class="kitchen-quick-actions">
                <button class="quick-action statistics" onclick="staffKitchen.goToStats()">
                    <i class="fas fa-chart-bar"></i>
                    <span>統計</span>
                </button>
                <button class="quick-action notifications" onclick="staffKitchen.goToNotifications()">
                    <i class="fas fa-bell"></i>
                    <span>通知</span>
                </button>
            </div>

            <!-- Timer Modal -->
            <div class="timer-modal" id="timer-modal" style="display: none;">
                <div class="modal-content" id="timer-modal-content">
                    <!-- Timer content will be populated here -->
                </div>
            </div>
        </div>`;
    }

    getActiveOrdersHTML() {
        if (this.activeOrders.length === 0) {
            return `
                <div class="no-active-orders">
                    <div class="no-orders-icon">🍳</div>
                    <p>目前沒有正在製作的訂單</p>
                    <small>從等待清單開始新的製作</small>
                </div>
            `;
        }

        return this.activeOrders.map(order => {
            const timer = this.timers.get(order.id);
            const isOvertime = timer && timer.isOvertime;
            
            return `
                <div class="active-order-card ${isOvertime ? 'overtime' : ''}" 
                     data-order-id="${order.id}">
                    <div class="order-header">
                        <div class="order-id-table">
                            <span class="order-id">#${order.id}</span>
                            <span class="table-number">桌${order.tableNumber}</span>
                        </div>
                        ${isOvertime ? `
                            <div class="emergency-indicator">
                                <i class="fas fa-exclamation-triangle"></i>
                                <span>超時</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="cooking-timer" id="timer-${order.id}">
                        <div class="timer-display">
                            <div class="timer-icon">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="timer-time">
                                <span class="elapsed-time">${timer ? timer.elapsedTime : '00:00'}</span>
                                <small class="timer-label">(已製作時間)</small>
                            </div>
                        </div>
                        <div class="timer-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${timer ? timer.progress : 0}%"></div>
                            </div>
                            <small class="remaining-time">
                                剩餘時間: ${timer ? timer.remainingTime : this.calculateRemainingTime(order)}
                            </small>
                        </div>
                    </div>
                    
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="cooking-item">
                                <span class="item-name">${item.name}</span>
                                <span class="item-quantity">×${item.quantity}</span>
                                <span class="cooking-time">
                                    <i class="fas fa-hourglass-half"></i>
                                    ${item.cookingTime}分
                                </span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="order-actions">
                        <button class="btn btn-success btn-small" onclick="staffKitchen.completeOrder('${order.id}')">
                            <i class="fas fa-check"></i>
                            完成
                        </button>
                        <button class="btn btn-warning btn-small" onclick="staffKitchen.extendTime('${order.id}')">
                            <i class="fas fa-clock"></i>
                            延時
                        </button>
                        <button class="btn btn-secondary btn-small" onclick="staffKitchen.pauseOrder('${order.id}')">
                            <i class="fas fa-pause"></i>
                            暫停
                        </button>
                        <button class="btn btn-danger btn-small" onclick="staffKitchen.cancelOrder('${order.id}')">
                            <i class="fas fa-times"></i>
                            取消
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getWaitingOrdersHTML() {
        if (this.waitingOrders.length === 0) {
            return `
                <div class="no-waiting-orders">
                    <div class="no-orders-icon">📋</div>
                    <p>沒有等待的訂單</p>
                    <small>所有訂單都在處理中</small>
                </div>
            `;
        }

        return this.waitingOrders.map(order => `
            <div class="waiting-order-card" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="order-id-table">
                        <span class="order-id">#${order.id}</span>
                        <span class="table-number">桌${order.tableNumber}</span>
                    </div>
                    <div class="order-priority">
                        ${this.getOrderPriorityBadge(order)}
                    </div>
                </div>
                
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="item-summary">
                            <span class="item-name">${item.name}</span>
                            <span class="item-quantity">×${item.quantity}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="order-time">
                    <i class="fas fa-clock"></i>
                    <span>${this.getTimeAgo(order.createdAt)}</span>
                </div>
                
                <div class="order-actions">
                    <button class="btn btn-primary btn-large" onclick="staffKitchen.startCooking('${order.id}')">
                        開始製作
                    </button>
                </div>
            </div>
        `).join('');
    }

    getTimerModalTemplate(orderId) {
        const order = this.activeOrders.find(o => o.id === orderId);
        const timer = this.timers.get(orderId);
        
        if (!order) return '';
        
        return `
            <div class="timer-modal-header">
                <button class="modal-close-btn" onclick="staffKitchen.hideTimerModal()">
                    <i class="fas fa-times"></i>
                </button>
                <h3>⏲️ 製作計時器</h3>
            </div>
            
            <div class="timer-modal-body">
                <div class="timer-order-info">
                    <h4>訂單 #${order.id}</h4>
                    <p>${order.items.map(item => `${item.name} × ${item.quantity}`).join(', ')}</p>
                </div>
                
                <div class="main-timer">
                    <div class="timer-circle">
                        <div class="timer-display-large">
                            <span class="timer-value">${timer ? timer.elapsedTime : '00:00'}</span>
                            <small class="timer-label">已製作時間</small>
                        </div>
                    </div>
                </div>
                
                <div class="timer-info">
                    <div class="timer-row">
                        <span class="timer-label">預計完成:</span>
                        <span class="timer-value">${this.formatTime(order.estimatedCompletionTime)}</span>
                    </div>
                    <div class="timer-row">
                        <span class="timer-label">剩餘時間:</span>
                        <span class="timer-value ${timer && timer.isOvertime ? 'overtime' : ''}">${timer ? timer.remainingTime : this.calculateRemainingTime(order)}</span>
                    </div>
                </div>
                
                <div class="timer-status">
                    <h4>🚥 狀態</h4>
                    <div class="status-indicators">
                        <div class="status-indicator ${timer && !timer.isOvertime && timer.progress < 70 ? 'active' : ''}">
                            <span class="status-color normal"></span>
                            <span class="status-text">正常</span>
                        </div>
                        <div class="status-indicator ${timer && !timer.isOvertime && timer.progress >= 70 ? 'active' : ''}">
                            <span class="status-color warning"></span>
                            <span class="status-text">注意</span>
                        </div>
                        <div class="status-indicator ${timer && timer.isOvertime ? 'active' : ''}">
                            <span class="status-color overtime"></span>
                            <span class="status-text">超時</span>
                        </div>
                    </div>
                </div>
                
                <div class="cooking-notes">
                    <label class="form-label">📝 製作備註:</label>
                    <textarea 
                        class="form-textarea" 
                        id="cooking-notes-${orderId}" 
                        placeholder="輸入製作過程備註..."
                        rows="3">${order.cookingNotes || ''}</textarea>
                </div>
            </div>
            
            <div class="timer-modal-actions">
                <button class="btn btn-secondary" onclick="staffKitchen.pauseTimer('${orderId}')">
                    <i class="fas fa-pause"></i>
                    暫停
                </button>
                <button class="btn btn-success" onclick="staffKitchen.completeFromTimer('${orderId}')">
                    <i class="fas fa-check"></i>
                    完成
                </button>
                <button class="btn btn-warning" onclick="staffKitchen.extendTime('${orderId}')">
                    <i class="fas fa-clock"></i>
                    延時
                </button>
                <button class="btn btn-danger" onclick="staffKitchen.cancelFromTimer('${orderId}')">
                    <i class="fas fa-times"></i>
                    取消
                </button>
            </div>
        `;
    }

    initialize() {
        this.loadKitchenData();
        this.setupTimers();
        this.setupAutoRefresh();
    }

    async loadKitchenData() {
        try {
            // Load active orders (in progress)
            this.activeOrders = [
                {
                    id: '12347',
                    tableNumber: 3,
                    status: 'IN_PROGRESS',
                    items: [
                        { name: '招牌牛排', quantity: 2, cookingTime: '25' },
                        { name: '蜜汁雞腿', quantity: 1, cookingTime: '20' }
                    ],
                    startedAt: new Date(Date.now() - 15 * 60000), // Started 15 minutes ago
                    estimatedCompletionTime: new Date(Date.now() + 10 * 60000), // 10 minutes from now
                    totalCookingTime: 25
                },
                {
                    id: '12348',
                    tableNumber: 5,
                    status: 'IN_PROGRESS',
                    items: [
                        { name: '義式燉飯', quantity: 1, cookingTime: '18' }
                    ],
                    startedAt: new Date(Date.now() - 10 * 60000), // Started 10 minutes ago
                    estimatedCompletionTime: new Date(Date.now() + 8 * 60000), // 8 minutes from now
                    totalCookingTime: 18
                }
            ];

            // Load waiting orders (pending)
            this.waitingOrders = [
                {
                    id: '12349',
                    tableNumber: 2,
                    status: 'PENDING',
                    items: [
                        { name: '雞腿排', quantity: 1, cookingTime: '20' },
                        { name: '可樂', quantity: 2, cookingTime: '0' }
                    ],
                    createdAt: new Date(Date.now() - 5 * 60000),
                    priority: 'normal'
                },
                {
                    id: '12350',
                    tableNumber: 7,
                    status: 'PENDING',
                    items: [
                        { name: '海鮮義大利麵', quantity: 1, cookingTime: '22' }
                    ],
                    createdAt: new Date(Date.now() - 3 * 60000),
                    priority: 'high'
                }
            ];

            this.updateKitchenUI();
            this.initializeTimers();
            
        } catch (error) {
            console.error('Failed to load kitchen data:', error);
            app.showToast('載入廚房數據失敗', 'error');
        }
    }

    updateKitchenUI() {
        // Update active orders
        const activeGridEl = document.getElementById('active-orders-grid');
        if (activeGridEl) {
            activeGridEl.innerHTML = this.getActiveOrdersHTML();
        }

        // Update waiting orders
        const waitingListEl = document.getElementById('waiting-orders-list');
        if (waitingListEl) {
            waitingListEl.innerHTML = this.getWaitingOrdersHTML();
        }

        // Update section headers with counts
        document.querySelectorAll('.section-header h3').forEach(header => {
            if (header.textContent.includes('正在製作')) {
                header.innerHTML = `🔥 正在製作 (${this.activeOrders.length}單)`;
            } else if (header.textContent.includes('等待製作')) {
                header.innerHTML = `📋 等待製作 (${this.waitingOrders.length}單)`;
            }
        });
    }

    initializeTimers() {
        // Initialize timers for all active orders
        this.activeOrders.forEach(order => {
            if (!this.timers.has(order.id)) {
                this.createTimer(order);
            }
        });

        // Start timer update interval
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            this.updateAllTimers();
        }, 1000);
    }

    createTimer(order) {
        const startTime = new Date(order.startedAt);
        const totalMinutes = order.totalCookingTime;
        
        const timer = {
            orderId: order.id,
            startTime: startTime,
            totalMinutes: totalMinutes,
            isPaused: false,
            pausedDuration: 0,
            elapsedTime: '00:00',
            remainingTime: '00:00',
            progress: 0,
            isOvertime: false
        };
        
        this.timers.set(order.id, timer);
        this.updateTimer(timer);
    }

    updateTimer(timer) {
        const now = new Date();
        const elapsed = now - timer.startTime - timer.pausedDuration;
        const elapsedMinutes = elapsed / (1000 * 60);
        const totalSeconds = Math.floor(elapsed / 1000);
        
        // Calculate elapsed time display
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        timer.elapsedTime = hours > 0 
            ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Calculate progress and remaining time
        timer.progress = Math.min((elapsedMinutes / timer.totalMinutes) * 100, 100);
        
        const remainingMinutes = Math.max(timer.totalMinutes - elapsedMinutes, 0);
        timer.isOvertime = remainingMinutes <= 0;
        
        if (timer.isOvertime) {
            const overtimeMinutes = Math.abs(remainingMinutes);
            timer.remainingTime = `超時${Math.ceil(overtimeMinutes)}分鐘`;
        } else {
            timer.remainingTime = `${Math.ceil(remainingMinutes)}分鐘`;
        }
    }

    updateAllTimers() {
        this.timers.forEach((timer, orderId) => {
            if (!timer.isPaused) {
                this.updateTimer(timer);
                this.updateTimerDisplay(orderId);
            }
        });
        
        // Update current time
        this.currentTime = new Date();
        const currentTimeEl = document.getElementById('current-time');
        if (currentTimeEl) {
            currentTimeEl.textContent = this.formatCurrentTime();
        }
    }

    updateTimerDisplay(orderId) {
        const timer = this.timers.get(orderId);
        const timerEl = document.getElementById(`timer-${orderId}`);
        
        if (timer && timerEl) {
            const elapsedTimeEl = timerEl.querySelector('.elapsed-time');
            const remainingTimeEl = timerEl.querySelector('.remaining-time');
            const progressEl = timerEl.querySelector('.progress-fill');
            const cardEl = timerEl.closest('.active-order-card');
            
            if (elapsedTimeEl) elapsedTimeEl.textContent = timer.elapsedTime;
            if (remainingTimeEl) remainingTimeEl.textContent = `剩餘時間: ${timer.remainingTime}`;
            if (progressEl) progressEl.style.width = `${timer.progress}%`;
            
            // Update card appearance for overtime
            if (cardEl) {
                if (timer.isOvertime) {
                    cardEl.classList.add('overtime');
                } else {
                    cardEl.classList.remove('overtime');
                }
            }
        }
    }

    setupAutoRefresh() {
        // Refresh data every 2 minutes
        this.refreshInterval = setInterval(() => {
            this.loadKitchenData();
        }, 120000);
    }

    cleanup() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.timers.clear();
    }

    // Order management methods
    async startCooking(orderId) {
        try {
            const order = this.waitingOrders.find(o => o.id === orderId);
            if (!order) return;
            
            // Move to active orders
            order.status = 'IN_PROGRESS';
            order.startedAt = new Date();
            order.estimatedCompletionTime = new Date(Date.now() + order.items[0].cookingTime * 60000);
            order.totalCookingTime = Math.max(...order.items.map(item => parseInt(item.cookingTime)));
            
            this.activeOrders.push(order);
            this.waitingOrders = this.waitingOrders.filter(o => o.id !== orderId);
            
            // Create timer
            this.createTimer(order);
            
            this.updateKitchenUI();
            app.showToast(`開始製作訂單 #${orderId}`, 'success');
            
        } catch (error) {
            console.error('Failed to start cooking:', error);
            app.showToast('開始製作失敗', 'error');
        }
    }

    async completeOrder(orderId) {
        try {
            const confirmed = await this.showConfirmDialog(
                '完成訂單',
                `確定要標記訂單 #${orderId} 為完成嗎？`
            );
            
            if (confirmed) {
                // Remove from active orders
                this.activeOrders = this.activeOrders.filter(o => o.id !== orderId);
                
                // Remove timer
                this.timers.delete(orderId);
                
                this.updateKitchenUI();
                app.showToast(`訂單 #${orderId} 已完成`, 'success');
            }
            
        } catch (error) {
            console.error('Failed to complete order:', error);
            app.showToast('完成訂單失敗', 'error');
        }
    }

    async extendTime(orderId) {
        try {
            const order = this.activeOrders.find(o => o.id === orderId);
            const timer = this.timers.get(orderId);
            
            if (order && timer) {
                // Extend by 10 minutes
                timer.totalMinutes += 10;
                order.estimatedCompletionTime = new Date(order.estimatedCompletionTime.getTime() + 10 * 60000);
                
                this.updateTimer(timer);
                this.updateTimerDisplay(orderId);
                
                app.showToast(`訂單 #${orderId} 已延時10分鐘`, 'info');
            }
            
        } catch (error) {
            console.error('Failed to extend time:', error);
            app.showToast('延時失敗', 'error');
        }
    }

    pauseTimer(orderId) {
        const timer = this.timers.get(orderId);
        
        if (timer) {
            if (timer.isPaused) {
                // Resume timer
                timer.isPaused = false;
                timer.pausedStartTime = null;
                app.showToast(`訂單 #${orderId} 計時器已恢復`, 'info');
            } else {
                // Pause timer
                timer.isPaused = true;
                timer.pausedStartTime = new Date();
                app.showToast(`訂單 #${orderId} 計時器已暫停`, 'info');
            }
            
            this.updateTimerButtonStates(orderId);
        }
    }

    async cancelOrder(orderId) {
        try {
            const confirmed = await this.showConfirmDialog(
                '取消訂單',
                `確定要取消訂單 #${orderId} 嗎？此操作不可復原。`
            );
            
            if (confirmed) {
                // Remove from active orders
                this.activeOrders = this.activeOrders.filter(o => o.id !== orderId);
                
                // Remove timer
                this.timers.delete(orderId);
                
                this.updateKitchenUI();
                app.showToast(`訂單 #${orderId} 已取消`, 'warning');
            }
            
        } catch (error) {
            console.error('Failed to cancel order:', error);
            app.showToast('取消訂單失敗', 'error');
        }
    }

    // Batch operations
    async batchComplete() {
        if (this.activeOrders.length === 0) {
            app.showToast('沒有可完成的訂單', 'info');
            return;
        }
        
        const confirmed = await this.showConfirmDialog(
            '批量完成',
            `確定要完成所有 ${this.activeOrders.length} 個正在製作的訂單嗎？`
        );
        
        if (confirmed) {
            const completedCount = this.activeOrders.length;
            this.activeOrders = [];
            this.timers.clear();
            
            this.updateKitchenUI();
            app.showToast(`已批量完成 ${completedCount} 個訂單`, 'success');
        }
    }

    async acceptNext() {
        if (this.waitingOrders.length === 0) {
            app.showToast('沒有等待的訂單', 'info');
            return;
        }
        
        // Get highest priority order
        const nextOrder = this.waitingOrders.sort((a, b) => {
            if (a.priority === 'high' && b.priority !== 'high') return -1;
            if (b.priority === 'high' && a.priority !== 'high') return 1;
            return new Date(a.createdAt) - new Date(b.createdAt);
        })[0];
        
        await this.startCooking(nextOrder.id);
    }

    // Timer modal methods
    showTimer(orderId) {
        const modal = document.getElementById('timer-modal');
        const content = document.getElementById('timer-modal-content');
        
        if (modal && content) {
            content.innerHTML = this.getTimerModalTemplate(orderId);
            modal.style.display = 'flex';
        }
    }

    hideTimerModal() {
        const modal = document.getElementById('timer-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    showAllTimers() {
        if (this.activeOrders.length === 0) {
            app.showToast('沒有正在進行的訂單', 'info');
            return;
        }
        
        // Show first active order timer
        this.showTimer(this.activeOrders[0].id);
    }

    async completeFromTimer(orderId) {
        this.hideTimerModal();
        await this.completeOrder(orderId);
    }

    async cancelFromTimer(orderId) {
        this.hideTimerModal();
        await this.cancelOrder(orderId);
    }

    updateTimerButtonStates(orderId) {
        // Update pause/resume button text and icon
        // This would be called after pause/resume actions
    }

    // Helper methods
    getOrderPriorityBadge(order) {
        if (order.priority === 'high') {
            return `
                <div class="priority-badge high">
                    <i class="fas fa-arrow-up"></i>
                    <span>優先</span>
                </div>
            `;
        }
        return '';
    }

    calculateRemainingTime(order) {
        if (!order.estimatedCompletionTime) return '計算中...';
        
        const now = new Date();
        const estimatedEnd = new Date(order.estimatedCompletionTime);
        const diffMinutes = Math.ceil((estimatedEnd - now) / (1000 * 60));
        
        if (diffMinutes <= 0) {
            return `超時${Math.abs(diffMinutes)}分鐘`;
        }
        
        return `${diffMinutes}分鐘`;
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMinutes = Math.floor((now - time) / (1000 * 60));
        
        if (diffMinutes < 1) return '剛剛';
        if (diffMinutes < 60) return `${diffMinutes}分鐘前`;
        
        return time.toLocaleTimeString('zh-TW', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    formatCurrentTime() {
        return this.currentTime.toLocaleTimeString('zh-TW', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    formatTime(date) {
        return new Date(date).toLocaleTimeString('zh-TW', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    async showConfirmDialog(title, message) {
        return new Promise((resolve) => {
            const confirmed = confirm(`${title}\n\n${message}`);
            resolve(confirmed);
        });
    }

    async refreshOrders() {
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.classList.add('rotating');
        }

        try {
            await this.loadKitchenData();
            app.showToast('廚房數據已更新', 'success');
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

    // Navigation methods
    goToStats() {
        app.navigateTo('staff-stats');
    }

    goToNotifications() {
        app.navigateTo('staff-notifications');
    }
}

// Create global instance
window.staffKitchen = new StaffKitchen();