// Customer Home Page - Main Dashboard

class HomePage {
    constructor() {
        this.categories = [];
        this.featuredItems = [];
        this.searchResults = [];
        this.isSearching = false;
        this.searchDebounceTimer = null;
    }

    getHomePageTemplate() {
        return `
        <div class="home-page">
            <!-- Welcome Banner -->
            <div class="welcome-banner">
                <div class="banner-content">
                    <h1>🌈 歡迎來到彩虹餐廳</h1>
                    <p class="welcome-subtitle">享受美味，享受生活</p>
                    <div class="user-greeting" id="user-greeting">
                        <!-- User greeting will be inserted here -->
                    </div>
                </div>
                <div class="banner-decoration">
                    <div class="floating-element">🍽️</div>
                    <div class="floating-element">🥘</div>
                    <div class="floating-element">🍰</div>
                </div>
            </div>

            <!-- Search Bar -->
            <div class="search-section">
                <div class="search-container">
                    <div class="search-bar">
                        <i class="fas fa-search search-icon"></i>
                        <input 
                            type="text" 
                            class="search-input" 
                            placeholder="搜尋菜品名稱..." 
                            id="search-input"
                        >
                        <button class="search-clear-btn hidden" id="search-clear">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="search-suggestions" id="search-suggestions"></div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions">
                <div class="action-card" onclick="homePage.navigateToMenu()">
                    <div class="action-icon">
                        <i class="fas fa-utensils"></i>
                    </div>
                    <h3>瀏覽菜單</h3>
                    <p>查看完整菜單</p>
                </div>
                
                <div class="action-card" onclick="homePage.navigateToCart()">
                    <div class="action-icon">
                        <i class="fas fa-shopping-cart"></i>
                        <span class="cart-count-badge hidden" id="cart-count">0</span>
                    </div>
                    <h3>購物車</h3>
                    <p>查看已選菜品</p>
                </div>
                
                <div class="action-card" onclick="homePage.navigateToOrders()">
                    <div class="action-icon">
                        <i class="fas fa-receipt"></i>
                    </div>
                    <h3>我的訂單</h3>
                    <p>追蹤訂單狀態</p>
                </div>
                
                <div class="action-card" onclick="homePage.showTableSelector()">
                    <div class="action-icon">
                        <i class="fas fa-chair"></i>
                    </div>
                    <h3>選擇桌號</h3>
                    <p id="current-table">未選擇</p>
                </div>
            </div>

            <!-- Menu Categories -->
            <div class="categories-section">
                <div class="section-header">
                    <h2>🍽️ 菜單分類</h2>
                    <a href="#menu" class="view-all-link" onclick="homePage.navigateToMenu()">
                        查看全部 <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
                <div class="categories-grid" id="categories-grid">
                    <!-- Categories will be loaded dynamically -->
                    <div class="category-skeleton">
                        <div class="skeleton-icon"></div>
                        <div class="skeleton-text"></div>
                    </div>
                    <div class="category-skeleton">
                        <div class="skeleton-icon"></div>
                        <div class="skeleton-text"></div>
                    </div>
                    <div class="category-skeleton">
                        <div class="skeleton-icon"></div>
                        <div class="skeleton-text"></div>
                    </div>
                    <div class="category-skeleton">
                        <div class="skeleton-icon"></div>
                        <div class="skeleton-text"></div>
                    </div>
                </div>
            </div>

            <!-- Featured Items -->
            <div class="featured-section">
                <div class="section-header">
                    <h2>⭐ 今日推薦</h2>
                    <span class="recommendation-badge">主廚推薦</span>
                </div>
                <div class="featured-items" id="featured-items">
                    <!-- Featured items will be loaded dynamically -->
                    <div class="item-skeleton">
                        <div class="skeleton-image"></div>
                        <div class="skeleton-content">
                            <div class="skeleton-title"></div>
                            <div class="skeleton-text"></div>
                            <div class="skeleton-price"></div>
                        </div>
                    </div>
                    <div class="item-skeleton">
                        <div class="skeleton-image"></div>
                        <div class="skeleton-content">
                            <div class="skeleton-title"></div>
                            <div class="skeleton-text"></div>
                            <div class="skeleton-price"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Orders (if user has history) -->
            <div class="recent-orders-section hidden" id="recent-orders-section">
                <div class="section-header">
                    <h2>📋 最近訂單</h2>
                    <a href="#orders" class="view-all-link" onclick="homePage.navigateToOrders()">
                        查看全部 <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
                <div class="recent-orders" id="recent-orders">
                    <!-- Recent orders will be loaded dynamically -->
                </div>
            </div>

            <!-- Promotional Banner -->
            <div class="promotion-banner">
                <div class="promotion-content">
                    <div class="promotion-icon">🎉</div>
                    <div class="promotion-text">
                        <h3>首次用餐享9折優惠</h3>
                        <p>新用戶專享，立即體驗美味</p>
                    </div>
                    <button class="promotion-btn" onclick="homePage.showPromotion()">
                        了解更多
                    </button>
                </div>
            </div>
        </div>`;
    }

