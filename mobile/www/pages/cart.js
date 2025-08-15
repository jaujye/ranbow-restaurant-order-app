// Cart Page - Shopping cart management

class CartPage {
    constructor() {
        this.cartItems = [];
        this.isProcessing = false;
        this.tableNumber = null;
    }

    getCartPageTemplate() {
        return `
        <div class="cart-page">
            <!-- Cart Header -->
            <div class="cart-header">
                <div class="cart-title-section">
                    <h2>購物車</h2>
                    <span class="cart-count" id="cart-item-count">0 件商品</span>
                </div>
                <button class="clear-cart-btn" id="clear-cart-btn" onclick="cartPage.clearCart()">
                    <i class="fas fa-trash"></i>
                    清空
                </button>
            </div>

            <!-- Cart Content -->
            <div class="cart-content">
                <!-- Cart Items Container -->
                <div class="cart-items-container" id="cart-items-container">
                    <!-- Items will be loaded dynamically -->
                </div>

                <!-- Cart Summary -->
                <div class="cart-summary" id="cart-summary">
                    <div class="summary-row">
                        <span>小計</span>
                        <span data-cart-subtotal>NT$ 0</span>
                    </div>
                    <div class="summary-row">
                        <span>稅金 (10%)</span>
                        <span data-cart-tax>NT$ 0</span>
                    </div>
                    <div class="summary-row total-row">
                        <span>總計</span>
                        <span data-cart-total>NT$ 0</span>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="cart-actions">
                    <button class="btn btn-outline" onclick="cartPage.continueShopping()">
                        <i class="fas fa-arrow-left"></i>
                        繼續購物
                    </button>
                    <button class="btn btn-primary" id="checkout-btn" onclick="cartPage.proceedToCheckout()">
                        <i class="fas fa-credit-card"></i>
                        去結帳
                    </button>
                </div>
            </div>

            <!-- Table Selection Modal -->
            <div class="modal-overlay hidden" id="table-selection-modal">
                <div class="table-selection-modal">
                    <div class="modal-header">
                        <h3>選擇桌號</h3>
                        <button class="modal-close" onclick="cartPage.hideTableSelection()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        <div class="table-grid" id="table-grid">
                            <!-- Table numbers will be generated -->
                        </div>
                        
                        <div class="table-input-section">
                            <div class="input-group">
                                <label for="table-number-input">或手動輸入桌號:</label>
                                <input type="number" id="table-number-input" placeholder="請輸入桌號" min="1" max="99">
                            </div>
                            
                            <div class="qr-scanner-section">
                                <p>掃描桌上QR Code:</p>
                                <button class="btn btn-outline" onclick="cartPage.scanQRCode()">
                                    <i class="fas fa-qrcode"></i>
                                    掃描QR Code
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="cartPage.hideTableSelection()">取消</button>
                        <button class="btn btn-primary" onclick="cartPage.confirmTableSelection()">確認</button>
                    </div>
                </div>
            </div>

            <!-- Special Requests Modal -->
            <div class="modal-overlay hidden" id="special-requests-modal">
                <div class="special-requests-modal">
                    <div class="modal-header">
                        <h3>修改備註</h3>
                        <button class="modal-close" onclick="cartPage.hideSpecialRequestsModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        <div class="current-item-info" id="current-item-info">
                            <!-- Current item details -->
                        </div>
                        
                        <div class="input-group">
                            <label for="special-requests-input">特殊要求:</label>
                            <textarea id="special-requests-input" placeholder="請輸入特殊要求..." rows="3"></textarea>
                        </div>
                        
                        <div class="common-requests">
                            <p>常見要求:</p>
                            <div class="request-tags">
                                <button class="request-tag" onclick="cartPage.addCommonRequest('不要洋蔥')">不要洋蔥</button>
                                <button class="request-tag" onclick="cartPage.addCommonRequest('少辣')">少辣</button>
                                <button class="request-tag" onclick="cartPage.addCommonRequest('加飯')">加飯</button>
                                <button class="request-tag" onclick="cartPage.addCommonRequest('打包')">打包</button>
                                <button class="request-tag" onclick="cartPage.addCommonRequest('不加香菜')">不加香菜</button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="cartPage.hideSpecialRequestsModal()">取消</button>
                        <button class="btn btn-primary" onclick="cartPage.saveSpecialRequests()">確定</button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    async initializeCartPage() {
        try {
            this.cartItems = cart.getItems();
            this.tableNumber = Storage.getTableNumber();
            
            this.updateCartDisplay();
            this.setupEventListeners();
            this.generateTableGrid();
            
            // Listen for cart updates
            cart.on('cartUpdated', () => {
                this.cartItems = cart.getItems();
                this.updateCartDisplay();
            });
            
        } catch (error) {
            console.error('Failed to initialize cart page:', error);
            toast.error('載入購物車時發生錯誤');
        }
    }

    setupEventListeners() {
        // Table number input
        const tableInput = document.getElementById('table-number-input');
        if (tableInput) {
            tableInput.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                if (value > 0) {
                    this.selectTable(value);
                }
            });
        }

        // Special requests input
        const requestsInput = document.getElementById('special-requests-input');
        if (requestsInput) {
            requestsInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.saveSpecialRequests();
                }
            });
        }
    }

    updateCartDisplay() {
        const container = document.getElementById('cart-items-container');
        const countElement = document.getElementById('cart-item-count');
        const checkoutBtn = document.getElementById('checkout-btn');
        const clearBtn = document.getElementById('clear-cart-btn');
        
        if (!container) return;

        // Update item count
        const itemCount = this.cartItems.reduce((count, item) => count + item.quantity, 0);
        if (countElement) {
            countElement.textContent = `${itemCount} 件商品`;
        }

        // Show/hide buttons based on cart content
        if (checkoutBtn) {
            checkoutBtn.disabled = this.cartItems.length === 0;
        }
        if (clearBtn) {
            clearBtn.style.display = this.cartItems.length === 0 ? 'none' : 'block';
        }

        if (this.cartItems.length === 0) {
            this.showEmptyCart(container);
        } else {
            this.renderCartItems(container);
        }

        this.updateCartSummary();
    }

    showEmptyCart(container) {
        container.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <h3>購物車空空</h3>
                <p>還沒有選擇菜品呢<br>快去挑選美食吧！</p>
                <button class="btn btn-primary" onclick="cartPage.continueShopping()">
                    <i class="fas fa-utensils"></i>
                    去選購菜品
                </button>
            </div>
        `;
    }

