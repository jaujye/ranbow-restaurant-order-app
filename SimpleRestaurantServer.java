import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.*;
import java.net.InetSocketAddress;
import java.sql.*;
import java.util.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.math.BigInteger;
import java.util.UUID;
import java.util.regex.Pattern;
import java.io.BufferedReader;
import java.io.InputStreamReader;

/**
 * 簡單的餐廳訂單管理 HTTP 服務器
 * 不依賴 Spring Boot，使用 Java 內建的 HTTP 服務器
 */
public class SimpleRestaurantServer {
    private static final String DB_URL = "jdbc:postgresql://192.168.0.114:5432/ranbow_restaurant";
    private static final String DB_USER = "postgres";
    private static final String DB_PASSWORD = "Patycri3r";
    private static Connection dbConnection;
    
    public static void main(String[] args) throws Exception {
        System.out.println("🍽️ 正在啟動 Ranbow Restaurant Server...");
        
        // 初始化資料庫連接
        initDatabase();
        
        // 創建 HTTP 服務器
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        
        // 註冊 API 端點
        server.createContext("/api/health", new HealthHandler());
        server.createContext("/api/menu", new MenuHandler());
        server.createContext("/api/users", new UserHandler());
        server.createContext("/api/users/authenticate", new AuthHandler());
        server.createContext("/api/orders", new OrderHandler());
        server.createContext("/api/payments", new PaymentHandler());
        
        // 啟動服務器
        server.setExecutor(null);
        server.start();
        
        System.out.println("✅ 服務器已啟動！");
        System.out.println("📡 服務器地址: http://localhost:8080");
        System.out.println("🏥 健康檢查: http://localhost:8080/api/health");
        System.out.println("🍽️ 菜單 API: http://localhost:8080/api/menu");
        System.out.println("\n按 Ctrl+C 停止服務器");
    }
    
    private static void initDatabase() {
        try {
            // 載入 PostgreSQL 驅動程式
            Class.forName("org.postgresql.Driver");
            
            // 建立連接
            dbConnection = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
            
            // 測試連接
            try (Statement stmt = dbConnection.createStatement()) {
                ResultSet rs = stmt.executeQuery("SELECT 'Database connected successfully' as message");
                if (rs.next()) {
                    System.out.println("🗄️ " + rs.getString("message"));
                }
            }
            
        } catch (Exception e) {
            System.err.println("❌ 資料庫連接失敗: " + e.getMessage());
            System.err.println("請確認：");
            System.err.println("1. PostgreSQL 服務正在運行");
            System.err.println("2. 資料庫 'ranbow_restaurant' 已創建");
            System.err.println("3. 已執行 schema.sql 初始化資料庫");
            System.err.println("4. PostgreSQL JDBC 驅動程式在 classpath 中");
            System.exit(1);
        }
    }
    
    // 健康檢查處理器
    static class HealthHandler implements HttpHandler {
        public void handle(HttpExchange exchange) throws IOException {
            // Handle CORS preflight
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
                exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
                exchange.sendResponseHeaders(200, -1);
                return;
            }
            
