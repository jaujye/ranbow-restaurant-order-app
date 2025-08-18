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
        
        let order = null;
        let paymentResult = null;
        
        try {
            this.isProcessing = true;
            this.showProcessingModal();
            this.updateProcessingMessage('正在檢查訂單狀態...');
            
            // Check for existing pending orders for this customer
            const existingOrders = await api.getCustomerOrders(this.currentUser.userId);
            const pendingOrder = existingOrders.find(o => 
                o.status === 'PENDING_PAYMENT' && 
                o.customerId === this.currentUser.userId
            );
            
            if (pendingOrder) {
                console.log('Found existing pending order:', pendingOrder);
                order = pendingOrder;
                this.updateProcessingMessage('發現未完成訂單，繼續付款流程...');
            } else {
                this.updateProcessingMessage('正在建立訂單...');
                
                // Create order data
                const specialInstructions = document.getElementById('special-instructions')?.value || '';
                const summary = cart.getSummary();
                const serviceFee = Math.round(summary.subtotal * 0.1);
                const tax = Math.round((summary.subtotal + serviceFee) * 0.05);
                
                const orderData = {
                    customerId: this.currentUser.userId,
                    tableNumber: 1,
                    items: this.cartItems.map(item => ({
                        menuItemId: item.itemId || item.id,
                        quantity: item.quantity,
                        price: item.price,
                        specialRequests: item.specialRequests || null
                    })),
                    specialInstructions: specialInstructions,
                    paymentMethod: this.selectedPaymentMethod,
                    subtotal: summary.subtotal,
                    serviceFee: serviceFee,
                    tax: tax,
                    totalAmount: summary.subtotal + serviceFee + tax,
                    status: 'PENDING_PAYMENT' // Initial status before payment
                };
                
                // Create order with pending payment status
                console.log('Creating order with data:', orderData);
                order = await api.createOrder(orderData);
                console.log('Order created successfully:', order);
            }
            
            // Calculate total amount for payment processing
            const totalAmount = order.totalAmount;
            
            // Process payment based on method
            try {
                paymentResult = await this.processPayment(order, totalAmount);
                
                // Payment successful - update order status
                this.updateProcessingMessage('正在確認訂單...');
                await api.updateOrderStatus(order.orderId, 'CONFIRMED');
                console.log('Order confirmed after successful payment');
                
                // Clear cart and navigate to success page
                cart.clear();
                Storage.clearTableNumber();
                
                this.hideProcessingModal();
                this.showSuccessModal(order, paymentResult);
                
            } catch (paymentError) {
                // Payment failed - cancel the order
                console.error('Payment failed, cancelling order:', paymentError);
                
                this.updateProcessingMessage('付款失敗，正在取消訂單...');
                try {
                    await api.updateOrderStatus(order.orderId, 'CANCELLED');
                    console.log('Order cancelled due to payment failure');
                } catch (cancelError) {
                    console.error('Failed to cancel order:', cancelError);
                }
                
                throw paymentError;
            }
            
        } catch (error) {
            console.error('Failed to submit order:', error);
            this.hideProcessingModal();
            this.handleOrderError(error, order);
        } finally {
            this.isProcessing = false;
        }
    }

    async processPayment(order, totalAmount) {
        this.updateProcessingMessage('正在處理付款...');
        
        // Store current order amount for payment modals
        this.currentOrderAmount = totalAmount;
        
        let paymentResult = null;
        
        switch (this.selectedPaymentMethod) {
            case 'CASH':
                // Cash payment - create payment record and confirm
                console.log('Cash payment selected - order will be processed at table');
                this.updateProcessingMessage('現金付款確認中...');
                await this.delay(1000);
                
                // Create payment record for cash payment
                const cashPaymentData = {
                    orderId: order.orderId,
                    customerId: this.currentUser.userId,
                    paymentMethod: 'CASH'
                };
                
                this.updateProcessingMessage('正在建立付款記錄...');
                const payment = await api.createPayment(cashPaymentData);
                console.log('Cash payment record created:', payment);
                
                paymentResult = {
                    success: true,
                    paymentType: 'CASH',
                    transactionId: `CASH${Date.now()}`,
                    paymentDate: new Date().toISOString(),
                    amount: totalAmount,
                    message: '現金付款 - 將由服務員收款'
                };
                break;
                
            case 'CREDIT_CARD':
                paymentResult = await this.processCreditCardPayment(order, totalAmount);
                break;
                
            case 'LINE_PAY':
                paymentResult = await this.processLinePayPayment(order, totalAmount);
                break;
                
            case 'APPLE_PAY':
                paymentResult = await this.processApplePayPayment(order, totalAmount);
                break;
                
            default:
                throw new Error('不支援的付款方式');
        }
        
        return paymentResult;
    }

    async processCreditCardPayment(order, totalAmount) {
        try {
            console.log('Processing credit card payment for order:', order.orderId);
            
            // Hide processing modal and show payment gateway modal
            this.hideProcessingModal();
            
            // Use ECPay for credit card processing
            const orderData = {
                orderId: order.orderId,
                customerId: this.currentUser.userId,
                totalAmount: totalAmount,
                items: this.cartItems
            };
            
            // Show ECPay payment modal
            const paymentResult = await this.showECPayModal(orderData);
            
            // Validate payment result
            const validation = paymentAPI.validatePaymentResult(paymentResult);
            if (!validation.isValid) {
                throw new Error(validation.message);
            }
            
            // Create payment record with backend-compatible format
            const paymentData = {
                orderId: order.orderId,
                customerId: this.currentUser.userId,
                paymentMethod: 'CREDIT_CARD'
            };
            
            const payment = await api.createPayment(paymentData);
            console.log('Payment record created:', payment);
            
            return paymentResult;
            
        } catch (error) {
            console.error('Credit card payment failed:', error);
            throw new Error(error.message || '信用卡付款失敗，請檢查卡片資訊或選擇其他付款方式');
        }
    }

    async processLinePayPayment(order, totalAmount) {
        try {
            console.log('Processing LINE Pay payment for order:', order.orderId);
            
            // Hide processing modal and show payment gateway modal
            this.hideProcessingModal();
            
            // Use LINE Pay API for processing
            const orderData = {
                orderId: order.orderId,
                customerId: this.currentUser.userId,
                totalAmount: totalAmount,
                items: this.cartItems
            };
            
            // Show LINE Pay payment modal
            const paymentResult = await this.showLinePayModal(orderData);
            
            // Validate payment result
            const validation = paymentAPI.validatePaymentResult(paymentResult);
            if (!validation.isValid) {
                throw new Error(validation.message);
            }
            
            // Create payment record with backend-compatible format
            const paymentData = {
                orderId: order.orderId,
                customerId: this.currentUser.userId,
                paymentMethod: 'LINE_PAY'
            };
            
            const payment = await api.createPayment(paymentData);
            console.log('Payment record created:', payment);
            
            return paymentResult;
            
        } catch (error) {
            console.error('LINE Pay payment failed:', error);
            throw new Error(error.message || 'LINE Pay 付款失敗，請稍後再試');
        }
    }

    async processApplePayPayment(order, totalAmount) {
        try {
            console.log('Processing Apple Pay payment for order:', order.orderId);
            
            // Hide processing modal and show payment gateway modal
            this.hideProcessingModal();
            
            // Use Apple Pay API for processing
            const orderData = {
                orderId: order.orderId,
                customerId: this.currentUser.userId,
                totalAmount: totalAmount,
                items: this.cartItems
            };
            
            // Show Apple Pay payment modal
            const paymentResult = await this.showApplePayModal(orderData);
            
            // Validate payment result
            const validation = paymentAPI.validatePaymentResult(paymentResult);
            if (!validation.isValid) {
                throw new Error(validation.message);
            }
            
            // Create payment record with backend-compatible format
            const paymentData = {
                orderId: order.orderId,
                customerId: this.currentUser.userId,
                paymentMethod: 'APPLE_PAY'
            };
            
            const payment = await api.createPayment(paymentData);
            console.log('Payment record created:', payment);
            
            return paymentResult;
            
        } catch (error) {
            console.error('Apple Pay payment failed:', error);
            throw new Error(error.message || 'Apple Pay 付款失敗，請檢查設備設定');
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

    showSuccessModal(order, paymentResult) {
        // Navigate to success page immediately
        this.showPaymentSuccessPage(order, paymentResult);
    }

    showPaymentSuccessPage(order, paymentResult) {
        // Clear checkout page and show success page
        const mainContent = document.querySelector('.checkout-page');
        if (mainContent) {
            const successPageHTML = `
                <div class="payment-success-page">
                    <div class="success-container">
                        <div class="success-animation">
                            <div class="success-icon">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="success-ripple"></div>
                            <div class="success-ripple"></div>
                        </div>
                        
                        <div class="success-content">
                            <h2>🎉 付款成功！</h2>
                            <p class="success-message">您的訂單已確認，感謝您的購買！</p>
                            
                            <div class="order-summary">
                                <div class="summary-item">
                                    <span class="label">訂單編號</span>
                                    <span class="value">#${order.orderId}</span>
                                </div>
                                <div class="summary-item">
                                    <span class="label">付款方式</span>
                                    <span class="value">${this.getPaymentMethodText(this.selectedPaymentMethod)}</span>
                                </div>
                                <div class="summary-item">
                                    <span class="label">付款金額</span>
                                    <span class="value">NT$ ${paymentResult.amount || this.getTotalAmount()}</span>
                                </div>
                                <div class="summary-item">
                                    <span class="label">桌號</span>
                                    <span class="value">${this.tableNumber}</span>
                                </div>
                            </div>
                            
                            <div class="countdown-timer">
                                <p>將在 <span id="countdown">3</span> 秒後自動返回首頁</p>
                            </div>
                            
                            <div class="success-actions">
                                <button class="btn btn-outline" onclick="checkoutPage.goToOrders()">
                                    <i class="fas fa-list"></i> 查看我的訂單
                                </button>
                                <button class="btn btn-primary" onclick="checkoutPage.goToHome()">
                                    <i class="fas fa-home"></i> 返回首頁
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            mainContent.innerHTML = successPageHTML;
            
            // Start countdown timer
            this.startCountdownTimer();
        }
    }

    startCountdownTimer() {
        let seconds = 3;
        const countdownElement = document.getElementById('countdown');
        
        const timer = setInterval(() => {
            seconds--;
            if (countdownElement) {
                countdownElement.textContent = seconds;
            }
            
            if (seconds <= 0) {
                clearInterval(timer);
                this.goToHome();
            }
        }, 1000);
    }

    goToHome() {
        app.navigateTo('home');
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

    // === Payment Gateway Modals ===

    async showECPayModal(orderData) {
        return new Promise((resolve, reject) => {
            const modalHTML = `
                <div class="modal-overlay" id="ecpay-modal">
                    <div class="payment-modal">
                        <div class="payment-header">
                            <h3><i class="fas fa-credit-card"></i> 綠界金流 ECPay</h3>
                            <button class="modal-close" onclick="checkoutPage.closePaymentModal('ecpay-modal')">&times;</button>
                        </div>
                        <div class="payment-content">
                            <div class="payment-info">
                                <p><strong>訂單編號：</strong>${orderData.orderId}</p>
                                <p><strong>付款金額：</strong>NT$ ${orderData.totalAmount}</p>
                            </div>
                            <div class="payment-simulator">
                                <h4>模擬信用卡付款</h4>
                                <div class="card-input">
                                    <input type="text" placeholder="卡號：**** **** **** 1234" readonly>
                                    <input type="text" placeholder="有效期限：12/28" readonly>
                                    <input type="text" placeholder="安全碼：***" readonly>
                                </div>
                                <div class="payment-actions">
                                    <button class="btn btn-outline" onclick="checkoutPage.simulatePaymentFailure('ecpay-modal')">
                                        模擬付款失敗
                                    </button>
                                    <button class="btn btn-primary" onclick="checkoutPage.simulatePaymentSuccess('ecpay-modal', '${orderData.orderId}')">
                                        <i class="fas fa-check"></i> 確認付款
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            document.body.style.overflow = 'hidden';
            
            // Store resolve/reject for later use
            this.currentPaymentResolve = resolve;
            this.currentPaymentReject = reject;
        });
    }

    async showLinePayModal(orderData) {
        return new Promise((resolve, reject) => {
            const modalHTML = `
                <div class="modal-overlay" id="linepay-modal">
                    <div class="payment-modal">
                        <div class="payment-header">
                            <h3><i class="fab fa-line"></i> LINE Pay</h3>
                            <button class="modal-close" onclick="checkoutPage.closePaymentModal('linepay-modal')">&times;</button>
                        </div>
                        <div class="payment-content">
                            <div class="payment-info">
                                <p><strong>訂單編號：</strong>${orderData.orderId}</p>
                                <p><strong>付款金額：</strong>NT$ ${orderData.totalAmount}</p>
                            </div>
                            <div class="payment-simulator">
                                <div class="qr-code-section">
                                    <div class="qr-placeholder">
                                        <i class="fas fa-qrcode"></i>
                                        <p>請使用 LINE App 掃描 QR Code</p>
                                    </div>
                                </div>
                                <div class="payment-actions">
                                    <button class="btn btn-outline" onclick="checkoutPage.simulatePaymentFailure('linepay-modal')">
                                        模擬用戶取消
                                    </button>
                                    <button class="btn btn-primary" onclick="checkoutPage.simulatePaymentSuccess('linepay-modal', '${orderData.orderId}')">
                                        <i class="fas fa-check"></i> 模擬付款成功
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            document.body.style.overflow = 'hidden';
            
            // Store resolve/reject for later use
            this.currentPaymentResolve = resolve;
            this.currentPaymentReject = reject;
        });
    }

    async showApplePayModal(orderData) {
        return new Promise((resolve, reject) => {
            const modalHTML = `
                <div class="modal-overlay" id="applepay-modal">
                    <div class="payment-modal">
                        <div class="payment-header">
                            <h3><i class="fab fa-apple-pay"></i> Apple Pay</h3>
                            <button class="modal-close" onclick="checkoutPage.closePaymentModal('applepay-modal')">&times;</button>
                        </div>
                        <div class="payment-content">
                            <div class="payment-info">
                                <p><strong>訂單編號：</strong>${orderData.orderId}</p>
                                <p><strong>付款金額：</strong>NT$ ${orderData.totalAmount}</p>
                            </div>
                            <div class="payment-simulator">
                                <div class="biometric-section">
                                    <div class="biometric-placeholder">
                                        <i class="fas fa-fingerprint"></i>
                                        <p>請使用 Touch ID 或 Face ID 驗證</p>
                                    </div>
                                </div>
                                <div class="payment-actions">
                                    <button class="btn btn-outline" onclick="checkoutPage.simulatePaymentFailure('applepay-modal')">
                                        模擬驗證失敗
                                    </button>
                                    <button class="btn btn-primary" onclick="checkoutPage.simulatePaymentSuccess('applepay-modal', '${orderData.orderId}')">
                                        <i class="fas fa-check"></i> 模擬驗證成功
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            document.body.style.overflow = 'hidden';
            
            // Store resolve/reject for later use
            this.currentPaymentResolve = resolve;
            this.currentPaymentReject = reject;
        });
    }

    closePaymentModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
        
        // Reject the payment if modal is closed without completion
        if (this.currentPaymentReject) {
            this.currentPaymentReject(new Error('用戶取消付款'));
            this.currentPaymentReject = null;
            this.currentPaymentResolve = null;
        }
    }

    simulatePaymentSuccess(modalId, orderId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
        
        if (this.currentPaymentResolve) {
            const paymentType = modalId.includes('ecpay') ? 'CREDIT_CARD' : 
                               modalId.includes('linepay') ? 'LINE_PAY' : 'APPLE_PAY';
            
            const result = {
                success: true,
                paymentType: paymentType,
                transactionId: `${paymentType}${Date.now()}`,
                paymentDate: new Date().toISOString(),
                amount: this.currentOrderAmount || this.getTotalAmount(),
                message: `${paymentType} 付款成功`
            };
            
            this.currentPaymentResolve(result);
            this.currentPaymentResolve = null;
            this.currentPaymentReject = null;
        }
    }

    simulatePaymentFailure(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
        
        if (this.currentPaymentReject) {
            const paymentType = modalId.includes('ecpay') ? '信用卡' : 
                               modalId.includes('linepay') ? 'LINE Pay' : 'Apple Pay';
            
            this.currentPaymentReject(new Error(`${paymentType} 付款失敗`));
            this.currentPaymentReject = null;
            this.currentPaymentResolve = null;
        }
    }

    getTotalAmount() {
        const summary = cart.getSummary();
        const serviceFee = Math.round(summary.subtotal * 0.1);
        const tax = Math.round((summary.subtotal + serviceFee) * 0.05);
        return summary.subtotal + serviceFee + tax;
    }
}

// Create global checkout page instance
window.checkoutPage = new CheckoutPage();