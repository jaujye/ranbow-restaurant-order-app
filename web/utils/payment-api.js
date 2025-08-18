// Payment API utilities for third-party payment gateways
// Includes ECPay, LINE Pay, and Apple Pay integration

class PaymentAPI {
    constructor() {
        // ECPay Test Environment Configuration
        this.ecpayConfig = {
            baseURL: 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5',
            merchantID: '3002607',
            hashKey: 'pwFHCqoQZGmho4w6',
            hashIV: 'EkRm7iFT261dpevs',
            returnURL: `${window.location.origin}/payment/return`,
            notifyURL: `${window.location.origin}/payment/notify`,
            clientBackURL: `${window.location.origin}/orders`
        };

        // LINE Pay Sandbox Configuration
        this.linePayConfig = {
            baseURL: 'https://sandbox-api-pay.line.me',
            channelId: null, // To be set when merchant account is ready
            channelSecret: null, // To be set when merchant account is ready
            confirmURL: `${window.location.origin}/payment/linepay/confirm`,
            cancelURL: `${window.location.origin}/payment/linepay/cancel`
        };

        // Apple Pay Configuration (for web)
        this.applePayConfig = {
            merchantIdentifier: 'merchant.com.ranbow.restaurant', // Replace with actual merchant ID
            merchantDisplayName: 'Ranbow Restaurant',
            supportedNetworks: ['visa', 'masterCard', 'amex'],
            merchantCapabilities: ['supports3DS'],
            countryCode: 'TW'
        };
    }

    // === ECPay Credit Card Integration ===

    async processECPayPayment(orderData) {
        try {
            console.log('Processing ECPay payment for order:', orderData.orderId);
            
            const paymentData = this.buildECPayData(orderData);
            const checkMacValue = this.generateECPayCheckMac(paymentData);
            
            // Create payment form and submit
            const form = this.createECPayForm(paymentData, checkMacValue);
            
            // For testing, we'll simulate the payment process
            const result = await this.simulateECPayProcess(paymentData);
            
            return result;
            
        } catch (error) {
            console.error('ECPay payment failed:', error);
            throw new Error('信用卡付款處理失敗');
        }
    }

    buildECPayData(orderData) {
        const tradeNo = this.generateTradeNo();
        const tradeDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        return {
            MerchantID: this.ecpayConfig.merchantID,
            MerchantTradeNo: tradeNo,
            MerchantTradeDate: tradeDate,
            PaymentType: 'aio',
            TotalAmount: Math.round(orderData.totalAmount),
            TradeDesc: `Ranbow Restaurant Order ${orderData.orderId}`,
            ItemName: this.buildItemName(orderData.items),
            ReturnURL: this.ecpayConfig.returnURL,
            ChoosePayment: 'Credit',
            ClientBackURL: this.ecpayConfig.clientBackURL,
            NeedExtraPaidInfo: 'Y',
            CustomField1: orderData.orderId, // Store our order ID
            CustomField2: orderData.customerId
        };
    }

    buildItemName(items) {
        if (items.length === 1) {
            return items[0].menuItem.name;
        }
        const firstItem = items[0].menuItem.name;
        const otherCount = items.length - 1;
        return `${firstItem}等${items.length}項商品`;
    }

    generateECPayCheckMac(data) {
        // ECPay CheckMacValue generation
        const sortedParams = Object.keys(data)
            .sort()
            .map(key => `${key}=${data[key]}`)
            .join('&');
        
        const rawString = `HashKey=${this.ecpayConfig.hashKey}&${sortedParams}&HashIV=${this.ecpayConfig.hashIV}`;
        const encodedString = encodeURIComponent(rawString).toLowerCase();
        
        // In real implementation, use crypto library for SHA256
        // For testing, we'll use a simplified version
        return this.simpleSHA256(encodedString);
    }

    simpleSHA256(str) {
        // Simplified hash for testing - in production use crypto-js or similar
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    }

    async simulateECPayProcess(paymentData) {
        // Simulate ECPay payment process for testing
        await this.delay(2000);
        
        // Simulate random success/failure for testing
        const isSuccess = Math.random() > 0.2; // 80% success rate
        
        if (isSuccess) {
            return {
                success: true,
                paymentType: 'CREDIT_CARD',
                transactionId: `ECPay${Date.now()}`,
                tradeNo: paymentData.MerchantTradeNo,
                paymentDate: new Date().toISOString(),
                amount: paymentData.TotalAmount,
                message: '信用卡付款成功'
            };
        } else {
            throw new Error('信用卡付款失敗 - 卡片餘額不足');
        }
    }

    // === LINE Pay Integration ===

