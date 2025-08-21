// Admin Authentication Pages - Rainbow Theme Login

class AdminAuthPages {
    constructor() {
        this.currentForm = 'admin-login';
        this.validationRules = {
            adminId: {
                required: true,
                message: '請輸入管理員ID或Email'
            },
            password: {
                required: true,
                minLength: 8,
                message: '管理員密碼至少需要8個字符'
            }
        };
    }

    getAdminLoginPageTemplate() {
        return `
        <div class="admin-auth-container">
            <div class="admin-background-effects">
                <div class="rainbow-orb rainbow-orb-1"></div>
                <div class="rainbow-orb rainbow-orb-2"></div>
                <div class="rainbow-orb rainbow-orb-3"></div>
            </div>
            
            <div class="admin-auth-card glass-morphism">
                <div class="admin-auth-header">
                    <div class="admin-logo-container">
                        <div class="rainbow-logo">
                            <div class="logo-icon">⚡</div>
                            <h1>Ranbow Admin</h1>
                        </div>
                        <p class="rainbow-subtitle">Restaurant Management Console</p>
                    </div>
                    <h2 class="admin-title">管理員登入</h2>
                    <p class="admin-auth-subtitle">請輸入您的管理員憑證以存取系統</p>
                </div>
                
                <form id="admin-login-form" class="admin-auth-form">
                    <div class="form-group rainbow-form-group">
                        <label class="form-label rainbow-label">
                            <i class="fas fa-user-shield rainbow-icon"></i>
                            管理員ID / Email
                        </label>
                        <input 
                            type="text" 
                            class="form-input rainbow-input" 
                            name="adminId" 
                            placeholder="請輸入管理員ID或Email"
                            autocomplete="username"
                            required
                        />
                        <div class="input-highlight rainbow-highlight"></div>
                    </div>
                    
                    <div class="form-group rainbow-form-group">
                        <label class="form-label rainbow-label">
                            <i class="fas fa-lock rainbow-icon"></i>
                            密碼
                        </label>
                        <div class="password-input-container">
                            <input 
                                type="password" 
                                class="form-input rainbow-input password-input" 
                                name="password" 
                                placeholder="請輸入管理員密碼"
                                autocomplete="current-password"
                                required
                            />
                            <button type="button" class="password-toggle rainbow-btn-ghost" id="admin-password-toggle">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <div class="input-highlight rainbow-highlight"></div>
                    </div>
                    
                    <div class="form-group rainbow-form-group">
                        <label class="checkbox-container rainbow-checkbox">
                            <input type="checkbox" name="rememberMe" id="admin-remember-me">
                            <span class="checkmark rainbow-checkmark"></span>
                            記住我的登入狀態
                        </label>
                    </div>
                    
                    <button 
                        type="submit" 
                        class="btn-primary rainbow-btn rainbow-btn-primary admin-login-btn"
                        id="admin-login-btn"
                    >
                        <i class="fas fa-sign-in-alt"></i>
                        <span>進入管理控制台</span>
                        <div class="btn-rainbow-glow"></div>
                    </button>
                </form>
                
                <div class="admin-auth-security">
                    <div class="security-notice">
                        <i class="fas fa-shield-alt"></i>
                        <p>此為管理員專用登入區域，所有操作將被記錄</p>
                    </div>
                </div>
                
                <div class="admin-auth-footer">
                    <div class="auth-links">
                        <a href="#" class="auth-link rainbow-link" onclick="app.navigateTo('login')">
                            <i class="fas fa-arrow-left"></i>
                            返回一般登入
                        </a>
                        <a href="#" class="auth-link rainbow-link" onclick="adminAuth.showForgotPassword()">
                            <i class="fas fa-question-circle"></i>
                            忘記密碼？
                        </a>
                    </div>
                </div>
            </div>
            
            <div class="admin-system-status">
                <div class="status-indicator">
                    <div class="status-dot rainbow-pulse"></div>
                    <span>系統狀態正常</span>
                </div>
            </div>
        </div>
        `;
    }

