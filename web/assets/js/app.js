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
        const staffNav = document.getElementById('staff-nav');
        
        if (this.currentUser) {
            topNav?.classList.remove('hidden');
            
            // Update user dropdown info
            this.updateUserDropdownInfo();
            
            // Show appropriate navigation based on role
            if (this.currentUser.role === 'CUSTOMER') {
                bottomNav?.classList.remove('hidden');
                staffNav?.classList.add('hidden');
            } else if (this.currentUser.role === 'STAFF') {
                bottomNav?.classList.add('hidden');
                this.showStaffNavigation();
            }
        }
    }

    showStaffNavigation() {
        const staffNav = document.getElementById('staff-nav');
        if (staffNav) {
            staffNav.classList.remove('hidden');
        } else {
            // Create staff navigation if it doesn't exist
            this.createStaffNavigation();
        }
    }

    createStaffNavigation() {
        const mainContainer = document.getElementById('app');
        if (!mainContainer) return;

        const staffNavHTML = `
            <nav id="staff-nav" class="staff-bottom-nav">
                <div class="staff-nav-items">
                    <div class="staff-nav-item" data-page="staff-dashboard">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>工作台</span>
                    </div>
                    <div class="staff-nav-item" data-page="staff-orders">
                        <i class="fas fa-clipboard-list"></i>
                        <span>訂單</span>
                    </div>
                    <div class="staff-nav-item" data-page="staff-kitchen">
                        <i class="fas fa-utensils"></i>
                        <span>廚房</span>
                    </div>
                    <div class="staff-nav-item" data-page="staff-stats">
                        <i class="fas fa-chart-bar"></i>
                        <span>統計</span>
                    </div>
                    <div class="staff-nav-item" data-page="staff-profile">
                        <i class="fas fa-user"></i>
                        <span>我的</span>
                    </div>
                </div>
            </nav>
        `;

        mainContainer.insertAdjacentHTML('beforeend', staffNavHTML);

        // Add event listeners for staff navigation
        const staffNav = document.getElementById('staff-nav');
        if (staffNav) {
            staffNav.addEventListener('click', (e) => {
                const navItem = e.target.closest('.staff-nav-item');
                if (navItem) {
                    const page = navItem.dataset.page;
                    this.navigateTo(page);
                }
            });
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

        const userMenuBtn = document.querySelector('.user-menu-btn');
        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleUserDropdown();
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('user-dropdown');
            const menuBtn = document.querySelector('.user-menu-btn');
            
            if (dropdown && menuBtn && !menuBtn.contains(e.target) && !dropdown.contains(e.target)) {
                this.hideUserDropdown();
            }
        });

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
            console.log(`Navigating to page: ${page}`);
            
            // Parse page and query parameters
            const [pageName, queryString] = page.split('?');
            
            // Check if user has permission for this page
            if (!this.hasPagePermission(pageName)) {
                console.log(`Permission denied for page: ${pageName}`);
                this.showToast('您沒有權限訪問此頁面', 'error');
                return;
            }
            
            console.log(`Permission granted for page: ${pageName}`);
            await this.loadPage(page, addToHistory);
            console.log(`Successfully loaded page: ${page}`);
            
        } catch (error) {
            console.error('Navigation failed:', error);
            this.showToast('頁面載入失敗', 'error');
        }
    }

    hasPagePermission(page) {
        const publicPages = ['login', 'register', 'forgot-password', 'home', 'staff-auth'];
        
        if (publicPages.includes(page)) {
            return true;
        }
        
        if (!this.currentUser) {
            return false;
        }
        
        const rolePages = {
            'CUSTOMER': ['home', 'menu', 'menu-item', 'cart', 'checkout', 'orders', 'profile', 'order-detail'],
            'STAFF': ['staff-dashboard', 'staff-orders', 'staff-profile', 'staff-kitchen', 'staff-stats', 'staff-notifications', 'staff-auth'],
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
        // Parse page name from potential query string
        const [pageName, queryString] = page.split('?');
        
        // Update bottom navigation active state (customer nav)
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            }
        });

        // Update staff navigation active state
        const staffNavItems = document.querySelectorAll('.staff-nav-item');
        staffNavItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            }
        });

        // Update page title
        const pageTitle = this.getPageTitle(pageName);
        const navTitle = document.querySelector('.nav-title');
        if (navTitle) {
            navTitle.textContent = pageTitle;
        }
        
        // Update document title
        document.title = `${pageTitle} - Ranbow Restaurant`;
        
        // Show/hide back button based on page
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            // Hide back button on main pages
            const mainPages = ['home', 'staff-dashboard', 'admin-dashboard'];
            if (mainPages.includes(pageName)) {
                backBtn.style.display = 'none';
            } else {
                backBtn.style.display = 'block';
            }
        }
    }

    getPageTitle(page) {
        const titles = {
            'home': '首頁',
            'menu': '菜單',
            'menu-item': '菜品詳情',
            'cart': '購物車',
            'checkout': '確認訂單',
            'orders': '我的訂單',
            'profile': '個人中心',
            'login': '登入',
            'register': '註冊',
            'forgot-password': '忘記密碼',
            'staff-auth': '員工登入',
            'staff-dashboard': '員工工作台',
            'staff-orders': '訂單管理',
            'staff-kitchen': '廚房工作台',
            'staff-stats': '工作統計',
            'staff-notifications': '通知中心',
            'staff-profile': '個人中心',
            'admin-dashboard': '管理後台'
        };
        
        return titles[page] || 'Ranbow Restaurant';
    }

    async getPageContent(page) {
        // Parse page name from potential query string
        const [pageName, queryString] = page.split('?');
        
        // Load page templates
        const templates = {
            'home': homePage.getHomePageTemplate(),
            'menu': menuPage.getMenuPageTemplate(),
            'menu-item': menuItemDetailPage.getMenuItemDetailTemplate(),
            'cart': cartPage.getCartPageTemplate(),
            'checkout': checkoutPage.getCheckoutPageTemplate(),
            'orders': ordersPage.getOrdersPageTemplate(),
            'profile': profilePage.getProfilePageTemplate(),
            'login': authPages.getLoginPageTemplate(),
            'register': authPages.getRegisterPageTemplate(),
            'forgot-password': authPages.getForgotPasswordTemplate(),
            'staff-auth': staffAuthPages.getStaffLoginPageTemplate(),
            'staff-dashboard': staffDashboardPage.getStaffDashboardTemplate(),
            'staff-orders': staffOrdersPage.getStaffOrdersTemplate(),
            'staff-kitchen': staffKitchenPage.getStaffKitchenTemplate(),
            'staff-stats': staffStatsPage.getStaffStatsTemplate(),
            'staff-notifications': staffNotificationsPage.getStaffNotificationsTemplate(),
            'staff-profile': staffProfilePage.getStaffProfileTemplate(),
            '404': this.get404PageTemplate(),
            'error': this.getErrorPageTemplate()
        };
        
        return templates[pageName] || templates['404'];
    }

    // These methods are now handled by individual page components
    // Keeping them for backward compatibility but they should not be used

    async initializePage(page) {
        // Parse page name from potential query string
        const [pageName, queryString] = page.split('?');
        
        switch (pageName) {
            case 'home':
                await homePage.initializeHomePage();
                break;
            case 'login':
                authPages.initializeLoginPage();
                break;
            case 'register':
                authPages.initializeRegisterPage();
                break;
            case 'forgot-password':
                authPages.initializeForgotPasswordPage();
                break;
            case 'menu':
                await menuPage.initializeMenuPage();
                break;
            case 'menu-item':
                await menuItemDetailPage.initializeMenuItemDetailPage(page);
                break;
            case 'cart':
                await cartPage.initializeCartPage();
                break;
            case 'checkout':
                await checkoutPage.initializeCheckoutPage();
                break;
            case 'orders':
                await ordersPage.initializeOrdersPage();
                break;
            case 'profile':
                await profilePage.initializeProfilePage();
                break;
            case 'staff-auth':
                staffAuthPages.initializeStaffLoginPage();
                break;
            case 'staff-dashboard':
                await staffDashboardPage.initializeStaffDashboardPage();
                break;
            case 'staff-orders':
                await staffOrdersPage.initializeStaffOrdersPage();
                break;
            case 'staff-kitchen':
                await staffKitchenPage.initializeStaffKitchenPage();
                break;
            case 'staff-stats':
                await staffStatsPage.initializeStaffStatsPage();
                break;
            case 'staff-notifications':
                await staffNotificationsPage.initializeStaffNotificationsPage();
                break;
            case 'staff-profile':
                await staffProfilePage.initializeStaffProfilePage();
                break;
        }
    }



    async logout() {
        try {
            // Hide dropdown first
            this.hideUserDropdown();
            
            // Call logout API
            await api.logout();
            
            // Clear local data
            Storage.clearUser();
            Storage.clearCart();
            api.clearToken();
            this.currentUser = null;
            
            // Hide navigation
            document.getElementById('top-nav')?.classList.add('hidden');
            document.getElementById('bottom-nav')?.classList.add('hidden');
            
            this.navigateTo('login');
            this.showToast('已登出', 'success');
            
        } catch (error) {
            console.error('Logout failed:', error);
            
            // Clear local data anyway for security
            Storage.clearUser();
            Storage.clearCart();
            api.clearToken();
            this.currentUser = null;
            
            // Hide navigation
            document.getElementById('top-nav')?.classList.add('hidden');
            document.getElementById('bottom-nav')?.classList.add('hidden');
            
            this.navigateTo('login');
            this.showToast('已登出', 'info');
        }
    }

    goBack() {
        // For better UX, always return to home/main screen instead of previous page
        // This matches user expectation that "back" means "go to main screen"
        const mainPage = this.getInitialPage();
        this.navigateTo(mainPage);
    }

    showNotifications() {
        // TODO: Implement notifications panel
        this.showToast('通知功能建構中...', 'info');
    }

    toggleUserDropdown() {
        const dropdown = document.getElementById('user-dropdown');
        const menuBtn = document.querySelector('.user-menu-btn');
        
        if (dropdown) {
            const isHidden = dropdown.classList.contains('hidden');
            if (isHidden) {
                this.showUserDropdown();
            } else {
                this.hideUserDropdown();
            }
        }
    }

    showUserDropdown() {
        const dropdown = document.getElementById('user-dropdown');
        const menuBtn = document.querySelector('.user-menu-btn');
        
        if (dropdown && menuBtn) {
            // Update user info in dropdown
            this.updateUserDropdownInfo();
            
            dropdown.classList.remove('hidden');
            menuBtn.classList.add('active');
        }
    }

    hideUserDropdown() {
        const dropdown = document.getElementById('user-dropdown');
        const menuBtn = document.querySelector('.user-menu-btn');
        
        if (dropdown && menuBtn) {
            dropdown.classList.add('hidden');
            menuBtn.classList.remove('active');
        }
    }

    get404PageTemplate() {
        return `
            <div class="error-page">
                <div class="error-content">
                    <div class="error-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h1>404</h1>
                    <h2>頁面不存在</h2>
                    <p>抱歉，您訪問的頁面不存在或已被移除。</p>
                    <div class="error-actions">
                        <button class="btn btn-primary" onclick="app.goBack()">
                            <i class="fas fa-home"></i>
                            返回首頁
                        </button>
                        <button class="btn btn-outline" onclick="window.history.back()">
                            <i class="fas fa-arrow-left"></i>
                            返回上頁
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getErrorPageTemplate() {
        return `
            <div class="error-page">
                <div class="error-content">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h1>錯誤</h1>
                    <h2>系統發生錯誤</h2>
                    <p>抱歉，系統暫時發生問題，請稍後再試。</p>
                    <div class="error-actions">
                        <button class="btn btn-primary" onclick="window.location.reload()">
                            <i class="fas fa-redo"></i>
                            重新載入
                        </button>
                        <button class="btn btn-outline" onclick="app.goBack()">
                            <i class="fas fa-home"></i>
                            返回首頁
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    updateUserDropdownInfo() {
        if (!this.currentUser) return;
        
        const nameEl = document.getElementById('dropdown-user-name');
        const emailEl = document.getElementById('dropdown-user-email');
        
        if (nameEl) {
            nameEl.textContent = this.currentUser.username || '使用者';
        }
        
        if (emailEl) {
            emailEl.textContent = this.currentUser.email || '';
        }
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
        // Use the global toast manager if available
        if (window.toast) {
            window.toast.show(message, type);
        } else {
            // Fallback to simple toast implementation
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