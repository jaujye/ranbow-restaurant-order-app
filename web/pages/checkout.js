// Checkout Page - Order confirmation and payment

class CheckoutPage {
    constructor() {
        this.cartItems = [];
        this.tableNumber = null;
        this.selectedPaymentMethod = null;
        this.isProcessing = false;
        this.currentUser = null;
    }

    getCheckoutPageTemplate() {
        return `
        <div class="checkout-page">
            <!-- Checkout Header -->
            <div class="checkout-header">
                <h2>確認訂單</h2>
                <div class="checkout-progress">
                    <div class="progress-step active">
                        <i class="fas fa-shopping-cart"></i>
                        <span>確認商品</span>
                    </div>
                    <div class="progress-step">
                        <i class="fas fa-credit-card"></i>
                        <span>選擇付款</span>
                    </div>
                    <div class="progress-step">
                        <i class="fas fa-check"></i>
                        <span>完成訂單</span>
                    </div>
                </div>
            </div>

            <!-- Order Information -->
            <div class="order-info-section">
                <div class="section-header">
                    <h3>訂單資訊</h3>
                    <button class="edit-btn" onclick="checkoutPage.editOrder()">
                        <i class="fas fa-edit"></i>
                        修改
                    </button>
                </div>
                
                <div class="order-details">
                    <div class="table-info">
                        <i class="fas fa-table"></i>
                        <span>桌號: <strong id="checkout-table-number">--</strong></span>
                    </div>
                    
                    <div class="customer-info">
                        <i class="fas fa-user"></i>
                        <span>顧客: <strong id="checkout-customer-name">--</strong></span>
                    </div>
                </div>
            </div>

            <!-- Order Items -->
            <div class="order-items-section">
                <h3>訂單明細</h3>
                <div class="checkout-items-list" id="checkout-items-list">
                    <!-- Items will be loaded here -->
                </div>
            </div>

            <!-- Order Summary -->
            <div class="order-summary-section">
                <h3>費用明細</h3>
                <div class="summary-details">
                    <div class="summary-row">
                        <span>小計</span>
                        <span id="checkout-subtotal">NT$ 0</span>
                    </div>
                    <div class="summary-row">
                        <span>服務費 (10%)</span>
                        <span id="checkout-service-fee">NT$ 0</span>
                    </div>
                    <div class="summary-row">
                        <span>稅金 (5%)</span>
                        <span id="checkout-tax">NT$ 0</span>
                    </div>
                    <div class="summary-row total-row">
                        <span>總計</span>
                        <span id="checkout-total">NT$ 0</span>
                    </div>
                </div>
            </div>

            <!-- Payment Method -->
            <div class="payment-method-section">
                <h3>付款方式</h3>
                <div class="payment-methods">
                    <label class="payment-option">
                        <input type="radio" name="payment-method" value="CASH" onchange="checkoutPage.selectPaymentMethod('CASH')">
                        <div class="payment-card">
                            <i class="fas fa-money-bill-wave"></i>
                            <span>現金付款</span>
                            <small>服務員收款</small>
                        </div>
                    </label>
                    
                    <label class="payment-option">
                        <input type="radio" name="payment-method" value="CREDIT_CARD" onchange="checkoutPage.selectPaymentMethod('CREDIT_CARD')">
                        <div class="payment-card">
                            <i class="fas fa-credit-card"></i>
                            <span>信用卡</span>
                            <small>現場刷卡</small>
                        </div>
                    </label>
                    
                    <label class="payment-option">
                        <input type="radio" name="payment-method" value="LINE_PAY" onchange="checkoutPage.selectPaymentMethod('LINE_PAY')">
                        <div class="payment-card">
                            <i class="fab fa-line"></i>
                            <span>LINE Pay</span>
                            <small>掃碼付款</small>
                        </div>
                    </label>
                    
                    <label class="payment-option">
                        <input type="radio" name="payment-method" value="APPLE_PAY" onchange="checkoutPage.selectPaymentMethod('APPLE_PAY')">
                        <div class="payment-card">
                            <i class="fab fa-apple-pay"></i>
                            <span>Apple Pay</span>
                            <small>感應付款</small>
                        </div>
                    </label>
                </div>
            </div>

            <!-- Special Instructions -->
            <div class="special-instructions-section">
                <h3>特殊需求</h3>
                <textarea id="special-instructions" placeholder="如有特殊需求，請在此說明..." rows="3"></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="checkout-actions">
                <button class="btn btn-outline" onclick="checkoutPage.goBack()">
                    <i class="fas fa-arrow-left"></i>
                    返回購物車
                </button>
                <button class="btn btn-primary" id="submit-order-btn" onclick="checkoutPage.submitOrder()" disabled>
                    <i class="fas fa-check"></i>
                    確認訂單
                </button>
            </div>

            <!-- Processing Modal -->
            <div class="modal-overlay hidden" id="processing-modal">
                <div class="processing-modal">
                    <div class="processing-content">
                        <div class="spinner"></div>
                        <h3>處理中...</h3>
                        <p>正在建立您的訂單，請稍候</p>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    async initializeCheckoutPage() {
        try {
            console.log('Checkout page initialization started');
            
            // Get user and cart data
            this.currentUser = Storage.getUser();
            this.cartItems = cart.getItems();
            this.tableNumber = Storage.getTableNumber();
            
            console.log('Checkout - Current user:', this.currentUser ? 'Logged in' : 'Not logged in');
            console.log('Checkout - Cart items:', this.cartItems.length);
            console.log('Checkout - Table number:', this.tableNumber);
            
            if (!this.currentUser) {
                console.log('Checkout redirecting to login - no user');
                app.navigateTo('login');
                return;
            }
            
            if (this.cartItems.length === 0) {
                console.log('Checkout redirecting to cart - empty cart');
                toast.warning('購物車是空的');
                app.navigateTo('cart');
                return;
            }
            
            if (!this.tableNumber) {
                console.log('Checkout redirecting to cart - no table number');
                toast.warning('請先選擇桌號');
                app.navigateTo('cart');
                return;
            }
            
            console.log('Checkout page initialization successful');
            
            this.updateDisplay();
            this.setupEventListeners();
            
        } catch (error) {
            console.error('Failed to initialize checkout page:', error);
            toast.error('載入結帳頁面失敗');
            app.navigateTo('cart');
        }
    }

    updateDisplay() {
        // Update table number
        const tableEl = document.getElementById('checkout-table-number');
        if (tableEl) {
            tableEl.textContent = this.tableNumber;
        }
        
        // Update customer name
        const customerEl = document.getElementById('checkout-customer-name');
        if (customerEl) {
            customerEl.textContent = this.currentUser.username || this.currentUser.email;
        }
        
        // Update items list
        this.renderItems();
        
        // Update summary
        this.updateSummary();
    }

    renderItems() {
        const container = document.getElementById('checkout-items-list');
        if (!container) return;
        
        const html = this.cartItems.map(item => this.renderCheckoutItem(item)).join('');
        container.innerHTML = html;
    }

    renderCheckoutItem(item) {
        const itemTotal = item.price * item.quantity;
        
        return `
            <div class="checkout-item">
                <div class="item-image">
                    <img src="${item.imageUrl || 'assets/images/placeholder.svg'}" 
                         alt="${item.name}"
                         onerror="Helpers.handleImageError(this)">
                </div>
                
                <div class="item-details">
                    <h4 class="item-name">${item.name}</h4>
                    ${item.description ? `<p class="item-description">${Helpers.truncate(item.description, 60)}</p>` : ''}
                    ${item.specialRequests ? `<p class="item-requests"><i class="fas fa-comment"></i> ${item.specialRequests}</p>` : ''}
                    
                    <div class="item-pricing">
                        <span class="item-price">${Helpers.formatCurrency(item.price)} × ${item.quantity}</span>
                        <span class="item-total">${Helpers.formatCurrency(itemTotal)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    updateSummary() {
        const summary = cart.getSummary();
        const serviceFee = Math.round(summary.subtotal * 0.1);
        const tax = Math.round((summary.subtotal + serviceFee) * 0.05);
        const total = summary.subtotal + serviceFee + tax;
        
        const subtotalEl = document.getElementById('checkout-subtotal');
        const serviceFeeEl = document.getElementById('checkout-service-fee');
        const taxEl = document.getElementById('checkout-tax');
        const totalEl = document.getElementById('checkout-total');
        
        if (subtotalEl) subtotalEl.textContent = Helpers.formatCurrency(summary.subtotal);
        if (serviceFeeEl) serviceFeeEl.textContent = Helpers.formatCurrency(serviceFee);
        if (taxEl) taxEl.textContent = Helpers.formatCurrency(tax);
        if (totalEl) totalEl.textContent = Helpers.formatCurrency(total);
    }

    setupEventListeners() {
        // Enable submit button when payment method is selected
        const paymentInputs = document.querySelectorAll('input[name="payment-method"]');
        paymentInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateSubmitButton();
            });
        });
    }

    selectPaymentMethod(method) {
        this.selectedPaymentMethod = method;
        this.updateSubmitButton();
    }

    updateSubmitButton() {
        const submitBtn = document.getElementById('submit-order-btn');
        if (submitBtn) {
            submitBtn.disabled = !this.selectedPaymentMethod;
        }
    }

    editOrder() {
        app.navigateTo('cart');
    }

    goBack() {
        app.navigateTo('cart');
    }

    async submitOrder() {
        if (!this.selectedPaymentMethod) {
            toast.warning('請選擇付款方式');
            return;
        }
        
        if (this.isProcessing) return;
        
        try {
            this.isProcessing = true;
            this.showProcessingModal();
            
            // Create order data
            const specialInstructions = document.getElementById('special-instructions')?.value || '';
            
            const orderData = {
                customerId: this.currentUser.userId,
                tableNumber: this.tableNumber,
                items: this.cartItems.map(item => ({
                    menuItemId: item.id,
                    quantity: item.quantity,
                    specialRequests: item.specialRequests || null
                })),
                specialInstructions: specialInstructions,
                paymentMethod: this.selectedPaymentMethod
            };
            
            // Create order
            const order = await api.createOrder(orderData);
            
            // Create payment if needed
            if (this.selectedPaymentMethod !== 'CASH') {
                const paymentData = {
                    orderId: order.orderId,
                    customerId: this.currentUser.userId,
                    paymentMethod: this.selectedPaymentMethod
                };
                
                await api.createPayment(paymentData);
            }
            
            // Clear cart and navigate to success page
            cart.clear();
            Storage.clearTableNumber();
            
            this.hideProcessingModal();
            toast.success('訂單已成功建立！');
            
            // Navigate to order confirmation or orders page
            app.navigateTo('orders');
            
        } catch (error) {
            console.error('Failed to submit order:', error);
            this.hideProcessingModal();
            toast.error('建立訂單失敗，請稍後再試');
        } finally {
            this.isProcessing = false;
        }
    }

    showProcessingModal() {
        const modal = document.getElementById('processing-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    hideProcessingModal() {
        const modal = document.getElementById('processing-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }
}

// Create global checkout page instance
window.checkoutPage = new CheckoutPage();