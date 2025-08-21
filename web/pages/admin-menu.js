// Admin Menu Management - Rainbow Theme CRUD Operations

class AdminMenuManagement {
    constructor() {
        this.currentView = 'list'; // list, add, edit
        this.selectedItem = null;
        this.categories = ['前菜', '主菜', '甜點', '飲料', '特色菜'];
        this.menuItems = [];
        this.searchQuery = '';
        this.filterCategory = 'all';
        this.sortBy = 'name';
    }

    getMenuManagementTemplate() {
        return `
        <div class="admin-menu-container">
            <!-- Rainbow Background Effects -->
            <div class="admin-background-effects">
                <div class="rainbow-gradient-bg"></div>
                <div class="floating-food-icons">
                    <div class="food-icon">🍔</div>
                    <div class="food-icon">🍕</div>
                    <div class="food-icon">🍰</div>
                    <div class="food-icon">🥤</div>
                    <div class="food-icon">🍜</div>
                </div>
            </div>

            <!-- Header Section -->
            <header class="admin-menu-header glass-morphism">
                <div class="header-content">
                    <div class="header-left">
                        <button class="back-btn rainbow-btn-ghost" onclick="app.navigateTo('admin-dashboard')">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <div class="header-title">
                            <h1 class="page-title rainbow-text">
                                <i class="fas fa-utensils"></i>
                                菜單管理
                            </h1>
                            <p class="page-subtitle">管理餐廳菜品與分類</p>
                        </div>
                    </div>
                    <div class="header-right">
                        <div class="header-stats">
                            <div class="stat-item">
                                <span class="stat-value" id="total-items">0</span>
                                <span class="stat-label">總菜品</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value" id="active-items">0</span>
                                <span class="stat-label">上架中</span>
                            </div>
                        </div>
                        <button class="add-item-btn rainbow-btn-primary" onclick="adminMenu.showAddForm()">
                            <i class="fas fa-plus"></i>
                            <span>新增菜品</span>
                        </button>
                    </div>
                </div>
            </header>

            <!-- Control Bar -->
            <section class="menu-controls glass-morphism">
                <div class="controls-content">
                    <div class="search-section">
                        <div class="search-container">
                            <i class="fas fa-search search-icon"></i>
                            <input 
                                type="text" 
                                class="search-input rainbow-input" 
                                placeholder="搜尋菜品名稱..."
                                id="menu-search-input"
                                value="${this.searchQuery}"
                            />
                            <button class="search-clear-btn" id="search-clear-btn" style="display: none;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="filter-section">
                        <div class="filter-group">
                            <label class="filter-label">分類：</label>
                            <select class="filter-select rainbow-select" id="category-filter">
                                <option value="all">全部分類</option>
                                ${this.categories.map(cat => 
                                    `<option value="${cat}" ${this.filterCategory === cat ? 'selected' : ''}>${cat}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label class="filter-label">排序：</label>
                            <select class="filter-select rainbow-select" id="sort-select">
                                <option value="name" ${this.sortBy === 'name' ? 'selected' : ''}>名稱</option>
                                <option value="price" ${this.sortBy === 'price' ? 'selected' : ''}>價格</option>
                                <option value="category" ${this.sortBy === 'category' ? 'selected' : ''}>分類</option>
                                <option value="popularity" ${this.sortBy === 'popularity' ? 'selected' : ''}>熱門度</option>
                                <option value="created" ${this.sortBy === 'created' ? 'selected' : ''}>建立時間</option>
                            </select>
                        </div>
                        
                        <div class="view-toggles">
                            <button class="view-toggle-btn ${this.currentView === 'list' ? 'active' : ''}" 
                                    onclick="adminMenu.setView('list')" title="列表檢視">
                                <i class="fas fa-list"></i>
                            </button>
                            <button class="view-toggle-btn ${this.currentView === 'grid' ? 'active' : ''}" 
                                    onclick="adminMenu.setView('grid')" title="卡片檢視">
                                <i class="fas fa-th-large"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Main Content Area -->
            <main class="menu-main-content">
                <!-- Menu Items List/Grid -->
                <section class="menu-items-section" id="menu-items-container">
                    ${this.getMenuItemsTemplate()}
                </section>

                <!-- Add/Edit Form (Hidden by default) -->
                <section class="menu-form-section hidden" id="menu-form-section">
                    ${this.getMenuFormTemplate()}
                </section>
            </main>

            <!-- Bulk Actions Bar (Hidden by default) -->
            <div class="bulk-actions-bar glass-morphism hidden" id="bulk-actions-bar">
                <div class="bulk-actions-content">
                    <div class="bulk-selection-info">
                        <span id="selected-count">0</span> 項已選取
                    </div>
                    <div class="bulk-actions">
                        <button class="bulk-action-btn rainbow-btn-secondary" onclick="adminMenu.bulkToggleStatus()">
                            <i class="fas fa-toggle-on"></i>
                            切換狀態
                        </button>
                        <button class="bulk-action-btn rainbow-btn-warning" onclick="adminMenu.bulkUpdatePrice()">
                            <i class="fas fa-dollar-sign"></i>
                            批量調價
                        </button>
                        <button class="bulk-action-btn rainbow-btn-danger" onclick="adminMenu.bulkDelete()">
                            <i class="fas fa-trash"></i>
                            批量刪除
                        </button>
                    </div>
                    <button class="bulk-close-btn rainbow-btn-ghost" onclick="adminMenu.clearSelection()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
    }

