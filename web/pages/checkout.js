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
                <div class="checkout-title-section">
                    <h2><i class="fas fa-clipboard-check"></i> 確認訂單</h2>
                    <p class="checkout-subtitle">請仔細檢查您的訂單內容</p>
                </div>
                <div class="checkout-progress">
                    <div class="progress-step active">
                        <div class="step-icon">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <span class="step-text">確認商品</span>
                    </div>
                    <div class="progress-connector"></div>
                    <div class="progress-step">
                        <div class="step-icon">
                            <i class="fas fa-credit-card"></i>
                        </div>
                        <span class="step-text">選擇付款</span>
                    </div>
                    <div class="progress-connector"></div>
                    <div class="progress-step">
                        <div class="step-icon">
                            <i class="fas fa-check"></i>
                        </div>
                        <span class="step-text">完成訂單</span>
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
                <div class="summary-header">
                    <h3><i class="fas fa-calculator"></i> 費用明細</h3>
                </div>
                <div class="summary-details">
                    <div class="summary-row">
                        <div class="summary-label">
                            <i class="fas fa-list-ul"></i>
                            <span>小計</span>
                        </div>
                        <span class="summary-value" id="checkout-subtotal">NT$ 0</span>
                    </div>
                    <div class="summary-row">
                        <div class="summary-label">
                            <i class="fas fa-concierge-bell"></i>
                            <span>服務費 (10%)</span>
                        </div>
                        <span class="summary-value" id="checkout-service-fee">NT$ 0</span>
                    </div>
                    <div class="summary-row">
                        <div class="summary-label">
                            <i class="fas fa-receipt"></i>
                            <span>稅金 (5%)</span>
                        </div>
                        <span class="summary-value" id="checkout-tax">NT$ 0</span>
                    </div>
                    <div class="summary-row total-row">
                        <div class="summary-label">
                            <i class="fas fa-coins"></i>
                            <span>總計</span>
                        </div>
                        <span class="summary-value total-amount" id="checkout-total">NT$ 0</span>
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
                <div class="checkout-item-image">
                    <img src="${item.imageUrl || 'assets/images/placeholder.svg'}" 
                         alt="${item.name}"
                         onerror="Helpers.handleImageError(this)">
                    <div class="quantity-badge">${item.quantity}</div>
                </div>
                
                <div class="checkout-item-details">
                    <div class="item-header">
                        <h4 class="checkout-item-name">${item.name}</h4>
                        <span class="checkout-item-total">${Helpers.formatCurrency(itemTotal)}</span>
                    </div>
                    
                    ${item.description ? `<p class="checkout-item-description">${Helpers.truncate(item.description, 60)}</p>` : ''}
                    ${item.specialRequests ? `
                        <div class="checkout-item-requests">
                            <i class="fas fa-comment-dots"></i> 
                            <span>${item.specialRequests}</span>
                        </div>
                    ` : ''}
                    
                    <div class="checkout-item-pricing">
                        <div class="unit-price">
                            <span class="price-label">單價</span>
                            <span class="price-value">${Helpers.formatCurrency(item.price)}</span>
                        </div>
                        <div class="quantity-info">
                            <span class="quantity-label">數量</span>
                            <span class="quantity-value">×${item.quantity}</span>
                        </div>
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
            this.updateProcessingMessage('正在建立訂單...');
            
            // Create order data
            const specialInstructions = document.getElementById('special-instructions')?.value || '';
            const summary = cart.getSummary();
            const serviceFee = Math.round(summary.subtotal * 0.1);
            const tax = Math.round((summary.subtotal + serviceFee) * 0.05);
            const totalAmount = summary.subtotal + serviceFee + tax;
            
            const orderData = {
                customerId: this.currentUser.userId,
                tableNumber: this.tableNumber,
                items: this.cartItems.map(item => ({
                    menuItemId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    specialRequests: item.specialRequests || null
                })),
                specialInstructions: specialInstructions,
                paymentMethod: this.selectedPaymentMethod,
                subtotal: summary.subtotal,
                serviceFee: serviceFee,
                tax: tax,
                totalAmount: totalAmount
            };
            
            // Create order
            console.log('Creating order with data:', orderData);
            const order = await api.createOrder(orderData);
            console.log('Order created successfully:', order);
            
            // Process payment based on method
            await this.processPayment(order, totalAmount);
            
            // Clear cart and navigate to success page
            cart.clear();
            Storage.clearTableNumber();
            
            this.hideProcessingModal();
            this.showSuccessModal(order);
            
        } catch (error) {
            console.error('Failed to submit order:', error);
            this.hideProcessingModal();
            this.handleOrderError(error);
        } finally {
            this.isProcessing = false;
        }
    }

    async processPayment(order, totalAmount) {
        this.updateProcessingMessage('正在處理付款...');
        
        switch (this.selectedPaymentMethod) {
            case 'CASH':
                // Cash payment - no additional processing needed
                console.log('Cash payment selected - order will be processed at table');
                break;
                
            case 'CREDIT_CARD':
                await this.processCreditCardPayment(order, totalAmount);
                break;
                
            case 'LINE_PAY':
                await this.processLinePayPayment(order, totalAmount);
                break;
                
            case 'APPLE_PAY':
                await this.processApplePayPayment(order, totalAmount);
                break;
                
            default:
                throw new Error('不支援的付款方式');
        }
    }

    async processCreditCardPayment(order, totalAmount) {
        try {
            console.log('Processing credit card payment for order:', order.orderId);
            
            // Simulate credit card processing
            this.updateProcessingMessage('正在連接信用卡處理中心...');
            await this.delay(1500);
            
            const paymentData = {
                orderId: order.orderId,
                customerId: this.currentUser.userId,
                paymentMethod: 'CREDIT_CARD',
                amount: totalAmount,
                currency: 'TWD',
                transactionId: this.generateTransactionId()
            };
            
            this.updateProcessingMessage('正在驗證信用卡資訊...');
            await this.delay(2000);
            
            // Create payment record
            const payment = await api.createPayment(paymentData);
            console.log('Payment created:', payment);
            
            this.updateProcessingMessage('正在完成交易...');
            await this.delay(1000);
            
            // Process payment
            await api.processPayment(payment.paymentId);
            console.log('Credit card payment processed successfully');
            
            toast.success('信用卡付款成功！');
            
        } catch (error) {
            console.error('Credit card payment failed:', error);
            throw new Error('信用卡付款失敗，請檢查卡片資訊或選擇其他付款方式');
        }
    }

    async processLinePayPayment(order, totalAmount) {
        try {
            console.log('Processing LINE Pay payment for order:', order.orderId);
            
            this.updateProcessingMessage('正在連接 LINE Pay...');
            await this.delay(1000);
            
            const paymentData = {
                orderId: order.orderId,
                customerId: this.currentUser.userId,
                paymentMethod: 'LINE_PAY',
                amount: totalAmount,
                currency: 'TWD',
                transactionId: this.generateTransactionId()
            };
            
            this.updateProcessingMessage('正在生成 LINE Pay 付款連結...');
            await this.delay(1500);
            
            // Create payment record
            const payment = await api.createPayment(paymentData);
            console.log('LINE Pay payment created:', payment);
            
            this.updateProcessingMessage('正在確認付款狀態...');
            await this.delay(2000);
            
            // Simulate LINE Pay processing
            await api.processPayment(payment.paymentId);
            console.log('LINE Pay payment processed successfully');
            
            toast.success('LINE Pay 付款成功！');
            
        } catch (error) {
            console.error('LINE Pay payment failed:', error);
            throw new Error('LINE Pay 付款失敗，請稍後再試');
        }
    }

    async processApplePayPayment(order, totalAmount) {
        try {
            console.log('Processing Apple Pay payment for order:', order.orderId);
            
            this.updateProcessingMessage('正在連接 Apple Pay...');
            await this.delay(1000);
            
            const paymentData = {
                orderId: order.orderId,
                customerId: this.currentUser.userId,
                paymentMethod: 'APPLE_PAY',
                amount: totalAmount,
                currency: 'TWD',
                transactionId: this.generateTransactionId()
            };
            
            this.updateProcessingMessage('正在驗證生物識別...');
            await this.delay(2500);
            
            // Create payment record
            const payment = await api.createPayment(paymentData);
            console.log('Apple Pay payment created:', payment);
            
            this.updateProcessingMessage('正在完成 Apple Pay 交易...');
            await this.delay(1500);
            
            // Process payment
            await api.processPayment(payment.paymentId);
            console.log('Apple Pay payment processed successfully');
            
            toast.success('Apple Pay 付款成功！');
            
        } catch (error) {
            console.error('Apple Pay payment failed:', error);
            throw new Error('Apple Pay 付款失敗，請檢查設備設定');
        }
    }

    generateTransactionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `TXN${timestamp}${random}`.toUpperCase();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateProcessingMessage(message) {
        const processingText = document.querySelector('.processing-content p');
        if (processingText) {
            processingText.textContent = message;
        }
    }

    handleOrderError(error) {
        let errorMessage = '建立訂單失敗，請稍後再試';
        
        if (error.message.includes('Credit card')) {
            errorMessage = error.message;
        } else if (error.message.includes('LINE Pay')) {
            errorMessage = error.message;
        } else if (error.message.includes('Apple Pay')) {
            errorMessage = error.message;
        } else if (error.message.includes('400')) {
            errorMessage = '訂單資料有誤，請檢查後重新送出';
        } else if (error.message.includes('401')) {
            errorMessage = '用戶身份驗證失敗，請重新登入';
        } else if (error.message.includes('500')) {
            errorMessage = '伺服器忙碌中，請稍後再試';
        }
        
        toast.error(errorMessage);
    }

    showSuccessModal(order) {
        // Create success modal HTML
        const successModalHTML = `
            <div class="modal-overlay" id="success-modal">
                <div class="success-modal">
                    <div class="success-content">
                        <div class="success-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h3>訂單建立成功！</h3>
                        <p>您的訂單編號是：<strong>#${order.orderId}</strong></p>
                        <div class="success-details">
                            <div class="detail-item">
                                <i class="fas fa-table"></i>
                                <span>桌號：${this.tableNumber}</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-credit-card"></i>
                                <span>付款方式：${this.getPaymentMethodText(this.selectedPaymentMethod)}</span>
                            </div>
                        </div>
                        <div class="success-actions">
                            <button class="btn btn-outline" onclick="checkoutPage.viewOrderDetails('${order.orderId}')">
                                查看訂單
                            </button>
                            <button class="btn btn-primary" onclick="checkoutPage.goToOrders()">
                                我的訂單
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', successModalHTML);
        document.body.style.overflow = 'hidden';
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            this.hideSuccessModal();
        }, 5000);
    }

    hideSuccessModal() {
        const modal = document.getElementById('success-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    getPaymentMethodText(method) {
        const methodMap = {
            'CASH': '現金付款',
            'CREDIT_CARD': '信用卡',
            'LINE_PAY': 'LINE Pay',
            'APPLE_PAY': 'Apple Pay'
        };
        return methodMap[method] || method;
    }

    viewOrderDetails(orderId) {
        this.hideSuccessModal();
        // Navigate to order detail (could implement a detail view)
        app.navigateTo('orders');
    }

    goToOrders() {
        this.hideSuccessModal();
        app.navigateTo('orders');
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