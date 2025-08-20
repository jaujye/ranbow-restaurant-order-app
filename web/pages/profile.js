// Profile Page - User profile and settings

class ProfilePage {
    constructor() {
        this.user = null;
        this.isEditing = false;
        this.originalUserData = null;
    }

    getProfilePageTemplate() {
        return `
        <div class="profile-page">
            <!-- Profile Header -->
            <div class="profile-header">
                <div class="profile-avatar">
                    <img id="profile-avatar" src="assets/images/default-avatar.svg" alt="頭像">
                    <button class="avatar-edit-btn" onclick="profilePage.editAvatar()">
                        <i class="fas fa-camera"></i>
                    </button>
                </div>
                <div class="profile-info">
                    <h2 id="profile-name">載入中...</h2>
                    <p id="profile-role">會員</p>
                    <p id="profile-email">email@example.com</p>
                </div>
                <button class="profile-edit-btn" id="edit-profile-btn" onclick="profilePage.toggleEdit()">
                    <i class="fas fa-edit"></i>
                    編輯
                </button>
            </div>

            <!-- Profile Stats -->
            <div class="profile-stats">
                <h3>📊 我的統計</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-shopping-bag"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number" id="total-orders">0</div>
                            <div class="stat-label">總訂單數</div>
                            <div class="stat-subtitle" id="total-orders-subtitle">筆</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-wallet"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number" id="total-spent">NT$ 0</div>
                            <div class="stat-label">累計消費</div>
                            <div class="stat-subtitle" id="total-spent-subtitle"></div>
                        </div>
                    </div>
                </div>
                <div class="member-level-card">
                    <div class="member-level-content">
                        <div class="member-badge">
                            <span id="member-level">普通</span>
                        </div>
                        <div class="member-info">
                            <div class="member-title">會員等級</div>
                            <div class="member-benefits" id="member-benefits">享有基本會員優惠</div>
                        </div>
                    </div>
                    <div class="member-progress" id="member-progress">
                        <!-- 會員進度條將在這裡顯示 -->
                    </div>
                </div>
            </div>

            <!-- Profile Content -->
            <div class="profile-content">
                <!-- Personal Information Section -->
                <div class="profile-section">
                    <h3>個人資料</h3>
                    <div class="profile-form" id="profile-form">
                        <div class="form-group">
                            <label for="profile-username">姓名</label>
                            <input type="text" id="profile-username" class="form-input" readonly>
                        </div>
                        <div class="form-group">
                            <label for="profile-email-input">Email</label>
                            <input type="email" id="profile-email-input" class="form-input" readonly>
                        </div>
                        <div class="form-group">
                            <label for="profile-phone">手機號碼</label>
                            <input type="tel" id="profile-phone" class="form-input" readonly>
                        </div>
                        <div class="form-group">
                            <label for="profile-birthday">生日</label>
                            <input type="date" id="profile-birthday" class="form-input" readonly>
                        </div>
                        <div class="form-actions hidden" id="form-actions">
                            <button class="btn btn-secondary" onclick="profilePage.cancelEdit()">取消</button>
                            <button class="btn btn-primary" onclick="profilePage.saveProfile()">儲存</button>
                        </div>
                    </div>
                </div>

                <!-- Menu Sections -->
                <div class="profile-section">
                    <h3>功能選單</h3>
                    <div class="menu-list">
                        <div class="menu-item" onclick="profilePage.navigateToOrders()">
                            <div class="menu-icon">
                                <i class="fas fa-receipt"></i>
                            </div>
                            <div class="menu-content">
                                <div class="menu-title">我的訂單</div>
                                <div class="menu-subtitle">查看訂單歷史和狀態</div>
                            </div>
                            <div class="menu-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>

                        <div class="menu-item" onclick="profilePage.showChangePassword()">
                            <div class="menu-icon">
                                <i class="fas fa-lock"></i>
                            </div>
                            <div class="menu-content">
                                <div class="menu-title">修改密碼</div>
                                <div class="menu-subtitle">更新登入密碼</div>
                            </div>
                            <div class="menu-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>

                        <div class="menu-item" onclick="profilePage.showCoupons()">
                            <div class="menu-icon">
                                <i class="fas fa-gift"></i>
                            </div>
                            <div class="menu-content">
                                <div class="menu-title">🎁 優惠券</div>
                                <div class="menu-subtitle">查看和使用優惠券</div>
                            </div>
                            <div class="menu-arrow">
                                <i class="fas fa-chevron-right"></i>
                                <span class="menu-badge" id="coupon-count">3</span>
                            </div>
                        </div>

                        <div class="menu-item" onclick="profilePage.showAddresses()">
                            <div class="menu-icon">
                                <i class="fas fa-map-marker-alt"></i>
                            </div>
                            <div class="menu-content">
                                <div class="menu-title">📍 收貨地址</div>
                                <div class="menu-subtitle">管理外送地址</div>
                            </div>
                            <div class="menu-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>

                        <div class="menu-item" onclick="profilePage.showMyReviews()">
                            <div class="menu-icon">
                                <i class="fas fa-star"></i>
                            </div>
                            <div class="menu-content">
                                <div class="menu-title">⭐ 我的評價</div>
                                <div class="menu-subtitle">查看已評價的餐點</div>
                            </div>
                            <div class="menu-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>

                        <div class="menu-item" onclick="profilePage.showNotificationSettings()">
                            <div class="menu-icon">
                                <i class="fas fa-bell"></i>
                            </div>
                            <div class="menu-content">
                                <div class="menu-title">通知設定</div>
                                <div class="menu-subtitle">管理推送通知偏好</div>
                            </div>
                            <div class="menu-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>

                        <div class="menu-item" onclick="profilePage.showPrivacySettings()">
                            <div class="menu-icon">
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <div class="menu-content">
                                <div class="menu-title">🛡️ 隱私設定</div>
                                <div class="menu-subtitle">管理個人資料隱私</div>
                            </div>
                            <div class="menu-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>

                        <div class="menu-item" onclick="profilePage.contactCustomerService()">
                            <div class="menu-icon">
                                <i class="fas fa-headset"></i>
                            </div>
                            <div class="menu-content">
                                <div class="menu-title">📞 聯繫客服</div>
                                <div class="menu-subtitle">獲得幫助和支援</div>
                            </div>
                            <div class="menu-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>

                        <div class="menu-item" onclick="profilePage.showAppSettings()">
                            <div class="menu-icon">
                                <i class="fas fa-cog"></i>
                            </div>
                            <div class="menu-content">
                                <div class="menu-title">應用程式設定</div>
                                <div class="menu-subtitle">自訂應用程式體驗</div>
                            </div>
                            <div class="menu-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>

                        <div class="menu-item" onclick="profilePage.showAbout()">
                            <div class="menu-icon">
                                <i class="fas fa-info-circle"></i>
                            </div>
                            <div class="menu-content">
                                <div class="menu-title">ℹ️ 關於我們</div>
                                <div class="menu-subtitle">應用程式資訊和服務條款</div>
                            </div>
                            <div class="menu-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Logout Section -->
                <div class="profile-section">
                    <button class="logout-btn" onclick="profilePage.logout()">
                        <i class="fas fa-sign-out-alt"></i>
                        登出
                    </button>
                </div>
            </div>

            <!-- Change Password Modal -->
            <div class="modal-overlay hidden" id="change-password-modal">
                <div class="change-password-modal">
                    <div class="modal-header">
                        <h3>修改密碼</h3>
                        <button class="modal-close" onclick="profilePage.hideChangePassword()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        <form id="change-password-form">
                            <div class="form-group">
                                <label for="current-password">目前密碼</label>
                                <input type="password" id="current-password" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label for="new-password">新密碼</label>
                                <input type="password" id="new-password" class="form-input" required minlength="6">
                                <small class="form-hint">密碼至少需要6個字元</small>
                            </div>
                            <div class="form-group">
                                <label for="confirm-password">確認新密碼</label>
                                <input type="password" id="confirm-password" class="form-input" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="profilePage.hideChangePassword()">取消</button>
                        <button class="btn btn-primary" onclick="profilePage.changePassword()">確定修改</button>
                    </div>
                </div>
            </div>

            <!-- Notification Settings Modal -->
            <div class="modal-overlay hidden" id="notification-settings-modal">
                <div class="notification-settings-modal">
                    <div class="modal-header">
                        <h3>通知設定</h3>
                        <button class="modal-close" onclick="profilePage.hideNotificationSettings()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        <div class="setting-group">
                            <h4>訂單通知</h4>
                            <label class="toggle-setting">
                                <input type="checkbox" id="order-notifications" checked>
                                <span class="toggle-slider"></span>
                                <span class="setting-label">訂單狀態更新</span>
                            </label>
                            <label class="toggle-setting">
                                <input type="checkbox" id="preparation-notifications" checked>
                                <span class="toggle-slider"></span>
                                <span class="setting-label">餐點準備完成</span>
                            </label>
                        </div>

                        <div class="setting-group">
                            <h4>促銷通知</h4>
                            <label class="toggle-setting">
                                <input type="checkbox" id="promotion-notifications">
                                <span class="toggle-slider"></span>
                                <span class="setting-label">優惠活動</span>
                            </label>
                            <label class="toggle-setting">
                                <input type="checkbox" id="birthday-notifications" checked>
                                <span class="toggle-slider"></span>
                                <span class="setting-label">生日優惠</span>
                            </label>
                        </div>

                        <div class="setting-group">
                            <h4>系統通知</h4>
                            <label class="toggle-setting">
                                <input type="checkbox" id="system-notifications">
                                <span class="toggle-slider"></span>
                                <span class="setting-label">系統公告</span>
                            </label>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="profilePage.saveNotificationSettings()">儲存設定</button>
                    </div>
                </div>
            </div>

            <!-- Avatar Edit Modal -->
            <div class="modal-overlay hidden" id="avatar-edit-modal">
                <div class="avatar-edit-modal">
                    <div class="modal-header">
                        <h3>更換頭像</h3>
                        <button class="modal-close" onclick="profilePage.hideAvatarEdit()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        <div class="avatar-preview">
                            <img id="avatar-preview" src="" alt="頭像預覽">
                        </div>
                        <div class="avatar-options">
                            <input type="file" id="avatar-upload" accept="image/*" style="display: none" onchange="profilePage.handleAvatarUpload(event)">
                            <button class="btn btn-outline" onclick="document.getElementById('avatar-upload').click()">
                                <i class="fas fa-upload"></i>
                                上傳圖片
                            </button>
                            <div class="upload-hint">
                                <small>支援 JPG、PNG 格式，建議尺寸 200x200</small>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="profilePage.hideAvatarEdit()">取消</button>
                        <button class="btn btn-primary" onclick="profilePage.saveAvatar()">儲存</button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    async initializeProfilePage() {
        try {
            this.user = Storage.getUser();
            if (!this.user) {
                app.navigateTo('login');
                return;
            }

            await this.loadUserProfile();
            this.updateProfileDisplay();
            this.loadUserStats();
            this.loadNotificationSettings();
            
        } catch (error) {
            console.error('Failed to initialize profile page:', error);
            toast.error('載入個人資料時發生錯誤');
        }
    }

    async loadUserProfile() {
        try {
            // Try to get fresh data from API
            const freshUserData = await api.getUserProfile(this.user.userId);
            this.user = { ...this.user, ...freshUserData };
            Storage.setUser(this.user);
        } catch (error) {
            console.warn('Failed to load fresh user data, using cached data:', error);
            // Use cached user data if API fails
        }
    }

    updateProfileDisplay() {
        // Update header info
        document.getElementById('profile-name').textContent = this.user.username || '未設定';
        document.getElementById('profile-role').textContent = this.getMemberLevelText(this.user.memberLevel);
        document.getElementById('profile-email').textContent = this.user.email || '';

        // Update avatar
        const avatar = document.getElementById('profile-avatar');
        if (avatar) {
            avatar.src = this.user.avatarUrl || 'assets/images/default-avatar.svg';
        }

        // Update form fields
        document.getElementById('profile-username').value = this.user.username || '';
        document.getElementById('profile-email-input').value = this.user.email || '';
        document.getElementById('profile-phone').value = this.user.phoneNumber || '';
        document.getElementById('profile-birthday').value = this.user.birthday || '';
    }

    async loadUserStats() {
        try {
            // Mock user statistics - in real app, this would come from API
            const stats = {
                totalOrders: 28,
                totalSpent: 12580,
                memberLevel: 'SILVER'
            };

            document.getElementById('total-orders').textContent = stats.totalOrders;
            document.getElementById('total-orders-subtitle').textContent = '筆';
            document.getElementById('total-spent').textContent = Helpers.formatCurrency(stats.totalSpent);
            document.getElementById('total-spent-subtitle').textContent = '本月已消費 NT$ 1,200';
            document.getElementById('member-level').textContent = this.getMemberLevelText(stats.memberLevel);
            
            // Update member benefits and progress
            this.updateMemberLevelDisplay(stats.memberLevel, stats.totalSpent);
            
            // Update coupon count
            document.getElementById('coupon-count').textContent = '3';

        } catch (error) {
            console.error('Failed to load user stats:', error);
        }
    }

    updateMemberLevelDisplay(level, totalSpent) {
        const benefits = this.getMemberBenefits(level);
        const progress = this.getMemberProgress(level, totalSpent);
        
        document.getElementById('member-benefits').textContent = benefits;
        
        const progressContainer = document.getElementById('member-progress');
        if (progressContainer && progress.showProgress) {
            progressContainer.innerHTML = `
                <div class="progress-info">
                    <span>距離 ${progress.nextLevel} 還需</span>
                    <span class="progress-amount">${Helpers.formatCurrency(progress.remaining)}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                </div>
            `;
        }
    }

    getMemberBenefits(level) {
        const benefits = {
            'BRONZE': '享有基本會員優惠',
            'SILVER': '享有銀牌專屬優惠和生日禮',
            'GOLD': '享有金牌VIP待遇和免費外送',
            'PLATINUM': '享有白金頂級服務和專屬客服'
        };
        return benefits[level] || '享有基本會員優惠';
    }

    getMemberProgress(level, totalSpent) {
        const levels = {
            'BRONZE': { next: 'SILVER', threshold: 5000 },
            'SILVER': { next: 'GOLD', threshold: 15000 },
            'GOLD': { next: 'PLATINUM', threshold: 30000 },
            'PLATINUM': { next: null, threshold: null }
        };
        
        const currentLevel = levels[level];
        if (!currentLevel || !currentLevel.next) {
            return { showProgress: false };
        }
        
        const remaining = currentLevel.threshold - totalSpent;
        const percentage = Math.min((totalSpent / currentLevel.threshold) * 100, 100);
        
        return {
            showProgress: true,
            nextLevel: this.getMemberLevelText(currentLevel.next),
            remaining: remaining > 0 ? remaining : 0,
            percentage: percentage
        };
    }

    getMemberLevelText(level) {
        const levels = {
            'BRONZE': '🥉 銅牌會員',
            'SILVER': '🥈 銀牌會員',
            'GOLD': '🥇 金牌會員',
            'PLATINUM': '💎 白金會員'
        };
        return levels[level] || '普通會員';
    }

    // Profile editing
    toggleEdit() {
        this.isEditing = !this.isEditing;
        
        if (this.isEditing) {
            this.originalUserData = { ...this.user };
            this.enableEditing();
        } else {
            this.disableEditing();
        }
    }

    enableEditing() {
        const inputs = document.querySelectorAll('#profile-form .form-input');
        inputs.forEach(input => {
            if (input.id !== 'profile-email-input') { // Email typically shouldn't be editable
                input.removeAttribute('readonly');
                input.classList.add('editable');
            }
        });

        document.getElementById('edit-profile-btn').innerHTML = '<i class="fas fa-times"></i> 取消';
        document.getElementById('form-actions').classList.remove('hidden');
    }

    disableEditing() {
        const inputs = document.querySelectorAll('#profile-form .form-input');
        inputs.forEach(input => {
            input.setAttribute('readonly', true);
            input.classList.remove('editable');
        });

        document.getElementById('edit-profile-btn').innerHTML = '<i class="fas fa-edit"></i> 編輯';
        document.getElementById('form-actions').classList.add('hidden');
        this.isEditing = false;
    }

    cancelEdit() {
        if (this.originalUserData) {
            this.user = { ...this.originalUserData };
            this.updateProfileDisplay();
            this.originalUserData = null;
        }
        this.disableEditing();
    }

    async saveProfile() {
        try {
            const updatedData = {
                username: document.getElementById('profile-username').value.trim(),
                phoneNumber: document.getElementById('profile-phone').value.trim(),
                birthday: document.getElementById('profile-birthday').value
            };

            // Validate data
            if (!updatedData.username) {
                toast.error('姓名不能為空');
                return;
            }

            if (updatedData.phoneNumber && !Helpers.isValidPhone(updatedData.phoneNumber)) {
                toast.error('手機號碼格式不正確');
                return;
            }

            // Update via API
            await api.updateUserProfile(this.user.userId, updatedData);

            // Update local data
            this.user = { ...this.user, ...updatedData };
            Storage.setUser(this.user);

            this.disableEditing();
            toast.success('個人資料已更新');

        } catch (error) {
            console.error('Failed to save profile:', error);
            toast.error('更新個人資料失敗');
        }
    }

    // Password change
    showChangePassword() {
        const modal = document.getElementById('change-password-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            
            // Clear form
            document.getElementById('change-password-form').reset();
        }
    }

    hideChangePassword() {
        const modal = document.getElementById('change-password-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    async changePassword() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Validate inputs
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('請填寫所有欄位');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('新密碼與確認密碼不符');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('新密碼至少需要6個字元');
            return;
        }

        try {
            await api.changePassword(this.user.userId, {
                currentPassword,
                newPassword
            });

            this.hideChangePassword();
            toast.success('密碼修改成功');

        } catch (error) {
            console.error('Failed to change password:', error);
            toast.error('密碼修改失敗，請檢查目前密碼是否正確');
        }
    }

    // Avatar editing
    editAvatar() {
        const modal = document.getElementById('avatar-edit-modal');
        const preview = document.getElementById('avatar-preview');
        
        if (modal && preview) {
            preview.src = this.user.avatarUrl || 'assets/images/default-avatar.svg';
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    hideAvatarEdit() {
        const modal = document.getElementById('avatar-edit-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            toast.error('請選擇圖片檔案');
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast.error('圖片大小不能超過 2MB');
            return;
        }

        // Preview image
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('avatar-preview');
            if (preview) {
                preview.src = e.target.result;
            }
            this.pendingAvatarFile = file;
        };
        reader.readAsDataURL(file);
    }

    async saveAvatar() {
        if (!this.pendingAvatarFile) {
            this.hideAvatarEdit();
            return;
        }

        try {
            // Upload avatar
            const uploadResult = await api.uploadImage(this.pendingAvatarFile, 'avatar');
            
            // Update user avatar URL
            const updatedUser = await api.updateUserProfile(this.user.userId, {
                avatarUrl: uploadResult.url
            });

            this.user.avatarUrl = uploadResult.url;
            Storage.setUser(this.user);

            // Update UI
            document.getElementById('profile-avatar').src = uploadResult.url;

            this.hideAvatarEdit();
            toast.success('頭像已更新');

        } catch (error) {
            console.error('Failed to save avatar:', error);
            toast.error('頭像更新失敗');
        }
    }

    // Settings modals
    showNotificationSettings() {
        const modal = document.getElementById('notification-settings-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    hideNotificationSettings() {
        const modal = document.getElementById('notification-settings-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    loadNotificationSettings() {
        const settings = Storage.getPreference('notifications', {
            order: true,
            preparation: true,
            promotion: false,
            birthday: true,
            system: false
        });

        document.getElementById('order-notifications').checked = settings.order;
        document.getElementById('preparation-notifications').checked = settings.preparation;
        document.getElementById('promotion-notifications').checked = settings.promotion;
        document.getElementById('birthday-notifications').checked = settings.birthday;
        document.getElementById('system-notifications').checked = settings.system;
    }

    saveNotificationSettings() {
        const settings = {
            order: document.getElementById('order-notifications').checked,
            preparation: document.getElementById('preparation-notifications').checked,
            promotion: document.getElementById('promotion-notifications').checked,
            birthday: document.getElementById('birthday-notifications').checked,
            system: document.getElementById('system-notifications').checked
        };

        Storage.setPreference('notifications', settings);
        this.hideNotificationSettings();
        toast.success('通知設定已儲存');
    }

    showPrivacySettings() {
        modal.alert('隱私設定功能開發中...', '提示');
    }

    showAppSettings() {
        modal.alert('應用程式設定功能開發中...', '提示');
    }

    showCoupons() {
        const couponsContent = `
            <div class="coupons-content">
                <div class="coupon-card available">
                    <div class="coupon-header">
                        <div class="coupon-discount">9折</div>
                        <div class="coupon-type">滿額優惠</div>
                    </div>
                    <div class="coupon-details">
                        <p class="coupon-title">滿500折50</p>
                        <p class="coupon-desc">單筆消費滿NT$ 500即可使用</p>
                        <p class="coupon-expire">有效期至 2024-12-31</p>
                    </div>
                    <div class="coupon-action">
                        <button class="btn btn-primary btn-small">立即使用</button>
                    </div>
                </div>
                
                <div class="coupon-card available">
                    <div class="coupon-header">
                        <div class="coupon-discount">免費</div>
                        <div class="coupon-type">生日禮</div>
                    </div>
                    <div class="coupon-details">
                        <p class="coupon-title">生日免費甜點</p>
                        <p class="coupon-desc">生日月份可免費兌換甜點一份</p>
                        <p class="coupon-expire">有效期至 2024-12-31</p>
                    </div>
                    <div class="coupon-action">
                        <button class="btn btn-primary btn-small">立即使用</button>
                    </div>
                </div>
                
                <div class="coupon-card used">
                    <div class="coupon-header">
                        <div class="coupon-discount">8折</div>
                        <div class="coupon-type">已使用</div>
                    </div>
                    <div class="coupon-details">
                        <p class="coupon-title">週末優惠券</p>
                        <p class="coupon-desc">週末使用享8折優惠</p>
                        <p class="coupon-expire">已於 2024-08-15 使用</p>
                    </div>
                </div>
            </div>
        `;

        modal.show(couponsContent, {
            title: '🎁 我的優惠券',
            size: 'large'
        });
    }

    showAddresses() {
        const addressesContent = `
            <div class="addresses-content">
                <div class="address-card default">
                    <div class="address-header">
                        <span class="address-label">預設地址</span>
                        <div class="address-actions">
                            <button class="btn btn-outline btn-small">編輯</button>
                            <button class="btn btn-outline btn-small">刪除</button>
                        </div>
                    </div>
                    <div class="address-details">
                        <p class="address-name">王小明</p>
                        <p class="address-phone">0912-345-678</p>
                        <p class="address-location">台北市中正區忠孝西路一段50號</p>
                    </div>
                </div>
                
                <div class="address-card">
                    <div class="address-header">
                        <span class="address-label">公司地址</span>
                        <div class="address-actions">
                            <button class="btn btn-outline btn-small">編輯</button>
                            <button class="btn btn-outline btn-small">刪除</button>
                        </div>
                    </div>
                    <div class="address-details">
                        <p class="address-name">王小明</p>
                        <p class="address-phone">0912-345-678</p>
                        <p class="address-location">台北市信義區市府路45號</p>
                    </div>
                </div>
                
                <div class="add-address-card">
                    <button class="btn btn-outline">
                        <i class="fas fa-plus"></i>
                        新增地址
                    </button>
                </div>
            </div>
        `;

        modal.show(addressesContent, {
            title: '📍 收貨地址',
            size: 'large'
        });
    }

    showMyReviews() {
        const reviewsContent = `
            <div class="reviews-content">
                <div class="review-card">
                    <div class="review-header">
                        <div class="review-restaurant">彩虹餐廳</div>
                        <div class="review-date">2024-08-15</div>
                    </div>
                    <div class="review-rating">
                        <div class="stars">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                        </div>
                        <span class="rating-text">5.0 分</span>
                    </div>
                    <div class="review-content">
                        <p>招牌牛排很棒！肉質鮮嫩，調味恰到好處。服務態度也很好，會再來的！</p>
                    </div>
                    <div class="review-items">
                        <span class="review-item">招牌牛排</span>
                        <span class="review-item">蜜汁雞腿</span>
                    </div>
                </div>
                
                <div class="review-card">
                    <div class="review-header">
                        <div class="review-restaurant">彩虹餐廳</div>
                        <div class="review-date">2024-08-10</div>
                    </div>
                    <div class="review-rating">
                        <div class="stars">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="far fa-star"></i>
                        </div>
                        <span class="rating-text">4.0 分</span>
                    </div>
                    <div class="review-content">
                        <p>義式燉飯很香，份量也足夠。不過等待時間稍長，希望可以改善。</p>
                    </div>
                    <div class="review-items">
                        <span class="review-item">義式燉飯</span>
                    </div>
                </div>
                
                <div class="empty-state">
                    <p>沒有更多評價了</p>
                    <button class="btn btn-primary" onclick="app.navigateTo('orders')">
                        去評價訂單
                    </button>
                </div>
            </div>
        `;

        modal.show(reviewsContent, {
            title: '⭐ 我的評價',
            size: 'large'
        });
    }

    contactCustomerService() {
        const serviceContent = `
            <div class="customer-service-content">
                <div class="service-header">
                    <i class="fas fa-headset"></i>
                    <h4>客服中心</h4>
                    <p>我們隨時為您服務</p>
                </div>
                
                <div class="service-options">
                    <a href="tel:+886-2-1234-5678" class="service-option">
                        <i class="fas fa-phone"></i>
                        <div class="service-info">
                            <div class="service-title">電話客服</div>
                            <div class="service-subtitle">02-1234-5678</div>
                            <div class="service-time">服務時間：09:00-22:00</div>
                        </div>
                    </a>
                    
                    <div class="service-option" onclick="profilePage.startChat()">
                        <i class="fas fa-comments"></i>
                        <div class="service-info">
                            <div class="service-title">線上客服</div>
                            <div class="service-subtitle">即時聊天協助</div>
                            <div class="service-time">24小時線上服務</div>
                        </div>
                    </div>
                    
                    <a href="mailto:support@ranbow-restaurant.com" class="service-option">
                        <i class="fas fa-envelope"></i>
                        <div class="service-info">
                            <div class="service-title">郵件客服</div>
                            <div class="service-subtitle">support@ranbow-restaurant.com</div>
                            <div class="service-time">24小時內回覆</div>
                        </div>
                    </a>
                </div>
                
                <div class="faq-section">
                    <h5>常見問題</h5>
                    <div class="faq-item">
                        <strong>Q: 如何取消訂單？</strong>
                        <p>A: 在訂單確認前，可在「我的訂單」中取消。</p>
                    </div>
                    <div class="faq-item">
                        <strong>Q: 可以修改訂單內容嗎？</strong>
                        <p>A: 訂單確認後無法修改，請聯繫客服協助。</p>
                    </div>
                </div>
            </div>
        `;

        modal.show(serviceContent, {
            title: '📞 聯絡客服',
            size: 'large'
        });
    }

    startChat() {
        toast.info('正在連接線上客服...');
        // 這裡可以整合真實的線上客服系統
        setTimeout(() => {
            toast.success('客服人員將盡快為您服務！');
        }, 2000);
    }

    showAbout() {
        const aboutContent = `
            <div class="about-content">
                <div class="app-info">
                    <h4>Ranbow Restaurant</h4>
                    <p>版本 1.0.0</p>
                </div>
                <div class="company-info">
                    <p>彩虹餐廳點餐應用程式</p>
                    <p>© 2024 Ranbow Restaurant. All rights reserved.</p>
                </div>
                <div class="contact-info">
                    <p><strong>聯絡我們:</strong></p>
                    <p>電話: 02-1234-5678</p>
                    <p>Email: info@ranbow-restaurant.com</p>
                </div>
            </div>
        `;

        modal.show(aboutContent, {
            title: '關於我們',
            size: 'medium'
        });
    }

    // Navigation
    navigateToOrders() {
        app.navigateTo('orders');
    }

    async logout() {
        const confirmed = await modal.confirm('確定要登出嗎？');
        if (confirmed) {
            try {
                await api.logout();
                Storage.clearUser();
                Storage.clearCart();
                app.navigateTo('login');
                toast.success('已登出');
            } catch (error) {
                console.error('Logout failed:', error);
                // Clear local data anyway
                Storage.clearUser();
                Storage.clearCart();
                app.navigateTo('login');
            }
        }
    }
}

// Create global profile page instance
window.profilePage = new ProfilePage();