    renderCartItems(container) {
        const html = this.cartItems.map(item => this.renderCartItem(item)).join('');
        container.innerHTML = html;
    }

    renderCartItem(item) {
        const itemTotal = item.price * item.quantity;
        
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
                    
                    ${item.description ? `<p class="cart-item-description">${Helpers.truncate(item.description, 80)}</p>` : ''}
                    
                    ${item.specialRequests ? `
                        <div class="cart-item-requests">
                            <i class="fas fa-comment"></i>
                            <span>備註: ${item.specialRequests}</span>
                            <button class="edit-requests-btn" onclick="cartPage.editSpecialRequests('${item.id}', '${item.specialRequests || ''}')">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    ` : `
                        <div class="cart-item-requests">
                            <button class="add-requests-btn" onclick="cartPage.editSpecialRequests('${item.id}', '')">
                                <i class="fas fa-plus"></i>
                                新增備註
                            </button>
                        </div>
                    `}
                    
                    <div class="cart-item-footer">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="cartPage.decrementItem('${item.id}', '${item.specialRequests || ''}')">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn" onclick="cartPage.incrementItem('${item.id}', '${item.specialRequests || ''}')">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        
                        <div class="item-total">
                            <span>小計: ${Helpers.formatCurrency(itemTotal)}</span>
                        </div>
                        
                        <button class="remove-item-btn" onclick="cartPage.removeItem('${item.id}', '${item.specialRequests || ''}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    updateCartSummary() {
        const summary = cart.getSummary();
        
        const subtotalEl = document.querySelector('[data-cart-subtotal]');
        const taxEl = document.querySelector('[data-cart-tax]');
        const totalEl = document.querySelector('[data-cart-total]');
        
        if (subtotalEl) subtotalEl.textContent = Helpers.formatCurrency(summary.subtotal);
        if (taxEl) taxEl.textContent = Helpers.formatCurrency(summary.tax);
        if (totalEl) totalEl.textContent = Helpers.formatCurrency(summary.total);
    }

    // Cart actions
    incrementItem(itemId, specialRequests = '') {
        cart.incrementItem(itemId, specialRequests || null);
    }

    decrementItem(itemId, specialRequests = '') {
        cart.decrementItem(itemId, specialRequests || null);
    }

    removeItem(itemId, specialRequests = '') {
        modal.confirm('確定要移除此商品嗎？').then(confirmed => {
            if (confirmed) {
                cart.removeItem(itemId, specialRequests || null);
                toast.success('商品已移除');
            }
        });
    }

