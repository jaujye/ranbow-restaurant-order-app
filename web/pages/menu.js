// Menu Page - Browse and filter menu items

class MenuPage {
    constructor() {
        this.menuItems = [];
        this.filteredItems = [];
        this.categories = [];
        this.currentCategory = 'ALL';
        this.currentSort = 'default';
        this.searchQuery = '';
        this.filters = {
            priceRange: [0, 1000],
            spicyLevel: 'all',
            vegetarian: false,
            available: true
        };
        this.isLoading = false;
        this.searchDebounceTimer = null;
    }

    getMenuPageTemplate() {
        return `
        <div class="menu-page">
            <!-- Menu Header -->
            <div class="menu-header">
                <div class="search-section">
                    <div class="search-bar">
                        <i class="fas fa-search search-icon"></i>
                        <input 
                            type="text" 
                            class="search-input" 
                            placeholder="搜尋菜品..." 
                            id="menu-search-input"
                            value="${this.searchQuery}"
                        >
                        <button class="search-clear-btn hidden" id="menu-search-clear">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <div class="filter-section">
                    <div class="category-tabs" id="category-tabs">
                        <!-- Category tabs will be loaded dynamically -->
                        <div class="category-tab active" data-category="ALL">全部</div>
                        <div class="category-skeleton-tab"></div>
                        <div class="category-skeleton-tab"></div>
                        <div class="category-skeleton-tab"></div>
                    </div>

                    <div class="filter-controls">
                        <button class="filter-btn" id="sort-btn" onclick="menuPage.showSortOptions()">
                            <i class="fas fa-sort"></i>
                            排序
                        </button>
                        <button class="filter-btn" id="filter-btn" onclick="menuPage.showFilterOptions()">
                            <i class="fas fa-filter"></i>
                            篩選
                        </button>
                    </div>
                </div>
            </div>

            <!-- Results Info -->
            <div class="results-info" id="results-info">
                <span class="results-count">載入中...</span>
                <div class="view-toggle">
                    <button class="view-btn active" data-view="grid" onclick="menuPage.setViewMode('grid')">
                        <i class="fas fa-th"></i>
                    </button>
                    <button class="view-btn" data-view="list" onclick="menuPage.setViewMode('list')">
                        <i class="fas fa-list"></i>
                    </button>
                </div>
            </div>

            <!-- Menu Content -->
            <div class="menu-content">
                <div class="menu-grid" id="menu-grid" data-view="grid">
                    <!-- Menu items will be loaded dynamically -->
                    <div class="menu-item-skeleton"></div>
                    <div class="menu-item-skeleton"></div>
                    <div class="menu-item-skeleton"></div>
                    <div class="menu-item-skeleton"></div>
                </div>
            </div>

            <!-- Floating Action Button -->
            <div class="floating-cart-btn" id="floating-cart-btn" onclick="menuPage.navigateToCart()">
                <i class="fas fa-shopping-cart"></i>
                <span class="cart-count" id="floating-cart-count">0</span>
            </div>
        </div>

        <!-- Sort Modal -->
        <div class="modal-overlay hidden" id="sort-modal-overlay">
            <div class="sort-modal">
                <div class="modal-header">
                    <h3>排序方式</h3>
                    <button class="modal-close" onclick="menuPage.hideSortOptions()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-content">
                    <div class="sort-options">
                        <label class="sort-option">
                            <input type="radio" name="sort" value="default" ${this.currentSort === 'default' ? 'checked' : ''}>
                            <span class="radio-custom"></span>
                            <span class="option-text">推薦排序</span>
                        </label>
                        <label class="sort-option">
                            <input type="radio" name="sort" value="price-asc" ${this.currentSort === 'price-asc' ? 'checked' : ''}>
                            <span class="radio-custom"></span>
                            <span class="option-text">價格由低到高</span>
                        </label>
                        <label class="sort-option">
                            <input type="radio" name="sort" value="price-desc" ${this.currentSort === 'price-desc' ? 'checked' : ''}>
                            <span class="radio-custom"></span>
                            <span class="option-text">價格由高到低</span>
                        </label>
                        <label class="sort-option">
                            <input type="radio" name="sort" value="prep-time" ${this.currentSort === 'prep-time' ? 'checked' : ''}>
                            <span class="radio-custom"></span>
                            <span class="option-text">製作時間</span>
                        </label>
                        <label class="sort-option">
                            <input type="radio" name="sort" value="name" ${this.currentSort === 'name' ? 'checked' : ''}>
                            <span class="radio-custom"></span>
                            <span class="option-text">名稱排序</span>
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="menuPage.hideSortOptions()">取消</button>
                    <button class="btn btn-primary" onclick="menuPage.applySortOptions()">確定</button>
                </div>
            </div>
        </div>

        <!-- Filter Modal -->
        <div class="modal-overlay hidden" id="filter-modal-overlay">
            <div class="filter-modal">
                <div class="modal-header">
                    <h3>篩選條件</h3>
                    <button class="modal-close" onclick="menuPage.hideFilterOptions()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-content">
                    <div class="filter-group">
                        <h4>價格範圍</h4>
                        <div class="price-range-slider">
                            <input type="range" id="price-min" min="0" max="1000" value="${this.filters.priceRange[0]}" class="range-input">
                            <input type="range" id="price-max" min="0" max="1000" value="${this.filters.priceRange[1]}" class="range-input">
                            <div class="price-range-display">
                                NT$ <span id="price-min-display">${this.filters.priceRange[0]}</span> - 
                                NT$ <span id="price-max-display">${this.filters.priceRange[1]}</span>
                            </div>
                        </div>
                    </div>

                    <div class="filter-group">
                        <h4>辣度</h4>
                        <div class="spicy-options">
                            <label class="filter-option">
                                <input type="radio" name="spicy" value="all" ${this.filters.spicyLevel === 'all' ? 'checked' : ''}>
                                <span class="radio-custom"></span>
                                <span class="option-text">不限</span>
                            </label>
                            <label class="filter-option">
                                <input type="radio" name="spicy" value="none" ${this.filters.spicyLevel === 'none' ? 'checked' : ''}>
                                <span class="radio-custom"></span>
                                <span class="option-text">不辣</span>
                            </label>
                            <label class="filter-option">
                                <input type="radio" name="spicy" value="mild" ${this.filters.spicyLevel === 'mild' ? 'checked' : ''}>
                                <span class="radio-custom"></span>
                                <span class="option-text">微辣</span>
                            </label>
                            <label class="filter-option">
                                <input type="radio" name="spicy" value="hot" ${this.filters.spicyLevel === 'hot' ? 'checked' : ''}>
                                <span class="radio-custom"></span>
                                <span class="option-text">中辣</span>
                            </label>
                        </div>
                    </div>

                    <div class="filter-group">
                        <h4>其他選項</h4>
                        <label class="checkbox-filter">
                            <input type="checkbox" ${this.filters.vegetarian ? 'checked' : ''} id="vegetarian-filter">
                            <span class="checkbox-custom"></span>
                            <span class="option-text">素食選項</span>
                        </label>
                        <label class="checkbox-filter">
                            <input type="checkbox" ${this.filters.available ? 'checked' : ''} id="available-filter">
                            <span class="checkbox-custom"></span>
                            <span class="option-text">僅顯示可點餐</span>
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="menuPage.resetFilters()">重置</button>
                    <button class="btn btn-secondary" onclick="menuPage.hideFilterOptions()">取消</button>
                    <button class="btn btn-primary" onclick="menuPage.applyFilters()">確定</button>
                </div>
            </div>
        </div>`;
    }

