// Shopping cart component

class CartManager {
    constructor() {
        this.items = Storage.getCart();
        this.eventEmitter = Helpers.createEventEmitter();
        this.init();
    }

    init() {
        // Update UI on initialization
        this.updateCartBadges();
        
        // Listen for storage changes from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'cart') {
                this.items = Storage.getCart();
                this.updateCartBadges();
                this.eventEmitter.emit('cartUpdated', this.items);
            }
        });
    }

    // Add item to cart
    addItem(item, quantity = 1, specialRequests = '') {
        const cartItem = {
            ...item,
            id: item.itemId || item.id,
            quantity: quantity,
            specialRequests: specialRequests,
            addedAt: new Date().toISOString()
        };

        // Check if item already exists
        const existingIndex = this.items.findIndex(i => 
            i.id === cartItem.id && i.specialRequests === cartItem.specialRequests
        );

        if (existingIndex !== -1) {
            // Update existing item quantity
            this.items[existingIndex].quantity += quantity;
        } else {
            // Add new item
            this.items.push(cartItem);
        }

        this.saveCart();
        return cartItem;
    }

    // Remove item from cart
    removeItem(itemId, specialRequests = null) {
        if (specialRequests !== null) {
            // Remove specific item variant
            this.items = this.items.filter(item => 
                !(item.id === itemId && item.specialRequests === specialRequests)
            );
        } else {
            // Remove all variants of this item
            this.items = this.items.filter(item => item.id !== itemId);
        }

        this.saveCart();
    }

    // Update item quantity
    updateQuantity(itemId, quantity, specialRequests = null) {
        const index = this.items.findIndex(item => {
            if (specialRequests !== null) {
                return item.id === itemId && item.specialRequests === specialRequests;
            }
            return item.id === itemId;
        });

        if (index !== -1) {
            if (quantity <= 0) {
                this.items.splice(index, 1);
            } else {
                this.items[index].quantity = quantity;
            }
            this.saveCart();
        }
    }

    // Update item special requests
    updateSpecialRequests(itemId, oldRequests, newRequests) {
        const index = this.items.findIndex(item => 
            item.id === itemId && item.specialRequests === oldRequests
        );

        if (index !== -1) {
            this.items[index].specialRequests = newRequests;
            this.saveCart();
        }
    }

    // Clear entire cart
    clear() {
        this.items = [];
        this.saveCart();
    }

    // Get cart items
    getItems() {
        return [...this.items];
    }

    // Get item count
    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    // Get cart total
    getTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Get cart summary with tax
    getSummary(taxRate = 0.1) {
        const subtotal = this.getTotal();
        const tax = Math.round(subtotal * taxRate);
        const total = subtotal + tax;

        return {
            items: this.items.length,
            quantity: this.getItemCount(),
            subtotal,
            tax,
            total
        };
    }

    // Check if item is in cart
    hasItem(itemId, specialRequests = null) {
        return this.items.some(item => {
            if (specialRequests !== null) {
                return item.id === itemId && item.specialRequests === specialRequests;
            }
            return item.id === itemId;
        });
    }

    // Get specific item from cart
    getItem(itemId, specialRequests = null) {
        return this.items.find(item => {
            if (specialRequests !== null) {
                return item.id === itemId && item.specialRequests === specialRequests;
            }
            return item.id === itemId;
        });
    }

    // Validate cart before checkout
    validate() {
        const errors = [];

        if (this.items.length === 0) {
            errors.push('購物車是空的');
        }

        // Check for invalid items
        this.items.forEach((item, index) => {
            if (!item.id || !item.name) {
                errors.push(`第 ${index + 1} 個商品資訊不完整`);
            }
            if (item.quantity <= 0) {
                errors.push(`${item.name} 數量無效`);
            }
            if (typeof item.price !== 'number' || item.price <= 0) {
                errors.push(`${item.name} 價格無效`);
            }
        });

        return {
            valid: errors.length === 0,
            errors
        };
    }

    // Convert cart to order format
    toOrderFormat(customerId, tableNumber) {
        const orderItems = this.items.map(item => ({
            menuItemId: item.id,
            quantity: item.quantity,
            specialRequests: item.specialRequests || '',
            price: item.price
        }));

        return {
            customerId,
            tableNumber,
            items: orderItems,
            totalAmount: this.getTotal()
        };
    }

    // Save cart to localStorage
    saveCart() {
        Storage.setCart(this.items);
        this.updateCartBadges();
        this.eventEmitter.emit('cartUpdated', this.items);
    }

    // Update cart badges in UI
    updateCartBadges() {
        const count = this.getItemCount();
        
        // Update main cart badge
        const mainBadge = document.querySelector('.cart-badge');
        if (mainBadge) {
            if (count > 0) {
                mainBadge.textContent = count;
                mainBadge.classList.remove('hidden');
            } else {
                mainBadge.classList.add('hidden');
            }
        }

        // Update floating cart button
        const floatingBadge = document.getElementById('floating-cart-count');
        const floatingBtn = document.getElementById('floating-cart-btn');
        if (floatingBadge && floatingBtn) {
            floatingBadge.textContent = count;
            floatingBtn.classList.toggle('has-items', count > 0);
        }

        // Update any other cart displays
        document.querySelectorAll('[data-cart-count]').forEach(element => {
            element.textContent = count;
        });

        document.querySelectorAll('[data-cart-total]').forEach(element => {
            element.textContent = Helpers.formatCurrency(this.getTotal());
        });
    }

    // Event handling
    on(event, callback) {
        this.eventEmitter.on(event, callback);
    }

    off(event, callback) {
        this.eventEmitter.off(event, callback);
    }

    emit(event, data) {
        this.eventEmitter.emit(event, data);
    }

    // Quick actions for UI
    incrementItem(itemId, specialRequests = null) {
        const item = this.getItem(itemId, specialRequests);
        if (item) {
            this.updateQuantity(itemId, item.quantity + 1, specialRequests);
        }
    }

    decrementItem(itemId, specialRequests = null) {
        const item = this.getItem(itemId, specialRequests);
        if (item) {
            this.updateQuantity(itemId, Math.max(0, item.quantity - 1), specialRequests);
        }
    }

    // Restore cart from saved order (for reordering)
    restoreFromOrder(orderItems) {
        this.clear();
        
        orderItems.forEach(orderItem => {
            // Assume orderItem has the necessary menu item details
            this.addItem({
                id: orderItem.menuItemId,
                name: orderItem.name,
                price: orderItem.price,
                imageUrl: orderItem.imageUrl,
                description: orderItem.description
            }, orderItem.quantity, orderItem.specialRequests);
        });
    }

    // Get similar items suggestions
    getSimilarItems(currentItemId) {
        // This could be enhanced with actual recommendation logic
        const currentItem = this.getItem(currentItemId);
        if (!currentItem) return [];

        // For now, return items from the same category
        return this.items.filter(item => 
            item.id !== currentItemId && 
            item.category === currentItem.category
        );
    }

    // Export cart for sharing or backup
    export() {
        return {
            items: this.items,
            timestamp: new Date().toISOString(),
            summary: this.getSummary()
        };
    }

    // Import cart from exported data
    import(cartData) {
        if (cartData && Array.isArray(cartData.items)) {
            this.items = cartData.items;
            this.saveCart();
            return true;
        }
        return false;
    }
}