    async clearCart() {
        const confirmed = await modal.confirm('確定要清空購物車嗎？');
        if (confirmed) {
            cart.clear();
            toast.success('購物車已清空');
        }
    }

    continueShopping() {
        app.navigateTo('menu');
    }

    // Checkout process
    async proceedToCheckout() {
        if (this.cartItems.length === 0) {
            toast.warning('購物車是空的');
            return;
        }

        // Check if table number is selected
        if (!this.tableNumber) {
            this.showTableSelection();
            return;
        }

        // Validate cart
        const validation = cart.validate();
        if (!validation.valid) {
            toast.error(validation.errors[0]);
            return;
        }

        // Navigate to checkout
        app.navigateTo('checkout');
    }

    // Table selection
    showTableSelection() {
        const modal = document.getElementById('table-selection-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    hideTableSelection() {
        const modal = document.getElementById('table-selection-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    generateTableGrid() {
        const grid = document.getElementById('table-grid');
        if (!grid) return;

        let html = '';
        for (let i = 1; i <= 20; i++) {
            const isSelected = this.tableNumber === i;
            html += `
                <button class="table-number ${isSelected ? 'selected' : ''}" 
                        onclick="cartPage.selectTable(${i})">
                    ${i}
                </button>
            `;
        }
        grid.innerHTML = html;
    }

    selectTable(tableNumber) {
        // Update UI
        const buttons = document.querySelectorAll('.table-number');
        buttons.forEach(btn => {
            btn.classList.toggle('selected', parseInt(btn.textContent) === tableNumber);
        });

        // Update input
        const input = document.getElementById('table-number-input');
        if (input) {
            input.value = tableNumber;
        }

        this.tableNumber = tableNumber;
    }

    confirmTableSelection() {
        if (!this.tableNumber) {
            toast.warning('請選擇桌號');
            return;
        }

        Storage.setTableNumber(this.tableNumber);
        this.hideTableSelection();
        toast.success(`已選擇桌號 ${this.tableNumber}`);
        
        // Continue to checkout
        this.proceedToCheckout();
    }

    async scanQRCode() {
        try {
            // This would integrate with a QR code scanner
            toast.info('QR Code 掃描功能開發中...');
            
            // Mock QR code scan result
            // const scannedData = await QRCodeScanner.scan();
            // const tableNumber = this.parseTableFromQR(scannedData);
            // this.selectTable(tableNumber);
            
        } catch (error) {
            console.error('QR Code scan failed:', error);
            toast.error('掃描失敗，請手動選擇桌號');
        }
    }

    // Special requests modal
    editSpecialRequests(itemId, currentRequests = '') {
        this.currentEditingItem = { id: itemId, requests: currentRequests };
        
        const modal = document.getElementById('special-requests-modal');
        const input = document.getElementById('special-requests-input');
        const itemInfo = document.getElementById('current-item-info');
        
        if (!modal || !input || !itemInfo) return;

        // Find the item
        const item = this.cartItems.find(i => i.id === itemId);
        if (!item) return;

        // Update item info
        itemInfo.innerHTML = `
            <div class="editing-item">
                <img src="${item.imageUrl || 'assets/images/placeholder.svg'}" alt="${item.name}">
                <div>
                    <h4>${item.name}</h4>
                    <p>${Helpers.formatCurrency(item.price)}</p>
                </div>
            </div>
        `;

        // Set current requests
        input.value = currentRequests;

        // Show modal
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Focus input
        setTimeout(() => input.focus(), 100);
    }

    hideSpecialRequestsModal() {
        const modal = document.getElementById('special-requests-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
        this.currentEditingItem = null;
    }

    addCommonRequest(request) {
        const input = document.getElementById('special-requests-input');
        if (input) {
            const current = input.value.trim();
            if (current && !current.includes(request)) {
                input.value = current + ', ' + request;
            } else if (!current) {
                input.value = request;
            }
        }
    }

    saveSpecialRequests() {
        if (!this.currentEditingItem) return;

        const input = document.getElementById('special-requests-input');
        const newRequests = input ? input.value.trim() : '';

        // Update cart item
        const oldRequests = this.currentEditingItem.requests;
        cart.updateSpecialRequests(this.currentEditingItem.id, oldRequests, newRequests);

        this.hideSpecialRequestsModal();
        toast.success('備註已更新');
    }
}

// Create global cart page instance
window.cartPage = new CartPage();