    async initializeMenuPage() {
        try {
            // Check if we have a specific category from navigation
            const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const categoryParam = urlParams.get('category');
            if (categoryParam) {
                this.currentCategory = categoryParam;
            }

            // Load menu data
            await this.loadMenuData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Update cart count
            this.updateCartCount();
            
            // Apply initial filters
            this.applyFiltersAndSort();
            
        } catch (error) {
            console.error('Failed to initialize menu page:', error);
            app.showToast('載入菜單時發生錯誤', 'error');
        }
    }

    async loadMenuData() {
        this.isLoading = true;
        this.showLoadingState();

        try {
            const [menuItems, categories] = await Promise.all([
                api.getMenuItems(),
                this.extractCategories()
            ]);

            this.menuItems = menuItems;
            this.categories = categories;
            
            this.renderCategories();
            
        } catch (error) {
            console.error('Failed to load menu data:', error);
            this.showErrorState();
        } finally {
            this.isLoading = false;
        }
    }

    async extractCategories() {
        try {
            const menuItems = await api.getMenuItems();
            const categorySet = new Set();
            
            menuItems.forEach(item => {
                if (item.category) {
                    categorySet.add(item.category);
                }
            });
            
            return Array.from(categorySet);
        } catch (error) {
            return ['APPETIZER', 'MAIN_COURSE', 'DESSERT', 'BEVERAGE'];
        }
    }

