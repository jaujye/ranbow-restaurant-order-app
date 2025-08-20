// Staff Notifications Center - Notification management and settings

class StaffNotifications {
    constructor() {
        this.notifications = [];
        this.settings = {
            newOrder: true,
            emergency: true,
            timeout: true,
            statusChange: false,
            system: true,
            sound: 'default',
            volume: 80,
            vibration: true,
            quietHours: {
                enabled: false,
                start: '22:00',
                end: '08:00'
            }
        };
        this.refreshInterval = null;
    }

    getNotificationsPageTemplate() {
        return `
        <div class="staff-notifications">
            <!-- Header -->
            <div class="notifications-header">
                <div class="header-left">
                    <button class="back-btn" onclick="app.goBack()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h2>通知中心</h2>
                </div>
                <div class="header-actions">
                    <button class="clear-all-btn" onclick="staffNotifications.clearAllNotifications()">
                        <i class="fas fa-trash"></i>
                        清除
                    </button>
                    <button class="settings-btn" onclick="staffNotifications.showSettings()">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            </div>

            <!-- Notification Count -->
            <div class="notifications-summary">
                <div class="summary-item">
                    <i class="fas fa-bell"></i>
                    <span>總計 ${this.notifications.length} 則通知</span>
                </div>
                <div class="summary-item">
                    <i class="fas fa-exclamation-triangle text-danger"></i>
                    <span>${this.getUrgentCount()} 則緊急</span>
                </div>
            </div>

            <!-- Pinned Notifications -->
            <div class="pinned-notifications-section" id="pinned-notifications">
                <h4>📌 置頂通知</h4>
                <div class="pinned-notifications-list">
                    ${this.getPinnedNotificationsHTML()}
                </div>
            </div>

            <!-- Recent Notifications -->
            <div class="recent-notifications-section">
                <h4>🆕 最新通知</h4>
                <div class="notifications-list" id="notifications-list">
                    ${this.getNotificationsListHTML()}
                </div>
            </div>

            <!-- Notification Settings Modal -->
            <div class="notification-settings-modal" id="notification-settings-modal" style="display: none;">
                <div class="modal-content" id="notification-settings-content">
                    ${this.getNotificationSettingsHTML()}
                </div>
            </div>
        </div>`;
    }

    getPinnedNotificationsHTML() {
        const pinnedNotifications = this.notifications.filter(n => n.pinned);
        
        if (pinnedNotifications.length === 0) {
            return `
                <div class="no-pinned-notifications">
                    <p>沒有置頂通知</p>
                </div>
            `;
        }

        return pinnedNotifications.map(notification => this.getNotificationCardHTML(notification, true)).join('');
    }

    getNotificationsListHTML() {
        const recentNotifications = this.notifications.filter(n => !n.pinned).slice(0, 10);
        
        if (recentNotifications.length === 0) {
            return `
                <div class="no-notifications">
                    <div class="no-notifications-icon">
                        <i class="fas fa-bell-slash"></i>
                    </div>
                    <h3>沒有通知</h3>
                    <p>暫時沒有新通知</p>
                </div>
            `;
        }

        return recentNotifications.map(notification => this.getNotificationCardHTML(notification, false)).join('');
    }

