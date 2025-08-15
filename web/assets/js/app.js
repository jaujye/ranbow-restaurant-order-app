// Main Application JavaScript

class RanbowApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = null;
        this.eventEmitter = Helpers.createEventEmitter();
        
        this.init();
    }

    async init() {
        try {
            // Show loading screen
            this.showLoadingScreen();
            
            // Check for saved user session
            const savedUser = Storage.getUser();
            if (savedUser) {
                this.currentUser = savedUser;
                api.setToken(localStorage.getItem('authToken'));
            }
            
            // Check server health
            await this.checkServerHealth();
            
            // Initialize UI components
            this.initializeComponents();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Route to appropriate page
            await this.initializeRouting();
            
            // Hide loading screen
            setTimeout(() => {
                this.hideLoadingScreen();
            }, 2000);
            
        } catch (error) {
            console.error('App initialization failed:', error);
            this.showError('應用程式初始化失敗，請重新整理頁面');
        }
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const mainContent = document.getElementById('main-content');
        
        if (loadingScreen && mainContent) {
            loadingScreen.classList.add('hidden');
            mainContent.classList.remove('hidden');
            
            // Show appropriate navigation
            this.showNavigation();
        }
    }

    showNavigation() {
        const topNav = document.getElementById('top-nav');
        const bottomNav = document.getElementById('bottom-nav');
        
        if (this.currentUser) {
            topNav?.classList.remove('hidden');
            
            // Show bottom nav only for customers
            if (this.currentUser.role === 'CUSTOMER') {
                bottomNav?.classList.remove('hidden');
            }
        }
    }

    async checkServerHealth() {
        try {
            await api.healthCheck();
            console.log('Server is healthy');
        } catch (error) {
            console.warn('Server health check failed:', error);
            // Continue anyway - might be offline mode
        }
    }

    initializeComponents() {
        // Initialize cart badge
        Storage.updateCartBadge();
        
        // Initialize notification badge
        this.updateNotificationBadge(0);
        
        // Set app theme based on user role
        if (this.currentUser) {
            document.body.setAttribute('data-role', this.currentUser.role.toLowerCase());
        }
    }

    setupEventListeners() {
        // Bottom navigation
        const bottomNav = document.getElementById('bottom-nav');
        if (bottomNav) {
            bottomNav.addEventListener('click', (e) => {
                const navItem = e.target.closest('.nav-item');
                if (navItem) {
                    const page = navItem.dataset.page;
                    this.navigateTo(page);
                }
            });
        }

        // Top navigation buttons
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.goBack());
        }

        const notificationBtn = document.querySelector('.notification-btn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => this.showNotifications());
        }

        const menuBtn = document.querySelector('.menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => this.showMenu());
        }

        // Handle browser back button
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.loadPage(e.state.page, false);
            }
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            this.showToast('網路連線已恢復', 'success');
        });

        window.addEventListener('offline', () => {
            this.showToast('網路連線中斷', 'warning');
        });

        // Handle visibility change (app comes to foreground)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.currentUser) {
                this.refreshCurrentPage();
            }
        });
    }

    async initializeRouting() {
        // Get initial route from URL or determine based on user state
        const hash = window.location.hash.substring(1);
        const initialPage = hash || this.getInitialPage();
        
        await this.navigateTo(initialPage);
    }

    getInitialPage() {
        if (!this.currentUser) {
            return 'login';
        }
        
        switch (this.currentUser.role) {
            case 'CUSTOMER':
                return 'home';
            case 'STAFF':
                return 'staff-dashboard';
            case 'ADMIN':
                return 'admin-dashboard';
            default:
                return 'login';
        }
    }

    async navigateTo(page, addToHistory = true) {
        try {
            // Check if user has permission for this page
            if (!this.hasPagePermission(page)) {
                this.showToast('您沒有權限訪問此頁面', 'error');
                return;
            }

            await this.loadPage(page, addToHistory);
            
        } catch (error) {
            console.error('Navigation failed:', error);
            this.showToast('頁面載入失敗', 'error');
        }
    }

    hasPagePermission(page) {
        const publicPages = ['login', 'register', 'home'];
        
        if (publicPages.includes(page)) {
            return true;
        }
        
        if (!this.currentUser) {
            return false;
        }
        
        const rolePages = {
            'CUSTOMER': ['home', 'menu', 'cart', 'orders', 'profile', 'order-detail'],
            'STAFF': ['staff-dashboard', 'staff-orders', 'staff-profile'],
            'ADMIN': ['admin-dashboard', 'admin-menu', 'admin-orders', 'admin-users', 'admin-reports']
        };
        
        return rolePages[this.currentUser.role]?.includes(page) || false;
    }

    async loadPage(page, addToHistory = true) {
        try {
            // Update navigation state
            this.updateNavigation(page);
            
            // Load page content
            const content = await this.getPageContent(page);
            const mainContent = document.getElementById('main-content');
            
            if (mainContent && content) {
                mainContent.innerHTML = content;
                
                // Initialize page-specific functionality
                await this.initializePage(page);
                
                // Update browser history
                if (addToHistory) {
                    window.history.pushState({ page }, '', `#${page}`);
                }
                
                this.currentPage = page;
                
                // Emit page change event
                this.eventEmitter.emit('pageChanged', { page, user: this.currentUser });
            }
            
        } catch (error) {
            console.error('Failed to load page:', error);
            this.showError('頁面載入失敗');
        }
    }

    updateNavigation(page) {
        // Update bottom navigation active state
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });

        // Update page title
        const pageTitle = this.getPageTitle(page);
        const navTitle = document.querySelector('.nav-title');
        if (navTitle) {
            navTitle.textContent = pageTitle;
        }
        
        // Update document title
        document.title = `${pageTitle} - Ranbow Restaurant`;
    }

    getPageTitle(page) {
        const titles = {
            'home': '首頁',
            'menu': '菜單',
            'cart': '購物車',
            'orders': '我的訂單',
            'profile': '個人中心',
            'login': '登入',
            'register': '註冊',
            'staff-dashboard': '工作台',
            'admin-dashboard': '管理後台'
        };
        
        return titles[page] || 'Ranbow Restaurant';
    }

    async getPageContent(page) {
        // In a real app, this would load page templates
        // For now, return placeholder content
        const templates = {
            'home': this.getHomePageTemplate(),
            'menu': this.getMenuPageTemplate(),
            'cart': this.getCartPageTemplate(),
            'orders': this.getOrdersPageTemplate(),
            'profile': this.getProfilePageTemplate(),
            'login': this.getLoginPageTemplate(),
            'register': this.getRegisterPageTemplate()
        };
        
        return templates[page] || '<div class="container"><h1>頁面建構中...</h1></div>';
    }

    // Page Templates (to be moved to separate files later)
    getHomePageTemplate() {
        return `
        <div class="container">
            <div class="welcome-banner">
                <h1>🌈 歡迎來到彩虹餐廳</h1>
                <p>享受美味，享受生活</p>
            </div>
            
            <div class="quick-actions">
                <div class="action-card" onclick="app.navigateTo('menu')">
                    <i class="fas fa-utensils"></i>
                    <h3>瀏覽菜單</h3>
                    <p>查看我們的美味佳餚</p>
                </div>
                
                <div class="action-card" onclick="app.navigateTo('orders')">
                    <i class="fas fa-receipt"></i>
                    <h3>我的訂單</h3>
                    <p>追蹤訂單狀態</p>
                </div>
            </div>
            
            <div class="featured-items">
                <h2>今日推薦</h2>
                <div class="item-grid" id="featured-items">
                    <!-- Items will be loaded dynamically -->
                </div>
            </div>
        </div>`;
    }

    getLoginPageTemplate() {
        return `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <h1>🌈 Ranbow</h1>
                    <p>歡迎回來</p>
                </div>
                
                <form id="login-form" class="auth-form">
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" name="email" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">密碼</label>
                        <input type="password" class="form-input" name="password" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-large">登入</button>
                </form>
                
                <div class="auth-footer">
                    <p>還沒有帳號？<a href="#register" onclick="app.navigateTo('register')">立即註冊</a></p>
                </div>
            </div>
        </div>`;
    }

    // Placeholder templates for other pages
    getMenuPageTemplate() {
        return '<div class="container"><h1>菜單頁面建構中...</h1></div>';
    }

    getCartPageTemplate() {
        return '<div class="container"><h1>購物車頁面建構中...</h1></div>';
    }

    getOrdersPageTemplate() {
        return '<div class="container"><h1>訂單頁面建構中...</h1></div>';
    }

    getProfilePageTemplate() {
        return '<div class="container"><h1>個人中心頁面建構中...</h1></div>';
    }

    getRegisterPageTemplate() {
        return '<div class="container"><h1>註冊頁面建構中...</h1></div>';
    }

    async initializePage(page) {
        switch (page) {
            case 'home':
                await this.initializeHomePage();
                break;
            case 'login':
                this.initializeLoginPage();
                break;
            case 'menu':
                await this.initializeMenuPage();
                break;
            // Add other page initializations
        }
    }

    async initializeHomePage() {
        try {
            // Load featured items
            const featuredItems = await api.getPopularItems();
            this.renderFeaturedItems(featuredItems);
        } catch (error) {
            console.error('Failed to load featured items:', error);
        }
    }

    initializeLoginPage() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin(new FormData(loginForm));
            });
        }
    }

    async initializeMenuPage() {
        // Menu page initialization will be implemented later
    }

    renderFeaturedItems(items) {
        const container = document.getElementById('featured-items');
        if (!container) return;

        const html = items.map(item => `
            <div class="menu-item-card" onclick="app.viewMenuItem('${item.id}')">
                <img src="${item.imageUrl || 'assets/images/placeholder.jpg'}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p class="price">${Helpers.formatCurrency(item.price)}</p>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    async handleLogin(formData) {
        try {
            const email = formData.get('email');
            const password = formData.get('password');
            
            const response = await api.login(email, password);
            
            if (response.token && response.user) {
                // Save user data and token
                Storage.setUser(response.user);
                api.setToken(response.token);
                
                this.currentUser = response.user;
                this.showToast('登入成功！', 'success');
                
                // Navigate to appropriate page
                const homePage = this.getInitialPage();
                await this.navigateTo(homePage);
                
                // Show navigation
                this.showNavigation();
            }
            
        } catch (error) {
            console.error('Login failed:', error);
            this.showToast('登入失敗，請檢查帳號密碼', 'error');
        }
    }

    logout() {
        Storage.clearUser();
        api.clearToken();
        this.currentUser = null;
        
        // Hide navigation
        document.getElementById('top-nav')?.classList.add('hidden');
        document.getElementById('bottom-nav')?.classList.add('hidden');
        
        this.navigateTo('login');
        this.showToast('已登出', 'info');
    }

    goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            this.navigateTo(this.getInitialPage());
        }
    }

    showNotifications() {
        // TODO: Implement notifications panel
        this.showToast('通知功能建構中...', 'info');
    }

    showMenu() {
        // TODO: Implement side menu
        this.showToast('選單功能建構中...', 'info');
    }

    updateNotificationBadge(count) {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            <span>${message}</span>
        `;

        const container = document.getElementById('toast-container');
        if (container) {
            container.appendChild(toast);
            
            // Auto remove after 3 seconds
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
    }

    getToastIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    async refreshCurrentPage() {
        if (this.currentPage) {
            await this.loadPage(this.currentPage, false);
        }
    }

    // Public methods for other components to use
    getCurrentUser() {
        return this.currentUser;
    }

    getCurrentPage() {
        return this.currentPage;
    }

    on(event, callback) {
        this.eventEmitter.on(event, callback);
    }

    emit(event, data) {
        this.eventEmitter.emit(event, data);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new RanbowApp();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    // Save any pending data
    console.log('App is being unloaded');
});