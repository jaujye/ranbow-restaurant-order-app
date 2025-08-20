// Staff Profile - Personal information and settings

class StaffProfile {
    constructor() {
        this.currentUser = null;
        this.monthlyStats = {};
        this.achievements = [];
        this.isEditing = false;
        this.originalUserData = null;
    }

    getProfilePageTemplate() {
        this.currentUser = Storage.getUser();
        
        return `
        <div class="staff-profile">
            <!-- Header -->
            <div class="staff-profile-header">
                <div class="header-left">
                    <button class="back-btn" onclick="app.goBack()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h2>個人中心</h2>
                </div>
                <div class="header-actions">
                    <button class="settings-btn" onclick="staffProfile.toggleEditMode()">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            </div>

            <!-- Staff Profile Card -->
            <div class="staff-profile-card">
                <div class="profile-avatar-section">
                    <div class="profile-avatar-large" onclick="staffProfile.changeAvatar()">
                        ${this.getStaffAvatar()}
                        <div class="avatar-edit-overlay">
                            <i class="fas fa-camera"></i>
                        </div>
                    </div>
                </div>
                
                <div class="profile-info-section" id="profile-info">
                    ${this.getProfileInfoHTML()}
                </div>
            </div>

            <!-- Monthly Statistics -->
            <div class="monthly-stats-section">
                <h4>📊 本月統計</h4>
                <div class="monthly-stats-grid">
                    <div class="monthly-stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-clipboard-list"></i>
                        </div>
                        <div class="stat-info">
                            <div class="stat-number">${this.monthlyStats.processedOrders || 658}</div>
                            <div class="stat-label">處理訂單</div>
                        </div>
                    </div>
                    <div class="monthly-stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-star"></i>
                        </div>
                        <div class="stat-info">
                            <div class="stat-number">${this.monthlyStats.efficiency || '96.5%'}</div>
                            <div class="stat-label">平均效率</div>
                        </div>
                    </div>
                    <div class="monthly-stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-info">
                            <div class="stat-number">${this.monthlyStats.avgTime || '17分'}</div>
                            <div class="stat-label">平均時間</div>
                        </div>
                    </div>
                    <div class="monthly-stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-thumbs-up"></i>
                        </div>
                        <div class="stat-info">
                            <div class="stat-number">${this.monthlyStats.satisfaction || '4.9'}</div>
                            <div class="stat-label">顧客評分</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Achievements -->
            <div class="achievements-section">
                <h4>🏆 最近成就</h4>
                <div class="achievements-list">
                    ${this.getAchievementsHTML()}
                </div>
            </div>

            <!-- Function Menu -->
            <div class="function-menu">
                <h4>⚙️ 功能選單</h4>
                <div class="function-menu-list">
                    <div class="function-item" onclick="staffProfile.goToStats()">
                        <div class="function-icon">
                            <i class="fas fa-chart-bar"></i>
                        </div>
                        <div class="function-info">
                            <span class="function-title">工作統計</span>
                            <small>查看詳細工作數據</small>
                        </div>
                        <i class="fas fa-chevron-right"></i>
                    </div>
                    
                    <div class="function-item" onclick="staffProfile.goToOrderHistory()">
                        <div class="function-icon">
                            <i class="fas fa-history"></i>
                        </div>
                        <div class="function-info">
                            <span class="function-title">處理記錄</span>
                            <small>查看歷史處理記錄</small>
                        </div>
                        <i class="fas fa-chevron-right"></i>
                    </div>
                    
                    <div class="function-item" onclick="staffProfile.goToNotifications()">
                        <div class="function-icon">
                            <i class="fas fa-bell"></i>
                        </div>
                        <div class="function-info">
                            <span class="function-title">通知設定</span>
                            <small>管理通知偏好</small>
                        </div>
                        <i class="fas fa-chevron-right"></i>
                    </div>
                    
                    <div class="function-item" onclick="staffProfile.showSchedule()">
                        <div class="function-icon">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                        <div class="function-info">
                            <span class="function-title">排班資訊</span>
                            <small>查看工作排班</small>
                        </div>
                        <i class="fas fa-chevron-right"></i>
                    </div>
                    
                    <div class="function-item" onclick="staffProfile.changePassword()">
                        <div class="function-icon">
                            <i class="fas fa-key"></i>
                        </div>
                        <div class="function-info">
                            <span class="function-title">更改密碼</span>
                            <small>修改登入密碼</small>
                        </div>
                        <i class="fas fa-chevron-right"></i>
                    </div>
                    
                    <div class="function-item" onclick="staffProfile.contactSupervisor()">
                        <div class="function-icon">
                            <i class="fas fa-phone"></i>
                        </div>
                        <div class="function-info">
                            <span class="function-title">聯繫主管</span>
                            <small>快速聯繫功能</small>
                        </div>
                        <i class="fas fa-chevron-right"></i>
                    </div>
                    
                    <div class="function-item logout" onclick="staffProfile.logout()">
                        <div class="function-icon">
                            <i class="fas fa-sign-out-alt"></i>
                        </div>
                        <div class="function-info">
                            <span class="function-title">登出</span>
                            <small>退出當前帳號</small>
                        </div>
                        <i class="fas fa-chevron-right"></i>
                    </div>
                </div>
            </div>

            <!-- Password Change Modal -->
            <div class="password-modal" id="password-modal" style="display: none;">
                <div class="modal-content" id="password-modal-content">
                    ${this.getPasswordChangeHTML()}
                </div>
            </div>

            <!-- Schedule Modal -->
            <div class="schedule-modal" id="schedule-modal" style="display: none;">
                <div class="modal-content" id="schedule-modal-content">
                    ${this.getScheduleHTML()}
                </div>
            </div>

            <!-- Contact Modal -->
            <div class="contact-modal" id="contact-modal" style="display: none;">
                <div class="modal-content" id="contact-modal-content">
                    ${this.getContactHTML()}
                </div>
            </div>
        </div>`;
    }