    async processLinePayPayment(orderData) {
        try {
            console.log('Processing LINE Pay payment for order:', orderData.orderId);
            
            // Step 1: Request payment
            const requestResult = await this.requestLinePayment(orderData);
            
            if (!requestResult.success) {
                throw new Error(requestResult.message);
            }
            
            // Step 2: Simulate user confirmation (in real app, user would be redirected)
            await this.delay(3000);
            
            // Step 3: Confirm payment
            const confirmResult = await this.confirmLinePayment(requestResult.transactionId, orderData);
            
            return confirmResult;
            
        } catch (error) {
            console.error('LINE Pay payment failed:', error);
            throw new Error('LINE Pay付款處理失敗');
        }
    }

    async requestLinePayment(orderData) {
        // Simulate LINE Pay request API
        await this.delay(1500);
        
        const transactionId = this.generateTransactionId('LP');
        
        return {
            success: true,
            transactionId: transactionId,
            paymentUrl: `https://web-pay.line.me/web/payment/${transactionId}`,
            info: {
                transactionId: transactionId,
                orderId: orderData.orderId
            }
        };
    }

    async confirmLinePayment(transactionId, orderData) {
        // Simulate LINE Pay confirm API
        await this.delay(2000);
        
        // Simulate random success/failure
        const isSuccess = Math.random() > 0.15; // 85% success rate
        
        if (isSuccess) {
            return {
                success: true,
                paymentType: 'LINE_PAY',
                transactionId: transactionId,
                paymentDate: new Date().toISOString(),
                amount: orderData.totalAmount,
                message: 'LINE Pay付款成功'
            };
        } else {
            throw new Error('LINE Pay付款失敗 - 用戶取消付款');
        }
    }

    // === Apple Pay Integration ===

    async processApplePayPayment(orderData) {
        try {
            console.log('Processing Apple Pay payment for order:', orderData.orderId);
            
            // Check Apple Pay availability
            if (!this.isApplePayAvailable()) {
                throw new Error('此設備不支援 Apple Pay');
            }
            
            // Create payment request
            const paymentRequest = this.createApplePayRequest(orderData);
            
            // Simulate Apple Pay session
            const result = await this.simulateApplePaySession(paymentRequest);
            
            return result;
            
        } catch (error) {
            console.error('Apple Pay payment failed:', error);
            throw new Error('Apple Pay付款處理失敗');
        }
    }

    isApplePayAvailable() {
        // Check if Apple Pay is available
        return window.ApplePaySession && 
               ApplePaySession.canMakePayments() &&
               ApplePaySession.supportsVersion(3);
    }

    createApplePayRequest(orderData) {
        return {
            countryCode: this.applePayConfig.countryCode,
            currencyCode: 'TWD',
            supportedNetworks: this.applePayConfig.supportedNetworks,
            merchantCapabilities: this.applePayConfig.merchantCapabilities,
            total: {
                label: this.applePayConfig.merchantDisplayName,
                amount: orderData.totalAmount.toString()
            },
            lineItems: orderData.items.map(item => ({
                label: item.menuItem.name,
                amount: (item.price * item.quantity).toString()
            }))
        };
    }

    async simulateApplePaySession(paymentRequest) {
        // Simulate Apple Pay payment process
        await this.delay(2500);
        
        // Simulate biometric authentication
        const biometricSuccess = Math.random() > 0.1; // 90% success rate
        
        if (!biometricSuccess) {
            throw new Error('生物識別驗證失敗');
        }
        
        await this.delay(1500);
        
        // Simulate payment processing
        const paymentSuccess = Math.random() > 0.1; // 90% success rate
        
        if (paymentSuccess) {
            return {
                success: true,
                paymentType: 'APPLE_PAY',
                transactionId: this.generateTransactionId('AP'),
                paymentDate: new Date().toISOString(),
                amount: parseFloat(paymentRequest.total.amount),
                message: 'Apple Pay付款成功'
            };
        } else {
            throw new Error('Apple Pay付款失敗 - 支付授權被拒絕');
        }
    }

    // === Utility Methods ===

    generateTradeNo() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 6);
        return `RB${timestamp}${random}`.toUpperCase();
    }

    generateTransactionId(prefix = 'TXN') {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `${prefix}${timestamp}${random}`.toUpperCase();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    createECPayForm(data, checkMacValue) {
        // Create hidden form for ECPay submission
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = this.ecpayConfig.baseURL;
        form.style.display = 'none';
        
        // Add all form fields
        Object.keys(data).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = data[key];
            form.appendChild(input);
        });
        
        // Add CheckMacValue
        const checkMacInput = document.createElement('input');
        checkMacInput.type = 'hidden';
        checkMacInput.name = 'CheckMacValue';
        checkMacInput.value = checkMacValue;
        form.appendChild(checkMacInput);
        
        return form;
    }

    // === Payment Status Validation ===

    validatePaymentResult(result) {
        return {
            isValid: result && result.success === true,
            transactionId: result?.transactionId,
            amount: result?.amount,
            paymentType: result?.paymentType,
            message: result?.message || '未知錯誤'
        };
    }
}

// Create global payment API instance
window.paymentAPI = new PaymentAPI();