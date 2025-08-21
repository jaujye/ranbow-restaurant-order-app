package com.ranbow.restaurant.api;

import com.ranbow.restaurant.models.*;
import com.ranbow.restaurant.services.*;
import com.ranbow.restaurant.models.AuditLog;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private MenuService menuService;
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private ReportService reportService;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private SessionService sessionService;
    
    @Autowired
    private AuditService auditService;
    
    // ============ AUTHENTICATION APIs ============
    
    @PostMapping("/auth/login")
    public ResponseEntity<?> adminLogin(@RequestBody AdminLoginRequest request, HttpServletRequest httpRequest) {
        try {
            System.out.println("Admin login attempt for email: " + request.getEmail());
            
            Optional<User> adminOpt = adminService.authenticateAdmin(request.getEmail(), request.getPassword());
            
            if (adminOpt.isPresent()) {
                User admin = adminOpt.get();
                System.out.println("Admin authenticated: " + admin.getUserId());
                
                // Get admin permissions
                List<AdminPermission> permissions = adminService.getAdminPermissions(admin);
                
                // Get device info and IP
                String deviceInfo = getDeviceInfo(httpRequest);
                String ipAddress = getClientIpAddress(httpRequest);
                
                // Create admin session
                String sessionId = sessionService.createSession(admin.getUserId(), deviceInfo, ipAddress);
                
                // Generate JWT token with admin context
                String token = jwtService.generateToken(admin.getUserId(), sessionId, deviceInfo);
                
                // Log successful admin login
                auditService.logSuccess(admin.getUserId(), admin.getUsername(), "ADMIN_LOGIN", 
                                      "SESSION", sessionId, ipAddress, deviceInfo);
                
                // Prepare admin info response
                Map<String, Object> adminInfo = new HashMap<>();
                adminInfo.put("id", admin.getUserId());
                adminInfo.put("name", admin.getUsername());
                adminInfo.put("email", admin.getEmail());
                adminInfo.put("role", admin.getRole());
                adminInfo.put("permissions", permissions);
                adminInfo.put("avatar", admin.getAvatarUrl());
                adminInfo.put("lastLogin", admin.getLastLoginAt());
                
                return ResponseEntity.ok(createSuccessResponse(Map.of(
                        "token", token,
                        "refreshToken", sessionId, // Using session ID as refresh token
                        "adminInfo", adminInfo,
                        "expiresIn", 7200 // 2 hours
                ), "管理員登入成功"));
                
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("登入失敗：無效的憑證或權限不足", 401));
            }
            
        } catch (Exception e) {
            System.err.println("Admin login failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("登入服務異常：" + e.getMessage(), 500));
        }
    }
    
    @PostMapping("/auth/logout")
    public ResponseEntity<?> adminLogout(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = extractTokenFromHeader(authHeader);
            if (token != null) {
                JwtService.TokenInfo tokenInfo = jwtService.validateToken(token);
                if (tokenInfo != null) {
                    sessionService.invalidateSession(tokenInfo.getSessionId());
                    return ResponseEntity.ok(createSuccessResponse(null, "管理員登出成功"));
                }
            }
            return ResponseEntity.badRequest()
                    .body(createErrorResponse("無效的認證令牌", 400));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("登出失敗", 500));
        }
    }
    
    @GetMapping("/auth/verify")
    public ResponseEntity<?> verifyAdminToken(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = extractTokenFromHeader(authHeader);
            if (token != null) {
                JwtService.TokenInfo tokenInfo = jwtService.validateToken(token);
                if (tokenInfo != null) {
                    Optional<User> adminOpt = userService.findUserById(tokenInfo.getUserId());
                    if (adminOpt.isPresent() && adminOpt.get().getRole() == UserRole.ADMIN) {
                        User admin = adminOpt.get();
                        List<AdminPermission> permissions = adminService.getAdminPermissions(admin);
                        
                        Map<String, Object> adminInfo = new HashMap<>();
                        adminInfo.put("id", admin.getUserId());
                        adminInfo.put("name", admin.getUsername());
                        adminInfo.put("email", admin.getEmail());
                        adminInfo.put("role", admin.getRole());
                        adminInfo.put("permissions", permissions);
                        
                        return ResponseEntity.ok(createSuccessResponse(Map.of(
                                "valid", true,
                                "adminInfo", adminInfo,
                                "permissions", permissions
                        ), "令牌驗證成功"));
                    }
                }
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("無效或過期的認證令牌", 401));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("令牌驗證失敗", 500));
        }
    }
    
    // ============ DASHBOARD APIs ============
    
    @GetMapping("/dashboard/overview")
    public ResponseEntity<?> getDashboardOverview(@RequestHeader("Authorization") String authHeader) {
        try {
            if (!isValidAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("需要管理員權限", 401));
            }
            
            DashboardOverview overview = adminService.getDashboardOverview();
            return ResponseEntity.ok(createSuccessResponse(overview, "儀表板數據獲取成功"));
            
        } catch (Exception e) {
            System.err.println("Dashboard overview failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("儀表板數據獲取失敗", 500));
        }
    }
    
    // ============ USER MANAGEMENT APIs ============
    
    @GetMapping("/users")
    public ResponseEntity<?> getUserManagement(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        
        try {
            if (!isValidAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("需要管理員權限", 401));
            }
            
            Map<String, Object> userManagementData = adminService.getUserManagementData(page, size, role, status, search);
            return ResponseEntity.ok(createSuccessResponse(userManagementData, "用戶管理數據獲取成功"));
            
        } catch (Exception e) {
            System.err.println("User management failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("用戶管理數據獲取失敗", 500));
        }
    }
    
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String userId,
            @RequestBody Map<String, Object> request) {
        
        try {
            if (!isValidAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("需要管理員權限", 401));
            }
            
            boolean active = (Boolean) request.get("active");
            boolean success = active ? userService.activateUser(userId) : userService.deactivateUser(userId);
            
            if (success) {
                // Log the user status change
                String adminId = getCurrentAdminId(authHeader);
                String adminName = getCurrentAdminName(authHeader);
                String action = active ? "USER_ACTIVATE" : "USER_DEACTIVATE";
                auditService.logSuccess(adminId, adminName, action, "USER", userId, 
                                      getClientIpAddress(null), "Admin Panel");
                
                String message = active ? "用戶已激活" : "用戶已停用";
                return ResponseEntity.ok(createSuccessResponse(Map.of("success", true), message));
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("用戶狀態更新失敗", 500));
        }
    }
    
    // ============ MENU MANAGEMENT APIs ============
    
    @GetMapping("/menu")
    public ResponseEntity<?> getMenuManagement(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        
        try {
            if (!isValidAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("需要管理員權限", 401));
            }
            
            Map<String, Object> menuManagementData = adminService.getMenuManagementData(category, status, search);
            return ResponseEntity.ok(createSuccessResponse(menuManagementData, "菜單管理數據獲取成功"));
            
        } catch (Exception e) {
            System.err.println("Menu management failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("菜單管理數據獲取失敗", 500));
        }
    }
    
    @PostMapping("/menu/items")
    public ResponseEntity<?> createMenuItem(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody CreateMenuItemRequest request) {
        
        try {
            if (!isValidAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("需要管理員權限", 401));
            }
            
            MenuItem newItem = menuService.createMenuItem(
                    request.getName(),
                    request.getDescription(),
                    request.getPrice(),
                    request.getCategory(),
                    request.getImageUrl()
            );
            
            // Log menu item creation
            String adminId = getCurrentAdminId(authHeader);
            String adminName = getCurrentAdminName(authHeader);
            auditService.logSuccess(adminId, adminName, "MENU_ITEM_CREATE", "MENU_ITEM", newItem.getItemId(), 
                                  getClientIpAddress(null), "Admin Panel");
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(createSuccessResponse(newItem, "菜品創建成功"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("菜品創建失敗：" + e.getMessage(), 500));
        }
    }
    
    @PutMapping("/menu/items/{itemId}")
    public ResponseEntity<?> updateMenuItem(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String itemId,
            @Valid @RequestBody UpdateMenuItemRequest request) {
        
        try {
            if (!isValidAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("需要管理員權限", 401));
            }
            
            MenuItem updatedItem = menuService.updateMenuItem(itemId, request);
            if (updatedItem != null) {
                return ResponseEntity.ok(createSuccessResponse(updatedItem, "菜品更新成功"));
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("菜品更新失敗：" + e.getMessage(), 500));
        }
    }
    
    @DeleteMapping("/menu/items/{itemId}")
    public ResponseEntity<?> deleteMenuItem(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String itemId) {
        
        try {
            if (!isValidAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("需要管理員權限", 401));
            }
            
            boolean success = menuService.deleteMenuItem(itemId);
            if (success) {
                return ResponseEntity.ok(createSuccessResponse(Map.of("success", true), "菜品刪除成功"));
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("菜品刪除失敗", 500));
        }
    }
    
    @PostMapping("/menu/bulk-update")
    public ResponseEntity<?> bulkUpdateMenuItems(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody BulkMenuUpdateRequest request) {
        
        try {
            if (!isValidAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("需要管理員權限", 401));
            }
            
            // Process bulk operations
            Map<String, Object> result = menuService.bulkUpdateMenuItems(request);
            return ResponseEntity.ok(createSuccessResponse(result, "批量操作執行成功"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("批量操作失敗：" + e.getMessage(), 500));
        }
    }
    
    // ============ ORDER MANAGEMENT APIs ============
    
    @GetMapping("/orders")
    public ResponseEntity<?> getOrderManagement(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority) {
        
        try {
            if (!isValidAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("需要管理員權限", 401));
            }
            
            // Get all orders with filtering
            List<Order> allOrders = orderService.getAllOrders();
            
            // Apply filters (simplified - should be done in service layer)
            if (status != null && !status.equals("all")) {
                OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
                allOrders = allOrders.stream()
                        .filter(order -> order.getStatus() == orderStatus)
                        .collect(java.util.stream.Collectors.toList());
            }
            
            // Pagination
            int totalElements = allOrders.size();
            int totalPages = (int) Math.ceil((double) totalElements / size);
            int startIndex = page * size;
            int endIndex = Math.min(startIndex + size, totalElements);
            
            List<Order> paginatedOrders = allOrders.subList(startIndex, endIndex);
            
            Map<String, Object> result = new HashMap<>();
            result.put("orders", paginatedOrders);
            result.put("totalElements", totalElements);
            result.put("totalPages", totalPages);
            result.put("currentPage", page);
            result.put("size", size);
            
            return ResponseEntity.ok(createSuccessResponse(result, "訂單管理數據獲取成功"));
            
        } catch (Exception e) {
            System.err.println("Order management failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("訂單管理數據獲取失敗", 500));
        }
    }
    
    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String orderId,
            @RequestBody Map<String, String> request) {
        
        try {
            if (!isValidAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("需要管理員權限", 401));
            }
            
            String status = request.get("status");
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            
            boolean updated = orderService.updateOrderStatus(orderId, orderStatus);
            if (updated) {
                return ResponseEntity.ok(createSuccessResponse(Map.of("success", true), "訂單狀態更新成功"));
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("訂單狀態更新失敗：" + e.getMessage(), 500));
        }
    }
    
    // ============ REPORTS APIs ============
    
    @GetMapping("/reports/sales")
    public ResponseEntity<?> getSalesReport(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(defaultValue = "daily") String period) {
        
        try {
            if (!isValidAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("需要管理員權限", 401));
            }
            
            Map<String, Object> salesReport = reportService.generateSalesReport(startDate, endDate, period);
            return ResponseEntity.ok(createSuccessResponse(salesReport, "銷售報表生成成功"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("銷售報表生成失敗：" + e.getMessage(), 500));
        }
    }
    
    // ============ SYSTEM SETTINGS APIs ============
    
    @GetMapping("/settings")
    public ResponseEntity<?> getSystemSettings(@RequestHeader("Authorization") String authHeader) {
        try {
            if (!isValidAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("需要管理員權限", 401));
            }
            
            // Mock system settings
            Map<String, Object> settings = new HashMap<>();
            settings.put("restaurantName", "彩虹餐廳");
            settings.put("currency", "TWD");
            settings.put("timezone", "Asia/Taipei");
            settings.put("taxRate", 0.05);
            settings.put("serviceCharge", 0.10);
            settings.put("maxTableCapacity", 8);
            settings.put("operatingHours", Map.of(
                    "monday", Map.of("open", "11:00", "close", "22:00"),
                    "tuesday", Map.of("open", "11:00", "close", "22:00"),
                    "wednesday", Map.of("open", "11:00", "close", "22:00"),
                    "thursday", Map.of("open", "11:00", "close", "22:00"),
                    "friday", Map.of("open", "11:00", "close", "23:00"),
                    "saturday", Map.of("open", "10:00", "close", "23:00"),
                    "sunday", Map.of("open", "10:00", "close", "22:00")
            ));
            
            return ResponseEntity.ok(createSuccessResponse(settings, "系統設定獲取成功"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("系統設定獲取失敗", 500));
        }
    }
    
    // ============ AUDIT LOG APIs ============
    
    @GetMapping("/audit/logs")
    public ResponseEntity<?> getAuditLogs(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String adminId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String resourceType,
            @RequestParam(defaultValue = "100") int limit) {
        
        try {
            if (!isValidAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("需要管理員權限", 401));
            }
            
            List<AuditLog> logs = auditService.getAuditLogs(adminId, action, resourceType, null, null, limit);
            AuditService.AuditStatistics stats = auditService.getAuditStatistics();
            
            Map<String, Object> result = new HashMap<>();
            result.put("logs", logs);
            result.put("statistics", stats);
            
            return ResponseEntity.ok(createSuccessResponse(result, "審計日誌獲取成功"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("審計日誌獲取失敗", 500));
        }
    }
    
    @GetMapping("/audit/recent")
    public ResponseEntity<?> getRecentAuditLogs(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "50") int limit) {
        
        try {
            if (!isValidAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("需要管理員權限", 401));
            }
            
            List<AuditLog> recentLogs = auditService.getRecentAuditLogs(limit);
            return ResponseEntity.ok(createSuccessResponse(recentLogs, "最近審計日誌獲取成功"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("審計日誌獲取失敗", 500));
        }
    }
    
    // ============ HELPER METHODS ============
    
    private String getCurrentAdminId(String authHeader) {
        try {
            String token = extractTokenFromHeader(authHeader);
            if (token != null) {
                JwtService.TokenInfo tokenInfo = jwtService.validateToken(token);
                if (tokenInfo != null) {
                    return tokenInfo.getUserId();
                }
            }
            return "unknown";
        } catch (Exception e) {
            return "unknown";
        }
    }
    
    private String getCurrentAdminName(String authHeader) {
        try {
            String adminId = getCurrentAdminId(authHeader);
            if (!"unknown".equals(adminId)) {
                Optional<User> adminOpt = userService.findUserById(adminId);
                if (adminOpt.isPresent()) {
                    return adminOpt.get().getUsername();
                }
            }
            return "unknown";
        } catch (Exception e) {
            return "unknown";
        }
    }
    
    private boolean isValidAdminToken(String authHeader) {
        try {
            String token = extractTokenFromHeader(authHeader);
            if (token != null) {
                JwtService.TokenInfo tokenInfo = jwtService.validateToken(token);
                if (tokenInfo != null) {
                    Optional<User> userOpt = userService.findUserById(tokenInfo.getUserId());
                    return userOpt.isPresent() && userOpt.get().getRole() == UserRole.ADMIN;
                }
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }
    
    private String extractTokenFromHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
    
    private String getDeviceInfo(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null) return "Unknown Device";
        
        if (userAgent.contains("Mobile")) return "Mobile Device";
        else if (userAgent.contains("Chrome")) return "Chrome Browser";
        else if (userAgent.contains("Firefox")) return "Firefox Browser";
        else if (userAgent.contains("Safari")) return "Safari Browser";
        else return "Desktop Browser";
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    private Map<String, Object> createSuccessResponse(Object data, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("code", 200);
        response.put("message", message);
        response.put("data", data);
        response.put("timestamp", LocalDateTime.now());
        response.put("requestId", UUID.randomUUID().toString());
        return response;
    }
    
    private Map<String, Object> createErrorResponse(String message, int code) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("code", code);
        response.put("message", message);
        response.put("data", null);
        response.put("timestamp", LocalDateTime.now());
        response.put("requestId", UUID.randomUUID().toString());
        return response;
    }
    
    // ============ DTO CLASSES ============
    
    public static class AdminLoginRequest {
        private String email;
        private String password;
        private String role;
        private boolean rememberMe;
        
        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        
        public boolean isRememberMe() { return rememberMe; }
        public void setRememberMe(boolean rememberMe) { this.rememberMe = rememberMe; }
    }
    
    public static class CreateMenuItemRequest {
        private String name;
        private String description;
        private double price;
        private MenuCategory category;
        private String imageUrl;
        
        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }
        
        public MenuCategory getCategory() { return category; }
        public void setCategory(MenuCategory category) { this.category = category; }
        
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }
    
    public static class UpdateMenuItemRequest {
        private String name;
        private String description;
        private Double price;
        private MenuCategory category;
        private String imageUrl;
        private Boolean available;
        
        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }
        
        public MenuCategory getCategory() { return category; }
        public void setCategory(MenuCategory category) { this.category = category; }
        
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        
        public Boolean getAvailable() { return available; }
        public void setAvailable(Boolean available) { this.available = available; }
    }
    
    public static class BulkMenuUpdateRequest {
        private List<String> itemIds;
        private String operation; // "price_increase", "price_decrease", "set_available", "set_unavailable"
        private Double value; // For price operations
        
        // Getters and setters
        public List<String> getItemIds() { return itemIds; }
        public void setItemIds(List<String> itemIds) { this.itemIds = itemIds; }
        
        public String getOperation() { return operation; }
        public void setOperation(String operation) { this.operation = operation; }
        
        public Double getValue() { return value; }
        public void setValue(Double value) { this.value = value; }
    }
}