    renderCategories() {
        const container = document.getElementById('category-tabs');
        if (!container) return;

        const categoryInfo = {
            'ALL': { name: '全部', icon: '🍽️' },
            'APPETIZER': { name: '前菜', icon: '🥗' },
            'MAIN_COURSE': { name: '主菜', icon: '🍖' },
            'DESSERT': { name: '甜點', icon: '🧁' },
            'BEVERAGE': { name: '飲料', icon: '🥤' },
            'SOUP': { name: '湯品', icon: '🍲' },
            'SALAD': { name: '沙拉', icon: '🥙' }
        };

        const allCategories = ['ALL', ...this.categories];
        
        const html = allCategories.map(category => {
            const info = categoryInfo[category] || { name: category, icon: '🍽️' };
            const isActive = category === this.currentCategory;
            
            return `
                <div class="category-tab ${isActive ? 'active' : ''}" 
                     data-category="${category}"
                     onclick="menuPage.selectCategory('${category}')">
                    <span class="category-icon">${info.icon}</span>
                    <span class="category-name">${info.name}</span>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    selectCategory(category) {
        this.currentCategory = category;
        
        // Update active tab
        const tabs = document.querySelectorAll('.category-tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });

        // Apply filters
        this.applyFiltersAndSort();
    }

    applyFiltersAndSort() {
        let filtered = [...this.menuItems];

        // Apply category filter
        if (this.currentCategory !== 'ALL') {
            filtered = filtered.filter(item => item.category === this.currentCategory);
        }

        // Apply search filter
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(query) ||
                (item.description && item.description.toLowerCase().includes(query))
            );
        }

        // Apply price filter
        filtered = filtered.filter(item => 
            item.price >= this.filters.priceRange[0] && 
            item.price <= this.filters.priceRange[1]
        );

        // Apply availability filter
        if (this.filters.available) {
            filtered = filtered.filter(item => item.available);
        }

        // Apply vegetarian filter
        if (this.filters.vegetarian) {
            filtered = filtered.filter(item => item.vegetarian);
        }

        // Apply sorting
        this.sortItems(filtered);

        this.filteredItems = filtered;
        this.renderMenuItems();
        this.updateResultsInfo();
    }

    sortItems(items) {
        switch (this.currentSort) {
            case 'price-asc':
                items.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                items.sort((a, b) => b.price - a.price);
                break;
            case 'prep-time':
                items.sort((a, b) => a.preparationTime - b.preparationTime);
                break;
            case 'name':
                items.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                // Keep original order (popularity/default)
                break;
        }
    }

    renderMenuItems() {
        const container = document.getElementById('menu-grid');
        if (!container) return;

        if (this.filteredItems.length === 0) {
            this.showEmptyState();
            return;
        }

        const viewMode = container.dataset.view || 'grid';
        
        const html = this.filteredItems.map(item => this.renderMenuItem(item, viewMode)).join('');
        container.innerHTML = html;
    }

    renderMenuItem(item, viewMode = 'grid') {
        const categoryInfo = Helpers.getCategoryInfo(item.category);
        const isGridView = viewMode === 'grid';

        return `
            <div class="menu-item-card ${isGridView ? 'grid-view' : 'list-view'} ${!item.available ? 'unavailable' : ''}">
                <div class="item-image">
                    <img src="${item.imageUrl || 'assets/images/placeholder.svg'}" 
                         alt="${item.name}"
                         onerror="Helpers.handleImageError(this)">
                    ${!item.available ? '<div class="unavailable-overlay">暫時缺貨</div>' : ''}
                    <div class="category-badge" style="background: ${categoryInfo.color}">
                        ${categoryInfo.icon}
                    </div>
                </div>
                
                <div class="item-content">
                    <div class="item-header">
                        <h3 class="item-name">${item.name}</h3>
                        <span class="item-price">${Helpers.formatCurrency(item.price)}</span>
                    </div>
                    
                    <p class="item-description">${Helpers.truncate(item.description || '', isGridView ? 60 : 120)}</p>
                    
                    <div class="item-meta">
                        <span class="prep-time">
                            <i class="fas fa-clock"></i>
                            ${item.preparationTime}分鐘
                        </span>
                        <span class="category-name">${categoryInfo.text}</span>
                        ${item.spicyLevel ? `<span class="spicy-level">🌶️ ${item.spicyLevel}</span>` : ''}
                        ${item.vegetarian ? '<span class="vegetarian-badge">🌱 素食</span>' : ''}
                    </div>
                    
                    <div class="item-actions">
                        <button class="btn btn-outline btn-small" onclick="menuPage.viewItemDetail('${item.itemId}')">
                            查看詳情
                        </button>
                        <button class="add-to-cart-btn ${!item.available ? 'disabled' : ''}" 
                                onclick="menuPage.addToCart('${item.itemId}')"
                                ${!item.available ? 'disabled' : ''}>
                            <i class="fas fa-plus"></i>
                            加入購物車
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    updateResultsInfo() {
        const countElement = document.querySelector('.results-count');
        if (!countElement) return;

        const total = this.filteredItems.length;
        const totalItems = this.menuItems.length;
        
        if (this.currentCategory === 'ALL' && !this.searchQuery) {
            countElement.textContent = `共 ${total} 道菜品`;
        } else {
            countElement.textContent = `找到 ${total} 道菜品`;
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('menu-search-input');
        const clearBtn = document.getElementById('menu-search-clear');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }

        // Cart updates
        cart.eventEmitter.on('cartUpdated', () => {
            this.updateCartCount();
        });

        // Price range sliders
        this.setupPriceRangeSliders();
    }

    handleSearch(query) {
        this.searchQuery = query.trim();
        
        const clearBtn = document.getElementById('menu-search-clear');
        if (clearBtn) {
            clearBtn.classList.toggle('hidden', !this.searchQuery);
        }

        // Debounce search
        clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(() => {
            this.applyFiltersAndSort();
            
            // Save to recent searches
            if (this.searchQuery.length > 1) {
                Storage.addRecentSearch(this.searchQuery);
            }
        }, 300);
    }

    clearSearch() {
        const searchInput = document.getElementById('menu-search-input');
        const clearBtn = document.getElementById('menu-search-clear');
        
        if (searchInput) {
            searchInput.value = '';
        }
        
        if (clearBtn) {
            clearBtn.classList.add('hidden');
        }
        
        this.searchQuery = '';
        this.applyFiltersAndSort();
    }

    setupPriceRangeSliders() {
        const minSlider = document.getElementById('price-min');
        const maxSlider = document.getElementById('price-max');
        const minDisplay = document.getElementById('price-min-display');
        const maxDisplay = document.getElementById('price-max-display');

        if (minSlider && maxSlider) {
            const updateRange = () => {
                let min = parseInt(minSlider.value);
                let max = parseInt(maxSlider.value);
                
                if (min > max) {
                    [min, max] = [max, min];
                    minSlider.value = min;
                    maxSlider.value = max;
                }
                
                this.filters.priceRange = [min, max];
                
                if (minDisplay) minDisplay.textContent = min;
                if (maxDisplay) maxDisplay.textContent = max;
            };

            minSlider.addEventListener('input', updateRange);
            maxSlider.addEventListener('input', updateRange);
        }
    }

    setViewMode(mode) {
        const container = document.getElementById('menu-grid');
        const buttons = document.querySelectorAll('.view-btn');
        
        if (container) {
            container.dataset.view = mode;
        }
        
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === mode);
        });
        
        // Re-render items in new view mode
        this.renderMenuItems();
    }