    getMenuItemsTemplate() {
        if (this.currentView === 'grid') {
            return this.getGridViewTemplate();
        } else {
            return this.getListViewTemplate();
        }
    }

    getListViewTemplate() {
        return `
        <div class="menu-list-view">
            <div class="list-header glass-morphism">
                <div class="list-header-row">
                    <div class="header-cell checkbox-cell">
                        <label class="checkbox-container rainbow-checkbox">
                            <input type="checkbox" id="select-all-checkbox">
                            <span class="checkmark rainbow-checkmark"></span>
                        </label>
                    </div>
                    <div class="header-cell image-cell">圖片</div>
                    <div class="header-cell name-cell">菜品名稱</div>
                    <div class="header-cell category-cell">分類</div>
                    <div class="header-cell price-cell">價格</div>
                    <div class="header-cell status-cell">狀態</div>
                    <div class="header-cell popularity-cell">熱門度</div>
                    <div class="header-cell actions-cell">操作</div>
                </div>
            </div>
            <div class="list-content" id="menu-list-content">
                ${this.getFilteredMenuItems().map(item => this.getListItemTemplate(item)).join('')}
            </div>
        </div>
        `;
    }

    getListItemTemplate(item) {
        return `
        <div class="menu-list-item glass-morphism" data-item-id="${item.id}">
            <div class="list-item-row">
                <div class="list-cell checkbox-cell">
                    <label class="checkbox-container rainbow-checkbox">
                        <input type="checkbox" class="item-checkbox" value="${item.id}">
                        <span class="checkmark rainbow-checkmark"></span>
                    </label>
                </div>
                <div class="list-cell image-cell">
                    <div class="item-image">
                        <img src="${item.image || 'assets/images/placeholder.jpg'}" alt="${item.name}" />
                    </div>
                </div>
                <div class="list-cell name-cell">
                    <div class="item-name">${item.name}</div>
                    <div class="item-description">${item.description || ''}</div>
                </div>
                <div class="list-cell category-cell">
                    <span class="category-badge category-${item.category}">${item.category}</span>
                </div>
                <div class="list-cell price-cell">
                    <span class="item-price">$${item.price}</span>
                </div>
                <div class="list-cell status-cell">
                    <div class="status-toggle">
                        <label class="toggle-switch">
                            <input type="checkbox" ${item.available ? 'checked' : ''} 
                                   onchange="adminMenu.toggleItemStatus('${item.id}')">
                            <span class="toggle-slider rainbow-toggle"></span>
                        </label>
                    </div>
                </div>
                <div class="list-cell popularity-cell">
                    <div class="popularity-bar">
                        <div class="popularity-fill rainbow-bg-gradient" style="width: ${item.popularity || 0}%"></div>
                    </div>
                    <span class="popularity-text">${item.popularity || 0}%</span>
                </div>
                <div class="list-cell actions-cell">
                    <div class="item-actions">
                        <button class="action-btn rainbow-btn-ghost" onclick="adminMenu.editItem('${item.id}')" title="編輯">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn rainbow-btn-ghost" onclick="adminMenu.duplicateItem('${item.id}')" title="複製">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="action-btn rainbow-btn-ghost danger" onclick="adminMenu.deleteItem('${item.id}')" title="刪除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    getGridViewTemplate() {
        return `
        <div class="menu-grid-view">
            <div class="grid-content" id="menu-grid-content">
                ${this.getFilteredMenuItems().map(item => this.getGridItemTemplate(item)).join('')}
            </div>
        </div>
        `;
    }

    getGridItemTemplate(item) {
        return `
        <div class="menu-grid-item glass-morphism" data-item-id="${item.id}">
            <div class="grid-item-header">
                <label class="checkbox-container rainbow-checkbox">
                    <input type="checkbox" class="item-checkbox" value="${item.id}">
                    <span class="checkmark rainbow-checkmark"></span>
                </label>
                <div class="item-status">
                    <span class="status-indicator ${item.available ? 'active' : 'inactive'}"></span>
                </div>
            </div>
            
            <div class="grid-item-image">
                <img src="${item.image || 'assets/images/placeholder.jpg'}" alt="${item.name}" />
                <div class="image-overlay">
                    <div class="overlay-actions">
                        <button class="overlay-btn rainbow-btn-ghost" onclick="adminMenu.editItem('${item.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="overlay-btn rainbow-btn-ghost" onclick="adminMenu.duplicateItem('${item.id}')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="grid-item-content">
                <div class="item-header">
                    <h3 class="item-name">${item.name}</h3>
                    <span class="category-badge category-${item.category}">${item.category}</span>
                </div>
                
                <p class="item-description">${item.description || '暫無描述'}</p>
                
                <div class="item-footer">
                    <div class="item-price">$${item.price}</div>
                    <div class="item-popularity">
                        <i class="fas fa-heart"></i>
                        <span>${item.popularity || 0}%</span>
                    </div>
                </div>
                
                <div class="item-actions">
                    <div class="status-toggle">
                        <label class="toggle-switch">
                            <input type="checkbox" ${item.available ? 'checked' : ''} 
                                   onchange="adminMenu.toggleItemStatus('${item.id}')">
                            <span class="toggle-slider rainbow-toggle"></span>
                        </label>
                        <span class="toggle-label">${item.available ? '上架中' : '已下架'}</span>
                    </div>
                    <button class="delete-btn rainbow-btn-ghost danger" onclick="adminMenu.deleteItem('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
    }

