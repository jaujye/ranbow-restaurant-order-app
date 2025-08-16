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
        const publicPages = ['login', 'register', 'forgot-password', 'home'];
        
        if (publicPages.includes(page)) {
            return true;
        }
        
        if (!this.currentUser) {
            return false;
        }
        
        const rolePages = {
            'CUSTOMER': ['home', 'menu', 'cart', 'checkout', 'orders', 'profile', 'order-detail'],
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
            'checkout': '確認訂單',
            'orders': '我的訂單',
            'profile': '個人中心',
            'login': '登入',
            'register': '註冊',
            'forgot-password': '忘記密碼',
            'staff-dashboard': '工作台',
            'admin-dashboard': '管理後台'
        };
        
        return titles[page] || 'Ranbow Restaurant';
    }

    async getPageContent(page) {
        // Load page templates
        const templates = {
            'home': homePage.getHomePageTemplate(),
            'menu': menuPage.getMenuPageTemplate(),
            'cart': cartPage.getCartPageTemplate(),
            'checkout': checkoutPage.getCheckoutPageTemplate(),
            'orders': ordersPage.getOrdersPageTemplate(),
            'profile': profilePage.getProfilePageTemplate(),
            'login': authPages.getLoginPageTemplate(),
            'register': authPages.getRegisterPageTemplate(),
            'forgot-password': authPages.getForgotPasswordTemplate()
        };
        
        return templates[page] || '<div class="container"><h1>頁面建構中...</h1></div>';
    }

    // These methods are now handled by individual page components
    // Keeping them for backward compatibility but they should not be used

    async initializePage(page) {
        switch (page) {
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

// Initialize app - works for both web and Cordova
function initializeApp() {
    window.app = new RanbowApp();
}

// For Cordova apps, wait for deviceready
if (window.cordova) {
    document.addEventListener('deviceready', initializeApp, false);
} else {
    // For web apps, wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', initializeApp);
}

// Handle page unload
window.addEventListener('beforeunload', () => {
    // Save any pending data
    console.log('App is being unloaded');
});

// Handle Cordova pause/resume events
if (window.cordova) {
    document.addEventListener('pause', () => {
        console.log('App paused');
        // Stop auto-refresh timers
        if (window.ordersPage) {
            window.ordersPage.stopAutoRefresh();
        }
    }, false);

    document.addEventListener('resume', () => {
        console.log('App resumed');
        // Restart auto-refresh and refresh data
        if (window.app && window.app.currentPage) {
            window.app.refreshCurrentPage();
        }
        if (window.ordersPage) {
            window.ordersPage.startAutoRefresh();
        }
    }, false);
}