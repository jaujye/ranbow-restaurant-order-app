// Local Storage utility functions

class Storage {
    // User data
    static setUser(userData) {
        localStorage.setItem('user', JSON.stringify(userData));
    }

    static getUser() {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    }

    static clearUser() {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
    }

    // Cart management
    static getCart() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }

    static setCart(cartItems) {
        localStorage.setItem('cart', JSON.stringify(cartItems));
        this.updateCartBadge();
    }

    static addToCart(item) {
        const cart = this.getCart();
        const existingItem = cart.find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += item.quantity || 1;
            if (item.specialRequests) {
                existingItem.specialRequests = item.specialRequests;
            }
        } else {
            cart.push({
                ...item,
                quantity: item.quantity || 1
            });
        }
        
        this.setCart(cart);
        return cart;
    }

    static removeFromCart(itemId) {
        const cart = this.getCart();
        const updatedCart = cart.filter(item => item.id !== itemId);
        this.setCart(updatedCart);
        return updatedCart;
    }

    static updateCartItem(itemId, updates) {
        const cart = this.getCart();
        const itemIndex = cart.findIndex(item => item.id === itemId);
        
        if (itemIndex !== -1) {
            cart[itemIndex] = { ...cart[itemIndex], ...updates };
            this.setCart(cart);
        }
        
        return cart;
    }

    static clearCart() {
        localStorage.removeItem('cart');
        this.updateCartBadge();
    }

    static getCartTotal() {
        const cart = this.getCart();
        return cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    static getCartItemCount() {
        const cart = this.getCart();
        return cart.reduce((count, item) => count + item.quantity, 0);
    }

    static updateCartBadge() {
        const count = this.getCartItemCount();
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    // App preferences
    static setPreference(key, value) {
        const preferences = this.getPreferences();
        preferences[key] = value;
        localStorage.setItem('preferences', JSON.stringify(preferences));
    }

    static getPreference(key, defaultValue = null) {
        const preferences = this.getPreferences();
        return preferences[key] !== undefined ? preferences[key] : defaultValue;
    }

    static getPreferences() {
        const preferences = localStorage.getItem('preferences');
        return preferences ? JSON.parse(preferences) : {};
    }

    // Recent searches
    static addRecentSearch(keyword) {
        const searches = this.getRecentSearches();
        const filtered = searches.filter(search => search !== keyword);
        filtered.unshift(keyword);
        
        // Keep only last 10 searches
        const limited = filtered.slice(0, 10);
        localStorage.setItem('recentSearches', JSON.stringify(limited));
    }

    static getRecentSearches() {
        const searches = localStorage.getItem('recentSearches');
        return searches ? JSON.parse(searches) : [];
    }

    static clearRecentSearches() {
        localStorage.removeItem('recentSearches');
    }

    // Table number
    static setTableNumber(tableNumber) {
        localStorage.setItem('tableNumber', tableNumber);
    }

    static getTableNumber() {
        return localStorage.getItem('tableNumber');
    }

    static clearTableNumber() {
        localStorage.removeItem('tableNumber');
    }

    // Order history cache
    static cacheOrder(order) {
        const orders = this.getCachedOrders();
        const existingIndex = orders.findIndex(o => o.id === order.id);
        
        if (existingIndex !== -1) {
            orders[existingIndex] = order;
        } else {
            orders.unshift(order);
        }
        
        // Keep only last 50 orders
        const limited = orders.slice(0, 50);
        localStorage.setItem('cachedOrders', JSON.stringify(limited));
    }

    static getCachedOrders() {
        const orders = localStorage.getItem('cachedOrders');
        return orders ? JSON.parse(orders) : [];
    }

    static getCachedOrder(orderId) {
        const orders = this.getCachedOrders();
        return orders.find(order => order.id === orderId);
    }

    // App state
    static setState(key, value) {
        const state = this.getState();
        state[key] = value;
        sessionStorage.setItem('appState', JSON.stringify(state));
    }

    static getState(key = null) {
        const state = sessionStorage.getItem('appState');
        const stateObj = state ? JSON.parse(state) : {};
        return key ? stateObj[key] : stateObj;
    }

    static clearState(key = null) {
        if (key) {
            const state = this.getState();
            delete state[key];
            sessionStorage.setItem('appState', JSON.stringify(state));
        } else {
            sessionStorage.removeItem('appState');
        }
    }

    // Clear all data
    static clearAll() {
        localStorage.clear();
        sessionStorage.clear();
    }

    // Data export/import for debugging
    static exportData() {
        const data = {
            localStorage: { ...localStorage },
            sessionStorage: { ...sessionStorage }
        };
        return JSON.stringify(data, null, 2);
    }

    static importData(dataString) {
        try {
            const data = JSON.parse(dataString);
            
            // Import localStorage
            if (data.localStorage) {
                Object.keys(data.localStorage).forEach(key => {
                    localStorage.setItem(key, data.localStorage[key]);
                });
            }
            
            // Import sessionStorage
            if (data.sessionStorage) {
                Object.keys(data.sessionStorage).forEach(key => {
                    sessionStorage.setItem(key, data.sessionStorage[key]);
                });
            }
            
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }
}

// Initialize cart badge on page load
document.addEventListener('DOMContentLoaded', () => {
    Storage.updateCartBadge();
});

// Make Storage available globally
window.Storage = Storage;