    updateCartCount() {
        const count = cart.getItemCount();
        const badge = document.getElementById('floating-cart-count');
        const button = document.getElementById('floating-cart-btn');
        
        if (badge && button) {
            badge.textContent = count;
            button.classList.toggle('has-items', count > 0);
        }
    }

    // Modal functions
    showSortOptions() {
        const modal = document.getElementById('sort-modal-overlay');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    hideSortOptions() {
        const modal = document.getElementById('sort-modal-overlay');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    applySortOptions() {
        const selectedSort = document.querySelector('input[name="sort"]:checked');
        if (selectedSort) {
            this.currentSort = selectedSort.value;
            this.applyFiltersAndSort();
        }
        this.hideSortOptions();
    }

    showFilterOptions() {
        const modal = document.getElementById('filter-modal-overlay');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    hideFilterOptions() {
        const modal = document.getElementById('filter-modal-overlay');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    applyFilters() {
        // Update spicy level filter
        const selectedSpicy = document.querySelector('input[name="spicy"]:checked');
        if (selectedSpicy) {
            this.filters.spicyLevel = selectedSpicy.value;
        }

        // Update other filters
        const vegetarianFilter = document.getElementById('vegetarian-filter');
        const availableFilter = document.getElementById('available-filter');
        
        if (vegetarianFilter) {
            this.filters.vegetarian = vegetarianFilter.checked;
        }
        
        if (availableFilter) {
            this.filters.available = availableFilter.checked;
        }

        this.applyFiltersAndSort();
        this.hideFilterOptions();
    }

    resetFilters() {
        this.filters = {
            priceRange: [0, 1000],
            spicyLevel: 'all',
            vegetarian: false,
            available: true
        };

        // Reset form inputs
        const spicyRadios = document.querySelectorAll('input[name="spicy"]');
        spicyRadios.forEach(radio => {
            radio.checked = radio.value === 'all';
        });

        const vegetarianCheckbox = document.getElementById('vegetarian-filter');
        const availableCheckbox = document.getElementById('available-filter');
        
        if (vegetarianCheckbox) vegetarianCheckbox.checked = false;
        if (availableCheckbox) availableCheckbox.checked = true;

        // Reset price sliders
        const minSlider = document.getElementById('price-min');
        const maxSlider = document.getElementById('price-max');
        
        if (minSlider) minSlider.value = 0;
        if (maxSlider) maxSlider.value = 1000;
        
        this.setupPriceRangeSliders();
        this.applyFiltersAndSort();
    }

    // Actions
    async addToCart(itemId) {
        try {
            const item = this.menuItems.find(i => i.itemId === itemId);
            if (!item) {
                app.showToast('菜品不存在', 'error');
                return;
            }

            if (!item.available) {
                app.showToast('此菜品暫時缺貨', 'warning');
                return;
            }

            cart.addItem(item);
            app.showToast(`已將 ${item.name} 加入購物車`, 'success');
            
            this.updateCartCount();
            
        } catch (error) {
            console.error('Failed to add to cart:', error);
            app.showToast('加入購物車失敗', 'error');
        }
    }

    viewItemDetail(itemId) {
        app.navigateTo(`menu-item?id=${itemId}`);
    }

    navigateToCart() {
        app.navigateTo('cart');
    }

    // State functions
    showLoadingState() {
        const container = document.getElementById('menu-grid');
        if (!container) return;

        container.innerHTML = Array(8).fill(0).map(() => `
            <div class="menu-item-skeleton">
                <div class="skeleton-image"></div>
                <div class="skeleton-content">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-price"></div>
                </div>
            </div>
        `).join('');
    }

    showEmptyState() {
        const container = document.getElementById('menu-grid');
        if (!container) return;

        const message = this.searchQuery ? 
            `找不到包含 "${this.searchQuery}" 的菜品` : 
            '此分類暫無菜品';

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>沒有找到菜品</h3>
                <p>${message}</p>
                <div class="empty-actions">
                    ${this.searchQuery ? '<button class="btn btn-primary" onclick="menuPage.clearSearch()">清除搜尋</button>' : ''}
                    <button class="btn btn-outline" onclick="menuPage.selectCategory(\'ALL\')">查看全部菜單</button>
                </div>
            </div>
        `;
    }

    showErrorState() {
        const container = document.getElementById('menu-grid');
        if (!container) return;

        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>載入失敗</h3>
                <p>無法載入菜單，請檢查網路連接</p>
                <button class="btn btn-primary" onclick="menuPage.loadMenuData()">重新載入</button>
            </div>
        `;
    }
}

// Create global instance
window.menuPage = new MenuPage();