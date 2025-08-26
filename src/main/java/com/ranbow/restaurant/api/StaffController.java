package com.ranbow.restaurant.api;

import com.ranbow.restaurant.models.*;
import com.ranbow.restaurant.services.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Staff API Controller for restaurant staff operations
 * Handles authentication, order management, kitchen operations, and staff statistics
 */
@RestController
@RequestMapping("/staff")
@CrossOrigin(origins = "*") 
public class StaffController {

    @Autowired
    private StaffService staffService;
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private KitchenService kitchenService;
    
    @Autowired
    private StaffStatisticsService statisticsService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private SessionService sessionService;

    // ================================
    // TEST ENDPOINTS FOR DEBUGGING
    // ================================
    
    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        return ResponseEntity.ok(Map.of("status", "test working", "message", "Staff controller is active", "timestamp", System.currentTimeMillis()));
    }

    // ================================
    // STAFF AUTHENTICATION ENDPOINTS
    // ================================

    /**
     * Staff login with employee ID/email and password
     * POST /api/staff/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> staffLogin(@RequestBody StaffLoginRequest request) {
        try {
            Optional<Staff> staffOpt = staffService.authenticateStaff(request.getIdentifier(), request.getPassword());
            
            if (staffOpt.isPresent()) {
                Staff staff = staffOpt.get();
                Optional<StaffService.StaffProfile> profileOpt = staffService.getStaffProfile(staff.getStaffId());
                
                if (profileOpt.isPresent()) {
                    StaffService.StaffProfile profile = profileOpt.get();
                    
                    // Start shift if not already on duty
                    if (!staff.isOnDuty()) {
                        staffService.startShift(staff.getStaffId());
                    }
                    
                    // Generate session ID and JWT tokens
                    String sessionId = sessionService.createSession(staff.getStaffId(), "Staff Portal", "127.0.0.1");
                    String token = jwtService.generateToken(staff.getStaffId(), sessionId, "Staff Portal");
                    String refreshToken = jwtService.generateToken(staff.getStaffId(), sessionId + "_refresh", "Staff Portal");
                    
                    return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "登入成功",
                        "staff", profile,
                        "token", token,
                        "refreshToken", refreshToken,
                        "sessionId", sessionId,
                        "expiresIn", 8 * 60 * 60, // 8 hours in seconds
                        "unreadNotifications", notificationService.countUnreadNotifications(staff.getStaffId())
                    ));
                }
            }
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "登入失敗", "message", "帳號或密碼錯誤"));
                
        } catch (Exception e) {
            System.err.println("Error in staff login: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "系統錯誤", "details", e.getMessage()));
        }
    }

    /**
     * Get staff profile information
     * GET /api/staff/profile/{staffId}
     */
    @GetMapping("/profile/{staffId}")
    public ResponseEntity<?> getStaffProfile(@PathVariable String staffId) {
        try {
            Optional<StaffService.StaffProfile> profileOpt = staffService.getStaffProfile(staffId);
            
            if (profileOpt.isPresent()) {
                StaffService.StaffProfile profile = profileOpt.get();
                return ResponseEntity.ok(Map.of(
                    "profile", profile,
                    "todayStats", statisticsService.getDailyStatistics(staffId, LocalDate.now()).orElse(null),
                    "unreadNotifications", notificationService.countUnreadNotifications(staffId)
                ));
            }
            
            return ResponseEntity.notFound().build();
            
        } catch (Exception e) {
            System.err.println("Error getting staff profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "無法載入員工資料", "details", e.getMessage()));
        }
    }

    /**
     * Quick staff switching functionality
     * POST /api/staff/switch
     */
    @PostMapping("/switch")
    public ResponseEntity<?> switchStaff(@RequestBody StaffSwitchRequest request) {
        try {
            boolean success = staffService.switchStaff(request.getFromStaffId(), request.getToStaffId());
            
            if (success) {
                Optional<StaffService.StaffProfile> newProfileOpt = staffService.getStaffProfile(request.getToStaffId());
                
                if (newProfileOpt.isPresent()) {
                    return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "員工切換成功",
                        "newStaff", newProfileOpt.get()
                    ));
                }
            }
            
            return ResponseEntity.badRequest()
                .body(Map.of("error", "員工切換失敗", "message", "請檢查員工狀態"));
                
        } catch (Exception e) {
            System.err.println("Error in staff switching: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "系統錯誤", "details", e.getMessage()));
        }
    }

    /**
     * Get available staff for switching
     * GET /api/staff/available/{currentStaffId}
     */
    @GetMapping("/available/{currentStaffId}")
    public ResponseEntity<?> getAvailableStaff(@PathVariable String currentStaffId) {
        try {
            List<Staff> availableStaff = staffService.getAvailableStaffForSwitching(currentStaffId);
            return ResponseEntity.ok(availableStaff);
            
        } catch (Exception e) {
            System.err.println("Error getting available staff: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "無法載入員工列表", "details", e.getMessage()));
        }
    }

    // ================================
    // DASHBOARD ENDPOINTS
    // ================================

    /**
     * Get dashboard data for staff
     * GET /api/staff/dashboard/{staffId}
     */
    @GetMapping("/dashboard/{staffId}")
    public ResponseEntity<?> getDashboardData(@PathVariable String staffId) {
        try {
            // 基本驗證
            if (staffId == null || staffId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "error", "無效的員工ID"));
            }

            // 獲取訂單統計 - 使用null安全方法
            int pendingCount = 0, confirmedCount = 0, preparingCount = 0, readyCount = 0;
            try {
                List<Order> pendingOrders = orderService.getOrdersByStatus(OrderStatus.PENDING);
                pendingCount = pendingOrders != null ? pendingOrders.size() : 0;
                
                List<Order> confirmedOrders = orderService.getOrdersByStatus(OrderStatus.CONFIRMED);
                confirmedCount = confirmedOrders != null ? confirmedOrders.size() : 0;
                
                List<Order> preparingOrders = orderService.getOrdersByStatus(OrderStatus.PREPARING);
                preparingCount = preparingOrders != null ? preparingOrders.size() : 0;
                
                List<Order> readyOrders = orderService.getOrdersByStatus(OrderStatus.READY);
                readyCount = readyOrders != null ? readyOrders.size() : 0;
            } catch (Exception e) {
                System.err.println("Error getting order counts: " + e.getMessage());
            }

            // 獲取廚房隊列統計
            int queueLength = 0, activeQueues = 0;
            try {
                List<KitchenOrder> kitchenQueue = kitchenService.getKitchenQueue();
                if (kitchenQueue != null) {
                    queueLength = kitchenQueue.size();
                    activeQueues = (int) kitchenQueue.stream()
                        .filter(q -> q != null && q.getKitchenStatus() != null && !q.getKitchenStatus().isCompleted())
                        .count();
                }
            } catch (Exception e) {
                System.err.println("Error getting kitchen queue: " + e.getMessage());
            }

            // 獲取通知數量
            int unreadNotifications = 0;
            try {
                unreadNotifications = notificationService.countUnreadNotifications(staffId);
            } catch (Exception e) {
                System.err.println("Error counting notifications: " + e.getMessage());
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                    "todayStats", Map.of(
                        "ordersProcessed", 0,
                        "averageProcessingTime", 0.0,
                        "efficiencyRating", 0.0
                    ),
                    "orders", Map.of(
                        "pending", pendingCount,
                        "confirmed", confirmedCount,
                        "preparing", preparingCount,
                        "ready", readyCount,
                        "total", pendingCount + confirmedCount + preparingCount + readyCount,
                        "recentOrders", List.of()
                    ),
                    "kitchen", Map.of(
                        "queueLength", queueLength,
                        "activeQueues", activeQueues,
                        "recentItems", List.of()
                    ),
                    "team", Map.of(
                        "totalStaff", 0,
                        "activeStaff", 0,
                        "todayOrders", 0,
                        "avgEfficiency", 0.0
                    ),
                    "notifications", Map.of(
                        "unread", unreadNotifications
                    ),
                    "lastUpdated", System.currentTimeMillis()
                )
            ));
            
        } catch (Exception e) {
            System.err.println("Dashboard error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", "Dashboard 載入失敗", "details", e.getMessage()));
        }
    }
    
    // 輔助方法：安全獲取訂單列表
    private List<Order> safeGetOrdersByStatus(OrderStatus status) {
        try {
            List<Order> orders = orderService.getOrdersByStatus(status);
            return orders != null ? orders : List.of();
        } catch (Exception e) {
            System.err.println("Error getting orders by status " + status + ": " + e.getMessage());
            return List.of();
        }
    }
    
    // 輔助方法：安全獲取廚房隊列
    private List<KitchenOrder> safeGetKitchenQueue() {
        try {
            List<KitchenOrder> queue = kitchenService.getKitchenQueue();
            return queue != null ? queue : List.of();
        } catch (Exception e) {
            System.err.println("Error getting kitchen queue: " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Get real-time overview data (optimized for frequent polling)
     * GET /api/staff/overview
     */
    @GetMapping("/overview")
    public ResponseEntity<?> getRealTimeOverview() {
        try {
            // 獲取訂單概覽 (輕量級查詢)
            int pendingCount = orderService.getOrdersByStatus(OrderStatus.PENDING).size();
            int confirmedCount = orderService.getOrdersByStatus(OrderStatus.CONFIRMED).size();
            int preparingCount = orderService.getOrdersByStatus(OrderStatus.PREPARING).size();
            int readyCount = orderService.getOrdersByStatus(OrderStatus.READY).size();
            
            // 獲取廚房隊列概覽
            List<KitchenOrder> activeQueues = kitchenService.getKitchenQueue().stream()
                .filter(q -> !q.getKitchenStatus().isCompleted()).toList();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                    "orders", Map.of(
                        "pending", pendingCount,
                        "confirmed", confirmedCount,
                        "preparing", preparingCount,
                        "ready", readyCount,
                        "total", pendingCount + confirmedCount + preparingCount + readyCount
                    ),
                    "kitchen", Map.of(
                        "activeQueues", activeQueues.size(),
                        "totalItems", activeQueues.size()
                    ),
                    "timestamp", System.currentTimeMillis()
                )
            ));
            
        } catch (Exception e) {
            System.err.println("Error getting real-time overview: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "無法載入即時概覽", "details", e.getMessage()));
        }
    }

    // ================================
    // ORDER MANAGEMENT FOR STAFF
    // ================================

    /**
     * Get pending orders for staff
     * GET /api/staff/orders/pending
     */
    @GetMapping("/orders/pending")
    public ResponseEntity<?> getPendingOrders() {
        try {
            List<Map<String, Object>> pendingOrders = orderService.getOrdersWithCompleteDataByStatus(OrderStatus.PENDING);
            List<Map<String, Object>> confirmedOrders = orderService.getOrdersWithCompleteDataByStatus(OrderStatus.CONFIRMED);
            
            return ResponseEntity.ok(Map.of(
                "pending", pendingOrders,
                "confirmed", confirmedOrders,
                "total", pendingOrders.size() + confirmedOrders.size()
            ));
            
        } catch (Exception e) {
            System.err.println("Error getting pending orders: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "無法載入待處理訂單", "details", e.getMessage()));
        }
    }

    /**
     * Get orders currently being prepared
     * GET /api/staff/orders/in-progress
     */
    @GetMapping("/orders/in-progress")
    public ResponseEntity<?> getInProgressOrders() {
        try {
            List<Map<String, Object>> preparingOrders = orderService.getOrdersWithCompleteDataByStatus(OrderStatus.PREPARING);
            List<Map<String, Object>> readyOrders = orderService.getOrdersWithCompleteDataByStatus(OrderStatus.READY);
            
            return ResponseEntity.ok(Map.of(
                "preparing", preparingOrders,
                "ready", readyOrders,
                "total", preparingOrders.size() + readyOrders.size()
            ));
            
        } catch (Exception e) {
            System.err.println("Error getting in-progress orders: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "無法載入進行中訂單", "details", e.getMessage()));
        }
    }

    /**
     * Get completed orders
     * GET /api/staff/orders/completed
     */
    @GetMapping("/orders/completed")
    public ResponseEntity<?> getCompletedOrders() {
        try {
            List<Map<String, Object>> deliveredOrders = orderService.getOrdersWithCompleteDataByStatus(OrderStatus.DELIVERED);
            List<Map<String, Object>> completedOrders = orderService.getOrdersWithCompleteDataByStatus(OrderStatus.COMPLETED);
            
            return ResponseEntity.ok(Map.of(
                "delivered", deliveredOrders,
                "completed", completedOrders,
                "total", deliveredOrders.size() + completedOrders.size()
            ));
            
        } catch (Exception e) {
            System.err.println("Error getting completed orders: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "無法載入完成訂單", "details", e.getMessage()));
        }
    }

    /**
     * Update order status
     * PUT /api/staff/orders/{orderId}/status
     */
    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String orderId, 
                                             @RequestBody OrderStatusUpdateRequest request) {
        try {
            boolean success = orderService.updateOrderStatus(orderId, request.getStatus());
            
            if (success) {
                // Update staff activity
                if (request.getStaffId() != null) {
                    staffService.updateStaffActivity(request.getStaffId());
                    
                    // Record order processed if completing an order
                    if (request.getStatus() == OrderStatus.COMPLETED || request.getStatus() == OrderStatus.DELIVERED) {
                        staffService.recordOrderProcessed(request.getStaffId());
                    }
                }
                
                // Get updated order
                Optional<Order> updatedOrder = orderService.findOrderById(orderId);
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "訂單狀態已更新",
                    "order", updatedOrder.orElse(null)
                ));
            }
            
            return ResponseEntity.badRequest()
                .body(Map.of("error", "狀態更新失敗", "message", "無效的狀態轉換"));
                
        } catch (Exception e) {
            System.err.println("Error updating order status: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "狀態更新失敗", "details", e.getMessage()));
        }
    }

    /**
     * Get detailed order information including customer info
     * GET /api/staff/orders/{orderId}/details
     */
    @GetMapping("/orders/{orderId}/details")
    public ResponseEntity<?> getOrderDetails(@PathVariable String orderId) {
        try {
            Optional<Order> orderOpt = orderService.findOrderById(orderId);
            
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                
                // Get kitchen order details if available
                Optional<KitchenService.KitchenOrderDetails> kitchenDetails = 
                    kitchenService.getKitchenOrderDetails(orderId);
                
                return ResponseEntity.ok(Map.of(
                    "order", order,
                    "kitchenDetails", kitchenDetails.orElse(null),
                    "hasKitchenInfo", kitchenDetails.isPresent()
                ));
            }
            
            return ResponseEntity.notFound().build();
            
        } catch (Exception e) {
            System.err.println("Error getting order details: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "無法載入訂單詳情", "details", e.getMessage()));
        }
    }

    // ================================
    // KITCHEN MANAGEMENT ENDPOINTS
    // ================================

    /**
     * Get kitchen preparation queue
     * GET /api/staff/kitchen/queue
     */
    @GetMapping("/kitchen/queue")
    public ResponseEntity<?> getKitchenQueue() {
        try {
            List<KitchenOrder> queuedOrders = kitchenService.getKitchenQueue();
            List<KitchenOrder> activeOrders = kitchenService.getActiveKitchenOrders();
            List<KitchenOrder> overdueOrders = kitchenService.getOverdueOrders();
            
            return ResponseEntity.ok(Map.of(
                "queued", queuedOrders,
                "active", activeOrders,
                "overdue", overdueOrders,
                "totalQueued", queuedOrders.size(),
                "totalActive", activeOrders.size(),
                "totalOverdue", overdueOrders.size()
            ));
            
        } catch (Exception e) {
            System.err.println("Error getting kitchen queue: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "無法載入廚房隊列", "details", e.getMessage()));
        }
    }

    /**
     * Start preparing an order
     * POST /api/staff/kitchen/start/{orderId}
     */
    @PostMapping("/kitchen/start/{orderId}")
    public ResponseEntity<?> startOrder(@PathVariable String orderId, 
                                      @RequestBody KitchenStartRequest request) {
        try {
            boolean success = kitchenService.startPreparingOrder(orderId, request.getStaffId());
            
            if (success) {
                // Update staff activity
                staffService.updateStaffActivity(request.getStaffId());
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "開始準備訂單",
                    "orderId", orderId,
                    "staffId", request.getStaffId()
                ));
            }
            
            return ResponseEntity.badRequest()
                .body(Map.of("error", "無法開始準備", "message", "訂單可能已在處理中"));
                
        } catch (Exception e) {
            System.err.println("Error starting order preparation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "開始準備失敗", "details", e.getMessage()));
        }
    }

    /**
     * Update cooking timer for an order
     * PUT /api/staff/kitchen/timer/{orderId}
     */
    @PutMapping("/kitchen/timer/{orderId}")
    public ResponseEntity<?> updateTimer(@PathVariable String orderId, 
                                       @RequestBody KitchenTimerRequest request) {
        try {
            boolean success = kitchenService.updateCookingTimer(orderId, 
                request.getEstimatedMinutesRemaining(), request.getNotes());
            
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "計時器已更新",
                    "orderId", orderId,
                    "estimatedMinutesRemaining", request.getEstimatedMinutesRemaining()
                ));
            }
            
            return ResponseEntity.badRequest()
                .body(Map.of("error", "計時器更新失敗", "message", "找不到廚房訂單"));
                
        } catch (Exception e) {
            System.err.println("Error updating cooking timer: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "計時器更新失敗", "details", e.getMessage()));
        }
    }

    /**
     * Mark order as ready/complete
     * POST /api/staff/kitchen/complete/{orderId}
     */
    @PostMapping("/kitchen/complete/{orderId}")
    public ResponseEntity<?> completeOrder(@PathVariable String orderId, 
                                         @RequestBody KitchenCompleteRequest request) {
        try {
            boolean success = kitchenService.completeOrder(orderId, request.getStaffId());
            
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "訂單製作完成",
                    "orderId", orderId,
                    "completedBy", request.getStaffId()
                ));
            }
            
            return ResponseEntity.badRequest()
                .body(Map.of("error", "無法完成訂單", "message", "找不到廚房訂單"));
                
        } catch (Exception e) {
            System.err.println("Error completing order: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "完成訂單失敗", "details", e.getMessage()));
        }
    }

    // ================================
    // STAFF STATISTICS ENDPOINTS
    // ================================

    /**
     * Get daily performance statistics
     * GET /api/staff/{staffId}/stats/daily
     */
    @GetMapping("/{staffId}/stats/daily")
    public ResponseEntity<?> getDailyStats(@PathVariable String staffId, 
                                         @RequestParam(required = false) String date) {
        try {
            LocalDate targetDate = LocalDate.now();
            if (date != null) {
                try {
                    targetDate = LocalDate.parse(date);
                } catch (DateTimeParseException e) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("error", "日期格式錯誤", "message", "請使用 YYYY-MM-DD 格式"));
                }
            }
            
            Optional<StaffStatistics> stats = statisticsService.getDailyStatistics(staffId, targetDate);
            return ResponseEntity.ok(Map.of(
                "date", targetDate.toString(),
                "statistics", stats.orElse(null),
                "hasData", stats.isPresent()
            ));
            
        } catch (Exception e) {
            System.err.println("Error getting daily stats: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "無法載入每日統計", "details", e.getMessage()));
        }
    }

    /**
     * Get weekly performance statistics
     * GET /api/staff/{staffId}/stats/weekly
     */
    @GetMapping("/{staffId}/stats/weekly")
    public ResponseEntity<?> getWeeklyStats(@PathVariable String staffId, 
                                          @RequestParam(required = false) String weekStart) {
        try {
            LocalDate weekStartDate = null;
            if (weekStart != null) {
                try {
                    weekStartDate = LocalDate.parse(weekStart);
                } catch (DateTimeParseException e) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("error", "日期格式錯誤", "message", "請使用 YYYY-MM-DD 格式"));
                }
            }
            
            Optional<StaffStatistics> stats = statisticsService.getWeeklyStatistics(staffId, weekStartDate);
            return ResponseEntity.ok(Map.of(
                "statistics", stats.orElse(null),
                "hasData", stats.isPresent()
            ));
            
        } catch (Exception e) {
            System.err.println("Error getting weekly stats: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "無法載入每週統計", "details", e.getMessage()));
        }
    }

    /**
     * Get monthly performance statistics
     * GET /api/staff/{staffId}/stats/monthly
     */
    @GetMapping("/{staffId}/stats/monthly")
    public ResponseEntity<?> getMonthlyStats(@PathVariable String staffId, 
                                           @RequestParam(required = false) String monthStart) {
        try {
            LocalDate monthStartDate = null;
            if (monthStart != null) {
                try {
                    monthStartDate = LocalDate.parse(monthStart);
                } catch (DateTimeParseException e) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("error", "日期格式錯誤", "message", "請使用 YYYY-MM-DD 格式"));
                }
            }
            
            Optional<StaffStatistics> stats = statisticsService.getMonthlyStatistics(staffId, monthStartDate);
            return ResponseEntity.ok(Map.of(
                "statistics", stats.orElse(null),
                "hasData", stats.isPresent()
            ));
            
        } catch (Exception e) {
            System.err.println("Error getting monthly stats: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "無法載入每月統計", "details", e.getMessage()));
        }
    }

    /**
     * Get team performance metrics
     * GET /api/staff/team/stats
     */
    @GetMapping("/team/stats")
    public ResponseEntity<?> getTeamStats() {
        try {
            StaffStatisticsService.TeamStatistics teamStats = statisticsService.getTeamStatistics();
            return ResponseEntity.ok(teamStats);
            
        } catch (Exception e) {
            System.err.println("Error getting team stats: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "無法載入團隊統計", "details", e.getMessage()));
        }
    }

    /**
     * Get staff leaderboard rankings
     * GET /api/staff/leaderboard
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<?> getLeaderboard(@RequestParam(defaultValue = "DAILY") String period,
                                          @RequestParam(defaultValue = "10") int limit) {
        try {
            StatisticsPeriod statisticsPeriod;
            try {
                statisticsPeriod = StatisticsPeriod.valueOf(period.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "無效的統計週期", "message", "請使用 DAILY, WEEKLY 或 MONTHLY"));
            }
            
            List<StaffStatisticsService.StaffLeaderboard> leaderboard = 
                statisticsService.getStaffLeaderboard(statisticsPeriod, limit);
            
            return ResponseEntity.ok(Map.of(
                "period", period,
                "leaderboard", leaderboard,
                "totalEntries", leaderboard.size()
            ));
            
        } catch (Exception e) {
            System.err.println("Error getting staff leaderboard: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "無法載入排行榜", "details", e.getMessage()));
        }
    }

    // ================================
    // NOTIFICATION MANAGEMENT ENDPOINTS
    // ================================

    /**
     * Get staff notifications
     * GET /api/notifications/staff/{staffId}
     */
    @GetMapping("/notifications/{staffId}")
    public ResponseEntity<?> getStaffNotifications(@PathVariable String staffId,
                                                  @RequestParam(defaultValue = "false") boolean unreadOnly) {
        try {
            List<Notification> notifications = unreadOnly ? 
                notificationService.getUnreadNotifications(staffId) :
                notificationService.getStaffNotifications(staffId);
            
            int unreadCount = notificationService.countUnreadNotifications(staffId);
            
            return ResponseEntity.ok(Map.of(
                "notifications", notifications,
                "unreadCount", unreadCount,
                "totalCount", notifications.size()
            ));
            
        } catch (Exception e) {
            System.err.println("Error getting staff notifications: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "無法載入通知", "details", e.getMessage()));
        }
    }

    /**
     * Mark notifications as read
     * POST /api/notifications/staff/{staffId}/mark-read
     */
    @PostMapping("/notifications/{staffId}/mark-read")
    public ResponseEntity<?> markNotificationsAsRead(@PathVariable String staffId,
                                                    @RequestBody(required = false) MarkReadRequest request) {
        try {
            if (request != null && request.getNotificationId() != null) {
                // Mark single notification as read
                boolean success = notificationService.markAsRead(request.getNotificationId());
                return ResponseEntity.ok(Map.of(
                    "success", success,
                    "message", success ? "通知已標記為已讀" : "標記失敗"
                ));
            } else {
                // Mark all notifications as read
                int markedCount = notificationService.markAllAsRead(staffId);
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "所有通知已標記為已讀",
                    "markedCount", markedCount
                ));
            }
            
        } catch (Exception e) {
            System.err.println("Error marking notifications as read: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "標記通知失敗", "details", e.getMessage()));
        }
    }

    // ================================
    // REQUEST/RESPONSE DTOs
    // ================================

    public static class StaffLoginRequest {
        private String identifier; // Employee ID or email
        private String password;

        public String getIdentifier() { return identifier; }
        public void setIdentifier(String identifier) { this.identifier = identifier; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class StaffSwitchRequest {
        private String fromStaffId;
        private String toStaffId;

        public String getFromStaffId() { return fromStaffId; }
        public void setFromStaffId(String fromStaffId) { this.fromStaffId = fromStaffId; }
        public String getToStaffId() { return toStaffId; }
        public void setToStaffId(String toStaffId) { this.toStaffId = toStaffId; }
    }

    public static class OrderStatusUpdateRequest {
        private OrderStatus status;
        private String staffId;
        private String notes;

        public OrderStatus getStatus() { return status; }
        public void setStatus(OrderStatus status) { this.status = status; }
        public String getStaffId() { return staffId; }
        public void setStaffId(String staffId) { this.staffId = staffId; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class KitchenStartRequest {
        private String staffId;

        public String getStaffId() { return staffId; }
        public void setStaffId(String staffId) { this.staffId = staffId; }
    }

    public static class KitchenTimerRequest {
        private int estimatedMinutesRemaining;
        private String notes;

        public int getEstimatedMinutesRemaining() { return estimatedMinutesRemaining; }
        public void setEstimatedMinutesRemaining(int estimatedMinutesRemaining) { this.estimatedMinutesRemaining = estimatedMinutesRemaining; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class KitchenCompleteRequest {
        private String staffId;

        public String getStaffId() { return staffId; }
        public void setStaffId(String staffId) { this.staffId = staffId; }
    }

    public static class MarkReadRequest {
        private String notificationId;

        public String getNotificationId() { return notificationId; }
        public void setNotificationId(String notificationId) { this.notificationId = notificationId; }
    }
}