    getNotificationCardHTML(notification, isPinned = false) {
        const typeClass = this.getNotificationTypeClass(notification.type);
        const timeAgo = this.getTimeAgo(notification.timestamp);
        
        return `
            <div class="notification-card ${typeClass} ${notification.read ? 'read' : 'unread'}" 
                 data-notification-id="${notification.id}"
                 onclick="staffNotifications.markAsRead('${notification.id}')">
                
                <div class="notification-icon">
                    <i class="${this.getNotificationIcon(notification.type)}"></i>
                </div>
                
                <div class="notification-content">
                    <div class="notification-header">
                        <h5 class="notification-title">${notification.title}</h5>
                        <div class="notification-meta">
                            <span class="notification-time">${timeAgo}</span>
                            ${notification.urgent ? '<span class="urgent-badge">緊急</span>' : ''}
                        </div>
                    </div>
                    
                    <p class="notification-message">${notification.message}</p>
                    
                    ${notification.orderId ? `
                        <div class="notification-order-info">
                            <i class="fas fa-hashtag"></i>
                            <span>訂單: ${notification.orderId}</span>
                        </div>
                    ` : ''}
                    
                    ${notification.actionButton ? `
                        <div class="notification-actions">
                            <button class="btn btn-small btn-primary" onclick="staffNotifications.handleNotificationAction('${notification.id}', event)">
                                ${notification.actionButton.text}
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <div class="notification-options">
                    ${isPinned ? `
                        <button class="option-btn" onclick="staffNotifications.unpinNotification('${notification.id}', event)">
                            <i class="fas fa-thumbtack"></i>
                        </button>
                    ` : `
                        <button class="option-btn" onclick="staffNotifications.pinNotification('${notification.id}', event)">
                            <i class="far fa-thumbtack"></i>
                        </button>
                    `}
                    <button class="option-btn" onclick="staffNotifications.deleteNotification('${notification.id}', event)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getNotificationSettingsHTML() {
        return `
            <div class="notification-settings-header">
                <button class="modal-close-btn" onclick="staffNotifications.hideSettings()">
                    <i class="fas fa-times"></i>
                </button>
                <h3>通知設定</h3>
            </div>
            
            <div class="notification-settings-body">
                <!-- Notification Types -->
                <div class="settings-section">
                    <h4>🔔 通知類型</h4>
                    <div class="settings-options">
                        <div class="setting-item">
                            <div class="setting-info">
                                <span class="setting-label">新訂單通知</span>
                                <small>收到新訂單時通知</small>
                            </div>
                            <div class="setting-control">
                                <label class="switch">
                                    <input type="checkbox" ${this.settings.newOrder ? 'checked' : ''} 
                                           onchange="staffNotifications.updateSetting('newOrder', this.checked)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <span class="setting-label">緊急訂單</span>
                                <small>超時訂單緊急通知</small>
                            </div>
                            <div class="setting-control">
                                <label class="switch">
                                    <input type="checkbox" ${this.settings.emergency ? 'checked' : ''} 
                                           onchange="staffNotifications.updateSetting('emergency', this.checked)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <span class="setting-label">超時提醒</span>
                                <small>訂單即將超時提醒</small>
                            </div>
                            <div class="setting-control">
                                <label class="switch">
                                    <input type="checkbox" ${this.settings.timeout ? 'checked' : ''} 
                                           onchange="staffNotifications.updateSetting('timeout', this.checked)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <span class="setting-label">狀態變更</span>
                                <small>訂單狀態變更通知</small>
                            </div>
                            <div class="setting-control">
                                <label class="switch">
                                    <input type="checkbox" ${this.settings.statusChange ? 'checked' : ''} 
                                           onchange="staffNotifications.updateSetting('statusChange', this.checked)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <span class="setting-label">系統通知</span>
                                <small>系統更新和維護通知</small>
                            </div>
                            <div class="setting-control">
                                <label class="switch">
                                    <input type="checkbox" ${this.settings.system ? 'checked' : ''} 
                                           onchange="staffNotifications.updateSetting('system', this.checked)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sound Settings -->
                <div class="settings-section">
                    <h4>🎵 聲音設定</h4>
                    <div class="settings-options">
                        <div class="setting-item">
                            <div class="setting-info">
                                <span class="setting-label">通知聲音</span>
                            </div>
                            <div class="setting-control">
                                <select class="form-select" onchange="staffNotifications.updateSetting('sound', this.value)">
                                    <option value="default" ${this.settings.sound === 'default' ? 'selected' : ''}>預設</option>
                                    <option value="chime" ${this.settings.sound === 'chime' ? 'selected' : ''}>鈴聲</option>
                                    <option value="ding" ${this.settings.sound === 'ding' ? 'selected' : ''}>叮咚</option>
                                    <option value="none" ${this.settings.sound === 'none' ? 'selected' : ''}>無聲</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <span class="setting-label">音量</span>
                                <small>通知聲音音量</small>
                            </div>
                            <div class="setting-control">
                                <div class="volume-control">
                                    <input type="range" min="0" max="100" value="${this.settings.volume}" 
                                           class="volume-slider" id="volume-slider"
                                           onchange="staffNotifications.updateSetting('volume', this.value)">
                                    <span class="volume-value">${this.settings.volume}%</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <span class="setting-label">震動</span>
                                <small>震動提醒 (移動裝置)</small>
                            </div>
                            <div class="setting-control">
                                <label class="switch">
                                    <input type="checkbox" ${this.settings.vibration ? 'checked' : ''} 
                                           onchange="staffNotifications.updateSetting('vibration', this.checked)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quiet Hours -->
                <div class="settings-section">
                    <h4>⏰ 免打擾時間</h4>
                    <div class="settings-options">
                        <div class="setting-item">
                            <div class="setting-info">
                                <span class="setting-label">啟用免打擾</span>
                                <small>在指定時間關閉通知</small>
                            </div>
                            <div class="setting-control">
                                <label class="switch">
                                    <input type="checkbox" ${this.settings.quietHours.enabled ? 'checked' : ''} 
                                           onchange="staffNotifications.updateQuietHours('enabled', this.checked)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="quiet-hours-time ${this.settings.quietHours.enabled ? '' : 'disabled'}">
                            <div class="time-input-group">
                                <label>開始時間:</label>
                                <input type="time" value="${this.settings.quietHours.start}" 
                                       onchange="staffNotifications.updateQuietHours('start', this.value)">
                            </div>
                            <div class="time-input-group">
                                <label>結束時間:</label>
                                <input type="time" value="${this.settings.quietHours.end}" 
                                       onchange="staffNotifications.updateQuietHours('end', this.value)">
                            </div>
                        </div>
                        
                        <div class="quiet-hours-note">
                            <small>⚠️ 緊急通知不受免打擾限制</small>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="notification-settings-actions">
                <button class="btn btn-secondary" onclick="staffNotifications.resetSettings()">
                    重置設定
                </button>
                <button class="btn btn-primary" onclick="staffNotifications.saveSettings()">
                    儲存設定
                </button>
            </div>
        `;
    }

