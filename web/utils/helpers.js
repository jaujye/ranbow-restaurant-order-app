// Helper utility functions

class Helpers {
    // Format currency
    static formatCurrency(amount) {
        return `NT$ ${amount.toLocaleString()}`;
    }

    // Parse date with robust handling for different formats
    static parseDate(date) {
        if (!date) return null;
        
        // If it's already a Date object, return it
        if (date instanceof Date) return date;
        
        // Handle Java LocalDateTime format (e.g., "2024-01-15T14:30:00" or with milliseconds)
        if (typeof date === 'string') {
            // Replace space with 'T' for ISO format if needed
            let normalizedDate = date.replace(' ', 'T');
            
            // Add 'Z' if it's missing timezone info and looks like ISO format
            if (normalizedDate.includes('T') && !normalizedDate.includes('Z') && !normalizedDate.includes('+')) {
                normalizedDate += 'Z';
            }
            
            const parsed = new Date(normalizedDate);
            return isNaN(parsed.getTime()) ? null : parsed;
        }
        
        // Try to create Date object directly
        const parsed = new Date(date);
        return isNaN(parsed.getTime()) ? null : parsed;
    }

    // Format date
    static formatDate(date, options = {}) {
        const parsedDate = this.parseDate(date);
        if (!parsedDate) return 'Invalid Date';
        
        const defaultOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            ...options
        };
        
        return parsedDate.toLocaleDateString('zh-TW', defaultOptions);
    }

    // Format time
    static formatTime(date) {
        const parsedDate = this.parseDate(date);
        if (!parsedDate) return 'Invalid Time';
        
        return parsedDate.toLocaleTimeString('zh-TW', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Format date and time
    static formatDateTime(date) {
        const parsedDate = this.parseDate(date);
        if (!parsedDate) return 'Invalid DateTime';
        
        const dateStr = this.formatDate(parsedDate);
        const timeStr = this.formatTime(parsedDate);
        return `${dateStr} ${timeStr}`;
    }

    // Calculate time difference
    static getTimeAgo(date) {
        const parsedDate = this.parseDate(date);
        if (!parsedDate) return 'Unknown time';
        
        const now = new Date();
        const diff = now - parsedDate;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return '剛剛';
        if (minutes < 60) return `${minutes}分鐘前`;
        if (hours < 24) return `${hours}小時前`;
        if (days < 7) return `${days}天前`;
        return this.formatDate(parsedDate);
    }

    // Calculate estimated time
    static addMinutes(date, minutes) {
        const parsedDate = this.parseDate(date);
        if (!parsedDate) return null;
        
        const result = new Date(parsedDate);
        result.setMinutes(result.getMinutes() + minutes);
        return result;
    }

    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle function
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Generate unique ID
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Deep clone object
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    // Check if object is empty
    static isEmpty(obj) {
        return obj === null || obj === undefined || 
               (typeof obj === 'object' && Object.keys(obj).length === 0) ||
               (typeof obj === 'string' && obj.trim() === '');
    }

    // Capitalize first letter
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Truncate text
    static truncate(text, maxLength = 50) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Validate email
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate phone number (Taiwan format)
    static isValidPhone(phone) {
        const phoneRegex = /^09\d{8}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    }

    // Format phone number
    static formatPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1-$2-$3');
        }
        return phone;
    }

    // Get order status text and color
    static getOrderStatusInfo(status) {
        const statusMap = {
            'PENDING': { text: '待處理', color: '#2196F3', icon: 'clock' },
            'PENDING_PAYMENT': { text: '待付款', color: '#FF5722', icon: 'credit-card' },
            'CONFIRMED': { text: '已確認', color: '#FF9800', icon: 'check-circle' },
            'PREPARING': { text: '準備中', color: '#FF6B35', icon: 'utensils' },
            'READY': { text: '製作完成', color: '#4CAF50', icon: 'bell' },
            'DELIVERED': { text: '已送達', color: '#2E8B57', icon: 'check-double' },
            'COMPLETED': { text: '已完成', color: '#4CAF50', icon: 'check-double' },
            'CANCELLED': { text: '已取消', color: '#999999', icon: 'times-circle' }
        };
        
        return statusMap[status] || { text: '未知狀態', color: '#999999', icon: 'question' };
    }

    // Get payment status info
    static getPaymentStatusInfo(status) {
        const statusMap = {
            'PENDING': { text: '待付款', color: '#FF9800' },
            'PROCESSING': { text: '處理中', color: '#2196F3' },
            'COMPLETED': { text: '已完成', color: '#4CAF50' },
            'FAILED': { text: '失敗', color: '#F44336' },
            'REFUNDED': { text: '已退款', color: '#9E9E9E' }
        };
        
        return statusMap[status] || { text: '未知', color: '#999999' };
    }

    // Calculate tax and total
    static calculateOrderTotal(items, taxRate = 0.1) {
        const subtotal = items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
        
        const tax = Math.round(subtotal * taxRate);
        const total = subtotal + tax;
        
        return { subtotal, tax, total };
    }

    // Get menu category info
    static getCategoryInfo(category) {
        const categories = {
            'APPETIZER': { text: '前菜', icon: '🥗', color: '#4CAF50' },
            'MAIN_COURSE': { text: '主菜', icon: '🍖', color: '#FF6B35' },
            'DESSERT': { text: '甜點', icon: '🧁', color: '#E91E63' },
            'BEVERAGE': { text: '飲料', icon: '🥤', color: '#2196F3' },
            'SOUP': { text: '湯品', icon: '🍲', color: '#FF9800' },
            'SALAD': { text: '沙拉', icon: '🥙', color: '#8BC34A' }
        };
        
        return categories[category] || { text: '其他', icon: '🍽️', color: '#9E9E9E' };
    }

    // Handle image loading errors
    static handleImageError(imgElement, fallbackSrc = 'assets/images/placeholder.svg') {
        imgElement.onerror = null;
        imgElement.src = fallbackSrc;
    }

    // Scroll to element smoothly
    static scrollToElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Show loading state
    static showLoading(element) {
        const originalContent = element.innerHTML;
        element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 載入中...';
        element.disabled = true;
        
        return () => {
            element.innerHTML = originalContent;
            element.disabled = false;
        };
    }

    // Copy text to clipboard
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        }
    }

    // Check if device is mobile
    static isMobile() {
        return window.innerWidth <= 768;
    }

    // Check if device supports touch
    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    // Get device info
    static getDeviceInfo() {
        return {
            mobile: this.isMobile(),
            touch: this.isTouchDevice(),
            width: window.innerWidth,
            height: window.innerHeight,
            userAgent: navigator.userAgent
        };
    }

    // Simple event emitter
    static createEventEmitter() {
        const events = {};
        
        return {
            on(event, callback) {
                if (!events[event]) events[event] = [];
                events[event].push(callback);
            },
            
            off(event, callback) {
                if (events[event]) {
                    events[event] = events[event].filter(cb => cb !== callback);
                }
            },
            
            emit(event, data) {
                if (events[event]) {
                    events[event].forEach(callback => callback(data));
                }
            }
        };
    }

    // Simple state management
    static createStore(initialState = {}) {
        let state = { ...initialState };
        const listeners = [];
        
        return {
            getState() {
                return { ...state };
            },
            
            setState(updates) {
                state = { ...state, ...updates };
                listeners.forEach(listener => listener(state));
            },
            
            subscribe(listener) {
                listeners.push(listener);
                return () => {
                    const index = listeners.indexOf(listener);
                    if (index > -1) listeners.splice(index, 1);
                };
            }
        };
    }
}

// Make Helpers available globally
window.Helpers = Helpers;