    async initializeHomePage() {
        try {
            // Show user greeting
            this.updateUserGreeting();
            
            // Update cart count
            this.updateCartCount();
            
            // Update current table
            this.updateCurrentTable();
            
            // Load data in parallel
            await Promise.all([
                this.loadCategories(),
                this.loadFeaturedItems(),
                this.loadRecentOrders()
            ]);
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize search functionality
            this.initializeSearch();
            
        } catch (error) {
            console.error('Failed to initialize home page:', error);
            app.showToast('載入頁面時發生錯誤', 'error');
        }
    }

    updateUserGreeting() {
        const user = app.getCurrentUser();
        const greetingElement = document.getElementById('user-greeting');
        
        if (greetingElement && user) {
            const timeOfDay = this.getTimeOfDayGreeting();
            greetingElement.innerHTML = `
                <div class="user-info">
                    <span class="greeting-text">${timeOfDay}，${user.username}！</span>
                    <span class="user-badge">${this.getUserBadge(user)}</span>
                </div>
            `;
        }
    }

    getTimeOfDayGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return '早安';
        if (hour < 18) return '午安';
        return '晚安';
    }

    getUserBadge(user) {
        // Determine user badge based on order history or user type
        return '尊貴顧客'; // Default badge
    }

    updateCartCount() {
        const cartCount = cart.getItemCount();
        const badge = document.getElementById('cart-count');
        const actionCard = badge?.closest('.action-card');
        
        if (badge) {
            if (cartCount > 0) {
                badge.textContent = cartCount;
                badge.classList.remove('hidden');
                actionCard?.classList.add('has-items');
            } else {
                badge.classList.add('hidden');
                actionCard?.classList.remove('has-items');
            }
        }
    }

    updateCurrentTable() {
        const tableNumber = Storage.getTableNumber();
        const tableElement = document.getElementById('current-table');
        
        if (tableElement) {
            if (tableNumber) {
                tableElement.textContent = `桌號 ${tableNumber}`;
                tableElement.parentElement.classList.add('selected');
            } else {
                tableElement.textContent = '未選擇';
                tableElement.parentElement.classList.remove('selected');
            }
        }
    }

    async loadCategories() {
        try {
            // Get all menu items to extract categories
            const menuItems = await api.getMenuItems();
            const categoryStats = this.extractCategoryStats(menuItems);
            
            this.categories = categoryStats;
            this.renderCategories();
            
        } catch (error) {
            console.error('Failed to load categories:', error);
            this.renderCategoriesError();
        }
    }

    extractCategoryStats(menuItems) {
        const categoryMap = {};
        
        menuItems.forEach(item => {
            if (!categoryMap[item.category]) {
                categoryMap[item.category] = {
                    category: item.category,
                    count: 0,
                    minPrice: item.price,
                    maxPrice: item.price
                };
            }
            
            const cat = categoryMap[item.category];
            cat.count++;
            cat.minPrice = Math.min(cat.minPrice, item.price);
            cat.maxPrice = Math.max(cat.maxPrice, item.price);
        });
        
        return Object.values(categoryMap);
    }

    renderCategories() {
        const container = document.getElementById('categories-grid');
        if (!container) return;
        
        const categoryInfo = {
            'APPETIZER': { name: '前菜', icon: '🥗', color: '#4CAF50' },
            'MAIN_COURSE': { name: '主菜', icon: '🍖', color: '#FF6B35' },
            'DESSERT': { name: '甜點', icon: '🧁', color: '#E91E63' },
            'BEVERAGE': { name: '飲料', icon: '🥤', color: '#2196F3' },
            'SOUP': { name: '湯品', icon: '🍲', color: '#FF9800' },
            'SALAD': { name: '沙拉', icon: '🥙', color: '#8BC34A' }
        };
        
        const html = this.categories.map(cat => {
            const info = categoryInfo[cat.category] || { name: '其他', icon: '🍽️', color: '#9E9E9E' };
            return `
                <div class="category-card" onclick="homePage.navigateToCategory('${cat.category}')" style="--category-color: ${info.color}">
                    <div class="category-icon">${info.icon}</div>
                    <div class="category-info">
                        <h3>${info.name}</h3>
                        <p>${cat.count} 道菜品</p>
                        <span class="price-range">NT$ ${cat.minPrice} - ${cat.maxPrice}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
    }

    renderCategoriesError() {
        const container = document.getElementById('categories-grid');
        if (!container) return;
        
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>載入分類時發生錯誤</p>
                <button class="retry-btn" onclick="homePage.loadCategories()">重試</button>
            </div>
        `;
    }

    async loadFeaturedItems() {
        try {
            const items = await api.getPopularItems();
            this.featuredItems = items.slice(0, 6); // Limit to 6 items
            this.renderFeaturedItems();
            
        } catch (error) {
            console.error('Failed to load featured items:', error);
            this.renderFeaturedItemsError();
        }
    }

    renderFeaturedItems() {
        const container = document.getElementById('featured-items');
        if (!container) return;
        
        const html = this.featuredItems.map(item => `
            <div class="featured-item-card" onclick="homePage.viewItemDetail('${item.itemId}')">
                <div class="item-image">
                    <img src="${item.imageUrl || 'assets/images/placeholder.jpg'}" 
                         alt="${item.name}"
                         onerror="Helpers.handleImageError(this)">
                    <div class="item-badge">推薦</div>
                </div>
                <div class="item-content">
                    <h3 class="item-name">${item.name}</h3>
                    <p class="item-description">${Helpers.truncate(item.description, 40)}</p>
                    <div class="item-meta">
                        <span class="item-time">
                            <i class="fas fa-clock"></i>
                            ${item.preparationTime}分鐘
                        </span>
                        <span class="item-category">${Helpers.getCategoryInfo(item.category).text}</span>
                    </div>
                    <div class="item-footer">
                        <span class="item-price">${Helpers.formatCurrency(item.price)}</span>
                        <button class="add-to-cart-btn" onclick="event.stopPropagation(); homePage.addToCart('${item.itemId}')">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
    }

    renderFeaturedItemsError() {
        const container = document.getElementById('featured-items');
        if (!container) return;
        
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>載入推薦菜品時發生錯誤</p>
                <button class="retry-btn" onclick="homePage.loadFeaturedItems()">重試</button>
            </div>
        `;
    }

    async loadRecentOrders() {
        const user = app.getCurrentUser();
        if (!user) return;
        
        try {
            const orders = await api.getCustomerOrders(user.id);
            const recentOrders = orders.slice(0, 3); // Last 3 orders
            
            if (recentOrders.length > 0) {
                this.renderRecentOrders(recentOrders);
                document.getElementById('recent-orders-section')?.classList.remove('hidden');
            }
            
        } catch (error) {
            console.error('Failed to load recent orders:', error);
        }
    }

    renderRecentOrders(orders) {
        const container = document.getElementById('recent-orders');
        if (!container) return;
        
        const html = orders.map(order => {
            const statusInfo = Helpers.getOrderStatusInfo(order.status);
            return `
                <div class="recent-order-card" onclick="homePage.viewOrderDetail('${order.id}')">
                    <div class="order-header">
                        <span class="order-number">#${order.orderNumber}</span>
                        <span class="order-status" style="color: ${statusInfo.color}">
                            <i class="fas fa-${statusInfo.icon}"></i>
                            ${statusInfo.text}
                        </span>
                    </div>
                    <div class="order-content">
                        <p class="order-items">${order.items?.length || 0} 道菜品</p>
                        <p class="order-time">${Helpers.getTimeAgo(order.createdAt)}</p>
                    </div>
                    <div class="order-footer">
                        <span class="order-total">${Helpers.formatCurrency(order.totalAmount)}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
    }

    setupEventListeners() {
        // Listen for cart updates
        cart.eventEmitter.on('cartUpdated', () => {
            this.updateCartCount();
        });
        
        // Listen for table selection updates
        app.on('tableSelected', () => {
            this.updateCurrentTable();
        });
    }

    initializeSearch() {
        const searchInput = document.getElementById('search-input');
        const clearBtn = document.getElementById('search-clear');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });
            
            searchInput.addEventListener('focus', () => {
                this.showSearchSuggestions();
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }
        
        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSearchSuggestions();
            }
        });
    }

    handleSearchInput(query) {
        const clearBtn = document.getElementById('search-clear');
        
        if (query.length > 0) {
            clearBtn?.classList.remove('hidden');
            
            // Debounce search
            clearTimeout(this.searchDebounceTimer);
            this.searchDebounceTimer = setTimeout(() => {
                this.performSearch(query);
            }, 300);
        } else {
            clearBtn?.classList.add('hidden');
            this.hideSearchSuggestions();
        }
    }

    async performSearch(query) {
        if (query.length < 2) return;
        
        this.isSearching = true;
        
        try {
            const results = await api.searchMenuItems(query);
            this.searchResults = results;
            this.showSearchResults(results);
            
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            this.isSearching = false;
        }
    }

    showSearchResults(results) {
        const container = document.getElementById('search-suggestions');
        if (!container) return;
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>找不到相關菜品</p>
                </div>
            `;
        } else {
            const html = results.slice(0, 5).map(item => `
                <div class="search-result-item" onclick="homePage.viewItemDetail('${item.itemId}')">
                    <div class="result-image">
                        <img src="${item.imageUrl || 'assets/images/placeholder.jpg'}" alt="${item.name}">
                    </div>
                    <div class="result-content">
                        <h4>${item.name}</h4>
                        <p>${Helpers.getCategoryInfo(item.category).text}</p>
                        <span class="result-price">${Helpers.formatCurrency(item.price)}</span>
                    </div>
                </div>
            `).join('');
            
            container.innerHTML = html;
        }
        
        container.classList.remove('hidden');
    }

    showSearchSuggestions() {
        const recentSearches = Storage.getRecentSearches();
        const container = document.getElementById('search-suggestions');
        
        if (!container || recentSearches.length === 0) return;
        
        const html = `
            <div class="search-suggestions-header">
                <h4>最近搜尋</h4>
                <button onclick="Storage.clearRecentSearches(); homePage.hideSearchSuggestions()">清除</button>
            </div>
            ${recentSearches.map(search => `
                <div class="suggestion-item" onclick="homePage.selectSearch('${search}')">
                    <i class="fas fa-history"></i>
                    <span>${search}</span>
                </div>
            `).join('')}
        `;
        
        container.innerHTML = html;
        container.classList.remove('hidden');
    }

    hideSearchSuggestions() {
        const container = document.getElementById('search-suggestions');
        container?.classList.add('hidden');
    }

    selectSearch(query) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = query;
            this.performSearch(query);
        }
    }

    clearSearch() {
        const searchInput = document.getElementById('search-input');
        const clearBtn = document.getElementById('search-clear');
        
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
        
        clearBtn?.classList.add('hidden');
        this.hideSearchSuggestions();
    }

    // Navigation methods
    navigateToMenu() {
        app.navigateTo('menu');
    }

    navigateToCart() {
        app.navigateTo('cart');
    }

    navigateToOrders() {
        app.navigateTo('orders');
    }

    navigateToCategory(category) {
        app.navigateTo(`menu?category=${category}`);
    }

    viewItemDetail(itemId) {
        app.navigateTo(`menu-item?id=${itemId}`);
    }

    viewOrderDetail(orderId) {
        app.navigateTo(`order-detail?id=${orderId}`);
    }

    async addToCart(itemId) {
        try {
            const item = this.featuredItems.find(i => i.itemId === itemId);
            if (!item) {
                app.showToast('菜品不存在', 'error');
                return;
            }
            
            cart.addItem(item);
            app.showToast(`已將 ${item.name} 加入購物車`, 'success');
            
            // Update cart count
            this.updateCartCount();
            
        } catch (error) {
            console.error('Failed to add to cart:', error);
            app.showToast('加入購物車失敗', 'error');
        }
    }

    showTableSelector() {
        // TODO: Implement table selector modal
        app.showToast('桌號選擇功能建構中...', 'info');
    }

    showPromotion() {
        // TODO: Implement promotion modal
        app.showToast('優惠詳情功能建構中...', 'info');
    }
}

// Create global instance
window.homePage = new HomePage();