    initialize() {
        this.loadNotifications();
        this.loadSettings();
        this.setupAutoRefresh();
    }

    async loadNotifications() {
        try {
            // Load notifications from API or storage
            this.notifications = [
                {
                    id: 'notif-001',
                    type: 'emergency',
                    title: '緊急',
                    message: '桌號3訂單超時5分鐘',
                    orderId: '12347',
                    timestamp: new Date(Date.now() - 5 * 60000),
                    read: false,
                    urgent: true,
                    pinned: true,
                    actionButton: {
                        text: '立即處理',
                        action: 'handleEmergency'
                    }
                },
                {
                    id: 'notif-002',
                    type: 'new-order',
                    title: '新訂單',
                    message: '收到桌號5的新訂單',
                    orderId: '12350',
                    timestamp: new Date(Date.now() - 2 * 60000),
                    read: false,
                    urgent: false,
                    pinned: false,
                    actionButton: {
                        text: '查看訂單',
                        action: 'viewOrder'
                    }
                },
                {
                    id: 'notif-003',
                    type: 'order-complete',
                    title: '訂單完成',
                    message: '桌號2訂單已送達',
                    orderId: '12349',
                    timestamp: new Date(Date.now() - 3 * 60000),
                    read: true,
                    urgent: false,
                    pinned: false
                },
                {
                    id: 'notif-004',
                    type: 'system',
                    title: '系統通知',
                    message: '今日統計已更新',
                    timestamp: new Date(Date.now() - 10 * 60000),
                    read: true,
                    urgent: false,
                    pinned: false
                }
            ];

            this.updateNotificationsUI();
            
        } catch (error) {
            console.error('Failed to load notifications:', error);
            app.showToast('載入通知失敗', 'error');
        }
    }