    getProfileInfoHTML() {
        if (this.isEditing) {
            return `
                <div class="profile-edit-form">
                    <div class="form-group">
                        <label class="form-label">姓名</label>
                        <input type="text" class="form-input" id="edit-username" 
                               value="${this.currentUser?.username || ''}" 
                               placeholder="請輸入姓名">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">工號</label>
                        <input type="text" class="form-input" id="edit-staff-id" 
                               value="${this.currentUser?.staffId || ''}" 
                               placeholder="請輸入工號" readonly>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">部門</label>
                        <select class="form-select" id="edit-department">
                            <option value="廚房" ${this.currentUser?.department === '廚房' ? 'selected' : ''}>廚房</option>
                            <option value="外場" ${this.currentUser?.department === '外場' ? 'selected' : ''}>外場</option>
                            <option value="管理" ${this.currentUser?.department === '管理' ? 'selected' : ''}>管理</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">手機號碼</label>
                        <input type="tel" class="form-input" id="edit-phone" 
                               value="${this.currentUser?.phoneNumber || ''}" 
                               placeholder="09xxxxxxxx">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" id="edit-email" 
                               value="${this.currentUser?.email || ''}" 
                               placeholder="請輸入Email">
                    </div>
                    
                    <div class="edit-actions">
                        <button class="btn btn-secondary" onclick="staffProfile.cancelEdit()">
                            取消
                        </button>
                        <button class="btn btn-primary" onclick="staffProfile.saveProfile()">
                            儲存
                        </button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="profile-display-info">
                <h3>${this.currentUser?.username || '員工'}</h3>
                <div class="profile-details">
                    <div class="detail-item">
                        <i class="fas fa-id-card"></i>
                        <span class="detail-label">工號:</span>
                        <span class="detail-value">${this.currentUser?.staffId || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-building"></i>
                        <span class="detail-label">部門:</span>
                        <span class="detail-value">${this.currentUser?.department || '廚房'}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-phone"></i>
                        <span class="detail-label">手機:</span>
                        <span class="detail-value">${this.currentUser?.phoneNumber || '未設定'}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-envelope"></i>
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${this.currentUser?.email || '未設定'}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-calendar-plus"></i>
                        <span class="detail-label">入職:</span>
                        <span class="detail-value">${this.currentUser?.joinDate || '2024-01-01'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    getAchievementsHTML() {
        const achievements = [
            { icon: '🥇', title: '本週效率冠軍', description: '效率排名第一', date: '2024-08-15' },
            { icon: '⚡', title: '零延遲達人', description: '連續30天無超時', date: '2024-08-10' },
            { icon: '👑', title: '顧客好評王', description: '顧客滿意度100%', date: '2024-08-05' }
        ];

        return achievements.map(achievement => `
            <div class="achievement-item">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-title">${achievement.title}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                    <div class="achievement-date">${achievement.date}</div>
                </div>
            </div>
        `).join('');
    }

    getPasswordChangeHTML() {
        return `
            <div class="password-change-header">
                <button class="modal-close-btn" onclick="staffProfile.hidePasswordModal()">
                    <i class="fas fa-times"></i>
                </button>
                <h3>更改密碼</h3>
            </div>
            
            <div class="password-change-body">
                <form id="password-change-form">
                    <div class="form-group">
                        <label class="form-label">目前密碼</label>
                        <div class="password-input-container">
                            <input type="password" class="form-input" name="currentPassword" 
                                   placeholder="請輸入目前密碼" required>
                            <button type="button" class="password-toggle" onclick="staffProfile.togglePassword(this)">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">新密碼</label>
                        <div class="password-input-container">
                            <input type="password" class="form-input" name="newPassword" 
                                   placeholder="請輸入新密碼 (至少6位)" required>
                            <button type="button" class="password-toggle" onclick="staffProfile.togglePassword(this)">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">確認新密碼</label>
                        <div class="password-input-container">
                            <input type="password" class="form-input" name="confirmPassword" 
                                   placeholder="請再次輸入新密碼" required>
                            <button type="button" class="password-toggle" onclick="staffProfile.togglePassword(this)">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            
            <div class="password-change-actions">
                <button class="btn btn-secondary" onclick="staffProfile.hidePasswordModal()">
                    取消
                </button>
                <button class="btn btn-primary" onclick="staffProfile.submitPasswordChange()">
                    更改密碼
                </button>
            </div>
        `;
    }

    getScheduleHTML() {
        const weekDays = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
        const schedule = [
            { day: '週一', shift: '09:00-17:00', status: 'scheduled' },
            { day: '週二', shift: '09:00-17:00', status: 'scheduled' },
            { day: '週三', shift: '休假', status: 'off' },
            { day: '週四', shift: '09:00-17:00', status: 'scheduled' },
            { day: '週五', shift: '09:00-17:00', status: 'scheduled' },
            { day: '週六', shift: '10:00-18:00', status: 'scheduled' },
            { day: '週日', shift: '休假', status: 'off' }
        ];

        return `
            <div class="schedule-header">
                <button class="modal-close-btn" onclick="staffProfile.hideScheduleModal()">
                    <i class="fas fa-times"></i>
                </button>
                <h3>排班資訊</h3>
            </div>
            
            <div class="schedule-body">
                <div class="schedule-week">
                    <h4>本週排班 (${this.getCurrentWeek()})</h4>
                    <div class="schedule-list">
                        ${schedule.map(item => `
                            <div class="schedule-item ${item.status}">
                                <div class="schedule-day">${item.day}</div>
                                <div class="schedule-shift">${item.shift}</div>
                                <div class="schedule-status">
                                    ${item.status === 'off' ? 
                                        '<i class="fas fa-bed"></i>' : 
                                        '<i class="fas fa-briefcase"></i>'}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="schedule-summary">
                    <div class="summary-item">
                        <span class="summary-label">本週工時:</span>
                        <span class="summary-value">40小時</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">休假天數:</span>
                        <span class="summary-value">2天</span>
                    </div>
                </div>
            </div>
        `;
    }

    getContactHTML() {
        const contacts = [
            { role: '主管', name: '陳店長', phone: '0912-345-678', ext: '101' },
            { role: '人事', name: '李經理', phone: '0912-345-679', ext: '102' },
            { role: 'IT支援', name: '系統支援', phone: '0912-345-680', ext: '999' }
        ];

        return `
            <div class="contact-header">
                <button class="modal-close-btn" onclick="staffProfile.hideContactModal()">
                    <i class="fas fa-times"></i>
                </button>
                <h3>聯繫資訊</h3>
            </div>
            
            <div class="contact-body">
                <div class="contact-list">
                    ${contacts.map(contact => `
                        <div class="contact-item">
                            <div class="contact-info">
                                <div class="contact-role">${contact.role}</div>
                                <div class="contact-name">${contact.name}</div>
                                <div class="contact-details">
                                    <span class="contact-phone">${contact.phone}</span>
                                    <span class="contact-ext">分機 ${contact.ext}</span>
                                </div>
                            </div>
                            <div class="contact-actions">
                                <button class="btn btn-small btn-primary" onclick="staffProfile.callContact('${contact.phone}')">
                                    <i class="fas fa-phone"></i>
                                    撥打
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="emergency-contact">
                    <h4>🚨 緊急聯繫</h4>
                    <button class="btn btn-danger btn-large" onclick="staffProfile.emergencyCall()">
                        <i class="fas fa-exclamation-triangle"></i>
                        緊急呼叫
                    </button>
                </div>
            </div>
        `;
    }

    initialize() {
        this.loadMonthlyStats();
        this.loadAchievements();
    }

    loadMonthlyStats() {
        // Load monthly statistics
        this.monthlyStats = {
            processedOrders: 658,
            efficiency: '96.5%',
            avgTime: '17分',
            satisfaction: '4.9'
        };
    }

    loadAchievements() {
        // Load recent achievements
        this.achievements = [
            { icon: '🥇', title: '本週效率冠軍', date: '2024-08-15' },
            { icon: '⚡', title: '零延遲達人', date: '2024-08-10' },
            { icon: '👑', title: '顧客好評王', date: '2024-08-05' }
        ];
    }

    // Profile editing
    toggleEditMode() {
        this.isEditing = !this.isEditing;
        
        if (this.isEditing) {
            this.originalUserData = { ...this.currentUser };
        }
        
        this.updateProfileInfo();
    }

    updateProfileInfo() {
        const profileInfoEl = document.getElementById('profile-info');
        if (profileInfoEl) {
            profileInfoEl.innerHTML = this.getProfileInfoHTML();
        }
    }

    async saveProfile() {
        try {
            const updatedData = {
                username: document.getElementById('edit-username').value,
                staffId: document.getElementById('edit-staff-id').value,
                department: document.getElementById('edit-department').value,
                phoneNumber: document.getElementById('edit-phone').value,
                email: document.getElementById('edit-email').value
            };

            // Validate data
            if (!updatedData.username.trim()) {
                app.showToast('請輸入姓名', 'warning');
                return;
            }

            // Update current user data
            this.currentUser = { ...this.currentUser, ...updatedData };
            Storage.setUser(this.currentUser);

            this.isEditing = false;
            this.updateProfileInfo();

            app.showToast('個人資料已更新', 'success');

        } catch (error) {
            console.error('Failed to save profile:', error);
            app.showToast('更新失敗', 'error');
        }
    }

    cancelEdit() {
        this.currentUser = { ...this.originalUserData };
        this.isEditing = false;
        this.updateProfileInfo();
    }

    changeAvatar() {
        // TODO: Implement avatar change functionality
        app.showToast('頭像更換功能建構中', 'info');
    }

    // Password change
    changePassword() {
        const modal = document.getElementById('password-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    hidePasswordModal() {
        const modal = document.getElementById('password-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async submitPasswordChange() {
        try {
            const form = document.getElementById('password-change-form');
            const formData = new FormData(form);
            
            const currentPassword = formData.get('currentPassword');
            const newPassword = formData.get('newPassword');
            const confirmPassword = formData.get('confirmPassword');

            // Validation
            if (!currentPassword || !newPassword || !confirmPassword) {
                app.showToast('請填寫所有欄位', 'warning');
                return;
            }

            if (newPassword.length < 6) {
                app.showToast('新密碼至少需要6位', 'warning');
                return;
            }

            if (newPassword !== confirmPassword) {
                app.showToast('新密碼不匹配', 'warning');
                return;
            }

            // TODO: Call API to change password
            // await api.changePassword(currentPassword, newPassword);

            this.hidePasswordModal();
            app.showToast('密碼已更改', 'success');

        } catch (error) {
            console.error('Failed to change password:', error);
            app.showToast('密碼更改失敗', 'error');
        }
    }

    togglePassword(button) {
        const input = button.previousElementSibling;
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    // Schedule management
    showSchedule() {
        const modal = document.getElementById('schedule-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    hideScheduleModal() {
        const modal = document.getElementById('schedule-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    getCurrentWeek() {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
        const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
        
        const formatDate = (date) => {
            return `${date.getMonth() + 1}/${date.getDate()}`;
        };
        
        return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
    }

    // Contact management
    contactSupervisor() {
        const modal = document.getElementById('contact-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    hideContactModal() {
        const modal = document.getElementById('contact-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    callContact(phoneNumber) {
        // TODO: Implement phone call functionality
        app.showToast(`撥打 ${phoneNumber}`, 'info');
    }

    emergencyCall() {
        const confirmed = confirm('確定要進行緊急呼叫嗎？');
        if (confirmed) {
            // TODO: Implement emergency call
            app.showToast('緊急呼叫已發出', 'warning');
        }
    }

    // Navigation methods
    goToStats() {
        app.navigateTo('staff-stats');
    }

    goToOrderHistory() {
        app.navigateTo('staff-orders');
    }

    goToNotifications() {
        app.navigateTo('staff-notifications');
    }

    // Logout
    async logout() {
        const confirmed = confirm('確定要登出嗎？');
        if (confirmed) {
            try {
                // Call logout API
                await api.logout();
                
                // Clear local data
                Storage.clearUser();
                api.clearToken();
                
                app.currentUser = null;
                app.showToast('已登出', 'success');
                
                // Navigate to login page
                app.navigateTo('login');
                app.hideNavigation();
                
            } catch (error) {
                console.error('Logout failed:', error);
                // Force logout even if API fails
                Storage.clearUser();
                api.clearToken();
                app.currentUser = null;
                app.navigateTo('login');
                app.hideNavigation();
            }
        }
    }

    // Helper methods
    getStaffAvatar() {
        if (this.currentUser?.department === '廚房') return '👨‍🍳';
        if (this.currentUser?.department === '外場') return '👨‍💼';
        return '👤';
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('zh-TW');
    }

    cleanup() {
        // Clean up any intervals or event listeners
    }
}

// Create global instance
window.staffProfile = new StaffProfile();
window.staffProfilePage = {
    getStaffProfileTemplate: () => window.staffProfile.getProfilePageTemplate(),
    initializeStaffProfilePage: () => window.staffProfile.initializeProfilePage()
};