    getMenuFormTemplate() {
        const isEdit = this.selectedItem !== null;
        const item = isEdit ? this.selectedItem : {};
        
        return `
        <div class="menu-form-container glass-morphism">
            <div class="form-header">
                <h2 class="form-title rainbow-text">
                    <i class="fas fa-${isEdit ? 'edit' : 'plus'}"></i>
                    ${isEdit ? '編輯菜品' : '新增菜品'}
                </h2>
                <button class="form-close-btn rainbow-btn-ghost" onclick="adminMenu.hideForm()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <form class="menu-item-form" id="menu-item-form">
                <div class="form-grid">
                    <!-- Image Upload Section -->
                    <div class="form-section image-section">
                        <h3 class="section-title">菜品圖片</h3>
                        <div class="image-upload-area" id="image-upload-area">
                            <div class="upload-placeholder ${item.image ? 'has-image' : ''}">
                                ${item.image ? 
                                    `<img src="${item.image}" alt="菜品圖片" class="preview-image" />` :
                                    `<div class="upload-icon">
                                        <i class="fas fa-cloud-upload-alt"></i>
                                        <p>點擊或拖拽上傳圖片</p>
                                        <small>支援 JPG, PNG 格式，建議尺寸 400x300</small>
                                    </div>`
                                }
                            </div>
                            <input type="file" class="image-input" id="image-input" accept="image/*" />
                            <div class="image-actions">
                                <button type="button" class="image-btn rainbow-btn-secondary" onclick="document.getElementById('image-input').click()">
                                    <i class="fas fa-upload"></i>
                                    選擇圖片
                                </button>
                                ${item.image ? 
                                    `<button type="button" class="image-btn rainbow-btn-ghost" onclick="adminMenu.removeImage()">
                                        <i class="fas fa-trash"></i>
                                        移除圖片
                                    </button>` : ''
                                }
                            </div>
                        </div>
                    </div>
                    
                    <!-- Basic Information -->
                    <div class="form-section basic-info-section">
                        <h3 class="section-title">基本資訊</h3>
                        
                        <div class="form-group rainbow-form-group">
                            <label class="form-label rainbow-label required">
                                <i class="fas fa-signature"></i>
                                菜品名稱
                            </label>
                            <input 
                                type="text" 
                                class="form-input rainbow-input" 
                                name="name" 
                                value="${item.name || ''}"
                                placeholder="請輸入菜品名稱"
                                required
                            />
                        </div>
                        
                        <div class="form-group rainbow-form-group">
                            <label class="form-label rainbow-label">
                                <i class="fas fa-align-left"></i>
                                菜品描述
                            </label>
                            <textarea 
                                class="form-textarea rainbow-input" 
                                name="description" 
                                rows="3"
                                placeholder="請輸入菜品描述"
                            >${item.description || ''}</textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group rainbow-form-group">
                                <label class="form-label rainbow-label required">
                                    <i class="fas fa-tag"></i>
                                    分類
                                </label>
                                <select class="form-select rainbow-select" name="category" required>
                                    <option value="">請選擇分類</option>
                                    ${this.categories.map(cat => 
                                        `<option value="${cat}" ${item.category === cat ? 'selected' : ''}>${cat}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group rainbow-form-group">
                                <label class="form-label rainbow-label required">
                                    <i class="fas fa-dollar-sign"></i>
                                    價格
                                </label>
                                <input 
                                    type="number" 
                                    class="form-input rainbow-input" 
                                    name="price" 
                                    value="${item.price || ''}"
                                    min="0" 
                                    step="0.01"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    
                    <!-- Additional Settings -->
                    <div class="form-section settings-section">
                        <h3 class="section-title">其他設定</h3>
                        
                        <div class="form-row">
                            <div class="form-group rainbow-form-group">
                                <label class="form-label rainbow-label">
                                    <i class="fas fa-clock"></i>
                                    準備時間 (分鐘)
                                </label>
                                <input 
                                    type="number" 
                                    class="form-input rainbow-input" 
                                    name="prepTime" 
                                    value="${item.prepTime || ''}"
                                    min="1" 
                                    placeholder="15"
                                />
                            </div>
                            
                            <div class="form-group rainbow-form-group">
                                <label class="form-label rainbow-label">
                                    <i class="fas fa-fire"></i>
                                    辣度
                                </label>
                                <select class="form-select rainbow-select" name="spiceLevel">
                                    <option value="0" ${item.spiceLevel === '0' ? 'selected' : ''}>不辣</option>
                                    <option value="1" ${item.spiceLevel === '1' ? 'selected' : ''}>微辣</option>
                                    <option value="2" ${item.spiceLevel === '2' ? 'selected' : ''}>中辣</option>
                                    <option value="3" ${item.spiceLevel === '3' ? 'selected' : ''}>大辣</option>
                                    <option value="4" ${item.spiceLevel === '4' ? 'selected' : ''}>超辣</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group rainbow-form-group">
                            <label class="form-label rainbow-label">
                                <i class="fas fa-list-ul"></i>
                                食材標籤
                            </label>
                            <div class="tags-input-container">
                                <input 
                                    type="text" 
                                    class="form-input rainbow-input" 
                                    name="tags" 
                                    value="${(item.tags || []).join(', ')}"
                                    placeholder="例如：牛肉, 起司, 番茄 (用逗號分隔)"
                                />
                            </div>
                        </div>
                        
                        <div class="form-checkboxes">
                            <label class="checkbox-container rainbow-checkbox">
                                <input type="checkbox" name="available" ${item.available !== false ? 'checked' : ''}>
                                <span class="checkmark rainbow-checkmark"></span>
                                立即上架
                            </label>
                            
                            <label class="checkbox-container rainbow-checkbox">
                                <input type="checkbox" name="featured" ${item.featured ? 'checked' : ''}>
                                <span class="checkmark rainbow-checkmark"></span>
                                設為推薦菜品
                            </label>
                            
                            <label class="checkbox-container rainbow-checkbox">
                                <input type="checkbox" name="vegetarian" ${item.vegetarian ? 'checked' : ''}>
                                <span class="checkmark rainbow-checkmark"></span>
                                素食菜品
                            </label>
                        </div>
                    </div>
                </div>
                
                <!-- Form Actions -->
                <div class="form-actions">
                    <button type="button" class="form-btn rainbow-btn-secondary" onclick="adminMenu.hideForm()">
                        <i class="fas fa-times"></i>
                        取消
                    </button>
                    <button type="button" class="form-btn rainbow-btn-ghost" onclick="adminMenu.previewItem()">
                        <i class="fas fa-eye"></i>
                        預覽
                    </button>
                    <button type="submit" class="form-btn rainbow-btn-primary">
                        <i class="fas fa-save"></i>
                        ${isEdit ? '儲存變更' : '新增菜品'}
                    </button>
                </div>
            </form>
        </div>
        `;
    }

    render() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = this.getMenuManagementTemplate();
        
        // Set admin theme
        document.body.setAttribute('data-role', 'admin');
        
        // Hide navigation bars
        this.hideNavigationBars();
        
        // Load menu data
        this.loadMenuItems();
        
        // Initialize components
        this.initializeComponents();
    }

    hideNavigationBars() {
        const bottomNav = document.getElementById('bottom-nav');
        const topNav = document.getElementById('top-nav');
        
        if (bottomNav) bottomNav.classList.add('hidden');
        if (topNav) topNav.classList.add('hidden');
    }

    async loadMenuItems() {
        try {
            // Mock data - replace with actual API call
            this.menuItems = await this.fetchMenuItems();
            this.updateStats();
            this.refreshMenuDisplay();
            
        } catch (error) {
            console.error('Failed to load menu items:', error);
            Toast.show('載入菜單資料失敗', 'error');
        }
    }

    async fetchMenuItems() {
        // Mock API call
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    {
                        id: 'MENU001',
                        name: '經典牛肉漢堡',
                        description: '新鮮牛肉配搭生菜、番茄和特製醬料',
                        category: '主菜',
                        price: 280,
                        image: 'assets/images/burger.jpg',
                        available: true,
                        featured: true,
                        vegetarian: false,
                        prepTime: 15,
                        spiceLevel: '0',
                        tags: ['牛肉', '起司', '生菜'],
                        popularity: 85,
                        created: '2024-01-15'
                    },
                    {
                        id: 'MENU002',
                        name: '瑪格麗特披薩',
                        description: '經典義式披薩配番茄、莫札瑞拉起司和新鮮羅勒',
                        category: '主菜',
                        price: 320,
                        image: 'assets/images/pizza.jpg',
                        available: true,
                        featured: false,
                        vegetarian: true,
                        prepTime: 20,
                        spiceLevel: '0',
                        tags: ['起司', '番茄', '羅勒'],
                        popularity: 78,
                        created: '2024-01-10'
                    },
                    {
                        id: 'MENU003',
                        name: '巧克力熔岩蛋糕',
                        description: '溫熱的巧克力蛋糕配香草冰淇淋',
                        category: '甜點',
                        price: 180,
                        image: 'assets/images/cake.jpg',
                        available: true,
                        featured: true,
                        vegetarian: true,
                        prepTime: 10,
                        spiceLevel: '0',
                        tags: ['巧克力', '蛋糕', '冰淇淋'],
                        popularity: 92,
                        created: '2024-01-05'
                    },
                    {
                        id: 'MENU004',
                        name: '鮮榨柳橙汁',
                        description: '100%新鮮柳橙現榨果汁',
                        category: '飲料',
                        price: 80,
                        image: 'assets/images/orange-juice.jpg',
                        available: false,
                        featured: false,
                        vegetarian: true,
                        prepTime: 5,
                        spiceLevel: '0',
                        tags: ['柳橙', '果汁', '維生素C'],
                        popularity: 65,
                        created: '2024-01-08'
                    },
                    {
                        id: 'MENU005',
                        name: '凱薩沙拉',
                        description: '新鮮蘿蔓生菜配帕瑪森起司和凱薩醬',
                        category: '前菜',
                        price: 160,
                        image: 'assets/images/salad.jpg',
                        available: true,
                        featured: false,
                        vegetarian: true,
                        prepTime: 8,
                        spiceLevel: '0',
                        tags: ['生菜', '起司', '沙拉醬'],
                        popularity: 71,
                        created: '2024-01-12'
                    }
                ]);
            }, 500);
        });
    }

    updateStats() {
        const totalItems = this.menuItems.length;
        const activeItems = this.menuItems.filter(item => item.available).length;
        
        const totalElement = document.getElementById('total-items');
        const activeElement = document.getElementById('active-items');
        
        if (totalElement) totalElement.textContent = totalItems;
        if (activeElement) activeElement.textContent = activeItems;
    }

    initializeComponents() {
        // Search functionality
        const searchInput = document.getElementById('menu-search-input');
        const searchClearBtn = document.getElementById('search-clear-btn');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.refreshMenuDisplay();
                
                if (searchClearBtn) {
                    searchClearBtn.style.display = this.searchQuery ? 'block' : 'none';
                }
            });
        }
        
        if (searchClearBtn) {
            searchClearBtn.addEventListener('click', () => {
                this.searchQuery = '';
                searchInput.value = '';
                searchClearBtn.style.display = 'none';
                this.refreshMenuDisplay();
            });
        }
        
        // Filter functionality
        const categoryFilter = document.getElementById('category-filter');
        const sortSelect = document.getElementById('sort-select');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filterCategory = e.target.value;
                this.refreshMenuDisplay();
            });
        }
        
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.refreshMenuDisplay();
            });
        }
        
        // Select all functionality
        const selectAllCheckbox = document.getElementById('select-all-checkbox');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                this.toggleSelectAll(e.target.checked);
            });
        }
        
        // Initialize checkbox listeners
        this.initializeCheckboxListeners();
    }

    initializeCheckboxListeners() {
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('item-checkbox')) {
                this.updateBulkActions();
            }
        });
    }

    getFilteredMenuItems() {
        let filtered = [...this.menuItems];
        
        // Apply search filter
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(query) ||
                (item.description || '').toLowerCase().includes(query) ||
                (item.tags || []).some(tag => tag.toLowerCase().includes(query))
            );
        }
        
        // Apply category filter
        if (this.filterCategory !== 'all') {
            filtered = filtered.filter(item => item.category === this.filterCategory);
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name, 'zh-TW');
                case 'price':
                    return b.price - a.price;
                case 'category':
                    return a.category.localeCompare(b.category, 'zh-TW');
                case 'popularity':
                    return (b.popularity || 0) - (a.popularity || 0);
                case 'created':
                    return new Date(b.created) - new Date(a.created);
                default:
                    return 0;
            }
        });
        
        return filtered;
    }

    refreshMenuDisplay() {
        const container = document.getElementById('menu-items-container');
        if (container) {
            container.innerHTML = this.getMenuItemsTemplate();
            this.initializeCheckboxListeners();
        }
    }

    setView(view) {
        this.currentView = view;
        this.refreshMenuDisplay();
        
        // Update view toggle buttons
        document.querySelectorAll('.view-toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[onclick="adminMenu.setView('${view}')"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    showAddForm() {
        this.selectedItem = null;
        this.showForm();
    }

    editItem(itemId) {
        this.selectedItem = this.menuItems.find(item => item.id === itemId);
        this.showForm();
    }

    showForm() {
        const formSection = document.getElementById('menu-form-section');
        const itemsContainer = document.getElementById('menu-items-container');
        
        if (formSection && itemsContainer) {
            formSection.innerHTML = this.getMenuFormTemplate();
            formSection.classList.remove('hidden');
            itemsContainer.style.display = 'none';
            
            // Initialize form handlers
            this.initializeFormHandlers();
            
            // Scroll to top
            formSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    hideForm() {
        const formSection = document.getElementById('menu-form-section');
        const itemsContainer = document.getElementById('menu-items-container');
        
        if (formSection && itemsContainer) {
            formSection.classList.add('hidden');
            itemsContainer.style.display = 'block';
            this.selectedItem = null;
        }
    }

    initializeFormHandlers() {
        const form = document.getElementById('menu-item-form');
        const imageInput = document.getElementById('image-input');
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        if (imageInput) {
            imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }
        
        // Initialize drag and drop for image upload
        this.initializeImageDragDrop();
    }

    initializeImageDragDrop() {
        const uploadArea = document.getElementById('image-upload-area');
        if (!uploadArea) return;
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                this.processImageFile(files[0]);
            }
        });
        
        uploadArea.addEventListener('click', () => {
            document.getElementById('image-input').click();
        });
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.processImageFile(file);
        }
    }

    processImageFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const uploadArea = document.getElementById('image-upload-area');
            const placeholder = uploadArea.querySelector('.upload-placeholder');
            
            placeholder.innerHTML = `<img src="${e.target.result}" alt="菜品圖片" class="preview-image" />`;
            placeholder.classList.add('has-image');
            
            // Update actions
            const actions = uploadArea.querySelector('.image-actions');
            actions.innerHTML = `
                <button type="button" class="image-btn rainbow-btn-secondary" onclick="document.getElementById('image-input').click()">
                    <i class="fas fa-upload"></i>
                    更換圖片
                </button>
                <button type="button" class="image-btn rainbow-btn-ghost" onclick="adminMenu.removeImage()">
                    <i class="fas fa-trash"></i>
                    移除圖片
                </button>
            `;
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        const uploadArea = document.getElementById('image-upload-area');
        const placeholder = uploadArea.querySelector('.upload-placeholder');
        const imageInput = document.getElementById('image-input');
        
        placeholder.innerHTML = `
            <div class="upload-icon">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>點擊或拖拽上傳圖片</p>
                <small>支援 JPG, PNG 格式，建議尺寸 400x300</small>
            </div>
        `;
        placeholder.classList.remove('has-image');
        
        const actions = uploadArea.querySelector('.image-actions');
        actions.innerHTML = `
            <button type="button" class="image-btn rainbow-btn-secondary" onclick="document.getElementById('image-input').click()">
                <i class="fas fa-upload"></i>
                選擇圖片
            </button>
        `;
        
        if (imageInput) {
            imageInput.value = '';
        }
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const menuItemData = {
            name: formData.get('name'),
            description: formData.get('description'),
            category: formData.get('category'),
            price: parseFloat(formData.get('price')),
            prepTime: parseInt(formData.get('prepTime')) || 15,
            spiceLevel: formData.get('spiceLevel'),
            tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : [],
            available: formData.get('available') === 'on',
            featured: formData.get('featured') === 'on',
            vegetarian: formData.get('vegetarian') === 'on'
        };
        
        // Validate form data
        if (!this.validateMenuItemData(menuItemData)) {
            return;
        }
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalContent = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 儲存中...';
            submitBtn.disabled = true;
            
            if (this.selectedItem) {
                // Update existing item
                await this.updateMenuItem(this.selectedItem.id, menuItemData);
                Toast.show('菜品更新成功', 'success');
            } else {
                // Create new item
                await this.createMenuItem(menuItemData);
                Toast.show('菜品新增成功', 'success');
            }
            
            // Reload menu items and hide form
            await this.loadMenuItems();
            this.hideForm();
            
        } catch (error) {
            console.error('Failed to save menu item:', error);
            Toast.show(error.message || '儲存失敗', 'error');
            
        } finally {
            submitBtn.innerHTML = originalContent;
            submitBtn.disabled = false;
        }
    }

    validateMenuItemData(data) {
        if (!data.name || data.name.trim().length < 2) {
            Toast.show('菜品名稱至少需要2個字符', 'error');
            return false;
        }
        
        if (!data.category) {
            Toast.show('請選擇菜品分類', 'error');
            return false;
        }
        
        if (!data.price || data.price <= 0) {
            Toast.show('請輸入有效的價格', 'error');
            return false;
        }
        
        return true;
    }

    async createMenuItem(data) {
        // Mock API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const newItem = {
                    ...data,
                    id: 'MENU' + String(Date.now()).substr(-6),
                    popularity: 0,
                    created: new Date().toISOString().split('T')[0]
                };
                
                this.menuItems.push(newItem);
                resolve(newItem);
            }, 1000);
        });
    }

    async updateMenuItem(itemId, data) {
        // Mock API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = this.menuItems.findIndex(item => item.id === itemId);
                if (index !== -1) {
                    this.menuItems[index] = { ...this.menuItems[index], ...data };
                    resolve(this.menuItems[index]);
                } else {
                    reject(new Error('菜品不存在'));
                }
            }, 1000);
        });
    }

    async toggleItemStatus(itemId) {
        try {
            const item = this.menuItems.find(item => item.id === itemId);
            if (item) {
                item.available = !item.available;
                await this.updateMenuItem(itemId, { available: item.available });
                
                Toast.show(`菜品已${item.available ? '上架' : '下架'}`, 'success');
                this.updateStats();
            }
        } catch (error) {
            Toast.show('狀態更新失敗', 'error');
        }
    }

    async deleteItem(itemId) {
        const confirmed = await Modal.confirm(
            '確認刪除菜品？',
            '此操作無法復原，確定要刪除這個菜品嗎？'
        );
        
        if (!confirmed) return;
        
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            this.menuItems = this.menuItems.filter(item => item.id !== itemId);
            this.refreshMenuDisplay();
            this.updateStats();
            
            Toast.show('菜品已刪除', 'success');
            
        } catch (error) {
            Toast.show('刪除失敗', 'error');
        }
    }

    async duplicateItem(itemId) {
        try {
            const original = this.menuItems.find(item => item.id === itemId);
            if (original) {
                const duplicate = {
                    ...original,
                    id: 'MENU' + String(Date.now()).substr(-6),
                    name: original.name + ' (副本)',
                    created: new Date().toISOString().split('T')[0],
                    popularity: 0
                };
                
                this.menuItems.push(duplicate);
                this.refreshMenuDisplay();
                this.updateStats();
                
                Toast.show('菜品已複製', 'success');
            }
        } catch (error) {
            Toast.show('複製失敗', 'error');
        }
    }

    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.item-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
        this.updateBulkActions();
    }

    updateBulkActions() {
        const checkedBoxes = document.querySelectorAll('.item-checkbox:checked');
        const bulkActionsBar = document.getElementById('bulk-actions-bar');
        const selectedCount = document.getElementById('selected-count');
        
        if (checkedBoxes.length > 0) {
            bulkActionsBar.classList.remove('hidden');
            if (selectedCount) {
                selectedCount.textContent = checkedBoxes.length;
            }
        } else {
            bulkActionsBar.classList.add('hidden');
        }
    }

    clearSelection() {
        const checkboxes = document.querySelectorAll('.item-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        const selectAllCheckbox = document.getElementById('select-all-checkbox');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
        }
        
        this.updateBulkActions();
    }

    async bulkToggleStatus() {
        const selectedIds = Array.from(document.querySelectorAll('.item-checkbox:checked'))
            .map(checkbox => checkbox.value);
        
        if (selectedIds.length === 0) return;
        
        try {
            // Toggle status for all selected items
            for (const itemId of selectedIds) {
                await this.toggleItemStatus(itemId);
            }
            
            this.refreshMenuDisplay();
            this.clearSelection();
            
        } catch (error) {
            Toast.show('批量操作失敗', 'error');
        }
    }

    async bulkUpdatePrice() {
        const selectedIds = Array.from(document.querySelectorAll('.item-checkbox:checked'))
            .map(checkbox => checkbox.value);
        
        if (selectedIds.length === 0) return;
        
        // Show price update modal
        const priceChange = await Modal.prompt(
            '批量調價',
            '請輸入調價幅度（%，正數為漲價，負數為降價）：',
            '0'
        );
        
        if (priceChange === null) return;
        
        const percentage = parseFloat(priceChange);
        if (isNaN(percentage)) {
            Toast.show('請輸入有效的百分比', 'error');
            return;
        }
        
        try {
            for (const itemId of selectedIds) {
                const item = this.menuItems.find(item => item.id === itemId);
                if (item) {
                    const newPrice = Math.round(item.price * (1 + percentage / 100));
                    await this.updateMenuItem(itemId, { price: newPrice });
                }
            }
            
            this.refreshMenuDisplay();
            this.clearSelection();
            Toast.show('批量調價完成', 'success');
            
        } catch (error) {
            Toast.show('批量調價失敗', 'error');
        }
    }

    async bulkDelete() {
        const selectedIds = Array.from(document.querySelectorAll('.item-checkbox:checked'))
            .map(checkbox => checkbox.value);
        
        if (selectedIds.length === 0) return;
        
        const confirmed = await Modal.confirm(
            '確認批量刪除？',
            `此操作將刪除 ${selectedIds.length} 個菜品，且無法復原。確定要繼續嗎？`
        );
        
        if (!confirmed) return;
        
        try {
            for (const itemId of selectedIds) {
                this.menuItems = this.menuItems.filter(item => item.id !== itemId);
            }
            
            this.refreshMenuDisplay();
            this.updateStats();
            this.clearSelection();
            
            Toast.show(`已刪除 ${selectedIds.length} 個菜品`, 'success');
            
        } catch (error) {
            Toast.show('批量刪除失敗', 'error');
        }
    }

    previewItem() {
        const form = document.getElementById('menu-item-form');
        const formData = new FormData(form);
        
        const previewData = {
            name: formData.get('name') || '菜品名稱',
            description: formData.get('description') || '菜品描述',
            category: formData.get('category') || '分類',
            price: parseFloat(formData.get('price')) || 0,
            available: formData.get('available') === 'on',
            featured: formData.get('featured') === 'on',
            vegetarian: formData.get('vegetarian') === 'on'
        };
        
        // Show preview modal
        Modal.show(
            '菜品預覽',
            this.getPreviewTemplate(previewData)
        );
    }

    getPreviewTemplate(item) {
        return `
        <div class="menu-item-preview">
            <div class="preview-image">
                <img src="${item.image || 'assets/images/placeholder.jpg'}" alt="${item.name}" />
                ${item.featured ? '<div class="featured-badge">推薦</div>' : ''}
                ${item.vegetarian ? '<div class="vegetarian-badge">素食</div>' : ''}
            </div>
            <div class="preview-content">
                <h3 class="preview-name">${item.name}</h3>
                <span class="preview-category">${item.category}</span>
                <p class="preview-description">${item.description}</p>
                <div class="preview-price">$${item.price}</div>
                <div class="preview-status ${item.available ? 'available' : 'unavailable'}">
                    ${item.available ? '供應中' : '暫停供應'}
                </div>
            </div>
        </div>
        `;
    }
}

// Initialize admin menu management
const adminMenu = new AdminMenuManagement();