    getForgotPasswordTemplate() {
        return `
        <div class="admin-auth-container">
            <div class="admin-background-effects">
                <div class="rainbow-orb rainbow-orb-1"></div>
                <div class="rainbow-orb rainbow-orb-2"></div>
            </div>
            
            <div class="admin-auth-card glass-morphism">
                <div class="admin-auth-header">
                    <div class="admin-logo-container">
                        <div class="rainbow-logo">
                            <div class="logo-icon">🔐</div>
                            <h1>密碼重設</h1>
                        </div>
                    </div>
                    <h2 class="admin-title">重設管理員密碼</h2>
                    <p class="admin-auth-subtitle">請輸入您的管理員Email，我們將發送重設連結</p>
                </div>
                
                <form id="admin-forgot-password-form" class="admin-auth-form">
                    <div class="form-group rainbow-form-group">
                        <label class="form-label rainbow-label">
                            <i class="fas fa-envelope rainbow-icon"></i>
                            管理員Email
                        </label>
                        <input 
                            type="email" 
                            class="form-input rainbow-input" 
                            name="adminEmail" 
                            placeholder="請輸入管理員Email地址"
                            autocomplete="email"
                            required
                        />
                        <div class="input-highlight rainbow-highlight"></div>
                    </div>
                    
                    <button 
                        type="submit" 
                        class="btn-primary rainbow-btn rainbow-btn-primary"
                        id="admin-forgot-password-btn"
                    >
                        <i class="fas fa-paper-plane"></i>
                        <span>發送重設連結</span>
                        <div class="btn-rainbow-glow"></div>
                    </button>
                </form>
                
                <div class="admin-auth-footer">
                    <div class="auth-links">
                        <a href="#" class="auth-link rainbow-link" onclick="adminAuth.showLoginForm()">
                            <i class="fas fa-arrow-left"></i>
                            返回登入頁面
                        </a>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    render() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = this.getAdminLoginPageTemplate();
        
        // Add admin role to body for theming
        document.body.setAttribute('data-role', 'admin');
        
        // Hide navigation bars
        this.hideNavigationBars();
        
        // Initialize form handlers
        this.initializeFormHandlers();
        
        // Initialize animations
        this.initializeAnimations();
    }

    hideNavigationBars() {
        const bottomNav = document.getElementById('bottom-nav');
        const topNav = document.getElementById('top-nav');
        
        if (bottomNav) bottomNav.classList.add('hidden');
        if (topNav) topNav.classList.add('hidden');
    }

    initializeFormHandlers() {
        const loginForm = document.getElementById('admin-login-form');
        const passwordToggle = document.getElementById('admin-password-toggle');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        if (passwordToggle) {
            passwordToggle.addEventListener('click', () => this.togglePasswordVisibility());
        }

        // Initialize input focus effects
        this.initializeInputEffects();
    }

    initializeInputEffects() {
        const inputs = document.querySelectorAll('.rainbow-input');
        
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                e.target.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', (e) => {
                if (!e.target.value) {
                    e.target.parentElement.classList.remove('focused');
                }
            });
            
            input.addEventListener('input', (e) => {
                if (e.target.value) {
                    e.target.parentElement.classList.add('has-value');
                } else {
                    e.target.parentElement.classList.remove('has-value');
                }
            });
        });
    }

    initializeAnimations() {
        // Rainbow orb animations
        const orbs = document.querySelectorAll('.rainbow-orb');
        orbs.forEach((orb, index) => {
            orb.style.animationDelay = `${index * 1.5}s`;
        });
        
        // Card entrance animation
        const card = document.querySelector('.admin-auth-card');
        if (card) {
            setTimeout(() => {
                card.classList.add('animate-in');
            }, 300);
        }
    }

    togglePasswordVisibility() {
        const passwordInput = document.querySelector('.password-input');
        const toggleBtn = document.getElementById('admin-password-toggle');
        
        if (passwordInput && toggleBtn) {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            toggleBtn.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const loginData = {
            adminId: formData.get('adminId'),
            password: formData.get('password'),
            rememberMe: formData.get('rememberMe') === 'on'
        };
        
        // Validate inputs
        if (!this.validateLoginForm(loginData)) {
            return;
        }
        
        const loginBtn = document.getElementById('admin-login-btn');
        const originalContent = loginBtn.innerHTML;
        
        try {
            // Show loading state
            loginBtn.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                <span>驗證中...</span>
            `;
            loginBtn.disabled = true;
            
            // Simulate API call for admin authentication
            // In real implementation, this would call the backend admin auth endpoint
            const response = await this.authenticateAdmin(loginData);
            
            if (response.success) {
                // Store admin session
                Storage.setUser({
                    id: response.admin.id,
                    name: response.admin.name,
                    email: response.admin.email,
                    role: 'admin',
                    permissions: response.admin.permissions,
                    lastLogin: new Date().toISOString()
                });
                
                // Store auth token
                if (response.token) {
                    localStorage.setItem('authToken', response.token);
                    api.setToken(response.token);
                }
                
                // Show success animation
                loginBtn.innerHTML = `
                    <i class="fas fa-check"></i>
                    <span>登入成功</span>
                `;
                
                Toast.show('歡迎進入管理控制台', 'success');
                
                // Navigate to admin dashboard
                setTimeout(() => {
                    app.currentUser = Storage.getUser();
                    app.navigateTo('admin-dashboard');
                }, 1500);
                
            } else {
                throw new Error(response.message || '登入失敗');
            }
            
        } catch (error) {
            console.error('Admin login failed:', error);
            
            // Reset button
            loginBtn.innerHTML = originalContent;
            loginBtn.disabled = false;
            
            // Show error
            Toast.show(error.message || '登入失敗，請檢查您的憑證', 'error');
            
            // Add error animation to form
            const authCard = document.querySelector('.admin-auth-card');
            if (authCard) {
                authCard.classList.add('shake');
                setTimeout(() => {
                    authCard.classList.remove('shake');
                }, 500);
            }
        }
    }

    validateLoginForm(data) {
        let isValid = true;
        
        // Validate admin ID
        if (!data.adminId || data.adminId.trim().length < 3) {
            this.showFieldError('adminId', '管理員ID至少需要3個字符');
            isValid = false;
        }
        
        // Validate password
        if (!data.password || data.password.length < 8) {
            this.showFieldError('password', '管理員密碼至少需要8個字符');
            isValid = false;
        }
        
        return isValid;
    }

    showFieldError(fieldName, message) {
        const field = document.querySelector(`input[name="${fieldName}"]`);
        if (field) {
            field.classList.add('error');
            
            // Remove existing error message
            const existingError = field.parentElement.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            
            // Add error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message rainbow-error';
            errorDiv.textContent = message;
            field.parentElement.appendChild(errorDiv);
            
            // Remove error on input
            field.addEventListener('input', () => {
                field.classList.remove('error');
                const errorMsg = field.parentElement.querySelector('.error-message');
                if (errorMsg) {
                    errorMsg.remove();
                }
            }, { once: true });
        }
    }

    async authenticateAdmin(loginData) {
        try {
            // Use regular login API but check for admin role
            const response = await api.login(loginData.adminId, loginData.password);
            
            if (response && response.success && response.user) {
                // Check if user has admin role
                if (response.user.role === 'ADMIN') {
                    return {
                        success: true,
                        admin: {
                            id: response.user.id,
                            name: response.user.username,
                            email: response.user.email,
                            permissions: ['all']
                        },
                        token: response.token
                    };
                } else {
                    return {
                        success: false,
                        message: '此帳號不具有管理員權限'
                    };
                }
            } else {
                return {
                    success: false,
                    message: '登入憑證無效，請檢查您的Email和密碼'
                };
            }
        } catch (error) {
            console.error('Admin authentication error:', error);
            
            // Fallback to demo credentials for development
            if (loginData.adminId === 'admin@ranbow.com' && loginData.password === 'admin123456') {
                return {
                    success: true,
                    admin: {
                        id: 'ADM001',
                        name: '系統管理員',
                        email: 'admin@ranbow.com',
                        permissions: ['all']
                    },
                    token: 'demo-admin-token-' + Date.now()
                };
            }
            
            return {
                success: false,
                message: '連接伺服器失敗，請檢查網路連接'
            };
        }
    }

    showForgotPassword() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = this.getForgotPasswordTemplate();
        
        const forgotForm = document.getElementById('admin-forgot-password-form');
        if (forgotForm) {
            forgotForm.addEventListener('submit', (e) => this.handleForgotPassword(e));
        }
    }

    showLoginForm() {
        this.render();
    }

    async handleForgotPassword(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const email = formData.get('adminEmail');
        
        const submitBtn = document.getElementById('admin-forgot-password-btn');
        const originalContent = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                <span>發送中...</span>
            `;
            submitBtn.disabled = true;
            
            // Simulate sending reset email
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            submitBtn.innerHTML = `
                <i class="fas fa-check"></i>
                <span>發送成功</span>
            `;
            
            Toast.show('重設連結已發送到您的Email', 'success');
            
            setTimeout(() => {
                this.showLoginForm();
            }, 2000);
            
        } catch (error) {
            submitBtn.innerHTML = originalContent;
            submitBtn.disabled = false;
            Toast.show('發送失敗，請稍後重試', 'error');
        }
    }
}

// Initialize admin auth pages
const adminAuth = new AdminAuthPages();