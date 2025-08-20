// Staff Authentication Pages - Login and Staff Switching

class StaffAuthPages {
    constructor() {
        this.currentForm = 'staff-login';
        this.selectedStaff = null;
        this.staffMembers = [
            { id: 'ST001', name: '李小華', department: '廚房', avatar: '👨‍🍳' },
            { id: 'ST002', name: '王大明', department: '外場', avatar: '👨‍💼' },
            { id: 'ST003', name: '陳小美', department: '廚房', avatar: '👩‍🍳' },
            { id: 'ST004', name: '張三', department: '外場', avatar: '👨‍💼' }
        ];
        this.validationRules = {
            staffId: {
                required: true,
                message: '請輸入工號或Email'
            },
            password: {
                required: true,
                minLength: 6,
                message: '密碼至少需要6個字符'
            }
        };
    }

    getStaffLoginPageTemplate() {
        return `
        <div class="staff-auth-container">
            <div class="staff-auth-card">
                <div class="staff-auth-header">
                    <div class="staff-logo-container">
                        <h1>👨‍🍳 員工工作台</h1>
                        <p>Ranbow Restaurant</p>
                    </div>
                    <h2>員工登入</h2>
                    <p class="staff-auth-subtitle">請輸入您的工號和密碼</p>
                </div>
                
                <form id="staff-login-form" class="staff-auth-form">
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-id-card"></i>
                            工號/Email
                        </label>
                        <input 
                            type="text" 
                            class="form-input staff-input" 
                            name="staffId" 
                            placeholder="請輸入工號或Email"
                            required
                            autocomplete="username"
                        >
                        <div class="form-error" id="staffId-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-lock"></i>
                            密碼
                        </label>
                        <div class="password-input-container">
                            <input 
                                type="password" 
                                class="form-input staff-input" 
                                name="password" 
                                placeholder="請輸入密碼"
                                required
                                autocomplete="current-password"
                            >
                            <button type="button" class="password-toggle" onclick="staffAuthPages.togglePassword(this)">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <div class="form-error" id="password-error"></div>
                    </div>
                    
                    <div class="form-options">
                        <label class="checkbox-label">
                            <input type="checkbox" name="remember" id="staff-remember-me">
                            <span class="checkmark"></span>
                            記住登入狀態
                        </label>
                    </div>
                    
                    <button type="submit" class="btn btn-staff btn-large" id="staff-login-btn">
                        <i class="fas fa-sign-in-alt"></i>
                        登入工作台
                    </button>
                    
                    <div class="form-divider">
                        <span>或</span>
                    </div>
                    
                    <div class="staff-quick-login">
                        <h4>🆔 快速登入</h4>
                        <div class="staff-grid">
                            ${this.staffMembers.map(staff => `
                                <button type="button" class="staff-card" onclick="staffAuthPages.selectQuickStaff('${staff.id}')">
                                    <div class="staff-avatar">${staff.avatar}</div>
                                    <div class="staff-info">
                                        <div class="staff-name">${staff.name}</div>
                                        <div class="staff-dept">${staff.department}</div>
                                        <div class="staff-id">工號: ${staff.id}</div>
                                    </div>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </form>
                
                <div class="staff-auth-footer">
                    <p class="staff-help">
                        <i class="fas fa-question-circle"></i>
                        忘記密碼？請聯繫管理員
                    </p>
                    <p class="back-to-customer">
                        <a href="#" onclick="staffAuthPages.backToCustomerLogin()">
                            <i class="fas fa-arrow-left"></i>
                            返回顧客登入
                        </a>
                    </p>
                </div>
            </div>
        </div>`;
    }

    getStaffSwitchingTemplate() {
        const currentStaff = Storage.getUser();
        const otherStaff = this.staffMembers.filter(staff => 
            currentStaff && staff.id !== currentStaff.staffId
        );

        return `
        <div class="staff-auth-container">
            <div class="staff-switch-card">
                <div class="staff-switch-header">
                    <h2>🔄 切換員工</h2>
                    <p class="staff-switch-subtitle">選擇要切換的員工帳號</p>
                </div>
                
                ${currentStaff ? `
                <div class="current-staff-info">
                    <div class="current-staff-card">
                        <div class="staff-avatar-large">👨‍🍳</div>
                        <div class="current-staff-details">
                            <h3>當前登入員工</h3>
                            <div class="staff-name">${currentStaff.username || '員工'}</div>
                            <div class="staff-id">工號: ${currentStaff.staffId || 'N/A'}</div>
                            <div class="staff-dept">部門: 廚房</div>
                        </div>
                    </div>
                </div>
                ` : ''}
                
                <div class="staff-switch-options">
                    <h4>選擇其他員工</h4>
                    <div class="switch-staff-grid">
                        ${otherStaff.map(staff => `
                            <div class="switch-staff-card">
                                <div class="staff-avatar">${staff.avatar}</div>
                                <div class="switch-staff-info">
                                    <div class="staff-name">${staff.name}</div>
                                    <div class="staff-dept">${staff.department}</div>
                                    <div class="staff-id">工號: ${staff.id}</div>
                                </div>
                                <button class="btn btn-staff btn-small" onclick="staffAuthPages.switchToStaff('${staff.id}')">
                                    切換
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="staff-switch-actions">
                    <button class="btn btn-secondary btn-large" onclick="staffAuthPages.showOtherStaffLogin()">
                        其他員工登入
                    </button>
                    <button class="btn btn-danger btn-large" onclick="staffAuthPages.logoutCurrentStaff()">
                        登出當前員工
                    </button>
                </div>
                
                <div class="staff-auth-footer">
                    <p class="back-link">
                        <a href="#" onclick="staffAuthPages.backToWorkplace()">
                            <i class="fas fa-arrow-left"></i>
                            返回工作台
                        </a>
                    </p>
                </div>
            </div>
        </div>`;
    }

    initializeStaffLoginPage() {
        const form = document.getElementById('staff-login-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleStaffLogin(e));
            this.setupFormValidation(form);
        }
    }

    initializeStaffSwitchingPage() {
        // No form to initialize for switching page
        console.log('Staff switching page initialized');
    }

    setupFormValidation(form) {
        const inputs = form.querySelectorAll('.staff-input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(input) {
        const name = input.name;
        const value = input.value.trim();
        const rules = this.validationRules[name];
        
        if (!rules) return true;
        
        // Clear previous error
        this.clearFieldError(input);
        
        // Required validation
        if (rules.required && !value) {
            this.showFieldError(input, '此欄位為必填');
            return false;
        }
        
        if (!value) return true; // Skip other validations if empty and not required
        
        // Length validation
        if (rules.minLength && value.length < rules.minLength) {
            this.showFieldError(input, rules.message);
            return false;
        }
        
        return true;
    }

    showFieldError(input, message) {
        input.classList.add('error');
        const errorElement = document.getElementById(`${input.name}-error`);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    clearFieldError(input) {
        input.classList.remove('error');
        const errorElement = document.getElementById(`${input.name}-error`);
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('.staff-input[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    async handleStaffLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        if (!this.validateForm(form)) {
            return;
        }
        
        const formData = new FormData(form);
        const staffId = formData.get('staffId');
        const password = formData.get('password');
        const remember = formData.get('remember');
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const restoreButton = Helpers.showLoading(submitBtn);
        
        try {
            // For staff login, we use the same login API but with staff credentials
            const response = await api.login(staffId, password);
            
            if (response.success && response.user && response.token) {
                // Ensure user role is STAFF for staff login
                if (response.user.role !== 'STAFF') {
                    throw new Error('此帳號不是員工帳號');
                }
                
                // Store user data with staff information
                const staffUser = {
                    ...response.user,
                    staffId: staffId,
                    department: this.getStaffDepartment(staffId),
                    isStaff: true
                };
                
                Storage.setUser(staffUser);
                api.setToken(response.token);
                
                if (response.sessionId) {
                    Storage.setPreference('sessionId', response.sessionId);
                }
                
                if (remember) {
                    Storage.setPreference('rememberStaffLogin', true);
                }
                
                app.currentUser = staffUser;
                app.showToast('員工登入成功！', 'success');
                
                // Navigate to staff dashboard
                await app.navigateTo('staff-dashboard');
                app.showStaffNavigation();
                
            } else {
                throw new Error(response.error || 'Invalid response from server');
            }
            
        } catch (error) {
            console.error('Staff login failed:', error);
            app.showToast(error.message || '員工登入失敗，請檢查工號和密碼', 'error');
        } finally {
            restoreButton();
        }
    }

    async selectQuickStaff(staffId) {
        const staff = this.staffMembers.find(s => s.id === staffId);
        if (!staff) return;
        
        // For demo purposes, use default credentials
        const staffEmail = `${staffId.toLowerCase()}@ranbow.com`;
        const defaultPassword = 'staff123';
        
        try {
            // Fill form with staff information
            const staffIdInput = document.querySelector('input[name="staffId"]');
            const passwordInput = document.querySelector('input[name="password"]');
            
            if (staffIdInput && passwordInput) {
                staffIdInput.value = staffEmail;
                passwordInput.value = defaultPassword;
                
                // Visual feedback
                app.showToast(`選擇員工: ${staff.name}`, 'info');
                
                // Highlight selected staff card
                document.querySelectorAll('.staff-card').forEach(card => {
                    card.classList.remove('selected');
                });
                event.target.closest('.staff-card').classList.add('selected');
                
                // Auto-trigger login after a short delay
                setTimeout(() => {
                    const form = document.getElementById('staff-login-form');
                    if (form) {
                        form.dispatchEvent(new Event('submit'));
                    }
                }, 500);
            }
            
        } catch (error) {
            console.error('Quick staff selection failed:', error);
            app.showToast('快速選擇失敗', 'error');
        }
    }

    async switchToStaff(staffId) {
        const staff = this.staffMembers.find(s => s.id === staffId);
        if (!staff) return;
        
        try {
            // For demo purposes, simulate staff switching
            const staffUser = {
                id: Date.now(),
                username: staff.name,
                email: `${staffId.toLowerCase()}@ranbow.com`,
                role: 'STAFF',
                staffId: staffId,
                department: staff.department,
                isStaff: true
            };
            
            Storage.setUser(staffUser);
            app.currentUser = staffUser;
            
            app.showToast(`已切換至 ${staff.name}`, 'success');
            
            // Navigate back to staff dashboard
            await app.navigateTo('staff-dashboard');
            
        } catch (error) {
            console.error('Staff switching failed:', error);
            app.showToast('切換員工失敗', 'error');
        }
    }

    showOtherStaffLogin() {
        app.navigateTo('staff-auth');
    }

    async logoutCurrentStaff() {
        try {
            await api.logout();
            Storage.clearUser();
            api.clearToken();
            
            app.currentUser = null;
            app.showToast('員工已登出', 'success');
            app.navigateTo('login');
            
        } catch (error) {
            console.error('Staff logout failed:', error);
            // Force logout even if API fails
            Storage.clearUser();
            api.clearToken();
            app.currentUser = null;
            app.navigateTo('login');
        }
    }

    backToWorkplace() {
        app.navigateTo('staff-dashboard');
    }

    backToCustomerLogin() {
        app.navigateTo('login');
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

    getStaffDepartment(staffId) {
        const staff = this.staffMembers.find(s => s.id === staffId);
        return staff ? staff.department : '未知部門';
    }
}

// Create global instance
window.staffAuthPages = new StaffAuthPages();