    loadSettings() {
        // Load settings from localStorage
        const savedSettings = localStorage.getItem('staffNotificationSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
    }

    saveSettings() {
        localStorage.setItem('staffNotificationSettings', JSON.stringify(this.settings));
        app.showToast('設定已儲存', 'success');
        this.hideSettings();
    }

    updateNotificationsUI() {
        // Update pinned notifications
        const pinnedEl = document.querySelector('.pinned-notifications-list');
        if (pinnedEl) {
            pinnedEl.innerHTML = this.getPinnedNotificationsHTML();
        }

        // Update recent notifications
        const notificationsListEl = document.getElementById('notifications-list');
        if (notificationsListEl) {
            notificationsListEl.innerHTML = this.getNotificationsListHTML();
        }

        // Update summary
        const summaryItems = document.querySelectorAll('.summary-item span');
        if (summaryItems.length >= 2) {
            summaryItems[0].textContent = `總計 ${this.notifications.length} 則通知`;
            summaryItems[1].textContent = `${this.getUrgentCount()} 則緊急`;
        }
    }

    setupAutoRefresh() {
        // Check for new notifications every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.loadNotifications();
        }, 30000);
    }

    cleanup() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // Notification management
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            this.updateNotificationCard(notificationId);
        }
    }

    pinNotification(notificationId, event) {
        event.stopPropagation();
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.pinned = true;
            this.updateNotificationsUI();
            app.showToast('通知已置頂', 'success');
        }
    }

    unpinNotification(notificationId, event) {
        event.stopPropagation();
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.pinned = false;
            this.updateNotificationsUI();
            app.showToast('已取消置頂', 'info');
        }
    }

    deleteNotification(notificationId, event) {
        event.stopPropagation();
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.updateNotificationsUI();
        app.showToast('通知已刪除', 'info');
    }

    clearAllNotifications() {
        const confirmed = confirm('確定要清除所有通知嗎？');
        if (confirmed) {
            this.notifications = [];
            this.updateNotificationsUI();
            app.showToast('所有通知已清除', 'success');
        }
    }

    handleNotificationAction(notificationId, event) {
        event.stopPropagation();
        const notification = this.notifications.find(n => n.id === notificationId);
        
        if (notification && notification.actionButton) {
            switch (notification.actionButton.action) {
                case 'handleEmergency':
                    app.navigateTo('staff-kitchen');
                    break;
                case 'viewOrder':
                    app.navigateTo('staff-orders');
                    break;
                default:
                    app.showToast('功能建構中', 'info');
            }
        }
    }

    // Settings management
    showSettings() {
        const modal = document.getElementById('notification-settings-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    hideSettings() {
        const modal = document.getElementById('notification-settings-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        
        // Special handling for volume display
        if (key === 'volume') {
            const volumeValue = document.querySelector('.volume-value');
            if (volumeValue) {
                volumeValue.textContent = `${value}%`;
            }
        }
    }

    updateQuietHours(key, value) {
        this.settings.quietHours[key] = value;
        
        // Enable/disable time inputs based on enabled state
        if (key === 'enabled') {
            const quietHoursTime = document.querySelector('.quiet-hours-time');
            if (quietHoursTime) {
                if (value) {
                    quietHoursTime.classList.remove('disabled');
                } else {
                    quietHoursTime.classList.add('disabled');
                }
            }
        }
    }

    resetSettings() {
        const confirmed = confirm('確定要重置所有通知設定嗎？');
        if (confirmed) {
            this.settings = {
                newOrder: true,
                emergency: true,
                timeout: true,
                statusChange: false,
                system: true,
                sound: 'default',
                volume: 80,
                vibration: true,
                quietHours: {
                    enabled: false,
                    start: '22:00',
                    end: '08:00'
                }
            };
            
            // Update modal content
            const content = document.getElementById('notification-settings-content');
            if (content) {
                content.innerHTML = this.getNotificationSettingsHTML();
            }
            
            app.showToast('設定已重置', 'info');
        }
    }

    // Notification creation
    addNotification(type, title, message, options = {}) {
        const notification = {
            id: `notif-${Date.now()}`,
            type,
            title,
            message,
            timestamp: new Date(),
            read: false,
            urgent: options.urgent || false,
            pinned: options.pinned || false,
            orderId: options.orderId || null,
            actionButton: options.actionButton || null
        };

        this.notifications.unshift(notification);
        this.updateNotificationsUI();

        // Play notification sound if enabled
        if (this.shouldShowNotification(type)) {
            this.playNotificationSound();
            this.showToastNotification(notification);
        }

        return notification.id;
    }

    shouldShowNotification(type) {
        // Check if this type of notification is enabled
        if (!this.settings[type]) return false;

        // Check quiet hours
        if (this.settings.quietHours.enabled && type !== 'emergency') {
            const now = new Date();
            const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                               now.getMinutes().toString().padStart(2, '0');
            
            const startTime = this.settings.quietHours.start;
            const endTime = this.settings.quietHours.end;
            
            if (this.isTimeInRange(currentTime, startTime, endTime)) {
                return false;
            }
        }

        return true;
    }

    playNotificationSound() {
        if (this.settings.sound !== 'none') {
            // Create audio element for notification sound
            const audio = new Audio();
            switch (this.settings.sound) {
                case 'chime':
                    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMUB'. substring(0, 100);
                    break;
                case 'ding':
                    audio.src = 'data:audio/wav;base64,UklGRjBDAAABXQVZ'. substring(0, 50);
                    break;
                default:
                    // Default system notification sound
                    audio.src = '#';
            }
            
            audio.volume = this.settings.volume / 100;
            audio.play().catch(e => console.log('Could not play notification sound'));
        }
    }

    showToastNotification(notification) {
        // Show brief toast notification
        const message = `${notification.title}: ${notification.message}`;
        app.showToast(message, notification.urgent ? 'error' : 'info');
    }

    // Helper methods
    getNotificationTypeClass(type) {
        const typeClasses = {
            'emergency': 'notification-emergency',
            'new-order': 'notification-new-order',
            'order-complete': 'notification-success',
            'system': 'notification-info',
            'timeout': 'notification-warning'
        };
        return typeClasses[type] || 'notification-default';
    }

    getNotificationIcon(type) {
        const icons = {
            'emergency': 'fas fa-exclamation-triangle',
            'new-order': 'fas fa-plus-circle',
            'order-complete': 'fas fa-check-circle',
            'system': 'fas fa-info-circle',
            'timeout': 'fas fa-clock'
        };
        return icons[type] || 'fas fa-bell';
    }

    getUrgentCount() {
        return this.notifications.filter(n => n.urgent && !n.read).length;
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMinutes = Math.floor((now - time) / (1000 * 60));
        
        if (diffMinutes < 1) return '剛剛';
        if (diffMinutes < 60) return `${diffMinutes}分鐘前`;
        
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}小時前`;
        
        return time.toLocaleDateString();
    }

    isTimeInRange(current, start, end) {
        // Simple time range check (doesn't handle overnight ranges perfectly)
        return current >= start && current <= end;
    }

    updateNotificationCard(notificationId) {
        const card = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (card) {
            card.classList.remove('unread');
            card.classList.add('read');
        }
    }
}

// Create global instance
window.staffNotifications = new StaffNotifications();