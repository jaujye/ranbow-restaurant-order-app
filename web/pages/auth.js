// Authentication Pages - Login and Registration

class AuthPages {
    constructor() {
        this.currentForm = 'login';
        this.validationRules = {
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: '請輸入有效的Email地址'
            },
            password: {
                required: true,
                minLength: 6,
                message: '密碼至少需要6個字符'
            },
            username: {
                required: true,
                minLength: 2,
                message: '用戶名至少需要2個字符'
            },
            phoneNumber: {
                required: true,
                pattern: /^09\d{8}$/,
                message: '請輸入有效的手機號碼 (09xxxxxxxx)'
            }
        };
    }

    getLoginPageTemplate() {
        return `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <div class="logo-container">
                        <h1>🌈 Ranbow</h1>
                        <p>Restaurant</p>
                    </div>
                    <h2>歡迎回來</h2>
                    <p class="auth-subtitle">請登入您的帳號</p>
                </div>
                
                <form id="login-form" class="auth-form">
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-envelope"></i>
                            Email
                        </label>
                        <input 
                            type="email" 
                            class="form-input" 
                            name="email" 
                            placeholder="請輸入您的Email"
                            required
                            autocomplete="email"
                        >
                        <div class="form-error" id="email-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-lock"></i>
                            密碼
                        </label>
                        <div class="password-input-container">
                            <input 
                                type="password" 
                                class="form-input" 
                                name="password" 
                                placeholder="請輸入您的密碼"
                                required
                                autocomplete="current-password"
                            >
                            <button type="button" class="password-toggle" onclick="authPages.togglePassword(this)">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <div class="form-error" id="password-error"></div>
                    </div>
                    
                    <div class="form-options">
                        <label class="checkbox-label">
                            <input type="checkbox" name="remember" id="remember-me">
                            <span class="checkmark"></span>
                            記住我
                        </label>
                        <a href="#forgot-password" class="forgot-password" onclick="authPages.showForgotPassword()">
                            忘記密碼？
                        </a>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-large" id="login-btn">
                        <i class="fas fa-sign-in-alt"></i>
                        登入
                    </button>
                    
                    <div class="form-divider">
                        <span>或</span>
                    </div>
                    
                    <div class="quick-login">
                        <h4>快速登入</h4>
                        <div class="demo-accounts">
                            <button type="button" class="demo-btn" onclick="authPages.quickLogin('customer')">
                                <i class="fas fa-user"></i>
                                顧客帳號
                            </button>
                            <button type="button" class="demo-btn" onclick="authPages.quickLogin('staff')">
                                <i class="fas fa-utensils"></i>
                                員工帳號
                            </button>
                            <button type="button" class="demo-btn" onclick="authPages.quickLogin('admin')">
                                <i class="fas fa-cog"></i>
                                管理員
                            </button>
                        </div>
                    </div>
                </form>
                
                <div class="auth-footer">
                    <p>還沒有帳號？
                        <a href="#register" onclick="authPages.switchToRegister()">
                            立即註冊
                        </a>
                    </p>
                </div>
            </div>
        </div>`;
    }

    getRegisterPageTemplate() {
        return `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <div class="logo-container">
                        <h1>🌈 Ranbow</h1>
                        <p>Restaurant</p>
                    </div>
                    <h2>建立新帳號</h2>
                    <p class="auth-subtitle">加入我們的美食之旅</p>
                </div>
                
                <form id="register-form" class="auth-form">
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-user"></i>
                            用戶名
                        </label>
                        <input 
                            type="text" 
                            class="form-input" 
                            name="username" 
                            placeholder="請輸入您的姓名"
                            required
                            autocomplete="name"
                        >
                        <div class="form-error" id="username-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-envelope"></i>
                            Email
                        </label>
                        <input 
                            type="email" 
                            class="form-input" 
                            name="email" 
                            placeholder="請輸入您的Email"
                            required
                            autocomplete="email"
                        >
                        <div class="form-error" id="email-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-phone"></i>
                            手機號碼
                        </label>
                        <input 
                            type="tel" 
                            class="form-input" 
                            name="phoneNumber" 
                            placeholder="09xxxxxxxx"
                            required
                            autocomplete="tel"
                        >
                        <div class="form-error" id="phoneNumber-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-lock"></i>
                            密碼
                        </label>
                        <div class="password-input-container">
                            <input 
                                type="password" 
                                class="form-input" 
                                name="password" 
                                placeholder="至少6個字符"
                                required
                                autocomplete="new-password"
                            >
                            <button type="button" class="password-toggle" onclick="authPages.togglePassword(this)">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <div class="password-strength" id="password-strength"></div>
                        <div class="form-error" id="password-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-lock"></i>
                            確認密碼
                        </label>
                        <div class="password-input-container">
                            <input 
                                type="password" 
                                class="form-input" 
                                name="confirmPassword" 
                                placeholder="請再次輸入密碼"
                                required
                                autocomplete="new-password"
                            >
                            <button type="button" class="password-toggle" onclick="authPages.togglePassword(this)">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <div class="form-error" id="confirmPassword-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" name="agreeToTerms" required>
                            <span class="checkmark"></span>
                            我同意
                            <a href="#terms" onclick="authPages.showTerms()">服務條款</a>
                            和
                            <a href="#privacy" onclick="authPages.showPrivacy()">隱私政策</a>
                        </label>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-large" id="register-btn">
                        <i class="fas fa-user-plus"></i>
                        註冊
                    </button>
                </form>
                
                <div class="auth-footer">
                    <p>已有帳號？
                        <a href="#login" onclick="authPages.switchToLogin()">
                            立即登入
                        </a>
                    </p>
                </div>
            </div>
        </div>`;
    }

    getForgotPasswordTemplate() {
        return `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <div class="logo-container">
                        <h1>🌈 Ranbow</h1>
                        <p>Restaurant</p>
                    </div>
                    <h2>忘記密碼</h2>
                    <p class="auth-subtitle">輸入您的Email，我們將發送重置連結</p>
                </div>
                
                <form id="forgot-password-form" class="auth-form">
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-envelope"></i>
                            Email
                        </label>
                        <input 
                            type="email" 
                            class="form-input" 
                            name="email" 
                            placeholder="請輸入您的Email"
                            required
                            autocomplete="email"
                        >
                        <div class="form-error" id="email-error"></div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-large">
                        <i class="fas fa-paper-plane"></i>
                        發送重置連結
                    </button>
                </form>
                
                <div class="auth-footer">
                    <p>記起密碼了？
                        <a href="#login" onclick="authPages.switchToLogin()">
                            返回登入
                        </a>
                    </p>
                </div>
            </div>
        </div>`;
    }

    initializeLoginPage() {
        const form = document.getElementById('login-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleLogin(e));
            this.setupFormValidation(form);
        }
    }

    initializeRegisterPage() {
        const form = document.getElementById('register-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleRegister(e));
            this.setupFormValidation(form);
            this.setupPasswordStrength();
        }
    }

    initializeForgotPasswordPage() {
        const form = document.getElementById('forgot-password-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleForgotPassword(e));
            this.setupFormValidation(form);
        }
    }

    setupFormValidation(form) {
        const inputs = form.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    setupPasswordStrength() {
        const passwordInput = document.querySelector('input[name="password"]');
        const strengthIndicator = document.getElementById('password-strength');
        
        if (passwordInput && strengthIndicator) {
            passwordInput.addEventListener('input', (e) => {
                this.updatePasswordStrength(e.target.value, strengthIndicator);
            });
        }
    }

    updatePasswordStrength(password, indicator) {
        const strength = this.calculatePasswordStrength(password);
        const strengthLevels = ['weak', 'fair', 'good', 'strong'];
        const strengthTexts = ['弱', '一般', '良好', '強'];
        
        indicator.className = `password-strength ${strengthLevels[strength]}`;
        indicator.textContent = `密碼強度: ${strengthTexts[strength]}`;
    }

    calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 6) score++;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        if (score < 3) return 0; // weak
        if (score < 4) return 1; // fair
        if (score < 5) return 2; // good
        return 3; // strong
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
        
        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
            this.showFieldError(input, rules.message);
            return false;
        }
        
        // Length validation
        if (rules.minLength && value.length < rules.minLength) {
            this.showFieldError(input, rules.message);
            return false;
        }
        
        // Special validations
        if (name === 'confirmPassword') {
            const password = document.querySelector('input[name="password"]').value;
            if (value !== password) {
                this.showFieldError(input, '密碼不匹配');
                return false;
            }
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
        const inputs = form.querySelectorAll('.form-input[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        if (!this.validateForm(form)) {
            return;
        }
        
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        const remember = formData.get('remember');
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const restoreButton = Helpers.showLoading(submitBtn);
        
        try {
            const response = await api.login(email, password);
            
            if (response.authenticated && response.user) {
                // Store user data
                Storage.setUser(response.user);
                
                // For now, we don't have JWT tokens, so we'll store user ID as a simple token
                api.setToken(response.user.userId);
                
                // Handle remember me
                if (remember) {
                    Storage.setPreference('rememberLogin', true);
                }
                
                app.currentUser = response.user;
                app.showToast('登入成功！', 'success');
                
                // Navigate to appropriate page
                const homePage = app.getInitialPage();
                await app.navigateTo(homePage);
                app.showNavigation();
                
            } else {
                throw new Error('Invalid response from server');
            }
            
        } catch (error) {
            console.error('Login failed:', error);
            app.showToast('登入失敗，請檢查帳號密碼', 'error');
        } finally {
            restoreButton();
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const form = e.target;
        if (!this.validateForm(form)) {
            return;
        }
        
        const formData = new FormData(form);
        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            phoneNumber: formData.get('phoneNumber'),
            password: formData.get('password'),
            role: 'CUSTOMER'
        };
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const restoreButton = Helpers.showLoading(submitBtn);
        
        try {
            const response = await api.register(userData);
            
            if (response && response.userId) {
                app.showToast('註冊成功！請登入您的帳號', 'success');
                this.switchToLogin();
                
                // Pre-fill email in login form
                setTimeout(() => {
                    const emailInput = document.querySelector('input[name="email"]');
                    if (emailInput) {
                        emailInput.value = userData.email;
                    }
                }, 100);
                
            } else {
                throw new Error('Registration failed');
            }
            
        } catch (error) {
            console.error('Registration failed:', error);
            
            if (error.message.includes('email')) {
                app.showToast('此Email已被註冊', 'error');
            } else {
                app.showToast('註冊失敗，請稍後再試', 'error');
            }
        } finally {
            restoreButton();
        }
    }

    async handleForgotPassword(e) {
        e.preventDefault();
        
        const form = e.target;
        if (!this.validateForm(form)) {
            return;
        }
        
        const formData = new FormData(form);
        const email = formData.get('email');
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const restoreButton = Helpers.showLoading(submitBtn);
        
        try {
            // Simulate API call (implement when backend supports it)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            app.showToast('重置連結已發送到您的Email', 'success');
            this.switchToLogin();
            
        } catch (error) {
            console.error('Forgot password failed:', error);
            app.showToast('發送失敗，請稍後再試', 'error');
        } finally {
            restoreButton();
        }
    }

    async quickLogin(role) {
        const demoCredentials = {
            customer: { email: 'customer@ranbow.com', password: 'password123' },
            staff: { email: 'staff@ranbow.com', password: 'password123' },
            admin: { email: 'admin@ranbow.com', password: 'password123' }
        };
        
        const credentials = demoCredentials[role];
        if (!credentials) return;
        
        try {
            // Fill form and trigger login
            const emailInput = document.querySelector('input[name="email"]');
            const passwordInput = document.querySelector('input[name="password"]');
            
            if (emailInput && passwordInput) {
                emailInput.value = credentials.email;
                passwordInput.value = credentials.password;
                
                // Trigger login
                const form = document.getElementById('login-form');
                if (form) {
                    form.dispatchEvent(new Event('submit'));
                }
            }
            
        } catch (error) {
            console.error('Quick login failed:', error);
            app.showToast('快速登入失敗', 'error');
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

    switchToLogin() {
        app.navigateTo('login');
    }

    switchToRegister() {
        app.navigateTo('register');
    }

    showForgotPassword() {
        app.navigateTo('forgot-password');
    }

    showTerms() {
        // TODO: Implement terms modal
        app.showToast('服務條款功能建構中...', 'info');
    }

    showPrivacy() {
        // TODO: Implement privacy modal
        app.showToast('隱私政策功能建構中...', 'info');
    }
}

// Create global instance
window.authPages = new AuthPages();