            if ("GET".equals(exchange.getRequestMethod())) {
                try {
                    // 測試資料庫連接
                    String dbStatus = "Connected";
                    int userCount = 0, menuCount = 0, orderCount = 0;
                    
                    try (Statement stmt = dbConnection.createStatement()) {
                        ResultSet rs = stmt.executeQuery("SELECT 'OK' as status");
                        if (!rs.next()) dbStatus = "Error";
                        
                        rs = stmt.executeQuery("SELECT COUNT(*) as count FROM users");
                        if (rs.next()) userCount = rs.getInt("count");
                        
                        rs = stmt.executeQuery("SELECT COUNT(*) as count FROM menu_items");
                        if (rs.next()) menuCount = rs.getInt("count");
                        
                        rs = stmt.executeQuery("SELECT COUNT(*) as count FROM orders");
                        if (rs.next()) orderCount = rs.getInt("count");
                    }
                    
                    String response = String.format("""
                        {
                            "status": "UP",
                            "timestamp": "%s",
                            "service": "Ranbow Restaurant Order Application",
                            "version": "1.0.0",
                            "database": "%s",
                            "stats": {
                                "totalUsers": %d,
                                "totalMenuItems": %d,
                                "totalOrders": %d
                            },
                            "endpoints": {
                                "health": "/api/health",
                                "menu": "/api/menu",
                                "users": "/api/users",
                                "orders": "/api/orders",
                                "payments": "/api/payments"
                            }
                        }
                        """, LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                        dbStatus, userCount, menuCount, orderCount);
                    
                    sendResponse(exchange, 200, response);
                    
                } catch (Exception e) {
                    String errorResponse = String.format("""
                        {
                            "status": "DOWN",
                            "timestamp": "%s",
                            "error": "%s"
                        }
                        """, LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                        e.getMessage());
                    
                    sendResponse(exchange, 503, errorResponse);
                }
            } else {
                sendResponse(exchange, 405, "{\"error\": \"Method not allowed\"}");
            }
        }
    }
    
    // 菜單處理器
    static class MenuHandler implements HttpHandler {
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            String method = exchange.getRequestMethod();
            
            // Handle CORS preflight
            if ("OPTIONS".equals(method)) {
                exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
                exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
                exchange.sendResponseHeaders(200, -1);
                return;
            }
            
            if ("GET".equals(method)) {
                if (path.endsWith("/menu") || path.endsWith("/menu/available")) {
                    getAvailableMenu(exchange);
                } else {
                    sendResponse(exchange, 404, "{\"error\": \"Endpoint not found\"}");
                }
            } else {
                sendResponse(exchange, 405, "{\"error\": \"Method not allowed\"}");
            }
        }
        
        private void getAvailableMenu(HttpExchange exchange) throws IOException {
            try {
                StringBuilder json = new StringBuilder();
                json.append("[");
                
                String query = """
                    SELECT item_id, name, description, price, category, preparation_time 
                    FROM menu_items 
                    WHERE is_available = true 
                    ORDER BY category, name
                    """;
                
                try (PreparedStatement stmt = dbConnection.prepareStatement(query)) {
                    ResultSet rs = stmt.executeQuery();
                    boolean first = true;
                    
                    while (rs.next()) {
                        if (!first) json.append(",");
                        first = false;
                        
                        json.append(String.format("""
                            {
                                "itemId": "%s",
                                "name": "%s",
                                "description": "%s",
                                "price": %.2f,
                                "category": "%s",
                                "preparationTime": %d,
                                "available": true
                            }
                            """, rs.getString("item_id"),
                            rs.getString("name"),
                            rs.getString("description"),
                            rs.getDouble("price"),
                            rs.getString("category"),
                            rs.getInt("preparation_time")));
                    }
                }
                
                json.append("]");
                sendResponse(exchange, 200, json.toString());
                
            } catch (Exception e) {
                sendResponse(exchange, 500, "{\"error\": \"" + e.getMessage() + "\"}");
            }
        }
    }
    
    // 用戶處理器
    static class UserHandler implements HttpHandler {
        public void handle(HttpExchange exchange) throws IOException {
            String method = exchange.getRequestMethod();
            
            // Handle CORS preflight
            if ("OPTIONS".equals(method)) {
                exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
                exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
                exchange.sendResponseHeaders(200, -1);
                return;
            }
            
            if ("GET".equals(method)) {
                getUserStats(exchange);
            } else if ("POST".equals(method)) {
                createUser(exchange);
            } else {
                sendResponse(exchange, 405, "{\"error\": \"Method not allowed\"}");
            }
        }
        
        private void getUserStats(HttpExchange exchange) throws IOException {
            try {
                int totalUsers = 0, totalCustomers = 0;
                
                String query = "SELECT COUNT(*) as count FROM users WHERE is_active = true";
                try (PreparedStatement stmt = dbConnection.prepareStatement(query)) {
                    ResultSet rs = stmt.executeQuery();
                    if (rs.next()) totalUsers = rs.getInt("count");
                }
                
                query = "SELECT COUNT(*) as count FROM users WHERE role = 'CUSTOMER' AND is_active = true";
                try (PreparedStatement stmt = dbConnection.prepareStatement(query)) {
                    ResultSet rs = stmt.executeQuery();
                    if (rs.next()) totalCustomers = rs.getInt("count");
                }
                
                String response = String.format("""
                    {
                        "totalActiveUsers": %d,
                        "totalCustomers": %d
                    }
                    """, totalUsers, totalCustomers);
                
                sendResponse(exchange, 200, response);
                
            } catch (Exception e) {
                sendResponse(exchange, 500, "{\"error\": \"" + e.getMessage() + "\"}");
            }
        }
        
        private void createUser(HttpExchange exchange) throws IOException {
            try {
                // 讀取請求體
                String requestBody = readRequestBody(exchange);
                
                // 簡單JSON解析 (實際專案建議使用Jackson)
                String username = extractJsonValue(requestBody, "username");
                String email = extractJsonValue(requestBody, "email");
                String phoneNumber = extractJsonValue(requestBody, "phoneNumber");
                String password = extractJsonValue(requestBody, "password");
                String role = extractJsonValue(requestBody, "role");
                if (role == null || role.isEmpty()) {
                    role = "CUSTOMER";
                }
                
                // 驗證輸入
                if (username == null || username.trim().isEmpty()) {
                    sendResponse(exchange, 400, "{\"error\": \"Username is required\"}");
                    return;
                }
                if (email == null || !isValidEmail(email)) {
                    sendResponse(exchange, 400, "{\"error\": \"Valid email is required\"}");
                    return;
                }
                if (password == null || password.length() < 6) {
                    sendResponse(exchange, 400, "{\"error\": \"Password must be at least 6 characters\"}");
                    return;
                }
                
                // 檢查用戶是否已存在
                String checkQuery = "SELECT COUNT(*) as count FROM users WHERE email = ?";
                try (PreparedStatement stmt = dbConnection.prepareStatement(checkQuery)) {
                    stmt.setString(1, email);
                    ResultSet rs = stmt.executeQuery();
                    if (rs.next() && rs.getInt("count") > 0) {
                        sendResponse(exchange, 409, "{\"error\": \"Email already exists\"}");
                        return;
                    }
                }
                
                // 創建新用戶
                String userId = UUID.randomUUID().toString();
                String passwordHash = hashPassword(password);
                
                String insertQuery = "INSERT INTO users (user_id, username, email, phone_number, role, password_hash) VALUES (?, ?, ?, ?, ?::user_role, ?)";
                try (PreparedStatement stmt = dbConnection.prepareStatement(insertQuery)) {
                    stmt.setString(1, userId);
                    stmt.setString(2, username);
                    stmt.setString(3, email);
                    stmt.setString(4, phoneNumber);
                    stmt.setString(5, role);
                    stmt.setString(6, passwordHash);
                    
                    int rowsAffected = stmt.executeUpdate();
                    if (rowsAffected > 0) {
                        String response = String.format(
                            "{\"success\": true, \"user\": {\"userId\": \"%s\", \"username\": \"%s\", \"email\": \"%s\", \"role\": \"%s\"}}",
                            userId, username, email, role
                        );
                        sendResponse(exchange, 201, response);
                    } else {
                        sendResponse(exchange, 500, "{\"error\": \"Failed to create user\"}");
                    }
                }
                
            } catch (Exception e) {
                System.err.println("Error creating user: " + e.getMessage());
                sendResponse(exchange, 500, "{\"error\": \"" + e.getMessage() + "\"}");
            }
        }
    }
    
    // 訂單處理器
    static class OrderHandler implements HttpHandler {
        public void handle(HttpExchange exchange) throws IOException {
            String method = exchange.getRequestMethod();
            
            if ("GET".equals(method)) {
                getOrderStats(exchange);
            } else {
                sendResponse(exchange, 501, "{\"error\": \"Order operations not fully implemented in simple version\"}");
            }
        }
        
        private void getOrderStats(HttpExchange exchange) throws IOException {
            try {
                int totalOrders = 0, todayOrders = 0, completedOrders = 0;
                
                // 總訂單數
                try (PreparedStatement stmt = dbConnection.prepareStatement("SELECT COUNT(*) as count FROM orders")) {
                    ResultSet rs = stmt.executeQuery();
                    if (rs.next()) totalOrders = rs.getInt("count");
                }
                
                // 今日訂單數
                try (PreparedStatement stmt = dbConnection.prepareStatement(
                    "SELECT COUNT(*) as count FROM orders WHERE DATE(order_time) = CURRENT_DATE")) {
                    ResultSet rs = stmt.executeQuery();
                    if (rs.next()) todayOrders = rs.getInt("count");
                }
                
                // 已完成訂單數
                try (PreparedStatement stmt = dbConnection.prepareStatement(
                    "SELECT COUNT(*) as count FROM orders WHERE status = 'COMPLETED'")) {
                    ResultSet rs = stmt.executeQuery();
                    if (rs.next()) completedOrders = rs.getInt("count");
                }
                
                String response = String.format("""
                    {
                        "totalOrders": %d,
                        "todaysOrders": %d,
                        "completedOrders": %d
                    }
                    """, totalOrders, todayOrders, completedOrders);
                
                sendResponse(exchange, 200, response);
                
            } catch (Exception e) {
                sendResponse(exchange, 500, "{\"error\": \"" + e.getMessage() + "\"}");
            }
        }
    }
    
    // 付款處理器
    static class PaymentHandler implements HttpHandler {
        public void handle(HttpExchange exchange) throws IOException {
            sendResponse(exchange, 501, "{\"error\": \"Payment operations not implemented in simple version\"}");
        }
    }
    
    // 認證處理器
    static class AuthHandler implements HttpHandler {
        public void handle(HttpExchange exchange) throws IOException {
            if ("POST".equals(exchange.getRequestMethod())) {
                authenticateUser(exchange);
            } else if ("OPTIONS".equals(exchange.getRequestMethod())) {
                // Handle CORS preflight
                exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
                exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "POST, OPTIONS");
                exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
                exchange.sendResponseHeaders(200, -1);
            } else {
                sendResponse(exchange, 405, "{\"error\": \"Method not allowed\"}");
            }
        }
        
        private void authenticateUser(HttpExchange exchange) throws IOException {
            try {
                String requestBody = readRequestBody(exchange);
                
                // 簡單JSON解析
                String email = extractJsonValue(requestBody, "email");
                String password = extractJsonValue(requestBody, "password");
                
                if (email == null || password == null) {
                    sendResponse(exchange, 400, "{\"error\": \"Email and password are required\"}");
                    return;
                }
                
                // 驗證用戶
                String query = "SELECT user_id, username, email, role, password_hash, is_active FROM users WHERE email = ?";
                try (PreparedStatement stmt = dbConnection.prepareStatement(query)) {
                    stmt.setString(1, email);
                    ResultSet rs = stmt.executeQuery();
                    
                    if (rs.next()) {
                        String storedHash = rs.getString("password_hash");
                        boolean isActive = rs.getBoolean("is_active");
                        
                        if (!isActive) {
                            sendResponse(exchange, 401, "{\"error\": \"Account is deactivated\"}");
                            return;
                        }
                        
                        if (verifyPassword(password, storedHash)) {
                            // 更新最後登入時間
                            String updateQuery = "UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE email = ?";
                            try (PreparedStatement updateStmt = dbConnection.prepareStatement(updateQuery)) {
                                updateStmt.setString(1, email);
                                updateStmt.executeUpdate();
                            }
                            
                            // 生成簡單的token (在生產環境中應使用JWT)
                            String token = generateSimpleToken(rs.getString("user_id"));
                            
                            String response = String.format(
                                "{\"success\": true, \"token\": \"%s\", \"user\": {\"userId\": \"%s\", \"username\": \"%s\", \"email\": \"%s\", \"role\": \"%s\"}}",
                                token, rs.getString("user_id"), rs.getString("username"), email, rs.getString("role")
                            );
                            sendResponse(exchange, 200, response);
                        } else {
                            sendResponse(exchange, 401, "{\"error\": \"Invalid credentials\"}");
                        }
                    } else {
                        sendResponse(exchange, 401, "{\"error\": \"Invalid credentials\"}");
                    }
                }
                
            } catch (Exception e) {
                System.err.println("Error authenticating user: " + e.getMessage());
                sendResponse(exchange, 500, "{\"error\": \"Authentication failed\"}");
            }
        }
    }
    
    // 輔助方法
    private static String readRequestBody(HttpExchange exchange) throws IOException {
        StringBuilder body = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                body.append(line);
            }
        }
        return body.toString();
    }
    
    private static boolean isValidEmail(String email) {
        String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@" +
                           "(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
        Pattern pattern = Pattern.compile(emailRegex);
        return pattern.matcher(email).matches();
    }
    
    private static String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hashedBytes = md.digest(password.getBytes(StandardCharsets.UTF_8));
            BigInteger number = new BigInteger(1, hashedBytes);
            StringBuilder hexString = new StringBuilder(number.toString(16));
            while (hexString.length() < 32) {
                hexString.insert(0, '0');
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }
    
    private static boolean verifyPassword(String password, String hash) {
        return hashPassword(password).equals(hash);
    }
    
    private static String generateSimpleToken(String userId) {
        // 簡單的token生成 (生產環境應使用JWT)
        return "token_" + userId + "_" + System.currentTimeMillis();
    }
    
    // 簡單JSON解析方法
    private static String extractJsonValue(String json, String key) {
        try {
            String searchKey = "\"" + key + "\"";
            int startIndex = json.indexOf(searchKey);
            if (startIndex == -1) {
                return null;
            }
            
            startIndex = json.indexOf(":", startIndex) + 1;
            startIndex = json.indexOf("\"", startIndex) + 1;
            
            if (startIndex == 0) {
                return null;
            }
            
            int endIndex = json.indexOf("\"", startIndex);
            if (endIndex == -1) {
                return null;
            }
            
            return json.substring(startIndex, endIndex).trim();
        } catch (Exception e) {
            return null;
        }
    }
    
    // 發送 HTTP 響應的輔助方法
    private static void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        // 設置響應標頭
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        // 發送響應
        byte[] responseBytes = response.getBytes("UTF-8");
        exchange.sendResponseHeaders(statusCode, responseBytes.length);
        
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(responseBytes);
        }
        
        // 記錄請求
        System.out.println(String.format("[%s] %s %s - %d", 
            LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
            exchange.getRequestMethod(),
            exchange.getRequestURI().getPath(),
            statusCode));
    }
}