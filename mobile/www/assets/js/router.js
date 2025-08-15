// Simple router for handling navigation

class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.history = [];
        this.beforeRouteChange = null;
        this.afterRouteChange = null;
        
        this.init();
    }

    init() {
        // Listen for browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.route) {
                this.navigateTo(e.state.route, false);
            }
        });

        // Handle initial route
        const initialRoute = this.getInitialRoute();
        this.navigateTo(initialRoute, false);
    }

    // Register a route
    register(path, handler, middleware = []) {
        this.routes.set(path, {
            handler,
            middleware
        });
    }

    // Navigate to a route
    async navigateTo(path, addToHistory = true) {
        try {
            // Parse route and params
            const { route, params, query } = this.parseRoute(path);
            
            // Check if route exists
            const routeConfig = this.routes.get(route);
            if (!routeConfig) {
                console.warn(`Route not found: ${route}`);
                this.navigateTo('404');
                return;
            }

            // Run beforeRouteChange hook
            if (this.beforeRouteChange) {
                const shouldContinue = await this.beforeRouteChange(route, this.currentRoute);
                if (!shouldContinue) return;
            }

            // Run middleware
            for (const middleware of routeConfig.middleware) {
                const result = await middleware(route, params, query);
                if (!result) return; // Middleware blocked navigation
            }

            // Execute route handler
            await routeConfig.handler(params, query);

            // Update browser history
            if (addToHistory) {
                this.addToHistory(path);
            }

            // Update current route
            this.currentRoute = route;

            // Run afterRouteChange hook
            if (this.afterRouteChange) {
                this.afterRouteChange(route, params, query);
            }

        } catch (error) {
            console.error('Navigation error:', error);
            this.navigateTo('error');
        }
    }

    // Parse route path with params and query
    parseRoute(path) {
        const [routePart, queryPart] = path.split('?');
        const route = routePart || '/';
        
        // Parse query parameters
        const query = {};
        if (queryPart) {
            queryPart.split('&').forEach(param => {
                const [key, value] = param.split('=');
                query[decodeURIComponent(key)] = decodeURIComponent(value || '');
            });
        }

        // Parse route parameters (for routes like /menu/:category)
        const params = {};
        // This could be enhanced for dynamic routes
        
        return { route, params, query };
    }

    // Add to browser history
    addToHistory(path) {
        const state = { route: path };
        window.history.pushState(state, '', `#${path}`);
        this.history.push(path);
    }

    // Go back in history
    goBack() {
        if (this.history.length > 1) {
            this.history.pop(); // Remove current
            const previousRoute = this.history[this.history.length - 1];
            this.navigateTo(previousRoute, false);
        } else {
            this.navigateTo(this.getDefaultRoute());
        }
    }

    // Get initial route from URL hash
    getInitialRoute() {
        const hash = window.location.hash.substring(1);
        return hash || this.getDefaultRoute();
    }

    // Get default route based on user role
    getDefaultRoute() {
        const user = Storage.getUser();
        if (!user) return 'login';
        
        switch (user.role) {
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

    // Set hooks
    setBeforeRouteChange(callback) {
        this.beforeRouteChange = callback;
    }

    setAfterRouteChange(callback) {
        this.afterRouteChange = callback;
    }

    // Get current route
    getCurrentRoute() {
        return this.currentRoute;
    }

    // Get route history
    getHistory() {
        return [...this.history];
    }

    // Clear history
    clearHistory() {
        this.history = [];
    }
}

// Route middleware functions
const RouteMiddleware = {
    // Require authentication
    requireAuth: async (route, params, query) => {
        const user = Storage.getUser();
        if (!user) {
            router.navigateTo('login');
            return false;
        }
        return true;
    },

    // Require specific role
    requireRole: (allowedRoles) => {
        return async (route, params, query) => {
            const user = Storage.getUser();
            if (!user || !allowedRoles.includes(user.role)) {
                toast.error('您沒有權限訪問此頁面');
                router.goBack();
                return false;
            }
            return true;
        };
    },

    // Require guest (not logged in)
    requireGuest: async (route, params, query) => {
        const user = Storage.getUser();
        if (user) {
            router.navigateTo(router.getDefaultRoute());
            return false;
        }
        return true;
    },

    // Check table number for customer orders
    requireTable: async (route, params, query) => {
        const tableNumber = Storage.getTableNumber();
        if (!tableNumber && route !== 'table-select') {
            router.navigateTo('table-select');
            return false;
        }
        return true;
    }
};

// Create global router instance
const router = new Router();

// Set up route change hooks
router.setBeforeRouteChange(async (newRoute, oldRoute) => {
    // Show loading if needed
    if (newRoute !== oldRoute) {
        // Could show a loading indicator here
    }
    return true;
});

router.setAfterRouteChange((route, params, query) => {
    // Update page title
    const pageTitle = getPageTitle(route);
    document.title = `${pageTitle} - Ranbow Restaurant`;
    
    // Update navigation state
    updateNavigationState(route);
    
    // Analytics tracking could go here
    console.log(`Navigated to: ${route}`);
});

// Helper function to get page title
function getPageTitle(route) {
    const titles = {
        'home': '首頁',
        'menu': '菜單',
        'cart': '購物車',
        'orders': '我的訂單',
        'order-detail': '訂單詳情',
        'profile': '個人中心',
        'login': '登入',
        'register': '註冊',
        'forgot-password': '忘記密碼',
        'table-select': '選擇桌號',
        'checkout': '結帳',
        'payment': '付款',
        'payment-success': '付款成功',
        'staff-dashboard': '員工工作台',
        'staff-orders': '訂單管理',
        'admin-dashboard': '管理後台',
        'admin-menu': '菜單管理',
        'admin-orders': '訂單監控',
        'admin-users': '用戶管理',
        'admin-reports': '報表分析',
        '404': '頁面不存在',
        'error': '系統錯誤'
    };
    
    return titles[route] || 'Ranbow Restaurant';
}

// Helper function to update navigation state
function updateNavigationState(route) {
    // Update bottom navigation active state
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === route) {
            item.classList.add('active');
        }
    });

    // Update top navigation title
    const navTitle = document.querySelector('.nav-title');
    if (navTitle) {
        navTitle.textContent = getPageTitle(route);
    }

    // Update back button visibility
    const backBtn = document.querySelector('.back-btn');
    const publicPages = ['home', 'staff-dashboard', 'admin-dashboard'];
    if (backBtn) {
        backBtn.style.display = publicPages.includes(route) ? 'none' : 'block';
    }
}

// Export router and middleware
window.router = router;
window.RouteMiddleware = RouteMiddleware;