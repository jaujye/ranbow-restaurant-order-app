// API utility functions for Ranbow Restaurant App

class API {
    constructor() {
        this.baseURL = 'http://localhost:8080/api';
        this.token = localStorage.getItem('authToken');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    // Clear authentication token
    clearToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    // Get headers for requests
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Generic fetch wrapper
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const config = {
                headers: this.getHeaders(),
                ...options
            };

            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // GET request
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST request
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // === USER ENDPOINTS ===
    
    // User authentication
    async login(email, password) {
        return this.post('/users/authenticate', { email, password });
    }

    // User registration
    async register(userData) {
        return this.post('/users', userData);
    }

    // Get user profile
    async getUserProfile(userId) {
        return this.get(`/users/${userId}`);
    }

    // Update user profile
    async updateUserProfile(userId, userData) {
        return this.put(`/users/${userId}`, userData);
    }

    // === MENU ENDPOINTS ===
    
    // Get all menu items
    async getMenuItems() {
        return this.get('/menu');
    }

    // Get menu item by ID
    async getMenuItem(itemId) {
        return this.get(`/menu/${itemId}`);
    }

    // Get popular menu items
    async getPopularItems() {
        return this.get('/menu/popular');
    }

    // Search menu items
    async searchMenuItems(keyword) {
        return this.get(`/menu/search?keyword=${encodeURIComponent(keyword)}`);
    }

    // Get menu items by category
    async getMenuByCategory(category) {
        return this.get(`/menu/category/${category}`);
    }

    // === ORDER ENDPOINTS ===
    
    // Create new order
    async createOrder(orderData) {
        return this.post('/orders', orderData);
    }

    // Get order by ID
    async getOrder(orderId) {
        return this.get(`/orders/${orderId}`);
    }

    // Get customer orders
    async getCustomerOrders(customerId) {
        return this.get(`/orders/customer/${customerId}`);
    }

    // Update order status
    async updateOrderStatus(orderId, status) {
        return this.put(`/orders/${orderId}/status`, { status });
    }

    // Cancel order
    async cancelOrder(orderId, cancelData) {
        return this.put(`/orders/${orderId}/cancel`, cancelData);
    }

    // Get pending orders (for staff)
    async getPendingOrders() {
        return this.get('/orders/pending');
    }

    // === PAYMENT ENDPOINTS ===
    
    // Create payment
    async createPayment(paymentData) {
        return this.post('/payments', paymentData);
    }

    // Process payment
    async processPayment(paymentId) {
        return this.post(`/payments/${paymentId}/process`);
    }

    // Get payment status
    async getPaymentStatus(paymentId) {
        return this.get(`/payments/${paymentId}`);
    }

    // === ADMIN ENDPOINTS ===
    
    // Get dashboard data
    async getDashboardData() {
        return this.get('/admin/dashboard');
    }

    // Get all users (admin)
    async getAllUsers() {
        return this.get('/admin/users');
    }

    // Create menu item (admin)
    async createMenuItem(itemData) {
        return this.post('/admin/menu', itemData);
    }

    // Update menu item (admin)
    async updateMenuItem(itemId, itemData) {
        return this.put(`/admin/menu/${itemId}`, itemData);
    }

    // Delete menu item (admin)
    async deleteMenuItem(itemId) {
        return this.delete(`/admin/menu/${itemId}`);
    }

    // Get reports
    async getRevenueReport() {
        return this.get('/admin/reports/revenue');
    }

    async getPerformanceReport() {
        return this.get('/admin/reports/performance');
    }

    // === HEALTH CHECK ===
    
    async healthCheck() {
        return this.get('/health');
    }
}

// Create global API instance
window.api = new API();