// Menu Item Detail Page - Display detailed information about a menu item

class MenuItemDetailPage {
    constructor() {
        this.itemId = null;
        this.itemData = null;
        this.relatedItems = [];
    }

    getMenuItemDetailTemplate() {
        if (!this.itemData) {
            return this.getLoadingTemplate();
        }

        const categoryInfo = Helpers.getCategoryInfo(this.itemData.category);
        
        return `
        <div class="menu-item-detail-page">
            <!-- Item Hero Section -->
            <div class="item-hero">
                <div class="item-image-container">
                    <img src="${this.itemData.imageUrl || 'assets/images/placeholder.svg'}" 
                         alt="${this.itemData.name}"
                         class="item-main-image"
                         onerror="Helpers.handleImageError(this)">
                    
                    ${!this.itemData.available ? '<div class="unavailable-overlay">暫時缺貨</div>' : ''}
                    
                    <div class="item-badges">
                        <span class="category-badge" style="background: ${categoryInfo.color}">
                            ${categoryInfo.icon} ${categoryInfo.text}
                        </span>
                        ${this.itemData.vegetarian ? '<span class="vegetarian-badge">🌱 素食</span>' : ''}
                        ${this.itemData.spicyLevel ? `<span class="spicy-badge">🌶️ ${this.getSpicyLevelText(this.itemData.spicyLevel)}</span>` : ''}
                    </div>
                </div>

                <div class="item-info">
                    <div class="item-header">
                        <h1 class="item-name">${this.itemData.name}</h1>
                        <div class="item-price">${Helpers.formatCurrency(this.itemData.price)}</div>
                    </div>

                    <div class="item-meta">
                        <div class="meta-item">
                            <i class="fas fa-clock"></i>
                            <span>製作時間：${this.itemData.preparationTime}分鐘</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-users"></i>
                            <span>建議人數：${this.itemData.servingSize || 1}人份</span>
                        </div>
                        ${this.itemData.calories ? `
                        <div class="meta-item">
                            <i class="fas fa-fire"></i>
                            <span>熱量：${this.itemData.calories} 大卡</span>
                        </div>
                        ` : ''}
                    </div>

                    <div class="item-description">
                        <h3>菜品介紹</h3>
                        <p>${this.itemData.description || '暫無詳細介紹'}</p>
                    </div>

                    ${this.itemData.ingredients && this.itemData.ingredients.length > 0 ? `
                    <div class="item-ingredients">
                        <h3>主要食材</h3>
                        <div class="ingredients-list">
                            ${this.itemData.ingredients.map(ingredient => 
                                `<span class="ingredient-tag">${ingredient}</span>`
                            ).join('')}
                        </div>
                    </div>
                    ` : ''}

                    ${this.itemData.allergens && this.itemData.allergens.length > 0 ? `
                    <div class="item-allergens">
                        <h3>過敏原提醒</h3>
                        <div class="allergens-list">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>含有：${this.itemData.allergens.join('、')}</span>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>

            <!-- Nutritional Information -->
            ${this.itemData.nutritionalInfo ? `
            <div class="nutrition-section">
                <h3>營養資訊</h3>
                <div class="nutrition-grid">
                    ${Object.entries(this.itemData.nutritionalInfo).map(([key, value]) => `
                        <div class="nutrition-item">
                            <span class="nutrition-label">${this.getNutritionLabel(key)}</span>
                            <span class="nutrition-value">${value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Customization Options -->
            ${this.itemData.customizations && this.itemData.customizations.length > 0 ? `
            <div class="customization-section">
                <h3>客製化選項</h3>
                <div class="customization-options">
                    ${this.itemData.customizations.map(option => `
                        <div class="customization-option">
                            <label>
                                <input type="checkbox" name="customization" value="${option.id}">
                                <span class="option-name">${option.name}</span>
                                ${option.price ? `<span class="option-price">+${Helpers.formatCurrency(option.price)}</span>` : ''}
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Reviews Section -->
            ${this.itemData.reviews && this.itemData.reviews.length > 0 ? `
            <div class="reviews-section">
                <h3>顧客評價</h3>
                <div class="reviews-summary">
                    <div class="rating-display">
                        <span class="rating-score">${this.itemData.averageRating || 0}</span>
                        <div class="rating-stars">${this.generateStars(this.itemData.averageRating || 0)}</div>
                        <span class="rating-count">(${this.itemData.reviews.length} 則評價)</span>
                    </div>
                </div>
                <div class="reviews-list">
                    ${this.itemData.reviews.slice(0, 3).map(review => `
                        <div class="review-item">
                            <div class="review-header">
                                <span class="reviewer-name">${review.userName}</span>
                                <div class="review-stars">${this.generateStars(review.rating)}</div>
                                <span class="review-date">${Helpers.getTimeAgo(review.createdAt)}</span>
                            </div>
                            <p class="review-comment">${review.comment}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Related Items -->
            ${this.relatedItems.length > 0 ? `
            <div class="related-items-section">
                <h3>推薦搭配</h3>
                <div class="related-items-grid">
                    ${this.relatedItems.map(item => `
                        <div class="related-item-card" onclick="menuItemDetailPage.viewItem('${item.itemId}')">
                            <img src="${item.imageUrl || 'assets/images/placeholder.svg'}" alt="${item.name}">
                            <div class="related-item-info">
                                <h4>${item.name}</h4>
                                <span class="related-item-price">${Helpers.formatCurrency(item.price)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Action Buttons -->
            <div class="item-actions">
                <div class="quantity-selector">
                    <button class="quantity-btn" onclick="menuItemDetailPage.decreaseQuantity()">-</button>
                    <span class="quantity-display" id="item-quantity">1</span>
                    <button class="quantity-btn" onclick="menuItemDetailPage.increaseQuantity()">+</button>
                </div>
                <button class="add-to-cart-btn ${!this.itemData.available ? 'disabled' : ''}" 
                        onclick="menuItemDetailPage.addToCart()"
                        ${!this.itemData.available ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i>
                    ${!this.itemData.available ? '暫時缺貨' : `加入購物車 - ${Helpers.formatCurrency(this.itemData.price)}`}
                </button>
            </div>
        </div>`;
    }

    getLoadingTemplate() {
        return `
        <div class="menu-item-detail-page">
            <div class="item-detail-skeleton">
                <div class="skeleton-image"></div>
                <div class="skeleton-content">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-price"></div>
                </div>
            </div>
        </div>`;
    }

    getNotFoundTemplate() {
        return `
        <div class="menu-item-detail-page">
            <div class="item-not-found">
                <div class="not-found-icon">
                    <i class="fas fa-utensils"></i>
                    <div class="icon-overlay">
                        <i class="fas fa-question-circle"></i>
                    </div>
                </div>
                <h1>找不到此菜品</h1>
                <p>抱歉，您要查看的菜品可能已經下架或不存在。</p>
                <div class="not-found-actions">
                    <button class="btn btn-primary" onclick="app.navigateTo('menu')">
                        <i class="fas fa-utensils"></i>
                        瀏覽全部菜單
                    </button>
                    <button class="btn btn-outline" onclick="app.goBack()">
                        <i class="fas fa-arrow-left"></i>
                        返回上一頁
                    </button>
                </div>
            </div>
        </div>`;
    }

    async initializeMenuItemDetailPage(pageWithParams = null) {
        try {
            let pageParam = pageWithParams || app.currentPage;
            
            // Get item ID from page parameter or URL hash
            let queryString = '';
            
            if (pageParam && pageParam.includes('?')) {
                // From app.js page parameter: "menu-item?id=xxx"
                queryString = pageParam.split('?')[1];
            } else {
                // Fallback: try to get from URL hash
                const hash = window.location.hash.substring(1); // Remove #
                queryString = hash.includes('?') ? hash.split('?')[1] : '';
            }
            
            const urlParams = new URLSearchParams(queryString);
            this.itemId = urlParams.get('id');
            
            console.log('Menu Item Detail - Page Param:', pageParam);
            console.log('Menu Item Detail - Query String:', queryString);
            console.log('Menu Item Detail - Item ID:', this.itemId);
            
            if (!this.itemId) {
                this.showNotFound('菜品ID不存在');
                return;
            }

            // Load item data
            await this.loadItemData();
            
            // Load related items
            await this.loadRelatedItems();
            
        } catch (error) {
            console.error('Failed to initialize menu item detail page:', error);
            this.showNotFound('載入菜品詳情時發生錯誤');
        }
    }

    async loadItemData() {
        try {
            // Try to get from menu items first (faster)
            let menuItems = [];
            
            // Check if menuPage has loaded items
            if (menuPage.menuItems && menuPage.menuItems.length > 0) {
                menuItems = menuPage.menuItems;
            } else {
                // Load from API if not available
                menuItems = await api.getMenuItems();
            }
            
            console.log('Menu Item Detail - Available items:', menuItems.length);
            console.log('Menu Item Detail - Looking for ID:', this.itemId);
            
            this.itemData = menuItems.find(item => {
                console.log('Comparing:', item.itemId, 'with', this.itemId);
                return item.itemId === this.itemId;
            });
            
            if (!this.itemData) {
                console.error('Item not found in menu items:', menuItems.map(item => item.itemId));
                this.showNotFound('找不到此菜品，可能已經下架或不存在');
                return;
            }

            console.log('Menu Item Detail - Found item:', this.itemData);

            // Re-render with loaded data
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.innerHTML = this.getMenuItemDetailTemplate();
            }
            
        } catch (error) {
            console.error('Failed to load item data:', error);
            throw error;
        }
    }

    async loadRelatedItems() {
        try {
            if (!this.itemData) return;
            
            const allItems = menuPage.menuItems || await api.getMenuItems();
            
            // Get items from same category, excluding current item
            this.relatedItems = allItems
                .filter(item => 
                    item.category === this.itemData.category && 
                    item.itemId !== this.itemId &&
                    item.available
                )
                .slice(0, 4);
                
        } catch (error) {
            console.error('Failed to load related items:', error);
            this.relatedItems = [];
        }
    }

    generateStars(rating) {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < fullStars; i++) {
            stars.push('<i class="fas fa-star"></i>');
        }
        
        if (hasHalfStar) {
            stars.push('<i class="fas fa-star-half-alt"></i>');
        }
        
        const remainingStars = 5 - Math.ceil(rating);
        for (let i = 0; i < remainingStars; i++) {
            stars.push('<i class="far fa-star"></i>');
        }
        
        return stars.join('');
    }

    getSpicyLevelText(level) {
        const levels = {
            'mild': '微辣',
            'medium': '中辣',
            'hot': '重辣',
            'extra-hot': '特辣'
        };
        return levels[level] || level;
    }

    getNutritionLabel(key) {
        const labels = {
            'calories': '熱量',
            'protein': '蛋白質',
            'fat': '脂肪',
            'carbs': '碳水化合物',
            'fiber': '纖維',
            'sugar': '糖分',
            'sodium': '鈉'
        };
        return labels[key] || key;
    }

    // Action methods
    increaseQuantity() {
        const display = document.getElementById('item-quantity');
        if (display) {
            const current = parseInt(display.textContent);
            display.textContent = Math.min(current + 1, 99);
            this.updateCartButtonPrice();
        }
    }

    decreaseQuantity() {
        const display = document.getElementById('item-quantity');
        if (display) {
            const current = parseInt(display.textContent);
            display.textContent = Math.max(current - 1, 1);
            this.updateCartButtonPrice();
        }
    }

    updateCartButtonPrice() {
        const display = document.getElementById('item-quantity');
        const button = document.querySelector('.add-to-cart-btn');
        
        if (display && button && this.itemData && this.itemData.available) {
            const quantity = parseInt(display.textContent);
            const totalPrice = this.itemData.price * quantity;
            button.innerHTML = `
                <i class="fas fa-shopping-cart"></i>
                加入購物車 - ${Helpers.formatCurrency(totalPrice)}
            `;
        }
    }

    async addToCart() {
        try {
            if (!this.itemData || !this.itemData.available) {
                app.showToast('此菜品暫時缺貨', 'warning');
                return;
            }

            const quantityDisplay = document.getElementById('item-quantity');
            const quantity = quantityDisplay ? parseInt(quantityDisplay.textContent) : 1;

            // Get customizations
            const customizations = Array.from(
                document.querySelectorAll('input[name="customization"]:checked')
            ).map(checkbox => checkbox.value);

            // Add to cart with quantity
            for (let i = 0; i < quantity; i++) {
                cart.addItem(this.itemData, customizations);
            }

            app.showToast(`已將 ${this.itemData.name} x${quantity} 加入購物車`, 'success');
            
        } catch (error) {
            console.error('Failed to add to cart:', error);
            app.showToast('加入購物車失敗', 'error');
        }
    }

    showNotFound(message) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = this.getNotFoundTemplate();
        }
        
        // Optional: Show toast message
        if (message) {
            app.showToast(message, 'warning');
        }
    }

    viewItem(itemId) {
        app.navigateTo(`menu-item?id=${itemId}`);
    }
}

// Create global instance
window.menuItemDetailPage = new MenuItemDetailPage();