// Create global cart manager
window.cart = new CartManager();

// Helper functions for cart UI
window.CartUI = {
    // Render cart item HTML
    renderCartItem(item) {
        return `
            <div class="cart-item" data-item-id="${item.id}" data-special-requests="${item.specialRequests || ''}">
                <div class="cart-item-image">
                    <img src="${item.imageUrl || 'assets/images/placeholder.svg'}" 
                         alt="${item.name}"
                         onerror="Helpers.handleImageError(this)">
                </div>
                <div class="cart-item-content">
                    <div class="cart-item-header">
                        <h4 class="cart-item-name">${item.name}</h4>
                        <span class="cart-item-price">${Helpers.formatCurrency(item.price)}</span>
                    </div>
                    ${item.specialRequests ? `<p class="cart-item-requests">備註: ${item.specialRequests}</p>` : ''}
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="CartUI.decrementItem('${item.id}', '${item.specialRequests || ''}')">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn" onclick="CartUI.incrementItem('${item.id}', '${item.specialRequests || ''}')">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <button class="remove-btn" onclick="CartUI.removeItem('${item.id}', '${item.specialRequests || ''}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // UI action handlers
    incrementItem(itemId, specialRequests = '') {
        cart.incrementItem(itemId, specialRequests || null);
    },

    decrementItem(itemId, specialRequests = '') {
        cart.decrementItem(itemId, specialRequests || null);
    },

    removeItem(itemId, specialRequests = '') {
        cart.removeItem(itemId, specialRequests || null);
    },

    // Show add to cart animation
    showAddAnimation(buttonElement) {
        if (!buttonElement) return;

        const originalText = buttonElement.innerHTML;
        buttonElement.innerHTML = '<i class="fas fa-check"></i> 已加入';
        buttonElement.classList.add('added');

        setTimeout(() => {
            buttonElement.innerHTML = originalText;
            buttonElement.classList.remove('added');
        }, 1500);
    },

    // Update cart display
    updateCartDisplay() {
        const cartContainer = document.querySelector('.cart-items-container');
        if (!cartContainer) return;

        const items = cart.getItems();
        
        if (items.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <h3>購物車空空</h3>
                    <p>還沒有選擇菜品呢<br>快去挑選美食吧！</p>
                    <button class="btn btn-primary" onclick="app.navigateTo('menu')">
                        去選購菜品
                    </button>
                </div>
            `;
        } else {
            cartContainer.innerHTML = items.map(item => this.renderCartItem(item)).join('');
        }

        // Update summary
        this.updateCartSummary();
    },

    // Update cart summary
    updateCartSummary() {
        const summary = cart.getSummary();
        
        const subtotalEl = document.querySelector('[data-cart-subtotal]');
        const taxEl = document.querySelector('[data-cart-tax]');
        const totalEl = document.querySelector('[data-cart-total]');
        
        if (subtotalEl) subtotalEl.textContent = Helpers.formatCurrency(summary.subtotal);
        if (taxEl) taxEl.textContent = Helpers.formatCurrency(summary.tax);
        if (totalEl) totalEl.textContent = Helpers.formatCurrency(summary.total);
    }
};

// Listen for cart updates to refresh UI
cart.on('cartUpdated', () => {
    if (typeof CartUI !== 'undefined') {
        CartUI.updateCartDisplay();
    }
});